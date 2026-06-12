'use client';

import { useLocale } from '@/components/LocaleProvider';
import { cn } from '@/lib/utils';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const STYLES: Record<OrderStatus, { dot: string; bg: string; text: string; ring: string }> = {
  pending:    { dot: 'bg-amber-500',   bg: 'bg-amber-500/10',   text: 'text-amber-600 dark:text-amber-400',   ring: 'ring-amber-500/30' },
  confirmed:  { dot: 'bg-blue-500',    bg: 'bg-blue-500/10',    text: 'text-blue-600 dark:text-blue-400',     ring: 'ring-blue-500/30' },
  processing: { dot: 'bg-indigo-500',  bg: 'bg-indigo-500/10',  text: 'text-indigo-600 dark:text-indigo-400', ring: 'ring-indigo-500/30' },
  shipped:    { dot: 'bg-purple-500',  bg: 'bg-purple-500/10',  text: 'text-purple-600 dark:text-purple-400', ring: 'ring-purple-500/30' },
  delivered:  { dot: 'bg-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-500/30' },
  cancelled:  { dot: 'bg-red-500',     bg: 'bg-red-500/10',     text: 'text-red-600 dark:text-red-400',       ring: 'ring-red-500/30' },
};

export default function OrderStatusBadge({
  status,
  size = 'md',
  className,
}: {
  status: OrderStatus;
  size?:  'sm' | 'md';
  className?: string;
}) {
  const { dict } = useLocale();
  const s = STYLES[status];
  const label = dict.admin.orders.status[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill ring-1 ring-inset font-semibold uppercase tracking-wider whitespace-nowrap',
        s.bg, s.text, s.ring,
        size === 'sm' ? 'px-2 py-0.5 text-2xs' : 'px-2.5 py-1 text-2xs',
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} aria-hidden />
      {label}
    </span>
  );
}
