import { P360_KH } from '../pages/patient360Kh';

const T = P360_KH.listHeaders?.vcctInsight || {};

function buildTooltip(row, extraLines = []) {
  const lines = [];
  const id = row.vcctId ? String(row.vcctId).trim() : '';
  if (id) lines.push(`${T.tooltipId || 'VCCT ID'}: ${id}`);
  if (row.vcctCode) lines.push(`${T.tooltipArtCode || 'ART Vcctcode'}: ${row.vcctCode}`);
  if (row.defaultVcctSite) lines.push(`${T.tooltipDefault || 'ART default VCCT'}: ${row.defaultVcctSite}`);
  const actual = Array.isArray(row.actualVcctSites) ? row.actualVcctSites : [];
  if (actual.length) lines.push(`${T.tooltipFound || 'Found in vccts'}: ${actual.join(', ')}`);
  if (row.vcctSiteCode) lines.push(`${T.tooltipUsing || 'Open at'}: ${row.vcctSiteCode}`);
  lines.push(...extraLines.filter(Boolean));
  return lines.join('\n');
}

/** Compact list cell: site line + optional badge; full story in tooltip. */
export function vcctListCellView(row = {}) {
  const id = row.vcctId ? String(row.vcctId).trim() : '—';
  if (!row.vcctId) return { id: '—', siteLine: null, badge: null, tone: null, tooltip: null };

  const status = row.vcctMappingStatus;
  const site = row.vcctSiteCode;
  const defaultSite = row.defaultVcctSite;
  const actualSites = Array.isArray(row.actualVcctSites) ? row.actualVcctSites : [];
  const siteLine = site ? `@${site}` : null;

  if (status === 'not_found') {
    return {
      id,
      siteLine: null,
      badge: T.badgeNotFound || 'រកមិនឃើញ',
      tone: 'warn',
      tooltip: buildTooltip(row, [T.notFoundDetail || 'No row in vccts for this ID at any site.'])
    };
  }

  if (status === 'unmapped') {
    return {
      id,
      siteLine: null,
      badge: T.badgeUnmapped || 'គ្មានកូដ',
      tone: 'warn',
      tooltip: buildTooltip(row, [T.unmappedDetail || 'Set tblsites.vcct_site_code or Vcctcode on ART.'])
    };
  }

  if (status === 'other_site') {
    const detail =
      site && defaultSite
        ? (T.otherSiteDetail || 'Record is at {site}, but ART facility default is {default}.')
            .replace('{site}', site)
            .replace('{default}', defaultSite)
        : null;
    return {
      id,
      siteLine,
      badge: T.badgeOtherSite || 'ផ្សេង',
      tone: 'info',
      tooltip: buildTooltip(row, [detail, row.vcctCode ? null : T.noArtCodeHint || null].filter(Boolean))
    };
  }

  if (status === 'ok') {
    const extra =
      actualSites.length > 1
        ? (T.multiSiteNote || 'Same VCCT ID also exists at: {sites}. Using {site}.')
            .replace('{sites}', actualSites.filter((s) => s !== site).join(', ') || actualSites.join(', '))
            .replace('{site}', site || '—')
        : null;
    return {
      id,
      siteLine,
      badge: null,
      tone: 'ok',
      tooltip: buildTooltip(row, extra ? [extra] : [])
    };
  }

  return {
    id,
    siteLine,
    badge: null,
    tone: site ? 'ok' : null,
    tooltip: buildTooltip(row, [])
  };
}

/** Detail panel / legacy helpers */
export function vcctInsightLabel(row = {}) {
  const view = vcctListCellView(row);
  if (view.badge && !view.siteLine) return view.badge;
  if (view.badge && view.siteLine) {
    return `${view.siteLine} · ${view.badge}`;
  }
  return view.siteLine;
}

export function vcctInsightTone(row = {}) {
  return vcctListCellView(row).tone;
}

export function vcctInsightRowFromSnapshot(snapshot = {}) {
  return {
    vcctId: snapshot.vcctId || snapshot.artVcctId,
    vcctCode: snapshot.artVcctCode,
    vcctSiteCode: snapshot.vcctSiteCode,
    defaultVcctSite: snapshot.defaultVcctSite,
    actualVcctSites: snapshot.actualVcctSites,
    vcctMappingStatus: snapshot.vcctMappingStatus,
    vcctMappingInsight: snapshot.vcctMappingInsight
  };
}
