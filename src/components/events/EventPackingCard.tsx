import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, Package, Plus, Trash2 } from "lucide-react";
import { LOAD_OUT_PACKING_CATEGORIES } from "./eventUtils";
import type { Event, EventPackingItem } from "@/types/budget";

interface EventPackingCardProps {
  event: Event;
  packingByCategory: Record<string, EventPackingItem[]>;
  packingCategories: string[];
  onUpdateCategory: (pid: string, category: string) => Promise<void>;
  onDelete: (pid: string) => Promise<void>;
  onAdd: (payload: { category: string; name: string }) => Promise<void>;
}

export function EventPackingCard({
  event,
  packingByCategory,
  packingCategories,
  onUpdateCategory,
  onDelete,
  onAdd,
}: EventPackingCardProps) {
  const [open, setOpen] = useState(false);
  const [packingCategory, setPackingCategory] = useState(LOAD_OUT_PACKING_CATEGORIES[0]);
  const [packingName, setPackingName] = useState("");

  const handleAdd = async () => {
    if (!packingName.trim()) return;
    await onAdd({ category: packingCategory, name: packingName.trim() });
    setPackingName("");
    setOpen(false);
  };

  const hasItems = Object.keys(packingByCategory).length > 0;

  return (
    <>
      <Card id="packing" className="scroll-mt-28">
        <Collapsible defaultOpen className="group/collapsible">
          <CardHeader>
            <CollapsibleTrigger className="flex w-full items-center justify-between text-left hover:bg-muted/50 -m-4 p-4 rounded-lg transition-colors">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="size-4" />
                  Load Out Packing List
                </CardTitle>
                <CardDescription>Items to pack, grouped by category</CardDescription>
              </div>
              <ChevronDown className="size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {!hasItems ? (
                <p className="text-muted-foreground text-sm">No packing items yet.</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(packingByCategory).map(([cat, items]) => (
                    <div key={cat}>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">{cat}</h4>
                      <ul className="space-y-1">
                        {items.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-center justify-between gap-2 rounded border px-3 py-2"
                          >
                            <span className="flex-1 min-w-0 truncate">{item.name}</span>
                            <Select
                              value={packingCategories.includes(item.category) ? item.category : "Miscellaneous"}
                              onValueChange={(v) => onUpdateCategory(item.id, v)}
                            >
                              <SelectTrigger className="h-8 w-[140px] text-xs shrink-0">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {packingCategories.map((c) => (
                                  <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive shrink-0"
                              onClick={() => onDelete(item.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                <Plus className="size-4" />
                Add Item
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Packing Item</DialogTitle>
            <CardDescription>Add an item to the load out list</CardDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={packingCategory} onValueChange={setPackingCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOAD_OUT_PACKING_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Item Name</Label>
              <Input value={packingName} onChange={(e) => setPackingName(e.target.value)} placeholder="e.g. Extension cords" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
