import { z } from "zod";
import { t } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const meetingTemplatesRouter = t.router({
  list: t.procedure
    .input(z.object({ type: z.enum(["agenda", "minutes"]).optional() }).optional())
    .query(({ ctx, input }) => ctx.api.meetingTemplates.list(input?.type)),

  get: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const tpl = await ctx.api.meetingTemplates.get(input.id);
      if (!tpl) throw new TRPCError({ code: "NOT_FOUND" });
      return tpl;
    }),

  create: t.procedure
    .input(z.object({ name: z.string(), type: z.string(), content: z.string() }))
    .mutation(({ ctx, input }) => ctx.api.meetingTemplates.create(input)),

  update: t.procedure
    .input(z.object({ id: z.string(), name: z.string().optional(), content: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...body } = input;
      const tpl = await ctx.api.meetingTemplates.update(id, body);
      if (!tpl) throw new TRPCError({ code: "NOT_FOUND" });
      return tpl;
    }),

  delete: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.api.meetingTemplates.delete(input.id);
      return { ok: true };
    }),
});
