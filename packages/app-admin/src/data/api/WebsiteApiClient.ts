import type {
  SitePageResponse,
  SiteSettingsResponse,
  BlogPostResponse,
} from "@/shared/types/website";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export class WebsiteApiClient {
  listPages() {
    return fetchJson<SitePageResponse[]>(`/api/website/pages`);
  }

  getPageById(id: string) {
    return fetchJson<SitePageResponse>(`/api/website/pages/${id}`);
  }

  getPageBySlug(slug: string) {
    return fetchJson<SitePageResponse>(`/api/website/pages/slug/${encodeURIComponent(slug)}`);
  }

  createPage(body: {
    slug: string;
    title: string;
    body?: string;
    meta_title?: string | null;
    meta_description?: string | null;
  }) {
    return fetchJson<SitePageResponse>(`/api/website/pages`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  updatePage(
    id: string,
    body: {
      slug?: string;
      title?: string;
      body?: string;
      meta_title?: string | null;
      meta_description?: string | null;
    }
  ) {
    return fetchJson<SitePageResponse>(`/api/website/pages/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  deletePage(id: string) {
    return fetchJson<void>(`/api/website/pages/${id}`, { method: "DELETE" });
  }

  getEventsFeed() {
    return fetchJson<Array<{ id: string; name: string; year?: number | null; event_date?: string | null; event_type?: string }>>(
      `/api/website/events`
    );
  }

  getMembersFeed() {
    return fetchJson<Array<{ id: string; name: string; position: string | null; photo_url: string | null; photo_thumbnail_url: string | null }>>(
      `/api/website/members`
    );
  }

  getMenus() {
    return fetchJson<Record<string, Array<{ id: string; menu_key: string; label: string; url: string | null; internal_ref: string | null; sort_order: number }>>>(
      `/api/website/menus`
    );
  }

  updateMenu(
    key: string,
    body: { items: Array<{ label: string; url?: string | null; internal_ref?: string | null; sort_order?: number }> }
  ) {
    return fetchJson<Array<{ id: string; menu_key: string; label: string; url: string | null; internal_ref: string | null; sort_order: number }>>(
      `/api/website/menus/${encodeURIComponent(key)}`,
      { method: "PUT", body: JSON.stringify(body) }
    );
  }

  listBlogPublished() {
    return fetchJson<BlogPostResponse[]>(`/api/website/blog`);
  }

  listBlogAll() {
    return fetchJson<BlogPostResponse[]>(`/api/website/blog/admin`);
  }

  getBlogBySlug(slug: string) {
    return fetchJson<BlogPostResponse>(`/api/website/blog/slug/${encodeURIComponent(slug)}`);
  }

  getBlogById(id: string) {
    return fetchJson<BlogPostResponse>(`/api/website/blog/admin/${id}`);
  }

  createBlogPost(body: {
    slug: string;
    title: string;
    excerpt?: string | null;
    body?: string;
    published_at?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
  }) {
    return fetchJson<BlogPostResponse>(`/api/website/blog`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  updateBlogPost(
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
    return fetchJson<BlogPostResponse>(`/api/website/blog/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  deleteBlogPost(id: string) {
    return fetchJson<void>(`/api/website/blog/${id}`, { method: "DELETE" });
  }

  submitContact(body: { name: string; email: string; subject?: string | null; message: string }) {
    return fetchJson<{ id: string; created: boolean }>(`/api/website/contact`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  submitContactMember(body: {
    member_id: string;
    sender_name: string;
    sender_email: string;
    message: string;
  }) {
    return fetchJson<{ id: string; created: boolean }>(`/api/website/contact-member`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  listContactSubmissions() {
    return fetchJson<
      Array<{
        id: string;
        name: string;
        email: string;
        subject: string | null;
        message: string;
        status: string;
        created_at?: string;
      }>
    >(`/api/website/contact-submissions`);
  }

  listContactMemberSubmissions() {
    return fetchJson<
      Array<{
        id: string;
        member_id: string;
        sender_name: string;
        sender_email: string;
        message: string;
        status: string;
        created_at?: string;
      }>
    >(`/api/website/contact-member-submissions`);
  }

  getSettings() {
    return fetchJson<SiteSettingsResponse>(`/api/website/settings`);
  }

  updateSettings(body: {
    title?: string | null;
    logo_url?: string | null;
    footer_text?: string | null;
    default_meta_description?: string | null;
    contact_email?: string | null;
  }) {
    return fetchJson<SiteSettingsResponse>(`/api/website/settings`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }
}
