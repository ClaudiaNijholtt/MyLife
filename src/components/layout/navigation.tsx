"use client";

import { type FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { LayoutDashboard, Shirt, LogOut } from "lucide-react";

export function Navigation() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  function onLogoutSubmit(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm("Weet je zeker dat je wilt uitloggen?")) {
      event.preventDefault();
    }
  }

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
      <nav className="bg-white border-b border-slate-200 md:border-b md:border-t-0 border-t fixed bottom-0 md:static w-full z-50">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="h-8"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-t md:border-t-0 md:border-b border-slate-200 fixed bottom-0 md:static w-full z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:shadow-none">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        {user ? (
          <>
            {/* Mobile bottom navigation */}
            <div className="flex md:hidden items-center justify-around py-2">
              <a href="/" className="flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-16 text-xs font-medium text-slate-900 hover:text-slate-600 transition">
                <LayoutDashboard className="h-6 w-6" />
                <span>Dashboard</span>
              </a>
              <a href="/wardrobe" className="flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-16 text-xs font-medium text-slate-900 hover:text-slate-600 transition">
                <Shirt className="h-6 w-6" />
                <span>Wardrobe</span>
              </a>
              <form action="/logout" method="POST" className="flex" onSubmit={onLogoutSubmit}>
                <button type="submit" className="flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-16 text-xs font-medium text-slate-500 hover:text-slate-900 transition">
                  <LogOut className="h-6 w-6" />
                  <span>Log out</span>
                </button>
              </form>
            </div>
            
            {/* Desktop top navigation */}
            <div className="hidden md:flex gap-4 items-center justify-between py-4">
              <div className="flex gap-6">
                <a href="/" className="flex items-center gap-2 min-h-12 text-sm font-medium text-slate-900 hover:text-slate-600 transition">
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboard</span>
                </a>
                <a href="/wardrobe" className="flex items-center gap-2 min-h-12 text-sm font-medium text-slate-900 hover:text-slate-600 transition">
                  <Shirt className="h-5 w-5" />
                  <span>Wardrobe</span>
                </a>
              </div>
              <form action="/logout" method="POST" onSubmit={onLogoutSubmit}>
                <button type="submit" className="flex items-center gap-2 min-h-12 text-sm font-medium text-slate-500 hover:text-slate-900 transition">
                  <LogOut className="h-5 w-5" />
                  <span>Log out</span>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex gap-4 items-center justify-between py-4">
            <div className="flex gap-4">
              <a href="/" className="text-lg font-semibold text-slate-900">My Life</a>
            </div>
            <div className="flex gap-3">
              <a href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">
                Sign in
              </a>
              <a href="/login" className="text-sm font-medium bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition">
                Get started
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
