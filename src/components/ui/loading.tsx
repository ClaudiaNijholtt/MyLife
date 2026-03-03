export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-4 border-gray-200 border-t-black rounded-full animate-spin`}
      />
    </div>
  );
}

export function PageLoader() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-gray-500">Loading...</p>
      </div>
    </main>
  );
}

export function CardLoader() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <LoadingSpinner />
      <p className="text-sm text-gray-500 mt-3 text-center">Loading...</p>
    </div>
  );
}
