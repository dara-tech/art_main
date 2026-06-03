import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { RiCloseLine, RiFilter3Line } from '@remixicon/react';
import { cn } from '@/lib/utils';
import { appNavItemClass, P360_TABLE_TEXT, p360ControlClass } from '../layout/appNavStyles';
import { P360_KH } from '../../pages/patient360Kh';
import { P360_LIST_FILTER_EMPTY, normalizeListFilters } from './patient360ListFilters';

const SEX_OPTIONS = [
  { id: '', label: P360_KH.list.filterSexAll },
  { id: '1', label: P360_KH.list.filterSexMale },
  { id: '0', label: P360_KH.list.filterSexFemale }
];

const STATUS_OPTIONS = [
  { id: '', label: P360_KH.list.filterStatusAll },
  { id: '0', label: P360_KH.list.filterStatusLost },
  { id: '1', label: P360_KH.list.filterStatusDead },
  { id: '3', label: P360_KH.list.filterStatusTransfer }
];

export default function Patient360ListFilterModal({
  open,
  onClose,
  filters,
  programFilters = [],
  onApply
}) {
  const [draft, setDraft] = useState(P360_LIST_FILTER_EMPTY);

  useEffect(() => {
    if (open) setDraft(normalizeListFilters(filters));
  }, [open, filters]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const apply = () => {
    onApply(normalizeListFilters(draft));
    onClose();
  };

  const reset = () => setDraft({ ...P360_LIST_FILTER_EMPTY });

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="p360-filter-modal-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden bg-card shadow-2xl shadow-black/15 border-none rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between bg-[#2a1720] border-b border-white/10 px-5 py-3.5 text-white">
          <div className="flex items-center gap-2">
            <RiFilter3Line className="size-5" fill="url(#icon-gradient)" aria-hidden />
            <div>
              <h2 id="p360-filter-modal-title" className="text-base font-semibold text-white">
                {P360_KH.list.filterTitle}
              </h2>
              <p className="mt-0.5 text-xs text-white/70">{P360_KH.list.filterHint}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-md cursor-pointer text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={P360_KH.list.filterClose}
          >
            <RiCloseLine className="size-4.5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div>
            <div className={cn('mb-2 font-medium text-muted-foreground', P360_TABLE_TEXT)}>
              {P360_KH.list.filterProgram}
            </div>
            <div className="flex flex-wrap gap-1">
              {programFilters.map((f) => (
                <button
                  key={f.id || 'all'}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, program: f.id }))}
                  className={appNavItemClass(draft.program === f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="p360-filter-q"
              className={cn('mb-1.5 block font-medium text-muted-foreground', P360_TABLE_TEXT)}
            >
              {P360_KH.search}
            </label>
            <input
              id="p360-filter-q"
              value={draft.q}
              onChange={(e) => setDraft((d) => ({ ...d, q: e.target.value }))}
              placeholder={P360_KH.searchPlaceholder}
              className={cn(p360ControlClass, 'w-full')}
            />
          </div>

          <div>
            <div className={cn('mb-2 font-medium text-muted-foreground', P360_TABLE_TEXT)}>
              {P360_KH.summary.sex}
            </div>
            <div className="flex flex-wrap gap-1">
              {SEX_OPTIONS.map((opt) => (
                <button
                  key={opt.id || 'all'}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, sex: opt.id }))}
                  className={appNavItemClass(draft.sex === opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="p360-filter-province"
              className={cn('mb-1.5 block font-medium text-muted-foreground', P360_TABLE_TEXT)}
            >
              {P360_KH.summary.province}
            </label>
            <input
              id="p360-filter-province"
              value={draft.province}
              onChange={(e) => setDraft((d) => ({ ...d, province: e.target.value }))}
              placeholder={P360_KH.list.filterProvincePlaceholder}
              className={cn(p360ControlClass, 'w-full')}
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border/80 bg-muted/20 px-5 py-3">
          <button
            type="button"
            onClick={reset}
            className="border border-border/80 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/40"
          >
            {P360_KH.list.filterReset}
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="border border-border/80 bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted/40"
            >
              {P360_KH.list.filterCancel}
            </button>
            <button
              type="button"
              onClick={apply}
              className="border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/15"
            >
              {P360_KH.list.filterApply}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
