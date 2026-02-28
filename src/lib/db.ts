import Dexie, { type Table } from "dexie";

export type ClothingCategory = "top" | "bottom" | "outerwear" | "shoes" | "jewelry" | "accessory" | "full-body" | "other";
export type ClothingSeason = "summer" | "winter" | "all";
export type ClothingStyle = "casual" | "classy" | "sporty" | "formal" | "bohemian" | "streetwear" | "minimalist" | "other";
export type LaundryState = "clean" | "wear again" | "needs wash" | "in laundry";

export type TopSubcategory = "t-shirt" | "sweater" | "blouse" | "shirt" | "top" | "tank-top" | "bodysuit" | "other";
export type BottomSubcategory = "shorts" | "pants" | "trousers" | "tights" | "skirt" | "jeans" | "other";
export type OuterwearSubcategory = "jacket" | "vest" | "cardigan" | "blazer" | "coat" | "other";
export type ShoesSubcategory = "sneakers" | "boots" | "sandals" | "heels" | "flats" | "slippers" | "other";
export type JewelrySubcategory = "earrings" | "necklace" | "bracelet" | "ring" | "watch" | "anklet" | "other";
export type AccessorySubcategory = "bag" | "belt" | "scarf" | "hat" | "sunglasses" | "headband" | "other";
export type FullBodySubcategory = "dress" | "jumpsuit" | "romper" | "overall" | "other";
export type ClothingSubcategory = TopSubcategory | BottomSubcategory | OuterwearSubcategory | ShoesSubcategory | JewelrySubcategory | AccessorySubcategory | FullBodySubcategory | "other";

export type ClothingItem = {
  id: string;
  name: string;
  photoDataUrl: string;
  category: ClothingCategory;
  subcategory?: ClothingSubcategory;
  colors: string[];
  season: ClothingSeason;
  style?: ClothingStyle;
  size?: string;
  occasions: string[];
  createdAt: string;
  updatedAt: string;
  lastWornAt?: string;
  laundryState: LaundryState;
  wearsSinceWash: number;
  washAfterWears: number;
};

export type WearLog = {
  id: string;
  itemId: string;
  wornAt: string;
};

class MyLifeDB extends Dexie {
    clothingItems!: Table<ClothingItem, string>;
    wearLogs!: Table<WearLog, string>;

  constructor() {
    super("myLifeDb");
    this.version(1).stores({
      clothingItems: "id, category, season, createdAt, updatedAt, lastWornAt",
    });
    this.version(2).stores({
      clothingItems: "id, category, subcategory, season, style, createdAt, updatedAt, lastWornAt",
    });
    this.version(3).stores({
      clothingItems: "id, category, subcategory, season, style, createdAt, updatedAt, lastWornAt, laundryState, wearsSinceWash, washAfterWears",
    });
    this.version(4).stores({
      clothingItems: "id, category, subcategory, season, style, createdAt, updatedAt, lastWornAt, laundryState, wearsSinceWash, washAfterWears",
      wearLogs: "id, itemId, wornAt",
    });
  }
}

export const db = new MyLifeDB();

export function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}