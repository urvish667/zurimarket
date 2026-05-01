package server

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"socialpredict/handlers"
	adminhandlers "socialpredict/handlers/admin"
	betshandlers "socialpredict/handlers/bets"
	buybetshandlers "socialpredict/handlers/bets/buying"
	sellbetshandlers "socialpredict/handlers/bets/selling"
	"socialpredict/handlers/cms/homepage"
	cmshomehttp "socialpredict/handlers/cms/homepage/http"
	marketshandlers "socialpredict/handlers/markets"
	metricshandlers "socialpredict/handlers/metrics"
	positions "socialpredict/handlers/positions"
	setuphandlers "socialpredict/handlers/setup"
	statshandlers "socialpredict/handlers/stats"
	usershandlers "socialpredict/handlers/users"
	commenthandlers "socialpredict/handlers/comments"
	usercredit "socialpredict/handlers/users/credit"
	privateuser "socialpredict/handlers/users/privateuser"
	"socialpredict/handlers/users/publicuser"
	"socialpredict/middleware"
	"socialpredict/security"
	"socialpredict/setup"
	"socialpredict/util"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

// CORS helpers configured via environment variables

// maxBodyBytes is the global request body size limit (4 MB).
const maxBodyBytes = 4 << 20 // 4 MB

// bodySizeMiddleware caps incoming request body size to prevent DoS via huge payloads.
func bodySizeMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, maxBodyBytes)
		next.ServeHTTP(w, r)
	})
}

// healthHandler pings the DB and returns 200 OK or 503 Service Unavailable.
func healthHandler(w http.ResponseWriter, r *http.Request) {
	db := util.GetDB()
	sqlDB, err := db.DB()
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(map[string]string{"status": "unhealthy", "reason": err.Error()})
		return
	}
	if err := sqlDB.Ping(); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(map[string]string{"status": "unhealthy", "reason": err.Error()})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// silence unused import if DB() isn't used elsewhere in the file
var _ = sql.ErrNoRows


func getListEnv(key, def string) []string { // default empty - allows any string, splits on comma
	val := strings.TrimSpace(os.Getenv(key))
	if val == "" {
		val = def
	}
	if val == "" {
		return nil
	}
	parts := strings.Split(val, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	return out
}

func getBoolEnv(key string, def bool) bool { // default false - allows any string to be false except specific true values
	v := strings.TrimSpace(strings.ToLower(os.Getenv(key)))
	if v == "" {
		return def
	}
	return v == "1" || v == "true" || v == "yes" || v == "on"
}

func getIntEnv(key string, def int) int { // default 0 - allows any string to be int, otherwise default
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return def
	}
	if n, err := strconv.Atoi(v); err == nil {
		return n
	}
	return def
}

