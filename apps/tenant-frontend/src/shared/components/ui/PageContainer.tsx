// ============================================
// FILE: frontend/src/shared/components/ui/PageContainer.tsx
// Modern page container with consistent spacing
// ============================================
import { ReactNode } from 'react';
import clsx from 'clsx';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const PageContainer = ({ 
  children, 
  className, 
  size = 'lg',
  padding = 'md'
}: PageContainerProps) => {
  const sizes = {
    sm: 'max-w-4xl',
    md: 'max-w-6xl',
    lg: 'max-w-7xl',
    xl: 'max-w-full',
  };

  const paddings = {
    none: '',
    sm: 'px-4 py-4',
    md: 'px-6 py-6',
    lg: 'px-8 py-8',
  };

  return (
    <div className={clsx(
      'w-full mx-auto',
      sizes[size],
      paddings[padding],
      className
    )}>
      {children}
    </div>
  );
};