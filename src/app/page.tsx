"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { Shirt, Sparkles, WashingMachine } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4 text-slate-900">
            Welcome to <span className="text-slate-600">My LifeOS</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Your personal wardrobe manager and daily outfit companion
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="mb-3 flex justify-center">
                <Shirt className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Smart Wardrobe</h3>
              <p className="text-sm text-slate-600">
                Organize your clothing items with photos, categories, and details
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="mb-3 flex justify-center">
                <Sparkles className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Outfit Ideas</h3>
              <p className="text-sm text-slate-600">
                Get personalized outfit suggestions based on weather and occasion
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="mb-3 flex justify-center">
                <WashingMachine className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Laundry Tracking</h3>
              <p className="text-sm text-slate-600">
                Keep track of what needs washing and maintain your clothes
              </p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="rounded-2xl bg-slate-900 text-white px-8 py-3 text-sm font-medium shadow-sm hover:opacity-90 transition"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="rounded-2xl bg-white border border-slate-200 text-slate-900 px-8 py-3 text-sm font-medium shadow-sm hover:bg-slate-50 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-3xl font-bold mb-6 text-slate-900">My Life Dashboard</h1>

        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <h2 className="text-lg font-semibold mb-2 text-slate-900">Welcome back! 👋</h2>
          <p className="text-sm text-slate-600">
            {user.email}
          </p>
        </div>

        {/* Weekly Plans Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <h2 className="text-lg font-semibold mb-2 text-slate-900">This Week</h2>
          <p className="text-sm text-slate-500">
            Your weekly planning will appear here.
          </p>
        </div>

        {/* Outfit Suggestion Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <h2 className="text-lg font-semibold mb-2 text-slate-900">Today&apos;s Outfit</h2>
          <p className="text-sm text-slate-500">
            Outfit suggestions will appear here.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link 
            href="/wardrobe"
            className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition block"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Wardrobe</h3>
            <p className="text-sm text-slate-500">View and manage your clothing items</p>
          </Link>
          
          <Link 
            href="/wardrobe/add"
            className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition block"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Add Item</h3>
            <p className="text-sm text-slate-500">Add a new clothing item to your wardrobe</p>
          </Link>
        </div>
      </div>
    </main>
  );
}