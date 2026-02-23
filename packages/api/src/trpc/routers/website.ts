import { z } from "zod";
import { t } from "../trpc";
import { TRPCError } from "@trpc/server";

export const websiteRouter = t.router({
  getEventsFeed: t.procedure.query(async ({ ctx }) => {
    return ctx.api.events.listForWebsite();
  }),

  getMembersFeed: t.procedure.query(async ({ ctx }) => {
    return ctx.api.members.listForWebsite();
  }),

  getBlogPublished: t.procedure.query(async ({ ctx }) => {
    return ctx.api.blog.listPublished();
  }),

  getBlogBySlug: t.procedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.api.blog.getBySlug(input.slug);
      if (!post) throw new TRPCError({ code: "NOT_FOUND" });
      return post;
    }),

  getPages: t.procedure.query(async ({ ctx }) => {
    return ctx.api.sitePages.list();
  }),

  getPageBySlug: t.procedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const page = await ctx.api.sitePages.getBySlug(input.slug);
      if (!page) throw new TRPCError({ code: "NOT_FOUND" });
      return page;
    }),

  getPageById: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const page = await ctx.api.sitePages.getById(input.id);
      if (!page) throw new TRPCError({ code: "NOT_FOUND" });
      return page;
    }),

  submitContact: t.procedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        subject: z.string().nullable().optional(),
        message: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.api.contactSubmissions.createContact({
        name: input.name,
        email: input.email,
        subject: input.subject ?? null,
        message: input.message,
      });
    }),

  submitContactMember: t.procedure
    .input(
      z.object({
        member_id: z.string(),
        sender_name: z.string(),
        sender_email: z.string().email(),
        message: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.api.contactSubmissions.createContactMember(input);
    }),

  getMenus: t.procedure.query(async ({ ctx }) => {
    return ctx.api.siteMenus.listAll();
  }),

  getSettings: t.procedure.query(async ({ ctx }) => {
    return ctx.api.siteSettings.get();
  }),
});

export type WebsiteRouter = typeof websiteRouter;
