import type { DbLike } from "../db/dbAdapter";
import { ALL_MEMBERS_ID } from "@/shared/lib/constants";
import { createContactsApi } from "./contactsApi";

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

export function createApi(db: DbLike) {
  const { contacts: contactsApi, mailingLists: mailingListsApi, mailingBatches: mailingBatchesApi } =
    createContactsApi(db);

  return {
  events: {
    list: async () => {
      const rows = (await await db.query("SELECT * FROM events ORDER BY year DESC, name").all()) as Array<Record<string, unknown>>;
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
      const row = await await db.query("SELECT * FROM events WHERE id = ?").get(id);
      if (!row) return null;
      const e = row as Record<string, unknown>;
      const milestones = (await db
        .query("SELECT * FROM event_planning_milestones WHERE event_id = ? ORDER BY year, month, sort_order")
        .all(id)) as Array<Record<string, unknown>>;
      const milestoneMembers = milestones.length
        ? ((await db
            .query(
              "SELECT emm.* FROM event_milestone_members emm WHERE emm.milestone_id IN (" +
                milestones.map(() => "?").join(",") +
                ") ORDER BY emm.milestone_id, emm.sort_order"
            )
            .all(...(milestones.map((m) => m.id) as string[]))) as Array<Record<string, unknown>>)
        : [];
      const milestoneMemberIds = [...new Set(milestoneMembers.map((mm) => mm.member_id as string))];
      const milestoneMembersMap = new Map<string, { id: string; name: string; photo: string | null }>();
      for (const mid of milestoneMemberIds) {
        const m = (await await db.query("SELECT id, name, photo FROM members WHERE id = ?").get(mid)) as Record<string, unknown> | undefined;
        if (m) {
          milestoneMembersMap.set(mid, {
            id: m.id as string,
            name: m.name as string,
            photo: m.photo != null ? `data:image/jpeg;base64,${Buffer.from(m.photo as Uint8Array).toString("base64")}` : null,
          });
        }
      }
      const membersByMilestone = new Map<string, Array<Record<string, unknown>>>();
      for (const mm of milestoneMembers) {
        const list = membersByMilestone.get(mm.milestone_id as string) ?? [];
        list.push(mm);
        membersByMilestone.set(mm.milestone_id as string, list);
      }
      const packingCategories = (await db
        .query("SELECT * FROM event_packing_categories WHERE event_id = ? ORDER BY sort_order, name")
        .all(id)) as Array<Record<string, unknown>>;
      const packing = (await db
        .query("SELECT * FROM event_packing_items WHERE event_id = ? ORDER BY category_id, sort_order, name")
        .all(id)) as Array<Record<string, unknown>>;
      const volunteers = (await db
        .query("SELECT * FROM event_volunteers WHERE event_id = ? ORDER BY department, sort_order, name")
        .all(id)) as Array<Record<string, unknown>>;
      const assignments = (await db
        .query("SELECT * FROM event_assignments WHERE event_id = ? ORDER BY category, sort_order, name")
        .all(id)) as Array<Record<string, unknown>>;
      const assignmentMembers = assignments.length
        ? ((await db
            .query(
              "SELECT eam.* FROM event_assignment_members eam WHERE eam.assignment_id IN (" +
                assignments.map(() => "?").join(",") +
                ") ORDER BY eam.assignment_id, eam.sort_order"
            )
            .all(...(assignments.map((a) => a.id) as string[]))) as Array<Record<string, unknown>>)
        : [];
      const memberIds = [...new Set(assignmentMembers.map((am) => am.member_id as string))];
      const membersMap = new Map<string, { id: string; name: string; photo: string | null }>();
      for (const mid of memberIds) {
        const m = (await await db.query("SELECT id, name, photo FROM members WHERE id = ?").get(mid)) as Record<string, unknown> | undefined;
        if (m) {
          membersMap.set(mid, {
            id: m.id as string,
            name: m.name as string,
            photo: m.photo != null ? `data:image/jpeg;base64,${Buffer.from(m.photo as Uint8Array).toString("base64")}` : null,
          });
        }
      }
      const membersByAssignment = new Map<string, Array<Record<string, unknown>>>();
      for (const am of assignmentMembers) {
        const list = membersByAssignment.get(am.assignment_id as string) ?? [];
        list.push(am);
        membersByAssignment.set(am.assignment_id as string, list);
      }
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
          const mmList = membersByMilestone.get(m.id as string) ?? [];
          return {
            id: m.id,
            event_id: m.event_id,
            month,
            year,
            description: m.description,
            sort_order: m.sort_order ?? 0,
            completed: m.completed === 1,
            due_date: (m.due_date as string | null) ?? defaultDueDate,
            members: mmList.map((mm) => ({
              id: mm.id,
              milestone_id: mm.milestone_id,
              member_id: mm.member_id,
              sort_order: mm.sort_order ?? 0,
              member: milestoneMembersMap.get(mm.member_id as string),
            })),
          };
        }),
        packingCategories: packingCategories.map((c) => ({
          id: c.id,
          event_id: c.event_id,
          name: c.name,
          sort_order: c.sort_order ?? 0,
        })),
        packingItems: packing.map((p) => ({
          id: p.id,
          event_id: p.event_id,
          category_id: p.category_id,
          name: p.name,
          sort_order: p.sort_order ?? 0,
          quantity: p.quantity != null ? Number(p.quantity) : null,
          note: (p.note as string | null) ?? null,
          loaded: p.loaded === 1,
        })),
        volunteers: volunteers.map((v) => ({
          id: v.id,
          event_id: v.event_id,
          name: v.name,
          department: v.department,
          sort_order: v.sort_order ?? 0,
        })),
        assignments: assignments.map((a) => {
          const amList = membersByAssignment.get(a.id as string) ?? [];
          return {
            id: a.id,
            event_id: a.event_id,
            name: a.name,
            category: a.category,
            sort_order: a.sort_order ?? 0,
            members: amList.map((am) => ({
              id: am.id,
              assignment_id: am.assignment_id,
              member_id: am.member_id,
              sort_order: am.sort_order ?? 0,
              member: membersMap.get(am.member_id as string),
            })),
          };
        }),
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
      const id = uuid();
      await db.run(
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
      const existing = await db.query("SELECT * FROM events WHERE id = ?").get(id);
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
      await db.run(
        `UPDATE events SET name = ?, description = ?, year = ?, event_date = ?, event_url = ?, event_location = ?, event_location_embed = ?, ga_ticket_cost = ?, day_pass_cost = ?, ga_tickets_sold = ?, day_passes_sold = ?, budget_id = ?, scenario_id = ?, planning_notes = ? WHERE id = ?`,
        [name, description, year, event_date, event_url, event_location, event_location_embed, ga_ticket_cost, day_pass_cost, ga_tickets_sold, day_passes_sold, budget_id, scenario_id, planning_notes, id]
      );
      return api.events.get(id)!;
    },
    delete: async (id: string) => {
      await db.run("DELETE FROM event_assignment_members WHERE assignment_id IN (SELECT id FROM event_assignments WHERE event_id = ?)", [id]);
      await db.run("DELETE FROM event_assignments WHERE event_id = ?", [id]);
      await db.run("DELETE FROM event_planning_milestones WHERE event_id = ?", [id]);
      await db.run("DELETE FROM event_packing_items WHERE event_id = ?", [id]);
      await db.run("DELETE FROM event_packing_categories WHERE event_id = ?", [id]);
      await db.run("DELETE FROM event_volunteers WHERE event_id = ?", [id]);
      await db.run("DELETE FROM events WHERE id = ?", [id]);
      return { ok: true };
    },
    assignments: {
      create: async (eventId: string, body: { name: string; category: "planning" | "during" }) => {
        const id = uuid();
        const maxOrder = await db.query("SELECT COALESCE(MAX(sort_order), 0) as m FROM event_assignments WHERE event_id = ? AND category = ?").get(eventId, body.category) as { m: number } | undefined;
        const sortOrder = (maxOrder?.m ?? 0) + 1;
        await db.run(
          "INSERT INTO event_assignments (id, event_id, name, category, sort_order) VALUES (?, ?, ?, ?, ?)",
          [id, eventId, body.name, body.category, sortOrder]
        );
        return { id, event_id: eventId, name: body.name, category: body.category, sort_order: sortOrder, members: [] };
      },
      update: async (eventId: string, aid: string, body: { name?: string; category?: "planning" | "during" }) => {
        const existing = await db.query("SELECT * FROM event_assignments WHERE id = ? AND event_id = ?").get(aid, eventId);
        if (!existing) return null;
        const row = existing as Record<string, unknown>;
        const name = (body.name ?? row.name) as string;
        const category = (body.category ?? row.category) as "planning" | "during";
        await db.run("UPDATE event_assignments SET name = ?, category = ? WHERE id = ? AND event_id = ?", [name, category, aid, eventId]);
        const amList = (await db.query("SELECT * FROM event_assignment_members WHERE assignment_id = ? ORDER BY sort_order").all(aid)) as Array<Record<string, unknown>>;
        const members = await Promise.all(
          amList.map(async (am) => {
            const m = (await db.query("SELECT id, name, photo FROM members WHERE id = ?").get(am.member_id as string)) as Record<string, unknown> | undefined;
            return {
              id: am.id,
              assignment_id: am.assignment_id,
              member_id: am.member_id,
              sort_order: am.sort_order ?? 0,
              member: m ? { id: m.id, name: m.name, photo: m.photo != null ? `data:image/jpeg;base64,${Buffer.from(m.photo as Uint8Array).toString("base64")}` : null } : undefined,
            };
          })
        );
        return { id: aid, event_id: eventId, name, category, sort_order: row.sort_order, members };
      },
      delete: async (eventId: string, aid: string) => {
        await db.run("DELETE FROM event_assignment_members WHERE assignment_id = ?", [aid]);
        await db.run("DELETE FROM event_assignments WHERE id = ? AND event_id = ?", [aid, eventId]);
        return { ok: true };
      },
      addMember: async (eventId: string, aid: string, memberId: string) => {
        const existing = await db.query("SELECT * FROM event_assignments WHERE id = ? AND event_id = ?").get(aid, eventId);
        if (!existing) return null;
        const maxOrder = await db.query("SELECT COALESCE(MAX(sort_order), 0) as m FROM event_assignment_members WHERE assignment_id = ?").get(aid) as { m: number };
        const id = uuid();
        try {
          await db.run(
            "INSERT INTO event_assignment_members (id, assignment_id, member_id, sort_order) VALUES (?, ?, ?, ?)",
            [id, aid, memberId, (maxOrder?.m ?? 0) + 1]
          );
        } catch {
          return null;
        }
        return api.events.get(eventId);
      },
      removeMember: async (eventId: string, aid: string, memberId: string) => {
        await db.run("DELETE FROM event_assignment_members WHERE assignment_id = ? AND member_id = ?", [aid, memberId]);
        return api.events.get(eventId);
      },
    },
    milestones: {
      create: async (eventId: string, body: { month: number; year: number; description: string; due_date?: string }) => {
        const id = uuid();
        const maxOrder = await db.query("SELECT COALESCE(MAX(sort_order), 0) as m FROM event_planning_milestones WHERE event_id = ?").get(eventId) as { m: number };
        const lastDay = new Date(body.year, body.month, 0);
        const dueDate = body.due_date ?? `${body.year}-${String(body.month).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;
        await db.run(
          "INSERT INTO event_planning_milestones (id, event_id, month, year, description, sort_order, completed, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [id, eventId, body.month, body.year, body.description, (maxOrder?.m ?? 0) + 1, 0, dueDate]
        );
        return { id, event_id: eventId, ...body, sort_order: (maxOrder?.m ?? 0) + 1, completed: false, due_date: dueDate };
      },
      update: async (eventId: string, mid: string, body: { month?: number; year?: number; description?: string; completed?: boolean; due_date?: string }) => {
        const existing = await db.query("SELECT * FROM event_planning_milestones WHERE id = ? AND event_id = ?").get(mid, eventId);
        if (!existing) return null;
        const row = existing as Record<string, unknown>;
        const month = body.month ?? (row.month as number);
        const year = body.year ?? (row.year as number);
        const description = body.description ?? (row.description as string);
        const completed = body.completed !== undefined ? (body.completed ? 1 : 0) : (row.completed as number);
        const dueDate = body.due_date ?? (row.due_date as string | null);
        await db.run("UPDATE event_planning_milestones SET month = ?, year = ?, description = ?, completed = ?, due_date = ? WHERE id = ? AND event_id = ?", [month, year, description, completed, dueDate, mid, eventId]);
        return { id: mid, event_id: eventId, month, year, description, sort_order: row.sort_order, completed: completed === 1, due_date: dueDate };
      },
      delete: async (eventId: string, mid: string) => {
        await db.run("DELETE FROM event_planning_milestones WHERE id = ? AND event_id = ?", [mid, eventId]);
        return { ok: true };
      },
      addMember: async (eventId: string, mid: string, memberId: string) => {
        const existing = await db.query("SELECT 1 FROM event_planning_milestones WHERE id = ? AND event_id = ?").get(mid, eventId);
        if (!existing) return null;
        const id = uuid();
        const maxOrder = await db.query("SELECT COALESCE(MAX(sort_order), 0) as m FROM event_milestone_members WHERE milestone_id = ?").get(mid) as { m: number };
        await db.run(
          "INSERT INTO event_milestone_members (id, milestone_id, member_id, sort_order) VALUES (?, ?, ?, ?)",
          [id, mid, memberId, (maxOrder?.m ?? 0) + 1]
        );
        return api.events.get(eventId);
      },
      removeMember: async (eventId: string, mid: string, memberId: string) => {
        await db.run("DELETE FROM event_milestone_members WHERE milestone_id = ? AND member_id = ?", [mid, memberId]);
        return api.events.get(eventId);
      },
    },
    packingCategories: {
      create: async (eventId: string, body: { name: string }) => {
        const id = uuid();
        const maxOrder = await db.query("SELECT COALESCE(MAX(sort_order), 0) as m FROM event_packing_categories WHERE event_id = ?").get(eventId) as { m: number };
        await db.run(
          "INSERT INTO event_packing_categories (id, event_id, name, sort_order) VALUES (?, ?, ?, ?)",
          [id, eventId, body.name, (maxOrder?.m ?? 0) + 1]
        );
        return { id, event_id: eventId, name: body.name, sort_order: (maxOrder?.m ?? 0) + 1 };
      },
      update: async (eventId: string, cid: string, body: { name?: string }) => {
        const existing = await db.query("SELECT * FROM event_packing_categories WHERE id = ? AND event_id = ?").get(cid, eventId);
        if (!existing) return null;
        const row = existing as Record<string, unknown>;
        const name = body.name ?? (row.name as string);
        await db.run("UPDATE event_packing_categories SET name = ? WHERE id = ? AND event_id = ?", [name, cid, eventId]);
        return { id: cid, event_id: eventId, name, sort_order: row.sort_order };
      },
      delete: async (eventId: string, cid: string) => {
        await db.run("DELETE FROM event_packing_categories WHERE id = ? AND event_id = ?", [cid, eventId]);
        return { ok: true };
      },
    },
    packingItems: {
      create: async (eventId: string, body: { category_id: string; name: string; quantity?: number; note?: string }) => {
        const id = uuid();
        const maxOrder = await db.query("SELECT COALESCE(MAX(sort_order), 0) as m FROM event_packing_items WHERE event_id = ? AND category_id = ?").get(eventId, body.category_id) as { m: number };
        await db.run(
          "INSERT INTO event_packing_items (id, event_id, category_id, name, sort_order, quantity, note, loaded) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [id, eventId, body.category_id, body.name, (maxOrder?.m ?? 0) + 1, body.quantity ?? null, body.note ?? null, 0]
        );
        return { id, event_id: eventId, category_id: body.category_id, name: body.name, sort_order: (maxOrder?.m ?? 0) + 1, quantity: body.quantity ?? null, note: body.note ?? null, loaded: false };
      },
      update: async (eventId: string, pid: string, body: { category_id?: string; name?: string; quantity?: number; note?: string; loaded?: boolean }) => {
        const existing = await db.query("SELECT * FROM event_packing_items WHERE id = ? AND event_id = ?").get(pid, eventId);
        if (!existing) return null;
        const row = existing as Record<string, unknown>;
        const category_id = body.category_id ?? (row.category_id as string);
        const name = body.name ?? (row.name as string);
        const quantity = body.quantity !== undefined ? body.quantity : (row.quantity != null ? Number(row.quantity) : null);
        const note = body.note !== undefined ? body.note : (row.note as string | null);
        const loaded = body.loaded !== undefined ? (body.loaded ? 1 : 0) : (row.loaded as number);
        await db.run("UPDATE event_packing_items SET category_id = ?, name = ?, quantity = ?, note = ?, loaded = ? WHERE id = ? AND event_id = ?", [category_id, name, quantity, note, loaded, pid, eventId]);
        return { id: pid, event_id: eventId, category_id, name, sort_order: row.sort_order, quantity, note, loaded: loaded === 1 };
      },
      delete: async (eventId: string, pid: string) => {
        await db.run("DELETE FROM event_packing_items WHERE id = ? AND event_id = ?", [pid, eventId]);
        return { ok: true };
      },
    },
    volunteers: {
      create: async (eventId: string, body: { name: string; department: string }) => {
        const id = uuid();
        const maxOrder = await db.query("SELECT COALESCE(MAX(sort_order), 0) as m FROM event_volunteers WHERE event_id = ?").get(eventId) as { m: number };
        await db.run(
          "INSERT INTO event_volunteers (id, event_id, name, department, sort_order) VALUES (?, ?, ?, ?, ?)",
          [id, eventId, body.name, body.department, (maxOrder?.m ?? 0) + 1]
        );
        return { id, event_id: eventId, ...body, sort_order: (maxOrder?.m ?? 0) + 1 };
      },
      update: async (eventId: string, vid: string, body: { name?: string; department?: string }) => {
        const existing = await db.query("SELECT * FROM event_volunteers WHERE id = ? AND event_id = ?").get(vid, eventId);
        if (!existing) return null;
        const row = existing as Record<string, unknown>;
        const name = body.name ?? (row.name as string);
        const department = body.department ?? (row.department as string);
        await db.run("UPDATE event_volunteers SET name = ?, department = ? WHERE id = ? AND event_id = ?", [name, department, vid, eventId]);
        return { id: vid, event_id: eventId, name, department, sort_order: row.sort_order };
      },
      delete: async (eventId: string, vid: string) => {
        await db.run("DELETE FROM event_volunteers WHERE id = ? AND event_id = ?", [vid, eventId]);
        return { ok: true };
      },
    },
  },
  budgets: {
    list: async () => {
      const rows = await db.query("SELECT * FROM budgets ORDER BY year DESC, name").all();
      return rows as Array<{ id: string; name: string; year: number; description: string | null; created_at: string }>;
    },
    get: async (id: string) => {
      const budget = await db.query("SELECT * FROM budgets WHERE id = ?").get(id);
      if (!budget) return null;
      const itemsRaw = await db
        .query("SELECT * FROM line_items WHERE budget_id = ? ORDER BY name")
        .all(id);
      const items = Array.isArray(itemsRaw) ? itemsRaw : [];
      return {
        ...(budget as Record<string, unknown>),
        lineItems: items.map((i: Record<string, unknown>) => ({
          id: i.id,
          name: i.name,
          category: i.category,
          comments: i.comments ?? undefined,
          unitCost: i.unit_cost,
          quantity: i.quantity,
          historicalCosts: i.historical_costs ? JSON.parse(String(i.historical_costs)) : undefined,
        })),
      };
    },
    create: async (body: { name: string; year: number; description?: string }) => {
      const id = uuid();
      await db.run(
        "INSERT INTO budgets (id, name, year, description) VALUES (?, ?, ?, ?)",
        [id, body.name, body.year, body.description ?? null]
      );
      return { id, ...body };
    },
    update: async (id: string, body: { name?: string; year?: number; description?: string }) => {
      const existing = await db.query("SELECT * FROM budgets WHERE id = ?").get(id);
      if (!existing) return null;
      const budget = existing as Record<string, unknown>;
      const name = (body.name ?? budget.name) as string;
      const year = (body.year ?? budget.year) as number;
      const description = (body.description !== undefined ? body.description : budget.description) as string | null;
      await db.run("UPDATE budgets SET name = ?, year = ?, description = ? WHERE id = ?", [name, year, description, id]);
      return { id, name, year, description };
    },
    delete: async (id: string) => {
      await db.run("DELETE FROM line_items WHERE budget_id = ?", [id]);
      await db.run("DELETE FROM budgets WHERE id = ?", [id]);
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
      const itemId = uuid();
      await db.run(
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
      const existing = await db.query("SELECT * FROM line_items WHERE id = ? AND budget_id = ?").get(itemId, budgetId);
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
      await db.run(
        "UPDATE line_items SET name = ?, category = ?, comments = ?, unit_cost = ?, quantity = ?, historical_costs = ? WHERE id = ? AND budget_id = ?",
        [name, category, comments, unitCost, quantity, historicalCosts, itemId, budgetId]
      );
      return { id: itemId, name, category, comments, unitCost, quantity, historicalCosts };
    },
    deleteLineItem: async (budgetId: string, itemId: string) => {
      await db.run("DELETE FROM line_items WHERE id = ? AND budget_id = ?", [itemId, budgetId]);
      return { ok: true };
    },
  },
  members: {
    list: async () => {
      const rows = (await db
        .query("SELECT * FROM members WHERE id != ? ORDER BY name")
        .all(ALL_MEMBERS_ID)) as Array<Record<string, unknown>>;
      return rows.map((m) => ({
        id: m.id,
        name: m.name,
        phone_number: m.phone_number ?? null,
        email: m.email ?? null,
        address: m.address ?? null,
        birthday: m.birthday ?? null,
        member_since: m.member_since ?? null,
        is_baby: (m.is_baby as number) === 1,
        position: m.position ?? null,
        emergency_contact_name: m.emergency_contact_name ?? null,
        emergency_contact_phone: m.emergency_contact_phone ?? null,
        photo: m.photo != null ? `data:image/jpeg;base64,${Buffer.from(m.photo as Uint8Array).toString("base64")}` : null,
        created_at: m.created_at as string | undefined,
      }));
    },
    get: async (id: string) => {
      const row = await db.query("SELECT * FROM members WHERE id = ?").get(id);
      if (!row) return null;
      const m = row as Record<string, unknown>;
      return {
        id: m.id,
        name: m.name,
        phone_number: m.phone_number ?? null,
        email: m.email ?? null,
        address: m.address ?? null,
        birthday: m.birthday ?? null,
        member_since: m.member_since ?? null,
        is_baby: (m.is_baby as number) === 1,
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
      member_since?: string;
      is_baby?: boolean;
      position?: string;
      emergency_contact_name?: string;
      emergency_contact_phone?: string;
      photo?: string;
    }) => {
      const id = uuid();
      const photoBlob = body.photo ? parsePhotoToBlob(body.photo) : null;
      await db.run(
        `INSERT INTO members (id, name, phone_number, email, address, birthday, member_since, is_baby, position, emergency_contact_name, emergency_contact_phone, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          body.name,
          body.phone_number ?? null,
          body.email ?? null,
          body.address ?? null,
          body.birthday ?? null,
          body.member_since ?? null,
          body.is_baby ? 1 : 0,
          body.position && VALID_POSITIONS.has(body.position) ? body.position : null,
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
      member_since: string;
      is_baby: boolean;
      position: string;
      emergency_contact_name: string;
      emergency_contact_phone: string;
      photo: string;
    }>) => {
      const existing = await db.query("SELECT * FROM members WHERE id = ?").get(id);
      if (!existing) return null;
      const row = existing as Record<string, unknown>;
      const get = (k: string, def: unknown) => (body[k as keyof typeof body] !== undefined ? body[k as keyof typeof body] : row[k] ?? def);
      const name = get("name", row.name) as string;
      const phone_number = get("phone_number", null) as string | null;
      const email = get("email", null) as string | null;
      const address = get("address", null) as string | null;
      const birthday = get("birthday", null) as string | null;
      const member_since = get("member_since", null) as string | null;
      const is_baby = body.is_baby !== undefined ? (body.is_baby ? 1 : 0) : ((row.is_baby as number) === 1 ? 1 : 0);
      const positionRaw = get("position", null) as string | null;
      const position = positionRaw && VALID_POSITIONS.has(positionRaw) ? positionRaw : null;
      const emergency_contact_name = get("emergency_contact_name", null) as string | null;
      const emergency_contact_phone = get("emergency_contact_phone", null) as string | null;
      const photoBlob =
        body.photo !== undefined
          ? (body.photo === null ? null : parsePhotoToBlob(body.photo) ?? null)
          : (row.photo as Uint8Array | null);
      await db.run(
        `UPDATE members SET name = ?, phone_number = ?, email = ?, address = ?, birthday = ?, member_since = ?, is_baby = ?, position = ?, emergency_contact_name = ?, emergency_contact_phone = ?, photo = ? WHERE id = ?`,
        [name, phone_number, email, address, birthday, member_since, is_baby, position, emergency_contact_name, emergency_contact_phone, photoBlob, id]
      );
      return api.members.get(id)!;
    },
    delete: async (id: string) => {
      await db.run("DELETE FROM members WHERE id = ?", [id]);
      return { ok: true };
    },
  },
  scenarios: {
    list: async () => {
      const rows = await db.query("SELECT * FROM scenarios ORDER BY name").all();
      return rows as Array<{ id: string; name: string; description: string | null; inputs: string; created_at: string }>;
    },
    get: async (id: string) => {
      const row = await db.query("SELECT * FROM scenarios WHERE id = ?").get(id);
      if (!row) return null;
      const r = row as Record<string, unknown>;
      return {
        ...r,
        inputs: JSON.parse(r.inputs as string),
      };
    },
    create: async (body: { name: string; description?: string; inputs?: Record<string, unknown> }) => {
      const id = uuid();
      const inputs = body.inputs ?? DEFAULT_INPUTS;
      await db.run(
        "INSERT INTO scenarios (id, name, description, inputs) VALUES (?, ?, ?, ?)",
        [id, body.name, body.description ?? null, JSON.stringify(inputs)]
      );
      return { id, name: body.name, description: body.description, inputs };
    },
    update: async (
      id: string,
      body: { name?: string; description?: string; inputs?: Record<string, unknown> }
    ) => {
      const existing = await db.query("SELECT * FROM scenarios WHERE id = ?").get(id);
      if (!existing) return null;
      const row = existing as Record<string, unknown>;
      const name = (body.name ?? row.name) as string;
      const description = (body.description !== undefined ? body.description : row.description) as string | null;
      const inputs = body.inputs ?? JSON.parse(row.inputs as string);
      await db.run("UPDATE scenarios SET name = ?, description = ?, inputs = ? WHERE id = ?", [name, description, JSON.stringify(inputs), id]);
      return { id, name, description, inputs };
    },
    delete: async (id: string) => {
      await db.run("DELETE FROM scenarios WHERE id = ?", [id]);
      return { ok: true };
    },
  },
  contacts: contactsApi,
  mailingLists: mailingListsApi,
  mailingBatches: mailingBatchesApi,
  };
}

export type Api = ReturnType<typeof createApi>;
