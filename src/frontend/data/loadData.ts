import type { BadgerBudgetState, Inputs, LineItem } from "@/types/budget";

interface LegacyLineItem {
  item: string;
  badger_south: number | null;
  badger_60: number | null;
  badger_59: number | null;
}

interface LegacyExport {
  BadgerSouth?: {
    inputs?: {
      profit_target?: number;
      staff_count?: number;
      max_occupancy?: number;
      ticket_prices?: {
        proposed_price_1?: number;
        proposed_price_2?: number;
        proposed_price_3?: number;
        staff_price?: number;
      };
    };
    attendance_scenarios?: {
      with_staff_price_tickets?: {
        ticket_prices?: number[];
        attendance_levels?: Record<string, number[]>;
      };
    };
  };
  BadgerComparisonBudget?: {
    line_items?: LegacyLineItem[];
  };
}

const DEFAULT_CATEGORIES = [
  "Venue",
  "Food & Beverage",
  "Equipment",
  "Transport",
  "Admin",
  "Merchandise",
  "Miscellaneous",
];

function generateId(): string {
  return crypto.randomUUID();
}

const CATEGORY_MAP: Record<string, string> = {
  Campground: "Venue",
  "Trash bags (individual)": "Miscellaneous",
  "Large white envelopes": "Admin",
  Food: "Food & Beverage",
  Bar: "Food & Beverage",
  Coffee: "Food & Beverage",
  Ice: "Food & Beverage",
  "First Aid Restock": "Equipment",
  O2: "Equipment",
  "Run Gift": "Merchandise",
  "Run Pins": "Merchandise",
  "Program Print": "Admin",
  "Trash Service": "Venue",
  Firewood: "Equipment",
  Propane: "Equipment",
  "Generator Gas": "Equipment",
  "Truck Fuel": "Transport",
  "Truck Rental": "Transport",
  "Labor Loading/Unloading": "Admin",
  Miscellaneous: "Miscellaneous",
  "Garage Rent": "Venue",
  "Merchant Fees": "Admin",
  "PayPal Fees": "Admin",
  Postage: "Admin",
};

function migrateLineItem(legacy: LegacyLineItem, index: number): LineItem {
  const unitCost =
    legacy.badger_south ?? legacy.badger_60 ?? legacy.badger_59 ?? 0;
  const category = CATEGORY_MAP[legacy.item] ?? "Miscellaneous";
  return {
    id: generateId(),
    name: legacy.item,
    category,
    unitCost,
    quantity: 1,
    historicalCosts: {
      ...(legacy.badger_59 != null && { badger_59: legacy.badger_59 }),
      ...(legacy.badger_60 != null && { badger_60: legacy.badger_60 }),
      ...(legacy.badger_south != null && { badger_south: legacy.badger_south }),
    },
  };
}

function ensureTicketPrices(tp: Record<string, number>): BadgerBudgetState["inputs"]["ticketPrices"] {
  const staff = tp.staffPrice ?? tp.staffPrice1 ?? 150;
  return {
    proposedPrice1: tp.proposedPrice1 ?? 200,
    proposedPrice2: tp.proposedPrice2 ?? 250,
    proposedPrice3: tp.proposedPrice3 ?? 300,
    staffPrice1: tp.staffPrice1 ?? staff,
    staffPrice2: tp.staffPrice2 ?? staff * 0.85,
    staffPrice3: tp.staffPrice3 ?? staff * 0.67,
  };
}

function migrateInputs(legacy: LegacyExport): Inputs {
  const bs = legacy.BadgerSouth?.inputs;
  const tp = bs?.ticket_prices;
  return {
    profitTarget: bs?.profit_target ?? 2500,
    staffCount: bs?.staff_count ?? 14,
    maxOccupancy: bs?.max_occupancy ?? 75,
    complimentaryTickets: (bs as { complimentary_tickets?: number })?.complimentary_tickets ?? 0,
    dayPassPrice: (bs as { day_pass_price?: number })?.day_pass_price ?? 50,
    dayPassesSold: (bs as { day_passes_sold?: number })?.day_passes_sold ?? 0,
    ticketPrices: ensureTicketPrices({
      proposedPrice1: tp?.proposed_price_1 ?? 200,
      proposedPrice2: tp?.proposed_price_2 ?? 250,
      proposedPrice3: tp?.proposed_price_3 ?? 300,
      staffPrice: tp?.staff_price ?? 150,
    }),
  };
}

function migrateAttendanceScenarios(legacy: LegacyExport): BadgerBudgetState["attendanceScenarios"] {
  const scenarios = legacy.BadgerSouth?.attendance_scenarios?.with_staff_price_tickets;
  return {
    ticketPrices: scenarios?.ticket_prices ?? [200, 250, 300],
    attendanceLevels: scenarios?.attendance_levels ?? {
      "100_percent": [14300, 17350, 20400],
      "75_percent": [10500, 12600, 14700],
      "50_percent": [6900, 8100, 9300],
      "25_percent": [3100, 3350, 3600],
    },
  };
}

export function migrateLegacyExport(legacy: LegacyExport): BadgerBudgetState {
  const lineItems =
    legacy.BadgerComparisonBudget?.line_items?.map((li, i) =>
      migrateLineItem(li, i)
    ) ?? [];

  return {
    version: 1,
    inputs: migrateInputs(legacy),
    lineItems,
    attendanceScenarios: migrateAttendanceScenarios(legacy),
    categories: DEFAULT_CATEGORIES,
  };
}

function normalizeMigratedState(raw: BadgerBudgetState): BadgerBudgetState {
  const tp = raw.inputs.ticketPrices as Record<string, number>;
  const hasDayPass =
    "dayPassPrice" in raw.inputs && "dayPassesSold" in raw.inputs;
  const hasComplimentary =
    "complimentaryTickets" in raw.inputs;
  const needsTicketFix = !(tp.staffPrice1 && tp.staffPrice2 && tp.staffPrice3);
  if (!needsTicketFix && hasDayPass && hasComplimentary) return raw;
  return {
    ...raw,
    inputs: {
      ...raw.inputs,
      ...(needsTicketFix && { ticketPrices: ensureTicketPrices(tp) }),
      ...(!hasDayPass && {
        dayPassPrice: 50,
        dayPassesSold: 0,
      }),
      ...(!hasComplimentary && { complimentaryTickets: 0 }),
    },
  };
}

function isMigratedState(raw: unknown): raw is BadgerBudgetState {
  const o = raw as BadgerBudgetState;
  return (
    typeof raw === "object" &&
    raw != null &&
    o.version === 1 &&
    Array.isArray(o.lineItems)
  );
}

export async function loadBudgetData(): Promise<BadgerBudgetState> {
  const res = await fetch("/data/export.json");
  if (!res.ok) {
    throw new Error(`Failed to load data: ${res.status}`);
  }
  const raw = (await res.json()) as LegacyExport | BadgerBudgetState;
  if (isMigratedState(raw)) {
    return normalizeMigratedState(raw);
  }
  return migrateLegacyExport(raw as LegacyExport);
}
