PredictMarket SA

Backend & Math Engine

Master Implementation Prompt

1. Project Context & Constraints

You are implementing the Go backend for PredictMarket SA — a South African free-to-play prediction market platform where users earn virtual credits, pass skill-based prop-firm challenges, and can withdraw real money. The React frontend UI is already built and waiting for API endpoints. Your job is backend only: REST API, math engines, database schema, WebSocket hub, cron jobs, and payment integrations.

What already exists (fork from SocialPredict): Binary market creation and resolution, bet placement handler, basic WPAM probability math, JWT auth middleware, PostgreSQL + GORM setup, Docker Compose, admin event management, basic user model. These are your starting point — do not rewrite from scratch.

What you must build: Everything described in this document that is not listed above.

2. Database Schema

Use PostgreSQL 15. All UUIDs via gen_random_uuid(). All timestamps as TIMESTAMPTZ. Use GORM models with explicit table names. Run migrations via golang-migrate. Never use auto-migrate in production.

2.1 Extend: users table

Add the following columns to the existing users table:

mobile_number      VARCHAR(15) UNIQUE NOT NULL

mobile_verified    BOOLEAN DEFAULT FALSE

email              VARCHAR(255) UNIQUE

level              VARCHAR(20) DEFAULT 'Rookie'

CHECK (level IN ('Rookie','Prospect','AllStar','Legend'))

referral_code      VARCHAR(12) UNIQUE NOT NULL

referred_by        UUID REFERENCES users(id)

streak_count       INT DEFAULT 0

last_login_date    DATE

kyc_status         VARCHAR(20) DEFAULT 'unverified'

CHECK (kyc_status IN ('unverified','pending','verified','rejected'))

bank_account       JSONB

2.2 Extend: markets table

Add to the existing markets table:

market_type   VARCHAR(20) DEFAULT 'binary'

CHECK (market_type IN ('binary','multiple_choice','ranked'))

category      VARCHAR(30)

CHECK (category IN ('Sports','Entertainment','Politics',

'Crypto','PopCulture','UserCreated'))

creator_id    UUID REFERENCES users(id)

creation_tier VARCHAR(10) CHECK (creation_tier IN ('Micro','Macro','Mega'))

fee_paid      BOOLEAN DEFAULT FALSE

featured      BOOLEAN DEFAULT FALSE

closes_at     TIMESTAMPTZ NOT NULL

2.3 New: market_outcomes

CREATE TABLE market_outcomes (

id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),

market_id      UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,

label          VARCHAR(200) NOT NULL,

init_prob      FLOAT NOT NULL DEFAULT 0.5,

total_wagered  FLOAT NOT NULL DEFAULT 0,

probability    FLOAT NOT NULL DEFAULT 0.5,

is_winner      BOOLEAN,

display_order  INT NOT NULL DEFAULT 0,

created_at     TIMESTAMPTZ DEFAULT NOW()

);

2.4 New: credit_ledger

This is the single source of truth for all virtual credit movements. Balance is always computed as SUM — never stored as a mutable field on the user row to prevent race conditions.

CREATE TABLE credit_ledger (

id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

user_id         UUID NOT NULL REFERENCES users(id),

amount          FLOAT NOT NULL,  -- positive = credit, negative = debit

tx_type         VARCHAR(30) NOT NULL

CHECK (tx_type IN (

'signup_bonus','daily_login','streak_bonus',

'referral_earned','ad_reward','ad_streak_bonus',

'bet_placed','bet_won','bet_refund',

'challenge_grant','challenge_fee_debit',

'challenge_reset','withdrawal_debit')),

ref_id          UUID,  -- points to bet_id, challenge_id, etc.

description     TEXT,

idempotency_key VARCHAR(100) UNIQUE,  -- prevents duplicate grants

created_at      TIMESTAMPTZ DEFAULT NOW()

);

CREATE INDEX idx_ledger_user ON credit_ledger(user_id, created_at DESC);

2.5 New: challenge_enrollments

