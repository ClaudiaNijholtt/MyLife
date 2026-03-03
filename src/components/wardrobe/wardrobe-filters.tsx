"use client";

import { useMemo } from "react";
import type { CloudClothingItem } from "@/lib/cloud/wardrobe";

interface WardrobeFiltersProps {
  items: CloudClothingItem[];
  category: string;
  subcategory: string;
  season: string;
  occasion: string;
  laundryState: string;
  onCategoryChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
  onSeasonChange: (value: string) => void;
  onOccasionChange: (value: string) => void;
  onLaundryStateChange: (value: string) => void;
  onReset: () => void;
}

export function WardrobeFilters({
  items,
  category,
  subcategory,
  season,
  occasion,
  laundryState,
  onCategoryChange,
  onSubcategoryChange,
  onSeasonChange,
  onOccasionChange,
  onLaundryStateChange,
  onReset,
}: WardrobeFiltersProps) {
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
    const states = new Set(items.map((it) => it.laundry_state || "clean"));
    return Array.from(states).sort();
  }, [items]);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 mb-5">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600">Category</label>
          <select
            value={category}
            onChange={(e) => {
              onCategoryChange(e.target.value);
              onSubcategoryChange("*");
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
              onChange={(e) => onSubcategoryChange(e.target.value)}
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
            onChange={(e) => onSeasonChange(e.target.value)}
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
            onChange={(e) => onOccasionChange(e.target.value)}
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
            onChange={(e) => onLaundryStateChange(e.target.value)}
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
          onClick={onReset}
          className="text-sm font-medium underline text-black"
        >
          Reset filters
        </button>
      </div>
    </div>
  );
}
