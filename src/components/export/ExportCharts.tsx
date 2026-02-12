import { useEffect, useRef, useState } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import ApexCharts from "apexcharts";
import type { Inputs, LineItem, ScenarioMetrics } from "@/types/budget";
import { getCategoryTotals } from "@/export/exportData";

const CHART_IDS = {
  costDonut: "export-cost-donut",
  costBar: "export-cost-bar",
  heatmap: "export-heatmap",
} as const;

interface ExportChartsProps {
  lineItems: LineItem[];
  metrics: ScenarioMetrics[];
  profitTarget?: number;
  onChartsReady: (images: Record<string, string>) => void;
}

export function ExportCharts({
  lineItems,
  metrics,
  profitTarget = 0,
  onChartsReady,
}: ExportChartsProps) {
  const [mounted, setMounted] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || doneRef.current) return;

    const timer = setTimeout(async () => {
      if (doneRef.current) return;
      doneRef.current = true;

      const images: Record<string, string> = {};

      try {
        for (const [key, id] of Object.entries(CHART_IDS)) {
          const result = await ApexCharts.exec(id, "dataURI", {
            quality: 1,
            scale: 2,
          });
          if (result?.imgURI) {
            images[key] = result.imgURI;
          }
        }
      } catch {
        // Charts may not be ready; continue with empty images
      }
      onChartsReady(images);
    }, 2000);

    return () => clearTimeout(timer);
  }, [mounted, onChartsReady]);

  const categoryTotals = getCategoryTotals(lineItems);
  const categories = Object.keys(categoryTotals).sort();
  const costData = categories.map((c) =>
    Math.round(categoryTotals[c] * 100) / 100
  );

  const donutOptions: ApexOptions = {
    chart: {
      id: CHART_IDS.costDonut,
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
              formatter: () => {
                const total = costData.reduce((a, b) => a + b, 0);
                return `$${total.toLocaleString()}`;
              },
            },
          },
        },
      },
    },
  };

  const barOptions: ApexOptions = {
    chart: {
      id: CHART_IDS.costBar,
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
      if (sp <= tp) columnKeys.push(`$${tp}/$${sp}`);
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
      id: CHART_IDS.heatmap,
      type: "heatmap",
      fontFamily: "inherit",
      background: "#fff",
      toolbar: { show: false },
    },
    theme: { mode: "light" },
    dataLabels: {
      enabled: true,
      formatter: (_, opts) => {
        const val = opts.w.config.series[opts.seriesIndex]?.data[opts.dataPointIndex]?.y;
        return typeof val === "number" ? `$${Math.round(val).toLocaleString()}` : "";
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
            ...(maxProfit >= 0 && profitTarget > 0
              ? [{ from: 0, to: profitTarget - 0.01, color: "#f97316", name: "Profit (below target)" }]
              : []),
            ...(maxProfit >= 0
              ? [{ from: Math.max(0, profitTarget), to: Math.max(maxProfit, profitTarget + 1), color: "#22c55e", name: "Meets target" }]
              : []),
          ],
        },
      },
    },
    xaxis: { labels: { rotate: -45 } },
  };

  return (
    <div
      className="pointer-events-none absolute left-[-9999px] top-0 w-[800px] overflow-hidden bg-white"
      aria-hidden
    >
      <div className="p-4">
        <h3 className="mb-2 text-sm font-semibold text-black">Cost by Category</h3>
        <Chart
          options={donutOptions}
          series={costData}
          type="donut"
          height={280}
        />
      </div>
      <div className="p-4">
        <h3 className="mb-2 text-sm font-semibold text-black">Cost by Category (Bar)</h3>
        <Chart
          options={barOptions}
          series={[{ name: "Cost", data: costData }]}
          type="bar"
          height={Math.max(200, categories.length * 40)}
        />
      </div>
      <div className="p-4">
        <h3 className="mb-2 text-sm font-semibold text-black">Profit by Scenario</h3>
        <Chart
          options={heatmapOptions}
          series={heatmapSeries}
          type="heatmap"
          height={280}
        />
      </div>
    </div>
  );
}
