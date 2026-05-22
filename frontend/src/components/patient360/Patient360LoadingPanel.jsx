import { RiLoader4Line } from '@remixicon/react';
import { cn } from '@/lib/utils';
import { APP_NAV_ICON, APP_NAV_MUTED, APP_NAV_TEXT } from '../layout/appNavStyles';

/** Centered spinner panel (aligned with P360 toolbar typography). */
export function Patient360LoadingPanel({ label, className, minHeight = 'min-h-[11rem]' }) {
  return (
    <div
      className={cn(
        'flex w-full items-center justify-center border-0 bg-background',
        minHeight,
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className={cn('inline-flex items-center gap-2', APP_NAV_MUTED)}>
        <RiLoader4Line className={cn(APP_NAV_ICON, 'animate-spin text-primary')} aria-hidden />
        <span className={APP_NAV_TEXT}>{label}</span>
      </div>
    </div>
  );
}

export function Patient360SummarySkeleton({ count = 8 }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse border border-border/80 bg-muted/20 p-3">
          <div className="h-3 w-20 rounded-sm bg-muted" />
          <div className="mt-2 h-5 w-28 rounded-sm bg-muted/80" />
        </div>
      ))}
    </div>
  );
}

export function Patient360TableSkeleton({ rows = 10, cols = 9 }) {
  return (
    <div className="w-full border border-border/80" aria-hidden>
      <div className="grid grid-cols-9 gap-px border-b border-border/80 bg-muted/40 p-2">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 animate-pulse rounded-sm bg-muted" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="grid grid-cols-9 gap-px border-b border-border/40 px-2 py-2.5 last:border-0"
        >
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="h-3 animate-pulse rounded-sm bg-muted/70"
              style={{ width: `${55 + ((r + c) % 4) * 12}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
