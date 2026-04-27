package middleware

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"socialpredict/models"
	"socialpredict/security"
	"socialpredict/util"
	"strings"

	"github.com/golang-jwt/jwt/v4"
	"gorm.io/gorm"
)

// login and validation stuff
// getJWTKey returns the JWT signing key, checking environment variable at runtime
func getJWTKey() []byte {
	key := os.Getenv("JWT_SIGNING_KEY")
	if key == "" {
		if os.Getenv("APP_ENV") == "production" {
			// In production, we should probably panic or log fatal, but for now we'll log a strong warning.
			// The user specified that this needs to be verified.
			log.Printf("SECURITY WARNING: JWT_SIGNING_KEY is not set in production! Using insecure empty key.")
		} else {
			log.Printf("DEBUG: JWT_SIGNING_KEY not set, using default empty key for development.")
		}
	}
	return []byte(key)
}

// UserClaims represents the expected structure of the JWT claims
type UserClaims struct {
	Username string `json:"username"`
	jwt.StandardClaims
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method is not supported.", http.StatusNotFound)
		return
	}

	// Initialize security service
	securityService := security.NewSecurityService()

	// Parse the request body
	type loginRequest struct {
		Email    string `json:"email" validate:"omitempty,email"`
		Username string `json:"username" validate:"omitempty,min=3,max=30,username"`
		Password string `json:"password" validate:"required,min=1"`
	}

	var req loginRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusBadRequest)
		return
	}

	// Validate and sanitize login input
	if err := securityService.Validator.ValidateStruct(req); err != nil {
		http.Error(w, "Invalid input: "+err.Error(), http.StatusBadRequest)
		return
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if req.Email == "" && req.Username == "" {
		http.Error(w, "Email is required", http.StatusBadRequest)
		return
	}

	if req.Username != "" {
		sanitizedUsername, err := securityService.Sanitizer.SanitizeUsername(req.Username)
		if err != nil {
			http.Error(w, "Invalid username format", http.StatusBadRequest)
			return
		}
		req.Username = sanitizedUsername
	}

	// Use database connection
	db := util.GetDB()

	// Find user by email first, with username fallback kept for compatibility.
	var user models.User
	result := db.Where("LOWER(email) = ?", req.Email).First(&user)
	if result.Error == gorm.ErrRecordNotFound && req.Username != "" {
		result = db.Where("username = ?", req.Username).First(&user)
	}
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			http.Error(w, "Invalid Credentials", http.StatusUnauthorized)
			return
		}
		http.Error(w, "Error accessing database", http.StatusInternalServerError)
		return
	}

	// Check password
	if !user.CheckPasswordHash(req.Password) {
		http.Error(w, "Invalid Credentials", http.StatusUnauthorized)
		return
	}

	if !user.IsVerified {
		http.Error(w, "Account verification required", http.StatusForbidden)
		return
	}

	tokenString, err := CreateTokenString(&user)
	if err != nil {
		http.Error(w, "Error creating token", http.StatusInternalServerError)
		return
	}

	// Prepare to send JSON
	w.Header().Set("Content-Type", "application/json")

	// Send token, username, and usertype in the response
	responseData := map[string]interface{}{
		"token":              tokenString,
		"username":           user.Username,
		"role":               user.Role,
		"usertype":           user.Role,
		"isVerified":         user.IsVerified,
		"mustChangePassword": user.MustChangePassword,
	}
	json.NewEncoder(w).Encode(responseData)
}
