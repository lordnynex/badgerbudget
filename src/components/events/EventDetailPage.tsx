import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  ChevronDown,
  Package,
  Users,
  Flag,
} from "lucide-react";
import { api } from "@/data/api";
import { useAppState } from "@/state/AppState";
import { extractEmbedUrlFromHtml, getMapEmbedUrl } from "@/lib/maps";
import type {
  Event,
  EventPackingItem,
  EventPlanningMilestone,
  EventVolunteer,
} from "@/types/budget";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Separate from budget categories - for load out packing items
const LOAD_OUT_PACKING_CATEGORIES = [
  "Tools & Equipment",
  "Safety",
  "Cables & Power",
  "Documents",
  "Food & Beverage",
  "Office Supplies",
  "Miscellaneous",
];

function formatMilestone(m: EventPlanningMilestone) {
  return `${MONTHS[m.month - 1] ?? m.month} ${m.year}: ${m.description}`;
}

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { budgets, scenarios } = useAppState();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [milestoneOpen, setMilestoneOpen] = useState(false);
  const [packingOpen, setPackingOpen] = useState(false);
  const [volunteerOpen, setVolunteerOpen] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editYear, setEditYear] = useState<number | "">("");
  const [editEventDate, setEditEventDate] = useState("");
  const [editEventUrl, setEditEventUrl] = useState("");
  const [editEventLocation, setEditEventLocation] = useState("");
  const [editEventLocationEmbed, setEditEventLocationEmbed] = useState("");
  const [editGaTicketCost, setEditGaTicketCost] = useState<string>("");
  const [editDayPassCost, setEditDayPassCost] = useState<string>("");
  const [editGaTicketsSold, setEditGaTicketsSold] = useState<string>("");
  const [editDayPassesSold, setEditDayPassesSold] = useState<string>("");
  const [editBudgetId, setEditBudgetId] = useState<string>("");
  const [editScenarioId, setEditScenarioId] = useState<string>("");
  const [editPlanningNotes, setEditPlanningNotes] = useState("");

  // Milestone form
  const [milestoneMonth, setMilestoneMonth] = useState(1);
  const [milestoneYear, setMilestoneYear] = useState(new Date().getFullYear());
  const [milestoneDesc, setMilestoneDesc] = useState("");

  // Packing form
  const [packingCategory, setPackingCategory] = useState(LOAD_OUT_PACKING_CATEGORIES[0]);
  const [packingName, setPackingName] = useState("");

  // Volunteer form
  const [volunteerName, setVolunteerName] = useState("");
  const [volunteerDept, setVolunteerDept] = useState("");

  const refresh = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const e = await api.events.get(id);
      setEvent(e ?? null);
      if (e) {
        setEditName(e.name);
        setEditDescription(e.description ?? "");
        setEditYear(e.year ?? "");
        setEditEventDate(e.event_date ?? "");
        setEditEventUrl(e.event_url ?? "");
        setEditEventLocation(e.event_location ?? "");
        setEditEventLocationEmbed(e.event_location_embed ?? "");
        setEditGaTicketCost(e.ga_ticket_cost != null ? String(e.ga_ticket_cost) : "");
        setEditDayPassCost(e.day_pass_cost != null ? String(e.day_pass_cost) : "");
        setEditGaTicketsSold(e.ga_tickets_sold != null ? String(e.ga_tickets_sold) : "");
        setEditDayPassesSold(e.day_passes_sold != null ? String(e.day_passes_sold) : "");
        setEditBudgetId(e.budget_id ?? "");
        setEditScenarioId(e.scenario_id ?? "");
        setEditPlanningNotes(e.planning_notes ?? "");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [id]);

  const handleSaveEdit = async () => {
    if (!id) return;
    await api.events.update(id, {
      name: editName,
      description: editDescription || undefined,
      year: editYear === "" ? undefined : Number(editYear),
      event_date: editEventDate || undefined,
      event_url: editEventUrl || undefined,
      event_location: editEventLocation || undefined,
      event_location_embed: extractEmbedUrlFromHtml(editEventLocationEmbed) || undefined,
      ga_ticket_cost: editGaTicketCost === "" ? undefined : parseFloat(editGaTicketCost),
      day_pass_cost: editDayPassCost === "" ? undefined : parseFloat(editDayPassCost),
      ga_tickets_sold: editGaTicketsSold === "" ? undefined : parseFloat(editGaTicketsSold),
      day_passes_sold: editDayPassesSold === "" ? undefined : parseFloat(editDayPassesSold),
      budget_id: editBudgetId || undefined,
      scenario_id: editScenarioId || undefined,
      planning_notes: editPlanningNotes || undefined,
    });
    setEditOpen(false);
    await refresh();
  };

  const handleAddMilestone = async () => {
    if (!id || !milestoneDesc.trim()) return;
    await api.events.milestones.create(id, {
      month: milestoneMonth,
      year: milestoneYear,
      description: milestoneDesc.trim(),
    });
    setMilestoneDesc("");
    setMilestoneOpen(false);
    await refresh();
  };

  const handleDeleteMilestone = async (mid: string) => {
    if (!id) return;
    await api.events.milestones.delete(id, mid);
    await refresh();
  };

  const handleAddPacking = async () => {
    if (!id || !packingName.trim()) return;
    await api.events.packingItems.create(id, {
      category: packingCategory,
      name: packingName.trim(),
    });
    setPackingName("");
    setPackingOpen(false);
    await refresh();
  };

  const handleDeletePacking = async (pid: string) => {
    if (!id) return;
    await api.events.packingItems.delete(id, pid);
    await refresh();
  };

  const handleUpdatePackingCategory = async (pid: string, category: string) => {
    if (!id) return;
    await api.events.packingItems.update(id, pid, { category });
    await refresh();
  };

  const handleAddVolunteer = async () => {
    if (!id || !volunteerName.trim() || !volunteerDept.trim()) return;
    await api.events.volunteers.create(id, {
      name: volunteerName.trim(),
      department: volunteerDept.trim(),
    });
    setVolunteerName("");
    setVolunteerDept("");
    setVolunteerOpen(false);
    await refresh();
  };

  const handleDeleteVolunteer = async (vid: string) => {
    if (!id) return;
    await api.events.volunteers.delete(id, vid);
    await refresh();
  };

  if (loading || !event) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-muted-foreground">
          {loading ? "Loading..." : "Event not found"}
        </p>
      </div>
    );
  }

  const packingByCategory = (event.packingItems ?? []).reduce(
    (acc, item) => {
      (acc[item.category] ??= []).push(item);
      return acc;
    },
    {} as Record<string, EventPackingItem[]>
  );

  const packingCategories = [
    ...LOAD_OUT_PACKING_CATEGORIES,
    ...(event.packingItems ?? [])
      .map((p) => p.category)
      .filter((c) => !LOAD_OUT_PACKING_CATEGORIES.includes(c))
      .filter((c, i, arr) => arr.indexOf(c) === i),
  ];

  const mapEmbedUrl = event.event_location_embed ?? getMapEmbedUrl(event.event_location);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/events")}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{event.name}</h1>
          {event.year != null && (
            <p className="text-muted-foreground text-sm">{event.year}</p>
          )}
        </div>
        <Button onClick={() => setEditOpen(true)}>
          <Pencil className="size-4" />
          Edit Event
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Event Details</CardTitle>
            <CardDescription>Key information about this event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.event_date && (
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                <span>{event.event_date}</span>
              </div>
            )}
            {event.event_url && (
              <div className="flex items-center gap-2">
                <ExternalLink className="size-4 text-muted-foreground" />
                <a
                  href={event.event_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Event URL
                </a>
              </div>
            )}
            {event.event_location && (
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" />
                <a
                  href={event.event_location}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View on Map
                </a>
              </div>
            )}
            {(event.ga_ticket_cost != null || event.day_pass_cost != null) && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                {event.ga_ticket_cost != null && (
                  <div>
                    <span className="text-muted-foreground">GA Ticket:</span>{" "}
                    ${event.ga_ticket_cost.toLocaleString()}
                  </div>
                )}
                {event.day_pass_cost != null && (
                  <div>
                    <span className="text-muted-foreground">Day Pass:</span>{" "}
                    ${event.day_pass_cost.toLocaleString()}
                  </div>
                )}
              </div>
            )}
            {(event.ga_tickets_sold != null || event.day_passes_sold != null) && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                {event.ga_tickets_sold != null && (
                  <div>
                    <span className="text-muted-foreground">GA Sold:</span>{" "}
                    {event.ga_tickets_sold}
                  </div>
                )}
                {event.day_passes_sold != null && (
                  <div>
                    <span className="text-muted-foreground">Day Passes Sold:</span>{" "}
                    {event.day_passes_sold}
                  </div>
                )}
              </div>
            )}
            {(event.budget_id || event.scenario_id) && (
              <div className="space-y-2 text-sm">
                {event.budget_id && (
                  <div>
                    <span className="text-muted-foreground">Budget:</span>{" "}
                    {budgets.find((b) => b.id === event.budget_id)?.name ?? event.budget_id}
                  </div>
                )}
                {event.scenario_id && (
                  <div>
                    <span className="text-muted-foreground">Scenario:</span>{" "}
                    {scenarios.find((s) => s.id === event.scenario_id)?.name ?? event.scenario_id}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {mapEmbedUrl && (
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Location</CardTitle>
              <CardDescription>Event venue on map</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Event location"
                className="w-full"
              />
            </CardContent>
          </Card>
        )}
      </div>

      {event.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <Collapsible defaultOpen className="group/collapsible">
          <CardHeader>
            <CollapsibleTrigger className="flex w-full items-center justify-between text-left hover:bg-muted/50 -m-4 p-4 rounded-lg transition-colors">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Flag className="size-4" />
                  Planning Milestones
                </CardTitle>
                <CardDescription>
                  Key deadlines and tasks by month
                </CardDescription>
              </div>
              <ChevronDown className="size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {(event.milestones ?? []).length === 0 ? (
                <p className="text-muted-foreground text-sm">No milestones yet.</p>
              ) : (
                <ul className="space-y-2">
                  {(event.milestones ?? []).map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <span>{formatMilestone(m)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteMilestone(m.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              <Button variant="outline" size="sm" onClick={() => setMilestoneOpen(true)}>
                <Plus className="size-4" />
                Add Milestone
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <Card>
        <Collapsible defaultOpen className="group/collapsible">
          <CardHeader>
            <CollapsibleTrigger className="flex w-full items-center justify-between text-left hover:bg-muted/50 -m-4 p-4 rounded-lg transition-colors">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="size-4" />
                  Load Out Packing List
                </CardTitle>
                <CardDescription>
                  Items to pack, grouped by category
                </CardDescription>
              </div>
              <ChevronDown className="size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {Object.keys(packingByCategory).length === 0 ? (
                <p className="text-muted-foreground text-sm">No packing items yet.</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(packingByCategory).map(([cat, items]) => (
                    <div key={cat}>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">{cat}</h4>
                      <ul className="space-y-1">
                        {items.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-center justify-between gap-2 rounded border px-3 py-2"
                          >
                            <span className="flex-1 min-w-0 truncate">{item.name}</span>
                            <Select
                              value={packingCategories.includes(item.category) ? item.category : "Miscellaneous"}
                              onValueChange={(v) => handleUpdatePackingCategory(item.id, v)}
                            >
                              <SelectTrigger className="h-8 w-[140px] text-xs shrink-0">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {packingCategories.map((c) => (
                                  <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive shrink-0"
                              onClick={() => handleDeletePacking(item.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => setPackingOpen(true)}>
                <Plus className="size-4" />
                Add Item
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <Card>
        <Collapsible defaultOpen className="group/collapsible">
          <CardHeader>
            <CollapsibleTrigger className="flex w-full items-center justify-between text-left hover:bg-muted/50 -m-4 p-4 rounded-lg transition-colors">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="size-4" />
                  Volunteers
                </CardTitle>
                <CardDescription>
                  Volunteer roster and departments
                </CardDescription>
              </div>
              <ChevronDown className="size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {(event.volunteers ?? []).length === 0 ? (
                <p className="text-muted-foreground text-sm">No volunteers yet.</p>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const byDept = (event.volunteers ?? []).reduce(
                      (acc, v) => {
                        (acc[v.department] ??= []).push(v);
                        return acc;
                      },
                      {} as Record<string, EventVolunteer[]>
                    );
                    return Object.entries(byDept).map(([dept, vols]) => (
                      <div key={dept}>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">{dept}</h4>
                        <ul className="space-y-1">
                          {vols.map((v) => (
                            <li
                              key={v.id}
                              className="flex items-center justify-between rounded border px-3 py-2"
                            >
                              <span>{v.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteVolunteer(v.id)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ));
                  })()}
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => setVolunteerOpen(true)}>
                <Plus className="size-4" />
                Add Volunteer
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Planning Notes</CardTitle>
          <CardDescription>Free-form notes about the event</CardDescription>
        </CardHeader>
        <CardContent>
          {event.planning_notes ? (
            <p className="text-muted-foreground whitespace-pre-wrap">{event.planning_notes}</p>
          ) : (
            <p className="text-muted-foreground text-sm italic">No notes yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Edit Event Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto overflow-x-hidden max-w-3xl w-[calc(100vw-2rem)]">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <CardDescription>Update event details</CardDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 min-w-0 overflow-hidden">
            <div className="grid gap-4 sm:grid-cols-2 min-w-0">
              <div className="space-y-2 min-w-0">
                <Label>Name</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Event name" />
              </div>
              <div className="space-y-2 min-w-0">
                <Label>Year</Label>
                <Input
                  type="number"
                  value={editYear}
                  onChange={(e) => setEditYear(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                  placeholder="2025"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={2} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 min-w-0">
              <div className="space-y-2 min-w-0">
                <Label>Event Date</Label>
                <Input
                  type="date"
                  value={editEventDate}
                  onChange={(e) => setEditEventDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Event URL</Label>
                <Input value={editEventUrl} onChange={(e) => setEditEventUrl(e.target.value)} placeholder="https://..." />
              </div>
            </div>
            <div className="space-y-2 min-w-0">
              <Label>Event Location (Google Maps link)</Label>
              <Input
                value={editEventLocation}
                onChange={(e) => setEditEventLocation(e.target.value)}
                placeholder="https://maps.google.com/... or maps.app.goo.gl/..."
              />
            </div>
            <div className="space-y-2 min-w-0">
              <Label>Map Embed (optional)</Label>
              <Textarea
                value={editEventLocationEmbed}
                onChange={(e) => setEditEventLocationEmbed(e.target.value)}
                placeholder="Paste the iframe HTML from Google Maps (Share → Embed a map). Overrides the link above for the mini map."
                rows={3}
                className="font-mono text-sm w-full min-w-0 overflow-x-auto"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>GA Ticket Cost ($)</Label>
                <Input
                  type="number"
                  value={editGaTicketCost}
                  onChange={(e) => setEditGaTicketCost(e.target.value)}
                  placeholder="200"
                />
              </div>
              <div className="space-y-2">
                <Label>Day Pass Cost ($)</Label>
                <Input
                  type="number"
                  value={editDayPassCost}
                  onChange={(e) => setEditDayPassCost(e.target.value)}
                  placeholder="50"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>GA Tickets Sold</Label>
                <Input
                  type="number"
                  value={editGaTicketsSold}
                  onChange={(e) => setEditGaTicketsSold(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Day Passes Sold</Label>
                <Input
                  type="number"
                  value={editDayPassesSold}
                  onChange={(e) => setEditDayPassesSold(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Budget</Label>
                <Select value={editBudgetId || "none"} onValueChange={(v) => setEditBudgetId(v === "none" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {budgets.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name} ({b.year})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Scenario</Label>
                <Select value={editScenarioId || "none"} onValueChange={(v) => setEditScenarioId(v === "none" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {scenarios.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Planning Notes</Label>
              <Textarea
                value={editPlanningNotes}
                onChange={(e) => setEditPlanningNotes(e.target.value)}
                placeholder="Free-form notes..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Milestone Dialog */}
      <Dialog open={milestoneOpen} onOpenChange={setMilestoneOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Planning Milestone</DialogTitle>
            <CardDescription>e.g. February: Decide ticket costs</CardDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Month</Label>
                <Select value={String(milestoneMonth)} onValueChange={(v) => setMilestoneMonth(parseInt(v, 10))}>
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
                  onChange={(e) => setMilestoneYear(parseInt(e.target.value, 10) || new Date().getFullYear())}
                />
              </div>
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
            <Button variant="outline" onClick={() => setMilestoneOpen(false)}>Cancel</Button>
            <Button onClick={handleAddMilestone}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Packing Item Dialog */}
      <Dialog open={packingOpen} onOpenChange={setPackingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Packing Item</DialogTitle>
            <CardDescription>Add an item to the load out list</CardDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={packingCategory} onValueChange={setPackingCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOAD_OUT_PACKING_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Item Name</Label>
              <Input value={packingName} onChange={(e) => setPackingName(e.target.value)} placeholder="e.g. Extension cords" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPackingOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPacking}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Volunteer Dialog */}
      <Dialog open={volunteerOpen} onOpenChange={setVolunteerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Volunteer</DialogTitle>
            <CardDescription>Add a volunteer and their department</CardDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={volunteerName} onChange={(e) => setVolunteerName(e.target.value)} placeholder="Volunteer name" />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input value={volunteerDept} onChange={(e) => setVolunteerDept(e.target.value)} placeholder="e.g. Registration, Food, Setup" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVolunteerOpen(false)}>Cancel</Button>
            <Button onClick={handleAddVolunteer}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
