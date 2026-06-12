'use client';

import { useLocale } from '@/components/LocaleProvider';
import { cn } from '@/lib/utils';
import { Check, Circle, X } from 'lucide-react';

export type OrderStatusTimelineEntry = {
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  at: number;
};

const ORDER: OrderStatusTimelineEntry['status'][] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
];

interface OrderStatusTimelineProps {
  current: OrderStatusTimelineEntry['status'];
  history?: OrderStatusTimelineEntry[];
}

export default function OrderStatusTimeline({ current, history = [] }: OrderStatusTimelineProps) {
  const { locale, dict } = useLocale();

  const isCancelled = current === 'cancelled';
  const currentIndex = ORDER.indexOf(current);
  const display = isCancelled ? ORDER : ORDER.slice(0, Math.max(currentIndex + 1, 1));

  const historyMap = new Map<OrderStatusTimelineEntry['status'], number>();
  for (const h of history) historyMap.set(h.status, h.at);

  const createdAt = history[0]?.at;

  return (
    <div className="w-full">
      {isCancelled && (
        <div className="mb-4 flex items-center gap-2 rounded-button border border-[var(--error)]/40 bg-[var(--error)]/10 px-3 py-2 text-sm text-[var(--error)]">
          <X className="h-4 w-4" aria-hidden />
          <span className="font-semibold">
            {locale === 'ar' ? 'تم إلغاء هذا الطلب' : 'This order was cancelled'}
          </span>
        </div>
      )}

      <ol className="relative flex flex-col gap-0" aria-label="Order progress">
        {createdAt && (
          <li className="flex items-baseline gap-3 pb-4 text-xs text-[var(--text-secondary)]">
            <span className="font-mono">{formatDateTime(createdAt, locale)}</span>
            <span>
              {locale === 'ar' ? 'تم إنشاء الطلب' : 'Order placed'}
            </span>
          </li>
        )}

        {display.map((status, idx) => {
          const reached = currentIndex >= idx && !isCancelled;
          const at = historyMap.get(status);
          const isLast = idx === display.length - 1;
          return (
            <li key={status} className="relative flex gap-3 pb-5 last:pb-0">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 shrink-0',
                    reached
                      ? 'border-[var(--gold)] bg-[var(--gold)]/15 text-[var(--gold)]'
                      : 'border-[var(--border-default)] bg-[var(--bg-surface-raised)] text-[var(--text-secondary)]',
                  )}
                  aria-hidden
                >
                  {reached ? <Check className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      'flex-1 w-0.5 my-1',
                      reached && currentIndex > idx
                        ? 'bg-[var(--gold)]'
                        : 'bg-[var(--border-subtle)]',
                    )}
                  />
                )}
              </div>
              <div className="pt-1 min-w-0 flex-1">
                <p
                  className={cn(
                    'text-sm font-semibold',
                    reached ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]',
                  )}
                >
                  {dict.admin.orders.status[status]}
                </p>
                {at && (
                  <p className="text-2xs text-[var(--text-secondary)] font-mono mt-0.5">
                    {formatDateTime(at, locale)}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function formatDateTime(ts: number, locale: string): string {
  const d = new Date(ts);
  return d.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
