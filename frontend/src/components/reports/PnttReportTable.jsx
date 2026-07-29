import React from 'react';
import { AppSpinner } from '../ui/AppLoadingOverlay';

const PNTT_BLOCKS = [
  { titleKh: 'របាយការណ៍សរុបនៃការស្រាវជ្រាវរកកត្តាប្រឈមរបស់អ្នកជំងឺតម្រុយ', type: 'risk' },
  { titleKh: 'របាយការណ៍សរុបនៃ អ្នកជំងឺតម្រុយ', type: 'index' },
  { titleKh: 'របាយការណ៍សរុបនៃ ដៃគូរបស់អតិថិជន', type: 'partners' },
  { titleKh: 'របាយការណ៍សរុបនៃ កូនរបស់អតិថិជន', type: 'children' }
];

const RISK_INDICATOR_KHMER = [
  'ធ្លាប់រួមភេទជាមួយបុគ្គលដែលគេដឹងថាមានផ្ទុកមេរោគអេដស៍',
  '(សម្រាប់បុរស) ធ្លាប់រួមភេទជាមួយស្ត្រី',
  '(សម្រាប់បុរស) ធ្លាប់រួមភេទជាមួយបុរស',
  '(សម្រាប់បុរស) ធ្លាប់រួមភេទជាមួយក្រុមប្លែងភេទ',
  'ធ្លាប់រួមភេទជាមួយមនុស្សលើសពី៤នាក់',
  'ធ្លាប់ចាក់ថ្នាំញៀន',
  'ធ្លាប់ប្រើម្ជុលស៊ីរាំងរួមគ្នា',
  'ទទួលបានប្រាក់សម្រាប់ការរួមភេទ',
  'បានផ្តល់ប្រាក់សម្រាប់ការរួមភេទ',
  'ធ្លាប់ធ្វើចំណាកស្រុកទៅរកការងារ (ក្នុង ឬក្រៅប្រទេស)'
];

const INDEX_STRUCTURE = [
  { displayNum: 11, labelKh: 'ចំនួនអ្នកជំងឺតម្រុយ (>១៤ ឆ្នាំ) ក្នុងត្រីមាស', newScriptId: '11_PNTT_NEW_REG_aggregate', oldScriptId: '11.1_PNTT_OLD_REG_aggregate' },
  { displayNum: 12, labelKh: 'ចំនួនអ្នកជំងឺតម្រុយ ដែលបានផ្តល់សេវាតាមរកដៃគូ', newScriptId: '12_PNTT_NEW_PNS_aggregate', oldScriptId: '12.1_PNTT_OLD_PNS_aggregate' },
  { displayNum: 13, labelKh: 'ចំនួនអ្នកជំងឺតម្រុយ ដែលយល់ព្រមទទួលយកសេវាតាមរកដៃគូ', newScriptId: '13_PNTT_NEW_AGREE_aggregate', oldScriptId: '13.1_PNTT_OLD_AGREE_aggregate' }
];

