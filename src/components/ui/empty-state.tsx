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
      <p className="text-lg font-semibold text-slate-900 mb-1">{title}</p>
      <p className="text-sm text-slate-500">{description}</p>
      
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-block mt-4 rounded-2xl bg-slate-900 text-white px-4 py-3 text-sm font-medium shadow-sm hover:opacity-90 transition"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
