import { useMemo, useState } from 'react';
import { RiSearchLine } from '@remixicon/react';
import { cn } from '@/lib/utils';
import { INSIGHT_KH } from '../../pages/insightReportKh';

function groupDimensionsByTable(dimensions = []) {
  const groups = new Map();
  dimensions.forEach((d) => {
    const key = d.table || 'other';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(d);
  });
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export default function InsightDimensionPanel({
  program,
  outcomeOptions = [],
  outcomeFilter = 'all',
  onOutcomeFilterChange,
  groupBy = [],
  onToggleDimension,
  disabled = false
}) {
  const [search, setSearch] = useState('');

  const groups = useMemo(() => {
    const list = program?.dimensions || [];
    const q = search.trim().toLowerCase();
    const filtered = q
      ? list.filter(
          (d) =>
            d.labelKh.toLowerCase().includes(q) ||
            d.table.toLowerCase().includes(q) ||
            d.id.toLowerCase().includes(q)
        )
      : list;
    return groupDimensionsByTable(filtered);
  }, [program, search]);

  if (!program) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-xs text-muted-foreground">
        {INSIGHT_KH.pickProgramFirst}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col border-r border-border/80 bg-muted/15">
      <div className="shrink-0 border-b border-border/80 px-3 py-2">
        <div className="text-xs font-semibold text-foreground">{program.labelKh}</div>
        <div className="mt-0.5 text-[10px] text-muted-foreground">{program.descriptionKh}</div>
        <div className="mt-1 text-[10px] text-muted-foreground">
          {INSIGHT_KH.dateFilter}: {program.dateFieldKh}
        </div>
        <div className="mt-1 text-[10px] text-muted-foreground">
          {INSIGHT_KH.tablesLabel}: {program.tables?.join(', ')}
        </div>
      </div>

      {program.id === 'outcome' && outcomeOptions.length ? (
        <div className="shrink-0 border-b border-border/80 px-3 py-2">
          <div className="mb-1 text-[10px] font-medium text-muted-foreground">{INSIGHT_KH.outcomeType}</div>
          <div className="flex flex-wrap gap-0.5">
            {outcomeOptions.map((o) => (
              <button
                key={o.id}
                type="button"
                disabled={disabled}
                onClick={() => onOutcomeFilterChange?.(o.id)}
                className={cn(
                  'border px-2 py-0.5 text-[10px] transition-colors',
                  outcomeFilter === o.id
                    ? 'border-primary/50 bg-primary/10 text-foreground'
                    : 'border-border/70 bg-background hover:bg-muted/30'
                )}
              >
                {o.labelKh}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="shrink-0 border-b border-border/80 px-3 py-2">
        <div className="mb-1 text-[10px] font-medium text-muted-foreground">{INSIGHT_KH.dimensionsTitle}</div>
        <div className="relative">
          <RiSearchLine className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={INSIGHT_KH.searchDimensions}
            disabled={disabled}
            className="h-7 w-full border border-border/80 bg-background pl-7 pr-2 text-[10px]"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {groups.map(([table, dims]) => (
          <section key={table} className="mb-3">
            <div className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {table}
            </div>
            <div className="space-y-0.5">
              {dims.map((d) => {
                const active = groupBy.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => onToggleDimension?.(d.id)}
                    className={cn(
                      'flex w-full items-start gap-2 border px-2 py-1.5 text-left text-[11px] transition-colors',
                      active
                        ? 'border-primary/50 bg-primary/10 text-foreground'
                        : 'border-border/60 bg-background hover:bg-muted/25'
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 size-3 shrink-0 border',
                        active ? 'bg-primary border-primary' : 'border-border bg-background'
                      )}
                      aria-hidden
                    />
                    <span>{d.labelKh}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
        {!groups.length ? (
          <p className="px-1 py-4 text-center text-[10px] text-muted-foreground">{INSIGHT_KH.noDimensions}</p>
        ) : null}
      </div>
    </div>
  );
}
