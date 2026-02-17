import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/data/api";
import type { MailingList } from "@/types/contact";
import { contactsToVCardFile } from "@/lib/vcard";
import { ArrowLeft, Pencil, Download, Trash2, RotateCcw, Plus, Trash2Icon, User } from "lucide-react";
import { EditContactDialog } from "./EditContactDialog";
import { ContactPhotoCarousel } from "./ContactPhotoCarousel";
import { ContactPhotoLightbox } from "./ContactPhotoLightbox";
import { useContactSuspense, useInvalidateQueries } from "@/queries/hooks";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/queries/keys";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <ContactDetailContent id={id} />;
}

function ContactDetailContent({ id }: { id: string }) {
  const navigate = useNavigate();
  const invalidate = useInvalidateQueries();
  const { data: contact } = useContactSuspense(id);
  const [editOpen, setEditOpen] = useState(false);
  const [listsWithContact, setListsWithContact] = useState<MailingList[]>([]);
  const [addNoteOpen, setAddNoteOpen] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");
  const [headerPhotoLightboxOpen, setHeaderPhotoLightboxOpen] = useState(false);

  const { data: allLists = [] } = useQuery({
    queryKey: queryKeys.mailingLists,
    queryFn: () => api.mailingLists.list(),
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const members = await Promise.all(
        allLists.map(async (l) => {
          const mems = await api.mailingLists.getMembers(l.id);
          return mems.some((m) => m.contact_id === id) ? l : null;
        })
      );
      if (!cancelled) setListsWithContact(members.filter(Boolean) as MailingList[]);
    })();
    return () => { cancelled = true; };
  }, [id, allLists]);

  const refresh = () => {
    invalidate.invalidateContact(id);
  };

  const handleExportVCard = () => {
    const vcf = contactsToVCardFile([contact]);
    const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${contact.display_name.replace(/[^a-z0-9]/gi, "_")}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!confirm("Soft delete this contact? You can restore it later.")) return;
    await api.contacts.delete(id);
    navigate("/contacts");
  };

  const handleRestore = async () => {
    await api.contacts.restore(id);
    refresh();
  };

  const handleAddNote = async () => {
    const content = newNoteContent.trim();
    if (!content) return;
    setAddingNote(true);
    try {
      await api.contacts.notes.create(id, content);
      setNewNoteContent("");
      setAddNoteOpen(false);
      refresh();
    } finally {
      setAddingNote(false);
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNoteId) return;
    const content = editingNoteContent.trim();
    if (!content) return;
    try {
      await api.contacts.notes.update(id, editingNoteId, content);
      setEditingNoteId(null);
      setEditingNoteContent("");
      refresh();
    } catch {
      // ignore
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Delete this note?")) return;
    await api.contacts.notes.delete(id, noteId);
    refresh();
  };

  const handleAddPhoto = async (file: File, setAsProfile?: boolean) => {
    await api.contacts.photos.add(id, file, { set_as_profile: setAsProfile });
    refresh();
  };

  const handleDeletePhoto = async (photoId: string) => {
    await api.contacts.photos.delete(id, photoId);
    refresh();
  };

  const handleSetProfilePhoto = async (photoId: string) => {
    await api.contacts.photos.setProfile(id, photoId);
    refresh();
  };

  const notes = contact.contact_notes ?? [];
  const photos = contact.contact_photos ?? [];
  const mainPhoto = photos.find((p) => p.type === "profile") ?? photos[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={() => navigate("/contacts")}>
          <ArrowLeft className="size-4" />
          Back to Contacts
        </Button>
        <div className="flex gap-2">
          {contact.status === "deleted" ? (
            <Button variant="outline" onClick={handleRestore}>
              <RotateCcw className="size-4" />
              Restore
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleExportVCard}>
                <Download className="size-4" />
                Export vCard
              </Button>
              <Button variant="outline" onClick={() => setEditOpen(true)}>
                <Pencil className="size-4" />
                Edit
              </Button>
              <Button variant="outline" onClick={handleDelete} className="text-destructive hover:text-destructive">
                <Trash2 className="size-4" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,auto]">
        <Card className="h-fit">
          <CardHeader>
            <div className="flex items-start gap-6">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl">{contact.display_name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {contact.type} • {contact.status}
                  {contact.organization_name && ` • ${contact.organization_name}`}
                </p>
              </div>
              <div
                className={`size-32 shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center ${
                  mainPhoto ? "cursor-pointer hover:opacity-90 transition-opacity" : ""
                }`}
                onClick={mainPhoto ? () => setHeaderPhotoLightboxOpen(true) : undefined}
                role={mainPhoto ? "button" : undefined}
                aria-label={mainPhoto ? "View full size photo" : undefined}
              >
                {mainPhoto ? (
                  <img
                    src={mainPhoto.photo_display_url}
                    alt={`${contact.display_name} photo`}
                    className="size-full object-cover"
                  />
                ) : (
                  <User className="size-16 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
          {/* Profile */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Profile</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">First name</p>
                <p>{contact.first_name ?? "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last name</p>
                <p>{contact.last_name ?? "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Organization</p>
                <p>{contact.organization_name ?? "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Club / affiliation</p>
                <p>{contact.club_name ?? "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Role / title</p>
                <p>{contact.role ?? "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Consent</p>
                <p>
                  Email: {contact.ok_to_email} • Mail: {contact.ok_to_mail}
                  {contact.do_not_contact && " • Do not contact"}
                </p>
              </div>
            </div>
            {(contact.tags ?? []).length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">Tags</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {contact.tags!.map((t) => (
                    <span key={t.id} className="rounded bg-muted px-2 py-0.5 text-sm">
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Addresses */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Addresses</h3>
            {(contact.addresses ?? []).length === 0 ? (
              <p className="text-muted-foreground">No addresses.</p>
            ) : (
              <div className="space-y-4">
                {contact.addresses!.map((a) => (
                  <div key={a.id} className="rounded-lg border p-4">
                    <p className="text-sm font-medium">
                      {a.type}
                      {a.is_primary_mailing && " (primary mailing)"}
                    </p>
                    <p className="mt-1">
                      {a.address_line1}
                      {a.address_line2 && `, ${a.address_line2}`}
                    </p>
                    <p>
                      {[a.city, a.state, a.postal_code].filter(Boolean).join(", ")}
                      {a.country && a.country !== "US" ? ` ${a.country}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Emails & Phones */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Emails & Phones</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Emails</p>
                {(contact.emails ?? []).length === 0 ? (
                  <p className="text-muted-foreground">None</p>
                ) : (
                  <ul className="mt-1 list-disc pl-4">
                    {contact.emails!.map((e) => (
                      <li key={e.id}>
                        {e.email}
                        {e.is_primary && " (primary)"}
                        {e.type !== "other" && ` (${e.type})`}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phones</p>
                {(contact.phones ?? []).length === 0 ? (
                  <p className="text-muted-foreground">None</p>
                ) : (
                  <ul className="mt-1 list-disc pl-4">
                    {contact.phones!.map((p) => (
                      <li key={p.id}>
                        {p.phone}
                        {p.is_primary && " (primary)"}
                        {p.type !== "other" && ` (${p.type})`}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>

          {/* How we know them */}
          {contact.how_we_know_them && (
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">How we know them</h3>
              <p className="whitespace-pre-wrap">{contact.how_we_know_them}</p>
            </section>
          )}

          {/* Notes */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Notes</h3>
              {contact.status !== "deleted" && (
                <Button variant="outline" size="sm" onClick={() => setAddNoteOpen(true)}>
                  <Plus className="size-4" />
                  Add note
                </Button>
              )}
            </div>
            {notes.length === 0 ? (
              <p className="text-muted-foreground text-sm">No notes yet. Click + to add one.</p>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg border p-4 bg-muted/30"
                  >
                    {editingNoteId === note.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingNoteContent}
                          onChange={(e) => setEditingNoteContent(e.target.value)}
                          rows={3}
                          className="resize-none"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleUpdateNote}>
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingNoteId(null);
                              setEditingNoteContent("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="whitespace-pre-wrap text-sm">{note.content}</p>
                          {note.created_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(note.created_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {contact.status !== "deleted" && (
                          <div className="flex gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => {
                                setEditingNoteId(note.id);
                                setEditingNoteContent(note.content);
                              }}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <Trash2Icon className="size-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Mailing Lists */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Mailing lists</h3>
            {listsWithContact.length === 0 ? (
              <p className="text-muted-foreground">Not on any lists.</p>
            ) : (
              <ul className="space-y-1">
                {listsWithContact.map((l) => (
                  <li key={l.id}>
                    <Link to={`/contacts/lists/${l.id}`} className="text-primary hover:underline">
                      {l.name}
                      {l.event ? ` (${l.event.name})` : ""}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
          </CardContent>
        </Card>

        {/* Dossier photo panel - right side */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactPhotoCarousel
                contactId={id}
                contactName={contact.display_name}
                photos={photos}
                onAddPhoto={handleAddPhoto}
                onDeletePhoto={handleDeletePhoto}
                onSetProfilePhoto={handleSetProfilePhoto}
                disabled={contact.status === "deleted"}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {mainPhoto && (
        <ContactPhotoLightbox
          open={headerPhotoLightboxOpen}
          onOpenChange={setHeaderPhotoLightboxOpen}
          photoUrl={mainPhoto.photo_url}
          contactName={contact.display_name}
        />
      )}

      <EditContactDialog open={editOpen} onOpenChange={setEditOpen} contact={contact} onSuccess={refresh} />

      <Dialog open={addNoteOpen} onOpenChange={setAddNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add note</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Note</Label>
            <Textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Free-form note..."
              rows={4}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddNoteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote} disabled={!newNoteContent.trim() || addingNote}>
              {addingNote ? "Adding..." : "Add note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
