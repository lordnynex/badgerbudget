import { Elysia } from "elysia";
import { BaseController } from "./BaseController";
import { MembersDto } from "../dto/members.dto";
import type { PhotoSize } from "../services/MembersService";

const VALID_PHOTO_SIZES: PhotoSize[] = ["thumbnail", "medium", "full"];

export class MembersController extends BaseController {
  init() {
    return new Elysia({ prefix: "/members" })
      .get("/", () => this.list())
      .post("/", ({ body }) => this.create(body), { body: MembersDto.createBody })
      .get("/:id/photo", ({ params, query }) => this.getPhoto(params.id, query.size as string | undefined))
      .get("/:id", ({ params }) => this.get(params.id), { params: MembersDto.params })
      .put("/:id", ({ params, body }) => this.update(params.id, body), {
        params: MembersDto.params,
        body: MembersDto.updateBody,
      })
      .delete("/:id", ({ params }) => this.delete(params.id), { params: MembersDto.params });
  }

  private list() {
    return this.api.members.list().then(this.json);
  }

  private get(id: string) {
    return this.api.members.get(id).then((m) => (m ? this.json(m) : this.notFound()));
  }

  private create(body: Parameters<typeof this.api.members.create>[0]) {
    return this.api.members.create(body).then(this.json);
  }

  private update(id: string, body: Parameters<typeof this.api.members.update>[1]) {
    return this.api.members.update(id, body).then((m) => (m ? this.json(m) : this.notFound()));
  }

  private delete(id: string) {
    return this.api.members.delete(id).then(() => this.json({ ok: true }));
  }

  private async getPhoto(id: string, sizeParam?: string) {
    const size: PhotoSize = sizeParam && VALID_PHOTO_SIZES.includes(sizeParam as PhotoSize)
      ? (sizeParam as PhotoSize)
      : "full";
    const buffer = await this.api.members.getPhoto(id, size);
    if (!buffer) {
      return new Response(null, { status: 404 });
    }
    return new Response(new Uint8Array(buffer), {
      headers: { "Content-Type": "image/jpeg" },
    });
  }
}
