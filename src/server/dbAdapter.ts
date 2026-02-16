import { dataSource } from "./dataSource";

let initialized = false;

export async function ensureDb(): Promise<void> {
  if (!initialized) {
    await dataSource.initialize();
    await ensureSchema();
    initialized = true;
  }
}

async function ensureSchema(): Promise<void> {
  const q = dataSource.createQueryRunner();
  try {
    await q.query(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        year INTEGER,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
    for (const [col, typ] of [
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
    ] as [string, string][]) {
      try {
        await q.query(`ALTER TABLE events ADD COLUMN ${col} ${typ}`);
      } catch {
        /* column exists */
      }
    }
    await q.query(`
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
    for (const [col, typ] of [["completed", "INTEGER"], ["due_date", "TEXT"]] as [string, string][]) {
      try {
        await q.query(`ALTER TABLE event_planning_milestones ADD COLUMN ${col} ${typ}`);
      } catch {
        /* column exists */
      }
    }
    await q.query(`
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
    for (const [col, typ] of [
      ["position", "TEXT"],
      ["email", "TEXT"],
      ["member_since", "TEXT"],
      ["is_baby", "INTEGER"],
    ] as [string, string][]) {
      try {
        await q.query(`ALTER TABLE members ADD COLUMN ${col} ${typ}`);
      } catch {
        /* column exists */
      }
    }
    await q.query(`
      CREATE TABLE IF NOT EXISTS event_milestone_members (
        id TEXT PRIMARY KEY,
        milestone_id TEXT NOT NULL,
        member_id TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        FOREIGN KEY (milestone_id) REFERENCES event_planning_milestones(id) ON DELETE CASCADE,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
        UNIQUE(milestone_id, member_id)
      )
    `);
    await q.query(`
      CREATE TABLE IF NOT EXISTS event_packing_categories (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        name TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      )
    `);
    await q.query(`
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
    await q.query(`
      CREATE TABLE IF NOT EXISTS event_volunteers (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        name TEXT NOT NULL,
        department TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      )
    `);
    await q.query(`
      CREATE TABLE IF NOT EXISTS event_assignments (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL CHECK (category IN ('planning', 'during')),
        sort_order INTEGER DEFAULT 0,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      )
    `);
    await q.query(`
      CREATE TABLE IF NOT EXISTS event_assignment_members (
        id TEXT PRIMARY KEY,
        assignment_id TEXT NOT NULL,
        member_id TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        FOREIGN KEY (assignment_id) REFERENCES event_assignments(id) ON DELETE CASCADE,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
        UNIQUE(assignment_id, member_id)
      )
    `);
    await q.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        year INTEGER NOT NULL,
        description TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
    await q.query(`
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
    await q.query(`
      CREATE TABLE IF NOT EXISTS scenarios (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        inputs TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
    const { ALL_MEMBERS_ID } = await import("@/lib/constants");
    const allMembersExists = await q.query("SELECT 1 FROM members WHERE id = ?", [ALL_MEMBERS_ID]);
    if (!allMembersExists || (Array.isArray(allMembersExists) && allMembersExists.length === 0)) {
      await q.query("INSERT INTO members (id, name) VALUES (?, ?)", [ALL_MEMBERS_ID, "All Members"]);
    }
    await q.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL CHECK (type IN ('person', 'organization')) DEFAULT 'person',
        status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'deleted')) DEFAULT 'active',
        display_name TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        organization_name TEXT,
        notes TEXT,
        how_we_know_them TEXT,
        ok_to_email TEXT CHECK (ok_to_email IN ('yes', 'no', 'unknown')) DEFAULT 'unknown',
        ok_to_mail TEXT CHECK (ok_to_mail IN ('yes', 'no', 'unknown')) DEFAULT 'unknown',
        do_not_contact INTEGER DEFAULT 0,
        club_name TEXT,
        role TEXT,
        uid TEXT UNIQUE,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        deleted_at TEXT
      )
    `);
    await q.query(`
      CREATE TABLE IF NOT EXISTS contact_emails (
        id TEXT PRIMARY KEY,
        contact_id TEXT NOT NULL,
        email TEXT NOT NULL,
        type TEXT CHECK (type IN ('work', 'home', 'other')) DEFAULT 'other',
        is_primary INTEGER DEFAULT 0,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
      )
    `);
    await q.query(`
      CREATE TABLE IF NOT EXISTS contact_phones (
        id TEXT PRIMARY KEY,
        contact_id TEXT NOT NULL,
        phone TEXT NOT NULL,
        type TEXT CHECK (type IN ('work', 'home', 'cell', 'other')) DEFAULT 'other',
        is_primary INTEGER DEFAULT 0,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
      )
    `);
    await q.query(`
      CREATE TABLE IF NOT EXISTS contact_addresses (
        id TEXT PRIMARY KEY,
        contact_id TEXT NOT NULL,
        address_line1 TEXT,
        address_line2 TEXT,
        city TEXT,
        state TEXT,
        postal_code TEXT,
        country TEXT DEFAULT 'US',
        type TEXT CHECK (type IN ('home', 'work', 'postal', 'other')) DEFAULT 'home',
        is_primary_mailing INTEGER DEFAULT 0,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
      )
    `);
    await q.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      )
    `);
    await q.query(`
      CREATE TABLE IF NOT EXISTS contact_tags (
        contact_id TEXT NOT NULL,
        tag_id TEXT NOT NULL,
        PRIMARY KEY (contact_id, tag_id),
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `);
    await q.query(`
      CREATE TABLE IF NOT EXISTS mailing_lists (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        list_type TEXT NOT NULL CHECK (list_type IN ('static', 'dynamic', 'hybrid')) DEFAULT 'static',
        event_id TEXT,
        template TEXT,
        criteria TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
      )
    `);
    await q.query(`
      CREATE TABLE IF NOT EXISTS mailing_list_members (
        id TEXT PRIMARY KEY,
        list_id TEXT NOT NULL,
        contact_id TEXT NOT NULL,
        added_by TEXT,
        added_at TEXT DEFAULT (datetime('now')),
        source TEXT CHECK (source IN ('manual', 'import', 'rule')) DEFAULT 'manual',
        suppressed INTEGER DEFAULT 0,
        suppress_reason TEXT,
        unsubscribed INTEGER DEFAULT 0,
        FOREIGN KEY (list_id) REFERENCES mailing_lists(id) ON DELETE CASCADE,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
        UNIQUE(list_id, contact_id)
      )
    `);
    await q.query(`
      CREATE TABLE IF NOT EXISTS mailing_batches (
        id TEXT PRIMARY KEY,
        list_id TEXT NOT NULL,
        event_id TEXT,
        name TEXT NOT NULL,
        created_by TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        recipient_count INTEGER DEFAULT 0,
        FOREIGN KEY (list_id) REFERENCES mailing_lists(id) ON DELETE CASCADE,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
      )
    `);
    await q.query(`
      CREATE TABLE IF NOT EXISTS mailing_batch_recipients (
        id TEXT PRIMARY KEY,
        batch_id TEXT NOT NULL,
        contact_id TEXT NOT NULL,
        snapshot_name TEXT NOT NULL,
        snapshot_address_line1 TEXT,
        snapshot_address_line2 TEXT,
        snapshot_city TEXT,
        snapshot_state TEXT,
        snapshot_postal_code TEXT,
        snapshot_country TEXT,
        snapshot_organization TEXT,
        status TEXT NOT NULL CHECK (status IN ('queued', 'printed', 'mailed', 'returned', 'invalid')) DEFAULT 'queued',
        invalid_reason TEXT,
        returned_reason TEXT,
        FOREIGN KEY (batch_id) REFERENCES mailing_batches(id) ON DELETE CASCADE,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
      )
    `);
    await q.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id TEXT PRIMARY KEY,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        user_id TEXT,
        details TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
  } finally {
    await q.release();
  }
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
          const flat = [...bound, ...args].flat();
          const rows = await dataSource.query(sql, flat as unknown[]);
          return Array.isArray(rows) ? rows[0] : rows;
        },
        all: async (...args: unknown[]) => {
          await ensureDb();
          const flat = [...bound, ...args].flat();
          const rows = await dataSource.query(sql, flat as unknown[]);
          return Array.isArray(rows) ? rows : [];
        },
      };
    },
    run: async (sql: string, params: unknown[] = []) => {
      await ensureDb();
      await dataSource.query(sql, params as unknown[]);
    },
  };
}
