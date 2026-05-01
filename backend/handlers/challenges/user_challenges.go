package challenges

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"socialpredict/middleware"
	"socialpredict/models"
	"socialpredict/util"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

// StartChallengeRequest is the JSON body for starting a challenge.
type StartChallengeRequest struct {
	TierSlug string `json:"tierSlug" validate:"required"`
}

// StartChallengeHandler starts a new challenge for the authenticated user.
// POST /v0/challenges/start
func StartChallengeHandler(w http.ResponseWriter, r *http.Request) {
	db := util.GetDB()

	// Get authenticated user from JWT context
	username, err := middleware.GetUsernameFromJWT(r)
	if err != nil {
		http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var req StartChallengeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.TierSlug == "" {
		http.Error(w, `{"error":"tierSlug is required"}`, http.StatusBadRequest)
		return
	}

	// Find the tier
	var tier models.ChallengeTier
	if err := db.Where("slug = ? AND is_active = ?", req.TierSlug, true).First(&tier).Error; err != nil {
		http.Error(w, `{"error":"challenge tier not found or inactive"}`, http.StatusNotFound)
		return
	}

	// Check if user already has an ACTIVE challenge
	var activeCount int64
	db.Model(&models.UserChallenge{}).
		Where("username = ? AND status = ?", username, models.ChallengeStatusActive).
		Count(&activeCount)
	if activeCount > 0 {
		http.Error(w, `{"error":"you already have an active challenge. Complete or fail it before starting a new one."}`, http.StatusConflict)
		return
	}

	// Find the user to check/deduct balance and badge
	var user models.User
	if err := db.Where("username = ?", username).First(&user).Error; err != nil {
		http.Error(w, `{"error":"user not found"}`, http.StatusNotFound)
		return
	}

	// Enforce progression sequence
	requiredBadge, hasRequirement := models.TierRequiredBadge[tier.Slug]
	if hasRequirement {
		userBadgeLevel := models.BadgeHierarchy[user.ChallengeBadge]
		requiredLevel := models.BadgeHierarchy[requiredBadge]
		
		if userBadgeLevel < requiredLevel {
			errMsg := fmt.Sprintf(`{"error":"You must earn the %s badge before starting this challenge."}`, requiredBadge)
			http.Error(w, errMsg, http.StatusForbidden)
			return
		}
	}

	// Deduct entry fee from virtual balance and ensure they have enough for the starting balance
	requiredTotal := tier.StartingBalance + tier.EntryFee
	if user.VirtualBalance < requiredTotal {
		errMsg := fmt.Sprintf(`{"error":"insufficient virtual balance. You need at least R%d to cover the entry fee and starting balance."}`, requiredTotal/100)
		http.Error(w, errMsg, http.StatusPaymentRequired)
		return
	}

	if tier.EntryFee > 0 {
		user.VirtualBalance -= tier.EntryFee
		if err := db.Model(&user).Update("virtual_balance", user.VirtualBalance).Error; err != nil {
			http.Error(w, `{"error":"failed to deduct entry fee"}`, http.StatusInternalServerError)
			return
		}
		log.Printf("challenges: deducted entry fee %d from user %s virtual balance for %s", tier.EntryFee, username, tier.Name)
	}

	// Count previous attempts for this tier
	var prevAttempts int64
	db.Model(&models.UserChallenge{}).
		Where("username = ? AND tier_id = ?", username, tier.ID).
		Count(&prevAttempts)

	now := time.Now().UTC()
	endDate := now.AddDate(0, 0, tier.DurationDays)

	challenge := models.UserChallenge{
		UserID:          user.ID,
		Username:        username,
		TierID:          tier.ID,
		Status:          models.ChallengeStatusActive,
		StartBalance:    tier.StartingBalance,
		CurrentBalance:  tier.StartingBalance,
		ProfitTarget:    tier.ProfitTarget,
		StartDate:       now,
		EndDate:         endDate,
		LosingDaysUsed:  0,
		MaxLosingDays:   tier.MaxLosingDays,
		MaxDailyLossPct: tier.MaxDailyLossPct,
		AttemptNumber:   int(prevAttempts) + 1,
	}

	if err := db.Create(&challenge).Error; err != nil {
		http.Error(w, `{"error":"failed to create challenge"}`, http.StatusInternalServerError)
		return
	}

	// Load tier for response
	db.Preload("Tier").First(&challenge, challenge.ID)

	log.Printf("challenges: user %s started %s (attempt #%d)", username, tier.Name, challenge.AttemptNumber)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(challenge)
}

// GetActiveChallengeHandler returns the user's active challenge (max 1).
// GET /v0/challenges/active
func GetActiveChallengeHandler(w http.ResponseWriter, r *http.Request) {
	db := util.GetDB()

	username, err := middleware.GetUsernameFromJWT(r)
	if err != nil {
		http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var challenge models.UserChallenge
	result := db.Preload("Tier").Preload("DailyLogs", func(db2 *gorm.DB) *gorm.DB {
		return db2.Order("date DESC")
	}).Where("username = ? AND status = ?", username, models.ChallengeStatusActive).
		First(&challenge)

	if result.Error != nil {
		// No active challenge — return null
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(nil)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(challenge)
}

// GetChallengeHistoryHandler returns all past challenges for the user.
// GET /v0/challenges/history
func GetChallengeHistoryHandler(w http.ResponseWriter, r *http.Request) {
	db := util.GetDB()

	username, err := middleware.GetUsernameFromJWT(r)
	if err != nil {
		http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var challenges []models.UserChallenge
	if err := db.Preload("Tier").
		Where("username = ? AND status != ?", username, models.ChallengeStatusActive).
		Order("created_at DESC").
		Find(&challenges).Error; err != nil {
		http.Error(w, `{"error":"failed to fetch challenge history"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(challenges)
}

// GetChallengeDetailHandler returns a single challenge with daily logs.
// GET /v0/challenges/{id}
func GetChallengeDetailHandler(w http.ResponseWriter, r *http.Request) {
	db := util.GetDB()

	username, err := middleware.GetUsernameFromJWT(r)
	if err != nil {
		http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		http.Error(w, `{"error":"invalid challenge ID"}`, http.StatusBadRequest)
		return
	}

	var challenge models.UserChallenge
	if err := db.Preload("Tier").Preload("DailyLogs", func(db2 *gorm.DB) *gorm.DB {
		return db2.Order("date ASC")
	}).Where("id = ? AND username = ?", id, username).First(&challenge).Error; err != nil {
		http.Error(w, `{"error":"challenge not found"}`, http.StatusNotFound)
		return
	}

	// Build response with computed fields
	type ChallengeDetailResponse struct {
		models.UserChallenge
		ProgressPct   float64 `json:"progressPct"`
		RemainingDays int     `json:"remainingDays"`
	}

	resp := ChallengeDetailResponse{
		UserChallenge: challenge,
		ProgressPct:   challenge.ProgressPct(),
		RemainingDays: challenge.RemainingDays(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// RetryChallengeHandler allows retrying a failed/expired challenge.
// POST /v0/challenges/{id}/retry
func RetryChallengeHandler(w http.ResponseWriter, r *http.Request) {
	db := util.GetDB()

	username, err := middleware.GetUsernameFromJWT(r)
	if err != nil {
		http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		http.Error(w, `{"error":"invalid challenge ID"}`, http.StatusBadRequest)
		return
	}

	// Find the original challenge
	var original models.UserChallenge
	if err := db.Preload("Tier").Where("id = ? AND username = ?", id, username).First(&original).Error; err != nil {
		http.Error(w, `{"error":"challenge not found"}`, http.StatusNotFound)
		return
	}

	if original.Status != models.ChallengeStatusFailed && original.Status != models.ChallengeStatusExpired {
		http.Error(w, `{"error":"can only retry failed or expired challenges"}`, http.StatusBadRequest)
		return
	}

	// Check no active challenge
	var activeCount int64
	db.Model(&models.UserChallenge{}).
		Where("username = ? AND status = ?", username, models.ChallengeStatusActive).
		Count(&activeCount)
	if activeCount > 0 {
		http.Error(w, `{"error":"you already have an active challenge"}`, http.StatusConflict)
		return
	}

	// Deduct entry fee again for paid tiers and check starting balance
	tier := original.Tier
	var user models.User
	if err := db.Where("username = ?", username).First(&user).Error; err != nil {
		http.Error(w, `{"error":"user not found"}`, http.StatusNotFound)
		return
	}

	requiredTotal := tier.StartingBalance + tier.EntryFee
	if user.VirtualBalance < requiredTotal {
		errMsg := fmt.Sprintf(`{"error":"insufficient virtual balance for retry. You need at least R%d."}`, requiredTotal/100)
		http.Error(w, errMsg, http.StatusPaymentRequired)
		return
	}

	if tier.EntryFee > 0 {
		user.VirtualBalance -= tier.EntryFee
		if err := db.Model(&user).Update("virtual_balance", user.VirtualBalance).Error; err != nil {
			http.Error(w, `{"error":"failed to deduct entry fee"}`, http.StatusInternalServerError)
			return
		}
	}

	// Count previous attempts
	var prevAttempts int64
	db.Model(&models.UserChallenge{}).
		Where("username = ? AND tier_id = ?", username, tier.ID).
		Count(&prevAttempts)

	now := time.Now().UTC()
	newChallenge := models.UserChallenge{
		UserID:          original.UserID,
		Username:        username,
		TierID:          tier.ID,
		Status:          models.ChallengeStatusActive,
		StartBalance:    tier.StartingBalance,
		CurrentBalance:  tier.StartingBalance,
		ProfitTarget:    tier.ProfitTarget,
		StartDate:       now,
		EndDate:         now.AddDate(0, 0, tier.DurationDays),
		LosingDaysUsed:  0,
		MaxLosingDays:   tier.MaxLosingDays,
		MaxDailyLossPct: tier.MaxDailyLossPct,
		AttemptNumber:   int(prevAttempts) + 1,
	}

	if err := db.Create(&newChallenge).Error; err != nil {
		http.Error(w, `{"error":"failed to create retry challenge"}`, http.StatusInternalServerError)
		return
	}

	db.Preload("Tier").First(&newChallenge, newChallenge.ID)

	log.Printf("challenges: user %s retried %s (attempt #%d)", username, tier.Name, newChallenge.AttemptNumber)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newChallenge)
}

// RecordDayHandler records/updates the daily snapshot for a challenge.
// POST /v0/challenges/{id}/record-day
func RecordDayHandler(w http.ResponseWriter, r *http.Request) {
	db := util.GetDB()

	username, err := middleware.GetUsernameFromJWT(r)
	if err != nil {
		http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		http.Error(w, `{"error":"invalid challenge ID"}`, http.StatusBadRequest)
		return
	}

	var challenge models.UserChallenge
	if err := db.Where("id = ? AND username = ? AND status = ?", id, username, models.ChallengeStatusActive).
		First(&challenge).Error; err != nil {
		http.Error(w, `{"error":"active challenge not found"}`, http.StatusNotFound)
		return
	}

	if err := EndOfDayEvaluation(db, &challenge); err != nil {
		http.Error(w, `{"error":"evaluation failed"}`, http.StatusInternalServerError)
		return
	}

	// Reload with updated state
	db.Preload("Tier").First(&challenge, challenge.ID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(challenge)
}

// EvaluateDailyHandler batch-evaluates all active challenges (admin only).
// POST /v0/challenges/evaluate-daily
func EvaluateDailyHandler(w http.ResponseWriter, r *http.Request) {
	db := util.GetDB()

	processed, failed, err := BatchDailyEvaluation(db)
	if err != nil {
		http.Error(w, `{"error":"batch evaluation failed"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"processed": processed,
		"failed":    failed,
		"message":   fmt.Sprintf("Evaluated %d challenges, %d failures", processed, failed),
	})
}

// AfterBetHook is called after a bet is placed to update the user's active challenge.
// betPnL is positive for wins, negative for losses.
func AfterBetHook(db *gorm.DB, username string, betPnL int64) {
	var challenge models.UserChallenge
	result := db.Where("username = ? AND status = ?", username, models.ChallengeStatusActive).
		First(&challenge)

	if result.Error != nil {
		return // No active challenge — nothing to do
	}

	// Update current balance
	challenge.CurrentBalance += betPnL
	if challenge.CurrentBalance < 0 {
		challenge.CurrentBalance = 0
	}
	db.Model(&challenge).Update("current_balance", challenge.CurrentBalance)

	// Record daily snapshot
	if err := RecordDailySnapshot(db, &challenge); err != nil {
		log.Printf("challenges: error recording daily snapshot for user %s: %v", username, err)
	}

	// Recount losing days
	if err := RecountLosingDays(db, &challenge); err != nil {
		log.Printf("challenges: error recounting losing days for user %s: %v", username, err)
	}

	// Evaluate rules
	ruleResult := EvaluateRules(&challenge)
	if ruleResult.Passed || ruleResult.Failed {
		if err := ApplyRuleResult(db, &challenge, ruleResult); err != nil {
			log.Printf("challenges: error applying rule result for user %s: %v", username, err)
		}
	}
}
