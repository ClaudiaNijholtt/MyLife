"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function Navigation() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  if (loading) {
    return (
      <nav className="bg-white border-b">
        <div className="max-w-5xl mx-auto p-4">
          <div className="h-8"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b">
      <div className="max-w-5xl mx-auto p-4 flex gap-4 items-center justify-between">
        {user ? (
          <>
            <div className="flex gap-4">
              <a href="/" className="font-medium text-black">Dashboard</a>
              <a href="/wardrobe" className="font-medium text-black">Wardrobe</a>
            </div>
            <form action="/logout" method="POST">
              <button type="submit" className="text-sm font-medium text-gray-600 hover:text-black">
                Log out
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="flex gap-4">
              <a href="/" className="font-semibold text-lg text-black">My Life</a>
            </div>
            <div className="flex gap-3">
              <a href="/login" className="text-sm font-medium text-gray-600 hover:text-black">
                Sign in
              </a>
              <a href="/login" className="text-sm font-medium bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition">
                Get started
              </a>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
