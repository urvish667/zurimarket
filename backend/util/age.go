package util

import (
	"time"
)

// CalculateAge calculates the age based on the provided date of birth string (YYYY-MM-DD)
func CalculateAge(dobString string) int {
	if dobString == "" {
		return 0
	}
	birthDate, err := time.Parse("2006-01-02", dobString)
	if err != nil {
		return 0
	}
	now := time.Now()
	age := now.Year() - birthDate.Year()
	
	// Adjust age if birthday hasn't occurred yet this year
	if now.Month() < birthDate.Month() || (now.Month() == birthDate.Month() && now.Day() < birthDate.Day()) {
		age--
	}
	
	return age
}
