"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  db, 
  uid, 
  type ClothingCategory, 
  type ClothingSeason, 
  type ClothingStyle,
  type ClothingSubcategory,
  type TopSubcategory,
  type BottomSubcategory,
  type OuterwearSubcategory,
  type ShoesSubcategory,
  type JewelrySubcategory,
  type AccessorySubcategory,
  type FullBodySubcategory
} from "@/lib/db";
import { fileToDataUrl } from "@/lib/file";

const categories: { value: ClothingCategory; label: string }[] = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "outerwear", label: "Outerwear" },
  { value: "shoes", label: "Shoes" },
  { value: "jewelry", label: "Jewelry" },
  { value: "accessory", label: "Accessory" },
  { value: "full-body", label: "Full-body" },
  { value: "other", label: "Other" },
];

const topSubcategories: { value: TopSubcategory; label: string }[] = [
  { value: "t-shirt", label: "T-shirt" },
  { value: "sweater", label: "Sweater" },
  { value: "blouse", label: "Blouse" },
  { value: "shirt", label: "Shirt" },
  { value: "top", label: "Top" },
  { value: "tank-top", label: "Tank-top" },
  { value: "other", label: "Other" },
];

const bottomSubcategories: { value: BottomSubcategory; label: string }[] = [
  { value: "shorts", label: "Shorts" },
  { value: "pants", label: "Pants" },
  { value: "trousers", label: "Trousers" },
  { value: "tights", label: "Tights" },
  { value: "skirt", label: "Skirt" },
  { value: "jeans", label: "Jeans" },
  { value: "other", label: "Other" },
];

const outerwearSubcategories: { value: OuterwearSubcategory; label: string }[] = [
  { value: "jacket", label: "Jacket" },
  { value: "vest", label: "Vest" },
  { value: "cardigan", label: "Cardigan" },
  { value: "blazer", label: "Blazer" },
  { value: "coat", label: "Coat" },
  { value: "other", label: "Other" },
];

const shoesSubcategories: { value: ShoesSubcategory; label: string }[] = [
  { value: "sneakers", label: "Sneakers" },
  { value: "boots", label: "Boots" },
  { value: "sandals", label: "Sandals" },
  { value: "heels", label: "Heels" },
  { value: "flats", label: "Flats" },
  { value: "slippers", label: "Slippers" },
  { value: "other", label: "Other" },
];

const jewelrySubcategories: { value: JewelrySubcategory; label: string }[] = [
  { value: "earrings", label: "Earrings" },
  { value: "necklace", label: "Necklace" },
  { value: "bracelet", label: "Bracelet" },
  { value: "ring", label: "Ring" },
  { value: "watch", label: "Watch" },
  { value: "anklet", label: "Anklet" },
  { value: "other", label: "Other" },
];

const accessorySubcategories: { value: AccessorySubcategory; label: string }[] = [
  { value: "bag", label: "Bag" },
  { value: "belt", label: "Belt" },
  { value: "scarf", label: "Scarf" },
  { value: "hat", label: "Hat" },
  { value: "sunglasses", label: "Sunglasses" },
  { value: "headband", label: "Headband" },
  { value: "other", label: "Other" },
];

const fullBodySubcategories: { value: FullBodySubcategory; label: string }[] = [
  { value: "dress", label: "Dress" },
  { value: "jumpsuit", label: "Jumpsuit" },
  { value: "romper", label: "Romper" },
  { value: "overall", label: "Overall" },
  { value: "other", label: "Other" },
];

const styles: { value: ClothingStyle; label: string }[] = [
  { value: "casual", label: "Casual" },
  { value: "classy", label: "Classy" },
  { value: "sporty", label: "Sporty" },
  { value: "formal", label: "Formal" },
  { value: "bohemian", label: "Bohemian" },
  { value: "streetwear", label: "Streetwear" },
  { value: "minimalist", label: "Minimalist" },
  { value: "other", label: "Other" },
];

const seasons: { value: ClothingSeason; label: string }[] = [
  { value: "summer", label: "Summer" },
  { value: "winter", label: "Winter" },
  { value: "all", label: "All year" },
];

