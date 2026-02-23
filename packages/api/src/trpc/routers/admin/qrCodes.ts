import { z } from "zod";
import { t } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const qrCodesRouter = t.router({
  list: t.procedure.query(async ({ ctx }) => ctx.api.qrCodes.list()),

  get: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const q = await ctx.api.qrCodes.get(input.id);
      if (!q) throw new TRPCError({ code: "NOT_FOUND" });
      return q;
    }),

  create: t.procedure
    .input(z.object({ name: z.string().nullable().optional(), url: z.string(), config: z.record(z.unknown()).nullable().optional() }))
    .mutation(({ ctx, input }) => ctx.api.qrCodes.create(input)),

  update: t.procedure
    .input(z.object({ id: z.string(), name: z.string().nullable().optional(), url: z.string().optional(), config: z.record(z.unknown()).nullable().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...body } = input;
      const q = await ctx.api.qrCodes.update(id, body);
      if (!q) throw new TRPCError({ code: "NOT_FOUND" });
      return q;
    }),

  delete: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.api.qrCodes.delete(input.id);
      return { ok: true };
    }),

  getImage: t.procedure
    .input(z.object({ id: z.string(), size: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.api.qrCodes.getImage(input.id, input.size);
      if (!result) throw new TRPCError({ code: "NOT_FOUND" });
      return { base64: Buffer.from(result.buffer).toString("base64"), contentType: result.contentType };
    }),
});
