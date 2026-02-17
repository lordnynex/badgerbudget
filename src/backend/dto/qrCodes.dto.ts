import { t } from "elysia";
import { CommonParams } from "./common";

const errorCorrectionLevel = t.Union([
  t.Literal("L"),
  t.Literal("M"),
  t.Literal("Q"),
  t.Literal("H"),
]);

const colorSchema = t.Object({
  dark: t.Optional(t.String()),
  light: t.Optional(t.String()),
});

const configSchema = t.Object({
  errorCorrectionLevel: t.Optional(errorCorrectionLevel),
  width: t.Optional(t.Number()),
  margin: t.Optional(t.Number()),
  color: t.Optional(colorSchema),
  format: t.Optional(t.Union([t.Literal("png"), t.Literal("svg")])),
});

export const QrCodesDto = {
  params: CommonParams.id,

  createBody: t.Object({
    name: t.Optional(t.Union([t.String(), t.Null()])),
    url: t.String(),
    config: t.Optional(t.Union([configSchema, t.Null()])),
  }),

  updateBody: t.Object({
    name: t.Optional(t.Union([t.String(), t.Null()])),
    url: t.Optional(t.String()),
    config: t.Optional(t.Union([configSchema, t.Null()])),
  }),
};
