package marketshandlers

import (
	"encoding/json"
	"math"
	"net/http"
	"socialpredict/handlers/marketpublicresponse"
	marketmath "socialpredict/handlers/math/market"
	"socialpredict/handlers/math/probabilities/wpam"
	"socialpredict/handlers/tradingdata"
	"socialpredict/handlers/users/publicuser"
	"socialpredict/models"
	"socialpredict/setup"
	"socialpredict/util"
	"strconv"

	"github.com/gorilla/mux"
)

// MarketDetailResponse defines the structure for the market detail response
type MarketDetailHandlerResponse struct {
	Market              marketpublicresponse.PublicResponseMarket `json:"market"`
	Creator             models.PublicUser                         `json:"creator"`
	ProbabilityChanges  []wpam.ProbabilityChange                  `json:"probabilityChanges"`
	NumUsers            int                                       `json:"numUsers"`
	TotalVolume         int64                                     `json:"totalVolume"`
	MarketDust          int64                                     `json:"marketDust"`
	CommentCount        int64                                     `json:"commentCount"`
	OptionProbabilities map[string]float64                        `json:"optionProbabilities,omitempty"`
}

func MarketDetailsHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	marketIdOrSlug := vars["marketId"]

	db := util.GetDB()

	// Try numeric ID first, then slug
	var publicResponseMarket marketpublicresponse.PublicResponseMarket
	var err error
	var marketIDUint uint

	if _, parseErr := strconv.ParseUint(marketIdOrSlug, 10, 64); parseErr == nil {
		// It's a numeric ID
		marketIDUint64, _ := strconv.ParseUint(marketIdOrSlug, 10, 64)

		// 32-bit platform compatibility check
		const (
			bitsInByte                  = 8
			bytesInUint32               = 4
			rightShiftFor64BitDetection = 63
			baseBitWidth                = 32
		)
		maxUintValue := ^uint(0)
		platformBitWidth := baseBitWidth << (maxUintValue >> rightShiftFor64BitDetection)
		isPlatform32Bit := platformBitWidth == baseBitWidth

		if isPlatform32Bit && marketIDUint64 > math.MaxUint32 {
			http.Error(w, "Market ID out of range", http.StatusBadRequest)
			return
		}
		marketIDUint = uint(marketIDUint64)

		publicResponseMarket, err = marketpublicresponse.GetPublicResponseMarketByID(db, marketIdOrSlug)
	} else {
		// It's a slug
		publicResponseMarket, err = marketpublicresponse.GetPublicResponseMarketBySlug(db, marketIdOrSlug)
		if err == nil {
			marketIDUint = uint(publicResponseMarket.ID)
		}
	}

	if err != nil {
		http.Error(w, "Market not found", http.StatusNotFound)
		return
	}

	// Fetch all bets for the market
	bets := tradingdata.GetBetsForMarket(db, marketIDUint)

	// Build response based on outcome type
	response := MarketDetailHandlerResponse{
		Market:  publicResponseMarket,
		Creator: publicuser.GetPublicUserInfo(db, publicResponseMarket.CreatorUsername),
	}

	if publicResponseMarket.OutcomeType == models.OutcomeTypeMultipleChoice {
		// For multiple choice: calculate simple bet-share probabilities per option
		optionProbs := calculateMultipleChoiceProbabilities(bets, publicResponseMarket.Options)
		response.OptionProbabilities = optionProbs
		// Still calculate standard probability changes for chart compatibility
		if len(bets) > 0 {
			response.ProbabilityChanges = wpam.CalculateMarketProbabilitiesWPAM(publicResponseMarket.CreatedAt, bets)
		}
	} else {
		// Binary: use existing WPAM probability
		response.ProbabilityChanges = wpam.CalculateMarketProbabilitiesWPAM(publicResponseMarket.CreatedAt, bets)
	}

	response.NumUsers = models.GetNumMarketUsers(bets)
	response.TotalVolume = marketmath.GetMarketVolumeWithDust(bets)
	response.MarketDust = marketmath.GetMarketDust(bets)

	// Fetch comment count
	var commentCount int64
	db.Model(&models.Comment{}).Where("market_id = ?", marketIDUint).Count(&commentCount)
	response.CommentCount = commentCount

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// calculateMultipleChoiceProbabilities computes simple bet-share probabilities for MC markets.
// Each option's probability = (total amount bet on that option) / (total amount bet across all options).
func calculateMultipleChoiceProbabilities(bets []models.Bet, options []marketpublicresponse.PublicResponseMarketOption) map[string]float64 {
	result := make(map[string]float64)
	if len(options) == 0 {
		return result
	}

	appConfig, err := setup.LoadEconomicsConfig()
	initPool := 0.0
	if err == nil {
		initPool = float64(appConfig.Economics.MarketCreation.InitialMarketSubsidization)
	}

	optionAmounts := make(map[string]float64, len(options))
	for _, bet := range bets {
		optionAmounts[bet.Outcome] += float64(bet.Amount)
	}

	initProb := 1.0 / float64(len(options))
	outcomes := make([]wpam.OutcomeInput, 0, len(options))
	for _, opt := range options {
		outcomes = append(outcomes, wpam.OutcomeInput{
			Label:    opt.Label,
			InitProb: initProb,
			Wagered:  optionAmounts[opt.Label],
		})
	}

	for _, probability := range wpam.CalculateMultiOutcomeProbabilities(initPool, outcomes) {
		result[probability.Label] = probability.Probability
	}

	return result
}
