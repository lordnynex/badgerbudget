import { Elysia } from "elysia";
import { BaseController } from "./BaseController";
import { EventsDto } from "../dto/events.dto";

export class EventsController extends BaseController {
  init() {
    return new Elysia({ prefix: "/events" })
      .get("/", () => this.list())
      .post("/", ({ body }) => this.create(body), {
        body: EventsDto.createBody,
      })
      .get("/:id", ({ params }) => this.get(params.id), {
        params: EventsDto.params,
      })
      .put("/:id", ({ params, body }) => this.update(params.id, body), {
        params: EventsDto.params,
        body: EventsDto.updateBody,
      })
      .delete("/:id", ({ params }) => this.delete(params.id), {
        params: EventsDto.params,
      })
      .post(
        "/:id/milestones",
        ({ params, body }) => this.milestonesCreate(params.id, body),
        {
          params: EventsDto.params,
          body: EventsDto.createMilestoneBody,
        },
      )
      .put(
        "/:id/milestones/:mid",
        ({ params, body }) =>
          this.milestonesUpdate(params.id, params.mid, body),
        {
          params: EventsDto.idMid,
          body: EventsDto.updateMilestoneBody,
        },
      )
      .delete(
        "/:id/milestones/:mid",
        ({ params }) => this.milestonesDelete(params.id, params.mid),
        {
          params: EventsDto.idMid,
        },
      )
      .post(
        "/:id/milestones/:mid/members",
        ({ params, body }) =>
          this.milestonesAddMember(params.id, params.mid, body.member_id),
        {
          params: EventsDto.idMid,
          body: EventsDto.addMilestoneMemberBody,
        },
      )
      .delete(
        "/:id/milestones/:mid/members/:memberId",
        ({ params }) =>
          this.milestonesRemoveMember(params.id, params.mid, params.memberId),
        {
          params: EventsDto.idMidMemberId,
        },
      )
      .post(
        "/:id/packing-categories",
        ({ params, body }) => this.packingCategoriesCreate(params.id, body),
        {
          params: EventsDto.params,
          body: EventsDto.createPackingCategoryBody,
        },
      )
      .put(
        "/:id/packing-categories/:cid",
        ({ params, body }) =>
          this.packingCategoriesUpdate(params.id, params.cid, body),
        {
          params: EventsDto.idCid,
          body: EventsDto.updatePackingCategoryBody,
        },
      )
      .delete(
        "/:id/packing-categories/:cid",
        ({ params }) => this.packingCategoriesDelete(params.id, params.cid),
        {
          params: EventsDto.idCid,
        },
      )
      .post(
        "/:id/packing-items",
        ({ params, body }) => this.packingItemsCreate(params.id, body),
        {
          params: EventsDto.params,
          body: EventsDto.createPackingItemBody,
        },
      )
      .put(
        "/:id/packing-items/:pid",
        ({ params, body }) =>
          this.packingItemsUpdate(params.id, params.pid, body),
        {
          params: EventsDto.idPid,
          body: EventsDto.updatePackingItemBody,
        },
      )
      .delete(
        "/:id/packing-items/:pid",
        ({ params }) => this.packingItemsDelete(params.id, params.pid),
        {
          params: EventsDto.idPid,
        },
      )
      .post(
        "/:id/assignments",
        ({ params, body }) => this.assignmentsCreate(params.id, body),
        {
          params: EventsDto.params,
          body: EventsDto.createAssignmentBody,
        },
      )
      .put(
        "/:id/assignments/:aid",
        ({ params, body }) =>
          this.assignmentsUpdate(params.id, params.aid, body),
        {
          params: EventsDto.idAid,
          body: EventsDto.updateAssignmentBody,
        },
      )
      .delete(
        "/:id/assignments/:aid",
        ({ params }) => this.assignmentsDelete(params.id, params.aid),
        {
          params: EventsDto.idAid,
        },
      )
      .post(
        "/:id/assignments/:aid/members",
        ({ params, body }) =>
          this.assignmentsAddMember(params.id, params.aid, body.member_id),
        {
          params: EventsDto.idAid,
          body: EventsDto.addAssignmentMemberBody,
        },
      )
      .delete(
        "/:id/assignments/:aid/members/:memberId",
        ({ params }) =>
          this.assignmentsRemoveMember(params.id, params.aid, params.memberId),
        {
          params: EventsDto.idAidMemberId,
        },
      )
      .post(
        "/:id/volunteers",
        ({ params, body }) => this.volunteersCreate(params.id, body),
        {
          params: EventsDto.params,
          body: EventsDto.createVolunteerBody,
        },
      )
      .put(
        "/:id/volunteers/:vid",
        ({ params, body }) =>
          this.volunteersUpdate(params.id, params.vid, body),
        {
          params: EventsDto.idVid,
          body: EventsDto.updateVolunteerBody,
        },
      )
      .delete(
        "/:id/volunteers/:vid",
        ({ params }) => this.volunteersDelete(params.id, params.vid),
        {
          params: EventsDto.idVid,
        },
      );
  }

