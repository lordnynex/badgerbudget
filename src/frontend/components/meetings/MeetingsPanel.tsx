import { Link } from "react-router-dom";
import { useMeetingsSuspense } from "@/queries/hooks";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";

export function MeetingsPanel() {
  const { data: meetings } = useMeetingsSuspense();

  const sorted = [...meetings].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Meetings</h1>
        <Button asChild>
          <Link to="/meetings/new">
            <Plus className="size-4" />
            New meeting
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">#</th>
              <th className="px-4 py-3 text-left font-medium">Location</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m) => (
              <tr key={m.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link
                    to={`/meetings/${m.id}`}
                    className="flex items-center gap-2 font-medium text-primary hover:underline"
                  >
                    <Calendar className="size-4" />
                    {new Date(m.date).toLocaleDateString()}
                  </Link>
                </td>
                <td className="px-4 py-3">{m.meeting_number}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {m.location ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="px-4 py-12 text-center text-muted-foreground">
            No meetings yet. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}
