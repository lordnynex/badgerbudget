import { z } from "zod";
import { t } from "../../trpc";

export const incidentsRouter = t.router({
  list: t.procedure
    .input(
      z
        .object({
          page: z.number().int().min(1).default(1),
          per_page: z.number().int().min(1).max(100).default(20),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const page = input?.page ?? 1;
      const perPage = input?.per_page ?? 20;
      return ctx.api.events.listIncidents(page, perPage);
    }),
});

