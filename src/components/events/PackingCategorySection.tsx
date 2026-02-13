import { PackingItemRow } from "./PackingItemRow";
import type { EventPackingCategory, EventPackingItem } from "@/types/budget";

interface PackingCategorySectionProps {
  category: EventPackingCategory;
  items: EventPackingItem[];
  onToggleLoaded: (itemId: string, loaded: boolean) => void;
  onEditItem: (item: EventPackingItem) => void;
  onDeleteItem: (itemId: string) => void;
}

export function PackingCategorySection({
  category,
  items,
  onToggleLoaded,
  onEditItem,
  onDeleteItem,
}: PackingCategorySectionProps) {
  return (
    <div>
      <h4 className="mb-2 font-medium text-sm text-muted-foreground">{category.name}</h4>
      <ul className="space-y-1">
        {items.map((item) => (
          <PackingItemRow
            key={item.id}
            item={item}
            onToggleLoaded={(loaded) => onToggleLoaded(item.id, loaded)}
            onEdit={() => onEditItem(item)}
            onDelete={() => onDeleteItem(item.id)}
          />
        ))}
      </ul>
    </div>
  );
}
