# Web

## Overview
The web package delivers the Figurant React experience in a browser via Vite. It wires up the shared router, authentication, and media handling so end users can chat, stream audio, and manage settings directly from the web.

## Turborepo packages
- `@repo/ui` &ndash; Shared React routes, layouts, and components rendered by the browser app.
- `@repo/frontend-utils` &ndash; Supabase and backend API clients, plus translation setup reused by the web build.
- `@repo/shared` &ndash; Common TypeScript models, enums, and contract definitions shared across services.
- `@repo/assets` &ndash; Shared static assets referenced by the UI.
- `@repo/eslint-config` &ndash; Base ESLint configuration shared throughout the monorepo.
- `@repo/typescript-config` &ndash; Root TypeScript configuration extended by this app.
- `@repo/tailwind-config` &ndash; Tailwind CSS configuration consumed during builds and at runtime.

## Environment variables
| Variable | Description |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL used to bootstrap the browser Supabase client for auth and storage. |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key required by the frontend client to authenticate requests. |
| `VITE_BACKEND_URL` | Base URL for Figurant backend requests performed by the shared API client. |
| `MODE` | Vite-provided mode flag that turns on verbose conversation logging when running in development. |
