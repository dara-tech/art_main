import { useEffect, useMemo, useRef, useState } from 'react';
import { RiArrowDownSLine, RiDraggable, RiFilter3Line } from '@remixicon/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { APP_NAV_TEXT, P360_TABLE_TEXT, appNavItemClass } from '../layout/appNavStyles';
import { TOOLBAR_ICON } from '../layout/toolbarIconColors';
import { ToolbarAnchoredPanel, VizToolbarBtn } from './visualizeToolbarUi';
import { VIZ_KH } from '../../pages/visualizeKh';
import { listIndicatorsFromResults } from '../../utils/visualizeChartData';

export const VIZ_CHART_SERIES_MAX = 6;

function reorderSelectedIds(ids, fromId, toId) {
  if (!fromId || !toId || fromId === toId) return ids;
  const next = [...ids];
  const from = next.indexOf(fromId);
  const to = next.indexOf(toId);
  if (from < 0 || to < 0) return ids;
  next.splice(from, 1);
  next.splice(to, 0, fromId);
  return next;
}

function IndicatorRow({ ind, checked, single, onToggle, draggable = false }) {
  const subLabel =
    ind.fullLabel && ind.fullLabel !== ind.label && !ind.fullLabel.startsWith(ind.label)
      ? ind.fullLabel
      : null;

  return (
    <label
      className={cn(
        'flex items-start gap-2 px-2.5 py-1.5 hover:bg-muted/40',
        checked && 'bg-primary/5',
        draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      )}
      title={subLabel || ind.label}
    >
      {draggable ? (
        <RiDraggable className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      ) : (
        <span className="mt-0.5 size-4 shrink-0" aria-hidden />
      )}
      <input
        type={single ? 'radio' : 'checkbox'}
        name="viz-chart-indicator"
        className="mt-0.5 size-3.5 shrink-0 rounded-none border border-border accent-primary"
        checked={checked}
        onChange={() => onToggle(ind.id)}
        onClick={(e) => e.stopPropagation()}
      />
      <span className={cn('min-w-0 flex-1 leading-snug', P360_TABLE_TEXT)}>
        <span className="block font-medium text-foreground">{ind.label}</span>
        {subLabel ? <span className="block truncate text-muted-foreground">{subLabel}</span> : null}
      </span>
    </label>
  );
}

export default function VisualizeIndicatorChecklist({
  results = [],
  catalog = [],
  selectedIds = [],
  onChange,
  single = false,
  disabled = false,
  maxSeries = VIZ_CHART_SERIES_MAX
}) {
  const [open, setOpen] = useState(false);
  const [dragId, setDragId] = useState('');
  const rootRef = useRef(null);
  const anchorRef = useRef(null);
  const panelRef = useRef(null);
  const indicators = useMemo(() => listIndicatorsFromResults(results, catalog), [results, catalog]);
  const indicatorById = useMemo(() => new Map(indicators.map((i) => [i.id, i])), [indicators]);

  const selectedIndicators = useMemo(
    () =>
      selectedIds.map((id) => indicatorById.get(id)).filter(Boolean),
    [selectedIds, indicatorById]
  );

  const unselectedIndicators = useMemo(
    () => indicators.filter((i) => !selectedIds.includes(i.id)),
    [indicators, selectedIds]
  );

  const showDragOrder = !single && selectedIndicators.length > 1;

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (
        rootRef.current?.contains(e.target) ||
        panelRef.current?.contains(e.target) ||
        anchorRef.current?.contains(e.target)
      ) {
        return;
      }
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
    if (selectedIds.length >= maxSeries) {
      toast.error(VIZ_KH.chartSeriesMax.replace('{n}', String(maxSeries)));
      return;
    }
    onChange?.([...selectedIds, id]);
  };

  const selectAll = () => {
    const ids = indicators.slice(0, maxSeries).map((i) => i.id);
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

  const listToPick = showDragOrder ? unselectedIndicators : indicators;

  return (
    <div ref={rootRef} className="relative shrink-0">
      <div ref={anchorRef}>
        <VizToolbarBtn
          icon={RiFilter3Line}
          iconClassName={TOOLBAR_ICON.amber}
          label={label}
          active={open}
          disabled={disabled}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="gap-0.5"
        >
          {selectedIds.length ? (
            <span className="min-w-[1ch] tabular-nums text-[10px] font-semibold leading-none">
              {selectedIds.length}
            </span>
          ) : null}
          <RiArrowDownSLine className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        </VizToolbarBtn>
      </div>
      <ToolbarAnchoredPanel
        open={open}
        anchorRef={anchorRef}
        panelRef={panelRef}
        width={352}
        className="max-h-[min(20rem,70vh)] overflow-hidden border border-border/80 bg-popover shadow-lg"
      >
        <div role="listbox" aria-multiselectable={!single} aria-label={label}>
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

          <div className="max-h-[min(16rem,55vh)] overflow-y-auto py-1">
            {showDragOrder ? (
              <div className="border-b border-border/80 pb-1">
                <p className={cn('px-2.5 py-1 font-medium text-muted-foreground', APP_NAV_TEXT)}>
                  {VIZ_KH.chartSelectedOrder}
                </p>
                <ul>
                  {selectedIndicators.map((ind) => (
                    <li
                      key={ind.id}
                      className={cn(dragId === ind.id && 'opacity-50')}
                      draggable
                      onDragStart={() => setDragId(ind.id)}
                      onDragEnd={() => setDragId('')}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        onChange?.(reorderSelectedIds(selectedIds, dragId, ind.id));
                        setDragId('');
                      }}
                    >
                      <IndicatorRow
                        ind={ind}
                        checked
                        single={false}
                        onToggle={toggle}
                        draggable
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {listToPick.length ? (
              <div>
                {showDragOrder ? (
                  <p className={cn('px-2.5 py-1 font-medium text-muted-foreground', APP_NAV_TEXT)}>
                    {VIZ_KH.chartAddIndicators}
                  </p>
                ) : null}
                <ul>
                  {listToPick.map((ind) => (
                    <li key={ind.id}>
                      <IndicatorRow
                        ind={ind}
                        checked={selectedIds.includes(ind.id)}
                        single={single}
                        onToggle={toggle}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <p
            className={cn(
              'border-t border-border/80 bg-muted/15 px-2.5 py-1.5 leading-snug text-muted-foreground',
              P360_TABLE_TEXT
            )}
          >
            {single ? VIZ_KH.chartPickOneHint : VIZ_KH.chartPickManyHint.replace('{n}', String(maxSeries))}
          </p>
        </div>
      </ToolbarAnchoredPanel>
    </div>
  );
}
