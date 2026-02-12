import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import type { Inputs, LineItem, ScenarioMetrics } from "@/types/budget";
import {
  computeExportSummary,
  computeExportFoodCost,
  computeExportScenarioMatrix,
  getCategoryTotals,
} from "@/export/exportData";

interface PrintViewProps {
  state: {
    inputs: Inputs;
    lineItems: LineItem[];
    budget?: { name: string; year: number } | null;
    scenario?: { name: string } | null;
  };
  metrics: ScenarioMetrics[];
}

export function PrintView({ state, metrics }: PrintViewProps) {
  const totalCosts = state.lineItems.reduce(
    (sum, li) => sum + li.unitCost * li.quantity,
    0
  );
  const summary = computeExportSummary(state.inputs, state.lineItems, metrics);
  const foodCost = computeExportFoodCost(state.inputs, state.lineItems);
  const scenarioMatrix = computeExportScenarioMatrix(metrics);
  const categoryTotals = getCategoryTotals(state.lineItems);
  const categories = Object.keys(categoryTotals).sort();
  const costData = categories.map((c) =>
    Math.round(categoryTotals[c] * 100) / 100
  );

  const donutOptions: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "inherit",
      background: "#fff",
    },
    theme: { mode: "light" },
    labels: categories,
    colors: [
      "#3b82f6",
      "#22c55e",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#ec4899",
      "#06b6d4",
    ],
    dataLabels: { enabled: true },
    legend: { position: "bottom" },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              formatter: () =>
                `$${costData.reduce((a, b) => a + b, 0).toLocaleString()}`,
            },
          },
        },
      },
    },
  };

  const barOptions: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "inherit",
      background: "#fff",
    },
    theme: { mode: "light" },
    colors: ["#3b82f6"],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: "70%",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `$${Number(val).toLocaleString()}`,
    },
    xaxis: { categories },
    legend: { show: false },
  };

  const attendanceLevels = [...new Set(metrics.map((m) => m.attendancePercent))].sort(
    (a, b) => a - b
  );
  const ticketPrices = [...new Set(metrics.map((m) => m.ticketPrice))].sort(
    (a, b) => a - b
  );
  const staffPrices = [...new Set(metrics.map((m) => m.staffPrice))].sort(
    (a, b) => a - b
  );
  const columnKeys: string[] = [];
  for (const tp of ticketPrices) {
    for (const sp of staffPrices) {
      columnKeys.push(`$${tp}/$${sp}`);
    }
  }
  const byKey = new Map<string, ScenarioMetrics>();
  for (const m of metrics) {
    byKey.set(`${m.attendancePercent}-${m.ticketPrice}-${m.staffPrice}`, m);
  }
  const minProfit = Math.min(...metrics.map((m) => m.profit));
  const maxProfit = Math.max(...metrics.map((m) => m.profit));
  const heatmapSeries = attendanceLevels.map((pct) => ({
    name: `${pct}%`,
    data: columnKeys.map((col) => {
      const [ticketPart, staffPart] = col.replace("$", "").split("/$");
      const ticketPrice = Number(ticketPart);
      const staffPrice = Number(staffPart);
      const m = byKey.get(`${pct}-${ticketPrice}-${staffPrice}`);
      return { x: col, y: m?.profit ?? 0 };
    }),
  }));

  const heatmapOptions: ApexOptions = {
    chart: {
      type: "heatmap",
      fontFamily: "inherit",
      background: "#fff",
      toolbar: { show: false },
    },
    theme: { mode: "light" },
    dataLabels: {
      enabled: true,
      formatter: (_, opts) => {
        const val =
          opts.w.config.series[opts.seriesIndex]?.data[opts.dataPointIndex]?.y;
        return typeof val === "number"
          ? `$${Math.round(val).toLocaleString()}`
          : "";
      },
    },
    legend: { show: false },
    plotOptions: {
      heatmap: {
        colorScale: {
          ranges: [
            ...(minProfit < 0
              ? [{ from: minProfit, to: -0.01, color: "#ef4444", name: "Loss" }]
              : []),
            ...(maxProfit >= 0
              ? [
                  {
                    from: 0,
                    to: Math.max(maxProfit, 1),
                    color: "#22c55e",
                    name: "Profit",
                  },
                ]
              : []),
          ],
        },
      },
    },
    xaxis: { labels: { rotate: -45 } },
  };

  return (
    <div className="space-y-6 bg-white p-8 text-black print:p-8">
      <header>
        <h1 className="mb-2 text-2xl font-bold">Badger Budget – Projection Dashboard</h1>
        <p className="text-sm text-gray-600">
          {state.budget && `Budget: ${state.budget.name} (${state.budget.year})`}
          {state.budget && state.scenario && " • "}
          {state.scenario && `Scenario: ${state.scenario.name}`}
        </p>
        <p className="mt-2 text-xs text-gray-500">
          Generated for print
        </p>
      </header>

      {/* Summary Section */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Summary</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded border p-4">
            <p className="text-sm text-gray-600">Total event cost</p>
            <p className="text-xl font-bold">
              ${summary.totalCosts.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="rounded border p-4">
            <p className="text-sm text-gray-600">Cost + profit target</p>
            <p className="text-xl font-bold">
              ${summary.totalWithProfitTarget.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="rounded border p-4">
            <p className="text-sm text-gray-600">Attendance → tickets sold</p>
            <div className="mt-1 space-y-1 text-sm">
              {summary.attendanceBreakdown.map(({ percent, tickets }) => (
                <div key={percent} className="flex justify-between">
                  <span className="text-gray-600">{percent}%</span>
                  <span className="font-medium">{tickets} attendees</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded border p-4">
            <p className="text-sm text-gray-600">Lowest ticket price</p>
            <p className="text-xl font-bold">
              {summary.lowestBreakEven != null ? `$${summary.lowestBreakEven}` : "—"}
            </p>
            <p className="text-xs text-gray-500">To break even</p>
            {summary.lowestMeetingTarget != null && (
              <p className="mt-1 text-xs text-gray-500">
                ${summary.lowestMeetingTarget} to meet profit target
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Inputs */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Scenario Inputs</h2>
        <table className="w-full border text-sm">
          <tbody>
            <tr>
              <td className="border px-2 py-1 font-medium">Max Occupancy</td>
              <td className="border px-2 py-1">{state.inputs.maxOccupancy}</td>
            </tr>
            <tr>
              <td className="border px-2 py-1 font-medium">Staff Count</td>
              <td className="border px-2 py-1">{state.inputs.staffCount}</td>
            </tr>
            <tr>
              <td className="border px-2 py-1 font-medium">Profit Target</td>
              <td className="border px-2 py-1">${state.inputs.profitTarget}</td>
            </tr>
            <tr>
              <td className="border px-2 py-1 font-medium">Ticket Prices</td>
              <td className="border px-2 py-1">
                ${state.inputs.ticketPrices.proposedPrice1} / $
                {state.inputs.ticketPrices.proposedPrice2} / $
                {state.inputs.ticketPrices.proposedPrice3} (Staff: $
                {state.inputs.ticketPrices.staffPrice1} / $
                {state.inputs.ticketPrices.staffPrice2} / $
                {state.inputs.ticketPrices.staffPrice3})
              </td>
            </tr>
            <tr>
              <td className="border px-2 py-1 font-medium">Day Pass</td>
              <td className="border px-2 py-1">
                ${state.inputs.dayPassPrice} × {state.inputs.dayPassesSold} = $
                {(state.inputs.dayPassPrice * state.inputs.dayPassesSold).toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Food Cost Breakdown */}
      {foodCost && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Food Cost Breakdown</h2>
          <p className="mb-4 text-sm text-gray-600">
            Total food & beverage: ${foodCost.totalFoodCost.toLocaleString()}. 4-day event.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded border p-3">
              <p className="text-xs text-gray-600">Per attendee (4 days)</p>
              <p className="font-semibold">${foodCost.foodCostPerAttendee.toFixed(2)}</p>
            </div>
            <div className="rounded border p-3">
              <p className="text-xs text-gray-600">Per day pass</p>
              <p className="font-semibold">${foodCost.foodCostPerDayPass.toFixed(2)}</p>
            </div>
            <div className="rounded border p-3">
              <p className="text-xs text-gray-600">Cost per day</p>
              <p className="font-semibold">${foodCost.foodCostPerDay.toFixed(2)}</p>
            </div>
            <div className="rounded border p-3">
              <p className="text-xs text-gray-600">Per staff (4 days)</p>
              <p className="font-semibold">${foodCost.foodCostPerStaff.toFixed(2)}</p>
            </div>
            <div className="rounded border p-3">
              <p className="text-xs text-gray-600">Cost per meal</p>
              <p className="font-semibold">${foodCost.costPerMeal.toFixed(2)}</p>
            </div>
          </div>
        </section>
      )}

      {/* Budget Line Items */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Budget Line Items</h2>
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Category</th>
              <th className="border p-2 text-right">Unit Cost</th>
              <th className="border p-2 text-right">Qty</th>
              <th className="border p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {state.lineItems.map((li) => (
              <tr key={li.id}>
                <td className="border p-2">{li.name}</td>
                <td className="border p-2">{li.category}</td>
                <td className="border p-2 text-right">${li.unitCost.toFixed(2)}</td>
                <td className="border p-2 text-right">{li.quantity}</td>
                <td className="border p-2 text-right">
                  ${(li.unitCost * li.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 font-semibold">Total: ${totalCosts.toFixed(2)}</p>
      </section>

      {/* Cost Charts */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Cost by Category</h2>
        <div className="grid gap-6 print:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-medium">Donut</h3>
            <div className="h-[300px]">
              <Chart
                options={donutOptions}
                series={costData}
                type="donut"
                height={280}
              />
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium">Bar</h3>
            <div className="h-[300px]">
              <Chart
                options={barOptions}
                series={[{ name: "Cost", data: costData }]}
                type="bar"
                height={Math.max(200, categories.length * 40)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Profit Heatmap */}
      {metrics.length > 0 && (
        <section className="break-before-page">
          <h2 className="mb-4 text-lg font-semibold">Profit by Scenario Heatmap</h2>
          <div className="h-[320px]">
            <Chart
              options={heatmapOptions}
              series={heatmapSeries}
              type="heatmap"
              height={300}
            />
          </div>
        </section>
      )}

      {/* Scenario Matrix – Tables per Attendance Level */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Scenario Matrix</h2>
        <p className="mb-6 text-sm text-gray-600">
          Gross = ticket income; Net = Gross − costs. One table per attendance level.
        </p>
        {scenarioMatrix.attendanceLevels.map((pct) => {
          const tableMetrics = scenarioMatrix.byAttendance[pct]
            .slice()
            .sort((a, b) => {
              if (a.profit !== b.profit) return a.profit - b.profit;
              if (a.ticketPrice !== b.ticketPrice) return a.ticketPrice - b.ticketPrice;
              return a.staffPrice - b.staffPrice;
            });
          return (
            <div key={pct} className="mb-8 break-inside-avoid">
              <h3 className="mb-2 text-base font-semibold">{pct}% Attendance</h3>
              <p className="mb-2 text-xs text-gray-600">
                {tableMetrics[0]?.attendees} attendees
              </p>
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Ticket Cost</th>
                    <th className="border p-2 text-left">Staff Cost</th>
                    <th className="border p-2 text-left">Attendance</th>
                    <th className="border p-2 text-right">Gross Revenue</th>
                    <th className="border p-2 text-right">Net Revenue</th>
                    <th className="border p-2 text-right">Profit Margin</th>
                    <th className="border p-2 text-right">Profit/Attendee</th>
                    <th className="border p-2 text-right">Cost Coverage</th>
                    <th className="border p-2 text-right">Rev/Ticket</th>
                    <th className="border p-2 text-right">Attendee %</th>
                    <th className="border p-2 text-right">Break-ev Att %</th>
                    <th className="border p-2 text-right">Target Cov %</th>
                    <th className="border p-2 text-right">Meets Target</th>
                    <th className="border p-2 text-right">Cost/Person</th>
                  </tr>
                </thead>
                <tbody>
                  {tableMetrics.map((m) => (
                    <tr
                      key={m.scenarioKey}
                      className={m.profit < 0 ? "bg-red-50" : ""}
                    >
                      <td className="border p-2">${m.ticketPrice}</td>
                      <td className="border p-2">${m.staffPrice}</td>
                      <td className="border p-2">{m.attendancePercent}%</td>
                      <td className="border p-2 text-right">
                        ${m.revenue.toLocaleString()}
                      </td>
                      <td
                        className={`border p-2 text-right font-medium ${
                          m.profit >= 0 ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        ${m.profit.toLocaleString()}
                      </td>
                      <td className="border p-2 text-right">
                        {m.profitMargin.toFixed(1)}%
                      </td>
                      <td className="border p-2 text-right">
                        ${m.profitPerAttendee.toFixed(0)}
                      </td>
                      <td className="border p-2 text-right">
                        {m.costCoverageRatio.toFixed(2)}×
                      </td>
                      <td className="border p-2 text-right">
                        ${m.avgRevenuePerTicket.toFixed(0)}
                      </td>
                      <td className="border p-2 text-right">
                        {m.revenueMixAttendee.toFixed(0)}%
                      </td>
                      <td className="border p-2 text-right">
                        {m.breakEvenAttendancePercent != null
                          ? `${Math.round(m.breakEvenAttendancePercent)}%`
                          : "—"}
                      </td>
                      <td className="border p-2 text-right">
                        {m.profitTargetCoverage != null
                          ? `${m.profitTargetCoverage.toFixed(0)}%`
                          : "—"}
                      </td>
                      <td className="border p-2 text-right">
                        {m.profitVsBreakEven >= 0 ? "Yes" : "No"}
                      </td>
                      <td className="border p-2 text-right">
                        ${m.costPerAttendee.toFixed(0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </section>

      <footer className="mt-8 border-t pt-4 text-xs text-gray-500">
        Generated by Badger Budget Dashboard
      </footer>
    </div>
  );
}
