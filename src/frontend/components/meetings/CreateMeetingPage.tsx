import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { api } from "@/data/api";
import { useMeetingsOptional } from "@/queries/hooks";
import { useMeetingTemplatesOptional } from "@/queries/hooks";
import { useInvalidateQueries } from "@/queries/hooks";
import { ArrowLeft } from "lucide-react";

export function CreateMeetingPage() {
  const navigate = useNavigate();
  const invalidate = useInvalidateQueries();
  const { data: meetings = [] } = useMeetingsOptional();
  const { data: templates = [] } = useMeetingTemplatesOptional("agenda");

  const [date, setDate] = useState("");
  const [meetingNumber, setMeetingNumber] = useState<number | "">("");
  const [location, setLocation] = useState("");
  const [agendaTemplateId, setAgendaTemplateId] = useState<string>("__none__");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setDate(today);
    const nextNum =
      meetings.length > 0
        ? Math.max(...meetings.map((m) => m.meeting_number), 0) + 1
        : 1;
    setMeetingNumber(nextNum);
  }, [meetings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || meetingNumber === "") return;

    setSaving(true);
    try {
      const meeting = await api.meetings.create({
        date,
        meeting_number: Number(meetingNumber),
        location: location.trim() || null,
        agenda_template_id:
          agendaTemplateId === "__none__" ? undefined : agendaTemplateId,
      });
      invalidate.invalidateMeetings();
      navigate(`/meetings/${meeting.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/meetings">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Create meeting</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meeting-date">Date</Label>
            <DatePicker
              value={date}
              onChange={setDate}
              placeholder="Pick meeting date"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="meeting-number">Meeting number</Label>
            <Input
              id="meeting-number"
              type="number"
              min={1}
              value={meetingNumber}
              onChange={(e) =>
                setMeetingNumber(
                  e.target.value === "" ? "" : parseInt(e.target.value, 10)
                )
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="meeting-location">Location</Label>
            <Input
              id="meeting-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Meeting location"
            />
          </div>
          <div className="space-y-2">
            <Label>Agenda template</Label>
            <Select value={agendaTemplateId} onValueChange={setAgendaTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Start blank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Start blank</SelectItem>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Creating..." : "Create meeting"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/meetings">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
