package marketshandlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net/http"
	"regexp"
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
const maxOptionsCount = 10
const minOptionsCount = 3

// generateSlug creates a URL-friendly slug from a question title + random suffix.
func generateSlug(title string) string {
	slug := strings.ToLower(title)
	// Replace non-alphanumeric chars with hyphens
	re := regexp.MustCompile(`[^a-z0-9]+`)
	slug = re.ReplaceAllString(slug, "-")
	// Trim leading/trailing hyphens
	slug = strings.Trim(slug, "-")
	// Truncate to reasonable length
	if len(slug) > 60 {
		slug = slug[:60]
		// Don't end on a partial word if possible
		if idx := strings.LastIndex(slug, "-"); idx > 30 {
			slug = slug[:idx]
		}
	}
	// Append random 5-digit number
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	suffix := rng.Intn(90000) + 10000 // 10000-99999
	return fmt.Sprintf("%s-%d", slug, suffix)
}

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
	if yesLabel != "" {
		yesLabel = strings.TrimSpace(yesLabel)
		if len(yesLabel) < 1 || len(yesLabel) > 20 {
			return errors.New("yes label must be between 1 and 20 characters")
		}
	}
	if noLabel != "" {
		noLabel = strings.TrimSpace(noLabel)
		if len(noLabel) < 1 || len(noLabel) > 20 {
			return errors.New("no label must be between 1 and 20 characters")
		}
	}
	return nil
}

// validCategories is the set of allowed market categories
var validCategories = map[string]bool{
	"politics":      true,
	"crypto":        true,
	"sports":        true,
	"business":      true,
	"science":       true,
	"entertainment": true,
	"other":         true,
}

func validateCategory(category string) (string, error) {
	if category == "" {
		return "other", nil
	}
	normalized := strings.ToLower(strings.TrimSpace(category))
	if !validCategories[normalized] {
		return "", fmt.Errorf("invalid category '%s'. Valid categories: politics, crypto, sports, business, science, entertainment, other", category)
	}
	return normalized, nil
}

// createMarketRequest extends the base market data with an options array for multiple choice.
type createMarketRequest struct {
	models.Market
	OptionLabels []string `json:"options,omitempty"` // for MULTIPLE_CHOICE markets
}

