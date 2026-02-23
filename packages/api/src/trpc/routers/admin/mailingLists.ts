import { z } from "zod";
import { t } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const mailingListsRouter = t.router({
  list: t.procedure.query(async ({ ctx }) => ctx.api.mailingLists.list()),

  get: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const m = await ctx.api.mailingLists.get(input.id);
      if (!m) throw new TRPCError({ code: "NOT_FOUND" });
      return m;
    }),

  create: t.procedure
    .input(z.object({ name: z.string(), description: z.string().optional() }))
    .mutation(async ({ ctx, input }) => ctx.api.mailingLists.create(input)),

  update: t.procedure
    .input(z.object({ id: z.string(), name: z.string().optional(), description: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...body } = input;
      const m = await ctx.api.mailingLists.update(id, body);
      if (!m) throw new TRPCError({ code: "NOT_FOUND" });
      return m;
    }),

  delete: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.api.mailingLists.delete(input.id);
      return { ok: true };
    }),

  getMembers: t.procedure
    .input(z.object({ listId: z.string() }))
    .query(({ ctx, input }) => ctx.api.mailingLists.getMembers(input.listId)),

  addMember: t.procedure
    .input(z.object({ listId: z.string(), contactId: z.string() }))
    .mutation(({ ctx, input }) => ctx.api.mailingLists.addMember(input.listId, input.contactId)),

  removeMember: t.procedure
    .input(z.object({ listId: z.string(), contactId: z.string() }))
    .mutation(({ ctx, input }) => ctx.api.mailingLists.removeMember(input.listId, input.contactId)),

  preview: t.procedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => ctx.api.mailingLists.preview(input.id)),

  getStats: t.procedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => ctx.api.mailingLists.getStats(input.id)),

  getIncluded: t.procedure
    .input(
      z.object({
        listId: z.string(),
        page: z.number(),
        limit: z.number(),
        q: z.string().optional(),
      })
    )
    .query(({ ctx, input }) =>
      ctx.api.mailingLists.getIncludedPaginated(input.listId, input.page, input.limit, input.q)
    ),
});
