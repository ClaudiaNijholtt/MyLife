"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { db, type ClothingItem } from "@/lib/db";

export default function WardrobePage() {
  const [items, setItems] = useState<ClothingItem[]>([]);
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
        const all = await db.clothingItems.toArray();
        const endTime = performance.now();
        console.log(`[Wardrobe] Loaded ${all.length} items in ${(endTime - startTime).toFixed(2)}ms`);
        
        setItems(all.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }));
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
      result = result.filter((it) => it.laundryState === laundryState);
    }

    return result;
  }, [items, query, category, subcategory, season, occasion, laundryState]);

  // Get unique categories from all items
  const availableCategories = useMemo(() => {
    const categories = new Set(items.map((it) => it.category));
    return Array.from(categories).sort();
  }, [items]);

  // Get unique subcategories based on selected category
  const availableSubcategories = useMemo(() => {
    if (category === "*") return [];
    const subcats = new Set(
      items
        .filter((it) => it.category === category && it.subcategory)
        .map((it) => it.subcategory as string)
    );
    return Array.from(subcats).sort();
  }, [items, category]);

  // Get unique seasons from all items
  const availableSeasons = useMemo(() => {
    const seasons = new Set(items.map((it) => it.season));
    return Array.from(seasons).sort();
  }, [items]);

  // Get unique occasions from all items
  const availableOccasions = useMemo(() => {
    const occasions = new Set<string>();
    items.forEach((it) => {
      it.occasions.forEach((occ) => occasions.add(occ));
    });
    return Array.from(occasions).sort();
  }, [items]);

  // Get unique laundry states from all items
  const availableLaundryStates = useMemo(() => {
    const states = new Set(items.map((it) => it.laundryState || "clean"));
    return Array.from(states).sort();
  }, [items]);

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
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-5">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                <label className="text-xs font-medium text-gray-600">Category</label>
                <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setSubcategory("*");
                    }}
                    className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black text-black"
                >
                    <option value="*">All</option>
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                </select>
                </div>

                {availableSubcategories.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-gray-600">Subcategory</label>
                    <select
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black text-black"
                    >
                      <option value="*">All</option>
                      {availableSubcategories.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub.charAt(0).toUpperCase() + sub.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                <label className="text-xs font-medium text-gray-600">Season</label>
                <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black text-black"
                >
                    <option value="*">All</option>
                    {availableSeasons.map((s) => (
                      <option key={s} value={s}>
                        {s === "all" ? "All year" : s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                </select>
                </div>

                <div>
                <label className="text-xs font-medium text-gray-600">Occasion</label>
                <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black text-black"
                >
                    <option value="*">All</option>
                    {availableOccasions.map((occ) => (
                      <option key={occ} value={occ}>
                        {occ.charAt(0).toUpperCase() + occ.slice(1)}
                      </option>
                    ))}
                </select>
                </div>

                <div>
                <label className="text-xs font-medium text-gray-600">Laundry</label>
                <select
                    value={laundryState}
                    onChange={(e) => setLaundryState(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black text-black"
                >
                    <option value="*">All</option>
                    {availableLaundryStates.map((state) => (
                      <option key={state} value={state}>
                        {state.charAt(0).toUpperCase() + state.slice(1)}
                      </option>
                    ))}
                </select>
                </div>
            </div>

            <div className="mt-3 flex justify-end">
                <button
                onClick={() => {
                    setCategory("*");
                    setSubcategory("*");
                    setSeason("*");
                    setOccasion("*");
                    setLaundryState("*");
                }}
                className="text-sm font-medium underline text-black"
                >
                Reset filters
                </button>
            </div>
            </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-gray-500">Loading items...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="font-medium mb-1 text-black">No items yet</p>
            <p className="text-sm text-gray-500">
              Add your first clothing item to start building your wardrobe.
            </p>
            <Link
              href="/wardrobe/add"
              className="inline-block mt-4 bg-black text-white px-4 py-2 rounded-full"
            >
              Add item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((item) => (
                <Link
                key={item.id}
                href={`/wardrobe/${item.id}`}
                className="bg-white rounded-2xl shadow-sm p-3 block hover:shadow-md transition"
                >
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-200 mb-2 relative">
                    <img
                    src={item.thumbnailDataUrl || item.photoDataUrl}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover absolute inset-0"
                    style={{ backgroundColor: '#e5e7eb' }}
                    />
                </div>
                <p className="text-sm font-medium truncate text-black">{item.name}</p>
                <p className="text-xs text-gray-500">
                    {item.category} • {item.season}
                </p>
                <div className="mt-1">
                    <span className="inline-block text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {item.laundryState ?? "clean"}
                    </span>
                </div>
                </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Stats() {
  const [worn30, setWorn30] = useState<number>(0);

  useEffect(() => {
    refresh();

    async function refresh() {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const sinceIso = since.toISOString();

      const logs = await db.wearLogs
        .where("wornAt")
        .above(sinceIso)
        .toArray();

      const uniqueItems = new Set(logs.map((l) => l.itemId));
      setWorn30(uniqueItems.size);
    }
  }, []);

  return (
    <p className="text-sm font-medium text-black">
      Items worn in last 30 days: <span className="font-bold">{worn30}</span>
    </p>
  );
}