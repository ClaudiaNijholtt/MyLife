import type { ClothingItem } from "@/lib/types/wardrobe";

export type CloudClothingItem = ClothingItem;

async function getProvider() {
  return import("@/lib/supabase/wardrobe");
}

export async function fetchClothingItems() {
  const provider = await getProvider();
  return provider.fetchClothingItems();
}

export async function createClothingItem(input: {
  name: string;
  photo_path: string;
  category: string;
  subcategory?: string;
  season: string;
  colors: string[];
  brand?: string;
  size?: string;
  laundry_state: string;
  wears_since_wash: number;
  wash_after_wears: number;
}) {
  const provider = await getProvider();
  return provider.createClothingItem(input);
}

export async function fetchClothingItem(id: string) {
  const provider = await getProvider();
  return provider.fetchClothingItem(id);
}

export async function deleteClothingItem(id: string) {
  const provider = await getProvider();
  return provider.deleteClothingItem(id);
}

export async function updateClothingItem(id: string, updates: Partial<CloudClothingItem>) {
  const provider = await getProvider();
  return provider.updateClothingItem(id, updates);
}