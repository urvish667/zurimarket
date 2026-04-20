package usershandlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"socialpredict/middleware"
	"socialpredict/util"
	"time"

	"gorm.io/gorm"
)

func DailyLoginStreakHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not supported", http.StatusMethodNotAllowed)
		return
	}

	db := util.GetDB()
	user, httperr := middleware.ValidateUserAndEnforcePasswordChangeGetUser(r, db)
	if httperr != nil {
		http.Error(w, httperr.Error(), httperr.StatusCode)
		return
	}

	now := time.Now().UTC()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
	
	lastLogin := time.Unix(user.LastLoginDate, 0).UTC()
	lastLoginDay := time.Date(lastLogin.Year(), lastLogin.Month(), lastLogin.Day(), 0, 0, 0, 0, time.UTC)

	// Calculate difference in days
	diff := today.Sub(lastLoginDay).Hours() / 24

	var message string
	bonusAwarded := false

	err := db.Transaction(func(tx *gorm.DB) error {
		if diff >= 1 && diff < 2 {
			// Consecutive day
			user.CurrentStreak++
			if user.CurrentStreak == 7 {
				// Award 200 Coins bonus
				bonusAmount := int64(20000)
				user.AccountBalance += bonusAmount
				bonusAwarded = true
				message = fmt.Sprintf("7-day streak reached! 200 bonus coins awarded.")
				// Reset streak after bonus
				user.CurrentStreak = 0 
			} else {
				message = fmt.Sprintf("Streak continued! Day %d", user.CurrentStreak)
			}
		} else if diff >= 2 || user.LastLoginDate == 0 {
			// Streak broken or first record
			user.CurrentStreak = 1
			message = "New streak started!"
		} else {
			// Already logged in today
			message = "Already checked in today."
			return nil
		}

		user.LastLoginDate = now.Unix()
		return tx.Save(user).Error
	})

	if err != nil {
		http.Error(w, "Failed to update streak", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":       message,
		"currentStreak": user.CurrentStreak,
		"bonusAwarded":  bonusAwarded,
		"balance":       user.AccountBalance,
	})
}
