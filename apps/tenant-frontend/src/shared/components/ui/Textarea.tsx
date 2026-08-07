// ============================================
// FILE: frontend/src/shared/components/ui/Textarea.tsx
// Modern, consistent textarea component
// ============================================
import { TextareaHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'ghost';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, variant = 'default', className, ...props }, ref) => {
    const baseStyles = 'w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 resize-vertical min-h-[80px]';

    const variants = {
      default: clsx(
        'border-slate-300 bg-white text-slate-900 focus:border-slate-400 focus:ring-slate-400/30',
        error && 'border-red-300 focus:border-red-400 focus:ring-red-400/30'
      ),
      ghost: clsx(
        'border-transparent bg-slate-50 text-slate-900 focus:border-slate-300 focus:ring-slate-300/30',
        error && 'bg-red-50 focus:border-red-300 focus:ring-red-300/30'
      ),
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={clsx(
            baseStyles,
            variants[variant],
            props.disabled && 'bg-slate-100 cursor-not-allowed opacity-50',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';