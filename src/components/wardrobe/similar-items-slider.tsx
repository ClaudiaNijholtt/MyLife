import Link from "next/link";
import type { CloudClothingItem } from "@/lib/cloud/wardrobe";

interface SimilarItemsSliderProps {
  items: (CloudClothingItem & { photoUrl: string | null })[];
  title?: string;
}

export function SimilarItemsSlider({ items, title = "Similar items" }: SimilarItemsSliderProps) {
  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h2 className="font-semibold mb-3 text-black">{title}</h2>
      <div className="overflow-x-auto scrollbar-hide -mx-5 px-5">
        <div className="flex gap-3 pb-2">
          {items.map((similar) => (
            <Link
              key={similar.id}
              href={`/wardrobe/${similar.id}`}
              className="flex-shrink-0 w-32 bg-gray-50 rounded-xl p-2 hover:bg-gray-100 transition"
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-200 mb-2">
                {similar.photoUrl ? (
                  <img
                    src={similar.photoUrl}
                    alt={similar.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    No image
                  </div>
                )}
              </div>
              <p className="text-xs font-medium truncate text-black">
                {similar.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {similar.category}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
