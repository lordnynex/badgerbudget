import { client, unwrap, buildSearchParams } from "./client";

export class MailingListsApiClient {
  async list() {
    const data = await unwrap(client.api["mailing-lists"].get());
    return Array.isArray(data) ? data : [];
  }

  get(id: string) {
    return unwrap(client.api["mailing-lists"]({ id }).get());
  }

  create(body: Record<string, unknown>) {
    return unwrap(client.api["mailing-lists"].post(body));
  }

  update(id: string, body: Record<string, unknown>) {
    return unwrap(client.api["mailing-lists"]({ id }).put(body));
  }

  delete(id: string) {
    return unwrap(client.api["mailing-lists"]({ id }).delete());
  }

  preview(id: string) {
    return unwrap(client.api["mailing-lists"]({ id }).preview.get());
  }

  getStats(id: string) {
    return unwrap(client.api["mailing-lists"]({ id }).stats.get());
  }

  async getIncluded(id: string, params?: { page?: number; limit?: number; q?: string }) {
    const qs = params
      ? "?" +
        buildSearchParams({
          page: params.page ?? 1,
          limit: params.limit ?? 25,
          ...(params.q?.trim() && { q: params.q.trim() }),
        })
      : "?page=1&limit=25";
    const res = await fetch(`/api/mailing-lists/${id}/included${qs}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error((err as { error?: string }).error ?? "Request failed");
    }
    return res.json();
  }

  getMembers(id: string) {
    return unwrap(client.api["mailing-lists"]({ id }).members.get());
  }

  addMember(
    listId: string,
    contactId: string,
    source?: "manual" | "import" | "rule",
  ) {
    return unwrap(
      client.api
        ["mailing-lists"]({ id: listId })
        .members.post({ contact_id: contactId, source: source ?? "manual" }),
    );
  }

  addMembersBulk(
    listId: string,
    contactIds: string[],
    source?: "manual" | "import" | "rule",
  ) {
    return unwrap(
      client.api
        ["mailing-lists"]({ id: listId })
        .members.post({
          contact_ids: contactIds,
          source: source ?? "manual",
        }),
    );
  }

  addAllContacts(listId: string) {
    return unwrap(
      client.api["mailing-lists"]({ id: listId }).members["add-all"].post(),
    );
  }

  removeMember(listId: string, contactId: string) {
    return unwrap(
      client.api
        ["mailing-lists"]({ id: listId })
        .members({ contactId })
        .delete(),
    );
  }

  reinstateMember(listId: string, contactId: string) {
    return unwrap(
      client.api
        ["mailing-lists"]({ id: listId })
        .members({ contactId })
        .reinstate.post(),
    );
  }
}
