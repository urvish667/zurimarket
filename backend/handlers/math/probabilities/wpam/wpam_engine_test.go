package wpam_test

import (
	"math"
	"socialpredict/handlers/math/probabilities/wpam"
	"testing"
)

func TestCalculateBinaryProbabilities(t *testing.T) {
	tests := []struct {
		name     string
		initProb float64
		initPool float64
		yes      float64
		no       float64
		wantYes  float64
		wantNo   float64
	}{
		{
			name:     "normal 65 35 split",
			initProb: 0.5,
			initPool: 2000,
			yes:      600,
			no:       200,
			wantYes:  0.5714285714285714,
			wantNo:   0.4285714285714286,
		},
		{
			name:     "all bets on one side",
			initProb: 0.5,
			initPool: 2000,
			yes:      1000,
			no:       0,
			wantYes:  0.6666666666666666,
			wantNo:   0.33333333333333337,
		},
		{
			name:     "zero bets placed returns initial probability",
			initProb: 0.65,
			initPool: 2000,
			yes:      0,
			no:       0,
			wantYes:  0.65,
			wantNo:   0.35,
		},
		{
			name:     "very large pool",
			initProb: 0.5,
			initPool: 2000,
			yes:      1200000,
			no:       800000,
			wantYes:  0.5999000999000999,
			wantNo:   0.40009990009990013,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			gotYes, gotNo := wpam.CalculateBinaryProbabilities(tc.initProb, tc.initPool, tc.yes, tc.no)
			assertFloatApprox(t, tc.wantYes, gotYes)
			assertFloatApprox(t, tc.wantNo, gotNo)
		})
	}
}

func TestCalculateBinaryPayoutMultiplier(t *testing.T) {
	multiplier := wpam.CalculateBinaryPayoutMultiplier(600, 400, "YES")
	assertFloatApprox(t, 1.6666666666666667, multiplier)

	if !wpam.BinaryRefundAll(0, 400, "YES") {
		t.Fatal("expected refund-all path when the winning side has no wagers")
	}
}

func TestCalculateMultiOutcomeProbabilities(t *testing.T) {
	tests := []struct {
		name     string
		initPool float64
		outcomes []wpam.OutcomeInput
		expected map[string]float64
	}{
		{
			name:     "three outcomes equal",
			initPool: 2000,
			outcomes: []wpam.OutcomeInput{
				{Label: "A", InitProb: 1.0 / 3.0, Wagered: 0},
				{Label: "B", InitProb: 1.0 / 3.0, Wagered: 0},
				{Label: "C", InitProb: 1.0 / 3.0, Wagered: 0},
			},
			expected: map[string]float64{"A": 1.0 / 3.0, "B": 1.0 / 3.0, "C": 1.0 / 3.0},
		},
		{
			name:     "five outcomes one dominant",
			initPool: 2000,
			outcomes: []wpam.OutcomeInput{
				{Label: "A", InitProb: 0.2, Wagered: 1000},
				{Label: "B", InitProb: 0.2, Wagered: 100},
				{Label: "C", InitProb: 0.2, Wagered: 100},
				{Label: "D", InitProb: 0.2, Wagered: 100},
				{Label: "E", InitProb: 0.2, Wagered: 100},
			},
			expected: map[string]float64{
				"A": 0.4117647058823529,
				"B": 0.14705882352941177,
				"C": 0.14705882352941177,
				"D": 0.14705882352941177,
				"E": 0.14705882352941177,
			},
		},
		{
			name:     "init probabilities normalize automatically",
			initPool: 2000,
			outcomes: []wpam.OutcomeInput{
				{Label: "A", InitProb: 0.5, Wagered: 0},
				{Label: "B", InitProb: 0.5, Wagered: 0},
				{Label: "C", InitProb: 0.5, Wagered: 0},
			},
			expected: map[string]float64{"A": 1.0 / 3.0, "B": 1.0 / 3.0, "C": 1.0 / 3.0},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			probabilities := wpam.CalculateMultiOutcomeProbabilities(tc.initPool, tc.outcomes)

			sum := 0.0
			for _, probability := range probabilities {
				want := tc.expected[probability.Label]
				assertFloatApprox(t, want, probability.Probability)
				sum += probability.Probability
			}

			assertFloatApprox(t, 1.0, sum)
		})
	}
}

func TestRankedPayoutMath(t *testing.T) {
	actual := []string{"C", "A", "B", "D"}

	t.Run("score ranking follows prompt example", func(t *testing.T) {
		score := wpam.ScoreRanking([]string{"A", "B", "C", "D"}, actual)
		assertFloatApprox(t, 22, score)
	})

	t.Run("perfect score pays 3x", func(t *testing.T) {
		score := wpam.ScoreRanking(actual, actual)
		assertFloatApprox(t, 40, score)
		assertFloatApprox(t, 300, wpam.RankedPayout(100, score, len(actual)))
	})

	t.Run("zero score pays zero", func(t *testing.T) {
		assertFloatApprox(t, 0, wpam.RankedPayout(100, 0, len(actual)))
	})

	t.Run("half score pays about 1x", func(t *testing.T) {
		assertFloatApprox(t, 100, wpam.RankedPayout(100, 20, len(actual)))
	})
}

func assertFloatApprox(t *testing.T, want, got float64) {
	t.Helper()
	if math.Abs(want-got) > 0.0001 {
		t.Fatalf("expected %.6f, got %.6f", want, got)
	}
}
