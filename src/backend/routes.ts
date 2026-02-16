import { Elysia } from "elysia";
import type { Api } from "./services/api";
import { createEventsController } from "./controllers/events";
import { createBudgetsController } from "./controllers/budgets";
import { createMembersController } from "./controllers/members";
import { createScenariosController } from "./controllers/scenarios";
import { createContactsController } from "./controllers/contacts";
import { createMailingListsController } from "./controllers/mailingLists";
import { createMailingBatchesController } from "./controllers/mailingBatches";

export function createApiRoutes(api: Api) {
  const eventsController = createEventsController(api);
  const budgetsController = createBudgetsController(api);
  const membersController = createMembersController(api);
  const scenariosController = createScenariosController(api);
  const contactsController = createContactsController(api);
  const mailingListsController = createMailingListsController(api);
  const mailingBatchesController = createMailingBatchesController(api);

  return new Elysia({ prefix: "/api" })
    .get("/events", () => eventsController.list())
    .post("/events", ({ body }) => eventsController.create(body as Parameters<Api["events"]["create"]>[0]))
    .get("/events/:id", ({ params: { id } }) => eventsController.get(id as string))
    .put("/events/:id", ({ params: { id }, body }) => eventsController.update(id as string, body as Record<string, unknown>))
    .delete("/events/:id", ({ params: { id } }) => eventsController.delete(id as string))
    .post("/events/:id/milestones", ({ params: { id }, body }) =>
      eventsController.milestones.create(id as string, body as Parameters<Api["events"]["milestones"]["create"]>[1]))
    .put("/events/:id/milestones/:mid", ({ params: { id, mid }, body }) =>
      eventsController.milestones.update(id as string, mid as string, body as Record<string, unknown>))
    .delete("/events/:id/milestones/:mid", ({ params: { id, mid } }) =>
      eventsController.milestones.delete(id as string, mid as string))
    .post("/events/:id/milestones/:mid/members", ({ params: { id, mid }, body }) =>
      eventsController.milestones.addMember(id as string, mid as string, (body as { member_id: string }).member_id))
    .delete("/events/:id/milestones/:mid/members/:memberId", ({ params: { id, mid, memberId } }) =>
      eventsController.milestones.removeMember(id as string, mid as string, memberId as string))
    .post("/events/:id/packing-categories", ({ params: { id }, body }) =>
      eventsController.packingCategories.create(id as string, body as { name: string }))
    .put("/events/:id/packing-categories/:cid", ({ params: { id, cid }, body }) =>
      eventsController.packingCategories.update(id as string, cid as string, body as { name?: string }))
    .delete("/events/:id/packing-categories/:cid", ({ params: { id, cid } }) =>
      eventsController.packingCategories.delete(id as string, cid as string))
    .post("/events/:id/packing-items", ({ params: { id }, body }) =>
      eventsController.packingItems.create(id as string, body as Parameters<Api["events"]["packingItems"]["create"]>[1]))
    .put("/events/:id/packing-items/:pid", ({ params: { id, pid }, body }) =>
      eventsController.packingItems.update(id as string, pid as string, body as Record<string, unknown>))
    .delete("/events/:id/packing-items/:pid", ({ params: { id, pid } }) =>
      eventsController.packingItems.delete(id as string, pid as string))
    .post("/events/:id/assignments", ({ params: { id }, body }) =>
      eventsController.assignments.create(id as string, body as Parameters<Api["events"]["assignments"]["create"]>[1]))
    .put("/events/:id/assignments/:aid", ({ params: { id, aid }, body }) =>
      eventsController.assignments.update(id as string, aid as string, body as Record<string, unknown>))
    .delete("/events/:id/assignments/:aid", ({ params: { id, aid } }) =>
      eventsController.assignments.delete(id as string, aid as string))
    .post("/events/:id/assignments/:aid/members", ({ params: { id, aid }, body }) =>
      eventsController.assignments.addMember(id as string, aid as string, (body as { member_id: string }).member_id))
    .delete("/events/:id/assignments/:aid/members/:memberId", ({ params: { id, aid, memberId } }) =>
      eventsController.assignments.removeMember(id as string, aid as string, memberId as string))
    .post("/events/:id/volunteers", ({ params: { id }, body }) =>
      eventsController.volunteers.create(id as string, body as Parameters<Api["events"]["volunteers"]["create"]>[1]))
    .put("/events/:id/volunteers/:vid", ({ params: { id, vid }, body }) =>
      eventsController.volunteers.update(id as string, vid as string, body as Record<string, unknown>))
    .delete("/events/:id/volunteers/:vid", ({ params: { id, vid } }) =>
      eventsController.volunteers.delete(id as string, vid as string))

    .get("/budgets", () => budgetsController.list())
    .post("/budgets", ({ body }) => budgetsController.create(body as Parameters<Api["budgets"]["create"]>[0]))
    .get("/budgets/:id", ({ params: { id } }) => budgetsController.get(id as string))
    .put("/budgets/:id", ({ params: { id }, body }) => budgetsController.update(id as string, body as Record<string, unknown>))
    .delete("/budgets/:id", ({ params: { id } }) => budgetsController.delete(id as string))
    .post("/budgets/:id/line-items", ({ params: { id }, body }) =>
      budgetsController.addLineItem(id as string, body as Parameters<Api["budgets"]["addLineItem"]>[1]))
    .put("/budgets/:id/line-items/:itemId", ({ params: { id, itemId }, body }) =>
      budgetsController.updateLineItem(id as string, itemId as string, body as Record<string, unknown>))
    .delete("/budgets/:id/line-items/:itemId", ({ params: { id, itemId } }) =>
      budgetsController.deleteLineItem(id as string, itemId as string))

    .get("/members", () => membersController.list())
    .post("/members", ({ body }) => membersController.create(body as Parameters<Api["members"]["create"]>[0]))
    .get("/members/:id", ({ params: { id } }) => membersController.get(id as string))
    .put("/members/:id", ({ params: { id }, body }) => membersController.update(id as string, body as Record<string, unknown>))
    .delete("/members/:id", ({ params: { id } }) => membersController.delete(id as string))

    .get("/scenarios", () => scenariosController.list())
    .post("/scenarios", ({ body }) => scenariosController.create(body as Parameters<Api["scenarios"]["create"]>[0]))
    .get("/scenarios/:id", ({ params: { id } }) => scenariosController.get(id as string))
    .put("/scenarios/:id", ({ params: { id }, body }) => scenariosController.update(id as string, body as Record<string, unknown>))
    .delete("/scenarios/:id", ({ params: { id } }) => scenariosController.delete(id as string))

    .get("/contacts", ({ query }) => contactsController.list(query))
    .post("/contacts", ({ body }) => contactsController.create(body as Parameters<Api["contacts"]["create"]>[0]))
    .post("/contacts/import-pst", async ({ body }) => contactsController.importPst(body.file), {
      body: contactsController.importPstSchema.body,
    })
    .post("/contacts/import-pst-execute", ({ body }) =>
      contactsController.importPstExecute(body as { toCreate: Array<Partial<import("@/shared/types/contact").Contact> & { display_name: string }> }))
    .post("/contacts/bulk-update", ({ body }) =>
      contactsController.bulkUpdate(body as { ids: string[]; tags?: (string | import("@/shared/types/contact").Tag)[]; status?: string }))
    .post("/contacts/merge", ({ body }) =>
      contactsController.merge(body as { sourceId: string; targetId: string; conflictResolution?: Record<string, "source" | "target"> }))
    .get("/contacts/tags", () => contactsController.tags.list())
    .post("/contacts/tags", ({ body }) => contactsController.tags.create(body as { name: string }))
    .get("/contacts/:id", ({ params: { id } }) => contactsController.get(id as string))
    .put("/contacts/:id", ({ params: { id }, body }) =>
      contactsController.update(id as string, body as Parameters<Api["contacts"]["update"]>[1]))
    .delete("/contacts/:id", ({ params: { id } }) => contactsController.delete(id as string))
    .post("/contacts/:id/restore", ({ params: { id } }) => contactsController.restore(id as string))

    .get("/mailing-lists", () => mailingListsController.list())
    .post("/mailing-lists", ({ body }) =>
      mailingListsController.create(body as Parameters<Api["mailingLists"]["create"]>[0]))
    .get("/mailing-lists/:id/preview", ({ params: { id } }) => mailingListsController.preview(id as string))
    .get("/mailing-lists/:id/members", ({ params: { id } }) => mailingListsController.getMembers(id as string))
    .post("/mailing-lists/:id/members", ({ params: { id }, body }) =>
      mailingListsController.addMember(id as string, body as { contact_id?: string; contact_ids?: string[]; source?: string }))
    .delete("/mailing-lists/:id/members/:contactId", ({ params: { id, contactId } }) =>
      mailingListsController.removeMember(id as string, contactId as string))
    .get("/mailing-lists/:id", ({ params: { id } }) => mailingListsController.get(id as string))
    .put("/mailing-lists/:id", ({ params: { id }, body }) =>
      mailingListsController.update(id as string, body as Record<string, unknown>))
    .delete("/mailing-lists/:id", ({ params: { id } }) => mailingListsController.delete(id as string))

    .get("/mailing-batches", () => mailingBatchesController.list())
    .post("/mailing-batches", ({ body }) =>
      mailingBatchesController.create(body as { list_id: string; name: string }))
    .get("/mailing-batches/:id", ({ params: { id } }) => mailingBatchesController.get(id as string))
    .put("/mailing-batches/:id/recipients/:recipientId", ({ params: { id, recipientId }, body }) =>
      mailingBatchesController.updateRecipientStatus(
        id as string,
        recipientId as string,
        (body as { status: string }).status as "queued" | "printed" | "mailed" | "returned" | "invalid",
        (body as { reason?: string }).reason
      ));
}
