import { useState } from "react";
import { InputsPanel } from "@/components/inputs/InputsPanel";
import { BudgetsPanel } from "@/components/budget/BudgetsPanel";
import { ScenariosPanel } from "@/components/scenarios/ScenariosPanel";
import { EventsPanel } from "@/components/events/EventsPanel";
import { BudgetScenarioSelectors } from "@/components/dashboard/BudgetScenarioSelectors";
import { ExportDropdown } from "./ExportDropdown";
import { ROIChart } from "@/components/charts/ROIChart";
import { PnLChart } from "@/components/charts/PnLChart";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { CostPerAttendeeChart } from "@/components/charts/CostPerAttendeeChart";
import { CostPerCategoryChart } from "@/components/charts/CostPerCategoryChart";
import { CostPerCategoryBarChart } from "@/components/charts/CostPerCategoryBarChart";
import { useAppState } from "@/state/AppState";
import { useScenarioMetrics } from "@/hooks/useScenarioMetrics";
import {
  ScenarioFilter,
  type ScenarioFilterState,
} from "@/components/dashboard/ScenarioFilter";
import { SummarySection } from "@/components/dashboard/SummarySection";
import { FoodCostBreakdown } from "@/components/dashboard/FoodCostBreakdown";
import { ScenarioDetailCard } from "@/components/dashboard/ScenarioDetailCard";
import { ScenarioMatrixTable } from "@/components/dashboard/ScenarioMatrixTable";
import { ScenarioProfitHeatmap } from "@/components/scenarios/ScenarioProfitHeatmap";

interface MainProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onPrint?: () => void;
  onEmail?: () => void;
}

export function Main({ activeTab, onTabChange, onPrint, onEmail }: MainProps) {
  const { getInputs, getLineItems } = useAppState();
  const metrics = useScenarioMetrics(getInputs(), getLineItems());
  const [filter, setFilter] = useState<ScenarioFilterState>({
    scenarioKey: null,
    ticketPrice: null,
    staffPrice: null,
    attendancePercent: null,
  });

  const filteredMetrics = metrics.filter((m) => {
    if (filter.scenarioKey != null) return m.scenarioKey === filter.scenarioKey;
    if (filter.ticketPrice != null && m.ticketPrice !== filter.ticketPrice) return false;
    if (filter.staffPrice != null && m.staffPrice !== filter.staffPrice) return false;
    if (filter.attendancePercent != null && m.attendancePercent !== filter.attendancePercent) return false;
    return true;
  });

  const showCharts = filteredMetrics.length > 1 && filteredMetrics.length <= 12;

  return (
    <main className="space-y-6 p-4 md:p-6">
      {activeTab === "events" && <EventsPanel />}
      {activeTab === "projections" && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <BudgetScenarioSelectors />
            {onPrint && onEmail && (
              <ExportDropdown onPrint={onPrint} onEmail={onEmail} />
            )}
          </div>
          <ScenarioFilter
            metrics={metrics}
            filter={filter}
            onFilterChange={setFilter}
          />
          <InputsPanel />
          <SummarySection metrics={metrics} filteredMetrics={filteredMetrics} />
          <FoodCostBreakdown lineItems={getLineItems()} inputs={getInputs()} />
          <section className="grid gap-6 md:grid-cols-2">
            <CostPerCategoryChart lineItems={getLineItems()} />
            <CostPerCategoryBarChart lineItems={getLineItems()} />
          </section>
          {filteredMetrics.length === 1 ? (
            <ScenarioDetailCard metric={filteredMetrics[0]} />
          ) : filteredMetrics.length > 1 && filteredMetrics.length <= 12 ? (
            <>
              <ScenarioProfitHeatmap metrics={metrics} />
              <ScenarioMatrixTable metrics={filteredMetrics} />
              {showCharts && (
                <section className="grid gap-6 md:grid-cols-2">
                  <ROIChart metrics={filteredMetrics} />
                  <PnLChart metrics={filteredMetrics} />
                  <RevenueChart metrics={filteredMetrics} />
                  <CostPerAttendeeChart metrics={filteredMetrics} />
                </section>
              )}
            </>
          ) : (
            <>
              <ScenarioProfitHeatmap metrics={metrics} />
              <ScenarioMatrixTable metrics={filteredMetrics} />
            </>
          )}
        </>
      )}
      {activeTab === "budget" && <BudgetsPanel />}
      {activeTab === "scenarios" && <ScenariosPanel />}
    </main>
  );
}
