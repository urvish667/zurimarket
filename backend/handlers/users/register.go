package usershandlers

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"socialpredict/middleware"
	"socialpredict/models"
	"socialpredict/security"
	"socialpredict/setup"
	"socialpredict/util"
	"strings"
	"time"

	"gorm.io/gorm"
)

func InitiateRegistrationHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not supported", http.StatusMethodNotAllowed)
		return
	}

	securityService := security.NewSecurityService()

	var req struct {
		Username     string `json:"username" validate:"required,min=3,max=30,username"`
		FullName     string `json:"fullName" validate:"required"`
		DateOfBirth  string `json:"dateOfBirth" validate:"required"`
		Email        string `json:"email" validate:"required,email"`
		PhoneNumber  string `json:"phoneNumber" validate:"required"`
		Password     string `json:"password" validate:"required,min=6"`
		ReferralCode string `json:"referralCode"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Error decoding request body", http.StatusBadRequest)
		return
	}

	if err := securityService.Validator.ValidateStruct(req); err != nil {
		http.Error(w, "Invalid input: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Age validation (18+)
	if util.CalculateAge(req.DateOfBirth) < 18 {
		http.Error(w, "Protocol restriction: You must be at least 18 years old to join ZuriMarket.", http.StatusBadRequest)
		return
	}

	sanitizedUsername, err := securityService.Sanitizer.SanitizeUsername(req.Username)
	if err != nil {
		http.Error(w, "Invalid username format", http.StatusBadRequest)
		return
	}
	req.Username = sanitizedUsername

	db := util.GetDB()
	var existingUser models.User
	result := db.Where("username = ? OR email = ? OR phone_number = ?", req.Username, req.Email, req.PhoneNumber).First(&existingUser)

	if result.Error == nil {
		if existingUser.IsVerified {
			http.Error(w, "Username, email, or phone number already in use", http.StatusConflict)
			return
		}

		// User is unverified, update OTP and resend
		otp := fmt.Sprintf("%06d", rand.Intn(1000000))
		existingUser.OTPCode = otp
		existingUser.OTPExpiry = time.Now().Add(10 * time.Minute).Unix()

		// Update details if they changed between retries
		existingUser.PublicUser.Username = req.Username
		existingUser.PublicUser.FullName = req.FullName
		existingUser.PublicUser.DateOfBirth = req.DateOfBirth
		existingUser.PrivateUser.Email = strings.ToLower(strings.TrimSpace(req.Email))
		existingUser.PrivateUser.PhoneNumber = req.PhoneNumber
		existingUser.HashPassword(req.Password)

		// Update referral code if provided and not already set
		if req.ReferralCode != "" && existingUser.ReferredBy == "" {
			existingUser.ReferredBy = req.ReferralCode
		}

		if err := db.Save(&existingUser).Error; err != nil {
			http.Error(w, "Failed to update registration", http.StatusInternalServerError)
			log.Printf("UpdateRegistration error: %v", err)
			return
		}

		// MOCK SMS SENDING
		log.Printf("========== SMS PROVIDER MOCK (RESEND) ==========")
		log.Printf("To: %s", req.PhoneNumber)
		log.Printf("Message: Your Stadia Emerald verification code is: %s", otp)
		log.Printf("===============================================")

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "Registration updated. New OTP sent."})
		return
	}

	// Calculate initial account balance for display purposes later, though actual deposit is on verify
	appConfig, _ := setup.LoadEconomicsConfig()
	
	// Create Unverified User
	otp := fmt.Sprintf("%06d", rand.Intn(1000000))
	expiry := time.Now().Add(10 * time.Minute).Unix() // 10 minute expiry

	user := models.User{
		PublicUser: models.PublicUser{
			Username:              req.Username,
			FullName:              req.FullName,
			DateOfBirth:           req.DateOfBirth,
			DisplayName:           util.UniqueDisplayName(db),
			UserType:              models.RoleUser,
			InitialAccountBalance: appConfig.Economics.User.InitialAccountBalance,
			AccountBalance:        0, // Awarded ONLY on verification
			ReferredBy:            req.ReferralCode,
		},
		PrivateUser: models.PrivateUser{
			Email:         strings.ToLower(strings.TrimSpace(req.Email)),
			PhoneNumber:   req.PhoneNumber,
			EmailVerified: false,
			PhoneVerified: false,
			APIKey:        util.GenerateUniqueApiKey(db),
			OTPCode:       otp,
			OTPExpiry:     expiry,
		},
		IsVerified:         false,
		MustChangePassword: false, // Normal users don't need to change password on signup
	}

	if err := user.HashPassword(req.Password); err != nil {
		http.Error(w, "System error", http.StatusInternalServerError)
		return
	}

	if result := db.Create(&user); result.Error != nil {
		http.Error(w, "Failed to initiate registration", http.StatusInternalServerError)
		log.Printf("InitiateRegistration error: %v", result.Error)
		return
	}

	// MOCK SMS SENDING
	log.Printf("========== SMS PROVIDER MOCK ==========")
	log.Printf("To: %s", req.PhoneNumber)
	log.Printf("Message: Your Stadia Emerald verification code is: %s", otp)
	log.Printf("=======================================")

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Registration initiated. OTP sent to mobile."})
}

func VerifyRegistrationHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not supported", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Email       string `json:"email"`
		PhoneNumber string `json:"phoneNumber" validate:"required"`
		OTP         string `json:"otp" validate:"required,len=6"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Error decoding request body", http.StatusBadRequest)
		return
	}

	db := util.GetDB()
	var user models.User

	query := db
	if email := strings.ToLower(strings.TrimSpace(req.Email)); email != "" {
		query = query.Where("LOWER(email) = ?", email)
	} else {
		query = query.Where("phone_number = ?", req.PhoneNumber)
	}

	// Find the unverified user
	if err := query.First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	// Check if already verified
	if user.IsVerified {
		http.Error(w, "User is already verified", http.StatusConflict)
		return
	}

	// Validate OTP
	if user.OTPCode != req.OTP {
		http.Error(w, "Invalid OTP code", http.StatusUnauthorized)
		return
	}

	// Check expiry
	if time.Now().Unix() > user.OTPExpiry {
		http.Error(w, "OTP code has expired", http.StatusUnauthorized)
		return
	}

	// Verification Success
	// 1. Mark verified
	user.IsVerified = true
	user.PhoneVerified = true
	user.EmailVerified = true // Assuming email is verified synchronously for this spec
	
	// 2. Generate Referral Code
	user.ReferralCode = generateReferralCode()
	
	// 3. Award R250 instantly (25000 cents in integer math representation typically, but let's check InitialAccountBalance)
	appConfig, _ := setup.LoadEconomicsConfig()
	user.AccountBalance = appConfig.Economics.User.InitialAccountBalance
	if user.AccountBalance == 0 {
		// Fallback to R250 default
		user.AccountBalance = 25000 
		user.InitialAccountBalance = 25000 
	}

	// Clear OTP
	user.OTPCode = ""
	user.OTPExpiry = 0

	// Save updates
	if err := db.Save(&user).Error; err != nil {
		http.Error(w, "Failed to verify user", http.StatusInternalServerError)
		log.Printf("VerifyRegistration error: %v", err)
		return
	}

	tokenString, err := middleware.CreateTokenString(&user)
	if err != nil {
		http.Error(w, "Failed to create token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":            "User verified successfully.",
		"token":              tokenString,
		"username":           user.Username,
		"role":               user.Role,
		"usertype":           user.Role,
		"isVerified":         user.IsVerified,
		"mustChangePassword": user.MustChangePassword,
	})
}

const letterBytes = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
func generateReferralCode() string {
	b := make([]byte, 8)
	for i := range b {
		b[i] = letterBytes[rand.Intn(len(letterBytes))]
	}
	return string(b)
}
