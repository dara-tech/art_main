import { useCallback, useRef, useState } from 'react';
import { RiArrowDownSLine, RiArrowUpSLine, RiCheckLine, RiShieldCheckLine } from '@remixicon/react';
import { cn } from '@/lib/utils';
import {
  P360_TABLE_PAD,
  P360_TABLE_TEXT,
  appNavItemClass,
  p360CardClass,
  p360TabClass
} from '../layout/appNavStyles';
import { P360_KH } from '../../pages/patient360Kh';
import { VCCT_KH } from '../../pages/vcctKh';

function pageShortTitle(title, index) {
  const parts = String(title || '').split('—');
  return parts.length > 1 ? parts[1].trim() : `ទំព័រ ${index + 1}`;
}

function OptionTile({ selected, label, compact }) {
  return (
    <div
      className={cn(
        'flex min-w-0 items-start gap-2 border px-2.5 transition-colors',
        compact ? 'py-1.5' : 'py-2',
        selected
          ? 'border-primary/40 bg-primary/10 text-foreground'
          : 'border-border/80 bg-muted/15 text-muted-foreground'
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex size-4 shrink-0 items-center justify-center border text-[10px]',
          selected
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border/80 bg-background text-transparent'
        )}
        aria-hidden
      >
        {selected ? <RiCheckLine className="size-2.5" /> : null}
      </span>
      <span className={cn('min-w-0 flex-1 leading-snug', P360_TABLE_TEXT, selected && 'font-medium')}>
        {label}
      </span>
    </div>
  );
}

function YesNoPill({ active, children }) {
  return (
    <span
      className={cn(
        'inline-flex min-w-[2.75rem] items-center justify-center border px-2 py-0.5',
        P360_TABLE_TEXT,
        active
          ? 'border-primary/40 bg-primary/10 font-medium text-foreground'
          : 'border-border/80 bg-muted/15 text-muted-foreground/60'
      )}
    >
      {children}
    </span>
  );
}

function FormTextItem({ item }) {
  const empty = item.value == null || item.value === '' || item.value === '—';
  return (
    <div className="border border-border/80 bg-muted/10 px-3 py-2">
      <div className={cn('text-muted-foreground', P360_TABLE_TEXT)}>{item.label}</div>
      <div className={cn('mt-1', P360_TABLE_TEXT, empty ? 'italic text-muted-foreground/70' : 'text-foreground')}>
        {empty ? VCCT_KH.form.blank : item.value}
      </div>
    </div>
  );
}

