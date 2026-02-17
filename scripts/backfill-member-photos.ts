#!/usr/bin/env bun
/**
 * Backfill member photos: optimize full-size images and generate thumbnails.
 * Run this after adding the photo_thumbnail column to process existing members.
 */
import "reflect-metadata";
import { getDbInstance } from "../src/backend/db/dbAdapter";
import { logger } from "../src/backend/logger";
import { ImageService } from "../src/backend/services/ImageService";
import { ALL_MEMBERS_ID } from "../src/shared/lib/constants";

async function main() {
  logger.info("Connecting to database...");
  const db = await getDbInstance();

  const rows = (await db
    .query("SELECT id, name, photo FROM members WHERE id != ? AND photo IS NOT NULL")
    .all(ALL_MEMBERS_ID)) as Array<Record<string, unknown>>;

  logger.info({ count: rows.length }, "Found members with photos to process");

  let processed = 0;
  let failed = 0;

  for (const row of rows) {
    const id = row.id as string;
    const name = row.name as string;
    const photoBlob = row.photo as Uint8Array | Buffer | null;

    if (!photoBlob) continue;

    try {
      const buffer = Buffer.from(photoBlob);

      const [optimizedPhoto, thumbnail] = await Promise.all([
        ImageService.optimize(buffer),
        ImageService.createThumbnail(buffer),
      ]);

      const finalPhoto = optimizedPhoto ?? buffer;
      const finalThumbnail = thumbnail;

      await db.run(
        "UPDATE members SET photo = ?, photo_thumbnail = ? WHERE id = ?",
        [finalPhoto, finalThumbnail, id]
      );

      processed++;
      logger.info({ id, name }, "Processed");
    } catch (err) {
      failed++;
      logger.warn({ err, id, name }, "Failed to process member photo");
    }
  }

  logger.info({ processed, failed, total: rows.length }, "Backfill complete");
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  logger.error({ err }, "Backfill failed");
  process.exit(1);
});
