import { useRef, useState, useCallback, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useMeetingSuspense } from "@/queries/hooks";
import { useInvalidateQueries } from "@/queries/hooks";
import { Button } from "@/components/ui/button";
import { RichDocumentEditor } from "./RichDocumentEditor";
import { MotionsCard } from "./MotionsCard";
import { ActionItemsCard } from "./ActionItemsCard";
import { OldBusinessCard } from "./OldBusinessCard";
import { ExportPdfButton } from "./ExportPdfButton";
import { ArrowLeft, Calendar, Save } from "lucide-react";
import { api } from "@/data/api";

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
    <div ref={printRef} className="flex min-h-[400px] flex-col rounded-md border bg-background print:break-inside-avoid">
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
  const agendaPrintRef = useRef<HTMLDivElement>(null);
  const minutesPrintRef = useRef<HTMLDivElement>(null);

  const [agendaContent, setAgendaContent] = useState(meeting.agenda_content);
  const [minutesContent, setMinutesContent] = useState(meeting.minutes_content ?? "");
  const [agendaDirty, setAgendaDirty] = useState(false);
  const [minutesDirty, setMinutesDirty] = useState(false);
  const [agendaSaving, setAgendaSaving] = useState(false);
  const [minutesSaving, setMinutesSaving] = useState(false);

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
      await api.documents.update(meeting.agenda_document_id, { content: agendaContent });
      invalidate.invalidateMeeting(id!);
      setAgendaDirty(false);
    } finally {
      setAgendaSaving(false);
    }
  };

  const handleMinutesSave = async () => {
    if (!meeting.minutes_document_id) return;
    setMinutesSaving(true);
    try {
      await api.documents.update(meeting.minutes_document_id, { content: minutesContent });
      invalidate.invalidateMeeting(id!);
      setMinutesDirty(false);
    } finally {
      setMinutesSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 print:gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/meetings">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              Meeting #{meeting.meeting_number}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Calendar className="size-4" />
              {new Date(meeting.date).toLocaleDateString()}
              {meeting.location && ` • ${meeting.location}`}
            </p>
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

      <div>
        <h2 className="mb-2 text-lg font-medium">Agenda</h2>
        <DocumentSection
          value={agendaContent}
          onChange={handleAgendaChange}
          onSave={handleAgendaSave}
          saving={agendaSaving}
          dirty={agendaDirty}
          printRef={agendaPrintRef}
          placeholder="Enter meeting agenda..."
        />
      </div>

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
      <OldBusinessCard meetingId={meeting.id} oldBusiness={meeting.old_business} />
    </div>
  );
}
