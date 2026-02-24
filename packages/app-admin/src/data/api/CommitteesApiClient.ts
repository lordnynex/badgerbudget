import type { TrpcClient } from "./trpcClientContext";
import type {
  CommitteeDetail,
  CommitteeSummary,
  CommitteeMeetingSummary,
  CommitteeMeetingDetail,
} from "@satyrsmc/shared/types/committee";

export class CommitteesApiClient {
  constructor(private client: TrpcClient) {}

  list(options?: { sort?: "formed_date" | "name" }) {
    return this.client.admin.committees.list.query(
      options?.sort ? { sort: options.sort } : undefined
    ) as Promise<CommitteeSummary[]>;
  }

  get(id: string): Promise<CommitteeDetail | null> {
    return this.client.admin.committees.get
      .query({ id })
      .catch(() => null) as Promise<CommitteeDetail | null>;
  }

  create(body: {
    name: string;
    description?: string | null;
    purpose?: string | null;
    formed_date: string;
    chairperson_member_id?: string | null;
    member_ids?: string[];
  }) {
    return this.client.admin.committees.create.mutate(body as never);
  }

  update(id: string, body: Record<string, unknown>) {
    return this.client.admin.committees.update.mutate({ id, ...body } as never);
  }

  delete(id: string) {
    return this.client.admin.committees.delete.mutate({ id });
  }

  addMember(committeeId: string, memberId: string) {
    return this.client.admin.committees.addMember.mutate({
      committeeId,
      memberId,
    });
  }

  removeMember(committeeId: string, memberId: string) {
    return this.client.admin.committees.removeMember.mutate({
      committeeId,
      memberId,
    });
  }

  reorderMembers(committeeId: string, memberIds: string[]) {
    return this.client.admin.committees.reorderMembers.mutate({
      committeeId,
      memberIds,
    });
  }

  listMeetings(committeeId: string): Promise<CommitteeMeetingSummary[]> {
    return this.client.admin.committees.listMeetings.query({
      committeeId,
    }) as Promise<CommitteeMeetingSummary[]>;
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
    return this.client.admin.committees.createMeeting.mutate({
      committeeId,
      ...body,
    } as never);
  }

  getMeeting(
    committeeId: string,
    meetingId: string
  ): Promise<CommitteeMeetingDetail | null> {
    return this.client.admin.committees.getMeeting
      .query({ committeeId, meetingId })
      .catch(() => null) as Promise<CommitteeMeetingDetail | null>;
  }

  updateMeeting(
    committeeId: string,
    meetingId: string,
    body: Record<string, unknown>
  ) {
    return this.client.admin.committees.updateMeeting.mutate({
      committeeId,
      meetingId,
      ...body,
    } as never);
  }

  deleteMeeting(committeeId: string, meetingId: string) {
    return this.client.admin.committees.deleteMeeting.mutate({
      committeeId,
      meetingId,
    });
  }
}
