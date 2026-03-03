interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | unknown;
  onRetry?: () => void;
  showBackButton?: boolean;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  error,
  onRetry,
  showBackButton = false,
}: ErrorStateProps) {
  const errorMessage = message || (error instanceof Error ? error.message : "An unexpected error occurred");

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
      <div className="text-4xl mb-3">⚠️</div>
      <h3 className="text-lg font-semibold text-black mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{errorMessage}</p>
      
      <div className="flex gap-3 justify-center">
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition"
          >
            Try again
          </button>
        )}
        
        {showBackButton && (
          <button
            onClick={() => window.history.back()}
            className="bg-white border border-gray-200 text-black px-4 py-2 rounded-full hover:bg-gray-50 transition"
          >
            Go back
          </button>
        )}
      </div>
    </div>
  );
}

export function PageError(props: ErrorStateProps) {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <ErrorState {...props} showBackButton />
      </div>
    </main>
  );
}
