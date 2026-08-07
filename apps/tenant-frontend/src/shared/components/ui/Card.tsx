// ============================================
// FILE: frontend/src/shared/components/ui/Card.tsx
// Modern, consistent card component
// ============================================
import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'outlined';
  hoverable?: boolean;
}

export const Card = ({ 
  children, 
  className, 
  padding = 'md',
  variant = 'default',
  hoverable = false
}: CardProps) => {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const variants = {
    default: 'bg-white border border-slate-200 shadow-sm',
    elevated: 'bg-white border border-slate-200 shadow-md',
    outlined: 'bg-white border-2 border-slate-300 shadow-sm',
  };

  return (
    <div className={clsx(
      'rounded-xl transition-all duration-200',
      variants[variant],
      hoverable && 'hover:shadow-lg hover:-translate-y-0.5',
      paddings[padding],
      className
    )}>
      {children}
    </div>
  );
};