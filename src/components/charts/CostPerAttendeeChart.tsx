import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { ChartCard } from "./ChartCard";
import type { ScenarioMetrics } from "@/types/budget";

interface CostPerAttendeeChartProps {
  metrics: ScenarioMetrics[];
}

export function CostPerAttendeeChart({ metrics }: CostPerAttendeeChartProps) {
  const labels = metrics.map((m) => m.scenarioKey);
  const costPerAttendee = metrics.map((m) => m.costPerAttendee);

  const series = [
    {
      name: "Cost per Attendee",
      data: costPerAttendee.map((v) => Math.round(v * 100) / 100),
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
    colors: ["#f59e0b"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "60%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (v) => `$${Number(v).toFixed(0)}`,
    },
    stroke: { show: true, width: 1 },
    xaxis: {
      categories: labels,
      labels: { rotate: -45 },
    },
    yaxis: {
      title: { text: "Cost per Person ($)" },
    },
    grid: {
      borderColor: "rgba(255,255,255,0.1)",
      strokeDashArray: 4,
    },
    legend: { show: false },
  };

  return (
    <ChartCard
      title="Cost per Attendee"
      description="Amount spent per person attending. Lower numbers mean costs are spread across more people."
      calculationNote="Total Costs ÷ (Attendees + Staff)"
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
