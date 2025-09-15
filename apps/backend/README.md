# Backend

## Overview
The backend package hosts the Express API that powers Figurant's conversational features. It exposes authentication and reply routes, coordinates with multiple AI providers for responses and speech synthesis, and fetches configuration data from Supabase.

## Turborepo packages
- `@repo/shared` &ndash; Shared types, enums, and request/response contracts consumed by the backend implementation.
- `@repo/eslint-config` &ndash; Centralized ESLint rules used for linting.
- `@repo/typescript-config` &ndash; Shared TypeScript configuration that the service extends.

## Environment variables
| Variable | Description |
| --- | --- |
| `PORT` | Port that the Express server binds to (defaults to `4000` when unset). |
| `SUPABASE_URL` | Supabase project URL used to instantiate the admin client. |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key that allows the backend to read configuration tables and Vault secrets. |
| `OPENAI_API_KEY` | API key used when calling OpenAI models through the universal reply pipeline. |
| `ELEVENLABS_API_KEY` | ElevenLabs API key used to synthesize speech for replies. |
| `CLAUDE_API_KEY` | Anthropic Claude API key used for alternate response generation. |
| `GROK_API_KEY` | xAI Grok API key used for additional response model support. |
| `ELEVENLABS_FALLBACK_VOICE_ID_FEMALE` | Default ElevenLabs voice identifier to use for female personalities without an explicit voice configured. |
| `ELEVENLABS_FALLBACK_VOICE_ID_MALE` | Default ElevenLabs voice identifier to use for male personalities without an explicit voice configured. |
