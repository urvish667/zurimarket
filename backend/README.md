# ZuriMarket Backend (Go)

This folder contains the core Go backend application for ZuriMarket. 
The backend handles user authentication, market matching, betting engines, payout distributions, and the Prop Firm Challenge System.

## Requirements
- **Go 1.20+**
- **PostgreSQL** (if not using the default SQLite fallback)

## Environment Variables

The server relies on the following environment variables. You can set these in your shell or use a `.env` loader depending on your local setup.

### Core App Settings
- `APP_ENV`: Application environment (`development` or `production`).
- `DOMAIN_URL`: The frontend domain (e.g., `http://localhost:3000`), used for CORS policies.
- `BACKEND_PORT`: The port on which the server should listen (default is usually `8080`).

### Security Settings
- `JWT_SIGNING_KEY`: Secret key used to sign and verify JWT authentication tokens.
- `ADMIN_SECRET_KEY`: Extra layer of security via `X-Admin-Secret` header for sensitive admin operations.

### Database Settings (Optional for PostgreSQL)
If these are omitted, the application will automatically fall back to using an in-memory SQLite database (`socialpredict.db`).

- `DB_HOST` (or `POSTGRES_HOST`)
- `DB_PORT` (or `POSTGRES_PORT`)
- `DB_USER` (or `POSTGRES_USER`)
- `DB_PASSWORD` (or `POSTGRES_PASSWORD`)
- `DB_NAME` (or `POSTGRES_DATABASE`)
- `DB_SSLMODE` (or `POSTGRES_SSLMODE`)

## How to Run the Application

### 1. Development Mode (Hot Reloading / Direct Run)
The simplest way to run the application during development is using `go run`:

```bash
# Navigate to the backend directory
cd backend

# Download all dependencies
go mod tidy

# Run the server directly
go run main.go
```

### 2. Build and Execute
If you want to compile the application into a single executable binary:

```bash
# Compile the backend
go build -o zurimarket-server .

# Execute the binary
./zurimarket-server
```

## Running Tests

To execute the full test suite across all handlers and modules:

```bash
go test ./...
```

For verbose output to see exactly which tests are running:

```bash
go test -v ./...
```

## Migration & Seeding
The backend handles database migrations and seeding automatically upon startup in `main.go`.
When the server starts up, it will:
1. Auto-migrate core schema definitions (`models/user.go`, `models/market.go`, `models/challenge.go`, etc.).
2. Insert foundational seed data (`seed/seed_users.go`, `seed/seed_challenges.go`, `seed/seed_homepage.go`).
