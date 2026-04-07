## Summary

This PR sets up the project foundation for the ERP/CRM/PDV monorepo and establishes the first working backend flow.

## What Was Done

- structured the backend with `controllers`, `services`, `repositories`, `schemas`, `utils` and shared Prisma access
- added environment loading with `dotenv`
- implemented base error handling and pagination helpers
- implemented initial auth endpoints:
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/logout`
- implemented initial product endpoints:
  - `GET /api/v1/products`
  - `GET /api/v1/products/:id`
- implemented initial tenant endpoints:
  - `GET /api/v1/tenants`
  - `GET /api/v1/tenants/:id`
  - `POST /api/v1/tenants/:id/impersonate`
- added Prisma seed script
- created and applied initial Prisma migration
- added Docker Compose setup for local PostgreSQL
- documented current project status and setup progress
- added LinkedIn-ready project description document

## Infra / Local Setup

- local PostgreSQL now runs through `docker compose`
- API environment is configured through `apps/api/.env`
- backend build is passing with `pnpm --filter api build`
- `/health` endpoint responds successfully

## Notes

- workspace root `pnpm typecheck` is still pending adjustment because `packages/shared-types` is not yet aligned with the recursive TypeScript command
- several routes are still placeholders returning `501` and will be implemented in future PRs

## Suggested Manual Validation

- run `docker compose up -d`
- run `pnpm --filter api dev`
- verify `GET /health`
- test login with seeded credentials
- test products list/detail
- test tenants list/detail/impersonation
