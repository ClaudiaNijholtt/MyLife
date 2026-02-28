"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, type ClothingItem } from "@/lib/db";
import { markItemWornToday } from "@/lib/wear";
import { sendToLaundry, markAsClean } from "@/lib/laundry";

export default function WardrobeItemDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [item, setItem] = useState<ClothingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [wornTodayClicked, setWornTodayClicked] = useState(false);

  useEffect(() => {
    (async () => {
      const found = await db.clothingItems.get(id);
      setItem(found ?? null);
      setLoading(false);
    })();
  }, [id]);

  async function onDelete() {
    if (!confirm("Delete this item?")) return;
    await db.clothingItems.delete(id);
    router.push("/wardrobe");
  }

  async function onWornToday() {
    await markItemWornToday(id);
    const found = await db.clothingItems.get(id);
    setItem(found ?? null);
    setWornTodayClicked(true);
    setTimeout(() => setWornTodayClicked(false), 2000);
  }

  async function onSendToLaundry() {
  await sendToLaundry(id);
  const found = await db.clothingItems.get(id);
  setItem(found ?? null);
}

async function onMarkClean() {
  await markAsClean(id);
  const found = await db.clothingItems.get(id);
  setItem(found ?? null);
}

  const isWornToday = item?.lastWornAt 
    ? new Date(item.lastWornAt).toDateString() === new Date().toDateString()
    : false;

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100">
        <div className="mx-auto max-w-2xl p-6">
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="min-h-screen bg-gray-100">
        <div className="mx-auto max-w-2xl p-6">
          <p className="font-medium mb-4">Item not found</p>
          <button
            onClick={() => router.push("/wardrobe")}
            className="bg-black text-white px-4 py-2 rounded-full"
          >
            Back to wardrobe
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.push("/wardrobe")} className="text-sm font-medium underline text-black">
            Back
          </button>

          <div className="flex flex-wrap gap-2">
            <button
                onClick={onWornToday}
                className={`px-4 py-2 rounded-full shadow-sm transition-all ${
                  wornTodayClicked 
                    ? "bg-green-500 text-white border-green-500" 
                    : isWornToday
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "bg-white border border-gray-200 text-black hover:bg-gray-50"
                }`}
            >
                {wornTodayClicked ? "✓ Marked!" : isWornToday ? "Worn today ✓" : "Worn today"}
            </button>

              <button
                    onClick={onSendToLaundry}
                    className="bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm text-black hover:bg-gray-50 transition-all"
                >
                    Send to laundry
                </button>

                <button
                    onClick={onMarkClean}
                    className="bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm text-black hover:bg-gray-50 transition-all"
                >
                    Mark as clean
                </button>

            <button
                onClick={() => router.push(`/wardrobe/${id}/edit`)}
                className="bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm text-black hover:bg-gray-50 transition-all"
            >
                Edit
            </button>

            <button
                onClick={onDelete}
                className="bg-black text-white px-4 py-2 rounded-full shadow hover:bg-gray-800 transition-all"
            >
                Delete
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-200 mb-4">
            <img src={item.photoDataUrl} alt={item.name} className="w-full h-full object-cover" />
          </div>

          <h1 className="text-2xl font-bold mb-1 text-black">{item.name}</h1>
          <p className="text-sm text-gray-500 mb-4">
            {item.category} • {item.season}
          </p>

          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-black">Colors</p>
              <p className="text-gray-600">{item.colors.length ? item.colors.join(", ") : "-"}</p>
            </div>

            <div>
              <p className="font-medium text-black">Size</p>
              <p className="text-gray-600">{item.size || "-"}</p>
            </div>

            <div>
              <p className="font-medium text-black">Wash after wears</p>
              <p className="text-gray-600">{item.washAfterWears} {item.washAfterWears === 1 ? "wear" : "wears"}</p>
            </div>

            <div>
              <p className="font-medium text-black">Occasions</p>
              <p className="text-gray-600">{item.occasions.length ? item.occasions.join(", ") : "-"}</p>
            </div>

            <div>
              <p className="font-medium text-black">Last worn</p>
              <p className="text-gray-600">{item.lastWornAt ? new Date(item.lastWornAt).toLocaleDateString() : "-"}</p>
            </div>

            <div>
                <p className="font-medium">Laundry</p>
                <p className="text-gray-600">
                    {item.laundryState ?? "-"} • wears since wash: {item.wearsSinceWash ?? 0} / {item.washAfterWears ?? "-"}
                </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}