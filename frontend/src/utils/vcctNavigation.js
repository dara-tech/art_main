/** Deep link to standalone VCCT detail (matches VcctPage search params). */
export function buildVcctPath({ siteCode, vcctId, vcctSiteCode }) {
  const id = String(vcctId ?? '').trim();
  if (!id) return '/vcct';
  const params = new URLSearchParams();
  if (siteCode) params.set('site', String(siteCode).trim());
  params.set('vcctId', id);
  if (vcctSiteCode) params.set('vcctSite', String(vcctSiteCode).trim());
  return `/vcct?${params.toString()}`;
}

export function parseVcctSearchParams(searchParams) {
  if (!searchParams) return null;
  const vcctId = String(searchParams.get('vcctId') || searchParams.get('id') || '').trim();
  if (!vcctId) return null;
  return {
    site: String(searchParams.get('site') || '').trim() || null,
    vcctId,
    vcctSiteCode:
      String(searchParams.get('vcctSite') || searchParams.get('vcctSiteCode') || '').trim() || null
  };
}
