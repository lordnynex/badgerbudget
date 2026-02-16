import { t } from "elysia";
import type { Api } from "../services/api";
import { previewPstImport } from "../lib/pstImport";
import { json, notFound } from "./helpers";
import type { Contact, Tag } from "@/shared/types/contact";

export function createContactsController(api: Api) {
  return {
    list: (query: Record<string, string | undefined>) =>
      api.contacts
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
        .then(json),

    create: (body: Parameters<Api["contacts"]["create"]>[0]) => api.contacts.create(body).then(json),

    importPst: async (file: File) => {
      try {
        if (!file || !(file instanceof File)) {
          return json({ error: "No file provided" }, { status: 400 });
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        const preview = await previewPstImport(buffer, () => api.contacts.getForDeduplication());
        return json({ contacts: preview });
      } catch (err) {
        return json(
          { error: err instanceof Error ? err.message : "PST import failed" },
          { status: 500 }
        );
      }
    },

    importPstSchema: { body: t.Object({ file: t.File() }) },

    importPstExecute: async (body: { toCreate: Array<Partial<Contact> & { display_name: string }> }) => {
      const toCreate = body.toCreate ?? [];
      const created: string[] = [];
      for (const payload of toCreate) {
        const c = await api.contacts.create(payload as Parameters<Api["contacts"]["create"]>[0]);
        if (c) created.push(c.id);
      }
      return json({ created, count: created.length });
    },

    bulkUpdate: async (body: { ids: string[]; tags?: (string | Tag)[]; status?: string }) => {
      await api.contacts.bulkUpdate(body.ids, {
        tags: body.tags,
        status: body.status as "active" | "inactive",
      });
      return json({ ok: true });
    },

    merge: (body: { sourceId: string; targetId: string; conflictResolution?: Record<string, "source" | "target"> }) =>
      api.contacts
        .merge(body.sourceId, body.targetId, body.conflictResolution)
        .then((m) => (m ? json(m) : notFound())),

    tags: {
      list: () => api.contacts.tags.list().then(json),
      create: (body: { name: string }) => api.contacts.tags.create(body.name).then(json),
    },

    get: (id: string) => api.contacts.get(id).then((c) => (c ? json(c) : notFound())),
    update: (id: string, body: Parameters<Api["contacts"]["update"]>[1]) =>
      api.contacts.update(id, body).then((c) => (c ? json(c) : notFound())),
    delete: (id: string) => api.contacts.delete(id).then(() => json({ ok: true })),
    restore: (id: string) => api.contacts.restore(id).then((c) => (c ? json(c) : notFound())),
  };
}
