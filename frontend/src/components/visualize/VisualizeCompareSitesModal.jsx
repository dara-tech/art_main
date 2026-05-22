import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiCheckboxBlankCircleLine,
  RiCheckboxCircleFill,
  RiCloseLine,
  RiSearchLine
} from '@remixicon/react';
import { cn } from '@/lib/utils';
import { buildSiteSelectionModel, isFacilitySite } from '@/utils/siteSelection';
import { appNavItemClass, p360ControlClass } from '../layout/appNavStyles';
import { VIZ_KH } from '../../pages/visualizeKh';

export const VIZ_COMPARE_MAX = 8;

function facilityCodesFromGroup(group) {
  return (group.sites || []).filter(isFacilitySite).map((s) => String(s.code));
}

export default function VisualizeCompareSitesModal({
  sites = [],
  value = [],
  onChange,
  disabled = false,
  className = '',
  maxSites = VIZ_COMPARE_MAX
}) {
  const mt = VIZ_KH.compareModal;
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState(() => [...(value || [])]);
  const [expandedProvinces, setExpandedProvinces] = useState({});

  const { provinceGroups, siteLabelByCode } = useMemo(() => buildSiteSelectionModel(sites), [sites]);

  const summary = useMemo(() => {
    const codes = value || [];
    if (!codes.length) return mt.selectPlaceholder;
    if (codes.length === 1) return siteLabelByCode.get(String(codes[0])) || codes[0];
    return `${codes.length} ${mt.sitesSelected}`;
  }, [value, siteLabelByCode, mt]);

  const searchLower = search.trim().toLowerCase();
  const visibleProvinceEntries = useMemo(() => {
    return provinceGroups
      .filter((group) => group.province !== 'Cambodia')
      .map((group) => ({
        ...group,
        sites: (group.sites || []).filter(isFacilitySite)
      }))
      .filter((group) => {
        if (!group.sites.length) return false;
        if (!searchLower) return true;
        if (String(group.province || '').toLowerCase().includes(searchLower)) return true;
        return group.sites.some(
          (s) =>
            String(s.name || '').toLowerCase().includes(searchLower) ||
            String(s.code || '').toLowerCase().includes(searchLower)
        );
      });
  }, [provinceGroups, searchLower]);

  useEffect(() => {
    if (!open) setDraft([...(value || [])]);
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
    setDraft([...(value || [])]);
    setSearch('');
    setOpen(true);
    const firstKey = visibleProvinceEntries[0]?.key;
    if (firstKey) setExpandedProvinces((prev) => ({ ...prev, [firstKey]: true }));
  };

  const toggleProvince = (provinceKey) =>
    setExpandedProvinces((prev) => ({ ...prev, [provinceKey]: !prev[provinceKey] }));

  const toggleCode = (code) => {
    const c = String(code);
    setDraft((prev) => {
      if (prev.includes(c)) return prev.filter((x) => x !== c);
      if (prev.length >= maxSites) return prev;
      return [...prev, c];
    });
  };

  const addCodes = (codes) => {
    setDraft((prev) => {
      const next = [...prev];
      for (const raw of codes) {
        const c = String(raw);
        if (next.includes(c)) continue;
        if (next.length >= maxSites) break;
        next.push(c);
      }
      return next;
    });
  };

  const toggleProvinceFacilities = (group) => {
    const codes = facilityCodesFromGroup(group);
    const allSelected = codes.length > 0 && codes.every((c) => draft.includes(c));
    if (allSelected) {
      setDraft((prev) => prev.filter((c) => !codes.includes(c)));
      return;
    }
    addCodes(codes.filter((c) => !draft.includes(c)));
  };

  const selectAllVisible = () => {
    const codes = visibleProvinceEntries.flatMap(facilityCodesFromGroup);
    addCodes(codes);
  };

  const applySelection = () => {
    if (!draft.length) return;
    onChange?.(draft);
    setOpen(false);
  };

  const CheckIcon = ({ on }) =>
    on ? (
      <RiCheckboxCircleFill className="size-5 text-primary" />
    ) : (
      <RiCheckboxBlankCircleLine className="size-5 text-muted-foreground" />
    );

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        disabled={disabled}
        className={cn(
          p360ControlClass,
          'w-full border bg-background px-3 text-left font-medium transition hover:bg-muted/20 disabled:opacity-50',
          className
        )}
      >
        {summary}
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="viz-compare-sites-title"
          >
            <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden bg-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-border/80 bg-muted/35 px-6 py-4">
                <div>
                  <div id="viz-compare-sites-title" className="text-lg font-semibold">
                    {mt.title}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{mt.hint}</div>
                </div>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center border border-border/80 bg-background hover:bg-muted"
                  onClick={() => setOpen(false)}
                  aria-label={mt.cancel}
                >
                  <RiCloseLine className="size-5" />
                </button>
              </div>

              <div className="border-b border-border/80 px-6 py-3">
                <div className="relative">
                  <RiSearchLine className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={mt.filterPlaceholder}
                    className="h-10 w-full border border-border/80 bg-background pl-10 pr-3 text-sm"
                  />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1">
                  <button type="button" className={appNavItemClass(false)} onClick={selectAllVisible}>
                    {VIZ_KH.modalSelectAll}
                  </button>
                  <button type="button" className={appNavItemClass(false)} onClick={() => setDraft([])}>
                    {VIZ_KH.modalClear}
                  </button>
                  <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                    {draft.length} / {maxSites} {mt.sitesSelected}
                  </span>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-auto px-6 py-4">
                <div className="space-y-2 border border-border/80 bg-background/60 p-3 shadow-inner">
                  {visibleProvinceEntries.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">{mt.filterPlaceholder}</p>
                  ) : (
                    visibleProvinceEntries.map((group) => {
                      const province = group.province;
                      const provinceSites = group.sites;
                      const isExpanded = expandedProvinces[group.key] ?? false;
                      const codes = facilityCodesFromGroup(group);
                      const selectedInProvince = codes.filter((c) => draft.includes(c)).length;
                      const allInProvince = codes.length > 0 && selectedInProvince === codes.length;
                      const someInProvince = selectedInProvince > 0 && !allInProvince;

                      return (
                        <div key={group.key} className="px-1 py-1 hover:bg-muted/20">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleProvince(group.key)}
                              className="inline-flex h-7 w-7 shrink-0 items-center justify-center border border-border/80 bg-background"
                              aria-expanded={isExpanded}
                            >
                              {isExpanded ? (
                                <RiArrowDownSLine className="size-4" />
                              ) : (
                                <RiArrowRightSLine className="size-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleProvinceFacilities(group)}
                              className={cn(
                                'flex h-9 min-w-0 flex-1 items-center gap-2 px-1 text-left',
                                allInProvince && 'bg-primary/10',
                                someInProvince && 'bg-muted/50'
                              )}
                              title={mt.selectProvinceHint}
                            >
                              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
                                <CheckIcon on={allInProvince} />
                              </span>
                              <span className="truncate text-sm font-semibold text-foreground">{province}</span>
                              <span className="shrink-0 text-xs text-muted-foreground">
                                ({selectedInProvince}/{provinceSites.length})
                              </span>
                            </button>
                          </div>
                          {isExpanded ? (
                            <div className="ml-12 mt-1 space-y-0.5 border-l border-border/80 pl-4">
                              {provinceSites.map((site) => {
                                const code = String(site.code);
                                const active = draft.includes(code);
                                const atMax = !active && draft.length >= maxSites;
                                return (
                                  <button
                                    key={code}
                                    type="button"
                                    disabled={atMax}
                                    onClick={() => toggleCode(code)}
                                    className={cn(
                                      'flex h-9 w-full items-center gap-3 px-3 text-left hover:bg-muted/40',
                                      active && 'bg-primary/10',
                                      atMax && 'cursor-not-allowed opacity-40'
                                    )}
                                  >
                                    <span className="inline-flex h-5 w-5 shrink-0">
                                      <CheckIcon on={active} />
                                    </span>
                                    <span className="truncate text-sm text-foreground">
                                      {site.code} - {site.name}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-border/80 bg-muted/25 px-6 py-4">
                <button
                  type="button"
                  className="h-9 px-5 text-sm text-muted-foreground hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  {mt.cancel}
                </button>
                <button
                  type="button"
                  className="h-10 bg-primary px-6 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                  onClick={applySelection}
                  disabled={!draft.length}
                >
                  {mt.apply}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
