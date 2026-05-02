package seed

import (
	"log"
	"socialpredict/models"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// SeedChallengeTiers seeds the default challenge tier definitions.
// Uses upsert (on conflict update) so it is safe to call multiple times.
func SeedChallengeTiers(db *gorm.DB) {
	tiers := []models.ChallengeTier{
		{
			Slug:              "rookie",
			Name:              "Rookie Challenge",
			EntryFee:          0, // Free
			StartingBalance:   100000, // R1000 in cents
			ProfitTarget:      110000, // R1100 in cents (10% growth)
			DurationDays:      7,
			MaxLosingDays:     3,
			MaxDailyLossPct:   10,
			RewardAmount:      0, // User can withdraw profits earned
			GrantsFunded:      false,
			GrantsEventCreate: false,
			IsActive:          true,
			SortOrder:         1,
			Description:       "Prove your prediction skills with zero risk. Hit a 10% growth target in 7 days to unlock profit withdrawals.",
		},
		{
			Slug:              "prospect",
			Name:              "Prospect Challenge",
			EntryFee:          5000, // R50 in cents
			StartingBalance:   200000, // R2000 in cents
			ProfitTarget:      240000, // R2400 in cents
			DurationDays:      14,
			MaxLosingDays:     4,
			MaxDailyLossPct:   10,
			RewardAmount:      20000, // R200 real money
			GrantsFunded:      true,  // Grants funded badge
			GrantsEventCreate: false,
			IsActive:          true,
			SortOrder:         2,
			Description:       "Step up your game. Earn R200 real money and unlock Funded status with a proven track record.",
		},
		{
			Slug:              "all-star",
			Name:              "All-Star Challenge",
			EntryFee:          15000, // R150 in cents
			StartingBalance:   500000, // R5000 in cents
			ProfitTarget:      600000, // R6000 in cents
			DurationDays:      21,
			MaxLosingDays:     5,
			MaxDailyLossPct:   10,
			RewardAmount:      50000, // R500 real money payout
			GrantsFunded:      true,
			GrantsEventCreate: false,
			IsActive:          true,
			SortOrder:         3,
			Description:       "Compete at the highest level. Demonstrate consistent growth over 21 days for a real money payout.",
		},
		{
			Slug:              "legend",
			Name:              "Legend Challenge",
			EntryFee:          50000, // R500 in cents
			StartingBalance:   1000000, // R10000 in cents
			ProfitTarget:      1200000, // R12000 in cents
			DurationDays:      30,
			MaxLosingDays:     6,
			MaxDailyLossPct:   10,
			RewardAmount:      150000, // R1500 real money payout
			GrantsFunded:      true,
			GrantsEventCreate: true, // Can create events
			IsActive:          true,
			SortOrder:         4,
			Description:       "The ultimate test. Prove legendary prediction skills over 30 days. Earn real money and the ability to create events.",
		},
	}

	for _, tier := range tiers {
		result := db.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "slug"}},
			DoUpdates: clause.AssignmentColumns([]string{
				"name", "entry_fee", "starting_balance", "profit_target",
				"duration_days", "max_losing_days", "max_daily_loss_pct",
				"reward_amount", "grants_funded", "grants_event_create",
				"is_active", "sort_order", "description",
			}),
		}).Create(&tier)
		if result.Error != nil {
			log.Printf("seed: warning seeding challenge tier %s: %v", tier.Slug, result.Error)
		}
	}

	log.Printf("seed: challenge tiers seeded successfully (%d tiers)", len(tiers))
}
