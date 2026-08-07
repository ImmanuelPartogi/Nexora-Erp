// ============================================
// FILE: frontend/src/shared/components/ui/FormSection.tsx
// Modern form section with consistent styling
// ============================================
import { ReactNode } from 'react';
import { SectionHeader } from './SectionHeader';
import clsx from 'clsx';

interface FormSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'bordered';
}

export const FormSection = ({ 
  title, 
  subtitle, 
  children, 
  className, 
  variant = 'default'
}: FormSectionProps) => {
  return (
    <div className={clsx(
      'space-y-4',
      variant === 'bordered' && 'border border-slate-200 rounded-xl p-6 bg-white',
      className
    )}>
      <SectionHeader title={title} subtitle={subtitle} />
      <div className={clsx(
        'grid grid-cols-1 md:grid-cols-2 gap-4',
        variant === 'default' && 'p-6 bg-white rounded-xl border border-slate-200'
      )}>
        {children}
      </div>
    </div>
  );
};