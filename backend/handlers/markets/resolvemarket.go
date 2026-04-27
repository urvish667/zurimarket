package marketshandlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"socialpredict/handlers/math/payout"
	"socialpredict/logging"
	"socialpredict/middleware"
	"socialpredict/models"
	"socialpredict/util"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

// isValidResolutionOutcome checks if the outcome is valid for the given market.
func isValidResolutionOutcome(db *gorm.DB, market *models.Market, outcome string) bool {
	if outcome == "N/A" {
		return true // N/A is always valid (void market)
	}

	if market.OutcomeType == models.OutcomeTypeMultipleChoice {
		var count int64
		db.Model(&models.MarketOption{}).Where("market_id = ? AND label = ?", market.ID, outcome).Count(&count)
		return count > 0
	}

	// Binary: YES or NO
	return outcome == "YES" || outcome == "NO"
}

func ResolveMarketHandler(w http.ResponseWriter, r *http.Request) {

	logging.LogMsg("Attempting to use ResolveMarketHandler.")

	db := util.GetDB()

	vars := mux.Vars(r)
	marketIdStr := vars["marketId"]

	marketId, err := strconv.ParseUint(marketIdStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid market ID", http.StatusBadRequest)
		return
	}

	user, httperr := middleware.ValidateTokenAndGetUser(r, db)
	if httperr != nil {
		http.Error(w, "Invalid token: "+httperr.Error(), http.StatusUnauthorized)
		return
	}

	var resolutionData struct {
		Outcome string `json:"outcome"`
	}
	if err := json.NewDecoder(r.Body).Decode(&resolutionData); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var market models.Market
	result := db.First(&market, marketId)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "Market not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Error accessing database", http.StatusInternalServerError)
		return
	}

	// Validate the resolution outcome when provided.
	if resolutionData.Outcome != "" && !isValidResolutionOutcome(db, &market, resolutionData.Outcome) {
		http.Error(w, "Invalid resolution outcome", http.StatusBadRequest)
		return
	}

	if market.Status == "" {
		if market.IsResolved {
			market.Status = models.MarketStatusFinalized
		} else {
			market.Status = models.MarketStatusActive
		}
	}

	if middleware.IsAdmin(user) {
		if !middleware.CanResolveMarket(user) {
			http.Error(w, "Admin access required", http.StatusForbidden)
			return
		}

		// Admins can finalize if the market is active or pending resolution
		if market.Status != models.MarketStatusActive && market.Status != models.MarketStatusPendingResolution {
			http.Error(w, "Market must be active or pending resolution before admin finalization", http.StatusBadRequest)
			return
		}

		// Use the provided outcome if available, otherwise use the suggested one
		finalOutcome := resolutionData.Outcome
		if finalOutcome == "" {
			finalOutcome = market.ResolutionResult
		}

		if finalOutcome == "" {
			http.Error(w, "Resolution outcome is required", http.StatusBadRequest)
			return
		}

		// Use a transaction for finalization and payout distribution
		txErr := db.Transaction(func(tx *gorm.DB) error {
			// Validate the resolution outcome within the transaction
			if finalOutcome != "" && !isValidResolutionOutcome(tx, &market, finalOutcome) {
				return errors.New("invalid resolution outcome")
			}

			market.ResolutionResult = finalOutcome
			adminID := user.ID
			market.Status = models.MarketStatusFinalized
			market.IsResolved = true
			market.ResolvedBy = &adminID
			market.FinalResolutionDateTime = time.Now()

			if err := tx.Save(&market).Error; err != nil {
				return fmt.Errorf("error saving market resolution: %w", err)
			}

			if err := payout.DistributePayoutsWithRefund(&market, tx); err != nil {
				return fmt.Errorf("error distributing payouts: %w", err)
			}
			return nil
		})

		if txErr != nil {
			http.Error(w, txErr.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Market finalized successfully"})
		return
	}

	if !middleware.CanSuggestMarketResolution(user, &market) {
		http.Error(w, "Only the market creator can suggest a resolution", http.StatusForbidden)
		return
	}

	if market.Status != models.MarketStatusActive {
		http.Error(w, "Market is not active", http.StatusBadRequest)
		return
	}

	if resolutionData.Outcome == "" {
		http.Error(w, "Resolution outcome is required", http.StatusBadRequest)
		return
	}

	market.Status = models.MarketStatusPendingResolution
	market.IsResolved = false
	market.ResolutionResult = resolutionData.Outcome
	market.ResolvedBy = nil
	market.FinalResolutionDateTime = time.Time{}

	if err := db.Save(&market).Error; err != nil {
		http.Error(w, "Error saving market resolution suggestion: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Resolution submitted for admin review"})
}
