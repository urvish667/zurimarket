package sellbetshandlers

import (
	"testing"
	"time"

	"socialpredict/models"
	"socialpredict/models/modelstesting"
)

// TestProcessSellRequest_BalanceCredited verifies that after a successful sell:
//  1. The user's account_balance is increased by the sale value in the DB.
//  2. A new Bet row with a negative Amount is persisted.
//
// This test exercises the db.Transaction wrapping in ProcessSellRequest — both writes
// must happen atomically or neither should.
func TestProcessSellRequest_BalanceCredited(t *testing.T) {
	db := modelstesting.NewFakeDB(t)
	cfg := modelstesting.GenerateEconomicConfig()

	startingBalance := int64(1000)
	user := modelstesting.GenerateUser("seller", startingBalance)
	market := modelstesting.GenerateMarket(1, "seller")

	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("create user: %v", err)
	}
	if err := db.Create(&market).Error; err != nil {
		t.Fatalf("create market: %v", err)
	}

	// Place a prior YES buy so the position calculator has shares to work with
	buyBet := modelstesting.GenerateBet(100, "YES", user.Username, 1, -time.Minute)
	if err := db.Create(&buyBet).Error; err != nil {
		t.Fatalf("create prior buy bet: %v", err)
	}
	// Reflect the buy cost in the DB balance
	db.Model(&models.User{}).Where("username = ?", user.Username).
		UpdateColumn("account_balance", startingBalance-buyBet.Amount)

	// Reload user struct to reflect DB state
	var dbUser models.User
	db.Where("username = ?", user.Username).First(&dbUser)
	balanceBeforeSell := dbUser.AccountBalance

	// Count bets before processing the sell
	var betCountBefore int64
	db.Model(&models.Bet{}).Where("username = ?", user.Username).Count(&betCountBefore)

	// Process the sell: request to sell 100 credits worth of YES shares
	redeemRequest := &models.Bet{
		MarketID: 1,
		Amount:   100,
		Outcome:  "YES",
	}
	err := ProcessSellRequest(db, redeemRequest, &dbUser, cfg)
	if err != nil {
		t.Fatalf("ProcessSellRequest returned unexpected error: %v", err)
	}

	// Verify balance increased
	var updatedUser models.User
	db.Where("username = ?", user.Username).First(&updatedUser)
	if updatedUser.AccountBalance <= balanceBeforeSell {
		t.Errorf("expected balance to increase after sell, before=%d after=%d",
			balanceBeforeSell, updatedUser.AccountBalance)
	}

	// Verify a new (negative-amount) bet record was created
	var betCountAfter int64
	db.Model(&models.Bet{}).Where("username = ?", user.Username).Count(&betCountAfter)
	if betCountAfter != betCountBefore+1 {
		t.Errorf("expected one new bet record, before=%d after=%d", betCountBefore, betCountAfter)
	}

	var saleBet models.Bet
	db.Where("username = ? AND amount < 0", user.Username).Last(&saleBet)
	if saleBet.Amount >= 0 {
		t.Errorf("expected sale bet to have negative amount, got %d", saleBet.Amount)
	}
}
