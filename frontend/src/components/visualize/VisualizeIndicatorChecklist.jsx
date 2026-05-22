import { useEffect, useMemo, useRef, useState } from 'react';
import { RiArrowDownSLine, RiFilter3Line } from '@remixicon/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { APP_NAV_ICON, APP_NAV_TEXT, P360_TABLE_TEXT, appNavItemClass, p360ControlClass } from '../layout/appNavStyles';
import { VIZ_KH } from '../../pages/visualizeKh';
import { listIndicatorsFromResults } from '../../utils/visualizeChartData';

export const VIZ_CHART_SERIES_MAX = 6;

export default function VisualizeIndicatorChecklist({
  results = [],
  catalog = [],
  selectedIds = [],
  onChange,
  single = false,
  disabled = false
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const indicators = useMemo(() => listIndicatorsFromResults(results, catalog), [results, catalog]);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (rootRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const toggle = (id) => {
    if (single) {
      onChange?.([id]);
      setOpen(false);
      return;
    }
    const has = selectedIds.includes(id);
    if (has) {
      const next = selectedIds.filter((x) => x !== id);
      if (!next.length) {
        toast.error(VIZ_KH.chartPickOne);
        return;
      }
      onChange?.(next);
      return;
    }
    if (selectedIds.length >= VIZ_CHART_SERIES_MAX) {
      toast.error(VIZ_KH.chartSeriesMax.replace('{n}', String(VIZ_CHART_SERIES_MAX)));
      return;
    }
    onChange?.([...selectedIds, id]);
  };

  const selectAll = () => {
    const ids = indicators.slice(0, VIZ_CHART_SERIES_MAX).map((i) => i.id);
    onChange?.(ids);
  };

  const label = useMemo(() => {
    if (!selectedIds.length) return VIZ_KH.chartPickIndicators;
    if (selectedIds.length === 1) {
      return indicators.find((i) => i.id === selectedIds[0])?.label || VIZ_KH.chartOneIndicator;
    }
    return VIZ_KH.chartNIndicators.replace('{n}', String(selectedIds.length));
  }, [indicators, selectedIds]);

  if (!indicators.length) return null;

  return (
    <div ref={rootRef} className="relative min-w-0 shrink-0">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          appNavItemClass(open),
          'max-w-[11rem] sm:max-w-[14rem]',
          open && 'border-primary/40 bg-primary/10'
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
        title={VIZ_KH.chartPickIndicators}
      >
        <RiFilter3Line className={APP_NAV_ICON} aria-hidden />
        <span className="min-w-0 truncate">{label}</span>
        <RiArrowDownSLine className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      </button>
      {open ? (
        <div
          className="absolute right-0 top-full z-50 mt-1 max-h-64 w-[min(20rem,calc(100vw-2rem))] overflow-hidden border border-border/80 bg-popover shadow-md"
          role="listbox"
          aria-multiselectable={!single}
        >
          {!single ? (
            <div className="flex gap-1 border-b border-border/80 bg-muted/20 px-2 py-1.5">
              <button type="button" className={appNavItemClass(false)} onClick={selectAll}>
                {VIZ_KH.modalSelectAll}
              </button>
              <button
                type="button"
                className={appNavItemClass(false)}
                onClick={() => onChange?.([indicators[0].id])}
              >
                {VIZ_KH.modalClear}
              </button>
            </div>
          ) : null}
          <ul className="max-h-52 overflow-y-auto py-1">
            {indicators.map((ind) => {
              const checked = selectedIds.includes(ind.id);
              return (
                <li key={ind.id}>
                  <label
                    className={cn(
                      'flex cursor-pointer items-start gap-2 px-2.5 py-1.5 hover:bg-muted/40',
                      checked && 'bg-primary/5'
                    )}
                  >
                    <input
                      type={single ? 'radio' : 'checkbox'}
                      name="viz-chart-indicator"
                      className="mt-0.5 size-3.5 shrink-0 rounded-none border border-border accent-primary"
                      checked={checked}
                      onChange={() => toggle(ind.id)}
                    />
                    <span className={cn('min-w-0 leading-snug', P360_TABLE_TEXT)}>
                      <span className="block font-medium text-foreground">{ind.label}</span>
                      <span className="block truncate text-muted-foreground">{ind.fullLabel}</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          <p className={cn('border-t border-border/80 bg-muted/15 px-2.5 py-1.5 text-muted-foreground', APP_NAV_TEXT)}>
            {single ? VIZ_KH.chartPickOneHint : VIZ_KH.chartPickManyHint.replace('{n}', String(VIZ_CHART_SERIES_MAX))}
          </p>
        </div>
      ) : null}
    </div>
  );
}
