import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAppState } from "@/state/AppState";
import { EditableNumberInput } from "./EditableNumberInput";
import { TicketPriceInputs } from "./TicketPriceInputs";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

export function InputsPanel() {
  const { getInputs, updateScenarioInputs, selectedScenarioId } = useAppState();
  const inputs = getInputs();
  const [open, setOpen] = useState(false);

  const handleUpdate = (updates: Partial<typeof inputs>) => {
    if (selectedScenarioId) {
      updateScenarioInputs(selectedScenarioId, updates);
    }
  };

  return (
    <Card>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardHeader className="cursor-pointer" onClick={() => setOpen(!open)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {open ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
              <CardTitle className="text-base">Scenario Inputs</CardTitle>
            </div>
            <CollapsibleTrigger asChild>
              <span className="text-muted-foreground text-sm">
                {open ? "Collapse" : "Expand"}
              </span>
            </CollapsibleTrigger>
          </div>
          {!open && (
            <CardDescription className="mt-1">
              Max {inputs.maxOccupancy} · Staff {inputs.staffCount} · Tickets $
              {inputs.ticketPrices.proposedPrice1}/$
              {inputs.ticketPrices.proposedPrice2}/$
              {inputs.ticketPrices.proposedPrice3} · Staff $
              {inputs.ticketPrices.staffPrice1}/$
              {inputs.ticketPrices.staffPrice2}/$
              {inputs.ticketPrices.staffPrice3}
              {(inputs.dayPassesSold ?? 0) > 0 &&
                ` · Day passes: ${inputs.dayPassesSold} @ $${inputs.dayPassPrice}`}
            </CardDescription>
          )}
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-6 border-t pt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <EditableNumberInput
                label="Max Occupancy"
                value={inputs.maxOccupancy}
                onChange={(v) => handleUpdate({ maxOccupancy: v })}
                min={1}
              />
              <EditableNumberInput
                label="Staff Count"
                value={inputs.staffCount}
                onChange={(v) => handleUpdate({ staffCount: v })}
                min={0}
              />
              <EditableNumberInput
                label="Profit Target ($)"
                value={inputs.profitTarget}
                onChange={(v) => handleUpdate({ profitTarget: v })}
                min={0}
              />
              <EditableNumberInput
                label="Day Pass Price ($)"
                value={inputs.dayPassPrice}
                onChange={(v) => handleUpdate({ dayPassPrice: v })}
                min={0}
              />
              <EditableNumberInput
                label="Estimated Day Passes Sold"
                value={inputs.dayPassesSold}
                onChange={(v) => handleUpdate({ dayPassesSold: v })}
                min={0}
              />
            </div>
            <TicketPriceInputs />
            <p className="text-muted-foreground text-sm">
              Attendance: 25%, 50%, 75%, 100% of max occupancy.
            </p>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
