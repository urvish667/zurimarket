package migrations

import (
	"socialpredict/migration"
	"socialpredict/models"

	"gorm.io/gorm"
)

// MigrateResetRegularUserPasswords contains the logic to set must_change_password
// to false for all REGULAR users, since they were incorrectly created with true due to
// a GORM default configuration issue.
func MigrateResetRegularUserPasswords(db *gorm.DB) error {
	// We use Update to apply this change directly to the database layer
	// matching user_type = 'REGULAR' and explicitly setting must_change_password to false
	if err := db.Model(&models.User{}).
		Where("user_type = ?", "REGULAR").
		Update("must_change_password", false).Error; err != nil {
		return err
	}

	return nil
}

// Register migration with timestamp
func init() {
	migration.Register("20260324175526", func(db *gorm.DB) error {
		return MigrateResetRegularUserPasswords(db)
	})
}
