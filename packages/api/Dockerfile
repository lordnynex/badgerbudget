# Multi-stage: build API-only binary with Bun, then minimal runtime image.
# Build from repo root so workspace deps (e.g. @satyrsmc/shared) resolve.
# Env at runtime: NODE_ENV, LOG_LEVEL, PORT (default 3000), DATA_DIR (dir containing data/badger.db).

FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lock* ./
COPY packages ./packages

# Install only API workspace and its deps (avoids web/app-admin packages that can fail in Docker).
RUN bun install --frozen-lockfile --filter @satyrsmc/api

RUN bun build ./packages/api/src/api-only.ts \
  --compile \
  --target=bun-linux-x64 \
  --outfile=./api-server

# Minimal runtime: only the compiled binary.
FROM gcr.io/distroless/base-debian13
WORKDIR /app

COPY --from=builder /app/api-server .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Mount data volume and set DATA_DIR=/data (or wherever you mount).
# Example: docker run -p 3000:3000 -v /host/data:/data -e DATA_DIR=/data satyrsmc-api:latest
ENTRYPOINT ["./api-server"]
