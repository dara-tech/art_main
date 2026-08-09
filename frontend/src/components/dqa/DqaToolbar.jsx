import { RiDownloadLine, RiLoader4Line, RiRefreshLine, RiSearchLine, RiShieldCheckLine } from '@remixicon/react';
import SiteSelectModal from '../sites/SiteSelectModal';
import { cn } from '@/lib/utils';
import { APP_NAV_ICON, appNavItemClass, p360ControlClass } from '../layout/appNavStyles';
import { TOOLBAR_ICON } from '../layout/toolbarIconColors';
import { DQA_KH } from '../../pages/dqaKh';
import { Patient360NavBar, Patient360NavRow } from '../patient360/Patient360NavBar';
import { VizToolbarBtn } from '../visualize/visualizeToolbarUi';

export default function DqaToolbar({
  sites,
  siteCode,
  onSiteChange,
  loadingMeta,
  loadingSummary,
  onRun,
  canRun,
  search,
  onSearchChange,
  summaryCount = 0,
  totalIssues = 0
}) {
  const running = loadingMeta || loadingSummary;

  return (
    <Patient360NavBar ariaLabel={DQA_KH.pageTitle} rowCount={1}>
      <Patient360NavRow tone="filters" className="gap-2">
        <div
          className={cn(appNavItemClass(false), 'pointer-events-none border-transparent px-2')}
          title={DQA_KH.pageTitleShort}
        >
          <RiShieldCheckLine className={cn(APP_NAV_ICON, TOOLBAR_ICON.brand)} aria-hidden />
          <span className="sr-only">{DQA_KH.pageTitleShort}</span>
        </div>

        <SiteSelectModal
          sites={sites}
          value={siteCode}
          onChange={onSiteChange}
          label={DQA_KH.facility}
          facilityOnly
          showLabel={false}
          compact
          className="w-42 shrink-0 sm:w-48"
          modalText={DQA_KH.siteModal}
          disabled={loadingMeta}
        />

        {summaryCount > 0 ? (
          <span className={cn('hidden shrink-0 tabular-nums text-[11px] text-muted-foreground lg:inline')} role="status">
            {summaryCount} {DQA_KH.summaryScripts} · {totalIssues} {DQA_KH.summaryIssueRows}
          </span>
        ) : null}

        <div className="relative min-h-8 min-w-[10rem] flex-1 sm:max-w-md">
          <RiSearchLine
            className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={DQA_KH.filterChecksPlaceholder}
            disabled={loadingMeta}
            className={cn(p360ControlClass, 'h-8 w-full pl-8')}
          />
        </div>

        <VizToolbarBtn
          icon={running ? RiLoader4Line : RiRefreshLine}
          iconClassName={running ? TOOLBAR_ICON.brand : TOOLBAR_ICON.teal}
          label={running ? DQA_KH.running : DQA_KH.run}
          disabled={!canRun || running}
          onClick={onRun}
          title={DQA_KH.run}
          className={cn(
            'ml-auto shrink-0',
            running && '[&_svg]:animate-spin'
          )}
        />

        {summaryCount > 0 ? (
          <Button
            type="button"
            variant="outline"
            className="h-8 gap-1.5 rounded-none border-border/80 px-2.5 text-xs shadow-xs hover:bg-muted"
            onClick={() => {
              const csvRows = [
                ['Check #', 'Quality Component', 'DQA Check Title', 'Issue Count', 'Query Execution Time (ms)'],
                ...scripts.map((script) => {
                  const comp = getScriptComponent ? getScriptComponent(script) : { nameKh: '' };
                  const row = summaryById ? summaryById.get(script.id) : null;
                  return [
                    `"${script.checkNumber || ''}"`,
                    `"${comp.nameKh || ''}"`,
                    `"${script.title || ''}"`,
                    row?.rowCount != null ? row.rowCount : 0,
                    row?.queryMs != null ? row.queryMs : 0
                  ];
                })
              ];
              const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.map((e) => e.join(',')).join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', `DQA_Audit_Summary_${siteCode || 'Site'}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            title="ទាញយករបាយការណ៍ DQA ជា CSV"
          >
            <RiDownloadLine className={APP_NAV_ICON} />
            <span>របាយការណ៍ CSV</span>
          </Button>
        ) : null}
      </Patient360NavRow>
    </Patient360NavBar>
  );
}
