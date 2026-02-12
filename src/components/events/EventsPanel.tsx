import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/data/api";
import type { Event } from "@/types/budget";

export function EventsPanel() {
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
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading events...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Events</CardTitle>
          <CardDescription>
            Badger events across years. Use Projections, Budgets, and Scenarios for planning.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <Card key={e.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{e.name}</CardTitle>
                {e.year != null && (
                  <CardDescription className="text-sm">{e.year}</CardDescription>
                )}
              </CardHeader>
              {e.description && (
                <CardContent className="pt-0">
                  <p className="text-muted-foreground text-sm">{e.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
