// ============================================
// FILE: web-app/src/shared/components/ui/EmptyState.tsx
// Friendly empty / error / "no data" state for lists & pages.
// ============================================
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      {icon && <div className="text-gray-300">{icon}</div>}
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Reusable error variant of EmptyState. */
export function ErrorState({
  title = 'Terjadi kesalahan',
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={
        onRetry ? (
          <button
            onClick={onRetry}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Coba lagi
          </button>
        ) : undefined
      }
    />
  );
}