const PARTNERS_STRUCTURE = [
  { displayNum: 14, labelKh: 'ចំនួនដៃគូដែលបានចុះបញ្ជី', newScriptId: '14_PNTT_NEW_PART_REG_aggregate', oldScriptId: '14.1_PNTT_OLD_PART_REG_aggregate' },
  { displayNum: 15, labelKh: 'ចំនួនដៃគូដែលបានជួបជូនព័ត៌មាន', subRows: [
    { labelKh: 'ដោយអ្នកជំងឺ', newScriptId: '15_PNTT_NEW_PART_REF_aggregate', oldScriptId: '15.1_PNTT_OLD_PART_REF_aggregate' },
    { labelKh: 'ដោយអ្នកផ្តល់សេវា', newScriptId: '18_PNTT_NEW_PART_PROV_aggregate', oldScriptId: '18.1_PNTT_OLD_PART_PROV_aggregate' },
    { labelKh: 'ដោយមានលក្ខខណ្ឌ', newScriptId: '21_PNTT_NEW_PART_CONT_aggregate', oldScriptId: '21.1_PNTT_OLD_PART_CONT_aggregate' },
    { labelKh: 'ដោយអ្នកជំងឺ និងអ្នកផ្តល់សេវា', newScriptId: '22_PNTT_NEW_PART_DUAL_aggregate', oldScriptId: '22.1_PNTT_OLD_PART_DUAL_aggregate' }
  ]},
  { displayNum: 16, labelKh: 'ចំនួនដៃគូដែលបានធ្វើតេស្តរកមេរោគអេដស៍', subRows: [
    { labelKh: 'ដៃគូដែលបានធ្វើតេស្តតាម HTS', newScriptId: '16_PNTT_NEW_PART_HTS_aggregate', oldScriptId: '16.1_PNTT_OLD_PART_HTS_aggregate' },
    { labelKh: 'ដៃគូដែលបានធ្វើតេស្តតាមរយៈ HIVST', newScriptId: '19_PNTT_NEW_PART_HIVST_aggregate', oldScriptId: '19.1_PNTT_OLD_PART_HIVST_aggregate' }
  ]},
  { displayNum: 17, labelKh: 'ចំនួនដៃគូដែលបានធ្វើតេស្តរកមេរោគអេដស៍ ហើយមានលទ្ធផលវិជ្ជមាន', subRows: [
    { labelKh: 'ដៃគូដែលបានធ្វើតេស្តដំបូងតាម HTS', newScriptId: '17_PNTT_NEW_PART_HTS_POS_aggregate', oldScriptId: '17.1_PNTT_OLD_PART_HTS_POS_aggregate' },
    { labelKh: 'ដៃគូដែលបានធ្វើតេស្តដំបូងតាមរយៈ HIVST', newScriptId: '20_PNTT_NEW_PART_HIVST_POS_aggregate', oldScriptId: '20.1_PNTT_OLD_PART_HIVST_POS_aggregate' }
  ]},
  { displayNum: 18, labelKh: 'ចំនួនដៃគូដែលមានលទ្ធផលវិជ្ជមានបានចុះឈ្មោះទទួលការព្យាបាល សរុប', newScriptId: '23_PNTT_NEW_PART_POS_REG_aggregate', oldScriptId: '23.1_PNTT_OLD_PART_POS_REG_aggregate' }
];

const CHILDREN_STRUCTURE = [
  { displayNum: 19, labelKh: 'ចំនួនកូនអតិថិជនតម្រុយ ដែលបានចុះបញ្ជី', newScriptId: '19_PNTT_NEW_CHILD_REG_aggregate', oldScriptId: '19.1_PNTT_OLD_CHILD_REG_aggregate' },
  { displayNum: 20, labelKh: 'ចំនួនកូន ដែលបានជួប/ជូនព័ត៌មាន', subRows: [
    // Align with partner section: REF = index client / អ្នកជំងឺ (PlanChild=0), PROV = provider / អ្នកផ្តល់សេវា (PlanChild=1)
    { labelKh: 'ដោយអ្នកជំងឺ', newScriptId: '20_PNTT_NEW_CHILD_REF_aggregate', oldScriptId: '20.1_PNTT_OLD_CHILD_REF_aggregate' },
    { labelKh: 'ដោយអ្នកផ្តល់សេវា', newScriptId: '20 PNTT_NEW_CHILD_PROV_aggregate', oldScriptId: '20.1 . PNTT_OLD_CHILD_PROV_aggregate' },
    { labelKh: 'ដោយមានលក្ខខណ្ឌ', newScriptId: '20.PNTT_NEW_CHILD_CONT_aggregate', oldScriptId: '20.1 PNTT_OLD_CHILD_CONT_aggregate' },
    { labelKh: 'ដោយអ្នកជំងឺ និងអ្នកផ្តល់សេវា', newScriptId: '20.1_PNTT_NEW_CHILD_DUAL_aggregate', oldScriptId: '20.1 PNTT_OLD_CHILD_DUAL_aggregate' }
  ]},
  { displayNum: 21, labelKh: 'ចំនួនកូនដែលបានធ្វើតេស្តរកមេរោគអេដស៍', subRows: [
    { labelKh: 'កូនដែលបានធ្វើតេស្តតាម HTS', newScriptId: '21_PNTT_NEW_CHILD_TEST_aggregate', oldScriptId: '21.1_PNTT_OLD_CHILD_TEST_aggregate' }
  ]},
  { displayNum: 22, labelKh: 'ចំនួនកូនដែលបានធ្វើតេស្ត ហើយមានលទ្ធផលវិជ្ជមាន', subRows: [
    { labelKh: 'កូនដែលបានធ្វើតេស្តដំបូងតាម HTS', newScriptId: '22_PNTT_NEW_CHILD_POS_aggregate', oldScriptId: '22.1_PNTT_OLD_CHILD_POS_aggregate' }
  ]},
  { displayNum: 23, labelKh: 'ចំនួនកូន ដែលមានលទ្ធផលវិជ្ជមាន បានចុះឈ្មោះទទួលការព្យាបាល', newScriptId: '23_PNTT_NEW_CHILD_POS_REG_aggregate', oldScriptId: '23.1_PNTT_OLD_CHILD_POS_REG_aggregate' }
];

