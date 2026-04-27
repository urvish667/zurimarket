package marketshandlers

import (
	"encoding/json"
	"net/http"
	"socialpredict/errors"
	positionsmath "socialpredict/handlers/math/positions"
	"socialpredict/util"

	"github.com/gorilla/mux"
)

// MarketLeaderboardResponse defines the structure for paginated market leaderboard results
type MarketLeaderboardResponse struct {
	Leaderboard []positionsmath.UserProfitability `json:"leaderboard"`
	Pagination  util.Pagination                 `json:"pagination"`
}

// MarketLeaderboardHandler handles requests for market profitability leaderboards
func MarketLeaderboardHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	marketIdStr := vars["marketId"]

	// Set content type header early to ensure it's always set
	w.Header().Set("Content-Type", "application/json")

	// Open up database to utilize connection pooling
	db := util.GetDB()
	page, limit := util.GetPaginationParams(r)

	allLeaderboard, err := positionsmath.CalculateMarketLeaderboard(db, marketIdStr)
	if errors.HandleHTTPError(w, err, http.StatusBadRequest, "Invalid request or data processing error.") {
		return // Stop execution if there was an error.
	}

	totalRows := int64(len(allLeaderboard))
	offset := (page - 1) * limit

	var paginatedLeaderboard []positionsmath.UserProfitability
	if offset < int(totalRows) {
		end := offset + limit
		if end > int(totalRows) {
			end = int(totalRows)
		}
		paginatedLeaderboard = allLeaderboard[offset:end]
	} else {
		paginatedLeaderboard = []positionsmath.UserProfitability{}
	}

	response := MarketLeaderboardResponse{
		Leaderboard: paginatedLeaderboard,
		Pagination:  util.GetPaginationMetadata(totalRows, page, limit),
	}

	// Respond with the leaderboard information
	json.NewEncoder(w).Encode(response)
}
