import { t } from "elysia";
import { CommonParams } from "./common";

const recipientStatus = t.Union([
  t.Literal("queued"),
  t.Literal("printed"),
  t.Literal("mailed"),
  t.Literal("returned"),
  t.Literal("invalid"),
]);

export const MailingBatchesDto = {
  params: CommonParams.id,
  recipientParams: CommonParams.idRecipientId,

  createBody: t.Object({
    list_id: t.String(),
    name: t.String(),
  }),

  updateRecipientBody: t.Object({
    status: recipientStatus,
    reason: t.Optional(t.String()),
  }),
};
