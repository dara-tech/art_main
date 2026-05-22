import { cn } from '@/lib/utils';
import { P360_KH } from '../../pages/patient360Kh';
import { P360_TABLE_PAD, P360_TABLE_ROW_INNER, P360_TABLE_TEXT } from '../layout/appNavStyles';

/**
 * Timeline tab — same caption + row styling as SectionTable / Patient360DataTable.
 */
export default function Patient360TimelineCard({ events = [], className }) {
  const count = events.length;

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      <div
        className={cn(
          'flex min-h-8 shrink-0 items-center gap-2',
          P360_TABLE_PAD,
          P360_TABLE_TEXT,
          'text-muted-foreground'
        )}
      >
        <span className="font-medium text-foreground/80">{P360_KH.tabs.timeline}</span>
        <span className="tabular-nums">{count}</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-0 border-b border-border/80 bg-background">
        <ul className="min-h-0 flex-1 overflow-auto overscroll-contain bg-background [scrollbar-gutter:stable]">
          {count ? (
            events.map((ev, i) => (
              <li
                key={`${ev.date}-${ev.label}-${i}`}
                className="border-0 border-b border-border/40 bg-background last:border-b-0"
              >
                <div className={cn(P360_TABLE_ROW_INNER, 'gap-x-2')}>
                  <span
                    className="shrink-0 font-mono font-medium tabular-nums text-foreground"
                    title={ev.date}
                  >
                    {ev.date || '—'}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-foreground" title={ev.label}>
                    {ev.label}
                  </span>
                </div>
              </li>
            ))
          ) : (
            <li className="border-0">
              <div
                className={cn(
                  'flex min-h-8 items-center justify-center py-12',
                  P360_TABLE_PAD,
                  P360_TABLE_TEXT,
                  'text-muted-foreground'
                )}
              >
                {P360_KH.timeline.empty}
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
