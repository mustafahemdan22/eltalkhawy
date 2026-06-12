'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(function FormTextarea(
  { className, invalid, rows = 4, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'w-full rounded-button bg-[var(--bg-surface-raised)] border px-3.5 py-2.5 text-sm',
        'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
        'transition-colors duration-200 resize-y',
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
