import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAppState } from "@/state/AppState";
import { LineItemRow } from "./LineItemRow";

export function LineItemsTable() {
  const { state, addLineItem, updateLineItem, deleteLineItem, addCategory } =
    useAppState();
  const { lineItems, categories } = state;

  const total = lineItems.reduce(
    (sum, li) => sum + li.unitCost * li.quantity,
    0
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Budget Line Items</CardTitle>
          <CardDescription>
            Add, edit, or remove expense items. Use unit cost and quantity for variable costs.
          </CardDescription>
        </div>
        <Button onClick={() => addLineItem()} size="sm">
          <Plus className="size-4" />
          Add Item
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left font-medium">Name</th>
                <th className="p-2 text-left font-medium">Category</th>
                <th className="p-2 text-left font-medium">Unit Cost</th>
                <th className="p-2 text-left font-medium">Qty</th>
                <th className="p-2 text-right font-medium">Total</th>
                <th className="p-2 text-left font-medium">Historical</th>
                <th className="p-2 text-left font-medium">Comments</th>
                <th className="p-2 w-12" />
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => (
                <LineItemRow
                  key={item.id}
                  item={item}
                  categories={categories}
                  onUpdate={updateLineItem}
                  onDelete={deleteLineItem}
                  onAddCategory={addCategory}
                />
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end border-t pt-4">
          <span className="text-lg font-semibold">
            Total: ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
