# Database & Prisma Workflow

The Figurant backend now uses a local PostgreSQL instance that is managed through Prisma instead of Supabase. This document summarizes the tooling and commands you need to run the database, apply schema changes, and seed realistic data.

## Prerequisites

- Docker Desktop or Docker Engine 24+
- `pnpm` (already required for the rest of the repo)
- Optional: `psql` CLI for running ad-hoc SQL queries

## Running PostgreSQL locally

The backend expects a `DATABASE_URL` that points to a PostgreSQL 18 database. The simplest way to run it locally is via Docker:

```powershell
docker run --name ai_classroom -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=ai_classroom -p 5432:5432 -d postgres:18
```

You can stop and remove the container with `docker stop figurant-db && docker rm figurant-db`. Reusing the `.data/postgres` directory keeps your data across restarts.

Set the matching connection string in `apps/backend/.env` (see `.env.example`):

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_classroom
```

## Managing the schema with Prisma

All models now live in [`apps/backend/prisma/schema.prisma`](../apps/backend/prisma/schema.prisma). Prisma handles generating the TypeScript client as well as running migrations. Common commands (executed from the repo root):

```bash
# Generate Prisma client after you edit the schema
pnpm --filter figurant-backend prisma:generate

# Create and apply a migration while in dev
pnpm --filter figurant-backend prisma:migrate

# Push schema changes without creating SQL migrations (useful for quick spikes)
pnpm --filter figurant-backend db:push

# Reset the database and re-apply all migrations
pnpm --filter figurant-backend prisma:migrate-reset
```

Prisma migrations are stored inside [`apps/backend/prisma/migrations`](../apps/backend/prisma/migrations). Commit them whenever you change the schema so the rest of the team receives the update.

## Seeding baseline data

We keep a curated set of personalities, scenarios, and default model choices in [`apps/backend/prisma/seed.ts`](../apps/backend/prisma/seed.ts). After you start PostgreSQL, run:

```bash
pnpm --filter figurant-backend prisma:seed
```

If you make manual changes in the database and want to convert them back to a reusable seed file, use the export helper:

```bash
pnpm --filter figurant-backend export:seed
```

This script reads from the current database, prints a TypeScript seed file into `apps/backend/prisma/seed.ts`, and lets you commit the new baseline.

## Inspecting and editing data

Use Prisma Studio for a UI over the same schema:

```bash
pnpm --filter figurant-backend prisma:studio
```

Studio is the fastest way to add new personalities, tweak scenarios, or update enum-backed model lists without touching SQL directly.

