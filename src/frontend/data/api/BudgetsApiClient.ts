import { client, unwrap } from "./client";

export class BudgetsApiClient {
  list() {
    return unwrap(client.api.budgets.get());
  }

  get(id: string) {
    return unwrap(client.api.budgets({ id }).get());
  }

  create(body: { name: string; year: number; description?: string }) {
    return unwrap(client.api.budgets.post(body));
  }

  update(
    id: string,
    body: { name?: string; year?: number; description?: string },
  ) {
    return unwrap(client.api.budgets({ id }).put(body));
  }

  delete(id: string) {
    return unwrap(client.api.budgets({ id }).delete());
  }

  addLineItem(
    budgetId: string,
    body: {
      name: string;
      category: string;
      comments?: string;
      unitCost: number;
      quantity: number;
      historicalCosts?: Record<string, number>;
    },
  ) {
    return unwrap(
      client.api.budgets({ id: budgetId })["line-items"].post(body),
    );
  }

  updateLineItem(
    budgetId: string,
    itemId: string,
    body: Record<string, unknown>,
  ) {
    return unwrap(
      client.api
        .budgets({ id: budgetId })
        ["line-items"]({ itemId })
        .put(body),
    );
  }

  deleteLineItem(budgetId: string, itemId: string) {
    return unwrap(
      client.api
        .budgets({ id: budgetId })
        ["line-items"]({ itemId })
        .delete(),
    );
  }
}
