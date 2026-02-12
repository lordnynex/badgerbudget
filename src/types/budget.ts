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
  profitVsBreakEven: number; // profit - profitTarget (positive = meeting target)
  roi: number;
  costPerAttendee: number;
}
