import { Elysia } from "elysia";
import { BaseController } from "./BaseController";
import { ScenariosDto } from "../dto/scenarios.dto";

export class ScenariosController extends BaseController {
  init() {
    return new Elysia({ prefix: "/scenarios" })
      .get("/", () => this.list())
      .post("/", ({ body }) => this.create(body), { body: ScenariosDto.createBody })
      .get("/:id", ({ params }) => this.get(params.id), { params: ScenariosDto.params })
      .put("/:id", ({ params, body }) => this.update(params.id, body), {
        params: ScenariosDto.params,
        body: ScenariosDto.updateBody,
      })
      .delete("/:id", ({ params }) => this.delete(params.id), { params: ScenariosDto.params });
  }

  private list() {
    return this.api.scenarios.list().then(this.json);
  }

  private get(id: string) {
    return this.api.scenarios.get(id).then((s) => (s ? this.json(s) : this.notFound()));
  }

  private create(body: Parameters<typeof this.api.scenarios.create>[0]) {
    return this.api.scenarios.create(body).then(this.json);
  }

  private update(id: string, body: Parameters<typeof this.api.scenarios.update>[1]) {
    return this.api.scenarios.update(id, body).then((s) => (s ? this.json(s) : this.notFound()));
  }

  private delete(id: string) {
    return this.api.scenarios.delete(id).then(() => this.json({ ok: true }));
  }
}
