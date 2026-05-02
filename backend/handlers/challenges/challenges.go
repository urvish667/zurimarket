package challenges

import (
	"encoding/json"
	"net/http"
	"socialpredict/models"
	"socialpredict/util"

	"github.com/gorilla/mux"
)

// ListTiersHandler returns all active challenge tiers.
// GET /v0/challenges/tiers
func ListTiersHandler(w http.ResponseWriter, r *http.Request) {
	db := util.GetDB()

	var tiers []models.ChallengeTier
	if err := db.Where("is_active = ?", true).Order("sort_order ASC").Find(&tiers).Error; err != nil {
		http.Error(w, `{"error":"failed to fetch challenge tiers"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tiers)
}

// GetTierHandler returns a single challenge tier by slug.
// GET /v0/challenges/tiers/{slug}
func GetTierHandler(w http.ResponseWriter, r *http.Request) {
	db := util.GetDB()
	vars := mux.Vars(r)
	slug := vars["slug"]

	var tier models.ChallengeTier
	if err := db.Where("slug = ? AND is_active = ?", slug, true).First(&tier).Error; err != nil {
		http.Error(w, `{"error":"challenge tier not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tier)
}
