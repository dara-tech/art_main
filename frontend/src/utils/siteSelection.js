export const provinceNameByCode = {
  '01': 'Banteay Meanchey',
  '02': 'Battambang',
  '03': 'Kampong Cham',
  '04': 'Kampong Chhnang',
  '05': 'Kampong Speu',
  '06': 'Kampong Thom',
  '07': 'Kampot',
  '08': 'Kandal',
  '09': 'Koh Kong',
  '10': 'Kratie',
  '11': 'Mondulkiri',
  '12': 'Phnom Penh',
  '13': 'Preah Vihear',
  '14': 'Prey Veng',
  '15': 'Pursat',
  '16': 'Ratanakiri',
  '17': 'Siem Reap',
  '18': 'Preah Sihanouk',
  '19': 'Stung Treng',
  '20': 'Svay Rieng',
  '21': 'Takeo',
  '22': 'Oddar Meanchey',
  '23': 'Kep',
  '24': 'Pailin',
  '25': 'Tbong Khmum'
};

export const isFacilitySite = (site) => {
  if (!site) return false;
  const codeDigits = String(site.code || '').replace(/\D/g, '');
  const name = String(site.name || '').toLowerCase();
  if (!codeDigits || codeDigits.length < 4) return false;
  if (codeDigits.endsWith('00')) return false;
  if (name.includes('cambodia') || name.includes('province')) return false;
  return true;
};

export const isCambodiaRootSite = (site) => {
  const name = String(site?.name || '')
    .trim()
    .toLowerCase();
  const codeDigits = String(site?.code || '').replace(/\D/g, '');
  return name.includes('cambodia') && codeDigits.length <= 2;
};

export const getProvinceName = (site) => {
  if (isCambodiaRootSite(site)) return 'Cambodia';
  if (site?.province) return String(site.province);
  const prefix = String(site?.code || '').slice(0, 2);
  return provinceNameByCode[prefix] || `Province ${prefix || 'Unknown'}`;
};

export function buildSiteSelectionModel(sites = []) {
  const selectableSites = Array.isArray(sites) ? sites : [];
  const provinceGroups = Array.from(
    selectableSites
      .reduce((acc, site) => {
        const province = getProvinceName(site);
        const provinceId = String(site?.province_id ?? '').trim();
        const key = provinceId ? `province:${provinceId}` : `name:${province}`;
        if (!acc.has(key)) {
          acc.set(key, { key, province, provinceId, sites: [] });
        }
        acc.get(key).sites.push(site);
        return acc;
      }, new Map())
      .values()
  ).sort((a, b) => String(a.province || '').localeCompare(String(b.province || '')));

  const cambodiaSite = selectableSites.find(isCambodiaRootSite) || null;
  const cambodiaValue = cambodiaSite ? String(cambodiaSite.code) : '__CAMBODIA__';
  const provinceOptions = provinceGroups
    .filter((group) => group.province !== 'Cambodia')
    .map((group) => ({
      ...group,
      code: group.provinceId ? `province:${group.provinceId}` : ''
    }))
    .filter((group) => group.code);

  const provinceCodeByKey = new Map(provinceOptions.map((group) => [group.key, String(group.code)]));
  const siteLabelByCode = new Map(selectableSites.map((s) => [String(s.code), `${s.code} - ${s.name}`]));

  if (cambodiaSite) {
    siteLabelByCode.set(String(cambodiaSite.code), `${cambodiaSite.code} - ${cambodiaSite.name}`);
  } else {
    siteLabelByCode.set(cambodiaValue, 'Cambodia');
  }
  provinceOptions.forEach((group) => {
    if (!siteLabelByCode.has(String(group.code))) siteLabelByCode.set(String(group.code), group.province);
  });

  return {
    selectableSites,
    provinceGroups,
    cambodiaSite,
    cambodiaValue,
    provinceOptions,
    provinceCodeByKey,
    siteLabelByCode
  };
};

/** Align with backend inferSiteLevel / Report Home. */
export function inferSiteLevelFromCode(siteCode, sites = []) {
  const code = String(siteCode || '').trim();
  if (!code) return 'facility';
  if (code === '__CAMBODIA__' || code.toLowerCase() === 'all') return 'country';
  if (code.startsWith('province:')) return 'province';
  const site = (sites || []).find((s) => String(s.code) === code);
  const name = String(site?.name || '').toLowerCase();
  if (name.includes('cambodia')) return 'country';
  const digits = code.replace(/\D/g, '');
  if (digits.length <= 2) return 'province';
  if (digits.length >= 4 && digits.endsWith('00')) return 'province';
  return 'facility';
}

export function isFacilitySiteCode(sites, siteCode) {
  const code = String(siteCode || '').trim();
  if (!code || code.startsWith('province:') || code === '__CAMBODIA__') return false;
  const site = (sites || []).find((s) => String(s.code) === code);
  return isFacilitySite(site);
}

