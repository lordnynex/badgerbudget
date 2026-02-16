import { treaty } from "@elysiajs/eden";
import type { App } from "@/backend/app";
import type {
  ContactSearchParams,
  ContactSearchResult,
} from "@/types/contact";

const client = treaty<App>(
  typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
  { parseDate: false }
);

function getErrorMessage(err: unknown, status: number): string {
  if (!err || typeof err !== "object") return `Request failed (${status})`;
  const e = err as { value?: unknown };
  const v = e.value;
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && "error" in v && typeof (v as { error: unknown }).error === "string") {
    return (v as { error: string }).error;
  }
  return `Request failed (${status})`;
}

async function unwrap<T>(promise: Promise<{ data?: T; error?: unknown; status: number }>): Promise<T> {
  const res = await promise;
  if (res.error) {
    throw new Error(getErrorMessage(res.error, res.status));
  }
  return res.data as T;
}

function buildSearchParams(params: Record<string, string | number | boolean | undefined | string[]>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      if (v.length) sp.set(k, v.join(","));
    } else {
      sp.set(k, String(v));
    }
  }
  return sp.toString();
}

export const api = {
  seed: () => unwrap(client.api.seed.post()),

  events: {
    list: () => unwrap(client.api.events.get()),
    get: (id: string) => unwrap(client.api.events({ id }).get()),
    create: (body: Parameters<typeof client.api.events.post>[0]) =>
      unwrap(client.api.events.post(body)),
    update: (id: string, body: Record<string, unknown>) =>
      unwrap(client.api.events({ id }).put(body)),
    delete: (id: string) => unwrap(client.api.events({ id }).delete()),
    milestones: {
      create: (eventId: string, body: { month: number; year: number; description: string; due_date?: string }) =>
        unwrap(client.api.events({ id: eventId }).milestones.post(body)),
      update: (eventId: string, mid: string, body: { month?: number; year?: number; description?: string; completed?: boolean; due_date?: string }) =>
        unwrap(client.api.events({ id: eventId }).milestones({ mid }).put(body)),
      delete: (eventId: string, mid: string) =>
        unwrap(client.api.events({ id: eventId }).milestones({ mid }).delete()),
      addMember: (eventId: string, mid: string, memberId: string) =>
        unwrap(client.api.events({ id: eventId }).milestones({ mid }).members.post({ member_id: memberId })),
      removeMember: (eventId: string, mid: string, memberId: string) =>
        unwrap(client.api.events({ id: eventId }).milestones({ mid }).members({ memberId }).delete()),
    },
    packingCategories: {
      create: (eventId: string, body: { name: string }) =>
        unwrap(client.api.events({ id: eventId }).packing_categories.post(body)),
      update: (eventId: string, cid: string, body: { name?: string }) =>
        unwrap(client.api.events({ id: eventId }).packing_categories({ cid }).put(body)),
      delete: (eventId: string, cid: string) =>
        unwrap(client.api.events({ id: eventId }).packing_categories({ cid }).delete()),
    },
    packingItems: {
      create: (eventId: string, body: { category_id: string; name: string; quantity?: number; note?: string }) =>
        unwrap(client.api.events({ id: eventId }).packing_items.post(body)),
      update: (eventId: string, pid: string, body: { category_id?: string; name?: string; quantity?: number; note?: string; loaded?: boolean }) =>
        unwrap(client.api.events({ id: eventId }).packing_items({ pid }).put(body)),
      delete: (eventId: string, pid: string) =>
        unwrap(client.api.events({ id: eventId }).packing_items({ pid }).delete()),
    },
    volunteers: {
      create: (eventId: string, body: { name: string; department: string }) =>
        unwrap(client.api.events({ id: eventId }).volunteers.post(body)),
      update: (eventId: string, vid: string, body: { name?: string; department?: string }) =>
        unwrap(client.api.events({ id: eventId }).volunteers({ vid }).put(body)),
      delete: (eventId: string, vid: string) =>
        unwrap(client.api.events({ id: eventId }).volunteers({ vid }).delete()),
    },
    assignments: {
      create: (eventId: string, body: { name: string; category: "planning" | "during" }) =>
        unwrap(client.api.events({ id: eventId }).assignments.post(body)),
      update: (eventId: string, aid: string, body: { name?: string; category?: "planning" | "during" }) =>
        unwrap(client.api.events({ id: eventId }).assignments({ aid }).put(body)),
      delete: (eventId: string, aid: string) =>
        unwrap(client.api.events({ id: eventId }).assignments({ aid }).delete()),
      addMember: (eventId: string, aid: string, memberId: string) =>
        unwrap(client.api.events({ id: eventId }).assignments({ aid }).members.post({ member_id: memberId })),
      removeMember: (eventId: string, aid: string, memberId: string) =>
        unwrap(client.api.events({ id: eventId }).assignments({ aid }).members({ memberId }).delete()),
    },
  },

  budgets: {
    list: () => unwrap(client.api.budgets.get()),
    get: (id: string) => unwrap(client.api.budgets({ id }).get()),
    create: (body: { name: string; year: number; description?: string }) =>
      unwrap(client.api.budgets.post(body)),
    update: (id: string, body: { name?: string; year?: number; description?: string }) =>
      unwrap(client.api.budgets({ id }).put(body)),
    delete: (id: string) => unwrap(client.api.budgets({ id }).delete()),
    addLineItem: (budgetId: string, body: { name: string; category: string; comments?: string; unitCost: number; quantity: number; historicalCosts?: Record<string, number> }) =>
      unwrap(client.api.budgets({ id: budgetId }).line_items.post(body)),
    updateLineItem: (budgetId: string, itemId: string, body: Record<string, unknown>) =>
      unwrap(client.api.budgets({ id: budgetId }).line_items({ itemId }).put(body)),
    deleteLineItem: (budgetId: string, itemId: string) =>
      unwrap(client.api.budgets({ id: budgetId }).line_items({ itemId }).delete()),
  },

  members: {
    list: () => unwrap(client.api.members.get()),
    get: (id: string) => unwrap(client.api.members({ id }).get()),
    create: (body: Record<string, unknown>) => unwrap(client.api.members.post(body)),
    update: (id: string, body: Record<string, unknown>) =>
      unwrap(client.api.members({ id }).put(body)),
    delete: (id: string) => unwrap(client.api.members({ id }).delete()),
  },

  scenarios: {
    list: () => unwrap(client.api.scenarios.get()),
    get: (id: string) => unwrap(client.api.scenarios({ id }).get()),
    create: (body: { name: string; description?: string; inputs?: Record<string, unknown> }) =>
      unwrap(client.api.scenarios.post(body)),
    update: (id: string, body: { name?: string; description?: string; inputs?: Record<string, unknown> }) =>
      unwrap(client.api.scenarios({ id }).put(body)),
    delete: (id: string) => unwrap(client.api.scenarios({ id }).delete()),
  },

  contacts: {
    list: async (params?: ContactSearchParams): Promise<ContactSearchResult> => {
      const qs = params ? "?" + buildSearchParams(params as Record<string, string | number | boolean | undefined | string[]>) : "";
      const res = await fetch(`/api/contacts${qs}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error((err as { error?: string }).error ?? "Request failed");
      }
      return res.json();
    },
    get: (id: string) => unwrap(client.api.contacts({ id }).get()),
    create: (body: Record<string, unknown>) => unwrap(client.api.contacts.post(body)),
    update: (id: string, body: Record<string, unknown>) =>
      unwrap(client.api.contacts({ id }).put(body)),
    delete: (id: string) => unwrap(client.api.contacts({ id }).delete()),
    restore: (id: string) => unwrap(client.api.contacts({ id }).restore.post()),
    bulkUpdate: (ids: string[], updates: { tags?: unknown[]; status?: string }) =>
      unwrap(client.api.contacts.bulk_update.post({ ids, ...updates })),
    merge: (sourceId: string, targetId: string, conflictResolution?: Record<string, "source" | "target">) =>
      unwrap(client.api.contacts.merge.post({ sourceId, targetId, conflictResolution })),
    importPstPreview: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/contacts/import-pst", { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error((err as { error?: string }).error ?? "PST import failed");
      }
      return res.json() as Promise<{ contacts: Array<{ payload: Record<string, unknown> & { display_name: string }; status: string; existingContact?: { id: string; display_name: string } }> }>;
    },
    importPstExecute: (toCreate: Array<Record<string, unknown> & { display_name: string }>) =>
      unwrap(client.api.contacts.import_pst_execute.post({ toCreate })),
    tags: {
      list: () => unwrap(client.api.contacts.tags.get()),
      create: (name: string) => unwrap(client.api.contacts.tags.post({ name })),
    },
  },

  mailingLists: {
    list: () => unwrap(client.api.mailing_lists.get()),
    get: (id: string) => unwrap(client.api.mailing_lists({ id }).get()),
    create: (body: Record<string, unknown>) => unwrap(client.api.mailing_lists.post(body)),
    update: (id: string, body: Record<string, unknown>) =>
      unwrap(client.api.mailing_lists({ id }).put(body)),
    delete: (id: string) => unwrap(client.api.mailing_lists({ id }).delete()),
    preview: (id: string) => unwrap(client.api.mailing_lists({ id }).preview.get()),
    getMembers: (id: string) => unwrap(client.api.mailing_lists({ id }).members.get()),
    addMember: (listId: string, contactId: string, source?: "manual" | "import" | "rule") =>
      unwrap(client.api.mailing_lists({ id: listId }).members.post({ contact_id: contactId, source: source ?? "manual" })),
    addMembersBulk: (listId: string, contactIds: string[], source?: "manual" | "import" | "rule") =>
      unwrap(client.api.mailing_lists({ id: listId }).members.post({ contact_ids: contactIds, source: source ?? "manual" })),
    removeMember: (listId: string, contactId: string) =>
      unwrap(client.api.mailing_lists({ id: listId }).members({ contactId }).delete()),
  },

  mailingBatches: {
    list: () => unwrap(client.api.mailing_batches.get()),
    get: (id: string) => unwrap(client.api.mailing_batches({ id }).get()),
    create: (listId: string, name: string) =>
      unwrap(client.api.mailing_batches.post({ list_id: listId, name })),
    updateRecipientStatus: (batchId: string, recipientId: string, status: string, reason?: string) =>
      unwrap(client.api.mailing_batches({ id: batchId }).recipients({ recipientId }).put({ status, reason })),
  },
};
