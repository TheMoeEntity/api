# Build context is the REPO ROOT (see docker-compose.yml): the web app
# depends on packages/shared and the workspace lockfile.

FROM node:22-bookworm-slim

RUN corepack enable && corepack prepare pnpm@10.34.5 --activate

WORKDIR /repo

# Dependency layer, cached until a manifest or the lockfile changes.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile --filter "@refund-desk/web..."

COPY packages/shared packages/shared
COPY apps/web apps/web

ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @refund-desk/shared build \
 && pnpm --filter @refund-desk/web build \
 && chown -R node:node /repo/apps/web/.next

WORKDIR /repo/apps/web
ENV NODE_ENV=production
USER node

EXPOSE 3000
# API_URL and ADMIN_API_KEY are read at request time, so the same image
# works in any environment.
CMD ["node_modules/.bin/next", "start", "--port", "3000", "--hostname", "0.0.0.0"]
