import { Elysia } from "elysia";
import { BaseController } from "./BaseController";
import { MeetingsDto } from "../dto/meetings.dto";

export class MeetingsController extends BaseController {
  init() {
    return new Elysia({ prefix: "/meetings" })
      .get("/", ({ query }) => this.list(query.sort as "date" | "meeting_number" | undefined))
      .post("/", ({ body }) => this.create(body), {
        body: MeetingsDto.createBody,
      })
      .get("/old-business", () => this.listOldBusiness())
      .get("/motions", ({ query }) => this.listMotions(query), {
        query: MeetingsDto.listMotionsQuery,
      })
      .get("/:id", ({ params }) => this.get(params.id), {
        params: MeetingsDto.params,
      })
      .put("/:id", ({ params, body }) => this.update(params.id, body), {
        params: MeetingsDto.params,
        body: MeetingsDto.updateBody,
      })
      .delete("/:id", ({ params, query }) => this.delete(params.id, query), {
        params: MeetingsDto.params,
        query: MeetingsDto.deleteQuery,
      })
      .post("/:id/motions", ({ params, body }) => this.motionsCreate(params.id, body), {
        params: MeetingsDto.params,
        body: MeetingsDto.createMotionBody,
      })
      .put("/:id/motions/:mid", ({ params, body }) => this.motionsUpdate(params.id, params.mid, body), {
        params: MeetingsDto.idMid,
        body: MeetingsDto.updateMotionBody,
      })
      .delete("/:id/motions/:mid", ({ params }) => this.motionsDelete(params.id, params.mid), {
        params: MeetingsDto.idMid,
      })
      .post("/:id/action-items", ({ params, body }) => this.actionItemsCreate(params.id, body), {
        params: MeetingsDto.params,
        body: MeetingsDto.createActionItemBody,
      })
      .put("/:id/action-items/:aid", ({ params, body }) => this.actionItemsUpdate(params.id, params.aid, body), {
        params: MeetingsDto.idAid,
        body: MeetingsDto.updateActionItemBody,
      })
      .delete("/:id/action-items/:aid", ({ params }) => this.actionItemsDelete(params.id, params.aid), {
        params: MeetingsDto.idAid,
      })
      .post("/:id/old-business", ({ params, body }) => this.oldBusinessCreate(params.id, body), {
        params: MeetingsDto.params,
        body: MeetingsDto.createOldBusinessBody,
      })
      .put("/:id/old-business/:oid", ({ params, body }) => this.oldBusinessUpdate(params.id, params.oid, body), {
        params: MeetingsDto.idOid,
        body: MeetingsDto.updateOldBusinessBody,
      })
      .delete("/:id/old-business/:oid", ({ params }) => this.oldBusinessDelete(params.id, params.oid), {
        params: MeetingsDto.idOid,
      });
  }

  private list(sort?: string) {
    return this.api.meetings.list(sort as "date" | "meeting_number" | undefined).then(this.json);
  }

  private listOldBusiness() {
    return this.api.meetings.listOldBusiness().then(this.json);
  }

  private listMotions(query: { page?: number; per_page?: number; q?: string }) {
    const page = query.page != null ? Number(query.page) : undefined;
    const per_page = query.per_page != null ? Number(query.per_page) : undefined;
    const q = typeof query.q === "string" && query.q.trim() ? query.q.trim() : undefined;
    return this.api.meetings.listMotions({ page, per_page, q }).then(this.json);
  }

  private create(body: Record<string, unknown>) {
    return this.api.meetings.create(body as Parameters<typeof this.api.meetings.create>[0]).then(this.json);
  }

  private get(id: string) {
    return this.api.meetings.get(id).then((m) => (m ? this.json(m) : this.notFound()));
  }

  private update(id: string, body: Record<string, unknown>) {
    return this.api.meetings.update(id, body).then((m) => (m ? this.json(m) : this.notFound()));
  }

  private delete(
    id: string,
    query?: { delete_agenda?: boolean | string; delete_minutes?: boolean | string }
  ) {
    const options =
      query &&
      (query.delete_agenda !== undefined || query.delete_minutes !== undefined)
        ? {
            delete_agenda:
              query.delete_agenda === true || query.delete_agenda === "true",
            delete_minutes:
              query.delete_minutes === true || query.delete_minutes === "true",
          }
        : undefined;
    return this.api.meetings
      .delete(id, options)
      .then((ok) => (ok ? this.json({ ok: true }) : this.notFound()));
  }

  private motionsCreate(id: string, body: Record<string, unknown>) {
    return this.api.meetings.createMotion(id, body as {
      description?: string | null;
      result: string;
      order_index?: number;
      mover_member_id: string;
      seconder_member_id: string;
    }).then(this.json);
  }

  private motionsUpdate(id: string, mid: string, body: Record<string, unknown>) {
    return this.api.meetings.updateMotion(id, mid, body).then((m) => (m ? this.json(m) : this.notFound()));
  }

  private motionsDelete(id: string, mid: string) {
    return this.api.meetings.deleteMotion(id, mid).then((ok) => (ok ? this.json({ ok: true }) : this.notFound()));
  }

  private actionItemsCreate(id: string, body: Record<string, unknown>) {
    return this.api.meetings.createActionItem(id, body as { description: string; assignee_member_id?: string | null; due_date?: string | null; order_index?: number }).then(this.json);
  }

  private actionItemsUpdate(id: string, aid: string, body: Record<string, unknown>) {
    return this.api.meetings.updateActionItem(id, aid, body).then((m) => (m ? this.json(m) : this.notFound()));
  }

  private actionItemsDelete(id: string, aid: string) {
    return this.api.meetings.deleteActionItem(id, aid).then((ok) => (ok ? this.json({ ok: true }) : this.notFound()));
  }

  private oldBusinessCreate(id: string, body: Record<string, unknown>) {
    return this.api.meetings.createOldBusiness(id, body as { description: string; order_index?: number }).then(this.json);
  }

  private oldBusinessUpdate(id: string, oid: string, body: Record<string, unknown>) {
    return this.api.meetings.updateOldBusiness(id, oid, body).then((m) => (m ? this.json(m) : this.notFound()));
  }

  private oldBusinessDelete(id: string, oid: string) {
    return this.api.meetings.deleteOldBusiness(id, oid).then((ok) => (ok ? this.json({ ok: true }) : this.notFound()));
  }
}
