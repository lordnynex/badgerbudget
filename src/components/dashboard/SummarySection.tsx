import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAppState } from "@/state/AppState";
import type { ScenarioMetrics } from "@/types/budget";

interface SummarySectionProps {
  metrics: ScenarioMetrics[];
  filteredMetrics: ScenarioMetrics[];
}

export function SummarySection({ metrics, filteredMetrics }: SummarySectionProps) {
  const { state } = useAppState();
  const totalCosts = state.lineItems.reduce(
    (sum, li) => sum + li.unitCost * li.quantity,
    0
  );
  const totalWithProfitTarget = totalCosts + state.inputs.profitTarget;
  const maxOccupancy = state.inputs.maxOccupancy;
  const staffCount = state.inputs.staffCount;

  const attendanceBreakdown = [
    { percent: 25, tickets: Math.round(maxOccupancy * 0.25) },
    { percent: 50, tickets: Math.round(maxOccupancy * 0.5) },
    { percent: 75, tickets: Math.round(maxOccupancy * 0.75) },
    { percent: 100, tickets: maxOccupancy },
  ];

  const profitableScenarios = filteredMetrics.filter((m) => m.profit >= 0);
  const meetingTargetScenarios = filteredMetrics.filter(
    (m) => m.profitVsBreakEven >= 0
  );

  const lowestBreakEven = profitableScenarios.length > 0
    ? Math.min(...profitableScenarios.map((m) => m.ticketPrice))
    : null;
  const lowestMeetingTarget = meetingTargetScenarios.length > 0
    ? Math.min(...meetingTargetScenarios.map((m) => m.ticketPrice))
    : null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <h3 className="text-sm font-medium text-muted-foreground">Total event cost</h3>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            ${totalCosts.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Sum of all budget line items
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <h3 className="text-sm font-medium text-muted-foreground">Cost + profit target</h3>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            ${totalWithProfitTarget.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Breakeven revenue to meet target
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <h3 className="text-sm font-medium text-muted-foreground">Attendance → tickets sold</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm">
            {attendanceBreakdown.map(({ percent, tickets }) => (
              <div key={percent} className="flex justify-between">
                <span className="text-muted-foreground">{percent}%</span>
                <span className="font-medium">{tickets} attendees</span>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-xs mt-2">
            + {staffCount} staff
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <h3 className="text-sm font-medium text-muted-foreground">Lowest ticket price</h3>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {lowestBreakEven != null ? `$${lowestBreakEven}` : "—"}
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            To break even (raw cost)
          </p>
          {lowestMeetingTarget != null && lowestMeetingTarget !== lowestBreakEven && (
            <p className="text-muted-foreground text-xs mt-1">
              ${lowestMeetingTarget} to meet profit target
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
