import type { CloudClothingItem } from "./wardrobe";

export function findSimilarItems(
  allItems: CloudClothingItem[],
  currentItem: CloudClothingItem,
  limit: number = 6
): CloudClothingItem[] {
  const currentColors = (currentItem.colors ?? []).map((color) => color.toLowerCase());

  const strictMatches = allItems.filter(
    (it) =>
      it.id !== currentItem.id &&
      it.category === currentItem.category &&
      (it.subcategory ?? null) === (currentItem.subcategory ?? null) &&
      (it.colors ?? []).some((color) => currentColors.includes(color.toLowerCase()))
  );

  return strictMatches.slice(0, limit);
}
