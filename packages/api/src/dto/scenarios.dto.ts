import { t } from "elysia";
import { CommonParams } from "./common";

export const ScenariosDto = {
  params: CommonParams.id,

  createBody: t.Object({
    name: t.String(),
    description: t.Optional(t.String()),
    inputs: t.Optional(t.Object({}, { additionalProperties: true })),
  }),

  updateBody: t.Object({
    name: t.Optional(t.String()),
    description: t.Optional(t.String()),
    inputs: t.Optional(t.Object({}, { additionalProperties: true })),
  }),
};
