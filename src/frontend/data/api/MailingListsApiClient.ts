import { client, unwrap } from "./client";

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
