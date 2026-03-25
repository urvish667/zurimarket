package marketshandlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"socialpredict/middleware"
	"socialpredict/models"
	"socialpredict/security"
	"socialpredict/setup"
	"socialpredict/util"
	"strings"
	"time"

	"gorm.io/gorm"
)

const maxQuestionTitleLength = 160

// validateMarketResolutionTime validates that the market resolution time meets business logic requirements
func validateMarketResolutionTime(resolutionTime time.Time, config *setup.EconomicConfig) error {
	now := time.Now()
	minimumDuration := time.Duration(config.Economics.MarketCreation.MinimumFutureHours * float64(time.Hour))
	minimumFutureTime := now.Add(minimumDuration)

	if resolutionTime.Before(minimumFutureTime) || resolutionTime.Equal(minimumFutureTime) {
		return fmt.Errorf("market resolution time must be at least %.1f hours in the future",
			config.Economics.MarketCreation.MinimumFutureHours)
	}
	return nil
}

func checkQuestionTitleLength(title string) error {
	if len(title) > maxQuestionTitleLength || len(title) < 1 {
		return fmt.Errorf("question title exceeds %d characters or is blank", maxQuestionTitleLength)
	}
	return nil
}

func checkQuestionDescriptionLength(description string) error {
	if len(description) > 2000 {
		return errors.New("question description exceeds 2000 characters")
	}
	return nil
}

func validateCustomLabels(yesLabel, noLabel string) error {
	// Validate yes label
	if yesLabel != "" {
		yesLabel = strings.TrimSpace(yesLabel)
		if len(yesLabel) < 1 || len(yesLabel) > 20 {
			return errors.New("yes label must be between 1 and 20 characters")
		}
	}
	
	// Validate no label
	if noLabel != "" {
		noLabel = strings.TrimSpace(noLabel)
		if len(noLabel) < 1 || len(noLabel) > 20 {
			return errors.New("no label must be between 1 and 20 characters")
		}
	}
	
	return nil
}

func CreateMarketHandler(loadEconConfig setup.EconConfigLoader) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method is not supported.", http.StatusMethodNotAllowed)
			return
		}

		// Initialize security service
		securityService := security.NewSecurityService()

		// Use database connection, validate user based upon token
		db := util.GetDB()
		user, httperr := middleware.ValidateUserAndEnforcePasswordChangeGetUser(r, db)
		if httperr != nil {
			http.Error(w, httperr.Error(), httperr.StatusCode)
			return
		}

		var newMarket models.Market

		newMarket.CreatorUsername = user.Username

		err := json.NewDecoder(r.Body).Decode(&newMarket)
		if err != nil {
			bodyBytes, _ := io.ReadAll(r.Body)
			log.Printf("Error reading request body: %v, Body: %s", err, string(bodyBytes))
			http.Error(w, "Error reading request body", http.StatusBadRequest)
			return
		}

		// Validate and sanitize market input using security service
		marketInput := security.MarketInput{
			Title:       newMarket.QuestionTitle,
			Description: newMarket.Description,
			EndTime:     newMarket.ResolutionDateTime.String(), // Convert time to string for validation
		}

		sanitizedMarketInput, err := securityService.ValidateAndSanitizeMarketInput(marketInput)
		if err != nil {
			http.Error(w, "Invalid market data: "+err.Error(), http.StatusBadRequest)
			return
		}

		// Update the market with sanitized data
		newMarket.QuestionTitle = sanitizedMarketInput.Title
		newMarket.Description = sanitizedMarketInput.Description

		// Additional legacy validations (kept for backwards compatibility)
		if err = checkQuestionTitleLength(newMarket.QuestionTitle); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if err = checkQuestionDescriptionLength(newMarket.Description); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Validate custom labels
		if err = validateCustomLabels(newMarket.YesLabel, newMarket.NoLabel); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Set default labels if not provided
		if strings.TrimSpace(newMarket.YesLabel) == "" {
			newMarket.YesLabel = "YES"
		}
		if strings.TrimSpace(newMarket.NoLabel) == "" {
			newMarket.NoLabel = "NO"
		}

		if err = util.CheckUserIsReal(db, newMarket.CreatorUsername); err != nil {
			if err.Error() == "creator user not found" {
				http.Error(w, err.Error(), http.StatusNotFound)
			} else {
				http.Error(w, err.Error(), http.StatusInternalServerError)
			}
			return
		}

		appConfig := loadEconConfig()

		// Business logic validation: Check market resolution time
		if err = validateMarketResolutionTime(newMarket.ResolutionDateTime, appConfig); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		marketCreateFee := appConfig.Economics.MarketIncentives.CreateMarketCost
		maximumDebtAllowed := appConfig.Economics.User.MaximumDebtAllowed

		// Pre-flight check (fast rejection before touching the DB)
		if user.AccountBalance-marketCreateFee < -maximumDebtAllowed {
			http.Error(w, "Insufficient balance", http.StatusBadRequest)
			return
		}

		// Atomically deduct the fee and create the market in a single transaction.
		// The WHERE guard ensures that even under concurrent requests the balance
		// cannot go below -maximumDebtAllowed.
		txErr := db.Transaction(func(tx *gorm.DB) error {
			res := tx.Model(&models.User{}).
				Where("username = ? AND account_balance - ? >= ?", user.Username, marketCreateFee, -maximumDebtAllowed).
				UpdateColumn("account_balance", gorm.Expr("account_balance - ?", marketCreateFee))
			if res.Error != nil {
				return res.Error
			}
			if res.RowsAffected == 0 {
				return fmt.Errorf("insufficient balance")
			}
			if err := tx.Create(&newMarket).Error; err != nil {
				log.Printf("Error creating new market: %v", err)
				return fmt.Errorf("error creating new market")
			}
			return nil
		})
		if txErr != nil {
			http.Error(w, txErr.Error(), http.StatusBadRequest)
			return
		}

		// Set the Content-Type header
		w.Header().Set("Content-Type", "application/json")

		// Send a success response
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(newMarket)
	}
}
