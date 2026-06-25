// ============================================
// FILE: web-app/src/shared/components/ui/Input.tsx
// Mobile-first text input with label + error message.
// Compatible with react-hook-form register().
// ============================================
import { forwardRef, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'tap-target w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-colors',
            'focus:ring-2 focus:ring-brand-100',
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
              : 'border-gray-200 focus:border-brand-500',
            className
          )}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : hint ? (
          <p className="text-xs text-gray-400">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';