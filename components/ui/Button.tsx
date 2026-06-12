'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gold' | 'danger' | 'outline';
type ButtonSize    = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant;
  size?:     ButtonSize;
  loading?:  boolean;
  iconLeft?: React.ReactNode;
  iconRight?:React.ReactNode;
  fullWidth?:boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--brand)] text-[var(--brand-fg)] hover:bg-[var(--brand-hover)] active:bg-[var(--brand-active)] ' +
    'shadow-card hover:shadow-raised focus-visible:ring-[var(--brand)]/50',
  secondary:
    'bg-transparent border border-[var(--border-default)] text-[var(--text-primary)] ' +
    'hover:bg-[var(--bg-surface-raised)] hover:border-[var(--border-hover)] ' +
    'focus-visible:ring-[var(--border-default)]/50',
  ghost:
    'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] ' +
    'hover:text-[var(--text-primary)] focus-visible:ring-[var(--border-default)]/50',
  gold:
    'bg-[var(--gold)] text-[var(--gold-fg)] hover:bg-[var(--gold-hover)] active:bg-[var(--gold-active)] ' +
    'shadow-[var(--shadow-gold)] hover:shadow-[var(--shadow-gold-lg)] font-semibold ' +
    'focus-visible:ring-[var(--gold)]/50',
  danger:
    'bg-[var(--error)] text-[var(--brand-fg)] hover:bg-[var(--error)]/90 active:bg-[var(--error)]/80 ' +
    'focus-visible:ring-[var(--error)]/50',
  outline:
    'bg-transparent border border-[var(--gold-border)] text-[var(--gold)] ' +
    'hover:border-[var(--gold-hover)] hover:bg-[var(--gold-subtle)] ' +
    'focus-visible:ring-[var(--gold)]/50',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'h-8 px-3 text-xs gap-2 rounded-md',
  sm: 'h-11 px-4 text-sm gap-2 rounded-button',
  md: 'h-11 px-6 text-sm gap-2.5 rounded-button',
  lg: 'h-12 px-7 text-base gap-3 rounded-button',
  xl: 'h-14 px-9 text-base gap-3 rounded-card',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant   = 'primary',
    size      = 'md',
    loading   = false,
    iconLeft,
    iconRight,
    fullWidth = false,
    className,
    children,
    disabled,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium',
        'transition-all duration-250 ease-premium',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        'select-none whitespace-nowrap shine btn-press',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        variant === 'gold' && 'badge-shimmer',
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      ) : iconLeft ? (
        <span className="shrink-0" aria-hidden="true">{iconLeft}</span>
      ) : null}
      {children && <span className="truncate">{children}</span>}
      {!loading && iconRight && (
        <span className="shrink-0" aria-hidden="true">{iconRight}</span>
      )}
    </button>
  );
});
