import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { ScenarioMetrics } from "@/types/budget";

export interface ScenarioFilterState {
  scenarioKey: string | null;
  ticketPrice: number | null;
  staffPrice: number | null;
  attendancePercent: number | null;
}

interface ScenarioFilterProps {
  metrics: ScenarioMetrics[];
  filter: ScenarioFilterState;
  onFilterChange: (filter: ScenarioFilterState) => void;
}

export function ScenarioFilter({
  metrics,
  filter,
  onFilterChange,
}: ScenarioFilterProps) {
  const ticketPrices = [...new Set(metrics.map((m) => m.ticketPrice))].sort((a, b) => a - b);
  const staffPrices = [...new Set(metrics.map((m) => m.staffPrice))].sort((a, b) => a - b);
  const attendancePercents = [...new Set(metrics.map((m) => m.attendancePercent))].sort((a, b) => a - b);

  const uniqueKeys = [...new Set(metrics.map((m) => m.scenarioKey))].sort();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Filter scenarios</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-end gap-4">
      <div className="space-y-2">
        <Label>Scenario</Label>
        <Select
          value={filter.scenarioKey ?? "all"}
          onValueChange={(v) =>
            onFilterChange({ ...filter, scenarioKey: v === "all" ? null : v })
          }
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All scenarios" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All scenarios</SelectItem>
            {uniqueKeys.map((key) => (
              <SelectItem key={key} value={key}>
                {key}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Ticket price</Label>
        <Select
          value={filter.ticketPrice?.toString() ?? "all"}
          onValueChange={(v) =>
            onFilterChange({
              ...filter,
              ticketPrice: v === "all" ? null : parseFloat(v),
            })
          }
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {ticketPrices.map((p) => (
              <SelectItem key={p} value={String(p)}>
                ${p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Staff price</Label>
        <Select
          value={filter.staffPrice?.toString() ?? "all"}
          onValueChange={(v) =>
            onFilterChange({
              ...filter,
              staffPrice: v === "all" ? null : parseFloat(v),
            })
          }
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {staffPrices.map((p) => (
              <SelectItem key={p} value={String(p)}>
                ${p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Attendance</Label>
        <Select
          value={filter.attendancePercent?.toString() ?? "all"}
          onValueChange={(v) =>
            onFilterChange({
              ...filter,
              attendancePercent: v === "all" ? null : parseFloat(v),
            })
          }
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {attendancePercents.map((p) => (
              <SelectItem key={p} value={String(p)}>
                {p}%
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
        </div>
      </CardContent>
    </Card>
  );
}
