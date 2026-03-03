import { createClient } from "@/lib/supabase/client";

export type CloudClothingItem = {
  id: string;
  user_id: string;
  name: string;
  photo_data_url: string;
  category: string;
  season: string;
  colors: string[];
  occasions: string[];
  laundry_state: string;
  wears_since_wash: number;
  wash_after_wears: number;
  last_worn_at: string | null;
  created_at: string;
  updated_at: string;
};

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
  photo_data_url: string;
  category: string;
  season: string;
  colors: string[];
  occasions: string[];
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