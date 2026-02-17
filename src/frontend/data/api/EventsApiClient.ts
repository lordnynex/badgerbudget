import { client, unwrap } from "./client";

export class EventsApiClient {
  list(options?: { type?: string }) {
    return unwrap(
      client.api.events.get(
        options?.type ? { query: { type: options.type } } : undefined
      )
    );
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

  readonly photos = {
    add: async (eventId: string, file: File) => {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/events/${eventId}/photos`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error((err as { error?: string }).error ?? "Upload failed");
      }
      return res.json();
    },
    delete: async (eventId: string, photoId: string) => {
      const res = await fetch(`/api/events/${eventId}/photos/${photoId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error((err as { error?: string }).error ?? "Delete failed");
      }
    },
  };

  readonly assets = {
    add: async (eventId: string, file: File) => {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/events/${eventId}/assets`, { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error((err as { error?: string }).error ?? "Upload failed");
      }
      return res.json();
    },
    delete: async (eventId: string, assetId: string) => {
      const res = await fetch(`/api/events/${eventId}/assets/${assetId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error((err as { error?: string }).error ?? "Delete failed");
      }
    },
  };

  readonly attendees = {
    add: async (eventId: string, body: { contact_id: string; waiver_signed?: boolean }) => {
      const res = await fetch(`/api/events/${eventId}/attendees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error((err as { error?: string }).error ?? "Add attendee failed");
      }
      return res.json();
    },
    update: async (eventId: string, attendeeId: string, body: { waiver_signed?: boolean }) => {
      const res = await fetch(`/api/events/${eventId}/attendees/${attendeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error((err as { error?: string }).error ?? "Update attendee failed");
      }
      return res.json();
    },
    delete: async (eventId: string, attendeeId: string) => {
      const res = await fetch(`/api/events/${eventId}/attendees/${attendeeId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error((err as { error?: string }).error ?? "Delete attendee failed");
      }
    },
  };

  readonly scheduleItems = {
    create: async (eventId: string, body: { scheduled_time: string; label: string; location?: string }) => {
      const res = await fetch(`/api/events/${eventId}/schedule-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error((err as { error?: string }).error ?? "Create schedule item failed");
      }
      return res.json();
    },
    update: async (
      eventId: string,
      scheduleId: string,
      body: { scheduled_time?: string; label?: string; location?: string | null }
    ) => {
      const res = await fetch(`/api/events/${eventId}/schedule-items/${scheduleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error((err as { error?: string }).error ?? "Update schedule item failed");
      }
      return res.json();
    },
    delete: async (eventId: string, scheduleId: string) => {
      const res = await fetch(`/api/events/${eventId}/schedule-items/${scheduleId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error((err as { error?: string }).error ?? "Delete schedule item failed");
      }
    },
  };

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
