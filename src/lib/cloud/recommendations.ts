import type { CloudClothingItem } from "./wardrobe";

export function findSimilarItems(
  allItems: CloudClothingItem[],
  currentItem: CloudClothingItem,
  limit: number = 6
): CloudClothingItem[] {
  // Filter: only same category (most important for similarity)
  const sameCategory = allItems.filter(
    (it) => it.id !== currentItem.id && it.category === currentItem.category
  );

  // Score each item based on similarity
  const scored = sameCategory.map((item) => {
    let score = 0;

    // Same season = +2 points
    if (item.season === currentItem.season) {
      score += 2;
    }
    
    // All-season match with specific season = +1 point
    if (item.season === "all" || currentItem.season === "all") {
      score += 1;
    }

    // Shared colors = +1 point per color
    const sharedColors = item.colors.filter((c) =>
      currentItem.colors.some((cc) => cc.toLowerCase() === c.toLowerCase())
    );
    score += sharedColors.length;

    return { item, score };
  });

  // Sort by score (highest first) and return top N
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.item);
}
