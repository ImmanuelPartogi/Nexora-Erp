// ============================================
// FILE: web-app/src/shared/components/EmptyState.tsx
// Reusable empty / error state with optional retry action.
// ============================================
import { AlertIcon, RefreshIcon } from './Icons';

export function EmptyState({
  title = 'Tidak ada data',
  description,
  icon,
  error = false,
  onRetry,
}: {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  error?: boolean;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full ${
          error ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-400'
        }`}
      >
        {icon ?? <AlertIcon size={26} />}
      </div>
      <div>
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="tap-target mt-1 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white active:bg-brand-700"
        >
          <RefreshIcon size={16} />
          Coba lagi
        </button>
      )}
    </div>
  );
}