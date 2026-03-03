"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchClothingItem, fetchClothingItems, deleteClothingItem, updateClothingItem, type CloudClothingItem } from "@/lib/cloud/wardrobe";
import { getWardrobePhotoSignedUrl } from "@/lib/cloud/storage";
import { findSimilarItems } from "@/lib/cloud/recommendations";

type CloudClothingItemWithUrl = CloudClothingItem & { photoUrl: string | null };

export default function WardrobeItemDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [item, setItem] = useState<CloudClothingItemWithUrl | null>(null);
  const [loading, setLoading] = useState(true);
  const [wornTodayClicked, setWornTodayClicked] = useState(false);
  const [similarItems, setSimilarItems] = useState<CloudClothingItemWithUrl[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const found = await fetchClothingItem(id);
        const photoUrl = found.photo_path 
          ? await getWardrobePhotoSignedUrl(found.photo_path, 3600)
          : null;
        setItem({ ...found, photoUrl });

        // Fetch all items to find similar ones
        const allItems = await fetchClothingItems();
        const similar = findSimilarItems(allItems, found, 12);
        
        // Get signed URLs for similar items
        const similarWithUrls = await Promise.all(
          similar.map(async (it) => ({
            ...it,
            photoUrl: it.photo_path 
              ? await getWardrobePhotoSignedUrl(it.photo_path, 3600)
              : null,
          }))
        );
        
        setSimilarItems(similarWithUrls);
      } catch (error) {
        console.error("Error loading item:", error);
        setItem(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function onDelete() {
    if (!confirm("Delete this item?")) return;
    try {
      await deleteClothingItem(id);
      router.push("/wardrobe");
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item");
    }
  }

  async function onWornToday() {
    try {
      const now = new Date().toISOString();
      const updated = await updateClothingItem(id, {
        last_worn_at: now,
        wears_since_wash: (item?.wears_since_wash || 0) + 1,
      });
      const photoUrl = updated.photo_path 
        ? await getWardrobePhotoSignedUrl(updated.photo_path, 3600)
        : null;
      setItem({ ...updated, photoUrl });
      setWornTodayClicked(true);
      setTimeout(() => setWornTodayClicked(false), 2000);
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Failed to mark as worn");
    }
  }

  async function onSendToLaundry() {
    try {
      const updated = await updateClothingItem(id, {
        laundry_state: "dirty",
      });
      const photoUrl = updated.photo_path 
        ? await getWardrobePhotoSignedUrl(updated.photo_path, 3600)
        : null;
      setItem({ ...updated, photoUrl });
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Failed to send to laundry");
    }
  }

  async function onMarkClean() {
    try {
      const updated = await updateClothingItem(id, {
        laundry_state: "clean",
        wears_since_wash: 0,
      });
      const photoUrl = updated.photo_path 
        ? await getWardrobePhotoSignedUrl(updated.photo_path, 3600)
        : null;
      setItem({ ...updated, photoUrl });
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Failed to mark as clean");
    }
  }

  const isWornToday = item?.last_worn_at 
    ? new Date(item.last_worn_at).toDateString() === new Date().toDateString()
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
            {item.photoUrl ? (
              <img 
                src={item.photoUrl} 
                alt={item.name} 
                loading="lazy" 
                decoding="async" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No image
              </div>
            )}
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

            {item.brand && (
              <div>
                <p className="font-medium text-black">Brand</p>
                <p className="text-gray-600">{item.brand}</p>
              </div>
            )}

            <div>
              <p className="font-medium text-black">Wash after wears</p>
              <p className="text-gray-600">{item.wash_after_wears} {item.wash_after_wears === 1 ? "wear" : "wears"}</p>
            </div>

            <div>
              <p className="font-medium text-black">Occasions</p>
              <p className="text-gray-600">{item.occasions.length ? item.occasions.join(", ") : "-"}</p>
            </div>

            <div>
              <p className="font-medium text-black">Last worn</p>
              <p className="text-gray-600">{item.last_worn_at ? new Date(item.last_worn_at).toLocaleDateString() : "-"}</p>
            </div>

            <div>
              <p className="font-medium text-black">Laundry</p>
              <p className="text-gray-600">
                {item.laundry_state ?? "-"} • wears since wash: {item.wears_since_wash ?? 0} / {item.wash_after_wears ?? "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Similar items slider */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-lg font-semibold mb-4 text-black">Similar items</h2>
          
          {similarItems.length === 0 ? (
            <p className="text-sm text-gray-500">No similar items found yet. Add more items to your wardrobe!</p>
          ) : (
            <div className="relative">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {similarItems.map((similar) => (
                  <Link
                    key={similar.id}
                    href={`/wardrobe/${similar.id}`}
                    className="flex-none w-32 snap-start group"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-200 mb-2 group-hover:shadow-md transition">
                      {similar.photoUrl ? (
                        <img 
                          src={similar.photoUrl} 
                          alt={similar.name} 
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No image
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium truncate text-black">{similar.name}</p>
                    <p className="text-xs text-gray-500">{similar.category}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}