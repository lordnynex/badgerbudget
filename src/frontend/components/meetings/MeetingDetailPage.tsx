import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMeetingSuspense, useInvalidateQueries } from "@/queries/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { RichDocumentEditor } from "./RichDocumentEditor";
import { MotionsCard } from "./MotionsCard";
import { ActionItemsCard } from "./ActionItemsCard";
import { OldBusinessCard } from "./OldBusinessCard";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ArrowLeft,
  Pencil,
  X,
  ChevronDown,
  ChevronRight,
  FileDown,
} from "lucide-react";
import { api } from "@/data/api";
import { formatDateOnly } from "@/lib/date-utils";

export function MeetingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: meeting } = useMeetingSuspense(id!);
  const invalidate = useInvalidateQueries();

  const [editingMetadata, setEditingMetadata] = useState(false);
  const [metadataSaving, setMetadataSaving] = useState(false);
  const [meetingNumber, setMeetingNumber] = useState(meeting.meeting_number);
  const [date, setDate] = useState(meeting.date);
  const [location, setLocation] = useState(meeting.location ?? "");
  const [agendaOpen, setAgendaOpen] = useState(true);
  const [minutesOpen, setMinutesOpen] = useState(true);

  const handleMetadataSave = async () => {
    const num = Number(meetingNumber);
    if (Number.isNaN(num) || num < 1) {
      setMeetingNumber(meeting.meeting_number);
      setEditingMetadata(false);
      return;
    }
    setMetadataSaving(true);
    try {
      await api.meetings.update(id!, {
        meeting_number: num,
        date,
        location: location.trim() || null,
      });
      invalidate.invalidateMeeting(id!);
      invalidate.invalidateMeetings();
      setEditingMetadata(false);
    } finally {
      setMetadataSaving(false);
    }
  };

  const handleMetadataCancel = () => {
    setMeetingNumber(meeting.meeting_number);
    setDate(meeting.date);
    setLocation(meeting.location ?? "");
    setEditingMetadata(false);
  };

  const handleAgendaExportPdf = async () => {
    if (!meeting.agenda_document_id) return;
    const filename = `meeting-${meeting.meeting_number}-agenda.pdf`;
    await api.documents.exportPdf(meeting.agenda_document_id, filename);
  };

  const handleMinutesExportPdf = async () => {
    if (!meeting.minutes_document_id) return;
    const filename = `meeting-${meeting.meeting_number}-minutes.pdf`;
    await api.documents.exportPdf(meeting.minutes_document_id, filename);
  };

  return (
    <div className="flex flex-col gap-6 print:gap-4">
      {/* Sticky sub-navigation header */}
      <div className="sticky top-16 z-10 -mx-4 -mt-4 flex flex-col gap-4 border-b border-border/50 bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:-mx-6 md:-mt-6 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/meetings">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>

            {editingMetadata ? (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Meeting #</span>
                  <Input
                    type="number"
                    min={1}
                    value={meetingNumber === "" ? "" : meetingNumber}
                    onChange={(e) =>
                      setMeetingNumber(
                        e.target.value === ""
                          ? ""
                          : parseInt(e.target.value, 10) || ""
                      )
                    }
                    className="h-9 w-20"
                  />
                </div>
                <DatePicker
                  value={date}
                  onChange={setDate}
                  placeholder="Date"
                  className="h-9 w-auto min-w-[140px]"
                />
                <Input
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-9 w-48"
                />
                <Button
                  size="sm"
                  onClick={handleMetadataSave}
                  disabled={metadataSaving}
                >
                  {metadataSaving ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMetadataCancel}
                  disabled={metadataSaving}
                >
                  <X className="size-4" />
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <h1 className="text-2xl font-semibold">
                  Meeting #{meeting.meeting_number}
                </h1>
                <span className="text-muted-foreground">
                  {formatDateOnly(meeting.date)}
                </span>
                {meeting.location && (
                  <span className="text-muted-foreground">
                    • {meeting.location}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingMetadata(true)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="size-4" />
                  Edit
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {meeting.previous_meeting_id && (
        <p className="text-sm text-muted-foreground">
          <Link
            to={`/meetings/${meeting.previous_meeting_id}`}
            className="text-primary hover:underline"
          >
            ← Previous meeting minutes
          </Link>
        </p>
      )}

      {/* Collapsible Agenda section */}
      <Collapsible open={agendaOpen} onOpenChange={setAgendaOpen}>
        <div className="rounded-lg border">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 rounded-t-lg px-3 py-2 text-left hover:bg-muted/50"
            >
              <div className="flex items-center gap-2">
                {agendaOpen ? (
                  <ChevronDown className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="size-4 text-muted-foreground" />
                )}
                <h2 className="text-base font-medium">Agenda</h2>
              </div>
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={handleAgendaExportPdf}
                >
                  <FileDown className="size-3.5" />
                  Export
                </Button>
                <Button variant="ghost" size="sm" className="h-7 px-2" asChild>
                  <Link to={`/meetings/${id}/agenda/edit`}>
                    <Pencil className="size-3.5" />
                    Edit
                  </Link>
                </Button>
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-t px-3 py-2">
              <RichDocumentEditor
                value={meeting.agenda_content}
                onChange={() => {}}
                placeholder="No agenda yet."
                editable={false}
                compact
              />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Collapsible Minutes section */}
      <Collapsible open={minutesOpen} onOpenChange={setMinutesOpen}>
        <div className="rounded-lg border">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 rounded-t-lg px-3 py-2 text-left hover:bg-muted/50"
            >
              <div className="flex items-center gap-2">
                {minutesOpen ? (
                  <ChevronDown className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="size-4 text-muted-foreground" />
                )}
                <h2 className="text-base font-medium">Minutes</h2>
              </div>
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                {meeting.minutes_document_id && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={handleMinutesExportPdf}
                    >
                      <FileDown className="size-3.5" />
                      Export
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2" asChild>
                      <Link to={`/meetings/${id}/minutes/edit`}>
                        <Pencil className="size-3.5" />
                        Edit
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-t px-3 py-2">
              <RichDocumentEditor
                value={meeting.minutes_content ?? ""}
                onChange={() => {}}
                placeholder="No minutes yet."
                editable={false}
                compact
              />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      <MotionsCard meetingId={meeting.id} motions={meeting.motions} />
      <ActionItemsCard meetingId={meeting.id} actionItems={meeting.action_items} />
      <OldBusinessCard
        meetingId={meeting.id}
        oldBusiness={meeting.old_business}
      />
    </div>
  );
}
