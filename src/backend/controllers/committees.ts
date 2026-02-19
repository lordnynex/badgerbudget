import { Elysia } from "elysia";
import { BaseController } from "./BaseController";
import { CommitteesDto } from "../dto/committees.dto";

export class CommitteesController extends BaseController {
  init() {
    return new Elysia({ prefix: "/committees" })
      .get("/", ({ query }) => this.list(query.sort as "formed_date" | "name" | undefined))
      .post("/", ({ body }) => this.create(body), {
        body: CommitteesDto.createBody,
      })
      .get("/:id", ({ params }) => this.get(params.id), {
        params: CommitteesDto.params,
      })
      .put("/:id", ({ params, body }) => this.update(params.id, body), {
        params: CommitteesDto.params,
        body: CommitteesDto.updateBody,
      })
      .delete("/:id", ({ params }) => this.delete(params.id), {
        params: CommitteesDto.params,
      })
      .post("/:id/members", ({ params, body }) => this.addMember(params.id, body.member_id), {
        params: CommitteesDto.params,
        body: CommitteesDto.addMemberBody,
      })
      .put("/:id/members/order", ({ params, body }) => this.updateMemberOrder(params.id, body.member_ids), {
        params: CommitteesDto.params,
        body: CommitteesDto.membersOrderBody,
      })
      .delete("/:id/members/:memberId", ({ params }) => this.removeMember(params.id, params.memberId), {
        params: CommitteesDto.idMemberId,
      })
      .get("/:id/meetings", ({ params }) => this.listMeetings(params.id), {
        params: CommitteesDto.params,
      })
      .post("/:id/meetings", ({ params, body }) => this.createMeeting(params.id, body), {
        params: CommitteesDto.params,
        body: CommitteesDto.createMeetingBody,
      })
      .get("/:id/meetings/:meetingId", ({ params }) => this.getMeeting(params.id, params.meetingId), {
        params: CommitteesDto.idMeetingId,
      })
      .put("/:id/meetings/:meetingId", ({ params, body }) => this.updateMeeting(params.id, params.meetingId, body), {
        params: CommitteesDto.idMeetingId,
        body: CommitteesDto.updateMeetingBody,
      })
      .delete("/:id/meetings/:meetingId", ({ params }) => this.deleteMeeting(params.id, params.meetingId), {
        params: CommitteesDto.idMeetingId,
      });
  }

  private list(sort?: string) {
    return this.api.committees.list(sort as "formed_date" | "name" | undefined).then(this.json);
  }

  private create(body: Record<string, unknown>) {
    return this.api.committees.create(body as Parameters<typeof this.api.committees.create>[0]).then(this.json);
  }

  private get(id: string) {
    return this.api.committees.get(id).then((c) => (c ? this.json(c) : this.notFound()));
  }

  private update(id: string, body: Record<string, unknown>) {
    return this.api.committees.update(id, body).then((c) => (c ? this.json(c) : this.notFound()));
  }

  private delete(id: string) {
    return this.api.committees.delete(id).then((ok) => (ok ? this.json({ ok: true }) : this.notFound()));
  }

  private addMember(id: string, memberId: string) {
    return this.api.committees.addMember(id, memberId).then((c) => (c ? this.json(c) : this.notFound()));
  }

  private removeMember(id: string, memberId: string) {
    return this.api.committees.removeMember(id, memberId).then((c) => (c ? this.json(c) : this.notFound()));
  }

  private updateMemberOrder(id: string, memberIds: string[]) {
    return this.api.committees.updateMemberOrder(id, memberIds).then((c) => (c ? this.json(c) : this.notFound()));
  }

  private listMeetings(id: string) {
    return this.api.committees.listMeetings(id).then((list) => (list ? this.json(list) : this.notFound()));
  }

  private createMeeting(id: string, body: Record<string, unknown>) {
    return this.api.committees
      .createMeeting(id, body as Parameters<typeof this.api.committees.createMeeting>[1])
      .then(this.json);
  }

  private getMeeting(id: string, meetingId: string) {
    return this.api.committees
      .getMeeting(id, meetingId)
      .then((m) => (m ? this.json(m) : this.notFound()));
  }

  private updateMeeting(id: string, meetingId: string, body: Record<string, unknown>) {
    return this.api.committees
      .updateMeeting(id, meetingId, body)
      .then((m) => (m ? this.json(m) : this.notFound()));
  }

  private deleteMeeting(id: string, meetingId: string) {
    return this.api.committees
      .deleteMeeting(id, meetingId)
      .then((ok) => (ok ? this.json({ ok: true }) : this.notFound()));
  }
}
