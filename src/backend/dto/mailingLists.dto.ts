import { t } from "elysia";
import { CommonParams } from "./common";

const listType = t.Union([t.Literal("static"), t.Literal("dynamic"), t.Literal("hybrid")]);
const memberSource = t.Union([t.Literal("manual"), t.Literal("import"), t.Literal("rule")]);

const criteriaSchema = t.Object({
  tagIn: t.Optional(t.Array(t.String())),
  tagNotIn: t.Optional(t.Array(t.String())),
  active: t.Optional(t.Boolean()),
  okToMail: t.Optional(t.Boolean()),
  okToEmail: t.Optional(t.Boolean()),
  hasPostalAddress: t.Optional(t.Boolean()),
  hasEmail: t.Optional(t.Boolean()),
  organization: t.Optional(t.String()),
  clubName: t.Optional(t.String()),
});

export const MailingListsDto = {
  params: CommonParams.id,
  contactParams: CommonParams.idContactId,

  createBody: t.Object({
    name: t.String(),
    description: t.Optional(t.String()),
    list_type: t.Optional(listType),
    event_id: t.Optional(t.Union([t.String(), t.Null()])),
    template: t.Optional(t.Union([t.String(), t.Null()])),
    criteria: t.Optional(t.Union([criteriaSchema, t.Null()])),
  }),

  updateBody: t.Object({
    name: t.Optional(t.String()),
    description: t.Optional(t.Union([t.String(), t.Null()])),
    list_type: t.Optional(listType),
    event_id: t.Optional(t.Union([t.String(), t.Null()])),
    template: t.Optional(t.Union([t.String(), t.Null()])),
    criteria: t.Optional(t.Union([criteriaSchema, t.Null()])),
  }),

  addMemberBody: t.Object({
    contact_id: t.Optional(t.String()),
    contact_ids: t.Optional(t.Array(t.String())),
    source: t.Optional(memberSource),
  }),
};
