import { z } from "zod";
import { t } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const committeesRouter = t.router({
  list: t.procedure
    .input(z.object({ sort: z.enum(["formed_date", "name"]).optional() }).optional())
    .query(({ ctx, input }) => ctx.api.committees.list(input?.sort)),

  get: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const c = await ctx.api.committees.get(input.id);
      if (!c) throw new TRPCError({ code: "NOT_FOUND" });
      return c;
    }),

  create: t.procedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        purpose: z.string().optional(),
        formed_date: z.string(),
        closed_date: z.string().optional(),
        chairperson_member_id: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) => ctx.api.committees.create(input)),

  update: t.procedure
    .input(z.object({ id: z.string() }).passthrough())
    .mutation(async ({ ctx, input }) => {
      const { id, ...body } = input;
      const c = await ctx.api.committees.update(id, body);
      if (!c) throw new TRPCError({ code: "NOT_FOUND" });
      return c;
    }),

  delete: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.api.committees.delete(input.id);
      return { ok: true };
    }),

  addMember: t.procedure
    .input(z.object({ committeeId: z.string(), memberId: z.string() }))
    .mutation(({ ctx, input }) => ctx.api.committees.addMember(input.committeeId, input.memberId)),

  removeMember: t.procedure
    .input(z.object({ committeeId: z.string(), memberId: z.string() }))
    .mutation(({ ctx, input }) => ctx.api.committees.removeMember(input.committeeId, input.memberId)),

  reorderMembers: t.procedure
    .input(z.object({ committeeId: z.string(), memberIds: z.array(z.string()) }))
    .mutation(({ ctx, input }) => ctx.api.committees.updateMemberOrder(input.committeeId, input.memberIds)),

  listMeetings: t.procedure
    .input(z.object({ committeeId: z.string() }))
    .query(({ ctx, input }) => ctx.api.committees.listMeetings(input.committeeId)),

  createMeeting: t.procedure
    .input(
      z.object({
        committeeId: z.string(),
        date: z.string(),
        meeting_number: z.number(),
        location: z.string().nullable().optional(),
        start_time: z.string().nullable().optional(),
        end_time: z.string().nullable().optional(),
        video_conference_url: z.string().nullable().optional(),
        previous_meeting_id: z.string().nullable().optional(),
        agenda_content: z.string().optional(),
        minutes_content: z.string().nullable().optional(),
        agenda_template_id: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { committeeId, ...body } = input;
      return ctx.api.committees.createMeeting(committeeId, body);
    }),

  getMeeting: t.procedure
    .input(z.object({ committeeId: z.string(), meetingId: z.string() }))
    .query(async ({ ctx, input }) => {
      const m = await ctx.api.committees.getMeeting(input.committeeId, input.meetingId);
      if (!m) throw new TRPCError({ code: "NOT_FOUND" });
      return m;
    }),

  updateMeeting: t.procedure
    .input(z.object({ committeeId: z.string(), meetingId: z.string() }).passthrough())
    .mutation(({ ctx, input }) => {
      const { committeeId, meetingId, ...body } = input;
      return ctx.api.committees.updateMeeting(committeeId, meetingId, body);
    }),

  deleteMeeting: t.procedure
    .input(z.object({ committeeId: z.string(), meetingId: z.string() }))
    .mutation(({ ctx, input }) => ctx.api.committees.deleteMeeting(input.committeeId, input.meetingId)),
});
