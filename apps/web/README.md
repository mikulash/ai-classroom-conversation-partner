# Web

## Overview

The web package delivers the Figurant React experience in a browser via Vite. It wires up the shared router, authentication, and media handling so end users can chat, stream audio, and manage settings directly from the web.

## Environment variables

| Variable           | Required?    | Description |
|--------------------|--------------|-------------|
| `VITE_BACKEND_URL` | **Required** | Base URL for routing API requests from the Figurant API client to the backend service. |

## Deployment

### Docker

1. Build the static bundle image. Supply the Vite build-time variable as a `--build-arg` value so it is baked into the assets. Warnings about sensitive data can be ignored because this variable is safe to expose in the browser:

   ```bash
   docker build -f apps/web/Dockerfile --build-arg VITE_BACKEND_URL=... -t figurant-web .
   ```

2. Run the container to serve the Vite preview build (defaults to port `4173`):

   ```bash
   docker run -p 4173:4173 figurant-web
   ```

Because the runtime only needs the prebuilt assets, no additional environment variables are required once the image has been built with the desired configuration.
