/** Khmer UI — វិភាងទិន្នន័យ (simple steps) */
export const INSIGHT_KH = {
  pageTitle: 'វិភាងទិន្នន័យ',
  navLabel: 'វិភាង',
  step1: '១. ចង់យកទិន្នន័យអ្វី?',
  step2: '២. មូលដ្ឋាន និង រយៈពេល',
  step3: '៣. បែងចែកតាម (ជម្រើស)',
  step3Hint: 'ធីកដើម្បីប្រៀបធៀប — ទុកទទេ = ចំនួនសរុបតែមួយ',
  topicPlaceholder: 'ជ្រើសរើស…',
  facility: 'មូលដ្ឋាន',
  period: 'រយៈពេល',
  population: 'អ្នកជំងឺ',
  popBoth: 'មនុស្សពេញវ័យ + កុមារ',
  popAdult: 'មនុស្សពេញវ័យ',
  popChild: 'កុមារ',
  outcomePick: 'ប្រភេទ',
  dimSex: 'ភេទ',
  dimAge: 'អាយុ (≤១៤ / ១៥+)',
  dimProgram: 'មនុស្សពេញវ័យ ឬ កុមារ',
  dimReferred: 'បញ្ជូនមកពី',
  dimEducation: 'កម្រិតអប់រំ',
  dimVisitType: 'ប្រភេទពិនិត្យ',
  dimOutcome: 'ប្រភេទលទ្ធផល',
  run: 'គណនា',
  running: 'កំពុងគណនា…',
  cancelRun: 'បោះបង់',
  total: 'សរុប',
  groupLabel: 'ក្រុម',
  count: 'ចំនួន',
  resultTitle: 'លទ្ធផល',
  viewTable: 'តារាង',
  viewChart: 'គំនូស',
  empty: 'ជ្រើស ៣ ជំហានខាងលើ រួចចុច «គណនា»',
  advancedTables: 'កម្រិតខ្ពស់ — មើលឈ្មោះតារាងបច្ចេកទេស',
  advancedHint: 'សម្រាប់អ្នកជំនាញ — តារាង ● អាចគណនាបាន',
  toastFailed: 'គណនាមិនបាន',
  toastTimeout: 'យឺតពេក — ជ្រើសរយៈពេលខ្លីជាង ឬផ្សេងទៀត',
  loadingCatalog: 'កំពុងផ្ទុក…',
  viewOnlyNote: 'តារាងនេះមិនទាន់គណនាបាន — ជ្រើស ● ក្នុងបញ្ជី',
  searchTables: 'ស្វែងរកតារាង…',
  canRun: 'គណនាបាន',
  viewOnly: 'មើលឈ្មោះប៉ុណ្ណោះ',
  fieldsLabel: 'ជួរ',
  noTables: 'រកមិនឃើញ'
};

/** Simple Khmer labels for analysis topics (no English DB names in main UI) */
export const INSIGHT_TOPICS = [
  { id: 'enrollment', label: 'អ្នកជំងឺចុះឈ្មោះថ្មី' },
  { id: 'art', label: 'ចាប់ផ្តើមថ្នាំ ARV' },
  { id: 'visit', label: 'មកពិនិត្យព្យាបាល' },
  { id: 'lab', label: 'តេស្ត Viral Load' },
  { id: 'outcome', label: 'លទ្ធផល (ស្លាប់ / បោះបង់ / ផ្ទេរចេញ)' }
];

export const OUTCOME_OPTIONS_KH = [
  { id: 'all', label: 'ទាំងអស់' },
  { id: 'dead', label: 'ស្លាប់' },
  { id: 'ltfu', label: 'បោះបង់' },
  { id: 'transfer_out', label: 'ផ្ទេរចេញ' }
];
