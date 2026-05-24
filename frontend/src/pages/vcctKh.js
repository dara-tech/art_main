/** Khmer UI strings — VCCT / HTS module */
export const VCCT_KH = {
  pageTitle: 'VCCT / HTS',
  pageDescription: 'ស្វែងរក និងមើលកំណត់ត្រា VCCT (អានបានតែប៉ុណ្ណោះ)',

  tabs: {
    records: 'ទម្រង់ VCCT'
  },

  readOnlyBadge: 'អានបានតែប៉ុណ្ណោះ — មិនកែប្រែមូលដ្ឋានទិន្នន័យ',

  form: {
    heroTitle: 'កំណត់ត្រា VCCT',
    jumpTo: 'ទំព័រ',
    expandAll: 'បើកទាំងអស់',
    collapseAll: 'បិទទាំងអស់',
    yes: 'បាទ',
    no: 'ទេ',
    blank: '— ទទេ —',
    fields: 'ចម្លើយ',
    riskQuestion: 'សំណួរ',
    registered: 'ចុះឈ្មោះ',
    selectedCount: (n) => `បានជ្រើស ${n}`
  },

  list: {
    title: 'បញ្ជីអតិថិជន VCCT',
    searchPlaceholder: 'លេខ VCCT, PMRS, HTS, UUIC…',
    search: 'ស្វែងរក',
    clear: 'លុប',
    refresh: 'ផ្ទុកឡើងវិញ',
    empty: 'មិនមានកំណត់ត្រា VCCT។',
    noVcctSite: 'មិនមានកូដ VCCT សម្រាប់មូលដ្ឋាន ART នេះ (tblsites.vcct_site_code)។',
    vcctSite: 'កូដ VCCT',
    page: 'ទំព័រ',
    of: 'នៃ',
    total: 'សរុប',
    prev: 'មុន',
    next: 'បន្ទាប់',
    openDetail: 'មើលព័ត៌មានលម្អិត',
    openFullForm: 'មើលទម្រង់ VCCT ពេញ'
  },

  detail: {
    back: '← ត្រឡប់ទៅបញ្ជី',
    openArt: 'បើក ៣៦០° ART',
    loading: 'កំពុងផ្ទុក VCCT…',
    artLinks: 'កំណត់ត្រា ART ដែលភ្ជាប់'
  },

  columns: {
    vcctId: 'លេខ VCCT',
    registrationDate: 'ថ្ងៃចុះឈ្មោះ',
    sex: 'ភេទ',
    dob: 'ថ្ងៃកំណើត',
    hivResult: 'លទ្ធផល HIV',
    pmrs: 'PMRS',
    hts: 'HTS',
    uuic: 'UUIC',
    clinicId: 'Clinic ID',
    program: 'កម្មវិធី',
    art: 'ART#'
  },

  toast: {
    loadFailed: 'ផ្ទុក VCCT មិនបាន',
    needSite: 'ជ្រើសមូលដ្ឋាន ART ជាមុន'
  }
};
