package betshandlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"socialpredict/handlers/math/probabilities/wpam"
	"socialpredict/models"
	"socialpredict/util"
	"sort"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type BetDisplayInfo struct {
	Username    string    `json:"username"`
	Outcome     string    `json:"outcome"`
	Amount      int64     `json:"amount"`
	Probability float64   `json:"probability"`
	PlacedAt    time.Time `json:"placedAt"`
}

// MarketBetsDisplayResponse defines the structure for paginated betting history
type MarketBetsDisplayResponse struct {
	Bets       []BetDisplayInfo `json:"bets"`
	Pagination util.Pagination  `json:"pagination"`
}

func MarketBetsDisplayHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	marketIdStr := vars["marketId"]

	// Convert marketId to uint
	parsedUint64, err := strconv.ParseUint(marketIdStr, 10, 32)
	if err != nil {
		http.Error(w, "Invalid market ID", http.StatusBadRequest)
		return
	}

	// Convert uint64 to uint safely.
	marketIDUint := uint(parsedUint64)

	// Database connection
	db := util.GetDB()
	page, limit := util.GetPaginationParams(r)

	// Fetch bets for the market with pagination
	var bets []models.Bet
	totalRows, err := util.Paginate(db.Where("market_id = ?", marketIDUint).Order("placed_at DESC"), page, limit, &bets)
	if err != nil {
		http.Error(w, "Error fetching bets", http.StatusInternalServerError)
		return
	}

	// feed in the time created
	var market models.Market
	result := db.Where("ID = ?", marketIdStr).First(&market)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "Market not found", http.StatusNotFound)
		} else {
			http.Error(w, "Error fetching market", http.StatusInternalServerError)
		}
		return
	}

	// Process bets and calculate market probability at the time of each bet
	betsDisplayInfo := processBetsForDisplay(market.CreatedAt, bets, db)

	response := MarketBetsDisplayResponse{
		Bets:       betsDisplayInfo,
		Pagination: util.GetPaginationMetadata(totalRows, page, limit),
	}

	// Respond with the bets display information
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func processBetsForDisplay(marketCreatedAtTime time.Time, bets []models.Bet, db *gorm.DB) []BetDisplayInfo {

	// Calculate probabilities using the fetched bets
	probabilityChanges := wpam.CalculateMarketProbabilitiesWPAM(marketCreatedAtTime, bets)

	var betsDisplayInfo []BetDisplayInfo

	// Iterate over each bet
	for _, bet := range bets {
		// Find the closest probability change that occurred before or at the time of the bet
		var matchedProbability float64 = probabilityChanges[0].Probability // Start with initial probability
		for _, probChange := range probabilityChanges {
			if probChange.Timestamp.After(bet.PlacedAt) {
				break
			}
			matchedProbability = probChange.Probability
		}

		// Append the bet and its matched probability to the slice
		betsDisplayInfo = append(betsDisplayInfo, BetDisplayInfo{
			Username:    bet.Username,
			Outcome:     bet.Outcome,
			Amount:      bet.Amount,
			Probability: matchedProbability,
			PlacedAt:    bet.PlacedAt,
		})
	}

	// Sort betsDisplayInfo by PlacedAt in ascending order (most recent on top)
	sort.Slice(betsDisplayInfo, func(i, j int) bool {
		return betsDisplayInfo[i].PlacedAt.Before(betsDisplayInfo[j].PlacedAt)
	})

	return betsDisplayInfo
}
