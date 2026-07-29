import {
  RiDownloadLine,
  RiFileTextLine,
  RiLoader4Line,
  RiRefreshLine
} from '@remixicon/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SiteSelectModal from '@/components/sites/SiteSelectModal';
import { Patient360NavBar, Patient360NavRow } from '../patient360/Patient360NavBar';
import QuarterSelectModal from '../visualize/QuarterSelectModal';
import { VizToolbarBtn } from '../visualize/visualizeToolbarUi';
import { TOOLBAR_ICON } from '../layout/toolbarIconColors';
import { getApiBaseUrl } from '@/services/api';
import { cn } from '@/lib/utils';


export default function ReportFilters({
  sites,
  siteCode,
  setSiteCode,
  reportType,
  setReportType,
  selectedPeriodKey,
  setSelectedPeriodKey,
  canRun,
  loading,
  runReport
}) {
  const selectItemClass = 'px-3 py-2 rounded-none text-xs cursor-pointer data-[selected]:bg-primary data-[selected]:text-primary-foreground';

  const handleDownloadScripts = () => {
    const url = `${getApiBaseUrl()}/apiv1/optimized-indicators/download-scripts`;

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
      });
  };

  return (
    <Patient360NavBar ariaLabel="ស្វែងរករបាយការណ៍" rowCount={1}>
      <Patient360NavRow tone="filters" className="gap-2">
        {/* Logo and Label */}
        <div className="inline-flex shrink-0 items-center justify-center gap-1.5 px-2 text-[11px] font-semibold text-foreground">
          <RiFileTextLine className={cn('size-4', TOOLBAR_ICON.brand)} />
          <span className="hidden md:inline">របាយការណ៍ (Reports)</span>
          <span className="md:hidden font-bold">របាយការណ៍</span>
        </div>

        <span className="mx-0.5 hidden h-5 w-px shrink-0 bg-border/80 md:inline" aria-hidden />

        {/* Site Selector */}
        <SiteSelectModal
          sites={sites}
          value={siteCode}
          onChange={setSiteCode}
          label="Site"
          facilityOnly={false}
          showLabel={false}
          compact
          className="w-42 shrink-0 sm:w-48"
        />

        {/* Report Type Select */}
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="h-8 border bg-background text-xs font-semibold px-2 rounded-none w-36 shrink-0 sm:w-44 focus:ring-0 focus:ring-offset-0 focus:outline-none">
            <SelectValue placeholder="Select Report" />
          </SelectTrigger>
          <SelectContent className="p-1 rounded-none text-xs">
            <SelectItem value="adult-child" className={selectItemClass}>Adult / Child</SelectItem>
            <SelectItem value="infants" className={selectItemClass}>Infants</SelectItem>
            <SelectItem value="pntt" className={selectItemClass}>PNTT</SelectItem>
          </SelectContent>
        </Select>

        {/* Period Picker Modal */}
        <QuarterSelectModal
          value={[selectedPeriodKey]}
          onChange={(keys) => {
            if (keys && keys.length > 0) {
              setSelectedPeriodKey(keys[keys.length - 1]);
            }
          }}
          disabled={loading}
          className="w-40 shrink-0 sm:w-48"
        />

        {/* Action Buttons Right-Aligned */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {/* Download SQL Scripts */}
          <VizToolbarBtn
            icon={RiDownloadLine}
            iconClassName={TOOLBAR_ICON.blue}
            label="ទាញយក SQL Scripts"
            shortLabel="SQL"
            onClick={handleDownloadScripts}
            title="Download all indicator SQL scripts"
          />

          {/* Run Button */}
          <VizToolbarBtn
            icon={loading ? RiLoader4Line : RiRefreshLine}
            iconClassName={loading ? TOOLBAR_ICON.brand : TOOLBAR_ICON.teal}
            label={loading ? 'កំពុងទាញ...' : 'ទាញទិន្នន័យ (Run)'}
            shortLabel={loading ? 'ទាញ...' : 'Run'}
            disabled={!canRun || loading}
            onClick={runReport}
            className={loading ? '[&_svg]:animate-spin' : undefined}
            title="Run report"
          />
        </div>
      </Patient360NavRow>
    </Patient360NavBar>
  );
}
