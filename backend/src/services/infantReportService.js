const fs = require('fs');
const path = require('path');
const { siteDatabaseManager } = require('../config/siteDatabase');

const INFANT_SCRIPTS_DIR = path.join(__dirname, '../../queries/INFANT_AGGREGATE_SCRIPTS');
const INFANT_DETAIL_SCRIPTS_DIR = path.join(__dirname, '../../queries/INFANT_DETAIL_SCRIPTS');

const SECTION_DEFS = [
  {
    scriptId: '01_INFANT_PREVIOUS_QUARTER_aggregate',
    detailScriptId: '01_INFANT_PREVIOUS_QUARTER_details',
    sectionNumber: 1,
    sectionLabelEn: 'Number of HEI receiving CARE at the end of preceding quarter',
    sectionLabelKh: 'ចំនួនកុមារប្រឈមដែលបាននិងកំពុងទទួលការថែទាំ រហូតដល់ចុងត្រីមាសមុន',
    normalizer: (rows) => {
      const r = rows && rows[0];
      const male = Number(r?.M_total ?? 0);
      const female = Number(r?.F_total ?? 0);
      return [{ labelEn: '', labelKh: '', male, female, total: male + female }];
    }
  },
  {
    scriptId: '02_INFANT_NEW_LESS2_aggregate',
    detailScriptIds: ['02_INFANT_NEW_LESS2_details', '02_INFANT_NEW_GREAT2_details'],
    sectionNumber: 2,
    sectionLabelEn: 'Number of New HEI first visit CARE during this quarter',
    sectionLabelKh: 'ចំនួនកុមារថ្មី ទទួលការថែទាំលើកដំបូង',
    subScriptId: '02_INFANT_NEW_GREAT2_aggregate',
    normalizer: (rowsLess2, rowsGreat2) => {
      const r1 = rowsLess2 && rowsLess2[0];
      const r2 = rowsGreat2 && rowsGreat2[0];
      const maleLess = Number(r1?.M_less2 ?? 0);
      const femaleLess = Number(r1?.F_less2 ?? 0);
      const maleGreat = Number(r2?.M_great2 ?? 0);
      const femaleGreat = Number(r2?.F_great2 ?? 0);
      return [
        { labelEn: 'Age ≤ 2 months', labelKh: 'អាយុ ≤ 2ខែ', male: maleLess, female: femaleLess, total: maleLess + femaleLess },
        { labelEn: 'Age > 2 months', labelKh: 'អាយុ > 2ខែ', male: maleGreat, female: femaleGreat, total: maleGreat + femaleGreat },
        { labelEn: 'Total', labelKh: 'សរុប Total', male: maleLess + maleGreat, female: femaleLess + femaleGreat, total: maleLess + femaleLess + maleGreat + femaleGreat, isSubtotal: true }
      ];
    }
  },
  {
    scriptId: '03_INFANT_TRANSFER_IN_aggregate',
    detailScriptId: '03_INFANT_TRANSFER_IN_details',
    sectionNumber: 3,
    sectionLabelEn: 'Official Transferred In',
    sectionLabelKh: 'កុមារបញ្ជូនចូល',
    normalizer: (rows) => {
      const r = rows && rows[0];
      const maleLess = Number(r?.M_less2 ?? 0);
      const femaleLess = Number(r?.F_less2 ?? 0);
      const maleGreat = Number(r?.M_great2 ?? 0);
      const femaleGreat = Number(r?.F_great2 ?? 0);
      return [
        { labelEn: 'Age ≤ 2 months', labelKh: 'អាយុ ≤ 2ខែ', male: maleLess, female: femaleLess, total: maleLess + femaleLess },
        { labelEn: 'Age > 2 months', labelKh: 'អាយុ > 2ខែ', male: maleGreat, female: femaleGreat, total: maleGreat + femaleGreat }
      ];
    }
  },
  {
    scriptId: '04_INFANT_DNA_TEST_LESS2_aggregate',
    detailScriptIds: ['04_INFANT_DNA_TEST_LESS2_details', '04_INFANT_DNA_TEST_GREAT2_details'],
    sectionNumber: 4,
    sectionLabelEn: 'Number of Exposed Infant tested DNA PCR during this quarter',
    sectionLabelKh: 'ចំនួនកុមារដែលបានធ្វើតេស្ត DNA PCR នៅក្នុងត្រីមាសនេះ',
    subScriptId: '06_INFANT_DNA_TEST_GREAT2_aggregate',
    normalizer: (rowsLess, rowsGreat) => {
      const r1 = rowsLess && rowsLess[0];
      const r2 = rowsGreat && rowsGreat[0];
      const maleLess = Number(r1?.m_less2m ?? 0);
      const femaleLess = Number(r1?.f_less2m ?? 0);
      const maleGreat = Number(r2?.m_great2m ?? 0);
      const femaleGreat = Number(r2?.f_great2m ?? 0);
      return [
        { labelEn: 'Age ≤ 2 months', labelKh: 'អាយុ ≤ 2ខែ', male: maleLess, female: femaleLess, total: maleLess + femaleLess },
        { labelEn: 'Age > 2 months', labelKh: 'អាយុ > 2ខែ', male: maleGreat, female: femaleGreat, total: maleGreat + femaleGreat },
        { labelEn: 'Total', labelKh: 'សរុប Total', male: maleLess + maleGreat, female: femaleLess + femaleGreat, total: maleLess + femaleLess + maleGreat + femaleGreat, isSubtotal: true }
      ];
    }
  },
  {
    scriptId: '05_INFANT_COTRIM_aggregate',
    detailScriptId: '05_INFANT_COTRIM_details',
    sectionNumber: 5,
    sectionLabelEn: 'Number of HEI started Cotrimoxazole during this quarter',
    sectionLabelKh: 'ចំនួនកុមារចាប់ផ្តើមប្រើថ្នាំ Cotrimoxazole',
    normalizer: (rows) => {
      const list = Array.isArray(rows) ? rows : [];
      const male = list.filter((r) => Number(r?.Sex) === 1).length;
      const female = list.filter((r) => Number(r?.Sex) === 0).length;
      return [{ labelEn: '', labelKh: '', male, female, total: male + female }];
    }
  },
  {
    scriptId: '06_INFANT_DNA_REQUESTED_aggregate',
    detailScriptIds: [
      '06_INFANT_DNA_REQUESTED_BIRTH_details',
      '06_INFANT_DNA_REQUESTED_46WEEKS_details',
      '06_INFANT_DNA_REQUESTED_9MONTHS_details',
      '06_INFANT_DNA_REQUESTED_CONFIRM_details',
      '06_INFANT_DNA_REQUESTED_OI_details'
    ],
    sectionNumber: 6,
    sectionLabelEn: 'Number of DNA PCR requested by clinician during this quarter',
    sectionLabelKh: 'ចំនួនតេស្ត DNA PCR ដែលគ្រូពេទ្យស្នើក្នុងត្រីមាសនេះ',
    normalizer: (rows) => {
      const r = rows && rows[0];
      const mBirth = Number(r?.m_birth ?? 0);
      const fBirth = Number(r?.f_birth ?? 0);
      const m46w = Number(r?.m_46w ?? 0);
      const f46w = Number(r?.f_46w ?? 0);
      const m9m = Number(r?.m_9m ?? 0);
      const f9m = Number(r?.f_9m ?? 0);
      const mConfirm = Number(r?.m_confirm ?? 0);
      const fConfirm = Number(r?.f_confirm ?? 0);
      const mOi = Number(r?.m_oi ?? 0);
      const fOi = Number(r?.f_oi ?? 0);
      return [
        { labelEn: 'At Birth', labelKh: 'នៅពេលកើត', male: mBirth, female: fBirth, total: mBirth + fBirth },
        { labelEn: '4-6 Weeks', labelKh: '៤-៦ សប្តាហ៍', male: m46w, female: f46w, total: m46w + f46w },
        { labelEn: '9 Months', labelKh: '៩ ខែ', male: m9m, female: f9m, total: m9m + f9m },
        { labelEn: 'Confirmatory', labelKh: 'បញ្ជាក់', male: mConfirm, female: fConfirm, total: mConfirm + fConfirm },
        { labelEn: 'OI (Opportunistic Infection)', labelKh: 'OI (ជំងឺឱកាសនិយម)', male: mOi, female: fOi, total: mOi + fOi },
        {
          labelEn: 'Total',
          labelKh: 'សរុប Total',
          male: mBirth + m46w + m9m + mConfirm + mOi,
          female: fBirth + f46w + f9m + fConfirm + fOi,
          total: mBirth + fBirth + m46w + f46w + m9m + f9m + mConfirm + fConfirm + mOi + fOi,
          isSubtotal: true
        }
      ];
    }
  },
  { scriptId: '07_INFANT_DNA_BIRTH_aggregate', detailScriptId: '07_INFANT_DNA_BIRTH_details', sectionNumber: 7, sectionLabelEn: 'Number of DNA PCR tested results at birth', sectionLabelKh: 'ចំនួនលទ្ធផលតេស្ត DNA PCR នៅពេលកើត', normalizer: (rows) => dnaResultNormalizer(rows, { po: 'B', ne: 'B', w: 'B' }) },
  { scriptId: '08_INFANT_DNA_CONFIRM_BIRTH_aggregate', detailScriptId: '08_INFANT_DNA_CONFIRM_BIRTH_details', sectionNumber: 8, sectionLabelEn: 'Number of DNA PCR Confirmatory tested results at birth', sectionLabelKh: 'ចំនួនលទ្ធផលតេស្តបញ្ជាក់ DNA PCR នៅពេលកើត', normalizer: (rows) => dnaResultNormalizer(rows, { po: 'cB', ne: 'cB', w: 'cB' }) },
  { scriptId: '09_INFANT_DNA_4_6WEEKS_aggregate', detailScriptId: '09_INFANT_DNA_4_6WEEKS_details', sectionNumber: 9, sectionLabelEn: 'Number of DNA PCR tested results at 4-6 weeks after birth', sectionLabelKh: 'ចំនួនលទ្ធផលតេស្ត DNA PCR នៅអាយុចន្លោះពី ៤ ទៅ ៦ សប្តាហ៍', normalizer: (rows) => dnaResultNormalizer(rows, { po: '46', ne: '46', w: '46' }) },
  { scriptId: '10_INFANT_DNA_CONFIRM_4_6WEEKS_aggregate', detailScriptId: '10_INFANT_DNA_CONFIRM_4_6WEEKS_details', sectionNumber: 10, sectionLabelEn: 'Number of DNA PCR Confirmatory tested results at 4-6 weeks', sectionLabelKh: 'ចំនួនលទ្ធផលតេស្តបញ្ជាក់ DNA PCR ចន្លោះពី ៤ ទៅ ៦ សប្តាហ៍', normalizer: (rows) => dnaResultNormalizer(rows, { po: 'c46', ne: 'c46', w: 'c46' }) },
  { scriptId: '11_INFANT_DNA_9MONTHS_aggregate', detailScriptId: '11_INFANT_DNA_9MONTHS_details', sectionNumber: 11, sectionLabelEn: 'Number of DNA PCR tested results at 9 months', sectionLabelKh: 'ចំនួនលទ្ធផលតេស្ត DNA PCR អាយុ ៩ ខែ', normalizer: (rows) => dnaResultNormalizer(rows, { po: '9', ne: '9', w: '9' }) },
  { scriptId: '12_INFANT_DNA_CONFIRM_9MONTHS_aggregate', detailScriptId: '12_INFANT_DNA_CONFIRM_9MONTHS_details', sectionNumber: 12, sectionLabelEn: 'Number of DNA PCR Confirmatory tested results at 9 months', sectionLabelKh: 'ចំនួនលទ្ធផលតេស្តបញ្ជាក់ DNA PCR អាយុ ៩ ខែ', normalizer: (rows) => dnaResultNormalizer(rows, { po: 'c9', ne: 'c9', w: 'c9' }) },
  {
    scriptId: '13_INFANT_DNA_OI_aggregate',
    detailScriptId: '13_INFANT_DNA_OI_details',
    sectionNumber: 13,
    sectionLabelEn: 'Number of DNA PCR tested results (OI symptomatic)',
    sectionLabelKh: 'ចំនួនលទ្ធផលតេស្ត DNA PCR ករណីមានជំងឺឱកាសនិយម',
    normalizer: (rows) => {
      const r = rows && rows[0];
      const male = Number(r?.m_OI ?? 0);
      const female = Number(r?.f_OI ?? 0);
      return [{ labelEn: '', labelKh: '', male, female, total: male + female }];
    }
  },
  { scriptId: '14_INFANT_DNA_CONFIRM_OI_aggregate', detailScriptId: '14_INFANT_DNA_CONFIRM_OI_details', sectionNumber: 14, sectionLabelEn: 'Number of DNA PCR Confirmatory tested results (OI)', sectionLabelKh: 'ចំនួនលទ្ធផលតេស្តបញ្ជាក់ DNA PCR ករណី OI', normalizer: (rows) => dnaResultNormalizer(rows, { po: 'coi', ne: 'coi', w: 'coi' }) },
  {
    scriptId: '15_INFANT_DNA_OTHER_aggregate',
    detailScriptId: '15_INFANT_DNA_OTHER_details',
    sectionNumber: 15,
    sectionLabelEn: 'Number of DNA PCR Other test',
    sectionLabelKh: 'ចំនួនតេស្ត DNA PCR ករណីផ្សេងៗទៀត',
    normalizer: (rows) => {
      const r = rows && rows[0];
      const male = Number(r?.m_Other ?? 0);
      const female = Number(r?.f_Other ?? 0);
      return [{ labelEn: '', labelKh: '', male, female, total: male + female }];
    }
  },
  { scriptId: '16_INFANT_DNA_CONFIRM_OTHER_aggregate', detailScriptId: '16_INFANT_DNA_CONFIRM_OTHER_details', sectionNumber: 16, sectionLabelEn: 'Other DNA PCR Confirmatory test', sectionLabelKh: 'តេស្តបញ្ជាក់ករណីផ្សេងៗ', normalizer: (rows) => dnaResultNormalizer(rows, { po: 'other_confirm', ne: 'other_confirm', w: 'other_confirm' }) },
  {
    scriptId: '17_INFANT_ANTIBODY_aggregate',
    detailScriptId: '17_INFANT_ANTIBODY_details',
    sectionNumber: 17,
    sectionLabelEn: 'Number of HIV Exposed Infants with HIV Antibody Tested results',
    sectionLabelKh: 'ចំនួនកុមារប្រឈមដែលធ្វើតេស្ត Antibody',
    normalizer: (rows) => {
      const r = rows && rows[0];
      const mPos = Number(r?.m_positive ?? 0);
      const fPos = Number(r?.f_positive ?? 0);
      const mNeg = Number(r?.m_negative ?? 0);
      const fNeg = Number(r?.f_negative ?? 0);
      return [
        { labelEn: 'Positive (+)', labelKh: 'លទ្ធផល(+)', male: mPos, female: fPos, total: mPos + fPos },
        { labelEn: 'Negative (-)', labelKh: 'លទ្ធផល(-)', male: mNeg, female: fNeg, total: mNeg + fNeg },
        { labelEn: 'Total', labelKh: 'សរុប Total', male: mPos + mNeg, female: fPos + fNeg, total: mPos + fPos + mNeg + fNeg, isSubtotal: true }
      ];
    }
  },
  {
    scriptId: '18_INFANT_OUTCOME_aggregate',
    detailScriptId: '18_INFANT_OUTCOME_details',
    sectionNumber: 18,
    sectionLabelEn: 'Number of Exposed Infants who left Care',
    sectionLabelKh: 'ចំនួនកុមារដែលបានចាកចេញពីការថែទាំ',
    normalizer: (rows) => {
      const list = Array.isArray(rows) ? rows : [];
      const statusOrder = [0, 1, 3, 4, 5];
      const statusLabels = {
        0: { en: 'Died', kh: 'ស្លាប់' },
        1: { en: 'Lost (*)', kh: 'លះបង់ (*)' },
        3: { en: 'Transferred Out', kh: 'បញ្ជូនចេញ' },
        4: { en: 'HIV (-) Discharged', kh: 'លទ្ធផល HIV (-) បញ្ឈប់ការថែទាំ' },
        5: { en: 'HIV (+) receiving ART', kh: 'លទ្ធផល HIV (+) ទទួលការព្យាបាលនៅសេវា ART កុមារ' }
      };
      const byStatus = {};
      statusOrder.forEach((s) => {
        byStatus[s] = { labelEn: statusLabels[s].en, labelKh: statusLabels[s].kh, male: 0, female: 0, total: 0 };
      });
      list.forEach((row) => {
        const s = Number(row?.Status);
        if (byStatus[s] == null) byStatus[s] = { labelEn: `Status ${s}`, labelKh: `ស្ថានភាព ${s}`, male: 0, female: 0, total: 0 };
        const cnt = Number(row?.count ?? 0);
        if (Number(row?.Sex) === 1) byStatus[s].male += cnt;
        else byStatus[s].female += cnt;
        byStatus[s].total += cnt;
      });
      const out = statusOrder.map((s) => byStatus[s]);
      const totMale = out.reduce((a, x) => a + x.male, 0);
      const totFemale = out.reduce((a, x) => a + x.female, 0);
      out.push({ labelEn: 'Total', labelKh: 'សរុប Total', male: totMale, female: totFemale, total: totMale + totFemale, isSubtotal: true });
      return out;
    }
  },
  {
    scriptId: '19_INFANT_TOTAL_ON_CARE_aggregate',
    detailScriptId: '19_INFANT_TOTAL_ON_CARE_details',
    sectionNumber: 19,
    sectionLabelEn: 'Total Number of Exposed Infants on Follow up and Care at end of this quarter',
    sectionLabelKh: 'ចំនួនកុមារប្រឈមសរុបក្នុងការតាមដាននិងថែទាំដល់ចុងត្រីមាស',
    normalizer: (rows) => {
      const r = rows && rows[0];
      const male = Number(r?.M_total ?? 0);
      const female = Number(r?.F_total ?? 0);
      return [{ labelEn: '', labelKh: '', male, female, total: male + female }];
    }
  }
];

