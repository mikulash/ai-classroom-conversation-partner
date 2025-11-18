# Backend

## Overview

The backend package hosts the Express API that powers Figurant's conversational features. It exposes authentication and reply routes, coordinates with multiple AI providers for responses and speech synthesis, and stores config data in PostgreSQL through Prisma.

## Environment variables

| Variable                              | Required?     | Usage |
|---------------------------------------|---------------|-------|
| `DATABASE_URL`                        | **Required**  | Connection string consumed by Prisma to talk to PostgreSQL |
| `OPENAI_API_KEY`                      | Optional      | Conversations - Realtime, Response generating, TTS, Speech to text |
| `ELEVENLABS_API_KEY`                  | Optional      | Conversations - TTS |
| `CLAUDE_API_KEY`                      | Optional      | Conversations - Response generating |
| `GROK_API_KEY`                        | Optional      | Conversations - Response generating |
| `ELEVENLABS_FALLBACK_VOICE_ID_FEMALE` | Optional      | Fallback ID when Elevenlabs selected for TTS but selected character missing custom voice id |
| `ELEVENLABS_FALLBACK_VOICE_ID_MALE`   | Optional      | Fallback ID when Elevenlabs selected for TTS but selected character missing custom voice id |

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
