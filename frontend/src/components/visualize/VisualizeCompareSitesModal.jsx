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
import {
  buildSiteSelectionModel,
  facilityCodesFromSites,
  inferCompareSelectionLevel,
  isFacilitySite,
  isProvinceCompareCode
} from '@/utils/siteSelection';
import { appNavItemClass, p360ControlClass } from '../layout/appNavStyles';
import { VIZ_KH } from '../../pages/visualizeKh';

export const VIZ_COMPARE_MAX = 80;

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
  const [selectionLevel, setSelectionLevel] = useState(() => inferCompareSelectionLevel(value));
  const [expandedCambodia, setExpandedCambodia] = useState(true);
  const [expandedProvinces, setExpandedProvinces] = useState({});

  const { provinceGroups, siteLabelByCode, cambodiaSite, selectableSites, provinceCodeByKey, provinceOptions } =
    useMemo(() => buildSiteSelectionModel(sites), [sites]);

  const allFacilityCodes = useMemo(() => facilityCodesFromSites(selectableSites), [selectableSites]);
  const allProvinceCodes = useMemo(
    () => provinceOptions.map((group) => String(group.code)).filter(Boolean),
    [provinceOptions]
  );
  const isProvinceMode = selectionLevel === 'province';

  const summary = useMemo(() => {
    const codes = value || [];
    if (!codes.length) return mt.selectPlaceholder;
    if (isProvinceCompareCode(codes[0]) || codes.every(isProvinceCompareCode)) {
      if (codes.length === 1) return siteLabelByCode.get(String(codes[0])) || codes[0];
      if (codes.length === allProvinceCodes.length && allProvinceCodes.length > 0) {
        return `${mt.cambodia} (${codes.length})`;
      }
      return `${codes.length} ${mt.provincesSelected}`;
    }
    if (codes.length === 1) return siteLabelByCode.get(String(codes[0])) || codes[0];
    if (codes.length === allFacilityCodes.length && allFacilityCodes.length > 0) {
      return `${mt.cambodia} (${codes.length})`;
    }
    return `${codes.length} ${mt.sitesSelected}`;
  }, [value, siteLabelByCode, mt, allFacilityCodes.length, allProvinceCodes.length]);

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
            String(s.code || '').toLowerCase().includes(searchLower) ||
            String(s.od_code || s.odCode || '').toLowerCase().includes(searchLower)
        );
      });
  }, [provinceGroups, searchLower]);

  useEffect(() => {
    if (!open) {
      setDraft([...(value || [])]);
      setSelectionLevel(inferCompareSelectionLevel(value));
    }
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
    const nextLevel = inferCompareSelectionLevel(value);
    setDraft([...(value || [])]);
    setSelectionLevel(nextLevel);
    setSearch('');
    setOpen(true);
    setExpandedCambodia(true);
    if (nextLevel === 'facility') {
      const firstKey = visibleProvinceEntries[0]?.key;
      if (firstKey) setExpandedProvinces((prev) => ({ ...prev, [firstKey]: true }));
    }
  };

  const switchSelectionLevel = (level) => {
    if (level === selectionLevel) return;
    setSelectionLevel(level);
    setDraft([]);
    setExpandedProvinces({});
  };

  const provinceCodeFromGroup = (group) => provinceCodeByKey.get(group.key) || '';

  const provinceCodesFromGroups = (groups) =>
    groups.map(provinceCodeFromGroup).filter(Boolean).map(String);

  const toggleProvinceExpand = (provinceKey) =>
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

  const toggleCodes = (codes) => {
    const list = codes.map(String);
    const allSelected = list.length > 0 && list.every((c) => draft.includes(c));
    if (allSelected) {
      setDraft((prev) => prev.filter((c) => !list.includes(c)));
      return;
    }
    addCodes(list.filter((c) => !draft.includes(c)));
  };

  const toggleProvinceFacilities = (group) => toggleCodes(facilityCodesFromGroup(group));

  const toggleProvinceCode = (group) => {
    const code = provinceCodeFromGroup(group);
    if (code) toggleCode(code);
  };

  const selectAllCambodia = () => addCodes(isProvinceMode ? allProvinceCodes : allFacilityCodes);

  const selectAllVisible = () => {
    const codes = isProvinceMode
      ? provinceCodesFromGroups(visibleProvinceEntries)
      : visibleProvinceEntries.flatMap(facilityCodesFromGroup);
    addCodes(codes);
  };

  const applySelection = () => {
    if (!draft.length) return;
    onChange?.(draft);
    setOpen(false);
  };

  const cambodiaSelectedCount = isProvinceMode
    ? allProvinceCodes.filter((c) => draft.includes(c)).length
    : allFacilityCodes.filter((c) => draft.includes(c)).length;
  const cambodiaTotalCount = isProvinceMode ? allProvinceCodes.length : allFacilityCodes.length;
  const allCambodiaSelected = cambodiaTotalCount > 0 && cambodiaSelectedCount === cambodiaTotalCount;
  const someCambodiaSelected = cambodiaSelectedCount > 0 && !allCambodiaSelected;
  const selectionCountLabel = isProvinceMode ? mt.provincesSelected : mt.sitesSelected;

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
            <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden bg-card shadow-2xl shadow-black/15 border-none rounded-2xl">
              <div className="flex items-center justify-between bg-[#2a1720] border-b border-white/10 px-6 py-3.5 text-white">
                <div>
                  <div id="viz-compare-sites-title" className="text-base font-semibold text-white">
                    {mt.title}
                  </div>
                  <div className="mt-0.5 text-xs text-white/70">
                    {isProvinceMode ? mt.hintProvince : mt.hint}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex size-7 shrink-0 items-center justify-center rounded-md cursor-pointer text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label={mt.cancel}
                >
                  <RiCloseLine className="size-4.5" />
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
                  <div className="flex shrink-0 gap-0.5" role="group" aria-label={mt.selectionLevelLabel}>
                    <button
                      type="button"
                      className={cn(appNavItemClass(selectionLevel === 'facility'), selectionLevel === 'facility' && 'bg-primary/10')}
                      onClick={() => switchSelectionLevel('facility')}
                    >
                      {mt.selectionLevelFacility}
                    </button>
                    <button
                      type="button"
                      className={cn(appNavItemClass(selectionLevel === 'province'), selectionLevel === 'province' && 'bg-primary/10')}
                      onClick={() => switchSelectionLevel('province')}
                    >
                      {mt.selectionLevelProvince}
                    </button>
                  </div>
                  <button type="button" className={appNavItemClass(false)} onClick={selectAllCambodia}>
                    {mt.selectAllCambodia}
                  </button>
                  <button type="button" className={appNavItemClass(false)} onClick={selectAllVisible}>
                    {mt.selectAllVisible}
                  </button>
                  <button type="button" className={appNavItemClass(false)} onClick={() => setDraft([])}>
                    {VIZ_KH.modalClear}
                  </button>
                  <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                    {draft.length} / {maxSites} {selectionCountLabel}
                  </span>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-auto px-6 py-4">
                <div className="space-y-2 border border-border/80 bg-background/60 p-3 shadow-inner">
                  <div className="px-1 py-1 hover:bg-muted/20">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setExpandedCambodia((v) => !v)}
                        className="inline-flex h-7 w-7 shrink-0 items-center justify-center border border-border/80 bg-background"
                        aria-expanded={expandedCambodia}
                      >
                        {expandedCambodia ? (
                          <RiArrowDownSLine className="size-4" />
                        ) : (
                          <RiArrowRightSLine className="size-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleCodes(isProvinceMode ? allProvinceCodes : allFacilityCodes)}
                        className={cn(
                          'flex h-9 min-w-0 flex-1 items-center gap-2 px-1 text-left',
                          allCambodiaSelected && 'bg-primary/10',
                          someCambodiaSelected && 'bg-muted/50'
                        )}
                        title={isProvinceMode ? mt.selectAllProvincesHint : mt.selectCambodiaHint}
                      >
                        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
                          <CheckIcon on={allCambodiaSelected} />
                        </span>
                        <span className="truncate text-sm font-semibold text-foreground">
                          {cambodiaSite
                            ? `${cambodiaSite.code} - ${cambodiaSite.name}`
                            : mt.cambodia}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          ({cambodiaSelectedCount}/{cambodiaTotalCount})
                        </span>
                      </button>
                    </div>

                    {expandedCambodia ? (
                      <div className="ml-12 mt-1 space-y-0.5 border-l border-border/80 pl-4">
                        {visibleProvinceEntries.length === 0 ? (
                          <p className="py-6 text-center text-sm text-muted-foreground">
                            {mt.filterPlaceholder}
                          </p>
                        ) : (
                          visibleProvinceEntries.map((group) => {
                            const province = group.province;
                            const provinceSites = group.sites;
                            const provinceCode = provinceCodeFromGroup(group);
                            const searchMatchesProvince =
                              searchLower &&
                              String(province || '').toLowerCase().includes(searchLower);
                            const searchMatchesFacility =
                              searchLower &&
                              provinceSites.some(
                                (s) =>
                                  String(s.name || '').toLowerCase().includes(searchLower) ||
                                  String(s.code || '').toLowerCase().includes(searchLower)
                              );
                            const isExpanded =
                              expandedProvinces[group.key] ??
                              Boolean(searchMatchesProvince || searchMatchesFacility);
                            const codes = isProvinceMode
                              ? provinceCode
                                ? [provinceCode]
                                : []
                              : facilityCodesFromGroup(group);
                            const selectedInProvince = codes.filter((c) => draft.includes(c)).length;
                            const allInProvince = codes.length > 0 && selectedInProvince === codes.length;
                            const someInProvince = selectedInProvince > 0 && !allInProvince;
                            const countLabel = isProvinceMode
                              ? allInProvince
                                ? '(1/1)'
                                : '(0/1)'
                              : `(${selectedInProvince}/${provinceSites.length})`;

                            if (isProvinceMode && !provinceCode) return null;

                            return (
                              <div key={group.key} className="px-1 py-1 hover:bg-muted/20">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => toggleProvinceExpand(group.key)}
                                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center border border-border/80 bg-background hover:bg-muted/40"
                                    aria-expanded={isExpanded}
                                    title={mt.expandProvinceHint}
                                  >
                                    {isExpanded ? (
                                      <RiArrowDownSLine className="size-4" />
                                    ) : (
                                      <RiArrowRightSLine className="size-4" />
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => toggleProvinceExpand(group.key)}
                                    className={cn(
                                      'flex h-9 min-w-0 flex-1 items-center gap-2 px-1 text-left hover:bg-muted/30',
                                      isExpanded && 'bg-muted/40'
                                    )}
                                    title={mt.expandProvinceHint}
                                  >
                                    <span className="truncate text-sm font-semibold text-foreground">
                                      {province}
                                    </span>
                                    <span className="shrink-0 text-xs text-muted-foreground">{countLabel}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      isProvinceMode ? toggleProvinceCode(group) : toggleProvinceFacilities(group)
                                    }
                                    className={cn(
                                      'inline-flex h-9 w-9 shrink-0 items-center justify-center hover:bg-muted/40',
                                      allInProvince && 'bg-primary/10',
                                      someInProvince && 'bg-muted/50'
                                    )}
                                    title={mt.selectProvinceHint}
                                  >
                                    <CheckIcon on={allInProvince} />
                                  </button>
                                </div>

                                {isExpanded ? (
                                  <div className="ml-12 mt-1 space-y-0.5 border-l border-border/80 pl-4">
                                    {provinceSites.map((site) => {
                                      const code = String(site.code);
                                      const active = draft.includes(code);
                                      const atMax = !active && draft.length >= maxSites;
                                      if (isProvinceMode) {
                                        return (
                                          <div
                                            key={code}
                                            className="flex h-8 items-center gap-3 px-2 text-xs text-muted-foreground"
                                            title={mt.viewFacilitiesHint}
                                          >
                                            <span className="inline-flex h-4 w-4 shrink-0 opacity-50">
                                              <CheckIcon on={active} />
                                            </span>
                                            <span className="truncate">
                                              {site.code} - {site.name}
                                            </span>
                                          </div>
                                        );
                                      }
                                      return (
                                        <button
                                          key={code}
                                          type="button"
                                          disabled={atMax}
                                          onClick={() => toggleCode(code)}
                                          className={cn(
                                            'flex h-8 w-full items-center gap-3 px-2 text-left hover:bg-muted/40',
                                            active && 'bg-primary/10',
                                            atMax && 'cursor-not-allowed opacity-40'
                                          )}
                                        >
                                          <span className="inline-flex h-4 w-4 shrink-0">
                                            <CheckIcon on={active} />
                                          </span>
                                          <span className="truncate text-xs text-foreground">
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
                    ) : null}
                  </div>
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
