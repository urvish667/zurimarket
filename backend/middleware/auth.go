package middleware

import (
	"net/http"
	"socialpredict/models"
	"socialpredict/util"
	"strings"

	"github.com/golang-jwt/jwt/v4"
	"gorm.io/gorm"
)

func Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		db := util.GetDB()
		if _, httpErr := ValidateTokenAndGetUser(r, db); httpErr != nil {
			http.Error(w, httpErr.Message, httpErr.StatusCode)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// ValidateUserAndEnforcePasswordChange performs user validation and checks if a password change is required.
// It returns the user and any errors encountered.
func ValidateUserAndEnforcePasswordChangeGetUser(r *http.Request, db *gorm.DB) (*models.User, *HTTPError) {
	user, httpErr := ValidateTokenAndGetUser(r, db)
	if httpErr != nil {
		return nil, httpErr
	}

	// Check if a password change is required
	if httpErr := CheckMustChangePasswordFlag(user); httpErr != nil {
		return nil, httpErr
	}

	return user, nil
}

// ValidateTokenAndGetUser checks that the user is who they claim to be, and returns their information for use
func ValidateTokenAndGetUser(r *http.Request, db *gorm.DB) (*models.User, *HTTPError) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return nil, &HTTPError{StatusCode: http.StatusUnauthorized, Message: "Authorization header is required"}
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	token, err := jwt.ParseWithClaims(tokenString, &UserClaims{}, func(token *jwt.Token) (interface{}, error) {
		return getJWTKey(), nil
	})
	if err != nil {
		return nil, &HTTPError{StatusCode: http.StatusUnauthorized, Message: "Invalid token"}
	}

	if claims, ok := token.Claims.(*UserClaims); ok && token.Valid {
		var user models.User
		result := db.Where("username = ?", claims.Username).First(&user)
		if result.Error != nil {
			return nil, &HTTPError{StatusCode: http.StatusNotFound, Message: "User not found"}
		}
		return &user, nil
	}
	return nil, &HTTPError{StatusCode: http.StatusUnauthorized, Message: "Invalid token"}
}

// CheckMustChangePasswordFlag checks if the user needs to change their password
func CheckMustChangePasswordFlag(user *models.User) *HTTPError {
	if user.MustChangePassword {
		return &HTTPError{
			StatusCode: http.StatusForbidden,
			Message:    "Password change required",
		}
	}
	return nil
}
