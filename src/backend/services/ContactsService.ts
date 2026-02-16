import type { DbLike } from "../db/dbAdapter";
import type {
  Contact,
  ContactEmail,
  ContactPhone,
  ContactAddress,
  Tag,
  ContactSearchParams,
  ContactSearchResult,
} from "@/shared/types/contact";
import { uuid, auditLog } from "./utils";

function rowToContact(row: Record<string, unknown>): Contact {
  return {
    id: row.id as string,
    type: (row.type as Contact["type"]) ?? "person",
    status: (row.status as Contact["status"]) ?? "active",
    display_name: (row.display_name as string) ?? "",
    first_name: (row.first_name as string) ?? null,
    last_name: (row.last_name as string) ?? null,
    organization_name: (row.organization_name as string) ?? null,
    notes: (row.notes as string) ?? null,
    how_we_know_them: (row.how_we_know_them as string) ?? null,
    ok_to_email: (row.ok_to_email as Contact["ok_to_email"]) ?? "unknown",
    ok_to_mail: (row.ok_to_mail as Contact["ok_to_mail"]) ?? "unknown",
    do_not_contact: (row.do_not_contact as number) === 1,
    club_name: (row.club_name as string) ?? null,
    role: (row.role as string) ?? null,
    uid: (row.uid as string) ?? null,
    created_at: row.created_at as string | undefined,
    updated_at: row.updated_at as string | undefined,
    deleted_at: (row.deleted_at as string) ?? null,
  };
}

export class ContactsService {
  constructor(private db: DbLike) {}

  private async loadContactRelations(contactId: string): Promise<{
    emails: ContactEmail[];
    phones: ContactPhone[];
    addresses: ContactAddress[];
    tags: Tag[];
  }> {
    const emails = (await this.db
      .query("SELECT * FROM contact_emails WHERE contact_id = ? ORDER BY is_primary DESC, id")
      .all(contactId)) as Array<Record<string, unknown>>;
    const phones = (await this.db
      .query("SELECT * FROM contact_phones WHERE contact_id = ? ORDER BY is_primary DESC, id")
      .all(contactId)) as Array<Record<string, unknown>>;
    const addresses = (await this.db
      .query("SELECT * FROM contact_addresses WHERE contact_id = ? ORDER BY is_primary_mailing DESC, id")
      .all(contactId)) as Array<Record<string, unknown>>;
    const tagRows = (await this.db
      .query(
        "SELECT t.id, t.name FROM tags t JOIN contact_tags ct ON t.id = ct.tag_id WHERE ct.contact_id = ?"
      )
      .all(contactId)) as Array<Record<string, unknown>>;

    return {
      emails: emails.map((e) => ({
        id: e.id as string,
        contact_id: e.contact_id as string,
        email: e.email as string,
        type: (e.type as ContactEmail["type"]) ?? "other",
        is_primary: (e.is_primary as number) === 1,
      })),
      phones: phones.map((p) => ({
        id: p.id as string,
        contact_id: p.contact_id as string,
        phone: p.phone as string,
        type: (p.type as ContactPhone["type"]) ?? "other",
        is_primary: (p.is_primary as number) === 1,
      })),
      addresses: addresses.map((a) => ({
        id: a.id as string,
        contact_id: a.contact_id as string,
        address_line1: (a.address_line1 as string) ?? null,
        address_line2: (a.address_line2 as string) ?? null,
        city: (a.city as string) ?? null,
        state: (a.state as string) ?? null,
        postal_code: (a.postal_code as string) ?? null,
        country: (a.country as string) ?? null,
        type: (a.type as ContactAddress["type"]) ?? "home",
        is_primary_mailing: (a.is_primary_mailing as number) === 1,
      })),
      tags: tagRows.map((t) => ({ id: t.id as string, name: t.name as string })),
    };
  }

  async list(params: ContactSearchParams = {}): Promise<ContactSearchResult> {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 50, 100);
    const offset = (page - 1) * limit;
    const sort = params.sort ?? "updated_at";
    const sortDir = params.sortDir ?? "desc";

    const conditions: string[] = ["deleted_at IS NULL"];
    const args: (string | number)[] = [];

