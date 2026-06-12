'use client';

import { cn } from '@/lib/utils';

interface FormToggleProps {
  checked:  boolean;
  onChange: (checked: boolean) => void;
  label?:   string;
  description?:string;
  disabled?:boolean;
  name?:    string;
  id?:      string;
}

export default function FormToggle({
  checked,
  onChange,
  label,
  description,
  disabled,
  name,
  id,
}: FormToggleProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'group flex items-center gap-3 cursor-pointer select-none',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        id={id}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-pill border transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]',
          checked
            ? 'bg-[var(--gold)] border-[var(--gold)]'
            : 'bg-[var(--bg-surface-raised)] border-[var(--border-default)]',
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
            checked ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </button>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        name={name}
        readOnly
      />
      {(label || description) && (
        <span className="min-w-0">
          {label && (
            <span className="block text-sm font-semibold text-[var(--text-primary)]">{label}</span>
          )}
          {description && (
            <span className="block text-2xs text-[var(--text-secondary)] mt-0.5">{description}</span>
          )}
        </span>
      )}
    </label>
  );
}
