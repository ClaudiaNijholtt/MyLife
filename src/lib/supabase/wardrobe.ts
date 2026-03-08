import { createClient } from "@/lib/supabase/client";
import type { ClothingItem } from "@/lib/types/wardrobe";

function getMissingColumnName(error: unknown): string | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error &&
    (error as { code?: string }).code === "PGRST204" &&
    typeof (error as { message?: string }).message === "string"
  ) {
    const message = (error as { message: string }).message;
    const match = message.match(/'([^']+)' column/);
    return match?.[1] ?? null;
  }

  return null;
}

export async function fetchClothingItems(): Promise<ClothingItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("clothing_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ClothingItem[];
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
}): Promise<ClothingItem> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("Not authenticated");

  const now = new Date().toISOString();

  const basePayload = {
    user_id: user.id,
    ...input,
    last_worn_at: null,
    created_at: now,
    updated_at: now,
  };

  let { data, error } = await supabase
    .from("clothing_items")
    .insert(basePayload)
    .select("*")
    .single();

  if (error) {
    const missingColumn = getMissingColumnName(error);
    if (missingColumn && missingColumn in basePayload) {
      const retryPayload = { ...basePayload } as Record<string, unknown>;
      delete retryPayload[missingColumn];
      const retryResult = await supabase
        .from("clothing_items")
        .insert(retryPayload)
        .select("*")
        .single();

      data = retryResult.data;
      error = retryResult.error;
    }
  }

  if (error) throw error;
  return data as ClothingItem;
}

export async function fetchClothingItem(id: string): Promise<ClothingItem> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("clothing_items")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as ClothingItem;
}

export async function deleteClothingItem(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("clothing_items")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function updateClothingItem(
  id: string,
  updates: Partial<ClothingItem>
): Promise<ClothingItem> {
  const supabase = createClient();
  const now = new Date().toISOString();

  const baseUpdates = {
    ...updates,
    updated_at: now,
  };

  let { data, error } = await supabase
    .from("clothing_items")
    .update(baseUpdates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    const missingColumn = getMissingColumnName(error);
    if (missingColumn && missingColumn in baseUpdates) {
      const retryUpdates = { ...baseUpdates } as Record<string, unknown>;
      delete retryUpdates[missingColumn];
      const retryResult = await supabase
        .from("clothing_items")
        .update(retryUpdates)
        .eq("id", id)
        .select("*")
        .single();

      data = retryResult.data;
      error = retryResult.error;
    }
  }

  if (error) throw error;
  return data as ClothingItem;
}
