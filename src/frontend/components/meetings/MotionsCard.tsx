import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Pencil } from "lucide-react";
import { api } from "@/data/api";
import { useInvalidateQueries } from "@/queries/hooks";
import type { MeetingMotion } from "@/shared/types/meeting";

interface MotionsCardProps {
  meetingId: string;
  motions: MeetingMotion[];
}

export function MotionsCard({ meetingId, motions }: MotionsCardProps) {
  const invalidate = useInvalidateQueries();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<"pass" | "fail">("pass");

  const handleAdd = async () => {
    const trimmed = description.trim();
    if (!trimmed) return;
    await api.meetings.motions.create(meetingId, { description: trimmed, result });
    invalidate.invalidateMeeting(meetingId);
    setDescription("");
    setResult("pass");
    setAdding(false);
  };

  const handleUpdate = async (mid: string) => {
    const trimmed = description.trim();
    if (!trimmed) return;
    await api.meetings.motions.update(meetingId, mid, { description: trimmed, result });
    invalidate.invalidateMeeting(meetingId);
    setEditingId(null);
    setDescription("");
  };

  const handleDelete = async (mid: string) => {
    await api.meetings.motions.delete(meetingId, mid);
    invalidate.invalidateMeeting(meetingId);
  };

  const startEdit = (m: MeetingMotion) => {
    setEditingId(m.id);
    setDescription(m.description);
    setResult(m.result);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Motions</CardTitle>
        {!adding ? (
          <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
            <Plus className="size-4" />
            Add
          </Button>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Motion description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1 min-w-[200px]"
            />
            <Select value={result} onValueChange={(v) => setResult(v as "pass" | "fail")}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pass">Pass</SelectItem>
                <SelectItem value="fail">Fail</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleAdd}>
              Save
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setAdding(false); setDescription(""); }}>
              Cancel
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {motions.map((m) => (
            <li
              key={m.id}
              className="flex items-start justify-between gap-2 rounded-md border p-3"
            >
              {editingId === m.id ? (
                <div className="flex flex-1 flex-wrap gap-2">
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="flex-1 min-w-[200px]"
                  />
                  <Select value={result} onValueChange={(v) => setResult(v as "pass" | "fail")}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pass">Pass</SelectItem>
                      <SelectItem value="fail">Fail</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={() => handleUpdate(m.id)}>
                    Save
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setEditingId(null); setDescription(""); }}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="text-sm">{m.description}</p>
                    <span
                      className={`mt-1 inline-block rounded px-2 py-0.5 text-xs font-medium ${
                        m.result === "pass"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {m.result === "pass" ? "Pass" : "Fail"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => startEdit(m)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(m.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
        {motions.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground">No motions recorded.</p>
        )}
      </CardContent>
    </Card>
  );
}
