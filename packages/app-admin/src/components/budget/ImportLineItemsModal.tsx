import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApi } from "@/data/api";
import type { BudgetSummary, LineItem } from "@satyrsmc/shared/types/budget";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImportLineItemsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBudgetId: string;
  budgets: BudgetSummary[];
  onImport: (items: Omit<LineItem, "id">[]) => Promise<void>;
}

export function ImportLineItemsModal({
  open,
  onOpenChange,
  currentBudgetId,
  budgets,
  onImport,
}: ImportLineItemsModalProps) {
  const api = useApi();
  const [sourceBudgetId, setSourceBudgetId] = useState<string>("");
  const [sourceLineItems, setSourceLineItems] = useState<LineItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  const otherBudgets = budgets.filter((b) => b.id !== currentBudgetId);

  useEffect(() => {
    if (!open) {
      setSourceBudgetId("");
      setSourceLineItems([]);
      setSelectedIds(new Set());
    }
  }, [open]);

  useEffect(() => {
    if (!sourceBudgetId) {
      setSourceLineItems([]);
      setSelectedIds(new Set());
      return;
    }
    let cancelled = false;
    setLoading(true);
    api.budgets
      .get(sourceBudgetId)
      .then((budget) => {
        if (!cancelled && budget) {
          setSourceLineItems(budget.lineItems);
          setSelectedIds(new Set());
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sourceBudgetId]);

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === sourceLineItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sourceLineItems.map((li) => li.id)));
    }
  };

  const handleImport = async () => {
    const toImport = sourceLineItems
      .filter((li) => selectedIds.has(li.id))
      .map(({ id, ...rest }) => rest);
    if (toImport.length === 0) return;
    setImporting(true);
    try {
      await onImport(toImport);
      onOpenChange(false);
    } finally {
      setImporting(false);
    }
  };

  const selectedCount = selectedIds.size;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Line Items from Another Budget</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 flex-1 min-h-0 flex flex-col">
          <div className="space-y-2">
            <Label>Source Budget</Label>
            <Select
              value={sourceBudgetId}
              onValueChange={setSourceBudgetId}
              disabled={otherBudgets.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a budget to import from..." />
              </SelectTrigger>
              <SelectContent>
                {otherBudgets.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name} ({b.year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {otherBudgets.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No other budgets available to import from.
              </p>
            )}
          </div>

          {sourceBudgetId && (
            <div className="flex-1 min-h-0 flex flex-col border rounded-md">
              <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                <Label className="text-base font-medium">Line Items</Label>
                {sourceLineItems.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleAll}
                    className="text-sm"
                  >
                    {selectedIds.size === sourceLineItems.length
                      ? "Deselect all"
                      : "Select all"}
                  </Button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-2 max-h-[280px]">
                {loading ? (
                  <p className="py-8 text-center text-muted-foreground">
                    Loading line items...
                  </p>
                ) : sourceLineItems.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    This budget has no line items.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {sourceLineItems.map((item) => {
                      const isSelected = selectedIds.has(item.id);
                      const total = item.unitCost * item.quantity;
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleItem(item.id)}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer transition-colors hover:bg-muted/50",
                            isSelected && "bg-primary/10"
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                              isSelected
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-input"
                            )}
                          >
                            {isSelected && <Check className="size-3.5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-muted-foreground ml-2">
                              ({item.category})
                            </span>
                          </div>
                          <span className="text-sm tabular-nums shrink-0">
                            ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={selectedCount === 0 || importing}
          >
            {importing ? "Importing..." : `Import ${selectedCount} item${selectedCount !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