function parseList(s: string) {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function AddWardrobeItemPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<ClothingCategory>("top");
  const [subcategory, setSubcategory] = useState<ClothingSubcategory | undefined>("t-shirt");
  const [season, setSeason] = useState<ClothingSeason>("all");
  const [style, setStyle] = useState<ClothingStyle | undefined>("casual");
  const [size, setSize] = useState("");
  const [colorsRaw, setColorsRaw] = useState("");
  const [occasionsRaw, setOccasionsRaw] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

const subcategoryOptions = useMemo(() => {
    switch (category) {
      case "top": return topSubcategories;
      case "bottom": return bottomSubcategories;
      case "outerwear": return outerwearSubcategories;
      case "shoes": return shoesSubcategories;
      case "jewelry": return jewelrySubcategories;
      case "accessory": return accessorySubcategories;
      case "full-body": return fullBodySubcategories;
      default: return [];
    }
  }, [category]);

  const canSave = useMemo(() => {
    return name.trim().length > 0 && !!file && !saving;
  }, [name, file, saving]);

  async function onPickFile(f: File | null) {
    setError("");
    setFile(f);
    if (!f) {
      setPreview("");
      return;
    }
    const dataUrl = await fileToDataUrl(f);
    setPreview(dataUrl);
  }

  async function onSave() {
    if (!canSave || !file) return;
    setSaving(true);
    setError("");

    try {
      const photoDataUrl = preview || (await fileToDataUrl(file));
      const now = new Date().toISOString();

      await db.clothingItems.put({
        id: uid(),
        name: name.trim(),
        photoDataUrl,
        category,
        subcategory,
        colors: parseList(colorsRaw),
        season,
        style,
        size: size.trim() || undefined,
        occasions: parseList(occasionsRaw),
        createdAt: now,
        updatedAt: now,
      });

      router.push("/wardrobe");
    } catch (e) {
      setError("Saving failed. Try again.");
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-black">Add item</h1>
          <button
            onClick={() => router.push("/wardrobe")}
            className="text-sm font-medium underline text-black"
          >
            Back
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="mb-4">
            <label className="text-sm font-medium text-black">Photo</label>
            <div className="mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-black"
              />
            </div>

            {preview ? (
              <div className="mt-3 aspect-square rounded-xl overflow-hidden bg-gray-200">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            ) : null}
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-black">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Black blazer"
              className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black placeholder:text-gray-700"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-black">Category</label>
              <select
                value={category}
                onChange={(e) => {
                  const newCategory = e.target.value as ClothingCategory;
                  setCategory(newCategory);
                  // Reset subcategory when category changes
                  if (newCategory === "top") setSubcategory("t-shirt");
                  else if (newCategory === "bottom") setSubcategory("shorts");
                  else if (newCategory === "outerwear") setSubcategory("jacket");
                  else if (newCategory === "shoes") setSubcategory("sneakers");
                  else if (newCategory === "jewelry") setSubcategory("earrings");
                  else if (newCategory === "accessory") setSubcategory("bag");
                  else if (newCategory === "full-body") setSubcategory("dress");
                  else setSubcategory("other");
                }}
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black text-gray-700"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {subcategoryOptions.length > 0 && (
              <div>
                <label className="text-sm font-medium text-black">Subcategory</label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value as ClothingSubcategory)}
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black text-gray-700"
                >
                  {subcategoryOptions.map((sc) => (
                    <option key={sc.value} value={sc.value}>
                      {sc.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-black">Season</label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value as ClothingSeason)}
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black text-gray-700"
              >
                {seasons.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-black">Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as ClothingStyle)}
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black text-gray-700"
              >
                {styles.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-black">Colors (comma separated)</label>
            <input
              value={colorsRaw}
              onChange={(e) => setColorsRaw(e.target.value)}
              placeholder="black, white"
              className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black placeholder:text-gray-700"
            />
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-black">Size</label>
            <input
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="e.g. S, M, L, XL, 38, 40"
              className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black placeholder:text-gray-700"
            />
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-black">Occasions (comma separated)</label>
            <input
              value={occasionsRaw}
              onChange={(e) => setOccasionsRaw(e.target.value)}
              placeholder="casual, work, party"
              className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black placeholder:text-gray-700"
            />
          </div>

          {error ? <p className="text-sm text-red-600 mb-3">{error}</p> : null}

          <button
            onClick={onSave}
            disabled={!canSave}
            className="w-full bg-black text-white py-3 rounded-2xl shadow disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save item"}
          </button>
        </div>
      </div>
    </main>
  );
}