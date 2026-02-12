import { useMemo } from "react";
import type { Inputs, LineItem, ScenarioMetrics } from "@/types/budget";

const ATTENDANCE_MULTIPLIERS = [0.25, 0.5, 0.75, 1] as const;

export function useScenarioMetrics(
  inputs: Inputs,
  lineItems: LineItem[]
): ScenarioMetrics[] {
  return useMemo(() => {
    const totalCosts = lineItems.reduce(
      (sum, li) => sum + li.unitCost * li.quantity,
      0
    );
    const totalCostsWithProfitTarget = totalCosts + inputs.profitTarget;

    const attendeePrices = [
      inputs.ticketPrices.proposedPrice1,
      inputs.ticketPrices.proposedPrice2,
      inputs.ticketPrices.proposedPrice3,
    ];
    const staffPrices = [
      inputs.ticketPrices.staffPrice1,
      inputs.ticketPrices.staffPrice2,
      inputs.ticketPrices.staffPrice3,
    ];
    const staffCount = inputs.staffCount;
    const maxOccupancy = inputs.maxOccupancy;

    const results: ScenarioMetrics[] = [];

    for (const mult of ATTENDANCE_MULTIPLIERS) {
      const attendees = Math.round(maxOccupancy * mult);
      for (const ticketPrice of attendeePrices) {
        for (const staffPrice of staffPrices) {
          const revenue = attendees * ticketPrice + staffCount * staffPrice;
          const profit = revenue - totalCosts;
          const profitVsBreakEven = revenue - totalCostsWithProfitTarget;
          const totalPeople = attendees + staffCount;
          const roi = totalCosts > 0 ? profit / totalCosts : 0;
          const costPerAttendee =
            totalPeople > 0 ? totalCosts / totalPeople : 0;

          const percentLabel = `${Math.round(mult * 100)}%`;
          const scenarioKey = `$${ticketPrice} / Staff $${staffPrice} / ${percentLabel}`;

          results.push({
            scenarioKey,
            ticketPrice,
            staffPrice,
            attendancePercent: mult * 100,
            attendees,
            revenue,
            totalCosts,
            totalCostsWithProfitTarget,
            profit,
            profitVsBreakEven,
            roi,
            costPerAttendee,
          });
        }
      }
    }

    return results;
  }, [inputs, lineItems]);
}
