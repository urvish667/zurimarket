# Features

This document tracks the capabilities of the Zurimarket (SocialPredict) Backend.

## Core Platform
- **HTTP API Server**: RESTful JSON API using `gorilla/mux`.
- **Database Management**: Automatic migrations and schema management via GORM.
- **Environment Configuration**: Multi-environment support using `.env` files.

## Security & Authentication
- **User Authentication**: JWT-based secure access for protected routes.
- **Input Sanitization**: Protection against XSS using `bluemonday` and input validation via `go-playground/validator`.
- **CORS Support**: Cross-Origin Resource Sharing configuration for frontend integrations.

## Application Logic
- **Seeding System**: Automatic population of initial users and homepage content upon server startup.
- **Structured Error Handling**: Centralized error responses for consistent API client integration.
- **Logging**: Request and application logging for observability.

## Admin Dashboard Backend
- **User Management**: APIs for listing users with filters, promoting/demoting roles, and banning/unbanning users.
- **Market Moderation**: Administrative list of all markets and capability to delete abusive markets.
- **Audit Logging**: Global view of all betting transactions for oversight.
- **System Health Metrics**: Extended health endpoint providing total user, market, and bet counts.
- **Economic Policy Management**: Dynamic configuration of economic parameters like market creation costs and account requirements.
- **Identity Provisioning**: Endpoint for manual user creation by admins with secure password generation.
- **Comment System**: Support for threaded replies (root + 1 level nesting), pagination (limit/offset), rich-text markdown rendering, HTML sanitization (via `bluemonday`), and user identity (avatars/emojis) integration. Validates reply context for security.
- **Leaderboard System**: Specialized ranking logic for market-specific and global user profitability.

## Planned/Ongoing Features
- **Real-time Notifications**: WebSocket-based alerts for betting activity and comment replies.
- **Advanced Social Features**: User-to-user follows and activity feeds.

## Prop Firm Challenge System
- **Challenge Tiers**: Configurable challenge levels (Rookie, Prospect, All-Star, Legend) stored in DB via `ChallengeTier` model.
- **Challenge Lifecycle**: Users start challenges, which track daily performance. Status transitions: ACTIVE → PASSED/FAILED/EXPIRED.
- **Rules Engine**: Pure-function validation engine (`handlers/challenges/rules_engine.go`) evaluating profit target, daily loss, losing days, and time expiry.
- **Badge System Hierarchy**: String-based progression map ("none" -> "rookie" -> "prospect" -> "all-star" -> "legend") enforcing sequential tier access.
- **Financial Validation**: Start/Retry handlers enforce `VirtualBalance >= (StartingBalance + EntryFee)`.
- **Daily Log Tracking**: `ChallengeDailyLog` records daily P&L snapshots with open/close balance and rule violation flags.
- **Reward System**: On challenge pass, credits `RealBalance` on user, automatically upgrades `ChallengeBadge`, and optionally unlocks market creation.
- **Retry System**: Failed/expired challenges can be retried; paid tiers require re-payment from `VirtualBalance`.
- **Bet Integration**: `AfterBetHook` updates active challenge balance after each bet, triggers rule evaluation.
- **Admin Management**: Batch daily evaluation endpoint, challenge listing with filters, aggregated stats, tier configuration updates.
- **Single Active Challenge**: Only one active challenge per user at a time; enforced at handler level.
