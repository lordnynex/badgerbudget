import { z } from "zod";
import { t } from "../../trpc";
import { TRPCError } from "@trpc/server";

const contactSearchParams = z.object({
  q: z.string().optional(),
  status: z.enum(["active", "deleted", "all"]).optional(),
  hasPostalAddress: z.boolean().optional(),
  tagIds: z.array(z.string()).optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

export const contactsRouter = t.router({
  list: t.procedure.input(contactSearchParams.optional()).query(async ({ ctx, input }) => ctx.api.contacts.list(input ?? {})),

  get: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const c = await ctx.api.contacts.get(input.id);
      if (!c) throw new TRPCError({ code: "NOT_FOUND" });
      return c;
    }),

  create: t.procedure
    .input(z.object({ display_name: z.string() }).passthrough())
    .mutation(async ({ ctx, input }) => ctx.api.contacts.create(input)),

  update: t.procedure
    .input(z.object({ id: z.string() }).passthrough())
    .mutation(async ({ ctx, input }) => {
      const { id, ...body } = input;
      const c = await ctx.api.contacts.update(id, body);
      if (!c) throw new TRPCError({ code: "NOT_FOUND" });
      return c;
    }),

  delete: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.api.contacts.delete(input.id);
      return { ok: true };
    }),

  restore: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => ctx.api.contacts.restore(input.id)),
});
