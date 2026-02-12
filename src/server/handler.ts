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
    const id = budgetIdMatch[1];
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
    const budgetId = budgetLineItemsMatch[1];
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
    const [, budgetId, itemId] = lineItemMatch;
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
    const id = scenarioIdMatch[1];
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
