/** Khmer UI strings for DQA page */
export const DQA_KH = {
  run: 'ដំណើរការ',
  running: 'កំពុងដំណើរការ…',
  facility: 'មូលដ្ឋានសុខាភិបាល',
  sql: 'SQL',
  rows: 'ជួរទិន្នន័យ',
  search: 'ស្វែងរក',
  viewSql: 'មើល SQL',
  previous: 'មុន',
  next: 'បន្ទាប់',
  close: 'បិទ',

  pageTitle: 'ការវាយតម្លៃគុណភាពទិន្នន័យ (DQA)',
  pageTitleShort: 'DQA',
  pageDescription: 'ដំណើរការកូដ SQL ពិនិត្យពី backend/queries/DQA សម្រាប់មូលដ្ឋានសុខាភិបាលនីមួយៗ។',
  emptyHint: 'ជ្រើសរើសមូលដ្ឋាន រួចចុច «ដំណើរការ» ដើម្បីពិនិត្យគុណភាពទិន្នន័យ។',
  filterPlaceholder: 'ស្វែងរកតាមលេខ ឬចំណងជើង…', // standardizing placeholder naming style
  filterChecksPlaceholder: 'ស្វែងរកតាមលេខ ឬចំណងជើង…',
  summaryScripts: 'ចំនួនស្គ្រីប',
  summaryIssueRows: 'ជួរដែលមានបញ្ហា',
  loadingScripts: 'កំពុងផ្ទុក…',
  rowInsightHint: 'ជួរដែលមានបញ្ហា និងជួរពាក់ព័ន្ធត្រូវបានគូសពណ៌សម្រាប់ការពិនិត្យរហ័ស។',
  issueColumnHint: 'បញ្ហា',

  table: {
    number: 'ល.រ',
    check: 'ការពិនិត្យទិន្នន័យ',
    issues: 'បញ្ហា',
    actions: 'សកម្មភាព',
    ms: 'ms'
  },

  siteModal: {
    selectPlaceholder: 'ជ្រើសរើសមូលដ្ឋានសុខាភិបាល',
    titleFacility: 'ជ្រើសរើសមូលដ្ឋានសុខាភិបាល',
    hintFacility: 'ជ្រើសរើសមូលដ្ឋានសុខាភិបាលមួយ ដើម្បីដំណើរការពិនិត្យគុណភាពទិន្នន័យ។',
    filterPlaceholder: 'ស្វែងរកមូលដ្ឋានសុខាភិបាល…',
    cancel: 'បោះបង់',
    apply: 'អនុវត្ត'
  },

  /** English check title (from SQL header) → Khmer */
  checkTitles: {
    'Duplicate TPT start (patient started TPT more than once on visit records)':
      'ចាប់ផ្តើម TPT ស្ទួន (អ្នកជំងឺចាប់ផ្តើម TPT ច្រើនដងក្នុងកំណត់ត្រាមកពិនិត្យ)',
    'Invalid viral load result (bad characters or format)': 
      'លទ្ធផល Viral Load (VL) មិនត្រឹមត្រូវ (ខុសទម្រង់ ឬមានតួអក្សរខុសប្រក្រតី)',
    'Duplicate exit/outcome (more than one status record)': 
      'ទិន្នន័យបញ្ឈប់ការព្យាបាល/លទ្ធផលស្ទួន (មានកំណត់ត្រាស្ថានភាពច្រើនជាងមួយ)',
    'Adult registered at age 14 or younger': 
      'ចុះឈ្មោះជាមនុស្សពេញវ័យ (Adult) ប៉ុន្តែអាយុ ≤ ១៤ ឆ្នាំ',
    'ART number exists but patient registration missing': 
      'មានលេខ ART ប៉ុន្តែមិនមានទម្រង់ចុះឈ្មោះអ្នកជំងឺ',
    'On ART but no clinic visit recorded': 
      'កំពុងទទួល ART ប៉ុន្តែមិនមានកំណត់ត្រាមកទទួលសេវា',
    'Transfer-in patient missing ART start date or ART number':
      'អ្នកជំងឺផ្ទេរចូល (TI) ខ្វះថ្ងៃចាប់ផ្តើម ART ឬខ្វះលេខ ART',
    'Visit date and next appointment invalid or over 6 months apart':
      'កាលបរិច្ឆេទពិនិត្យ និងថ្ងៃណាត់ជួបបន្ទាប់មិនត្រឹមត្រូវ ឬខុសគ្នាលើសពី ៦ ខែ',
    'HIV positive date not entered (shows 01-Jan-1900)': 
      'មិនបានបញ្ចូលកាលបរិច្ឆេទរកឃើញ HIV វិជ្ជមាន (បង្ហាញ 01-Jan-1900)',
    'Clinic visit exists but registration form missing': 
      'មានទិន្នន័យមកទទួលសេវា ប៉ុន្តែមិនមានទម្រង់ចុះឈ្មោះ',
    'Patient sex not recorded': 
      'មិនបានកត់ត្រាភេទរបស់អ្នកជំងឺ',
    'Registered patient with no clinic visit': 
      'បានចុះឈ្មោះអ្នកជំងឺ ប៉ុន្តែមិនទាន់មានកំណត់ត្រាមកទទួលសេវា',
    'Exit or death date before year 2000': 
      'កាលបរិច្ឆេទបញ្ឈប់ការព្យាបាល ឬមរណភាពមុនឆ្នាំ ២០០០',
    'Transfer in/out status not selected (OffIn blank)': 
      'មិនបានជ្រើសរើសស្ថានភាពផ្ទេរចូល/ផ្ទេរចេញ (OffIn ទំនេរ)',
    'Active patient not started on ART': 
      'អ្នកជំងឺសកម្ម (Active) ប៉ុន្តែមិនទាន់បានចាប់ផ្តើម ART',
    'Exit/outcome recorded but patient registration missing': 
      'មានកំណត់ត្រាបញ្ឈប់ការព្យាបាល/លទ្ធផល ប៉ុន្តែមិនមានទម្រង់ចុះឈ្មោះអ្នកជំងឺ',
    'Invalid ART number format or length': 
      'ទម្រង់ ឬប្រវែងលេខ ART មិនត្រឹមត្រូវ',
    'ART start date missing or before year 2000': 
      'ខ្វះកាលបរិច្ឆេទចាប់ផ្តើម ART ឬកាលបរិច្ឆេទមុនឆ្នាំ ២០០០',
    'Invalid TPT or INH start/stop dates':
      'កាលបរិច្ឆេទចាប់ផ្តើម/បញ្ឈប់ TPT ឬ INH មិនត្រឹមត្រូវ',
    'On ART 6+ months but no VL test in the last 12 months':
      'កំពុងទទួល ART ≥ ៦ ខែ ប៉ុន្តែគ្មានលទ្ធផលតេស្ត VL ក្នុង ១២ ខែចុងក្រោយ',
    'Latest visit appointment gap over 80 days (active on ART)':
      'ការពិនិត្យចុងក្រោយ មានចន្លោះណាត់ជួបលើស ៨០ ថ្ងៃ (សម្រាប់អ្នកកំពុងទទួល ART)',
    'Same ART number used by more than one patient':
      'លេខ ART ដូចគ្នាត្រូវបានប្រើប្រាស់ដោយអ្នកជំងឺច្រើនជាងម្នាក់',
    'Same ART on multiple clinic IDs (not explained by lost-and-return)':
      'លេខ ART ដូចគ្នាលើ Clinic ID ច្រើន (មិនមែន Lost & Return)',
    'Child registered but ART record only on adult table':
      'ចុះឈ្មោះជាកុមារ ប៉ុន្តែទិន្នន័យ ART មានតែនៅក្នុងតារាងមនុស្សពេញវ័យ (Adult Table)',
    'Patient has exit/outcome but latest appointment is in the future':
      'មានកំណត់ត្រាចាកចេញ/លទ្ធផល ប៉ុន្តែថ្ងៃណាត់ជួបចុងក្រោយស្ថិតនៅពេលអនាគត',
    'TPT 6H started over 12 months ago without stop':
      'វគ្គព្យាបាល TPT 6H ចាប់ផ្តើមលើសពី ១២ ខែមកហើយ ដោយមិនទាន់មានកាលបរិច្ឆេទបញ្ឈប់',
    'Form A TPT recorded but no visit TPT drug row': 
      'មានទិន្នន័យ TPT ក្នុងទម្រង់ Form A ប៉ុន្តែគ្មានកំណត់ត្រាផ្តល់ថ្នាំ TPT ពេលមកពិនិត្យ',
    'Date of birth after first visit date': 
      'ថ្ងៃខែឆ្នាំកំណើត ក្រោយកាលបរិច្ឆេទមកពិនិត្យដំបូង',
    'VL test row exists but HIV load result is blank': 
      'មានជួរទិន្នន័យតេស្ត VL ប៉ុន្តែលទ្ធផលផ្ទុកមេរោគ (HIV Load) នៅទទេ',
    'Marked transfer-out (OffIn) but no exit/outcome record':
      'បានចំណាំថាផ្ទេរចេញ (OffIn) ប៉ុន្តែមិនមានកំណត់ត្រាបញ្ឈប់ការព្យាបាល/លទ្ធផល',
    'VCCT linked on ART but mapping issue (site / not found)':
      'VCCT ភ្ជាប់លើ ART ប៉ុន្តែភ្ជាប់មូលដ្ឋាន VCCT មិនត្រឹមត្រូវ / រកមិនឃើញ'
  },

  /** SQL column key → Khmer header */
  columnLabels: {
    issue_type: 'ប្រភេទបញ្ហា',
    clinicid: 'កូដគ្លីនិក',
    ClinicID: 'កូដគ្លីនិក',
    patient_type: 'ប្រភេទអ្នកជំងឺ',
    Sex: 'ភេទ',
    sex: 'ភេទ',
    Age: 'អាយុ',
    age: 'អាយុ',
    ART: 'លេខ ART',
    DaArt: 'ថ្ងៃចាប់ផ្តើម ART',
    DafirstVisit: 'ថ្ងៃមកពិនិត្យដំបូង',
    DaBirth: 'ថ្ងៃខែឆ្នាំកំណើត',
    DatVisit: 'ថ្ងៃមកពិនិត្យចុងក្រោយ',
    DaApp: 'ថ្ងៃណាត់ជួប',
    OffIn: 'ស្ថានភាពផ្ទេរចូល/ចេញ',
    Tptdrugname: 'ឈ្មោះថ្នាំ TPT',
    tpt_source: 'ប្រភពទិន្នន័យ TPT',
    Date_Start_TPT: 'ថ្ងៃចាប់ផ្តើម TPT',
    Date_Stop_TPT: 'ថ្ងៃបញ្ឈប់ TPT',
    Num_Month: 'រយៈពេល TPT (ខែ)',
    exit_date: 'ថ្ងៃចាកចេញ',
    exit_status: 'ស្ថានភាពចាកចេញ',
    exit_date_1: 'ថ្ងៃចាកចេញទី១',
    exit_date_2: 'ថ្ងៃចាកចេញទី២',
    status_1: 'ស្ថានភាពទី១',
    status_2: 'ស្ថានភាពទី២',
    Da1: 'កាលបរិច្ឆេទទី១',
    Da2: 'កាលបរិច្ឆេទទី២',
    Da3: 'កាលបរិច្ឆេទទី៣',
    Da4: 'កាលបរិច្ឆេទទី៤',
    DrugName: 'ឈ្មោះថ្នាំ',
    Status: 'ស្ថានភាព',
    status: 'ស្ថានភាព',
    da: 'កាលបរិច្ឆេទ',
    TestID: 'លេខកូដតេស្ត',
    Dat: 'កាលបរិច្ឆេទតេស្ត',
    DaCollect: 'ថ្ងៃប្រមូលសំណាក',
    CD4: 'CD4',
    CD: 'CD',
    CD8: 'CD8',
    HIVLoad: 'លទ្ធផល VL',
    HIVLog: 'VL Log',
    HCV: 'HCV',
    HCVlog: 'HCV Log',
    hiv_positive_date: 'ថ្ងៃវិជ្ជមាន HIV',
    age_at_first_visit: 'អាយុពេលមកពិនិត្យដំបូង',
    LClinicID: 'Clinic ID ចាស់ (Lost & Return)',
    TypeofReturn: 'ប្រភេទត្រឡប់មកវិញ',
    last_vl_date: 'ថ្ងៃតេស្ត VL ចុងក្រោយ',
    appt_gap: 'ចន្លោះណាត់ជួប (ថ្ងៃ)',
    TPTdrug: 'កូដថ្នាំ TPT',
    vcct_id: 'លេខ VCCT',
    vcct_code: 'Vcctcode (ART)',
    art_default_vcct_site: 'VCCT default (ART)',
    resolved_vcct_site: 'VCCT site (resolved)',
    found_vcct_sites: 'រកឃើញក្នុង vccts',
    mapping_status: 'ស្ថានភាពភ្ជាប់'
  },

  /** English issue_type from SQL → Khmer */
  issueTypes: {
    'Duplicate TPT start': 'ចាប់ផ្តើម TPT ស្ទួន',
    'Stop without start': 'មានថ្ងៃបញ្ឈប់ ដោយគ្មានថ្ងៃចាប់ផ្តើម',
    'Stop before start': 'ថ្ងៃបញ្ឈប់ មុនថ្ងៃចាប់ផ្តើម',
    'Invalid start date': 'ថ្ងៃចាប់ផ្តើមមិនត្រឹមត្រូវ',
    'Invalid stop date': 'ថ្ងៃបញ្ឈប់មិនត្រឹមត្រូវ',
    'Review start/stop': 'សូមពិនិត្យថ្ងៃចាប់ផ្តើម/បញ្ឈប់ឡើងវិញ',
    'OffIn not set': 'មិនទាន់កំណត់ OffIn',
    'ART start before 2000': 'ថ្ងៃចាប់ផ្តើម ART មុនឆ្នាំ ២០០០',
    'No ART record': 'គ្មានកំណត់ត្រា ART',
    'Exit without initial form': 'មានទិន្នន័យចាកចេញ ដោយគ្មានទម្រង់ចុះឈ្មោះដំបូង',
    'No visit on record': 'មិនមានកំណត់ត្រាមកទទួលសេវាក្នុងប្រព័ន្ធ',
    'Missing sex': 'មិនមានកត់ត្រាភេទ',
    'Visit without initial form': 'មានទិន្នន័យមកទទួលសេវា ប៉ុន្តែគ្មានទម្រង់ចុះឈ្មោះដំបូង',
    'Invalid HIV positive date': 'ថ្ងៃវិជ្ជមាន HIV មិនត្រឹមត្រូវ',
    'TI missing ART date or number': 'ផ្ទេរចូល (TI) ខ្វះថ្ងៃចាប់ផ្តើម ឬលេខ ART',
    'ART without initial form': 'មានទិន្នន័យ ART ប៉ុន្តែគ្មានទម្រង់ចុះឈ្មោះដំបូង',
    'Exit date before 2000': 'ថ្ងៃចាកចេញមុនឆ្នាំ ២០០០',
    'Adult age <= 14': 'ចុះឈ្មោះជាមនុស្សពេញវ័យ ប៉ុន្តែអាយុ ≤ ១៤ ឆ្នាំ',
    'Multiple exit records': 'មានកំណត់ត្រាចាកចេញច្រើនប្រឡាយ/ស្ទួន',
    'Contains comma': 'មានសញ្ញាក្បៀស (,)',
    'Contains decimal point': 'មានចំណុចទសភាគ (.)',
    'Contains space': 'មានដកឃ្លា (Space)',
    'Contains @': 'មានសញ្ញា @',
    'Contains <': 'មានសញ្ញា <',
    'Invalid format': 'ទម្រង់មិនត្រឹមត្រូវ',
    'Wrong appointment date': 'ថ្ងៃណាត់ជួបមិនត្រឹមត្រូវ',
    'More than six months': 'លើសពី ៦ ខែ',
    'Wrong ART (P prefix)': 'លេខ ART ខុសទម្រង់ (មានបុព្វបទ P)',
    'Wrong ART (non-P)': 'លេខ ART ខុសទម្រង់ (គ្មានបុព្វបទ P)',
    'No VL on record': 'មិនទាន់មានកំណត់ត្រា VL ក្នុងប្រព័ន្ធ',
    'No VL in 12 months': 'គ្មានលទ្ធផល VL ក្នុងរយៈពេល ១២ ខែចុងក្រោយ',
    'Visit interval over 80 days': 'ចន្លោះពេលមកទទួលសេវាលើសពី ៨០ ថ្ងៃ',
    'Duplicate ART number': 'លេខ ART ស្ទួនគ្នា',
    'Duplicate ART not lost-return': 'លេខ ART ស្ទួន (មិនមែន Lost & Return)',
    'Child ART on adult table only': 'ទិន្នន័យ ART កុមារ ស្ថិតក្នុងតារាងមនុស្សពេញវ័យតែប៉ុណ្ណោះ',
    'Exit with future appointment': 'មានទិន្នន័យចាកចេញ ប៉ុន្តែថ្ងៃណាត់ជួបស្ថិតនៅពេលអនាគត',
    '6H TPT over 12 months without stop': 'វគ្គព្យាបាល TPT 6H លើសពី ១២ ខែ ដោយគ្មានថ្ងៃបញ្ឈប់',
    'Form A TPT without visit TPT': 'មាន TPT ក្នុងទម្រង់ Form A ប៉ុន្តែគ្មានក្នុងកំណត់ត្រាមកទទួលសេវា',
    'Birth date after first visit': 'ថ្ងៃខែឆ្នាំកំណើត ក្រោយថ្ងៃមកទទួលសេវាដំបូង',
    'VL result blank': 'លទ្ធផល VL ទទេ',
    'Transfer out without exit record': 'មានស្ថានភាពផ្ទេរចេញ តែគ្មានកំណត់ត្រាបញ្ឈប់ការព្យាបាល',
    'VCCT record not found': 'មិនរកឃើញកំណត់ត្រា VCCT',
    'VCCT site unmapped': 'គ្មានកូដ VCCT site',
    'VCCT at other site': 'VCCT នៅមូលដ្ឋានផ្សេង',
    'VCCT ID at multiple sites': 'លេខ VCCT ដូចគ្នាច្រើនមូលដ្ឋាន'
  },

  values: {
    Adult: 'មនុស្សពេញវ័យ',
    Child: 'កុមារ'
  }
};

export function toDqaTitleKh(title) {
  const key = String(title ?? '').trim();
  return DQA_KH.checkTitles[key] ?? title;
}

export function toDqaColumnLabelKh(key) {
  return DQA_KH.columnLabels[key] ?? String(key).replace(/_/g, ' ');
}

export function toDqaIssueKh(issue) {
  const key = String(issue ?? '').trim();
  if (!key) return issue;
  return DQA_KH.issueTypes[key] ?? issue;
}

export function toDqaValueKh(value, columnKey) {
  const text = String(value ?? '').trim();
  if (!text) return value;
  if (columnKey === 'patient_type' && DQA_KH.values[text]) return DQA_KH.values[text];
  if (columnKey === 'issue_type') return toDqaIssueKh(text);
  return value;
}