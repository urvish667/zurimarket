# Features

This document tracks the capabilities of the Zurimarket (SocialPredict) Backend.

## Core Platform
- **HTTP API Server**: RESTful JSON API using `gorilla/mux`.
- **Database Management**: Automatic migrations and schema management via GORM.
- **Environment Configuration**: Multi-environment support using `.env` files.

## Security & Authentication
- **User Authentication**: JWT-based secure access for protected routes.
- **Input Sanitization**: Protection against XSS using `bluemonday` and input validation via `go-playground/validator`.
- **CORS Support**: Cross-Origin Resource Sharing configuration for frontend integrations.

## Application Logic
- **Seeding System**: Automatic population of initial users and homepage content upon server startup.
- **Structured Error Handling**: Centralized error responses for consistent API client integration.
- **Logging**: Request and application logging for observability.

## Planned/Ongoing Features
*(To be updated as new features are requested in future prompts)*
