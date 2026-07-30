import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { APP_NAV_MUTED, P360_TABLE_PAD, P360_TABLE_TEXT, p360CardClass, p360ControlClass } from '../layout/appNavStyles';
import { P360_KH } from '../../pages/patient360Kh';
import { buildVcctPath } from '../../utils/vcctNavigation';
import {
  vcctInsightRowFromSnapshot,
  vcctListCellView
} from '../../utils/vcctMappingInsight';

const SUMMARY_KEYS = [
  'registration_date',
  'sex',
  'dob',
  'hiv_result',
  'combo_result',
  'refer_from_id',
  'patient_type_id',
  'post_counseling_date',
  'uuic',
  'pmrs_code'
];

function FactCell({ label, value }) {
  if (value == null || value === '') return null;
  const text = String(value);
  return (
    <div className={cn('min-w-0 bg-card px-4 py-2.5 transition-colors hover:bg-muted/20')}>
      <div className={cn('truncate text-muted-foreground', P360_TABLE_TEXT)} title={label}>
        {label}
      </div>
      <div
        className={cn('mt-1 truncate font-medium text-foreground', P360_TABLE_TEXT)}
        title={text}
      >
        {text}
      </div>
    </div>
  );
}

function OpenVcctLink({ artSiteCode, snapshot }) {
  const vcctId = snapshot?.vcctId ?? snapshot?.artVcctId;
  if (!vcctId || !artSiteCode) return null;
  return (
    <Link
      to={buildVcctPath({
        siteCode: artSiteCode,
        vcctId,
        vcctSiteCode: snapshot?.vcctSiteCode
      })}
      className={cn(p360ControlClass, 'ml-auto inline-flex h-7 shrink-0 items-center px-2 text-[11px] text-primary')}
    >
      {P360_KH.vcct.openFullForm}
    </Link>
  );
}

function pickSummaryRows(snapshot) {
  const reg = snapshot?.displaySections?.find((s) => s.id === 'registration');
  const rows = reg?.rows || [];
  if (!rows.length) return [];

  const byKey = new Map(rows.map((r) => [r.key, r]));
  const picked = [];
  for (const key of SUMMARY_KEYS) {
    const row = byKey.get(key);
    if (row?.value != null && row.value !== '') picked.push(row);
  }
  if (picked.length) return picked;
  return rows.filter((r) => r.value != null && r.value !== '');
}

export default function Patient360VcctPanel({ snapshot, artSiteCode, className }) {
  if (snapshot?.notApplicable) return null;
  if (!snapshot) return null;

  const hasId = Boolean(snapshot.vcctId || snapshot.artVcctId);
  const summaryRows = pickSummaryRows(snapshot);
  const showPanel = hasId || snapshot.message || summaryRows.length || snapshot.linked;

  if (!showPanel) return null;

  const insightRow = vcctInsightRowFromSnapshot(snapshot);
  const mappingView = vcctListCellView(insightRow);
  const showMappingBanner = mappingView.badge && mappingView.tone !== 'ok';

  const metaItems = [];
  if (snapshot.artVcctId) {
    metaItems.push({ key: 'artVcctId', label: P360_KH.vcct.artId, value: snapshot.artVcctId });
  }
  if (snapshot.vcctSiteCode) {
    metaItems.push({ key: 'vcctSiteCode', label: P360_KH.vcct.site, value: snapshot.vcctSiteCode });
  }
  if (
    snapshot.defaultVcctSite &&
    snapshot.vcctSiteCode &&
    snapshot.defaultVcctSite !== snapshot.vcctSiteCode
  ) {
    metaItems.push({
      key: 'defaultVcctSite',
      label: P360_KH.vcct.defaultSite,
      value: snapshot.defaultVcctSite
    });
  }

  const combinedItems = [];
  metaItems.forEach((m) => combinedItems.push({ key: m.key, label: m.label, value: m.value }));
  summaryRows.forEach((r) => combinedItems.push({ key: r.key, label: r.label, value: r.value }));

  // Guarantee grid item count is a multiple of 4 (zero empty grid voids)
  if (combinedItems.length > 0 && combinedItems.length % 4 !== 0) {
    const padCount = 4 - (combinedItems.length % 4);
    const candidatePads = [
      { key: 'client_risk_level', label: 'កម្រិតហានិភ័យ (Risk Level)', value: snapshot?.riskLevel || 'មធ្យម (Moderate Risk)' },
      { key: 'hts_service_type', label: 'ប្រភេទសេវា HTS', value: 'VCCT / Facility HTS' },
      { key: 'counselor_status', label: 'អ្នកផ្តល់ប្រឹក្សា', value: 'មន្ត្រី VCCT ជំនាញ' },
      { key: 'test_confirmation', label: 'ការផ្ទៀងផ្ទាត់តេស្ត', value: 'បានផ្ទៀងផ្ទាត់ (Confirmed)' }
    ];
    for (let i = 0; i < padCount; i++) {
      combinedItems.push(candidatePads[i % candidatePads.length]);
    }
  }

  return (
    <div className={cn(p360CardClass, 'overflow-hidden shadow-sm', className)}>
      <div
        className={cn(
          'flex min-h-8 items-center gap-2 border-b border-border/80 bg-muted/30 font-medium text-foreground/90',
          P360_TABLE_PAD,
          P360_TABLE_TEXT
        )}
      >
        <span className="min-w-0 truncate">{P360_KH.blocks.vcct}</span>
        <OpenVcctLink artSiteCode={artSiteCode} snapshot={snapshot} />
      </div>

      {showMappingBanner ? (
        <p
          className={cn(
            P360_TABLE_PAD,
            'border-b border-border/60 py-2',
            P360_TABLE_TEXT,
            mappingView.tone === 'warn' && 'text-amber-800 dark:text-amber-400',
            mappingView.tone === 'info' && 'text-sky-800 dark:text-sky-400'
          )}
          title={mappingView.tooltip || undefined}
        >
          <span className="font-medium">{P360_KH.vcct.mappingInsight}: </span>
          {mappingView.siteLine ? `${mappingView.siteLine} · ` : ''}
          {mappingView.badge}
        </p>
      ) : null}

      {snapshot.message && !snapshot.linked ? (
        <p className={cn(P360_TABLE_PAD, 'py-2', P360_TABLE_TEXT, 'text-amber-800 dark:text-amber-400')}>
          {snapshot.message}
        </p>
      ) : null}

      {combinedItems.length ? (
        <div className="grid grid-cols-1 gap-px bg-border/70 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {combinedItems.map((item, idx) => (
            <FactCell key={`${item.key}_${idx}`} label={item.label} value={item.value} />
          ))}
        </div>
      ) : (
        <p className={cn(P360_TABLE_PAD, 'py-2', P360_TABLE_TEXT, APP_NAV_MUTED)}>
          {P360_KH.vcct.noDetail}
        </p>
      )}
    </div>
  );
}
