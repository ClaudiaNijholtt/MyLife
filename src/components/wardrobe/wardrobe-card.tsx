import Link from "next/link";
import type { CloudClothingItem } from "@/lib/cloud/wardrobe";

interface WardrobeCardProps {
  item: CloudClothingItem & { photoUrl: string | null };
  showLaundryState?: boolean;
}

export function WardrobeCard({ item, showLaundryState = true }: WardrobeCardProps) {
  return (
    <Link
      href={`/wardrobe/${item.id}`}
      className="bg-white rounded-2xl shadow-sm p-3 block hover:shadow-md transition"
    >
      <div className="aspect-square rounded-xl overflow-hidden bg-gray-200 mb-2 relative">
        {item.photoUrl ? (
          <img
            src={item.photoUrl}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover absolute inset-0"
            style={{ backgroundColor: '#e5e7eb' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>
      
      <p className="text-sm font-medium truncate text-black">{item.name}</p>
      <p className="text-xs text-gray-500">
        {item.category} • {item.season}
      </p>
      
      {showLaundryState && (
        <div className="mt-1">
          <span className="inline-block text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
            {item.laundry_state ?? "clean"}
          </span>
        </div>
      )}
    </Link>
  );
}

export function WardrobeGrid({ 
  items 
}: { 
  items: (CloudClothingItem & { photoUrl: string | null })[] 
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <WardrobeCard key={item.id} item={item} />
      ))}
    </div>
  );
}
