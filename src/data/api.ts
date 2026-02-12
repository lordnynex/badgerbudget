import type { Budget, BudgetSummary, LineItem, Scenario, ScenarioSummary } from "@/types/budget";

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
