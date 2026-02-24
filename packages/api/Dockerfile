# Multi-stage: install deps for target platform, then run API with Bun (no compile).
# Native deps (sharp, better-sqlite3) load from node_modules at runtime.
# Build from repo root so workspace deps (e.g. @satyrsmc/shared) resolve.
# Env at runtime: NODE_ENV, LOG_LEVEL, PORT (default 3000), DATA_DIR (dir containing data/badger.db).

FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lock* ./
COPY packages ./packages

# Install for target platform so sharp/better-sqlite3 get correct native binaries.
ARG TARGETPLATFORM=linux/amd64
RUN bun install --frozen-lockfile

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
