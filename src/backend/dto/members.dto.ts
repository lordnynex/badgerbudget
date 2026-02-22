import { t } from "elysia";
import { CommonParams } from "./common";

export const MembersDto = {
  params: CommonParams.id,

  createBody: t.Object({
    name: t.String(),
    phone_number: t.Optional(t.String()),
    email: t.Optional(t.String()),
    address: t.Optional(t.String()),
    birthday: t.Optional(t.String()),
    member_since: t.Optional(t.String()),
    is_baby: t.Optional(t.Boolean()),
    position: t.Optional(t.String()),
    emergency_contact_name: t.Optional(t.String()),
    emergency_contact_phone: t.Optional(t.String()),
    photo: t.Optional(t.String()),
  }),

  updateBody: t.Object({
    name: t.Optional(t.String()),
    phone_number: t.Optional(t.Union([t.String(), t.Null()])),
    email: t.Optional(t.Union([t.String(), t.Null()])),
    address: t.Optional(t.Union([t.String(), t.Null()])),
    birthday: t.Optional(t.Union([t.String(), t.Null()])),
    member_since: t.Optional(t.Union([t.String(), t.Null()])),
    is_baby: t.Optional(t.Boolean()),
    position: t.Optional(t.Union([t.String(), t.Null()])),
    emergency_contact_name: t.Optional(t.Union([t.String(), t.Null()])),
    emergency_contact_phone: t.Optional(t.Union([t.String(), t.Null()])),
    photo: t.Optional(t.Union([t.String(), t.Null()])),
    show_on_website: t.Optional(t.Boolean()),
  }),
};