function dnaResultNormalizer(rows, suffixes) {
  const r = rows && rows[0];
  const s = typeof suffixes === 'object' && suffixes !== null ? suffixes : { po: suffixes, ne: suffixes, w: suffixes };
  const mPo = Number(r?.[`m_po_${s.po}`] ?? 0);
  const fPo = Number(r?.[`f_po_${s.po}`] ?? 0);
  const mNe = Number(r?.[`m_ne_${s.ne}`] ?? 0);
  const fNe = Number(r?.[`f_ne_${s.ne}`] ?? 0);
  const mW = Number(r?.[`m_w_${s.w}`] ?? 0);
  const fW = Number(r?.[`f_w_${s.w}`] ?? 0);
  return [
    { labelEn: 'Positive (+)', labelKh: 'លទ្ធផល(+)', male: mPo, female: fPo, total: mPo + fPo },
    { labelEn: 'Negative (-)', labelKh: 'លទ្ធផល(-)', male: mNe, female: fNe, total: mNe + fNe },
    { labelEn: 'Pending', labelKh: 'រង់ចាំលទ្ធផល', male: mW, female: fW, total: mW + fW },
    { labelEn: 'Total', labelKh: 'សរុប Total', male: mPo + mNe + mW, female: fPo + fNe + fW, total: mPo + fPo + mNe + fNe + mW + fW, isSubtotal: true }
  ];
}

