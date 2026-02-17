#!/usr/bin/env bun
/**
 * Deduplicate contact addresses.
 * When a contact has multiple addresses with the same content, keeps the one
 * labeled "home" and deletes duplicates (preferring home over work).
 * Run: bun scripts/deduplicate-contact-addresses.ts
 */
import "reflect-metadata";
import { getDbInstance } from "../src/backend/db/dbAdapter";
import { logger } from "../src/backend/logger";

const ADDRESS_TYPE_PRIORITY: Record<string, number> = {
  home: 0,
  work: 1,
  postal: 2,
  other: 3,
};

function normalizeAddressKey(a: {
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
}): string {
  const n = (s: string | null | undefined) =>
    (s ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  return [
    n(a.address_line1),
    n(a.address_line2),
    n(a.city),
    n(a.state),
    n(a.postal_code),
    n(a.country ?? "US"),
  ].join("|");
}

interface AddressRow {
  id: string;
  contact_id: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  type: string;
}

async function main() {
  logger.info("Connecting to database...");
  const db = await getDbInstance();

  const rows = (await db
    .query(
      "SELECT id, contact_id, address_line1, address_line2, city, state, postal_code, country, type FROM contact_addresses"
    )
    .all()) as AddressRow[];

  logger.info({ count: rows.length }, "Loaded contact addresses");

  let deleted = 0;
  const byContact = new Map<string, AddressRow[]>();
  for (const row of rows) {
    const list = byContact.get(row.contact_id) ?? [];
    list.push(row);
    byContact.set(row.contact_id, list);
  }

  for (const [contactId, addrs] of byContact) {
    if (addrs.length < 2) continue;

    const byKey = new Map<string, AddressRow[]>();
    for (const a of addrs) {
      const key = normalizeAddressKey(a);
      const list = byKey.get(key) ?? [];
      list.push(a);
      byKey.set(key, list);
    }

    for (const [, group] of byKey) {
      if (group.length < 2) continue;

      const sorted = [...group].sort(
        (a, b) =>
          (ADDRESS_TYPE_PRIORITY[a.type] ?? 99) -
          (ADDRESS_TYPE_PRIORITY[b.type] ?? 99)
      );
      const keep = sorted[0];
      const toDelete = sorted.slice(1);

      for (const a of toDelete) {
        await db.run("DELETE FROM contact_addresses WHERE id = ?", [a.id]);
        deleted++;
        logger.debug(
          { contactId, keptType: keep.type, deletedId: a.id, deletedType: a.type },
          "Deleted duplicate address"
        );
      }
    }
  }

  logger.info({ deleted, total: rows.length }, "Deduplication complete");
  process.exit(0);
}

main().catch((err) => {
  logger.error({ err }, "Deduplication failed");
  process.exit(1);
});
