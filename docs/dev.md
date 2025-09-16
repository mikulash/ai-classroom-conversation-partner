# Development

## Development requirements

These are the minimum prerequisites you need to work on the Figurant monorepo locally. The versions below match what is used in CI and the provided Dockerfiles.

### Core tooling
- **Node.js 22.x** – aligns with the runtime used by the backend and web Docker images.
- **pnpm 10.x** – enabled via `corepack enable`; all workspace scripts assume pnpm.
- **Docker** - for deployment

### Environment & external services
- A Supabase project with access to the **project URL** and **service role key** for the backend, plus the **anon key** for web/desktop clients.
- API keys for the AI providers you plan to use
- Configure the `.env` files for each app (backend + web or tauri)

## Changes in DB schema
If you make changes to the database schema, you will need to update generated types of supabase tables that are located in './packages/shared/types/supabase/database.types.ts'

### Generating types

Get them here get them [here](https://supabase.com/dashboard/project/_/api?page=tables-intro) OR:

1. install supabase cli and login as described in [here](https://supabase.com/docs/guides/api/rest/generating-types)
2. rewrite the file containing the types with command `npx supabase gen types typescript --project-id "$PROJECT_REF" --schema public > ./packages/shared/types/supabase/database.types.ts`. This target path is when running from the root of the repo. Project ref can be found in the settings of your supabase project or in the project URL.

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

## Problem solving
- **OpenAI API Issues**: Check https://status.openai.com/
- **Supabase Issues**: Check https://status.supabase.com/
- **Anthropic Issues**: Check https://status.anthropic.com/
- **ElevenLabs Issues**: Check https://status.elevenlabs.io/
- **Grok Issues**: Check https://status.x.ai/

View logs in deployed environments with: `docker logs -f <container_id>`
