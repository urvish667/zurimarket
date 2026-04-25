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
*(Add any Zurimarket or SocialPredict specific business terminology here as the project evolves)*
