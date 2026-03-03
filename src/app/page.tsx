import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4 text-black">
            Welcome to <span className="text-gray-600">My LifeOS</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your personal wardrobe manager and daily outfit companion
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="text-3xl mb-3">👔</div>
              <h3 className="font-semibold text-black mb-2">Smart Wardrobe</h3>
              <p className="text-sm text-gray-600">
                Organize your clothing items with photos, categories, and details
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="text-3xl mb-3">✨</div>
              <h3 className="font-semibold text-black mb-2">Outfit Ideas</h3>
              <p className="text-sm text-gray-600">
                Get personalized outfit suggestions based on weather and occasion
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="text-3xl mb-3">🧺</div>
              <h3 className="font-semibold text-black mb-2">Laundry Tracking</h3>
              <p className="text-sm text-gray-600">
                Keep track of what needs washing and maintain your clothes
              </p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="bg-black text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:scale-105 transition"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="bg-white text-black border-2 border-gray-200 px-8 py-3 rounded-full font-semibold hover:border-gray-300 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-3xl font-bold mb-6 text-black">My Life Dashboard</h1>

        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <h2 className="font-semibold mb-2 text-black">Welcome back! 👋</h2>
          <p className="text-sm text-gray-600">
            {user.email}
          </p>
        </div>

        {/* Weekly Plans Card */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <h2 className="font-semibold mb-2 text-black">This Week</h2>
          <p className="text-sm text-gray-500">
            Your weekly planning will appear here.
          </p>
        </div>

        {/* Outfit Suggestion Card */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <h2 className="font-semibold mb-2 text-black">Today's Outfit</h2>
          <p className="text-sm text-gray-500">
            Outfit suggestions will appear here.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link 
            href="/wardrobe"
            className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition block"
          >
            <h3 className="font-semibold text-black mb-1">Wardrobe</h3>
            <p className="text-sm text-gray-500">View and manage your clothing items</p>
          </Link>
          
          <Link 
            href="/wardrobe/add"
            className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition block"
          >
            <h3 className="font-semibold text-black mb-1">Add Item</h3>
            <p className="text-sm text-gray-500">Add a new clothing item to your wardrobe</p>
          </Link>
        </div>
      </div>
    </main>
  );
}