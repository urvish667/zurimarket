package marketshandlers

import (
	"encoding/json"
	"log"
	"net/http"
	"socialpredict/handlers/marketpublicresponse"
	marketmath "socialpredict/handlers/math/market"
	"socialpredict/handlers/math/probabilities/wpam"
	"socialpredict/handlers/tradingdata"
	"socialpredict/handlers/users/publicuser"
	"socialpredict/models"
	"socialpredict/util"
	"strconv"
	"time"

	"gorm.io/gorm"
)

// ListMarketsStatusResponse defines the structure for filtered market responses
type ListMarketsStatusResponse struct {
	Markets    []MarketOverview `json:"markets"`
	Status     string           `json:"status"`
	Pagination util.Pagination  `json:"pagination"`
}

// MarketFilterFunc defines the filtering logic for markets
type MarketFilterFunc func(*gorm.DB) *gorm.DB

// ListMarketsByStatusHandler creates a handler for listing markets by status using polymorphic filtering
func ListMarketsByStatusHandler(filterFunc MarketFilterFunc, statusName string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Printf("ListMarketsByStatusHandler: Request received for status: %s", statusName)
		if r.Method != http.MethodGet {
			http.Error(w, "Method is not supported.", http.StatusMethodNotAllowed)
			return
		}

		page, limit := util.GetPaginationParams(r)
		db := util.GetDB()

		var markets []models.Market
		totalRows, err := util.Paginate(filterFunc(db).Order("created_at DESC"), page, limit, &markets)
		if err != nil {
			log.Printf("Error fetching markets for status %s: %v", statusName, err)
			http.Error(w, "Error fetching markets", http.StatusInternalServerError)
			return
		}

		var marketOverviews []MarketOverview
		for _, market := range markets {
			bets := tradingdata.GetBetsForMarket(db, uint(market.ID))
			
			// Handle case with no bets for probability calculation
			lastProbability := 0.5 // Default
			if len(bets) > 0 {
				probabilityChanges := wpam.CalculateMarketProbabilitiesWPAM(market.CreatedAt, bets)
				if len(probabilityChanges) > 0 {
					lastProbability = probabilityChanges[len(probabilityChanges)-1].Probability
				}
			}

			numUsers := models.GetNumMarketUsers(bets)
			marketVolume := marketmath.GetMarketVolume(bets)

			creatorInfo := publicuser.GetPublicUserInfo(db, market.CreatorUsername)

			// Return the PublicResponse type with information about the market
			marketIDStr := strconv.FormatUint(uint64(market.ID), 10)
			publicResponseMarket, err := marketpublicresponse.GetPublicResponseMarketByID(db, marketIDStr)
			if err != nil {
				log.Printf("Error getting public response market for ID %s: %v", marketIDStr, err)
				http.Error(w, "Invalid market ID", http.StatusBadRequest)
				return
			}

			marketOverview := MarketOverview{
				Market:          publicResponseMarket,
				Creator:         creatorInfo,
				LastProbability: lastProbability,
				NumUsers:        numUsers,
				TotalVolume:     marketVolume,
			}
			marketOverviews = append(marketOverviews, marketOverview)
		}

		response := ListMarketsStatusResponse{
			Markets:    marketOverviews,
			Status:     statusName,
			Pagination: util.GetPaginationMetadata(totalRows, page, limit),
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(response); err != nil {
			log.Printf("Error encoding response for status %s: %v", statusName, err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	}
}

// ActiveMarketsFilter returns markets that are not resolved and have not yet reached their resolution date
func ActiveMarketsFilter(db *gorm.DB) *gorm.DB {
	now := time.Now()
	return db.Where("is_resolved = ? AND resolution_date_time > ?", false, now)
}

// ClosedMarketsFilter returns markets that are not resolved but have passed their resolution date
func ClosedMarketsFilter(db *gorm.DB) *gorm.DB {
	now := time.Now()
	return db.Where("is_resolved = ? AND resolution_date_time <= ?", false, now)
}

// ResolvedMarketsFilter returns markets that have been resolved
func ResolvedMarketsFilter(db *gorm.DB) *gorm.DB {
	return db.Where("is_resolved = ?", true)
}

// ListActiveMarketsHandler handles HTTP requests for active markets
func ListActiveMarketsHandler(w http.ResponseWriter, r *http.Request) {
	handler := ListMarketsByStatusHandler(ActiveMarketsFilter, "active")
	handler(w, r)
}

// ListClosedMarketsHandler handles HTTP requests for closed markets
func ListClosedMarketsHandler(w http.ResponseWriter, r *http.Request) {
	handler := ListMarketsByStatusHandler(ClosedMarketsFilter, "closed")
	handler(w, r)
}

// ListResolvedMarketsHandler handles HTTP requests for resolved markets
func ListResolvedMarketsHandler(w http.ResponseWriter, r *http.Request) {
	handler := ListMarketsByStatusHandler(ResolvedMarketsFilter, "resolved")
	handler(w, r)
}