func buildCORSFromEnv() *cors.Cors {
	if !getBoolEnv("CORS_ENABLED", true) {
		return nil
	}

	appEnv := os.Getenv("APP_ENV")
	domainURL := os.Getenv("DOMAIN_URL")

	// Default to DOMAIN_URL if origins is not set
	defaultOrigins := ""
	if domainURL != "" {
		defaultOrigins = domainURL
		// If it doesn't have a protocol, add https:// as a default for prod
		if !strings.HasPrefix(defaultOrigins, "http://") && !strings.HasPrefix(defaultOrigins, "https://") {
			defaultOrigins = "https://" + defaultOrigins
		}
	}

	origins := getListEnv("CORS_ALLOW_ORIGINS", defaultOrigins)

	// If still empty and in production, we should be cautious
	if len(origins) == 0 && appEnv == "production" {
		log.Printf("WARNING: CORS_ALLOW_ORIGINS not set in production. CORS might be too restrictive or default to wildcard depending on environment.")
	}

	methods := getListEnv("CORS_ALLOW_METHODS", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
	headers := getListEnv("CORS_ALLOW_HEADERS", "Content-Type,Authorization,X-Admin-Secret")
	expose := getListEnv("CORS_EXPOSE_HEADERS", "")
	allowCreds := getBoolEnv("CORS_ALLOW_CREDENTIALS", false)
	maxAge := getIntEnv("CORS_MAX_AGE", 600)

	return cors.New(cors.Options{
		AllowedOrigins:   origins,
		AllowedMethods:   methods,
		AllowedHeaders:   headers,
		ExposedHeaders:   expose,
		AllowCredentials: allowCreds,
		MaxAge:           maxAge,
	})
}

func Start() {
	// Initialize security service
	securityService := security.NewSecurityService()

	// CORS handler (configurable via env)
	c := buildCORSFromEnv()

	// Initialize mux router
	router := mux.NewRouter()

	// Define endpoint handlers using Gorilla Mux router
	// This defines all functions starting with /api/

	// Apply security middleware to all routes
	securityMiddleware := securityService.SecurityMiddleware()
	loginSecurityMiddleware := securityService.LoginSecurityMiddleware()
	protectedRoute := func(handler http.HandlerFunc) http.Handler {
		return securityMiddleware(middleware.RequireVerifiedUser(http.HandlerFunc(handler)))
	}
	adminRoute := func(handler http.HandlerFunc) http.Handler {
		return securityMiddleware(middleware.RequireAdminUser(http.HandlerFunc(handler)))
	}

	// Health check — no auth, no rate limit, always first
	router.HandleFunc("/v0/health", healthHandler).Methods("GET")

	router.HandleFunc("/v0/home", handlers.HomeHandler).Methods("GET")
	router.Handle("/v0/login", loginSecurityMiddleware(http.HandlerFunc(middleware.LoginHandler))).Methods("POST")
	
	// Public Registration



	router.Handle("/v0/register/initiate", loginSecurityMiddleware(http.HandlerFunc(usershandlers.InitiateRegistrationHandler))).Methods("POST")
	router.Handle("/v0/register/verify", loginSecurityMiddleware(http.HandlerFunc(usershandlers.VerifyRegistrationHandler))).Methods("POST")

	// application setup and stats information
	router.HandleFunc("/v0/setup", setuphandlers.GetSetupHandler(setup.LoadEconomicsConfig)).Methods("GET")
	router.HandleFunc("/v0/setup/frontend", setuphandlers.GetFrontendSetupHandler(setup.LoadEconomicsConfig)).Methods("GET")
	router.HandleFunc("/v0/stats", statshandlers.StatsHandler()).Methods("GET")
	router.Handle("/v0/system/metrics", protectedRoute(metricshandlers.GetSystemMetricsHandler)).Methods("GET")
	router.Handle("/v0/global/leaderboard", protectedRoute(metricshandlers.GetGlobalLeaderboardHandler)).Methods("GET")

	// markets display, market information
	router.HandleFunc("/v0/markets", marketshandlers.ListMarketsHandler).Methods("GET")
	router.HandleFunc("/v0/markets/search", marketshandlers.SearchMarketsHandler).Methods("GET")
	router.HandleFunc("/v0/markets/active", marketshandlers.ListActiveMarketsHandler).Methods("GET")
	router.HandleFunc("/v0/markets/closed", marketshandlers.ListClosedMarketsHandler).Methods("GET")
	router.HandleFunc("/v0/markets/resolved", marketshandlers.ListResolvedMarketsHandler).Methods("GET")
	router.HandleFunc("/v0/markets/{marketId}", marketshandlers.MarketDetailsHandler).Methods("GET")
	router.HandleFunc("/v0/marketprojection/{marketId}/{amount}/{outcome}/", marketshandlers.ProjectNewProbabilityHandler).Methods("GET")

	// handle market positions, get trades
	router.Handle("/v0/markets/bets/{marketId}", protectedRoute(betshandlers.MarketBetsDisplayHandler)).Methods("GET")
	router.Handle("/v0/markets/positions/{marketId}", protectedRoute(positions.MarketDBPMPositionsHandler)).Methods("GET")
	router.Handle("/v0/markets/positions/{marketId}/{username}", protectedRoute(positions.MarketDBPMUserPositionsHandler)).Methods("GET")
	router.HandleFunc("/v0/markets/leaderboard/{marketId}", marketshandlers.MarketLeaderboardHandler).Methods("GET")
	router.Handle("/v0/markets/{marketId}/comments", protectedRoute(commenthandlers.CreateCommentHandler)).Methods("POST")
	router.HandleFunc("/v0/markets/{marketId}/comments", commenthandlers.GetCommentsHandler).Methods("GET")

	// handle public user stuff

	// handle public user stuff
	router.Handle("/v0/userinfo/{username}", protectedRoute(publicuser.GetPublicUserResponse)).Methods("GET")
	router.Handle("/v0/usercredit/{username}", protectedRoute(usercredit.GetUserCreditHandler)).Methods("GET")
	router.Handle("/v0/portfolio/{username}", protectedRoute(publicuser.GetPortfolio)).Methods("GET")
	router.Handle("/v0/users/{username}/financial", protectedRoute(usershandlers.GetUserFinancialHandler)).Methods("GET")
	router.Handle("/v0/users/daily-login", protectedRoute(usershandlers.DailyLoginStreakHandler)).Methods("POST")

	// handle private user stuff, display sensitive profile information to customize
	router.Handle("/v0/privateprofile", protectedRoute(privateuser.GetPrivateProfileUserResponse)).Methods("GET")

	// changing profile stuff - apply security middleware
	router.Handle("/v0/changepassword", securityMiddleware(middleware.RequireVerifiedUser(http.HandlerFunc(usershandlers.ChangePassword)))).Methods("POST")
	router.Handle("/v0/profilechange/displayname", protectedRoute(usershandlers.ChangeDisplayName)).Methods("POST")
	router.Handle("/v0/profilechange/update", protectedRoute(usershandlers.UpdateProfile)).Methods("POST")

	// handle private user actions such as resolve a market, make a bet, create a market, change profile
	router.Handle("/v0/resolve/{marketId}", protectedRoute(marketshandlers.ResolveMarketHandler)).Methods("POST")
	router.Handle("/v0/bet", protectedRoute(buybetshandlers.PlaceBetHandler(setup.EconomicsConfig))).Methods("POST")
	router.Handle("/v0/userposition/{marketId}", protectedRoute(usershandlers.UserMarketPositionHandler)).Methods("GET")
	router.Handle("/v0/sell", protectedRoute(sellbetshandlers.SellPositionHandler(setup.EconomicsConfig))).Methods("POST")
	router.Handle("/v0/create", protectedRoute(marketshandlers.CreateMarketHandler(setup.EconomicsConfig))).Methods("POST")

	// admin stuff - apply security middleware
	router.Handle("/v0/admin/createuser", adminRoute(adminhandlers.AddUserHandler(setup.EconomicsConfig))).Methods("POST")

	// homepage content routes
	db := util.GetDB()
	homepageRepo := homepage.NewGormRepository(db)
	homepageRenderer := homepage.NewDefaultRenderer()
	homepageSvc := homepage.NewService(homepageRepo, homepageRenderer)
	homepageHandler := cmshomehttp.NewHandler(homepageSvc)

	router.HandleFunc("/v0/content/home", homepageHandler.PublicGet).Methods("GET")
	router.Handle("/v0/admin/content/home", adminRoute(homepageHandler.AdminUpdate)).Methods("PUT")

	// New Admin Dashboard Routes
	router.Handle("/v0/admin/users", adminRoute(adminhandlers.ListUsersHandler)).Methods("GET")
	router.Handle("/v0/admin/users/{username}", adminRoute(adminhandlers.GetUserDetailHandler)).Methods("GET")
	router.Handle("/v0/admin/users/{username}/role", adminRoute(adminhandlers.UpdateUserRoleHandler)).Methods("PUT")
	router.Handle("/v0/admin/users/{username}/ban", adminRoute(adminhandlers.UpdateUserBanHandler)).Methods("PUT")
	router.Handle("/v0/admin/markets", adminRoute(adminhandlers.ListMarketsHandler)).Methods("GET")
	router.Handle("/v0/admin/markets/{id}", adminRoute(adminhandlers.DeleteMarketHandler)).Methods("DELETE")
	router.Handle("/v0/admin/bets", adminRoute(adminhandlers.ListBetsHandler)).Methods("GET")
	router.Handle("/v0/admin/system/health", adminRoute(adminhandlers.ExtendedHealthHandler)).Methods("GET")
	router.Handle("/v0/admin/economics", adminRoute(adminhandlers.GetEconomicsHandler)).Methods("GET")
	router.Handle("/v0/admin/economics", adminRoute(adminhandlers.UpdateEconomicsHandler)).Methods("PUT")

	// Apply body size limit (outermost layer — before CORS and routing)
	// Apply CORS middleware if enabled
	handler := bodySizeMiddleware(http.Handler(router))
	if c != nil {
		handler = c.Handler(handler)
	}

	// Allow BACKEND_PORT to be configured via environment, default to 8080
	port := os.Getenv("BACKEND_PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting server on :%s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
	}
}
