// ============================================
// FILE: frontend/src/shared/components/ui/Checkbox.tsx
// Modern, consistent checkbox component
// ============================================
import { forwardRef, InputHTMLAttributes } from 'react';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="flex items-start gap-3">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            className={`
              w-4 h-4 text-slate-600 bg-white border-slate-300 rounded
              focus:ring-2 focus:ring-slate-400 focus:ring-offset-0
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-red-300 focus:ring-red-400' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {label && (
          <div className="text-sm">
            <label className="font-medium text-slate-700">{label}</label>
            {helperText && (
              <p className="text-slate-500 mt-1">{helperText}</p>
            )}
            {error && (
              <p className="text-red-600 mt-1">{error}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';