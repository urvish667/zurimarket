# Features

## Markets (Prediction Markets)
- **Market Discovery**: Landing page grid with filtering by category (e.g., Crypto, Politics, Sports, Business) and status (Active, New, Ending, Closed).
- **Market Creation**: Users can create markets specifying outcome types.
  - **Binary**: Yes/No outcomes (custom labels supported).
  - **Multiple Choice**: 3 or more defined outcomes.
- **Market Details**: Deep dive into individual markets, showing odds, probability charts, and trading interface.
- **Resolution**: Markets have a resolution date and time, after which they are closed and resolved.
## User & Authentication
- **User Accounts**: Registration (SignupFlow), login, profile settings, and password management.
- **Admin Dashboard**: Comprehensive management interface for `ADMIN` users.
  - **Command Center**: Real-time system health and platform statistics.
  - **User Registry**: Advanced user management with role updates and banning.
  - **Market Liquidation**: Moderation interface for supervising and deleting markets.
  - **Transaction Ledger**: Global audit log of all betting activities.
  - **Identity Provisioning**: Form for manual user/admin creation.
  - **Economic Policy**: UI for updating live platform economic constraints.
- **Wallet & Portfolio**: Track user's coin balance, bet history, and current active portfolio.

## Social & Gamification
- **Leaderboard / Stats**: Tracking top predictors on the platform.
- **Challenges**: Engaging users with specific prediction challenges.
- **Activity**: Feed or log of platform activities.
- **User Profile**: Display names, user icons, and public profile views.

## Prop Firm Challenge Admin
- **Challenge Control Center** (tab: `?tab=challenges`): Admin dashboard section for managing the challenge system.
- **Badge System Oversight**: Admin visibility into the challenge badge progression (Rookie -> Legend).
- **Challenge Stats**: Aggregated metrics — active count, pass rate, total revenue from entry fees, total rewards paid.
- **Challenge List**: Filterable/paginated list of all user challenges with status, progress bars, and losing day tracking.
- **Daily Evaluation Engine**: Admin-triggered batch evaluation of all active challenges for expiry and rule violations.
- **Tier Configuration**: Ability to update challenge tier parameters (entry fee, target, duration, etc.) via admin API.
