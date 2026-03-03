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
import { createClient } from "@/lib/supabase/client";
import { PageLoader } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

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

export default function EditWardrobeItemPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const { showToast } = useToast();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [originalPhotoPath, setOriginalPhotoPath] = useState<string>("");

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState<ClothingCategory>("top");
  const [subcategory, setSubcategory] = useState<ClothingSubcategory | undefined>(undefined);
  const [season, setSeason] = useState<ClothingSeason>("all");
  const [washAfterWears, setWashAfterWears] = useState(3);
  const [colorsRaw, setColorsRaw] = useState("");
  const [occasionsRaw, setOccasionsRaw] = useState("");
  const [preview, setPreview] = useState<string>("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const found = await fetchClothingItem(id);
        
        setName(found.name);
        setBrand(found.brand || "");
        setCategory(found.category as ClothingCategory);
        setSubcategory(found.subcategory as ClothingSubcategory | undefined);
        setSeason(found.season as ClothingSeason);
        setWashAfterWears(found.wash_after_wears);
        setColorsRaw(found.colors.join(", "));
        setOccasionsRaw(found.occasions.join(", "));
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

  const canSave = useMemo(() => {
    return name.trim().length > 0 && !saving;
  }, [name, saving]);

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
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
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
        photo_path,
        category,
        subcategory: subcategory || null,
        season,
        colors: parseList(colorsRaw),
        occasions: parseList(occasionsRaw),
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
          <h1 className="text-3xl font-bold text-black">Edit item</h1>
          <button 
            onClick={() => router.push(`/wardrobe/${id}`)} 
            className="text-sm font-medium underline text-black hover:text-gray-600"
          >
            Cancel
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
            />

            {preview && (
              <div className="mt-3 aspect-square rounded-xl overflow-hidden bg-gray-200 max-w-xs">
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

          <Input
            label="Brand (optional)"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g. Nike, Zara, H&M"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Category"
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
                else setSubcategory(undefined);
              }}
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>

            {subcategoryOptions.length > 0 && (
              <Select
                label="Subcategory"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value as ClothingSubcategory)}
              >
                {subcategoryOptions.map((sc) => (
                  <option key={sc.value} value={sc.value}>
                    {sc.label}
                  </option>
                ))}
              </Select>
            )}
          </div>

          <Select
            label="Season"
            value={season}
            onChange={(e) => setSeason(e.target.value as ClothingSeason)}
          >
            {seasons.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>

          <Input
            label="Colors (comma separated)"
            value={colorsRaw}
            onChange={(e) => setColorsRaw(e.target.value)}
            placeholder="black, white, red"
          />

          <Input
            label="Occasions (comma separated)"
            value={occasionsRaw}
            onChange={(e) => setOccasionsRaw(e.target.value)}
            placeholder="casual, work, party"
          />

          {category !== "shoes" && category !== "jewelry" && category !== "accessory" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wash after wears
              </label>
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
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black text-black"
              />
              <p className="text-xs text-gray-500 mt-1">
                How many times can you wear this before washing?
              </p>
            </div>
          )}

          <Button
            variant="primary"
            onClick={onSave}
            disabled={!canSave}
            loading={saving}
            className="w-full"
          >
            Save changes
          </Button>
        </div>
      </div>
    </main>
  );
}