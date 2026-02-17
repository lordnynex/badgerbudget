import { Elysia } from "elysia";
import { BaseController } from "./BaseController";
import { MailingBatchesDto } from "../dto/mailingBatches.dto";

export class MailingBatchesController extends BaseController {
  init() {
    return new Elysia({ prefix: "/mailing-batches" })
      .get("/", () => this.list())
      .post("/", ({ body }) => this.create(body), { body: MailingBatchesDto.createBody })
      .get("/:id", ({ params }) => this.get(params.id), { params: MailingBatchesDto.params })
      .put("/:id/recipients/:recipientId", ({ params, body }) => this.updateRecipientStatus(params.id, params.recipientId, body.status, body.reason), {
        params: MailingBatchesDto.recipientParams,
        body: MailingBatchesDto.updateRecipientBody,
      });
  }

  private list() {
    return this.api.mailingBatches.list().then(this.json);
  }

  private get(id: string) {
    return this.api.mailingBatches.get(id).then((b) => (b ? this.json(b) : this.notFound()));
  }

  private create(body: { list_id: string; name: string }) {
    return this.api.mailingBatches.create(body.list_id, body.name).then((b) => (b ? this.json(b) : this.notFound()));
  }

  private updateRecipientStatus(
    id: string,
    recipientId: string,
    status: "queued" | "printed" | "mailed" | "returned" | "invalid",
    reason?: string
  ) {
    return this.api.mailingBatches.updateRecipientStatus(id, recipientId, status, reason).then(() => this.json({ ok: true }));
  }
}
