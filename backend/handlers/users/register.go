package usershandlers

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"socialpredict/models"
	"socialpredict/security"
	"socialpredict/setup"
	"socialpredict/util"
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
		Username    string `json:"username" validate:"required,min=3,max=30,username"`
		Email       string `json:"email" validate:"required,email"`
		PhoneNumber string `json:"phoneNumber" validate:"required"`
		Password    string `json:"password" validate:"required,min=6"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Error decoding request body", http.StatusBadRequest)
		return
	}

	if err := securityService.Validator.ValidateStruct(req); err != nil {
		http.Error(w, "Invalid input: "+err.Error(), http.StatusBadRequest)
		return
	}

	sanitizedUsername, err := securityService.Sanitizer.SanitizeUsername(req.Username)
	if err != nil {
		http.Error(w, "Invalid username format", http.StatusBadRequest)
		return
	}
	req.Username = sanitizedUsername

	db := util.GetDB()

	// Check if user exists by username, email, or phone
	var count int64
	db.Model(&models.User{}).Where("username = ? OR email = ? OR phone_number = ?", req.Username, req.Email, req.PhoneNumber).Count(&count)
	if count > 0 {
		http.Error(w, "Username, email, or phone number already in use", http.StatusConflict)
		return
	}

	// Generate 6-digit OTP
	otp := fmt.Sprintf("%06d", rand.Intn(1000000))
	expiry := time.Now().Add(10 * time.Minute).Unix() // 10 minute expiry

	// Calculate initial account balance for display purposes later, though actual deposit is on verify
	appConfig, _ := setup.LoadEconomicsConfig()
	
	// Create Unverified User
	user := models.User{
		PublicUser: models.PublicUser{
			Username:              req.Username,
			DisplayName:           util.UniqueDisplayName(db),
			UserType:              "REGULAR",
			InitialAccountBalance: appConfig.Economics.User.InitialAccountBalance,
			AccountBalance:        0, // Awarded ONLY on verification
		},
		PrivateUser: models.PrivateUser{
			Email:         req.Email,
			PhoneNumber:   req.PhoneNumber,
			EmailVerified: false,
			PhoneVerified: false,
			APIKey:        util.GenerateUniqueApiKey(db),
			OTPCode:       otp,
			OTPExpiry:     expiry,
		},
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
		PhoneNumber string `json:"phoneNumber" validate:"required"`
		OTP         string `json:"otp" validate:"required,len=6"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Error decoding request body", http.StatusBadRequest)
		return
	}

	db := util.GetDB()
	var user models.User

	// Find the unverified user
	if err := db.Where("phone_number = ?", req.PhoneNumber).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	// Check if already verified
	if user.PhoneVerified {
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

	w.Header().Set("Content-Type", "application/json")
	// Instruct frontend to now login with stored credentials natively.
	json.NewEncoder(w).Encode(map[string]string{
		"message": "User verified successfully.",
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
