// ============================================
// FILE: frontend/src/shared/components/ui/Badge.tsx
// Modern, consistent badge component
// ============================================
import clsx from 'clsx';

interface BadgeProps {
  children: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  className 
}: BadgeProps) => {
  const variants = {
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-sky-100 text-sky-800 border-sky-200',
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    primary: 'bg-slate-900 text-white border-slate-800',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span className={clsx(
      'inline-flex items-center gap-1 font-medium rounded-full border',
      variants[variant],
      sizes[size],
      className
    )}>
      {children}
    </span>
  );
};