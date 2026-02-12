import { Database } from "bun:sqlite";

const DB_PATH = import.meta.dir + "/../../data/badger.db";

let db: Database | null = null;

export function getDb(): Database {
  if (!db) {
    db = new Database(DB_PATH);
    initSchema(db);
  }
  return db;
}

function initSchema(database: Database) {
  database.run(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      year INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  database.run(`
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      year INTEGER NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  database.run(`
    CREATE TABLE IF NOT EXISTS line_items (
      id TEXT PRIMARY KEY,
      budget_id TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      comments TEXT,
      unit_cost REAL NOT NULL,
      quantity REAL NOT NULL,
      historical_costs TEXT,
      FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE
    )
  `);
  database.run(`
    CREATE TABLE IF NOT EXISTS scenarios (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      inputs TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
}
