import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiCheckboxBlankLine,
  RiCheckboxLine,
  RiCloseLine,
  RiListCheck2,
  RiSearchLine
} from '@remixicon/react';
import { cn } from '@/lib/utils';
import { appNavItemClass, p360ControlClass, P360_TABLE_TEXT } from '../layout/appNavStyles';
import { VIZ_KH } from '../../pages/visualizeKh';
import { labelForIndicatorId, VISUALIZE_PRESETS } from '../../constants/indicatorLabels';
import { buildIndicatorPickerGroups, indicatorSortKey } from '../../utils/visualizeChartData';
import { buildEventPickerGroups, eventIdsForProgram } from '../../utils/visualizeEventPicker';

const PRESET_LABEL_KH = {
  vl: VIZ_KH.presetVl,
  retention: VIZ_KH.presetRetention,
  quality: VIZ_KH.presetQuality
};

function PickerCheckboxItem({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-2.5 border px-3 py-2 text-left transition-colors',
        P360_TABLE_TEXT,
        active
          ? 'border-primary/55 bg-primary/12 text-foreground ring-1 ring-primary/20'
          : 'border-border/70 bg-card hover:border-border hover:bg-muted/20'
      )}
    >
      {active ? (
        <RiCheckboxLine className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
      ) : (
        <RiCheckboxBlankLine className="mt-0.5 size-4 shrink-0 text-muted-foreground/80" aria-hidden />
      )}
      <span className="min-w-0 flex-1 leading-snug">{label}</span>
    </button>
  );
}

