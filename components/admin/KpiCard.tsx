import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

type Variant = 'gold' | 'green' | 'red' | 'blue' | 'purple' | 'neutral';

const variantStyles: Record<Variant, { tile: string; icon: string; deltaUp: string; deltaDown: string }> = {
  gold: {
    tile:   'bg-[var(--gold-subtle)]/40 border-[var(--gold-border)]/40 text-[var(--gold)]',
    icon:   'text-[var(--gold)]',
    deltaUp:   'text-emerald-500',
    deltaDown: 'text-red-500',
  },
  green: {
    tile:   'bg-emerald-500/10 border-emerald-500/30 text-emerald-500',
    icon:   'text-emerald-500',
    deltaUp:   'text-emerald-500',
    deltaDown: 'text-red-500',
  },
  red: {
    tile:   'bg-red-500/10 border-red-500/30 text-red-500',
    icon:   'text-red-500',
    deltaUp:   'text-emerald-500',
    deltaDown: 'text-red-500',
  },
  blue: {
    tile:   'bg-blue-500/10 border-blue-500/30 text-blue-500',
    icon:   'text-blue-500',
    deltaUp:   'text-emerald-500',
    deltaDown: 'text-red-500',
  },
  purple: {
    tile:   'bg-purple-500/10 border-purple-500/30 text-purple-500',
    icon:   'text-purple-500',
    deltaUp:   'text-emerald-500',
    deltaDown: 'text-red-500',
  },
  neutral: {
    tile:   'bg-[var(--bg-surface-raised)] border-[var(--border-subtle)] text-[var(--text-secondary)]',
    icon:   'text-[var(--text-secondary)]',
    deltaUp:   'text-emerald-500',
    deltaDown: 'text-red-500',
  },
};

interface KpiCardProps {
  label:    string;
  value:    string | number;
  icon:     React.ReactNode;
  variant?: Variant;
  delta?:   { value: number; suffix?: string };
  loading?: boolean;
}

export default function KpiCard({
  label,
  value,
  icon,
  variant = 'gold',
  delta,
  loading = false,
}: KpiCardProps) {
  const v = variantStyles[variant];
  const deltaUp = delta && delta.value >= 0;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-card border border-[var(--border-subtle)]',
        'bg-[var(--bg-surface)] p-5 shadow-card hover:shadow-raised transition-shadow',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-2xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            {label}
          </p>
          {loading ? (
            <div className="mt-2 h-8 w-24 bg-[var(--bg-surface-raised)] rounded animate-pulse" />
          ) : (
            <p className="mt-1.5 font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tabular-nums">
              {value}
            </p>
          )}
          {delta && (
            <div className={cn('mt-1.5 flex items-center gap-1 text-xs font-semibold', deltaUp ? v.deltaUp : v.deltaDown)}>
              {deltaUp ? <ArrowUpRight className="h-3.5 w-3.5" aria-hidden /> : <ArrowDownRight className="h-3.5 w-3.5" aria-hidden />}
              <span>
                {delta.value > 0 ? '+' : ''}
                {delta.value}
                {delta.suffix ?? '%'}
              </span>
            </div>
          )}
        </div>

        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-card border', v.tile)}>
          {icon}
        </div>
      </div>
    </div>
  );
}
