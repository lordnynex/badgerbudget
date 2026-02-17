import { Elysia } from "elysia";
import type { Contact } from "@/shared/types/contact";
import { BaseController } from "./BaseController";
import { ContactsDto } from "../dto/contacts.dto";
import { previewPstImport } from "../lib/pstImport";

export class ContactsController extends BaseController {
  init() {
    return new Elysia({ prefix: "/contacts" })
      .get("/", ({ query }) => this.list(query), { query: ContactsDto.listQuery })
      .post("/", ({ body }) => this.create(body), { body: ContactsDto.createBody })
      .post("/import-pst", ({ body }) => this.importPst(body.file), { body: ContactsDto.importPstBody })
      .post("/import-pst-execute", ({ body }) => this.importPstExecute(body), {
        body: ContactsDto.importPstExecuteBody,
      })
      .post("/bulk-update", ({ body }) => this.bulkUpdate(body), { body: ContactsDto.bulkUpdateBody })
      .post("/merge", ({ body }) => this.merge(body), { body: ContactsDto.mergeBody })
      .get("/tags", () => this.tagsList())
      .post("/tags", ({ body }) => this.tagsCreate(body), { body: ContactsDto.tagCreateBody })
      .get("/:id", ({ params }) => this.get(params.id), { params: ContactsDto.params })
      .put("/:id", ({ params, body }) => this.update(params.id, body), {
        params: ContactsDto.params,
        body: ContactsDto.updateBody,
      })
      .delete("/:id", ({ params }) => this.delete(params.id), { params: ContactsDto.params })
      .post("/:id/restore", ({ params }) => this.restore(params.id), { params: ContactsDto.params });
  }

  private list(query: Record<string, string | undefined>) {
    return this.api.contacts
      .list({
        q: query.q,
        status: query.status as "active" | "inactive" | "deleted" | "all",
        hasPostalAddress: query.hasPostalAddress === "true" ? true : undefined,
        hasEmail: query.hasEmail === "true" ? true : undefined,
        tagIds: query.tagIds?.split(",").filter(Boolean),
        organization: query.organization,
        role: query.role,
        sort: query.sort as "updated_at" | "name" | "last_contacted",
        sortDir: query.sortDir as "asc" | "desc",
        page: query.page ? parseInt(query.page, 10) : undefined,
        limit: query.limit ? parseInt(query.limit, 10) : undefined,
      })
      .then(this.json);
  }

  private create(body: Record<string, unknown> & { display_name: string }) {
    return this.api.contacts.create(body as Partial<Contact> & { display_name: string }).then(this.json);
  }

  private async importPst(file: File) {
    try {
      if (!file || !(file instanceof File)) {
        return this.json({ error: "No file provided" }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const preview = await previewPstImport(buffer, () => this.api.contacts.getForDeduplication());
      return this.json({ contacts: preview });
    } catch (err) {
      return this.json(
        { error: err instanceof Error ? err.message : "PST import failed" },
        { status: 500 }
      );
    }
  }

  private async importPstExecute(body: { toCreate: Array<Record<string, unknown> & { display_name: string }> }) {
    const toCreate = body.toCreate ?? [];
    const created: string[] = [];
    for (const payload of toCreate) {
      const c = await this.api.contacts.create(payload as Partial<Contact> & { display_name: string });
      if (c) created.push(c.id);
    }
    return this.json({ created, count: created.length });
  }

  private async bulkUpdate(body: { ids: string[]; tags?: (string | { id: string; name: string })[]; status?: string }) {
    await this.api.contacts.bulkUpdate(body.ids, {
      tags: body.tags,
      status: body.status as "active" | "inactive",
    });
    return this.json({ ok: true });
  }

  private merge(body: {
    sourceId: string;
    targetId: string;
    conflictResolution?: Record<string, "source" | "target">;
  }) {
    return this.api.contacts
      .merge(body.sourceId, body.targetId, body.conflictResolution)
      .then((m) => (m ? this.json(m) : this.notFound()));
  }

  private tagsList() {
    return this.api.contacts.tags.list().then(this.json);
  }

  private tagsCreate(body: { name: string }) {
    return this.api.contacts.tags.create(body.name).then(this.json);
  }

  private get(id: string) {
    return this.api.contacts.get(id).then((c) => (c ? this.json(c) : this.notFound()));
  }

  private update(id: string, body: Record<string, unknown>) {
    return this.api.contacts.update(id, body as Partial<Contact>).then((c) => (c ? this.json(c) : this.notFound()));
  }

  private delete(id: string) {
    return this.api.contacts.delete(id).then(() => this.json({ ok: true }));
  }

  private restore(id: string) {
    return this.api.contacts.restore(id).then((c) => (c ? this.json(c) : this.notFound()));
  }
}
