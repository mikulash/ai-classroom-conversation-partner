# Use Node.js as the base image
FROM node:22-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.8.1 --activate

# Set working directory
WORKDIR /app

# Set up build stage
FROM base AS builder

# Copy root package.json and workspace configs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
# Copy all package.json files to ensure workspace resolution works
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the backend app and dependencies
RUN pnpm turbo run build --filter=figurant-backend...

# Setup production stage
FROM base AS runner

# Set environment variables
ENV NODE_ENV=production

# Install OpenSSL (required for Prisma)
RUN apk add --no-cache openssl ca-certificates

# Copy package.json files for production install
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/packages/shared/package.json ./packages/shared/

# Copy the built files from shared package and backend
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Copy Prisma generated client (includes query engine binaries)
COPY --from=builder /app/apps/backend/src/generated ./apps/backend/src/generated
RUN ls -R /app/apps/backend/src/generated

# Copy Prisma schema (needed for migrations if you run them)
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma

# Environment variables are expected to be provided at runtime (e.g., via docker run --env-file).

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Expose the backend port (assuming it's 3000, adjust as needed)
EXPOSE 4000

# Set the working directory to the backend app
WORKDIR /app/apps/backend

# Run the app
CMD ["node", "dist/main.js"]
