import { z } from "zod";
import { t } from "../../trpc";
import { TRPCError } from "@trpc/server";

const eventType = z.enum(["badger", "anniversary", "pioneer_run", "rides"]);

export const eventsRouter = t.router({
  list: t.procedure
    .input(z.object({ type: eventType.optional() }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.api.events.list(input?.type);
    }),

  get: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.api.events.get(input.id);
      if (!event) throw new TRPCError({ code: "NOT_FOUND" });
      return event;
    }),

  create: t.procedure
    .input(
      z.object({
        name: z.string(),
        event_type: eventType.optional(),
        description: z.string().optional(),
        year: z.number().optional(),
        event_date: z.string().optional(),
        event_url: z.string().optional(),
        event_location: z.string().optional(),
        event_location_embed: z.string().optional(),
        ga_ticket_cost: z.number().optional(),
        day_pass_cost: z.number().optional(),
        ga_tickets_sold: z.number().optional(),
        day_passes_sold: z.number().optional(),
        budget_id: z.string().optional(),
        scenario_id: z.string().optional(),
        planning_notes: z.string().optional(),
        start_location: z.string().optional(),
        end_location: z.string().optional(),
        facebook_event_url: z.string().optional(),
        pre_ride_event_id: z.string().optional(),
        ride_cost: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.api.events.create(input);
    }),

  update: t.procedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        event_type: eventType.nullable().optional(),
        description: z.string().nullable().optional(),
        year: z.number().nullable().optional(),
        event_date: z.string().nullable().optional(),
        event_url: z.string().nullable().optional(),
        event_location: z.string().nullable().optional(),
        event_location_embed: z.string().nullable().optional(),
        ga_ticket_cost: z.number().nullable().optional(),
        day_pass_cost: z.number().nullable().optional(),
        ga_tickets_sold: z.number().nullable().optional(),
        day_passes_sold: z.number().nullable().optional(),
        budget_id: z.string().nullable().optional(),
        scenario_id: z.string().nullable().optional(),
        planning_notes: z.string().nullable().optional(),
        show_on_website: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...body } = input;
      const out = await ctx.api.events.update(id, body);
      if (!out) throw new TRPCError({ code: "NOT_FOUND" });
      return out;
    }),

  delete: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.api.events.delete(input.id);
      return { ok: true };
    }),
});
