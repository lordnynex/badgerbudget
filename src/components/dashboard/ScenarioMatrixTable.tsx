import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROIChart } from "@/components/charts/ROIChart";
import { PnLChart } from "@/components/charts/PnLChart";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { CostPerAttendeeChart } from "@/components/charts/CostPerAttendeeChart";
import type { ScenarioMetrics } from "@/types/budget";

interface ScenarioMatrixTableProps {
  metrics: ScenarioMetrics[];
  profitTarget?: number;
}

function SingleScenarioTable({
  title,
  metrics,
  profitTarget,
}: {
  title: string;
  metrics: ScenarioMetrics[];
  profitTarget?: number;
}) {
  const sorted = [...metrics].sort((a, b) => a.profit - b.profit);
  const showCharts = metrics.length > 1 && metrics.length <= 12;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>
            {metrics[0]?.attendees} attendees. Gross = ticket income; Net = Gross − costs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left font-medium">Ticket Cost</th>
                <th className="p-2 text-left font-medium">Staff Cost</th>
                <th className="p-2 text-left font-medium">Attendance</th>
                <th className="p-2 text-right font-medium">Gross Revenue</th>
                <th className="p-2 text-right font-medium">Net Revenue</th>
                <th className="p-2 text-right font-medium">Meets target</th>
                <th className="p-2 text-right font-medium">Cost/person</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((m) => (
                <tr
                  key={m.scenarioKey}
                  className={`border-b transition-colors hover:bg-muted/30 ${
                    m.profit >= 0 ? "" : "bg-destructive/5"
                  }`}
                >
                  <td className="p-2">${m.ticketPrice}</td>
                  <td className="p-2">${m.staffPrice}</td>
                  <td className="p-2">{m.attendancePercent}%</td>
                  <td className="p-2 text-right tabular-nums">
                    ${m.revenue.toLocaleString()}
                  </td>
                  <td
                    className={`p-2 text-right tabular-nums font-medium ${
                      m.profit >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ${m.profit.toLocaleString()}
                  </td>
                  <td className="p-2 text-right">
                    {m.profitVsBreakEven >= 0 ? (
                      <span className="text-green-600">Yes</span>
                    ) : (
                      <span className="text-amber-600">No</span>
                    )}
                  </td>
                  <td className="p-2 text-right tabular-nums">
                    ${m.costPerAttendee.toFixed(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
      {showCharts && (
        <section className="grid gap-6 md:grid-cols-2">
          <ROIChart metrics={metrics} />
          <PnLChart metrics={metrics} profitTarget={profitTarget} />
          <RevenueChart metrics={metrics} />
          <CostPerAttendeeChart metrics={metrics} />
        </section>
      )}
    </div>
  );
}

export function ScenarioMatrixTable({ metrics, profitTarget }: ScenarioMatrixTableProps) {
  const byAttendance = metrics.reduce(
    (acc, m) => {
      const key = m.attendancePercent;
      if (!acc[key]) acc[key] = [];
      acc[key].push(m);
      return acc;
    },
    {} as Record<number, ScenarioMetrics[]>
  );

  const attendanceLevels = Object.keys(byAttendance)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Scenario matrix</h2>
      {attendanceLevels.map((pct) => (
        <SingleScenarioTable
          key={pct}
          title={`${pct}% attendance`}
          metrics={byAttendance[pct]}
          profitTarget={profitTarget}
        />
      ))}
    </div>
  );
}
