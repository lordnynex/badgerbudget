import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
import { Check, ChevronDown, Flag, Pencil, Plus, Trash2 } from "lucide-react";
import { formatDueDate, getLastDayOfMonth, MONTHS } from "./eventUtils";
import type { Event, EventPlanningMilestone } from "@/types/budget";

interface EventMilestonesCardProps {
  event: Event;
  onRefresh: () => Promise<void>;
  onToggleComplete: (mid: string, completed: boolean) => Promise<void>;
  onDelete: (mid: string) => Promise<void>;
  onAdd: (payload: {
    month: number;
    year: number;
    description: string;
    due_date: string;
  }) => Promise<void>;
  onEdit: (
    mid: string,
    payload: { month: number; year: number; description: string; due_date: string }
  ) => Promise<void>;
}

export function EventMilestonesCard({
  event,
  onRefresh,
  onToggleComplete,
  onDelete,
  onAdd,
  onEdit,
}: EventMilestonesCardProps) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [milestoneMonth, setMilestoneMonth] = useState(1);
  const [milestoneYear, setMilestoneYear] = useState(new Date().getFullYear());
  const [milestoneDesc, setMilestoneDesc] = useState("");
  const [milestoneDueDate, setMilestoneDueDate] = useState("");

  const isEditing = editingId != null;

  const openAdd = () => {
    setEditingId(null);
    setMilestoneMonth(1);
    setMilestoneYear(new Date().getFullYear());
    setMilestoneDesc("");
    setMilestoneDueDate(getLastDayOfMonth(new Date().getFullYear(), 1));
    setOpen(true);
  };

  const openEdit = (m: EventPlanningMilestone) => {
    setEditingId(m.id);
    setMilestoneMonth(m.month);
    setMilestoneYear(m.year);
    setMilestoneDesc(m.description);
    setMilestoneDueDate(m.due_date ?? getLastDayOfMonth(m.year, m.month));
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!milestoneDesc.trim()) return;
    const dueDate = milestoneDueDate || getLastDayOfMonth(milestoneYear, milestoneMonth);
    const payload = {
      month: milestoneMonth,
      year: milestoneYear,
      description: milestoneDesc.trim(),
      due_date: dueDate,
    };
    if (isEditing) {
      await onEdit(editingId!, payload);
    } else {
      await onAdd(payload);
    }
    setMilestoneDesc("");
    setMilestoneDueDate("");
    setEditingId(null);
    setOpen(false);
  };

  const milestones = event.milestones ?? [];
  const completed = milestones.filter((m) => m.completed).length;
  const total = milestones.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const today = new Date().toISOString().slice(0, 10);
  const overdue = milestones.filter((m) => !m.completed && m.due_date && m.due_date < today);

  const byMonth = milestones.reduce(
    (acc, m) => {
      const key = `${m.year}-${String(m.month).padStart(2, "0")}`;
      (acc[key] ??= []).push(m);
      return acc;
    },
    {} as Record<string, EventPlanningMilestone[]>
  );
  const sortedMonths = Object.keys(byMonth).sort();

  return (
    <>
      <Card id="milestones" className="scroll-mt-28">
        <Collapsible defaultOpen className="group/collapsible">
          <CardHeader>
            <CollapsibleTrigger className="flex w-full items-center justify-between text-left hover:bg-muted/50 -m-4 p-4 rounded-lg transition-colors">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Flag className="size-4" />
                  Planning Milestones
                </CardTitle>
                <CardDescription>Key deadlines and tasks by month</CardDescription>
              </div>
              <ChevronDown className="size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-3">
              {total === 0 ? (
                <p className="text-muted-foreground text-sm">No milestones yet.</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        pct === 100
                          ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                          : pct >= 50
                            ? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                            : "bg-blue-500/20 text-blue-700 dark:text-blue-400"
                      }`}
                    >
                      {completed} of {total} complete ({pct}%)
                    </span>
                    {overdue.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-400">
                          {overdue.length} overdue
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {overdue.map((m) => m.description).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {sortedMonths.map((key) => {
                      const [y, m] = key.split("-").map(Number);
                      const year = y ?? new Date().getFullYear();
                      const month = m ?? 1;
                      const items = [...(byMonth[key] ?? [])].sort(
                        (a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? "")
                      );
                      return (
                        <div key={key}>
                          <h4 className="mb-1 text-xs font-medium text-muted-foreground">
                            {MONTHS[month - 1]} {year}
                          </h4>
                          <ul className="space-y-0.5 pl-3 border-l-2 border-muted">
                            {items.map((m) => {
                              const isOverdue =
                                !m.completed && m.due_date && m.due_date < today;
                              return (
                                <li
                                  key={m.id}
                                  className={`flex items-center justify-between gap-2 rounded border px-2 py-1.5 text-sm ${
                                    m.completed
                                      ? "bg-muted/30 opacity-75"
                                      : isOverdue
                                        ? "border-red-500/50 bg-red-500/5"
                                        : ""
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onToggleComplete(m.id, !m.completed)
                                      }
                                      className="shrink-0 flex size-4 items-center justify-center rounded border border-muted-foreground/50 transition-colors hover:border-muted-foreground"
                                      aria-label={m.completed ? "Mark incomplete" : "Mark complete"}
                                    >
                                      {m.completed && <Check className="size-2.5" />}
                                    </button>
                                    <span
                                      className={
                                        m.completed ? "line-through text-muted-foreground" : ""
                                      }
                                    >
                                      {m.description}
                                    </span>
                                    <span
                                      className={`text-xs shrink-0 ${
                                        isOverdue ? "font-medium text-red-600 dark:text-red-400" : "text-muted-foreground"
                                      }`}
                                    >
                                      {m.due_date ? formatDueDate(m.due_date) : ""}
                                      {isOverdue && " (overdue)"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                      onClick={() => openEdit(m)}
                                      aria-label="Edit milestone"
                                    >
                                      <Pencil className="size-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                      onClick={() => onDelete(m.id)}
                                    >
                                      <Trash2 className="size-3" />
                                    </Button>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={openAdd}>
                <Plus className="size-4" />
                Add Milestone
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditingId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Planning Milestone" : "Add Planning Milestone"}</DialogTitle>
            <CardDescription>e.g. February: Decide ticket costs</CardDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Month</Label>
                <Select
                  value={String(milestoneMonth)}
                  onValueChange={(v) => {
                    const m = parseInt(v, 10);
                    setMilestoneMonth(m);
                    setMilestoneDueDate(getLastDayOfMonth(milestoneYear, m));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => (
                      <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input
                  type="number"
                  value={milestoneYear}
                  onChange={(e) => {
                    const y = parseInt(e.target.value, 10) || new Date().getFullYear();
                    setMilestoneYear(y);
                    setMilestoneDueDate(getLastDayOfMonth(y, milestoneMonth));
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={milestoneDueDate}
                onChange={(e) => setMilestoneDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={milestoneDesc}
                onChange={(e) => setMilestoneDesc(e.target.value)}
                placeholder="e.g. Send save the date mailer"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{isEditing ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
