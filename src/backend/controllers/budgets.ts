import { api } from "../services/api";
import { json, notFound } from "./helpers";

export const budgetsController = {
  list: () => api.budgets.list().then(json),
  get: (id: string) => api.budgets.get(id).then((b) => (b ? json(b) : notFound())),
  create: (body: Parameters<typeof api.budgets.create>[0]) => api.budgets.create(body).then(json),
  update: (id: string, body: Record<string, unknown>) =>
    api.budgets.update(id, body).then((b) => (b ? json(b) : notFound())),
  delete: (id: string) => api.budgets.delete(id).then(() => json({ ok: true })),
  addLineItem: (id: string, body: Parameters<typeof api.budgets.addLineItem>[0]) =>
    api.budgets.addLineItem(id, body).then(json),
  updateLineItem: (id: string, itemId: string, body: Record<string, unknown>) =>
    api.budgets.updateLineItem(id, itemId, body).then((b) => (b ? json(b) : notFound())),
  deleteLineItem: (id: string, itemId: string) =>
    api.budgets.deleteLineItem(id, itemId).then(() => json({ ok: true })),
};
