import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { RiCloseLine, RiListCheck2, RiSearchLine } from '@remixicon/react';
import { cn } from '@/lib/utils';
import { appNavItemClass } from '../layout/appNavStyles';
import { VIZ_KH } from '../../pages/visualizeKh';
import { labelForIndicatorId, VISUALIZE_PRESETS } from '../../constants/indicatorLabels';
import { buildIndicatorPickerGroups, indicatorSortKey } from '../../utils/visualizeChartData';
import { buildEventPickerGroups, eventIdsForProgram } from '../../utils/visualizeEventPicker';

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

  if (!open) return null;

  const toggleId = (id) => {
    setDraftIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const applyPreset = (preset) => {
    const valid = preset.ids.filter((id) => catalog.some((c) => c.id === id));
    setDraftIds(valid);
  };

  const apply = () => {
    onApply({ indicatorIds: draftIds });
    onClose();
  };

  const chipClass = (active) =>
    cn(
      'w-full border px-2 py-1 text-left text-[11px] leading-snug transition-colors',
      active
        ? 'border-primary/50 bg-primary/10 text-foreground'
        : 'border-border/70 bg-muted/5 text-foreground hover:bg-muted/25'
    );

  const isEventsView = eventsOnly || pickerView === 'events';
  const listEmpty = isEventsView ? !eventGroups.length : !items.length;

  return createPortal(
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-2 backdrop-blur-[2px] sm:p-3"
      role="dialog"
      aria-modal="true"
      aria-labelledby="viz-picker-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden bg-card shadow-2xl shadow-black/15"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/80 bg-muted/35 px-3 py-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <RiListCheck2 className="size-4 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0">
              <h2 id="viz-picker-title" className="truncate text-sm font-semibold text-foreground">
                {isEventsView ? VIZ_KH.modalEventsTitle : VIZ_KH.modalIndicatorsTitle}
              </h2>
              <p className="text-[10px] text-muted-foreground">
                {isEventsView ? VIZ_KH.modalEventsHint : null}
                {isEventsView ? ' · ' : ''}
                {draftIds.length} {VIZ_KH.selectedIndicators}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-7 shrink-0 items-center justify-center border border-border/80 bg-background hover:bg-muted/50"
            aria-label={VIZ_KH.modalCancel}
          >
            <RiCloseLine className="size-3.5" />
          </button>
        </div>

        <div className="shrink-0 space-y-1.5 border-b border-border/60 px-3 py-2">
          {!eventsOnly ? (
            <div className="flex flex-wrap gap-0.5">
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
            </div>
          ) : null}
          <div className="flex flex-wrap gap-0.5">
            {Object.values(VISUALIZE_PRESETS).map((p) => (
              <button key={p.label} type="button" onClick={() => applyPreset(p)} className={appNavItemClass(false)}>
                {p.label}
              </button>
            ))}
            {!isEventsView ? (
              <button
                type="button"
                onClick={() => setDraftIds(idsForProgram)}
                className={appNavItemClass(false)}
                disabled={!idsForProgram.length}
              >
                {VIZ_KH.modalSelectAll}
              </button>
            ) : null}
            <button type="button" onClick={() => setDraftIds([])} className={appNavItemClass(false)}>
              {VIZ_KH.modalClear}
            </button>
          </div>
          <div className="flex flex-wrap gap-0.5">
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
          <div className="relative">
            <RiSearchLine
              className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isEventsView ? VIZ_KH.searchEvents : VIZ_KH.searchIndicators}
              className="h-7 w-full border border-border/80 bg-background pl-7 pr-2 text-[11px] shadow-none focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/25"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
          {catalogLoading ? (
            <p className="py-6 text-center text-[11px] text-muted-foreground">{VIZ_KH.loadingCatalog}</p>
          ) : !catalog.length ? (
            <p className="py-6 text-center text-[11px] text-muted-foreground">{VIZ_KH.catalogEmpty}</p>
          ) : listEmpty ? (
            <p className="py-6 text-center text-[11px] text-muted-foreground">{VIZ_KH.catalogEmpty}</p>
          ) : isEventsView ? (
            <div className="space-y-2.5">
              {eventGroups.map((group) => (
                <section key={group.key} className="min-w-0">
                  <div className="mb-1 px-0.5 text-[10px] font-semibold text-muted-foreground">{group.title}</div>
                  <div
                    className={cn(
                      'grid gap-1 border-l-2 border-primary/20 pl-2',
                      group.events.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'
                    )}
                  >
                    {group.events.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleId(item.id)}
                        className={chipClass(draftIds.includes(item.id))}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {indicatorGroups.map((group) => {
                const showChildren = group.children.length > 0;
                const solo = !showChildren && group.parent;
                return (
                  <section key={group.key} className="min-w-0">
                    {solo ? (
                      <button
                        type="button"
                        onClick={() => toggleId(group.parent.id)}
                        className={chipClass(draftIds.includes(group.parent.id))}
                      >
                        {group.parent.label}
                      </button>
                    ) : (
                      <>
                        {group.parent ? (
                          <button
                            type="button"
                            onClick={() => toggleId(group.parent.id)}
                            className={cn(chipClass(draftIds.includes(group.parent.id)), 'mb-1 font-medium')}
                          >
                            {group.parent.label}
                          </button>
                        ) : showChildren ? (
                          <div className="mb-1 px-1 text-[10px] font-semibold tabular-nums text-muted-foreground">
                            {group.key}.
                          </div>
                        ) : null}
                        {showChildren ? (
                          <div
                            className={cn(
                              'grid gap-1 border-l-2 border-primary/20 pl-2',
                              group.children.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'
                            )}
                          >
                            {group.children.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => toggleId(item.id)}
                                className={chipClass(draftIds.includes(item.id))}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border/80 bg-muted/20 px-3 py-2">
          <span className="text-[10px] text-muted-foreground">
            {draftIds.length} {isEventsView ? VIZ_KH.pickEvents : VIZ_KH.pickIndicators}
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-7 items-center border border-border/80 bg-background px-2.5 text-[10px] hover:bg-muted/50"
            >
              {VIZ_KH.modalCancel}
            </button>
            <button
              type="button"
              onClick={apply}
              className="inline-flex h-7 items-center border border-primary/40 bg-primary/10 px-2.5 text-[10px] font-medium hover:bg-primary/15"
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
