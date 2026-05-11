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
  const selectItemClass = 'px-3 py-2 rounded-none data-[selected]:bg-primary data-[selected]:text-primary-foreground';
  const controlClass = '!h-10 min-h-10';
  const labelClass = 'h-5 text-sm leading-5 text-muted-foreground';
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
  const groupedProvinces = selectableSites.reduce((acc, site) => {
    const province = getProvinceName(site);
    if (!acc[province]) acc[province] = [];
    acc[province].push(site);
    return acc;
  }, {});
  const cambodiaSite = selectableSites.find(isCambodiaRootSite) || null;
  const cambodiaValue = cambodiaSite ? String(cambodiaSite.code) : '__CAMBODIA__';
  const provinceOptions = Object.entries(groupedProvinces)
    .filter(([province]) => province !== 'Cambodia')
    .map(([province, provinceSites]) => ({
      province,
      code: (() => {
        const prefix = String(provinceSites?.[0]?.code || '').slice(0, 2);
        const explicitProvinceRow = provinceSites.find((site) => {
          const digits = String(site?.code || '').replace(/\D/g, '');
          const name = String(site?.name || '').trim().toLowerCase();
          const provinceLower = String(province).trim().toLowerCase();
          const matchesPrefix = prefix ? digits.startsWith(prefix) : true;
          return matchesPrefix && (digits.endsWith('00') || name === provinceLower);
        });
        // Keep province node distinct from facilities (e.g. 2200 vs 2201).
        return String(explicitProvinceRow?.code || (prefix ? `${prefix}00` : ''));
      })(),
      count: provinceSites.length
    }))
    .filter((p) => p.code);
  const provinceCodeByName = new Map(provinceOptions.map((p) => [p.province, String(p.code)]));
  const siteLabelByCode = new Map(selectableSites.map((s) => [String(s.code), `${s.code} - ${s.name}`]));
  if (cambodiaSite) {
    siteLabelByCode.set(String(cambodiaSite.code), `${cambodiaSite.code} - ${cambodiaSite.name}`);
  } else {
    siteLabelByCode.set(cambodiaValue, 'Cambodia');
  }
  provinceOptions.forEach((p) => {
    if (!siteLabelByCode.has(String(p.code))) siteLabelByCode.set(String(p.code), `${p.code} - ${p.province}`);
  });
  const selectedSiteLabel = siteLabelByCode.get(String(siteCode)) || '';
  const draftSiteLabel = siteLabelByCode.get(String(draftSiteCode)) || '';
  const searchLower = siteSearch.trim().toLowerCase();
  const filteredProvinceEntries = Object.entries(groupedProvinces).filter(([province, provinceSites]) => {
    if (!searchLower) return true;
    if (province.toLowerCase().includes(searchLower)) return true;
    return provinceSites.some(
      (s) => String(s.name || '').toLowerCase().includes(searchLower) || String(s.code || '').toLowerCase().includes(searchLower)
    );
  });
  const visibleProvinceEntries = filteredProvinceEntries.filter(([province]) => province !== 'Cambodia');
  const showCambodiaRoot =
    !searchLower ||
    String(cambodiaSite?.name || 'cambodia').toLowerCase().includes(searchLower) ||
    String(cambodiaSite?.code || '').toLowerCase().includes(searchLower) ||
    visibleProvinceEntries.length > 0;
  const toggleProvince = (province) => setExpandedProvinces((prev) => ({ ...prev, [province]: !prev[province] }));
  const openSiteModal = () => {
    setDraftSiteCode(siteCode || '');
    setSiteSearch('');
    setSiteModalOpen(true);
    setExpandedCambodia(true);
    const firstProvince = Object.keys(groupedProvinces)[0];
    if (firstProvince) setExpandedProvinces((prev) => ({ ...prev, [firstProvince]: true }));
  };
  const applySiteSelection = () => {
    if (!String(draftSiteCode || '').trim()) return;
    setSiteCode(String(draftSiteCode));
    setSiteModalOpen(false);
  };

  return (
    <div className="border border-border bg-card p-4 sm:p-5">
      <div className="grid gap-3 md:grid-cols-[1.4fr_0.9fr_0.8fr_0.9fr_auto]">
        <div className="grid gap-2">
          <span className={labelClass}>Site</span>
          <button
            type="button"
            onClick={openSiteModal}
            className={`${controlClass} w-full border border-input bg-background px-3 text-left text-sm font-medium`}
          >
            {selectedSite ? `${selectedSite.code} - ${selectedSite.name}` : selectedSiteLabel || 'Select site'}
          </button>
        </div>

        <div className="grid gap-2">
          <span className={labelClass}>Report</span>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className={`${controlClass} w-full px-3 rounded-none`}>
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
            <SelectTrigger className={`${controlClass} w-full px-3 rounded-none`}>
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
            <div className="relative" ref={quarterPickerRef}>
              <button
                type="button"
                onClick={() => setQuarterPickerOpen((v) => !v)}
                className={`${controlClass} w-full border border-input bg-background px-3 text-left text-sm font-medium`}
              >
                {selectedYear} - Q{selectedQuarter}
              </button>
              {quarterPickerOpen && (
                <div className="absolute z-50 mt-2 w-full border border-border bg-card p-3 shadow-sm rounded-none">
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
                        className="h-10 text-sm rounded-none"
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
              className={`${periodValueClass} border border-input bg-background px-3 text-sm`}
            />
          )}
          {periodType === 'month' && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={`${periodValueClass} border border-input bg-background px-3 text-sm`}
            />
          )}
          {periodType === 'year' && (
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className={`${periodValueClass} px-3 rounded-none`}>
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
          <Button disabled={!canRun || loading} onClick={runReport} className={`${controlClass} min-w-24 rounded-none`}>
            {loading ? <RiLoader4Line className="size-4 animate-spin" /> : <RiPlayCircleLine className="size-4" />}
            {loading ? 'Running...' : 'Run'}
          </Button>
        </div>
      </div>

      {siteModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <div className="text-xl font-semibold text-foreground">Select Site</div>
                <div className="mt-1 text-sm text-muted-foreground">Choose a site by province.</div>
              </div>
              <button
                type="button"
              className="inline-flex h-9 w-9 items-center justify-center border border-border hover:bg-muted"
                onClick={() => setSiteModalOpen(false)}
              >
                <RiCloseLine className="size-5" />
              </button>
            </div>
            <div className="border-b border-border px-6 py-4">
              <div className="relative">
                <RiSearchLine className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={siteSearch}
                  onChange={(e) => setSiteSearch(e.target.value)}
                  placeholder="Filter sites..."
                className="h-10 w-full border border-input bg-background pl-10 pr-3 text-sm"
                />
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto px-6 py-4">
              <div className="space-y-2 border border-border bg-background/40 p-3">
                {showCambodiaRoot && (
                  <div className="px-1 py-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setExpandedCambodia((v) => !v)}
                        className="inline-flex h-7 w-7 items-center justify-center border border-border"
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
                        <span className="text-base font-semibold text-foreground">
                          {cambodiaSite ? `${cambodiaSite.code} - ${cambodiaSite.name}` : 'Cambodia'}
                        </span>
                        <span className="text-xs text-muted-foreground">({visibleProvinceEntries.length} provinces)</span>
                      </button>
                    </div>
                    {expandedCambodia && (
                      <div className="ml-12 mt-2 space-y-1 border-l border-border pl-4">
                        {visibleProvinceEntries.map(([province, provinceSites]) => {
                          const isExpanded = expandedProvinces[province] ?? false;
                          const provinceCode = provinceCodeByName.get(province) || '';
                          const provinceSelected = provinceCode && String(draftSiteCode) === provinceCode;
                          return (
                            <div key={province} className="px-1 py-1 hover:bg-muted/30">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => toggleProvince(province)}
                                  className="inline-flex h-7 w-7 items-center justify-center border border-border"
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
                                <div className="ml-12 mt-2 space-y-1 border-l border-border pl-4">
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
                  <div className="py-10 text-center text-sm text-muted-foreground">No sites found.</div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border bg-muted/20 px-6 py-4">
              <div className="text-sm text-muted-foreground">
                Draft:{' '}
                <span className="font-medium text-primary">
                  {draftSiteLabel || 'None'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" className="h-10 px-5 text-sm text-muted-foreground hover:bg-muted" onClick={() => setSiteModalOpen(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="h-10 bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
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
