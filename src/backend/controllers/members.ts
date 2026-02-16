import { api } from "../services/api";
import { json, notFound } from "./helpers";

export const membersController = {
  list: () => api.members.list().then(json),
  get: (id: string) => api.members.get(id).then((m) => (m ? json(m) : notFound())),
  create: (body: Record<string, unknown>) => api.members.create(body).then(json),
  update: (id: string, body: Record<string, unknown>) =>
    api.members.update(id, body).then((m) => (m ? json(m) : notFound())),
  delete: (id: string) => api.members.delete(id).then(() => json({ ok: true })),
};
