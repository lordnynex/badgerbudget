import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { join } from "path";
import type { DbLike } from "./db/dbAdapter";
import { createApi } from "./services/api";
import { createApiRoutes } from "./routes";
import { logger } from "./logger";
import { accessLog } from "./middleware/accessLog";

const projectRoot = join(import.meta.dir, "../..");
const distDir = join(projectRoot, "dist");

export function createApp(db: DbLike) {
  const api = createApi(db);
  const apiRoutes = createApiRoutes(api);

  return new Elysia()
    .use(cors())
    .decorate("log", logger)
    .use(accessLog(logger))
    .use(apiRoutes)
    .get("/data/export.json", () => {
      const file = Bun.file(join(projectRoot, "data", "export.json"));
      return new Response(file, {
        headers: { "Content-Type": "application/json" },
      });
    })
    .get("/", () => {
      const index = Bun.file(join(distDir, "index.html"));
      return new Response(index, {
        headers: { "Content-Type": "text/html" },
      });
    })
    .use(
      staticPlugin({
        assets: distDir,
        prefix: "/",
        indexHTML: false,
      })
    )
    .onError(({ code, error, set }) => {
      if (code === "NOT_FOUND") {
        const index = Bun.file(join(distDir, "index.html"));
        if (index.size > 0) {
          set.status = 200;
          return new Response(index, {
            headers: { "Content-Type": "text/html" },
          });
        }
        set.status = 503;
        return new Response("Build required. Run: bun run build", {
          headers: { "Content-Type": "text/plain" },
        });
      }
      throw error;
    });
}

export type App = ReturnType<typeof createApp>;
