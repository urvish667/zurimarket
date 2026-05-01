package challenges

import (
	"socialpredict/models"
	"time"

	"gorm.io/gorm"
)

// RecordDailySnapshot creates or updates the daily log for the current UTC day.
// Called after each bet and also by the batch daily evaluation.
func RecordDailySnapshot(db *gorm.DB, uc *models.UserChallenge) error {
	today := time.Now().UTC().Format("2006-01-02")

	var log models.ChallengeDailyLog
	result := db.Where("user_challenge_id = ? AND date = ?", uc.ID, today).First(&log)

	if result.Error != nil && result.Error != gorm.ErrRecordNotFound {
		return result.Error
	}

	if result.Error == gorm.ErrRecordNotFound {
		// Create new daily log
		log = models.ChallengeDailyLog{
			UserChallengeID: uc.ID,
			Date:            today,
			OpenBalance:     uc.CurrentBalance, // Will be set properly on first bet of the day
			CloseBalance:    uc.CurrentBalance,
			DailyPnL:        0,
			DailyLossPct:    0,
			IsLosingDay:     false,
		}

		// Try to get yesterday's close balance as today's open
		yesterday := time.Now().UTC().AddDate(0, 0, -1).Format("2006-01-02")
		var prevLog models.ChallengeDailyLog
		if err := db.Where("user_challenge_id = ? AND date = ?", uc.ID, yesterday).First(&prevLog).Error; err == nil {
			log.OpenBalance = prevLog.CloseBalance
		} else {
			// First day or no previous log — use start balance
			log.OpenBalance = uc.StartBalance
		}

		return db.Create(&log).Error
	}

	// Update existing log
	log.CloseBalance = uc.CurrentBalance
	log.DailyPnL = log.CloseBalance - log.OpenBalance

	if log.OpenBalance > 0 && log.DailyPnL < 0 {
		log.DailyLossPct = (float64(-log.DailyPnL) / float64(log.OpenBalance)) * 100
	} else {
		log.DailyLossPct = 0
	}

	log.IsLosingDay = log.DailyPnL < 0

	// Check daily loss violation
	if CheckDailyLoss(uc, log.OpenBalance, log.DailyPnL) {
		log.RuleViolation = models.ViolationDailyLoss
	}

	return db.Save(&log).Error
}

// RecountLosingDays recounts the total losing days from daily logs.
func RecountLosingDays(db *gorm.DB, uc *models.UserChallenge) error {
	var count int64
	if err := db.Model(&models.ChallengeDailyLog{}).
		Where("user_challenge_id = ? AND is_losing_day = ?", uc.ID, true).
		Count(&count).Error; err != nil {
		return err
	}
	uc.LosingDaysUsed = int(count)
	return db.Model(uc).Update("losing_days_used", uc.LosingDaysUsed).Error
}

// EndOfDayEvaluation runs the end-of-day checks for a single challenge.
// Updates daily log, recounts losing days, and evaluates rules.
func EndOfDayEvaluation(db *gorm.DB, uc *models.UserChallenge) error {
	// Record/update today's snapshot
	if err := RecordDailySnapshot(db, uc); err != nil {
		return err
	}

	// Recount losing days from logs
	if err := RecountLosingDays(db, uc); err != nil {
		return err
	}

	// Evaluate rules
	result := EvaluateRules(uc)
	if result.Passed || result.Failed {
		return ApplyRuleResult(db, uc, result)
	}

	return nil
}

// BatchDailyEvaluation evaluates all active challenges.
// Called by the admin endpoint or a scheduler.
func BatchDailyEvaluation(db *gorm.DB) (int, int, error) {
	var challenges []models.UserChallenge
	if err := db.Where("status = ?", models.ChallengeStatusActive).Find(&challenges).Error; err != nil {
		return 0, 0, err
	}

	processed := 0
	failed := 0
	for i := range challenges {
		if err := EndOfDayEvaluation(db, &challenges[i]); err != nil {
			failed++
		} else {
			processed++
		}
	}

	return processed, failed, nil
}
