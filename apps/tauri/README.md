# Desktop (Tauri)

## Overview
The Tauri package wraps the shared Figurant React experience in a desktop shell. It delivers the same routing and UI that power the web app while adding native capabilities such as the Tauri HTTP, logging, and store plugins for an offline-friendly desktop experience.

## Turborepo packages
- `@repo/ui` &ndash; Shared React routes, layouts, and components rendered inside the Tauri window.
- `@repo/frontend-utils` &ndash; Frontend clients for Supabase, the Figurant backend API, and translation setup.
- `@repo/shared` &ndash; Common TypeScript models and enums shared between frontend and backend.
- `@repo/assets` &ndash; Shared static assets referenced by the UI.
- `@repo/eslint-config` &ndash; Monorepo ESLint rules used during linting.
- `@repo/typescript-config` &ndash; Shared TypeScript configuration extended by this app.
- `@repo/tailwind-config` &ndash; Central Tailwind CSS configuration consumed during builds.

## Environment variables
| Variable | Description |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL used by the shared Supabase client for authentication and data access. |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key used to initialize the browser client from `@repo/frontend-utils`. |
| `VITE_BACKEND_URL` | Base URL for routing API requests from the Figurant API client to the backend service. |
| `MODE` | Vite-provided mode flag that enables verbose conversation logging when set to `development`. |
