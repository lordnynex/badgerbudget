import type { DbLike } from "../db/dbAdapter";
import type {
  MailingList,
  MailingListMember,
  MailingListCriteria,
  ListPreview,
} from "@/shared/types/contact";
import type { ContactsService } from "./ContactsService";
import { uuid, auditLog } from "./utils";

export class MailingListsService {
  constructor(
    private db: DbLike,
    private contactsService: ContactsService
  ) {}

  private async evaluateDynamicCriteria(criteria: MailingListCriteria | null): Promise<string[]> {
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

    const rows = (await this.db.query(sql).all(...args)) as Array<{ id: string }>;
    return rows.map((r) => r.id);
  }

  async list(): Promise<MailingList[]> {
    const rows = (await this.db
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
  }

  async get(id: string): Promise<MailingList | null> {
    const row = (await this.db
      .query(
        `SELECT ml.*, e.name as event_name FROM mailing_lists ml LEFT JOIN events e ON e.id = ml.event_id WHERE ml.id = ?`
      )
      .get(id)) as Record<string, unknown> | null;
    if (!row) return null;

    const memberCount = (await this.db.query("SELECT COUNT(*) as c FROM mailing_list_members WHERE list_id = ?").get(id) as { c: number }).c;
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
  }

  async create(body: {
    name: string;
    description?: string;
    list_type?: MailingList["list_type"];
    event_id?: string | null;
    template?: string | null;
    criteria?: MailingListCriteria | null;
  }) {
    const id = uuid();
    await this.db.run(
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
    await auditLog(this.db, "mailing_list_created", "mailing_list", id, { name: body.name });
    return this.get(id)!;
  }

  async update(
    id: string,
    body: Partial<{
      name: string;
      description: string;
      list_type: MailingList["list_type"];
      event_id: string | null;
      template: string | null;
      criteria: MailingListCriteria | null;
    }>
  ) {
    const existing = await this.db.query("SELECT * FROM mailing_lists WHERE id = ?").get(id) as Record<string, unknown> | null;
    if (!existing) return null;

    const name = (body.name ?? existing.name) as string;
    const description = (body.description !== undefined ? body.description : existing.description) as string | null;
    const list_type = (body.list_type ?? existing.list_type) as MailingList["list_type"];
    const event_id = body.event_id !== undefined ? body.event_id : (existing.event_id as string | null);
    const template = body.template !== undefined ? body.template : (existing.template as string | null);
    const criteria = body.criteria !== undefined ? body.criteria : (existing.criteria ? JSON.parse(existing.criteria as string) : null);

    await this.db.run(
      "UPDATE mailing_lists SET name = ?, description = ?, list_type = ?, event_id = ?, template = ?, criteria = ?, updated_at = datetime('now') WHERE id = ?",
      [name, description, list_type, event_id, template, criteria ? JSON.stringify(criteria) : null, id]
    );
    await auditLog(this.db, "mailing_list_updated", "mailing_list", id, {});
    return this.get(id)!;
  }

  async delete(id: string) {
    await this.db.run("DELETE FROM mailing_list_members WHERE list_id = ?", [id]);
    await this.db.run("DELETE FROM mailing_lists WHERE id = ?", [id]);
    await auditLog(this.db, "mailing_list_deleted", "mailing_list", id, {});
    return { ok: true };
  }

  async addMember(listId: string, contactId: string, source: "manual" | "import" | "rule" = "manual") {
    const id = uuid();
    try {
      await this.db.run(
        "INSERT INTO mailing_list_members (id, list_id, contact_id, source) VALUES (?, ?, ?, ?)",
        [id, listId, contactId, source]
      );
    } catch {
      return null;
    }
    await auditLog(this.db, "mailing_list_member_added", "mailing_list", listId, { contact_id: contactId });
    return this.get(listId)!;
  }

  async removeMember(listId: string, contactId: string) {
    await this.db.run("DELETE FROM mailing_list_members WHERE list_id = ? AND contact_id = ?", [listId, contactId]);
    await auditLog(this.db, "mailing_list_member_removed", "mailing_list", listId, { contact_id: contactId });
    return { ok: true };
  }

  async addMembersBulk(listId: string, contactIds: string[], source: "manual" | "import" | "rule" = "manual") {
    for (const contactId of contactIds) {
      try {
        await this.db.run(
          "INSERT INTO mailing_list_members (id, list_id, contact_id, source) VALUES (?, ?, ?, ?)",
          [uuid(), listId, contactId, source]
        );
      } catch {
        // duplicate, skip
      }
    }
    await auditLog(this.db, "mailing_list_members_bulk_added", "mailing_list", listId, { count: contactIds.length });
    return { ok: true };
  }

  async preview(id: string): Promise<ListPreview> {
    const list = await this.get(id);
    if (!list) return { included: [], excluded: [], totalIncluded: 0, totalExcluded: 0 };

    let contactIds: string[] = [];

    if (list.list_type === "static") {
      const rows = (await this.db
        .query("SELECT contact_id FROM mailing_list_members WHERE list_id = ? AND suppressed = 0 AND unsubscribed = 0")
        .all(id)) as Array<{ contact_id: string }>;
      contactIds = rows.map((r) => r.contact_id);
    } else if (list.list_type === "dynamic") {
      contactIds = await this.evaluateDynamicCriteria(list.criteria);
    } else {
      const manualRows = (await this.db
        .query("SELECT contact_id FROM mailing_list_members WHERE list_id = ? AND suppressed = 0 AND unsubscribed = 0")
        .all(id)) as Array<{ contact_id: string }>;
      const manualIds = new Set(manualRows.map((r) => r.contact_id));
      const dynamicIds = await this.evaluateDynamicCriteria(list.criteria);
      contactIds = [...new Set([...manualIds, ...dynamicIds])];
    }

    const included: ListPreview["included"] = [];
    const excluded: ListPreview["excluded"] = [];

    for (const cid of contactIds) {
      const contact = await this.contactsService.get(cid);
      if (!contact) continue;

      if (contact.do_not_contact) {
        excluded.push({ contact, reason: "Do not contact" });
        continue;
      }
      if (contact.status === "inactive" || contact.status === "deleted") {
        excluded.push({ contact, reason: "Inactive or deleted" });
        continue;
      }

      const memberRow = (await this.db
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
  }

  async getMembers(listId: string): Promise<MailingListMember[]> {
    const rows = (await this.db
      .query("SELECT * FROM mailing_list_members WHERE list_id = ? ORDER BY added_at DESC")
      .all(listId)) as Array<Record<string, unknown>>;

    const result: MailingListMember[] = [];
    for (const r of rows) {
      const contact = await this.contactsService.get(r.contact_id as string);
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
  }
}
