# Build context is the REPO ROOT (see docker-compose.yml), because the API
# depends on packages/shared and the workspace lockfile.

FROM node:22-bookworm-slim

# OpenSSL is required by Prisma's schema engine, which runs migrations.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Download pnpm at BUILD time so the container never needs the network to start.
RUN corepack enable && corepack prepare pnpm@10.34.5 --activate

WORKDIR /repo

# ── Dependency layer ─────────────────────────────────────────
# Copy only manifests first. Docker caches this slow install layer and
# reuses it until a package.json or the lockfile changes, so editing
# source code doesn't trigger a full reinstall.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile --filter "@refund-desk/api..."

# ── Source + build ───────────────────────────────────────────
COPY packages/shared packages/shared
COPY apps/api apps/api

# `prisma generate` never connects to the DB, but prisma.config.ts requires
# DATABASE_URL to be set, so a placeholder is enough at build time.
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" \
      pnpm --filter @refund-desk/api exec prisma generate \
 && pnpm --filter @refund-desk/shared build \
 && pnpm --filter @refund-desk/api build \
 && chmod +x apps/api/docker-entrypoint.sh

WORKDIR /repo/apps/api
ENV NODE_ENV=production \
    PATH=/repo/apps/api/node_modules/.bin:$PATH

# Don't run as root inside the container.
USER node

EXPOSE 4000
ENTRYPOINT ["./docker-entrypoint.sh"]
