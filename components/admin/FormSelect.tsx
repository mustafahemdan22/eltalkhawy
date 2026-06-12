'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface FormSelectOption {
  value: string;
  label: string;
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options:     FormSelectOption[];
  invalid?:    boolean;
  placeholder?:string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(function FormSelect(
  { className, invalid, options, placeholder, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'h-11 w-full appearance-none rounded-button bg-[var(--bg-surface-raised)] border px-3.5 pe-10 text-sm',
          'text-[var(--text-primary)]',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[var(--gold)]/40',
          invalid
            ? 'border-red-500/60'
            : 'border-[var(--border-default)] hover:border-[var(--border-hover)]',
          className,
        )}
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
      <ChevronDown
        className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]"
        aria-hidden
      />
    </div>
  );
});
