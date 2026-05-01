package commenthandlers

import (
	"encoding/json"
	"net/http"
	"socialpredict/middleware"
	"socialpredict/models"
	"socialpredict/util"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/microcosm-cc/bluemonday"
)

type CreateCommentRequest struct {
	Content   string `json:"content"`
	ReplyToID *int64 `json:"replyToId,omitempty"`
}

func CreateCommentHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	marketIdStr := vars["marketId"]
	marketId, err := strconv.ParseInt(marketIdStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid market ID", http.StatusBadRequest)
		return
	}

	var req CreateCommentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Sanitize content to prevent XSS
	p := bluemonday.UGCPolicy()
	sanitizedContent := p.Sanitize(req.Content)
	if sanitizedContent == "" {
		http.Error(w, "Comment content cannot be empty after sanitization", http.StatusBadRequest)
		return
	}

	user := middleware.AuthenticatedUserFromContext(r)
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	username := user.Username
	db := util.GetDB()

	// Security: Validate ReplyToID if present
	if req.ReplyToID != nil {
		var parentComment models.Comment
		if err := db.Where("id = ? AND market_id = ?", req.ReplyToID, marketId).First(&parentComment).Error; err != nil {
			http.Error(w, "Parent comment not found or belongs to a different market", http.StatusBadRequest)
			return
		}
		// Optional: Enforce only one level of nesting (Root -> Reply)
		// If the parent comment itself is a reply, we point to the parent's parent (root) or reject it.
		// For simplicity, we'll allow replying to any comment but the UI will likely display them in a flat way under the root.
		// If we want STRICT 1-level, we could check:
		// if parentComment.ReplyToID != nil { req.ReplyToID = parentComment.ReplyToID }
	}

	comment := models.Comment{
		MarketID:  marketId,
		Username:  username,
		Content:   sanitizedContent,
		ReplyToID: req.ReplyToID,
	}

	if err := db.Create(&comment).Error; err != nil {
		http.Error(w, "Failed to create comment", http.StatusInternalServerError)
		return
	}

	// Preload user for the response
	db.Preload("User").First(&comment, comment.ID)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(comment)
}

func GetCommentsHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	marketIdStr := vars["marketId"]
	marketId, err := strconv.ParseInt(marketIdStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid market ID", http.StatusBadRequest)
		return
	}

	page, limit := util.GetPaginationParams(r)
	db := util.GetDB()

	var rootComments []models.Comment
	// We paginate the root comments (where reply_to_id is NULL)
	query := db.Where("market_id = ? AND reply_to_id IS NULL", marketId).
		Order("created_at DESC")

	var totalRows int64
	query.Model(&models.Comment{}).Count(&totalRows)

	offset := (page - 1) * limit
	err = query.Limit(limit).Offset(offset).
		Preload("User").
		Preload("Replies").
		Preload("Replies.User").
		Find(&rootComments).Error

	if err != nil {
		http.Error(w, "Failed to fetch comments", http.StatusInternalServerError)
		return
	}

	pagination := util.GetPaginationMetadata(totalRows, page, limit)
	pagination.Rows = rootComments

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(pagination)
}
