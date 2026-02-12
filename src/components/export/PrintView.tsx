import type { Inputs, LineItem, ScenarioMetrics } from "@/types/budget";

interface PrintViewProps {
  state: { inputs: Inputs; lineItems: LineItem[] };
  metrics: ScenarioMetrics[];
}

export function PrintView({ state, metrics }: PrintViewProps) {
  const totalCosts = state.lineItems.reduce(
    (sum, li) => sum + li.unitCost * li.quantity,
    0
  );

  return (
    <div className="bg-white text-black print:p-8">
      <h1 className="mb-6 text-2xl font-bold">Badger Budget Summary</h1>
      <p className="mb-6 text-sm text-gray-600">Generated for printing</p>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Inputs</h2>
        <table className="w-full text-sm">
          <tbody>
            <tr>
              <td className="border-b py-2 font-medium">Max Occupancy</td>
              <td className="border-b py-2">{state.inputs.maxOccupancy}</td>
            </tr>
            <tr>
              <td className="border-b py-2 font-medium">Staff Count</td>
              <td className="border-b py-2">{state.inputs.staffCount}</td>
            </tr>
            <tr>
              <td className="border-b py-2 font-medium">Ticket Prices</td>
              <td className="border-b py-2">
                ${state.inputs.ticketPrices.proposedPrice1} / $
                {state.inputs.ticketPrices.proposedPrice2} / $
                {state.inputs.ticketPrices.proposedPrice3} (Staff: $
                {state.inputs.ticketPrices.staffPrice1} / $
                {state.inputs.ticketPrices.staffPrice2} / $
                {state.inputs.ticketPrices.staffPrice3})
              </td>
            </tr>
            <tr>
              <td className="border-b py-2 font-medium">Day Pass</td>
              <td className="border-b py-2">
                ${state.inputs.dayPassPrice} × {state.inputs.dayPassesSold} = $
                {(state.inputs.dayPassPrice * state.inputs.dayPassesSold).toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Budget Line Items</h2>
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Category</th>
              <th className="border p-2 text-right">Unit Cost</th>
              <th className="border p-2 text-right">Qty</th>
              <th className="border p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {state.lineItems.map((li) => (
              <tr key={li.id}>
                <td className="border p-2">{li.name}</td>
                <td className="border p-2">{li.category}</td>
                <td className="border p-2 text-right">
                  ${li.unitCost.toFixed(2)}
                </td>
                <td className="border p-2 text-right">{li.quantity}</td>
                <td className="border p-2 text-right">
                  ${(li.unitCost * li.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 font-semibold">Total: ${totalCosts.toFixed(2)}</p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Scenario Summary</h2>
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Scenario</th>
              <th className="border p-2 text-right">Revenue</th>
              <th className="border p-2 text-right">Profit</th>
              <th className="border p-2 text-right">Cost/Person</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => (
              <tr key={m.scenarioKey}>
                <td className="border p-2">{m.scenarioKey}</td>
                <td className="border p-2 text-right">
                  ${m.revenue.toLocaleString()}
                </td>
                <td className="border p-2 text-right">
                  ${m.profit.toLocaleString()}
                </td>
                <td className="border p-2 text-right">
                  ${m.costPerAttendee.toFixed(0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
