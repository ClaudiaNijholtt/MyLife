import Link from "next/link";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: string;
}

export function EmptyState({
  title = "No items yet",
  description = "Get started by adding your first item.",
  actionLabel,
  actionHref,
  icon = "📦",
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="font-medium mb-1 text-black">{title}</p>
      <p className="text-sm text-gray-500">{description}</p>
      
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-block mt-4 bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