/** Match backend filterRegistrySites — client-side fallback when user is in localStorage. */
export function filterSitesByUserScope(sites, user) {
  const rows = Array.isArray(sites) ? sites : [];
  if (!user || user.assignedSites == null) return rows;

  const allowedFacilities = new Set((user.assignedSites || []).map(String));
  const provinceIds = new Set((user.orgScope?.provinceIds || []).map(String));
  const odCodes = new Set((user.orgScope?.odCodes || []).map(String));

  if (!allowedFacilities.size && !provinceIds.size && !odCodes.size) return [];

  const facilityList = rows.filter((s) => allowedFacilities.has(String(s.code)));

  return rows.filter((site) => {
    const code = String(site.code || '');
    if (allowedFacilities.has(code)) return true;

    if (provinceIds.size && site.province_id != null && provinceIds.has(String(site.province_id))) {
      return true;
    }

    if (code.startsWith('province:')) {
      const pid = code.slice('province:'.length);
      if (provinceIds.has(pid)) return true;
    }

    const name = String(site.name || '').toLowerCase();
    if (name.includes('cambodia')) return false;

    const digits = code.replace(/\D/g, '');
    if (digits.endsWith('00') || (digits.length === 2 && /^\d{2}$/.test(digits))) {
      const prefix = digits.length >= 2 ? digits.slice(0, 2) : '';
      return facilityList.some((f) => String(f.code || '').replace(/\D/g, '').startsWith(prefix));
    }

    if (odCodes.size) {
      const siteOd = String(site.od_code || site.odCode || '').trim();
      if (siteOd && odCodes.has(siteOd)) return true;
    }

    return false;
  });
}

export function pickDefaultSiteCode(sites) {
  const firstFacility = (sites || []).find(isFacilitySite);
  return firstFacility?.code ? String(firstFacility.code) : sites[0]?.code ? String(sites[0].code) : '';
}

/** Facility sites grouped by operational district (od_code). */
export function groupFacilitiesByOd(facilitySites = []) {
  const byOd = new Map();
  for (const site of facilitySites || []) {
    if (!isFacilitySite(site)) continue;
    const raw = String(site.od_code || site.odCode || '').trim();
    const key = raw || '__NO_OD__';
    if (!byOd.has(key)) {
      byOd.set(key, {
        key,
        odCode: raw,
        label: raw ? `OD ${raw}` : 'Other',
        sites: []
      });
    }
    byOd.get(key).sites.push(site);
  }
  return [...byOd.values()].sort((a, b) => String(a.label).localeCompare(String(b.label)));
}

export function facilityCodesFromSites(sites = []) {
  return (sites || []).filter(isFacilitySite).map((s) => String(s.code));
}

export function isProvinceCompareCode(code) {
  return String(code || '').trim().startsWith('province:');
}

export function inferCompareSelectionLevel(codes = []) {
  const list = (codes || []).map(String).filter(Boolean);
  if (!list.length) return 'facility';
  return list.every(isProvinceCompareCode) ? 'province' : 'facility';
}

/** Normalize siteCode + siteLevel for indicator detail APIs (rollup / compare province / country). */
export function resolveDetailSiteParams(siteCode, siteLevel, sites = []) {
  let code = String(siteCode || '').trim();
  let level = String(siteLevel || '').trim().toLowerCase();

  if (code.startsWith('province:')) {
    return { siteCode: code, siteLevel: 'province' };
  }

  if (code === '__CAMBODIA__' || code.toLowerCase() === 'all') {
    return { siteCode: 'all', siteLevel: 'country' };
  }

  const inferred = inferSiteLevelFromCode(code, sites);
  if (!level) level = inferred;

  if (inferred === 'country' || level === 'country') {
    const site = (sites || []).find((s) => String(s.code) === code);
    const name = String(site?.name || '').toLowerCase();
    if (inferred === 'country' || name.includes('cambodia')) {
      return { siteCode: 'all', siteLevel: 'country' };
    }
  }

  if (inferred === 'province' && level !== 'country') {
    level = 'province';
  }

  return {
    siteCode: code,
    siteLevel: level || inferred || 'facility'
  };
}

/** VCCT site code mapped from tblsites.vcct_site_code for an ART facility code. */
export function resolveVcctSiteFromRegistry(sites, artSiteCode) {
  const art = String(artSiteCode || '').trim();
  if (!art) return { code: null, known: false };
  const site = (sites || []).find((s) => String(s.code || '').trim() === art);
  if (!site) return { code: null, known: false };
  if (!('vcctSiteCode' in site) && !('vcct_site_code' in site)) {
    return { code: null, known: false };
  }
  const mapped = String(site.vcctSiteCode ?? site.vcct_site_code ?? '').trim();
  return { code: mapped || null, known: true };
}
