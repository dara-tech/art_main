import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  RiCloseLine,
  RiDraggable,
  RiLayoutColumnLine,
  RiSearchLine
} from '@remixicon/react';
import { cn } from '@/lib/utils';
import { P360_TABLE_TEXT } from '../layout/appNavStyles';
import { P360_KH } from '../../pages/patient360Kh';
import {
  defaultListColumnOrder,
  getAvailableListColumns,
  labelForListColumn,
  moveColumnOrder,
  P360_LIST_LOCKED_COLUMN,
  toggleColumnInOrder
} from './patient360ListColumns';

export default function Patient360ListColumnConfigModal({
  open,
  onClose,
  programFilter = '',
  columnOrder,
  onColumnOrderChange
}) {
  const [draftOrder, setDraftOrder] = useState(columnOrder);
  const [search, setSearch] = useState('');
  const [dragId, setDragId] = useState('');

  const available = useMemo(() => getAvailableListColumns(programFilter), [programFilter]);

  useEffect(() => {
    if (open) {
      setDraftOrder(columnOrder);
      setSearch('');
      setDragId('');
    }
  }, [open, columnOrder]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const visibleSet = useMemo(() => new Set(draftOrder), [draftOrder]);
  const searchLower = search.trim().toLowerCase();
  const filteredAvailable = useMemo(() => {
    if (!searchLower) return available;
    return available.filter(
      (c) =>
        c.label.toLowerCase().includes(searchLower) || c.id.toLowerCase().includes(searchLower)
    );
  }, [available, searchLower]);

  const apply = () => {
    onColumnOrderChange(draftOrder);
    onClose();
  };

  const reset = () => {
    setDraftOrder(defaultListColumnOrder(programFilter));
  };

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="p360-column-config-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden bg-card shadow-2xl shadow-black/15 border-none rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between bg-[#2a1720] border-b border-white/10 px-5 py-3.5 text-white">
          <div className="flex items-center gap-2">
            <RiLayoutColumnLine className="size-5" fill="url(#icon-gradient)" aria-hidden />
            <div>
              <h2 id="p360-column-config-title" className="text-base font-semibold text-white">
                {P360_KH.list.columnConfigTitle}
              </h2>
              <p className="mt-0.5 text-xs text-white/70">{P360_KH.list.columnConfigHint}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-md cursor-pointer text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={P360_KH.list.columnConfigClose}
          >
            <RiCloseLine className="size-4.5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {draftOrder.length > 0 ? (
            <div className="mb-4">
              <div className={cn('mb-2 font-medium text-muted-foreground', P360_TABLE_TEXT)}>
                {P360_KH.list.columnConfigVisible}
              </div>
              <div className="flex flex-wrap gap-2">
                {draftOrder.map((id) => (
                  <button
                    key={`drag-${id}`}
                    type="button"
                    draggable={id !== P360_LIST_LOCKED_COLUMN}
                    onDragStart={() => setDragId(id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (id !== P360_LIST_LOCKED_COLUMN) {
                        setDraftOrder((prev) => moveColumnOrder(prev, dragId, id));
                      }
                      setDragId('');
                    }}
                    className={cn(
                      'inline-flex items-center gap-1.5 border border-border/80 bg-background px-2 py-1.5 shadow-sm',
                      P360_TABLE_TEXT,
                      id === P360_LIST_LOCKED_COLUMN
                        ? 'cursor-default opacity-90'
                        : 'cursor-grab active:cursor-grabbing'
                    )}
                  >
                    {id !== P360_LIST_LOCKED_COLUMN ? (
                      <RiDraggable className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                    ) : null}
                    {labelForListColumn(id)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="relative mb-3">
            <RiSearchLine
              className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={P360_KH.list.columnConfigSearch}
              className="h-9 w-full border border-border/80 bg-background pl-8 pr-2 text-xs shadow-none focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/25"
            />
          </div>

          <div className={cn('mb-2 font-medium text-muted-foreground', P360_TABLE_TEXT)}>
            {P360_KH.list.columnConfigAll}
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {filteredAvailable.map((col) => {
              const checked = visibleSet.has(col.id);
              const locked = col.id === P360_LIST_LOCKED_COLUMN;
              return (
                <label
                  key={col.id}
                  className={cn(
                    'flex min-h-9 cursor-pointer items-center gap-2 border border-border/70 bg-muted/10 px-2.5 py-1.5',
                    P360_TABLE_TEXT,
                    locked && 'cursor-default opacity-80'
                  )}
                >
                  <input
                    type="checkbox"
                    className="size-4 shrink-0 rounded-none border border-border accent-primary"
                    checked={checked}
                    disabled={locked}
                    onChange={(e) => {
                      setDraftOrder((prev) =>
                        toggleColumnInOrder(prev, col.id, e.target.checked, programFilter)
                      );
                    }}
                  />
                  <span className="min-w-0 truncate">{col.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border/80 bg-muted/20 px-5 py-3">
          <button
            type="button"
            onClick={reset}
            className="border border-border/80 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/40"
          >
            {P360_KH.list.columnConfigReset}
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="border border-border/80 bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted/40"
            >
              {P360_KH.list.columnConfigCancel}
            </button>
            <button
              type="button"
              onClick={apply}
              className="border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/15"
            >
              {P360_KH.list.columnConfigApply}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
