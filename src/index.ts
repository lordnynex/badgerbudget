import "reflect-metadata";
import { performance } from "node:perf_hooks";
import { createApp } from "./backend/app";
import { getDbInstance } from "./backend/db/dbAdapter";
import { getDataSource } from "./backend/db/dataSource";
import { logger } from "./backend/logger";

async function main() {
  const db = await getDbInstance();
  const ds = await getDataSource();
  const app = createApp(db, ds);

  // Elysia's lifecycle hooks don't run for plugin routes when Bun uses static
  // route optimization. Use Bun.serve directly with a wrapped fetch.
  app.compile();
  const elysiaFetch = app.fetch;
  Bun.serve({
    port: 3000,
    fetch: async (request, server) => {
      const start = performance.now();
      const response = await elysiaFetch(request);
      const path = new URL(request.url).pathname;
      const status = response.status;
      const durationMs = Math.round(performance.now() - start);
      const ip = server?.requestIP?.(request)?.address ?? "unknown";
      logger.info(
        { method: request.method, path, status, durationMs, ip },
        "http request"
      );
      return response;
    },
  });
  logger.info({ url: "http://localhost:3000/" }, "Server running");
}
main();
