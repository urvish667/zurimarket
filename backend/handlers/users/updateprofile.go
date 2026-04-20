package usershandlers

import (
	"encoding/json"
	"net/http"
	"socialpredict/middleware"
	"socialpredict/util"
)

type UpdateProfileRequest struct {
	FullName      string `json:"fullName"`
	DateOfBirth   string `json:"dateOfBirth"`
	Gender        string `json:"gender"`
	StreetAddress string `json:"streetAddress"`
	Country       string `json:"country"`
	State         string `json:"state"`
	City          string `json:"city"`
	PostalCode    string `json:"postalCode"`
}

func UpdateProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method is not supported.", http.StatusMethodNotAllowed)
		return
	}

	db := util.GetDB()
	user, httperr := middleware.ValidateTokenAndGetUser(r, db)
	if httperr != nil {
		http.Error(w, "Invalid token: "+httperr.Error(), http.StatusUnauthorized)
		return
	}

	var req UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Simple validation
	if len(req.FullName) > 100 {
		http.Error(w, "Full name too long", http.StatusBadRequest)
		return
	}

	if req.DateOfBirth == "" {
		http.Error(w, "Date of birth is compulsory", http.StatusBadRequest)
		return
	}

	if util.CalculateAge(req.DateOfBirth) < 18 {
		http.Error(w, "Protocol restriction: You must be at least 18 years old to use ZuriMarket.", http.StatusBadRequest)
		return
	}

	// Update user fields
	user.FullName = req.FullName
	user.DateOfBirth = req.DateOfBirth
	user.Gender = req.Gender
	user.StreetAddress = req.StreetAddress
	user.Country = req.Country
	user.State = req.State
	user.City = req.City
	user.PostalCode = req.PostalCode

	if err := db.Save(&user).Error; err != nil {
		http.Error(w, "Failed to update profile: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(user)
}
