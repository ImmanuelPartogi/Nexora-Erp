// ============================================
// FILE: web-app/src/shared/components/LoadingSpinner.tsx
// ============================================
import clsx from 'clsx';

export function LoadingSpinner({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        'inline-block animate-spin rounded-full border-2 border-gray-300 border-t-brand-600',
        className
      )}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Memuat"
    />
  );
}

/** Full-screen centered spinner used during initial auth boot. */
export function FullScreenSpinner({ label = 'Memuat...' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <LoadingSpinner size={32} />
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

/** A shimmering skeleton block for list/card loading states. */
export function Skeleton({
  className,
  rounded = 'rounded-lg',
}: {
  className?: string;
  rounded?: string;
}) {
  return (
    <div className={clsx('animate-pulse bg-gray-200', rounded, className)} />
  );
}

/** Skeleton for a metric card. */
export function MetricCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="mt-3 h-7 w-24" />
    </div>
  );
}

/** Skeleton for a list item row. */
export function ListItemSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-4 w-1/4" />
    </div>
  );
}