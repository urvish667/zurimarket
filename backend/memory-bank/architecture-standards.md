# Architecture Standards

This document defines the core architectural patterns and design decisions for the Zurimarket (SocialPredict) Backend.

## Overview
The backend is built in Go (module: `socialpredict`) and exposes an HTTP REST API. It follows a modular directory structure, separating concerns like routing, database interactions, middleware, and business logic.

## Directory Structure & Responsibilities
- `handlers/`: HTTP request handlers/controllers. Contains an `admin/` sub-package for restricted management APIs and `math/` for specialized data processing (e.g., leaderboards).
- `models/`: Database schema definitions using GORM.
- `middleware/`: HTTP middleware, providing authentication, CORS handling, and request logging.
- `server/`: Application routing (`gorilla/mux`) and HTTP server lifecycle management.
- `security/`: JWT handling, password hashing (`golang.org/x/crypto`), and input sanitization (`microcosm-cc/bluemonday`).
- `util/`: Shared utilities including database connection (`gorm.io`), environment loading (`godotenv`), and helper functions.
- `migration/` & `seed/`: System startup processes. Migrations are stored in `migration/migrations/` and manually registered via `init()` functions into a global registry.
- `errors/` & `logger/`: Structured logging and application-wide error definitions.

## Key Architectural Decisions
- **Database Configuration**: For Postgres poolers (e.g., Neon DB), GORM is configured with `PreferSimpleProtocol: true` and `PrepareStmt: false` to avoid prepared statement conflicts in transaction mode.
- **Migration Resilience**: Critical migrations (like `comments`) use Raw SQL (`CREATE TABLE IF NOT EXISTS`) as a fallback to ensure schema consistency when GORM's `AutoMigrate` is interrupted by protocol-level errors.
- **Routing**: `gorilla/mux` is used for defining HTTP routes.
- **Authentication**: JWT-based authentication provided by custom middleware.
- **Initialization**: `main.go` handles setup explicitly (DB connection, migrations, seeding, and server start) to maintain a clear dependency graph without relying heavily on implicit `init()` functions.
