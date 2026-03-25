# SocialPredict — Master Plan & Status

*Last updated: 2026-03-23*

---

## Current Tech Stack

| Layer | Technology |
|---|---|
| Backend | Go 1.25, Gorilla Mux, GORM |
| Database | PostgreSQL (Docker) |
| Frontend | React 18, Vite 7, Tailwind CSS 3 |
| Auth | JWT (golang-jwt/v4), bcrypt passwords |
| Infra | Docker, Nginx, Traefik |
| Hosting | Local / Self-hosted (Docker Compose) |

---

## What Exists Right Now

### Backend Features ✅
- [x] Admin-only user creation, login, JWT auth, password change flow
- [x] Public & private user profiles (emoji, bio, links)
- [x] Prediction markets: create, list (active/closed/resolved), search, detail
- [x] Betting: buy positions, sell positions (DBPM probability model)
- [x] Market resolution
- [x] Global & per-market leaderboards, portfolio view
- [x] Admin panel: create users, CMS homepage editor
- [x] System metrics & stats endpoints
- [x] In-memory rate limiting (login + general)
- [x] Security headers middleware (CSP, HSTS, etc.)
- [x] Input sanitization (Bluemonday) + validation (go-playground)
- [x] DB migrations system + seed data

### Frontend Features ✅
- [x] Sidebar layout (collapsible, mobile bottom bar)
- [x] Markets page: tabs (Active / Closed / Resolved / All), search
- [x] Market detail page
- [x] Profile page, user page, portfolio
- [x] Create market form
- [x] Login modal
- [x] Admin dashboard
- [x] Stats page, About page
- [x] CMS-driven homepage (Markdown rendered from backend)

---

## 🚨 PRIORITY 0 — Critical Production Bugs (Fix Before Anything Else)

> These are **silent data corruption and financial integrity bugs**. Users can lose money or gain infinite funds.

### A. Missing Database Transactions (Race Condition / "Infinite Money")

