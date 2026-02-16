import { client, unwrap, buildSearchParams } from "./client";
import type { ContactSearchParams, ContactSearchResult } from "@/types/contact";

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

  create(body: Record<string, unknown>) {
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
    updates: { tags?: unknown[]; status?: string },
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
}
