# Technical Terms & Domain Vocabulary

- **Market**: A prediction event that users can bet on. It has a question title, description, and resolution criteria.
- **OutcomeType**: Defines the type of market. Currently supports `BINARY` (two options) and `MULTIPLE_CHOICE` (3+ options).
- **ResolutionDateTime**: The deadline when the market stops accepting bets and awaits a resolution result.
- **Probability**: The calculated chance of an outcome occurring, represented as a percentage (0-100%). Usually updated dynamically based on trading activity.
- **Volume / TotalVolume**: The total amount of coins bet on a specific market.
- **Coin**: The internal virtual currency used for placing bets and tracking user portfolios.
- **Resolution**: The final outcome of a market (e.g., Resolved YES, Resolved NO, or a specific choice).
- **ZuriMarket**: The brand/platform name. Also referred to in components (e.g., `ZuriMarketCard`).
- **Kinetic Ledger**: Conceptual term used in the platform UI to describe the real-time sentiment/betting engine.
- **Binary Labels**: Custom text labels substituting "YES" and "NO" (e.g., "BULL" vs "BEAR") for better contextual mapping.
- **Profitability Ranking**: A user ranking metric calculated as `Current Portfolio Value - Total Amount Spent`.
- **Reply Thread**: A hierarchical visual structure for nested comments on market pages.
- **GFM (GitHub Flavored Markdown)**: The markdown dialect supported by the platform's comment system for rich text formatting.
