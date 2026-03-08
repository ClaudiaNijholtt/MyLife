"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  type ClothingCategory, 
  type ClothingSeason, 
  type ClothingSubcategory,
  type TopSubcategory,
  type BottomSubcategory,
  type OuterwearSubcategory,
  type ShoesSubcategory,
  type JewelrySubcategory,
  type AccessorySubcategory,
  type FullBodySubcategory,
} from "@/lib/types/wardrobe";
import { compressForWardrobe } from "@/lib/image";
import { fetchClothingItem, updateClothingItem } from "@/lib/cloud/wardrobe";
import { getWardrobePhotoSignedUrl, uploadWardrobePhoto, deleteWardrobePhoto } from "@/lib/cloud/storage";
import { useAuth } from "@/lib/auth/context";
import { PageLoader } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/form";
import { ChipGroup, MultiChipGroup } from "@/components/ui/chips";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft, Save } from "lucide-react";

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
  { value: "bodysuit", label: "Bodysuit" },
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

const seasons: { value: ClothingSeason; label: string }[] = [
  { value: "summer", label: "Summer" },
  { value: "winter", label: "Winter" },
  { value: "all", label: "All year" },
];

const baseColorOptions: Array<{ value: string; label: string }> = [
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

function parseList(s: string) {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

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

export default function EditWardrobeItemPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const { showToast } = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [originalPhotoPath, setOriginalPhotoPath] = useState<string>("");

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [size, setSize] = useState("");
  const [clothingSizeMode, setClothingSizeMode] = useState<"letters" | "numbers">("letters");
  const [step, setStep] = useState<1 | 2>(1);
  const [showExtraDetails, setShowExtraDetails] = useState(false);
  const [category, setCategory] = useState<ClothingCategory>("top");
  const [subcategory, setSubcategory] = useState<ClothingSubcategory | undefined>(undefined);
  const [season, setSeason] = useState<ClothingSeason>("all");
  const [washAfterWears, setWashAfterWears] = useState(3);
  const [colors, setColors] = useState<string[]>([]);
  const [preview, setPreview] = useState<string>("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const found = await fetchClothingItem(id);
        
        setName(found.name);
        setBrand(found.brand || "");
        setSize(found.size || "");
        if (found.category !== "shoes" && found.category !== "jewelry" && found.category !== "accessory") {
          const normalizedSize = (found.size || "").trim();
          if (["32", "34", "36", "38", "40", "42", "44", "46", "48"].includes(normalizedSize)) {
            setClothingSizeMode("numbers");
          } else {
            setClothingSizeMode("letters");
          }
        }
        setCategory(found.category as ClothingCategory);
        setSubcategory(found.subcategory as ClothingSubcategory | undefined);
        setSeason(found.season as ClothingSeason);
        setWashAfterWears(found.wash_after_wears);
        setColors(found.colors);
        setOriginalPhotoPath(found.photo_path);
        
        // Get signed URL for preview
        if (found.photo_path) {
          const photoUrl = await getWardrobePhotoSignedUrl(found.photo_path, 3600);
          setPreview(photoUrl);
        }
      } catch (error) {
        console.error("Error loading item:", error);
        showToast("Failed to load item", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, showToast]);

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

  const colorOptions = useMemo(() => {
    const extra = colors
      .filter((value) => !baseColorOptions.some((option) => option.value === value))
      .map((value) => ({ value, label: value.charAt(0).toUpperCase() + value.slice(1) }));

    return [...baseColorOptions, ...extra];
  }, [colors]);

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
    return name.trim().length > 0 && !saving;
  }, [name, saving]);

  const canContinueBasics = useMemo(() => {
    return name.trim().length > 0;
  }, [name]);

  async function onPickFile(f: File | null) {
    setNewFile(null);
    if (!f) return;

    try {
      const { file: compressed, previewUrl } = await compressForWardrobe(f);
      setNewFile(compressed);
      setPreview(previewUrl);
    } catch (error) {
      console.error("Error compressing file:", error);
      showToast("Failed to process image", "error");
    }
  }

  async function onSave() {
    if (!canSave) return;
    setSaving(true);

    try {
      if (!user) throw new Error("Not authenticated");

      let photo_path = originalPhotoPath;

      // Upload new photo if changed
      if (newFile) {
        // Delete old photo first
        if (originalPhotoPath) {
          await deleteWardrobePhoto(originalPhotoPath);
        }
        // Upload new photo
        photo_path = await uploadWardrobePhoto({
          userId: user.id,
          itemId: id,
          file: newFile,
        });
      }

      // Determine wash_after_wears based on category
      let effectiveWashCycle = washAfterWears;
      if (category === "shoes" || category === "jewelry" || category === "accessory") {
        effectiveWashCycle = 999;
      }

      await updateClothingItem(id, {
        name: name.trim(),
        brand: brand.trim() || null,
        size: category === "accessory" ? null : (size.trim() || null),
        photo_path,
        category,
        subcategory: subcategory || null,
        season,
        colors,
        wash_after_wears: effectiveWashCycle,
      });

      showToast("Item updated successfully", "success");
      router.push(`/wardrobe/${id}`);
    } catch (error) {
      console.error("Error updating item:", error);
      showToast("Failed to update item", "error");
      setSaving(false);
    }
  }

  if (loading) {
    return <PageLoader />;
  }

  if (!name && !loading) {
    return (
      <main className="min-h-screen p-6">
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
    <main className="min-h-screen">
      <div className="mx-auto max-w-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Edit item</h1>
          <button 
            onClick={() => router.push(`/wardrobe/${id}`)} 
            className="flex items-center gap-2 min-h-12 text-sm font-medium text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden md:inline">Cancel</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <p className="text-xs font-medium text-slate-500 mb-4">Stap {step} van 2</p>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2 select-none">Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  className="touch-manipulation block w-full text-sm text-slate-900 file:mr-4 file:py-2 file:px-4 file:rounded-2xl file:border-0 file:text-sm file:font-medium file:bg-slate-900 file:text-white hover:file:opacity-90 file:cursor-pointer"
                  onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                />

                {preview && (
                  <div className="mt-3 aspect-square rounded-xl overflow-hidden bg-slate-100 max-w-xs">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <Input
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Black leather jacket"
                required
              />

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

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!canContinueBasics}
                className="w-full rounded-2xl bg-slate-900 text-white px-4 py-3 text-sm font-medium shadow-sm hover:opacity-90 transition disabled:opacity-40"
              >
                Volgende
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {sizeChipConfig && (
                <div>
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

              <ChipGroup
                label="Season"
                options={seasons}
                value={season}
                onChange={(next) => setSeason(next)}
              />

              <MultiChipGroup
                label="Colors"
                options={colorOptions}
                values={colors}
                onChange={(next) => setColors(next)}
              />

              <div>
                <button
                  type="button"
                  onClick={() => setShowExtraDetails((prev) => !prev)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  {showExtraDetails ? "Verberg extra details" : "Toon extra details"}
                </button>
              </div>

              {showExtraDetails && (
                <div className="space-y-4">
                  <Input
                    label="Brand (optional)"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Nike, Zara, H&M"
                  />

                  {category !== "shoes" && category !== "jewelry" && category !== "accessory" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 select-none">
                        Wash after wears
                      </label>
                      <input
                        type="number"
                        className="touch-manipulation w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base md:text-sm outline-none focus:ring-2 focus:ring-black text-black"
                        min="1"
                        max="20"
                        value={washAfterWears}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val >= 1 && val <= 20) {
                            setWashAfterWears(val);
                          }
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        How many times can you wear this before washing?
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white text-slate-700 px-4 py-3 text-sm font-medium shadow-sm hover:bg-slate-50 transition"
                >
                  Terug
                </button>

                <Button
                  variant="primary"
                  onClick={onSave}
                  disabled={!canSave}
                  loading={saving}
                  className="flex-1"
                >
                  Save changes
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}