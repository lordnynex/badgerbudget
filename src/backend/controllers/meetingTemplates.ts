import { Elysia } from "elysia";
import { BaseController } from "./BaseController";
import { MeetingTemplatesDto } from "../dto/meetings.dto";

export class MeetingTemplatesController extends BaseController {
  init() {
    return new Elysia({ prefix: "/meeting-templates" })
      .get("/", ({ query }) => this.list(query.type as "agenda" | "minutes" | undefined))
      .post("/", ({ body }) => this.create(body), {
        body: MeetingTemplatesDto.createBody,
      })
      .get("/:id", ({ params }) => this.get(params.id), {
        params: MeetingTemplatesDto.params,
      })
      .put("/:id", ({ params, body }) => this.update(params.id, body), {
        params: MeetingTemplatesDto.params,
        body: MeetingTemplatesDto.updateBody,
      })
      .delete("/:id", ({ params }) => this.delete(params.id), {
        params: MeetingTemplatesDto.params,
      });
  }

  private list(type?: string) {
    return this.api.meetingTemplates.list(type as "agenda" | "minutes" | undefined).then(this.json);
  }

  private create(body: Record<string, unknown>) {
    return this.api.meetingTemplates.create(body as { name: string; type: string; content: string }).then(this.json);
  }

  private get(id: string) {
    return this.api.meetingTemplates.get(id).then((t) => (t ? this.json(t) : this.notFound()));
  }

  private update(id: string, body: Record<string, unknown>) {
    return this.api.meetingTemplates.update(id, body).then((t) => (t ? this.json(t) : this.notFound()));
  }

  private delete(id: string) {
    return this.api.meetingTemplates.delete(id).then((ok) => (ok ? this.json({ ok: true }) : this.notFound()));
  }
}
