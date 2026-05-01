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

	challenges "socialpredict/handlers/challenges"

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
	var resultBet *models.Bet
	err := db.Transaction(func(tx *gorm.DB) error {
		// All DB operations inside the transaction use 'tx'
		if err := betutils.CheckMarketStatus(tx, betRequest.MarketID); err != nil {
			return err
		}

		sumOfBetFees := betutils.GetBetFees(tx, user, betRequest)

		// Pre-flight balance check (fast rejection before hitting the DB update)
		if err := checkUserBalance(user, betRequest, sumOfBetFees, loadEconConfig); err != nil {
			return err
		}

		// Create bet object and validate it
		bet := models.CreateBet(user.Username, betRequest.MarketID, betRequest.Amount, betRequest.Outcome)
		if err := betutils.ValidateBuy(tx, &bet); err != nil {
			return err
		}

		appConfig := loadEconConfig()
		totalCost := bet.Amount + sumOfBetFees
		minimumBalance := -appConfig.Economics.User.MaximumDebtAllowed

		// Atomic conditional deduction:
		// Only succeeds if virtual_balance - totalCost >= minimumBalance.
		res := tx.Model(&models.User{}).
			Where("username = ? AND virtual_balance - ? >= ?", user.Username, totalCost, minimumBalance).
			UpdateColumn("virtual_balance", gorm.Expr("virtual_balance - ?", totalCost))
		if res.Error != nil {
			return res.Error
		}
		if res.RowsAffected == 0 {
			return fmt.Errorf("insufficient balance")
		}

		if err := tx.Create(&bet).Error; err != nil {
			return fmt.Errorf("failed to create bet: %w", err)
		}

		// Update challenge tracking with the bet cost (negative PnL)
		challenges.AfterBetHook(tx, user.Username, -totalCost)

		// Referral & Growth Logic: award R100 on FIRST bet
		if !user.HasPlacedBet {
			if err := tx.Model(user).Update("has_placed_bet", true).Error; err != nil {
				return fmt.Errorf("failed to update first bet status: %w", err)
			}

			// Award referral bonus if referred by someone
			if user.ReferredBy != "" {
				bonusAmount := int64(10000)
				res := tx.Model(&models.User{}).
					Where("referral_code = ?", user.ReferredBy).
					UpdateColumn("virtual_balance", gorm.Expr("virtual_balance + ?", bonusAmount))

				if res.Error != nil {
					log.Printf("Referral bonus failed for code %s: %v", user.ReferredBy, res.Error)
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
	if user.VirtualBalance-betRequest.Amount-sumOfBetFees < -maximumDebtAllowed {
		return fmt.Errorf("Insufficient balance")
	}
	return nil
}
