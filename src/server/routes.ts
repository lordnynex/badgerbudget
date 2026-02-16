import { Elysia, t } from "elysia";
import { api } from "./api";
import { previewPstImport } from "./pstImport";
import type { Contact, Tag } from "@/types/contact";

const json = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

const notFound = () =>
  new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });

export const apiRoutes = new Elysia({ prefix: "/api" })
  .post("/seed", () => api.seed().then(json))

  .get("/events", () => api.events.list().then(json))
  .post("/events", ({ body }) => api.events.create(body).then(json))
  .get("/events/:id", ({ params: { id } }) =>
    api.events.get(id).then((e) => (e ? json(e) : notFound()))
  )
  .put("/events/:id", ({ params: { id }, body }) =>
    api.events.update(id, body).then((e) => (e ? json(e) : notFound()))
  )
  .delete("/events/:id", ({ params: { id } }) =>
    api.events.delete(id).then(() => json({ ok: true }))
  )
  .post("/events/:id/milestones", ({ params: { id }, body }) =>
    api.events.milestones.create(id, body).then(json)
  )
  .put("/events/:id/milestones/:mid", ({ params: { id, mid }, body }) =>
    api.events.milestones.update(id, mid, body).then((e) => (e ? json(e) : notFound()))
  )
  .delete("/events/:id/milestones/:mid", ({ params: { id, mid } }) =>
    api.events.milestones.delete(id, mid).then(() => json({ ok: true }))
  )
  .post("/events/:id/milestones/:mid/members", ({ params: { id, mid }, body }) =>
    api.events.milestones.addMember(id, mid, body.member_id).then((e) => (e ? json(e) : notFound()))
  )
  .delete("/events/:id/milestones/:mid/members/:memberId", ({ params: { id, mid, memberId } }) =>
    api.events.milestones.removeMember(id, mid, memberId).then((e) => (e ? json(e) : notFound()))
  )
  .post("/events/:id/packing-categories", ({ params: { id }, body }) =>
    api.events.packingCategories.create(id, body).then(json)
  )
  .put("/events/:id/packing-categories/:cid", ({ params: { id, cid }, body }) =>
    api.events.packingCategories.update(id, cid, body).then((e) => (e ? json(e) : notFound()))
  )
  .delete("/events/:id/packing-categories/:cid", ({ params: { id, cid } }) =>
    api.events.packingCategories.delete(id, cid).then(() => json({ ok: true }))
  )
  .post("/events/:id/packing-items", ({ params: { id }, body }) =>
    api.events.packingItems.create(id, body).then(json)
  )
  .put("/events/:id/packing-items/:pid", ({ params: { id, pid }, body }) =>
    api.events.packingItems.update(id, pid, body).then((e) => (e ? json(e) : notFound()))
  )
  .delete("/events/:id/packing-items/:pid", ({ params: { id, pid } }) =>
    api.events.packingItems.delete(id, pid).then(() => json({ ok: true }))
  )
  .post("/events/:id/assignments", ({ params: { id }, body }) =>
    api.events.assignments.create(id, body).then(json)
  )
  .put("/events/:id/assignments/:aid", ({ params: { id, aid }, body }) =>
    api.events.assignments.update(id, aid, body).then((e) => (e ? json(e) : notFound()))
  )
  .delete("/events/:id/assignments/:aid", ({ params: { id, aid } }) =>
    api.events.assignments.delete(id, aid).then(() => json({ ok: true }))
  )
  .post("/events/:id/assignments/:aid/members", ({ params: { id, aid }, body }) =>
    api.events.assignments.addMember(id, aid, body.member_id).then((e) => (e ? json(e) : notFound()))
  )
  .delete("/events/:id/assignments/:aid/members/:memberId", ({ params: { id, aid, memberId } }) =>
    api.events.assignments.removeMember(id, aid, memberId).then((e) => (e ? json(e) : notFound()))
  )
  .post("/events/:id/volunteers", ({ params: { id }, body }) =>
    api.events.volunteers.create(id, body).then(json)
  )
  .put("/events/:id/volunteers/:vid", ({ params: { id, vid }, body }) =>
    api.events.volunteers.update(id, vid, body).then((e) => (e ? json(e) : notFound()))
  )
  .delete("/events/:id/volunteers/:vid", ({ params: { id, vid } }) =>
    api.events.volunteers.delete(id, vid).then(() => json({ ok: true }))
  )

  .get("/budgets", () => api.budgets.list().then(json))
  .post("/budgets", ({ body }) => api.budgets.create(body).then(json))
  .get("/budgets/:id", ({ params: { id } }) =>
    api.budgets.get(id).then((b) => (b ? json(b) : notFound()))
  )
  .put("/budgets/:id", ({ params: { id }, body }) =>
    api.budgets.update(id, body).then((b) => (b ? json(b) : notFound()))
  )
  .delete("/budgets/:id", ({ params: { id } }) =>
    api.budgets.delete(id).then(() => json({ ok: true }))
  )
  .post("/budgets/:id/line-items", ({ params: { id }, body }) =>
    api.budgets.addLineItem(id, body).then(json)
  )
  .put("/budgets/:id/line-items/:itemId", ({ params: { id, itemId }, body }) =>
    api.budgets.updateLineItem(id, itemId, body).then((b) => (b ? json(b) : notFound()))
  )
  .delete("/budgets/:id/line-items/:itemId", ({ params: { id, itemId } }) =>
    api.budgets.deleteLineItem(id, itemId).then(() => json({ ok: true }))
  )

  .get("/members", () => api.members.list().then(json))
  .post("/members", ({ body }) => api.members.create(body).then(json))
  .get("/members/:id", ({ params: { id } }) =>
    api.members.get(id).then((m) => (m ? json(m) : notFound()))
  )
  .put("/members/:id", ({ params: { id }, body }) =>
    api.members.update(id, body).then((m) => (m ? json(m) : notFound()))
  )
  .delete("/members/:id", ({ params: { id } }) =>
    api.members.delete(id).then(() => json({ ok: true }))
  )

  .get("/scenarios", () => api.scenarios.list().then(json))
  .post("/scenarios", ({ body }) => api.scenarios.create(body).then(json))
  .get("/scenarios/:id", ({ params: { id } }) =>
    api.scenarios.get(id).then((s) => (s ? json(s) : notFound()))
  )
  .put("/scenarios/:id", ({ params: { id }, body }) =>
    api.scenarios.update(id, body).then((s) => (s ? json(s) : notFound()))
  )
  .delete("/scenarios/:id", ({ params: { id } }) =>
    api.scenarios.delete(id).then(() => json({ ok: true }))
  )

  .get(
    "/contacts",
    ({ query }) =>
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
        .then(json)
  )
  .post("/contacts", ({ body }) => api.contacts.create(body as Parameters<typeof api.contacts.create>[0]).then(json))
  .post("/contacts/import-pst", async ({ body }) => {
    try {
      const file = body.file;
      if (!file || !(file instanceof File)) {
        return json({ error: "No file provided" }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const preview = await previewPstImport(buffer);
      return json({ contacts: preview });
    } catch (err) {
      return json(
        { error: err instanceof Error ? err.message : "PST import failed" },
        { status: 500 }
      );
    }
  }, {
    body: t.Object({ file: t.File() }),
  })
  .post("/contacts/import-pst-execute", async ({ body }) => {
    type ImportPstBody = { toCreate: Array<Partial<Contact> & { display_name: string }> };
    const toCreate = (body as ImportPstBody).toCreate ?? [];
    const created: string[] = [];
    for (const payload of toCreate) {
      const c = await api.contacts.create(payload as Parameters<typeof api.contacts.create>[0]);
      if (c) created.push(c.id);
    }
    return json({ created, count: created.length });
  })
  .post("/contacts/bulk-update", async ({ body }) => {
    const b = body as { ids: string[]; tags?: (string | Tag)[]; status?: string };
    await api.contacts.bulkUpdate(b.ids, {
      tags: b.tags,
      status: b.status as "active" | "inactive",
    });
    return json({ ok: true });
  })
  .post("/contacts/merge", ({ body }) =>
    api.contacts
      .merge(
        (body as { sourceId: string; targetId: string; conflictResolution?: Record<string, "source" | "target"> }).sourceId,
        (body as { sourceId: string; targetId: string; conflictResolution?: Record<string, "source" | "target"> }).targetId,
        (body as { sourceId: string; targetId: string; conflictResolution?: Record<string, "source" | "target"> }).conflictResolution
      )
      .then((m) => (m ? json(m) : notFound()))
  )
  .get("/contacts/tags", () => api.contacts.tags.list().then(json))
  .post("/contacts/tags", ({ body }) =>
    api.contacts.tags.create((body as { name: string }).name).then(json)
  )
  .get("/contacts/:id", ({ params: { id } }) =>
    api.contacts.get(id).then((c) => (c ? json(c) : notFound()))
  )
  .put("/contacts/:id", ({ params: { id }, body }) =>
    api.contacts.update(id, body as Parameters<typeof api.contacts.update>[1]).then((c) => (c ? json(c) : notFound()))
  )
  .delete("/contacts/:id", ({ params: { id } }) =>
    api.contacts.delete(id).then(() => json({ ok: true }))
  )
  .post("/contacts/:id/restore", ({ params: { id } }) =>
    api.contacts.restore(id).then((c) => (c ? json(c) : notFound()))
  )

  .get("/mailing-lists", () => api.mailingLists.list().then(json))
  .post("/mailing-lists", ({ body }) =>
    api.mailingLists.create(body as Parameters<typeof api.mailingLists.create>[0]).then(json)
  )
  .get("/mailing-lists/:id/preview", ({ params: { id } }) =>
    api.mailingLists.preview(id).then(json)
  )
  .get("/mailing-lists/:id/members", ({ params: { id } }) =>
    api.mailingLists.getMembers(id).then(json)
  )
  .post("/mailing-lists/:id/members", async ({ params: { id }, body }) => {
    const b = body as { contact_id?: string; contact_ids?: string[]; source?: string };
    if (b.contact_ids?.length) {
      await api.mailingLists.addMembersBulk(id, b.contact_ids, (b.source as "manual" | "import" | "rule") ?? "manual");
      return json({ ok: true });
    }
    if (b.contact_id) {
      const updated = await api.mailingLists.addMember(id, b.contact_id, (b.source as "manual" | "import" | "rule") ?? "manual");
      return updated ? json(updated) : notFound();
    }
    return json({ ok: true });
  })
  .delete("/mailing-lists/:id/members/:contactId", ({ params: { id, contactId } }) =>
    api.mailingLists.removeMember(id, contactId).then(() => json({ ok: true }))
  )
  .get("/mailing-lists/:id", ({ params: { id } }) =>
    api.mailingLists.get(id).then((l) => (l ? json(l) : notFound()))
  )
  .put("/mailing-lists/:id", ({ params: { id }, body }) =>
    api.mailingLists.update(id, body as Parameters<typeof api.mailingLists.update>[1]).then((l) => (l ? json(l) : notFound()))
  )
  .delete("/mailing-lists/:id", ({ params: { id } }) =>
    api.mailingLists.delete(id).then(() => json({ ok: true }))
  )

  .get("/mailing-batches", () => api.mailingBatches.list().then(json))
  .post("/mailing-batches", ({ body }) =>
    api.mailingBatches.create((body as { list_id: string; name: string }).list_id, (body as { list_id: string; name: string }).name).then((b) => (b ? json(b) : notFound()))
  )
  .get("/mailing-batches/:id", ({ params: { id } }) =>
    api.mailingBatches.get(id).then((b) => (b ? json(b) : notFound()))
  )
  .put("/mailing-batches/:id/recipients/:recipientId", ({ params: { id, recipientId }, body }) =>
    api.mailingBatches
      .updateRecipientStatus(
        id,
        recipientId,
        (body as { status: string; reason?: string }).status as "queued" | "printed" | "mailed" | "returned" | "invalid",
        (body as { status: string; reason?: string }).reason
      )
      .then(() => json({ ok: true }))
  );
