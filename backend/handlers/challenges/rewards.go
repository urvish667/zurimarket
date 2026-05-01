package challenges

import (
	"log"
	"socialpredict/models"

	"gorm.io/gorm"
)

// CreditRewards credits rewards to the user when a challenge is passed.
// Updates RealBalance, IsFunded badge, and event creation privileges.
func CreditRewards(db *gorm.DB, uc *models.UserChallenge) error {
	var tier models.ChallengeTier
	if err := db.First(&tier, uc.TierID).Error; err != nil {
		return err
	}

	var user models.User
	if err := db.Where("username = ?", uc.Username).First(&user).Error; err != nil {
		return err
	}

	updates := map[string]interface{}{}

	// Credit real money reward
	if tier.RewardAmount > 0 {
		updates["real_balance"] = gorm.Expr("real_balance + ?", tier.RewardAmount)
		log.Printf("challenges: crediting R%d reward to user %s for passing %s challenge",
			tier.RewardAmount/100, uc.Username, tier.Name)
	}

	// Grant funded badge
	if tier.GrantsFunded && !user.IsFunded {
		updates["is_funded"] = true
		log.Printf("challenges: granting funded badge to user %s", uc.Username)
	}

	// Upgrade Challenge Badge if applicable
	newBadgeLevel := models.BadgeHierarchy[tier.Slug]
	currentBadgeLevel := models.BadgeHierarchy[user.ChallengeBadge]
	if newBadgeLevel > currentBadgeLevel {
		updates["challenge_badge"] = tier.Slug
		log.Printf("challenges: upgrading user %s badge from %s to %s", uc.Username, user.ChallengeBadge, tier.Slug)
	}

	if len(updates) > 0 {
		if err := db.Model(&user).Updates(updates).Error; err != nil {
			return err
		}
	}

	return nil
}
