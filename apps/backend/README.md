# Backend

## Overview

The backend package hosts the NestJS API that powers Figurant's conversational features. It exposes authentication and reply routes, coordinates with multiple AI providers for responses and speech synthesis, and stores config data in PostgreSQL through Prisma.

## Architecture

The app is split into feature modules instead of wiring every controller in `AppModule`:

- `CoreModule` provides validated environment access, the injectable `PrismaService`, rate limiting, and shared HTTP infrastructure.
- `AuthModule` owns registration, email verification, login, refresh-token rotation, logout, password updates, and one-time password reset tokens.
- `ProfilesModule`, `ConversationsModule`, `CatalogModule`, `ModelsModule`, and `AppConfigModule` keep CRUD/business logic in services and leave controllers as thin HTTP adapters.
- `RepliesModule` calls `AiModule`, which owns AI provider clients and provider capability routing.
- `HealthModule` is the canonical Terminus health surface at `/health`, `/health/liveness`, and `/health/readiness`.

Controllers should return DTOs and throw Nest exceptions. Avoid `@Res()`, direct Prisma imports, and plain Express middleware for new backend code.

## Environment variables

Two environment files are available:
- `.env.local` - For local development (DATABASE_URL uses `localhost`, APP_FRONTEND_URL uses dev server)
- `.env.production` - For Docker Compose (DATABASE_URL uses `postgres` service, APP_FRONTEND_URL uses production build)

| Variable                              | Required?    | Usage                                                                                                                                  |
|---------------------------------------|--------------|----------------------------------------------------------------------------------------------------------------------------------------|
| `DATABASE_URL`                        | **Required** | Connection string consumed by Prisma to talk to PostgreSQL                                                                             |
| `JWT_SECRET`                          | **Required** | Secret key for signing JWT tokens (change in production!)                                                                              |
| `JWT_EXPIRES_IN`                      | **Required** | JWT token expiration time (e.g., `7d` for 7 days)                                                                                      |
| `APP_FRONTEND_URL`                    | **Required** | Frontend URL for CORS and email verification links                                                                                     |
| `SMTP_HOST`                           | **Required** | SMTP server host for sending emails (use `localhost` for local, `host.docker.internal` for Docker)                                     |
| `SMTP_PORT`                           | **Required** | SMTP server port (e.g., `1025` for Mailpit)                                                                                            |
| `SMTP_USER`                           | Optional     | SMTP authentication username (leave empty for local development)                                                                       |
| `SMTP_PASS`                           | Optional     | SMTP authentication password (leave empty for local development)                                                                       |
| `MAIL_FROM`                           | **Required** | Email address used as sender for outgoing emails                                                                                       |
| `OPENAI_API_KEY`                      | Optional     | Conversations - Realtime, Response generating, TTS, Speech to text                                                                     |
| `ELEVENLABS_API_KEY`                  | Optional     | Conversations - TTS                                                                                                                    |
| `CLAUDE_API_KEY`                      | Optional     | Conversations - Response generating                                                                                                    |
| `GROK_API_KEY`                        | Optional     | Conversations - Response generating                                                                                                    |
| `ELEVENLABS_FALLBACK_VOICE_ID_FEMALE` | Optional     | Fallback ID when Elevenlabs selected for TTS but selected character missing custom voice id                                            |
| `ELEVENLABS_FALLBACK_VOICE_ID_MALE`   | Optional     | Fallback ID when Elevenlabs selected for TTS but selected character missing custom voice id                                            |
| `TOKEN_CLEANUP_SCHEDULE`              | Optional     | How often the refresh_tokens table is being cleaned up from the expired and revoked tokens. If not provider it runs every day at night |

Environment values are validated during application startup. `DATABASE_URL` and `JWT_SECRET` must be present, and numeric ports must parse to valid TCP port numbers.

## Local checks

Run the backend checks from the repository root:

```bash
pnpm --filter figurant-backend typecheck
pnpm --filter figurant-backend lint
pnpm --filter figurant-backend test
pnpm --filter figurant-backend build
```

Generate OpenAPI after route/DTO changes:

```bash
pnpm --filter figurant-backend openapi:generate
pnpm --filter @repo/frontend-utils generate-openapi
```

The OpenAPI file is not written at application startup; generation is an explicit maintenance step.

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
