import { Link, useSearchParams } from "react-router-dom";
import { useMotionsList } from "@/queries/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDateOnly } from "@/lib/date-utils";
import type { MotionWithMeeting } from "@/shared/types/meeting";

const PER_PAGE = 25;

function MotionRow({ m }: { m: MotionWithMeeting }) {
  return (
    <tr className="border-b last:border-0 hover:bg-muted/30">
      <td className="px-4 py-3">
        <Link
          to={`/meetings/${m.meeting_id}`}
          className="flex items-center gap-2 font-medium text-primary hover:underline"
        >
          <Calendar className="size-4 shrink-0" />
          {formatDateOnly(m.meeting_date)} (Meeting #{m.meeting_number})
        </Link>
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        {m.description?.trim() ? m.description : "—"}
      </td>
      <td className="px-4 py-3">{m.mover_name ?? "—"}</td>
      <td className="px-4 py-3">{m.seconder_name ?? "—"}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
            m.result === "pass"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {m.result === "pass" ? "Passed" : "Failed"}
        </span>
      </td>
    </tr>
  );
}

export function MotionsPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const { data, isPending, isError, error } = useMotionsList(page, PER_PAGE);

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Motions</h1>
        <Card>
          <CardContent className="py-8 text-center text-destructive">
            {error?.message ?? "Failed to load motions."}
          </CardContent>
        </Card>
      </div>
    );
  }

  const total = data?.total ?? 0;
  const items = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * PER_PAGE + 1;
  const end = Math.min(safePage * PER_PAGE, total);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Motions</h1>
      <p className="text-muted-foreground">
        All motions from all meetings, ordered by meeting date (newest first).
      </p>

      <Card>
        <CardContent className="pt-6">
          {isPending ? (
            <div className="py-12 text-center text-muted-foreground">
              Loading motions…
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No motions recorded in any meeting.
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium">Meeting</th>
                      <th className="px-4 py-3 text-left font-medium">Description</th>
                      <th className="px-4 py-3 text-left font-medium">Mover</th>
                      <th className="px-4 py-3 text-left font-medium">Seconder</th>
                      <th className="px-4 py-3 text-left font-medium">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((m) => (
                      <MotionRow key={m.id} m={m} />
                    ))}
                  </tbody>
                </table>
              </div>

              {total > PER_PAGE && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {start}–{end} of {total}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={safePage <= 1}
                      onClick={() => {
                        const next = new URLSearchParams(searchParams);
                        next.set("page", String(safePage - 1));
                        setSearchParams(next);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      <ChevronLeft className="size-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={safePage >= totalPages}
                      onClick={() => {
                        const next = new URLSearchParams(searchParams);
                        next.set("page", String(safePage + 1));
                        setSearchParams(next);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      Next
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
