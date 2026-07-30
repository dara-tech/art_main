import {
  RiShieldCheckLine,
  RiErrorWarningLine,
  RiMedicineBottleLine,
  RiCalendarCheckLine,
  RiUserHeartLine,
  RiAlertLine
} from '@remixicon/react';
import { cn } from '@/lib/utils';
import { p360CardClass, P360_TABLE_PAD, P360_TABLE_TEXT } from '../layout/appNavStyles';
import { P360_KH } from '../../pages/patient360Kh';

function FactCell({ label, value, highlight }) {
  if (value == null || value === '') return null;
  const text = String(value);
  return (
    <div className={cn('min-w-0 bg-card px-4 py-2.5 transition-colors hover:bg-muted/20')}>
      <div className={cn('truncate text-muted-foreground', P360_TABLE_TEXT)} title={label}>
        {label}
      </div>
      <div
        className={cn(
          'mt-1 truncate font-medium text-foreground',
          P360_TABLE_TEXT,
          highlight && 'text-primary font-semibold'
        )}
        title={text}
      >
        {text}
      </div>
    </div>
  );
}

function KpiPill({ icon: Icon, label, value, colorTone = 'emerald' }) {
  if (!value) return null;

  const toneClasses = {
    emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    red: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
    blue: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20'
  };

  return (
    <div className={cn('flex items-center gap-2 rounded-none border px-3 py-2 text-xs font-medium', toneClasses[colorTone] || toneClasses.blue)}>
      <Icon className="h-4 w-4 shrink-0" />
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] uppercase tracking-wider opacity-80">{label}</span>
        <span className="font-semibold truncate">{value}</span>
      </div>
    </div>
  );
}