**Affected files:** [handlers/bets/buying/buypositionhandler.go](file:///d:/Data/Projects/socialpredict/backend/handlers/bets/buying/buypositionhandler.go), [handlers/markets/createmarket.go](file:///d:/Data/Projects/socialpredict/backend/handlers/markets/createmarket.go), `handlers/bets/selling/...`

**The Problem:** Every financial write is a sequence of un-transacted DB operations. If the second write fails, the first (balance deduction) is already committed, permanently destroying user funds. Worse, concurrent requests can all read the same stale balance, each pass the balance check, and each create bets — spending the same balance multiple times.

**The Fix:** Wrap each financial operation in a `db.Transaction(...)` and use atomic SQL `UPDATE ... WHERE balance >= cost` to prevent concurrent overwrites.

```go
// Replace the current 2-step pattern with a transaction:
err := db.Transaction(func(tx *gorm.DB) error {
    result := tx.Model(&models.User{}).
        Where("id = ? AND account_balance - ? >= ?", user.ID, totalCost, -maxDebt).
        UpdateColumn("account_balance", gorm.Expr("account_balance - ?", totalCost))
    if result.RowsAffected == 0 {
        return fmt.Errorf("insufficient funds or concurrent update conflict")
    }
    if err := tx.Create(&bet).Error; err != nil {
        return err // auto-rolls back the balance deduction
    }
    return nil
})
```

| Task | Status |
|---|---|
| Wrap [PlaceBetCore](file:///d:/Data/Projects/socialpredict/backend/handlers/bets/buying/buypositionhandler.go#44-83) in a DB transaction with atomic balance update | 🔲 Not started |
| Wrap [CreateMarketHandler](file:///d:/Data/Projects/socialpredict/backend/handlers/markets/createmarket.go#69-196) fee deduction in a DB transaction | 🔲 Not started |
| Wrap `SellPositionHandler` in a DB transaction | 🔲 Not started |
| Replace `db.Save(user)` everywhere with `db.Model().UpdateColumn(...)` (targeted field updates only) | 🔲 Not started |

---

## 🔴 PRIORITY 1 — Security Issues (Do These First After Transactions)

| # | Issue | Priority | Status |
|---|---|---|---|
| 1 | `User.Password` serialized to JSON (`omitempty`) | 🔴 Critical | ❌ Not fixed |
| 2 | JWT secret — verify it reads from env, not hardcoded | 🔴 Critical | ❌ Not verified |
| 3 | `POSTGRES_SSLMODE` defaults to `disable` | 🔴 Critical | ❌ Not fixed |
| 4 | CORS defaults to wildcard `*` | 🟠 High | ❌ Not fixed |
| 5 | Health endpoint exists but no structured liveness/readiness split | 🟡 Medium | ❌ Not added |

---

## Planned Work (Discussed & Agreed)

### 1. 👤 User Onboarding — Real-World Flow

**Current state:** Admin creates users manually via `POST /v0/admin/createuser`. There is no self-service registration.

**Real-World Goal:** Allow any visitor to sign up themselves, verify their email, and get started with starting funds.

#### Backend Tasks

| Task | Status |
|---|---|
| Add `POST /v0/register` public endpoint (no auth required) — accepts `username`, `email`, `password` | 🔲 Not started |
| Add `email_verified` boolean field to [User](file:///d:/Data/Projects/socialpredict/backend/models/user.go#8-15) model + migration | 🔲 Not started |
| On register: send email verification link (use AWS SES or Sendgrid) | 🔲 Not started |
| Add `GET /v0/verify-email?token=<token>` to flip `email_verified = true` | 🔲 Not started |
| Block unverified users from betting/creating markets (middleware check) | 🔲 Not started |
| Add `POST /v0/forgot-password` + `POST /v0/reset-password` flow | 🔲 Not started |
| Remove the forced [MustChangePassword](file:///d:/Data/Projects/socialpredict/backend/middleware/auth.go#66-76) flow for self-registered users (keep only for admin-created ones) | 🔲 Not started |
| Rate-limit the register endpoint (prevent spam account creation) | 🔲 Not started |

#### Frontend Tasks

| Task | Status |
|---|---|
| Registration page/modal: username, email, password fields | 🔲 Not started |
| "Check your email" confirmation screen post-register | 🔲 Not started |
| "Forgot Password" form | 🔲 Not started |
| Redirect unauthenticated users to Landing Page, not a blank screen | 🔲 Not started |

---

### 2. 🏛️ Market Creation — Real-World Governance

**Current state:** Any authenticated user with enough balance can create a market freely at `POST /v0/create`. There is no review, moderation, or category system.

**The challenge for production:** Without governance, markets will be:
- Poorly phrased (no objective resolution criteria)
- Duplicate/spam
- Based on unverifiable or illegal events

**Two valid approaches (pick one):**

| Approach | Best for | Tradeoffs |
|---|---|---|
| **A. Curated (Admin-approved)** | Premium brand, high quality | Slower market throughput, needs admin time |
| **B. Community moderation + reputation** | High volume, self-serve | Needs reputation system, more complex |

**Recommended for V1:** Curated approach with a submission queue.

#### Backend Tasks — Curated Market Flow

| Task | Status |
|---|---|
| Add `status` field to [Market](file:///d:/Data/Projects/socialpredict/backend/handlers/markets/createmarket.go#69-196) model: `pending`, `active`, `rejected`, `closed`, `resolved` | 🔲 Not started |
| `POST /v0/create` — saves market with `status = pending` instead of going live immediately | 🔲 Not started |
| Add `POST /v0/admin/markets/{marketId}/approve` endpoint | 🔲 Not started |
| Add `POST /v0/admin/markets/{marketId}/reject` endpoint (with reason) | 🔲 Not started |
| `GET /v0/markets/active` — only returns markets with `status = active` | 🔲 Not started |
| Add `category` field to [Market](file:///d:/Data/Projects/socialpredict/backend/handlers/markets/createmarket.go#69-196) model (e.g. Politics, Sports, Tech, Crypto) | 🔲 Not started |
| Add market category filter to list/search endpoints | 🔲 Not started |
| Notify market creator via email when market is approved or rejected | 🔲 Not started |

#### Frontend Tasks

| Task | Status |
|---|---|
| Update Create Market form: add category selector | 🔲 Not started |
| Show "Your market is pending review" after submission | 🔲 Not started |
| Admin dashboard: add "Pending Markets" queue with approve/reject buttons | 🔲 Not started |
| Add category filter tabs/chips on the Markets list page | 🔲 Not started |

---

### 3. 📈 Scalability & Reliability

**Current state:** Single Go process, in-memory rate limiter (resets on restart), no caching, no pagination.

| Task | Priority | Status |
|---|---|---|
| Add pagination (`?page=1&limit=20`) to all list endpoints (`/v0/markets`, `/v0/markets/active`, leaderboard) | 🟠 High | 🔲 Not started |
| Set PostgreSQL connection pool limits in `util/postgres.go` (`SetMaxOpenConns`, `SetMaxIdleConns`) | 🟠 High | 🔲 Not started |
| Add Redis for distributed rate limiting (replace in-memory) | 🟡 Medium | 🔲 Not started |
| Cache read-heavy routes (`/v0/stats`, `/v0/system/metrics`, `/v0/markets`) with Redis TTLs | 🟡 Medium | 🔲 Not started |
| Add structured logging (e.g. `log/slog` or `zap`) with request ID tracing | 🟡 Medium | 🔲 Not started |
| Add Prometheus metrics scraping endpoint (`/metrics`) | 🟡 Medium | 🔲 Not started |

---

### 4. 🎨 UI Redesign — Polymarket Style
**Goal:** Modern dark theme, market cards with animated probability bars, polished sidebar

| Task | Status |
|---|---|
| Update Tailwind color palette (richer dark, teal accent) | 🔲 Not started |
| Load Inter font via Google Fonts | 🔲 Not started |
| Animated probability bar on market cards (YES green / NO red) | 🔲 Not started |
| Sidebar redesign: teal accents, styled coin balance chip | 🔲 Not started |
| Market table row hover effects | 🔲 Not started |

---

### 5. 🏠 Landing Page (New Public Homepage)
**Goal:** Show landing page to unauthenticated visitors at `/`, logged-in users still see current home

| Task | Status |
|---|---|
| New `LandingPage.jsx` — Hero section + tagline | 🔲 Not started |
| Live markets strip (fetches real active markets from API) | 🔲 Not started |
| "How It Works" 3-step explainer | 🔲 Not started |
| Stats bar (total markets, users from `/v0/stats`) | 🔲 Not started |
| Landing page has NO sidebar (full-width layout) | 🔲 Not started |
| Update routing: `/` → Landing if logged out, Home if logged in | 🔲 Not started |

---

### 6. 💰 Crypto Payments — Coinbase Commerce
**Goal:** User buys in-app Coins with crypto (ETH/BTC/USDC); webhook credits their balance

| Task | Status |
|---|---|
| **Backend:** `GET /v0/payments/charge-link` — returns hosted payment URL | 🔲 Not started |
| **Backend:** `POST /v0/payments/webhook` — verifies signature, credits user balance atomically | 🔲 Not started |
| **Backend:** Register new routes in [server.go](file:///d:/Data/Projects/socialpredict/backend/server/server.go) | 🔲 Not started |
| **Backend:** Add `COINBASE_COMMERCE_API_KEY` + `COINBASE_COMMERCE_WEBHOOK_SECRET` env vars | 🔲 Not started |
| **Frontend:** `/credits` page — shows balance + "Buy Coins" button | 🔲 Not started |
| **Frontend:** Add "Buy Coins" link in sidebar for logged-in users | 🔲 Not started |
| **Frontend:** Add `/credits` route in `AppRoutes.jsx` | 🔲 Not started |

---

## Decisions Made

| Decision | Choice |
|---|---|
| In-app currency name | **Coins** (not "credits") |
| Crypto payment provider | **Coinbase Commerce** (easiest, no blockchain code) |
| Fiat payment (Stripe) | ⏸ Deferred — add after crypto flow is working |
| Redis / observability infra | ⏸ Deferred — add when user traffic demands it |
| Brand/app name | 🔲 Still deciding — "SocialPredict" is placeholder |
| Market creation model | **Curated V1** — admin approves markets before going public |
| User registration | **Self-service with email verification** — admin creation kept for ops |

---

## Order of Execution (Recommended)

```
Week 1:  🚨 Fix transaction + race condition bugs (PlaceBet, CreateMarket, Sell)
Week 1:  🔴 Fix 5 security issues (JWT secret, CORS, SSL, password JSON leak)
Week 2:  👤 Self-service registration + email verification flow
Week 2:  🏛️ Market creation queue + admin approval workflow + categories
Week 3:  🎨 UI redesign (Tailwind + market cards)
Week 3:  🏠 Landing page
Week 4:  💰 Coinbase Commerce backend + frontend
Week 4+: 📈 Pagination, DB pool limits, Redis cache/rate-limit, observability
```
