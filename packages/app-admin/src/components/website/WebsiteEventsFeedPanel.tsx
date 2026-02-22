import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/data/api";
import { trpc } from "@/trpc";
import { queryKeys } from "@/queries/keys";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Label } from "@/components/ui/label";

interface EventSummary {
  id: string;
  name: string;
  year?: number | null;
  event_date?: string | null;
  event_type?: string;
  show_on_website?: boolean;
}

export function WebsiteEventsFeedPanel() {
  const queryClient = useQueryClient();
  const trpcUtils = trpc.useUtils();
  const { data: events = [], isLoading } = useQuery({
    queryKey: queryKeys.events(),
    queryFn: () => api.events.list(),
  });
  const { data: feedEvents = [] } = trpc.website.getEventsFeed.useQuery();
  const updateMutation = useMutation({
    mutationFn: ({ id, show_on_website }: { id: string; show_on_website: boolean }) =>
      api.events.update(id, { show_on_website }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events() });
      void trpcUtils.website.getEventsFeed.invalidate();
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5" />
            Events feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Toggle which events appear on the public site. Events with &quot;Show on website&quot;
            on will be included in the public feed at <code className="text-xs bg-muted px-1 rounded">/api/website/events</code>.
          </p>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <div className="space-y-3">
              {(events as EventSummary[]).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div>
                    <span className="font-medium">{event.name}</span>
                    {event.year != null && (
                      <span className="ml-2 text-muted-foreground text-sm">{event.year}</span>
                    )}
                    {event.event_type && event.event_type !== "badger" && (
                      <span className="ml-2 text-muted-foreground text-sm">({event.event_type})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`event-${event.id}`}
                      checked={(event as EventSummary).show_on_website ?? false}
                      onChange={(e) =>
                        updateMutation.mutate({ id: event.id, show_on_website: e.target.checked })
                      }
                      disabled={updateMutation.isPending}
                      className="h-4 w-4 rounded border-input"
                    />
                    <Label htmlFor={`event-${event.id}`} className="text-sm">
                      Show on website
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          )}
          {feedEvents.length > 0 && (
            <div className="mt-6 rounded-md border bg-muted/30 p-3">
              <p className="text-sm font-medium mb-2">Public feed preview ({feedEvents.length} events)</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside">
                {(feedEvents as { name: string; year?: number }[]).slice(0, 5).map((e, i) => (
                  <li key={i}>{e.name} {e.year != null ? `(${e.year})` : ""}</li>
                ))}
                {feedEvents.length > 5 && <li>…and {feedEvents.length - 5} more</li>}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
