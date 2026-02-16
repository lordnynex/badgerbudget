import type { DbLike } from "../db/dbAdapter";
import { uuid } from "./utils";

export class BudgetsService {
  constructor(private db: DbLike) {}

  async list() {
    const rows = await this.db.query("SELECT * FROM budgets ORDER BY year DESC, name").all();
    return rows as Array<{ id: string; name: string; year: number; description: string | null; created_at: string }>;
  }

  async get(id: string) {
    const budget = await this.db.query("SELECT * FROM budgets WHERE id = ?").get(id);
    if (!budget) return null;
    const itemsRaw = await this.db
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
  }

  async create(body: { name: string; year: number; description?: string }) {
    const id = uuid();
    await this.db.run(
      "INSERT INTO budgets (id, name, year, description) VALUES (?, ?, ?, ?)",
      [id, body.name, body.year, body.description ?? null]
    );
    return { id, ...body };
  }

  async update(id: string, body: { name?: string; year?: number; description?: string }) {
    const existing = await this.db.query("SELECT * FROM budgets WHERE id = ?").get(id);
    if (!existing) return null;
    const budget = existing as Record<string, unknown>;
    const name = (body.name ?? budget.name) as string;
    const year = (body.year ?? budget.year) as number;
    const description = (body.description !== undefined ? body.description : budget.description) as string | null;
    await this.db.run("UPDATE budgets SET name = ?, year = ?, description = ? WHERE id = ?", [name, year, description, id]);
    return { id, name, year, description };
  }

  async delete(id: string) {
    await this.db.run("DELETE FROM line_items WHERE budget_id = ?", [id]);
    await this.db.run("DELETE FROM budgets WHERE id = ?", [id]);
    return { ok: true };
  }

  async addLineItem(
    budgetId: string,
    body: {
      name: string;
      category: string;
      comments?: string;
      unitCost: number;
      quantity: number;
      historicalCosts?: Record<string, number>;
    }
  ) {
    const itemId = uuid();
    await this.db.run(
      "INSERT INTO line_items (id, budget_id, name, category, comments, unit_cost, quantity, historical_costs) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [itemId, budgetId, body.name, body.category, body.comments ?? null, body.unitCost, body.quantity, body.historicalCosts ? JSON.stringify(body.historicalCosts) : null]
    );
    return {
      id: itemId,
      ...body,
    };
  }

  async updateLineItem(
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
  ) {
    const existing = await this.db.query("SELECT * FROM line_items WHERE id = ? AND budget_id = ?").get(itemId, budgetId);
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
    await this.db.run(
      "UPDATE line_items SET name = ?, category = ?, comments = ?, unit_cost = ?, quantity = ?, historical_costs = ? WHERE id = ? AND budget_id = ?",
      [name, category, comments, unitCost, quantity, historicalCosts, itemId, budgetId]
    );
    return { id: itemId, name, category, comments, unitCost, quantity, historicalCosts };
  }

  async deleteLineItem(budgetId: string, itemId: string) {
    await this.db.run("DELETE FROM line_items WHERE id = ? AND budget_id = ?", [itemId, budgetId]);
    return { ok: true };
  }
}
