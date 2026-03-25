package buybetshandlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	betutils "socialpredict/handlers/bets/betutils"
	"socialpredict/middleware"
	"socialpredict/models"
	"socialpredict/setup"
	"socialpredict/util"

	"gorm.io/gorm"
)

func PlaceBetHandler(loadEconConfig setup.EconConfigLoader) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		db := util.GetDB()
		user, httperr := middleware.ValidateUserAndEnforcePasswordChangeGetUser(r, db)
		if httperr != nil {
			http.Error(w, httperr.Error(), httperr.StatusCode)
			return
		}

		var betRequest models.Bet
		err := json.NewDecoder(r.Body).Decode(&betRequest)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		bet, err := PlaceBetCore(user, betRequest, db, loadEconConfig)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Return a success response
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(bet)
	}
}

// PlaceBetCore handles the core logic of placing a bet.
// It assumes user authentication and JSON decoding is already done.
// All DB writes are performed inside a single transaction with an atomic
// balance deduction to prevent race conditions and double-spending.
func PlaceBetCore(user *models.User, betRequest models.Bet, db *gorm.DB, loadEconConfig setup.EconConfigLoader) (*models.Bet, error) {
	// Read-only checks — safe to do outside the transaction
	if err := betutils.CheckMarketStatus(db, betRequest.MarketID); err != nil {
		return nil, err
	}

	sumOfBetFees := betutils.GetBetFees(db, user, betRequest)

	// Pre-flight balance check using the in-memory user (fast rejection before hitting the DB)
	if err := checkUserBalance(user, betRequest, sumOfBetFees, loadEconConfig); err != nil {
		return nil, err
	}

	// Create bet object and validate it (read-only DB checks)
	bet := models.CreateBet(user.Username, betRequest.MarketID, betRequest.Amount, betRequest.Outcome)
	if err := betutils.ValidateBuy(db, &bet); err != nil {
		return nil, err
	}

	appConfig := loadEconConfig()
	totalCost := bet.Amount + sumOfBetFees
	minimumBalance := -appConfig.Economics.User.MaximumDebtAllowed

	var resultBet *models.Bet
	err := db.Transaction(func(tx *gorm.DB) error {
		// Atomic conditional deduction:
		// Only succeeds if account_balance - totalCost >= minimumBalance.
		// If a concurrent request already deducted funds, RowsAffected == 0 and we abort.
		res := tx.Model(&models.User{}).
			Where("username = ? AND account_balance - ? >= ?", user.Username, totalCost, minimumBalance).
			UpdateColumn("account_balance", gorm.Expr("account_balance - ?", totalCost))
		if res.Error != nil {
			return res.Error
		}
		if res.RowsAffected == 0 {
			return fmt.Errorf("insufficient balance")
		}

		if err := tx.Create(&bet).Error; err != nil {
			return fmt.Errorf("failed to create bet: %w", err)
		}

		// Referral & Growth Logic: award R100 on FIRST bet
		if !user.HasPlacedBet {
			if err := tx.Model(user).Update("has_placed_bet", true).Error; err != nil {
				return fmt.Errorf("failed to update first bet status: %w", err)
			}
			
			// Award referral bonus if referred by someone
			if user.ReferredBy != "" {
				// Bonus amount: R100 = 10,000 cents
				bonusAmount := int64(10000)
				res := tx.Model(&models.User{}).
					Where("referral_code = ?", user.ReferredBy).
					UpdateColumn("account_balance", gorm.Expr("account_balance + ?", bonusAmount))
				
				if res.Error != nil {
					log.Printf("Referral bonus failed for code %s: %v", user.ReferredBy, res.Error)
					// We don't necessarily want to fail the WHOLE bet if the referral bonus fails,
					// but for prop firms, strictness is often preferred.
					// For now, we log it.
				}
			}
		}

		resultBet = &bet
		return nil
	})

	return resultBet, err
}

func checkUserBalance(user *models.User, betRequest models.Bet, sumOfBetFees int64, loadEconConfig setup.EconConfigLoader) error {
	appConfig := loadEconConfig()
	maximumDebtAllowed := appConfig.Economics.User.MaximumDebtAllowed

	// Check if the user's balance after the bet would be lower than the allowed maximum debt
	if user.AccountBalance-betRequest.Amount-sumOfBetFees < -maximumDebtAllowed {
		return fmt.Errorf("Insufficient balance")
	}
	return nil
}

