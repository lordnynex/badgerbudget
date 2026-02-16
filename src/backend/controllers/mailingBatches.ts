import type { Api } from "../services/api";
import { json, notFound } from "./helpers";

export function createMailingBatchesController(api: Api) {
  return {
    list: () => api.mailingBatches.list().then(json),
    get: (id: string) => api.mailingBatches.get(id).then((b) => (b ? json(b) : notFound())),
    create: (body: { list_id: string; name: string }) =>
      api.mailingBatches.create(body.list_id, body.name).then((b) => (b ? json(b) : notFound())),
    updateRecipientStatus: (
      id: string,
      recipientId: string,
      status: "queued" | "printed" | "mailed" | "returned" | "invalid",
      reason?: string
    ) =>
      api.mailingBatches.updateRecipientStatus(id, recipientId, status, reason).then(() => json({ ok: true })),
  };
}
