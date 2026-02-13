export interface Event {
  id: string;
  name: string;
  description: string | null;
  year: number | null;
  event_date: string | null;
  event_url: string | null;
  event_location: string | null;
  event_location_embed: string | null;
  ga_ticket_cost: number | null;
  day_pass_cost: number | null;
  ga_tickets_sold: number | null;
  day_passes_sold: number | null;
  budget_id: string | null;
  scenario_id: string | null;
  planning_notes: string | null;
  created_at?: string;
  milestones?: EventPlanningMilestone[];
  packingItems?: EventPackingItem[];
  volunteers?: EventVolunteer[];
}

export interface EventPlanningMilestone {
  id: string;
  event_id: string;
  month: number;
  year: number;
  description: string;
  sort_order: number;
  completed: boolean;
  due_date: string;
}

export interface EventPackingItem {
  id: string;
  event_id: string;
  category: string;
  name: string;
  sort_order: number;
}

export interface EventVolunteer {
  id: string;
  event_id: string;
  name: string;
  department: string;
  sort_order: number;
}

export interface Inputs {
  profitTarget: number;
  staffCount: number;
  maxOccupancy: number;
  complimentaryTickets: number;
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
  /** Profit ÷ Revenue × 100 */
  profitMargin: number;
  /** Profit ÷ Attendees */
  profitPerAttendee: number;
  /** Revenue ÷ (Attendees + Staff) */
  avgRevenuePerTicket: number;
  /** Revenue ÷ Total costs */
  costCoverageRatio: number;
  /** Attendee revenue ÷ Total revenue × 100 */
  revenueMixAttendee: number;
  /** Staff revenue ÷ Total revenue × 100 */
  revenueMixStaff: number;
  /** Day pass revenue ÷ Total revenue × 100 */
  revenueMixDayPass: number;
  /** Profit ÷ Profit target × 100 (when meets target) */
  profitTargetCoverage: number | null;
  /** Attendance % needed to break even at this ticket/staff price */
  breakEvenAttendancePercent: number | null;
  /** Total attendees (paid + comp) needed to break even */
  breakEvenTotalAttendees: number | null;
}