const getFirstRow = (section) => (Array.isArray(section?.rows) && section.rows.length ? section.rows[0] : null);
const getSectionByScript = (sections, scriptId) => sections.find((s) => s.scriptId === scriptId) || null;
const asNum = (v) => Number(v ?? 0);
/** Align សរុប with ប្រុស + ស្រី (SQL Tsex can count unknown / non-0/1 sex). */
const mfTotal = (row) => asNum(row?.male) + asNum(row?.female);

function renderMainHeader(type = 'default') {
  const firstColTitle = type === 'risk' ? 'កត្តាប្រឈម' : 'សូចនាករ';
  const subHeaders = type === 'risk'
    ? ['ធ្លាប់', '៦ខែ', 'មិនធ្លាប់', 'ធ្លាប់', '៦ខែ', 'មិនធ្លាប់']
    : ['ប្រុស', 'ស្រី', 'សរុប', 'ប្រុស', 'ស្រី', 'សរុប'];
    return (
    <thead className="sticky top-0 z-10 border-b border-border/20 bg-muted/95 backdrop-blur-md">
      <tr className="border-b border-border/20 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        <th className="w-[48%] border-r border-border/20 px-3 py-2 text-left align-middle" rowSpan={2}>{firstColTitle}</th>
        <th className="border-r border-border/20 px-2 py-2 text-center bg-muted/30" colSpan={3}>អ្នកចុះឈ្មោះថ្មី</th>
        <th className="border-r border-border/20 px-2 py-2 text-center bg-muted/30" colSpan={3}>ករណីតាមដានបន្ត</th>
      </tr>
      <tr className="border-b border-border/20 bg-muted/30 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        <th className="w-[12%] border-r border-border/20 px-2 py-1.5 text-center">{subHeaders[0]}</th>
        <th className="w-[12%] border-r border-border/20 px-2 py-1.5 text-center">{subHeaders[1]}</th>
        <th className="w-[12%] border-r border-border/20 px-2 py-1.5 text-center">{subHeaders[2]}</th>
        <th className="w-[12%] border-r border-border/20 px-2 py-1.5 text-center">{subHeaders[3]}</th>
        <th className="w-[12%] border-r border-border/20 px-2 py-1.5 text-center">{subHeaders[4]}</th>
        <th className="w-[12%] border-r border-border/20 px-2 py-1.5 text-center">{subHeaders[5]}</th>
      </tr>
    </thead>
  );
}

