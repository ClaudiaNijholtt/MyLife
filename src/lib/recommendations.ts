import { type ClothingItem } from "@/lib/db";

function setOverlapScore(a: string[], b: string[]) {
  const A = new Set(a.map((x) => x.toLowerCase()));
  const B = new Set(b.map((x) => x.toLowerCase()));
  let inter = 0;
  for (const v of A) if (B.has(v)) inter++;
  const union = new Set([...A, ...B]).size;
  if (union === 0) return 0;
  return inter / union; // Jaccard-ish overlap
}

export function similarityScore(base: ClothingItem, other: ClothingItem) {
  if (base.id === other.id) return -1;

  let score = 0;

  // Same category is a strong signal
  if (base.category === other.category) score += 2;

  // Same subcategory is also important
  if (base.subcategory && other.subcategory && base.subcategory === other.subcategory) {
    score += 1.5;
  }

  // Season match
  if (base.season === other.season) score += 0.6;
  if (base.season === "all" || other.season === "all") score += 0.3;

  // Colors overlap (important for similarity)
  score += setOverlapScore(base.colors ?? [], other.colors ?? []) * 2;

  // Occasions overlap
  score += setOverlapScore(base.occasions ?? [], other.occasions ?? []) * 1.2;

  // Slight penalty if item is in laundry
  if ((other.laundryState ?? "clean") === "in laundry") score -= 0.5;

  return score;
}

export function getSimilarItems(all: ClothingItem[], base: ClothingItem, limit = 6) {
  // For similar items, only show items from the same category
  const sameCategory = all.filter((it) => it.category === base.category && it.id !== base.id);
  
  return sameCategory
    .map((it) => ({ it, s: similarityScore(base, it) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.it);
}