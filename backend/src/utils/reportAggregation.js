const DEFAULT_TTL_MS = Number(process.env.REPORT_CACHE_TTL_MS || 5 * 60 * 1000);
const MAX_CACHE_ENTRIES = Number(process.env.REPORT_CACHE_MAX_ENTRIES || 32);

const cacheStore = new Map();

function pruneExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of cacheStore) {
    if (entry.expiresAt <= now) cacheStore.delete(key);
  }
}

function evictOldestCacheEntry() {
  let oldestKey = null;
  let oldestAt = Infinity;
  for (const [key, entry] of cacheStore) {
    if (entry.expiresAt < oldestAt) {
      oldestAt = entry.expiresAt;
      oldestKey = key;
    }
  }
  if (oldestKey != null) cacheStore.delete(oldestKey);
}

function getCache(key) {
  pruneExpiredCache();
  const hit = cacheStore.get(key);
  if (!hit) return null;
  if (hit.expiresAt <= Date.now()) {
    cacheStore.delete(key);
    return null;
  }
  return hit.value;
}

function setCache(key, value, ttlMs = DEFAULT_TTL_MS) {
  if (ttlMs <= 0) return;
  pruneExpiredCache();
  while (cacheStore.size >= MAX_CACHE_ENTRIES) {
    evictOldestCacheEntry();
    if (!cacheStore.size) break;
  }
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
  if (code.startsWith('province:')) return 'province';
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

function provinceIdFromSite(site) {
  const raw = site?.province_id ?? site?.provinceId ?? site?.provinceid;
  const value = String(raw ?? '').trim();
  return value || '';
}

function provinceIdFromCode(rawCode) {
  const value = String(rawCode || '').trim();
  if (!value.startsWith('province:')) return '';
  return value.slice('province:'.length).trim();
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

function facilityCodesByProvinceId(sites, rawCode) {
  const allSites = Array.isArray(sites) ? sites : [];
  const facilities = allSites.filter(isFacilitySite);
  const provinceId = provinceIdFromCode(rawCode);
  if (!provinceId) return [];
  return facilities
    .filter((site) => provinceIdFromSite(site) === provinceId)
    .map((site) => String(site.code));
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

  const byProvinceId = facilityCodesByProvinceId(allSites, codeStr);
  if (byProvinceId.length) return [...new Set(byProvinceId)];

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

/**
 * Dedupe key for merged patient-level rows across facilities (infant / PNTT report details).
 * PNTT child rows share parent clinicid — must include child_id + visit; visit rows need pntt_asid.
 */
function detailRowDedupeKey(row) {
  const r = row || {};
  const site = String(r.site_code ?? r.siteCode ?? '').trim();
  const siteP = site ? `${site}:` : '';

  const clinicRaw = r.ClinicID ?? r.clinicid ?? r.ClinicId ?? r.CLINICID ?? r.clinic_id;
  const clinicStr = clinicRaw != null && String(clinicRaw).trim() !== '' ? String(clinicRaw).trim() : '';

  const pnttRaw = r.pntt_asid ?? r.pnttAsID ?? r.AsID;
  const pnttStr = pnttRaw != null && String(pnttRaw).trim() !== '' ? String(pnttRaw).trim() : '';

  const childRaw = r.child_id ?? r.CAPID ?? r.capid ?? r.ChildID ?? r.childid;
  if (childRaw != null && String(childRaw).trim() !== '') {
    return `pntt-child:${siteP}${clinicStr}:${pnttStr}:${String(childRaw).trim()}`;
  }

  const hasPartner =
    (r.partner_sex != null && r.partner_sex !== '') ||
    (r.partner_sex_display != null && String(r.partner_sex_display).trim() !== '');
  if (hasPartner && (clinicStr || pnttStr)) {
    const pSex = r.partner_sex ?? r.partner_sex_display ?? '';
    const visit = r.pntt_visit_date ?? r.pntt_visitdate ?? '';
    return `pntt-part:${siteP}${clinicStr}:${pnttStr}:${String(pSex)}:${String(visit)}`;
  }

  if (pnttStr && clinicStr) return `pntt-visit:${siteP}${clinicStr}:${pnttStr}`;

  if (clinicStr) return `id:${siteP}${clinicStr}`;

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
    const existingRows = Array.isArray(existing.rows) ? existing.rows : [];
    const incomingRows = Array.isArray(section?.rows) ? section.rows : [];
    const rowCount = Math.max(existingRows.length, incomingRows.length);
    existing.rows = Array.from({ length: rowCount }, (_, idx) =>
      sumNumericFields(existingRows[idx] || {}, incomingRows[idx] || {})
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
