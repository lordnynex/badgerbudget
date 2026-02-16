import type { DbLike } from "../db/dbAdapter";
import type { Contact, MailingList, MailingBatch, MailingBatchRecipient } from "@/shared/types/contact";
import type { MailingListsService } from "./MailingListsService";
import { uuid, auditLog } from "./utils";

export class MailingBatchesService {
  constructor(
    private db: DbLike,
    private mailingListsService: MailingListsService
  ) {}

  async create(listId: string, name: string) {
    const preview = await this.mailingListsService.preview(listId);
    const list = await this.mailingListsService.get(listId);
    if (!list) return null;

    const id = uuid();
    const eventId = list.event_id;

    await this.db.run(
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
      await this.db.run(
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

    await auditLog(this.db, "mailing_batch_created", "mailing_batch", id, { list_id: listId, count: preview.totalIncluded });
    return this.get(id)!;
  }

  async get(id: string): Promise<MailingBatch | null> {
    const row = (await this.db
      .query(
        `SELECT mb.*, ml.name as list_name, e.name as event_name FROM mailing_batches mb
         LEFT JOIN mailing_lists ml ON ml.id = mb.list_id LEFT JOIN events e ON e.id = mb.event_id WHERE mb.id = ?`
      )
      .get(id)) as Record<string, unknown> | null;
    if (!row) return null;

    const recipients = (await this.db
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
  }

  async list(): Promise<MailingBatch[]> {
    const rows = (await this.db
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
  }

  async updateRecipientStatus(
    batchId: string,
    recipientId: string,
    status: MailingBatchRecipient["status"],
    reason?: string
  ) {
    if (status === "returned") {
      await this.db.run(
        "UPDATE mailing_batch_recipients SET status = ?, returned_reason = ? WHERE id = ? AND batch_id = ?",
        [status, reason ?? null, recipientId, batchId]
      );
    } else if (status === "invalid") {
      await this.db.run(
        "UPDATE mailing_batch_recipients SET status = ?, invalid_reason = ? WHERE id = ? AND batch_id = ?",
        [status, reason ?? null, recipientId, batchId]
      );
    } else {
      await this.db.run(
        "UPDATE mailing_batch_recipients SET status = ? WHERE id = ? AND batch_id = ?",
        [status, recipientId, batchId]
      );
    }
    await auditLog(this.db, "mailing_batch_recipient_status_updated", "mailing_batch", batchId, {
      recipient_id: recipientId,
      status,
    });
    return { ok: true };
  }
}
