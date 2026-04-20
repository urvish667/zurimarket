package payout

import (
	"testing"

	"socialpredict/models"
	modelstesting "socialpredict/models/modelstesting"
)

func TestDistributePayoutsWithRefund_NARefund(t *testing.T) {
	db := modelstesting.NewFakeDB(t)
	market := modelstesting.GenerateMarket(1, "creator")
	market.ResolutionResult = "N/A"
	db.Create(&market)

	user := modelstesting.GenerateUser("refundbot", 0)
	db.Create(&user)

	bet := modelstesting.GenerateBet(50, "YES", "refundbot", uint(market.ID), 0)
	db.Create(&bet)

	err := DistributePayoutsWithRefund(&market, db)
	if err != nil {
		t.Fatalf("expected no error for N/A refund, got: %v", err)
	}

	// Verify the user received their refund
	var updatedUser models.User
	if err := db.First(&updatedUser, "username = ?", "refundbot").Error; err != nil {
		t.Fatalf("failed to fetch refundbot: %v", err)
	}

	expectedBalance := int64(50) // Should get the bet amount back
	if updatedUser.AccountBalance != expectedBalance {
		t.Errorf("refundbot balance = %d, want %d", updatedUser.AccountBalance, expectedBalance)
	}
}

func TestDistributePayoutsWithRefund_UnknownResolution(t *testing.T) {
	db := modelstesting.NewFakeDB(t)
	market := modelstesting.GenerateMarket(2, "creator")
	market.ResolutionResult = "MAYBE" // Invalid
	db.Create(&market)

	err := DistributePayoutsWithRefund(&market, db)
	if err == nil {
		t.Fatal("expected error for unknown resolution result")
	}
}

func TestCalculateAndAllocateProportionalPayouts_NoWinningShares(t *testing.T) {
	db := modelstesting.NewFakeDB(t)
	market := modelstesting.GenerateMarket(3, "creator")
	market.ResolutionResult = "YES"
	market.IsResolved = true
	db.Create(&market)

	// Create a user with a NO-side only bet (losing side)
	user := modelstesting.GenerateUser("loserbot", 0)
	db.Create(&user)

	bet := modelstesting.GenerateBet(100, "NO", "loserbot", uint(market.ID), 0)
	db.Create(&bet)

	err := calculateAndAllocateProportionalPayouts(&market, db)
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}

	var u models.User
	if err := db.First(&u, "username = ?", "loserbot").Error; err != nil {
		t.Fatalf("failed to fetch loserbot: %v", err)
	}

	expectedBalance := int64(100)
	if u.AccountBalance != expectedBalance {
		t.Errorf("loserbot balance = %d, want %d", u.AccountBalance, expectedBalance)
	}
}

func TestCalculateAndAllocateProportionalPayouts_SuccessfulPayout(t *testing.T) {
	db := modelstesting.NewFakeDB(t)
	market := modelstesting.GenerateMarket(4, "creator")
	market.ResolutionResult = "YES"
	market.IsResolved = true
	db.Create(&market)

	user := modelstesting.GenerateUser("winnerbot", 0)
	db.Create(&user)

	bet := modelstesting.GenerateBet(100, "YES", "winnerbot", uint(market.ID), 0)
	db.Create(&bet)

	err := calculateAndAllocateProportionalPayouts(&market, db)
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}

	var u models.User
	if err := db.First(&u, "username = ?", "winnerbot").Error; err != nil {
		t.Fatalf("failed to fetch winnerbot: %v", err)
	}

	// At resolution YES, winner gets full payout back from total volume
	expectedBalance := int64(100)
	if u.AccountBalance != expectedBalance {
		t.Errorf("winnerbot balance = %d, want %d", u.AccountBalance, expectedBalance)
	}
}

func TestCalculateAndAllocateProportionalPayouts_MultipleChoicePayout(t *testing.T) {
	db := modelstesting.NewFakeDB(t)
	market := modelstesting.GenerateMarket(5, "creator")
	market.OutcomeType = models.OutcomeTypeMultipleChoice
	market.ResolutionResult = "B"
	market.IsResolved = true
	db.Create(&market)

	winner := modelstesting.GenerateUser("choicewinner", 0)
	loser := modelstesting.GenerateUser("choiceloser", 0)
	db.Create(&winner)
	db.Create(&loser)

	db.Create(&models.Bet{Username: winner.Username, MarketID: uint(market.ID), Amount: 100, Outcome: "B"})
	db.Create(&models.Bet{Username: loser.Username, MarketID: uint(market.ID), Amount: 300, Outcome: "A"})

	err := calculateAndAllocateProportionalPayouts(&market, db)
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}

	var updatedWinner models.User
	if err := db.First(&updatedWinner, "username = ?", winner.Username).Error; err != nil {
		t.Fatalf("failed to fetch winner: %v", err)
	}

	if updatedWinner.AccountBalance != 400 {
		t.Errorf("winner balance = %d, want %d", updatedWinner.AccountBalance, 400)
	}
}
