import { z } from "zod";
import { t } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const budgetsRouter = t.router({
  list: t.procedure.query(async ({ ctx }) => ctx.api.budgets.list()),

  get: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const b = await ctx.api.budgets.get(input.id);
      if (!b) throw new TRPCError({ code: "NOT_FOUND" });
      return b;
    }),

  create: t.procedure
    .input(z.object({ name: z.string(), year: z.number(), description: z.string().optional() }))
    .mutation(async ({ ctx, input }) => ctx.api.budgets.create(input)),

  update: t.procedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        year: z.number().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...body } = input;
      const b = await ctx.api.budgets.update(id, body);
      if (!b) throw new TRPCError({ code: "NOT_FOUND" });
      return b;
    }),

  delete: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.api.budgets.delete(input.id);
      return { ok: true };
    }),

  addLineItem: t.procedure
    .input(
      z.object({
        budgetId: z.string(),
        name: z.string(),
        category: z.string(),
        comments: z.string().optional(),
        unitCost: z.number(),
        quantity: z.number(),
        historicalCosts: z.record(z.number()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { budgetId, ...body } = input;
      return ctx.api.budgets.addLineItem(budgetId, body);
    }),

  updateLineItem: t.procedure
    .input(
      z.object({
        budgetId: z.string(),
        itemId: z.string(),
        name: z.string().optional(),
        category: z.string().optional(),
        comments: z.string().optional(),
        unitCost: z.number().optional(),
        quantity: z.number().optional(),
        historicalCosts: z.record(z.number()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { budgetId, itemId, ...body } = input;
      const b = await ctx.api.budgets.updateLineItem(budgetId, itemId, body);
      if (!b) throw new TRPCError({ code: "NOT_FOUND" });
      return b;
    }),

  deleteLineItem: t.procedure
    .input(z.object({ budgetId: z.string(), itemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.api.budgets.deleteLineItem(input.budgetId, input.itemId);
      return { ok: true };
    }),
});
