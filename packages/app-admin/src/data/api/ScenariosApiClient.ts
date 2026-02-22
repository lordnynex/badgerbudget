import { client, unwrap } from "./client";

export class ScenariosApiClient {
  list() {
    return unwrap(client.api.scenarios.get());
  }

  get(id: string) {
    return unwrap(client.api.scenarios({ id }).get());
  }

  create(body: {
    name: string;
    description?: string;
    inputs?: Record<string, unknown>;
  }) {
    return unwrap(client.api.scenarios.post(body));
  }

  update(
    id: string,
    body: {
      name?: string;
      description?: string;
      inputs?: Record<string, unknown>;
    },
  ) {
    return unwrap(client.api.scenarios({ id }).put(body));
  }

  delete(id: string) {
    return unwrap(client.api.scenarios({ id }).delete());
  }
}
