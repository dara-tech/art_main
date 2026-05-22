import { useMemo, useState } from 'react';
import { RiSearchLine } from '@remixicon/react';
import { cn } from '@/lib/utils';
import { dedupeSchemaTables } from '../../utils/dedupeSchemaTables';
import { INSIGHT_KH } from '../../pages/insightReportKh';

export default function InsightTableExplorer({
  tables = [],
  selectedTableId = '',
  onSelectTable,
  disabled = false
}) {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(selectedTableId || '');

  const uniqueTables = useMemo(() => dedupeSchemaTables(tables), [tables]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return uniqueTables;
    return uniqueTables.filter(
      (t) =>
        t.name.includes(q) ||
        t.titleKh?.toLowerCase().includes(q) ||
        t.fields?.some(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            f.labelKh?.toLowerCase().includes(q)
        )
    );
  }, [uniqueTables, search]);

  const selected = uniqueTables.find((t) => t.id === selectedTableId);

  return (
    <div className="flex h-full min-h-0 flex-col border-r border-border/80 bg-muted/10">
      <div className="shrink-0 border-b border-border/80 px-3 py-2">
        <div className="px-3 pt-2 text-[10px] text-muted-foreground">{INSIGHT_KH.advancedHint}</div>
        <div className="relative mt-2">
          <RiSearchLine className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={INSIGHT_KH.searchTables}
            disabled={disabled}
            className="h-7 w-full border border-border/80 bg-background pl-7 pr-2 text-[10px]"
          />
        </div>
        <div className="mt-1 text-[10px] text-muted-foreground">
          {filtered.length} / {uniqueTables.length} {INSIGHT_KH.tablesLabel}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-1 py-1">
        {filtered.map((t, rowIdx) => {
          const open = expandedId === t.id;
          const active = selectedTableId === t.id;
          return (
            <div key={`${t.id}-${rowIdx}`} className="mb-0.5">
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  setExpandedId(open ? '' : t.id);
                  onSelectTable?.(t);
                }}
                className={cn(
                  'flex w-full items-start gap-1.5 border px-2 py-1.5 text-left text-[11px] transition-colors',
                  active
                    ? 'border-primary/50 bg-primary/10'
                    : 'border-border/60 bg-background hover:bg-muted/20'
                )}
              >
                <span className="mt-0.5 shrink-0 text-muted-foreground">{open ? '▾' : '▸'}</span>
                <span className="min-w-0 flex-1">
                  <span className="font-mono text-[10px] text-foreground">{t.name}</span>
                  {t.analyzable ? (
                    <span className="ml-1 text-[9px] text-primary">●</span>
                  ) : (
                    <span className="ml-1 text-[9px] text-muted-foreground">○</span>
                  )}
                  <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">{t.titleKh}</span>
                  <span className="text-[9px] text-muted-foreground">
                    {t.fieldCount} {INSIGHT_KH.fieldsLabel}
                    {t.analyzable ? ` · ${INSIGHT_KH.canRun}` : ` · ${INSIGHT_KH.viewOnly}`}
                  </span>
                </span>
              </button>
              {open ? (
                <div className="mb-1 ml-3 border-l border-border/60 pl-2">
                  {t.dateFields?.length ? (
                    <div className="px-1 py-1 text-[9px] text-muted-foreground">
                      {INSIGHT_KH.dateFields}: {t.dateFields.join(', ')}
                    </div>
                  ) : null}
                  <div className="max-h-40 overflow-y-auto">
                    {(t.fields || []).map((f) => (
                      <div
                        key={`${t.id}-${f.name}`}
                        className="border-b border-border/40 px-1 py-0.5 text-[10px] last:border-0"
                      >
                        <span className="font-mono text-foreground/90">{f.name}</span>
                        <span className="text-muted-foreground"> — {f.labelKh}</span>
                        {f.isDate ? (
                          <span className="ml-1 text-[9px] text-primary/80">date</span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
        {!filtered.length ? (
          <p className="px-2 py-6 text-center text-[10px] text-muted-foreground">{INSIGHT_KH.noTables}</p>
        ) : null}
      </div>

      {selected && !selected.analyzable ? (
        <div className="shrink-0 border-t border-amber-200/80 bg-amber-50/80 px-3 py-2 text-[10px] text-amber-900">
          {INSIGHT_KH.viewOnlyNote}
        </div>
      ) : null}
    </div>
  );
}
