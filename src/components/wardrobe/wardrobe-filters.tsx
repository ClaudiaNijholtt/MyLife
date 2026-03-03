"use client";

import { useMemo } from "react";
import type { CloudClothingItem } from "@/lib/cloud/wardrobe";
import { SlidersHorizontal } from "lucide-react";

interface WardrobeFiltersProps {
  items: CloudClothingItem[];
  category: string;
  subcategory: string;
  season: string;
  color: string;
  brand: string;
  size: string;
  laundryState: string;
  onCategoryChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
  onSeasonChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onSizeChange: (value: string) => void;
  onLaundryStateChange: (value: string) => void;
  onReset: () => void;
}

export function WardrobeFilters({
  items,
  category,
  subcategory,
  season,
  color,
  brand,
  size,
  laundryState,
  onCategoryChange,
  onSubcategoryChange,
  onSeasonChange,
  onColorChange,
  onBrandChange,
  onSizeChange,
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

  // Get unique colors from all items
  const availableColors = useMemo(() => {
    const colors = new Set<string>();
    items.forEach((it) => {
      it.colors.forEach((color) => colors.add(color));
    });
    return Array.from(colors).sort();
  }, [items]);

  // Get unique brands from all items
  const availableBrands = useMemo(() => {
    const brands = new Set(
      items
        .filter((it) => it.brand)
        .map((it) => it.brand as string)
    );
    return Array.from(brands).sort();
  }, [items]);

  // Get unique sizes from all items
  const availableSizes = useMemo(() => {
    const sizes = new Set(
      items
        .filter((it) => it.size)
        .map((it) => it.size as string)
    );
    return Array.from(sizes).sort();
  }, [items]);

  // Get unique laundry states from all items
  const availableLaundryStates = useMemo(() => {
    const states = new Set(items.map((it) => it.laundry_state || "clean"));
    return Array.from(states).sort();
  }, [items]);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="h-5 w-5 text-slate-500" />
        <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-xs font-medium text-slate-600 select-none">Category</label>
          <select
            value={category}
            onChange={(e) => {
              onCategoryChange(e.target.value);
              onSubcategoryChange("*");
            }}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 touch-manipulation"
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
            <label className="text-xs font-medium text-slate-600 select-none">Subcategory</label>
            <select
              value={subcategory}
              onChange={(e) => onSubcategoryChange(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 touch-manipulation"
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
          <label className="text-xs font-medium text-slate-600 select-none">Season</label>
          <select
            value={season}
            onChange={(e) => onSeasonChange(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 touch-manipulation"
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
          <label className="text-xs font-medium text-slate-600 select-none">Color</label>
          <select
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 touch-manipulation"
          >
            <option value="*">All</option>
            {availableColors.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600 select-none">Brand</label>
          <select
            value={brand}
            onChange={(e) => onBrandChange(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 touch-manipulation"
          >
            <option value="*">All</option>
            {availableBrands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600 select-none">Size</label>
          <select
            value={size}
            onChange={(e) => onSizeChange(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 touch-manipulation"
          >
            <option value="*">All</option>
            {availableSizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600 select-none">Laundry</label>
          <select
            value={laundryState}
            onChange={(e) => onLaundryStateChange(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 touch-manipulation"
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

      <div className="mt-4 flex justify-end">
        <button
          onClick={onReset}
          className="text-sm font-medium text-slate-500 hover:text-slate-900 transition"
        >
          Reset all
        </button>
      </div>
    </div>
  );
}
