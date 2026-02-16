import "reflect-metadata";
import { createApp } from "./backend/app";
import { getDbInstance } from "./backend/db/dbAdapter";
import { logger } from "./backend/logger";

async function main() {
  const db = await getDbInstance();
  const app = createApp(db);
  app.listen(3000);
  logger.info({ url: "http://localhost:3000/" }, "Server running");
}
main();
