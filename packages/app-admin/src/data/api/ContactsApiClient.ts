import { client, unwrap, buildSearchParams } from "./client";
import type {
  Contact,
  ContactSearchParams,
  ContactSearchResult,
  ContactPhoto,
} from "@/types/contact";

export class ContactsApiClient {
  async list(params?: ContactSearchParams): Promise<ContactSearchResult> {
    const qs = params
      ? "?" +
        buildSearchParams(
          params as Record<
            string,
            string | number | boolean | undefined | string[]
          >,
        )
      : "";
    const res = await fetch(`/api/contacts${qs}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error((err as { error?: string }).error ?? "Request failed");
    }
    return res.json();
  }

  get(id: string) {
    return unwrap(client.api.contacts({ id }).get());
  }

  create(body: Partial<Contact> & { display_name: string }) {
    return unwrap(client.api.contacts.post(body));
  }

  update(id: string, body: Record<string, unknown>) {
    return unwrap(client.api.contacts({ id }).put(body));
  }

  delete(id: string) {
    return unwrap(client.api.contacts({ id }).delete());
  }

  restore(id: string) {
    return unwrap(client.api.contacts({ id }).restore.post());
  }

  bulkUpdate(
    ids: string[],
    updates: {
      tags?: (string | { id: string; name: string })[];
      status?: "active" | "inactive";
    },
  ) {
    return unwrap(client.api.contacts["bulk-update"].post({ ids, ...updates }));
  }

  merge(
    sourceId: string,
    targetId: string,
    conflictResolution?: Record<string, "source" | "target">,
  ) {
    return unwrap(
      client.api.contacts.merge.post({
        sourceId,
        targetId,
        conflictResolution,
      }),
    );
  }

  async importPstPreview(file: File) {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/contacts/import-pst", {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(
        (err as { error?: string }).error ?? "PST import failed",
      );
    }
    return res.json() as Promise<{
      contacts: Array<{
        payload: Record<string, unknown> & { display_name: string };
        status: string;
        existingContact?: { id: string; display_name: string };
      }>;
    }>;
  }

  importPstExecute(
    toCreate: Array<Record<string, unknown> & { display_name: string }>,
  ) {
    return unwrap(client.api.contacts["import-pst-execute"].post({ toCreate }));
  }

  readonly tags = {
    list: () => unwrap(client.api.contacts.tags.get()),
    create: (name: string) =>
      unwrap(client.api.contacts.tags.post({ name })),
  };

  readonly photos = {
    add: async (
      contactId: string,
      file: File,
      options?: { type?: "profile" | "contact"; set_as_profile?: boolean }
    ): Promise<ContactPhoto> => {
      const form = new FormData();
      form.append("file", file);
      if (options?.type) form.append("type", options.type);
      if (options?.set_as_profile !== undefined)
        form.append("set_as_profile", String(options.set_as_profile));
      const res = await fetch(`/api/contacts/${contactId}/photos`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error((err as { error?: string }).error ?? "Upload failed");
      }
      return res.json();
    },
    delete: async (contactId: string, photoId: string): Promise<void> => {
      const res = await fetch(`/api/contacts/${contactId}/photos/${photoId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error((err as { error?: string }).error ?? "Delete failed");
      }
    },
    setProfile: async (contactId: string, photoId: string): Promise<void> => {
      const res = await fetch(
        `/api/contacts/${contactId}/photos/${photoId}/set-profile`,
        { method: "POST" }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error((err as { error?: string }).error ?? "Set profile failed");
      }
    },
  };

  readonly notes = {
    create: async (contactId: string, content: string) => {
      const res = await fetch(`/api/contacts/${contactId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error((err as { error?: string }).error ?? "Request failed");
      }
      return res.json();
    },
    update: async (contactId: string, noteId: string, content: string) => {
      const res = await fetch(`/api/contacts/${contactId}/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error((err as { error?: string }).error ?? "Request failed");
      }
      return res.json();
    },
    delete: async (contactId: string, noteId: string) => {
      const res = await fetch(`/api/contacts/${contactId}/notes/${noteId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error((err as { error?: string }).error ?? "Request failed");
      }
      return res.json();
    },
  };
}
