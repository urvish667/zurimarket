package metricshandlers

import (
	"encoding/json"
	"net/http"
	positionsmath "socialpredict/handlers/math/positions"
	"socialpredict/util"
)

// LeaderboardResponse defines the structure for paginated leaderboard results
type LeaderboardResponse struct {
	Leaderboard []positionsmath.GlobalUserProfitability `json:"leaderboard"`
	Pagination  util.Pagination                        `json:"pagination"`
}

func GetGlobalLeaderboardHandler(w http.ResponseWriter, r *http.Request) {
	db := util.GetDB()
	page, limit := util.GetPaginationParams(r)

	allLeaderboard, err := positionsmath.CalculateGlobalLeaderboard(db)
	if err != nil {
		http.Error(w, "failed to compute global leaderboard: "+err.Error(), http.StatusInternalServerError)
		return
	}

	totalRows := int64(len(allLeaderboard))
	offset := (page - 1) * limit
	
	var paginatedLeaderboard []positionsmath.GlobalUserProfitability
	if offset < int(totalRows) {
		end := offset + limit
		if end > int(totalRows) {
			end = int(totalRows)
		}
		paginatedLeaderboard = allLeaderboard[offset:end]
	} else {
		paginatedLeaderboard = []positionsmath.GlobalUserProfitability{}
	}

	response := LeaderboardResponse{
		Leaderboard: paginatedLeaderboard,
		Pagination:  util.GetPaginationMetadata(totalRows, page, limit),
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode leaderboard response: "+err.Error(), http.StatusInternalServerError)
	}
}
