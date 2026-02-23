import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/data/api";
import { queryKeys } from "@/queries/keys";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Plus, Pencil, Trash2 } from "lucide-react";
import type { SitePageResponse } from "@badgerbudget/shared/types/website";

function bodyToPlainText(body: string): string {
  try {
    const doc = JSON.parse(body) as { content?: Array<{ content?: Array<{ text?: string }> }> };
    if (!doc?.content?.length) return "";
    return (doc.content
      .map((block) =>
        block.content?.map((c) => c.text ?? "").join("") ?? ""
      )
      .join("\n")) as string;
  } catch {
    return body;
  }
}

function plainTextToBody(text: string): string {
  if (!text.trim()) return JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] });
  const lines = text.trim().split(/\n/);
  const content = lines.map((line) => ({
    type: "paragraph" as const,
    content: [{ type: "text" as const, text: line }],
  }));
  return JSON.stringify({ type: "doc", content });
}

export function WebsitePagesPanel() {
  const api = useApi();
  const queryClient = useQueryClient();
  const { data: pages = [], isLoading } = useQuery({
    queryKey: queryKeys.websitePages,
    queryFn: () => api.website.listPages(),
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<SitePageResponse | null>(null);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const createMutation = useMutation({
    mutationFn: (body: { slug: string; title: string; body?: string; meta_title?: string | null; meta_description?: string | null }) =>
      api.website.createPage(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.websitePages });
      setDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { slug?: string; title?: string; body?: string; meta_title?: string | null; meta_description?: string | null } }) =>
      api.website.updatePage(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.websitePages });
      setDialogOpen(false);
      setEditingPage(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.website.deletePage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.websitePages });
    },
  });

  function resetForm() {
    setSlug("");
    setTitle("");
    setBodyText("");
    setMetaTitle("");
    setMetaDescription("");
    setEditingPage(null);
  }

  function openCreate() {
    resetForm();
    setEditingPage(null);
    setDialogOpen(true);
  }

  function openEdit(page: SitePageResponse) {
    setEditingPage(page);
    setSlug(page.slug);
    setTitle(page.title);
    setBodyText(bodyToPlainText(page.body));
    setMetaTitle(page.meta_title ?? "");
    setMetaDescription(page.meta_description ?? "");
    setDialogOpen(true);
  }

  function handleSave() {
    const body = plainTextToBody(bodyText);
    if (editingPage) {
      setSaving(true);
      updateMutation
        .mutate({
          id: editingPage.id,
          body: {
            slug: slug.trim() || undefined,
            title: title.trim() || undefined,
            body,
            meta_title: metaTitle.trim() || null,
            meta_description: metaDescription.trim() || null,
          },
        })
        .finally(() => setSaving(false));
    } else {
      if (!slug.trim() || !title.trim()) return;
      setSaving(true);
      createMutation
        .mutate({
          slug: slug.trim(),
          title: title.trim(),
          body,
          meta_title: metaTitle.trim() || null,
          meta_description: metaDescription.trim() || null,
        })
        .finally(() => setSaving(false));
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Manage static CMS pages (About, FAQ, etc.) for the public site. Create, edit, and
            publish pages by slug with optional per-page SEO (meta title, description).
          </p>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="size-4" />
            Add page
          </Button>
          {isLoading ? (
            <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
          ) : pages.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No pages yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {pages.map((page) => (
                <li
                  key={page.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div>
                    <span className="font-medium">{page.title}</span>
                    <span className="ml-2 text-muted-foreground text-sm">/{page.slug}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Edit"
                      onClick={() => openEdit(page)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete"
                      onClick={() => {
                        if (window.confirm(`Delete "${page.title}"? This cannot be undone.`)) {
                          deleteMutation.mutate(page.id);
                        }
                      }}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPage ? "Edit page" : "Add page"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="about"
                disabled={!!editingPage}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="About Us"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="body">Body (plain text, one paragraph per line)</Label>
              <textarea
                id="body"
                className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder="Page content…"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="meta_title">Meta title (SEO)</Label>
              <Input
                id="meta_title"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="meta_description">Meta description (SEO)</Label>
              <textarea
                id="meta_description"
                className="min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : editingPage ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
