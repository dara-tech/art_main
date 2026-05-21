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

export function isFacilitySiteCode(sites, siteCode) {
  const code = String(siteCode || '').trim();
  if (!code || code.startsWith('province:') || code === '__CAMBODIA__') return false;
  const site = (sites || []).find((s) => String(s.code) === code);
  return isFacilitySite(site);
}
