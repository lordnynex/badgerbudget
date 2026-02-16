import { api } from "../services/api";
import { json, notFound } from "./helpers";

export const eventsController = {
  list: () => api.events.list().then(json),
  get: (id: string) => api.events.get(id).then((e) => (e ? json(e) : notFound())),
  create: (body: Parameters<typeof api.events.create>[0]) => api.events.create(body).then(json),
  update: (id: string, body: Record<string, unknown>) =>
    api.events.update(id, body).then((e) => (e ? json(e) : notFound())),
  delete: (id: string) => api.events.delete(id).then(() => json({ ok: true })),

  milestones: {
    create: (id: string, body: Parameters<typeof api.events.milestones.create>[0]) =>
      api.events.milestones.create(id, body).then(json),
    update: (id: string, mid: string, body: Record<string, unknown>) =>
      api.events.milestones.update(id, mid, body).then((e) => (e ? json(e) : notFound())),
    delete: (id: string, mid: string) => api.events.milestones.delete(id, mid).then(() => json({ ok: true })),
    addMember: (id: string, mid: string, memberId: string) =>
      api.events.milestones.addMember(id, mid, memberId).then((e) => (e ? json(e) : notFound())),
    removeMember: (id: string, mid: string, memberId: string) =>
      api.events.milestones.removeMember(id, mid, memberId).then((e) => (e ? json(e) : notFound())),
  },

  packingCategories: {
    create: (id: string, body: { name: string }) =>
      api.events.packingCategories.create(id, body).then(json),
    update: (id: string, cid: string, body: { name?: string }) =>
      api.events.packingCategories.update(id, cid, body).then((e) => (e ? json(e) : notFound())),
    delete: (id: string, cid: string) => api.events.packingCategories.delete(id, cid).then(() => json({ ok: true })),
  },

  packingItems: {
    create: (id: string, body: Parameters<typeof api.events.packingItems.create>[0]) =>
      api.events.packingItems.create(id, body).then(json),
    update: (id: string, pid: string, body: Record<string, unknown>) =>
      api.events.packingItems.update(id, pid, body).then((e) => (e ? json(e) : notFound())),
    delete: (id: string, pid: string) => api.events.packingItems.delete(id, pid).then(() => json({ ok: true })),
  },

  assignments: {
    create: (id: string, body: Parameters<typeof api.events.assignments.create>[0]) =>
      api.events.assignments.create(id, body).then(json),
    update: (id: string, aid: string, body: Record<string, unknown>) =>
      api.events.assignments.update(id, aid, body).then((e) => (e ? json(e) : notFound())),
    delete: (id: string, aid: string) => api.events.assignments.delete(id, aid).then(() => json({ ok: true })),
    addMember: (id: string, aid: string, memberId: string) =>
      api.events.assignments.addMember(id, aid, memberId).then((e) => (e ? json(e) : notFound())),
    removeMember: (id: string, aid: string, memberId: string) =>
      api.events.assignments.removeMember(id, aid, memberId).then((e) => (e ? json(e) : notFound())),
  },

  volunteers: {
    create: (id: string, body: Parameters<typeof api.events.volunteers.create>[0]) =>
      api.events.volunteers.create(id, body).then(json),
    update: (id: string, vid: string, body: Record<string, unknown>) =>
      api.events.volunteers.update(id, vid, body).then((e) => (e ? json(e) : notFound())),
    delete: (id: string, vid: string) => api.events.volunteers.delete(id, vid).then(() => json({ ok: true })),
  },
};