function PickerGroupSection({
  title,
  items,
  draftIds,
  onToggleId,
  onToggleGroup,
  forceOpen = false,
  defaultOpen = true
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isOpen = forceOpen || open;
  const selectedCount = items.filter((i) => draftIds.includes(i.id)).length;
  const allSelected = items.length > 0 && selectedCount === items.length;

  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  if (!items.length) return null;

  return (
    <section className="border-b border-border/80 last:border-b-0">
      <div className="flex items-center gap-1 bg-muted/25 px-2 py-1.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'flex min-w-0 flex-1 items-center gap-1 text-left font-semibold text-foreground',
            P360_TABLE_TEXT
          )}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <RiArrowDownSLine className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          ) : (
            <RiArrowRightSLine className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          )}
          <span className="truncate">{title}</span>
          <span className="shrink-0 tabular-nums font-normal text-muted-foreground">
            (
              {VIZ_KH.pickerGroupSelected
                .replace('{n}', String(selectedCount))
                .replace('{total}', String(items.length))}
              )
          </span>
        </button>
        <button
          type="button"
          onClick={() => onToggleGroup(items.map((i) => i.id), !allSelected)}
          className={cn(
            'shrink-0 px-2 py-0.5 text-[10px] font-medium text-primary hover:underline',
            P360_TABLE_TEXT
          )}
        >
          {allSelected ? VIZ_KH.pickerClearGroup : VIZ_KH.pickerSelectGroup}
        </button>
      </div>
      {isOpen ? (
        <div className="space-y-1 px-2 py-2">
          {items.map((item) => (
            <PickerCheckboxItem
              key={item.id}
              active={draftIds.includes(item.id)}
              label={item.label}
              onClick={() => onToggleId(item.id)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default function VisualizePickerModal({
  open,
  onClose,
  catalog = [],
  catalogLoading = false,
  selectedIds = [],
  defaultPickerView = 'events',
  eventsOnly = false,
  onApply
}) {
  const [draftIds, setDraftIds] = useState(selectedIds);
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState('all');
  const [pickerView, setPickerView] = useState('events');

  const programTabs = [
    { id: 'all', label: VIZ_KH.programAll },
    { id: 'adult-child', label: VIZ_KH.programArt },
    { id: 'infant', label: VIZ_KH.programInfant },
    { id: 'pntt', label: VIZ_KH.programPntt }
  ];

  useEffect(() => {
    if (!open) return;
    setDraftIds(selectedIds);
    setSearch('');
    setProgramFilter('all');
    setPickerView(defaultPickerView);
  }, [open, selectedIds, defaultPickerView]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = catalog
      .map((item) => ({
        ...item,
        label: labelForIndicatorId(item.id, item.id, item.label)
      }))
      .filter((item) => programFilter === 'all' || item.program === programFilter)
      .filter((item) => {
        if (!q) return true;
        return item.label.toLowerCase().includes(q) || item.id.toLowerCase().includes(q);
      });
    list.sort((a, b) => {
      const ka = indicatorSortKey(a.id, a.label);
      const kb = indicatorSortKey(b.id, b.label);
      const len = Math.max(ka.length, kb.length);
      for (let i = 0; i < len; i += 1) {
        const diff = (ka[i] ?? 0) - (kb[i] ?? 0);
        if (diff !== 0) return diff;
      }
      return 0;
    });
    return list;
  }, [catalog, search, programFilter]);

  const indicatorGroups = useMemo(() => buildIndicatorPickerGroups(items), [items]);

  const eventGroups = useMemo(
    () => buildEventPickerGroups(catalog, { programFilter, search }),
    [catalog, programFilter, search]
  );

  const idsForProgram = useMemo(
    () =>
      pickerView === 'events'
        ? eventIdsForProgram(catalog, programFilter)
        : catalog
            .filter((c) => programFilter === 'all' || c.program === programFilter)
            .map((c) => c.id),
    [catalog, programFilter, pickerView]
  );

  const toggleId = useCallback((id) => {
    setDraftIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const toggleGroupIds = useCallback((ids, select) => {
    setDraftIds((prev) => {
      if (select) {
        const set = new Set(prev);
        ids.forEach((id) => set.add(id));
        return [...set];
      }
      const remove = new Set(ids);
      return prev.filter((id) => !remove.has(id));
    });
  }, []);

  const applyPreset = useCallback(
    (preset) => {
      const valid = preset.ids.filter((id) => catalog.some((c) => c.id === id));
      setDraftIds(valid);
    },
    [catalog]
  );

  const apply = () => {
    onApply({ indicatorIds: draftIds });
    onClose();
  };

  if (!open) return null;

  const isEventsView = eventsOnly || pickerView === 'events';
  const hasSearch = Boolean(search.trim());
  const listEmpty = isEventsView ? !eventGroups.length : !items.length;

  const indicatorSections = indicatorGroups
    .map((group) => {
      if (!group.children.length && group.parent) {
        return { key: group.key, title: group.parent.label, items: [group.parent] };
      }
      const sectionItems = [
        ...(group.parent ? [group.parent] : []),
        ...group.children
      ];
      const title =
        group.parent?.label ||
        (group.key && group.children.length ? `${group.key}.` : VIZ_KH.indicator);
      return { key: group.key, title, items: sectionItems };
    })
    .filter((s) => s.items.length);

  return createPortal(
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-3 backdrop-blur-[2px] sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="viz-picker-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex max-h-[min(92vh,44rem)] w-full max-w-4xl flex-col overflow-hidden bg-card shadow-2xl shadow-black/15"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border/80 bg-muted/30 px-4 py-3">
          <div className="flex min-w-0 items-start gap-2">
            <RiListCheck2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0">
              <h2 id="viz-picker-title" className="text-base font-semibold text-foreground">
                {isEventsView ? VIZ_KH.modalEventsTitle : VIZ_KH.modalIndicatorsTitle}
              </h2>
              <p className={cn('mt-0.5 text-muted-foreground', P360_TABLE_TEXT)}>
                {isEventsView ? VIZ_KH.modalEventsHint : VIZ_KH.programFilterHint}
                {' · '}
                <strong className="font-semibold text-foreground">{draftIds.length}</strong>{' '}
                {VIZ_KH.selectedIndicators}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 shrink-0 items-center justify-center border border-border/80 bg-card hover:bg-muted/50"
            aria-label={VIZ_KH.modalCancel}
          >
            <RiCloseLine className="size-4" />
          </button>
        </div>

        <div className="shrink-0 space-y-2 border-b border-border/80 px-4 py-3">
          <div className="relative">
            <RiSearchLine
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isEventsView ? VIZ_KH.searchEvents : VIZ_KH.searchIndicators}
              autoFocus
              className={cn(p360ControlClass, 'h-9 w-full pl-9 text-[12px]')}
            />
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {!eventsOnly ? (
              <>
                <button
                  type="button"
                  onClick={() => setPickerView('events')}
                  className={appNavItemClass(isEventsView)}
                >
                  {VIZ_KH.pickerModeEvents}
                </button>
                <button
                  type="button"
                  onClick={() => setPickerView('all')}
                  className={appNavItemClass(!isEventsView)}
                >
                  {VIZ_KH.pickerModeAll}
                </button>
                <span className="mx-0.5 h-5 w-px bg-border/80" aria-hidden />
              </>
            ) : null}
            {programTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setProgramFilter(tab.id)}
                className={appNavItemClass(programFilter === tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <span className={cn('mr-1 shrink-0 text-muted-foreground', P360_TABLE_TEXT)}>
              {VIZ_KH.pickerQuickPresets}:
            </span>
            {Object.entries(VISUALIZE_PRESETS).map(([key, p]) => (
              <button
                key={key}
                type="button"
                onClick={() => applyPreset(p)}
                className={appNavItemClass(false)}
              >
                {PRESET_LABEL_KH[key] || p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {catalogLoading ? (
            <p className={cn('py-12 text-center text-muted-foreground', P360_TABLE_TEXT)}>
              {VIZ_KH.loadingCatalog}
            </p>
          ) : !catalog.length ? (
            <p className={cn('py-12 text-center text-muted-foreground', P360_TABLE_TEXT)}>
              {VIZ_KH.catalogEmpty}
            </p>
          ) : listEmpty ? (
            <p className={cn('py-12 text-center text-muted-foreground', P360_TABLE_TEXT)}>
              {VIZ_KH.pickerNoMatch}
            </p>
          ) : isEventsView ? (
            eventGroups.map((group) => (
              <PickerGroupSection
                key={group.key}
                title={group.title}
                items={group.events}
                draftIds={draftIds}
                onToggleId={toggleId}
                onToggleGroup={toggleGroupIds}
                forceOpen={hasSearch}
              />
            ))
          ) : (
            indicatorSections.map((section) => (
              <PickerGroupSection
                key={section.key}
                title={section.title}
                items={section.items}
                draftIds={draftIds}
                onToggleId={toggleId}
                onToggleGroup={toggleGroupIds}
                forceOpen={hasSearch}
              />
            ))
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border/80 bg-muted/20 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('font-medium tabular-nums text-foreground', P360_TABLE_TEXT)}>
              {draftIds.length} {isEventsView ? VIZ_KH.pickEvents : VIZ_KH.pickIndicators}
            </span>
            <span className="h-4 w-px bg-border/80" aria-hidden />
            <button
              type="button"
              onClick={() => setDraftIds(idsForProgram)}
              disabled={!idsForProgram.length}
              className={cn(appNavItemClass(false), 'disabled:opacity-40')}
            >
              {VIZ_KH.modalSelectAll}
            </button>
            <button type="button" onClick={() => setDraftIds([])} className={appNavItemClass(false)}>
              {VIZ_KH.modalClear}
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className={cn(appNavItemClass(false), 'min-w-[4.5rem]')}
            >
              {VIZ_KH.modalCancel}
            </button>
            <button
              type="button"
              onClick={apply}
              className={cn(
                appNavItemClass(true),
                'min-w-[4.5rem] border-primary/50 bg-primary/15 font-semibold'
              )}
            >
              {VIZ_KH.modalApply}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
