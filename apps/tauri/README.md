# Desktop (Tauri)

## Overview
The Tauri package wraps the shared Figurant React experience in a desktop shell. It delivers the same routing and UI that power the web app while adding native capabilities such as the Tauri HTTP, logging, and store plugins for an offline-friendly desktop experience.

## Environment variables
| Variable                 | Is Required ? | Description                                                                                 |
|--------------------------|---------------|---------------------------------------------------------------------------------------------|
| `VITE_SUPABASE_URL`      | **Required**  | Supabase project URL used by the shared Supabase client for authentication and data access. |
| `VITE_SUPABASE_ANON_KEY` | **Required**  | Supabase anonymous key used to initialize the browser client from `@repo/frontend-utils`.   |
| `VITE_BACKEND_URL`       | **Required**  | Base URL for routing API requests from the Figurant API client to the backend service.      |
