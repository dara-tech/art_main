import { isProvinceCompareCode } from './siteSelection';

/** Map visualize / report indicator → Patient 360 section tab. */
export function indicatorToP360Section(indicatorId) {
  const key = String(indicatorId || '')
    .replace(/^infant:/, '')
    .replace(/^pntt:/, '')
    .toLowerCase();

  if (/^10\.(6|7|8|9|1[0-4])|vl_|eac|eligible_vl|vl_followup/.test(key)) return 'labs';
  if (/tpt|10\.4|10\.5/.test(key)) return 'drugs';
  if (/tld|mmd|10\.(1|2|3)|_drug|arv/.test(key)) return 'drugs';
  if (/08\.|dead|ltfu|lost_to_followup|transfer_out|transfer_in|07_lost/.test(key)) return 'status';
  if (/06_transfer|07_lost|lost_and_return/.test(key)) return 'status';
  if (/visit|appointment|mmd/.test(key)) return 'visits';
  if (/care|pntt|partner/.test(key)) return 'care';
  if (String(indicatorId || '').startsWith('infant:')) return 'care';
  if (String(indicatorId || '').startsWith('pntt:')) return 'care';
  return 'overview';
}

export function patientProgramFromDetailRow(row = {}) {
  const tp = String(row.typepatients || row.patient_type || '').trim();
  if (tp === '≤14' || tp.includes('≤14') || /^child$/i.test(tp)) return 'child';
  if (String(row.program || '').toLowerCase() === 'infant') return 'infant';
  if (String(row.program || '').toLowerCase() === 'child') return 'child';
  return 'adult';
}

export function resolveClinicIdFromRow(row = {}) {
  const id = row.clinicid ?? row.ClinicID ?? row.clinicId ?? row.ClinicId;
  if (id == null || id === '') return null;
  return String(id).trim();
}

export function resolveP360SiteCode(row = {}, detail = {}, pageContext = {}) {
  const fromRow = row.site_code ?? row.siteCode;
  if (fromRow) return String(fromRow).trim();
  const fromDetail = detail?.raw?.facilityCode;
  if (fromDetail && !isProvinceCompareCode(fromDetail) && fromDetail !== '__CAMBODIA__' && fromDetail !== 'all') {
    return String(fromDetail).trim();
  }
  if (pageContext.scopeMode === 'compare' && pageContext.compareSiteCodes?.length) {
    const code = String(pageContext.compareSiteCodes[0]).trim();
    if (!isProvinceCompareCode(code) && code !== '__CAMBODIA__' && code !== 'all') return code;
  }
  const pageCode = pageContext.siteCode ? String(pageContext.siteCode).trim() : '';
  if (pageCode && !isProvinceCompareCode(pageCode) && pageCode !== '__CAMBODIA__' && pageCode !== 'all') {
    return pageCode;
  }
  return '';
}

/** Build path + metadata for opening Patient 360 from visualize detail. */
export function buildPatient360Target(row = {}, { detail, pageContext, indicatorId, section: sectionOverride } = {}) {
  const clinicId = resolveClinicIdFromRow(row);
  if (!clinicId) return null;
  const siteCode = resolveP360SiteCode(row, detail, pageContext);
  const program = patientProgramFromDetailRow(row);
  const section = sectionOverride || indicatorToP360Section(indicatorId);
  return {
    clinicId,
    siteCode,
    program,
    section,
    path: buildPatient360Path({ siteCode, clinicId, program, section, indicatorId })
  };
}

export function buildPatient360Path({
  siteCode,
  clinicId,
  program = 'adult',
  section,
  indicatorId
}) {
  const cid = String(clinicId || '').trim();
  if (!cid) return '/patient-360';
  const params = new URLSearchParams();
  if (siteCode) params.set('site', String(siteCode).trim());
  params.set('clinicId', cid);
  if (program) params.set('program', program);
  const tab = section || indicatorToP360Section(indicatorId);
  if (tab && tab !== 'overview') params.set('tab', tab);
  return `/patient-360?${params.toString()}`;
}

/** Router state to restore visualize after returning from Patient 360. */
export const P360_FROM_VISUALIZE_STATE = {
  returnTo: '/visualize',
  restoreVisualize: true
};

export function parsePatient360SearchParams(searchParams) {
  if (!searchParams) return null;
  const clinicId = String(searchParams.get('clinicId') || '').trim();
  if (!clinicId) return null;
  return {
    site: String(searchParams.get('site') || '').trim() || null,
    clinicId,
    program: String(searchParams.get('program') || 'adult').trim() || 'adult',
    tab: String(searchParams.get('tab') || 'overview').trim() || 'overview'
  };
}