function FormChoiceItem({ item }) {
  const options = item.options || [];
  const dense = options.length > 8;

  return (
    <div className="space-y-2">
      {item.label ? (
        <h5 className={cn('font-medium text-foreground/90', P360_TABLE_TEXT)}>{item.label}</h5>
      ) : null}
      <ul className={cn('grid gap-1.5', dense ? 'sm:grid-cols-2 xl:grid-cols-3' : 'sm:grid-cols-2')}>
        {options.map((opt) => (
          <li key={opt.id ?? opt.label}>
            <OptionTile selected={opt.selected} label={opt.label} compact={dense} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function FormYesNoItem({ item, flat = false }) {
  return (
    <div
      className={cn(
        'grid grid-cols-[auto_1fr_auto] items-center gap-x-3 px-3 py-2',
        P360_TABLE_TEXT,
        !flat && 'border border-border/80',
        flat && item.index != null && item.index % 2 === 0 ? 'bg-muted/15' : 'bg-background'
      )}
    >
      {item.index != null ? (
        <span className="flex size-6 shrink-0 items-center justify-center bg-muted/60 text-[10px] font-semibold tabular-nums text-muted-foreground">
          {item.index}
        </span>
      ) : (
        <span className="w-6 shrink-0" />
      )}
      <span className="min-w-0 leading-snug text-foreground">{item.label}</span>
      <div className="flex shrink-0 items-center gap-1.5">
        <YesNoPill active={item.yes}>{VCCT_KH.form.yes}</YesNoPill>
        <YesNoPill active={item.no}>{VCCT_KH.form.no}</YesNoPill>
      </div>
    </div>
  );
}

function FormNoteItem({ item }) {
  return (
    <p
      className={cn(
        'flex items-start gap-2 border border-dashed border-border/80 bg-muted/20 px-3 py-2 text-muted-foreground',
        P360_TABLE_TEXT
      )}
    >
      <RiShieldCheckLine className="mt-0.5 size-3.5 shrink-0 opacity-60" aria-hidden />
      <span>{item.text}</span>
    </p>
  );
}

function FormGroupBlock({ group }) {
  const hasRisk = (group.items || []).some((i) => i.type === 'yesNo' && i.index != null);
  const textItems = (group.items || []).filter((i) => i.type === 'text');
  const otherItems = (group.items || []).filter((i) => i.type !== 'text');

  return (
    <section className="space-y-3">
      {group.title ? (
        <h4
          className={cn(
            'border-b border-border/80 pb-1 font-medium text-foreground/90',
            P360_TABLE_TEXT
          )}
        >
          {group.title}
        </h4>
      ) : null}

      {textItems.length ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {textItems.map((item, idx) => (
            <FormTextItem key={`t-${idx}`} item={item} />
          ))}
        </div>
      ) : null}

      {hasRisk ? (
        <div className="overflow-hidden border border-border/80">
          <div
            className={cn(
              'grid grid-cols-[auto_1fr_auto] gap-x-3 border-b border-border/80 bg-muted/30 px-3 py-1.5 font-medium text-muted-foreground',
              P360_TABLE_TEXT
            )}
          >
            <span className="w-6 text-center">#</span>
            <span>{VCCT_KH.form.riskQuestion}</span>
            <span className="flex gap-1.5">
              <span className="min-w-[2.75rem] text-center">{VCCT_KH.form.yes}</span>
              <span className="min-w-[2.75rem] text-center">{VCCT_KH.form.no}</span>
            </span>
          </div>
          <div className="divide-y divide-border/80">
            {(group.items || [])
              .filter((i) => i.type === 'yesNo')
              .map((item, idx) => (
                <FormYesNoItem key={`y-${idx}`} item={item} flat />
              ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        {otherItems
          .filter((i) => !(hasRisk && i.type === 'yesNo'))
          .map((item, idx) => {
            if (item.type === 'single' || item.type === 'multi') {
              return <FormChoiceItem key={`c-${idx}`} item={item} />;
            }
            if (item.type === 'yesNo') return <FormYesNoItem key={`y-${idx}`} item={item} />;
            if (item.type === 'note') return <FormNoteItem key={`n-${idx}`} item={item} />;
            return null;
          })}
      </div>
    </section>
  );
}

function FormPageCard({ page, index, expanded, onToggle, pageRef }) {
  return (
    <article
      ref={pageRef}
      id={`vcct-page-${page.id}`}
      className={cn(p360CardClass, 'scroll-mt-16 overflow-hidden shadow-sm')}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex w-full min-h-8 items-center gap-2 border-b border-border/80 bg-muted/30 text-left font-medium text-foreground/90 hover:bg-muted/45',
          P360_TABLE_PAD,
          P360_TABLE_TEXT
        )}
      >
        <span className="shrink-0 tabular-nums text-muted-foreground">{index + 1}/5</span>
        <span className="min-w-0 flex-1 truncate">{pageShortTitle(page.title, index)}</span>
        {expanded ? (
          <RiArrowUpSLine className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        ) : (
          <RiArrowDownSLine className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        )}
      </button>

      {expanded ? (
        <div className={cn('space-y-4 py-3', P360_TABLE_PAD, P360_TABLE_TEXT)}>
          {(page.groups || []).map((group, gi) => (
            <FormGroupBlock key={`${page.id}-g-${gi}`} group={group} />
          ))}
        </div>
      ) : null}
    </article>
  );
}

export default function VcctFormView({ pages }) {
  const pageRefs = useRef({});
  const [expanded, setExpanded] = useState(() => new Set(pages?.map((p) => p.id) || []));
  const [activePage, setActivePage] = useState(pages?.[0]?.id || null);

  const allExpanded = pages?.length && expanded.size === pages.length;

  const scrollToPage = useCallback((pageId) => {
    setActivePage(pageId);
    setExpanded((prev) => new Set(prev).add(pageId));
    requestAnimationFrame(() => {
      pageRefs.current[pageId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const togglePage = useCallback((pageId) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) next.delete(pageId);
      else next.add(pageId);
      return next;
    });
    setActivePage(pageId);
  }, []);

  const toggleAll = useCallback(() => {
    if (allExpanded) setExpanded(new Set());
    else setExpanded(new Set(pages.map((p) => p.id)));
  }, [allExpanded, pages]);

  if (!pages?.length) {
    return (
      <p className={cn(P360_TABLE_PAD, P360_TABLE_TEXT, 'text-muted-foreground')}>
        {P360_KH.vcct.noDetail}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className={cn(p360CardClass, 'sticky top-0 z-10 overflow-hidden shadow-sm bg-card/95 backdrop-blur-sm')}>
        <div
          className={cn(
            'flex min-h-8 flex-wrap items-center gap-1 border-b border-border/80 bg-muted/15 py-1.5',
            P360_TABLE_PAD
          )}
        >
          <span className={cn('mr-1 shrink-0 text-muted-foreground', P360_TABLE_TEXT)}>
            {VCCT_KH.form.jumpTo}
          </span>
          {pages.map((page, index) => (
            <button
              key={page.id}
              type="button"
              onClick={() => scrollToPage(page.id)}
              className={p360TabClass(activePage === page.id)}
              title={page.title}
            >
              {index + 1}. {pageShortTitle(page.title, index)}
            </button>
          ))}
          <button
            type="button"
            onClick={toggleAll}
            className={cn(appNavItemClass(false), 'ml-auto')}
          >
            {allExpanded ? VCCT_KH.form.collapseAll : VCCT_KH.form.expandAll}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {pages.map((page, index) => (
          <FormPageCard
            key={page.id}
            page={page}
            index={index}
            expanded={expanded.has(page.id)}
            onToggle={() => togglePage(page.id)}
            pageRef={(el) => {
              pageRefs.current[page.id] = el;
            }}
          />
        ))}
      </div>
    </div>
  );
}
