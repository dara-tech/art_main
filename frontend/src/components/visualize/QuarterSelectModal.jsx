import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCalendarLine,
  RiCheckboxBlankCircleLine,
  RiCheckboxCircleFill,
  RiCloseLine
} from '@remixicon/react';
import { cn } from '@/lib/utils';
import { appNavItemClass, p360ControlClass } from '../layout/appNavStyles';
import { VIZ_KH } from '../../pages/visualizeKh';
import {
  PERIOD_KIND,
  currentYear,
  getPeriodByKey,
  isPeriodDisabled,
  listAllYearPeriods,
  listBrowseYears,
  periodsForYear,
  resolvePeriodKeys
} from '../../utils/visualizePeriods';

function formatPeriodSummary(periodKeys) {
  const mt = VIZ_KH.periodModal;
  if (!periodKeys?.length) return mt.selectPlaceholder;
  const labels = resolvePeriodKeys(periodKeys).map((p) => p.label);
  if (!labels.length) return mt.selectPlaceholder;
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return labels.join(', ');
  return `${labels[0]}, ${labels[1]} +${labels.length - 2}`;
}

export default function QuarterSelectModal({
  value = [],
  onChange,
  disabled = false,
  className = '',
  showLabel = false
}) {
  const mt = VIZ_KH.periodModal;
  const browseYears = useMemo(() => listBrowseYears(12), []);
  const minYear = browseYears[browseYears.length - 1] ?? currentYear() - 11;
  const maxYear = browseYears[0] ?? currentYear();

  const [open, setOpen] = useState(false);
  const [draftKeys, setDraftKeys] = useState(value);
  const [browseYear, setBrowseYear] = useState(currentYear());
  const [periodKind, setPeriodKind] = useState(PERIOD_KIND.quarter);

  const summary = useMemo(() => formatPeriodSummary(value), [value]);
  const draftSummary = useMemo(() => formatPeriodSummary(draftKeys), [draftKeys]);

  const allYearPeriods = useMemo(() => listAllYearPeriods(12), []);
  const viewPeriods = useMemo(() => {
    if (periodKind === PERIOD_KIND.year) return allYearPeriods;
    return periodsForYear(browseYear, periodKind);
  }, [periodKind, browseYear, allYearPeriods]);

  useEffect(() => {
    if (!open) setDraftKeys(value);
  }, [value, open]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const openModal = () => {
    if (disabled) return;
    setDraftKeys(value);
    const first = value[0] ? getPeriodByKey(value[0]) : null;
    setBrowseYear(first?.year ?? currentYear());
    setPeriodKind(first?.kind || PERIOD_KIND.quarter);
    setOpen(true);
  };

  const toggleKey = (key) => {
    setDraftKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const selectAllInView = () => {
    const keys = viewPeriods.filter((p) => !isPeriodDisabled(p)).map((p) => p.key);
    setDraftKeys((prev) => [...new Set([...prev, ...keys])]);
  };

  const clearInView = () => {
    const viewKeySet = new Set(viewPeriods.map((p) => p.key));
    setDraftKeys((prev) => prev.filter((k) => !viewKeySet.has(k)));
  };

  const applySelection = () => {
    if (!draftKeys.length) return;
    onChange?.(draftKeys);
    setOpen(false);
  };

  const prevYear = () => setBrowseYear((y) => Math.max(minYear, y - 1));
  const nextYear = () => setBrowseYear((y) => Math.min(maxYear, y + 1));

  const kindTabs = [
    { id: PERIOD_KIND.quarter, label: VIZ_KH.periodKindQuarter },
    { id: PERIOD_KIND.month, label: VIZ_KH.periodKindMonth },
    { id: PERIOD_KIND.year, label: VIZ_KH.periodKindYear }
  ];

  return (
    <>
      <div className={cn('grid', showLabel ? 'gap-2' : 'gap-0', className)}>
        {showLabel ? (
          <span className="text-[11px] font-medium leading-none text-muted-foreground">{VIZ_KH.pickPeriods}</span>
        ) : null}
        <button
          type="button"
          onClick={openModal}
          disabled={disabled}
          className={cn(
            p360ControlClass,
            'w-full border bg-background px-3 text-left font-medium transition hover:bg-muted/20 disabled:opacity-50'
          )}
        >
          {summary}
        </button>
      </div>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quarter-select-modal-title"
          >
            <div className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden bg-card shadow-2xl shadow-black/15">
              <div className="flex items-center justify-between border-b border-border/80 bg-muted/35 px-6 py-4">
                <div className="flex items-center gap-2">
                  <RiCalendarLine className="size-5 text-primary" aria-hidden />
                  <div>
                    <div id="quarter-select-modal-title" className="text-lg font-semibold text-foreground">
                      {mt.title}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{mt.hint}</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center border border-border/80 bg-background/80 hover:bg-muted"
                  onClick={() => setOpen(false)}
                  aria-label={mt.cancel}
                >
                  <RiCloseLine className="size-5" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-auto px-6 py-4">
                {periodKind !== PERIOD_KIND.year ? (
                  <div className="mb-4 flex items-center justify-between border border-border/80 bg-muted/25 px-2 py-2">
                    <button
                      type="button"
                      onClick={prevYear}
                      disabled={browseYear <= minYear}
                      className="inline-flex h-9 w-9 items-center justify-center border border-border/80 bg-background hover:bg-muted disabled:opacity-40"
                      aria-label={mt.prevYear}
                    >
                      <RiArrowLeftSLine className="size-5" />
                    </button>
                    <div className="text-center">
                      <div className="text-lg font-semibold tabular-nums text-foreground">{browseYear}</div>
                      <div className="text-[11px] text-muted-foreground">{mt.browseYear}</div>
                    </div>
                    <button
                      type="button"
                      onClick={nextYear}
                      disabled={browseYear >= maxYear}
                      className="inline-flex h-9 w-9 items-center justify-center border border-border/80 bg-background hover:bg-muted disabled:opacity-40"
                      aria-label={mt.nextYear}
                    >
                      <RiArrowRightSLine className="size-5" />
                    </button>
                  </div>
                ) : (
                  <p className="mb-3 text-xs text-muted-foreground">{mt.allYearsHint}</p>
                )}

                <div className="mb-3 flex flex-wrap gap-1">
                  {kindTabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPeriodKind(tab.id)}
                      className={appNavItemClass(periodKind === tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="mb-3 flex flex-wrap gap-1">
                  <button type="button" onClick={selectAllInView} className={appNavItemClass(false)}>
                    {VIZ_KH.modalSelectAll}
                  </button>
                  <button type="button" onClick={clearInView} className={appNavItemClass(false)}>
                    {VIZ_KH.modalClear}
                  </button>
                </div>

                {periodKind === PERIOD_KIND.quarter ? (
                  <div className="grid grid-cols-2 gap-2">
                    {viewPeriods.map((p) => {
                      const active = draftKeys.includes(p.key);
                      const off = isPeriodDisabled(p);
                      return (
                        <PeriodChip
                          key={p.key}
                          period={p}
                          active={active}
                          disabled={off}
                          onToggle={() => !off && toggleKey(p.key)}
                          large
                        />
                      );
                    })}
                  </div>
                ) : null}

                {periodKind === PERIOD_KIND.month ? (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {viewPeriods.map((p) => {
                      const active = draftKeys.includes(p.key);
                      const off = isPeriodDisabled(p);
                      return (
                        <PeriodChip
                          key={p.key}
                          period={p}
                          active={active}
                          disabled={off}
                          onToggle={() => !off && toggleKey(p.key)}
                        />
                      );
                    })}
                  </div>
                ) : null}

                {periodKind === PERIOD_KIND.year ? (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {viewPeriods.map((p) => {
                      const active = draftKeys.includes(p.key);
                      const off = isPeriodDisabled(p);
                      return (
                        <PeriodChip
                          key={p.key}
                          period={p}
                          active={active}
                          disabled={off}
                          onToggle={() => !off && toggleKey(p.key)}
                        />
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <div className="flex items-center justify-between border-t border-border/80 bg-muted/25 px-6 py-4">
                <div className="text-xs text-muted-foreground">
                  {mt.draft}{' '}
                  <span className="font-medium text-primary">{draftSummary}</span>
                  <span className="ml-1 text-muted-foreground">
                    ({draftKeys.length} {VIZ_KH.selectedPeriods})
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="h-9 px-5 text-sm text-muted-foreground hover:bg-muted"
                    onClick={() => setOpen(false)}
                  >
                    {mt.cancel}
                  </button>
                  <button
                    type="button"
                    className="h-10 bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95 disabled:opacity-50"
                    onClick={applySelection}
                    disabled={!draftKeys.length}
                  >
                    {mt.apply}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

function PeriodChip({ period, active, disabled, onToggle, large = false, subtitle }) {
  return (
    <button
      type="button"
      className={cn(
        'flex items-center gap-2 border px-3 text-left transition-colors',
        large ? 'min-h-11' : 'min-h-9',
        active && !disabled && 'border-primary/50 bg-primary/10',
        !active && !disabled && 'border-border/80 bg-background hover:bg-muted/40',
        disabled && 'cursor-not-allowed border-border/50 bg-muted/20 opacity-50'
      )}
      onClick={onToggle}
      disabled={disabled}
      title={disabled ? undefined : `${period.startDate} – ${period.endDate}`}
    >
      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
        {active ? (
          <RiCheckboxCircleFill className="size-5 text-primary" />
        ) : (
          <RiCheckboxBlankCircleLine className="size-5 text-muted-foreground" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground">{period.label}</span>
        {subtitle ? <span className="block text-[10px] text-muted-foreground tabular-nums">{subtitle}</span> : null}
      </span>
    </button>
  );
}
