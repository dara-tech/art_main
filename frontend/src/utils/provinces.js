import { provinceNameByCode } from './siteSelection';

/** Map tblsites.province_id (1–25) to display name. */
export function getProvinceName(provinceId) {
  const id = Number(provinceId);
  if (!Number.isFinite(id)) return 'Unknown';
  const padded = String(id).padStart(2, '0');
  return provinceNameByCode[padded] || provinceNameByCode[String(id)] || `Province ${id}`;
}

export function formatOrgUnitLabel(unit) {
  if (!unit) return '';
  if (unit.siteCode) {
    return `Site ${unit.siteCode}${unit.siteName ? ` — ${unit.siteName}` : ''}`;
  }
  if (unit.provinceId != null) {
    return `Province: ${getProvinceName(unit.provinceId)} (id ${unit.provinceId})`;
  }
  if (unit.odCode) {
    return `OD: ${unit.odCode}`;
  }
  return `Unit #${unit.id}`;
}