function RiskBlock({ sections, formatValue, onCellClick }) {
  const newSec = getSectionByScript(sections, '1-10 PNTT_NEW_RISK_aggregate');
  const oldSec = getSectionByScript(sections, '1.1-10.1 PNTT_OLD_RISK_aggregate') || getSectionByScript(sections, '1.1 - 10.1 PNTT_OLD_RISK_aggregate');
  const newRows = Array.isArray(newSec?.rows) ? newSec.rows : [];
  const oldRows = Array.isArray(oldSec?.rows) ? oldSec.rows : [];
  const n = Math.max(newRows.length, oldRows.length, 10);
  return (
    <tbody>
      {Array.from({ length: n }, (_, i) => {
        const nRow = newRows[i] || {};
        const oRow = oldRows[i] || {};
        return (
          <tr key={`risk-${i}`} className={`${i % 2 ? 'bg-muted/5' : ''} hover:bg-muted/20 transition-colors duration-150`}>
            <td className="border border-border/20 px-3 py-2 align-top text-xs font-medium text-foreground wrap-break-word w-[28%]">{i + 1}. {RISK_INDICATOR_KHMER[i] || `កត្តាប្រឈម ${i + 1}`}</td>
            <td className="cursor-pointer border border-border/20 px-2 py-2 text-right text-xs tabular-nums text-report-male hover:bg-muted/30 transition-colors duration-150" onClick={() => onCellClick?.(newSec, nRow, i, 'ever')}>{formatValue(asNum(nRow.ever))}</td>
            <td className="cursor-pointer border border-border/20 px-2 py-2 text-right text-xs tabular-nums text-report-female hover:bg-muted/30 transition-colors duration-150" onClick={() => onCellClick?.(newSec, nRow, i, 'sixMonths')}>{formatValue(asNum(nRow.sixMonths))}</td>
            <td className="cursor-pointer border border-border/20 px-2 py-2 text-right text-xs tabular-nums hover:bg-muted/30 transition-colors duration-150" onClick={() => onCellClick?.(newSec, nRow, i, 'never')}>{formatValue(asNum(nRow.never))}</td>
            <td className="cursor-pointer border border-border/20 px-2 py-2 text-right text-xs tabular-nums text-report-male hover:bg-muted/30 transition-colors duration-150" onClick={() => onCellClick?.(oldSec, oRow, i, 'ever')}>{formatValue(asNum(oRow.ever))}</td>
            <td className="cursor-pointer border border-border/20 px-2 py-2 text-right text-xs tabular-nums text-report-female hover:bg-muted/30 transition-colors duration-150" onClick={() => onCellClick?.(oldSec, oRow, i, 'sixMonths')}>{formatValue(asNum(oRow.sixMonths))}</td>
            <td className="cursor-pointer border border-border/20 px-2 py-2 text-right text-xs tabular-nums hover:bg-muted/30 transition-colors duration-150" onClick={() => onCellClick?.(oldSec, oRow, i, 'never')}>{formatValue(asNum(oRow.never))}</td>
          </tr>
        );
      })}
    </tbody>
  );
}

function FlatRowsBlock({ rows, formatValue, onCellClick }) {
  return (
    <tbody>
      {rows.map((r) => (
        <tr key={r.key} className={r.isSubtotal ? 'bg-muted/10 font-semibold' : 'hover:bg-muted/20 transition-colors duration-150'}>
          <td className="border border-border/20 px-3 py-2 text-xs text-foreground">{r.label}</td>
          <td className="cursor-pointer border border-border/20 px-2 py-2 text-right text-xs tabular-nums text-report-male hover:bg-muted/30 transition-colors duration-150" onClick={() => r.newSection && onCellClick?.(r.newSection, r.newRow || {}, 0, 'male')}>{formatValue(r.newMale)}</td>
          <td className="cursor-pointer border border-border/20 px-2 py-2 text-right text-xs tabular-nums text-report-female hover:bg-muted/30 transition-colors duration-150" onClick={() => r.newSection && onCellClick?.(r.newSection, r.newRow || {}, 0, 'female')}>{formatValue(r.newFemale)}</td>
          <td className={`cursor-pointer border border-border/20 px-2 py-2 text-right text-xs tabular-nums hover:bg-muted/30 transition-colors duration-150 ${r.isSubtotal ? 'font-bold underline text-foreground' : 'text-foreground'}`} onClick={() => r.newSection && onCellClick?.(r.newSection, r.newRow || {}, 0, 'total')}>{formatValue(r.newTotal)}</td>
          <td className="cursor-pointer border border-border/20 px-2 py-2 text-right text-xs tabular-nums text-report-male hover:bg-muted/30 transition-colors duration-150" onClick={() => r.oldSection && onCellClick?.(r.oldSection, r.oldRow || {}, 0, 'male')}>{formatValue(r.oldMale)}</td>
          <td className="cursor-pointer border border-border/20 px-2 py-2 text-right text-xs tabular-nums text-report-female hover:bg-muted/30 transition-colors duration-150" onClick={() => r.oldSection && onCellClick?.(r.oldSection, r.oldRow || {}, 0, 'female')}>{formatValue(r.oldFemale)}</td>
          <td className={`cursor-pointer border border-border/20 px-2 py-2 text-right text-xs tabular-nums hover:bg-muted/30 transition-colors duration-150 ${r.isSubtotal ? 'font-bold underline text-foreground' : 'text-foreground'}`} onClick={() => r.oldSection && onCellClick?.(r.oldSection, r.oldRow || {}, 0, 'total')}>{formatValue(r.oldTotal)}</td>
        </tr>
      ))}
    </tbody>
  );
}

