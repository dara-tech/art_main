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
import {
  buildSiteSelectionModel,
  isFacilitySite,
  isFacilitySiteCode
} from '@/utils/siteSelection';
import { filterControlClass, filterLabelClass } from '@/components/ui/RunButton';
import { cn } from '@/lib/utils';
import { p360ControlClass } from '../layout/appNavStyles';

const controlClass = (compact) =>
  compact ? p360ControlClass : `${filterControlClass} rounded-none bg-background shadow-sm border-border/80`;

const SITE_MODAL_TEXT_DEFAULTS = {
  selectPlaceholder: 'Select site',
  titleFacility: 'Select Facility',
  titleSite: 'Select Site',
  hintFacility: 'Choose one facility site to run checks.',
  hintSite: 'Choose a site by province.',
  filterPlaceholder: 'Filter sites...',
  cancel: 'Cancel',
  apply: 'Apply Selection',
  draft: 'Draft:'
};

export default function SiteSelectModal({
  sites = [],
  value = '',
  onChange,
  facilityOnly = false,
  label = 'Site',
  disabled = false,
  className = '',
  modalText = null,
  showLabel = true,
  compact = false
}) {
  const mt = { ...SITE_MODAL_TEXT_DEFAULTS, ...(modalText || {}) };
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [draftCode, setDraftCode] = useState(value || '');
  const [expandedProvinces, setExpandedProvinces] = useState({});
  const [expandedCambodia, setExpandedCambodia] = useState(true);

  const model = useMemo(() => buildSiteSelectionModel(sites), [sites]);
  const {
    selectableSites,
    provinceGroups,
    cambodiaSite,
    cambodiaValue,
    provinceCodeByKey,
    siteLabelByCode
  } = model;

  const selectedSite = selectableSites.find((s) => String(s.code) === String(value));
  const selectedLabel = selectedSite
    ? `${selectedSite.code} - ${selectedSite.name}`
    : siteLabelByCode.get(String(value)) || '';

  const searchLower = search.trim().toLowerCase();
  const filteredProvinceEntries = provinceGroups.filter((group) => {
    const province = String(group.province || '');
    const provinceSites = (Array.isArray(group.sites) ? group.sites : []).filter((site) =>
      facilityOnly ? isFacilitySite(site) : true
    );
    if (!provinceSites.length && facilityOnly) return false;
    if (!searchLower) return true;
    if (province.toLowerCase().includes(searchLower)) return true;
    return provinceSites.some(
      (s) =>
        String(s.name || '').toLowerCase().includes(searchLower) ||
        String(s.code || '').toLowerCase().includes(searchLower)
    );
  });

  const visibleProvinceEntries = filteredProvinceEntries
    .filter((group) => group.province !== 'Cambodia')
    .map((group) => ({
      ...group,
      sites: (group.sites || []).filter((site) => (facilityOnly ? isFacilitySite(site) : true))
    }))
    .filter((group) => group.sites.length > 0);

  const showCambodiaRoot =
    !facilityOnly &&
    (!searchLower ||
      String(cambodiaSite?.name || 'cambodia').toLowerCase().includes(searchLower) ||
      String(cambodiaSite?.code || '').toLowerCase().includes(searchLower) ||
      visibleProvinceEntries.length > 0);

  const draftLabel = siteLabelByCode.get(String(draftCode)) || '';
  const draftIsFacility = isFacilitySiteCode(sites, draftCode);

  useEffect(() => {
    if (!open) setDraftCode(value || '');
  }, [value, open]);

  const toggleProvince = (provinceKey) =>
    setExpandedProvinces((prev) => ({ ...prev, [provinceKey]: !prev[provinceKey] }));

  const openModal = () => {
    if (disabled) return;
    setDraftCode(value || '');
    setSearch('');
    setOpen(true);
    setExpandedCambodia(true);
    const firstKey = visibleProvinceEntries[0]?.key;
    if (firstKey) setExpandedProvinces((prev) => ({ ...prev, [firstKey]: true }));
  };

  const applySelection = () => {
    const code = String(draftCode || '').trim();
    if (!code) return;
    if (facilityOnly && !draftIsFacility) return;
    onChange?.(code);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <div className={cn('grid', showLabel ? 'gap-2' : 'gap-0', className)}>
        {showLabel ? (
          <span
            className={
              compact
                ? 'text-[11px] font-medium leading-none text-muted-foreground'
                : filterLabelClass
            }
          >
            {label}
          </span>
        ) : null}
        <button
          type="button"
          onClick={openModal}
          disabled={disabled}
          className={`${controlClass(compact)} w-full border bg-background px-3 text-left font-medium transition hover:bg-muted/20 disabled:opacity-50`}
        >
          {selectedLabel || mt.selectPlaceholder}
        </button>
      </div>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="site-select-modal-title"
          >
          <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden bg-card shadow-2xl shadow-black/15">
            <div className="flex items-center justify-between border-b border-border/80 bg-muted/35 px-6 py-4">
              <div>
                <div id="site-select-modal-title" className="text-lg font-semibold text-foreground">
                  {facilityOnly ? mt.titleFacility : mt.titleSite}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {facilityOnly ? mt.hintFacility : mt.hintSite}
                </div>
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center border border-border/80 bg-background/80 hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                <RiCloseLine className="size-5" />
              </button>
            </div>
            <div className="border-b border-border/80 px-6 py-4">
              <div className="relative">
                <RiSearchLine className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={mt.filterPlaceholder}
                  className="h-10 w-full border border-border/80 bg-background pl-10 pr-3 text-sm shadow-sm"
                />
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto px-6 py-4">
              <div className="space-y-2 border border-border/80 bg-background/60 p-3 shadow-inner">
                {showCambodiaRoot && (
                  <div className="px-1 py-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setExpandedCambodia((v) => !v)}
                        className="inline-flex h-7 w-7 items-center justify-center border border-border/80 bg-background"
                      >
                        {expandedCambodia ? (
                          <RiArrowDownSLine className="size-4" />
                        ) : (
                          <RiArrowRightSLine className="size-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        className={`flex h-9 flex-1 items-center gap-2 px-1 text-left ${String(draftCode) === String(cambodiaValue) ? 'bg-muted/70' : ''}`}
                        onClick={() => setDraftCode(String(cambodiaValue))}
                      >
                        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
                          {String(draftCode) === String(cambodiaValue) ? (
                            <RiCheckboxCircleFill className="size-5 text-primary" />
                          ) : (
                            <RiCheckboxBlankCircleLine className="size-5 text-muted-foreground" />
                          )}
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {cambodiaSite ? `${cambodiaSite.code} - ${cambodiaSite.name}` : 'Cambodia'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({visibleProvinceEntries.length} provinces)
                        </span>
                      </button>
                    </div>
                    {expandedCambodia && (
                      <div className="ml-12 mt-2 space-y-1 border-l border-border/80 pl-4">
                        {visibleProvinceEntries.map((group) => {
                          const province = group.province;
                          const provinceSites = group.sites;
                          const isExpanded = expandedProvinces[group.key] ?? false;
                          const provinceCode = provinceCodeByKey.get(group.key) || '';
                          const provinceSelected =
                            !facilityOnly && provinceCode && String(draftCode) === provinceCode;
                          return (
                            <div key={group.key} className="px-1 py-1 hover:bg-muted/30">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => toggleProvince(group.key)}
                                  className="inline-flex h-7 w-7 items-center justify-center border border-border/80 bg-background"
                                >
                                  {isExpanded ? (
                                    <RiArrowDownSLine className="size-4" />
                                  ) : (
                                    <RiArrowRightSLine className="size-4" />
                                  )}
                                </button>
                                {!facilityOnly ? (
                                  <button
                                    type="button"
                                    className={`flex h-9 flex-1 items-center gap-2 px-1 text-left ${provinceSelected ? 'bg-muted/70' : ''}`}
                                    onClick={() => setDraftCode(provinceCode)}
                                  >
                                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
                                      {provinceSelected ? (
                                        <RiCheckboxCircleFill className="size-5 text-primary" />
                                      ) : (
                                        <RiCheckboxBlankCircleLine className="size-5 text-muted-foreground" />
                                      )}
                                    </span>
                                    <span className="text-sm font-semibold text-foreground">{province}</span>
                                    <span className="text-xs text-muted-foreground">
                                      ({provinceSites.length})
                                    </span>
                                  </button>
                                ) : (
                                  <span className="flex h-9 flex-1 items-center px-1 text-sm font-semibold text-foreground">
                                    {province}
                                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                                      ({provinceSites.length})
                                    </span>
                                  </span>
                                )}
                              </div>
                              {isExpanded && (
                                <div className="ml-12 mt-2 space-y-1 border-l border-border/80 pl-4">
                                  {provinceSites.map((site) => {
                                    const isSelected = String(draftCode) === String(site.code);
                                    return (
                                      <button
                                        key={site.code}
                                        type="button"
                                        className={`flex h-9 w-full items-center gap-3 px-3 text-left hover:bg-muted ${isSelected ? 'bg-muted/70' : ''}`}
                                        onClick={() => setDraftCode(String(site.code))}
                                      >
                                        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
                                          {isSelected ? (
                                            <RiCheckboxCircleFill className="size-5 text-primary" />
                                          ) : (
                                            <RiCheckboxBlankCircleLine className="size-5 text-muted-foreground" />
                                          )}
                                        </span>
                                        <span className="text-sm text-foreground">
                                          {site.code} - {site.name}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
                {!showCambodiaRoot &&
                  visibleProvinceEntries.map((group) => {
                    const isExpanded = expandedProvinces[group.key] ?? true;
                    return (
                      <div key={group.key} className="px-1 py-1">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleProvince(group.key)}
                            className="inline-flex h-7 w-7 items-center justify-center border border-border/80 bg-background"
                          >
                            {isExpanded ? (
                              <RiArrowDownSLine className="size-4" />
                            ) : (
                              <RiArrowRightSLine className="size-4" />
                            )}
                          </button>
                          <span className="text-sm font-semibold text-foreground">{group.province}</span>
                        </div>
                        {isExpanded && (
                          <div className="ml-12 mt-2 space-y-1 border-l border-border/80 pl-4">
                            {group.sites.map((site) => {
                              const isSelected = String(draftCode) === String(site.code);
                              return (
                                <button
                                  key={site.code}
                                  type="button"
                                  className={`flex h-9 w-full items-center gap-3 px-3 text-left hover:bg-muted ${isSelected ? 'bg-muted/70' : ''}`}
                                  onClick={() => setDraftCode(String(site.code))}
                                >
                                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
                                    {isSelected ? (
                                      <RiCheckboxCircleFill className="size-5 text-primary" />
                                    ) : (
                                      <RiCheckboxBlankCircleLine className="size-5 text-muted-foreground" />
                                    )}
                                  </span>
                                  <span className="text-sm text-foreground">
                                    {site.code} - {site.name}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                {!showCambodiaRoot && visibleProvinceEntries.length === 0 && (
                  <div className="py-10 text-center text-xs text-muted-foreground">No sites found.</div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border/80 bg-muted/25 px-6 py-4">
              <div className="text-xs text-muted-foreground">
                {mt.draft}{' '}
                <span
                  className={
                    facilityOnly && draftCode && !draftIsFacility
                      ? 'font-medium text-destructive'
                      : 'font-medium text-primary'
                  }
                >
                  {draftLabel || mt.none || 'None'}
                  {facilityOnly && draftCode && !draftIsFacility ? ' (select a facility)' : ''}
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
                  disabled={!String(draftCode || '').trim() || (facilityOnly && !draftIsFacility)}
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
