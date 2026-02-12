import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  type ReactNode,
} from "react";
import { api } from "@/data/api";
import type { Budget, Inputs, LineItem, Scenario } from "@/types/budget";

const DEFAULT_CATEGORIES = [
  "Venue",
  "Food & Beverage",
  "Equipment",
  "Transport",
  "Admin",
  "Merchandise",
  "Miscellaneous",
];

const DEFAULT_INPUTS: Inputs = {
  profitTarget: 2500,
  staffCount: 14,
  maxOccupancy: 75,
  dayPassPrice: 50,
  dayPassesSold: 0,
  ticketPrices: {
    proposedPrice1: 200,
    proposedPrice2: 250,
    proposedPrice3: 300,
    staffPrice1: 150,
    staffPrice2: 125,
    staffPrice3: 100,
  },
};

interface AppState {
  budgets: Array<{ id: string; name: string; year: number; description: string | null }>;
  scenarios: Array<{ id: string; name: string; description: string | null }>;
  selectedBudgetId: string | null;
  selectedScenarioId: string | null;
  currentBudget: Budget | null;
  currentScenario: Scenario | null;
  categories: string[];
  loading: boolean;
  error: string | null;
}

type AppAction =
  | { type: "SET_BUDGETS"; payload: AppState["budgets"] }
  | { type: "SET_SCENARIOS"; payload: AppState["scenarios"] }
  | { type: "SET_SELECTED_BUDGET"; payload: string | null }
  | { type: "SET_SELECTED_SCENARIO"; payload: string | null }
  | { type: "SET_CURRENT_BUDGET"; payload: Budget | null }
  | { type: "SET_CURRENT_SCENARIO"; payload: Scenario | null }
  | { type: "UPDATE_SCENARIO_INPUTS_LOCAL"; payload: Partial<Inputs> }
  | { type: "ADD_LINE_ITEM_LOCAL"; payload: LineItem }
  | { type: "UPDATE_LINE_ITEM_LOCAL"; payload: { id: string; updates: Partial<LineItem> } }
  | { type: "DELETE_LINE_ITEM_LOCAL"; payload: string }
  | { type: "ADD_CATEGORY"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_BUDGETS":
      return { ...state, budgets: action.payload };
    case "SET_SCENARIOS":
      return { ...state, scenarios: action.payload };
    case "SET_SELECTED_BUDGET":
      return { ...state, selectedBudgetId: action.payload };
    case "SET_SELECTED_SCENARIO":
      return { ...state, selectedScenarioId: action.payload };
    case "SET_CURRENT_BUDGET":
      return { ...state, currentBudget: action.payload };
    case "SET_CURRENT_SCENARIO":
      return { ...state, currentScenario: action.payload };
    case "UPDATE_SCENARIO_INPUTS_LOCAL":
      return {
        ...state,
        currentScenario: state.currentScenario
          ? { ...state.currentScenario, inputs: { ...state.currentScenario.inputs, ...action.payload } }
          : null,
      };
    case "ADD_LINE_ITEM_LOCAL":
      return {
        ...state,
        currentBudget: state.currentBudget
          ? {
              ...state.currentBudget,
              lineItems: [...state.currentBudget.lineItems, action.payload],
            }
          : null,
      };
    case "UPDATE_LINE_ITEM_LOCAL": {
      const { id, updates } = action.payload;
      return {
        ...state,
        currentBudget: state.currentBudget
          ? {
              ...state.currentBudget,
              lineItems: state.currentBudget.lineItems.map((li) =>
                li.id === id ? { ...li, ...updates } : li
              ),
            }
          : null,
      };
    }
    case "DELETE_LINE_ITEM_LOCAL":
      return {
        ...state,
        currentBudget: state.currentBudget
          ? {
              ...state.currentBudget,
              lineItems: state.currentBudget.lineItems.filter((li) => li.id !== action.payload),
            }
          : null,
      };
    case "ADD_CATEGORY": {
      const cat = action.payload.trim();
      if (!cat || state.categories.includes(cat)) return state;
      return { ...state, categories: [...state.categories, cat] };
    }
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

interface AppStateContextValue extends AppState {
  dispatch: React.Dispatch<AppAction>;
  selectBudget: (id: string | null) => Promise<void>;
  selectScenario: (id: string | null) => Promise<void>;
  refreshBudget: (id: string) => Promise<void>;
  refreshScenario: (id: string) => Promise<void>;
  refreshBudgets: () => Promise<void>;
  refreshScenarios: () => Promise<void>;
  updateScenarioInputs: (scenarioId: string, inputs: Partial<Inputs>) => Promise<void>;
  addLineItem: (budgetId: string, item?: Partial<LineItem>) => Promise<void>;
  updateLineItem: (budgetId: string, id: string, updates: Partial<LineItem>) => Promise<void>;
  deleteLineItem: (budgetId: string, id: string) => Promise<void>;
  addCategory: (name: string) => void;
  getInputs: () => Inputs;
  getLineItems: () => LineItem[];
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, {
    budgets: [],
    scenarios: [],
    selectedBudgetId: null,
    selectedScenarioId: null,
    currentBudget: null,
    currentScenario: null,
    categories: DEFAULT_CATEGORIES,
    loading: true,
    error: null,
  });

  const selectBudget = useCallback(async (id: string | null) => {
    dispatch({ type: "SET_SELECTED_BUDGET", payload: id });
    if (!id) {
      dispatch({ type: "SET_CURRENT_BUDGET", payload: null });
      return;
    }
    const budget = await api.budgets.get(id);
    dispatch({ type: "SET_CURRENT_BUDGET", payload: budget });
  }, []);

  const selectScenario = useCallback(async (id: string | null) => {
    dispatch({ type: "SET_SELECTED_SCENARIO", payload: id });
    if (!id) {
      dispatch({ type: "SET_CURRENT_SCENARIO", payload: null });
      return;
    }
    const scenario = await api.scenarios.get(id);
    dispatch({ type: "SET_CURRENT_SCENARIO", payload: scenario });
  }, []);

  const refreshBudget = useCallback(async (id: string) => {
    const budget = await api.budgets.get(id);
    if (state.selectedBudgetId === id) {
      dispatch({ type: "SET_CURRENT_BUDGET", payload: budget });
    }
  }, [state.selectedBudgetId]);

  const refreshScenario = useCallback(async (id: string) => {
    const scenario = await api.scenarios.get(id);
    if (state.selectedScenarioId === id) {
      dispatch({ type: "SET_CURRENT_SCENARIO", payload: scenario });
    }
  }, [state.selectedScenarioId]);

  const refreshBudgets = useCallback(async () => {
    const list = await api.budgets.list();
    dispatch({ type: "SET_BUDGETS", payload: list });
  }, []);

  const refreshScenarios = useCallback(async () => {
    const list = await api.scenarios.list();
    dispatch({ type: "SET_SCENARIOS", payload: list });
  }, []);

  const updateScenarioInputs = useCallback(async (scenarioId: string, inputs: Partial<Inputs>) => {
    const current = state.currentScenario?.inputs ?? DEFAULT_INPUTS;
    const merged = { ...current, ...inputs };
    await api.scenarios.update(scenarioId, { inputs: merged });
    dispatch({ type: "UPDATE_SCENARIO_INPUTS_LOCAL", payload: inputs });
  }, [state.currentScenario]);

  const addLineItem = useCallback(
    async (budgetId: string, item?: Partial<LineItem>) => {
      const budget = state.currentBudget;
      if (!budget || budget.id !== budgetId) return;
      const created = await api.budgets.addLineItem(budgetId, {
        name: item?.name ?? "New Item",
        category: item?.category ?? state.categories[0] ?? "Miscellaneous",
        comments: item?.comments,
        unitCost: item?.unitCost ?? 0,
        quantity: item?.quantity ?? 1,
        historicalCosts: item?.historicalCosts,
      });
      dispatch({ type: "ADD_LINE_ITEM_LOCAL", payload: created });
    },
    [state.currentBudget, state.categories]
  );

  const updateLineItem = useCallback(
    async (budgetId: string, id: string, updates: Partial<LineItem>) => {
      await api.budgets.updateLineItem(budgetId, id, updates);
      dispatch({ type: "UPDATE_LINE_ITEM_LOCAL", payload: { id, updates } });
    },
    []
  );

  const deleteLineItem = useCallback(async (budgetId: string, id: string) => {
    await api.budgets.deleteLineItem(budgetId, id);
    dispatch({ type: "DELETE_LINE_ITEM_LOCAL", payload: id });
  }, []);

  const addCategory = useCallback((name: string) => {
    dispatch({ type: "ADD_CATEGORY", payload: name });
  }, []);

  const getInputs = useCallback((): Inputs => {
    return state.currentScenario?.inputs ?? DEFAULT_INPUTS;
  }, [state.currentScenario]);

  const getLineItems = useCallback((): LineItem[] => {
    return state.currentBudget?.lineItems ?? [];
  }, [state.currentBudget]);

  const value: AppStateContextValue = {
    ...state,
    dispatch,
    selectBudget,
    selectScenario,
    refreshBudget,
    refreshScenario,
    refreshBudgets,
    refreshScenarios,
    updateScenarioInputs,
    addLineItem,
    updateLineItem,
    deleteLineItem,
    addCategory,
    getInputs,
    getLineItems,
  };

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return ctx;
}
