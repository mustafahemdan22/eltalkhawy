'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(function FormInput(
  { className, invalid, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-button bg-[var(--bg-surface-raised)] border px-3.5 text-sm',
        'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
        'transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[var(--gold)]/40',
        invalid
          ? 'border-red-500/60'
          : 'border-[var(--border-default)] hover:border-[var(--border-hover)]',
        className,
      )}
      {...props}
    />
  );
});
