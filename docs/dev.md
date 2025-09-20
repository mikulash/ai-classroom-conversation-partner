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

## Adding new AI models
it depends if the provider is already supported or if you want to add a new provider
### Existing provider
>`OpenAI`, `Anthropic`, `xAI`, `ElevenLabs`

if you want to add a new AI model for an already supported provider, you need to add this new model to fitting db table in supabase dashboard (response_models table, tts_models table, etc.)

each table that stores models has a column
- `provider` that specifies which provider the model belongs to
- `friendly_name` that is used in the UI
- `api_name` that is used in the API calls to the provider, for example, OpenAI allows to automatically use the latest version like `gpt-4o` or you can specify a specific version like `gpt-4o-2024-08-06`

### New provider
if you want to add a new provider, you need to do the following steps:
1. you need to add this new provider to the postgres enum for which the models will be added, for example, adding provider `Google` to the `tts_models` table. You need to add Google value to the `providers_tts_model enum` in supabase dashboard [here](https://supabase.com/dashboard/project/_/database/types)
2. now we can use this provider when adding new models to the `tts_models` table
3. you need to implement the provider client in the backend project (see `packages/backend/src/lib/ai/` folder for existing providers) and implement specific api calls that follows existing interfaces.
4. every place you need to update when added the new provider can be highlighted by TypeScript's typechecking. First, you need to generate the types for supabase as in a section above. Now the TypeScript will highlight the uncovered switch case branch you need to implement. This highlighted error will probably be in [the universalApi](../apps/backend/src/api_universal/universalApi.ts) file where the api calls are made based on the provider and model selected.


## Problem solving
- **OpenAI API Issues**: Check https://status.openai.com/
- **Supabase Issues**: Check https://status.supabase.com/
- **Anthropic Issues**: Check https://status.anthropic.com/
- **ElevenLabs Issues**: Check https://status.elevenlabs.io/
- **Grok Issues**: Check https://status.x.ai/

View logs in deployed environments with: `docker logs -f <container_id>`
