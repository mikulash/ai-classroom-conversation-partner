# Web

## Overview
The web package delivers the Figurant React experience in a browser via Vite. It wires up the shared router, authentication, and media handling so end users can chat, stream audio, and manage settings directly from the web.

## Environment variables
| Variable                 | Is Required ? | Description                                                                                 |
|--------------------------|---------------|---------------------------------------------------------------------------------------------|
| `VITE_SUPABASE_URL`      | **Required**  | Supabase project URL used by the shared Supabase client for authentication and data access. |
| `VITE_SUPABASE_ANON_KEY` | **Required**  | Supabase anonymous key used to initialize the browser client from `@repo/frontend-utils`.   |
| `VITE_BACKEND_URL`       | **Required**  | Base URL for routing API requests from the Figurant API client to the backend service.      |

## Deployment

### Docker
1. Build the static bundle image. Supply the Vite build-time variables as `--build-arg` values so they are baked into the assets. Warnings about sensitive data can be ignored because these variables are safe to expose in the browser:

   ```bash
   docker build -f apps/web/Dockerfile --build-arg VITE_SUPABASE_URL=... --build-arg VITE_SUPABASE_ANON_KEY=...  --build-arg VITE_BACKEND_URL=... -t figurant-web .
   ```

2. Run the container to serve the Vite preview build (defaults to port `4173`):

   ```bash
   docker run -p 4173:4173 figurant-web
   ```

Because the runtime only needs the prebuilt assets, no additional environment variables are required once the image has been built with the desired configuration.
