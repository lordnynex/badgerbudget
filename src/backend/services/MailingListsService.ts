import type { DataSource } from "typeorm";
import type { DbLike } from "../db/dbAdapter";
import type {
  MailingList,
  MailingListMember,
  MailingListCriteria,
  ListPreview,
} from "@/shared/types/contact";
import type { ContactsService } from "./ContactsService";
import { Contact as ContactEntity, MailingList as MailingListEntity, MailingListMember as MailingListMemberEntity } from "../entities";
import { uuid, auditLog } from "./utils";

export class MailingListsService {
  constructor(
    private db: DbLike,
    private ds: DataSource,
    private contactsService: ContactsService
  ) {}

  private async evaluateDynamicCriteria(criteria: MailingListCriteria | null): Promise<string[]> {
    if (!criteria) return [];

    /* Original: Dynamic SELECT id FROM contacts WHERE deleted_at IS NULL AND status = 'active' ... */
    const qb = this.ds
      .getRepository(ContactEntity)
      .createQueryBuilder("c")
      .select("c.id")
      .where("c.deletedAt IS NULL")
      .andWhere("c.status = :status", { status: criteria.active === false ? "inactive" : "active" });

    if (criteria.okToMail === true) {
      qb.andWhere("(c.okToMail = 'yes' OR c.okToMail = 'unknown') AND c.doNotContact = 0");
    }
    if (criteria.okToEmail === true) {
      qb.andWhere("(c.okToEmail = 'yes' OR c.okToEmail = 'unknown') AND c.doNotContact = 0");
    }
    if (criteria.hasPostalAddress === true) {
      qb.andWhere("EXISTS (SELECT 1 FROM contact_addresses ca WHERE ca.contact_id = c.id AND ca.address_line1 IS NOT NULL AND ca.address_line1 != '')");
    }
    if (criteria.hasEmail === true) {
      qb.andWhere("EXISTS (SELECT 1 FROM contact_emails ce WHERE ce.contact_id = c.id)");
    }
    if (criteria.organization) {
      qb.andWhere("c.organizationName LIKE :org", { org: `%${criteria.organization}%` });
    }
    if (criteria.clubName) {
      qb.andWhere("c.clubName LIKE :club", { club: `%${criteria.clubName}%` });
    }
    if (criteria.tagIn && criteria.tagIn.length > 0) {
      qb.andWhere("c.id IN (SELECT contact_id FROM contact_tags WHERE tag_id IN (SELECT id FROM tags WHERE name IN (:...tagIn)))", { tagIn: criteria.tagIn });
    }
    if (criteria.tagNotIn && criteria.tagNotIn.length > 0) {
      qb.andWhere("c.id NOT IN (SELECT contact_id FROM contact_tags WHERE tag_id IN (SELECT id FROM tags WHERE name IN (:...tagNotIn)))", { tagNotIn: criteria.tagNotIn });
    }

    const rows = await qb.getMany();
    return rows.map((r) => r.id);
  }

  async list(): Promise<MailingList[]> {
    /* Original: SELECT ml.*, e.name as event_name, (SELECT COUNT(*) FROM mailing_list_members ...) as manual_count FROM mailing_lists ml LEFT JOIN events e ... */
    const rows = await this.ds
      .getRepository(MailingListEntity)
      .createQueryBuilder("ml")
      .leftJoin("events", "e", "e.id = ml.event_id")
      .addSelect("e.name", "event_name")
      .addSelect(
        "(SELECT COUNT(*) FROM mailing_list_members mlm WHERE mlm.list_id = ml.id AND mlm.suppressed = 0 AND mlm.unsubscribed = 0)",
        "manual_count"
      )
      .orderBy("ml.name")
      .getRawMany();

    return rows.map((r) => ({
      id: r.ml_id,
      name: r.ml_name,
      description: r.ml_description ?? null,
      list_type: (r.ml_list_type as MailingList["list_type"]) ?? "static",
      event_id: r.ml_event_id ?? null,
      template: r.ml_template ?? null,
      criteria: r.ml_criteria ? (JSON.parse(r.ml_criteria) as MailingListCriteria) : null,
      created_at: r.ml_created_at ?? undefined,
      updated_at: r.ml_updated_at ?? undefined,
      event: r.ml_event_id ? { id: r.ml_event_id, name: r.event_name } : undefined,
      member_count: Number(r.manual_count ?? 0),
    }));
  }

