"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { 
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
} from "@/lib/types/wardrobe";
import { generateId } from "@/lib/utils/helpers";
import { compressForWardrobe } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";
import { uploadWardrobePhoto } from "@/lib/cloud/storage";
import { createClothingItem } from "@/lib/cloud/wardrobe";
import { ChipGroup, MultiChipGroup } from "@/components/ui/chips";
import { ArrowLeft, Plus } from "lucide-react";

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

const colorOptions: Array<{ value: string; label: string }> = [
  { value: "black", label: "Black" },
  { value: "white", label: "White" },
  { value: "gray", label: "Gray" },
  { value: "beige", label: "Beige" },
  { value: "brown", label: "Brown" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "red", label: "Red" },
  { value: "pink", label: "Pink" },
  { value: "purple", label: "Purple" },
  { value: "yellow", label: "Yellow" },
  { value: "orange", label: "Orange" },
];

type SizeChipConfig =
  | {
      kind: "fixed";
      label: string;
      hint: string;
      options: string[];
    }
  | {
      kind: "clothing";
      label: string;
      hint: string;
      letterOptions: string[];
      numberOptions: string[];
    };

function getDefaultSubcategory(category: ClothingCategory): ClothingSubcategory {
  if (category === "top") return "t-shirt";
  if (category === "bottom") return "shorts";
  if (category === "outerwear") return "jacket";
  if (category === "shoes") return "sneakers";
  if (category === "jewelry") return "earrings";
  if (category === "accessory") return "bag";
  if (category === "full-body") return "dress";
  return "other";
}

function getSizeChipConfig(category: ClothingCategory, subcategory?: ClothingSubcategory): SizeChipConfig | null {
  if (category === "accessory") {
    return null;
  }

  if (category === "jewelry") {
    if (subcategory === "ring") {
      return {
        kind: "fixed",
        label: "Ringmaat",
        hint: "Kies ringmaat in EU.",
        options: [
          "14", "15", "16", "17", "18", "19", "20", "21", "22",
        ],
      };
    }

    if (subcategory === "bracelet" || subcategory === "watch") {
      return {
        kind: "fixed",
        label: "Polsmaat",
        hint: "Kies de polsomtrek in cm.",
        options: [
          "14 cm", "15 cm", "16 cm", "17 cm", "18 cm", "19 cm", "20 cm", "21 cm", "22 cm",
        ],
      };
    }

    if (subcategory === "anklet") {
      return {
        kind: "fixed",
        label: "Enkelmaat",
        hint: "Kies de enkelomtrek in cm.",
        options: [
          "20 cm", "21 cm", "22 cm", "23 cm", "24 cm", "25 cm", "26 cm", "27 cm", "28 cm",
        ],
      };
    }

    return {
      kind: "fixed",
      label: "Sieraadmaat",
      hint: "Gebruik one size of verstelbaar als er geen exacte maat is.",
      options: ["One size", "Verstelbaar", "Kort", "Medium", "Lang"],
    };
  }

  if (category === "shoes") {
    return {
      kind: "fixed",
      label: "Schoenmaat",
      hint: "EU schoenmaten.",
      options: [
        "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46",
      ],
    };
  }

  return {
    kind: "clothing",
    label: "Kledingmaat",
    hint: "Van minimaal XXS/32 tot maximaal XL/48.",
    letterOptions: ["XXS", "XS", "S", "M", "L", "XL"],
    numberOptions: ["32", "34", "36", "38", "40", "42", "44", "46", "48"],
  };
}

export default function AddWardrobeItemPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<ClothingCategory>("top");
  const [subcategory, setSubcategory] = useState<ClothingSubcategory | undefined>("t-shirt");
  const [season, setSeason] = useState<ClothingSeason>("all");
  const [style, setStyle] = useState<ClothingStyle | undefined>("casual");
  const [size, setSize] = useState("");
  const [clothingSizeMode, setClothingSizeMode] = useState<"letters" | "numbers">("letters");
  const [brand, setBrand] = useState("");
  const [washAfterWears, setWashAfterWears] = useState(2);
  const [colors, setColors] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  // Categories that don't need washing
  const noWashCategories = ["shoes", "jewelry", "accessory"];
  const needsWashing = !noWashCategories.includes(category);

  // Update default washAfterWears based on category
  useEffect(() => {
    if (category === "top") setWashAfterWears(2);
    else if (category === "bottom") setWashAfterWears(3);
    else if (noWashCategories.includes(category)) setWashAfterWears(999);
    else setWashAfterWears(5);
  }, [category]);

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

  const sizeChipConfig = useMemo(
    () => getSizeChipConfig(category, subcategory),
    [category, subcategory]
  );

  const sizeOptions = useMemo(() => {
    if (!sizeChipConfig) return [];

    if (sizeChipConfig.kind === "clothing") {
      const options = clothingSizeMode === "letters" ? sizeChipConfig.letterOptions : sizeChipConfig.numberOptions;
      return options.map((value) => ({
        value,
        label: value,
      }));
    }

    return sizeChipConfig.options.map((value) => ({
      value,
      label: value,
    }));
  }, [sizeChipConfig, clothingSizeMode]);

  const canSave = useMemo(() => {
    return name.trim().length > 0 && !!file && !saving;
  }, [name, file, saving]);

