// ============================================
// FILE: frontend/src/shared/components/Checkbox.tsx
// Reusable Checkbox component
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
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            className={`
              w-4 h-4 text-blue-600 bg-white border-gray-300 rounded
              focus:ring-2 focus:ring-blue-500 focus:ring-offset-0
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {label && (
          <div className="ml-3 text-sm">
            <label className="font-medium text-gray-700">{label}</label>
            {helperText && (
              <p className="text-gray-500 mt-1">{helperText}</p>
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