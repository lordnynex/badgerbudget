import type { DataSource } from "typeorm";
import { join } from "path";
import { mkdir } from "fs/promises";
import { getDataSource } from "./dataSource";

export interface DbLike {
  query(sql: string, ...bound: unknown[]): {
    get(...args: unknown[]): Promise<unknown>;
    all(...args: unknown[]): Promise<unknown[]>;
  };
  run(sql: string, params?: unknown[]): Promise<void>;
}

const globalForDb = globalThis as unknown as { __badgerDbInstancePromise?: Promise<DbLike> };

function makeDbLike(ds: DataSource): DbLike {
  return {
    query(sql: string, ...bound: unknown[]) {
      return {
        get: async (...args: unknown[]) => {
          const flat = [...bound, ...args].flat();
          const rows = await ds.query(sql, flat as unknown[]);
          return Array.isArray(rows) ? rows[0] : rows;
        },
        all: async (...args: unknown[]) => {
          const flat = [...bound, ...args].flat();
          const rows = await ds.query(sql, flat as unknown[]);
          return Array.isArray(rows) ? rows : [];
        },
      };
    },
    run: async (sql: string, params: unknown[] = []) => {
      await ds.query(sql, params as unknown[]);
    },
  };
}

/**
 * Returns the single DB instance. Call once at startup and inject the result everywhere.
 * No further connection setup happens inside this or in the returned DbLike.
 */
export async function getDbInstance(): Promise<DbLike> {
  if (!globalForDb.__badgerDbInstancePromise) {
    const dataDir = join(import.meta.dir, "../../../..", "data");
    await mkdir(dataDir, { recursive: true });
    const ds = await getDataSource();
    globalForDb.__badgerDbInstancePromise = Promise.resolve(makeDbLike(ds));
  }
  return globalForDb.__badgerDbInstancePromise;
}
