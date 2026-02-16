import { api, corsHeaders } from "./api";
import { previewPstImport } from "./pstImport";
import type { Contact, Tag } from "@/types/contact";

async function jsonBody<T>(req: Request): Promise<T> {
  return (await req.json()) as T;
}

export async function handleApiRequest(req: Request): Promise<Response | null> {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  const json = (data: unknown, init?: ResponseInit) =>
    new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json", ...corsHeaders() },
      ...init,
    });

  const notFound = () =>
    new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });

  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  // /api/seed
  if (path === "/api/seed" && method === "POST") {
    const result = await api.seed();
    return json(result);
  }

  // /api/events
  if (path === "/api/events" && method === "GET") {
    const list = await api.events.list();
    return json(list);
  }
  if (path === "/api/events" && method === "POST") {
    const body = await jsonBody<{
      name: string;
      description?: string;
      year?: number;
      event_date?: string;
      event_url?: string;
      event_location?: string;
      ga_ticket_cost?: number;
      day_pass_cost?: number;
      ga_tickets_sold?: number;
      day_passes_sold?: number;
      budget_id?: string;
      scenario_id?: string;
      planning_notes?: string;
    }>(req);
    const created = await api.events.create(body);
    return json(created);
  }

  // /api/events/:id
  const eventIdMatch = path.match(/^\/api\/events\/([^/]+)$/);
  if (eventIdMatch) {
    const id = eventIdMatch[1]!;
    if (method === "GET") {
      const event = await api.events.get(id);
      if (!event) return notFound();
      return json(event);
    }
    if (method === "PUT") {
      const body = await jsonBody<Record<string, unknown>>(req);
      const updated = await api.events.update(id, body);
      if (!updated) return notFound();
      return json(updated);
    }
    if (method === "DELETE") {
      await api.events.delete(id);
      return json({ ok: true });
    }
  }

  // /api/events/:id/milestones
  const eventMilestonesMatch = path.match(/^\/api\/events\/([^/]+)\/milestones$/);
  if (eventMilestonesMatch && method === "POST") {
    const eventId = eventMilestonesMatch[1]!;
    const body = await jsonBody<{ month: number; year: number; description: string; due_date?: string }>(req);
    const created = await api.events.milestones.create(eventId, body);
    return json(created);
  }

  // /api/events/:id/milestones/:mid
  const eventMilestoneMatch = path.match(/^\/api\/events\/([^/]+)\/milestones\/([^/]+)$/);
  if (eventMilestoneMatch) {
    const eventId = eventMilestoneMatch[1]!;
    const mid = eventMilestoneMatch[2]!;
    if (method === "PUT") {
      const body = await jsonBody<{ month?: number; year?: number; description?: string; completed?: boolean; due_date?: string }>(req);
      const updated = await api.events.milestones.update(eventId, mid, body);
      if (!updated) return notFound();
      return json(updated);
    }
    if (method === "DELETE") {
      await api.events.milestones.delete(eventId, mid);
      return json({ ok: true });
    }
  }

  // /api/events/:id/milestones/:mid/members
  const eventMilestoneMembersMatch = path.match(/^\/api\/events\/([^/]+)\/milestones\/([^/]+)\/members$/);
  if (eventMilestoneMembersMatch && method === "POST") {
    const eventId = eventMilestoneMembersMatch[1]!;
    const mid = eventMilestoneMembersMatch[2]!;
    const body = await jsonBody<{ member_id: string }>(req);
    const updated = await api.events.milestones.addMember(eventId, mid, body.member_id);
    if (!updated) return notFound();
    return json(updated);
  }

  // /api/events/:id/milestones/:mid/members/:memberId
  const eventMilestoneMemberMatch = path.match(/^\/api\/events\/([^/]+)\/milestones\/([^/]+)\/members\/([^/]+)$/);
  if (eventMilestoneMemberMatch && method === "DELETE") {
    const eventId = eventMilestoneMemberMatch[1]!;
    const mid = eventMilestoneMemberMatch[2]!;
    const memberId = eventMilestoneMemberMatch[3]!;
    const updated = await api.events.milestones.removeMember(eventId, mid, memberId);
    if (!updated) return notFound();
    return json(updated);
  }

  // /api/events/:id/packing-categories
  const eventPackingCategoriesMatch = path.match(/^\/api\/events\/([^/]+)\/packing-categories$/);
  if (eventPackingCategoriesMatch && method === "POST") {
    const eventId = eventPackingCategoriesMatch[1]!;
    const body = await jsonBody<{ name: string }>(req);
    const created = await api.events.packingCategories.create(eventId, body);
    return json(created);
  }

  // /api/events/:id/packing-categories/:cid
  const eventPackingCategoryMatch = path.match(/^\/api\/events\/([^/]+)\/packing-categories\/([^/]+)$/);
  if (eventPackingCategoryMatch) {
    const eventId = eventPackingCategoryMatch[1]!;
    const cid = eventPackingCategoryMatch[2]!;
    if (method === "PUT") {
      const body = await jsonBody<{ name?: string }>(req);
      const updated = await api.events.packingCategories.update(eventId, cid, body);
      if (!updated) return notFound();
      return json(updated);
    }
    if (method === "DELETE") {
      await api.events.packingCategories.delete(eventId, cid);
      return json({ ok: true });
    }
  }

  // /api/events/:id/packing-items
  const eventPackingMatch = path.match(/^\/api\/events\/([^/]+)\/packing-items$/);
  if (eventPackingMatch && method === "POST") {
    const eventId = eventPackingMatch[1]!;
    const body = await jsonBody<{ category_id: string; name: string; quantity?: number; note?: string }>(req);
    const created = await api.events.packingItems.create(eventId, body);
    return json(created);
  }

  // /api/events/:id/packing-items/:pid
  const eventPackingItemMatch = path.match(/^\/api\/events\/([^/]+)\/packing-items\/([^/]+)$/);
  if (eventPackingItemMatch) {
    const eventId = eventPackingItemMatch[1]!;
    const pid = eventPackingItemMatch[2]!;
    if (method === "PUT") {
      const body = await jsonBody<{ category_id?: string; name?: string; quantity?: number; note?: string; loaded?: boolean }>(req);
      const updated = await api.events.packingItems.update(eventId, pid, body);
      if (!updated) return notFound();
      return json(updated);
    }
    if (method === "DELETE") {
      await api.events.packingItems.delete(eventId, pid);
      return json({ ok: true });
    }
  }

  // /api/events/:id/assignments
  const eventAssignmentsMatch = path.match(/^\/api\/events\/([^/]+)\/assignments$/);
  if (eventAssignmentsMatch && method === "POST") {
    const eventId = eventAssignmentsMatch[1]!;
    const body = await jsonBody<{ name: string; category: "planning" | "during" }>(req);
    const assignment = await api.events.assignments.create(eventId, body);
    return json(assignment);
  }

  // /api/events/:id/assignments/:aid
  const eventAssignmentMatch = path.match(/^\/api\/events\/([^/]+)\/assignments\/([^/]+)$/);
  if (eventAssignmentMatch) {
    const eventId = eventAssignmentMatch[1]!;
    const aid = eventAssignmentMatch[2]!;
    if (method === "PUT") {
      const body = await jsonBody<{ name?: string; category?: "planning" | "during" }>(req);
      const updated = await api.events.assignments.update(eventId, aid, body);
      if (!updated) return notFound();
      return json(updated);
    }
    if (method === "DELETE") {
      await api.events.assignments.delete(eventId, aid);
      return json({ ok: true });
    }
  }

  // /api/events/:id/assignments/:aid/members
  const eventAssignmentMembersMatch = path.match(/^\/api\/events\/([^/]+)\/assignments\/([^/]+)\/members$/);
  if (eventAssignmentMembersMatch && method === "POST") {
    const eventId = eventAssignmentMembersMatch[1]!;
    const aid = eventAssignmentMembersMatch[2]!;
    const body = await jsonBody<{ member_id: string }>(req);
    const updated = await api.events.assignments.addMember(eventId, aid, body.member_id);
    if (!updated) return notFound();
    return json(updated);
  }

  // /api/events/:id/assignments/:aid/members/:memberId
  const eventAssignmentMemberMatch = path.match(/^\/api\/events\/([^/]+)\/assignments\/([^/]+)\/members\/([^/]+)$/);
  if (eventAssignmentMemberMatch && method === "DELETE") {
    const eventId = eventAssignmentMemberMatch[1]!;
    const aid = eventAssignmentMemberMatch[2]!;
    const memberId = eventAssignmentMemberMatch[3]!;
    const updated = await api.events.assignments.removeMember(eventId, aid, memberId);
    if (!updated) return notFound();
    return json(updated);
  }

  // /api/events/:id/volunteers
  const eventVolunteersMatch = path.match(/^\/api\/events\/([^/]+)\/volunteers$/);
  if (eventVolunteersMatch && method === "POST") {
    const eventId = eventVolunteersMatch[1]!;
    const body = await jsonBody<{ name: string; department: string }>(req);
    const created = await api.events.volunteers.create(eventId, body);
    return json(created);
  }

  // /api/events/:id/volunteers/:vid
  const eventVolunteerMatch = path.match(/^\/api\/events\/([^/]+)\/volunteers\/([^/]+)$/);
  if (eventVolunteerMatch) {
    const eventId = eventVolunteerMatch[1]!;
    const vid = eventVolunteerMatch[2]!;
    if (method === "PUT") {
      const body = await jsonBody<{ name?: string; department?: string }>(req);
      const updated = await api.events.volunteers.update(eventId, vid, body);
      if (!updated) return notFound();
      return json(updated);
    }
    if (method === "DELETE") {
      await api.events.volunteers.delete(eventId, vid);
      return json({ ok: true });
    }
  }

  // /api/budgets
  if (path === "/api/budgets" && method === "GET") {
    const list = await api.budgets.list();
    return json(list);
  }
  if (path === "/api/budgets" && method === "POST") {
    const body = await jsonBody<{ name: string; year: number; description?: string }>(req);
    const created = await api.budgets.create(body);
    return json(created);
  }

  // /api/budgets/:id
  const budgetIdMatch = path.match(/^\/api\/budgets\/([^/]+)$/);
  if (budgetIdMatch) {
    const id = budgetIdMatch[1]!;
    if (method === "GET") {
      const budget = await api.budgets.get(id);
      if (!budget) return notFound();
      return json(budget);
    }
    if (method === "PUT") {
      const body = await jsonBody<{ name?: string; year?: number; description?: string }>(req);
      const updated = await api.budgets.update(id, body);
      if (!updated) return notFound();
      return json(updated);
    }
    if (method === "DELETE") {
      await api.budgets.delete(id);
      return json({ ok: true });
    }
  }

  // /api/budgets/:id/line-items
  const budgetLineItemsMatch = path.match(/^\/api\/budgets\/([^/]+)\/line-items$/);
  if (budgetLineItemsMatch && method === "POST") {
    const budgetId = budgetLineItemsMatch[1]!;
    const body = await jsonBody<{
      name: string;
      category: string;
      comments?: string;
      unitCost: number;
      quantity: number;
      historicalCosts?: Record<string, number>;
    }>(req);
    const created = await api.budgets.addLineItem(budgetId, body);
    return json(created);
  }

  // /api/budgets/:budgetId/line-items/:itemId
  const lineItemMatch = path.match(/^\/api\/budgets\/([^/]+)\/line-items\/([^/]+)$/);
  if (lineItemMatch) {
    const budgetId = lineItemMatch[1]!;
    const itemId = lineItemMatch[2]!;
    if (method === "PUT") {
      const body = await jsonBody<Partial<{
        name: string;
        category: string;
        comments: string;
        unitCost: number;
        quantity: number;
        historicalCosts: Record<string, number>;
      }>>(req);
      const updated = await api.budgets.updateLineItem(budgetId, itemId, body);
      if (!updated) return notFound();
      return json(updated);
    }
    if (method === "DELETE") {
      await api.budgets.deleteLineItem(budgetId, itemId);
      return json({ ok: true });
    }
  }

  // /api/members
  if (path === "/api/members" && method === "GET") {
    const list = await api.members.list();
    return json(list);
  }
  if (path === "/api/members" && method === "POST") {
    const body = await jsonBody<{
      name: string;
      phone_number?: string;
      email?: string;
      address?: string;
      birthday?: string;
      member_since?: string;
      is_baby?: boolean;
      position?: string;
      emergency_contact_name?: string;
      emergency_contact_phone?: string;
      photo?: string;
    }>(req);
    const created = await api.members.create(body);
    return json(created);
  }

  // /api/members/:id
  const memberIdMatch = path.match(/^\/api\/members\/([^/]+)$/);
  if (memberIdMatch) {
    const id = memberIdMatch[1]!;
    if (method === "GET") {
      const member = await api.members.get(id);
      if (!member) return notFound();
      return json(member);
    }
    if (method === "PUT") {
      const body = await jsonBody<Record<string, unknown>>(req);
      const updated = await api.members.update(id, body);
      if (!updated) return notFound();
      return json(updated);
    }
    if (method === "DELETE") {
      await api.members.delete(id);
      return json({ ok: true });
    }
  }

  // /api/scenarios
  if (path === "/api/scenarios" && method === "GET") {
    const list = await api.scenarios.list();
    return json(list);
  }
  if (path === "/api/scenarios" && method === "POST") {
    const body = await jsonBody<{ name: string; description?: string; inputs?: Record<string, unknown> }>(req);
    const created = await api.scenarios.create(body);
    return json(created);
  }

  // /api/scenarios/:id
  const scenarioIdMatch = path.match(/^\/api\/scenarios\/([^/]+)$/);
  if (scenarioIdMatch) {
    const id = scenarioIdMatch[1]!;
    if (method === "GET") {
      const scenario = await api.scenarios.get(id);
      if (!scenario) return notFound();
      return json(scenario);
    }
    if (method === "PUT") {
      const body = await jsonBody<{ name?: string; description?: string; inputs?: Record<string, unknown> }>(req);
      const updated = await api.scenarios.update(id, body);
      if (!updated) return notFound();
      return json(updated);
    }
    if (method === "DELETE") {
      await api.scenarios.delete(id);
      return json({ ok: true });
    }
  }

  // /api/contacts (list/search)
  if (path === "/api/contacts" && method === "GET") {
    const q = url.searchParams.get("q") ?? undefined;
    const status = (url.searchParams.get("status") as "active" | "inactive" | "deleted" | "all") ?? undefined;
    const hasPostalAddress = url.searchParams.get("hasPostalAddress") === "true" ? true : undefined;
    const hasEmail = url.searchParams.get("hasEmail") === "true" ? true : undefined;
    const tagIds = url.searchParams.get("tagIds")?.split(",").filter(Boolean);
    const organization = url.searchParams.get("organization") ?? undefined;
    const role = url.searchParams.get("role") ?? undefined;
    const sort = (url.searchParams.get("sort") as "updated_at" | "name" | "last_contacted") ?? undefined;
    const sortDir = (url.searchParams.get("sortDir") as "asc" | "desc") ?? undefined;
    const page = url.searchParams.get("page") ? parseInt(url.searchParams.get("page")!, 10) : undefined;
    const limit = url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit")!, 10) : undefined;
    const result = await api.contacts.list({
      q,
      status,
      hasPostalAddress,
      hasEmail,
      tagIds,
      organization,
      role,
      sort,
      sortDir,
      page,
      limit,
    });
    return json(result);
  }
  if (path === "/api/contacts" && method === "POST") {
    const body = await jsonBody<Record<string, unknown>>(req);
    const created = await api.contacts.create(body as Parameters<typeof api.contacts.create>[0]);
    return json(created);
  }

  // /api/contacts/import-pst (preview with deduplication)
  if (path === "/api/contacts/import-pst" && method === "POST") {
    try {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
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
  }

  // /api/contacts/import-pst-execute (create selected contacts)
  if (path === "/api/contacts/import-pst-execute" && method === "POST") {
    type ImportPstBody = { toCreate: Array<Partial<Contact> & { display_name: string }> };
    const body = await jsonBody<ImportPstBody>(req);
    const toCreate = body.toCreate ?? [];
    const created: string[] = [];
    for (const payload of toCreate) {
      const c = await api.contacts.create(payload as Parameters<typeof api.contacts.create>[0]);
      if (c) created.push(c.id);
    }
    return json({ created, count: created.length });
  }

  // /api/contacts/bulk-update
  if (path === "/api/contacts/bulk-update" && method === "POST") {
    const body = await jsonBody<{ ids: string[]; tags?: (string | Tag)[]; status?: string }>(req);
    await api.contacts.bulkUpdate(body.ids, {
      tags: body.tags,
      status: body.status as "active" | "inactive",
    });
    return json({ ok: true });
  }

  // /api/contacts/merge
  if (path === "/api/contacts/merge" && method === "POST") {
    const body = await jsonBody<{ sourceId: string; targetId: string; conflictResolution?: Record<string, "source" | "target"> }>(req);
    const merged = await api.contacts.merge(body.sourceId, body.targetId, body.conflictResolution);
    if (!merged) return notFound();
    return json(merged);
  }

  // /api/contacts/tags
  if (path === "/api/contacts/tags" && method === "GET") {
    const tags = await api.contacts.tags.list();
    return json(tags);
  }
  if (path === "/api/contacts/tags" && method === "POST") {
    const body = await jsonBody<{ name: string }>(req);
    const tag = await api.contacts.tags.create(body.name);
    return json(tag);
  }

  // /api/contacts/:id
  const contactIdMatch = path.match(/^\/api\/contacts\/([^/]+)$/);
  if (contactIdMatch) {
    const id = contactIdMatch[1]!;
    if (method === "GET") {
      const contact = await api.contacts.get(id);
      if (!contact) return notFound();
      return json(contact);
    }
    if (method === "PUT") {
      const body = await jsonBody<Record<string, unknown>>(req);
      const updated = await api.contacts.update(id, body as Parameters<typeof api.contacts.update>[1]);
      if (!updated) return notFound();
      return json(updated);
    }
    if (method === "DELETE") {
      await api.contacts.delete(id);
      return json({ ok: true });
    }
  }

  // /api/contacts/:id/restore
  const contactRestoreMatch = path.match(/^\/api\/contacts\/([^/]+)\/restore$/);
  if (contactRestoreMatch && method === "POST") {
    const id = contactRestoreMatch[1]!;
    const restored = await api.contacts.restore(id);
    if (!restored) return notFound();
    return json(restored);
  }

  // /api/mailing-lists
  if (path === "/api/mailing-lists" && method === "GET") {
    const list = await api.mailingLists.list();
    return json(list);
  }
  if (path === "/api/mailing-lists" && method === "POST") {
    const body = await jsonBody<Record<string, unknown>>(req);
    const created = await api.mailingLists.create(body as Parameters<typeof api.mailingLists.create>[0]);
    return json(created);
  }

  // /api/mailing-lists/:id/preview
  const listPreviewMatch = path.match(/^\/api\/mailing-lists\/([^/]+)\/preview$/);
  if (listPreviewMatch && method === "GET") {
    const id = listPreviewMatch[1]!;
    const preview = await api.mailingLists.preview(id);
    return json(preview);
  }

  // /api/mailing-lists/:id/members
  const listMembersMatch = path.match(/^\/api\/mailing-lists\/([^/]+)\/members$/);
  if (listMembersMatch) {
    const listId = listMembersMatch[1]!;
    if (method === "GET") {
      const members = await api.mailingLists.getMembers(listId);
      return json(members);
    }
    if (method === "POST") {
      const body = await jsonBody<{ contact_id?: string; contact_ids?: string[]; source?: string }>(req);
      if (body.contact_ids?.length) {
        await api.mailingLists.addMembersBulk(listId, body.contact_ids, (body.source as "manual" | "import" | "rule") ?? "manual");
      } else if (body.contact_id) {
        const updated = await api.mailingLists.addMember(listId, body.contact_id, (body.source as "manual" | "import" | "rule") ?? "manual");
        if (!updated) return notFound();
        return json(updated);
      }
      return json({ ok: true });
    }
  }

  // /api/mailing-lists/:id/members/:contactId
  const listMemberDeleteMatch = path.match(/^\/api\/mailing-lists\/([^/]+)\/members\/([^/]+)$/);
  if (listMemberDeleteMatch && method === "DELETE") {
    const listId = listMemberDeleteMatch[1]!;
    const contactId = listMemberDeleteMatch[2]!;
    await api.mailingLists.removeMember(listId, contactId);
    return json({ ok: true });
  }

  // /api/mailing-lists/:id
  const listIdMatch = path.match(/^\/api\/mailing-lists\/([^/]+)$/);
  if (listIdMatch) {
    const id = listIdMatch[1]!;
    if (method === "GET") {
      const list = await api.mailingLists.get(id);
      if (!list) return notFound();
      return json(list);
    }
    if (method === "PUT") {
      const body = await jsonBody<Record<string, unknown>>(req);
      const updated = await api.mailingLists.update(id, body as Parameters<typeof api.mailingLists.update>[1]);
      if (!updated) return notFound();
      return json(updated);
    }
    if (method === "DELETE") {
      await api.mailingLists.delete(id);
      return json({ ok: true });
    }
  }

  // /api/mailing-batches
  if (path === "/api/mailing-batches" && method === "GET") {
    const list = await api.mailingBatches.list();
    return json(list);
  }
  if (path === "/api/mailing-batches" && method === "POST") {
    const body = await jsonBody<{ list_id: string; name: string }>(req);
    const created = await api.mailingBatches.create(body.list_id, body.name);
    if (!created) return notFound();
    return json(created);
  }

  // /api/mailing-batches/:id
  const batchIdMatch = path.match(/^\/api\/mailing-batches\/([^/]+)$/);
  if (batchIdMatch) {
    const id = batchIdMatch[1]!;
    if (method === "GET") {
      const batch = await api.mailingBatches.get(id);
      if (!batch) return notFound();
      return json(batch);
    }
  }

  // /api/mailing-batches/:id/recipients/:recipientId
  const batchRecipientMatch = path.match(/^\/api\/mailing-batches\/([^/]+)\/recipients\/([^/]+)$/);
  if (batchRecipientMatch && method === "PUT") {
    const batchId = batchRecipientMatch[1]!;
    const recipientId = batchRecipientMatch[2]!;
    const body = await jsonBody<{ status: string; reason?: string }>(req);
    await api.mailingBatches.updateRecipientStatus(batchId, recipientId, body.status as "queued" | "printed" | "mailed" | "returned" | "invalid", body.reason);
    return json({ ok: true });
  }

  return null;
}
