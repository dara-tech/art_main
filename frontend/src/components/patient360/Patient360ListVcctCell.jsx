import { cn } from '@/lib/utils';
import { vcctListCellView } from '../../utils/vcctMappingInsight';

export default function Patient360ListVcctCell({ row }) {
  const { id, siteLine, badge, tone, tooltip } = vcctListCellView(row);

  return (
    <span className="flex min-w-0 flex-col gap-0.5 px-2 py-0.5" title={tooltip || undefined}>
      <span className="truncate font-mono tabular-nums text-[11px]">{id}</span>
      {siteLine || badge ? (
        <span className="flex min-w-0 items-center gap-1 truncate text-[10px] leading-tight">
          {siteLine ? (
            <span
              className={cn(
                'truncate font-mono',
                tone === 'warn' && 'text-amber-800 dark:text-amber-400',
                tone === 'info' && 'text-sky-900 dark:text-sky-300',
                (!tone || tone === 'ok') && 'text-muted-foreground'
              )}
            >
              {siteLine}
            </span>
          ) : null}
          {badge ? (
            <span
              className={cn(
                'shrink-0 rounded px-1 py-px text-[9px] font-medium leading-none',
                tone === 'warn' && 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300',
                tone === 'info' && 'bg-sky-100 text-sky-900 dark:bg-sky-950/60 dark:text-sky-300'
              )}
            >
              {badge}
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
