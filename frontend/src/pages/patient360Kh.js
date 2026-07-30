/** Khmer UI strings for Patient 360° page */
export const P360_KH = {
  pageTitle: 'ព័ត៌មានអ្នកជំងឺ ៣៦០°',
  pageDescription:
    '',

  list: {
    title: 'បញ្ជីអ្នកជំងឺ ៣៦០°',
    allPrograms: 'គ្រប់កម្មវិធី',
    filterProgram: 'កម្មវិធី់ ',
    refresh: 'ផ្ទុកឡើងវិញ',
    empty: 'មិនមានអ្នកជំងឺសម្រាប់មូលដ្ឋាននេះ។',
    showing: 'បង្ហាញ',
    of: 'នៃ',
    page: 'ទំព័រ',
    moreAvailable: 'មានទំព័របន្ទាប់',
    prev: 'មុន',
    next: 'បន្ទាប់',
    openDetail: 'មើលប្រវត្តិ',
    columnConfig: 'ជួរឈរ',
    columnConfigTitle: 'កំណត់ជួរឈរតារាង',
    columnConfigHint: 'ជ្រើសឈរដែលបង្ហាញ ហើយអូសដើម្បីប្តូរលំដាប់',
    columnConfigVisible: 'ជួរឈរដែលបង្ហាញ (អូសដើម្បីរៀបចំ)',
    columnConfigAll: 'គ្រប់ឈ្មោះទិន្នន័យ',
    columnConfigSearch: 'ស្វែងរកឈរ…',
    columnConfigReset: 'លំនាំដើម',
    columnConfigCancel: 'បោះបង់',
    columnConfigApply: 'អនុវត្ត',
    columnConfigClose: 'បិទ',
    filter: 'ចម្រោះ',
    filterTitle: 'ចម្រោះបញ្ជីអ្នកជំងឺ',
    filterHint: 'ជ្រើសលក្ខខណ្ឌ រួចអនុវត្តដើម្បីផ្ទុកបញ្ជីឡើងវិញ',
    filterReset: 'លុបចម្រោះ',
    filterCancel: 'បោះបង់',
    filterApply: 'អនុវត្ត',
    filterClose: 'បិទ',
    filterSexAll: 'គ្រប់ភេទ',
    filterSexMale: 'ប្រុស',
    filterSexFemale: 'ស្រី',
    filterProvincePlaceholder: 'ឈ្មោះខេត្ត (អង់គ្លេស)…',
    filterStatus: 'ស្ថានភាពអ្នកជំងឺ',
    filterStatusAll: 'គ្រប់ស្ថានភាព',
    filterStatusLost: 'បាត់ពីការតាមដាន',
    filterStatusDead: 'ស្លាប់',
    filterStatusTransfer: 'ផ្ទេរចេញ',
    statusLabels: {
      '0': 'បាត់ពីការតាមដាន',
      '1': 'ស្លាប់',
      '3': 'ផ្ទេរចេញ'
    }
  },

  /** Short column headers for list table (fits fixed column widths) */
  listHeaders: {
    clinicId: 'Clinic ID',
    program: 'កម្មវិធី',
    sex: 'ភេទ',
    province: 'ខេត្ត',
    country: 'សញ្ជាតិ',
    dob: 'ថ្ងៃកំណើត',
    art: 'លេខ ART',
    vcct: 'VCCT',
    vcctInsight: {
      badgeNotFound: 'រកមិនឃើញ',
      badgeUnmapped: 'គ្មានកូដ',
      badgeOtherSite: 'ផ្សេង',
      notFoundDetail: 'មិនមានក្នុង vccts ទាំងមូលដ្ឋាន',
      unmappedDetail: 'ពិនិត្យ tblsites.vcct_site_code ឬ Vcctcode លើ ART',
      otherSiteDetail: 'កំណត់ត្រា VCCT នៅ {site} · ART default {default}',
      noArtCodeHint: 'Vcctcode លើ ART ទទេ',
      multiSiteNote: 'លេខ VCCT ដូចគ្នាមាននៅ {sites} · ប្រើ {site}',
      tooltipId: 'លេខ VCCT',
      tooltipArtCode: 'Vcctcode (ART)',
      tooltipDefault: 'VCCT default (ART)',
      tooltipFound: 'រកឃើញក្នុង vccts',
      tooltipUsing: 'បើកនៅ'
    },
    daArt: 'ថ្ងៃ ART',
    firstVisit: 'មកដំបូង',
    status: 'ស្ថានភាព',
    statusDate: 'ថ្ងៃស្ថានភាព',
    latestVl: 'Viral Load ចុងក្រោយ',
    currentRegimen: 'រូបមន្តថ្នាំ (Regimen)',
    mmdStatus: 'ការផ្តល់ថ្នាំ MMD',
    nextAppointment: 'ការណាត់លើកក្រោយ',
    tptStatus: 'ថ្នាំបង្ការ TPT',
    sortAsc: 'តម្រៀបឡើង',
    sortDesc: 'តម្រៀបចុះ'
  },

  detail: {
    back: '',
    clinicId: 'Clinic ID'
  },

  facility: 'មូលដ្ឋានសុខាភិបាល',

  siteModal: {
    selectPlaceholder: 'ជ្រើសមូលដ្ឋាន…',
    titleFacility: 'ជ្រើសមូលដ្ឋានសុខាភិបាល',
    hintFacility: 'ជ្រើសមូលដ្ឋានមួយ ដើម្បីបង្ហាញបញ្ជីអ្នកជំងឺ។',
    filterPlaceholder: 'ស្វែងរកមូលដ្ឋាន…',
    cancel: 'បោះបង់',
    apply: 'ប្រើមូលដ្ឋាននេះ',
    draft: 'ជម្រើស៖ ',
    none: 'មិនមាន'
  },
  clinicId: 'លេខ Clinic ID',
  clinicIdPlaceholder: 'លេខ Clinic ID ឬជ្រើសពីការស្វែងរក',
  loadPatient: 'ផ្ទុកអ្នកជំងឺ',
  loading: 'កំពុងផ្ទុក…',
  loadingList: 'កំពុងផ្ទុកបញ្ជីអ្នកជំងឺ…',
  loadingProfile: 'កំពុងផ្ទុកប្រវត្តិអ្នកជំងឺ…',
  loadingSection: 'កំពុងផ្ទុកផ្នែកនេះ…',
  searchPlaceholder: 'លេខ Clinic ID ឬលេខ ART…',
  search: 'ស្វែងរក',
  open: 'បើក',

  summary: {
    clinicId: 'លេខ Clinic ID',
    type: 'ប្រភេទ',
    sex: 'ភេទ',
    province: 'ខេត្ត',
    country: 'សញ្ជាតិ',
    dob: 'ថ្ងៃខែឆ្នាំកំណើត',
    art: 'លេខ ART',
    firstVisit: 'មកដំបូង'
  },

  programs: {
    adult: 'មនុស្សពេញវ័យ ART',
    child: 'កុមារ ART',
    infant: 'ទារក / EID',
    pntt: 'PNTT',
    vcct: 'VCCT'
  },

  tabs: {
    overview: 'សង្ខេប',
    visits: 'ពិនិត្យ',
    labs: 'ពិសោធន៍',
    drugs: 'ថ្នាំ',
    history: 'ប្រវត្តិ',
    care: 'ថែទាំ',
    status: 'ស្ថានភាព',
    timeline: 'ពេលវេលា'
  },

  /** Short column titles on overview peek tables (avoid truncated dictionary labels) */
  /** Status tab — Cause column label depends on row status */
  statusCause: {
    default: 'មូលហេតុ',
    transfer: 'មណ្ឌលផ្ទេរ',
    death: 'មូលហេតុស្លាប់',
    mixed: 'មូលហេតុ / មណ្ឌលផ្ទេរ'
  },

  peekHeaders: {
    Da: 'កាលបរិច្ឆេទ',
    DaStatus: 'កាលបរិច្ឆេទ',
    Status: 'ស្ថានភាព',
    Cause: 'មូលហេតុ',
    Place: 'ទីកន្លែង',
    OPlace: 'ទីកន្លែងផ្សេងទៀត',
    ART: 'ART',
    DaArt: 'ថ្ងៃ ART',
    ARTnum: 'លេខ ART',
    DatVisit: 'ថ្ងៃមកពិនិត្យ',
    TypeVisit: 'ប្រភេទ',
    Weight: 'ទម្ងន់',
    Height: 'កម្ពស់',
    WHO: 'WHO',
    VLDetectable: 'VL',
    DaApp: 'ណាត់',
    DaVisit: 'ថ្ងៃ PNTT',
    SexHIV: 'ផញទុកHIV',
    Drug: 'ថ្នាំ',
    Agree: 'យល់ព្រម'
  },

  /** Short labels inside a tab (not duplicate tab names) */
  blocks: {
    reg: 'ចុះឈ្មោះ',
    art: 'ART',
    pntt: 'PNTT',
    vl: 'VL/CD4',
    eid: 'EID',
    arv: 'ARV',
    tpt: 'TPT',
    tb: 'របេង',
    oi: 'OI',
    allergy: 'អាឡែកហ្សី',
    arvHist: 'ARV ពីមុន',
    oiPast: 'OI ពីមុន',
    family: 'គ្រួសារ',
    demo: 'ទីលំនៅ',
    links: 'តភ្ជាប់',
    vcct: 'VCCT / HTS',
    appt: 'ណាត់',
    partners: 'ដៃគូ',
    children: 'កូន',
    status: 'ស្ថានភាព'
  },

  sections: {
    registration: 'ចុះឈ្មោះ (មកដំបូង)',
    artEnrollment: 'ចុះឈ្មោះ ART',
    pnttAssessment: 'វាយតម្លៃហានិភ័យ PNTT',
    clinicalVisits: 'កំណត់ត្រាមកពិនិត្យ',
    labVlCd4: 'VL / CD4 (tblpatienttest)',
    eidTests: 'តេស្ត EID (tbletest)',
    arvDrugs: 'ថ្នាំ ARV',
    tptDrugs: 'ថ្នាំ TPT',
    tbDrugs: 'ថ្នាំរបេង',
    oiDrugs: 'ថ្នាំ OI',
    allergies: 'អាឡែកហ្សីថ្នាំ',
    arvTreatHistory: 'ប្រវត្តិព្យាបាល ARV ពីមុន',
    oiPast: 'ព្យាបាល OI ពីមុន (កុមារ)',
    family: 'សមាជិកគ្រួសារ (កុមារ)',
    demographics: 'ធ្វើបច្ចុប្បន្នភាពព័ត៌មាន',
    programLinks: 'តភ្ជាប់កម្មវិធី (VCCT / កូដផ្សេង)',
    vcctSnapshot: 'VCCT / HTS (អានបានតែប៉ុណ្ណោះ)',
    appointments: 'ណាត់ជួប (ពីកំណត់ត្រាមកពិនិត្យ)',
    pnttPartners: 'ដៃគូ PNTT',
    pnttChildren: 'កូន PNTT',
    patientStatus: 'ស្ថានភាពអ្នកជំងឺ (បោះបង់ / ស្លាប់ / ផ្ទេរ)'
  },

  table: {
    clinicId: 'លេខ Clinic ID',
    program: 'កម្មវិធី',
    art: 'ART',
    firstVisit: 'មកដំបូង',
    sex: 'ភេទ',
    noRecords: 'មិនមានកំណត់ត្រា។',
    rows: 'ជួរ',
    max: 'អតិបរមា'
  },

  timeline: {
    empty: 'មិនមានព្រឹត្តិការសម្រាប់កម្មវិធីនេះ។',
    when: 'ពេលវេលា',
    what: 'ព្រឹត្តិការ',
    where: 'កន្លែង',
    vcctHint: 'ជួរពណ៌ខៀវ = VCCT / HTS'
  },

  vcct: {
    title: 'VCCT / HTS (អានបានតែប៉ុណ្ណោះ)',
    readOnly: 'អានបានតែប៉ុណ្ណោះ',
    registered: 'ចុះឈ្មោះ',
    hivResult: 'លទ្ធផល HIV',
    openFullForm: 'មើលទម្រង់ VCCT ពេញ',
    careHint: 'ទម្រង់ VCCT ពេញ · ចុច «មើលទម្រង់ VCCT ពេញ»',
    notLinked: 'មិនមានលេខ VCCT ភ្ជាប់នឹងកំណត់ត្រា ART នេះទេ។',
    infantNa: 'VCCT មិនប្រើសម្រាប់ទារក / EID ទេ (មានតែមនុស្សពេញវ័យ និងកុមារ)។',
    noDetail: 'មិនមានព័ត៌មាន VCCT បន្ថែម។',
    allFieldsHint:
      'ផ្នែកខាងលើ = VCCT ក្នុង ART (tblaimain/tblcimain, tblalink) · ខាងក្រោម = មូលដ្ឋាន VCCT (vccts*) — អានបានតែប៉ុណ្ណោះ។',
    artId: 'លេខ VCCT (ART)',
    site: 'កូដកន្លែង VCCT',
    defaultSite: 'VCCT default (ART)',
    mappingInsight: 'ការភ្ជាប់ VCCT',
    mappingOtherSite: 'VCCT នៅមូលដ្ឋានផ្សេង (មិនមែន ART default)',
    mappingNotFound: 'មិនរកឃើញក្នុង vccts',
    mappingMultiSite: 'VCCT ច្រើនមូលដ្ឋាន',
    source: 'ប្រភព'
  },

  footer:
    ' ',

  toast: {
    needFacilityAndId: 'ជ្រើសមូលដ្ឋាន និងបញ្ចូលលេខ Clinic ID',
    notFound: 'រកមិនឃើញអ្នកជំងឺ',
    searchMin: 'បញ្ចូលយ៉ាងហោច ២ តួអក្សរ',
    searchFailed: 'ស្វែងរកមិនបាន'
  }
};
