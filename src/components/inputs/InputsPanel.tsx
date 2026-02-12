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
  const { state, updateInputs } = useAppState();
  const [open, setOpen] = useState(false);

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
              Max {state.inputs.maxOccupancy} · Staff {state.inputs.staffCount} · Tickets $
              {state.inputs.ticketPrices.proposedPrice1}/$
              {state.inputs.ticketPrices.proposedPrice2}/$
              {state.inputs.ticketPrices.proposedPrice3} · Staff $
              {state.inputs.ticketPrices.staffPrice1}/$
              {state.inputs.ticketPrices.staffPrice2}/$
              {state.inputs.ticketPrices.staffPrice3}
              {(state.inputs.dayPassesSold ?? 0) > 0 &&
                ` · Day passes: ${state.inputs.dayPassesSold} @ $${state.inputs.dayPassPrice}`}
            </CardDescription>
          )}
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-6 border-t pt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <EditableNumberInput
                label="Max Occupancy"
                value={state.inputs.maxOccupancy}
                onChange={(v) => updateInputs({ maxOccupancy: v })}
                min={1}
              />
              <EditableNumberInput
                label="Staff Count"
                value={state.inputs.staffCount}
                onChange={(v) => updateInputs({ staffCount: v })}
                min={0}
              />
              <EditableNumberInput
                label="Profit Target ($)"
                value={state.inputs.profitTarget}
                onChange={(v) => updateInputs({ profitTarget: v })}
                min={0}
              />
              <EditableNumberInput
                label="Day Pass Price ($)"
                value={state.inputs.dayPassPrice}
                onChange={(v) => updateInputs({ dayPassPrice: v })}
                min={0}
              />
              <EditableNumberInput
                label="Estimated Day Passes Sold"
                value={state.inputs.dayPassesSold}
                onChange={(v) => updateInputs({ dayPassesSold: v })}
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
