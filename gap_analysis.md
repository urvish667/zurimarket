# Gap Analysis — Client Requirements vs. Current Codebase

> Analysed: 2026-03-23

---

## Legend
| Symbol | Meaning |
|---|---|
| ✅ | Done — exists and functional |
| 🔶 | Partial — scaffolding or similar exists, needs work |
| ❌ | Not started |

---

## 2.1 User Onboarding & Accounts

| Feature | Status | Notes |
|---|---|---|
| Mobile number sign-up + OTP (SA number) | ❌ | Only username/email exists. No SMS/OTP provider integrated. |
| Email required alongside mobile | 🔶 | Email field exists on [User](file:///d:/Data/Projects/socialpredict/backend/models/user.go#8-15) model, but no verification flow. |
| Basic profile (username, referral code) | 🔶 | Username + profile fields exist. Referral code field missing from [User](file:///d:/Data/Projects/socialpredict/backend/models/user.go#8-15) model. |
| Instant R250 virtual credits on sign-up | 🔶 | `InitialAccountBalance` config exists, but self-service registration doesn't exist yet. |
| Referral system (link, R100 bonus on first bet) | ❌ | No referral model, link generation, or bonus logic anywhere in backend or frontend. |
| Daily login bonus / 7-day streak = R200 | ❌ | No login streak tracking or bonus system. |

**Section score: 1.5 / 6 features ≈ 25%**

---

## 2.2 Prediction Markets (Core Gameplay)

| Feature | Status | Notes |
|---|---|---|
| Event categories (Sports, Entertainment, etc.) | ❌ | No `category` field on [Market](file:///d:/Data/Projects/socialpredict/backend/models/market.go#9-26) model. |
| Binary markets (Yes/No) | ✅ | Fully implemented with DBPM probability model, YesLabel/NoLabel. |
| Multiple choice markets (3+ outcomes) | ❌ | `OutcomeType` field exists on model but multi-outcome logic (math, UI, payout) is not implemented. Only binary (`YES`/`NO`) bets are supported. |
| Odds display (% based) | ✅ | DBPM model calculates and exposes probability percentages. |
| Virtual credit wagering with balance limits | ✅ | Balance checks + debt limits implemented. |
| Real-time odds updates | 🔶 | REST polling works; no WebSocket/SSE push for true real-time. |
| Event timer (countdown to resolution) | 🔶 | `ResolutionDateTime` stored; countdown UI exists on market detail page. |
| Results & payouts after resolution | ✅ | Market resolution + winner payout implemented. |

**Section score: 4.5 / 8 features ≈ 56%**

---

## 2.3 Prop Firm Challenge System

| Feature | Status | Notes |
|---|---|---|
| Challenge levels (Rookie, Prospect, All-Star, Legend) | ❌ | No `Challenge` model, table, or any related code. |
| Rookie Challenge (free, 7-day, R1k → R1.1k) | ❌ | — |
| Prospect Challenge (R50 fee, 14 days) | ❌ | — |
| All-Star Challenge (R150 fee, 21 days) | ❌ | — |
| Legend Challenge (R500 fee, 30 days) | ❌ | — |
| Challenge dashboard (progress bars, remaining days) | ❌ | — |
| Failed challenge reset + repay fee | ❌ | — |

**Section score: 0 / 7 features ≈ 0%**

---

## 2.4 Ad Integration (Rewarded Videos)

| Feature | Status | Notes |
|---|---|---|
| "Watch Ad – Earn R25" button | ❌ | No ad SDK integration. No ad reward tracking. |
| Double credits (2 ads = R70) | ❌ | — |
| Ad bonus streak (7-day = R100) | ❌ | — |

**Section score: 0 / 3 features ≈ 0%**

---

## 2.5 User-Created Events

| Feature | Status | Notes |
|---|---|---|
| Event creation fee (Micro/Macro/Mega tiers) | ❌ | A flat `CreateMarketCost` fee exists, but no Micro/Macro/Mega tier system. |
| Event setup (title, description, options, image) | 🔶 | Title + description + outcomes supported. Image/thumbnail upload missing. |
| Creator earnings (5–15% of challenge fees) | ❌ | No creator revenue tracking. |
| Creator share link + tagging | ❌ | No share link generation or referral tagging to events. |
| Admin approval before publishing | ❌ | Currently markets go live instantly. Approval queue is planned but not built. |
| Mega events featured on homepage | ❌ | No featured flag or tier-based homepage logic. |

**Section score: 0.5 / 6 features ≈ 8%**

---

## 2.6 Withdrawals (Real Money)

| Feature | Status | Notes |
|---|---|---|
| Withdrawal eligibility (challenge pass required) | ❌ | No withdrawal system at all. |
| Proof payouts (fast payments + encourage video proof) | ❌ | — |
| Payment provider integration (PayFast/Stripe) | ❌ | Coinbase Commerce planned but not for ZAR withdrawals. |

**Section score: 0 / 3 features ≈ 0%**

---

## 2.7 Referral & Affiliate System

| Feature | Status | Notes |
|---|---|---|
| Unique referral link per user | ❌ | — |
| R100 bonus on referred user's first bet | ❌ | — |
| WhatsApp one-click share | ❌ | — |

**Section score: 0 / 3 features ≈ 0%**

---

## 2.10 Admin Panel

| Feature | Status | Notes |
|---|---|---|
| Event management (create, approve, edit, resolve) | 🔶 | Admin can create users. Markets go live without approval. No edit/approve flow. |
| User management (view, adjust balance, ban, verify) | 🔶 | Admin user creation exists. Balance adjustment, ban, and verify are not implemented. |
| Withdrawal approvals | ❌ | No withdrawal system. |
| Challenge settings (difficulty, fees, payouts) | ❌ | No challenge system. |
| Analytics dashboard (DAU, revenue, pass rates) | 🔶 | `/v0/stats` and `/v0/system/metrics` exist but are basic (no revenue or challenge analytics). |
| Proof payouts management | ❌ | — |

**Section score: 1.5 / 6 features ≈ 25%**

---

## 3. UI / Layout Requirements

| Section | Status | Notes |
|---|---|---|
| Landing page (logged-out hero, CTA, "How It Works") | ❌ | No logged-out public landing page. Unauthenticated users hit login immediately. |
| Dashboard top bar (balance chip, notifications) | 🔶 | Sidebar layout exists. Balance and profile exist. Notification bell exists but is non-functional. |
| Daily bonus claim banner | ❌ | No daily bonus system or UI. |
| Quick actions row (Predict, Watch Ads, Challenges, Create) | 🔶 | Create event exists. Predict exists. Watch Ads and Challenges screens missing. |
| Hot events scrollable list | 🔶 | Active markets list exists. No "hot" ranking or dedicated widget. |
| Recent bets list on dashboard | 🔶 | Portfolio page exists but not on dashboard home. |
| Referral box with WhatsApp share | ❌ | No referral UI anywhere. |
| Event detail: countdown + odds display + event slip | ✅ | Market detail page has odds, bet input, and resolution date. |
| Challenges page | ❌ | — |
| Create Event page with tier pricing + payment | 🔶 | Create market form exists. No tier selection, image upload, or payment on creation. |
| Profile page with achievements, referral stats, bank details | 🔶 | Basic profile + portfolio exists. Achievements, referral stats, bank details missing. |
| Mobile-first layout | 🔶 | Bottom nav bar exists for mobile. Not fully optimised as mobile-first. |

**Section score: 5.5 / 12 features ≈ 46%**

---

## Overall Summary

| Section | Done | Total | % |
|---|---|---|---|
| 2.1 User Onboarding | 1.5 | 6 | 25% |
| 2.2 Prediction Markets | 4.5 | 8 | 56% |
| 2.3 Challenge System | 0 | 7 | 0% |
| 2.4 Ad Integration | 0 | 3 | 0% |
| 2.5 User-Created Events | 0.5 | 6 | 8% |
| 2.6 Withdrawals | 0 | 3 | 0% |
| 2.7 Referral System | 0 | 3 | 0% |
| 2.10 Admin Panel | 1.5 | 6 | 25% |
| 3. UI / Layout | 5.5 | 12 | 46% |
| **TOTAL** | **13.5** | **54** | **🟠 25%** |

---

## 🔑 What to Build Next (Priority Order)

1. **Self-service registration** — mobile OTP (SMS), email, username → unlocks everything else
2. **Daily credits & referral system** — R250 on signup, R100 referral bonus → growth flywheel
3. **Market categories + image upload + approval queue** — needed for the curated creator ecosystem
4. **Challenge system (`Challenge` model + rules engine)** — this is the core monetisation engine
5. **Withdrawal system + PayFast/Stripe ZAR integration** — turns virtual credits into revenue
6. **Ad integration** — rewarded video SDK (e.g. Google AdMob / ironSource)
7. **Landing page + mobile-first UI polish** — conversion driver

> **You are approximately 25% of the way to the client's full vision.**
> The existing codebase gives you a solid, production-safe trading engine (binary markets, DBPM odds, auth, DB transactions) — but the monetisation layer (Challenges, Withdrawals, Ads, Referrals) and growth layer (Landing page, OTP sign-up, Creator tiers) are almost entirely missing.