CREATE TABLE challenge_enrollments (

id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

user_id             UUID NOT NULL REFERENCES users(id),

level               VARCHAR(20) NOT NULL

CHECK (level IN ('Rookie','Prospect','AllStar','Legend')),

status              VARCHAR(20) DEFAULT 'active'

CHECK (status IN ('active','passed','failed','abandoned')),

start_balance       FLOAT NOT NULL,

target_balance      FLOAT NOT NULL,

current_balance     FLOAT NOT NULL,

fee_paid_amount     FLOAT NOT NULL DEFAULT 0,

payfast_ref         VARCHAR(100),

start_date          DATE NOT NULL,

end_date            DATE NOT NULL,

max_losing_days     INT NOT NULL,

max_daily_loss_pct  FLOAT NOT NULL DEFAULT 0.10,

losing_days_count   INT DEFAULT 0,

daily_open_balance  FLOAT,  -- set at midnight each day by cron

created_at          TIMESTAMPTZ DEFAULT NOW(),

updated_at          TIMESTAMPTZ DEFAULT NOW()

);

2.6 New: challenge_daily_snapshots

CREATE TABLE challenge_daily_snapshots (

id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),

enrollment_id    UUID NOT NULL REFERENCES challenge_enrollments(id),

snapshot_date    DATE NOT NULL,

open_balance     FLOAT NOT NULL,

close_balance    FLOAT NOT NULL,

is_losing_day    BOOLEAN DEFAULT FALSE,

daily_loss_pct   FLOAT,

created_at       TIMESTAMPTZ DEFAULT NOW(),

UNIQUE(enrollment_id, snapshot_date)

);

2.7 New: withdrawal_requests

CREATE TABLE withdrawal_requests (

id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

user_id         UUID NOT NULL REFERENCES users(id),

amount_real     FLOAT NOT NULL,

status          VARCHAR(20) DEFAULT 'pending'

CHECK (status IN ('pending','approved','rejected','paid')),

enrollment_id   UUID REFERENCES challenge_enrollments(id),

bank_snapshot   JSONB NOT NULL,

admin_note      TEXT,

payfast_ref     VARCHAR(100),

reviewed_by     UUID REFERENCES users(id),

reviewed_at     TIMESTAMPTZ,

created_at      TIMESTAMPTZ DEFAULT NOW()

);

2.8 New: wager_limits

CREATE TABLE wager_limits (

level              VARCHAR(20) PRIMARY KEY,

max_single_wager   FLOAT NOT NULL,

max_daily_wager    FLOAT NOT NULL

);

INSERT INTO wager_limits VALUES

('Rookie',   500,   2000),

('Prospect', 1000,  5000),

('AllStar',  2500,  10000),

('Legend',   5000,  25000);

2.9 New: otp_requests

CREATE TABLE otp_requests (

id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),

mobile       VARCHAR(15) NOT NULL,

otp_hash     VARCHAR(64) NOT NULL,

purpose      VARCHAR(20) CHECK (purpose IN ('signup','login','reset')),

attempts     INT DEFAULT 0,

expires_at   TIMESTAMPTZ NOT NULL,

used         BOOLEAN DEFAULT FALSE,

created_at   TIMESTAMPTZ DEFAULT NOW()

);

3. Market Math Engine

This is the most critical section. Implement all math as pure functions with no side effects. All inputs and outputs are float64. Write unit tests for every function before wiring to handlers.

3.1 Binary market — WPAM (reuse & extend)

WPAM (Weighted Probability Adjustment Model) already exists in the repo at backend/handlers/math/probabilities/wpam/. Keep the core formula. You are only extending the output format.

Formula:

p_yes = (init_prob * init_pool + total_yes_wagered) / (init_pool + total_yes_wagered + total_no_wagered)

p_no  = 1 - p_yes

Payout on resolution:

total_pool   = total_yes_wagered + total_no_wagered

// If YES wins:

payout_per_unit_yes = total_pool / total_yes_wagered   // multiplier

winner_return       = user_stake * payout_per_unit_yes

Edge case: if total_yes_wagered == 0 and YES wins, return all stakes to YES bettors (no one bet YES, so refund everyone). Same for NO side. Never divide by zero — check before computing multiplier.

