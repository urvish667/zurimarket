package usershandlers

import (
	"fmt"
	"socialpredict/models"

	challenges "socialpredict/handlers/challenges"

	"gorm.io/gorm"
)

const (
	TransactionWin    = "WIN"
	TransactionRefund = "REFUND"
	TransactionSale   = "SALE"
	TransactionBuy    = "BUY"
	TransactionFee    = "FEE"

	BalanceTypeVirtual = "virtual"
	BalanceTypeReal    = "real"
)

// ApplyTransactionToUser atomically adjusts the user's balance for a given transaction type.
// It accepts either a real *gorm.DB or an in-progress transaction (*gorm.DB from db.Transaction),
// making it safe to call from within a wrapping transaction.
func ApplyTransactionToUser(username string, amount int64, db *gorm.DB, transactionType string, balanceType string) error {
	var delta int64
	switch transactionType {
	case TransactionWin, TransactionRefund, TransactionSale:
		delta = amount
	case TransactionBuy, TransactionFee:
		delta = -amount
	default:
		return fmt.Errorf("unknown transaction type: %s", transactionType)
	}

	balanceColumn, err := balanceColumnForType(balanceType)
	if err != nil {
		return err
	}

	result := db.Model(&models.User{}).
		Where("username = ?", username).
		UpdateColumn(balanceColumn, gorm.Expr(balanceColumn+" + ?", delta))

	if result.Error != nil {
		return fmt.Errorf("failed to update user balance: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("user not found: %s", username)
	}

	// Update challenge tracking with the transaction PnL (for virtual balance only)
	if balanceType == BalanceTypeVirtual {
		challenges.AfterBetHook(db, username, delta)
	}

	return nil
}

func balanceColumnForType(balanceType string) (string, error) {
	switch balanceType {
	case BalanceTypeVirtual:
		return "virtual_balance", nil
	case BalanceTypeReal:
		return "real_balance", nil
	default:
		return "", fmt.Errorf("unknown balance type: %s", balanceType)
	}
}
