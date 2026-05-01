# System Standards

This document outlines the coding and system-level standards for developing the Zurimarket (SocialPredict) Backend.

## Environment Setup
- **Go Version**: Go 1.25+
- **Module Name**: `socialpredict`
- **Dependencies**: Managed via Go Modules (`go.mod`, `go.sum`).
- **Database**: PostgreSQL (production) or SQLite (local development/testing).

## Coding Conventions
- **Formatting**: All code must be formatted using standard `gofmt`.
- **Error Handling**: 
  - Never suppress errors silently. 
  - Return errors up the call stack and handle them in the handler layer to generate appropriate HTTP responses.
- **Variable Naming**: Follow idiomatic Go (e.g., `camelCase` for private, `PascalCase` for public/exported symbols).
- **Package Management**: Avoid circular dependencies. Each package must represent a distinct module (`models`, `handlers`, `util`).
- **Global Variables**: Minimize the use of global state. Inject dependencies or pass references where feasible.

## Database Standards
- Use GORM for database queries to ensure cross-database compatibility.
- Place all table structure definitions strictly inside the `models/` package.
- **Migrations**: New database schema changes must be implemented as separate migration files in `migration/migrations/`, using the `Register` pattern in an `init()` function for automatic execution on startup.
- Database operations should handle context appropriately if timeouts or cancellations are required.

## Security Standards
- Always validate incoming JSON payloads using the validator package.
- Sanitize any user-provided HTML/Markdown content before saving to the database.
- Use the `middleware.Authenticate` wrapper for any route requiring user authorization, and `middleware.ValidateAdminToken` for privileged administrative actions.