func CreateMarketHandler(loadEconConfig setup.EconConfigLoader) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method is not supported.", http.StatusMethodNotAllowed)
			return
		}

		securityService := security.NewSecurityService()

		db := util.GetDB()
		user, httperr := middleware.ValidateUserAndEnforcePasswordChangeGetUser(r, db)
		if httperr != nil {
			http.Error(w, httperr.Error(), httperr.StatusCode)
			return
		}

		var req createMarketRequest
		err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			bodyBytes, _ := io.ReadAll(r.Body)
			log.Printf("Error reading request body: %v, Body: %s", err, string(bodyBytes))
			http.Error(w, "Error reading request body", http.StatusBadRequest)
			return
		}

		newMarket := req.Market

		// Validate and sanitize market input using security service
		marketInput := security.MarketInput{
			Title:       newMarket.QuestionTitle,
			Description: newMarket.Description,
			EndTime:     newMarket.ResolutionDateTime.String(),
		}

		sanitizedMarketInput, err := securityService.ValidateAndSanitizeMarketInput(marketInput)
		if err != nil {
			http.Error(w, "Invalid market data: "+err.Error(), http.StatusBadRequest)
			return
		}

		newMarket.QuestionTitle = sanitizedMarketInput.Title
		newMarket.Description = sanitizedMarketInput.Description
		newMarket.CreatorID = user.ID
		newMarket.CreatorUsername = user.Username
		newMarket.Status = models.MarketStatusActive

		// Generate slug from question title
		newMarket.Slug = generateSlug(newMarket.QuestionTitle)

		// Validate outcome type
		if newMarket.OutcomeType == "" {
			newMarket.OutcomeType = models.OutcomeTypeBinary
		}
		if newMarket.OutcomeType != models.OutcomeTypeBinary && newMarket.OutcomeType != models.OutcomeTypeMultipleChoice {
			http.Error(w, "Invalid outcome type. Must be BINARY or MULTIPLE_CHOICE", http.StatusBadRequest)
			return
		}

		// Validate options for MULTIPLE_CHOICE
		var optionLabels []string
		if newMarket.OutcomeType == models.OutcomeTypeMultipleChoice {
			optionLabels = req.OptionLabels
			if len(optionLabels) < minOptionsCount {
				http.Error(w, fmt.Sprintf("Multiple choice markets require at least %d options", minOptionsCount), http.StatusBadRequest)
				return
			}
			if len(optionLabels) > maxOptionsCount {
				http.Error(w, fmt.Sprintf("Maximum %d options allowed", maxOptionsCount), http.StatusBadRequest)
				return
			}
			// Validate each option label
			seen := make(map[string]bool)
			for i, label := range optionLabels {
				label = strings.TrimSpace(label)
				if label == "" {
					http.Error(w, fmt.Sprintf("Option %d cannot be empty", i+1), http.StatusBadRequest)
					return
				}
				if len(label) > 50 {
					http.Error(w, fmt.Sprintf("Option '%s' exceeds 50 characters", label), http.StatusBadRequest)
					return
				}
				lower := strings.ToLower(label)
				if seen[lower] {
					http.Error(w, fmt.Sprintf("Duplicate option: '%s'", label), http.StatusBadRequest)
					return
				}
				seen[lower] = true
				optionLabels[i] = label
			}
			// For multiple choice, set initial probability to equal split
			newMarket.InitialProbability = 1.0 / float64(len(optionLabels))
		}

		// Legacy validations
		if err = checkQuestionTitleLength(newMarket.QuestionTitle); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if err = checkQuestionDescriptionLength(newMarket.Description); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// For binary markets, validate custom labels
		if newMarket.OutcomeType == models.OutcomeTypeBinary {
			if err = validateCustomLabels(newMarket.YesLabel, newMarket.NoLabel); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			if strings.TrimSpace(newMarket.YesLabel) == "" {
				newMarket.YesLabel = "YES"
			}
			if strings.TrimSpace(newMarket.NoLabel) == "" {
				newMarket.NoLabel = "NO"
			}
		}

		// Validate and set category
		validatedCategory, err := validateCategory(newMarket.Category)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		newMarket.Category = validatedCategory

		// Atomically check user, deduct the fee and create the market + options in a single transaction.
		txErr := db.Transaction(func(tx *gorm.DB) error {
			if err = util.CheckUserIsReal(tx, newMarket.CreatorUsername); err != nil {
				return err
			}

			appConfig := loadEconConfig()
			if err = validateMarketResolutionTime(newMarket.ResolutionDateTime, appConfig); err != nil {
				return err
			}

			marketCreateFee := appConfig.Economics.MarketIncentives.CreateMarketCost
			maximumDebtAllowed := appConfig.Economics.User.MaximumDebtAllowed

			// Atomic conditional deduction:
			res := tx.Model(&models.User{}).
				Where("username = ? AND virtual_balance - ? >= ?", user.Username, marketCreateFee, -maximumDebtAllowed).
				UpdateColumn("virtual_balance", gorm.Expr("virtual_balance - ?", marketCreateFee))
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

			// Create options
			if newMarket.OutcomeType == models.OutcomeTypeMultipleChoice {
				for i, label := range optionLabels {
					opt := models.MarketOption{
						MarketID:     newMarket.ID,
						Label:        label,
						DisplayOrder: i,
					}
					if err := tx.Create(&opt).Error; err != nil {
						return fmt.Errorf("error creating market option: %w", err)
					}
				}
			} else {
				// Binary: create YES and NO options
				yesOpt := models.MarketOption{MarketID: newMarket.ID, Label: newMarket.YesLabel, DisplayOrder: 0}
				noOpt := models.MarketOption{MarketID: newMarket.ID, Label: newMarket.NoLabel, DisplayOrder: 1}
				if err := tx.Create(&yesOpt).Error; err != nil {
					return fmt.Errorf("error creating YES option: %w", err)
				}
				if err := tx.Create(&noOpt).Error; err != nil {
					return fmt.Errorf("error creating NO option: %w", err)
				}
			}

			return nil
		})
		if txErr != nil {
			http.Error(w, txErr.Error(), http.StatusBadRequest)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(newMarket)
	}
}
