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

function hasColumn(db: Database, table: string, col: string): boolean {
  const rows = db.query(`SELECT name FROM pragma_table_info(?) WHERE name = ?`).all(table, col) as { name: string }[];
  return rows.length > 0;
}

function migratePackingToCategories(database: Database) {
  const items = database.query("SELECT * FROM event_packing_items").all() as Array<{
    id: string;
    event_id: string;
    category: string;
    name: string;
    sort_order: number;
  }>;
  database.run(`
    CREATE TABLE event_packing_items_new (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      quantity INTEGER,
      note TEXT,
      loaded INTEGER DEFAULT 0,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES event_packing_categories(id) ON DELETE CASCADE
    )
  `);
  const eventCategories = new Map<string, Map<string, string>>();
  for (const item of items) {
    let catMap = eventCategories.get(item.event_id);
    if (!catMap) {
      catMap = new Map();
      eventCategories.set(item.event_id, catMap);
    }
    if (!catMap.has(item.category)) {
      const catId = crypto.randomUUID();
      catMap.set(item.category, catId);
      const order = catMap.size - 1;
      database.run(
        "INSERT INTO event_packing_categories (id, event_id, name, sort_order) VALUES (?, ?, ?, ?)",
        [catId, item.event_id, item.category, order]
      );
    }
  }
  for (const item of items) {
    const catId = eventCategories.get(item.event_id)!.get(item.category)!;
    database.run(
      "INSERT INTO event_packing_items_new (id, event_id, category_id, name, sort_order, quantity, note, loaded) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [item.id, item.event_id, catId, item.name, item.sort_order ?? 0, null, null, 0]
    );
  }
  database.run("DROP TABLE event_packing_items");
  database.run("ALTER TABLE event_packing_items_new RENAME TO event_packing_items");
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
  // Migrate events table with new columns
  const eventCols: [string, string][] = [
    ["event_date", "TEXT"],
    ["event_url", "TEXT"],
    ["event_location", "TEXT"],
    ["event_location_embed", "TEXT"],
    ["ga_ticket_cost", "REAL"],
    ["day_pass_cost", "REAL"],
    ["ga_tickets_sold", "REAL"],
    ["day_passes_sold", "REAL"],
    ["budget_id", "TEXT"],
    ["scenario_id", "TEXT"],
    ["planning_notes", "TEXT"],
  ];
  for (const [col, typ] of eventCols) {
    if (!hasColumn(database, "events", col)) {
      try {
        database.run(`ALTER TABLE events ADD COLUMN ${col} ${typ}`);
      } catch {
        // Column may already exist
      }
    }
  }
  database.run(`
    CREATE TABLE IF NOT EXISTS event_planning_milestones (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      description TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    )
  `);
  const milestoneCols: [string, string][] = [
    ["completed", "INTEGER"],
    ["due_date", "TEXT"],
  ];
  for (const [col, typ] of milestoneCols) {
    if (!hasColumn(database, "event_planning_milestones", col)) {
      try {
        database.run(`ALTER TABLE event_planning_milestones ADD COLUMN ${col} ${typ}`);
      } catch {
        // Column may already exist
      }
    }
  }
  database.run(`
    CREATE TABLE IF NOT EXISTS event_packing_categories (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      name TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    )
  `);
  const hasOldPackingSchema = hasColumn(database, "event_packing_items", "category");
  if (hasOldPackingSchema) {
    migratePackingToCategories(database);
  } else {
    database.run(`
      CREATE TABLE IF NOT EXISTS event_packing_items (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        category_id TEXT NOT NULL,
        name TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        quantity INTEGER,
        note TEXT,
        loaded INTEGER DEFAULT 0,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES event_packing_categories(id) ON DELETE CASCADE
      )
    `);
  }
  database.run(`
    CREATE TABLE IF NOT EXISTS event_volunteers (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      name TEXT NOT NULL,
      department TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
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
  database.run(`
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone_number TEXT,
      address TEXT,
      birthday TEXT,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      photo BLOB,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  const memberCols: [string, string][] = [
    ["position", "TEXT"],
    ["email", "TEXT"],
    ["member_since", "TEXT"],
    ["is_baby", "INTEGER"],
  ];
  for (const [col, typ] of memberCols) {
    if (!hasColumn(database, "members", col)) {
      try {
        database.run(`ALTER TABLE members ADD COLUMN ${col} ${typ}`);
      } catch {
        // Column may already exist
      }
    }
  }
}
