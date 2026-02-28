import { db, uid } from "@/lib/db";

function computeLaundryState(wearsSinceWash: number, washAfterWears: number) {
  if (wearsSinceWash >= washAfterWears) return "needs wash" as const;
  if (wearsSinceWash === 0) return "clean" as const;
  return "wear again" as const;
}

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

    const nextWears = (item.wearsSinceWash ?? 0) + 1;
    const washAfter = item.washAfterWears ?? 2;

    const laundryState =
      item.laundryState === "in laundry"
        ? "in laundry"
        : computeLaundryState(nextWears, washAfter);

    await db.clothingItems.put({
      ...item,
      lastWornAt: wornAt,
      updatedAt: wornAt,
      wearsSinceWash: nextWears,
      washAfterWears: washAfter,
      laundryState,
    });
  });
}