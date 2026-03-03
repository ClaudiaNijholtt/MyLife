// Clothing Categories
export type ClothingCategory = 
  | "top" 
  | "bottom" 
  | "outerwear" 
  | "shoes" 
  | "jewelry" 
  | "accessory" 
  | "full-body" 
  | "other";

export type ClothingSeason = "summer" | "winter" | "all";

export type ClothingStyle = 
  | "casual" 
  | "classy" 
  | "sporty" 
  | "formal" 
  | "bohemian" 
  | "streetwear" 
  | "minimalist" 
  | "other";

export type LaundryState = "clean" | "dirty" | "in-laundry";

// Subcategories
export type TopSubcategory = 
  | "t-shirt" 
  | "sweater" 
  | "blouse" 
  | "shirt" 
  | "top" 
  | "tank-top" 
  | "bodysuit" 
  | "other";

export type BottomSubcategory = 
  | "shorts" 
  | "pants" 
  | "trousers" 
  | "tights" 
  | "skirt" 
  | "jeans" 
  | "other";

export type OuterwearSubcategory = 
  | "jacket" 
  | "vest" 
  | "cardigan" 
  | "blazer" 
  | "coat" 
  | "other";

export type ShoesSubcategory = 
  | "sneakers" 
  | "boots" 
  | "sandals" 
  | "heels" 
  | "flats" 
  | "slippers" 
  | "other";

export type JewelrySubcategory = 
  | "earrings" 
  | "necklace" 
  | "bracelet" 
  | "ring" 
  | "watch" 
  | "anklet" 
  | "other";

export type AccessorySubcategory = 
  | "bag" 
  | "belt" 
  | "scarf" 
  | "hat" 
  | "sunglasses" 
  | "headband" 
  | "other";

export type FullBodySubcategory = 
  | "dress" 
  | "jumpsuit" 
  | "romper" 
  | "overall" 
  | "other";

export type ClothingSubcategory = 
  | TopSubcategory 
  | BottomSubcategory 
  | OuterwearSubcategory 
  | ShoesSubcategory 
  | JewelrySubcategory 
  | AccessorySubcategory 
  | FullBodySubcategory 
  | "other";

// Cloud/Database types (snake_case)
export type ClothingItem = {
  id: string;
  user_id: string;
  name: string;
  photo_path: string;
  category: string;
  season: string;
  colors: string[];
  occasions: string[];
  brand?: string | null;
  laundry_state: string;
  wears_since_wash: number;
  wash_after_wears: number;
  last_worn_at: string | null;
  created_at: string;
  updated_at: string;
};

// With signed URL for display
export type ClothingItemWithUrl = ClothingItem & { 
  photoUrl: string | null;
};