3.2 Multiple-choice market — N-outcome WPAM

For markets with 3 or more outcomes (e.g. 'Who will win Best Actor?'). Each outcome has its own probability computed via WPAM independently, then normalised so all probabilities sum to 1.0.

Step 1 — per-outcome raw probability:

for each outcome i:

raw_i = (init_prob_i * init_pool + wagered_i) / (init_pool + sum_all_wagered)

Step 2 — normalise (ensures sum = 1.0):

sum_raw = sum(raw_i for all i)

prob_i  = raw_i / sum_raw

Payout on resolution (outcome W wins):

losing_pool   = sum(wagered_i for i != W)

winning_pool  = wagered_W

multiplier    = (losing_pool + winning_pool) / winning_pool

winner_return = user_stake * multiplier

For multi-choice, init_prob_i for each outcome should default to 1/N where N = number of outcomes. Validate that sum(init_prob_i) == 1.0 at market creation time or normalise automatically.

3.3 Ranked-choice market

Users rank outcomes in order (1st, 2nd, 3rd). Scoring uses a Brier-score-inspired point system. This market type is scored, not a pool payout.

Scoring rules:

User submits an ordered ranking of outcomes: [A, B, C, D]

After resolution, actual order is revealed: [C, A, B, D]

Points per position: exact match in position = 10 pts, off by 1 = 5 pts, off by 2 = 2 pts, off by 3+ = 0 pts

Max score = 10 × N where N = number of outcomes

User's virtual credit return = stake × (user_score / max_score) × 2.0 (up to 2x stake)

If user score = max (perfect ranking), bonus = stake × 3.0

Implementation:

func ScoreRanking(userRanking, actualRanking []string) float64 {

score := 0.0

for i, outcome := range actualRanking {

userPos := indexOf(userRanking, outcome)

diff := abs(userPos - i)

switch diff {

case 0: score += 10

case 1: score += 5

case 2: score += 2

}

}

return score

}

func RankedPayout(stake, userScore float64, n int) float64 {

maxScore := float64(n * 10)

if userScore == maxScore { return stake * 3.0 }

ratio := userScore / maxScore

return stake * ratio * 2.0

}

3.4 Real-time odds recalculation — trigger flow

After every successful bet write to the database, immediately recompute probabilities and publish to the WebSocket hub. This must happen inside the same DB transaction to guarantee consistency.

func PlaceBet(ctx, db, hubPublisher, betReq) error {

tx := db.Begin()

// 1. Lock the market row: SELECT FOR UPDATE

// 2. Validate: market active, user has balance, within wager limit

// 3. Deduct from credit_ledger (insert negative row)

// 4. Insert bet row

// 5. Recalculate probabilities for this market

// 6. Update market_outcomes probabilities

// 7. Commit tx

// 8. AFTER commit: publish OddsUpdate to WebSocket hub

return nil

}

SELECT FOR UPDATE on the market row is mandatory. Without it, two concurrent bets on the same market will produce a race condition on total_wagered and emit incorrect odds. Never optimistically update without the row lock.

3.5 Payout engine — resolution

When an admin resolves a market, the payout engine runs as a background job. It must be idempotent — if it crashes mid-run, it must be safe to re-run without double-paying.

func ResolveMarket(ctx, db, marketID, winningOutcomeID) error {

// 1. Set market status = 'resolved', winning outcome is_winner = true

// 2. Fetch all bets for this market

// 3. For each winning bet:

//    a. Compute payout using multiplier formula

//    b. INSERT into credit_ledger with tx_type='bet_won'

//       idempotency_key = 'bet_won_' + bet_id

//    c. ON CONFLICT (idempotency_key) DO NOTHING

// 4. Set market status = 'settled'

return nil

}

4. REST API Endpoints

Base path: /api/v1. All responses are JSON. All authenticated endpoints require Authorization: Bearer <jwt>. Use consistent error envelope: { error: string, code: string }.

4.1 Auth

4.2 Markets

4.3 Betting

