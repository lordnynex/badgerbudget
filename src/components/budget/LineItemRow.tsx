import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import type { LineItem } from "@/types/budget";

interface LineItemRowProps {
  item: LineItem;
  categories: string[];
  onUpdate: (id: string, updates: Partial<LineItem>) => void;
  onDelete: (id: string) => void;
  onAddCategory: (name: string) => void;
}

export function LineItemRow({
  item,
  categories,
  onUpdate,
  onDelete,
  onAddCategory,
}: LineItemRowProps) {
  const total = item.unitCost * item.quantity;

  return (
    <tr className="border-b border-border transition-colors hover:bg-muted/30">
      <td className="p-2">
        <Input
          value={item.name}
          onChange={(e) => onUpdate(item.id, { name: e.target.value })}
          placeholder="Item name"
          className="h-8 text-sm"
        />
      </td>
      <td className="p-2 w-24">
        <Input
          type="number"
          value={item.unitCost}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!Number.isNaN(v)) onUpdate(item.id, { unitCost: v });
          }}
          min={0}
          step={0.01}
          className="h-8 text-sm"
        />
      </td>
      <td className="p-2 w-20">
        <Input
          type="number"
          value={item.quantity}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!Number.isNaN(v) && v >= 0) onUpdate(item.id, { quantity: v });
          }}
          min={0}
          step={1}
          className="h-8 text-sm"
        />
      </td>
      <td className="p-2 text-right font-medium tabular-nums">
        ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </td>
      <td className="p-2 min-w-[120px]">
        <Select
          value={categories.includes(item.category) ? item.category : categories[0]}
          onValueChange={(v) => {
            if (v === "__add__") {
              const name = window.prompt("New category name:");
              if (name?.trim()) {
                onAddCategory(name.trim());
                onUpdate(item.id, { category: name.trim() });
              }
            } else {
              onUpdate(item.id, { category: v });
            }
          }}
        >
          <SelectTrigger className="h-8 text-sm" size="sm">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
            <SelectItem value="__add__">+ Add category</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="p-2 max-w-[160px]">
        <Input
          value={item.comments ?? ""}
          onChange={(e) => onUpdate(item.id, { comments: e.target.value })}
          placeholder="Comments"
          className="h-8 text-sm"
        />
      </td>
      <td className="p-2 w-12">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(item.id)}
          aria-label="Delete"
        >
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </td>
    </tr>
  );
}