    if (params.status && params.status !== "all") {
      conditions.push("status = ?");
      args.push(params.status);
    }
    if (params.hasPostalAddress === true) {
      conditions.push(
        "EXISTS (SELECT 1 FROM contact_addresses ca WHERE ca.contact_id = contacts.id AND ca.address_line1 IS NOT NULL AND ca.address_line1 != '')"
      );
    }
    if (params.hasEmail === true) {
      conditions.push(
        "EXISTS (SELECT 1 FROM contact_emails ce WHERE ce.contact_id = contacts.id)"
      );
    }
    if (params.tagIds && params.tagIds.length > 0) {
      conditions.push(
        `id IN (SELECT contact_id FROM contact_tags WHERE tag_id IN (${params.tagIds.map(() => "?").join(",")}))`
      );
      args.push(...params.tagIds);
    }
    if (params.organization) {
      conditions.push("organization_name LIKE ?");
      args.push(`%${params.organization}%`);
    }
    if (params.role) {
      conditions.push("role LIKE ?");
      args.push(`%${params.role}%`);
    }

    let searchCondition = "";
    const searchArgs: (string | number)[] = [];
    if (params.q && params.q.trim()) {
      const q = `%${params.q.trim()}%`;
      searchCondition = ` AND (
        display_name LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR
        organization_name LIKE ? OR notes LIKE ? OR club_name LIKE ? OR role LIKE ? OR
        EXISTS (SELECT 1 FROM contact_emails ce WHERE ce.contact_id = contacts.id AND ce.email LIKE ?) OR
        EXISTS (SELECT 1 FROM contact_phones cp WHERE cp.contact_id = contacts.id AND cp.phone LIKE ?) OR
        EXISTS (SELECT 1 FROM contact_addresses ca WHERE ca.contact_id = contacts.id AND (ca.city LIKE ? OR ca.state LIKE ?)) OR
        EXISTS (SELECT 1 FROM contact_tags ct JOIN tags t ON t.id = ct.tag_id WHERE ct.contact_id = contacts.id AND t.name LIKE ?)
      )`;
      for (let i = 0; i < 12; i++) searchArgs.push(q);
    }

    const whereClause = conditions.join(" AND ");
    const orderCol =
      sort === "name"
        ? "display_name"
        : sort === "last_contacted"
          ? "updated_at"
          : "updated_at";
    const orderDir = sortDir.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const allArgs = [...args, ...searchArgs];
    const countRow = (await this.db
      .query(
        `SELECT COUNT(*) as c FROM contacts WHERE ${whereClause}${searchCondition}`
      )
      .get(...allArgs)) as { c: number };
    const total = countRow.c;

    const rows = (await this.db
      .query(
        `SELECT * FROM contacts WHERE ${whereClause}${searchCondition} ORDER BY ${orderCol} ${orderDir} LIMIT ? OFFSET ?`
      )
      .all(...allArgs, limit, offset)) as Array<Record<string, unknown>>;

    const contacts = await Promise.all(
      rows.map(async (r) => {
        const c = rowToContact(r);
        const rel = await this.loadContactRelations(c.id);
        return { ...c, ...rel };
      })
    );

