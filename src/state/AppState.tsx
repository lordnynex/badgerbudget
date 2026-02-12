import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  type ReactNode,
} from "react";
import type { BadgerBudgetState, Inputs, LineItem } from "@/types/budget";

type AppState = BadgerBudgetState;

type AppAction =
  | { type: "SET_STATE"; payload: AppState }
  | { type: "UPDATE_INPUTS"; payload: Partial<Inputs> }
  | { type: "UPDATE_TICKET_PRICES"; payload: Partial<Inputs["ticketPrices"]> }
  | { type: "ADD_LINE_ITEM"; payload?: Partial<LineItem> }
  | { type: "UPDATE_LINE_ITEM"; payload: { id: string; updates: Partial<LineItem> } }
  | { type: "DELETE_LINE_ITEM"; payload: string }
  | { type: "ADD_CATEGORY"; payload: string }
  | { type: "REORDER_LINE_ITEMS"; payload: LineItem[] };

function generateId(): string {
  return crypto.randomUUID();
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_STATE":
      return action.payload;

    case "UPDATE_INPUTS":
      return {
        ...state,
        inputs: { ...state.inputs, ...action.payload },
      };

    case "UPDATE_TICKET_PRICES":
      return {
        ...state,
        inputs: {
          ...state.inputs,
          ticketPrices: { ...state.inputs.ticketPrices, ...action.payload },
        },
      };

    case "ADD_LINE_ITEM": {
      const newItem: LineItem = {
        id: generateId(),
        name: action.payload?.name ?? "New Item",
        category: action.payload?.category ?? state.categories[0] ?? "Miscellaneous",
        comments: action.payload?.comments,
        unitCost: action.payload?.unitCost ?? 0,
        quantity: action.payload?.quantity ?? 1,
        historicalCosts: action.payload?.historicalCosts,
      };
      return {
        ...state,
        lineItems: [...state.lineItems, newItem],
      };
    }

    case "UPDATE_LINE_ITEM": {
      const { id, updates } = action.payload;
      return {
        ...state,
        lineItems: state.lineItems.map((li) =>
          li.id === id ? { ...li, ...updates } : li
        ),
      };
    }

    case "DELETE_LINE_ITEM": {
      return {
        ...state,
        lineItems: state.lineItems.filter((li) => li.id !== action.payload),
      };
    }

    case "ADD_CATEGORY": {
      const cat = action.payload.trim();
      if (!cat || state.categories.includes(cat)) return state;
      return {
        ...state,
        categories: [...state.categories, cat],
      };
    }

    case "REORDER_LINE_ITEMS":
      return { ...state, lineItems: action.payload };

    default:
      return state;
  }
}

interface AppStateContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  updateInputs: (updates: Partial<Inputs>) => void;
  updateTicketPrices: (updates: Partial<Inputs["ticketPrices"]>) => void;
  addLineItem: (item?: Partial<LineItem>) => void;
  updateLineItem: (id: string, updates: Partial<LineItem>) => void;
  deleteLineItem: (id: string) => void;
  addCategory: (name: string) => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState: AppState;
}) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const updateInputs = useCallback((updates: Partial<Inputs>) => {
    dispatch({ type: "UPDATE_INPUTS", payload: updates });
  }, []);

  const updateTicketPrices = useCallback(
    (updates: Partial<Inputs["ticketPrices"]>) => {
      dispatch({ type: "UPDATE_TICKET_PRICES", payload: updates });
    },
    []
  );

  const addLineItem = useCallback((item?: Partial<LineItem>) => {
    dispatch({ type: "ADD_LINE_ITEM", payload: item });
  }, []);

  const updateLineItem = useCallback((id: string, updates: Partial<LineItem>) => {
    dispatch({ type: "UPDATE_LINE_ITEM", payload: { id, updates } });
  }, []);

  const deleteLineItem = useCallback((id: string) => {
    dispatch({ type: "DELETE_LINE_ITEM", payload: id });
  }, []);

  const addCategory = useCallback((name: string) => {
    dispatch({ type: "ADD_CATEGORY", payload: name });
  }, []);

  const value: AppStateContextValue = {
    state,
    dispatch,
    updateInputs,
    updateTicketPrices,
    addLineItem,
    updateLineItem,
    deleteLineItem,
    addCategory,
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