4.4 Credits & Rewards

4.5 Challenges

4.6 Withdrawals

4.7 Admin

4.8 WebSocket

WS  /ws/markets/:id/odds

Subscribe to live odds updates for a specific market. Server pushes OddsUpdate message after every bet.

Message schema (server -> client):

{

"market_id": "uuid",

"type": "odds_update",

"outcomes": [

{ "id": "uuid", "label": "Yes", "probability": 0.65, "total_wagered": 1200 },

{ "id": "uuid", "label": "No",  "probability": 0.35, "total_wagered": 800  }

],

"updated_at": "2026-04-13T10:00:00Z"

}

5. Prop-Firm Challenge Engine

This is the monetization core. Every rule here must be enforced server-side — never trust the client.

5.1 Challenge tier config

Store these values in the challenge_config table (see Section 2). Admin can update fees and targets without a deploy via PATCH /admin/challenges/config.

5.2 Enrollment flow

User calls POST /challenges/enroll with { level: 'Prospect' }

Backend checks: no active enrollment exists, user is not banned

For Rookie (free): immediately create enrollment, grant challenge_balance via credit_ledger tx_type='challenge_grant'

For paid tiers: generate PayFast payment link, return it to frontend. Enrollment status = 'pending_payment'

PayFast ITN webhook hits POST /webhooks/payfast. On payment_status=COMPLETE: activate enrollment, grant challenge balance

Challenge balance is a VIRTUAL balance — it is separate from the user's normal credit balance. Use credit_ledger with ref_id = enrollment_id to partition it.

5.3 Daily enforcement cron (runs at 23:59 SAST every day)

This is a Go cron job using robfig/cron. For every active enrollment:

Query credit_ledger WHERE ref_id = enrollment_id AND created_at::date = today to compute today's closing balance

Compare to daily_open_balance. If close < open: mark is_losing_day = true, increment losing_days_count

Compute daily_loss_pct = (open - close) / open. If > max_daily_loss_pct: auto-fail the enrollment

If losing_days_count > max_losing_days: auto-fail

If today's date = end_date AND current_balance >= target_balance: auto-pass

If today's date = end_date AND current_balance < target_balance: auto-fail

Write row to challenge_daily_snapshots

Set tomorrow's daily_open_balance = today's closing balance

5.4 Real-time loss limit check (on every bet)

Every time a user with an active challenge places a bet, before accepting the bet:

todayOpen := enrollment.DailyOpenBalance

currentBalance := sum(ledger WHERE ref_id=enrollment_id AND date=today)

pendingLoss := betAmount  // worst case: bet loses

projectedBalance := currentBalance - pendingLoss

projectedLossPct := (todayOpen - projectedBalance) / todayOpen

if projectedLossPct >= max_daily_loss_pct {

return error(400, 'BET_EXCEEDS_DAILY_LIMIT', 'This bet would breach your daily loss limit')

}

5.5 Pass / fail outcomes

PASS: user has access to real-money withdrawal (set withdrawal_eligible = true on enrollment record)

FAIL: challenge balance is zeroed (insert credit_ledger row: tx_type='challenge_reset', amount = -current_challenge_balance). Real credits unaffected. User can retry by paying fee again.

On retry: create new enrollment row, do not reuse the old one

6. Virtual Credit & Reward System

6.1 Balance computation

func GetBalance(db, userID uuid.UUID) (float64, error) {

var balance float64

err := db.Raw(

"SELECT COALESCE(SUM(amount),0) FROM credit_ledger WHERE user_id = ? AND tx_type NOT LIKE 'challenge_%'",

userID).Scan(&balance).Error

return balance, err

}

Challenge balance is computed separately using tx_type LIKE 'challenge_%' AND ref_id = enrollment_id.

6.2 Signup bonus

On successful OTP verification for a new user: insert one credit_ledger row.

{ user_id, amount: 250, tx_type: 'signup_bonus', idempotency_key: 'signup_' + user_id }

6.3 Daily login bonus

Called by POST /credits/daily-claim. Check last_login_date != today. If already claimed: return 400.

