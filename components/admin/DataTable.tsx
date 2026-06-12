'use client';

import { cn } from '@/lib/utils';

export interface DataTableColumn<TRow> {
  key:        string;
  header:     React.ReactNode;
  render:     (row: TRow) => React.ReactNode;
  width?:     string;
  align?:     'start' | 'center' | 'end';
  hideOn?:    'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

interface DataTableProps<TRow> {
  columns:      DataTableColumn<TRow>[];
  rows:         TRow[] | undefined;
  rowKey:       (row: TRow) => string;
  emptyState?:  React.ReactNode;
  onRowClick?:  (row: TRow) => void;
  className?:   string;
}

export default function DataTable<TRow>({
  columns,
  rows,
  rowKey,
  emptyState,
  onRowClick,
  className,
}: DataTableProps<TRow>) {
  const loading = rows === undefined;

  return (
    <div className={cn('overflow-x-auto rounded-card border border-[var(--border-subtle)] bg-[var(--bg-surface)]', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface-raised)]/40">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  'px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]',
                  col.align === 'center' && 'text-center',
                  col.align === 'end'    && 'text-end',
                  col.hideOn === 'sm'     && 'hidden sm:table-cell',
                  col.hideOn === 'md'     && 'hidden md:table-cell',
                  col.hideOn === 'lg'     && 'hidden lg:table-cell',
                  col.hideOn === 'xl'     && 'hidden xl:table-cell',
                  col.className,
                )}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <tr key={`s-${i}`} className="border-b border-[var(--border-subtle)]/60 last:border-0">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-3.5',
                      col.hideOn === 'sm' && 'hidden sm:table-cell',
                      col.hideOn === 'md' && 'hidden md:table-cell',
                      col.hideOn === 'lg' && 'hidden lg:table-cell',
                      col.hideOn === 'xl' && 'hidden xl:table-cell',
                    )}
                  >
                    <div className="h-3.5 w-3/4 bg-[var(--bg-surface-raised)] rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-0">
                {emptyState ?? null}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'border-b border-[var(--border-subtle)]/60 last:border-0',
                  'transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-[var(--bg-surface-hover)]',
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-3.5 text-[var(--text-primary)]',
                      col.align === 'center' && 'text-center',
                      col.align === 'end'    && 'text-end',
                      col.hideOn === 'sm'     && 'hidden sm:table-cell',
                      col.hideOn === 'md'     && 'hidden md:table-cell',
                      col.hideOn === 'lg'     && 'hidden lg:table-cell',
                      col.hideOn === 'xl'     && 'hidden xl:table-cell',
                      col.className,
                    )}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
