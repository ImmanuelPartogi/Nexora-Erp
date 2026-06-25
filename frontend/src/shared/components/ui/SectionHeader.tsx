// ============================================
// FILE: frontend/src/shared/components/ui/SectionHeader.tsx
// Modern section header component
// ============================================
import { ReactNode } from 'react';
import clsx from 'clsx';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export const SectionHeader = ({ 
  title, 
  subtitle, 
  action, 
  className 
}: SectionHeaderProps) => {
  return (
    <div className={clsx('flex items-center justify-between gap-4 mb-6', className)}>
      <div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        {subtitle && (
          <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-3">
          {action}
        </div>
      )}
    </div>
  );
};