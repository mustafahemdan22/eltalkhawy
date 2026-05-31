import { cn } from '@/lib/utils';

type BadgeVariant =
  | 'fresh'
  | 'frozen'
  | 'discount'
  | 'gold'
  | 'new'
  | 'bestseller'
  | 'premium'
  | 'out-of-stock'
  | 'in-stock'
  | 'low-stock'
  | 'default';

interface BadgeProps {
  variant?:  BadgeVariant;
  children:  React.ReactNode;
  className?: string;
  size?:     'sm' | 'md';
}

const variantStyles: Record<BadgeVariant, string> = {
  fresh:
    'bg-[var(--fresh-bg)] text-[var(--fresh)] border border-[var(--fresh-border)]',
  frozen:
    'bg-[var(--frozen-bg)] text-[var(--frozen)] border border-[var(--frozen-border)]',
  discount:
    'bg-[var(--badge-discount-bg)] text-[var(--badge-discount-fg)] border-none',
  gold:
    'bg-[var(--badge-gold-bg)] text-[var(--badge-gold-fg)] border-none',
  new:
    'bg-surface-raised/50 text-primary border border-muted',
  bestseller:
    'bg-[var(--badge-bestseller-bg)] text-[var(--badge-bestseller-fg)] font-semibold border-none',
  premium:
    'border border-[var(--badge-premium-border)] text-[var(--badge-premium-fg)] bg-[var(--badge-premium-bg)]',
  'out-of-stock':
    'bg-surface-raised/50 text-secondary border border-muted',
  'in-stock':
    'bg-[var(--stock-in-bg)] text-[var(--stock-in)] border border-[var(--fresh-border)]',
  'low-stock':
    'bg-[var(--stock-low-bg)] text-[var(--stock-low)] border border-[var(--warning-border)]',
  default:
    'bg-surface-raised text-muted border border-muted',
};

const sizeStyles = {
  sm: 'px-2 py-1 text-xs tracking-wide',
  md: 'px-2.5 py-1 text-sm tracking-wide',
};

export function Badge({
  variant  = 'default',
  children,
  className,
  size     = 'md',
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-badge uppercase leading-none whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
