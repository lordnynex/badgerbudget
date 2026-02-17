import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/data/api";
import type {
  MailingList,
  ContactEmail,
  ContactPhone,
  ContactAddress,
} from "@/types/contact";
import { contactsToVCardFileAsync } from "@/lib/vcard";
import { ArrowLeft, Pencil, Download, Trash2, RotateCcw, Plus, Trash2Icon, User, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  // Inline edit state for emails, phones, addresses
  const [editingEmailId, setEditingEmailId] = useState<string | null>(null);
  const [editingEmailDraft, setEditingEmailDraft] = useState<{ email: string; type: string; is_primary: boolean }>({ email: "", type: "other", is_primary: false });
  const [addingEmail, setAddingEmail] = useState(false);
  const [newEmailDraft, setNewEmailDraft] = useState<{ email: string; type: string; is_primary: boolean }>({ email: "", type: "other", is_primary: false });

  const [editingPhoneId, setEditingPhoneId] = useState<string | null>(null);
  const [editingPhoneDraft, setEditingPhoneDraft] = useState<{ phone: string; type: string; is_primary: boolean }>({ phone: "", type: "other", is_primary: false });
  const [addingPhone, setAddingPhone] = useState(false);
  const [newPhoneDraft, setNewPhoneDraft] = useState<{ phone: string; type: string; is_primary: boolean }>({ phone: "", type: "other", is_primary: false });

  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editingAddressDraft, setEditingAddressDraft] = useState<Partial<ContactAddress>>({});
  const [addingAddress, setAddingAddress] = useState(false);
  const [newAddressDraft, setNewAddressDraft] = useState<Partial<ContactAddress>>({
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
    type: "home",
    is_primary_mailing: false,
  });

  const [savingContactField, setSavingContactField] = useState(false);
  const [contactFieldError, setContactFieldError] = useState<string | null>(null);

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

  const handleExportVCard = async () => {
    const vcf = await contactsToVCardFileAsync([contact]);
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

  const toEmailPayload = (e: ContactEmail | { email?: string | null; type?: string; is_primary?: boolean }) => ({
    email: String((e as { email?: string }).email ?? "").trim(),
    type: ((e as { type?: string }).type ?? "other") as "work" | "home" | "cell" | "other",
    is_primary: !!(e as { is_primary?: boolean }).is_primary,
  });
  const toPhonePayload = (p: ContactPhone | { phone?: string | null; type?: string; is_primary?: boolean }) => ({
    phone: String((p as { phone?: string }).phone ?? "").trim(),
    type: ((p as { type?: string }).type ?? "other") as "work" | "home" | "cell" | "other",
    is_primary: !!(p as { is_primary?: boolean }).is_primary,
  });
  const toAddressPayload = (a: ContactAddress | Partial<ContactAddress>) => ({
    address_line1: (a.address_line1 ?? "").trim() || null,
    address_line2: (a.address_line2 ?? "").trim() || null,
    city: (a.city ?? "").trim() || null,
    state: (a.state ?? "").trim() || null,
    postal_code: (a.postal_code ?? "").trim() || null,
    country: (a.country ?? "US").trim() || "US",
    type: ((a.type ?? "home") as "home" | "work" | "postal" | "other"),
    is_primary_mailing: !!(a.is_primary_mailing ?? false),
  });

  const saveEmails = async (emails: Array<{ email: string; type: string; is_primary: boolean }>) => {
    setSavingContactField(true);
    setContactFieldError(null);
    try {
      const valid = emails.filter((e) => (e.email ?? "").trim() !== "");
      const updated = await api.contacts.update(id, {
        emails: valid.map((e) => ({ ...toEmailPayload(e), id: "", contact_id: id })),
      });
      if (updated) invalidate.setContactData(id, updated);
      setEditingEmailId(null);
      setAddingEmail(false);
      setNewEmailDraft({ email: "", type: "other", is_primary: false });
    } catch (err) {
      setContactFieldError(err instanceof Error ? err.message : "Failed to save email");
    } finally {
      setSavingContactField(false);
    }
  };

  const savePhones = async (phones: Array<{ phone: string; type: string; is_primary: boolean }>) => {
    setSavingContactField(true);
    setContactFieldError(null);
    try {
      const valid = phones.filter((p) => (p.phone ?? "").trim() !== "");
      const updated = await api.contacts.update(id, {
        phones: valid.map((p) => ({ ...toPhonePayload(p), id: "", contact_id: id })),
      });
      if (updated) invalidate.setContactData(id, updated);
      setEditingPhoneId(null);
      setAddingPhone(false);
      setNewPhoneDraft({ phone: "", type: "other", is_primary: false });
    } catch (err) {
      setContactFieldError(err instanceof Error ? err.message : "Failed to save phone number");
    } finally {
      setSavingContactField(false);
    }
  };

  const saveAddresses = async (addresses: Array<Partial<ContactAddress> & { address_line1?: string | null }>) => {
    setSavingContactField(true);
    setContactFieldError(null);
    try {
      const valid = addresses.filter((a) => (a.address_line1 ?? "").trim() || (a.city ?? "").trim() || (a.postal_code ?? "").trim());
      const updated = await api.contacts.update(id, {
        addresses: valid.map((a) => ({ ...toAddressPayload(a), id: "", contact_id: id })),
      });
      if (updated) invalidate.setContactData(id, updated);
      setEditingAddressId(null);
      setAddingAddress(false);
      setNewAddressDraft({ address_line1: "", address_line2: "", city: "", state: "", postal_code: "", country: "US", type: "home", is_primary_mailing: false });
    } catch (err) {
      setContactFieldError(err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setSavingContactField(false);
    }
  };

  const handleSaveEmail = () => {
    const current = contact.emails ?? [];
    const idx = current.findIndex((e) => e.id === editingEmailId);
    if (idx < 0) return;
    const next = [...current];
    next[idx] = { ...next[idx]!, ...editingEmailDraft };
    saveEmails(next.map(toEmailPayload));
  };

  const handleAddEmail = () => {
    if (!newEmailDraft.email.trim()) return;
    const current = (contact.emails ?? []).map(toEmailPayload);
    saveEmails([...current, newEmailDraft]);
  };

  const handleDeleteEmail = (emailId: string) => {
    if (!confirm("Remove this email?")) return;
    const next = (contact.emails ?? []).filter((e) => e.id !== emailId).map(toEmailPayload);
    saveEmails(next);
  };

  const handleSavePhone = () => {
    const current = contact.phones ?? [];
    const idx = current.findIndex((p) => p.id === editingPhoneId);
    if (idx < 0) return;
    const next = [...current];
    next[idx] = { ...next[idx]!, ...editingPhoneDraft };
    savePhones(next.map(toPhonePayload));
  };

  const handleAddPhone = () => {
    if (!newPhoneDraft.phone.trim()) return;
    const current = (contact.phones ?? []).map(toPhonePayload);
    savePhones([...current, newPhoneDraft]);
  };

  const handleDeletePhone = (phoneId: string) => {
    if (!confirm("Remove this phone number?")) return;
    const next = (contact.phones ?? []).filter((p) => p.id !== phoneId).map(toPhonePayload);
    savePhones(next);
  };

  const handleSaveAddress = () => {
    const current = contact.addresses ?? [];
    const idx = current.findIndex((a) => a.id === editingAddressId);
    if (idx < 0) return;
    const next = [...current];
    next[idx] = { ...next[idx]!, ...editingAddressDraft };
    saveAddresses(next.map(toAddressPayload));
  };

  const handleAddAddress = () => {
    const d = newAddressDraft;
    if (!(d.address_line1 ?? "").trim() && !(d.city ?? "").trim() && !(d.postal_code ?? "").trim()) return;
    const current = (contact.addresses ?? []).map(toAddressPayload);
    saveAddresses([...current, toAddressPayload(d)]);
  };

  const handleDeleteAddress = (addressId: string) => {
    if (!confirm("Remove this address?")) return;
    const next = (contact.addresses ?? []).filter((a) => a.id !== addressId).map(toAddressPayload);
    saveAddresses(next);
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

      <div className="grid gap-6 lg:grid-cols-[1fr,auto] lg:items-start">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-xl">{contact.display_name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {contact.type} • {contact.status}
              {contact.organization_name && ` • ${contact.organization_name}`}
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
          {/* Profile + Photo on same line */}
          <section className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex-1 min-w-0">
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
            </div>
            <div
              className={`size-64 shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center ${
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
                <User className="size-32 text-muted-foreground" />
              )}
            </div>
          </section>

          {contactFieldError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 flex items-center justify-between gap-2" role="alert">
              <p className="text-sm text-destructive font-medium">{contactFieldError}</p>
              <Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={() => setContactFieldError(null)} aria-label="Dismiss error">
                <X className="size-4" />
              </Button>
            </div>
          )}

          {/* Addresses */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Addresses</h3>
              {contact.status !== "deleted" && !addingAddress && (
                <Button variant="outline" size="sm" onClick={() => setAddingAddress(true)}>
                  <Plus className="size-4" />
                  Add address
                </Button>
              )}
            </div>
            {(contact.addresses ?? []).length === 0 && !addingAddress ? (
              <p className="text-muted-foreground">No addresses.</p>
            ) : (
              <div className="space-y-4">
                {(contact.addresses ?? []).map((a) => (
                  <div key={a.id} className="rounded-lg border p-4">
                    {editingAddressId === a.id ? (
                      <div className="space-y-3">
                        <div className="flex gap-2 items-center">
                          <Input
                            value={editingAddressDraft.address_line1 ?? ""}
                            onChange={(e) => setEditingAddressDraft((d) => ({ ...d, address_line1: e.target.value }))}
                            placeholder="Street"
                            className="flex-1"
                          />
                          <Select
                            value={editingAddressDraft.type ?? "home"}
                            onValueChange={(v) => setEditingAddressDraft((d) => ({ ...d, type: v as ContactAddress["type"] }))}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="home">Home</SelectItem>
                              <SelectItem value="work">Work</SelectItem>
                              <SelectItem value="postal">Postal</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Input
                          value={editingAddressDraft.address_line2 ?? ""}
                          onChange={(e) => setEditingAddressDraft((d) => ({ ...d, address_line2: e.target.value }))}
                          placeholder="Apt, suite"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <Input
                            value={editingAddressDraft.city ?? ""}
                            onChange={(e) => setEditingAddressDraft((d) => ({ ...d, city: e.target.value }))}
                            placeholder="City"
                          />
                          <Input
                            value={editingAddressDraft.state ?? ""}
                            onChange={(e) => setEditingAddressDraft((d) => ({ ...d, state: e.target.value }))}
                            placeholder="State"
                          />
                          <Input
                            value={editingAddressDraft.postal_code ?? ""}
                            onChange={(e) => setEditingAddressDraft((d) => ({ ...d, postal_code: e.target.value }))}
                            placeholder="ZIP"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`addr-primary-${a.id}`}
                            checked={editingAddressDraft.is_primary_mailing ?? false}
                            onChange={(e) => setEditingAddressDraft((d) => ({ ...d, is_primary_mailing: e.target.checked }))}
                            className="rounded"
                          />
                          <Label htmlFor={`addr-primary-${a.id}`}>Primary mailing</Label>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveAddress} disabled={savingContactField}>
                            {savingContactField ? "Saving..." : "Save"}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setEditingAddressId(null); setEditingAddressDraft({}); setContactFieldError(null); }}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div>
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
                        {contact.status !== "deleted" && (
                          <div className="flex gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => {
                                setEditingAddressId(a.id);
                                setEditingAddressDraft({ ...a });
                              }}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteAddress(a.id)}
                            >
                              <Trash2Icon className="size-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {addingAddress && (
                  <div className="rounded-lg border border-dashed p-4 space-y-3">
                    <Input
                      value={newAddressDraft.address_line1 ?? ""}
                      onChange={(e) => setNewAddressDraft((d) => ({ ...d, address_line1: e.target.value }))}
                      placeholder="Street"
                    />
                    <Input
                      value={newAddressDraft.address_line2 ?? ""}
                      onChange={(e) => setNewAddressDraft((d) => ({ ...d, address_line2: e.target.value }))}
                      placeholder="Apt, suite"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        value={newAddressDraft.city ?? ""}
                        onChange={(e) => setNewAddressDraft((d) => ({ ...d, city: e.target.value }))}
                        placeholder="City"
                      />
                      <Input
                        value={newAddressDraft.state ?? ""}
                        onChange={(e) => setNewAddressDraft((d) => ({ ...d, state: e.target.value }))}
                        placeholder="State"
                      />
                      <Input
                        value={newAddressDraft.postal_code ?? ""}
                        onChange={(e) => setNewAddressDraft((d) => ({ ...d, postal_code: e.target.value }))}
                        placeholder="ZIP"
                      />
                    </div>
                    <Select value={newAddressDraft.type ?? "home"} onValueChange={(v) => setNewAddressDraft((d) => ({ ...d, type: v as ContactAddress["type"] }))}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">Home</SelectItem>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="postal">Postal</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="new-addr-primary"
                        checked={newAddressDraft.is_primary_mailing ?? false}
                        onChange={(e) => setNewAddressDraft((d) => ({ ...d, is_primary_mailing: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="new-addr-primary">Primary mailing</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleAddAddress} disabled={savingContactField || (!(newAddressDraft.address_line1 ?? "").trim() && !(newAddressDraft.city ?? "").trim() && !(newAddressDraft.postal_code ?? "").trim())}>
                        {savingContactField ? "Adding..." : "Add"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { setAddingAddress(false); setNewAddressDraft({ address_line1: "", address_line2: "", city: "", state: "", postal_code: "", country: "US", type: "home", is_primary_mailing: false }); setContactFieldError(null); }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Emails & Phones */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Emails & Phones</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">Emails</p>
                  {contact.status !== "deleted" && !addingEmail && (
                    <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setAddingEmail(true)}>
                      <Plus className="size-3.5" />
                      Add
                    </Button>
                  )}
                </div>
                {(contact.emails ?? []).length === 0 && !addingEmail ? (
                  <p className="text-muted-foreground text-sm">None</p>
                ) : (
                  <div className="space-y-2">
                    {(contact.emails ?? []).map((e) => (
                      <div key={e.id} className="rounded-lg border p-3 flex items-center justify-between gap-2">
                        {editingEmailId === e.id ? (
                          <div className="flex-1 min-w-0 flex flex-col gap-2">
                            <Input
                              type="email"
                              value={editingEmailDraft.email}
                              onChange={(ev) => setEditingEmailDraft((d) => ({ ...d, email: ev.target.value }))}
                              placeholder="email@example.com"
                              className="h-8"
                            />
                            <div className="flex items-center gap-2">
                              <Select value={editingEmailDraft.type} onValueChange={(v) => setEditingEmailDraft((d) => ({ ...d, type: v }))}>
                                <SelectTrigger className="h-8 w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="work">Work</SelectItem>
                                  <SelectItem value="home">Home</SelectItem>
                                  <SelectItem value="cell">Cell</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <label className="flex items-center gap-1.5 text-sm">
                                <input
                                  type="checkbox"
                                  checked={editingEmailDraft.is_primary}
                                  onChange={(ev) => setEditingEmailDraft((d) => ({ ...d, is_primary: ev.target.checked }))}
                                  className="rounded"
                                />
                                Primary
                              </label>
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" onClick={handleSaveEmail} disabled={savingContactField || !editingEmailDraft.email.trim()}>
                                Save
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => { setEditingEmailId(null); setEditingEmailDraft({ email: "", type: "other", is_primary: false }); setContactFieldError(null); }}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="min-w-0 flex-1">
                              <span className="text-sm">{e.email}</span>
                              {e.is_primary && <span className="text-muted-foreground text-xs ml-1">(primary)</span>}
                              {e.type !== "other" && <span className="text-muted-foreground text-xs ml-1">({e.type})</span>}
                            </div>
                            {contact.status !== "deleted" && (
                              <div className="flex gap-1 shrink-0">
                                <Button variant="ghost" size="icon" className="size-7" onClick={() => { setEditingEmailId(e.id); setEditingEmailDraft({ email: e.email, type: e.type, is_primary: e.is_primary }); }}>
                                  <Pencil className="size-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive" onClick={() => handleDeleteEmail(e.id)}>
                                  <Trash2Icon className="size-3" />
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                    {addingEmail && (
                      <div className="rounded-lg border border-dashed p-3 space-y-2">
                        <Input
                          type="email"
                          value={newEmailDraft.email}
                          onChange={(ev) => setNewEmailDraft((d) => ({ ...d, email: ev.target.value }))}
                          placeholder="email@example.com"
                          className="h-8"
                        />
                        <div className="flex items-center gap-2">
                          <Select value={newEmailDraft.type} onValueChange={(v) => setNewEmailDraft((d) => ({ ...d, type: v }))}>
                            <SelectTrigger className="h-8 w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="work">Work</SelectItem>
                              <SelectItem value="home">Home</SelectItem>
                              <SelectItem value="cell">Cell</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <label className="flex items-center gap-1.5 text-sm">
                            <input type="checkbox" checked={newEmailDraft.is_primary} onChange={(ev) => setNewEmailDraft((d) => ({ ...d, is_primary: ev.target.checked }))} className="rounded" />
                            Primary
                          </label>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" onClick={handleAddEmail} disabled={savingContactField || !newEmailDraft.email.trim()}>
                            Add
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setAddingEmail(false); setNewEmailDraft({ email: "", type: "other", is_primary: false }); setContactFieldError(null); }}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">Phones</p>
                  {contact.status !== "deleted" && !addingPhone && (
                    <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setAddingPhone(true)}>
                      <Plus className="size-3.5" />
                      Add
                    </Button>
                  )}
                </div>
                {(contact.phones ?? []).length === 0 && !addingPhone ? (
                  <p className="text-muted-foreground text-sm">None</p>
                ) : (
                  <div className="space-y-2">
                    {(contact.phones ?? []).map((p) => (
                      <div key={p.id} className="rounded-lg border p-3 flex items-center justify-between gap-2">
                        {editingPhoneId === p.id ? (
                          <div className="flex-1 min-w-0 flex flex-col gap-2">
                            <Input
                              value={editingPhoneDraft.phone}
                              onChange={(ev) => setEditingPhoneDraft((d) => ({ ...d, phone: ev.target.value }))}
                              placeholder="(555) 123-4567"
                              className="h-8"
                            />
                            <div className="flex items-center gap-2">
                              <Select value={editingPhoneDraft.type} onValueChange={(v) => setEditingPhoneDraft((d) => ({ ...d, type: v }))}>
                                <SelectTrigger className="h-8 w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="work">Work</SelectItem>
                                  <SelectItem value="home">Home</SelectItem>
                                  <SelectItem value="cell">Cell</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <label className="flex items-center gap-1.5 text-sm">
                                <input
                                  type="checkbox"
                                  checked={editingPhoneDraft.is_primary}
                                  onChange={(ev) => setEditingPhoneDraft((d) => ({ ...d, is_primary: ev.target.checked }))}
                                  className="rounded"
                                />
                                Primary
                              </label>
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" onClick={handleSavePhone} disabled={savingContactField || !editingPhoneDraft.phone.trim()}>
                                Save
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => { setEditingPhoneId(null); setEditingPhoneDraft({ phone: "", type: "other", is_primary: false }); setContactFieldError(null); }}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="min-w-0 flex-1">
                              <span className="text-sm">{p.phone}</span>
                              {p.is_primary && <span className="text-muted-foreground text-xs ml-1">(primary)</span>}
                              {p.type !== "other" && <span className="text-muted-foreground text-xs ml-1">({p.type})</span>}
                            </div>
                            {contact.status !== "deleted" && (
                              <div className="flex gap-1 shrink-0">
                                <Button variant="ghost" size="icon" className="size-7" onClick={() => { setEditingPhoneId(p.id); setEditingPhoneDraft({ phone: p.phone, type: p.type, is_primary: p.is_primary }); }}>
                                  <Pencil className="size-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive" onClick={() => handleDeletePhone(p.id)}>
                                  <Trash2Icon className="size-3" />
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                    {addingPhone && (
                      <div className="rounded-lg border border-dashed p-3 space-y-2">
                        <Input
                          value={newPhoneDraft.phone}
                          onChange={(ev) => setNewPhoneDraft((d) => ({ ...d, phone: ev.target.value }))}
                          placeholder="(555) 123-4567"
                          className="h-8"
                        />
                        <div className="flex items-center gap-2">
                          <Select value={newPhoneDraft.type} onValueChange={(v) => setNewPhoneDraft((d) => ({ ...d, type: v }))}>
                            <SelectTrigger className="h-8 w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="work">Work</SelectItem>
                              <SelectItem value="home">Home</SelectItem>
                              <SelectItem value="cell">Cell</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <label className="flex items-center gap-1.5 text-sm">
                            <input type="checkbox" checked={newPhoneDraft.is_primary} onChange={(ev) => setNewPhoneDraft((d) => ({ ...d, is_primary: ev.target.checked }))} className="rounded" />
                            Primary
                          </label>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" onClick={handleAddPhone} disabled={savingContactField || !newPhoneDraft.phone.trim()}>
                            Add
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setAddingPhone(false); setNewPhoneDraft({ phone: "", type: "other", is_primary: false }); setContactFieldError(null); }}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
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
