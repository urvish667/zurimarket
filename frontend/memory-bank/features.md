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
- **Enhanced Leaderboards**: Real-time market-specific and global rankings based on user profitability, featuring rank icons (🥇, 🥈, 🥉) and user identity integration.
- **Rich Comment System**: Threaded discussions on market pages with 1-level nested replies, "Load More" pagination, rich-text Markdown support, and user identity display (non-clickable usernames for focused discussion).
- **Visual Identity**: Profile customization via user avatars (URLs) and personal emojis used throughout the social layers of the platform.
- **Platform Stats**: Global analytics and system financial metrics for transparency.

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
