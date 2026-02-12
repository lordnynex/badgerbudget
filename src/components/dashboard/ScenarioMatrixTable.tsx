import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScenarioMetrics } from "@/types/budget";

interface ScenarioMatrixTableProps {
  metrics: ScenarioMetrics[];
}

export function ScenarioMatrixTable({ metrics }: ScenarioMatrixTableProps) {
  const sorted = [...metrics].sort((a, b) => a.profit - b.profit);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scenario matrix</CardTitle>
        <CardDescription>
          All scenarios sorted by profit. Find the lowest ticket price that breaks even.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left font-medium">Scenario</th>
                <th className="p-2 text-right font-medium">Revenue</th>
                <th className="p-2 text-right font-medium">Profit</th>
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
                  <td className="p-2">{m.scenarioKey}</td>
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
  );
}
