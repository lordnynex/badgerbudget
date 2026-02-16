import { client, unwrap } from "./client";

export class MembersApiClient {
  list() {
    return unwrap(client.api.members.get());
  }

  get(id: string) {
    return unwrap(client.api.members({ id }).get());
  }

  create(body: Record<string, unknown>) {
    return unwrap(client.api.members.post(body));
  }

  update(id: string, body: Record<string, unknown>) {
    return unwrap(client.api.members({ id }).put(body));
  }

  delete(id: string) {
    return unwrap(client.api.members({ id }).delete());
  }
}