  async get(id: string): Promise<MailingList | null> {
    /* Original: SELECT ml.*, e.name as event_name FROM mailing_lists ml LEFT JOIN events e ON e.id = ml.event_id WHERE ml.id = ? */
    const row = await this.ds
      .getRepository(MailingListEntity)
      .createQueryBuilder("ml")
      .leftJoin("events", "e", "e.id = ml.event_id")
      .addSelect(["ml.id", "ml.name", "ml.description", "ml.listType", "ml.eventId", "ml.template", "ml.criteria", "ml.createdAt", "ml.updatedAt"])
      .addSelect("e.name", "event_name")
      .where("ml.id = :id", { id })
      .getRawOne();
    if (!row) return null;

    /* Original: SELECT COUNT(*) as c FROM mailing_list_members WHERE list_id = ? AND suppressed = 0 AND unsubscribed = 0 */
    const memberCount = await this.ds.getRepository(MailingListMemberEntity).count({
      where: { listId: id, suppressed: 0, unsubscribed: 0 },
    });
    return {
      id: row.ml_id,
      name: row.ml_name,
      description: row.ml_description ?? null,
      list_type: (row.ml_list_type as MailingList["list_type"]) ?? "static",
      event_id: row.ml_event_id ?? null,
      template: row.ml_template ?? null,
      criteria: row.ml_criteria ? (JSON.parse(row.ml_criteria) as MailingListCriteria) : null,
      created_at: row.ml_created_at ?? undefined,
      updated_at: row.ml_updated_at ?? undefined,
      event: row.ml_event_id ? { id: row.ml_event_id, name: row.event_name } : undefined,
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
    /* Original: SELECT * FROM mailing_lists WHERE id = ? */
    const existing = await this.ds.getRepository(MailingListEntity).findOne({ where: { id } });
    if (!existing) return null;

    const name = body.name ?? existing.name;
    const description = body.description !== undefined ? body.description : existing.description;
    const list_type = (body.list_type ?? existing.listType) as MailingList["list_type"];
    const event_id = body.event_id !== undefined ? body.event_id : existing.eventId;
    const template = body.template !== undefined ? body.template : existing.template;
    const criteria = body.criteria !== undefined ? body.criteria : (existing.criteria ? JSON.parse(existing.criteria) : null);

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
      /* Original: SELECT contact_id FROM mailing_list_members WHERE list_id = ? AND suppressed = 0 AND unsubscribed = 0 */
      const rows = await this.ds.getRepository(MailingListMemberEntity).find({
        where: { listId: id, suppressed: 0, unsubscribed: 0 },
        select: ["contactId"],
      });
      contactIds = rows.map((r) => r.contactId);
    } else if (list.list_type === "dynamic") {
      contactIds = await this.evaluateDynamicCriteria(list.criteria);
    } else {
      /* Original: SELECT contact_id FROM mailing_list_members WHERE list_id = ? AND suppressed = 0 AND unsubscribed = 0 */
      const manualRows = await this.ds.getRepository(MailingListMemberEntity).find({
        where: { listId: id, suppressed: 0, unsubscribed: 0 },
        select: ["contactId"],
      });
      const manualIds = new Set(manualRows.map((r) => r.contactId));
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

      /* Original: SELECT suppressed, suppress_reason, unsubscribed FROM mailing_list_members WHERE list_id = ? AND contact_id = ? */
      const memberRow = await this.ds.getRepository(MailingListMemberEntity).findOne({
        where: { listId: id, contactId: cid },
        select: ["suppressed", "suppressReason", "unsubscribed"],
      });

      if (memberRow?.suppressed) {
        excluded.push({ contact, reason: memberRow.suppressReason ?? "Suppressed" });
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
    /* Original: SELECT * FROM mailing_list_members WHERE list_id = ? ORDER BY added_at DESC */
    const rows = await this.ds.getRepository(MailingListMemberEntity).find({
      where: { listId },
      order: { addedAt: "DESC" },
    });

    const result: MailingListMember[] = [];
    for (const r of rows) {
      const contact = await this.contactsService.get(r.contactId);
      if (contact) {
        result.push({
          id: r.id,
          list_id: r.listId,
          contact_id: r.contactId,
          added_by: r.addedBy ?? null,
          added_at: r.addedAt ?? "",
          source: (r.source as MailingListMember["source"]) ?? "manual",
          suppressed: r.suppressed === 1,
          suppress_reason: r.suppressReason ?? null,
          unsubscribed: r.unsubscribed === 1,
          contact,
        });
      }
    }
    return result;
  }
}
