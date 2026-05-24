import { cn } from '@/lib/utils';
import { P360_KH } from '../../pages/patient360Kh';
import { P360_TABLE_PAD, P360_TABLE_ROW_INNER, P360_TABLE_TEXT } from '../layout/appNavStyles';

const H = P360_KH.timeline;
const GRID = 'grid-cols-[5.5rem_minmax(0,1fr)_minmax(6.5rem,10rem)]';

function programLabel(program) {
  if (!program) return '';
  return P360_KH.programs?.[program] || program;
}

function whereDisplay(ev) {
  if (ev.whereName) {
    return {
      primary: ev.whereName,
      secondary: ev.whereCode ? `@${ev.whereCode}` : null,
      title: ev.where || ev.whereName
    };
  }
  const fallback = ev.where || programLabel(ev.program);
  return { primary: fallback, secondary: null, title: fallback };
}

/**
 * Timeline tab — when / what / where per row.
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
        {events.some((ev) => ev.type === 'vcct') ? (
          <span className="hidden text-[10px] text-sky-800 dark:text-sky-400 sm:inline">
            {H.vcctHint}
          </span>
        ) : null}
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-0 border-b border-border/80 bg-background">
        {count ? (
          <div
            className={cn(
              'grid shrink-0 gap-x-2 border-b border-border/60 bg-muted/25 font-medium text-muted-foreground',
              GRID,
              P360_TABLE_PAD,
              'py-1.5 text-[10px]'
            )}
          >
            <span>{H.when}</span>
            <span>{H.what}</span>
            <span className="truncate">{H.where}</span>
          </div>
        ) : null}
        <ul className="min-h-0 flex-1 overflow-auto overscroll-contain bg-background [scrollbar-gutter:stable]">
          {count ? (
            events.map((ev, i) => {
              const place = whereDisplay(ev);
              return (
                <li
                  key={`${ev.date}-${ev.label}-${i}`}
                  className="border-0 border-b border-border/40 bg-background last:border-b-0"
                >
                  <div
                    className={cn(P360_TABLE_ROW_INNER, 'grid gap-x-2 py-1.5', GRID)}
                    title={[ev.label, place.title, programLabel(ev.program)].filter(Boolean).join(' · ')}
                  >
                    <span
                      className="shrink-0 font-mono text-[11px] font-medium tabular-nums text-foreground"
                      title={ev.date}
                    >
                      {ev.date || '—'}
                    </span>
                    <span
                      className={cn(
                        'min-w-0 truncate text-[11px]',
                        ev.type === 'vcct'
                          ? 'text-sky-900 dark:text-sky-300'
                          : 'text-foreground'
                      )}
                      title={ev.label}
                    >
                      {ev.label}
                    </span>
                    <span className="min-w-0 flex flex-col gap-0.5" title={place.title}>
                      <span className="truncate text-[11px] text-foreground">{place.primary || '—'}</span>
                      {place.secondary ? (
                        <span className="truncate font-mono text-[10px] text-muted-foreground">
                          {place.secondary}
                        </span>
                      ) : null}
                    </span>
                  </div>
                </li>
              );
            })
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
                {H.empty}
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