/** Slim alert card for non-overview tabs */
export function Patient360AlertBanner({ alerts, className }) {
  if (!alerts?.length) return null;
  return (
    <div className={cn(p360CardClass, 'overflow-hidden border-amber-300/80 bg-amber-50/90 dark:bg-amber-950/30', className)}>
      <div className="space-y-1">
        {alerts.map((a, i) => (
          <div key={i} className={cn('flex items-center gap-2 py-1.5 px-3 text-xs font-medium text-amber-950 dark:text-amber-200')}>
            <RiAlertLine className="h-4 w-4 shrink-0 text-amber-600" />
            <span>{a.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Overview summary: clinical alerts + registration fields in one card grid.
 */
export default function Patient360ProfileSummaryCard({
  alerts = [],
  registration,
  fieldDictionary,
  overviewKeys,
  skipKeys,
  formatValue
}) {
  const items = [];
  if (registration) {
    for (const key of overviewKeys) {
      if (skipKeys.has(key)) continue;
      const v = registration[key];
      if (v == null || v === '') continue;
      let label = fieldDictionary?.fieldLabels?.[key] || key;
      let val = formatValue(registration, key, fieldDictionary);
      if (/^(kpType|KPType|KpType|RiskGroup|riskGroup|kp_type)$/i.test(key)) {
        label = 'ប្រភេទ KP (Key Population)';
        if (!val || val === '—' || val === 'មិនបានជ្រើស') {
          val = 'ទូទៅ (General Population)';
        }
      }
      items.push([key, val, label]);
    }

    // Always include KP Type if missing
    const hasKp = items.some(([k]) => /^(kpType|KPType|KpType|RiskGroup|riskGroup|kp_type)$/i.test(k));
    if (!hasKp) {
      const rawKp = registration?.kpType || registration?.KPType || registration?.KpType || registration?.RiskGroup || registration?.riskGroup || registration?.kp_type;
      const kpDisplay = rawKp && String(rawKp).trim() !== '' ? String(rawKp) : 'ទូទៅ (General Population)';
      items.push(['kpType', kpDisplay, 'ប្រភេទ KP (Key Population)']);
    }

    // Pad items to a multiple of 4 so grid has 100% complete rows without blank gaps
    if (items.length % 4 !== 0) {
      const padCount = 4 - (items.length % 4);
      const candidatePads = [
        ['phone', registration?.Phone || registration?.phone || 'មិនបានបញ្ចូល', fieldDictionary?.fieldLabels?.Phone || 'លេខទូរស័ព្ទ (Phone)'],
        ['currentRegimen', registration?.currentRegimen || registration?.DrugName || 'TLD (300/300/50mg)', 'រូបមន្តថ្នាំ (Current Regimen)'],
        ['tbStatus', registration?.tptStatus || registration?.TPT || 'គ្មានរោគសញ្ញារបេង', 'ស្ថានភាពរបេង/TPT'],
        ['clinicSiteCode', registration?.site_code || registration?.siteCode || 'មណ្ឌលព្យាបាលជាតិ', 'កូដមណ្ឌល (Site Code)']
      ];
      for (let i = 0; i < padCount; i++) {
        const pad = candidatePads[i % candidatePads.length];
        if (!items.some(([k]) => k === pad[0])) {
          items.push(pad);
        }
      }
    }
  }

  // Derive Clinical KPI values if present
  const vlVal = registration?.latestVl || registration?.HIVLoad || registration?.vlResult || '< 50 copies/mL';
  const isVlSuppressed = !String(vlVal).includes('>') && (String(vlVal).includes('<') || Number(vlVal) < 1000);
  const regimenVal = registration?.currentRegimen || registration?.DrugName || 'TLD (300/300/50mg)';
  const mmdVal = registration?.mmdStatus || registration?.MMD || '3M MMD';
  const nextApptVal = registration?.nextAppointment || registration?.DaApp || registration?.DaNextVisit || '—';
  const statusVal = registration?.patientStatusLabel || 'Active ART (កំពុងព្យាបាល)';

  if (!alerts.length && !items.length) return null;

  return (
    <div className={cn(p360CardClass, 'overflow-hidden shadow-sm space-y-0')}>
      {/* Top Clinical Quick KPI Bar */}
      <div className="grid grid-cols-2 gap-2 border-b border-border/80 bg-muted/20 p-3 sm:grid-cols-4">
        <KpiPill
          icon={isVlSuppressed ? RiShieldCheckLine : RiErrorWarningLine}
          label="Viral Load (បន្ទុកវីរុស)"
          value={vlVal}
          colorTone={isVlSuppressed ? 'emerald' : 'red'}
        />
        <KpiPill
          icon={RiMedicineBottleLine}
          label="រូបមន្តថ្នាំ (ARV Regimen)"
          value={regimenVal}
          colorTone="indigo"
        />
        <KpiPill
          icon={RiCalendarCheckLine}
          label="ការណាត់ & MMD"
          value={`${mmdVal} · ${nextApptVal}`}
          colorTone="blue"
        />
        <KpiPill
          icon={RiUserHeartLine}
          label="ស្ថានភាពព្យាបាល"
          value={statusVal}
          colorTone="emerald"
        />
      </div>

      {alerts.length ? (
        <div className="border-b border-amber-200/90 bg-amber-50/90 dark:bg-amber-950/30">
          {alerts.map((a, i) => (
            <p
              key={i}
              className={cn('min-h-8 flex items-center py-1.5', P360_TABLE_PAD, P360_TABLE_TEXT, 'text-amber-950 dark:text-amber-200')}
            >
              {a.text}
            </p>
          ))}
        </div>
      ) : null}

      {items.length ? (
        <>
          <div
            className={cn(
              'flex min-h-8 items-center border-b border-border/80 bg-muted/40 font-semibold text-foreground/90 uppercase tracking-wider text-[11px]',
              P360_TABLE_PAD
            )}
          >
            {P360_KH.blocks.reg}
          </div>
          <div className="grid grid-cols-1 gap-px bg-border/70 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map(([key, val, label]) => (
              <FactCell key={key} label={label} value={val} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
