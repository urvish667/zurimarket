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
	"socialpredict/security"
	"socialpredict/util"
	"strconv"
	"strings"

	"gorm.io/gorm"
)

// SearchMarketsResponse defines the structure for search results
type SearchMarketsResponse struct {
	PrimaryResults  []MarketOverview `json:"primaryResults"`
	FallbackResults []MarketOverview `json:"fallbackResults"`
	Query           string           `json:"query"`
	PrimaryStatus   string           `json:"primaryStatus"`
	Pagination      util.Pagination  `json:"pagination"`
	FallbackCount   int              `json:"fallbackCount"`
	TotalCount      int              `json:"totalCount"`
	FallbackUsed    bool             `json:"fallbackUsed"`
}

// SearchMarketsHandler handles HTTP requests for searching markets
func SearchMarketsHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("SearchMarketsHandler: Request received")
	if r.Method != http.MethodGet {
		http.Error(w, "Method is not supported.", http.StatusMethodNotAllowed)
		return
	}

	db := util.GetDB()

	// Get and validate query parameters
	query := r.URL.Query().Get("query")
	status := r.URL.Query().Get("status")
	page, limit := util.GetPaginationParams(r)

	// Validate and sanitize input
	if query == "" {
		http.Error(w, "Query parameter is required", http.StatusBadRequest)
		return
	}

	// Sanitize the search query
	sanitizer := security.NewSanitizer()
	sanitizedQuery, err := sanitizer.SanitizeMarketTitle(query)
	if err != nil {
		log.Printf("SearchMarketsHandler: Sanitization failed for query '%s': %v", query, err)
		http.Error(w, "Invalid search query: "+err.Error(), http.StatusBadRequest)
		return
	}
	if len(sanitizedQuery) > 100 {
		http.Error(w, "Query too long (max 100 characters)", http.StatusBadRequest)
		return
	}

	log.Printf("SearchMarketsHandler: Original query: '%s', Sanitized query: '%s'", query, sanitizedQuery)

	// Default values
	if status == "" {
		status = "all"
	}

	// Perform the search
	searchResponse, err := SearchMarkets(db, sanitizedQuery, status, page, limit)
	if err != nil {
		log.Printf("Error searching markets: %v", err)
		http.Error(w, "Error searching markets", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(searchResponse); err != nil {
		log.Printf("Error encoding search response: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

// SearchMarkets performs the actual search logic with fallback
func SearchMarkets(db *gorm.DB, query, status string, page, limit int) (*SearchMarketsResponse, error) {
	log.Printf("SearchMarkets: Searching for '%s' in status '%s', page %d, limit %d", query, status, page, limit)

	// Get the appropriate filter function for the primary search
	var primaryFilter MarketFilterFunc
	var statusName string

	switch status {
	case "active":
		primaryFilter = ActiveMarketsFilter
		statusName = "active"
	case "closed":
		primaryFilter = ClosedMarketsFilter
		statusName = "closed"
	case "resolved":
		primaryFilter = ResolvedMarketsFilter
		statusName = "resolved"
	default:
		primaryFilter = func(db *gorm.DB) *gorm.DB {
			return db // No status filter for "all"
		}
		statusName = "all"
	}

	// Search within the primary status using pagination
	searchTerm := "%" + strings.ToLower(query) + "%"
	baseQuery := primaryFilter(db).Where("LOWER(question_title) LIKE ? OR LOWER(description) LIKE ?", searchTerm, searchTerm)

	var primaryResults []models.Market
	totalRows, err := util.Paginate(baseQuery.Order("created_at DESC"), page, limit, &primaryResults)
	if err != nil {
		return nil, err
	}

	primaryOverviews, err := convertToMarketOverviews(db, primaryResults)
	if err != nil {
		return nil, err
	}

	response := &SearchMarketsResponse{
		PrimaryResults:  primaryOverviews,
		FallbackResults: []MarketOverview{},
		Query:           query,
		PrimaryStatus:   statusName,
		Pagination:      util.GetPaginationMetadata(totalRows, page, limit),
		FallbackCount:   0,
		TotalCount:      int(totalRows),
		FallbackUsed:    false,
	}

	// Fallback logic: only if we are on the first page, have few results, and not already searching "all"
	if page == 1 && len(primaryOverviews) <= 5 && status != "all" {
		log.Printf("SearchMarkets: Primary results ≤5 on page 1, searching all markets for fallback")

		// Search all markets for fallback
		searchTerm := "%" + strings.ToLower(query) + "%"
		var allResults []models.Market
		err := db.Where("LOWER(question_title) LIKE ? OR LOWER(description) LIKE ?", searchTerm, searchTerm).
			Order("created_at DESC").
			Limit(limit * 2).
			Find(&allResults).Error
		if err != nil {
			return nil, err
		}

		// Filter out markets that are already in primary results
		primaryIDs := make(map[int64]bool)
		for _, market := range primaryResults {
			primaryIDs[market.ID] = true
		}

		var fallbackResults []models.Market
		for _, market := range allResults {
			if !primaryIDs[market.ID] {
				fallbackResults = append(fallbackResults, market)
				if len(fallbackResults) >= limit {
					break
				}
			}
		}

		if len(fallbackResults) > 0 {
			fallbackOverviews, err := convertToMarketOverviews(db, fallbackResults)
			if err != nil {
				return nil, err
			}

			response.FallbackResults = fallbackOverviews
			response.FallbackCount = len(fallbackOverviews)
			response.TotalCount = response.TotalCount + response.FallbackCount
			response.FallbackUsed = true
		}
	}

	return response, nil
}


// convertToMarketOverviews converts market models to MarketOverview structs
func convertToMarketOverviews(db *gorm.DB, markets []models.Market) ([]MarketOverview, error) {
	var marketOverviews []MarketOverview

	for _, market := range markets {
		// Get market data similar to listmarketsbystatus.go
		bets := tradingdata.GetBetsForMarket(db, uint(market.ID))
		probabilityChanges := wpam.CalculateMarketProbabilitiesWPAM(market.CreatedAt, bets)
		numUsers := models.GetNumMarketUsers(bets)
		marketVolume := marketmath.GetMarketVolume(bets)
		lastProbability := probabilityChanges[len(probabilityChanges)-1].Probability

		creatorInfo := publicuser.GetPublicUserInfo(db, market.CreatorUsername)

		// Get public response market
		marketIDStr := strconv.FormatUint(uint64(market.ID), 10)
		publicResponseMarket, err := marketpublicresponse.GetPublicResponseMarketByID(db, marketIDStr)
		if err != nil {
			log.Printf("Error getting public response market for ID %s: %v", marketIDStr, err)
			continue // Skip this market instead of failing the entire request
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

	return marketOverviews, nil
}
