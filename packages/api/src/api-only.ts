import "reflect-metadata";
import { getDbInstance } from "./db/dbAdapter";
import { getDataSource, getProjectRoot } from "./db/dataSource";
import { createApi } from "./services/api";
import { createContextFn } from "./trpc/context";
import { createFetchHandler } from "./server";
import { logger } from "./logger";

const port = Number(process.env.PORT) || 3000;

async function main() {
  const db = await getDbInstance();
  const ds = await getDataSource();
  const api = createApi(db, ds);
  const createContext = createContextFn({ api });
  const projectRoot = getProjectRoot();

  const fetch = createFetchHandler({
    api,
    createContext,
    serveFrontend: false,
    projectRoot,
  });

  Bun.serve({
    port,
    fetch: async (request, server) => fetch(request, server),
  });

  logger.info({ url: `http://localhost:${port}/`, mode: "api-only" }, "Server running");
}

main();
