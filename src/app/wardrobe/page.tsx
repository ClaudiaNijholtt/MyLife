"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchClothingItems, type CloudClothingItem } from "@/lib/cloud/wardrobe";
import { getWardrobePhotoSignedUrl } from "@/lib/cloud/storage";
import { PageLoader } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { WardrobeFilters } from "@/components/wardrobe/wardrobe-filters";
import { WardrobeGrid } from "@/components/wardrobe/wardrobe-card";

type CloudClothingItemWithUrl = CloudClothingItem & { photoUrl: string | null };

export default function WardrobePage() {
  const [items, setItems] = useState<CloudClothingItemWithUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState<string>("*");
  const [subcategory, setSubcategory] = useState<string>("*");
  const [season, setSeason] = useState<string>("*");
  const [occasion, setOccasion] = useState<string>("*");
  const [laundryState, setLaundryState] = useState<string>("*");

  useEffect(() => {
    async function loadItems() {
      try {
        console.log("[Wardrobe] Starting to load items...");
        const startTime = performance.now();
        const all = await fetchClothingItems();
        
        // Get signed URLs for all items
        const withUrls = await Promise.all(
          all.map(async (it) => ({
            ...it,
            photoUrl: it.photo_path 
              ? await getWardrobePhotoSignedUrl(it.photo_path, 3600)
              : null,
          }))
        );
        
        const endTime = performance.now();
        console.log(`[Wardrobe] Loaded ${all.length} items in ${(endTime - startTime).toFixed(2)}ms`);
        
        setItems(withUrls);
      } catch (error) {
        console.error("Error loading items:", error);
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, []);

  const filtered = useMemo(() => {
    let result = items;

    // Apply search query
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((it) => {
        const hay = [
          it.name,
          it.category,
          it.season,
          it.colors.join(" "),
          it.occasions.join(" "),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    // Apply category filter
    if (category !== "*") {
      result = result.filter((it) => it.category === category);
    }

    // Apply subcategory filter
    if (subcategory !== "*") {
      result = result.filter((it) => it.subcategory === subcategory);
    }

    // Apply season filter
    if (season !== "*") {
      result = result.filter((it) => it.season === season);
    }

    // Apply occasion filter
    if (occasion !== "*") {
      result = result.filter((it) => it.occasions.includes(occasion));
    }

    // Apply laundry state filter
    if (laundryState !== "*") {
      result = result.filter((it) => it.laundry_state === laundryState);
    }

    return result;
  }, [items, query, category, subcategory, season, occasion, laundryState]);

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-5xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-black">My Wardrobe</h1>
          <Link
            href="/wardrobe/add"
            className="bg-black text-white px-4 py-2 rounded-full shadow hover:scale-[1.02] transition"
          >
            + Add item
          </Link>
        </div>

        <div className="mb-5 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search (name, color, occasion...)"
            className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black placeholder:text-gray-700"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white border border-gray-200 px-4 py-2 rounded-2xl hover:bg-gray-50 transition text-black font-medium"
          >
            {showFilters ? "Hide" : "Filter"}
          </button>
        </div>

        {/* <div className="bg-white rounded-2xl shadow-sm p-4 mb-5">
            <p className="text-sm text-gray-500">Quick stats</p>
            <Stats />
        </div> */}

        {showFilters && (
          <WardrobeFilters
            items={items}
            category={category}
            subcategory={subcategory}
            season={season}
            occasion={occasion}
            laundryState={laundryState}
            onCategoryChange={setCategory}
            onSubcategoryChange={setSubcategory}
            onSeasonChange={setSeason}
            onOccasionChange={setOccasion}
            onLaundryStateChange={setLaundryState}
            onReset={() => {
              setCategory("*");
              setSubcategory("*");
              setSeason("*");
              setOccasion("*");
              setLaundryState("*");
            }}
          />
        )}

        {loading ? (
          <PageLoader />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={query || category !== "*" || season !== "*" || occasion !== "*" || laundryState !== "*" 
              ? "No matching items" 
              : "No items yet"}
            description={query || category !== "*" || season !== "*" || occasion !== "*" || laundryState !== "*"
              ? "Try adjusting your search or filters."
              : "Add your first clothing item to start building your wardrobe."}
            actionLabel={!(query || category !== "*" || season !== "*" || occasion !== "*" || laundryState !== "*") ? "Add item" : undefined}
            actionHref={!(query || category !== "*" || season !== "*" || occasion !== "*" || laundryState !== "*") ? "/wardrobe/add" : undefined}
            icon="👔"
          />
        ) : (
          <WardrobeGrid items={filtered} />
        )}
      </div>
    </main>
  );
}