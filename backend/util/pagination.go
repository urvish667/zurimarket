package util

import (
	"math"
	"net/http"
	"strconv"

	"gorm.io/gorm"
)

// Pagination represents the parameters and metadata for paginated requests
type Pagination struct {
	Limit      int         `json:"limit"`
	Page       int         `json:"page"`
	TotalRows  int64       `json:"totalRows"`
	TotalPages int         `json:"totalPages"`
	Rows       interface{} `json:"rows"`
}

// GetPaginationParams parses page and limit from the request query parameters
func GetPaginationParams(r *http.Request) (int, int) {
	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page <= 0 {
		page = 1
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 20 // Default limit
	}

	return page, limit
}

// Paginate applies limit and offset to a GORM query and returns the total count
func Paginate(db *gorm.DB, page, limit int, result interface{}) (int64, error) {
	var totalRows int64
	db.Model(result).Count(&totalRows)

	offset := (page - 1) * limit
	err := db.Limit(limit).Offset(offset).Find(result).Error
	if err != nil {
		return 0, err
	}

	return totalRows, nil
}

// GetPaginationMetadata constructs the pagination metadata object
func GetPaginationMetadata(totalRows int64, page, limit int) Pagination {
	totalPages := int(math.Ceil(float64(totalRows) / float64(limit)))
	return Pagination{
		Limit:      limit,
		Page:       page,
		TotalRows:  totalRows,
		TotalPages: totalPages,
	}
}
