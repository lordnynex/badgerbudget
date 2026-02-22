import { t } from "elysia";
import { CommonParams } from "./common";

const assignmentCategory = t.Union([t.Literal("planning"), t.Literal("during")]);
const eventType = t.Union([
  t.Literal("badger"),
  t.Literal("anniversary"),
  t.Literal("pioneer_run"),
  t.Literal("rides"),
]);

export const EventsDto = {
  params: CommonParams.id,
  idMid: CommonParams.idMid,
  idCid: CommonParams.idCid,
  idPid: CommonParams.idPid,
  idAid: CommonParams.idAid,
  idVid: CommonParams.idVid,
  idPhotoId: CommonParams.idPhotoId,
  idAttendeeId: CommonParams.idAttendeeId,
  idMemberAttendeeId: CommonParams.idMemberAttendeeId,
  idAssetId: CommonParams.idAssetId,
  idScheduleId: CommonParams.idScheduleId,
  idMidMemberId: CommonParams.idMidMemberId,
  idAidMemberId: CommonParams.idAidMemberId,

  photoUploadBody: t.Object({ file: t.File() }),

  createBody: t.Object({
    name: t.String(),
    event_type: t.Optional(eventType),
    description: t.Optional(t.String()),
    start_location: t.Optional(t.String()),
    end_location: t.Optional(t.String()),
    facebook_event_url: t.Optional(t.String()),
    pre_ride_event_id: t.Optional(t.String()),
    ride_cost: t.Optional(t.Number()),
    year: t.Optional(t.Number()),
    event_date: t.Optional(t.String()),
    event_url: t.Optional(t.String()),
    event_location: t.Optional(t.String()),
    event_location_embed: t.Optional(t.String()),
    ga_ticket_cost: t.Optional(t.Number()),
    day_pass_cost: t.Optional(t.Number()),
    ga_tickets_sold: t.Optional(t.Number()),
    day_passes_sold: t.Optional(t.Number()),
    budget_id: t.Optional(t.String()),
    scenario_id: t.Optional(t.String()),
    planning_notes: t.Optional(t.String()),
  }),

  updateBody: t.Object({
    name: t.Optional(t.String()),
    event_type: t.Optional(t.Union([eventType, t.Null()])),
    description: t.Optional(t.Union([t.String(), t.Null()])),
    start_location: t.Optional(t.Union([t.String(), t.Null()])),
    end_location: t.Optional(t.Union([t.String(), t.Null()])),
    facebook_event_url: t.Optional(t.Union([t.String(), t.Null()])),
    pre_ride_event_id: t.Optional(t.Union([t.String(), t.Null()])),
    ride_cost: t.Optional(t.Union([t.Number(), t.Null()])),
    year: t.Optional(t.Union([t.Number(), t.Null()])),
    event_date: t.Optional(t.Union([t.String(), t.Null()])),
    event_url: t.Optional(t.Union([t.String(), t.Null()])),
    event_location: t.Optional(t.Union([t.String(), t.Null()])),
    event_location_embed: t.Optional(t.Union([t.String(), t.Null()])),
    ga_ticket_cost: t.Optional(t.Union([t.Number(), t.Null()])),
    day_pass_cost: t.Optional(t.Union([t.Number(), t.Null()])),
    ga_tickets_sold: t.Optional(t.Union([t.Number(), t.Null()])),
    day_passes_sold: t.Optional(t.Union([t.Number(), t.Null()])),
    budget_id: t.Optional(t.Union([t.String(), t.Null()])),
    scenario_id: t.Optional(t.Union([t.String(), t.Null()])),
    planning_notes: t.Optional(t.Union([t.String(), t.Null()])),
    show_on_website: t.Optional(t.Boolean()),
  }),

  createMilestoneBody: t.Object({
    month: t.Number(),
    year: t.Number(),
    description: t.String(),
    due_date: t.Optional(t.String()),
  }),

  updateMilestoneBody: t.Object({
    month: t.Optional(t.Number()),
    year: t.Optional(t.Number()),
    description: t.Optional(t.String()),
    completed: t.Optional(t.Boolean()),
    due_date: t.Optional(t.String()),
  }),

  addMilestoneMemberBody: t.Object({ member_id: t.String() }),

  createPackingCategoryBody: t.Object({ name: t.String() }),

  updatePackingCategoryBody: t.Object({ name: t.Optional(t.String()) }),

  createPackingItemBody: t.Object({
    category_id: t.String(),
    name: t.String(),
    quantity: t.Optional(t.Number()),
    note: t.Optional(t.String()),
  }),

  updatePackingItemBody: t.Object({
    category_id: t.Optional(t.String()),
    name: t.Optional(t.String()),
    quantity: t.Optional(t.Union([t.Number(), t.Null()])),
    note: t.Optional(t.Union([t.String(), t.Null()])),
    loaded: t.Optional(t.Boolean()),
  }),

  createAssignmentBody: t.Object({
    name: t.String(),
    category: assignmentCategory,
  }),

  updateAssignmentBody: t.Object({
    name: t.Optional(t.String()),
    category: t.Optional(assignmentCategory),
  }),

  addAssignmentMemberBody: t.Object({ member_id: t.String() }),

  createVolunteerBody: t.Object({
    name: t.String(),
    department: t.String(),
  }),

  updateVolunteerBody: t.Object({
    name: t.Optional(t.String()),
    department: t.Optional(t.String()),
  }),

  addAttendeeBody: t.Object({ contact_id: t.String(), waiver_signed: t.Optional(t.Boolean()) }),
  addMemberAttendeeBody: t.Object({ member_id: t.String(), waiver_signed: t.Optional(t.Boolean()) }),
  updateAttendeeBody: t.Object({ waiver_signed: t.Optional(t.Boolean()) }),

  createScheduleItemBody: t.Object({
    scheduled_time: t.String(),
    label: t.String(),
    location: t.Optional(t.String()),
  }),
  updateScheduleItemBody: t.Object({
    scheduled_time: t.Optional(t.String()),
    label: t.Optional(t.String()),
    location: t.Optional(t.Union([t.String(), t.Null()])),
  }),
};
