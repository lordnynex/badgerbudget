export const FOOD_CATEGORIES = ["Food & Beverage", "Food", "Beverage"];
export const EVENT_DAYS = 4;

export function isFoodCategory(category: string): boolean {
  return FOOD_CATEGORIES.includes(category);
}
