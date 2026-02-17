import { Elysia } from "elysia";
import { BaseController } from "./BaseController";
import { QrCodesDto } from "../dto/qrCodes.dto";

export class QrCodesController extends BaseController {
  init() {
    return new Elysia({ prefix: "/qr-codes" })
      .get("/", () => this.list())
      .get("/:id/image", ({ params, query }) => this.getImage(params.id, query), { params: QrCodesDto.params })
      .get("/:id", ({ params }) => this.get(params.id), { params: QrCodesDto.params })
      .post("/", ({ body }) => this.create(body), { body: QrCodesDto.createBody })
      .put("/:id", ({ params, body }) => this.update(params.id, body), {
        params: QrCodesDto.params,
        body: QrCodesDto.updateBody,
      })
      .delete("/:id", ({ params }) => this.delete(params.id), { params: QrCodesDto.params });
  }

  private list() {
    return this.api.qrCodes.list().then(this.json);
  }

  private get(id: string) {
    return this.api.qrCodes.get(id).then((r) => (r ? this.json(r) : this.notFound()));
  }

  private async getImage(id: string, query?: { size?: string }) {
    const sizeParam = query?.size;
    const size = sizeParam != null ? parseInt(sizeParam, 10) : undefined;
    const result = await this.api.qrCodes.getImage(id, Number.isNaN(size) ? undefined : size);
    if (!result) return this.notFound();
    return new Response(result.buffer, {
      headers: { "Content-Type": result.contentType },
    });
  }

  private create(body: Parameters<typeof this.api.qrCodes.create>[0]) {
    return this.api.qrCodes.create(body).then(this.json);
  }

  private update(id: string, body: Record<string, unknown>) {
    return this.api.qrCodes.update(id, body).then((r) => (r ? this.json(r) : this.notFound()));
  }

  private delete(id: string) {
    return this.api.qrCodes.delete(id).then((ok) => (ok ? this.json({ ok: true }) : this.notFound()));
  }
}
