"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchClothingItem, fetchClothingItems, deleteClothingItem, updateClothingItem, type CloudClothingItem } from "@/lib/cloud/wardrobe";
import { getWardrobePhotoSignedUrl } from "@/lib/cloud/storage";
import { findSimilarItems } from "@/lib/cloud/recommendations";
import { PageLoader } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { SimilarItemsSlider } from "@/components/wardrobe/similar-items-slider";
import { useToast } from "@/components/ui/toast";

type CloudClothingItemWithUrl = CloudClothingItem & { photoUrl: string | null };

export default function WardrobeItemDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const { showToast } = useToast();

  const [item, setItem] = useState<CloudClothingItemWithUrl | null>(null);
  const [loading, setLoading] = useState(true);
  const [wornTodayClicked, setWornTodayClicked] = useState(false);
  const [similarItems, setSimilarItems] = useState<CloudClothingItemWithUrl[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
        showToast("Failed to load item", "error");
        setItem(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, showToast]);

  async function updateItemState(updates: Partial<CloudClothingItem>) {
    try {
      const updated = await updateClothingItem(id, updates);
      const photoUrl = updated.photo_path 
        ? await getWardrobePhotoSignedUrl(updated.photo_path, 3600)
        : null;
      setItem({ ...updated, photoUrl });
      return true;
    } catch (error) {
      console.error("Error updating item:", error);
      return false;
    }
  }

  async function onDelete() {
    if (!confirm("Are you sure you want to delete this item? This cannot be undone.")) return;
    
    setActionLoading("delete");
    try {
      await deleteClothingItem(id);
      showToast("Item deleted successfully", "success");
      router.push("/wardrobe");
    } catch (error) {
      console.error("Error deleting item:", error);
      showToast("Failed to delete item", "error");
      setActionLoading(null);
    }
  }

  async function onWornToday() {
    setActionLoading("worn");
    const success = await updateItemState({
      last_worn_at: new Date().toISOString(),
      wears_since_wash: (item?.wears_since_wash || 0) + 1,
    });
    
    if (success) {
      setWornTodayClicked(true);
      showToast("Marked as worn today", "success");
      setTimeout(() => setWornTodayClicked(false), 2000);
    } else {
      showToast("Failed to mark as worn", "error");
    }
    setActionLoading(null);
  }

  async function onSendToLaundry() {
    setActionLoading("laundry");
    const success = await updateItemState({
      laundry_state: "dirty",
    });
    
    if (success) {
      showToast("Sent to laundry", "success");
    } else {
      showToast("Failed to update", "error");
    }
    setActionLoading(null);
  }

  async function onMarkClean() {
    setActionLoading("clean");
    const success = await updateItemState({
      laundry_state: "clean",
      wears_since_wash: 0,
    });
    
    if (success) {
      showToast("Marked as clean", "success");
    } else {
      showToast("Failed to update", "error");
    }
    setActionLoading(null);
  }

  const isWornToday = item?.last_worn_at 
    ? new Date(item.last_worn_at).toDateString() === new Date().toDateString()
    : false;

  if (loading) {
    return <PageLoader />;
  }

  if (!item) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <EmptyState
          title="Item not found"
          description="This item doesn't exist or you don't have access to it."
          actionLabel="Back to wardrobe"
          actionHref="/wardrobe"
          icon="❌"
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => router.push("/wardrobe")} 
            className="text-sm font-medium underline text-black hover:text-gray-600"
          >
            ← Back
          </button>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={wornTodayClicked ? "primary" : isWornToday ? "secondary" : "secondary"}
              onClick={onWornToday}
              loading={actionLoading === "worn"}
              className={wornTodayClicked ? "bg-green-500 hover:bg-green-600" : isWornToday ? "bg-green-100 text-green-800 border-green-300" : ""}
            >
              {wornTodayClicked ? "✓ Marked!" : isWornToday ? "Worn today ✓" : "Worn today"}
            </Button>

            <Button
              variant="secondary"
              onClick={onSendToLaundry}
              loading={actionLoading === "laundry"}
            >
              Send to laundry
            </Button>

            <Button
              variant="secondary"
              onClick={onMarkClean}
              loading={actionLoading === "clean"}
            >
              Mark as clean
            </Button>

            <Button
              variant="secondary"
              onClick={() => router.push(`/wardrobe/${id}/edit`)}
            >
              Edit
            </Button>

            <Button
              variant="danger"
              onClick={onDelete}
              loading={actionLoading === "delete"}
            >
              Delete
            </Button>
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

        <SimilarItemsSlider items={similarItems} />
      </div>
    </main>
  );
}