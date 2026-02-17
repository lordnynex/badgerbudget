import { t } from "elysia";
import { CommonParams } from "./common";

const assignmentCategory = t.Union([t.Literal("planning"), t.Literal("during")]);

export const EventsDto = {
  params: CommonParams.id,
  idMid: CommonParams.idMid,
  idCid: CommonParams.idCid,
  idPid: CommonParams.idPid,
  idAid: CommonParams.idAid,
  idVid: CommonParams.idVid,
  idMidMemberId: CommonParams.idMidMemberId,
  idAidMemberId: CommonParams.idAidMemberId,

  createBody: t.Object({
    name: t.String(),
    description: t.Optional(t.String()),
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
    description: t.Optional(t.Union([t.String(), t.Null()])),
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
};
