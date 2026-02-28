export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-3xl font-bold mb-6 text-black">My Life</h1>

        {/* Weekly Plans Card */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <h2 className="font-semibold mb-2 text-black">This Week</h2>
          <p className="text-sm text-gray-500">
            Your weekly planning will appear here.
          </p>
        </div>

        {/* Outfit Suggestion Card */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <h2 className="font-semibold mb-2 text-black">Outfits</h2>
          <p className="text-sm text-gray-500">
            Outfit suggestions will appear here.
          </p>
        </div>
      </div>
    </main>
  );
}