function buildRows(structure, sections) {
  const out = [];
  structure.forEach((item) => {
    if (item.subRows) {
      const subs = item.subRows.map((s) => {
        const n = getFirstRow(getSectionByScript(sections, s.newScriptId));
        const o = getFirstRow(getSectionByScript(sections, s.oldScriptId));
        return {
          key: `${item.displayNum}-${s.labelKh}`,
          label: `- ${s.labelKh}`,
          newSection: getSectionByScript(sections, s.newScriptId),
          newRow: n || {},
          oldSection: getSectionByScript(sections, s.oldScriptId),
          oldRow: o || {},
          newMale: asNum(n?.male),
          newFemale: asNum(n?.female),
          newTotal: mfTotal(n),
          oldMale: asNum(o?.male),
          oldFemale: asNum(o?.female),
          oldTotal: mfTotal(o)
        };
      });
      const total = subs.reduce(
        (a, r) => ({
          newMale: a.newMale + r.newMale,
          newFemale: a.newFemale + r.newFemale,
          newTotal: a.newTotal + r.newTotal,
          oldMale: a.oldMale + r.oldMale,
          oldFemale: a.oldFemale + r.oldFemale,
          oldTotal: a.oldTotal + r.oldTotal
        }),
        { newMale: 0, newFemale: 0, newTotal: 0, oldMale: 0, oldFemale: 0, oldTotal: 0 }
      );
      out.push({ key: `${item.displayNum}`, label: `${item.displayNum}. ${item.labelKh}`, ...total, isSubtotal: true });
      out.push(...subs);
    } else {
      const n = getFirstRow(getSectionByScript(sections, item.newScriptId));
      const o = getFirstRow(getSectionByScript(sections, item.oldScriptId));
      out.push({
        key: `${item.displayNum}`,
        label: `${item.displayNum}. ${item.labelKh}`,
        newSection: getSectionByScript(sections, item.newScriptId),
        newRow: n || {},
        oldSection: getSectionByScript(sections, item.oldScriptId),
        oldRow: o || {},
        newMale: asNum(n?.male),
        newFemale: asNum(n?.female),
        newTotal: mfTotal(n),
        oldMale: asNum(o?.male),
        oldFemale: asNum(o?.female),
        oldTotal: mfTotal(o)
      });
    }
  });
  return out;
}

export default function PnttReportTable({ sections = [], loading = false, formatValue, onCellClick }) {
  if (loading && !sections.length) {
    return (
      <div className="border border-border p-10 text-center flex flex-col items-center justify-center gap-3 select-none">
        <AppSpinner size="md" />
        <p className="text-xs font-bold text-foreground">Loading PNTT report...</p>
      </div>
    );
  }

  if (!sections.length) {
    return <div className="border border-border p-8 text-center text-xs text-muted-foreground">No data for the selected period.</div>;
  }

  return (
    <div className="space-y-4">
      {PNTT_BLOCKS.map((block) => {
        const rows =
          block.type === 'index'
            ? buildRows(INDEX_STRUCTURE, sections)
            : block.type === 'partners'
              ? buildRows(PARTNERS_STRUCTURE, sections)
              : block.type === 'children'
                ? buildRows(CHILDREN_STRUCTURE, sections)
                : null;

        return (
          <div key={block.titleKh} className="space-y-2">
            <h2 className="py-2 text-center text-base font-bold text-foreground sm:text-lg">{block.titleKh}</h2>
            <table className="w-full border-collapse border border-border/20 text-xs" style={{ tableLayout: 'fixed' }}>
              {renderMainHeader(block.type)}
              {block.type === 'risk'
                ? <RiskBlock sections={sections} formatValue={formatValue} onCellClick={onCellClick} />
                : <FlatRowsBlock rows={rows || []} formatValue={formatValue} onCellClick={onCellClick} />}
            </table>
          </div>
        );
      })}
    </div>
  );
}
