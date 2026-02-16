import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/data/api";
import type { Event } from "@/types/budget";
import { Calendar, ChevronRight } from "lucide-react";

export function EventsPanel() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const list = await api.events.list();
      setEvents(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading events...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Events</h1>
        <p className="text-muted-foreground mt-1">
          Badger events across years. Click an event to view details, plan milestones, manage volunteers, and more.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((e) => (
          <Card
            key={e.id}
            className="overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-primary/50 active:scale-[0.99]"
            onClick={() => navigate(`/events/${e.id}`)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg truncate">{e.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    {e.year != null && <span>{e.year}</span>}
                    {e.event_date && (
                      <>
                        <span className="text-border">•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3.5" />
                          {e.event_date}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
              </div>
            </CardHeader>
            {e.description && (
              <CardContent className="pt-0">
                <p className="text-muted-foreground text-sm line-clamp-2">{e.description}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
      {events.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No events yet. Create an event to get started.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
