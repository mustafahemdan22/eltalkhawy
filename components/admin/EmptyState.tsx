import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon:     React.ReactNode;
  title:    string;
  description?: string;
  action?:  React.ReactNode;
  className?: string;
}

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 md:py-20 px-6',
        'rounded-card border border-dashed border-[var(--border-default)]',
        'bg-[var(--bg-surface)]',
        className,
      )}
    >
      <div
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-full',
          'bg-[var(--gold-subtle)]/40 border border-[var(--gold-border)]/40',
          'text-[var(--gold)]',
        )}
      >
        {icon}
      </div>
      <h3 className="mt-4 font-display text-base sm:text-lg font-bold text-[var(--text-primary)]">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 text-sm text-[var(--text-secondary)] max-w-md">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
