import { client, unwrap } from "./client";

export class EventsApiClient {
  list() {
    return unwrap(client.api.events.get());
  }

  get(id: string) {
    return unwrap(client.api.events({ id }).get());
  }

  create(body: Parameters<typeof client.api.events.post>[0]) {
    return unwrap(client.api.events.post(body));
  }

  update(id: string, body: Record<string, unknown>) {
    return unwrap(client.api.events({ id }).put(body));
  }

  delete(id: string) {
    return unwrap(client.api.events({ id }).delete());
  }

  readonly milestones = {
    create: (
      eventId: string,
      body: {
        month: number;
        year: number;
        description: string;
        due_date?: string;
      },
    ) => unwrap(client.api.events({ id: eventId }).milestones.post(body)),
    update: (
      eventId: string,
      mid: string,
      body: {
        month?: number;
        year?: number;
        description?: string;
        completed?: boolean;
        due_date?: string;
      },
    ) =>
      unwrap(
        client.api.events({ id: eventId }).milestones({ mid }).put(body),
      ),
    delete: (eventId: string, mid: string) =>
      unwrap(client.api.events({ id: eventId }).milestones({ mid }).delete()),
    addMember: (eventId: string, mid: string, memberId: string) =>
      unwrap(
        client.api
          .events({ id: eventId })
          .milestones({ mid })
          .members.post({ member_id: memberId }),
      ),
    removeMember: (eventId: string, mid: string, memberId: string) =>
      unwrap(
        client.api
          .events({ id: eventId })
          .milestones({ mid })
          .members({ memberId })
          .delete(),
      ),
  };

  readonly packingCategories = {
    create: (eventId: string, body: { name: string }) =>
      unwrap(
        client.api.events({ id: eventId })["packing-categories"].post(body),
      ),
    update: (eventId: string, cid: string, body: { name?: string }) =>
      unwrap(
        client.api
          .events({ id: eventId })
          ["packing-categories"]({ cid })
          .put(body),
      ),
    delete: (eventId: string, cid: string) =>
      unwrap(
        client.api
          .events({ id: eventId })
          ["packing-categories"]({ cid })
          .delete(),
      ),
  };

  readonly packingItems = {
    create: (
      eventId: string,
      body: {
        category_id: string;
        name: string;
        quantity?: number;
        note?: string;
      },
    ) =>
      unwrap(
        client.api.events({ id: eventId })["packing-items"].post(body),
      ),
    update: (
      eventId: string,
      pid: string,
      body: {
        category_id?: string;
        name?: string;
        quantity?: number;
        note?: string;
        loaded?: boolean;
      },
    ) =>
      unwrap(
        client.api
          .events({ id: eventId })
          ["packing-items"]({ pid })
          .put(body),
      ),
    delete: (eventId: string, pid: string) =>
      unwrap(
        client.api
          .events({ id: eventId })
          ["packing-items"]({ pid })
          .delete(),
      ),
  };

  readonly volunteers = {
    create: (eventId: string, body: { name: string; department: string }) =>
      unwrap(client.api.events({ id: eventId }).volunteers.post(body)),
    update: (
      eventId: string,
      vid: string,
      body: { name?: string; department?: string },
    ) =>
      unwrap(
        client.api.events({ id: eventId }).volunteers({ vid }).put(body),
      ),
    delete: (eventId: string, vid: string) =>
      unwrap(client.api.events({ id: eventId }).volunteers({ vid }).delete()),
  };

  readonly assignments = {
    create: (
      eventId: string,
      body: { name: string; category: "planning" | "during" },
    ) => unwrap(client.api.events({ id: eventId }).assignments.post(body)),
    update: (
      eventId: string,
      aid: string,
      body: { name?: string; category?: "planning" | "during" },
    ) =>
      unwrap(
        client.api.events({ id: eventId }).assignments({ aid }).put(body),
      ),
    delete: (eventId: string, aid: string) =>
      unwrap(
        client.api.events({ id: eventId }).assignments({ aid }).delete(),
      ),
    addMember: (eventId: string, aid: string, memberId: string) =>
      unwrap(
        client.api
          .events({ id: eventId })
          .assignments({ aid })
          .members.post({ member_id: memberId }),
      ),
    removeMember: (eventId: string, aid: string, memberId: string) =>
      unwrap(
        client.api
          .events({ id: eventId })
          .assignments({ aid })
          .members({ memberId })
          .delete(),
      ),
  };
}
