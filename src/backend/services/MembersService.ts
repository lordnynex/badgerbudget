import type { DbLike } from "../db/dbAdapter";
import { ALL_MEMBERS_ID } from "@/shared/lib/constants";
import { uuid, VALID_POSITIONS, parsePhotoToBlob } from "./utils";

export class MembersService {
  constructor(private db: DbLike) {}

  async list() {
    const rows = (await this.db
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
  }

  async get(id: string) {
    const row = await this.db.query("SELECT * FROM members WHERE id = ?").get(id);
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
  }

  async create(body: {
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
  }) {
    const id = uuid();
    const photoBlob = body.photo ? parsePhotoToBlob(body.photo) : null;
    await this.db.run(
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
    return this.get(id)!;
  }

  async update(id: string, body: Partial<{
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
  }>) {
    const existing = await this.db.query("SELECT * FROM members WHERE id = ?").get(id);
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
    await this.db.run(
      `UPDATE members SET name = ?, phone_number = ?, email = ?, address = ?, birthday = ?, member_since = ?, is_baby = ?, position = ?, emergency_contact_name = ?, emergency_contact_phone = ?, photo = ? WHERE id = ?`,
      [name, phone_number, email, address, birthday, member_since, is_baby, position, emergency_contact_name, emergency_contact_phone, photoBlob, id]
    );
    return this.get(id)!;
  }

  async delete(id: string) {
    await this.db.run("DELETE FROM members WHERE id = ?", [id]);
    return { ok: true };
  }
}
