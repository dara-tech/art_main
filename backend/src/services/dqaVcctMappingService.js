const { siteDatabaseManager } = require('../config/siteDatabase');
const vcctReadService = require('./vcctReadService');

const ISSUE_TYPES = {
  not_found: 'VCCT record not found',
  unmapped: 'VCCT site unmapped',
  other_site: 'VCCT at other site',
  multi_site: 'VCCT ID at multiple sites'
};

const DOCUMENTATION_SQL = `-- DQA 30: VCCT linked on ART but mapping issue (site / not found)
-- Programmatic check (aggregate vccts + tblsites), not executed as SQL on the facility DB.
-- Implementation: backend/src/services/dqaVcctMappingService.js
-- Uses vcctReadService.classifyVcctMapping (same logic as Patient 360 VCCT column).
--
-- For each adult/child registration with VcctID:
--   1. ART default VCCT site  → tblsites.vcct_site_code
--   2. Site hint on ART       → Vcctcode on tblaimain / tblcimain
--   3. Actual VCCT rows       → aggregate vccts (site_code + vcct_id)
--
-- issue_type values:
--   VCCT record not found
--   VCCT site unmapped
--   VCCT at other site
--   VCCT ID at multiple sites
`;

async function loadArtVcctLinks(siteCode) {
  const conn = await siteDatabaseManager.getSiteConnection(siteCode);
  const sql = `
    SELECT
      ClinicID AS clinicid,
      TRIM(VcctID) AS vcct_id,
      NULLIF(TRIM(Vcctcode), '') AS vcct_code,
      'Adult' AS patient_type
    FROM tblaimain
    WHERE TRIM(IFNULL(VcctID, '')) <> ''
      AND TRIM(VcctID) NOT IN ('0', '-1')

    UNION ALL

    SELECT
      ClinicID AS clinicid,
      TRIM(VcctID) AS vcct_id,
      NULLIF(TRIM(Vcctcode), '') AS vcct_code,
      'Child' AS patient_type
    FROM tblcimain
    WHERE TRIM(IFNULL(VcctID, '')) <> ''
      AND TRIM(VcctID) NOT IN ('0', '-1')

    ORDER BY patient_type, clinicid
  `;
  const raw = await conn.query(sql, { type: conn.QueryTypes.SELECT });
  const rows = Array.isArray(raw) && Array.isArray(raw[0]) ? raw[0] : raw;
  return (rows || []).map((r) => ({
    clinicid: String(r.clinicid ?? '').trim(),
    patient_type: r.patient_type === 'Child' ? 'Child' : 'Adult',
    program: r.patient_type === 'Child' ? 'child' : 'adult',
    vcctId: String(r.vcct_id ?? '').trim(),
    vcctCode: r.vcct_code ? String(r.vcct_code).trim() : null
  }));
}

function resolveIssueType(row) {
  const status = row.vcctMappingStatus;
  if (status === 'not_found') return ISSUE_TYPES.not_found;
  if (status === 'unmapped') return ISSUE_TYPES.unmapped;
  if (status === 'other_site') return ISSUE_TYPES.other_site;
  const sites = Array.isArray(row.actualVcctSites) ? row.actualVcctSites : [];
  if (sites.length > 1) return ISSUE_TYPES.multi_site;
  return null;
}

function toDqaRow(row) {
  const issue_type = resolveIssueType(row);
  if (!issue_type) return null;
  return {
    clinicid: row.clinicid,
    patient_type: row.patient_type,
    vcct_id: row.vcctId,
    vcct_code: row.vcctCode || '',
    art_default_vcct_site: row.defaultVcctSite || '',
    resolved_vcct_site: row.vcctSiteCode || '',
    found_vcct_sites: (row.actualVcctSites || []).join(', '),
    mapping_status: row.vcctMappingStatus || '',
    issue_type
  };
}

/** Run VCCT mapping DQA for one ART facility. Returns rows shaped like SQL DQA scripts. */
async function runForSite(siteCode) {
  const artRows = await loadArtVcctLinks(siteCode);
  if (!artRows.length) return [];
  const enriched = await vcctReadService.enrichListVcctInsights(siteCode, artRows);
  return enriched
    .map((row) => toDqaRow({ ...row, clinicid: row.clinicid, patient_type: row.patient_type }))
    .filter(Boolean);
}

module.exports = {
  runForSite,
  DOCUMENTATION_SQL,
  ISSUE_TYPES
};