Base bonus: R500

7-day streak (streak_count % 7 == 0 after increment): extra R200

Increment streak_count. If last_login_date was yesterday: streak continues. If gap > 1 day: reset streak_count to 1

idempotency_key = 'daily_login_' + user_id + '_' + today_date

6.4 Referral bonus

When a referred user completes their first bet: insert R100 into the referrer's ledger.

idempotency_key = 'referral_' + referred_user_id

Trigger this inside the PlaceBet handler by checking if it is the user's first ever bet.

6.5 Ad reward endpoint

The ad network sends a server-side callback to POST /webhooks/ad-reward with a signed token. Verify the token signature using the ad network's shared secret. Grant R25. Double-watch (POST /credits/ad-double) grants R70.

idempotency_key = 'ad_reward_' + callback_token

7-day ad streak: track separately with ad_streak_count on the user row. If streak = 7: grant R100 bonus.

7. Authentication — SA Mobile OTP

7.1 OTP request

Validate SA mobile format: starts with +27 or 0, 10 digits

Normalise to +27 format before storage

Rate limit: max 3 OTP requests per mobile per hour (Redis or DB-backed counter)

Generate 6-digit OTP. Hash with bcrypt (cost 10) before storing

Store in otp_requests table with expires_at = NOW() + 10 minutes

Send via Africa's Talking SMS API

7.2 OTP verify

Find most recent unused, unexpired OTP for mobile

Increment attempts. If attempts >= 5: mark as used (brute-force lockout)

Compare submitted OTP against hash

On match: mark used = true. Find or create user. Return JWT (15 min) + refresh token (30 days)

JWT claims: { sub: user_id, level: user.Level, is_admin: bool, exp }

7.3 Referral code generation

referral_code = base36(crc32(user_id))[:8]  // 8-char alphanumeric, unique

Generate at user creation. Store in users table. Share link: https://yourapp.co.za/r/{code}

8. PayFast Integration

8.1 Inbound payment — challenge fees

Build PayFast payment link with: merchant_id, merchant_key, amount, item_name, m_payment_id = enrollment_id, notify_url, return_url

Sign using MD5 of sorted query string + passphrase (see PayFast docs)

Return link to frontend — never redirect server-side

8.2 ITN webhook — POST /webhooks/payfast

Verify request originates from PayFast IP ranges (publish list maintained by PayFast)

Verify MD5 signature matches

If payment_status == 'COMPLETE': activate enrollment, grant challenge balance

If payment_status == 'CANCELLED': set enrollment status = 'abandoned'

Return HTTP 200 always — PayFast retries on non-200

Never activate an enrollment without verifying the ITN signature AND the IP range. A forged ITN could grant challenge balances without payment.

8.3 Withdrawal payout

For v1: admin-initiated manual EFT using the bank_account JSONB from the user profile. The withdrawal_requests table is the audit trail. PayFast bulk payouts API can be integrated in v2.

9. WebSocket Hub — Real-Time Odds

Use Gorilla WebSocket. The hub is a singleton goroutine that manages per-market channels.

type Hub struct {

markets map[string]map[*Client]bool  // marketID -> set of clients

mu      sync.RWMutex

publish chan OddsUpdate

}

func (h *Hub) Run() {

for msg := range h.publish {

h.mu.RLock()

clients := h.markets[msg.MarketID]

h.mu.RUnlock()

for client := range clients {

select {

case client.send <- msg:

default:

h.unregister(client)  // slow client — drop and disconnect

}

}

}

}

Each WebSocket connection runs two goroutines: readPump (handles disconnect detection via ping/pong) and writePump (drains client.send channel). Heartbeat every 30s. Close idle connections after 60s.

10. Background Jobs (Cron)

Use robfig/cron v3. All jobs must be wrapped in a recover() to prevent a panicking job from crashing the server. Log job start/end/duration to structured JSON logs.

11. Security Requirements

11.1 Rate limiting

Use a middleware applied per endpoint. Store counters in Redis (preferred) or DB. Limits:

11.2 Input validation

