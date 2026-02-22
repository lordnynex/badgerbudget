import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { api } from "@/data/api";
import { extractEmbedUrlFromHtml, getMapEmbedUrl } from "@/lib/maps";
import { useEventSuspense, useBudgetsOptional, useScenariosOptional } from "@/queries/hooks";
import { queryKeys } from "@/queries/keys";
import { EventDetailsCard } from "./EventDetailsCard";
import { EventLocationCard } from "./EventLocationCard";
import { EventMilestonesCard } from "./EventMilestonesCard";
import { EventAssignmentsCard } from "./EventAssignmentsCard";
import { EventPackingCard } from "./EventPackingCard";
import { EventVolunteersCard } from "./EventVolunteersCard";
import { EventPhotosCard } from "./EventPhotosCard";
import { EventNotesCard } from "./EventNotesCard";
import { RideInfoCard } from "./RideInfoCard";
import { RideScheduleCard } from "./RideScheduleCard";
import { RideAttendeesCard } from "./RideAttendeesCard";
import { RideAssetsCard } from "./RideAssetsCard";
import { EditEventDialog } from "./EditEventDialog";
import { EventDetailSubNav } from "@/components/layout/EventDetailSubNav";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <EventDetailContent id={id} />;
}

function EventDetailContent({ id }: { id: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: event } = useEventSuspense(id);
  const { data: budgets = [] } = useBudgetsOptional();
  const { data: scenarios = [] } = useScenariosOptional();
  const [editOpen, setEditOpen] = useState(false);

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
  const [editEventType, setEditEventType] = useState<string>("badger");
  const [editStartLocation, setEditStartLocation] = useState("");
  const [editEndLocation, setEditEndLocation] = useState("");
  const [editFacebookEventUrl, setEditFacebookEventUrl] = useState("");
  const [editPreRideEventId, setEditPreRideEventId] = useState("");
  const [editRideCost, setEditRideCost] = useState<string>("");

  useEffect(() => {
    setEditName(event.name);
    setEditDescription(event.description ?? "");
    setEditYear(event.year ?? "");
    setEditEventDate(event.event_date ?? "");
    setEditEventUrl(event.event_url ?? "");
    setEditEventLocation(event.event_location ?? "");
    setEditEventLocationEmbed(event.event_location_embed ?? "");
    setEditGaTicketCost(event.ga_ticket_cost != null ? String(event.ga_ticket_cost) : "");
    setEditDayPassCost(event.day_pass_cost != null ? String(event.day_pass_cost) : "");
    setEditGaTicketsSold(event.ga_tickets_sold != null ? String(event.ga_tickets_sold) : "");
    setEditDayPassesSold(event.day_passes_sold != null ? String(event.day_passes_sold) : "");
    setEditBudgetId(event.budget_id ?? "");
    setEditScenarioId(event.scenario_id ?? "");
    setEditPlanningNotes(event.planning_notes ?? "");
    setEditEventType(event.event_type ?? "badger");
    setEditStartLocation(event.start_location ?? "");
    setEditEndLocation(event.end_location ?? "");
    setEditFacebookEventUrl(event.facebook_event_url ?? "");
    setEditPreRideEventId(event.pre_ride_event_id ?? "");
    setEditRideCost(event.ride_cost != null ? String(event.ride_cost) : "");
  }, [event]);

  const refresh = async () => {
    await queryClient.refetchQueries({ queryKey: queryKeys.event(id) });
  };

  const handleSaveEdit = async () => {
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
      event_type: editEventType as "badger" | "anniversary" | "pioneer_run" | "rides",
      start_location: editStartLocation || undefined,
      end_location: editEndLocation || undefined,
      facebook_event_url: editFacebookEventUrl || undefined,
      pre_ride_event_id: editPreRideEventId || undefined,
      ride_cost: editRideCost === "" ? undefined : parseFloat(editRideCost),
    });
    setEditOpen(false);
    refresh();
  };

  const handleAddAttendee = async (contactId: string, waiverSigned?: boolean) => {
    await api.events.attendees.add(id, { contact_id: contactId, waiver_signed: waiverSigned });
    refresh();
  };

  const handleUpdateAttendeeWaiver = async (attendeeId: string, waiverSigned: boolean) => {
    await api.events.attendees.update(id, attendeeId, { waiver_signed: waiverSigned });
    refresh();
  };

  const handleRemoveAttendee = async (attendeeId: string) => {
    await api.events.attendees.delete(id, attendeeId);
    refresh();
  };

  const handleAddMemberAttendee = async (memberId: string, waiverSigned?: boolean) => {
    await api.events.memberAttendees.add(id, { member_id: memberId, waiver_signed: waiverSigned });
    refresh();
  };

  const handleUpdateMemberAttendeeWaiver = async (attendeeId: string, waiverSigned: boolean) => {
    await api.events.memberAttendees.update(id, attendeeId, { waiver_signed: waiverSigned });
    refresh();
  };

  const handleRemoveMemberAttendee = async (attendeeId: string) => {
    await api.events.memberAttendees.delete(id, attendeeId);
    refresh();
  };

  const handleAddScheduleItem = async (body: {
    scheduled_time: string;
    label: string;
    location?: string;
  }) => {
    await api.events.scheduleItems.create(id, body);
    refresh();
  };

  const handleUpdateScheduleItem = async (
    scheduleId: string,
    body: { scheduled_time?: string; label?: string; location?: string | null }
  ) => {
    await api.events.scheduleItems.update(id, scheduleId, body);
    refresh();
  };

  const handleDeleteScheduleItem = async (scheduleId: string) => {
    await api.events.scheduleItems.delete(id, scheduleId);
    refresh();
  };

  const handleAddAsset = async (file: File) => {
    await api.events.assets.add(id, file);
    refresh();
  };

  const handleDeleteAsset = async (assetId: string) => {
    await api.events.assets.delete(id, assetId);
    refresh();
  };

  const handleAddMilestone = async (payload: {
    month: number;
    year: number;
    description: string;
    due_date: string;
  }) => {
    await api.events.milestones.create(id, payload);
    refresh();
  };

  const handleToggleMilestoneComplete = async (mid: string, completed: boolean) => {
    await api.events.milestones.update(id, mid, { completed });
    refresh();
  };

  const handleDeleteMilestone = async (mid: string) => {
    await api.events.milestones.delete(id, mid);
    refresh();
  };

  const handleEditMilestone = async (
    mid: string,
    payload: { month: number; year: number; description: string; due_date: string }
  ) => {
    await api.events.milestones.update(id, mid, payload);
    refresh();
  };

  const handleAddMemberToMilestone = async (mid: string, memberId: string) => {
    await api.events.milestones.addMember(id, mid, memberId);
    refresh();
  };

  const handleRemoveMemberFromMilestone = async (mid: string, memberId: string) => {
    await api.events.milestones.removeMember(id, mid, memberId);
    refresh();
  };

  const handleAddPackingCategory = async (name: string) => {
    await api.events.packingCategories.create(id, { name });
    refresh();
  };

  const handleAddPackingItem = async (payload: {
    category_id: string;
    name: string;
    quantity?: number;
    note?: string;
  }) => {
    await api.events.packingItems.create(id, payload);
    refresh();
  };

  const handleEditPackingItem = async (
    pid: string,
    payload: { category_id?: string; name?: string; quantity?: number; note?: string }
  ) => {
    await api.events.packingItems.update(id, pid, payload);
    refresh();
  };

  const handleTogglePackingLoaded = async (pid: string, loaded: boolean) => {
    await api.events.packingItems.update(id, pid, { loaded });
    refresh();
  };

  const handleDeletePackingItem = async (pid: string) => {
    await api.events.packingItems.delete(id, pid);
    refresh();
  };

  const handleAddVolunteer = async (payload: { name: string; department: string }) => {
    await api.events.volunteers.create(id, payload);
    refresh();
  };

  const handleDeleteVolunteer = async (vid: string) => {
    await api.events.volunteers.delete(id, vid);
    refresh();
  };

  const handleCreateRole = async (payload: { name: string; category: "planning" | "during" }) => {
    await api.events.assignments.create(id, payload);
    refresh();
  };

  const handleDeleteRole = async (aid: string) => {
    await api.events.assignments.delete(id, aid);
    refresh();
  };

  const handleAddMemberToRole = async (aid: string, memberId: string) => {
    await api.events.assignments.addMember(id, aid, memberId);
    refresh();
  };

  const handleRemoveMemberFromRole = async (aid: string, memberId: string) => {
    await api.events.assignments.removeMember(id, aid, memberId);
    refresh();
  };

  const handleAddPhoto = async (file: File) => {
    await api.events.photos.add(id, file);
    refresh();
  };

  const handleDeletePhoto = async (photoId: string) => {
    await api.events.photos.delete(id, photoId);
    refresh();
  };

  const handleDeleteEvent = async () => {
    if (!confirm(`Delete "${event.name}"? This cannot be undone.`)) return;
    await api.events.delete(id);
    navigate(event.event_type === "rides" ? "/events/rides" : "/events");
  };

  const mapEmbedUrl = event.event_location_embed ?? getMapEmbedUrl(event.event_location);
  const budgetName = budgets.find((b) => b.id === event.budget_id)?.name;
  const scenarioName = scenarios.find((s) => s.id === event.scenario_id)?.name;

  return (
    <div className="space-y-6">
      <EventDetailSubNav eventType={event.event_type} />
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
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDeleteEvent} className="text-destructive hover:text-destructive">
            <Trash2 className="size-4" />
            Delete
          </Button>
          <Button onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Edit Event
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <EventDetailsCard
          event={event}
          budgetName={budgetName}
          scenarioName={scenarioName}
        />
        {event.event_type === "rides" && <RideInfoCard event={event} />}
        {mapEmbedUrl && <EventLocationCard mapEmbedUrl={mapEmbedUrl} />}
      </div>

      {event.event_type === "rides" && (
        <>
          <RideScheduleCard
            eventId={id}
            items={event.ride_schedule_items ?? []}
            onAdd={handleAddScheduleItem}
            onUpdate={handleUpdateScheduleItem}
            onDelete={handleDeleteScheduleItem}
          />
          <RideAttendeesCard
            eventId={id}
            attendees={event.event_attendees ?? []}
            memberAttendees={event.ride_member_attendees ?? []}
            onAdd={handleAddAttendee}
            onUpdateWaiver={handleUpdateAttendeeWaiver}
            onRemove={handleRemoveAttendee}
            onAddMember={handleAddMemberAttendee}
            onUpdateMemberWaiver={handleUpdateMemberAttendeeWaiver}
            onRemoveMember={handleRemoveMemberAttendee}
          />
          <RideAssetsCard
            eventId={id}
            eventName={event.name}
            assets={event.event_assets ?? []}
            onAdd={handleAddAsset}
            onDelete={handleDeleteAsset}
          />
        </>
      )}

      {event.event_type !== "rides" && (
        <>
          <EventMilestonesCard
            event={event}
            onRefresh={refresh}
            onToggleComplete={handleToggleMilestoneComplete}
            onDelete={handleDeleteMilestone}
            onAdd={handleAddMilestone}
            onEdit={handleEditMilestone}
            onAddMember={handleAddMemberToMilestone}
            onRemoveMember={handleRemoveMemberFromMilestone}
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
        </>
      )}

      <EventPhotosCard
        eventId={id}
        eventName={event.name}
        photos={event.event_photos ?? []}
        onAddPhoto={handleAddPhoto}
        onDeletePhoto={handleDeletePhoto}
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
        editEventType={editEventType}
        setEditEventType={setEditEventType}
        editStartLocation={editStartLocation}
        setEditStartLocation={setEditStartLocation}
        editEndLocation={editEndLocation}
        setEditEndLocation={setEditEndLocation}
        editFacebookEventUrl={editFacebookEventUrl}
        setEditFacebookEventUrl={setEditFacebookEventUrl}
        editPreRideEventId={editPreRideEventId}
        setEditPreRideEventId={setEditPreRideEventId}
        editRideCost={editRideCost}
        setEditRideCost={setEditRideCost}
        budgets={budgets}
        scenarios={scenarios}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
