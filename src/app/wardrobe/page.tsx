export default function WardrobePage() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-3xl font-bold mb-6">My Wardrobe</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="bg-white rounded-2xl shadow-sm p-3"
            >
              <div className="aspect-square bg-gray-200 rounded-xl mb-2" />
              <p className="text-sm font-medium">Item {item}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}