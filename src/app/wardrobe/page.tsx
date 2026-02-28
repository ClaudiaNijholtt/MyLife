"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { db, type ClothingItem } from "@/lib/db";

export default function WardrobePage() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function refresh() {
      const all = await db.clothingItems.orderBy("createdAt").reverse().toArray();
      setItems(all);
    }

    const creatingHandler = () => refresh();
    const updatingHandler = () => refresh();
    const deletingHandler = () => refresh();

    db.clothingItems.hook("creating").subscribe(creatingHandler);
    db.clothingItems.hook("updating").subscribe(updatingHandler);
    db.clothingItems.hook("deleting").subscribe(deletingHandler);

    refresh();

    return () => {
      db.clothingItems.hook("creating").unsubscribe(creatingHandler);
      db.clothingItems.hook("updating").unsubscribe(updatingHandler);
      db.clothingItems.hook("deleting").unsubscribe(deletingHandler);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items.filter((it) => {
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
  }, [items, query]);

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

        <div className="mb-5">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search (name, color, occasion...)"
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black placeholder:text-gray-700"
          />
        </div>

        {filtered.length === 0 ? (
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
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-200 mb-2">
                    <img
                    src={item.photoDataUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    />
                </div>
                <p className="text-sm font-medium truncate text-black">{item.name}</p>
                <p className="text-xs text-gray-500">
                    {item.category} • {item.season}
                </p>
                </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}