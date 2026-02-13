import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { api } from "@/data/api";
import { useAppState } from "@/state/AppState";
import { extractEmbedUrlFromHtml, getMapEmbedUrl } from "@/lib/maps";
import type { Event } from "@/types/budget";
import { EventDetailsCard } from "./EventDetailsCard";
import { EventLocationCard } from "./EventLocationCard";
import { EventMilestonesCard } from "./EventMilestonesCard";
import { EventAssignmentsCard } from "./EventAssignmentsCard";
import { EventPackingCard } from "./EventPackingCard";
import { EventVolunteersCard } from "./EventVolunteersCard";
import { EventNotesCard } from "./EventNotesCard";
import { EditEventDialog } from "./EditEventDialog";
import { ArrowLeft, Pencil } from "lucide-react";

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { budgets, scenarios } = useAppState();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

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

  const refresh = async () => {
    if (!id) return;
    const isInitialLoad = !event || event.id !== id;
    if (isInitialLoad) setLoading(true);
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
      if (isInitialLoad) setLoading(false);
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

  const handleAddMilestone = async (payload: {
    month: number;
    year: number;
    description: string;
    due_date: string;
  }) => {
    if (!id) return;
    await api.events.milestones.create(id, payload);
    await refresh();
  };

  const handleToggleMilestoneComplete = async (mid: string, completed: boolean) => {
    if (!id) return;
    await api.events.milestones.update(id, mid, { completed });
    await refresh();
  };

  const handleDeleteMilestone = async (mid: string) => {
    if (!id) return;
    await api.events.milestones.delete(id, mid);
    await refresh();
  };

  const handleEditMilestone = async (
    mid: string,
    payload: { month: number; year: number; description: string; due_date: string }
  ) => {
    if (!id) return;
    await api.events.milestones.update(id, mid, payload);
    await refresh();
  };

  const handleAddPackingCategory = async (name: string) => {
    if (!id) return;
    await api.events.packingCategories.create(id, { name });
    await refresh();
  };

  const handleAddPackingItem = async (payload: {
    category_id: string;
    name: string;
    quantity?: number;
    note?: string;
  }) => {
    if (!id) return;
    await api.events.packingItems.create(id, payload);
    await refresh();
  };

  const handleEditPackingItem = async (
    pid: string,
    payload: { category_id?: string; name?: string; quantity?: number; note?: string }
  ) => {
    if (!id) return;
    await api.events.packingItems.update(id, pid, payload);
    await refresh();
  };

  const handleTogglePackingLoaded = async (pid: string, loaded: boolean) => {
    if (!id) return;
    await api.events.packingItems.update(id, pid, { loaded });
    await refresh();
  };

  const handleDeletePackingItem = async (pid: string) => {
    if (!id) return;
    await api.events.packingItems.delete(id, pid);
    await refresh();
  };

  const handleAddVolunteer = async (payload: { name: string; department: string }) => {
    if (!id) return;
    await api.events.volunteers.create(id, payload);
    await refresh();
  };

  const handleDeleteVolunteer = async (vid: string) => {
    if (!id) return;
    await api.events.volunteers.delete(id, vid);
    await refresh();
  };

  const handleCreateRole = async (payload: { name: string; category: "planning" | "during" }) => {
    if (!id) return;
    await api.events.assignments.create(id, payload);
    await refresh();
  };

  const handleDeleteRole = async (aid: string) => {
    if (!id) return;
    await api.events.assignments.delete(id, aid);
    await refresh();
  };

  const handleAddMemberToRole = async (aid: string, memberId: string) => {
    if (!id) return;
    await api.events.assignments.addMember(id, aid, memberId);
    await refresh();
  };

  const handleRemoveMemberFromRole = async (aid: string, memberId: string) => {
    if (!id) return;
    await api.events.assignments.removeMember(id, aid, memberId);
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

  const mapEmbedUrl = event.event_location_embed ?? getMapEmbedUrl(event.event_location);
  const budgetName = budgets.find((b) => b.id === event.budget_id)?.name;
  const scenarioName = scenarios.find((s) => s.id === event.scenario_id)?.name;

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
        <EventDetailsCard
          event={event}
          budgetName={budgetName}
          scenarioName={scenarioName}
        />
        {mapEmbedUrl && <EventLocationCard mapEmbedUrl={mapEmbedUrl} />}
      </div>

      <EventMilestonesCard
        event={event}
        onRefresh={refresh}
        onToggleComplete={handleToggleMilestoneComplete}
        onDelete={handleDeleteMilestone}
        onAdd={handleAddMilestone}
        onEdit={handleEditMilestone}
      />

      <EventAssignmentsCard
        event={event}
        onCreateRole={handleCreateRole}
        onDeleteRole={handleDeleteRole}
        onAddMember={handleAddMemberToRole}
        onRemoveMember={handleRemoveMemberFromRole}
      />

      <EventPackingCard
        event={event}
        onAddCategory={handleAddPackingCategory}
        onAddItem={handleAddPackingItem}
        onEditItem={handleEditPackingItem}
        onToggleLoaded={handleTogglePackingLoaded}
        onDeleteItem={handleDeletePackingItem}
      />

      <EventVolunteersCard
        event={event}
        onDelete={handleDeleteVolunteer}
        onAdd={handleAddVolunteer}
      />

      <EventNotesCard planningNotes={event.planning_notes} />

      <EditEventDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        editName={editName}
        setEditName={setEditName}
        editDescription={editDescription}
        setEditDescription={setEditDescription}
        editYear={editYear}
        setEditYear={setEditYear}
        editEventDate={editEventDate}
        setEditEventDate={setEditEventDate}
        editEventUrl={editEventUrl}
        setEditEventUrl={setEditEventUrl}
        editEventLocation={editEventLocation}
        setEditEventLocation={setEditEventLocation}
        editEventLocationEmbed={editEventLocationEmbed}
        setEditEventLocationEmbed={setEditEventLocationEmbed}
        editGaTicketCost={editGaTicketCost}
        setEditGaTicketCost={setEditGaTicketCost}
        editDayPassCost={editDayPassCost}
        setEditDayPassCost={setEditDayPassCost}
        editGaTicketsSold={editGaTicketsSold}
        setEditGaTicketsSold={setEditGaTicketsSold}
        editDayPassesSold={editDayPassesSold}
        setEditDayPassesSold={setEditDayPassesSold}
        editBudgetId={editBudgetId}
        setEditBudgetId={setEditBudgetId}
        editScenarioId={editScenarioId}
        setEditScenarioId={setEditScenarioId}
        editPlanningNotes={editPlanningNotes}
        setEditPlanningNotes={setEditPlanningNotes}
        budgets={budgets}
        scenarios={scenarios}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
