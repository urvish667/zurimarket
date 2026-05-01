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
- **Admin Dashboard**: Restricted area for users with `ADMIN` usertype.
- **Wallet & Portfolio**: Track user's coin balance, bet history, and current active portfolio.

## Social & Gamification
- **Leaderboard / Stats**: Tracking top predictors on the platform.
- **Challenges**: Engaging users with specific prediction challenges.
- **Activity**: Feed or log of platform activities.
- **User Profile**: Display names, user icons, and public profile views.

## Prop Firm Challenge System
- **Challenges Hub** (`/challenges`): Main page displaying available challenge tiers, active challenge progress, and challenge history.
- **Badge Hierarchy & Progression**: Uses `challengeBadge` stored in `AuthContext` to sequentially lock/unlock tiers (Rookie -> Prospect -> All-Star -> Legend).
- **Challenge Detail** (`/challenges/:id`): Deep-dive view with stats grid, progress bar, rules summary, and daily P&L log table.
- **Tier Cards**: Interactive cards for each challenge tier showing entry fee, starting balance, target, duration, rewards, and lock state based on user badge.
- **Active Challenge Card**: Real-time progress visualization with balance, P&L, remaining days, and losing days tracker.
- **Retry System**: Modal-based retry flow with fee confirmation for paid challenge tiers.
- **Challenge Status Badges**: Color-coded status indicators (Active/Passed/Failed/Expired).
- **API Layer** (`api/challengesApi.js`): Fetch-based functions for all challenge endpoints.
- **Custom Hooks** (`hooks/useChallenges.js`): `useChallenges()` for hub data, `useChallengeDetail()` for detail view.
