import "reflect-metadata";
import { createApp } from "./backend/app";
import { getDbInstance } from "./backend/db/dbAdapter";

async function main() {
  const db = await getDbInstance();
  const app = createApp(db);
  app.listen(3000);
  console.log("🚀 Server running at http://localhost:3000/");
}
main();
