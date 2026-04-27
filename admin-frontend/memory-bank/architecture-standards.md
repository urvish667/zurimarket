# Architecture Standards

## Tech Stack
- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM v5
- **Styling**: Tailwind CSS
- **Charts**: Chart.js, Recharts, CanvasJS, D3

## Project Structure
- `src/api/`: API layer abstraction for backend communication (e.g., `marketsApi.js`).
- `src/assets/`: Static assets, SVGs, and images.
- `src/components/`: Reusable UI components organized by feature (e.g., markets, modals, sidebar, inputs).
- `src/helpers/`: Utility components and context providers (e.g., `AuthContent.jsx`, `AppRoutes.jsx`).
- `src/hooks/`: Custom React hooks for encapsulating logic and state (e.g., `useMarketDetails`, `usePortfolio`, `useUserData`).
- `src/pages/`: Top-level page components mapping to routes.
- `src/utils/`: Utility functions (e.g., `CurrencyUtils.jsx`, `labelMapping.js`, `statusMap.js`).

## State Management
- **Authentication**: Managed via Context API (`AuthContent.jsx`), storing `token`, `username`, and `usertype` in local storage.
- **Local State**: Managed using standard React hooks (`useState`, `useEffect`).
- **Data Fetching**: Native `fetch` API utilized with custom hooks for abstracting data access.

## Layout
- **App Layout**: Global layout is driven by `App.jsx`, incorporating `TopNavbar` and unified main container. Routing manages transitions between authentication flows, admin dashboards, and public pages.
