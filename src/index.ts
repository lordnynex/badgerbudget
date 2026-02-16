import "reflect-metadata";
import { app } from "./backend/app";
import { ensureDb } from "./backend/db/dbAdapter";

async function main() {
  await ensureDb();
  app.listen(3000);
  console.log("🚀 Server running at http://localhost:3000/");
}
main();
