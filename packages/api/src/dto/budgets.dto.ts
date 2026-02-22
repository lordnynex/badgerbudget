import { t } from "elysia";
import { CommonParams } from "./common";

export const BudgetsDto = {
  params: CommonParams.id,
  itemParams: CommonParams.idItemId,

  createBody: t.Object({
    name: t.String(),
    year: t.Number(),
    description: t.Optional(t.String()),
  }),

  updateBody: t.Object({
    name: t.Optional(t.String()),
    year: t.Optional(t.Number()),
    description: t.Optional(t.String()),
  }),

  addLineItemBody: t.Object({
    name: t.String(),
    category: t.String(),
    comments: t.Optional(t.String()),
    unitCost: t.Number(),
    quantity: t.Number(),
    historicalCosts: t.Optional(t.Object({}, { additionalProperties: t.Number() })),
  }),

  updateLineItemBody: t.Object({
    name: t.Optional(t.String()),
    category: t.Optional(t.String()),
    comments: t.Optional(t.String()),
    unitCost: t.Optional(t.Number()),
    quantity: t.Optional(t.Number()),
    historicalCosts: t.Optional(t.Object({}, { additionalProperties: t.Number() })),
  }),
};
