# System Standards

## Design System & Styling
- **CSS Framework**: Tailwind CSS is strictly used for all styling.
- **Color Palette** (defined in `tailwind.config.js`):
  - Primary: `#ddff5c` (used for CTAs, highlights, and active states).
  - Backgrounds: Dark aesthetic utilizing `#0b0f0e` (surface), `#131313`.
  - Secondary/Tertiary colors defined for badges, indicators, and charts (e.g., `#caf300`, `#afefdd`).
- **Typography**: 
  - Headlines/Titles: 'Space Grotesk' (`font-headline`)
  - Body/Labels: 'Satoshi' (`font-body`, `font-satoshi`)
- **Icons**: SVG icons utilized through `SvgIcons.jsx` and Google Material Symbols via class `.material-symbols-outlined`.

## Component Standards
- **Currency Display**: Always use `formatCurrency()` and `<CoinIcon />` from `CurrencyUtils.jsx` for displaying monetary values.
- **Labels Mapping**: Use `labelMapping.js` and `useMarketLabels.js` when rendering market outcomes (YES/NO/Custom).
- **Date Formatting**: Standardized using `formatResolutionDate.js`.
- **UI States**: Loading states utilize standard `LoadingSpinner`, and fallbacks are implemented via `ErrorBoundary`.

## Form Inputs
- Standard inputs use the `.sp-input` class defined in `index.css`.
- Forms utilize unified styling with high contrast borders (e.g., `#ddff5c` on focus) and minimal rounded corners (`rounded-none`).
