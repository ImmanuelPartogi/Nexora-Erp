// ============================================
// FILE: web-app/src/shared/components/ui/Select.tsx
// Mobile-first select dropdown with label + error.
// Compatible with react-hook-form register().
// ============================================
import { forwardRef, type SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, hint, options, placeholder, className, id, ...props },
    ref
  ) => {
    const selectId = id ?? props.name;
    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={clsx(
            'tap-target w-full appearance-none rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-colors',
            'focus:ring-2 focus:ring-brand-100',
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
              : 'border-gray-200 focus:border-brand-500',
            className
          )}
          aria-invalid={Boolean(error)}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : hint ? (
          <p className="text-xs text-gray-400">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';