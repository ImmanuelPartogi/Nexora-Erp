// ============================================
// FILE: web-app/src/shared/components/PageHeader.tsx
// Sticky top header with title + optional action slot.
// ============================================
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { ChevronLeftIcon } from './Icons';
import { useNavigate } from 'react-router-dom';

export function PageHeader({
  title,
  subtitle,
  action,
  showBack = false,
  onBack,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  className?: string;
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <header
      className={clsx(
        'sticky top-0 z-20 border-b border-gray-100 bg-white/90 backdrop-blur pt-safe',
        className
      )}
    >
      <div className="flex min-h-[56px] items-center gap-3 px-4">
        {showBack && (
          <button
            type="button"
            onClick={handleBack}
            aria-label="Kembali"
            className="tap-target -ml-2 flex items-center justify-center rounded-full text-gray-600 active:bg-gray-100"
          >
            <ChevronLeftIcon size={24} />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold leading-tight text-gray-900">
            {title}
          </h1>
          {subtitle && (
            <p className="truncate text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}