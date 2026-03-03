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
      className="bg-white rounded-2xl shadow-sm p-5 block hover:shadow-md transition"
    >
      <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 mb-3 relative">
        {item.photoUrl ? (
          <img
            src={item.photoUrl}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover absolute inset-0"
            style={{ backgroundColor: '#f1f5f9' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
            No image
          </div>
        )}
      </div>
      
      <p className="text-sm font-medium truncate text-slate-900">{item.name}</p>
      <p className="text-xs text-slate-500">
        {item.category} • {item.season}
      </p>
      
      {showLaundryState && (
        <div className="mt-2">
          <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-2 py-1 text-xs font-medium">
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
