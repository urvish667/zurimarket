package middleware

import (
	"context"
	"net/http"
	"os"
	"socialpredict/models"
	"socialpredict/util"
	"strings"

	"github.com/golang-jwt/jwt/v4"
	"gorm.io/gorm"
)

type contextKey string

const authenticatedUserKey contextKey = "authenticated-user"

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

func RequireVerifiedUser(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		db := util.GetDB()
		user, httpErr := ValidateVerifiedTokenAndGetUser(r, db)
		if httpErr != nil {
			http.Error(w, httpErr.Message, httpErr.StatusCode)
			return
		}

		if !isPasswordChangeAllowedPath(r.URL.Path) {
			if httpErr := CheckMustChangePasswordFlag(user); httpErr != nil {
				http.Error(w, httpErr.Message, httpErr.StatusCode)
				return
			}
		}

		ctx := context.WithValue(r.Context(), authenticatedUserKey, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func RequireAdminUser(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		db := util.GetDB()
		user, httpErr := ValidateVerifiedTokenAndGetUser(r, db)
		if httpErr != nil {
			http.Error(w, httpErr.Message, httpErr.StatusCode)
			return
		}

		if httpErr := CheckMustChangePasswordFlag(user); httpErr != nil {
			http.Error(w, httpErr.Message, httpErr.StatusCode)
			return
		}

		if !IsAdmin(user) {
			http.Error(w, "Admin access required", http.StatusForbidden)
			return
		}

		// Additional Secret Key check for extra security
		adminSecret := os.Getenv("ADMIN_SECRET_KEY")
		if adminSecret != "" {
			providedSecret := r.Header.Get("X-Admin-Secret")
			if providedSecret != adminSecret {
				http.Error(w, "Invalid admin secret key", http.StatusForbidden)
				return
			}
		}

		ctx := context.WithValue(r.Context(), authenticatedUserKey, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// ValidateUserAndEnforcePasswordChange performs user validation and checks if a password change is required.
// It returns the user and any errors encountered.
func ValidateUserAndEnforcePasswordChangeGetUser(r *http.Request, db *gorm.DB) (*models.User, *HTTPError) {
	user, httpErr := ValidateVerifiedTokenAndGetUser(r, db)
	if httpErr != nil {
		return nil, httpErr
	}

	// Check if a password change is required
	if httpErr := CheckMustChangePasswordFlag(user); httpErr != nil {
		return nil, httpErr
	}

	return user, nil
}

func ValidateVerifiedTokenAndGetUser(r *http.Request, db *gorm.DB) (*models.User, *HTTPError) {
	user, httpErr := ValidateTokenAndGetUser(r, db)
	if httpErr != nil {
		return nil, httpErr
	}

	if !user.IsVerified {
		return nil, &HTTPError{StatusCode: http.StatusForbidden, Message: "Account verification required"}
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
		if user.IsBanned {
			return nil, &HTTPError{StatusCode: http.StatusForbidden, Message: "User account is banned"}
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

func AuthenticatedUserFromContext(r *http.Request) *models.User {
	user, _ := r.Context().Value(authenticatedUserKey).(*models.User)
	return user
}

// GetUsernameFromJWT extracts the username from the authenticated user in request context.
// The user must have been set by RequireVerifiedUser or RequireAdminUser middleware.
func GetUsernameFromJWT(r *http.Request) (string, error) {
	user := AuthenticatedUserFromContext(r)
	if user == nil {
		return "", &HTTPError{StatusCode: http.StatusUnauthorized, Message: "no authenticated user in context"}
	}
	return user.Username, nil
}

func isPasswordChangeAllowedPath(path string) bool {
	return path == "/v0/changepassword" || path == "/v0/logout"
}
