export interface Event {
  id: string;
  name: string;
  description: string | null;
  year: number | null;
  created_at?: string;
}

export interface Inputs {
  profitTarget: number;
  staffCount: number;
  maxOccupancy: number;
  dayPassPrice: number;
  dayPassesSold: number;
  ticketPrices: {
    proposedPrice1: number;
    proposedPrice2: number;
    proposedPrice3: number;
    staffPrice1: number;
    staffPrice2: number;
    staffPrice3: number;
  };
}

export interface LineItem {
  id: string;
  name: string;
  category: string;
  comments?: string;
  unitCost: number;
  quantity: number;
  historicalCosts?: Record<string, number>;
}

export interface Budget {
  id: string;
  name: string;
  year: number;
  description: string | null;
  created_at?: string;
  lineItems: LineItem[];
}

export interface BudgetSummary {
  id: string;
  name: string;
  year: number;
  description: string | null;
  created_at: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string | null;
  inputs: Inputs;
  created_at?: string;
}

export interface ScenarioSummary {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface AttendanceScenarios {
  ticketPrices: number[];
  attendanceLevels: Record<string, number[]>;
}

export interface BadgerBudgetState {
  version: 1;
  inputs: Inputs;
  lineItems: LineItem[];
  attendanceScenarios: AttendanceScenarios;
  categories: string[];
}

export type ScenarioKey = string;

export interface ScenarioMetrics {
  scenarioKey: ScenarioKey;
  ticketPrice: number;
  staffPrice: number;
  attendancePercent: number;
  attendees: number;
  revenue: number;
  totalCosts: number;
  totalCostsWithProfitTarget: number;
  profit: number;
  profitVsBreakEven: number;
  roi: number;
  costPerAttendee: number;
}
