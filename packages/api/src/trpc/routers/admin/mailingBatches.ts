import { z } from "zod";
import { t } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const mailingBatchesRouter = t.router({
  list: t.procedure.query(async ({ ctx }) => ctx.api.mailingBatches.list()),

  get: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const b = await ctx.api.mailingBatches.get(input.id);
      if (!b) throw new TRPCError({ code: "NOT_FOUND" });
      return b;
    }),

  create: t.procedure
    .input(z.object({ listId: z.string(), name: z.string() }))
    .mutation(({ ctx, input }) => ctx.api.mailingBatches.create(input.listId, input.name)),

  updateRecipientStatus: t.procedure
    .input(z.object({ batchId: z.string(), recipientId: z.string(), status: z.string(), reason: z.string().optional() }))
    .mutation(({ ctx, input }) =>
      ctx.api.mailingBatches.updateRecipientStatus(input.batchId, input.recipientId, input.status, input.reason)
    ),
});
