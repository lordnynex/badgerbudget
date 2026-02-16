import type { DataSource } from "typeorm";
import { join } from "path";
import { mkdir } from "fs/promises";
import { getDataSourcePromise } from "./dataSource";

const globalForDb = globalThis as unknown as {
  __badgerInitPromise?: Promise<void>;
  __badgerDataSource?: DataSource;
};

function getDataSource(): DataSource | null {
  return globalForDb.__badgerDataSource ?? null;
}

function getInitPromise(): Promise<void> {
  if (globalForDb.__badgerDataSource?.isInitialized) return Promise.resolve();
  if (!globalForDb.__badgerInitPromise) {
    globalForDb.__badgerInitPromise = (async () => {
      const dataDir = join(import.meta.dir, "../../..", "data");
      await mkdir(dataDir, { recursive: true });
      const ds = await getDataSourcePromise();
      globalForDb.__badgerDataSource = ds;
    })();
  }
  return globalForDb.__badgerInitPromise;
}

export async function ensureDb(): Promise<void> {
  await getInitPromise();
}

export interface DbLike {
  query(sql: string, ...bound: unknown[]): {
    get(...args: unknown[]): Promise<unknown>;
    all(...args: unknown[]): Promise<unknown[]>;
  };
  run(sql: string, params?: unknown[]): Promise<void>;
}

export function getDb(): DbLike {
  return {
    query(sql: string, ...bound: unknown[]) {
      return {
        get: async (...args: unknown[]) => {
          await ensureDb();
          const ds = getDataSource();
          if (!ds) throw new Error("Database not initialized");
          const flat = [...bound, ...args].flat();
          const rows = await ds.query(sql, flat as unknown[]);
          return Array.isArray(rows) ? rows[0] : rows;
        },
        all: async (...args: unknown[]) => {
          await ensureDb();
          const ds = getDataSource();
          if (!ds) throw new Error("Database not initialized");
          const flat = [...bound, ...args].flat();
          const rows = await ds.query(sql, flat as unknown[]);
          return Array.isArray(rows) ? rows : [];
        },
      };
    },
    run: async (sql: string, params: unknown[] = []) => {
      await ensureDb();
      const ds = getDataSource();
      if (!ds) throw new Error("Database not initialized");
      await ds.query(sql, params as unknown[]);
    },
  };
}
