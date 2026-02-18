import { t } from "elysia";
import { CommonParams } from "./common";

const motionResult = t.Union([t.Literal("pass"), t.Literal("fail")]);
const actionItemStatus = t.Union([t.Literal("open"), t.Literal("completed")]);
const oldBusinessStatus = t.Union([t.Literal("open"), t.Literal("closed")]);
const templateType = t.Union([t.Literal("agenda"), t.Literal("minutes")]);

export const MeetingsDto = {
  params: CommonParams.id,
  idMid: CommonParams.idMid,
  idAid: CommonParams.idAid,
  idOid: CommonParams.idOid,

  listMotionsQuery: t.Object({
    page: t.Optional(t.Numeric()),
    per_page: t.Optional(t.Numeric()),
  }),

  deleteQuery: t.Object({
    delete_agenda: t.Optional(t.Boolean()),
    delete_minutes: t.Optional(t.Boolean()),
  }),

  createBody: t.Object({
    date: t.String(),
    meeting_number: t.Number(),
    location: t.Optional(t.Union([t.String(), t.Null()])),
    previous_meeting_id: t.Optional(t.Union([t.String(), t.Null()])),
    agenda_content: t.Optional(t.String()),
    minutes_content: t.Optional(t.Union([t.String(), t.Null()])),
    agenda_template_id: t.Optional(t.String()),
  }),

  updateBody: t.Object({
    date: t.Optional(t.Union([t.String(), t.Null()])),
    meeting_number: t.Optional(t.Union([t.Number(), t.Null()])),
    location: t.Optional(t.Union([t.String(), t.Null()])),
    previous_meeting_id: t.Optional(t.Union([t.String(), t.Null()])),
  }),

  createMotionBody: t.Object({
    description: t.Optional(t.Union([t.String(), t.Null()])),
    result: motionResult,
    order_index: t.Optional(t.Number()),
    mover_member_id: t.String(),
    seconder_member_id: t.String(),
  }),

  updateMotionBody: t.Object({
    description: t.Optional(t.Union([t.String(), t.Null()])),
    result: t.Optional(motionResult),
    order_index: t.Optional(t.Number()),
    mover_member_id: t.Optional(t.Union([t.String(), t.Null()])),
    seconder_member_id: t.Optional(t.Union([t.String(), t.Null()])),
  }),

  createActionItemBody: t.Object({
    description: t.String(),
    assignee_member_id: t.Optional(t.Union([t.String(), t.Null()])),
    due_date: t.Optional(t.Union([t.String(), t.Null()])),
    order_index: t.Optional(t.Number()),
  }),

  updateActionItemBody: t.Object({
    description: t.Optional(t.String()),
    assignee_member_id: t.Optional(t.Union([t.String(), t.Null()])),
    due_date: t.Optional(t.Union([t.String(), t.Null()])),
    status: t.Optional(actionItemStatus),
    order_index: t.Optional(t.Number()),
  }),

  createOldBusinessBody: t.Object({
    description: t.String(),
    order_index: t.Optional(t.Number()),
  }),

  updateOldBusinessBody: t.Object({
    description: t.Optional(t.String()),
    status: t.Optional(oldBusinessStatus),
    closed_in_meeting_id: t.Optional(t.Union([t.String(), t.Null()])),
    order_index: t.Optional(t.Number()),
  }),
};

export const MeetingTemplatesDto = {
  params: CommonParams.id,

  createBody: t.Object({
    name: t.String(),
    type: templateType,
    content: t.String(),
  }),

  updateBody: t.Object({
    name: t.Optional(t.String()),
    type: t.Optional(templateType),
  }),
};
