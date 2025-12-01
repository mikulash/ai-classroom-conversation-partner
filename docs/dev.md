# Development

## Development requirements

These are the minimum prerequisites you need to work on the Figurant monorepo locally. The versions below match what is used in CI and the provided Dockerfiles.

### Core tooling
- **Node.js 22.x** – aligns with the runtime used by the backend and web Docker images.
- **pnpm 10.x** – enabled via `corepack enable`; all workspace scripts assume pnpm.
- **Docker** - for running PostgreSQL locally and deployment

### Environment & external services
- A local PostgreSQL 18 instance reachable through `DATABASE_URL` (a Docker Compose service is provided below, or point to any managed instance)
- API keys for the AI providers you plan to use
- Configure the `.env` files for each app (backend + web or tauri)

## Getting Started with Development

Follow these steps to set up your local development environment:

### 1. Generate Prisma Client code

```bash
pnpm --filter figurant-backend prisma:generate
```

### 2. Start PostgreSQL with Docker

```bash
# Starts PostgreSQL 18 defined in docker-compose.yml
docker compose up -d postgres
```

Set `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_classroom` inside `apps/backend/.env` (copy from `.env.example`).

### 3. Run Database Migrations

```bash
pnpm --filter figurant-backend prisma:migrate
```

### 4. Seed the Database
Copy the seed file into the database container and execute it to avoid issues with encoding czech characters.
```powershell
# From the project's root folder:
docker cp apps/backend/prisma/seed-data.sql figurant-db:/tmp/seed-data.sql
docker exec figurant-db psql -U postgres -d ai_classroom -f /tmp/seed-data.sql
```

### 5. Start Development 

```bash
pnpm run dev:web-backend
```


## Changes in DB schema
All schemas now live in [`apps/backend/prisma/schema.prisma`](../apps/backend/prisma/schema.prisma). Whenever you update it:

1. Create a migration with `pnpm --filter figurant-backend prisma:migrate --name <change-summary>`.
2. Generate the Prisma client so TypeScript picks up the new types: `pnpm --filter figurant-backend prisma:generate`.
3. Update the seed file (`apps/backend/prisma/seed-data.sql`) if the change requires new bootstrap data.
4. Commit the migration folder plus any updated generated files.

## Deployment
### Prerequisites:
- Docker installed and running
- Properly configured `.env.production` for the backend app and `env` for the web/tauri app
- Valid api keys for required services
- Node.js and pnpm installed

### Steps:
#### separately:
Deployment instructions for each app are in their respective README files:
- [Backend](../apps/backend/README.md)
- [Web](../apps/web/README.md)
- [Desktop (Tauri)](../apps/tauri/README.md)

#### ...or all together:
or can be run together with docker-compose in the root of the repository.
1. Run the docker containers with `docker compose up -d`
2. Apply the migrations `pnpm --filter figurant-backend prisma:migrate`
3. Seed the database
   1. Copy the seed file into the database container and execute it to avoid issues with encoding czech characters.
   `docker cp apps/backend/prisma/seed-data.sql figurant-db:/tmp/seed-data.sql`
   2. Run the seed file `docker exec figurant-db psql -U postgres -d ai_classroom -f /tmp/seed-data.sql`

## Adding new AI models
it depends if the provider is already supported or if you want to add a new provider
### Existing provider
>`OpenAI`, `Anthropic`, `xAI`, `ElevenLabs`

For new models that belong to an already supported provider:

1. Update `apps/backend/prisma/schema.prisma` if you need new enum values.
2. Insert the actual rows through Prisma Studio (`pnpm --filter figurant-backend prisma:studio`) **or** update `apps/backend/prisma/seed-data.sql` and re-run the seed: `docker exec -i figurant-db psql -U postgres -d ai_classroom < apps/backend/prisma/seed-data.sql`.
3. Confirm the backend references (e.g., dropdowns in `packages/ui/components`) automatically pick up the data from the database.

each table that stores models has a column
- `provider` that specifies which provider the model belongs to
- `friendly_name` that is used in the UI
- `api_name` that is used in the API calls to the provider, for example, OpenAI allows to automatically use the latest version like `gpt-4o` or you can specify a specific version like `gpt-4o-2024-08-06`

### New provider
If you need to support a brand-new provider:
1. Add the provider to the corresponding enum in `apps/backend/prisma/schema.prisma` (`providers_tts_model`, `providers_response_model`, etc.). Run `pnpm --filter figurant-backend prisma:migrate` so the change lands in the database.
2. Seed at least one model row for the provider by updating `apps/backend/prisma/seed-data.sql`.
3. Implement the provider client in the backend project (see `apps/backend/src/lib/ai/` for references) and wire it into [`universalApi`](../apps/backend/src/ai-api/universalApi.ts).
4. Re-run `pnpm --filter figurant-backend prisma:generate` so TypeScript enforces any missing switch branches or DTO updates.


## Problem solving
- **OpenAI API Issues**: Check https://status.openai.com/
- **Anthropic Issues**: Check https://status.anthropic.com/
- **ElevenLabs Issues**: Check https://status.elevenlabs.io/
- **Grok Issues**: Check https://status.x.ai/

View logs in deployed environments with: `docker logs -f <container_id>`
