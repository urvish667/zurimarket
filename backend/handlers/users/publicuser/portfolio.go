package publicuser

import (
	"encoding/json"
	"log"
	"net/http"
	positionsmath "socialpredict/handlers/math/positions"
	"socialpredict/models"
	"socialpredict/util"
	"sort"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type PortfolioItem struct {
	MarketID       uint      `json:"marketId"`
	QuestionTitle  string    `json:"questionTitle"`
	YesSharesOwned int64     `json:"yesSharesOwned"`
	NoSharesOwned  int64     `json:"noSharesOwned"`
	LastBetPlaced  time.Time `json:"lastBetPlaced"`
}

type PortfolioTotal struct {
	PortfolioItems   []PortfolioItem `json:"portfolioItems"`
	TotalSharesOwned int64           `json:"totalSharesOwned"`
}

func GetPortfolio(w http.ResponseWriter, r *http.Request) {
	// Extract the username from the URL
	vars := mux.Vars(r)
	username := vars["username"]

	// Get pagination parameters
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page <= 0 {
		page = 1
	}
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit <= 0 {
		limit = 20
	}

	db := util.GetDB()

	// 1. Get unique market IDs where the user has placed bets, ordered by last bet date
	type MarketIDResult struct {
		MarketID      uint
		LastBetPlaced time.Time
	}
	var marketIDs []MarketIDResult

	// Use subquery to find last bet per market for the user
	query := db.Model(&models.Bet{}).
		Select("market_id, MAX(placed_at) as last_bet_placed").
		Where("username = ?", username).
		Group("market_id").
		Order("last_bet_placed DESC")

	// Count total unique markets for pagination
	var totalRows int64
	db.Model(&models.Bet{}).Where("username = ?", username).Distinct("market_id").Count(&totalRows)

	// Apply pagination to the unique markets
	offset := (page - 1) * limit
	err := query.Offset(offset).Limit(limit).Find(&marketIDs).Error
	if err != nil {
		log.Printf("Error fetching user market IDs: %v", err)
		http.Error(w, "Error fetching user market IDs", http.StatusInternalServerError)
		return
	}

	// 2. Create a market map for these specific market IDs
	marketMap := make(map[uint]PortfolioItem)
	for _, m := range marketIDs {
		marketMap[m.MarketID] = PortfolioItem{
			MarketID:      m.MarketID,
			LastBetPlaced: m.LastBetPlaced,
		}
	}

	// 3. Process only these markets to calculate positions and fetch market titles
	userPositionsPortfolio, err := processMarketMap(db, marketMap, username)
	if err != nil {
		log.Printf("Error processing market map: %v", err)
		http.Error(w, "Error processing market map", http.StatusInternalServerError)
		return
	}

	// 4. Calculate total shares owned across ALL markets (this might need a separate optimized query if we want to be strict)
	// For now, let's keep it simple or skip it if it's too expensive to calculate for all.
	// Actually, calculateTotalShares in the old code only counted for the returned items.
	// We'll calculate it for the paginated set for now, or fetch the total if needed.
	totalSharesOwned := calculateTotalShares(userPositionsPortfolio)

	totalPages := int(totalRows / int64(limit))
	if totalRows%int64(limit) != 0 {
		totalPages++
	}

	response := struct {
		PortfolioItems   []PortfolioItem `json:"portfolioItems"`
		TotalSharesOwned int64           `json:"totalSharesOwned"`
		Pagination       util.Pagination `json:"pagination"`
	}{
		PortfolioItems:   userPositionsPortfolio,
		TotalSharesOwned: totalSharesOwned,
		Pagination: util.Pagination{
			Page:       page,
			Limit:      limit,
			TotalRows:  totalRows,
			TotalPages: totalPages,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// fetchUserBets retrieves all bets made by a specific user
func fetchUserBets(db *gorm.DB, username string) ([]models.Bet, error) {
	var userbets []models.Bet
	// Retrieve all bets made by the user
	if err := db.Where("username = ?", username).Order("placed_at desc").Find(&userbets).Error; err != nil {
		return nil, err
	}

	return userbets, nil
}

// makeUserMarketMap creates a map of PortfolioItem from the user's bets
func makeUserMarketMap(userbets []models.Bet) map[uint]PortfolioItem {
	marketMap := make(map[uint]PortfolioItem)

	// Iterate over all bets
	for _, bet := range userbets {
		// Check if this market is already in our map
		item, exists := marketMap[bet.MarketID]
		if !exists {
			item = PortfolioItem{
				MarketID:      bet.MarketID,
				LastBetPlaced: bet.PlacedAt,
			}
		}

		// Update the last bet placed time if this bet is more recent
		if bet.PlacedAt.After(item.LastBetPlaced) {
			item.LastBetPlaced = bet.PlacedAt
		}

		// Put the item back in the map
		marketMap[bet.MarketID] = item
	}

	return marketMap
}

func processMarketMap(db *gorm.DB, marketMap map[uint]PortfolioItem, username string) ([]PortfolioItem, error) {
	// Calculate market positions for each market
	for marketID := range marketMap {
		position, err := positionsmath.CalculateMarketPositionForUser_WPAM_DBPM(db, strconv.Itoa(int(marketID)), username)
		if err != nil {
			return nil, err
		}

		// Fetch market title
		var market models.Market
		if err := db.Where("id = ?", marketID).First(&market).Error; err != nil {
			return nil, err
		}

		// Update the market item with the calculated positions and market title
		item := marketMap[marketID]
		item.YesSharesOwned = position.YesSharesOwned
		item.NoSharesOwned = position.NoSharesOwned
		item.QuestionTitle = market.QuestionTitle
		marketMap[marketID] = item
	}

	// Convert map to slice
	var userportfolio []PortfolioItem
	for _, item := range marketMap {
		userportfolio = append(userportfolio, item)
	}

	// Sort the portfolio by LastBetPlaced in descending order
	sort.Slice(userportfolio, func(i, j int) bool {
		return userportfolio[i].LastBetPlaced.After(userportfolio[j].LastBetPlaced)
	})

	return userportfolio, nil
}

func calculateTotalShares(portfolio []PortfolioItem) int64 {
	var totalShares int64
	for _, item := range portfolio {
		totalShares += item.YesSharesOwned + item.NoSharesOwned
	}
	return totalShares
}
