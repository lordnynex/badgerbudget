import { api } from "../services/api";
import { json, notFound } from "./helpers";

export const mailingListsController = {
  list: () => api.mailingLists.list().then(json),
  get: (id: string) => api.mailingLists.get(id).then((l) => (l ? json(l) : notFound())),
  create: (body: Parameters<typeof api.mailingLists.create>[0]) =>
    api.mailingLists.create(body).then(json),
  update: (id: string, body: Record<string, unknown>) =>
    api.mailingLists.update(id, body).then((l) => (l ? json(l) : notFound())),
  delete: (id: string) => api.mailingLists.delete(id).then(() => json({ ok: true })),
  preview: (id: string) => api.mailingLists.preview(id).then(json),
  getMembers: (id: string) => api.mailingLists.getMembers(id).then(json),
  addMember: async (
    id: string,
    body: { contact_id?: string; contact_ids?: string[]; source?: string }
  ) => {
    if (body.contact_ids?.length) {
      await api.mailingLists.addMembersBulk(id, body.contact_ids, (body.source as "manual" | "import" | "rule") ?? "manual");
      return json({ ok: true });
    }
    if (body.contact_id) {
      const updated = await api.mailingLists.addMember(id, body.contact_id, (body.source as "manual" | "import" | "rule") ?? "manual");
      return updated ? json(updated) : notFound();
    }
    return json({ ok: true });
  },
  removeMember: (id: string, contactId: string) =>
    api.mailingLists.removeMember(id, contactId).then(() => json({ ok: true })),
};
