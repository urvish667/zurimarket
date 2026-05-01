package models

import (
	"time"

	"gorm.io/gorm"
)

type Comment struct {
	ID        int64     `json:"id" gorm:"primary_key"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`
	MarketID  int64     `json:"marketId" gorm:"index"`
	Username  string    `json:"username" gorm:"not null"`
	Content   string    `json:"content" gorm:"type:text;not null"`
	ReplyToID *int64    `json:"replyToId,omitempty" gorm:"index"`
	
	// Relations
	User    User      `gorm:"foreignKey:Username;references:Username"`
	Market  Market    `gorm:"foreignKey:MarketID;references:ID"`
	Replies []Comment `json:"replies,omitempty" gorm:"foreignKey:ReplyToID"`
}
