import { createClient } from "@/lib/supabase/client";
import type { ClothingItem } from "@/lib/types/wardrobe";

export type CloudClothingItem = ClothingItem;

export async function fetchClothingItems() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("clothing_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as CloudClothingItem[];
}

export async function createClothingItem(input: {
  name: string;
  photo_path: string;
  category: string;
  season: string;
  colors: string[];
  occasions: string[];
  brand?: string;
  laundry_state: string;
  wears_since_wash: number;
  wash_after_wears: number;
}) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("Not authenticated");

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("clothing_items")
    .insert({
      user_id: user.id,
      ...input,
      last_worn_at: null,
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as CloudClothingItem;
}

export async function fetchClothingItem(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("clothing_items")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as CloudClothingItem;
}

export async function deleteClothingItem(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("clothing_items")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function updateClothingItem(id: string, updates: Partial<CloudClothingItem>) {
  const supabase = createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("clothing_items")
    .update({
      ...updates,
      updated_at: now,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as CloudClothingItem;
}