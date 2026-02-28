import { db, uid } from "@/lib/db";

export async function markItemWornToday(itemId: string) {
  const now = new Date();
  const wornAt = now.toISOString();

  await db.transaction("rw", db.wearLogs, db.clothingItems, async () => {
    await db.wearLogs.add({
      id: uid(),
      itemId,
      wornAt,
    });

    const item = await db.clothingItems.get(itemId);
    if (!item) return;

    await db.clothingItems.put({
      ...item,
      lastWornAt: wornAt,
      updatedAt: wornAt,
    });
  });
}