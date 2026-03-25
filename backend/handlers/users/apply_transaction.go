package usershandlers

import (
	"fmt"
	"socialpredict/models"

	"gorm.io/gorm"
)

const (
	TransactionWin    = "WIN"
	TransactionRefund = "REFUND"
	TransactionSale   = "SALE"
	TransactionBuy    = "BUY"
	TransactionFee    = "FEE"
)

// ApplyTransactionToUser atomically adjusts the user's balance for a given transaction type.
// It accepts either a real *gorm.DB or an in-progress transaction (*gorm.DB from db.Transaction),
// making it safe to call from within a wrapping transaction.
func ApplyTransactionToUser(username string, amount int64, db *gorm.DB, transactionType string) error {
	var delta int64
	switch transactionType {
	case TransactionWin, TransactionRefund, TransactionSale:
		delta = amount
	case TransactionBuy, TransactionFee:
		delta = -amount
	default:
		return fmt.Errorf("unknown transaction type: %s", transactionType)
	}

	result := db.Model(&models.User{}).
		Where("username = ?", username).
		UpdateColumn("account_balance", gorm.Expr("account_balance + ?", delta))

	if result.Error != nil {
		return fmt.Errorf("failed to update user balance: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("user not found: %s", username)
	}
	return nil
}
