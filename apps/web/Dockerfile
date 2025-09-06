# ---------- Base image ----------
FROM node:22-alpine AS base

# Enable pnpm (same version you use elsewhere)
RUN corepack enable && corepack prepare pnpm@10.8.1 --activate

# All stages will work from /app
WORKDIR /app

# ---------- Dependencies layer ----------
# Only the manifests that affect dependency resolution are copied,
# so this layer is cached unless they change.
FROM base AS deps

# Root manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Workspace package.json files that the web app depends on
COPY apps/web/package.json                      ./apps/web/
COPY packages/shared/package.json               ./packages/shared/
COPY packages/ui/package.json                   ./packages/ui/
COPY packages/assets/package.json               ./packages/assets/
COPY packages/api-client/package.json           ./packages/api-client/
COPY packages/typescript-config/package.json    ./packages/typescript-config/
COPY packages/eslint-config/package.json        ./packages/eslint-config/
COPY packages/tailwind-config/package.json      ./packages/tailwind-config/

# Install **all** dependencies (including dev) so the build has what it needs
RUN pnpm install --frozen-lockfile

# ---------- Build layer ----------
FROM deps AS builder

# Vite build-time env (provided via --build-arg at docker build)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_BACKEND_URL

# Expose them to the build process so Vite picks them up
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

# Copy the full repo
COPY . .

# Build only what the web app (and its deps) need
# The three dots keep the dependency graph under figurant-web
RUN pnpm turbo run build --filter=figurant-web...

# ---------- Runtime layer ----------
# Stays with Node because you already have a “start: vite preview” script.
FROM base AS runner
ENV NODE_ENV=production

# Copy package manifests needed for a **prod-only** install
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/web/package.json        ./apps/web/
COPY --from=builder /app/packages/shared/package.json ./packages/shared/

# Install only production deps
RUN pnpm install --prod --frozen-lockfile

# Bring the built assets across
COPY --from=builder /app/apps/web/dist        ./apps/web/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

# Serve with Vite preview (default port 4173)
WORKDIR /app/apps/web
EXPOSE 4173
CMD ["pnpm", "start"]
