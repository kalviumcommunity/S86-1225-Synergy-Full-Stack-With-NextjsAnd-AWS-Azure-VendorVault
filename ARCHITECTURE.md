# System Architecture & API Documentation

## System Overview

VendorVault is a full-stack application built with Next.js, Node.js, PostgreSQL, AWS S3, and Azure App Service. It features a modular architecture with clear separation between frontend, API routes, authentication, file storage, and CI/CD automation.

### Tech Stack
- **Frontend:** Next.js (React, TypeScript)
- **Backend/API:** Next.js API routes (Node.js)
- **Database:** PostgreSQL (managed)
- **File Storage:** AWS S3 (for uploads)
- **Cloud Hosting:** Azure App Service, AWS ECS
- **CI/CD:** GitHub Actions

## Core Modules & Directory Structure

```
vendorvault/
 ┣ app/                # Next.js app directory (pages, API routes)
 ┣ components/         # React UI components
 ┣ config/             # App configuration (roles, etc.)
 ┣ __smoke_tests__/    # Smoke tests for CI/CD
 ┣ __tests__/          # Unit/integration tests
 ┣ public/             # Static assets
 ┣ prisma/             # Prisma ORM (DB schema)
 ┣ services/           # Service layer (API, business logic)
 ┣ utils/              # Utility functions
 ┣ scripts/            # Automation scripts
 ┣ postman-collection.json  # API documentation (Postman)
 ┣ postman-jwt-auth-collection.json # Auth API docs (Postman)
 ┗ ...
```

## Data Flow Diagram

User → Next.js Frontend → API Route (/api/*) → Service Layer → Database/S3 → Response

- Authenticated requests use JWT (Bearer token)
- File uploads use pre-signed S3 URLs
- All API endpoints are documented in Postman collections

## Deployment Architecture

- **Azure App Service** hosts the production Next.js app (Docker container)
- **AWS ECS** is used for containerized deployments (optional)
- **AWS S3** stores uploaded files
- **GitHub Actions** automates build, test, deploy, and verification
- **Secrets** are managed via GitHub Secrets, Azure Key Vault, or AWS Secrets Manager

## Local Setup & Onboarding

1. Clone the repo and install dependencies:
   ```bash
   git clone ...
   cd vendorvault
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in secrets
3. Run the app locally:
   ```bash
   npm run dev
   ```
4. Run tests and smoke tests:
   ```bash
   npm test
   npx jest --testPathPattern=__smoke_tests__
   ```
5. View API docs in Postman or import `postman-collection.json`

## Regenerating API Documentation

- Update or add new endpoints in Postman
- Export the collection as v2.1 JSON and replace `postman-collection.json`
- Optionally, automate this in CI/CD

## Maintenance & Best Practices

- Keep API docs and architecture diagrams up-to-date with every major change
- Add changelog entries for new endpoints or breaking changes
- Use PR checklists to require documentation updates

---

_Last updated: January 6, 2026_
_Version: 1.0.0_
