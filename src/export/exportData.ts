import type { Inputs, LineItem, ScenarioMetrics } from "@/types/budget";

const FOOD_CATEGORY = "Food & Beverage";
const EVENT_DAYS = 4;

export interface ExportSummary {
  totalCosts: number;
  totalWithProfitTarget: number;
  attendanceBreakdown: { percent: number; tickets: number }[];
  lowestBreakEven: number | null;
  lowestMeetingTarget: number | null;
  dayPassRevenue: number;
  profitableCount: number;
  meetingTargetCount: number;
}

export interface ExportFoodCost {
  totalFoodCost: number;
  costPerMeal: number;
  foodCostPerAttendee: number;
  foodCostPerDayPass: number;
  foodCostPerDay: number;
  foodCostPerStaff: number;
  totalMeals: number;
}

export interface ExportScenarioMatrix {
  byAttendance: Record<number, ScenarioMetrics[]>;
  attendanceLevels: number[];
}

export function computeExportSummary(
  inputs: Inputs,
  lineItems: LineItem[],
  metrics: ScenarioMetrics[]
): ExportSummary {
  const totalCosts = lineItems.reduce(
    (sum, li) => sum + li.unitCost * li.quantity,
    0
  );
  const totalWithProfitTarget = totalCosts + inputs.profitTarget;
  const maxOccupancy = inputs.maxOccupancy;
  const attendanceBreakdown = [
    { percent: 25, tickets: Math.round(maxOccupancy * 0.25) },
    { percent: 50, tickets: Math.round(maxOccupancy * 0.5) },
    { percent: 75, tickets: Math.round(maxOccupancy * 0.75) },
    { percent: 100, tickets: maxOccupancy },
  ];
  const profitableScenarios = metrics.filter((m) => m.profit >= 0);
  const meetingTargetScenarios = metrics.filter(
    (m) => m.profitVsBreakEven >= 0
  );
  const lowestBreakEven =
    profitableScenarios.length > 0
      ? Math.min(...profitableScenarios.map((m) => m.ticketPrice))
      : null;
  const lowestMeetingTarget =
    meetingTargetScenarios.length > 0
      ? Math.min(...meetingTargetScenarios.map((m) => m.ticketPrice))
      : null;
  const dayPassRevenue =
    (inputs.dayPassPrice ?? 0) * (inputs.dayPassesSold ?? 0);

  return {
    totalCosts,
    totalWithProfitTarget,
    attendanceBreakdown,
    lowestBreakEven,
    lowestMeetingTarget,
    dayPassRevenue,
    profitableCount: profitableScenarios.length,
    meetingTargetCount: meetingTargetScenarios.length,
  };
}

export function computeExportFoodCost(
  inputs: Inputs,
  lineItems: LineItem[]
): ExportFoodCost | null {
  const totalFoodCost = lineItems
    .filter((li) => li.category === FOOD_CATEGORY)
    .reduce((sum, li) => sum + li.unitCost * li.quantity, 0);

  if (totalFoodCost === 0) return null;

  const maxOccupancy = inputs.maxOccupancy;
  const staffCount = inputs.staffCount;
  const dayPassesSold = inputs.dayPassesSold ?? 0;
  const attendeeMeals = maxOccupancy * EVENT_DAYS;
  const staffMeals = staffCount * EVENT_DAYS;
  const dayPassMeals = dayPassesSold * 1;
  const totalMeals = attendeeMeals + staffMeals + dayPassMeals;
  const costPerMeal = totalMeals > 0 ? totalFoodCost / totalMeals : 0;

  return {
    totalFoodCost,
    costPerMeal,
    foodCostPerAttendee: costPerMeal * EVENT_DAYS,
    foodCostPerDayPass: costPerMeal,
    foodCostPerDay: totalFoodCost / EVENT_DAYS,
    foodCostPerStaff: costPerMeal * EVENT_DAYS,
    totalMeals,
  };
}

export function computeExportScenarioMatrix(
  metrics: ScenarioMetrics[]
): ExportScenarioMatrix {
  const byAttendance = metrics.reduce(
    (acc, m) => {
      const key = m.attendancePercent;
      if (!acc[key]) acc[key] = [];
      acc[key].push(m);
      return acc;
    },
    {} as Record<number, ScenarioMetrics[]>
  );
  const attendanceLevels = Object.keys(byAttendance)
    .map(Number)
    .sort((a, b) => a - b);
  return { byAttendance, attendanceLevels };
}

export function getCategoryTotals(
  lineItems: LineItem[]
): Record<string, number> {
  return lineItems.reduce(
    (acc, li) => {
      const total = li.unitCost * li.quantity;
      acc[li.category] = (acc[li.category] ?? 0) + total;
      return acc;
    },
    {} as Record<string, number>
  );
}
