import { Elysia } from "elysia";
import { eventsController } from "./controllers/events";
import { budgetsController } from "./controllers/budgets";
import { membersController } from "./controllers/members";
import { scenariosController } from "./controllers/scenarios";
import { contactsController } from "./controllers/contacts";
import { mailingListsController } from "./controllers/mailingLists";
import { mailingBatchesController } from "./controllers/mailingBatches";
import { seedController } from "./controllers/seed";

export const apiRoutes = new Elysia({ prefix: "/api" })
  .post("/seed", () => seedController.run())

  .get("/events", () => eventsController.list())
  .post("/events", ({ body }) => eventsController.create(body))
  .get("/events/:id", ({ params: { id } }) => eventsController.get(id))
  .put("/events/:id", ({ params: { id }, body }) => eventsController.update(id, body))
  .delete("/events/:id", ({ params: { id } }) => eventsController.delete(id))
  .post("/events/:id/milestones", ({ params: { id }, body }) => eventsController.milestones.create(id, body))
  .put("/events/:id/milestones/:mid", ({ params: { id, mid }, body }) => eventsController.milestones.update(id, mid, body))
  .delete("/events/:id/milestones/:mid", ({ params: { id, mid } }) => eventsController.milestones.delete(id, mid))
  .post("/events/:id/milestones/:mid/members", ({ params: { id, mid }, body }) =>
    eventsController.milestones.addMember(id, mid, body.member_id))
  .delete("/events/:id/milestones/:mid/members/:memberId", ({ params: { id, mid, memberId } }) =>
    eventsController.milestones.removeMember(id, mid, memberId))
  .post("/events/:id/packing-categories", ({ params: { id }, body }) => eventsController.packingCategories.create(id, body))
  .put("/events/:id/packing-categories/:cid", ({ params: { id, cid }, body }) =>
    eventsController.packingCategories.update(id, cid, body))
  .delete("/events/:id/packing-categories/:cid", ({ params: { id, cid } }) =>
    eventsController.packingCategories.delete(id, cid))
  .post("/events/:id/packing-items", ({ params: { id }, body }) => eventsController.packingItems.create(id, body))
  .put("/events/:id/packing-items/:pid", ({ params: { id, pid }, body }) =>
    eventsController.packingItems.update(id, pid, body))
  .delete("/events/:id/packing-items/:pid", ({ params: { id, pid } }) =>
    eventsController.packingItems.delete(id, pid))
  .post("/events/:id/assignments", ({ params: { id }, body }) => eventsController.assignments.create(id, body))
  .put("/events/:id/assignments/:aid", ({ params: { id, aid }, body }) =>
    eventsController.assignments.update(id, aid, body))
  .delete("/events/:id/assignments/:aid", ({ params: { id, aid } }) =>
    eventsController.assignments.delete(id, aid))
  .post("/events/:id/assignments/:aid/members", ({ params: { id, aid }, body }) =>
    eventsController.assignments.addMember(id, aid, body.member_id))
  .delete("/events/:id/assignments/:aid/members/:memberId", ({ params: { id, aid, memberId } }) =>
    eventsController.assignments.removeMember(id, aid, memberId))
  .post("/events/:id/volunteers", ({ params: { id }, body }) => eventsController.volunteers.create(id, body))
  .put("/events/:id/volunteers/:vid", ({ params: { id, vid }, body }) =>
    eventsController.volunteers.update(id, vid, body))
  .delete("/events/:id/volunteers/:vid", ({ params: { id, vid } }) =>
    eventsController.volunteers.delete(id, vid))

  .get("/budgets", () => budgetsController.list())
  .post("/budgets", ({ body }) => budgetsController.create(body))
  .get("/budgets/:id", ({ params: { id } }) => budgetsController.get(id))
  .put("/budgets/:id", ({ params: { id }, body }) => budgetsController.update(id, body))
  .delete("/budgets/:id", ({ params: { id } }) => budgetsController.delete(id))
  .post("/budgets/:id/line-items", ({ params: { id }, body }) => budgetsController.addLineItem(id, body))
  .put("/budgets/:id/line-items/:itemId", ({ params: { id, itemId }, body }) =>
    budgetsController.updateLineItem(id, itemId, body))
  .delete("/budgets/:id/line-items/:itemId", ({ params: { id, itemId } }) =>
    budgetsController.deleteLineItem(id, itemId))

  .get("/members", () => membersController.list())
  .post("/members", ({ body }) => membersController.create(body))
  .get("/members/:id", ({ params: { id } }) => membersController.get(id))
  .put("/members/:id", ({ params: { id }, body }) => membersController.update(id, body))
  .delete("/members/:id", ({ params: { id } }) => membersController.delete(id))

  .get("/scenarios", () => scenariosController.list())
  .post("/scenarios", ({ body }) => scenariosController.create(body))
  .get("/scenarios/:id", ({ params: { id } }) => scenariosController.get(id))
  .put("/scenarios/:id", ({ params: { id }, body }) => scenariosController.update(id, body))
  .delete("/scenarios/:id", ({ params: { id } }) => scenariosController.delete(id))

  .get("/contacts", ({ query }) => contactsController.list(query))
  .post("/contacts", ({ body }) => contactsController.create(body as Parameters<typeof contactsController.create>[0]))
  .post("/contacts/import-pst", async ({ body }) => contactsController.importPst(body.file), {
    body: contactsController.importPstSchema.body,
  })
  .post("/contacts/import-pst-execute", ({ body }) =>
    contactsController.importPstExecute(body as { toCreate: Array<Partial<import("@/shared/types/contact").Contact> & { display_name: string }> }))
  .post("/contacts/bulk-update", ({ body }) =>
    contactsController.bulkUpdate(body as { ids: string[]; tags?: unknown[]; status?: string }))
  .post("/contacts/merge", ({ body }) =>
    contactsController.merge(body as { sourceId: string; targetId: string; conflictResolution?: Record<string, "source" | "target"> }))
  .get("/contacts/tags", () => contactsController.tags.list())
  .post("/contacts/tags", ({ body }) => contactsController.tags.create(body as { name: string }))
  .get("/contacts/:id", ({ params: { id } }) => contactsController.get(id))
  .put("/contacts/:id", ({ params: { id }, body }) =>
    contactsController.update(id, body as Parameters<typeof contactsController.update>[1]))
  .delete("/contacts/:id", ({ params: { id } }) => contactsController.delete(id))
  .post("/contacts/:id/restore", ({ params: { id } }) => contactsController.restore(id))

  .get("/mailing-lists", () => mailingListsController.list())
  .post("/mailing-lists", ({ body }) =>
    mailingListsController.create(body as Parameters<typeof mailingListsController.create>[0]))
  .get("/mailing-lists/:id/preview", ({ params: { id } }) => mailingListsController.preview(id))
  .get("/mailing-lists/:id/members", ({ params: { id } }) => mailingListsController.getMembers(id))
  .post("/mailing-lists/:id/members", ({ params: { id }, body }) =>
    mailingListsController.addMember(id, body as { contact_id?: string; contact_ids?: string[]; source?: string }))
  .delete("/mailing-lists/:id/members/:contactId", ({ params: { id, contactId } }) =>
    mailingListsController.removeMember(id, contactId))
  .get("/mailing-lists/:id", ({ params: { id } }) => mailingListsController.get(id))
  .put("/mailing-lists/:id", ({ params: { id }, body }) =>
    mailingListsController.update(id, body as Record<string, unknown>))
  .delete("/mailing-lists/:id", ({ params: { id } }) => mailingListsController.delete(id))

  .get("/mailing-batches", () => mailingBatchesController.list())
  .post("/mailing-batches", ({ body }) =>
    mailingBatchesController.create(body as { list_id: string; name: string }))
  .get("/mailing-batches/:id", ({ params: { id } }) => mailingBatchesController.get(id))
  .put("/mailing-batches/:id/recipients/:recipientId", ({ params: { id, recipientId }, body }) =>
    mailingBatchesController.updateRecipientStatus(
      id,
      recipientId,
      (body as { status: string }).status as "queued" | "printed" | "mailed" | "returned" | "invalid",
      (body as { reason?: string }).reason
    ));
