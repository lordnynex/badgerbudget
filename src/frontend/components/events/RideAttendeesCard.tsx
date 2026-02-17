import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, FileCheck } from "lucide-react";
import { api } from "@/data/api";
import type { EventAttendee } from "@/types/event";
import type { Contact } from "@/types/contact";

interface RideAttendeesCardProps {
  eventId: string;
  attendees: EventAttendee[];
  onAdd: (contactId: string, waiverSigned?: boolean) => Promise<void>;
  onUpdateWaiver: (attendeeId: string, waiverSigned: boolean) => Promise<void>;
  onRemove: (attendeeId: string) => Promise<void>;
}

export function RideAttendeesCard({
  eventId,
  attendees,
  onAdd,
  onUpdateWaiver,
  onRemove,
}: RideAttendeesCardProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [waiverChecked, setWaiverChecked] = useState(false);

  const existingIds = new Set(attendees.map((a) => a.contact_id));

  useEffect(() => {
    if (!addOpen) return;
    const t = setTimeout(() => {
      setLoading(true);
      api.contacts
        .list({ q: search || undefined, status: "active", excludeDeceased: true, limit: 50 })
        .then((r) => setContacts(r.contacts))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [addOpen, search]);

  const availableContacts = contacts.filter((c) => !existingIds.has(c.id));

  const handleAdd = async () => {
    if (!selectedId) return;
    await onAdd(selectedId, waiverChecked);
    setSelectedId(null);
    setWaiverChecked(false);
    setAddOpen(false);
  };

  return (
    <Card id="ride-attendees">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Attendees</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Contacts who attended. Toggle waiver status.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
            <Plus className="size-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {attendees.length === 0 ? (
          <p className="text-sm text-muted-foreground">No attendees yet.</p>
        ) : (
          <ul className="space-y-2">
            {attendees.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {a.contact?.display_name ?? a.contact_id}
                  </p>
                </div>
                <label className="flex items-center gap-2 shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={a.waiver_signed}
                    onChange={(e) => onUpdateWaiver(a.id, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <FileCheck className="size-3.5" />
                    Waiver
                  </span>
                </label>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive shrink-0"
                  onClick={() => confirm("Remove attendee?") && onRemove(a.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-h-[90vh] max-w-md">
          <DialogHeader>
            <DialogTitle>Add attendee</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2"
          />
          <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Searching...</p>
            ) : availableContacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No contacts found.</p>
            ) : (
              availableContacts.slice(0, 20).map((c) => (
                <div
                  key={c.id}
                  className={`flex items-center gap-2 rounded p-2 cursor-pointer ${
                    selectedId === c.id ? "bg-primary/10" : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedId(c.id)}
                >
                  <input
                    type="radio"
                    name="contact"
                    checked={selectedId === c.id}
                    onChange={() => setSelectedId(c.id)}
                  />
                  <span className="flex-1 truncate">{c.display_name}</span>
                </div>
              ))
            )}
          </div>
          <label className="flex items-center gap-2 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={waiverChecked}
              onChange={(e) => setWaiverChecked(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Waiver signed</span>
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={!selectedId}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
