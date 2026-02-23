import type { TrpcClient } from "./trpcClientContext";
import type {
  MeetingDetail,
  MeetingSummary,
  MotionsListResponse,
  OldBusinessItemWithMeeting,
} from "@/shared/types/meeting";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? "Request failed");
  }
  return res.json();
}

export class MeetingsApiClient {
  constructor(private client: TrpcClient) {}

  listOldBusiness(): Promise<OldBusinessItemWithMeeting[]> {
    return this.client.admin.meetings.listOldBusiness.query();
  }

  listMotions(params: {
    page: number;
    per_page: number;
    q?: string;
  }): Promise<MotionsListResponse> {
    return this.client.admin.meetings.listMotions.query(params);
  }

  list(options?: { sort?: "date" | "meeting_number" }) {
    return this.client.admin.meetings.list.query(
      options?.sort ? { sort: options.sort } : undefined
    ) as Promise<MeetingSummary[]>;
  }

  get(id: string): Promise<MeetingDetail | null> {
    return this.client.admin.meetings.get
      .query({ id })
      .catch(() => null) as Promise<MeetingDetail | null>;
  }

  create(body: {
    date: string;
    meeting_number: number;
    location?: string | null;
    previous_meeting_id?: string | null;
    agenda_content?: string;
    minutes_content?: string | null;
    agenda_template_id?: string;
  }) {
    return this.client.admin.meetings.create.mutate(body as never);
  }

  update(id: string, body: Record<string, unknown>) {
    return this.client.admin.meetings.update.mutate({ id, ...body } as never);
  }

  delete(
    id: string,
    options?: { delete_agenda?: boolean; delete_minutes?: boolean }
  ) {
    return this.client.admin.meetings.delete.mutate({
      id,
      delete_agenda: options?.delete_agenda,
      delete_minutes: options?.delete_minutes,
    });
  }

  readonly motions = {
    create: (
      meetingId: string,
      body: {
        description?: string | null;
        result: "pass" | "fail";
        order_index?: number;
        mover_member_id: string;
        seconder_member_id: string;
      }
    ) =>
      fetchJson<unknown>(`/api/meetings/${meetingId}/motions`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (
      meetingId: string,
      mid: string,
      body: Record<string, unknown>
    ) =>
      fetchJson<unknown>(`/api/meetings/${meetingId}/motions/${mid}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    delete: (meetingId: string, mid: string) =>
      fetch(`/api/meetings/${meetingId}/motions/${mid}`, {
        method: "DELETE",
      }).then((res) => {
        if (!res.ok) throw new Error("Delete failed");
      }),
  };

  readonly actionItems = {
    create: (
      meetingId: string,
      body: {
        description: string;
        assignee_member_id?: string | null;
        due_date?: string | null;
        order_index?: number;
      }
    ) =>
      fetchJson<unknown>(`/api/meetings/${meetingId}/action-items`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (
      meetingId: string,
      aid: string,
      body: Record<string, unknown>
    ) =>
      fetchJson<unknown>(`/api/meetings/${meetingId}/action-items/${aid}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    delete: (meetingId: string, aid: string) =>
      fetch(`/api/meetings/${meetingId}/action-items/${aid}`, {
        method: "DELETE",
      }).then((res) => {
        if (!res.ok) throw new Error("Delete failed");
      }),
  };

  readonly oldBusiness = {
    create: (
      meetingId: string,
      body: { description: string; order_index?: number }
    ) =>
      fetchJson<unknown>(`/api/meetings/${meetingId}/old-business`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (
      meetingId: string,
      oid: string,
      body: Record<string, unknown>
    ) =>
      fetchJson<unknown>(`/api/meetings/${meetingId}/old-business/${oid}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    delete: (meetingId: string, oid: string) =>
      fetch(`/api/meetings/${meetingId}/old-business/${oid}`, {
        method: "DELETE",
      }).then((res) => {
        if (!res.ok) throw new Error("Delete failed");
      }),
  };
}
