package models

import (
	"time"

	"gorm.io/gorm"
)

// Challenge status constants
const (
	ChallengeStatusActive  = "ACTIVE"
	ChallengeStatusPassed  = "PASSED"
	ChallengeStatusFailed  = "FAILED"
	ChallengeStatusExpired = "EXPIRED"
)

// Rule violation constants
const (
	ViolationNone       = ""
	ViolationDailyLoss  = "DAILY_LOSS"
	ViolationLosingDays = "LOSING_DAYS"
	ViolationExpired    = "EXPIRED"
)

// ChallengeTier defines a challenge level configuration.
// Stored in DB so admins can add/edit tiers without code changes.
type ChallengeTier struct {
	gorm.Model
	ID               uint    `json:"id" gorm:"primaryKey"`
	Slug             string  `json:"slug" gorm:"uniqueIndex;not null"`            // rookie, prospect, all-star, legend
	Name             string  `json:"name" gorm:"not null"`                        // Display name
	EntryFee         int64   `json:"entryFee" gorm:"not null;default:0"`          // In platform currency (0 = free)
	StartingBalance  int64   `json:"startingBalance" gorm:"not null"`             // Virtual starting balance
	ProfitTarget     int64   `json:"profitTarget" gorm:"not null"`                // Balance to reach to pass
	DurationDays     int     `json:"durationDays" gorm:"not null"`                // Max days allowed
	MaxLosingDays    int     `json:"maxLosingDays" gorm:"not null"`               // Max losing days before fail
	MaxDailyLossPct  float64 `json:"maxDailyLossPct" gorm:"not null;default:10"`  // Max daily loss as percentage
	RewardAmount     int64   `json:"rewardAmount" gorm:"not null;default:0"`      // Real money reward on pass
	GrantsFunded     bool    `json:"grantsFunded" gorm:"default:false"`           // Grants "funded" badge
	GrantsEventCreate bool   `json:"grantsEventCreate" gorm:"default:false"`      // Grants market creation ability
	IsActive         bool    `json:"isActive" gorm:"default:true"`                // Whether tier is available
	SortOrder        int     `json:"sortOrder" gorm:"default:0"`                  // Display order
	Description      string  `json:"description" gorm:"type:text"`               // Tier description
}

// UserChallenge represents a single challenge attempt by a user.
// Each retry creates a new row. Only one ACTIVE challenge per user at a time.
type UserChallenge struct {
	gorm.Model
	ID              uint          `json:"id" gorm:"primaryKey"`
	UserID          int64         `json:"userId" gorm:"index;not null"`
	Username        string        `json:"username" gorm:"index;not null"`
	User            User          `json:"-" gorm:"foreignKey:Username;references:Username"`
	TierID          uint          `json:"tierId" gorm:"index;not null"`
	Tier            ChallengeTier `json:"tier" gorm:"foreignKey:TierID"`
	Status          string        `json:"status" gorm:"not null;default:ACTIVE;index"` // ACTIVE, PASSED, FAILED, EXPIRED
	StartBalance    int64         `json:"startBalance" gorm:"not null"`
	CurrentBalance  int64         `json:"currentBalance" gorm:"not null"`
	ProfitTarget    int64         `json:"profitTarget" gorm:"not null"`
	StartDate       time.Time     `json:"startDate" gorm:"not null"`
	EndDate         time.Time     `json:"endDate" gorm:"not null"`
	LosingDaysUsed  int           `json:"losingDaysUsed" gorm:"default:0"`
	MaxLosingDays   int           `json:"maxLosingDays" gorm:"not null"`
	MaxDailyLossPct float64       `json:"maxDailyLossPct" gorm:"not null"`
	CompletedAt     *time.Time    `json:"completedAt"`
	AttemptNumber   int           `json:"attemptNumber" gorm:"default:1"`
	DailyLogs       []ChallengeDailyLog `json:"dailyLogs,omitempty" gorm:"foreignKey:UserChallengeID"`
}

// ChallengeDailyLog records a daily performance snapshot for a challenge attempt.
type ChallengeDailyLog struct {
	gorm.Model
	ID              uint    `json:"id" gorm:"primaryKey"`
	UserChallengeID uint    `json:"userChallengeId" gorm:"index;not null"`
	Date            string  `json:"date" gorm:"index;not null"` // YYYY-MM-DD format (UTC)
	OpenBalance     int64   `json:"openBalance"`
	CloseBalance    int64   `json:"closeBalance"`
	DailyPnL        int64   `json:"dailyPnl"`
	DailyLossPct    float64 `json:"dailyLossPct"`
	IsLosingDay     bool    `json:"isLosingDay" gorm:"default:false"`
	RuleViolation   string  `json:"ruleViolation,omitempty"` // Empty or: DAILY_LOSS, LOSING_DAYS, EXPIRED
}

// ProgressPct returns the challenge completion percentage (0-100).
func (uc *UserChallenge) ProgressPct() float64 {
	target := uc.ProfitTarget - uc.StartBalance
	if target <= 0 {
		return 100
	}
	gained := uc.CurrentBalance - uc.StartBalance
	if gained <= 0 {
		return 0
	}
	pct := float64(gained) / float64(target) * 100
	if pct > 100 {
		return 100
	}
	return pct
}

// RemainingDays returns the number of days left in the challenge.
func (uc *UserChallenge) RemainingDays() int {
	remaining := int(time.Until(uc.EndDate).Hours() / 24)
	if remaining < 0 {
		return 0
	}
	return remaining
}

// IsExpired checks if the challenge has passed its end date.
func (uc *UserChallenge) IsExpired() bool {
	return time.Now().UTC().After(uc.EndDate)
}
// Badge progression configuration
var BadgeHierarchy = map[string]int{
	"none":     0,
	"rookie":   1,
	"prospect": 2,
	"all-star": 3,
	"legend":   4,
}

var TierRequiredBadge = map[string]string{
	"rookie":   "none",
	"prospect": "rookie",
	"all-star": "prospect",
	"legend":   "all-star",
}
