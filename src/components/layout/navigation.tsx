"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { LayoutDashboard, Shirt, LogOut } from "lucide-react";

export function Navigation() {
  const { user, loading, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  async function onLogout() {
    if (!window.confirm("Weet je zeker dat je wilt uitloggen?")) return;
    await signOut();
    router.push("/");
    router.refresh();
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading) {
    return (
      <>
        <nav className="hidden md:block bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="h-8"></div>
          </div>
        </nav>

        {mounted && createPortal(
          <nav
            className="mobile-bottom-nav md:hidden bg-white border-t border-slate-200 fixed inset-x-0 bottom-0 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
          >
            <div className="max-w-5xl mx-auto px-4 py-3">
              <div className="h-16" />
            </div>
          </nav>,
          document.body
        )}
      </>
    );
  }

  if (!user) {
    return (
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="flex gap-4 items-center justify-between py-4">
            <div className="flex gap-4">
              <Link href="/" className="text-lg font-semibold text-slate-900">My Life</Link>
            </div>
            <div className="flex gap-3">
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">
                Sign in
              </Link>
              <Link href="/login" className="text-sm font-medium bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition">
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="hidden md:block bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="flex gap-4 items-center justify-between py-4">
            <div className="flex gap-6">
              <Link href="/" className="flex items-center gap-2 min-h-12 text-sm font-medium text-slate-900 hover:text-slate-600 transition">
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Link href="/wardrobe" className="flex items-center gap-2 min-h-12 text-sm font-medium text-slate-900 hover:text-slate-600 transition">
                <Shirt className="h-5 w-5" />
                <span>Wardrobe</span>
              </Link>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-2 min-h-12 text-sm font-medium text-slate-500 hover:text-slate-900 transition"
            >
              <LogOut className="h-5 w-5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </nav>

      {mounted && createPortal(
        <nav
          className="mobile-bottom-nav md:hidden bg-white border-t border-slate-200 fixed inset-x-0 bottom-0 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
        >
          <div className="max-w-5xl mx-auto px-4 py-3">
            <div className="flex items-center justify-around">
              <Link href="/" className="flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-16 text-xs font-medium text-slate-900 hover:text-slate-600 transition">
                <LayoutDashboard className="h-6 w-6" />
                <span>Dashboard</span>
              </Link>
              <Link href="/wardrobe" className="flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-16 text-xs font-medium text-slate-900 hover:text-slate-600 transition">
                <Shirt className="h-6 w-6" />
                <span>Wardrobe</span>
              </Link>
              <button
                type="button"
                onClick={onLogout}
                className="flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-16 text-xs font-medium text-slate-500 hover:text-slate-900 transition"
              >
                <LogOut className="h-6 w-6" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </nav>,
        document.body
      )}
    </>
  );
}
