import { type ClothingItem } from "@/lib/db";

export type OutfitIdea = {
  items: ClothingItem[];
};

function wearable(items: ClothingItem[]) {
  return items.filter((it) => (it.laundryState ?? "clean") !== "in_laundry");
}

function colorOverlap(colors1: string[], colors2: string[]): number {
  const set1 = new Set(colors1.map(c => c.toLowerCase()));
  const set2 = new Set(colors2.map(c => c.toLowerCase()));
  
  let overlap = 0;
  for (const color of set1) {
    if (set2.has(color)) overlap++;
  }
  
  return overlap;
}

function hasNeutralColor(colors: string[]): boolean {
  const neutrals = ['black', 'white', 'grey', 'gray', 'beige', 'brown', 'navy', 'cream', 'tan', 'khaki', 'mint', 'olive'];
  return colors.some(c => neutrals.includes(c.toLowerCase()));
}

function styleCompatibility(style1?: string, style2?: string): number {
  if (!style1 || !style2) return 0.5; // Neutral if style not set
  if (style1 === style2) return 3; // Perfect match
  
  // Define style compatibility groups
  const compatibilityMap: Record<string, string[]> = {
    'casual': ['streetwear', 'minimalist', 'bohemian', 'casual'],
    'classy': ['classy'],
    'sporty': ['casual', 'streetwear', 'minimalist', 'sporty'],
    'formal': ['classy', 'minimalist', 'formal'],
    'bohemian': ['casual', 'minimalist', 'bohemian'],
    'streetwear': ['casual', 'sporty', 'minimalist', 'streetwear'],
    'minimalist': ['casual', 'classy', 'sporty', 'formal', 'bohemian', 'streetwear', 'minimalist'],
  };
  
  const compatible = compatibilityMap[style1.toLowerCase()] || [];
  if (compatible.includes(style2.toLowerCase())) {
    return 1.5; // Good compatibility
  }
  
  return -5; // Strong penalty for incompatible styles
}

function pickWithColorAndStyleMatch(
  items: ClothingItem[], 
  anchorColors: string[], 
  anchorStyle?: string
): ClothingItem | undefined {
  if (items.length === 0) return undefined;
  
  // First try to find items with compatible or matching styles
  let candidates = items;
  if (anchorStyle) {
    const compatible = items.filter(item => {
      const compat = styleCompatibility(anchorStyle, item.style);
      return compat > 0; // Only items with positive compatibility
    });
    
    // If we have compatible items, use only those
    if (compatible.length > 0) {
      candidates = compatible;
    }
  }
  
  // Score each item based on color and style compatibility
  const scored = candidates.map(item => {
    let score = Math.random() * 0.5; // Base randomness (reduced)
    
    // Major boost for style compatibility
    const styleScore = styleCompatibility(anchorStyle, item.style);
    score += styleScore * 2;
    
    // Boost if shares colors
    const overlap = colorOverlap(item.colors, anchorColors);
    score += overlap * 1.5;
    
    // Boost if has neutral colors
    if (hasNeutralColor(item.colors)) {
      score += 0.8;
    }
    
    return { item, score };
  });
  
  // Sort by score and pick from top 3
  scored.sort((a, b) => b.score - a.score);
  const topCandidates = scored.slice(0, Math.min(3, scored.length));
  const chosen = topCandidates[Math.floor(Math.random() * topCandidates.length)];
  
  return chosen?.item;
}

function pick(items: ClothingItem[]) {
  if (items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

function pickMultiple(items: ClothingItem[], count: number): ClothingItem[] {
  if (items.length === 0) return [];
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, items.length));
}

function pickMultipleWithColorAndStyleMatch(
  items: ClothingItem[], 
  anchorColors: string[], 
  anchorStyle: string | undefined,
  count: number
): ClothingItem[] {
  if (items.length === 0) return [];
  
  // First try to find items with compatible or matching styles
  let candidates = items;
  if (anchorStyle) {
    const compatible = items.filter(item => {
      const compat = styleCompatibility(anchorStyle, item.style);
      return compat > 0; // Only items with positive compatibility
    });
    
    // If we have compatible items, use only those
    if (compatible.length > 0) {
      candidates = compatible;
    }
  }
  
  // Score each item
  const scored = candidates.map(item => {
    let score = Math.random() * 0.5;
    
    // Style compatibility
    const styleScore = styleCompatibility(anchorStyle, item.style);
    score += styleScore * 2;
    
    // Color overlap
    const overlap = colorOverlap(item.colors, anchorColors);
    score += overlap * 1.5;
    
    // Neutral colors
    if (hasNeutralColor(item.colors)) {
      score += 0.8;
    }
    
    return { item, score };
  });
  
  // Sort and take top items
  scored.sort((a, b) => b.score - a.score);
  const topItems = scored.slice(0, Math.min(count * 2, scored.length));
  const shuffled = topItems.sort(() => Math.random() - 0.5);
  
  return shuffled.slice(0, Math.min(count, shuffled.length)).map(x => x.item);
}

