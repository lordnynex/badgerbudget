# Multi-stage: install only API + shared workspace deps (no frontend). Native deps load from node_modules.
# Build context: repo root. Env at runtime: NODE_ENV, LOG_LEVEL, PORT (default 3000), DATA_DIR.

FROM oven/bun:1 AS builder
WORKDIR /app

# Slim root: only api and shared workspaces so node_modules has no web/app-admin deps.
COPY packages/api/docker-root.package.json package.json
COPY packages/api packages/api
COPY packages/shared packages/shared

ARG TARGETPLATFORM=linux/amd64
RUN bun install

# Runtime: Bun + app + node_modules (sharp and other natives load from here).
FROM oven/bun:1-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/package.json /app/bun.lock* ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Mount data volume and set DATA_DIR=/data (or wherever you mount).
# Example: docker run -p 3000:3000 -v /host/data:/data -e DATA_DIR=/data satyrsmc-api:latest
ENTRYPOINT ["bun", "run", "packages/api/src/api-only.ts"]
