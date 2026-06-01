import { useEffect, useRef, useState } from 'react';
import { RiArrowLeftSLine, RiArrowRightSLine, RiDownloadLine } from '@remixicon/react';
import { Button } from '@/components/ui/button';
import RunButton, { filterControlClass, filterLabelClass } from '@/components/ui/RunButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SiteSelectModal from '@/components/sites/SiteSelectModal';

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
  const controlClass = filterControlClass;
  const labelClass = filterLabelClass;
  const periodValueClass = `${controlClass} w-full`;
  const [quarterPickerOpen, setQuarterPickerOpen] = useState(false);
  const quarterPickerRef = useRef(null);
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

  return (
    <div className="border border-border/80 bg-card shadow-xl shadow-black/6">
      <div className="h-1.5 w-full bg-primary" />
      <div className="grid gap-3 p-4 sm:p-5 md:grid-cols-[1.4fr_0.9fr_0.8fr_0.9fr_auto_auto]">
        <SiteSelectModal sites={sites} value={siteCode} onChange={setSiteCode} label="Site" />

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
          <RunButton disabled={!canRun} loading={loading} onClick={runReport} />
        </div>

        <div className="grid gap-2">
          <span className={`${labelClass} opacity-0 select-none`}>Download</span>
          <Button
            type="button"
            variant="outline"
            className={`${filterControlClass} h-10 rounded-none bg-background`}
            onClick={() => {
              const url = `${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || ''}/apiv1/optimized-indicators/download-scripts`;
              const token = localStorage.getItem('token');
              fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
              })
                .then((res) => {
                  if (!res.ok) throw new Error('Download failed');
                  return res.blob();
                })
                .then((blob) => {
                  const blobUrl = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = blobUrl;
                  a.download = 'all_indicator_scripts.zip';
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  window.URL.revokeObjectURL(blobUrl);
                })
                .catch((err) => {
                  console.error(err);
                  // toast.error('Failed to download scripts');
                });
            }}
            title="Download all indicator SQL scripts"
          >
            <RiDownloadLine className="size-4 mr-1.5" />
            Scripts
          </Button>
        </div>
      </div>
    </div>
  );
}
