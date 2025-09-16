# Desktop (Tauri)

## Overview

The Tauri package wraps the shared Figurant React experience in a desktop shell. It delivers the same routing and UI
that power the web app while adding native capabilities such as the Tauri HTTP, logging, and store plugins for an
offline-friendly desktop experience.

## Environment variables

| Variable                 | Is Required ? | Description                                                                                 |
|--------------------------|---------------|---------------------------------------------------------------------------------------------|
| `VITE_SUPABASE_URL`      | **Required**  | Supabase project URL used by the shared Supabase client for authentication and data access. |
| `VITE_SUPABASE_ANON_KEY` | **Required**  | Supabase anonymous key used to initialize the browser client from `@repo/frontend-utils`.   |
| `VITE_BACKEND_URL`       | **Required**  | Base URL for routing API requests from the Figurant API client to the backend service.      |

## Deployment

### Desktop build

1. Ensure the native prerequisites for Tauri are installed on the machine that will produce the installer:
    - Node.js 22.x and `pnpm` 10.x
    - A stable Rust toolchain
    - Platform-specific build tools (the packages listed in
      the [official Tauri prerequisites](https://tauri.app/start/prerequisites/)).

2. Install workspace dependencies from the repository root so shared packages are compiled:

   ```bash
   pnpm install
   ```

3. Provide the Vite environment expected by the desktop client (`apps/tauri/.env`). The values are read at build time in
   the same way as the web app.

4. Produce a signed release build for the current platform:

   ```bash
   pnpm --filter figurant-tauri run build:tauri
   ```
