import { t } from "elysia";

export const WebsiteDto = {
  slugParam: t.Object({ slug: t.String() }),
  pageBody: t.Object({
    slug: t.String(),
    title: t.String(),
    body: t.Optional(t.String()),
    meta_title: t.Optional(t.Nullable(t.String())),
    meta_description: t.Optional(t.Nullable(t.String())),
  }),
  pageUpdateBody: t.Object({
    slug: t.Optional(t.String()),
    title: t.Optional(t.String()),
    body: t.Optional(t.String()),
    meta_title: t.Optional(t.Nullable(t.String())),
    meta_description: t.Optional(t.Nullable(t.String())),
  }),
  menuKeyParam: t.Object({ key: t.String() }),
  blogPostBody: t.Object({
    slug: t.String(),
    title: t.String(),
    excerpt: t.Optional(t.Nullable(t.String())),
    body: t.Optional(t.String()),
    published_at: t.Optional(t.Nullable(t.String())),
    meta_title: t.Optional(t.Nullable(t.String())),
    meta_description: t.Optional(t.Nullable(t.String())),
  }),
  blogPostUpdateBody: t.Object({
    slug: t.Optional(t.String()),
    title: t.Optional(t.String()),
    excerpt: t.Optional(t.Nullable(t.String())),
    body: t.Optional(t.String()),
    published_at: t.Optional(t.Nullable(t.String())),
    meta_title: t.Optional(t.Nullable(t.String())),
    meta_description: t.Optional(t.Nullable(t.String())),
  }),
  menuItemsBody: t.Object({
    items: t.Array(
      t.Object({
        label: t.String(),
        url: t.Optional(t.Nullable(t.String())),
        internal_ref: t.Optional(t.Nullable(t.String())),
        sort_order: t.Optional(t.Number()),
      })
    ),
  }),
  contactBody: t.Object({
    name: t.String(),
    email: t.String(),
    subject: t.Optional(t.Nullable(t.String())),
    message: t.String(),
  }),
  contactMemberBody: t.Object({
    member_id: t.String(),
    sender_name: t.String(),
    sender_email: t.String(),
    message: t.String(),
  }),
  settingsBody: t.Object({
    title: t.Optional(t.Nullable(t.String())),
    logo_url: t.Optional(t.Nullable(t.String())),
    footer_text: t.Optional(t.Nullable(t.String())),
    default_meta_description: t.Optional(t.Nullable(t.String())),
    contact_email: t.Optional(t.Nullable(t.String())),
  }),
};