class InfantReportService {
  constructor() {
    this.queries = new Map();
    this.detailQueries = new Map();
    this.loadQueries();
    this.loadDetailQueries();
  }

  loadQueries() {
    if (!fs.existsSync(INFANT_SCRIPTS_DIR)) return;
    const files = fs.readdirSync(INFANT_SCRIPTS_DIR).filter((f) => f.endsWith('.sql'));
    files.forEach((filename) => {
      const filePath = path.join(INFANT_SCRIPTS_DIR, filename);
      const content = fs.readFileSync(filePath, 'utf8');
      this.queries.set(filename.replace('.sql', ''), content);
    });
  }

  loadDetailQueries() {
    if (!fs.existsSync(INFANT_DETAIL_SCRIPTS_DIR)) return;
    const files = fs.readdirSync(INFANT_DETAIL_SCRIPTS_DIR).filter((f) => f.endsWith('.sql'));
    files.forEach((filename) => {
      const filePath = path.join(INFANT_DETAIL_SCRIPTS_DIR, filename);
      const content = fs.readFileSync(filePath, 'utf8');
      this.detailQueries.set(filename.replace('.sql', ''), content);
    });
  }

  processQuery(query, params) {
    const startDate = (params.startDate || '2025-01-01').replace(/'/g, "''");
    const endDate = (params.endDate || '2025-03-31').replace(/'/g, "''");
    const previousEndDate = params.previousEndDate ? `'${params.previousEndDate.replace(/'/g, "''")}'` : 'NULL';
    let single = query
      .replace(/SET\s+@StartDate\s*=\s*'[^']*';?\s*/gi, '')
      .replace(/SET\s+@EndDate\s*=\s*'[^']*';?\s*/gi, '')
      .replace(/SET\s+@PreviousEndDate\s*=\s*[^;]+;?\s*/gi, '');
    single = single.replace(/@StartDate/g, `'${startDate}'`).replace(/@EndDate/g, `'${endDate}'`).replace(/@PreviousEndDate/g, previousEndDate);
    return single.trim();
  }

  async runScript(siteCode, scriptId, params) {
    const query = this.queries.get(scriptId);
    if (!query) return { rows: [], error: `Script ${scriptId} not found` };
    const processed = this.processQuery(query, params);
    try {
      const rows = await siteDatabaseManager.executeSiteQuery(siteCode, processed);
      const list = Array.isArray(rows) ? rows : (rows && rows[0] ? [rows[0]] : []);
      return { rows: list, error: null };
    } catch (err) {
      return { rows: [], error: err.message };
    }
  }

  async runDetailScript(siteCode, scriptId, params) {
    const query = this.detailQueries.get(scriptId);
    if (!query) return { rows: [], error: `Detail script ${scriptId} not found` };
    const processed = this.processQuery(query, params);
    try {
      const rows = await siteDatabaseManager.executeSiteQuery(siteCode, processed);
      return { rows: Array.isArray(rows) ? rows : [], error: null };
    } catch (err) {
      return { rows: [], error: err.message };
    }
  }

  async getReportData(siteCode, params) {
    const fullParams = {
      startDate: params.startDate || '2025-01-01',
      endDate: params.endDate || '2025-03-31',
      previousEndDate: params.previousEndDate || '2024-12-31'
    };
    const sections = await Promise.all(
      SECTION_DEFS.map(async (def) => {
        try {
          let rows = [];
          if (def.subScriptId) {
            const [res1, res2] = await Promise.all([
              this.runScript(siteCode, def.scriptId, fullParams),
              this.runScript(siteCode, def.subScriptId, fullParams)
            ]);
            if (res1.error || res2.error) {
              return {
                sectionNumber: def.sectionNumber,
                sectionLabelEn: def.sectionLabelEn,
                sectionLabelKh: def.sectionLabelKh,
                detailScriptId: def.detailScriptId || null,
                detailScriptIds: def.detailScriptIds || null,
                rows: [{ labelEn: 'Error', labelKh: 'កំហុស', male: 0, female: 0, total: 0, error: res1.error || res2.error }]
              };
            }
            rows = def.normalizer(res1.rows, res2.rows);
          } else {
            const res = await this.runScript(siteCode, def.scriptId, fullParams);
            if (res.error) {
              return {
                sectionNumber: def.sectionNumber,
                sectionLabelEn: def.sectionLabelEn,
                sectionLabelKh: def.sectionLabelKh,
                detailScriptId: def.detailScriptId || null,
                detailScriptIds: def.detailScriptIds || null,
                rows: [{ labelEn: 'Error', labelKh: 'កំហុស', male: 0, female: 0, total: 0, error: res.error }]
              };
            }
            rows = def.normalizer(res.rows);
          }
          return {
            sectionNumber: def.sectionNumber,
            sectionLabelEn: def.sectionLabelEn,
            sectionLabelKh: def.sectionLabelKh,
            detailScriptId: def.detailScriptId || null,
            detailScriptIds: def.detailScriptIds || null,
            rows: Array.isArray(rows) ? rows : []
          };
        } catch (err) {
          return {
            sectionNumber: def.sectionNumber,
            sectionLabelEn: def.sectionLabelEn,
            sectionLabelKh: def.sectionLabelKh,
            detailScriptId: def.detailScriptId || null,
            detailScriptIds: def.detailScriptIds || null,
            rows: [{ labelEn: 'Error', labelKh: 'កំហុស', male: 0, female: 0, total: 0, error: err.message }]
          };
        }
      })
    );
    return { success: true, data: sections };
  }
}

module.exports = new InfantReportService();
