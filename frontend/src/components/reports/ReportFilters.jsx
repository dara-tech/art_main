import { useEffect, useRef, useState } from 'react';
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiBarChartGroupedLine,
  RiCheckboxBlankCircleLine,
  RiCheckboxCircleFill,
  RiCloseLine,
  RiLoader4Line,
  RiLogoutBoxRLine,
  RiPlayCircleLine,
  RiSearchLine,
  RiArrowDownSLine
} from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ReportFilters({
  sites,
  siteCode,
  setSiteCode,
  reportType,
  setReportType,
  periodType,
  setPeriodType,
  selectedDate,
  setSelectedDate,
  selectedMonth,
  setSelectedMonth,
  selectedQuarter,
  setSelectedQuarter,
  selectedYear,
  setSelectedYear,
  availableYears,
  canRun,
  loading,
  runReport,
  onLogout
}) {
  const selectItemClass = 'px-3 py-2 rounded-none text-sm data-[selected]:bg-primary data-[selected]:text-primary-foreground';
  const controlClass = '!h-10 min-h-10 shadow-sm border-border/80';
  const labelClass = 'text-xs font-medium leading-tight text-foreground/80';
  const periodValueClass = `${controlClass} w-full`;
  const [quarterPickerOpen, setQuarterPickerOpen] = useState(false);
  const quarterPickerRef = useRef(null);
  const [siteModalOpen, setSiteModalOpen] = useState(false);
  const [siteSearch, setSiteSearch] = useState('');
  const [draftSiteCode, setDraftSiteCode] = useState(siteCode || '');
  const [expandedProvinces, setExpandedProvinces] = useState({});
  const [expandedCambodia, setExpandedCambodia] = useState(true);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (quarterPickerRef.current && !quarterPickerRef.current.contains(event.target)) {
        setQuarterPickerOpen(false);
      }
    };

    if (quarterPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [quarterPickerOpen]);

  const previousYear = () => setSelectedYear((y) => String(Number(y) - 1));
  const nextYear = () => setSelectedYear((y) => String(Number(y) + 1));
  const selectableSites = Array.isArray(sites) ? sites : [];
  const selectedSite = selectableSites.find((s) => String(s.code) === String(siteCode));
  const provinceNameByCode = {
    '01': 'Banteay Meanchey', '02': 'Battambang', '03': 'Kampong Cham', '04': 'Kampong Chhnang', '05': 'Kampong Speu',
    '06': 'Kampong Thom', '07': 'Kampot', '08': 'Kandal', '09': 'Koh Kong', '10': 'Kratie', '11': 'Mondulkiri',
    '12': 'Phnom Penh', '13': 'Preah Vihear', '14': 'Prey Veng', '15': 'Pursat', '16': 'Ratanakiri', '17': 'Siem Reap',
    '18': 'Preah Sihanouk', '19': 'Stung Treng', '20': 'Svay Rieng', '21': 'Takeo', '22': 'Oddar Meanchey',
    '23': 'Kep', '24': 'Pailin', '25': 'Tbong Khmum'
  };
  const isCambodiaRootSite = (site) => {
    const name = String(site?.name || '').trim().toLowerCase();
    const codeDigits = String(site?.code || '').replace(/\D/g, '');
    // Treat Cambodia as root only when code is root-like (avoid facilities like "Cambodia-China RH").
    return name.includes('cambodia') && codeDigits.length <= 2;
  };
  const getProvinceName = (site) => {
    if (isCambodiaRootSite(site)) return 'Cambodia';
    if (site?.province) return String(site.province);
    const prefix = String(site?.code || '').slice(0, 2);
    return provinceNameByCode[prefix] || `Province ${prefix || 'Unknown'}`;
  };
  const provinceGroups = Array.from(
    selectableSites.reduce((acc, site) => {
      const province = getProvinceName(site);
      const provinceId = String(site?.province_id ?? '').trim();
      const key = provinceId ? `province:${provinceId}` : `name:${province}`;
      if (!acc.has(key)) {
        acc.set(key, {
          key,
          province,
          provinceId,
          sites: []
        });
      }
      acc.get(key).sites.push(site);
      return acc;
    }, new Map()).values()
  ).sort((a, b) => String(a.province || '').localeCompare(String(b.province || '')));
  const cambodiaSite = selectableSites.find(isCambodiaRootSite) || null;
  const cambodiaValue = cambodiaSite ? String(cambodiaSite.code) : '__CAMBODIA__';
  const provinceOptions = provinceGroups
    .filter((group) => group.province !== 'Cambodia')
    .map((group) => ({
      ...group,
      code: group.provinceId ? `province:${group.provinceId}` : ''
    }))
    .filter((group) => group.code);
  const provinceCodeByKey = new Map(provinceOptions.map((group) => [group.key, String(group.code)]));
  const siteLabelByCode = new Map(selectableSites.map((s) => [String(s.code), `${s.code} - ${s.name}`]));
  if (cambodiaSite) {
    siteLabelByCode.set(String(cambodiaSite.code), `${cambodiaSite.code} - ${cambodiaSite.name}`);
  } else {
    siteLabelByCode.set(cambodiaValue, 'Cambodia');
  }
  provinceOptions.forEach((group) => {
    if (!siteLabelByCode.has(String(group.code))) siteLabelByCode.set(String(group.code), group.province);
  });
  const selectedSiteLabel = siteLabelByCode.get(String(siteCode)) || '';
  const draftSiteLabel = siteLabelByCode.get(String(draftSiteCode)) || '';
  const searchLower = siteSearch.trim().toLowerCase();
  const filteredProvinceEntries = provinceGroups.filter((group) => {
    const province = String(group.province || '');
    const provinceSites = Array.isArray(group.sites) ? group.sites : [];
    if (!searchLower) return true;
    if (province.toLowerCase().includes(searchLower)) return true;
    return provinceSites.some(
      (s) => String(s.name || '').toLowerCase().includes(searchLower) || String(s.code || '').toLowerCase().includes(searchLower)
    );
  });
  const visibleProvinceEntries = filteredProvinceEntries.filter((group) => group.province !== 'Cambodia');
  const showCambodiaRoot =
    !searchLower ||
    String(cambodiaSite?.name || 'cambodia').toLowerCase().includes(searchLower) ||
    String(cambodiaSite?.code || '').toLowerCase().includes(searchLower) ||
    visibleProvinceEntries.length > 0;
  const toggleProvince = (provinceKey) => setExpandedProvinces((prev) => ({ ...prev, [provinceKey]: !prev[provinceKey] }));
  const openSiteModal = () => {
    setDraftSiteCode(siteCode || '');
    setSiteSearch('');
    setSiteModalOpen(true);
    setExpandedCambodia(true);
    const firstProvinceKey = provinceGroups.find((group) => group.province !== 'Cambodia')?.key;
    if (firstProvinceKey) setExpandedProvinces((prev) => ({ ...prev, [firstProvinceKey]: true }));
  };
  const applySiteSelection = () => {
    if (!String(draftSiteCode || '').trim()) return;
    setSiteCode(String(draftSiteCode));
    setSiteModalOpen(false);
  };

  return (
    <div className="border border-border/80 bg-card shadow-xl shadow-black/6">
      <div className="h-1.5 w-full bg-primary" />
      <div className="grid gap-3 p-4 sm:p-5 md:grid-cols-[1.4fr_0.9fr_0.8fr_0.9fr_auto]">
        <div className="grid gap-2">
          <span className={labelClass}>Site</span>
          <button
            type="button"
            onClick={openSiteModal}
            className={`${controlClass} w-full border bg-background px-3 text-left text-sm font-medium transition hover:bg-muted/20`}
          >
            {selectedSite ? `${selectedSite.code} - ${selectedSite.name}` : selectedSiteLabel || 'Select site'}
          </button>
        </div>

        <div className="grid gap-2">
          <span className={labelClass}>Report</span>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className={`${controlClass} w-full rounded-none px-3`}>
              <SelectValue placeholder="Select report" />
            </SelectTrigger>
            <SelectContent className="p-1 rounded-none">
              <SelectItem value="adult-child" className={selectItemClass}>Adult / Child</SelectItem>
              <SelectItem value="infants" className={selectItemClass}>Infants</SelectItem>
              <SelectItem value="pntt" className={selectItemClass}>PNTT</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <span className={labelClass}>Period</span>
          <Select value={periodType} onValueChange={setPeriodType}>
            <SelectTrigger className={`${controlClass} w-full rounded-none px-3`}>
              <SelectValue placeholder="Select period type" />
            </SelectTrigger>
            <SelectContent className="p-1 rounded-none">
              <SelectItem value="day" className={selectItemClass}>Day</SelectItem>
              <SelectItem value="month" className={selectItemClass}>Month</SelectItem>
              <SelectItem value="quarter" className={selectItemClass}>Quarter</SelectItem>
              <SelectItem value="year" className={selectItemClass}>Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <span className={labelClass}>
            {periodType === 'quarter'
              ? 'Select quarter'
              : periodType === 'day'
                ? 'Select day'
                : periodType === 'month'
                  ? 'Select month'
                  : 'Select year'}
          </span>
          {periodType === 'quarter' && (
            <div className="relative z-20" ref={quarterPickerRef}>
              <button
                type="button"
                onClick={() => setQuarterPickerOpen((v) => !v)}
                className={`${controlClass} w-full border bg-background px-3 text-left text-sm font-medium transition hover:bg-muted/20`}
              >
                {selectedYear} - Q{selectedQuarter}
              </button>
              {quarterPickerOpen && (
                <div className="absolute z-50 mt-2 w-full rounded-none border border-border/80 bg-card p-3 shadow-xl shadow-black/8">
                  <div className="mb-4 flex items-center justify-between">
                    <Button type="button" variant="ghost" size="sm" onClick={previousYear} className="h-10 w-10 p-0">
                      <RiArrowLeftSLine className="size-5" />
                    </Button>
                    <div className="text-sm font-semibold">{selectedYear}</div>
                    <Button type="button" variant="ghost" size="sm" onClick={nextYear} className="h-10 w-10 p-0">
                      <RiArrowRightSLine className="size-5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {['1', '2', '3', '4'].map((q) => (
                      <Button
                        key={q}
                        type="button"
                        variant={selectedQuarter === q ? 'default' : 'outline'}
                        className="h-9 text-sm rounded-none"
                        onClick={() => {
                          setSelectedQuarter(q);
                          setQuarterPickerOpen(false);
                        }}
                      >
                        Q{q}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {periodType === 'day' && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`${periodValueClass} border border-border/80 bg-background px-3 text-sm shadow-sm`}
            />
          )}
          {periodType === 'month' && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={`${periodValueClass} border border-border/80 bg-background px-3 text-sm shadow-sm`}
            />
          )}
          {periodType === 'year' && (
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className={`${periodValueClass} rounded-none px-3`}>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="p-1 rounded-none">
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year} className={selectItemClass}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="grid gap-2">
          <span className={`${labelClass} opacity-0 select-none`}>Run</span>
          <Button disabled={!canRun || loading} onClick={runReport} className={`${controlClass} min-w-24 rounded-none bg-primary text-primary-foreground hover:opacity-95`}>
            {loading ? <RiLoader4Line className="size-4 animate-spin" /> : <RiPlayCircleLine className="size-4" />}
            {loading ? 'Running...' : 'Run'}
          </Button>
        </div>
      </div>

      {siteModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
          <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden bg-card shadow-2xl shadow-black/15">
            <div className="flex items-center justify-between border-b border-border/80 bg-muted/35 px-6 py-4">
              <div>
                <div className="text-lg font-semibold text-foreground">Select Site</div>
                <div className="mt-0.5 text-xs text-muted-foreground">Choose a site by province.</div>
              </div>
              <button
                type="button"
              className="inline-flex h-9 w-9 items-center justify-center border border-border/80 bg-background/80 hover:bg-muted"
                onClick={() => setSiteModalOpen(false)}
              >
                <RiCloseLine className="size-5" />
              </button>
            </div>
            <div className="border-b border-border/80 px-6 py-4">
              <div className="relative">
                <RiSearchLine className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={siteSearch}
                  onChange={(e) => setSiteSearch(e.target.value)}
                  placeholder="Filter sites..."
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
                        {expandedCambodia ? <RiArrowDownSLine className="size-4" /> : <RiArrowRightSLine className="size-4" />}
                      </button>
                      <button
                        type="button"
                        className={`flex h-9 flex-1 items-center gap-2 px-1 text-left ${String(draftSiteCode) === String(cambodiaValue) ? 'bg-muted/70' : ''}`}
                        onClick={() => setDraftSiteCode(String(cambodiaValue))}
                      >
                        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
                          {String(draftSiteCode) === String(cambodiaValue) ? (
                            <RiCheckboxCircleFill className="size-5 text-primary" />
                          ) : (
                            <RiCheckboxBlankCircleLine className="size-5 text-muted-foreground" />
                          )}
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {cambodiaSite ? `${cambodiaSite.code} - ${cambodiaSite.name}` : 'Cambodia'}
                        </span>
                        <span className="text-xs text-muted-foreground">({visibleProvinceEntries.length} provinces)</span>
                      </button>
                    </div>
                    {expandedCambodia && (
                      <div className="ml-12 mt-2 space-y-1 border-l border-border/80 pl-4">
                        {visibleProvinceEntries.map((group) => {
                          const province = group.province;
                          const provinceSites = group.sites;
                          const isExpanded = expandedProvinces[group.key] ?? false;
                          const provinceCode = provinceCodeByKey.get(group.key) || '';
                          const provinceSelected = provinceCode && String(draftSiteCode) === provinceCode;
                          return (
                            <div key={group.key} className="px-1 py-1 hover:bg-muted/30">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => toggleProvince(group.key)}
                                  className="inline-flex h-7 w-7 items-center justify-center border border-border/80 bg-background"
                                >
                                  {isExpanded ? <RiArrowDownSLine className="size-4" /> : <RiArrowRightSLine className="size-4" />}
                                </button>
                                <button
                                  type="button"
                                  className={`flex h-9 flex-1 items-center gap-2 px-1 text-left ${provinceSelected ? 'bg-muted/70' : ''}`}
                                  onClick={() => setDraftSiteCode(provinceCode)}
                                >
                                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
                                    {provinceSelected ? <RiCheckboxCircleFill className="size-5 text-primary" /> : <RiCheckboxBlankCircleLine className="size-5 text-muted-foreground" />}
                                  </span>
                                  <span className="text-sm font-semibold text-foreground">{province}</span>
                                  <span className="text-xs text-muted-foreground">({provinceSites.length})</span>
                                </button>
                              </div>
                              {isExpanded && (
                                <div className="ml-12 mt-2 space-y-1 border-l border-border/80 pl-4">
                                  {provinceSites.map((site) => {
                                    const isSelected = String(draftSiteCode) === String(site.code);
                                    return (
                                      <button
                                        key={site.code}
                                        type="button"
                                        className={`flex h-9 w-full items-center gap-3 px-3 text-left hover:bg-muted ${isSelected ? 'bg-muted/70' : ''}`}
                                        onClick={() => setDraftSiteCode(String(site.code))}
                                      >
                                        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
                                          {isSelected ? <RiCheckboxCircleFill className="size-5 text-primary" /> : <RiCheckboxBlankCircleLine className="size-5 text-muted-foreground" />}
                                        </span>
                                        <span className="text-sm text-foreground">{site.code} - {site.name}</span>
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
                {!showCambodiaRoot && (
                  <div className="py-10 text-center text-xs text-muted-foreground">No sites found.</div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border/80 bg-muted/25 px-6 py-4">
              <div className="text-xs text-muted-foreground">
                Draft:{' '}
                <span className="font-medium text-primary">
                  {draftSiteLabel || 'None'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" className="h-9 px-5 text-sm text-muted-foreground hover:bg-muted" onClick={() => setSiteModalOpen(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="h-10 bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95 disabled:opacity-50"
                  onClick={applySiteSelection}
                  disabled={!String(draftSiteCode || '').trim()}
                >
                  Apply Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
