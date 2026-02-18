import { client, unwrap } from "./client";
import type { MeetingDetail, MeetingSummary, OldBusinessItemWithMeeting } from "@/shared/types/meeting";

export class MeetingsApiClient {
  listOldBusiness() {
    return unwrap(client.api.meetings["old-business"].get()) as Promise<OldBusinessItemWithMeeting[]>;
  }

  list(options?: { sort?: "date" | "meeting_number" }) {
    return unwrap(
      client.api.meetings.get(
        options?.sort ? { query: { sort: options.sort } } : undefined
      )
    ) as Promise<MeetingSummary[]>;
  }

  get(id: string) {
    return unwrap(client.api.meetings({ id }).get()) as Promise<MeetingDetail | null>;
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
    return unwrap(client.api.meetings.post(body)) as Promise<MeetingSummary>;
  }

  update(id: string, body: Record<string, unknown>) {
    return unwrap(client.api.meetings({ id }).put(body)) as Promise<MeetingSummary>;
  }

  delete(
    id: string,
    options?: { delete_agenda?: boolean; delete_minutes?: boolean }
  ) {
    const query =
      options &&
      (options.delete_agenda !== undefined || options.delete_minutes !== undefined)
        ? {
            delete_agenda: options.delete_agenda,
            delete_minutes: options.delete_minutes,
          }
        : undefined;
    return unwrap(
      client.api.meetings({ id }).delete(query ? { query } : undefined)
    ) as Promise<{ ok: boolean }>;
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
    ) => unwrap(client.api.meetings({ id: meetingId }).motions.post(body)),
    update: (meetingId: string, mid: string, body: Record<string, unknown>) =>
      unwrap(client.api.meetings({ id: meetingId }).motions({ mid }).put(body)),
    delete: (meetingId: string, mid: string) =>
      unwrap(client.api.meetings({ id: meetingId }).motions({ mid }).delete()),
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
      unwrap(client.api.meetings({ id: meetingId })["action-items"].post(body)),
    update: (meetingId: string, aid: string, body: Record<string, unknown>) =>
      unwrap(client.api.meetings({ id: meetingId })["action-items"]({ aid }).put(body)),
    delete: (meetingId: string, aid: string) =>
      unwrap(client.api.meetings({ id: meetingId })["action-items"]({ aid }).delete()),
  };

  readonly oldBusiness = {
    create: (meetingId: string, body: { description: string; order_index?: number }) =>
      unwrap(client.api.meetings({ id: meetingId })["old-business"].post(body)),
    update: (meetingId: string, oid: string, body: Record<string, unknown>) =>
      unwrap(client.api.meetings({ id: meetingId })["old-business"]({ oid }).put(body)),
    delete: (meetingId: string, oid: string) =>
      unwrap(client.api.meetings({ id: meetingId })["old-business"]({ oid }).delete()),
  };
}
