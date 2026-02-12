import { getDb } from "./db";

const DEFAULT_INPUTS = {
  profitTarget: 2500,
  staffCount: 14,
  maxOccupancy: 75,
  complimentaryTickets: 0,
  dayPassPrice: 50,
  dayPassesSold: 0,
  ticketPrices: {
    proposedPrice1: 200,
    proposedPrice2: 250,
    proposedPrice3: 300,
    staffPrice1: 150,
    staffPrice2: 125,
    staffPrice3: 100,
  },
};

function uuid(): string {
  return crypto.randomUUID();
}

export function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export const api = {
  events: {
    list: async () => {
      const db = getDb();
      const rows = db.query("SELECT * FROM events ORDER BY year DESC, name").all();
      return rows as Array<{ id: string; name: string; description: string | null; year: number | null; created_at: string }>;
    },
    get: async (id: string) => {
      const db = getDb();
      const row = db.query("SELECT * FROM events WHERE id = ?").get(id);
      return row as { id: string; name: string; description: string | null; year: number | null; created_at: string } | null;
    },
    create: async (body: { name: string; description?: string; year?: number }) => {
      const db = getDb();
      const id = uuid();
      db.run(
        "INSERT INTO events (id, name, description, year) VALUES (?, ?, ?, ?)",
        [id, body.name, body.description ?? null, body.year ?? null]
      );
      return { id, name: body.name, description: body.description ?? null, year: body.year ?? null };
    },
    update: async (id: string, body: { name?: string; description?: string; year?: number }) => {
      const db = getDb();
      const existing = db.query("SELECT * FROM events WHERE id = ?").get(id);
      if (!existing) return null;
      const row = existing as Record<string, unknown>;
      const name = (body.name ?? row.name) as string;
      const description = (body.description !== undefined ? body.description : row.description) as string | null;
      const year = (body.year !== undefined ? body.year : row.year) as number | null;
      db.run("UPDATE events SET name = ?, description = ?, year = ? WHERE id = ?", [name, description, year, id]);
      return { id, name, description, year };
    },
    delete: async (id: string) => {
      const db = getDb();
      db.run("DELETE FROM events WHERE id = ?", [id]);
      return { ok: true };
    },
  },
  budgets: {
    list: async () => {
      const db = getDb();
      const rows = db.query("SELECT * FROM budgets ORDER BY year DESC, name").all();
      return rows as Array<{ id: string; name: string; year: number; description: string | null; created_at: string }>;
    },
    get: async (id: string) => {
      const db = getDb();
      const budget = db.query("SELECT * FROM budgets WHERE id = ?").get(id);
      if (!budget) return null;
      const items = db
        .query("SELECT * FROM line_items WHERE budget_id = ? ORDER BY name")
        .all(id) as Array<{
        id: string;
        budget_id: string;
        name: string;
        category: string;
        comments: string | null;
        unit_cost: number;
        quantity: number;
        historical_costs: string | null;
      }>;
      return {
        ...(budget as Record<string, unknown>),
        lineItems: items.map((i) => ({
          id: i.id,
          name: i.name,
          category: i.category,
          comments: i.comments ?? undefined,
          unitCost: i.unit_cost,
          quantity: i.quantity,
          historicalCosts: i.historical_costs ? JSON.parse(i.historical_costs) : undefined,
        })),
      };
    },
    create: async (body: { name: string; year: number; description?: string }) => {
      const db = getDb();
      const id = uuid();
      db.run(
        "INSERT INTO budgets (id, name, year, description) VALUES (?, ?, ?, ?)",
        [id, body.name, body.year, body.description ?? null]
      );
      return { id, ...body };
    },
    update: async (id: string, body: { name?: string; year?: number; description?: string }) => {
      const db = getDb();
      const existing = db.query("SELECT * FROM budgets WHERE id = ?").get(id);
      if (!existing) return null;
      const budget = existing as Record<string, unknown>;
      const name = (body.name ?? budget.name) as string;
      const year = (body.year ?? budget.year) as number;
      const description = (body.description !== undefined ? body.description : budget.description) as string | null;
      db.run("UPDATE budgets SET name = ?, year = ?, description = ? WHERE id = ?", [name, year, description, id]);
      return { id, name, year, description };
    },
    delete: async (id: string) => {
      const db = getDb();
      db.run("DELETE FROM line_items WHERE budget_id = ?", [id]);
      db.run("DELETE FROM budgets WHERE id = ?", [id]);
      return { ok: true };
    },
    addLineItem: async (
      budgetId: string,
      body: {
        name: string;
        category: string;
        comments?: string;
        unitCost: number;
        quantity: number;
        historicalCosts?: Record<string, number>;
      }
    ) => {
      const db = getDb();
      const itemId = uuid();
      db.run(
        "INSERT INTO line_items (id, budget_id, name, category, comments, unit_cost, quantity, historical_costs) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [itemId, budgetId, body.name, body.category, body.comments ?? null, body.unitCost, body.quantity, body.historicalCosts ? JSON.stringify(body.historicalCosts) : null]
      );
      return {
        id: itemId,
        ...body,
      };
    },
    updateLineItem: async (
      budgetId: string,
      itemId: string,
      body: Partial<{
        name: string;
        category: string;
        comments: string;
        unitCost: number;
        quantity: number;
        historicalCosts: Record<string, number>;
      }>
    ) => {
      const db = getDb();
      const existing = db.query("SELECT * FROM line_items WHERE id = ? AND budget_id = ?").get(itemId, budgetId);
      if (!existing) return null;
      const row = existing as Record<string, unknown>;
      const name = (body.name ?? row.name) as string;
      const category = (body.category ?? row.category) as string;
      const comments = (body.comments !== undefined ? body.comments : row.comments) as string | null;
      const unitCost = (body.unitCost ?? row.unit_cost) as number;
      const quantity = (body.quantity ?? row.quantity) as number;
      const historicalCosts = (
        body.historicalCosts !== undefined
          ? JSON.stringify(body.historicalCosts)
          : row.historical_costs
      ) as string | null;
      db.run(
        "UPDATE line_items SET name = ?, category = ?, comments = ?, unit_cost = ?, quantity = ?, historical_costs = ? WHERE id = ? AND budget_id = ?",
        [name, category, comments, unitCost, quantity, historicalCosts, itemId, budgetId]
      );
      return { id: itemId, name, category, comments, unitCost, quantity, historicalCosts };
    },
    deleteLineItem: async (budgetId: string, itemId: string) => {
      const db = getDb();
      db.run("DELETE FROM line_items WHERE id = ? AND budget_id = ?", [itemId, budgetId]);
      return { ok: true };
    },
  },
  scenarios: {
    list: async () => {
      const db = getDb();
      const rows = db.query("SELECT * FROM scenarios ORDER BY name").all();
      return rows as Array<{ id: string; name: string; description: string | null; inputs: string; created_at: string }>;
    },
    get: async (id: string) => {
      const db = getDb();
      const row = db.query("SELECT * FROM scenarios WHERE id = ?").get(id);
      if (!row) return null;
      const r = row as Record<string, unknown>;
      return {
        ...r,
        inputs: JSON.parse(r.inputs as string),
      };
    },
    create: async (body: { name: string; description?: string; inputs?: Record<string, unknown> }) => {
      const db = getDb();
      const id = uuid();
      const inputs = body.inputs ?? DEFAULT_INPUTS;
      db.run(
        "INSERT INTO scenarios (id, name, description, inputs) VALUES (?, ?, ?, ?)",
        [id, body.name, body.description ?? null, JSON.stringify(inputs)]
      );
      return { id, name: body.name, description: body.description, inputs };
    },
    update: async (
      id: string,
      body: { name?: string; description?: string; inputs?: Record<string, unknown> }
    ) => {
      const db = getDb();
      const existing = db.query("SELECT * FROM scenarios WHERE id = ?").get(id);
      if (!existing) return null;
      const row = existing as Record<string, unknown>;
      const name = (body.name ?? row.name) as string;
      const description = (body.description !== undefined ? body.description : row.description) as string | null;
      const inputs = body.inputs ?? JSON.parse(row.inputs as string);
      db.run("UPDATE scenarios SET name = ?, description = ?, inputs = ? WHERE id = ?", [name, description, JSON.stringify(inputs), id]);
      return { id, name, description, inputs };
    },
    delete: async (id: string) => {
      const db = getDb();
      db.run("DELETE FROM scenarios WHERE id = ?", [id]);
      return { ok: true };
    },
  },
  seed: async () => {
    const db = getDb();
    const budgetCount = (db.query("SELECT COUNT(*) as c FROM budgets").get() as { c: number }).c;
    const eventCount = (db.query("SELECT COUNT(*) as c FROM events").get() as { c: number }).c;
    if (budgetCount > 0 && eventCount > 0) return { ok: true, message: "Already seeded" };

    try {
      const exportPath = import.meta.dir + "/../../data/export.json";
      const file = Bun.file(exportPath);
      const raw = (await file.json()) as {
        BadgerComparisonBudget?: { line_items?: Array<{ item: string; badger_south?: number | null; badger_60?: number | null; badger_59?: number | null }> };
      };

      if (eventCount === 0) {
        const events = [
          { id: uuid(), name: "Badger 59", description: "Badger event 2019.", year: 2019 },
          { id: uuid(), name: "Badger 60", description: "Badger event 2020.", year: 2020 },
          { id: uuid(), name: "Badger South 2025", description: "Badger South event 2025.", year: 2025 },
          { id: uuid(), name: "Badger South 2026", description: "Badger South event 2026.", year: 2026 },
        ];
        for (const e of events) {
          db.run("INSERT INTO events (id, name, description, year) VALUES (?, ?, ?, ?)", [
            e.id,
            e.name,
            e.description,
            e.year,
          ]);
        }
      }

      const CATEGORY_MAP: Record<string, string> = {
        Campground: "Venue",
        "Trash bags (individual)": "Miscellaneous",
        "Large white envelopes": "Admin",
        Food: "Food & Beverage",
        Bar: "Food & Beverage",
        Coffee: "Food & Beverage",
        Ice: "Food & Beverage",
        "First Aid Restock": "Equipment",
        O2: "Equipment",
        "Run Gift": "Merchandise",
        "Run Pins": "Merchandise",
        "Program Print": "Admin",
        "Trash Service": "Venue",
        Firewood: "Equipment",
        Propane: "Equipment",
        "Generator Gas": "Equipment",
        "Truck Fuel": "Transport",
        "Truck Rental": "Transport",
        "Labor Loading/Unloading": "Admin",
        Miscellaneous: "Miscellaneous",
        "Garage Rent": "Venue",
        "Merchant Fees": "Admin",
        "PayPal Fees": "Admin",
        Postage: "Admin",
      };

      let budgetId: string | undefined;
      if (budgetCount === 0) {
        budgetId = uuid();
        db.run(
          "INSERT INTO budgets (id, name, year, description) VALUES (?, ?, ?, ?)",
          [budgetId, "Badger South 2025", 2025, "Initial budget from Badger South event data."]
        );
      }

      const items = budgetId
        ? (raw.BadgerComparisonBudget?.line_items ?? [])
        : [];
      for (const li of items) {
        const unitCost = li.badger_south ?? li.badger_60 ?? li.badger_59 ?? 0;
        const category = CATEGORY_MAP[li.item] ?? "Miscellaneous";
        const historicalCosts: Record<string, number> = {};
        if (li.badger_59 != null) historicalCosts.badger_59 = li.badger_59;
        if (li.badger_60 != null) historicalCosts.badger_60 = li.badger_60;
        if (li.badger_south != null) historicalCosts.badger_south = li.badger_south;

        db.run(
          "INSERT INTO line_items (id, budget_id, name, category, comments, unit_cost, quantity, historical_costs) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [uuid(), budgetId!, li.item, category, null, unitCost, 1, Object.keys(historicalCosts).length > 0 ? JSON.stringify(historicalCosts) : null]
        );
      }

      let scenarioId: string | undefined;
      if (budgetCount === 0) {
        scenarioId = uuid();
        db.run(
          "INSERT INTO scenarios (id, name, description, inputs) VALUES (?, ?, ?, ?)",
          [scenarioId, "Badger South Default", "Default scenario from original Badger South inputs.", JSON.stringify(DEFAULT_INPUTS)]
        );
      }

      return { ok: true, budgetId, scenarioId };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  },
};
