import { useAppState } from "@/state/AppState";
import { EditableNumberInput } from "./EditableNumberInput";

export function TicketPriceInputs() {
  const { state, updateTicketPrices } = useAppState();
  const tp = state.inputs.ticketPrices;

  return (
    <div className="space-y-4">
      <div>
        <h5 className="mb-2 text-xs font-medium text-muted-foreground">Attendee ticket prices</h5>
        <div className="grid gap-4 sm:grid-cols-3">
          <EditableNumberInput
            label="Price 1 ($)"
            value={tp.proposedPrice1}
            onChange={(v) => updateTicketPrices({ proposedPrice1: v })}
            min={0}
          />
          <EditableNumberInput
            label="Price 2 ($)"
            value={tp.proposedPrice2}
            onChange={(v) => updateTicketPrices({ proposedPrice2: v })}
            min={0}
          />
          <EditableNumberInput
            label="Price 3 ($)"
            value={tp.proposedPrice3}
            onChange={(v) => updateTicketPrices({ proposedPrice3: v })}
            min={0}
          />
        </div>
      </div>
      <div>
        <h5 className="mb-2 text-xs font-medium text-muted-foreground">Staff ticket prices</h5>
        <div className="grid gap-4 sm:grid-cols-3">
          <EditableNumberInput
            label="Staff Price 1 ($)"
            value={tp.staffPrice1}
            onChange={(v) => updateTicketPrices({ staffPrice1: v })}
            min={0}
          />
          <EditableNumberInput
            label="Staff Price 2 ($)"
            value={tp.staffPrice2}
            onChange={(v) => updateTicketPrices({ staffPrice2: v })}
            min={0}
          />
          <EditableNumberInput
            label="Staff Price 3 ($)"
            value={tp.staffPrice3}
            onChange={(v) => updateTicketPrices({ staffPrice3: v })}
            min={0}
          />
        </div>
      </div>
    </div>
  );
}
