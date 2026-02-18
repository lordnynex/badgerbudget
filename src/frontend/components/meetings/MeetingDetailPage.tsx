import { useRef, useState, useCallback, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useMeetingSuspense } from "@/queries/hooks";
import { useInvalidateQueries } from "@/queries/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { RichDocumentEditor } from "./RichDocumentEditor";
import { MotionsCard } from "./MotionsCard";
import { ActionItemsCard } from "./ActionItemsCard";
import { OldBusinessCard } from "./OldBusinessCard";
import { ExportPdfButton } from "./ExportPdfButton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ArrowLeft,
  Save,
  Pencil,
  X,
  ChevronDown,
  ChevronRight,
  FileDown,
} from "lucide-react";
import { api } from "@/data/api";
import { formatDateOnly } from "@/lib/date-utils";

function DocumentSection({
  value,
  onChange,
  onSave,
  saving,
  dirty,
  printRef,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  saving: boolean;
  dirty: boolean;
  printRef: React.RefObject<HTMLDivElement | null>;
  placeholder: string;
}) {
  return (
    <div
      ref={printRef}
      className="flex min-h-[400px] flex-col rounded-md border bg-background print:break-inside-avoid"
    >
      <RichDocumentEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        fullHeight
        toolbarActions={
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={onSave}
              disabled={saving || !dirty}
            >
              <Save className="size-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
            <ExportPdfButton
              onPrint={() => printRef.current?.scrollIntoView()}
              label="Export PDF"
            />
          </div>
        }
      />
    </div>
  );
}

export function MeetingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: meeting } = useMeetingSuspense(id!);
  const invalidate = useInvalidateQueries();
  const minutesPrintRef = useRef<HTMLDivElement>(null);

  const [editingMetadata, setEditingMetadata] = useState(false);
  const [metadataSaving, setMetadataSaving] = useState(false);
  const [meetingNumber, setMeetingNumber] = useState(meeting.meeting_number);
  const [date, setDate] = useState(meeting.date);
  const [location, setLocation] = useState(meeting.location ?? "");
  const [agendaEditMode, setAgendaEditMode] = useState(false);
  const [agendaOpen, setAgendaOpen] = useState(true);
  const [agendaContent, setAgendaContent] = useState(meeting.agenda_content);
  const [minutesContent, setMinutesContent] = useState(
    meeting.minutes_content ?? ""
  );
  const [agendaDirty, setAgendaDirty] = useState(false);
  const [minutesDirty, setMinutesDirty] = useState(false);
  const [agendaSaving, setAgendaSaving] = useState(false);
  const [minutesSaving, setMinutesSaving] = useState(false);

  useEffect(() => {
    setMeetingNumber(meeting.meeting_number);
    setDate(meeting.date);
    setLocation(meeting.location ?? "");
  }, [meeting.id, meeting.meeting_number, meeting.date, meeting.location]);

  useEffect(() => {
    setAgendaContent(meeting.agenda_content);
    setMinutesContent(meeting.minutes_content ?? "");
  }, [meeting.id, meeting.agenda_content, meeting.minutes_content]);

  const handleAgendaChange = useCallback((value: string) => {
    setAgendaContent(value);
    setAgendaDirty(true);
  }, []);

  const handleMinutesChange = useCallback((value: string) => {
    setMinutesContent(value);
    setMinutesDirty(true);
  }, []);

  const handleAgendaSave = async () => {
    if (!meeting.agenda_document_id) return;
    setAgendaSaving(true);
    try {
      await api.documents.update(meeting.agenda_document_id, {
        content: agendaContent,
      });
      invalidate.invalidateMeeting(id!);
      setAgendaDirty(false);
      setAgendaEditMode(false);
    } finally {
      setAgendaSaving(false);
    }
  };

  const handleMinutesSave = async () => {
    if (!meeting.minutes_document_id) return;
    setMinutesSaving(true);
    try {
      await api.documents.update(meeting.minutes_document_id, {
        content: minutesContent,
      });
      invalidate.invalidateMeeting(id!);
      setMinutesDirty(false);
    } finally {
      setMinutesSaving(false);
    }
  };

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

  const handleAgendaEdit = () => {
    setAgendaEditMode(true);
  };

  const handleAgendaCancelEdit = () => {
    setAgendaContent(meeting.agenda_content);
    setAgendaDirty(false);
    setAgendaEditMode(false);
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
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-muted/50 rounded-t-lg"
            >
              <div className="flex items-center gap-2">
                {agendaOpen ? (
                  <ChevronDown className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="size-4 text-muted-foreground" />
                )}
                <h2 className="text-base font-medium">Agenda</h2>
              </div>
              {!agendaEditMode && (
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={handleAgendaEdit}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                </div>
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-t px-3 py-2">
              {agendaEditMode ? (
                <div className="min-h-[180px]">
                  <RichDocumentEditor
                    value={agendaContent}
                    onChange={handleAgendaChange}
                    placeholder="Enter meeting agenda..."
                    fullHeight
                    toolbarActions={
                      <div className="flex items-center gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleAgendaSave}
                          disabled={agendaSaving || !agendaDirty}
                        >
                          <Save className="size-4" />
                          {agendaSaving ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAgendaCancelEdit}
                          disabled={agendaSaving}
                        >
                          <X className="size-4" />
                          Cancel
                        </Button>
                      </div>
                    }
                  />
                </div>
              ) : (
                <div>
                  <RichDocumentEditor
                    value={agendaContent}
                    onChange={() => {}}
                    placeholder="No agenda yet."
                    editable={false}
                    compact
                  />
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      <div>
        <h2 className="mb-2 text-lg font-medium">Minutes</h2>
        <DocumentSection
          value={minutesContent}
          onChange={handleMinutesChange}
          onSave={handleMinutesSave}
          saving={minutesSaving}
          dirty={minutesDirty}
          printRef={minutesPrintRef}
          placeholder="Transcribe meeting minutes..."
        />
      </div>

      <MotionsCard meetingId={meeting.id} motions={meeting.motions} />
      <ActionItemsCard meetingId={meeting.id} actionItems={meeting.action_items} />
      <OldBusinessCard
        meetingId={meeting.id}
        oldBusiness={meeting.old_business}
      />
    </div>
  );
}
