import type { Api } from "../services/api";
import { json, notFound } from "./helpers";

export function createScenariosController(api: Api) {
  return {
    list: () => api.scenarios.list().then(json),
    get: (id: string) => api.scenarios.get(id).then((s) => (s ? json(s) : notFound())),
    create: (body: Parameters<Api["scenarios"]["create"]>[0]) => api.scenarios.create(body).then(json),
    update: (id: string, body: Record<string, unknown>) =>
      api.scenarios.update(id, body).then((s) => (s ? json(s) : notFound())),
    delete: (id: string) => api.scenarios.delete(id).then(() => json({ ok: true })),
  };
}
