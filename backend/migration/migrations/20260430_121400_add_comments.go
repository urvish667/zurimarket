package migrations

import (
	"socialpredict/migration"
	"gorm.io/gorm"
)

func init() {
	migration.Register("20260430121400", func(db *gorm.DB) error {
		// Use raw SQL to ensure the table is created even if AutoMigrate is failing
		err := db.Exec(`
			CREATE TABLE IF NOT EXISTS "comments" (
				"id" bigserial,
				"created_at" timestamptz,
				"updated_at" timestamptz,
				"deleted_at" timestamptz,
				"market_id" bigint,
				"username" text NOT NULL,
				"content" text NOT NULL,
				"reply_to_id" bigint,
				PRIMARY KEY ("id")
			);
			CREATE INDEX IF NOT EXISTS "idx_comments_deleted_at" ON "comments" ("deleted_at");
			CREATE INDEX IF NOT EXISTS "idx_comments_market_id" ON "comments" ("market_id");
			CREATE INDEX IF NOT EXISTS "idx_comments_reply_to_id" ON "comments" ("reply_to_id");
		`).Error
		if err != nil {
			return err
		}
		return nil
	})
}
