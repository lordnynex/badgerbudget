import { InputsPanel } from "@/components/inputs/InputsPanel";
import { BudgetsPanel } from "@/components/budget/BudgetsPanel";
import { ScenariosPanel } from "@/components/scenarios/ScenariosPanel";
import { EventsPanel } from "@/components/events/EventsPanel";
import { BudgetScenarioSelectors } from "@/components/dashboard/BudgetScenarioSelectors";
import { ExportDropdown } from "./ExportDropdown";
import { CostPerCategoryChart } from "@/components/charts/CostPerCategoryChart";
import { CostPerCategoryBarChart } from "@/components/charts/CostPerCategoryBarChart";
import { useAppState } from "@/state/AppState";
import { useScenarioMetrics } from "@/hooks/useScenarioMetrics";
import { SummarySection } from "@/components/dashboard/SummarySection";
import { FoodCostBreakdown } from "@/components/dashboard/FoodCostBreakdown";
import { ScenarioMatrixTable } from "@/components/dashboard/ScenarioMatrixTable";
import { ScenarioProfitHeatmap } from "@/components/scenarios/ScenarioProfitHeatmap";
import { ProjectionsSubNav } from "./ProjectionsSubNav";

interface MainProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onPrint?: () => void;
  onEmail?: () => void;
}

export function Main({ activeTab, onTabChange, onPrint, onEmail }: MainProps) {
  const { getInputs, getLineItems } = useAppState();
  const metrics = useScenarioMetrics(getInputs(), getLineItems());

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
          <InputsPanel readOnly onEditScenario={() => onTabChange("scenarios")} />
          <ProjectionsSubNav />
          <section id="summary" className="scroll-mt-6">
            <SummarySection metrics={metrics} filteredMetrics={metrics} />
          </section>
          <section id="food-cost" className="scroll-mt-6">
            <FoodCostBreakdown lineItems={getLineItems()} inputs={getInputs()} />
          </section>
          <section id="cost-analysis" className="scroll-mt-6 grid gap-6 md:grid-cols-2">
            <CostPerCategoryChart lineItems={getLineItems()} />
            <CostPerCategoryBarChart lineItems={getLineItems()} />
          </section>
          <section id="scenario-matrix" className="scroll-mt-6 space-y-6">
            <ScenarioProfitHeatmap metrics={metrics} />
            <ScenarioMatrixTable
              metrics={metrics}
              profitTarget={getInputs().profitTarget}
            />
          </section>
        </>
      )}
      {activeTab === "budget" && <BudgetsPanel />}
      {activeTab === "scenarios" && <ScenariosPanel />}
    </main>
  );
}
