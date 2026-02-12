import { useState } from "react";
import { InputsPanel } from "@/components/inputs/InputsPanel";
import { BudgetsPanel } from "@/components/budget/BudgetsPanel";
import { ScenariosPanel } from "@/components/scenarios/ScenariosPanel";
import { BudgetScenarioSelectors } from "@/components/dashboard/BudgetScenarioSelectors";
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
import { ScenarioDetailCard } from "@/components/dashboard/ScenarioDetailCard";
import { ScenarioMatrixTable } from "@/components/dashboard/ScenarioMatrixTable";

interface MainProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Main({ activeTab }: MainProps) {
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
      {activeTab === "overview" && (
        <>
          <BudgetScenarioSelectors />
          <InputsPanel />
          <SummarySection metrics={metrics} filteredMetrics={filteredMetrics} />
          <ScenarioFilter
            metrics={metrics}
            filter={filter}
            onFilterChange={setFilter}
          />
          <section className="grid gap-6 md:grid-cols-2">
            <CostPerCategoryChart lineItems={getLineItems()} />
            <CostPerCategoryBarChart lineItems={getLineItems()} />
          </section>
          {filteredMetrics.length === 1 ? (
            <ScenarioDetailCard metric={filteredMetrics[0]} />
          ) : filteredMetrics.length > 1 && filteredMetrics.length <= 12 ? (
            <>
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
            <ScenarioMatrixTable metrics={filteredMetrics} />
          )}
        </>
      )}
      {activeTab === "budget" && (
        <>
          <BudgetScenarioSelectors />
          <BudgetsPanel />
        </>
      )}
      {activeTab === "scenarios" && <ScenariosPanel />}
    </main>
  );
}
