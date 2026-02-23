import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/trpc";
import { EVENT_TYPE_LABELS } from "@/lib/event-constants";
import type { EventType } from "@badgerbudget/shared/types/event";

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (eventId: string) => void;
  /** When on Rides page, pre-select event_type as "rides" */
  defaultEventType?: EventType;
}

export function AddEventDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultEventType = "badger",
}: AddEventDialogProps) {
  const [name, setName] = useState("");
  const [eventType, setEventType] = useState<EventType>(defaultEventType);
  const [year, setYear] = useState<number | "">(new Date().getFullYear());
  const [eventDate, setEventDate] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const createEventMutation = trpc.admin.events.create.useMutation();

  useEffect(() => {
    if (open) {
      setEventType(defaultEventType);
    }
  }, [open, defaultEventType]);

  const reset = () => {
    setName("");
    setEventType(defaultEventType);
    setYear(new Date().getFullYear());
    setEventDate("");
    setDescription("");
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    setSaving(true);
    try {
      const event = await createEventMutation.mutateAsync({
        name: trimmedName,
        event_type: eventType,
        year: year === "" ? undefined : Number(year),
        event_date: eventDate.trim() || undefined,
        description: description.trim() || undefined,
      });
      reset();
      onOpenChange(false);
      onSuccess(event.id);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create event</DialogTitle>
          <DialogDescription className="sr-only">
            Enter event name, type, year, date, and optional description.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Event name"
            />
          </div>
          <div className="space-y-2">
            <Label>Event type</Label>
            <Select value={eventType} onValueChange={(v) => setEventType(v as EventType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="badger">{EVENT_TYPE_LABELS.badger}</SelectItem>
                <SelectItem value="anniversary">{EVENT_TYPE_LABELS.anniversary}</SelectItem>
                <SelectItem value="pioneer_run">{EVENT_TYPE_LABELS.pioneer_run}</SelectItem>
                <SelectItem value="rides">{EVENT_TYPE_LABELS.rides}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Year</Label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                placeholder="2025"
              />
            </div>
            <div className="space-y-2">
              <Label>Event date</Label>
              <Input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || saving}>
            {saving ? "Creating..." : "Create event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
