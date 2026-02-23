import { useState } from "react";
import { useApi } from "@/data/api";
import type { Incident } from "@badgerbudget/shared/types/event";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface IncidentsResponse {
  items: Incident[];
  page: number;
  per_page: number;
  total: number;
}

export function IncidentsPanel() {
  const api = useApi();
  const [page, setPage] = useState(1);
  const perPage = 25;
  const [data, setData] = useState<IncidentsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async (targetPage: number) => {
    setLoading(true);
    try {
      const result = await api.incidents.list({ page: targetPage, per_page: perPage });
      setData(result as IncidentsResponse);
      setPage(targetPage);
    } finally {
      setLoading(false);
    }
  };

  if (!data && !loading) {
    void load(1);
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.per_page)) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Incidents</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All recorded incidents across events, newest first.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent incidents</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !data ? (
            <p className="text-sm text-muted-foreground">Loading incidents...</p>
          ) : !data || data.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No incidents recorded yet.</p>
          ) : (
            <>
              <div className="space-y-3">
                {data.items.map((incident) => (
                  <div
                    key={incident.id}
                    className="flex flex-col gap-1 rounded-md border p-3 md:flex-row md:items-center md:gap-3"
                  >
                    <div className="md:w-[220px]">
                      {incident.event_id ? (
                        <Button
                          asChild
                          variant="link"
                          className="h-auto p-0 text-sm font-medium"
                        >
                          <Link to={`/events/${incident.event_id}`}>
                            {incident.event_name ?? incident.event_id}
                          </Link>
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unknown event</span>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {incident.event_type}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" title={incident.summary}>
                        {incident.summary}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {incident.type} · {incident.severity}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground md:text-right md:w-[200px]">
                      <div>Occurred: {incident.occurred_at ?? "—"}</div>
                      <div>Logged: {incident.created_at ?? "—"}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  Showing {(data.page - 1) * data.per_page + 1}–
                  {Math.min(data.page * data.per_page, data.total)} of {data.total}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || loading}
                    onClick={() => !loading && page > 1 && void load(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="px-2 text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages || loading}
                    onClick={() => !loading && page < totalPages && void load(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

