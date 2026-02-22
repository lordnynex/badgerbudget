import { Elysia } from "elysia";
import { BaseController } from "./BaseController";
import { WebsiteDto } from "../dto/website.dto";
import { CommonParams } from "../dto/common";

export class WebsiteController extends BaseController {
  init() {
    return new Elysia({ prefix: "/website" })
      .get("/events", () => this.listEventsFeed())
      .get("/members", () => this.listMembersFeed())
      .get("/blog", () => this.listBlogPublished())
      .get("/blog/slug/:slug", ({ params }) => this.getBlogBySlug(params.slug), {
        params: WebsiteDto.slugParam,
      })
      .get("/pages", () => this.listPages())
      .get("/pages/slug/:slug", ({ params }) => this.getPageBySlug(params.slug), {
        params: WebsiteDto.slugParam,
      })
      .get("/pages/:id", ({ params }) => this.getPageById(params.id), {
        params: CommonParams.id,
      })
      .post("/pages", ({ body }) => this.createPage(body), {
        body: WebsiteDto.pageBody,
      })
      .put("/pages/:id", ({ params, body }) => this.updatePage(params.id, body), {
        params: CommonParams.id,
        body: WebsiteDto.pageUpdateBody,
      })
      .delete("/pages/:id", ({ params }) => this.deletePage(params.id), {
        params: CommonParams.id,
      })
      .get("/blog/admin", () => this.listBlogAll())
      .get("/blog/admin/:id", ({ params }) => this.getBlogById(params.id), {
        params: CommonParams.id,
      })
      .post("/blog", ({ body }) => this.createBlogPost(body), {
        body: WebsiteDto.blogPostBody,
      })
      .put("/blog/:id", ({ params, body }) => this.updateBlogPost(params.id, body), {
        params: CommonParams.id,
        body: WebsiteDto.blogPostUpdateBody,
      })
      .delete("/blog/:id", ({ params }) => this.deleteBlogPost(params.id), {
        params: CommonParams.id,
      })
      .post("/contact", ({ body }) => this.submitContact(body), {
        body: WebsiteDto.contactBody,
      })
      .post("/contact-member", ({ body }) => this.submitContactMember(body), {
        body: WebsiteDto.contactMemberBody,
      })
      .get("/contact-submissions", () => this.listContactSubmissions())
      .get("/contact-member-submissions", () => this.listContactMemberSubmissions())
      .get("/menus", () => this.getMenus())
      .put("/menus/:key", ({ params, body }) => this.updateMenu(params.key, body), {
        params: WebsiteDto.menuKeyParam,
        body: WebsiteDto.menuItemsBody,
      })
      .get("/settings", () => this.getSettings())
      .put("/settings", ({ body }) => this.updateSettings(body), {
        body: WebsiteDto.settingsBody,
      });
  }

  private listPages() {
    return this.api.sitePages.list().then(this.json);
  }

  private getPageById(id: string) {
    return this.api.sitePages
      .getById(id)
      .then((p) => (p ? this.json(p) : this.notFound()));
  }

  private getPageBySlug(slug: string) {
    return this.api.sitePages
      .getBySlug(slug)
      .then((p) => (p ? this.json(p) : this.notFound()));
  }

  private createPage(body: {
    slug: string;
    title: string;
    body?: string;
    meta_title?: string | null;
    meta_description?: string | null;
  }) {
    return this.api.sitePages
      .create({
        slug: body.slug,
        title: body.title,
        body: body.body,
        meta_title: body.meta_title ?? null,
        meta_description: body.meta_description ?? null,
      })
      .then(this.json);
  }

  private updatePage(
    id: string,
    body: {
      slug?: string;
      title?: string;
      body?: string;
      meta_title?: string | null;
      meta_description?: string | null;
    }
  ) {
    return this.api.sitePages
      .update(id, {
        slug: body.slug,
        title: body.title,
        body: body.body,
        meta_title: body.meta_title,
        meta_description: body.meta_description,
      })
      .then((p) => (p ? this.json(p) : this.notFound()));
  }

  private deletePage(id: string) {
    return this.api.sitePages
      .delete(id)
      .then((ok) => (ok ? new Response(null, { status: 204 }) : this.notFound()));
  }

  private listBlogPublished() {
    return this.api.blog.listPublished().then(this.json);
  }

  private listBlogAll() {
    return this.api.blog.listAll().then(this.json);
  }

  private getBlogBySlug(slug: string) {
    return this.api.blog
      .getBySlug(slug)
      .then((p) => (p ? this.json(p) : this.notFound()));
  }

  private getBlogById(id: string) {
    return this.api.blog
      .getById(id)
      .then((p) => (p ? this.json(p) : this.notFound()));
  }

  private createBlogPost(body: {
    slug: string;
    title: string;
    excerpt?: string | null;
    body?: string;
    published_at?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
  }) {
    return this.api.blog.create(body).then(this.json);
  }

  private updateBlogPost(
    id: string,
    body: {
      slug?: string;
      title?: string;
      excerpt?: string | null;
      body?: string;
      published_at?: string | null;
      meta_title?: string | null;
      meta_description?: string | null;
    }
  ) {
    return this.api.blog
      .update(id, body)
      .then((p) => (p ? this.json(p) : this.notFound()));
  }

  private deleteBlogPost(id: string) {
    return this.api.blog
      .delete(id)
      .then((ok) => (ok ? new Response(null, { status: 204 }) : this.notFound()));
  }

  private submitContact(body: { name: string; email: string; subject?: string | null; message: string }) {
    return this.api.contactSubmissions.createContact(body).then(this.json);
  }

  private submitContactMember(body: {
    member_id: string;
    sender_name: string;
    sender_email: string;
    message: string;
  }) {
    return this.api.contactSubmissions.createContactMember(body).then(this.json);
  }

  private listContactSubmissions() {
    return this.api.contactSubmissions.listContactSubmissions().then(this.json);
  }

  private listContactMemberSubmissions() {
    return this.api.contactSubmissions.listContactMemberSubmissions().then(this.json);
  }

  private listEventsFeed() {
    return this.api.events.listForWebsite().then(this.json);
  }

  private listMembersFeed() {
    return this.api.members.listForWebsite().then(this.json);
  }

  private getMenus() {
    return this.api.siteMenus.listAll().then(this.json);
  }

  private updateMenu(key: string, body: { items: Array<{ label: string; url?: string | null; internal_ref?: string | null; sort_order?: number }> }) {
    return this.api.siteMenus.updateMenu(key, body.items).then(this.json);
  }

  private getSettings() {
    return this.api.siteSettings.get().then(this.json);
  }

  private updateSettings(body: {
    title?: string | null;
    logo_url?: string | null;
    footer_text?: string | null;
    default_meta_description?: string | null;
    contact_email?: string | null;
  }) {
    return this.api.siteSettings.update(body).then(this.json);
  }
}
