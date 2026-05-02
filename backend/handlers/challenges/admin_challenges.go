package challenges

import (
	"encoding/json"
	"net/http"
	"socialpredict/models"
	"socialpredict/util"
	"strconv"

	"github.com/gorilla/mux"
)

// AdminListChallengesHandler returns all challenges with filters for admin.
// GET /v0/admin/challenges?status=ACTIVE&username=john&page=1&limit=20
func AdminListChallengesHandler(w http.ResponseWriter, r *http.Request) {
	db := util.GetDB()

	query := db.Preload("Tier").Order("created_at DESC")

	// Filter by status
	if status := r.URL.Query().Get("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	// Filter by username
	if username := r.URL.Query().Get("username"); username != "" {
		query = query.Where("username = ?", username)
	}

	// Filter by tier
	if tierSlug := r.URL.Query().Get("tier"); tierSlug != "" {
		var tier models.ChallengeTier
		if err := db.Where("slug = ?", tierSlug).First(&tier).Error; err == nil {
			query = query.Where("tier_id = ?", tier.ID)
		}
	}

	// Pagination
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit

	var total int64
	query.Model(&models.UserChallenge{}).Count(&total)

	var challenges []models.UserChallenge
	if err := query.Offset(offset).Limit(limit).Find(&challenges).Error; err != nil {
		http.Error(w, `{"error":"failed to fetch challenges"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"challenges": challenges,
		"total":      total,
		"page":       page,
		"limit":      limit,
	})
}

// AdminChallengeStatsHandler returns aggregated challenge statistics.
// GET /v0/admin/challenges/stats
func AdminChallengeStatsHandler(w http.ResponseWriter, r *http.Request) {
	db := util.GetDB()

	var totalActive, totalPassed, totalFailed, totalExpired int64
	db.Model(&models.UserChallenge{}).Where("status = ?", models.ChallengeStatusActive).Count(&totalActive)
	db.Model(&models.UserChallenge{}).Where("status = ?", models.ChallengeStatusPassed).Count(&totalPassed)
	db.Model(&models.UserChallenge{}).Where("status = ?", models.ChallengeStatusFailed).Count(&totalFailed)
	db.Model(&models.UserChallenge{}).Where("status = ?", models.ChallengeStatusExpired).Count(&totalExpired)

	total := totalActive + totalPassed + totalFailed + totalExpired
	var passRate float64
	completed := totalPassed + totalFailed + totalExpired
	if completed > 0 {
		passRate = float64(totalPassed) / float64(completed) * 100
	}

	// Revenue from entry fees
	var totalRevenue int64
	db.Model(&models.UserChallenge{}).
		Joins("JOIN challenge_tiers ON challenge_tiers.id = user_challenges.tier_id").
		Select("COALESCE(SUM(challenge_tiers.entry_fee), 0)").
		Scan(&totalRevenue)

	// Total rewards paid
	var totalRewardsPaid int64
	db.Model(&models.UserChallenge{}).
		Joins("JOIN challenge_tiers ON challenge_tiers.id = user_challenges.tier_id").
		Where("user_challenges.status = ?", models.ChallengeStatusPassed).
		Select("COALESCE(SUM(challenge_tiers.reward_amount), 0)").
		Scan(&totalRewardsPaid)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"totalChallenges": total,
		"active":          totalActive,
		"passed":          totalPassed,
		"failed":          totalFailed,
		"expired":         totalExpired,
		"passRate":        passRate,
		"totalRevenue":    totalRevenue,
		"totalRewardsPaid": totalRewardsPaid,
	})
}

// AdminUpdateTierHandler updates a challenge tier configuration.
// PUT /v0/admin/challenges/tiers/{id}
func AdminUpdateTierHandler(w http.ResponseWriter, r *http.Request) {
	db := util.GetDB()
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		http.Error(w, `{"error":"invalid tier ID"}`, http.StatusBadRequest)
		return
	}

	var tier models.ChallengeTier
	if err := db.First(&tier, id).Error; err != nil {
		http.Error(w, `{"error":"tier not found"}`, http.StatusNotFound)
		return
	}

	var updates map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	// Only allow specific fields to be updated
	allowed := map[string]bool{
		"name": true, "entryFee": true, "startingBalance": true,
		"profitTarget": true, "durationDays": true, "maxLosingDays": true,
		"maxDailyLossPct": true, "rewardAmount": true, "grantsFunded": true,
		"grantsEventCreate": true, "isActive": true, "sortOrder": true,
		"description": true,
	}

	filtered := map[string]interface{}{}
	for k, v := range updates {
		if allowed[k] {
			filtered[k] = v
		}
	}

	if err := db.Model(&tier).Updates(filtered).Error; err != nil {
		http.Error(w, `{"error":"failed to update tier"}`, http.StatusInternalServerError)
		return
	}

	db.First(&tier, id)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tier)
}
