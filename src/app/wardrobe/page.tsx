"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchClothingItems, type CloudClothingItem } from "@/lib/cloud/wardrobe";
import { getWardrobePhotoSignedUrl } from "@/lib/cloud/storage";
import { PageLoader } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { WardrobeFilters } from "@/components/wardrobe/wardrobe-filters";
import { WardrobeGrid } from "@/components/wardrobe/wardrobe-card";
import { Plus, SlidersHorizontal } from "lucide-react";

type CloudClothingItemWithUrl = CloudClothingItem & { photoUrl: string | null };

export default function WardrobePage() {
  const [items, setItems] = useState<CloudClothingItemWithUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState<string>("*");
  const [subcategory, setSubcategory] = useState<string>("*");
  const [season, setSeason] = useState<string>("*");
  const [color, setColor] = useState<string>("*");
  const [brand, setBrand] = useState<string>("*");
  const [size, setSize] = useState<string>("*");
  const [laundryState, setLaundryState] = useState<string>("*");

  useEffect(() => {
    async function loadItems() {
      try {
        console.log("[Wardrobe] Starting to load items...");
        const startTime = performance.now();
        const all = await fetchClothingItems();

        setItems(all.map((it) => ({ ...it, photoUrl: null })));
        setLoading(false);

        // Resolve signed URLs in the background so the page renders immediately
        const withUrls = await Promise.all(
          all.map(async (it) => {
            try {
              return {
                ...it,
                photoUrl: it.photo_path
                  ? await getWardrobePhotoSignedUrl(it.photo_path, 3600)
                  : null,
              };
            } catch {
              return { ...it, photoUrl: null };
            }
          })
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
          it.brand || "",
          it.size || "",
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

    // Apply color filter
    if (color !== "*") {
      result = result.filter((it) => it.colors.includes(color));
    }

    // Apply brand filter
    if (brand !== "*") {
      result = result.filter((it) => it.brand === brand);
    }

    // Apply size filter
    if (size !== "*") {
      result = result.filter((it) => it.size === size);
    }

    // Apply laundry state filter
    if (laundryState !== "*") {
      result = result.filter((it) => it.laundry_state === laundryState);
    }

    return result;
  }, [items, query, category, subcategory, season, color, brand, size, laundryState]);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-900">My Wardrobe</h1>
          <Link
            href="/wardrobe/add"
            className="flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-3 min-h-12 text-sm font-medium shadow-sm hover:opacity-90 transition"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden md:inline">Add item</span>
          </Link>
        </div>

        <div className="mb-4 flex gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search (name, color, brand, size...)"
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400 text-slate-900"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-3 min-h-12 rounded-2xl hover:bg-slate-50 transition text-slate-900 text-sm font-medium shadow-sm"
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span className="hidden md:inline">{showFilters ? "Hide" : "Filter"}</span>
          </button>
        </div>

        {/* <div className="bg-white rounded-2xl shadow-sm p-4 mb-5">
            <p className="text-sm text-gray-500">Quick stats</p>
            <Stats />
        </div> */}

        <div 
          className={`mb-4 overflow-hidden transition-all duration-1000 ease-in-out ${
            showFilters ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <WardrobeFilters
            items={items}
            category={category}
            subcategory={subcategory}
            season={season}
            color={color}
            brand={brand}
            size={size}
            laundryState={laundryState}
            onCategoryChange={setCategory}
            onSubcategoryChange={setSubcategory}
            onSeasonChange={setSeason}
            onColorChange={setColor}
            onBrandChange={setBrand}
            onSizeChange={setSize}
            onLaundryStateChange={setLaundryState}
            onReset={() => {
              setCategory("*");
              setSubcategory("*");
              setSeason("*");
              setColor("*");
              setBrand("*");
              setSize("*");
              setLaundryState("*");
            }}
          />
        </div>

        {loading ? (
          <PageLoader />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={query || category !== "*" || season !== "*" || color !== "*" || brand !== "*" || size !== "*" || laundryState !== "*" 
              ? "No matching items" 
              : "No items yet"}
            description={query || category !== "*" || season !== "*" || color !== "*" || brand !== "*" || size !== "*" || laundryState !== "*"
              ? "Try adjusting your search or filters."
              : "Add your first clothing item to start building your wardrobe."}
            actionLabel={!(query || category !== "*" || season !== "*" || color !== "*" || brand !== "*" || size !== "*" || laundryState !== "*") ? "Add item" : undefined}
            actionHref={!(query || category !== "*" || season !== "*" || color !== "*" || brand !== "*" || size !== "*" || laundryState !== "*") ? "/wardrobe/add" : undefined}
            icon="👔"
          />
        ) : (
          <WardrobeGrid items={filtered} />
        )}
      </div>
    </main>
  );
}