Validate all inputs using go-playground/validator. Key rules:

Bet amount: must be > 0, must be a multiple of 1 (no fractions of a virtual rand), must be <= balance

Market title: 5-200 chars, sanitise HTML tags

Mobile number: SA format only (+27XXXXXXXXX or 0XXXXXXXXX)

All UUIDs: validate format before DB query

11.3 Fraud detection flags

Log and flag for admin review (do not auto-ban):

User wins > 90% of resolved bets in the last 30 days (> 10 bets placed)

Referral: more than 3 referrals from same IP address in 24 hours

Challenge: user places offsetting bets on the same market within an active challenge (YES and NO same market same day)

11.4 Security headers

Add via middleware on all responses:

X-Content-Type-Options: nosniff

X-Frame-Options: DENY

X-XSS-Protection: 1; mode=block

Strict-Transport-Security: max-age=31536000

12. Testing Requirements

Write tests before wiring handlers. Use testify/assert. Use sqlmock for DB tests. Minimum coverage targets below.

12.1 Math engine unit tests (coverage: 100%)

Write table-driven tests for every math function. Required test cases:

Binary WPAM: normal case (65/35 split), edge case all bets on one side, zero bets placed (odds = init_prob), very large pool (>1M)

Multi-choice WPAM: 3 outcomes equal, 5 outcomes one dominant, normalisation check (sum must = 1.0 ± 0.0001)

Ranked payout: perfect score = 3x, zero score = 0, half score = ~1x

Payout engine: verify idempotency — run ResolveMarket twice, ledger should only have one bet_won row per bet

Daily loss check: exactly at 10% limit (allow), 10.001% (block)

12.2 Integration tests (coverage: 80%+)

Full bet placement flow with concurrent requests (goroutine race test)

Challenge auto-fail triggered by cron

PayFast ITN webhook: valid signature passes, invalid signature returns 400 and does not activate enrollment

WebSocket: connect, place bet, verify OddsUpdate message received

12.3 Load test baseline

Use k6. Before launch: 200 concurrent users each placing 1 bet every 2 seconds for 5 minutes must produce p95 latency < 500ms and 0% error rate.

13. Recommended Implementation Order

Follow this sequence. Each step depends on the previous.

14. Environment Variables

Never commit secrets to git. Use .env for local dev (already in .gitignore on the repo). Use environment injection in Docker for production.

15. Known Gotchas & Non-Negotiables

Never compute balance from a mutable field — always SUM the ledger. This is how you prevent race condition double-spends.

Always use SELECT FOR UPDATE when updating market totals. Two concurrent bets on the same market without this WILL corrupt odds.

The idempotency_key column on credit_ledger must have a UNIQUE constraint. Use ON CONFLICT DO NOTHING for all bonus grants and payouts.

Challenge balance and regular balance are partitioned in the same ledger table via tx_type prefix ('challenge_'). Never mix them in balance computation.

WPAM init_pool is a market-level configuration value. It controls how much the initial probability weighs against actual bets. Too high = market doesn't respond to bets. Too low = one large bet swings odds wildly. Default: 2000 (virtual credits).

PayFast ITN requests come from specific IP ranges. Validate them. Do not rely on signature alone — a replay attack from a valid signed request could re-trigger enrollment activation.

The daily loss check runs at 23:59 but users can also be blocked in real-time (Section 5.4). Both checks are required — the cron handles historical snapshots, the real-time check handles the current trading day.

Multiple-choice markets: init_prob for each outcome must sum to 1.0. If a creator submits 5 outcomes each with init_prob=0.5, normalise automatically — do not reject.

Ranked-choice markets: a user's ranking array must contain every outcome exactly once. Validate this server-side before accepting the bet.

Withdrawal requests must check: (1) user has passed at least Rookie challenge, (2) user KYC is verified, (3) requested amount does not exceed available real-money equivalent. Virtual credits cannot be withdrawn — only real money earned via passed challenges.

End of master implementation prompt. This document is the single source of truth for backend implementation. Any ambiguity in the frontend API contract should be resolved by referencing Section 4.