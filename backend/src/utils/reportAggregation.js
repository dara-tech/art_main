const DEFAULT_TTL_MS = Number(process.env.REPORT_CACHE_TTL_MS || 5 * 60 * 1000);

const cacheStore = new Map();

function getCache(key) {
  const hit = cacheStore.get(key);
  if (!hit) return null;
  if (hit.expiresAt <= Date.now()) {
    cacheStore.delete(key);
    return null;
  }
  return hit.value;
}

function setCache(key, value, ttlMs = DEFAULT_TTL_MS) {
  cacheStore.set(key, { value, expiresAt: Date.now() + ttlMs });
}

function buildCacheKey(reportType, input = {}) {
  const ordered = Object.keys(input)
    .sort()
    .map((k) => `${k}:${input[k] ?? ''}`)
    .join('|');
  return `${reportType}::${ordered}`;
}

function inferSiteLevel(siteCode, siteInfo) {
  const code = String(siteCode || '').trim();
  const digits = code.replace(/\D/g, '');
  const name = String(siteInfo?.name || '').toLowerCase();
  if (name.includes('cambodia')) return 'country';
  if (digits.length <= 2) return 'province';
  if (digits.length >= 4 && digits.endsWith('00')) return 'province';
  return 'facility';
}

function isFacilitySite(site) {
  const digits = String(site?.code || '').replace(/\D/g, '');
  const name = String(site?.name || '').toLowerCase();
  if (!digits || digits.length < 4) return false;
  if (digits.endsWith('00')) return false;
  if (name.includes('cambodia') || name.includes('province')) return false;
  return true;
}

/** Parent site code from a registry row (align with frontend ReportHomePage parent candidates). */
function parentSiteCodeFromRow(site) {
  const candidates = [
    site?.tblsite,
    site?.tblSite,
    site?.parent_tblsite,
    site?.parentTblsite,
    site?.parent_code,
    site?.parentCode,
    site?.parent_site_code
  ];
  for (const c of candidates) {
    const v = String(c ?? '').trim();
    if (v) return v;
  }
  return '';
}

/** Province-style codes: 2-digit province or *00 aggregate → facilities by art_site_code prefix. */
function facilityCodesByDigitPrefix(sites, rawCode) {
  const allSites = Array.isArray(sites) ? sites : [];
  const facilities = allSites.filter(isFacilitySite);
  const digits = String(rawCode || '').replace(/\D/g, '');
  if (!digits) return [];
  if (/^\d{2}$/.test(digits)) {
    return facilities.filter((s) => String(s.code).replace(/\D/g, '').startsWith(digits)).map((s) => String(s.code));
  }
  if (/^\d{4}$/.test(digits) && digits.endsWith('00')) {
    const prefix = digits.slice(0, 2);
    return facilities.filter((s) => String(s.code).replace(/\D/g, '').startsWith(prefix)).map((s) => String(s.code));
  }
  return [];
}

function resolveFacilityCodesByHierarchy(sites, selectedCode, siteLevel) {
  const allSites = Array.isArray(sites) ? sites : [];
  const codeStr = String(selectedCode || '').trim();
  const selected = allSites.find((s) => String(s.code) === codeStr);

  if (siteLevel === 'facility' || (siteLevel !== 'province' && siteLevel !== 'country' && selected && isFacilitySite(selected))) {
    return [codeStr];
  }

  const childrenByParent = new Map();
  allSites.forEach((site) => {
    const parent = parentSiteCodeFromRow(site);
    if (!parent) return;
    if (!childrenByParent.has(parent)) childrenByParent.set(parent, []);
    childrenByParent.get(parent).push(site);
  });

  const out = [];
  if (selected) {
    const queue = [String(selected.code)];
    const seen = new Set(queue);
    while (queue.length) {
      const current = queue.shift();
      const children = childrenByParent.get(current) || [];
      children.forEach((child) => {
        const childCode = String(child.code);
        if (!seen.has(childCode)) {
          seen.add(childCode);
          queue.push(childCode);
        }
        if (isFacilitySite(child)) out.push(childCode);
      });
    }
  }

  if (out.length) return [...new Set(out)];

  const prefixed = facilityCodesByDigitPrefix(allSites, codeStr);
  return [...new Set(prefixed)];
}

function sumNumericFields(target, source) {
  const out = { ...(target || {}) };
  Object.entries(source || {}).forEach(([key, raw]) => {
    const n = Number(raw);
    const hasNum = raw != null && raw !== '' && !Number.isNaN(n);
    if (hasNum) {
      const prev = Number(out[key] ?? 0);
      out[key] = (Number.isNaN(prev) ? 0 : prev) + n;
      return;
    }
    if (out[key] == null || out[key] === '') out[key] = raw;
  });
  return out;
}

function mergeIndicatorRows(listOfRows) {
  const byIndicator = new Map();
  listOfRows.flat().forEach((row) => {
    const key = String(row?.Indicator || '');
    if (!key) return;
    byIndicator.set(key, sumNumericFields(byIndicator.get(key), row));
  });
  return Array.from(byIndicator.values());
}

/** Dedupe key for merged patient-level rows (adult indicator details, reports). */
function detailRowDedupeKey(row) {
  const r = row || {};
  const id = r.ClinicID ?? r.clinicid ?? r.ClinicId ?? r.CLINICID;
  if (id != null && String(id).trim() !== '') return `id:${String(id).trim()}`;
  const art = r.art_number ?? r.Artnum ?? r.ART ?? r.artnum;
  if (art != null && String(art).trim() !== '') return `art:${String(art).trim()}`;
  return null;
}

function mergeSectionRows(listOfSections) {
  const sections = new Map();
  listOfSections.flat().forEach((section) => {
    const sectionKey = String(section?.scriptId || section?.sectionNumber || section?.sectionLabelEn || '');
    if (!sectionKey) return;
    const existing = sections.get(sectionKey);
    if (!existing) {
      sections.set(sectionKey, {
        ...section,
        rows: Array.isArray(section?.rows) ? section.rows.map((r) => ({ ...r })) : []
      });
      return;
    }
    existing.rows = (existing.rows || []).map((row, idx) =>
      sumNumericFields(row, (Array.isArray(section?.rows) ? section.rows[idx] : null) || {})
    );
  });
  return Array.from(sections.values());
}

module.exports = {
  buildCacheKey,
  getCache,
  setCache,
  inferSiteLevel,
  isFacilitySite,
  resolveFacilityCodesByHierarchy,
  mergeIndicatorRows,
  mergeSectionRows,
  detailRowDedupeKey
};
