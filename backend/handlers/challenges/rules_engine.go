package challenges

import (
	"socialpredict/models"
	"time"

	"gorm.io/gorm"
)

// RuleResult holds the outcome of a rules evaluation.
type RuleResult struct {
	Passed    bool   `json:"passed"`
	Failed    bool   `json:"failed"`
	Violation string `json:"violation,omitempty"` // DAILY_LOSS, LOSING_DAYS, EXPIRED, or empty
	TargetMet bool   `json:"targetMet"`
}

// EvaluateRules runs all challenge rules against the current state.
// Returns the aggregate result: pass, fail, or continue.
func EvaluateRules(uc *models.UserChallenge) RuleResult {
	// 1. Check expiry
	if CheckExpiry(uc) {
		// If target is met even though expired, it's still a pass
		if CheckTargetMet(uc) {
			return RuleResult{Passed: true, TargetMet: true}
		}
		return RuleResult{Failed: true, Violation: models.ViolationExpired}
	}

	// 2. Check losing days
	if CheckLosingDaysExceeded(uc) {
		return RuleResult{Failed: true, Violation: models.ViolationLosingDays}
	}

	// 3. Check if target met
	if CheckTargetMet(uc) {
		return RuleResult{Passed: true, TargetMet: true}
	}

	// Continue — no violation, target not yet met
	return RuleResult{}
}

// CheckExpiry returns true if the challenge has passed its end date.
func CheckExpiry(uc *models.UserChallenge) bool {
	return time.Now().UTC().After(uc.EndDate)
}

// CheckDailyLoss returns true if today's loss exceeds the max daily loss percentage.
// todayPnL should be negative for losses.
func CheckDailyLoss(uc *models.UserChallenge, todayOpenBalance int64, todayPnL int64) bool {
	if todayPnL >= 0 {
		return false // No loss today
	}
	if todayOpenBalance <= 0 {
		return true // No balance to lose from — any loss is a violation
	}
	lossPct := (float64(-todayPnL) / float64(todayOpenBalance)) * 100
	return lossPct >= uc.MaxDailyLossPct
}

// CheckLosingDaysExceeded returns true if the user has used more losing days than allowed.
func CheckLosingDaysExceeded(uc *models.UserChallenge) bool {
	return uc.LosingDaysUsed > uc.MaxLosingDays
}

// CheckTargetMet returns true if current balance meets or exceeds the profit target.
func CheckTargetMet(uc *models.UserChallenge) bool {
	return uc.CurrentBalance >= uc.ProfitTarget
}

// ApplyRuleResult updates the challenge status based on rule evaluation and persists to DB.
func ApplyRuleResult(db *gorm.DB, uc *models.UserChallenge, result RuleResult) error {
	now := time.Now().UTC()

	if result.Passed {
		uc.Status = models.ChallengeStatusPassed
		uc.CompletedAt = &now
		if err := db.Save(uc).Error; err != nil {
			return err
		}
		return CreditRewards(db, uc)
	}

	if result.Failed {
		uc.Status = models.ChallengeStatusFailed
		uc.CompletedAt = &now
		return db.Save(uc).Error
	}

	return nil
}