export function suggestOutfitsWithItem(
  allItems: ClothingItem[],
  anchor: ClothingItem,
  limit = 4
): OutfitIdea[] {
  const all = wearable(allItems);

  const byCat = {
    top: all.filter((x) => x.category === "top"),
    bottom: all.filter((x) => x.category === "bottom"),
    outerwear: all.filter((x) => x.category === "outerwear"),
    shoes: all.filter((x) => x.category === "shoes"),
    jewelry: all.filter((x) => x.category === "jewelry"),
    accessory: all.filter((x) => x.category === "accessory"),
  };

  const ideas: OutfitIdea[] = [];

  for (let i = 0; i < limit * 3 && ideas.length < limit; i++) {
    const items: ClothingItem[] = [anchor];
    
    // Collect all colors and styles from items we've added so far
    const getOutfitColors = () => {
      const allColors: string[] = [];
      items.forEach(item => allColors.push(...item.colors));
      return allColors;
    };
    
    const getOutfitStyle = () => {
      // Get the dominant style from items already in the outfit
      const styles = items.map(item => item.style).filter(Boolean);
      if (styles.length === 0) return undefined;
      // Use anchor's style as primary
      return anchor.style || styles[0];
    };

    // Ensure we get a top+bottom combo depending on what anchor is
    if (anchor.category === "top") {
      const bottom = pickWithColorAndStyleMatch(byCat.bottom, getOutfitColors(), getOutfitStyle());
      if (!bottom) continue;
      items.push(bottom);
    } else if (anchor.category === "bottom") {
      const top = pickWithColorAndStyleMatch(byCat.top, getOutfitColors(), getOutfitStyle());
      if (!top) continue;
      items.push(top);
    } else if (anchor.category === "full-body") {
      // Full-body items (dresses, jumpsuits) don't need top/bottom
      // They already cover both
    } else {
      // If anchor is outerwear/shoes/accessory/jewelry/other: pick a basic top+bottom
      const top = pickWithColorAndStyleMatch(byCat.top, getOutfitColors(), getOutfitStyle());
      const bottom = pickWithColorAndStyleMatch(byCat.bottom, getOutfitColors(), getOutfitStyle());
      if (!top || !bottom) continue;
      items.push(top, bottom);
    }

    // Optional: outerwear & shoes
    if (anchor.category !== "outerwear") {
      const ow = pickWithColorAndStyleMatch(byCat.outerwear, getOutfitColors(), getOutfitStyle());
      if (ow) items.push(ow);
    }
    if (anchor.category !== "shoes") {
      const sh = pickWithColorAndStyleMatch(byCat.shoes, getOutfitColors(), getOutfitStyle());
      if (sh) items.push(sh);
    }

    // Multiple jewelry items (1-3 pieces)
    if (anchor.category !== "jewelry") {
      const jewelryCount = Math.floor(Math.random() * 3) + 1; // 1-3 items
      const availableJewelry = byCat.jewelry;
      const selectedJewelry = pickMultipleWithColorAndStyleMatch(availableJewelry, getOutfitColors(), getOutfitStyle(), jewelryCount);
      items.push(...selectedJewelry);
    } else {
      // If anchor is jewelry, add 0-2 more jewelry items
      const extraJewelryCount = Math.floor(Math.random() * 3); // 0-2 items
      const availableJewelry = byCat.jewelry.filter(j => j.id !== anchor.id);
      const selectedJewelry = pickMultipleWithColorAndStyleMatch(availableJewelry, getOutfitColors(), getOutfitStyle(), extraJewelryCount);
      items.push(...selectedJewelry);
    }
    
    // Optional: accessory (keep single)
    if (anchor.category !== "accessory") {
      const acc = pickWithColorAndStyleMatch(byCat.accessory, getOutfitColors(), getOutfitStyle());
      if (acc) items.push(acc);
    }

    // de-dup
    const unique = Array.from(new Map(items.map((x) => [x.id, x])).values());

    // avoid identical ideas
    const sig = unique.map((x) => x.id).sort().join("|");
    const already = ideas.some((idea) => idea.items.map((x) => x.id).sort().join("|") === sig);
    if (already) continue;

    ideas.push({ items: unique });
  }

  return ideas.slice(0, limit);
}