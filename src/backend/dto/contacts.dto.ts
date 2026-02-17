import { t } from "elysia";
import { CommonParams } from "./common";

const contactStatusFilter = t.Union([
  t.Literal("active"),
  t.Literal("inactive"),
  t.Literal("deleted"),
  t.Literal("all"),
]);
const contactStatus = t.Union([
  t.Literal("active"),
  t.Literal("inactive"),
  t.Literal("deleted"),
]);
const consentStatus = t.Union([t.Literal("yes"), t.Literal("no"), t.Literal("unknown")]);
const contactType = t.Union([t.Literal("person"), t.Literal("organization")]);
const conflictResolution = t.Union([t.Literal("source"), t.Literal("target")]);

const tagSchema = t.Union([
  t.String(),
  t.Object({
    id: t.String(),
    name: t.String(),
  }),
]);

const contactCreateItem = t.Object({
  display_name: t.String(),
  type: t.Optional(contactType),
  status: t.Optional(contactStatus),
  first_name: t.Optional(t.Union([t.String(), t.Null()])),
  last_name: t.Optional(t.Union([t.String(), t.Null()])),
  organization_name: t.Optional(t.Union([t.String(), t.Null()])),
  notes: t.Optional(t.Union([t.String(), t.Null()])),
  how_we_know_them: t.Optional(t.Union([t.String(), t.Null()])),
  ok_to_email: t.Optional(consentStatus),
  ok_to_mail: t.Optional(consentStatus),
  do_not_contact: t.Optional(t.Boolean()),
  club_name: t.Optional(t.Union([t.String(), t.Null()])),
  role: t.Optional(t.Union([t.String(), t.Null()])),
  uid: t.Optional(t.Union([t.String(), t.Null()])),
  emails: t.Optional(t.Array(t.Object({}))),
  phones: t.Optional(t.Array(t.Object({}))),
  addresses: t.Optional(t.Array(t.Object({}))),
  tags: t.Optional(t.Array(tagSchema)),
}, { additionalProperties: true });

export const ContactsDto = {
  params: CommonParams.id,

  listQuery: t.Object({
    q: t.Optional(t.String()),
    status: t.Optional(contactStatusFilter),
    hasPostalAddress: t.Optional(t.String()),
    hasEmail: t.Optional(t.String()),
    tagIds: t.Optional(t.String()),
    organization: t.Optional(t.String()),
    role: t.Optional(t.String()),
    sort: t.Optional(t.Union([t.Literal("updated_at"), t.Literal("name"), t.Literal("last_contacted")])),
    sortDir: t.Optional(t.Union([t.Literal("asc"), t.Literal("desc")])),
    page: t.Optional(t.String()),
    limit: t.Optional(t.String()),
  }),

  createBody: contactCreateItem,

  importPstBody: t.Object({ file: t.File() }),

  importPstExecuteBody: t.Object({
    toCreate: t.Array(contactCreateItem),
  }),

  bulkUpdateBody: t.Object({
    ids: t.Array(t.String()),
    tags: t.Optional(t.Array(tagSchema)),
    status: t.Optional(t.Union([t.Literal("active"), t.Literal("inactive")])),
  }),

  mergeBody: t.Object({
    sourceId: t.String(),
    targetId: t.String(),
    conflictResolution: t.Optional(t.Object({}, { additionalProperties: conflictResolution })),
  }),

  tagCreateBody: t.Object({ name: t.String() }),

  noteCreateBody: t.Object({ content: t.String() }),
  noteUpdateBody: t.Object({ content: t.String() }),
  noteParams: t.Object({ id: t.String(), noteId: t.String() }),

  updateBody: t.Object({
    type: t.Optional(contactType),
    status: t.Optional(contactStatus),
    display_name: t.Optional(t.String()),
    first_name: t.Optional(t.Union([t.String(), t.Null()])),
    last_name: t.Optional(t.Union([t.String(), t.Null()])),
    organization_name: t.Optional(t.Union([t.String(), t.Null()])),
    notes: t.Optional(t.Union([t.String(), t.Null()])),
    how_we_know_them: t.Optional(t.Union([t.String(), t.Null()])),
    ok_to_email: t.Optional(consentStatus),
    ok_to_mail: t.Optional(consentStatus),
    do_not_contact: t.Optional(t.Boolean()),
    club_name: t.Optional(t.Union([t.String(), t.Null()])),
    role: t.Optional(t.Union([t.String(), t.Null()])),
    uid: t.Optional(t.Union([t.String(), t.Null()])),
    emails: t.Optional(t.Array(t.Object({}))),
    phones: t.Optional(t.Array(t.Object({}))),
    addresses: t.Optional(t.Array(t.Object({}))),
    tags: t.Optional(t.Array(tagSchema)),
  }, { additionalProperties: true }),
};
