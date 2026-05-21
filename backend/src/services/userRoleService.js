const { sequelize } = require('../config/database');

const DEFAULT_ROLE_NAME = 'Guest';

/** Read-only: map DB role_name to a stable slug for JWT / permission checks. */
function roleNameToSlug(roleName) {
  return String(roleName || DEFAULT_ROLE_NAME)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

/** Prefer highest-privilege role when a user has multiple rows in user_roles. */
const ROLE_PRIORITY = [
  'admin',
  'manager',
  'pdmo',
  'pasp',
  'lab_admin',
  'lab_site',
  'doctor',
  'counselor',
  'data_clerk',
  'ngo_partner',
  'guest'
];

function pickPrimaryRole(roleRows) {
  if (!roleRows.length) {
    return { id: null, role_name: DEFAULT_ROLE_NAME, slug: roleNameToSlug(DEFAULT_ROLE_NAME) };
  }
  const normalized = roleRows.map((r) => ({
    id: r.id,
    role_name: r.role_name,
    role_desc: r.role_desc,
    slug: roleNameToSlug(r.role_name)
  }));
  const byPriority = [...normalized].sort(
    (a, b) => ROLE_PRIORITY.indexOf(a.slug) - ROLE_PRIORITY.indexOf(b.slug)
  );
  const primary = byPriority.find((r) => ROLE_PRIORITY.indexOf(r.slug) >= 0) || normalized[0];
  return primary;
}

/** Read-only: roles assigned to a user via user_roles + roles. */
async function fetchUserRoleRows(userId) {
  if (userId == null) return [];
  return sequelize.query(
    `SELECT r.id, r.role_name, r.role_desc
     FROM user_roles ur
     INNER JOIN roles r ON r.id = ur.role_id
     WHERE ur.user_id = :userId
     ORDER BY r.id`,
    { replacements: { userId }, type: sequelize.QueryTypes.SELECT }
  );
}

/** Read-only: org/site scope from user_org_units (+ tblsites for site_id → art_site_code). */
async function fetchUserOrgUnitRows(userId) {
  if (userId == null) return [];
  return sequelize.query(
    `SELECT uou.id,
            uou.province_id,
            uou.od_code,
            uou.site_id,
            ts.art_site_code,
            ts.site_name,
            ts.province_id AS site_province_id,
            ts.od_code AS site_od_code
     FROM user_org_units uou
     LEFT JOIN tblsites ts ON ts.id = uou.site_id
     WHERE uou.user_id = :userId
     ORDER BY uou.id`,
    { replacements: { userId }, type: sequelize.QueryTypes.SELECT }
  );
}

/** Expand user_org_units to facility art_site_code list (SELECT only). */
async function resolveSiteScope(orgRows) {
  if (!orgRows.length) {
    return {
      assignedSites: null,
      orgScope: {
        restricted: false,
        units: [],
        provinceIds: [],
        odCodes: [],
        facilityCodes: []
      }
    };
  }

  const facilityCodes = new Set();
  const provinceIds = new Set();
  const odCodes = new Set();
  const units = [];

  for (const row of orgRows) {
    if (row.site_id != null) {
      const code = row.art_site_code ? String(row.art_site_code).trim() : null;
      units.push({
        type: 'site',
        siteId: Number(row.site_id),
        siteCode: code,
        siteName: row.site_name ? String(row.site_name).trim() : null,
        provinceId: row.site_province_id ?? row.province_id ?? null,
        odCode: row.site_od_code ?? row.od_code ?? null
      });
      if (code) facilityCodes.add(code);
    } else if (row.province_id != null) {
      provinceIds.add(Number(row.province_id));
      units.push({
        type: 'province',
        siteId: null,
        siteCode: null,
        siteName: null,
        provinceId: Number(row.province_id),
        odCode: null
      });
    } else if (row.od_code) {
      const od = String(row.od_code).trim();
      if (od) {
        odCodes.add(od);
        units.push({
          type: 'od',
          siteId: null,
          siteCode: null,
          siteName: null,
          provinceId: row.province_id ?? null,
          odCode: od
        });
      }
    }
  }

  if (provinceIds.size) {
    const rows = await sequelize.query(
      `SELECT DISTINCT TRIM(art_site_code) AS code
       FROM tblsites
       WHERE province_id IN (:provinceIds)
         AND art_site_code IS NOT NULL
         AND TRIM(art_site_code) <> ''`,
      {
        replacements: { provinceIds: [...provinceIds] },
        type: sequelize.QueryTypes.SELECT
      }
    );
    rows.forEach((r) => {
      if (r.code) facilityCodes.add(String(r.code).trim());
    });
  }

  if (odCodes.size) {
    const rows = await sequelize.query(
      `SELECT DISTINCT TRIM(art_site_code) AS code
       FROM tblsites
       WHERE od_code IN (:odCodes)
         AND art_site_code IS NOT NULL
         AND TRIM(art_site_code) <> ''`,
      {
        replacements: { odCodes: [...odCodes] },
        type: sequelize.QueryTypes.SELECT
      }
    );
    rows.forEach((r) => {
      if (r.code) facilityCodes.add(String(r.code).trim());
    });
  }

  const codes = [...facilityCodes].filter(Boolean).sort();

  return {
    assignedSites: codes,
    orgScope: {
      restricted: true,
      units,
      provinceIds: [...provinceIds],
      odCodes: [...odCodes],
      facilityCodes: codes
    }
  };
}

/** null assignedSites = unrestricted (all sites). */
function hasUnrestrictedSiteAccess(user) {
  return user?.assignedSites == null;
}

/** Enforce facility-level access for API routes. */
function assertResolvedSiteAccess(user, siteCode, { allowAll = false, resolvedSiteCodes = null } = {}) {
  if (hasUnrestrictedSiteAccess(user)) return { ok: true };

  const allowedSet = new Set((user.assignedSites || []).map(String));
  const requested = String(siteCode || '').trim();

  if (allowAll && requested.toLowerCase() === 'all') {
    return {
      ok: false,
      message: 'Country-level access is not permitted for your site assignment.'
    };
  }

  const codesToCheck = resolvedSiteCodes?.length
    ? resolvedSiteCodes.map(String)
    : [requested];

  const denied = codesToCheck.filter((code) => code && !allowedSet.has(String(code)));
  if (denied.length) {
    return {
      ok: false,
      message: `Access denied for site(s): ${[...new Set(denied)].join(', ')}`
    };
  }

  return { ok: true };
}

/** Filter sites-registry rows for scoped users (read-only derived list). */
function filterRegistrySites(sites, user) {
  if (!Array.isArray(sites) || hasUnrestrictedSiteAccess(user)) return sites;

  const allowedFacilities = new Set((user.assignedSites || []).map(String));
  const provinceIds = new Set((user.orgScope?.provinceIds || []).map(String));
  const odCodes = new Set((user.orgScope?.odCodes || []).map(String));

  if (!allowedFacilities.size && !provinceIds.size && !odCodes.size) return [];

  const facilityList = sites.filter((s) => allowedFacilities.has(String(s.code)));

  return sites.filter((site) => {
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

async function buildAuthUser({ userId, username, fullName, statusId, roleRows }) {
  const primary = pickPrimaryRole(roleRows);
  const roles = roleRows.map((r) => ({
    id: r.id,
    name: r.role_name,
    slug: roleNameToSlug(r.role_name),
    description: r.role_desc
  }));

  const orgRows = await fetchUserOrgUnitRows(userId);
  const { assignedSites, orgScope } = await resolveSiteScope(orgRows);

  return {
    userId,
    username,
    fullName,
    statusId: statusId != null ? Number(statusId) : 1,
    role: primary.slug,
    roleId: primary.id,
    roleName: primary.role_name,
    roles,
    assignedSites,
    orgScope
  };
}

/** Read-only: load modern users row by id. */
async function fetchUserById(userId) {
  const rows = await sequelize.query(
    `SELECT id, first_name, last_name, username, status_id
     FROM users
     WHERE id = :userId
     LIMIT 1`,
    { replacements: { userId }, type: sequelize.QueryTypes.SELECT }
  );
  return rows[0] || null;
}

/** Read-only: build auth profile for JWT / verify. */
async function loadAuthProfileForUserId(userId) {
  const user = await fetchUserById(userId);
  if (!user) return null;
  const roleRows = await fetchUserRoleRows(user.id);
  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
  return buildAuthUser({
    userId: user.id,
    username: user.username,
    fullName,
    statusId: user.status_id,
    roleRows
  });
}

/** Read-only: list all roles (for reference endpoints). */
async function listAllRoles() {
  return sequelize.query(
    `SELECT id, role_name, role_desc
     FROM roles
     ORDER BY id`,
    { type: sequelize.QueryTypes.SELECT }
  );
}

module.exports = {
  roleNameToSlug,
  fetchUserRoleRows,
  fetchUserOrgUnitRows,
  resolveSiteScope,
  buildAuthUser,
  loadAuthProfileForUserId,
  listAllRoles,
  hasUnrestrictedSiteAccess,
  assertResolvedSiteAccess,
  filterRegistrySites,
  DEFAULT_ROLE_NAME
};
