import type {
  Budget,
  BudgetSummary,
  Event,
  EventAssignment,
  EventPackingCategory,
  EventPackingItem,
  EventPlanningMilestone,
  EventVolunteer,
  LineItem,
  Member,
  Scenario,
  ScenarioSummary,
} from "@/types/budget";

const BASE = "";

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  seed: () => fetchJson<{ ok: boolean; budgetId?: string; scenarioId?: string }>("/api/seed", { method: "POST" }),

  events: {
    list: () => fetchJson<Event[]>("/api/events"),
    get: (id: string) => fetchJson<Event | null>(`/api/events/${id}`),
    create: (body: Partial<Event>) =>
      fetchJson<Event>("/api/events", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: Partial<Event>) =>
      fetchJson<Event>(`/api/events/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => fetchJson<{ ok: boolean }>(`/api/events/${id}`, { method: "DELETE" }),
    milestones: {
      create: (eventId: string, body: { month: number; year: number; description: string; due_date?: string }) =>
        fetchJson<EventPlanningMilestone>(`/api/events/${eventId}/milestones`, {
          method: "POST",
          body: JSON.stringify(body),
        }),
      update: (eventId: string, mid: string, body: { month?: number; year?: number; description?: string; completed?: boolean; due_date?: string }) =>
        fetchJson<EventPlanningMilestone>(`/api/events/${eventId}/milestones/${mid}`, {
          method: "PUT",
          body: JSON.stringify(body),
        }),
      delete: (eventId: string, mid: string) =>
        fetchJson<{ ok: boolean }>(`/api/events/${eventId}/milestones/${mid}`, { method: "DELETE" }),
    },
    packingCategories: {
      create: (eventId: string, body: { name: string }) =>
        fetchJson<EventPackingCategory>(`/api/events/${eventId}/packing-categories`, {
          method: "POST",
          body: JSON.stringify(body),
        }),
      update: (eventId: string, cid: string, body: { name?: string }) =>
        fetchJson<EventPackingCategory>(`/api/events/${eventId}/packing-categories/${cid}`, {
          method: "PUT",
          body: JSON.stringify(body),
        }),
      delete: (eventId: string, cid: string) =>
        fetchJson<{ ok: boolean }>(`/api/events/${eventId}/packing-categories/${cid}`, { method: "DELETE" }),
    },
    packingItems: {
      create: (eventId: string, body: { category_id: string; name: string; quantity?: number; note?: string }) =>
        fetchJson<EventPackingItem>(`/api/events/${eventId}/packing-items`, {
          method: "POST",
          body: JSON.stringify(body),
        }),
      update: (eventId: string, pid: string, body: { category_id?: string; name?: string; quantity?: number; note?: string; loaded?: boolean }) =>
        fetchJson<EventPackingItem>(`/api/events/${eventId}/packing-items/${pid}`, {
          method: "PUT",
          body: JSON.stringify(body),
        }),
      delete: (eventId: string, pid: string) =>
        fetchJson<{ ok: boolean }>(`/api/events/${eventId}/packing-items/${pid}`, { method: "DELETE" }),
    },
    volunteers: {
      create: (eventId: string, body: { name: string; department: string }) =>
        fetchJson<EventVolunteer>(`/api/events/${eventId}/volunteers`, {
          method: "POST",
          body: JSON.stringify(body),
        }),
      update: (eventId: string, vid: string, body: { name?: string; department?: string }) =>
        fetchJson<EventVolunteer>(`/api/events/${eventId}/volunteers/${vid}`, {
          method: "PUT",
          body: JSON.stringify(body),
        }),
      delete: (eventId: string, vid: string) =>
        fetchJson<{ ok: boolean }>(`/api/events/${eventId}/volunteers/${vid}`, { method: "DELETE" }),
    },
    assignments: {
      create: (eventId: string, body: { name: string; category: "planning" | "during" }) =>
        fetchJson<EventAssignment>(`/api/events/${eventId}/assignments`, {
          method: "POST",
          body: JSON.stringify(body),
        }),
      update: (eventId: string, aid: string, body: { name?: string; category?: "planning" | "during" }) =>
        fetchJson<EventAssignment>(`/api/events/${eventId}/assignments/${aid}`, {
          method: "PUT",
          body: JSON.stringify(body),
        }),
      delete: (eventId: string, aid: string) =>
        fetchJson<{ ok: boolean }>(`/api/events/${eventId}/assignments/${aid}`, { method: "DELETE" }),
      addMember: (eventId: string, aid: string, memberId: string) =>
        fetchJson<Event>(`/api/events/${eventId}/assignments/${aid}/members`, {
          method: "POST",
          body: JSON.stringify({ member_id: memberId }),
        }),
      removeMember: (eventId: string, aid: string, memberId: string) =>
        fetchJson<Event>(`/api/events/${eventId}/assignments/${aid}/members/${memberId}`, {
          method: "DELETE",
        }),
    },
  },

  budgets: {
    list: () => fetchJson<BudgetSummary[]>("/api/budgets"),
    get: (id: string) => fetchJson<Budget | null>(`/api/budgets/${id}`),
    create: (body: { name: string; year: number; description?: string }) =>
      fetchJson<BudgetSummary>("/api/budgets", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: { name?: string; year?: number; description?: string }) =>
      fetchJson<BudgetSummary>(`/api/budgets/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => fetchJson<{ ok: boolean }>(`/api/budgets/${id}`, { method: "DELETE" }),
    addLineItem: (
      budgetId: string,
      body: {
        name: string;
        category: string;
        comments?: string;
        unitCost: number;
        quantity: number;
        historicalCosts?: Record<string, number>;
      }
    ) =>
      fetchJson<LineItem>(`/api/budgets/${budgetId}/line-items`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    updateLineItem: (
      budgetId: string,
      itemId: string,
      body: Partial<Omit<LineItem, "id">>
    ) =>
      fetchJson<LineItem>(`/api/budgets/${budgetId}/line-items/${itemId}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    deleteLineItem: (budgetId: string, itemId: string) =>
      fetchJson<{ ok: boolean }>(`/api/budgets/${budgetId}/line-items/${itemId}`, {
        method: "DELETE",
      }),
  },

  members: {
    list: () => fetchJson<Member[]>("/api/members"),
    get: (id: string) => fetchJson<Member | null>(`/api/members/${id}`),
    create: (body: Partial<Member> & { name: string }) =>
      fetchJson<Member>("/api/members", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: Partial<Member>) =>
      fetchJson<Member>(`/api/members/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => fetchJson<{ ok: boolean }>(`/api/members/${id}`, { method: "DELETE" }),
  },

  scenarios: {
    list: () => fetchJson<ScenarioSummary[]>("/api/scenarios"),
    get: (id: string) => fetchJson<Scenario | null>(`/api/scenarios/${id}`),
    create: (body: { name: string; description?: string; inputs?: Record<string, unknown> }) =>
      fetchJson<Scenario>("/api/scenarios", { method: "POST", body: JSON.stringify(body) }),
    update: (
      id: string,
      body: { name?: string; description?: string; inputs?: Record<string, unknown> }
    ) =>
      fetchJson<Scenario>(`/api/scenarios/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => fetchJson<{ ok: boolean }>(`/api/scenarios/${id}`, { method: "DELETE" }),
  },
};
