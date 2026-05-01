package models

import (
	"fmt"
	"math/rand"
	"strings"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

const (
	RoleUser  = "USER"
	RoleAdmin = "ADMIN"
)

// User represents the main user entity in the system.
// Note: Some fields are inherited from PublicUser and PrivateUser.
type User struct {
	gorm.Model
	ID int64 `json:"id" gorm:"primary_key"`
	PublicUser
	PrivateUser
	Role               string `json:"role" gorm:"not null;default:USER"`
	IsVerified         bool   `json:"isVerified" gorm:"default:false"`
	IsBanned           bool   `json:"isBanned" gorm:"default:false"`
	MustChangePassword bool   `json:"mustChangePassword" gorm:"default:false"`
}

const referralCodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

// PublicUser contains fields that are safe to expose in public API responses.
type PublicUser struct {
	Username              string `json:"username" gorm:"unique;not null"`
	DisplayName           string `json:"displayname" gorm:"unique;not null"`
	FullName              string `json:"fullName"`
	DateOfBirth           string `json:"dateOfBirth"`
	Gender                string `json:"gender"`
	StreetAddress         string `json:"streetAddress"`
	Country               string `json:"country"`
	State                 string `json:"state"`
	City                  string `json:"city"`
	PostalCode            string `json:"postalCode"`
	UserType              string `json:"usertype" gorm:"not null"`
	InitialAccountBalance int64  `json:"initialAccountBalance"`
	VirtualBalance        int64  `json:"virtualBalance" gorm:"not null;default:0"`
	RealBalance           int64  `json:"realBalance" gorm:"not null;default:0"`

	// Referral & Growth Engine
	ReferralCode  string `json:"referralCode"`
	ReferredBy    string `json:"referredBy,omitempty"`
	HasPlacedBet  bool   `json:"hasPlacedBet" gorm:"default:false"`
	CurrentStreak int    `json:"currentStreak" gorm:"default:0"`

	// Visual Customization
	PersonalEmoji string `json:"personalEmoji" gorm:"default:👤"`
	Avatar        string `json:"avatar"`
	IsFunded       bool   `json:"isFunded" gorm:"default:false"`
	ChallengeBadge string `json:"challengeBadge" gorm:"default:'none'"`
}

// PrivateUser contains sensitive user information.
// IMPORTANT: Sensitive fields like Password and OTPCode MUST have the `json:"-"` tag
// to prevent them from being leaked in JSON API responses.
type PrivateUser struct {
	Email         string `json:"email" gorm:"unique;not null"`
	PhoneNumber   string `json:"phoneNumber"`
	EmailVerified bool   `json:"emailVerified" gorm:"default:false"`
	PhoneVerified bool   `json:"phoneVerified" gorm:"default:false"`
	APIKey        string `json:"apiKey,omitempty" gorm:"unique"`
	Password      string `json:"-" gorm:"not null"` // json:"-" tag prevents password leakage

	// OTP Tracking (not exposed to JSON)
	OTPCode       string `json:"-"` // json:"-" tag prevents OTP leakage
	OTPExpiry     int64  `json:"-"` // json:"-" tag prevents OTP leakage
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

func (u *User) BeforeSave(tx *gorm.DB) error {
	u.SyncRoleFields()
	u.SyncVerificationFields()
	return nil
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if strings.TrimSpace(u.ReferralCode) == "" {
		code, err := GenerateUniqueReferralCode(tx)
		if err != nil {
			return err
		}
		u.ReferralCode = code
	}

	return u.BeforeSave(tx)
}

func (u *User) AfterFind(tx *gorm.DB) error {
	u.SyncRoleFields()
	u.SyncVerificationFields()
	return nil
}

func (u *User) SyncRoleFields() {
	switch {
	case strings.EqualFold(u.Role, RoleAdmin), strings.EqualFold(u.UserType, RoleAdmin):
		u.Role = RoleAdmin
		if strings.TrimSpace(u.UserType) == "" {
			u.UserType = RoleAdmin
		}
	default:
		u.Role = RoleUser
		if strings.TrimSpace(u.UserType) == "" {
			u.UserType = RoleUser
		}
	}
}

func (u *User) SyncVerificationFields() {
	if !u.IsVerified && (u.EmailVerified || u.PhoneVerified) {
		u.IsVerified = true
	}
	if u.IsVerified {
		u.EmailVerified = true
	}
}

func GenerateUniqueReferralCode(tx *gorm.DB) (string, error) {
	for i := 0; i < 20; i++ {
		code := RandomReferralCode()
		var count int64
		if err := tx.Model(&User{}).Where("referral_code = ?", code).Count(&count).Error; err != nil {
			return "", err
		}
		if count == 0 {
			return code, nil
		}
	}

	return "", fmt.Errorf("unable to generate unique referral code")
}

func RandomReferralCode() string {
	b := make([]byte, 8)
	for i := range b {
		b[i] = referralCodeChars[rand.Intn(len(referralCodeChars))]
	}
	return string(b)
}