    return { contacts, total, page, limit };
  }

  async get(id: string): Promise<Contact | null> {
    const row = await this.db.query("SELECT * FROM contacts WHERE id = ?").get(id) as Record<string, unknown> | null;
    if (!row) return null;
    const contact = rowToContact(row);
    const rel = await this.loadContactRelations(id);
    return { ...contact, ...rel };
  }

  async getForDeduplication(): Promise<
    Array<{ id: string; display_name: string; emails: string[]; addressKey: string; nameKey: string }>
  > {
    const rows = (await this.db
      .query(
        "SELECT id, display_name FROM contacts WHERE deleted_at IS NULL"
      )
      .all()) as Array<{ id: string; display_name: string }>;
    const result: Array<{
      id: string;
      display_name: string;
      emails: string[];
      addressKey: string;
      nameKey: string;
    }> = [];
    for (const row of rows) {
      const emailsRaw = (await this.db
        .query("SELECT email FROM contact_emails WHERE contact_id = ?")
        .all(row.id)) as Array<{ email: string }>;
      const emails = emailsRaw.map((e) => e.email.toLowerCase().trim());
      const addr = (await this.db
        .query(
          "SELECT address_line1, city, postal_code FROM contact_addresses WHERE contact_id = ? ORDER BY is_primary_mailing DESC LIMIT 1"
        )
        .get(row.id)) as { address_line1: string | null; city: string | null; postal_code: string | null } | undefined;
      const addressKey = addr
        ? [
            addr.address_line1 ?? "",
            addr.city ?? "",
            addr.postal_code ?? "",
          ]
            .map((s) => (s ?? "").toLowerCase().replace(/\s+/g, " "))
            .join("|")
        : "";
      const nameKey = (row.display_name ?? "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
      result.push({
        id: row.id,
        display_name: row.display_name ?? "",
        emails,
        addressKey,
        nameKey,
      });
    }
    return result;
  }

  async create(body: Partial<Contact> & { display_name: string }) {
    const id = uuid();
    const uid = body.uid ?? `contact-${id}@badgerbudget`;
    const displayName = body.display_name?.trim() ?? "Unknown";
    const type = body.type ?? "person";
    const status = body.status ?? "active";

    await this.db.run(
      `INSERT INTO contacts (id, type, status, display_name, first_name, last_name, organization_name, notes, how_we_know_them, ok_to_email, ok_to_mail, do_not_contact, club_name, role, uid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        type,
        status,
        displayName,
        body.first_name ?? null,
        body.last_name ?? null,
        body.organization_name ?? null,
        body.notes ?? null,
        body.how_we_know_them ?? null,
        body.ok_to_email ?? "unknown",
        body.ok_to_mail ?? "unknown",
        body.do_not_contact ? 1 : 0,
        body.club_name ?? null,
        body.role ?? null,
        uid,
      ]
    );

    if (body.emails?.length) {
      for (const e of body.emails) {
        const eid = uuid();
        await this.db.run(
          "INSERT INTO contact_emails (id, contact_id, email, type, is_primary) VALUES (?, ?, ?, ?, ?)",
          [eid, id, e.email, e.type ?? "other", e.is_primary ? 1 : 0]
        );
      }
    }
    if (body.phones?.length) {
      for (const p of body.phones) {
        const pid = uuid();
        await this.db.run(
          "INSERT INTO contact_phones (id, contact_id, phone, type, is_primary) VALUES (?, ?, ?, ?, ?)",
          [pid, id, p.phone, p.type ?? "other", p.is_primary ? 1 : 0]
        );
      }
    }
    if (body.addresses?.length) {
      for (const a of body.addresses) {
        const aid = uuid();
        await this.db.run(
          "INSERT INTO contact_addresses (id, contact_id, address_line1, address_line2, city, state, postal_code, country, type, is_primary_mailing) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            aid,
            id,
            a.address_line1 ?? null,
            a.address_line2 ?? null,
            a.city ?? null,
            a.state ?? null,
            a.postal_code ?? null,
            a.country ?? "US",
            a.type ?? "home",
            a.is_primary_mailing ? 1 : 0,
          ]
        );
      }
    }
    if (body.tags?.length) {
      for (const t of body.tags) {
        let tagId = typeof t === "string" ? null : t.id;
        if (!tagId && (typeof t === "object" && "name" in t)) {
          const existing = await this.db.query("SELECT id FROM tags WHERE name = ?").get((t as Tag).name) as { id: string } | undefined;
          if (existing) tagId = existing.id;
          else {
            tagId = uuid();
            await this.db.run("INSERT INTO tags (id, name) VALUES (?, ?)", [tagId, (t as Tag).name]);
          }
        }
        if (tagId) {
          try {
            await this.db.run("INSERT INTO contact_tags (contact_id, tag_id) VALUES (?, ?)", [id, tagId]);
          } catch {
            // duplicate
          }
        }
      }
    }

    await auditLog(this.db, "contact_created", "contact", id, { display_name: displayName });
    return this.get(id)!;
  }

  async update(id: string, body: Partial<Contact>) {
    const existing = await this.db.query("SELECT * FROM contacts WHERE id = ?").get(id) as Record<string, unknown> | null;
    if (!existing) return null;

    const get = (k: string, def: unknown) =>
      (body as Record<string, unknown>)[k] !== undefined ? (body as Record<string, unknown>)[k] : existing[k] ?? def;

    const display_name = (get("display_name", existing.display_name) as string) ?? "Unknown";
    const type = get("type", existing.type) as Contact["type"];
    const status = get("status", existing.status) as Contact["status"];
    const first_name = get("first_name", existing.first_name) as string | null;
    const last_name = get("last_name", existing.last_name) as string | null;
    const organization_name = get("organization_name", existing.organization_name) as string | null;
    const notes = get("notes", existing.notes) as string | null;
    const how_we_know_them = get("how_we_know_them", existing.how_we_know_them) as string | null;
    const ok_to_email = get("ok_to_email", existing.ok_to_email) as Contact["ok_to_email"];
    const ok_to_mail = get("ok_to_mail", existing.ok_to_mail) as Contact["ok_to_mail"];
    const do_not_contact = (get("do_not_contact", existing.do_not_contact) as boolean) ? 1 : 0;
    const club_name = get("club_name", existing.club_name) as string | null;
    const role = get("role", existing.role) as string | null;

    await this.db.run(
      `UPDATE contacts SET display_name=?, type=?, status=?, first_name=?, last_name=?, organization_name=?, notes=?, how_we_know_them=?, ok_to_email=?, ok_to_mail=?, do_not_contact=?, club_name=?, role=?, updated_at=datetime('now') WHERE id=?`,
      [display_name, type, status, first_name, last_name, organization_name, notes, how_we_know_them, ok_to_email, ok_to_mail, do_not_contact, club_name, role, id]
    );

    if (body.emails !== undefined) {
      await this.db.run("DELETE FROM contact_emails WHERE contact_id = ?", [id]);
      for (const e of body.emails) {
        const eid = uuid();
        await this.db.run(
          "INSERT INTO contact_emails (id, contact_id, email, type, is_primary) VALUES (?, ?, ?, ?, ?)",
          [eid, id, e.email, e.type ?? "other", e.is_primary ? 1 : 0]
        );
      }
    }
    if (body.phones !== undefined) {
      await this.db.run("DELETE FROM contact_phones WHERE contact_id = ?", [id]);
      for (const p of body.phones) {
        const pid = uuid();
        await this.db.run(
          "INSERT INTO contact_phones (id, contact_id, phone, type, is_primary) VALUES (?, ?, ?, ?, ?)",
          [pid, id, p.phone, p.type ?? "other", p.is_primary ? 1 : 0]
        );
      }
    }
    if (body.addresses !== undefined) {
      await this.db.run("DELETE FROM contact_addresses WHERE contact_id = ?", [id]);
      for (const a of body.addresses) {
        const aid = uuid();
        await this.db.run(
          "INSERT INTO contact_addresses (id, contact_id, address_line1, address_line2, city, state, postal_code, country, type, is_primary_mailing) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            aid,
            id,
            a.address_line1 ?? null,
            a.address_line2 ?? null,
            a.city ?? null,
            a.state ?? null,
            a.postal_code ?? null,
            a.country ?? "US",
            a.type ?? "home",
            a.is_primary_mailing ? 1 : 0,
          ]
        );
      }
    }
    if (body.tags !== undefined) {
      await this.db.run("DELETE FROM contact_tags WHERE contact_id = ?", [id]);
      for (const t of body.tags) {
        let tagId = typeof t === "string" ? null : (t as Tag).id;
        const tagName = typeof t === "object" ? (t as Tag).name : t;
        if (!tagId) {
          const existingTag = await this.db.query("SELECT id FROM tags WHERE name = ?").get(tagName) as { id: string } | undefined;
          if (existingTag) tagId = existingTag.id;
          else {
            tagId = uuid();
            await this.db.run("INSERT INTO tags (id, name) VALUES (?, ?)", [tagId, tagName]);
          }
        }
        if (tagId) {
          try {
            await this.db.run("INSERT INTO contact_tags (contact_id, tag_id) VALUES (?, ?)", [id, tagId]);
          } catch {
            // duplicate
          }
        }
      }
    }

    await auditLog(this.db, "contact_updated", "contact", id, {});
    return this.get(id)!;
  }

  async delete(id: string) {
    await this.db.run("UPDATE contacts SET status = 'deleted', deleted_at = datetime('now'), updated_at = datetime('now') WHERE id = ?", [id]);
    await auditLog(this.db, "contact_deleted", "contact", id, {});
    return { ok: true };
  }

  async restore(id: string) {
    await this.db.run("UPDATE contacts SET status = 'active', deleted_at = NULL, updated_at = datetime('now') WHERE id = ?", [id]);
    await auditLog(this.db, "contact_restored", "contact", id, {});
    return this.get(id)!;
  }

  async bulkUpdate(
    ids: string[],
    updates: { tags?: (string | Tag)[]; status?: Contact["status"] }
  ) {
    for (const id of ids) {
      if (updates.status) {
        await this.db.run("UPDATE contacts SET status = ?, updated_at = datetime('now') WHERE id = ?", [updates.status, id]);
      }
      if (updates.tags) {
        await this.db.run("DELETE FROM contact_tags WHERE contact_id = ?", [id]);
        for (const t of updates.tags) {
          const tagName = typeof t === "object" ? (t as Tag).name : t;
          let tagId = (await this.db.query("SELECT id FROM tags WHERE name = ?").get(tagName) as { id: string } | undefined)?.id;
          if (!tagId) {
            tagId = uuid();
            await this.db.run("INSERT INTO tags (id, name) VALUES (?, ?)", [tagId, tagName]);
          }
          try {
            await this.db.run("INSERT INTO contact_tags (contact_id, tag_id) VALUES (?, ?)", [id, tagId]);
          } catch {
            // duplicate
          }
        }
      }
    }
    await auditLog(this.db, "contacts_bulk_updated", "contact", null, { count: ids.length, updates });
    return { ok: true };
  }

  async merge(
    sourceId: string,
    targetId: string,
    conflictResolution?: Record<string, "source" | "target">
  ) {
    const source = await this.get(sourceId);
    const target = await this.get(targetId);
    if (!source || !target) return null;

    const resolution = conflictResolution ?? {};
    const mergeContact: Partial<Contact> = {
      display_name: (resolution.display_name === "source" ? source : target).display_name,
      first_name: (resolution.first_name === "source" ? source : target).first_name ?? (resolution.first_name === "target" ? target : source).first_name,
      last_name: (resolution.last_name === "source" ? source : target).last_name ?? (resolution.last_name === "target" ? target : source).last_name,
      organization_name: (resolution.organization_name === "source" ? source : target).organization_name ?? (resolution.organization_name === "target" ? target : source).organization_name,
      notes: [source.notes, target.notes].filter(Boolean).join("\n\n") || null,
      ok_to_email: (resolution.ok_to_email === "source" ? source : target).ok_to_email,
      ok_to_mail: (resolution.ok_to_mail === "source" ? source : target).ok_to_mail,
      do_not_contact: source.do_not_contact || target.do_not_contact,
      club_name: (resolution.club_name === "source" ? source : target).club_name ?? (resolution.club_name === "target" ? target : source).club_name,
      role: (resolution.role === "source" ? source : target).role ?? (resolution.role === "target" ? target : source).role,
    };

    const allEmails = [...(target.emails ?? []), ...(source.emails ?? []).filter((e) => !(target.emails ?? []).some((te) => te.email === e.email))];
    const allPhones = [...(target.phones ?? []), ...(source.phones ?? []).filter((p) => !(target.phones ?? []).some((tp) => tp.phone === p.phone))];
    const allAddresses = [...(target.addresses ?? []), ...(source.addresses ?? []).filter((a) => {
      const key = (addr: ContactAddress) => [addr.address_line1, addr.city, addr.postal_code].join("|");
      return !(target.addresses ?? []).some((ta) => key(ta) === key(a));
    })];
    const allTags = [...new Map([...(target.tags ?? []), ...(source.tags ?? [])].map((t) => [t.name, t])).values()];

    await this.update(targetId, {
      ...mergeContact,
      emails: allEmails.length ? allEmails : undefined,
      phones: allPhones.length ? allPhones : undefined,
      addresses: allAddresses.length ? allAddresses : undefined,
      tags: allTags,
    });

    await this.db.run("UPDATE mailing_list_members SET contact_id = ? WHERE contact_id = ?", [targetId, sourceId]);
    await this.db.run("UPDATE mailing_batch_recipients SET contact_id = ? WHERE contact_id = ?", [targetId, sourceId]);
    await this.delete(sourceId);

    await auditLog(this.db, "contact_merged", "contact", targetId, { source_id: sourceId });
    return this.get(targetId)!;
  }

  tags = {
    list: async (): Promise<Tag[]> => {
      const rows = await this.db.query("SELECT * FROM tags ORDER BY name").all() as Array<Record<string, unknown>>;
      return rows.map((r) => ({ id: r.id as string, name: r.name as string }));
    },
    create: async (name: string): Promise<Tag> => {
      const id = uuid();
      await this.db.run("INSERT INTO tags (id, name) VALUES (?, ?)", [id, name]);
      return { id, name };
    },
  };
}
