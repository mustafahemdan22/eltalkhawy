'use client';

import { cn } from '@/lib/utils';

interface FormFieldProps {
  label:        string;
  htmlFor?:     string;
  required?:    boolean;
  help?:        string;
  error?:       string;
  children:     React.ReactNode;
  className?:   string;
}

export function FormField({ label, htmlFor, required, help, error, children, className }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="text-2xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
      >
        {label}
        {required && <span className="text-red-500 ms-0.5" aria-hidden>*</span>}
      </label>
      {children}
      {help && !error && (
        <p className="text-2xs text-[var(--text-secondary)] leading-relaxed">{help}</p>
      )}
      {error && (
        <p role="alert" className="text-2xs font-semibold text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
