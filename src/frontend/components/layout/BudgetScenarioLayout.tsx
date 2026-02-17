import { Suspense, useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useAppState } from "@/state/AppState";
import {
  useBudgetsSuspense,
  useScenariosSuspense,
  useBudgetSuspense,
  useScenarioSuspense,
} from "@/queries/hooks";
import { PageLoading } from "./PageLoading";

/**
 * Loads budgets and scenarios lists (suspends), syncs to AppState, sets default
 * selection, then loads selected budget and scenario (suspends again) and syncs.
 * Use only on /budgeting/projections, /budgeting/budget, /budgeting/scenarios routes.
 */
function BudgetScenarioListsSync({ children }: { children: ReactNode }) {
  const { data: budgets } = useBudgetsSuspense();
  const { data: scenarios } = useScenariosSuspense();
  const { dispatch, selectedBudgetId, selectedScenarioId } = useAppState();
  const location = useLocation();

  useEffect(() => {
    dispatch({ type: "SET_BUDGETS", payload: budgets });
    dispatch({ type: "SET_SCENARIOS", payload: scenarios });
  }, [budgets, scenarios, dispatch]);

  // Sync URL params to selection when on budget/:id or scenarios/:id
  const urlBudgetId = location.pathname.match(/^\/budgeting\/budget\/([^/]+)$/)?.[1];
  const urlScenarioId = location.pathname.match(/^\/budgeting\/scenarios\/([^/]+)$/)?.[1];

  useEffect(() => {
    if (urlBudgetId && budgets.some((b) => b.id === urlBudgetId)) {
      dispatch({ type: "SET_SELECTED_BUDGET", payload: urlBudgetId });
    } else if (budgets.length && selectedBudgetId == null) {
      const first = budgets[0];
      if (first) dispatch({ type: "SET_SELECTED_BUDGET", payload: first.id });
    }
  }, [budgets, selectedBudgetId, urlBudgetId, dispatch]);

  useEffect(() => {
    if (urlScenarioId && scenarios.some((s) => s.id === urlScenarioId)) {
      dispatch({ type: "SET_SELECTED_SCENARIO", payload: urlScenarioId });
    } else if (scenarios.length && selectedScenarioId == null) {
      const first = scenarios[0];
      if (first) dispatch({ type: "SET_SELECTED_SCENARIO", payload: first.id });
    }
  }, [scenarios, selectedScenarioId, urlScenarioId, dispatch]);

  const budgetId = urlBudgetId ?? selectedBudgetId ?? budgets[0]?.id ?? null;
  const scenarioId = urlScenarioId ?? selectedScenarioId ?? scenarios[0]?.id ?? null;

  // On list-only pages, render children without full data sync (lists are already synced)
  const isBudgetList = location.pathname === "/budgeting/budget";
  const isScenarioList = location.pathname === "/budgeting/scenarios";
  if (isBudgetList || isScenarioList) {
    return <>{children}</>;
  }

  if (!budgetId || !scenarioId) {
    return (
      <div className="flex min-h-[280px] items-center justify-center p-6">
        <p className="text-muted-foreground">
          {budgets.length === 0 && scenarios.length === 0
            ? "Create a budget and a scenario to get started."
            : "Select a budget and scenario."}
        </p>
      </div>
    );
  }

  return (
    <Suspense fallback={<PageLoading />}>
      <BudgetScenarioDataSync budgetId={budgetId} scenarioId={scenarioId}>
        {children}
      </BudgetScenarioDataSync>
    </Suspense>
  );
}

function BudgetScenarioDataSync({
  budgetId,
  scenarioId,
  children,
}: {
  budgetId: string;
  scenarioId: string;
  children: ReactNode;
}) {
  const { data: budget } = useBudgetSuspense(budgetId);
  const { data: scenario } = useScenarioSuspense(scenarioId);
  const { dispatch } = useAppState();

  useEffect(() => {
    dispatch({ type: "SET_CURRENT_BUDGET", payload: budget });
    dispatch({ type: "SET_CURRENT_SCENARIO", payload: scenario });
  }, [budget, scenario, dispatch]);

  return <>{children}</>;
}

export function BudgetScenarioLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<PageLoading />}>
      <BudgetScenarioListsSync>{children}</BudgetScenarioListsSync>
    </Suspense>
  );
}