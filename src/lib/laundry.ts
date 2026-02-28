import { db } from "@/lib/db";

export async function sendToLaundry(itemId: string) {
  const now = new Date().toISOString();
  const item = await db.clothingItems.get(itemId);
  if (!item) return;

  await db.clothingItems.put({
    ...item,
    laundryState: "in laundry",
    updatedAt: now,
  });
}

export async function markAsClean(itemId: string) {
  const now = new Date().toISOString();
  const item = await db.clothingItems.get(itemId);
  if (!item) return;

  await db.clothingItems.put({
    ...item,
    laundryState: "clean",
    wearsSinceWash: 0,
    updatedAt: now,
  });
}