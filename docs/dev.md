# Development

## Development requirements

These are the minimum prerequisites you need to work on the Figurant monorepo locally. The versions below match what is used in CI and the provided Dockerfiles.

### Core tooling
- **Node.js 22.x** – aligns with the runtime used by the backend and web Docker images.
- **pnpm 10.x** – enabled via `corepack enable`; all workspace scripts assume pnpm.
- **Docker** - for deployment

### Environment & external services
- A local PostgreSQL 18 instance reachable through `DATABASE_URL` (run it with Docker as shown below or point to any managed instance)
- API keys for the AI providers you plan to use
- Configure the `.env` files for each app (backend + web or tauri)

## Running the database locally
We rely on PostgreSQL now instead of Supabase. Start it with Docker and seed it before launching the apps:

```bash
# Optional: create a persistent directory for the volume
mkdir -p .data/postgres

docker run \
  --name figurant-db \
  -e POSTGRES_DB=ai_classroom \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -v $(pwd)/.data/postgres:/var/lib/postgresql/data \
  -d postgres:18

# Apply schema + seed data
pnpm --filter figurant-backend prisma:migrate
pnpm --filter figurant-backend prisma:seed
```

Set `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_classroom` inside `apps/backend/.env` (copy from `.env.example`).

Read more database tips in [docs/database.md](./database.md).

## Changes in DB schema
All schemas now live in [`apps/backend/prisma/schema.prisma`](../apps/backend/prisma/schema.prisma). Whenever you update it:

1. Create a migration with `pnpm --filter figurant-backend prisma:migrate --name <change-summary>`.
2. Generate the Prisma client so TypeScript picks up the new types: `pnpm --filter figurant-backend prisma:generate`.
3. Update the seed file (`apps/backend/prisma/seed.ts`) if the change requires new bootstrap data.
4. Commit the migration folder plus any updated generated files.

## Deployment
### Prerequisites:
- Docker installed and running
- Valid api keys for required services
- Node.js and pnpm installed

### Steps:
Deployment instructions for each app are in their respective README files:
- [Backend](../apps/backend/README.md)
- [Web](../apps/web/README.md)
- [Desktop (Tauri)](../apps/tauri/README.md)

## Adding new AI models
it depends if the provider is already supported or if you want to add a new provider
### Existing provider
>`OpenAI`, `Anthropic`, `xAI`, `ElevenLabs`

For new models that belong to an already supported provider:

1. Update `apps/backend/prisma/schema.prisma` if you need new enum values.
2. Insert the actual rows through Prisma Studio (`pnpm --filter figurant-backend prisma:studio`) **or** update `apps/backend/prisma/seed.ts` and run `pnpm --filter figurant-backend prisma:seed`.
3. Confirm the backend references (e.g., dropdowns in `packages/ui/components`) automatically pick up the data from the database.

each table that stores models has a column
- `provider` that specifies which provider the model belongs to
- `friendly_name` that is used in the UI
- `api_name` that is used in the API calls to the provider, for example, OpenAI allows to automatically use the latest version like `gpt-4o` or you can specify a specific version like `gpt-4o-2024-08-06`

### New provider
If you need to support a brand-new provider:
1. Add the provider to the corresponding enum in `apps/backend/prisma/schema.prisma` (`providers_tts_model`, `providers_response_model`, etc.). Run `pnpm --filter figurant-backend prisma:migrate` so the change lands in the database.
2. Seed at least one model row for the provider via `apps/backend/prisma/seed.ts`.
3. Implement the provider client in the backend project (see `apps/backend/src/lib/ai/` for references) and wire it into [`universalApi`](../apps/backend/src/ai-api/universalApi.ts).
4. Re-run `pnpm --filter figurant-backend prisma:generate` so TypeScript enforces any missing switch branches or DTO updates.


## Problem solving
- **OpenAI API Issues**: Check https://status.openai.com/
- **Anthropic Issues**: Check https://status.anthropic.com/
- **ElevenLabs Issues**: Check https://status.elevenlabs.io/
- **Grok Issues**: Check https://status.x.ai/

View logs in deployed environments with: `docker logs -f <container_id>`
