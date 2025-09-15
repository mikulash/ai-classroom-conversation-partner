# Backend

## Overview
The backend package hosts the Express API that powers Figurant's conversational features. It exposes authentication and reply routes, coordinates with multiple AI providers for responses and speech synthesis, and fetches config data from Supabase.

## Environment variables
| Variable                              | Is Required ?                                                 | Description                                                                                               | 
|---------------------------------------|---------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------|
| `SUPABASE_URL`                        | **Required**                                                  | Supabase project URL used to instantiate the admin client.                                                |
| `SUPABASE_SERVICE_ROLE_KEY`           | **Required**                                                  | Service role key that allows the backend to read configuration tables and Vault secrets.                  |
| `OPENAI_API_KEY`                      | Optional - if provider is currently set as active in config   | API key used when calling OpenAI models through the universal reply pipeline.                             |
| `ELEVENLABS_API_KEY`                  | Optional - if provider is currently set as active in config   | ElevenLabs API key used to synthesize speech for replies.                                                 |
| `CLAUDE_API_KEY`                      | Optional - if provider is currently set as active in config   | Anthropic Claude API key used for alternate response generation.                                          |
| `GROK_API_KEY`                        | Optional - if provider is currently set as active in config   | xAI Grok API key used for additional response model support.                                              |
| `ELEVENLABS_FALLBACK_VOICE_ID_FEMALE` | Optional - if Elevenlabs is currently set as active in config | Default ElevenLabs voice identifier to use for female personalities without an explicit voice configured. |
| `ELEVENLABS_FALLBACK_VOICE_ID_MALE`   | Optional - if Elevenlabs is currently set as active in config | Default ElevenLabs voice identifier to use for male personalities without an explicit voice configured.   |

## Deployment

### Docker
1. Build the production image from the repository root so the workspace context is available to the multi-stage build:

   ```bash
   docker build -f apps/backend/Dockerfile -t figurant-backend .
   ```

2. Run the container, forwarding the API port (defaults to `4000`) and loading the environment file:

   ```bash
   docker run --env-file ./apps/backend/.env -p 4000:4000 figurant-backend
   ```

The image installs only production dependencies and copies the compiled TypeScript from `dist`, so it is ready to push to a registry or orchestrate with Compose/Kubernetes once the environment variables are configured.
