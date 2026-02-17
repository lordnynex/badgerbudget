#!/usr/bin/env bun
/**
 * Run database migrations.
 * Migrations are applied automatically when the DataSource is initialized.
 */
import "reflect-metadata";
import { getDataSource } from "../backend/db/dataSource";
import { logger } from "../backend/logger";

async function main() {
  logger.info("Running database migrations...");
  await getDataSource();
  logger.info("Migrations complete");
  process.exit(0);
}

main().catch((err) => {
  logger.error({ err }, "Migration failed");
  process.exit(1);
});
