import { z } from "zod";
import { t } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const documentsRouter = t.router({
  get: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const d = await ctx.api.documents.get(input.id);
      if (!d) throw new TRPCError({ code: "NOT_FOUND" });
      return d;
    }),

  update: t.procedure
    .input(z.object({ id: z.string(), content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const d = await ctx.api.documents.update(input.id, { content: input.content });
      if (!d) throw new TRPCError({ code: "NOT_FOUND" });
      return d;
    }),

  getVersions: t.procedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => ctx.api.documents.listVersions(input.id)),

  restore: t.procedure
    .input(z.object({ id: z.string(), versionId: z.string() }))
    .mutation(({ ctx, input }) => ctx.api.documents.restore(input.id, input.versionId)),

  exportPdf: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const buffer = await ctx.api.documents.exportPdf(input.id);
      if (!buffer) throw new TRPCError({ code: "NOT_FOUND" });
      return { base64: Buffer.from(buffer).toString("base64") };
    }),
});
