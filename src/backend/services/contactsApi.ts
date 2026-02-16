import { getDb } from "../db/dbAdapter";
import type {
  Contact,
  ContactEmail,
  ContactPhone,
  ContactAddress,
  Tag,
  MailingList,
  MailingListMember,
  MailingBatch,
  MailingBatchRecipient,
  ListPreview,
  ContactSearchParams,
  ContactSearchResult,
  MailingListCriteria,
} from "@/shared/types/contact";

function uuid(): string {
  return crypto.randomUUID();
}

async function auditLog(
  action: string,
  entityType: string,
  entityId: string | null,
  details: Record<string, unknown> = {}
) {
  const db = getDb();
  await db.run(
    "INSERT INTO audit_log (id, action, entity_type, entity_id, user_id, details) VALUES (?, ?, ?, ?, ?, ?)",
    [uuid(), action, entityType, entityId, null, JSON.stringify(details)]
  );
}

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

async function loadContactRelations(db: ReturnType<typeof getDb>, contactId: string): Promise<{
  emails: ContactEmail[];
  phones: ContactPhone[];
  addresses: ContactAddress[];
  tags: Tag[];
}> {
  const emails = (await db
    .query("SELECT * FROM contact_emails WHERE contact_id = ? ORDER BY is_primary DESC, id")
    .all(contactId)) as Array<Record<string, unknown>>;
  const phones = (await db
    .query("SELECT * FROM contact_phones WHERE contact_id = ? ORDER BY is_primary DESC, id")
    .all(contactId)) as Array<Record<string, unknown>>;
  const addresses = (await db
    .query("SELECT * FROM contact_addresses WHERE contact_id = ? ORDER BY is_primary_mailing DESC, id")
    .all(contactId)) as Array<Record<string, unknown>>;
  const tagRows = (await db
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

export const contactsApi = {
  list: async (params: ContactSearchParams = {}): Promise<ContactSearchResult> => {
    const db = getDb();
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
    const countRow = (await db
      .query(
        `SELECT COUNT(*) as c FROM contacts WHERE ${whereClause}${searchCondition}`
      )
      .get(...allArgs)) as { c: number };
    const total = countRow.c;

    const rows = (await db
      .query(
        `SELECT * FROM contacts WHERE ${whereClause}${searchCondition} ORDER BY ${orderCol} ${orderDir} LIMIT ? OFFSET ?`
      )
      .all(...allArgs, limit, offset)) as Array<Record<string, unknown>>;

    const contacts = await Promise.all(
      rows.map(async (r) => {
        const c = rowToContact(r);
        const rel = await loadContactRelations(db, c.id);
        return { ...c, ...rel };
      })
    );

    return { contacts, total, page, limit };
  },

  get: async (id: string): Promise<Contact | null> => {
    const db = getDb();
    const row = await db.query("SELECT * FROM contacts WHERE id = ?").get(id) as Record<string, unknown> | null;
    if (!row) return null;
    const contact = rowToContact(row);
    const rel = await loadContactRelations(db, id);
    return { ...contact, ...rel };
  },

  /** Minimal contact data for PST import deduplication */
  getForDeduplication: async (): Promise<
    Array<{ id: string; display_name: string; emails: string[]; addressKey: string; nameKey: string }>
  > => {
    const db = getDb();
    const rows = (await db
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
      const emailsRaw = (await db
        .query("SELECT email FROM contact_emails WHERE contact_id = ?")
        .all(row.id)) as Array<{ email: string }>;
      const emails = emailsRaw.map((e) => e.email.toLowerCase().trim());
      const addr = (await db
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
  },

  create: async (body: Partial<Contact> & { display_name: string }) => {
    const db = getDb();
    const id = uuid();
    const uid = body.uid ?? `contact-${id}@badgerbudget`;
    const displayName = body.display_name?.trim() ?? "Unknown";
    const type = body.type ?? "person";
    const status = body.status ?? "active";

    await db.run(
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
        await db.run(
          "INSERT INTO contact_emails (id, contact_id, email, type, is_primary) VALUES (?, ?, ?, ?, ?)",
          [eid, id, e.email, e.type ?? "other", e.is_primary ? 1 : 0]
        );
      }
    }
    if (body.phones?.length) {
      for (const p of body.phones) {
        const pid = uuid();
        await db.run(
          "INSERT INTO contact_phones (id, contact_id, phone, type, is_primary) VALUES (?, ?, ?, ?, ?)",
          [pid, id, p.phone, p.type ?? "other", p.is_primary ? 1 : 0]
        );
      }
    }
    if (body.addresses?.length) {
      for (const a of body.addresses) {
        const aid = uuid();
        await db.run(
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
          const existing = await db.query("SELECT id FROM tags WHERE name = ?").get((t as Tag).name) as { id: string } | undefined;
          if (existing) tagId = existing.id;
          else {
            tagId = uuid();
            await db.run("INSERT INTO tags (id, name) VALUES (?, ?)", [tagId, (t as Tag).name]);
          }
        }
        if (tagId) {
          try {
            await db.run("INSERT INTO contact_tags (contact_id, tag_id) VALUES (?, ?)", [id, tagId]);
          } catch {
            // duplicate
          }
        }
      }
    }

    await auditLog("contact_created", "contact", id, { display_name: displayName });
    return contactsApi.get(id)!;
  },

  update: async (id: string, body: Partial<Contact>) => {
    const db = getDb();
    const existing = await db.query("SELECT * FROM contacts WHERE id = ?").get(id) as Record<string, unknown> | null;
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

    await db.run(
      `UPDATE contacts SET display_name=?, type=?, status=?, first_name=?, last_name=?, organization_name=?, notes=?, how_we_know_them=?, ok_to_email=?, ok_to_mail=?, do_not_contact=?, club_name=?, role=?, updated_at=datetime('now') WHERE id=?`,
      [display_name, type, status, first_name, last_name, organization_name, notes, how_we_know_them, ok_to_email, ok_to_mail, do_not_contact, club_name, role, id]
    );

    if (body.emails !== undefined) {
      await db.run("DELETE FROM contact_emails WHERE contact_id = ?", [id]);
      for (const e of body.emails) {
        const eid = uuid();
        await db.run(
          "INSERT INTO contact_emails (id, contact_id, email, type, is_primary) VALUES (?, ?, ?, ?, ?)",
          [eid, id, e.email, e.type ?? "other", e.is_primary ? 1 : 0]
        );
      }
    }
    if (body.phones !== undefined) {
      await db.run("DELETE FROM contact_phones WHERE contact_id = ?", [id]);
      for (const p of body.phones) {
        const pid = uuid();
        await db.run(
          "INSERT INTO contact_phones (id, contact_id, phone, type, is_primary) VALUES (?, ?, ?, ?, ?)",
          [pid, id, p.phone, p.type ?? "other", p.is_primary ? 1 : 0]
        );
      }
    }
    if (body.addresses !== undefined) {
      await db.run("DELETE FROM contact_addresses WHERE contact_id = ?", [id]);
      for (const a of body.addresses) {
        const aid = uuid();
        await db.run(
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
      await db.run("DELETE FROM contact_tags WHERE contact_id = ?", [id]);
      for (const t of body.tags) {
        let tagId = typeof t === "string" ? null : (t as Tag).id;
        const tagName = typeof t === "object" ? (t as Tag).name : t;
        if (!tagId) {
          const existingTag = await db.query("SELECT id FROM tags WHERE name = ?").get(tagName) as { id: string } | undefined;
          if (existingTag) tagId = existingTag.id;
          else {
            tagId = uuid();
            await db.run("INSERT INTO tags (id, name) VALUES (?, ?)", [tagId, tagName]);
          }
        }
        if (tagId) {
          try {
            await db.run("INSERT INTO contact_tags (contact_id, tag_id) VALUES (?, ?)", [id, tagId]);
          } catch {
            // duplicate
          }
        }
      }
    }

    await auditLog("contact_updated", "contact", id, {});
    return contactsApi.get(id)!;
  },

  delete: async (id: string) => {
    const db = getDb();
    await db.run("UPDATE contacts SET status = 'deleted', deleted_at = datetime('now'), updated_at = datetime('now') WHERE id = ?", [id]);
    await auditLog("contact_deleted", "contact", id, {});
    return { ok: true };
  },

  restore: async (id: string) => {
    const db = getDb();
    await db.run("UPDATE contacts SET status = 'active', deleted_at = NULL, updated_at = datetime('now') WHERE id = ?", [id]);
    await auditLog("contact_restored", "contact", id, {});
    return contactsApi.get(id)!;
  },

  bulkUpdate: async (
    ids: string[],
    updates: { tags?: (string | Tag)[]; status?: Contact["status"] }
  ) => {
    const db = getDb();
    for (const id of ids) {
      if (updates.status) {
        await db.run("UPDATE contacts SET status = ?, updated_at = datetime('now') WHERE id = ?", [updates.status, id]);
      }
      if (updates.tags) {
        await db.run("DELETE FROM contact_tags WHERE contact_id = ?", [id]);
        for (const t of updates.tags) {
          const tagName = typeof t === "object" ? (t as Tag).name : t;
          let tagId = (await db.query("SELECT id FROM tags WHERE name = ?").get(tagName) as { id: string } | undefined)?.id;
          if (!tagId) {
            tagId = uuid();
            await db.run("INSERT INTO tags (id, name) VALUES (?, ?)", [tagId, tagName]);
          }
          try {
            await db.run("INSERT INTO contact_tags (contact_id, tag_id) VALUES (?, ?)", [id, tagId]);
          } catch {
            // duplicate
          }
        }
      }
    }
    await auditLog("contacts_bulk_updated", "contact", null, { count: ids.length, updates });
    return { ok: true };
  },

  merge: async (
    sourceId: string,
    targetId: string,
    conflictResolution?: Record<string, "source" | "target">
  ) => {
    const db = getDb();
    const source = await contactsApi.get(sourceId);
    const target = await contactsApi.get(targetId);
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

    await contactsApi.update(targetId, {
      ...mergeContact,
      emails: allEmails.length ? allEmails : undefined,
      phones: allPhones.length ? allPhones : undefined,
      addresses: allAddresses.length ? allAddresses : undefined,
      tags: allTags,
    });

    await db.run("UPDATE mailing_list_members SET contact_id = ? WHERE contact_id = ?", [targetId, sourceId]);
    await db.run("UPDATE mailing_batch_recipients SET contact_id = ? WHERE contact_id = ?", [targetId, sourceId]);
    await contactsApi.delete(sourceId);

    await auditLog("contact_merged", "contact", targetId, { source_id: sourceId });
    return contactsApi.get(targetId)!;
  },

  tags: {
    list: async (): Promise<Tag[]> => {
      const db = getDb();
      const rows = await db.query("SELECT * FROM tags ORDER BY name").all() as Array<Record<string, unknown>>;
      return rows.map((r) => ({ id: r.id as string, name: r.name as string }));
    },
    create: async (name: string): Promise<Tag> => {
      const db = getDb();
      const id = uuid();
      await db.run("INSERT INTO tags (id, name) VALUES (?, ?)", [id, name]);
      return { id, name };
    },
  },
};

async function evaluateDynamicCriteria(db: ReturnType<typeof getDb>, criteria: MailingListCriteria | null): Promise<string[]> {
  if (!criteria) return [];

  let sql = "SELECT id FROM contacts WHERE deleted_at IS NULL AND status = 'active'";
  const args: (string | number)[] = [];

  if (criteria.active !== undefined) {
    sql += criteria.active ? " AND status = 'active'" : " AND status = 'inactive'";
  }
  if (criteria.okToMail === true) {
    sql += " AND (ok_to_mail = 'yes' OR ok_to_mail = 'unknown') AND do_not_contact = 0";
  }
  if (criteria.okToEmail === true) {
    sql += " AND (ok_to_email = 'yes' OR ok_to_email = 'unknown') AND do_not_contact = 0";
  }
  if (criteria.hasPostalAddress === true) {
    sql += " AND EXISTS (SELECT 1 FROM contact_addresses ca WHERE ca.contact_id = contacts.id AND ca.address_line1 IS NOT NULL AND ca.address_line1 != '')";
  }
  if (criteria.hasEmail === true) {
    sql += " AND EXISTS (SELECT 1 FROM contact_emails ce WHERE ce.contact_id = contacts.id)";
  }
  if (criteria.organization) {
    sql += " AND organization_name LIKE ?";
    args.push(`%${criteria.organization}%`);
  }
  if (criteria.clubName) {
    sql += " AND club_name LIKE ?";
    args.push(`%${criteria.clubName}%`);
  }
  if (criteria.tagIn && criteria.tagIn.length > 0) {
    sql += ` AND id IN (SELECT contact_id FROM contact_tags WHERE tag_id IN (SELECT id FROM tags WHERE name IN (${criteria.tagIn.map(() => "?").join(",")})))`;
    args.push(...criteria.tagIn);
  }
  if (criteria.tagNotIn && criteria.tagNotIn.length > 0) {
    sql += ` AND id NOT IN (SELECT contact_id FROM contact_tags WHERE tag_id IN (SELECT id FROM tags WHERE name IN (${criteria.tagNotIn.map(() => "?").join(",")})))`;
    args.push(...criteria.tagNotIn);
  }

  const rows = (await db.query(sql).all(...args)) as Array<{ id: string }>;
  return rows.map((r) => r.id);
}

export const mailingListsApi = {
  list: async (): Promise<MailingList[]> => {
    const db = getDb();
    const rows = (await db
      .query(
        `SELECT ml.*, e.name as event_name,
         (SELECT COUNT(*) FROM mailing_list_members mlm WHERE mlm.list_id = ml.id AND mlm.suppressed = 0 AND mlm.unsubscribed = 0) as manual_count
         FROM mailing_lists ml LEFT JOIN events e ON e.id = ml.event_id ORDER BY ml.name`
      )
      .all()) as Array<Record<string, unknown>>;

    return rows.map((r) => ({
      id: r.id as string,
      name: r.name as string,
      description: (r.description as string) ?? null,
      list_type: (r.list_type as MailingList["list_type"]) ?? "static",
      event_id: (r.event_id as string) ?? null,
      template: (r.template as string) ?? null,
      criteria: r.criteria ? (JSON.parse(r.criteria as string) as MailingListCriteria) : null,
      created_at: r.created_at as string | undefined,
      updated_at: r.updated_at as string | undefined,
      event: r.event_id ? { id: r.event_id as string, name: r.event_name as string } : undefined,
      member_count: Number(r.manual_count ?? 0),
    }));
  },

  get: async (id: string): Promise<MailingList | null> => {
    const db = getDb();
    const row = (await db
      .query(
        `SELECT ml.*, e.name as event_name FROM mailing_lists ml LEFT JOIN events e ON e.id = ml.event_id WHERE ml.id = ?`
      )
      .get(id)) as Record<string, unknown> | null;
    if (!row) return null;

    const memberCount = (await db.query("SELECT COUNT(*) as c FROM mailing_list_members WHERE list_id = ?").get(id) as { c: number }).c;
    return {
      id: row.id as string,
      name: row.name as string,
      description: (row.description as string) ?? null,
      list_type: (row.list_type as MailingList["list_type"]) ?? "static",
      event_id: (row.event_id as string) ?? null,
      template: (row.template as string) ?? null,
      criteria: row.criteria ? (JSON.parse(row.criteria as string) as MailingListCriteria) : null,
      created_at: row.created_at as string | undefined,
      updated_at: row.updated_at as string | undefined,
      event: row.event_id ? { id: row.event_id as string, name: row.event_name as string } : undefined,
      member_count: memberCount,
    };
  },

  create: async (body: {
    name: string;
    description?: string;
    list_type?: MailingList["list_type"];
    event_id?: string | null;
    template?: string | null;
    criteria?: MailingListCriteria | null;
  }) => {
    const db = getDb();
    const id = uuid();
    await db.run(
      "INSERT INTO mailing_lists (id, name, description, list_type, event_id, template, criteria) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        body.name,
        body.description ?? null,
        body.list_type ?? "static",
        body.event_id ?? null,
        body.template ?? null,
        body.criteria ? JSON.stringify(body.criteria) : null,
      ]
    );
    await auditLog("mailing_list_created", "mailing_list", id, { name: body.name });
    return mailingListsApi.get(id)!;
  },

  update: async (
    id: string,
    body: Partial<{
      name: string;
      description: string;
      list_type: MailingList["list_type"];
      event_id: string | null;
      template: string | null;
      criteria: MailingListCriteria | null;
    }>
  ) => {
    const db = getDb();
    const existing = await db.query("SELECT * FROM mailing_lists WHERE id = ?").get(id) as Record<string, unknown> | null;
    if (!existing) return null;

    const name = (body.name ?? existing.name) as string;
    const description = (body.description !== undefined ? body.description : existing.description) as string | null;
    const list_type = (body.list_type ?? existing.list_type) as MailingList["list_type"];
    const event_id = body.event_id !== undefined ? body.event_id : (existing.event_id as string | null);
    const template = body.template !== undefined ? body.template : (existing.template as string | null);
    const criteria = body.criteria !== undefined ? body.criteria : (existing.criteria ? JSON.parse(existing.criteria as string) : null);

    await db.run(
      "UPDATE mailing_lists SET name = ?, description = ?, list_type = ?, event_id = ?, template = ?, criteria = ?, updated_at = datetime('now') WHERE id = ?",
      [name, description, list_type, event_id, template, criteria ? JSON.stringify(criteria) : null, id]
    );
    await auditLog("mailing_list_updated", "mailing_list", id, {});
    return mailingListsApi.get(id)!;
  },

  delete: async (id: string) => {
    const db = getDb();
    await db.run("DELETE FROM mailing_list_members WHERE list_id = ?", [id]);
    await db.run("DELETE FROM mailing_lists WHERE id = ?", [id]);
    await auditLog("mailing_list_deleted", "mailing_list", id, {});
    return { ok: true };
  },

  addMember: async (listId: string, contactId: string, source: "manual" | "import" | "rule" = "manual") => {
    const db = getDb();
    const id = uuid();
    try {
      await db.run(
        "INSERT INTO mailing_list_members (id, list_id, contact_id, source) VALUES (?, ?, ?, ?)",
        [id, listId, contactId, source]
      );
    } catch {
      return null;
    }
    await auditLog("mailing_list_member_added", "mailing_list", listId, { contact_id: contactId });
    return mailingListsApi.get(listId)!;
  },

  removeMember: async (listId: string, contactId: string) => {
    const db = getDb();
    await db.run("DELETE FROM mailing_list_members WHERE list_id = ? AND contact_id = ?", [listId, contactId]);
    await auditLog("mailing_list_member_removed", "mailing_list", listId, { contact_id: contactId });
    return { ok: true };
  },

  addMembersBulk: async (listId: string, contactIds: string[], source: "manual" | "import" | "rule" = "manual") => {
    const db = getDb();
    for (const contactId of contactIds) {
      try {
        await db.run(
          "INSERT INTO mailing_list_members (id, list_id, contact_id, source) VALUES (?, ?, ?, ?)",
          [uuid(), listId, contactId, source]
        );
      } catch {
        // duplicate, skip
      }
    }
    await auditLog("mailing_list_members_bulk_added", "mailing_list", listId, { count: contactIds.length });
    return { ok: true };
  },

  preview: async (id: string): Promise<ListPreview> => {
    const list = await mailingListsApi.get(id);
    if (!list) return { included: [], excluded: [], totalIncluded: 0, totalExcluded: 0 };

    const db = getDb();
    let contactIds: string[] = [];

    if (list.list_type === "static") {
      const rows = (await db
        .query("SELECT contact_id FROM mailing_list_members WHERE list_id = ? AND suppressed = 0 AND unsubscribed = 0")
        .all(id)) as Array<{ contact_id: string }>;
      contactIds = rows.map((r) => r.contact_id);
    } else if (list.list_type === "dynamic") {
      contactIds = await evaluateDynamicCriteria(db, list.criteria);
    } else {
      const manualRows = (await db
        .query("SELECT contact_id FROM mailing_list_members WHERE list_id = ? AND suppressed = 0 AND unsubscribed = 0")
        .all(id)) as Array<{ contact_id: string }>;
      const manualIds = new Set(manualRows.map((r) => r.contact_id));
      const dynamicIds = await evaluateDynamicCriteria(db, list.criteria);
      contactIds = [...new Set([...manualIds, ...dynamicIds])];
    }

    const included: ListPreview["included"] = [];
    const excluded: ListPreview["excluded"] = [];

    for (const cid of contactIds) {
      const contact = await contactsApi.get(cid);
      if (!contact) continue;

      if (contact.do_not_contact) {
        excluded.push({ contact, reason: "Do not contact" });
        continue;
      }
      if (contact.status === "inactive" || contact.status === "deleted") {
        excluded.push({ contact, reason: "Inactive or deleted" });
        continue;
      }

      const memberRow = (await db
        .query("SELECT suppressed, suppress_reason, unsubscribed FROM mailing_list_members WHERE list_id = ? AND contact_id = ?")
        .get(id, cid)) as { suppressed: number; suppress_reason: string | null; unsubscribed: number } | undefined;

      if (memberRow?.suppressed) {
        excluded.push({ contact, reason: memberRow.suppress_reason ?? "Suppressed" });
        continue;
      }
      if (memberRow?.unsubscribed) {
        excluded.push({ contact, reason: "Unsubscribed" });
        continue;
      }

      included.push({ contact });
    }

    return {
      included,
      excluded,
      totalIncluded: included.length,
      totalExcluded: excluded.length,
    };
  },

  getMembers: async (listId: string): Promise<MailingListMember[]> => {
    const db = getDb();
    const rows = (await db
      .query("SELECT * FROM mailing_list_members WHERE list_id = ? ORDER BY added_at DESC")
      .all(listId)) as Array<Record<string, unknown>>;

    const result: MailingListMember[] = [];
    for (const r of rows) {
      const contact = await contactsApi.get(r.contact_id as string);
      if (contact) {
        result.push({
          id: r.id as string,
          list_id: r.list_id as string,
          contact_id: r.contact_id as string,
          added_by: (r.added_by as string) ?? null,
          added_at: r.added_at as string,
          source: (r.source as MailingListMember["source"]) ?? "manual",
          suppressed: (r.suppressed as number) === 1,
          suppress_reason: (r.suppress_reason as string) ?? null,
          unsubscribed: (r.unsubscribed as number) === 1,
          contact,
        });
      }
    }
    return result;
  },
};

export const mailingBatchesApi = {
  create: async (listId: string, name: string) => {
    const preview = await mailingListsApi.preview(listId);
    const db = getDb();
    const list = await mailingListsApi.get(listId);
    if (!list) return null;

    const id = uuid();
    const eventId = list.event_id;

    await db.run(
      "INSERT INTO mailing_batches (id, list_id, event_id, name, recipient_count) VALUES (?, ?, ?, ?, ?)",
      [id, listId, eventId, name, preview.totalIncluded]
    );

    const primaryAddress = (c: Contact) => {
      const addrs = c.addresses ?? [];
      const primary = addrs.find((a) => a.is_primary_mailing) ?? addrs[0];
      return primary;
    };

    for (const { contact } of preview.included) {
      const addr = primaryAddress(contact);
      const rid = uuid();
      await db.run(
        `INSERT INTO mailing_batch_recipients (id, batch_id, contact_id, snapshot_name, snapshot_address_line1, snapshot_address_line2, snapshot_city, snapshot_state, snapshot_postal_code, snapshot_country, snapshot_organization, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'queued')`,
        [
          rid,
          id,
          contact.id,
          contact.display_name,
          addr?.address_line1 ?? null,
          addr?.address_line2 ?? null,
          addr?.city ?? null,
          addr?.state ?? null,
          addr?.postal_code ?? null,
          addr?.country ?? null,
          contact.organization_name ?? null,
        ]
      );
    }

    await auditLog("mailing_batch_created", "mailing_batch", id, { list_id: listId, count: preview.totalIncluded });
    return mailingBatchesApi.get(id)!;
  },

  get: async (id: string): Promise<MailingBatch | null> => {
    const db = getDb();
    const row = (await db
      .query(
        `SELECT mb.*, ml.name as list_name, e.name as event_name FROM mailing_batches mb
         LEFT JOIN mailing_lists ml ON ml.id = mb.list_id LEFT JOIN events e ON e.id = mb.event_id WHERE mb.id = ?`
      )
      .get(id)) as Record<string, unknown> | null;
    if (!row) return null;

    const recipients = (await db
      .query("SELECT * FROM mailing_batch_recipients WHERE batch_id = ? ORDER BY snapshot_name")
      .all(id)) as Array<Record<string, unknown>>;

    return {
      id: row.id as string,
      list_id: row.list_id as string,
      event_id: (row.event_id as string) ?? null,
      name: row.name as string,
      created_by: (row.created_by as string) ?? null,
      created_at: row.created_at as string,
      recipient_count: (row.recipient_count as number) ?? 0,
      list: { id: row.list_id as string, name: row.list_name as string } as MailingList,
      event: row.event_id ? { id: row.event_id as string, name: row.event_name as string } : undefined,
      recipients: recipients.map((r) => ({
        id: r.id as string,
        batch_id: r.batch_id as string,
        contact_id: r.contact_id as string,
        snapshot_name: r.snapshot_name as string,
        snapshot_address_line1: (r.snapshot_address_line1 as string) ?? null,
        snapshot_address_line2: (r.snapshot_address_line2 as string) ?? null,
        snapshot_city: (r.snapshot_city as string) ?? null,
        snapshot_state: (r.snapshot_state as string) ?? null,
        snapshot_postal_code: (r.snapshot_postal_code as string) ?? null,
        snapshot_country: (r.snapshot_country as string) ?? null,
        snapshot_organization: (r.snapshot_organization as string) ?? null,
        status: (r.status as MailingBatchRecipient["status"]) ?? "queued",
        invalid_reason: (r.invalid_reason as string) ?? null,
        returned_reason: (r.returned_reason as string) ?? null,
      })),
    };
  },

  list: async (): Promise<MailingBatch[]> => {
    const db = getDb();
    const rows = (await db
      .query(
        `SELECT mb.*, ml.name as list_name, e.name as event_name FROM mailing_batches mb
         LEFT JOIN mailing_lists ml ON ml.id = mb.list_id LEFT JOIN events e ON e.id = mb.event_id ORDER BY mb.created_at DESC`
      )
      .all()) as Array<Record<string, unknown>>;

    return rows.map((r) => ({
      id: r.id as string,
      list_id: r.list_id as string,
      event_id: (r.event_id as string) ?? null,
      name: r.name as string,
      created_by: (r.created_by as string) ?? null,
      created_at: r.created_at as string,
      recipient_count: (r.recipient_count as number) ?? 0,
      list: { id: r.list_id as string, name: r.list_name as string } as MailingList,
      event: r.event_id ? { id: r.event_id as string, name: r.event_name as string } : undefined,
    }));
  },

  updateRecipientStatus: async (
    batchId: string,
    recipientId: string,
    status: MailingBatchRecipient["status"],
    reason?: string
  ) => {
    const db = getDb();
    if (status === "returned") {
      await db.run(
        "UPDATE mailing_batch_recipients SET status = ?, returned_reason = ? WHERE id = ? AND batch_id = ?",
        [status, reason ?? null, recipientId, batchId]
      );
    } else if (status === "invalid") {
      await db.run(
        "UPDATE mailing_batch_recipients SET status = ?, invalid_reason = ? WHERE id = ? AND batch_id = ?",
        [status, reason ?? null, recipientId, batchId]
      );
    } else {
      await db.run(
        "UPDATE mailing_batch_recipients SET status = ? WHERE id = ? AND batch_id = ?",
        [status, recipientId, batchId]
      );
    }
    await auditLog("mailing_batch_recipient_status_updated", "mailing_batch", batchId, {
      recipient_id: recipientId,
      status,
    });
    return { ok: true };
  },
};
