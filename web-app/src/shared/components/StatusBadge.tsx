// ============================================
// FILE: web-app/src/shared/components/StatusBadge.tsx
// Generic colored status pill.
// ============================================
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { type Tone } from '../constants/statusTone';

const TONES: Record<Tone, string> = {
  gray: 'bg-gray-100 text-gray-600',
  green: 'bg-emerald-100 text-emerald-700',
  red: 'bg-red-100 text-red-700',
  amber: 'bg-amber-100 text-amber-700',
  blue: 'bg-blue-100 text-blue-700',
  brand: 'bg-brand-50 text-brand-700',
};

export function StatusBadge({
  tone = 'gray',
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}