// ============================================
// FILE: frontend/src/shared/components/ui/EmptyState.tsx
// Modern empty state component
// ============================================
import { ReactNode } from 'react';
import { Button } from './Button';
import clsx from 'clsx';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState = ({ 
  title, 
  description, 
  icon, 
  action, 
  className 
}: EmptyStateProps) => {
  return (
    <div className={clsx(
      'text-center py-12 px-4',
      className
    )}>
      <div className="flex justify-center mb-4">
        {icon || (
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-4h-2v4m0 0h-2m-4-4v4m-2-4v.01" />
            </svg>
          </div>
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      
      {description && (
        <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">{description}</p>
      )}
      
      {action && (
        <Button
          onClick={action.onClick}
          variant="primary"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};