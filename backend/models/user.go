package models

import (
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	ID int64 `json:"id" gorm:"primary_key"`
	PublicUser
	PrivateUser
	MustChangePassword bool `json:"mustChangePassword" gorm:"default:false"`
}

type PublicUser struct {
	Username              string `json:"username" gorm:"unique;not null"`
	DisplayName           string `json:"displayname" gorm:"unique;not null"`
	UserType              string `json:"usertype" gorm:"not null"`
	InitialAccountBalance int64  `json:"initialAccountBalance"`
	AccountBalance        int64  `json:"accountBalance"`
	PersonalEmoji         string `json:"personalEmoji,omitempty"`
	Description           string `json:"description,omitempty"`
	PersonalLink1         string `json:"personalink1,omitempty"`
	PersonalLink2         string `json:"personalink2,omitempty"`
	PersonalLink3         string `json:"personalink3,omitempty"`
	PersonalLink4         string `json:"personalink4,omitempty"`
	
	// Referral & Growth Engine
	ReferralCode          string `json:"referralCode" gorm:"uniqueIndex"`
	ReferredBy            string `json:"referredBy,omitempty"`
	HasPlacedBet          bool   `json:"hasPlacedBet" gorm:"default:false"`
	CurrentStreak         int    `json:"currentStreak" gorm:"default:0"`
}

type PrivateUser struct {
	Email         string `json:"email" gorm:"unique;not null"`
	PhoneNumber   string `json:"phoneNumber" gorm:"uniqueIndex"`
	EmailVerified bool   `json:"emailVerified" gorm:"default:false"`
	PhoneVerified bool   `json:"phoneVerified" gorm:"default:false"`
	APIKey        string `json:"apiKey,omitempty" gorm:"unique"`
	Password      string `json:"-" gorm:"not null"`
	
	// OTP Tracking (not exposed to JSON)
	OTPCode       string `json:"-"`
	OTPExpiry     int64  `json:"-"`
	LastLoginDate int64  `json:"lastLoginDate"` // Unix timestamp
}

// HashPassword hashes given password
func (u *User) HashPassword(password string) error {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	u.Password = string(bytes)
	return err
}

// CheckPasswordHash checks if provided password is correct
func (u *User) CheckPasswordHash(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}
