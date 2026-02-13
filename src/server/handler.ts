import { api, corsHeaders } from "./api";

async function jsonBody<T>(req: Request): Promise<T> {
  return (await req.json()) as T;
}

export async function handleApiRequest(req: Request): Promise<Response | null> {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  const json = (data: unknown) =>
    new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json", ...corsHeaders() },
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

  // /api/events/:id/packing-items
  const eventPackingMatch = path.match(/^\/api\/events\/([^/]+)\/packing-items$/);
  if (eventPackingMatch && method === "POST") {
    const eventId = eventPackingMatch[1]!;
    const body = await jsonBody<{ category: string; name: string }>(req);
    const created = await api.events.packingItems.create(eventId, body);
    return json(created);
  }

  // /api/events/:id/packing-items/:pid
  const eventPackingItemMatch = path.match(/^\/api\/events\/([^/]+)\/packing-items\/([^/]+)$/);
  if (eventPackingItemMatch) {
    const eventId = eventPackingItemMatch[1]!;
    const pid = eventPackingItemMatch[2]!;
    if (method === "PUT") {
      const body = await jsonBody<{ category?: string; name?: string }>(req);
      const updated = await api.events.packingItems.update(eventId, pid, body);
      if (!updated) return notFound();
      return json(updated);
    }
    if (method === "DELETE") {
      await api.events.packingItems.delete(eventId, pid);
      return json({ ok: true });
    }
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

  return null;
}
