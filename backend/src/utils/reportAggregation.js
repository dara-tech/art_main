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

function toParentCode(site) {
  return String(site?.tblsite || '').trim();
}

function resolveFacilityCodesByHierarchy(sites, selectedCode, siteLevel) {
  const allSites = Array.isArray(sites) ? sites : [];
  const selected = allSites.find((s) => String(s.code) === String(selectedCode));
  if (!selected) return [];
  if (siteLevel === 'facility' || (siteLevel !== 'province' && siteLevel !== 'country' && isFacilitySite(selected))) {
    return [String(selected.code)];
  }

  const childrenByParent = new Map();
  allSites.forEach((site) => {
    const parent = toParentCode(site);
    if (!parent) return;
    if (!childrenByParent.has(parent)) childrenByParent.set(parent, []);
    childrenByParent.get(parent).push(site);
  });

  const out = [];
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
  return [...new Set(out)];
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
  mergeSectionRows
};
