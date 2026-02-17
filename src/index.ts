import "reflect-metadata";
import { createApp } from "./backend/app";
import { getDbInstance } from "./backend/db/dbAdapter";
import { getDataSource } from "./backend/db/dataSource";
import { logger } from "./backend/logger";

async function main() {
  const db = await getDbInstance();
  const ds = await getDataSource();
  const app = createApp(db, ds);
  app.listen(3000);
  logger.info({ url: "http://localhost:3000/" }, "Server running");
}
main();
