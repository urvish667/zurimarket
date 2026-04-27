package positions

import (
	"encoding/json"
	"net/http"
	"socialpredict/errors"
	positionsmath "socialpredict/handlers/math/positions"
	"socialpredict/util"

	"github.com/gorilla/mux"
)

// MarketPositionsResponse defines the structure for paginated market positions results
type MarketPositionsResponse struct {
	Positions  []positionsmath.MarketPosition `json:"positions"`
	Pagination util.Pagination                `json:"pagination"`
}

func MarketDBPMPositionsHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	marketIdStr := vars["marketId"]

	// open up database to utilize connection pooling
	db := util.GetDB()
	page, limit := util.GetPaginationParams(r)

	allPositions, err := positionsmath.CalculateMarketPositions_WPAM_DBPM(db, marketIdStr)
	if errors.HandleHTTPError(w, err, http.StatusBadRequest, "Invalid request or data processing error.") {
		return // Stop execution if there was an error.
	}

	// Filter out zero positions if needed (the calculation usually includes all users who ever bet)
	// For this specific view, we want users who currently hold something
	var activePositions []positionsmath.MarketPosition
	for _, pos := range allPositions {
		if pos.YesSharesOwned > 0 || pos.NoSharesOwned > 0 {
			activePositions = append(activePositions, pos)
		}
	}

	totalRows := int64(len(activePositions))
	offset := (page - 1) * limit

	var paginatedPositions []positionsmath.MarketPosition
	if offset < int(totalRows) {
		end := offset + limit
		if end > int(totalRows) {
			end = int(totalRows)
		}
		paginatedPositions = activePositions[offset:end]
	} else {
		paginatedPositions = []positionsmath.MarketPosition{}
	}

	response := MarketPositionsResponse{
		Positions:  paginatedPositions,
		Pagination: util.GetPaginationMetadata(totalRows, page, limit),
	}

	// Respond with the bets display information
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func MarketDBPMUserPositionsHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	marketIdStr := vars["marketId"]
	userNameStr := vars["username"]

	// open up database to utilize connection pooling
	db := util.GetDB()

	marketDBPMPositions, err := positionsmath.CalculateMarketPositionForUser_WPAM_DBPM(db, marketIdStr, userNameStr)
	if errors.HandleHTTPError(w, err, http.StatusBadRequest, "Invalid request or data processing error.") {
		return // Stop execution if there was an error.
	}

	// Respond with the bets display information
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(marketDBPMPositions)
}
