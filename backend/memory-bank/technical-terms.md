# Technical Terms

This glossary defines common terminology used within the Zurimarket domain and the backend codebase.

## Backend Concepts
- **Handler**: Functions located in the `handlers/` package responsible for parsing incoming HTTP requests, interacting with business logic/database, and writing HTTP responses.
- **Middleware**: Interceptor functions (e.g., `middleware.Authenticate`) that wrap around handlers to perform pre-processing like validating JWTs, logging, or setting CORS headers.
- **GORM**: The Object Relational Mapper used to translate Go structs (`models`) into SQL tables and queries.
- **Migration**: The process of automatically updating the database schema to match the current state of the code's data models, executed during application startup.
- **Seed**: The process of populating the database with initial, required data (e.g., admin users, default settings, or mock data) so the application is functional immediately after a fresh setup.
- **JWT (JSON Web Token)**: Used for stateless user authentication. The token contains a payload with the user's identity and is signed securely.

## Domain Specific
- **Role-Based Access Control (RBAC)**: Implementation of user roles (`USER`, `ADMIN`) to restrict access to sensitive endpoints.
- **System Health Metrics**: Real-time stats providing visibility into platform volume and user growth.
- **Audit Log**: A historical record of all critical system actions, specifically betting transactions in the current version.
- **Economic Policy**: A set of configurable rules governing the platform's economy, including costs for market creation and eligibility requirements.
- **Identity Provisioning**: The administrative process of manually creating and onboarding new users or administrators.
- **Profitability**: A calculation of a user's total investment (spent) versus the current market value of their positions, used for leaderboard rankings.
- **Threaded Comments**: A hierarchical comment structure allowing users to reply to specific comments, creating organized discussion threads.
