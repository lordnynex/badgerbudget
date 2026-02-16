import type { DbLike } from "../db/dbAdapter";
import { uuid, DEFAULT_SCENARIO_INPUTS } from "./utils";

export class ScenariosService {
  constructor(private db: DbLike) {}

  async list() {
    const rows = await this.db.query("SELECT * FROM scenarios ORDER BY name").all();
    return rows as Array<{ id: string; name: string; description: string | null; inputs: string; created_at: string }>;
  }

  async get(id: string) {
    const row = await this.db.query("SELECT * FROM scenarios WHERE id = ?").get(id);
    if (!row) return null;
    const r = row as Record<string, unknown>;
    return {
      ...r,
      inputs: JSON.parse(r.inputs as string),
    };
  }

  async create(body: { name: string; description?: string; inputs?: Record<string, unknown> }) {
    const id = uuid();
    const inputs = body.inputs ?? DEFAULT_SCENARIO_INPUTS;
    await this.db.run(
      "INSERT INTO scenarios (id, name, description, inputs) VALUES (?, ?, ?, ?)",
      [id, body.name, body.description ?? null, JSON.stringify(inputs)]
    );
    return { id, name: body.name, description: body.description, inputs };
  }

  async update(
    id: string,
    body: { name?: string; description?: string; inputs?: Record<string, unknown> }
  ) {
    const existing = await this.db.query("SELECT * FROM scenarios WHERE id = ?").get(id);
    if (!existing) return null;
    const row = existing as Record<string, unknown>;
    const name = (body.name ?? row.name) as string;
    const description = (body.description !== undefined ? body.description : row.description) as string | null;
    const inputs = body.inputs ?? JSON.parse(row.inputs as string);
    await this.db.run("UPDATE scenarios SET name = ?, description = ?, inputs = ? WHERE id = ?", [name, description, JSON.stringify(inputs), id]);
    return { id, name, description, inputs };
  }

  async delete(id: string) {
    await this.db.run("DELETE FROM scenarios WHERE id = ?", [id]);
    return { ok: true };
  }
}
