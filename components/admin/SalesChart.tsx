'use client';

import { useMemo, useState } from 'react';
import { useLocale } from '@/components/LocaleProvider';
import { cn } from '@/lib/utils';

export type SalesChartPoint = {
  date: string;
  revenue: number;
  orders: number;
};

interface SalesChartProps {
  data: SalesChartPoint[];
  height?: number;
}

type Metric = 'revenue' | 'orders';

export default function SalesChart({ data, height = 240 }: SalesChartProps) {
  const { locale } = useLocale();
  const [metric, setMetric] = useState<Metric>('revenue');

  const { path, areaPath, points, gridLines, totals } = useMemo(() => {
    if (data.length === 0) {
      return { path: '', areaPath: '', points: [], gridLines: [] as number[], totals: { value: 0, prev: 0, delta: 0 } };
    }

    const width = 100;
    const innerH = 80;
    const values = data.map((d) => (metric === 'revenue' ? d.revenue : d.orders));
    const max = Math.max(...values, metric === 'revenue' ? 100 : 1);
    const niceMax = niceCeiling(max);

    const pts = data.map((d, i) => {
      const x = data.length === 1 ? width / 2 : (i / (data.length - 1)) * width;
      const v = metric === 'revenue' ? d.revenue : d.orders;
      const y = innerH - (v / niceMax) * innerH;
      return { x, y, value: v, date: d.date };
    });

    const pathD = pts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
    const areaD = `${pathD} L ${pts[pts.length - 1].x} ${innerH} L ${pts[0].x} ${innerH} Z`;

    const grid = [0, 0.25, 0.5, 0.75, 1].map((p) => innerH - p * innerH);

    const total = values.reduce((a, b) => a + b, 0);
    const halfIdx = Math.floor(values.length / 2);
    const prevHalf = values.slice(0, halfIdx).reduce((a, b) => a + b, 0);
    const recentHalf = values.slice(halfIdx).reduce((a, b) => a + b, 0);
    const delta = prevHalf === 0 ? 0 : ((recentHalf - prevHalf) / prevHalf) * 100;

    return { path: pathD, areaPath: areaD, points: pts, gridLines: grid, totals: { value: total, prev: prevHalf, delta } };
  }, [data, metric]);

  const formatValue = (n: number) =>
    metric === 'revenue'
      ? locale === 'ar' ? `${n.toLocaleString('ar-EG')} ج.م` : `EGP ${n.toLocaleString()}`
      : n.toString();

  const formatDate = (s: string) => {
    const d = new Date(s);
    return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { day: '2-digit', month: 'short' });
  };

  if (data.length === 0) {
    return (
      <div className="rounded-card border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 text-center text-sm text-[var(--text-secondary)]">
        —
      </div>
    );
  }

  const showEvery = Math.max(1, Math.floor(data.length / 7));

  return (
    <div 
      className="rounded-card border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
      style={{ padding: 'calc(var(--p-density, 1) * 1.25rem)' }}
    >
      <div 
        className="flex items-center justify-between flex-wrap"
        style={{ gap: 'calc(var(--p-density, 1) * 0.75rem)', marginBottom: 'calc(var(--p-density, 1) * 1rem)' }}
      >
        <div>
          <p className="text-2xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            {metric === 'revenue'
              ? (locale === 'ar' ? 'الإيرادات' : 'Revenue')
              : (locale === 'ar' ? 'الطلبات' : 'Orders')}
          </p>
          <p className="font-display text-2xl font-bold text-[var(--text-primary)] mt-0.5 font-mono tabular-nums">
            {formatValue(totals.value)}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-button border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] p-0.5">
          <button
            type="button"
            onClick={() => setMetric('revenue')}
            className={cn(
              'h-8 px-3 rounded text-xs font-semibold transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]',
              metric === 'revenue'
                ? 'bg-[var(--gold)] text-[var(--brand-fg)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
            )}
          >
            {locale === 'ar' ? 'الإيرادات' : 'Revenue'}
          </button>
          <button
            type="button"
            onClick={() => setMetric('orders')}
            className={cn(
              'h-8 px-3 rounded text-xs font-semibold transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]',
              metric === 'orders'
                ? 'bg-[var(--gold)] text-[var(--brand-fg)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
            )}
          >
            {locale === 'ar' ? 'الطلبات' : 'Orders'}
          </button>
        </div>
      </div>

      <svg
        viewBox="0 0 100 90"
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
        role="img"
        aria-label={locale === 'ar' ? 'رسم بياني للمبيعات' : 'Sales chart'}
      >
        <defs>
          <linearGradient id="sales-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridLines.map((y, i) => (
          <line
            key={i}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="var(--border-subtle)"
            strokeWidth="0.3"
            strokeDasharray="1 1"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <path d={areaPath} fill="url(#sales-area)" />
        <path
          d={path}
          fill="none"
          stroke="var(--gold)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="0.9"
            fill="var(--gold)"
            vectorEffect="non-scaling-stroke"
          >
            <title>{`${formatDate(p.date)}: ${formatValue(p.value)}`}</title>
          </circle>
        ))}
      </svg>

      <div className="mt-2 flex justify-between text-2xs text-[var(--text-secondary)] font-mono">
        {data.map((d, i) => (
          <span
            key={d.date}
            className={cn(i % showEvery !== 0 && i !== data.length - 1 && 'invisible')}
          >
            {formatDate(d.date)}
          </span>
        ))}
      </div>

      {totals.delta !== 0 && (
        <p
          className={cn(
            'mt-2 text-2xs font-semibold',
            totals.delta > 0 ? 'text-emerald-500' : 'text-rose-500',
          )}
        >
          {totals.delta > 0 ? '▲' : '▼'} {Math.abs(totals.delta).toFixed(1)}%{' '}
          {locale === 'ar' ? 'مقارنة بالنصف الأول' : 'vs. first half'}
        </p>
      )}
    </div>
  );
}

function niceCeiling(n: number): number {
  if (n <= 0) return 1;
  const exp = Math.floor(Math.log10(n));
  const base = Math.pow(10, exp);
  const norm = n / base;
  let nice: number;
  if (norm <= 1) nice = 1;
  else if (norm <= 2) nice = 2;
  else if (norm <= 5) nice = 5;
  else nice = 10;
  return nice * base;
}
