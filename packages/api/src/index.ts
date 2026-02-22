import "reflect-metadata";
import { performance } from "node:perf_hooks";
import { join } from "path";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { getDbInstance } from "./db/dbAdapter";
import { getDataSource } from "./db/dataSource";
import { createApi } from "./services/api";
import { createContextFn } from "./trpc/context";
import { appRouter } from "./trpc/root";
import { logger } from "./logger";

const TRPC_PREFIX = "/trpc";
const projectRoot = join(import.meta.dir, "../../..");
const webDist = join(projectRoot, "packages", "web", "dist");
const adminDist = join(projectRoot, "packages", "app-admin", "dist");

async function main() {
  const db = await getDbInstance();
  const ds = await getDataSource();
  const api = createApi(db, ds);
  const createContext = createContextFn({ api });

  Bun.serve({
    port: 3000,
    fetch: async (request, server) => {
      const start = performance.now();
      const url = new URL(request.url);
      const path = url.pathname;

      if (path.startsWith(TRPC_PREFIX)) {
        const response = await fetchRequestHandler({
          endpoint: TRPC_PREFIX,
          req: request,
          router: appRouter,
          createContext,
        });
        const durationMs = Math.round(performance.now() - start);
        const ip = server?.requestIP?.(request)?.address ?? "unknown";
        logger.info(
          { method: request.method, path, status: response.status, durationMs, ip },
          "http request"
        );
        return response;
      }

      if (path.startsWith("/admin")) {
        const filePath = path === "/admin" || path === "/admin/"
          ? join(adminDist, "index.html")
          : join(adminDist, path.slice("/admin".length));
        try {
          const file = Bun.file(filePath);
          if (await file.exists()) {
            const contentType = path.endsWith(".html") ? "text/html" : path.endsWith(".js") ? "application/javascript" : path.endsWith(".css") ? "text/css" : undefined;
            const res = new Response(file, { headers: contentType ? { "Content-Type": contentType } : undefined });
            logger.info({ method: request.method, path, status: 200, durationMs: Math.round(performance.now() - start), ip: server?.requestIP?.(request)?.address ?? "unknown" }, "http request");
            return res;
          }
        } catch {
          // fall through to SPA fallback
        }
        const indexHtml = Bun.file(join(adminDist, "index.html"));
        if (await indexHtml.exists()) {
          logger.info({ method: request.method, path, status: 200, durationMs: Math.round(performance.now() - start), ip: server?.requestIP?.(request)?.address ?? "unknown" }, "http request");
          return new Response(indexHtml, { headers: { "Content-Type": "text/html" } });
        }
        const durationMs = Math.round(performance.now() - start);
        const ip = server?.requestIP?.(request)?.address ?? "unknown";
        logger.info({ method: request.method, path, status: 404, durationMs, ip }, "http request");
        return new Response("Not Found", { status: 404 });
      }

      const filePath = path === "/" ? join(webDist, "index.html") : join(webDist, path);
      try {
        const file = Bun.file(filePath);
        if (await file.exists()) {
          const contentType = path.endsWith(".html") ? "text/html" : path.endsWith(".js") ? "application/javascript" : path.endsWith(".css") ? "text/css" : undefined;
          const res = new Response(file, { headers: contentType ? { "Content-Type": contentType } : undefined });
          logger.info({ method: request.method, path, status: 200, durationMs: Math.round(performance.now() - start), ip: server?.requestIP?.(request)?.address ?? "unknown" }, "http request");
          return res;
        }
      } catch {
        // fall through to SPA fallback
      }
      const indexHtml = Bun.file(join(webDist, "index.html"));
      if (await indexHtml.exists()) {
        logger.info({ method: request.method, path, status: 200, durationMs: Math.round(performance.now() - start), ip: server?.requestIP?.(request)?.address ?? "unknown" }, "http request");
        return new Response(indexHtml, { headers: { "Content-Type": "text/html" } });
      }

      const durationMs = Math.round(performance.now() - start);
      const ip = server?.requestIP?.(request)?.address ?? "unknown";
      logger.info({ method: request.method, path, status: 404, durationMs, ip }, "http request");
      return new Response("Not Found", { status: 404 });
    },
  });

  logger.info({ url: "http://localhost:3000/" }, "Server running");
}

main();
