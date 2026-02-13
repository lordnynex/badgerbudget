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

const VALID_POSITIONS = new Set([
  "President",
  "Vice President",
  "Road Captain",
  "Treasurer",
  "Recording Secretary",
  "Correspondence Secretary",
  "Member",
]);

function parsePhotoToBlob(photo: string): Buffer | null {
  if (!photo || typeof photo !== "string") return null;
  const base64 = photo.includes(",") ? photo.split(",")[1] : photo;
  if (!base64) return null;
  try {
    return Buffer.from(base64, "base64");
  } catch {
    return null;
  }
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
      const rows = db.query("SELECT * FROM events ORDER BY year DESC, name").all() as Array<Record<string, unknown>>;
      return rows.map((e) => ({
        id: e.id,
        name: e.name,
        description: e.description ?? null,
        year: e.year ?? null,
        event_date: e.event_date ?? null,
        event_url: e.event_url ?? null,
        event_location: e.event_location ?? null,
        event_location_embed: e.event_location_embed ?? null,
        ga_ticket_cost: e.ga_ticket_cost != null ? Number(e.ga_ticket_cost) : null,
        day_pass_cost: e.day_pass_cost != null ? Number(e.day_pass_cost) : null,
        ga_tickets_sold: e.ga_tickets_sold != null ? Number(e.ga_tickets_sold) : null,
        day_passes_sold: e.day_passes_sold != null ? Number(e.day_passes_sold) : null,
        budget_id: e.budget_id ?? null,
        scenario_id: e.scenario_id ?? null,
        planning_notes: e.planning_notes ?? null,
        created_at: e.created_at as string | undefined,
      }));
    },
    get: async (id: string) => {
      const db = getDb();
      const row = db.query("SELECT * FROM events WHERE id = ?").get(id);
      if (!row) return null;
      const e = row as Record<string, unknown>;
      const milestones = db
        .query("SELECT * FROM event_planning_milestones WHERE event_id = ? ORDER BY year, month, sort_order")
        .all(id) as Array<Record<string, unknown>>;
      const packing = db
        .query("SELECT * FROM event_packing_items WHERE event_id = ? ORDER BY category, sort_order, name")
        .all(id) as Array<Record<string, unknown>>;
      const volunteers = db
        .query("SELECT * FROM event_volunteers WHERE event_id = ? ORDER BY department, sort_order, name")
        .all(id) as Array<Record<string, unknown>>;
      return {
        ...e,
        event_date: e.event_date ?? null,
        event_url: e.event_url ?? null,
        event_location: e.event_location ?? null,
        event_location_embed: e.event_location_embed ?? null,
        ga_ticket_cost: e.ga_ticket_cost != null ? Number(e.ga_ticket_cost) : null,
        day_pass_cost: e.day_pass_cost != null ? Number(e.day_pass_cost) : null,
        ga_tickets_sold: e.ga_tickets_sold != null ? Number(e.ga_tickets_sold) : null,
        day_passes_sold: e.day_passes_sold != null ? Number(e.day_passes_sold) : null,
        budget_id: e.budget_id ?? null,
        scenario_id: e.scenario_id ?? null,
        planning_notes: e.planning_notes ?? null,
        milestones: milestones.map((m) => {
          const month = m.month as number;
          const year = m.year as number;
          const lastDay = new Date(year, month, 0);
          const defaultDueDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;
          return {
            id: m.id,
            event_id: m.event_id,
            month,
            year,
            description: m.description,
            sort_order: m.sort_order ?? 0,
            completed: m.completed === 1,
            due_date: (m.due_date as string | null) ?? defaultDueDate,
          };
        }),
        packingItems: packing.map((p) => ({
          id: p.id,
          event_id: p.event_id,
          category: p.category,
          name: p.name,
          sort_order: p.sort_order ?? 0,
        })),
        volunteers: volunteers.map((v) => ({
          id: v.id,
          event_id: v.event_id,
          name: v.name,
          department: v.department,
          sort_order: v.sort_order ?? 0,
        })),
      };
    },
    create: async (body: {
      name: string;
      description?: string;
      year?: number;
      event_date?: string;
      event_url?: string;
      event_location?: string;
      event_location_embed?: string;
      ga_ticket_cost?: number;
      day_pass_cost?: number;
      ga_tickets_sold?: number;
      day_passes_sold?: number;
      budget_id?: string;
      scenario_id?: string;
      planning_notes?: string;
    }) => {
      const db = getDb();
      const id = uuid();
      db.run(
        `INSERT INTO events (id, name, description, year, event_date, event_url, event_location, event_location_embed, ga_ticket_cost, day_pass_cost, ga_tickets_sold, day_passes_sold, budget_id, scenario_id, planning_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          body.name,
          body.description ?? null,
          body.year ?? null,
          body.event_date ?? null,
          body.event_url ?? null,
          body.event_location ?? null,
          body.event_location_embed ?? null,
          body.ga_ticket_cost ?? null,
          body.day_pass_cost ?? null,
          body.ga_tickets_sold ?? null,
          body.day_passes_sold ?? null,
          body.budget_id ?? null,
          body.scenario_id ?? null,
          body.planning_notes ?? null,
        ]
      );
      return api.events.get(id)!;
    },
    update: async (id: string, body: Partial<{
      name: string;
      description: string;
      year: number;
      event_date: string;
      event_url: string;
      event_location: string;
      event_location_embed: string;
      ga_ticket_cost: number;
      day_pass_cost: number;
      ga_tickets_sold: number;
      day_passes_sold: number;
      budget_id: string;
      scenario_id: string;
      planning_notes: string;
    }>) => {
      const db = getDb();
      const existing = db.query("SELECT * FROM events WHERE id = ?").get(id);
      if (!existing) return null;
      const row = existing as Record<string, unknown>;
      const get = (k: string, def: unknown) => (body[k as keyof typeof body] !== undefined ? body[k as keyof typeof body] : row[k] ?? def);
      const name = get("name", row.name) as string;
      const description = get("description", null) as string | null;
      const year = get("year", null) as number | null;
      const event_date = get("event_date", null) as string | null;
      const event_url = get("event_url", null) as string | null;
      const event_location = get("event_location", null) as string | null;
      const event_location_embed = get("event_location_embed", null) as string | null;
      const ga_ticket_cost = get("ga_ticket_cost", null) as number | null;
      const day_pass_cost = get("day_pass_cost", null) as number | null;
      const ga_tickets_sold = get("ga_tickets_sold", null) as number | null;
      const day_passes_sold = get("day_passes_sold", null) as number | null;
      const budget_id = get("budget_id", null) as string | null;
      const scenario_id = get("scenario_id", null) as string | null;
      const planning_notes = get("planning_notes", null) as string | null;
      db.run(
        `UPDATE events SET name = ?, description = ?, year = ?, event_date = ?, event_url = ?, event_location = ?, event_location_embed = ?, ga_ticket_cost = ?, day_pass_cost = ?, ga_tickets_sold = ?, day_passes_sold = ?, budget_id = ?, scenario_id = ?, planning_notes = ? WHERE id = ?`,
        [name, description, year, event_date, event_url, event_location, event_location_embed, ga_ticket_cost, day_pass_cost, ga_tickets_sold, day_passes_sold, budget_id, scenario_id, planning_notes, id]
      );
      return api.events.get(id)!;
    },
    delete: async (id: string) => {
      const db = getDb();
      db.run("DELETE FROM event_planning_milestones WHERE event_id = ?", [id]);
      db.run("DELETE FROM event_packing_items WHERE event_id = ?", [id]);
      db.run("DELETE FROM event_volunteers WHERE event_id = ?", [id]);
      db.run("DELETE FROM events WHERE id = ?", [id]);
      return { ok: true };
    },
    milestones: {
      create: async (eventId: string, body: { month: number; year: number; description: string; due_date?: string }) => {
        const db = getDb();
        const id = uuid();
        const maxOrder = db.query("SELECT COALESCE(MAX(sort_order), 0) as m FROM event_planning_milestones WHERE event_id = ?").get(eventId) as { m: number };
        const lastDay = new Date(body.year, body.month, 0);
        const dueDate = body.due_date ?? `${body.year}-${String(body.month).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;
        db.run(
          "INSERT INTO event_planning_milestones (id, event_id, month, year, description, sort_order, completed, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [id, eventId, body.month, body.year, body.description, (maxOrder?.m ?? 0) + 1, 0, dueDate]
        );
        return { id, event_id: eventId, ...body, sort_order: (maxOrder?.m ?? 0) + 1, completed: false, due_date: dueDate };
      },
      update: async (eventId: string, mid: string, body: { month?: number; year?: number; description?: string; completed?: boolean; due_date?: string }) => {
        const db = getDb();
        const existing = db.query("SELECT * FROM event_planning_milestones WHERE id = ? AND event_id = ?").get(mid, eventId);
        if (!existing) return null;
        const row = existing as Record<string, unknown>;
        const month = body.month ?? (row.month as number);
        const year = body.year ?? (row.year as number);
        const description = body.description ?? (row.description as string);
        const completed = body.completed !== undefined ? (body.completed ? 1 : 0) : (row.completed as number);
        const dueDate = body.due_date ?? (row.due_date as string | null);
        db.run("UPDATE event_planning_milestones SET month = ?, year = ?, description = ?, completed = ?, due_date = ? WHERE id = ? AND event_id = ?", [month, year, description, completed, dueDate, mid, eventId]);
        return { id: mid, event_id: eventId, month, year, description, sort_order: row.sort_order, completed: completed === 1, due_date: dueDate };
      },
      delete: async (eventId: string, mid: string) => {
        const db = getDb();
        db.run("DELETE FROM event_planning_milestones WHERE id = ? AND event_id = ?", [mid, eventId]);
        return { ok: true };
      },
    },
    packingItems: {
      create: async (eventId: string, body: { category: string; name: string }) => {
        const db = getDb();
        const id = uuid();
        const maxOrder = db.query("SELECT COALESCE(MAX(sort_order), 0) as m FROM event_packing_items WHERE event_id = ? AND category = ?").get(eventId, body.category) as { m: number };
        db.run(
          "INSERT INTO event_packing_items (id, event_id, category, name, sort_order) VALUES (?, ?, ?, ?, ?)",
          [id, eventId, body.category, body.name, (maxOrder?.m ?? 0) + 1]
        );
        return { id, event_id: eventId, ...body, sort_order: (maxOrder?.m ?? 0) + 1 };
      },
      update: async (eventId: string, pid: string, body: { category?: string; name?: string }) => {
        const db = getDb();
        const existing = db.query("SELECT * FROM event_packing_items WHERE id = ? AND event_id = ?").get(pid, eventId);
        if (!existing) return null;
        const row = existing as Record<string, unknown>;
        const category = body.category ?? (row.category as string);
        const name = body.name ?? (row.name as string);
        db.run("UPDATE event_packing_items SET category = ?, name = ? WHERE id = ? AND event_id = ?", [category, name, pid, eventId]);
        return { id: pid, event_id: eventId, category, name, sort_order: row.sort_order };
      },
      delete: async (eventId: string, pid: string) => {
        const db = getDb();
        db.run("DELETE FROM event_packing_items WHERE id = ? AND event_id = ?", [pid, eventId]);
        return { ok: true };
      },
    },
    volunteers: {
      create: async (eventId: string, body: { name: string; department: string }) => {
        const db = getDb();
        const id = uuid();
        const maxOrder = db.query("SELECT COALESCE(MAX(sort_order), 0) as m FROM event_volunteers WHERE event_id = ?").get(eventId) as { m: number };
        db.run(
          "INSERT INTO event_volunteers (id, event_id, name, department, sort_order) VALUES (?, ?, ?, ?, ?)",
          [id, eventId, body.name, body.department, (maxOrder?.m ?? 0) + 1]
        );
        return { id, event_id: eventId, ...body, sort_order: (maxOrder?.m ?? 0) + 1 };
      },
      update: async (eventId: string, vid: string, body: { name?: string; department?: string }) => {
        const db = getDb();
        const existing = db.query("SELECT * FROM event_volunteers WHERE id = ? AND event_id = ?").get(vid, eventId);
        if (!existing) return null;
        const row = existing as Record<string, unknown>;
        const name = body.name ?? (row.name as string);
        const department = body.department ?? (row.department as string);
        db.run("UPDATE event_volunteers SET name = ?, department = ? WHERE id = ? AND event_id = ?", [name, department, vid, eventId]);
        return { id: vid, event_id: eventId, name, department, sort_order: row.sort_order };
      },
      delete: async (eventId: string, vid: string) => {
        const db = getDb();
        db.run("DELETE FROM event_volunteers WHERE id = ? AND event_id = ?", [vid, eventId]);
        return { ok: true };
      },
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
  members: {
    list: async () => {
      const db = getDb();
      const rows = db.query("SELECT * FROM members ORDER BY name").all() as Array<Record<string, unknown>>;
      return rows.map((m) => ({
        id: m.id,
        name: m.name,
        phone_number: m.phone_number ?? null,
        email: m.email ?? null,
        address: m.address ?? null,
        birthday: m.birthday ?? null,
        position: m.position ?? null,
        emergency_contact_name: m.emergency_contact_name ?? null,
        emergency_contact_phone: m.emergency_contact_phone ?? null,
        photo: m.photo != null ? `data:image/jpeg;base64,${Buffer.from(m.photo as Uint8Array).toString("base64")}` : null,
        created_at: m.created_at as string | undefined,
      }));
    },
    get: async (id: string) => {
      const db = getDb();
      const row = db.query("SELECT * FROM members WHERE id = ?").get(id);
      if (!row) return null;
      const m = row as Record<string, unknown>;
      return {
        id: m.id,
        name: m.name,
        phone_number: m.phone_number ?? null,
        email: m.email ?? null,
        address: m.address ?? null,
        birthday: m.birthday ?? null,
        position: m.position ?? null,
        emergency_contact_name: m.emergency_contact_name ?? null,
        emergency_contact_phone: m.emergency_contact_phone ?? null,
        photo: m.photo != null ? `data:image/jpeg;base64,${Buffer.from(m.photo as Uint8Array).toString("base64")}` : null,
        created_at: m.created_at as string | undefined,
      };
    },
    create: async (body: {
      name: string;
      phone_number?: string;
      email?: string;
      address?: string;
      birthday?: string;
      position?: string;
      emergency_contact_name?: string;
      emergency_contact_phone?: string;
      photo?: string;
    }) => {
      const db = getDb();
      const id = uuid();
      const photoBlob = body.photo ? parsePhotoToBlob(body.photo) : null;
      db.run(
        `INSERT INTO members (id, name, phone_number, email, address, birthday, position, emergency_contact_name, emergency_contact_phone, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          body.name,
          body.phone_number ?? null,
          body.email ?? null,
          body.address ?? null,
          body.birthday ?? null,
          VALID_POSITIONS.has(body.position ?? "") ? body.position : null,
          body.emergency_contact_name ?? null,
          body.emergency_contact_phone ?? null,
          photoBlob,
        ]
      );
      return api.members.get(id)!;
    },
    update: async (id: string, body: Partial<{
      name: string;
      phone_number: string;
      email: string;
      address: string;
      birthday: string;
      position: string;
      emergency_contact_name: string;
      emergency_contact_phone: string;
      photo: string;
    }>) => {
      const db = getDb();
      const existing = db.query("SELECT * FROM members WHERE id = ?").get(id);
      if (!existing) return null;
      const row = existing as Record<string, unknown>;
      const get = (k: string, def: unknown) => (body[k as keyof typeof body] !== undefined ? body[k as keyof typeof body] : row[k] ?? def);
      const name = get("name", row.name) as string;
      const phone_number = get("phone_number", null) as string | null;
      const email = get("email", null) as string | null;
      const address = get("address", null) as string | null;
      const birthday = get("birthday", null) as string | null;
      const positionRaw = get("position", null) as string | null;
      const position = positionRaw && VALID_POSITIONS.has(positionRaw) ? positionRaw : null;
      const emergency_contact_name = get("emergency_contact_name", null) as string | null;
      const emergency_contact_phone = get("emergency_contact_phone", null) as string | null;
      const photoBlob =
        body.photo !== undefined
          ? (body.photo === null ? null : parsePhotoToBlob(body.photo) ?? null)
          : (row.photo as Uint8Array | null);
      db.run(
        `UPDATE members SET name = ?, phone_number = ?, email = ?, address = ?, birthday = ?, position = ?, emergency_contact_name = ?, emergency_contact_phone = ?, photo = ? WHERE id = ?`,
        [name, phone_number, email, address, birthday, position, emergency_contact_name, emergency_contact_phone, photoBlob, id]
      );
      return api.members.get(id)!;
    },
    delete: async (id: string) => {
      const db = getDb();
      db.run("DELETE FROM members WHERE id = ?", [id]);
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
