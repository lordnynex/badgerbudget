import { z } from "zod";
import { t } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const websiteAdminRouter = t.router({
  listPages: t.procedure.query(({ ctx }) => ctx.api.sitePages.list()),

  getPageById: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const p = await ctx.api.sitePages.getById(input.id);
      if (!p) throw new TRPCError({ code: "NOT_FOUND" });
      return p;
    }),

  createPage: t.procedure
    .input(
      z.object({
        slug: z.string(),
        title: z.string(),
        body: z.string().optional(),
        meta_title: z.string().nullable().optional(),
        meta_description: z.string().nullable().optional(),
      })
    )
    .mutation(({ ctx, input }) => ctx.api.sitePages.create(input)),

  updatePage: t.procedure
    .input(
      z.object({
        id: z.string(),
        slug: z.string().optional(),
        title: z.string().optional(),
        body: z.string().optional(),
        meta_title: z.string().nullable().optional(),
        meta_description: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...body } = input;
      const p = await ctx.api.sitePages.update(id, body);
      if (!p) throw new TRPCError({ code: "NOT_FOUND" });
      return p;
    }),

  deletePage: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.api.sitePages.delete(input.id);
      return { ok: true };
    }),

  listBlogAll: t.procedure.query(({ ctx }) => ctx.api.blog.listAll()),

  getBlogById: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const p = await ctx.api.blog.getById(input.id);
      if (!p) throw new TRPCError({ code: "NOT_FOUND" });
      return p;
    }),

  createBlogPost: t.procedure
    .input(
      z.object({
        slug: z.string(),
        title: z.string(),
        excerpt: z.string().nullable().optional(),
        body: z.string().optional(),
        published_at: z.string().nullable().optional(),
        meta_title: z.string().nullable().optional(),
        meta_description: z.string().nullable().optional(),
      })
    )
    .mutation(({ ctx, input }) => ctx.api.blog.create(input)),

  updateBlogPost: t.procedure
    .input(
      z.object({
        id: z.string(),
        slug: z.string().optional(),
        title: z.string().optional(),
        excerpt: z.string().nullable().optional(),
        body: z.string().optional(),
        published_at: z.string().nullable().optional(),
        meta_title: z.string().nullable().optional(),
        meta_description: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...body } = input;
      const p = await ctx.api.blog.update(id, body);
      if (!p) throw new TRPCError({ code: "NOT_FOUND" });
      return p;
    }),

  deleteBlogPost: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.api.blog.delete(input.id);
      return { ok: true };
    }),

  getMenus: t.procedure.query(({ ctx }) => ctx.api.siteMenus.listAll()),

  updateMenu: t.procedure
    .input(
      z.object({
        key: z.string(),
        items: z.array(
          z.object({
            label: z.string(),
            url: z.string().nullable().optional(),
            internal_ref: z.string().nullable().optional(),
            sort_order: z.number().optional(),
          })
        ),
      })
    )
    .mutation(({ ctx, input }) => ctx.api.siteMenus.updateMenu(input.key, input.items)),

  getSettings: t.procedure.query(({ ctx }) => ctx.api.siteSettings.get()),

  updateSettings: t.procedure
    .input(
      z.object({
        title: z.string().nullable().optional(),
        logo_url: z.string().nullable().optional(),
        footer_text: z.string().nullable().optional(),
        default_meta_description: z.string().nullable().optional(),
        contact_email: z.string().nullable().optional(),
      })
    )
    .mutation(({ ctx, input }) => ctx.api.siteSettings.update(input)),

  listContactSubmissions: t.procedure.query(({ ctx }) => ctx.api.contactSubmissions.listContactSubmissions()),

  listContactMemberSubmissions: t.procedure.query(({ ctx }) => ctx.api.contactSubmissions.listContactMemberSubmissions()),
});
