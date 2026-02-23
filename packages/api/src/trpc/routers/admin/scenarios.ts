import { z } from "zod";
import { t } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const scenariosRouter = t.router({
  list: t.procedure.query(async ({ ctx }) => ctx.api.scenarios.list()),

  get: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const s = await ctx.api.scenarios.get(input.id);
      if (!s) throw new TRPCError({ code: "NOT_FOUND" });
      return s;
    }),

  create: t.procedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        inputs: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => ctx.api.scenarios.create(input)),

  update: t.procedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        inputs: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...body } = input;
      const s = await ctx.api.scenarios.update(id, body);
      if (!s) throw new TRPCError({ code: "NOT_FOUND" });
      return s;
    }),

  delete: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.api.scenarios.delete(input.id);
      return { ok: true };
    }),
});
