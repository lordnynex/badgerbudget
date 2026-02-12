import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { ChartCard } from "./ChartCard";
import type { ScenarioMetrics } from "@/types/budget";

interface PnLChartProps {
  metrics: ScenarioMetrics[];
}

export function PnLChart({ metrics }: PnLChartProps) {
  const labels = metrics.map((m) => m.scenarioKey);
  const profit = metrics.map((m) => m.profit);

  const series = [
    {
      name: "Profit / Loss",
      data: profit,
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "inherit",
      background: "transparent",
    },
    theme: { mode: "dark" },
    colors: profit.map((p) => (p >= 0 ? "#22c55e" : "#ef4444")),
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "60%",
        borderRadius: 4,
        distributed: true,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (v) => `$${Number(v).toLocaleString()}`,
    },
    stroke: { show: true, width: 1 },
    xaxis: {
      categories: labels,
      labels: { rotate: -45 },
    },
    yaxis: {
      title: { text: "Profit / Loss ($)" },
    },
    grid: {
      borderColor: "rgba(255,255,255,0.1)",
      strokeDashArray: 4,
    },
    legend: { show: false },
  };

  return (
    <ChartCard
      title="Profit & Loss by Scenario"
      description="Whether each scenario makes or loses money. Green bars mean profit; red bars mean loss."
      calculationNote="Revenue − Total Costs"
    >
      <Chart
        options={options}
        series={series}
        type="bar"
        height={280}
      />
    </ChartCard>
  );
}
