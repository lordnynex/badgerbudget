import { t } from "elysia";
import { CommonParams } from "./common";

const committeeStatus = t.Union([t.Literal("active"), t.Literal("closed")]);

export const CommitteesDto = {
  params: CommonParams.id,
  idMemberId: CommonParams.idMemberId,
  idMeetingId: CommonParams.idMeetingId,

  createBody: t.Object({
    name: t.String(),
    description: t.Optional(t.Union([t.String(), t.Null()])),
    purpose: t.Optional(t.Union([t.String(), t.Null()])),
    formed_date: t.String(),
    chairperson_member_id: t.Optional(t.Union([t.String(), t.Null()])),
    member_ids: t.Optional(t.Array(t.String())),
  }),

  updateBody: t.Object({
    name: t.Optional(t.String()),
    description: t.Optional(t.Union([t.String(), t.Null()])),
    purpose: t.Optional(t.Union([t.String(), t.Null()])),
    formed_date: t.Optional(t.String()),
    closed_date: t.Optional(t.Union([t.String(), t.Null()])),
    chairperson_member_id: t.Optional(t.Union([t.String(), t.Null()])),
    status: t.Optional(committeeStatus),
  }),

  addMemberBody: t.Object({
    member_id: t.String(),
  }),

  membersOrderBody: t.Object({
    member_ids: t.Array(t.String()),
  }),

  createMeetingBody: t.Object({
    date: t.String(),
    meeting_number: t.Number(),
    location: t.Optional(t.Union([t.String(), t.Null()])),
    start_time: t.Optional(t.Union([t.String(), t.Null()])),
    end_time: t.Optional(t.Union([t.String(), t.Null()])),
    video_conference_url: t.Optional(t.Union([t.String(), t.Null()])),
    previous_meeting_id: t.Optional(t.Union([t.String(), t.Null()])),
    agenda_content: t.Optional(t.String()),
    minutes_content: t.Optional(t.Union([t.String(), t.Null()])),
    agenda_template_id: t.Optional(t.String()),
  }),

  updateMeetingBody: t.Object({
    date: t.Optional(t.Union([t.String(), t.Null()])),
    meeting_number: t.Optional(t.Union([t.Number(), t.Null()])),
    location: t.Optional(t.Union([t.String(), t.Null()])),
    start_time: t.Optional(t.Union([t.String(), t.Null()])),
    end_time: t.Optional(t.Union([t.String(), t.Null()])),
    video_conference_url: t.Optional(t.Union([t.String(), t.Null()])),
    previous_meeting_id: t.Optional(t.Union([t.String(), t.Null()])),
  }),
};
