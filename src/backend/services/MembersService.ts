import type { DbLike } from "../db/dbAdapter";
import { ALL_MEMBERS_ID } from "@/shared/lib/constants";
import { uuid, VALID_POSITIONS, parsePhotoToBlob } from "./utils";
import { ImageService } from "./ImageService";

export type PhotoSize = "thumbnail" | "medium" | "full";

const MEMBER_COLUMNS =
  "id, name, phone_number, email, address, birthday, member_since, is_baby, position, emergency_contact_name, emergency_contact_phone, created_at, (photo IS NOT NULL) as has_photo";

function rowToMember(m: Record<string, unknown>) {
  const id = m.id as string;
  const hasPhoto = (m.has_photo as number) === 1;
  return {
    id,
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
    photo_url: hasPhoto ? `/api/members/${id}/photo?size=full` : null,
    photo_thumbnail_url: hasPhoto ? `/api/members/${id}/photo?size=thumbnail` : null,
    created_at: m.created_at as string | undefined,
  };
}

export class MembersService {
  constructor(private db: DbLike) {}

  async list() {
    const rows = (await this.db
      .query(`SELECT ${MEMBER_COLUMNS} FROM members WHERE id != ? ORDER BY name`)
      .all(ALL_MEMBERS_ID)) as Array<Record<string, unknown>>;
    return rows.map(rowToMember);
  }

  async get(id: string) {
    const row = await this.db.query(`SELECT ${MEMBER_COLUMNS} FROM members WHERE id = ?`).get(id);
    if (!row) return null;
    return rowToMember(row as Record<string, unknown>);
  }

  /**
   * Get member photo as buffer for the given size. Returns null if member has no photo.
   */
  async getPhoto(id: string, size: PhotoSize): Promise<Buffer | null> {
    const row = await this.db.query("SELECT photo, photo_thumbnail FROM members WHERE id = ?").get(id);
    if (!row) return null;
    const m = row as Record<string, unknown>;
    const photoBlob = m.photo as Uint8Array | Buffer | null;
    const thumbnailBlob = m.photo_thumbnail as Uint8Array | Buffer | null;

    if (!photoBlob) return null;

    const buffer = Buffer.from(photoBlob);

    switch (size) {
      case "thumbnail":
        if (thumbnailBlob) return Buffer.from(thumbnailBlob);
        return ImageService.createThumbnail(buffer);
      case "medium":
        return ImageService.createMedium(buffer);
      case "full":
        return buffer;
      default:
        return buffer;
    }
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
    const rawPhoto = body.photo ? parsePhotoToBlob(body.photo) : null;
    const photoBlob = rawPhoto
      ? (await ImageService.optimize(rawPhoto)) ?? rawPhoto
      : null;
    const photoThumbnailBlob =
      photoBlob ? await ImageService.createThumbnail(photoBlob) : null;
    await this.db.run(
      `INSERT INTO members (id, name, phone_number, email, address, birthday, member_since, is_baby, position, emergency_contact_name, emergency_contact_phone, photo, photo_thumbnail) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        photoThumbnailBlob,
      ]
    );
    return this.get(id)!;
  }

  async update(id: string, body: Partial<{
    name: string;
    phone_number: string | null;
    email: string | null;
    address: string | null;
    birthday: string | null;
    member_since: string | null;
    is_baby: boolean;
    position: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    photo: string | null;
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
    const rawPhoto =
      body.photo !== undefined
        ? (body.photo === null ? null : parsePhotoToBlob(body.photo) ?? null)
        : (row.photo as Uint8Array | null);
    const photoBlob =
      body.photo !== undefined && rawPhoto !== null
        ? (await ImageService.optimize(Buffer.from(rawPhoto))) ?? rawPhoto
        : rawPhoto;
    const photoThumbnailBlob =
      body.photo !== undefined
        ? (photoBlob ? await ImageService.createThumbnail(Buffer.from(photoBlob)) : null)
        : (row.photo_thumbnail as Uint8Array | null) ?? null;
    await this.db.run(
      `UPDATE members SET name = ?, phone_number = ?, email = ?, address = ?, birthday = ?, member_since = ?, is_baby = ?, position = ?, emergency_contact_name = ?, emergency_contact_phone = ?, photo = ?, photo_thumbnail = ? WHERE id = ?`,
      [name, phone_number, email, address, birthday, member_since, is_baby, position, emergency_contact_name, emergency_contact_phone, photoBlob, photoThumbnailBlob, id]
    );
    return this.get(id)!;
  }

  async delete(id: string) {
    await this.db.run("DELETE FROM members WHERE id = ?", [id]);
    return { ok: true };
  }
}