async function onPickFile(f: File | null) {
  setError("");
  setFile(null);
  setPreview("");

  if (!f) return;

  const { file: compressed, previewUrl } = await compressForWardrobe(f);

  setFile(compressed);
  setPreview(previewUrl); 
}

  async function onSave() {
    if (!canSave || !file) return;
    setSaving(true);
    setError("");

    try {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) throw new Error("Not authenticated");

      const itemId = generateId();
      const photo_path = await uploadWardrobePhoto({
        userId: user.id,
        itemId,
        file,
      });

      await createClothingItem({
        name: name.trim(),
        photo_path,
        category,
        subcategory: subcategory || undefined,
        season,
        colors,
        brand: brand.trim() || undefined,
        size: category === "accessory" ? undefined : (size.trim() || undefined),
        laundry_state: "clean",
        wears_since_wash: 0,
        wash_after_wears: washAfterWears,
      });

      router.push("/wardrobe");
    } catch (e) {
      console.error("Save error:", e);
      console.error("Error details:", JSON.stringify(e, null, 2));
      if (e instanceof Error) {
        console.error("Error message:", e.message);
        console.error("Error stack:", e.stack);
        setError(`Failed: ${e.message}`);
      } else {
        setError("Saving failed. Try again.");
      }
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Add item</h1>
          <button
            onClick={() => router.push("/wardrobe")}
            className="flex items-center gap-2 min-h-12 text-sm font-medium text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden md:inline">Back</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="mb-4">
            <label className="text-xs font-medium text-slate-600 select-none">Photo</label>
            <div className="mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-slate-900 file:mr-4 file:py-2 file:px-4 file:rounded-2xl file:border-0 file:text-sm file:font-medium file:bg-slate-900 file:text-white hover:file:opacity-90 file:cursor-pointer"
              />
            </div>

            {preview ? (
              <div className="mt-3 aspect-square rounded-xl overflow-hidden bg-slate-100 max-w-sm">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            ) : null}
          </div>

          <div className="mb-4">
            <label className="text-xs font-medium text-slate-600 select-none">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Black blazer"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400 text-slate-900 touch-manipulation"
            />
          </div>

          <div className="space-y-4 mb-4">
            <ChipGroup
              label="Category"
              options={categories}
              value={category}
              onChange={(next) => {
                setCategory(next);
                setSubcategory(getDefaultSubcategory(next));
                if (next === "accessory") {
                  setSize("");
                }
              }}
            />

            {subcategoryOptions.length > 0 && (
              <ChipGroup
                label="Subcategory"
                options={subcategoryOptions}
                value={subcategory}
                onChange={(next) => setSubcategory(next as ClothingSubcategory)}
              />
            )}

            <ChipGroup
              label="Season"
              options={seasons}
              value={season}
              onChange={(next) => setSeason(next)}
            />

            <ChipGroup
              label="Style"
              options={styles}
              value={style}
              onChange={(next) => setStyle(next)}
            />
          </div>

          <div className="mb-4">
            <MultiChipGroup
              label="Colors"
              options={colorOptions}
              values={colors}
              onChange={(next) => setColors(next)}
            />
          </div>

          {sizeChipConfig && (
            <div className="mb-4">
              {sizeChipConfig.kind === "clothing" && (
                <div className="mb-3">
                  <ChipGroup
                    label="Maat type"
                    options={[
                      { value: "letters", label: "Letters" },
                      { value: "numbers", label: "Nummers" },
                    ]}
                    value={clothingSizeMode}
                    onChange={(next) => setClothingSizeMode(next)}
                  />
                </div>
              )}

              <ChipGroup
                label={sizeChipConfig.label}
                options={sizeOptions}
                value={size || undefined}
                onChange={(next) => setSize(next)}
              />
              <p className="text-xs text-slate-500 mt-1">{sizeChipConfig.hint}</p>
            </div>
          )}

          <div className="mb-4">
            <label className="text-xs font-medium text-slate-600 select-none">Brand</label>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Nike, Zara, H&M"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400 text-slate-900 touch-manipulation"
            />
          </div>

          {needsWashing && (
            <div className="mb-4">
              <label className="text-xs font-medium text-slate-600 select-none">Wash after wears</label>
              <input
                type="number"
                min="1"
                max="20"
                value={washAfterWears}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 1 && val <= 20) {
                    setWashAfterWears(val);
                  }
                }}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 touch-manipulation"
              />
              <p className="text-xs text-slate-500 mt-1">How many times can you wear this before washing?</p>
            </div>
          )}

          {error ? <p className="text-sm text-red-600 mb-3">{error}</p> : null}

          <button
            onClick={onSave}
            disabled={!canSave}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-3 text-sm font-medium shadow-sm hover:opacity-90 transition disabled:opacity-40"
          >
            {saving ? (
              "Saving..."
            ) : (
              <>
                <Plus className="h-5 w-5" />
                Save item
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}