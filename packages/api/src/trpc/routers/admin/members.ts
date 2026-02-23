import { z } from "zod";
import { t } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const membersRouter = t.router({
  list: t.procedure.query(async ({ ctx }) => ctx.api.members.list()),

  get: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const m = await ctx.api.members.get(input.id);
      if (!m) throw new TRPCError({ code: "NOT_FOUND" });
      return m;
    }),

  create: t.procedure
    .input(
      z.object({
        name: z.string(),
        phone_number: z.string().nullable().optional(),
        position: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => ctx.api.members.create(input)),

  update: t.procedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        phone_number: z.string().nullable().optional(),
        position: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...body } = input;
      const m = await ctx.api.members.update(id, body);
      if (!m) throw new TRPCError({ code: "NOT_FOUND" });
      return m;
    }),

  delete: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.api.members.delete(input.id);
      return { ok: true };
    }),

  getPhoto: t.procedure
    .input(z.object({ id: z.string(), size: z.enum(["thumbnail", "medium", "full"]).optional() }))
    .query(async ({ ctx, input }) => {
      const buffer = await ctx.api.members.getPhoto(input.id, input.size ?? "full");
      if (!buffer) throw new TRPCError({ code: "NOT_FOUND" });
      return Buffer.from(buffer).toString("base64");
    }),
});
