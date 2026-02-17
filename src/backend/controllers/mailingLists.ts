import { Elysia } from "elysia";
import { BaseController } from "./BaseController";
import { MailingListsDto } from "../dto/mailingLists.dto";

export class MailingListsController extends BaseController {
  init() {
    return new Elysia({ prefix: "/mailing-lists" })
      .get("/", () => this.list())
      .post("/", ({ body }) => this.create(body), { body: MailingListsDto.createBody })
      .get("/:id/preview", ({ params }) => this.preview(params.id), { params: MailingListsDto.params })
      .get("/:id/stats", ({ params }) => this.getStats(params.id), { params: MailingListsDto.params })
      .get("/:id/included", ({ params, query }) => this.getIncluded(params.id, query), {
        params: MailingListsDto.params,
        query: MailingListsDto.paginationQuery,
      })
      .get("/:id/members", ({ params }) => this.getMembers(params.id), { params: MailingListsDto.params })
      .post("/:id/members", ({ params, body }) => this.addMember(params.id, body), {
        params: MailingListsDto.params,
        body: MailingListsDto.addMemberBody,
      })
      .post("/:id/members/add-all", ({ params }) => this.addAllMembers(params.id), {
        params: MailingListsDto.params,
      })
      .post("/:id/members/add-all-hellenics", ({ params }) => this.addAllHellenics(params.id), {
        params: MailingListsDto.params,
      })
      .delete("/:id/members/:contactId", ({ params }) => this.removeMember(params.id, params.contactId), {
        params: MailingListsDto.contactParams,
      })
      .post("/:id/members/:contactId/reinstate", ({ params }) => this.reinstateMember(params.id, params.contactId), {
        params: MailingListsDto.contactParams,
      })
      .get("/:id", ({ params }) => this.get(params.id), { params: MailingListsDto.params })
      .put("/:id", ({ params, body }) => this.update(params.id, body), {
        params: MailingListsDto.params,
        body: MailingListsDto.updateBody,
      })
      .delete("/:id", ({ params }) => this.delete(params.id), { params: MailingListsDto.params });
  }

  private list() {
    return this.api.mailingLists.list().then(this.json);
  }

  private get(id: string) {
    return this.api.mailingLists.get(id).then((l) => (l ? this.json(l) : this.notFound()));
  }

  private create(body: Parameters<typeof this.api.mailingLists.create>[0]) {
    return this.api.mailingLists.create(body).then(this.json);
  }

  private update(id: string, body: Record<string, unknown>) {
    return this.api.mailingLists.update(id, body).then((l) => (l ? this.json(l) : this.notFound()));
  }

  private delete(id: string) {
    return this.api.mailingLists.delete(id).then(() => this.json({ ok: true }));
  }

  private preview(id: string) {
    return this.api.mailingLists.preview(id).then(this.json);
  }

  private getStats(id: string) {
    return this.api.mailingLists.getStats(id).then(this.json);
  }

  private getIncluded(id: string, query: { page?: number; limit?: number; q?: string }) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Math.max(Number(query.limit) || 25, 1), 100);
    const search = typeof query.q === "string" ? query.q : undefined;
    return this.api.mailingLists.getIncludedPaginated(id, page, limit, search).then(this.json);
  }

  private getMembers(id: string) {
    return this.api.mailingLists.getMembers(id).then(this.json);
  }

  private async addMember(
    id: string,
    body: { contact_id?: string; contact_ids?: string[]; source?: "manual" | "import" | "rule" }
  ) {
    const source = (body.source ?? "manual") as "manual" | "import" | "rule";
    if (body.contact_ids?.length) {
      await this.api.mailingLists.addMembersBulk(id, body.contact_ids, source);
      return this.json({ ok: true });
    }
    if (body.contact_id) {
      const updated = await this.api.mailingLists.addMember(id, body.contact_id, source);
      return updated ? this.json(updated) : this.notFound();
    }
    return this.json({ ok: true });
  }

  private addAllMembers(id: string) {
    return this.api.mailingLists.addAllContacts(id, "manual").then(this.json);
  }

  private addAllHellenics(id: string) {
    return this.api.mailingLists.addAllHellenics(id, "manual").then(this.json);
  }

  private removeMember(id: string, contactId: string) {
    return this.api.mailingLists.removeMember(id, contactId).then(() => this.json({ ok: true }));
  }

  private reinstateMember(id: string, contactId: string) {
    return this.api.mailingLists.removeExclusion(id, contactId).then((r) =>
      r ? this.json({ ok: true }) : this.notFound()
    );
  }
}
