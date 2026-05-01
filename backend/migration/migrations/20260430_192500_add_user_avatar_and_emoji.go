package migrations

import (
	"socialpredict/migration"
	"socialpredict/models"

	"gorm.io/gorm"
)

func init() {
	migration.Register("20260430192500", func(db *gorm.DB) error {
		return db.AutoMigrate(&models.User{})
	})
}
