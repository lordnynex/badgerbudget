import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/data/api";
import type { Contact, MailingList } from "@/types/contact";
import { contactsToVCardFile } from "@/lib/vcard";
import { ArrowLeft, Pencil, Download, Trash2, RotateCcw } from "lucide-react";
import { EditContactDialog } from "./EditContactDialog";

export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [listsWithContact, setListsWithContact] = useState<MailingList[]>([]);

  const refresh = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const c = await api.contacts.get(id);
      setContact(c ?? null);
      if (c) {
        const allLists = await api.mailingLists.list();
        const members = await Promise.all(
          allLists.map(async (l) => {
            const mems = await api.mailingLists.getMembers(l.id);
            return mems.some((m) => m.contact_id === id) ? l : null;
          })
        );
        setListsWithContact(members.filter(Boolean) as MailingList[]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [id]);

  const handleExportVCard = () => {
    if (!contact) return;
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
    if (!id || !confirm("Soft delete this contact? You can restore it later.")) return;
    await api.contacts.delete(id);
    navigate("/contacts");
  };

  const handleRestore = async () => {
    if (!id) return;
    await api.contacts.restore(id);
    refresh();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading contact...
        </CardContent>
      </Card>
    );
  }

  if (!contact) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/contacts")}>
          <ArrowLeft className="size-4" />
          Back to Contacts
        </Button>
        <p className="text-muted-foreground">Contact not found.</p>
      </div>
    );
  }

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

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{contact.display_name}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {contact.type} • {contact.status}
            {contact.organization_name && ` • ${contact.organization_name}`}
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
              <TabsTrigger value="emails">Emails & Phones</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="membership">Membership</TabsTrigger>
              <TabsTrigger value="lists">Mailing Lists</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-4 space-y-4">
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
                <div>
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
            </TabsContent>

            <TabsContent value="addresses" className="mt-4">
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
            </TabsContent>

            <TabsContent value="emails" className="mt-4">
              <div className="space-y-4">
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
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                <p className="mt-1 whitespace-pre-wrap">{contact.notes ?? "—"}</p>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">How we know them</p>
                <p className="mt-1">{contact.how_we_know_them ?? "—"}</p>
              </div>
            </TabsContent>

            <TabsContent value="membership" className="mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Club name</p>
                  <p>{contact.club_name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Role / title</p>
                  <p>{contact.role ?? "—"}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="lists" className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">On these mailing lists</p>
              {listsWithContact.length === 0 ? (
                <p className="mt-1 text-muted-foreground">Not on any lists.</p>
              ) : (
                <ul className="mt-2 space-y-1">
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <EditContactDialog open={editOpen} onOpenChange={setEditOpen} contact={contact} onSuccess={refresh} />
    </div>
  );
}
