// ============================================
// FILE: frontend/src/shared/components/ui/DatePicker.tsx
// Modern, consistent date picker component
// ============================================
import { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface DatePickerProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          type="date"
          className={clsx(
            'w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0',
            'border-slate-300 bg-white text-slate-900 focus:border-slate-400 focus:ring-slate-400/30',
            error && 'border-red-300 focus:border-red-400 focus:ring-red-400/30',
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

DatePicker.displayName = 'DatePicker';