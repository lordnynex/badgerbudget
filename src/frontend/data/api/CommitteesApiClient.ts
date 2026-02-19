import { client, unwrap } from "./client";
import type {
  CommitteeDetail,
  CommitteeSummary,
  CommitteeMeetingSummary,
  CommitteeMeetingDetail,
} from "@/shared/types/committee";

export class CommitteesApiClient {
  list(options?: { sort?: "formed_date" | "name" }) {
    return unwrap(
      client.api.committees.get(
        options?.sort ? { query: { sort: options.sort } } : undefined
      )
    ) as Promise<CommitteeSummary[]>;
  }

  get(id: string) {
    return unwrap(client.api.committees({ id }).get()) as Promise<CommitteeDetail | null>;
  }

  create(body: {
    name: string;
    description?: string | null;
    purpose?: string | null;
    formed_date: string;
    chairperson_member_id?: string | null;
    member_ids?: string[];
  }) {
    return unwrap(client.api.committees.post(body)) as Promise<CommitteeDetail>;
  }

  update(id: string, body: Record<string, unknown>) {
    return unwrap(client.api.committees({ id }).put(body)) as Promise<CommitteeDetail>;
  }

  delete(id: string) {
    return unwrap(client.api.committees({ id }).delete()) as Promise<{ ok: boolean }>;
  }

  addMember(committeeId: string, memberId: string) {
    return unwrap(
      client.api.committees({ id: committeeId }).members.post({ member_id: memberId })
    ) as Promise<CommitteeDetail>;
  }

  removeMember(committeeId: string, memberId: string) {
    return unwrap(
      client.api.committees({ id: committeeId }).members({ memberId }).delete()
    ) as Promise<CommitteeDetail>;
  }

  updateMemberOrder(committeeId: string, memberIds: string[]) {
    return unwrap(
      client.api.committees({ id: committeeId }).members.order.put({
        member_ids: memberIds,
      })
    ) as Promise<CommitteeDetail>;
  }

  listMeetings(committeeId: string) {
    return unwrap(
      client.api.committees({ id: committeeId }).meetings.get()
    ) as Promise<CommitteeMeetingSummary[] | null>;
  }

  createMeeting(
    committeeId: string,
    body: {
      date: string;
      meeting_number: number;
      location?: string | null;
      previous_meeting_id?: string | null;
      agenda_content?: string;
      minutes_content?: string | null;
      agenda_template_id?: string;
    }
  ) {
    return unwrap(
      client.api.committees({ id: committeeId }).meetings.post(body)
    ) as Promise<CommitteeMeetingSummary>;
  }

  getMeeting(committeeId: string, meetingId: string) {
    return unwrap(
      client.api.committees({ id: committeeId }).meetings({ meetingId }).get()
    ) as Promise<CommitteeMeetingDetail | null>;
  }

  updateMeeting(
    committeeId: string,
    meetingId: string,
    body: Record<string, unknown>
  ) {
    return unwrap(
      client.api.committees({ id: committeeId }).meetings({ meetingId }).put(body)
    ) as Promise<CommitteeMeetingDetail>;
  }

  deleteMeeting(committeeId: string, meetingId: string) {
    return unwrap(
      client.api.committees({ id: committeeId }).meetings({ meetingId }).delete()
    ) as Promise<{ ok: boolean }>;
  }
}
