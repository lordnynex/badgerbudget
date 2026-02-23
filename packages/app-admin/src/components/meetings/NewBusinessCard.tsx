import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useApi } from "@/data/api";
import { useInvalidateQueries } from "@/queries/hooks";

interface NewBusinessCardProps {
  meetingId: string;
}

export function NewBusinessCard({ meetingId }: NewBusinessCardProps) {
  const api = useApi();
  const invalidate = useInvalidateQueries();
  const [adding, setAdding] = useState(false);
  const [description, setDescription] = useState("");

  const handleAdd = async () => {
    const trimmed = description.trim();
    if (!trimmed) return;
    await api.meetings.oldBusiness.create(meetingId, { description: trimmed });
    invalidate.invalidateMeeting(meetingId);
    invalidate.invalidateOldBusiness();
    setDescription("");
    setAdding(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>New Business</CardTitle>
        {!adding ? (
          <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
            <Plus className="size-4" />
            Add
          </Button>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Discussion item"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-w-[200px]"
            />
            <Button size="sm" onClick={handleAdd}>
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setAdding(false);
                setDescription("");
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">
          Add items for this meeting. They will appear under Open Business until resolved.
        </p>
      </CardContent>
    </Card>
  );
}
