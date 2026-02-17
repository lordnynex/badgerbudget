import { Suspense, useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/data/api";
import type { MailingList, ListPreview } from "@/types/contact";
import { contactsToVCardFile } from "@/lib/vcard";
import { ArrowLeft, Plus, Pencil, Trash2, Download, Mail, Users } from "lucide-react";
import { AddContactToMailingListDialog } from "./AddContactToMailingListDialog";
import { useMailingListsSuspense, useEventsSuspense, useMailingListSuspense, useMailingListPreview, useInvalidateQueries } from "@/queries/hooks";
import { PageLoading } from "@/components/layout/PageLoading";

export function MailingListsPanel() {
  const { listId } = useParams<{ listId?: string }>();
  const navigate = useNavigate();
  const invalidate = useInvalidateQueries();
  const { data: listsData } = useMailingListsSuspense();
  const lists = Array.isArray(listsData) ? listsData : [];
  const { data: events } = useEventsSuspense();
  const [searchParams, setSearchParams] = useSearchParams();
  const [createOpen, setCreateOpen] = useState(searchParams.get("create") === "1");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newListType, setNewListType] = useState<MailingList["list_type"]>("static");
  const [newDeliveryType, setNewDeliveryType] = useState<MailingList["delivery_type"]>("both");
  const [newEventId, setNewEventId] = useState<string>("");

  const refreshLists = () => invalidate.invalidateMailingLists();

  useEffect(() => {
    if (searchParams.get("create") === "1") setCreateOpen(true);
  }, [searchParams]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await api.mailingLists.create({
      name: newName.trim(),
      description: newDescription.trim() || undefined,
      list_type: newListType,
      delivery_type: newDeliveryType,
      event_id: (newEventId && newEventId !== "__none__") ? newEventId : null,
    });
    setNewName("");
    setNewDescription("");
    setNewListType("static");
    setNewDeliveryType("both");
    setNewEventId("");
    setCreateOpen(false);
    setSearchParams((p) => {
      const next = new URLSearchParams(p);
      next.delete("create");
      return next;
    });
    refreshLists();
  };

  if (listId) {
    return (
      <Suspense fallback={<PageLoading />}>
        <MailingListDetail
          listId={listId}
          events={events}
          onBack={() => navigate("/contacts/lists")}
          invalidate={invalidate}
        />
      </Suspense>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mailing Lists</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage mailing lists for physical invitations and email campaigns.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          New list
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {lists.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No mailing lists yet. Create one to get started.
            </div>
          ) : (
            <div className="space-y-2">
              {lists.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`/contacts/lists/${l.id}`)}
                >
                  <div>
                    <p className="font-medium">{l.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {l.delivery_type ?? "both"} • {l.member_count ?? 0} members
                      {l.event_id && events.find((e) => e.id === l.event_id) && (
                        <> • {events.find((e) => e.id === l.event_id)!.name}</>
                      )}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/contacts/lists/${l.id}`); }}>
                    Open
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) setSearchParams((p) => { const n = new URLSearchParams(p); n.delete("create"); return n; });
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create mailing list</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Badger South 2026 Invitations" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Optional" />
            </div>
            <div>
              <Label>Delivery type</Label>
              <Select value={newDeliveryType} onValueChange={(v) => setNewDeliveryType(v as MailingList["delivery_type"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physical">Physical mail only</SelectItem>
                  <SelectItem value="email">Email only</SelectItem>
                  <SelectItem value="both">Both (physical + email)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>List type</Label>
              <Select value={newListType} onValueChange={(v) => setNewListType(v as MailingList["list_type"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="static">Static (manual members)</SelectItem>
                  <SelectItem value="dynamic">Dynamic (rules-based)</SelectItem>
                  <SelectItem value="hybrid">Hybrid (rules + manual)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Event (optional)</Label>
              <Select value={newEventId || "__none__"} onValueChange={(v) => setNewEventId(v === "__none__" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {events.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MailingListDetail({
  listId,
  events,
  onBack,
  invalidate,
}: {
  listId: string;
  events: Array<{ id: string; name: string }>;
  onBack: () => void;
  invalidate: ReturnType<typeof useInvalidateQueries>;
}) {
  const navigate = useNavigate();
  const { data: selectedList } = useMailingListSuspense(listId);
  const { data: preview } = useMailingListPreview(listId);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(selectedList.name);
  const [editDescription, setEditDescription] = useState(selectedList.description ?? "");
  const [editDeliveryType, setEditDeliveryType] = useState(selectedList.delivery_type ?? "both");
  const [addMemberOpen, setAddMemberOpen] = useState(false);

  const refreshList = () => {
    invalidate.invalidateMailingList(listId);
  };

  const handleCreateBatch = async () => {
    const batch = await api.mailingBatches.create(
      selectedList.id,
      `${selectedList.name} - ${new Date().toISOString().slice(0, 10)}`
    );
    if (batch) navigate(`/contacts/batches/${batch.id}`);
  };

  const handleExportVCard = () => {
    if (!preview || preview.included.length === 0) return;
    const contacts = preview.included.map((i) => i.contact);
    const vcf = contactsToVCardFile(contacts);
    const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedList.name}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteList = async () => {
    if (!confirm("Delete this mailing list?")) return;
    await api.mailingLists.delete(selectedList.id);
    onBack();
    invalidate.invalidateMailingLists();
  };

  const handleSaveEdit = async () => {
    await api.mailingLists.update(selectedList.id, { name: editName, description: editDescription, delivery_type: editDeliveryType });
    setEditOpen(false);
    refreshList();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Back to Lists
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAddMemberOpen(true)}>
            <Users className="size-4" />
            Add Contacts
          </Button>
          <Button variant="outline" onClick={handleExportVCard} disabled={!preview || preview.totalIncluded === 0}>
            <Download className="size-4" />
            Export vCard
          </Button>
          <Button onClick={handleCreateBatch} disabled={!preview || preview.totalIncluded === 0}>
            <Mail className="size-4" />
            Create mailing batch
          </Button>
          <Button variant="outline" onClick={() => { setEditName(selectedList.name); setEditDescription(selectedList.description ?? ""); setEditDeliveryType(selectedList.delivery_type ?? "both"); setEditOpen(true); }}>
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleDeleteList} className="text-destructive hover:text-destructive">
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{selectedList.name}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {selectedList.delivery_type ?? "both"} • {selectedList.list_type} list
            {selectedList.event_id && events.find((e) => e.id === selectedList.event_id) && (
              <> • {events.find((e) => e.id === selectedList.event_id)!.name}</>
            )}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {selectedList.description && (
            <p className="text-muted-foreground">{selectedList.description}</p>
          )}

          <div>
            <h3 className="font-medium">Preview</h3>
            <p className="text-sm text-muted-foreground">
              {preview?.totalIncluded ?? 0} included, {preview?.totalExcluded ?? 0} excluded
            </p>
            {preview && preview.excluded.length > 0 && (
              <div className="mt-2 rounded-lg border p-3">
                <p className="text-sm font-medium">Excluded ({preview.excluded.length})</p>
                <ul className="mt-1 max-h-48 overflow-y-auto space-y-1 text-sm text-muted-foreground">
                  {preview.excluded.map((e, i) => {
                    const canRemoveFromList = e.canRemoveFromList === true;
                    const canReinstate = e.removable === true;
                    return (
                      <li key={`${e.contact.id}-${i}`} className="flex items-center justify-between gap-2">
                        <span>
                          {e.contact.display_name} – {e.reason}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {canReinstate && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={async () => {
                                try {
                                  await api.mailingLists.reinstateMember(selectedList.id, e.contact.id);
                                  refreshList();
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                            >
                              Reinstate
                            </Button>
                          )}
                          {canRemoveFromList && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-destructive hover:text-destructive"
                              onClick={async () => {
                                try {
                                  await api.mailingLists.removeMember(selectedList.id, e.contact.id);
                                  refreshList();
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AddContactToMailingListDialog
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        listId={selectedList.id}
        onSuccess={refreshList}
      />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit mailing list</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            </div>
            <div>
              <Label>Delivery type</Label>
              <Select value={editDeliveryType} onValueChange={(v) => setEditDeliveryType(v as MailingList["delivery_type"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physical">Physical mail only</SelectItem>
                  <SelectItem value="email">Email only</SelectItem>
                  <SelectItem value="both">Both (physical + email)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