  private list() {
    return this.api.events.list().then(this.json);
  }

  private get(id: string) {
    return this.api.events
      .get(id)
      .then((e) => (e ? this.json(e) : this.notFound()));
  }

  private create(body: Record<string, unknown> & { name: string }) {
    return this.api.events.create(body as Parameters<typeof this.api.events.create>[0]).then(this.json);
  }

  private update(id: string, body: Record<string, unknown>) {
    return this.api.events
      .update(id, body)
      .then((e) => (e ? this.json(e) : this.notFound()));
  }

  private delete(id: string) {
    return this.api.events.delete(id).then(() => this.json({ ok: true }));
  }

  private milestonesCreate(
    id: string,
    body: Parameters<typeof this.api.events.milestones.create>[1],
  ) {
    return this.api.events.milestones.create(id, body).then(this.json);
  }

  private milestonesUpdate(
    id: string,
    mid: string,
    body: Record<string, unknown>,
  ) {
    return this.api.events.milestones
      .update(id, mid, body)
      .then((e) => (e ? this.json(e) : this.notFound()));
  }

  private milestonesDelete(id: string, mid: string) {
    return this.api.events.milestones
      .delete(id, mid)
      .then(() => this.json({ ok: true }));
  }

  private milestonesAddMember(id: string, mid: string, memberId: string) {
    return this.api.events.milestones
      .addMember(id, mid, memberId)
      .then((e) => (e ? this.json(e) : this.notFound()));
  }

  private milestonesRemoveMember(id: string, mid: string, memberId: string) {
    return this.api.events.milestones
      .removeMember(id, mid, memberId)
      .then((e) => (e ? this.json(e) : this.notFound()));
  }

  private packingCategoriesCreate(id: string, body: { name: string }) {
    return this.api.events.packingCategories.create(id, body).then(this.json);
  }

  private packingCategoriesUpdate(
    id: string,
    cid: string,
    body: { name?: string },
  ) {
    return this.api.events.packingCategories
      .update(id, cid, body)
      .then((e) => (e ? this.json(e) : this.notFound()));
  }

  private packingCategoriesDelete(id: string, cid: string) {
    return this.api.events.packingCategories
      .delete(id, cid)
      .then(() => this.json({ ok: true }));
  }

  private packingItemsCreate(id: string, body: Record<string, unknown>) {
    return this.api.events.packingItems.create(id, body as Parameters<typeof this.api.events.packingItems.create>[1]).then(this.json);
  }

  private packingItemsUpdate(
    id: string,
    pid: string,
    body: Record<string, unknown>,
  ) {
    return this.api.events.packingItems
      .update(id, pid, body)
      .then((e) => (e ? this.json(e) : this.notFound()));
  }

  private packingItemsDelete(id: string, pid: string) {
    return this.api.events.packingItems
      .delete(id, pid)
      .then(() => this.json({ ok: true }));
  }

  private assignmentsCreate(
    id: string,
    body: Parameters<typeof this.api.events.assignments.create>[1],
  ) {
    return this.api.events.assignments.create(id, body).then(this.json);
  }

  private assignmentsUpdate(
    id: string,
    aid: string,
    body: Record<string, unknown>,
  ) {
    return this.api.events.assignments
      .update(id, aid, body)
      .then((e) => (e ? this.json(e) : this.notFound()));
  }

  private assignmentsDelete(id: string, aid: string) {
    return this.api.events.assignments
      .delete(id, aid)
      .then(() => this.json({ ok: true }));
  }

  private assignmentsAddMember(id: string, aid: string, memberId: string) {
    return this.api.events.assignments
      .addMember(id, aid, memberId)
      .then((e) => (e ? this.json(e) : this.notFound()));
  }

  private assignmentsRemoveMember(id: string, aid: string, memberId: string) {
    return this.api.events.assignments
      .removeMember(id, aid, memberId)
      .then((e) => (e ? this.json(e) : this.notFound()));
  }

  private volunteersCreate(
    id: string,
    body: Parameters<typeof this.api.events.volunteers.create>[1],
  ) {
    return this.api.events.volunteers.create(id, body).then(this.json);
  }

  private volunteersUpdate(
    id: string,
    vid: string,
    body: Record<string, unknown>,
  ) {
    return this.api.events.volunteers
      .update(id, vid, body)
      .then((e) => (e ? this.json(e) : this.notFound()));
  }

  private volunteersDelete(id: string, vid: string) {
    return this.api.events.volunteers
      .delete(id, vid)
      .then(() => this.json({ ok: true }));
  }
}
