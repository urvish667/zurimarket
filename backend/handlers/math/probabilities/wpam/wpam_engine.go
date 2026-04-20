package wpam

import (
	"math"
	"slices"
)

const (
	binaryOutcomeYes = "YES"
	binaryOutcomeNo  = "NO"
)

type OutcomeInput struct {
	Label    string
	InitProb float64
	Wagered  float64
}

type OutcomeProbability struct {
	Label        string  `json:"label"`
	Probability  float64 `json:"probability"`
	TotalWagered float64 `json:"totalWagered"`
}

func CalculateBinaryProbabilities(initProb, initPool, totalYesWagered, totalNoWagered float64) (float64, float64) {
	denominator := initPool + totalYesWagered + totalNoWagered
	if denominator == 0 {
		return clampProbability(initProb), clampProbability(1 - initProb)
	}

	pYes := (initProb*initPool + totalYesWagered) / denominator
	pYes = clampProbability(pYes)
	return pYes, clampProbability(1 - pYes)
}

func BinaryRefundAll(totalYesWagered, totalNoWagered float64, winningOutcome string) bool {
	switch winningOutcome {
	case binaryOutcomeYes:
		return totalYesWagered == 0
	case binaryOutcomeNo:
		return totalNoWagered == 0
	default:
		return false
	}
}

func CalculateBinaryPayoutMultiplier(totalYesWagered, totalNoWagered float64, winningOutcome string) float64 {
	if BinaryRefundAll(totalYesWagered, totalNoWagered, winningOutcome) {
		return 1.0
	}

	totalPool := totalYesWagered + totalNoWagered
	switch winningOutcome {
	case binaryOutcomeYes:
		if totalYesWagered == 0 {
			return 1.0
		}
		return totalPool / totalYesWagered
	case binaryOutcomeNo:
		if totalNoWagered == 0 {
			return 1.0
		}
		return totalPool / totalNoWagered
	default:
		return 0
	}
}

func NormalizeInitProbabilities(outcomes []OutcomeInput) []OutcomeInput {
	if len(outcomes) == 0 {
		return nil
	}

	normalized := make([]OutcomeInput, len(outcomes))
	copy(normalized, outcomes)

	total := 0.0
	for _, outcome := range normalized {
		if outcome.InitProb > 0 {
			total += outcome.InitProb
		}
	}

	if total == 0 {
		equal := 1.0 / float64(len(normalized))
		for i := range normalized {
			normalized[i].InitProb = equal
		}
		return normalized
	}

	for i := range normalized {
		normalized[i].InitProb = normalized[i].InitProb / total
	}

	return normalized
}

func CalculateMultiOutcomeProbabilities(initPool float64, outcomes []OutcomeInput) []OutcomeProbability {
	if len(outcomes) == 0 {
		return nil
	}

	normalizedInputs := NormalizeInitProbabilities(outcomes)
	sumAllWagered := 0.0
	for _, outcome := range normalizedInputs {
		sumAllWagered += outcome.Wagered
	}

	raw := make([]float64, len(normalizedInputs))
	sumRaw := 0.0
	for i, outcome := range normalizedInputs {
		denominator := initPool + sumAllWagered
		if denominator == 0 {
			raw[i] = outcome.InitProb
		} else {
			raw[i] = (outcome.InitProb*initPool + outcome.Wagered) / denominator
		}
		sumRaw += raw[i]
	}

	probabilities := make([]OutcomeProbability, len(normalizedInputs))
	for i, outcome := range normalizedInputs {
		probability := outcome.InitProb
		if sumRaw != 0 {
			probability = raw[i] / sumRaw
		}
		probabilities[i] = OutcomeProbability{
			Label:        outcome.Label,
			Probability:  clampProbability(probability),
			TotalWagered: outcome.Wagered,
		}
	}

	return probabilities
}

func MultiOutcomeRefundAll(winningPool float64) bool {
	return winningPool == 0
}

func CalculateMultiOutcomePayoutMultiplier(winningPool, losingPool float64) float64 {
	if MultiOutcomeRefundAll(winningPool) {
		return 1.0
	}
	return (losingPool + winningPool) / winningPool
}

func ScoreRanking(userRanking, actualRanking []string) float64 {
	score := 0.0
	for i, outcome := range actualRanking {
		userPos := slices.Index(userRanking, outcome)
		if userPos == -1 {
			continue
		}

		diff := absInt(userPos - i)
		switch diff {
		case 0:
			score += 10
		case 1:
			score += 5
		case 2:
			score += 2
		}
	}
	return score
}

func RankedPayout(stake, userScore float64, n int) float64 {
	if n <= 0 {
		return 0
	}

	maxScore := float64(n * 10)
	if userScore == maxScore {
		return stake * 3.0
	}

	ratio := userScore / maxScore
	return stake * ratio * 2.0
}

func clampProbability(probability float64) float64 {
	return math.Min(1, math.Max(0, probability))
}

func absInt(v int) int {
	if v < 0 {
		return -v
	}
	return v
}
