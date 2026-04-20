package payout

import (
	"errors"
	"fmt"
	"math"
	"socialpredict/handlers/math/probabilities/wpam"
	usersHandlers "socialpredict/handlers/users"
	"socialpredict/models"

	"gorm.io/gorm"
)

func DistributePayoutsWithRefund(market *models.Market, db *gorm.DB) error {
	if market == nil {
		return errors.New("market is nil")
	}

	switch market.ResolutionResult {
	case "N/A":
		return refundAllBets(market, db)
	case "YES", "NO":
		return calculateAndAllocateProportionalPayouts(market, db)
	case "PROB":
		return fmt.Errorf("probabilistic resolution is not yet supported")
	default:
		return fmt.Errorf("unsupported resolution result: %q", market.ResolutionResult)
	}
}

func calculateAndAllocateProportionalPayouts(market *models.Market, db *gorm.DB) error {
	var bets []models.Bet
	if err := db.Where("market_id = ?", market.ID).Find(&bets).Error; err != nil {
		return err
	}

	netPositions := aggregateNetPositions(bets)
	if len(netPositions) == 0 {
		return nil
	}

	switch market.OutcomeType {
	case models.OutcomeTypeMultipleChoice:
		return payoutMultipleChoiceMarket(netPositions, market.ResolutionResult, db)
	default:
		return payoutBinaryMarket(netPositions, market.ResolutionResult, db)
	}
}

func payoutBinaryMarket(netPositions map[string]map[string]float64, winningOutcome string, db *gorm.DB) error {
	totalYes := totalNetOutcome(netPositions, "YES")
	totalNo := totalNetOutcome(netPositions, "NO")

	if wpam.BinaryRefundAll(totalYes, totalNo, winningOutcome) {
		return refundNetPositions(netPositions, db)
	}

	multiplier := wpam.CalculateBinaryPayoutMultiplier(totalYes, totalNo, winningOutcome)
	for username, outcomes := range netPositions {
		stake := positiveStake(outcomes[winningOutcome])
		if stake == 0 {
			continue
		}

		payout := int64(math.Round(stake * multiplier))
		if payout > 0 {
			if err := usersHandlers.ApplyTransactionToUser(username, payout, db, usersHandlers.TransactionWin); err != nil {
				return err
			}
		}
	}
	return nil
}

func refundAllBets(market *models.Market, db *gorm.DB) error {
	// Retrieve all bets associated with the market
	var bets []models.Bet
	if err := db.Where("market_id = ?", market.ID).Find(&bets).Error; err != nil {
		return err
	}

	// Refund each bet to the user
	for _, bet := range bets {
		if err := usersHandlers.ApplyTransactionToUser(bet.Username, bet.Amount, db, usersHandlers.TransactionRefund); err != nil {
			return err
		}
	}

	return nil
}

func payoutMultipleChoiceMarket(netPositions map[string]map[string]float64, winningOutcome string, db *gorm.DB) error {
	winningPool := totalNetOutcome(netPositions, winningOutcome)
	losingPool := 0.0

	for _, outcomes := range netPositions {
		for outcome, stake := range outcomes {
			if outcome == winningOutcome {
				continue
			}
			losingPool += positiveStake(stake)
		}
	}

	if wpam.MultiOutcomeRefundAll(winningPool) {
		return refundNetPositions(netPositions, db)
	}

	multiplier := wpam.CalculateMultiOutcomePayoutMultiplier(winningPool, losingPool)
	for username, outcomes := range netPositions {
		stake := positiveStake(outcomes[winningOutcome])
		if stake == 0 {
			continue
		}

		payout := int64(math.Round(stake * multiplier))
		if payout > 0 {
			if err := usersHandlers.ApplyTransactionToUser(username, payout, db, usersHandlers.TransactionWin); err != nil {
				return err
			}
		}
	}

	return nil
}

func aggregateNetPositions(bets []models.Bet) map[string]map[string]float64 {
	netPositions := make(map[string]map[string]float64)
	for _, bet := range bets {
		if _, ok := netPositions[bet.Username]; !ok {
			netPositions[bet.Username] = make(map[string]float64)
		}
		netPositions[bet.Username][bet.Outcome] += float64(bet.Amount)
	}
	return netPositions
}

func totalNetOutcome(netPositions map[string]map[string]float64, outcome string) float64 {
	total := 0.0
	for _, outcomes := range netPositions {
		total += positiveStake(outcomes[outcome])
	}
	return total
}

func refundNetPositions(netPositions map[string]map[string]float64, db *gorm.DB) error {
	for username, outcomes := range netPositions {
		refund := int64(0)
		for _, stake := range outcomes {
			refund += int64(math.Round(positiveStake(stake)))
		}

		if refund > 0 {
			if err := usersHandlers.ApplyTransactionToUser(username, refund, db, usersHandlers.TransactionRefund); err != nil {
				return err
			}
		}
	}
	return nil
}

func positiveStake(stake float64) float64 {
	if stake <= 0 {
		return 0
	}
	return stake
}
