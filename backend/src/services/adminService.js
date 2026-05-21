const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const {
  fetchUserOrgUnitRows,
  resolveSiteScope,
  listAllRoles,
  roleNameToSlug
} = require('./userRoleService');

async function getAdminStats() {
  const [row] = await sequelize.query(
    `SELECT
       (SELECT COUNT(*) FROM users) AS total_users,
       (SELECT COUNT(*) FROM users WHERE status_id = 1) AS active_users,
       (SELECT COUNT(DISTINCT user_id) FROM user_roles) AS users_with_roles,
       (SELECT COUNT(DISTINCT user_id) FROM user_org_units) AS users_with_scope,
       (SELECT COUNT(*) FROM roles) AS total_roles,
       (SELECT COUNT(*) FROM user_roles) AS role_assignments,
       (SELECT COUNT(*) FROM user_org_units) AS org_unit_rows`,
    { type: sequelize.QueryTypes.SELECT }
  );

  const roleBreakdown = await sequelize.query(
    `SELECT r.id, r.role_name, COUNT(ur.user_id) AS user_count
     FROM roles r
     LEFT JOIN user_roles ur ON ur.role_id = r.id
     GROUP BY r.id, r.role_name
     ORDER BY r.id`,
    { type: sequelize.QueryTypes.SELECT }
  );

  return {
    totalUsers: Number(row.total_users || 0),
    activeUsers: Number(row.active_users || 0),
    usersWithRoles: Number(row.users_with_roles || 0),
    usersWithScope: Number(row.users_with_scope || 0),
    totalRoles: Number(row.total_roles || 0),
    roleAssignments: Number(row.role_assignments || 0),
    orgUnitRows: Number(row.org_unit_rows || 0),
    roleBreakdown: roleBreakdown.map((r) => ({
      id: r.id,
      name: r.role_name,
      slug: roleNameToSlug(r.role_name),
      userCount: Number(r.user_count || 0)
    }))
  };
}

async function listUsers({ page = 1, limit = 50, search = '' } = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 50));
  const offset = (safePage - 1) * safeLimit;
  const term = String(search || '').trim();

  const whereClause = term
    ? `WHERE (
         LOWER(u.username) LIKE LOWER(:term)
         OR LOWER(CONCAT(IFNULL(u.first_name,''), ' ', IFNULL(u.last_name,''))) LIKE LOWER(:term)
         OR LOWER(IFNULL(u.email,'')) LIKE LOWER(:term)
       )`
    : '';

  const replacements = { limit: safeLimit, offset };
  if (term) replacements.term = `%${term}%`;

  const [countRow] = await sequelize.query(
    `SELECT COUNT(*) AS total FROM users u ${whereClause}`,
    { replacements, type: sequelize.QueryTypes.SELECT }
  );

  const users = await sequelize.query(
    `SELECT u.id,
            u.username,
            u.first_name,
            u.last_name,
            u.email,
            u.status_id,
            u.last_login_at,
            u.created_at,
            GROUP_CONCAT(DISTINCT r.role_name ORDER BY r.id SEPARATOR ', ') AS role_names,
            GROUP_CONCAT(DISTINCT r.id ORDER BY r.id) AS role_ids,
            COUNT(DISTINCT uou.id) AS org_unit_count
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN roles r ON r.id = ur.role_id
     LEFT JOIN user_org_units uou ON uou.user_id = u.id
     ${whereClause}
     GROUP BY u.id, u.username, u.first_name, u.last_name, u.email, u.status_id, u.last_login_at, u.created_at
     ORDER BY u.id DESC
     LIMIT :limit OFFSET :offset`,
    { replacements, type: sequelize.QueryTypes.SELECT }
  );

  return {
    page: safePage,
    limit: safeLimit,
    total: Number(countRow?.total || 0),
    users: users.map((u) => ({
      id: u.id,
      username: u.username,
      fullName: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username,
      email: u.email,
      statusId: Number(u.status_id ?? 1),
      active: Number(u.status_id ?? 1) === 1,
      lastLoginAt: u.last_login_at,
      createdAt: u.created_at,
      roleNames: u.role_names ? String(u.role_names).split(', ') : [],
      roleIds: u.role_ids ? String(u.role_ids).split(',').map(Number) : [],
      orgUnitCount: Number(u.org_unit_count || 0),
      hasRoles: Boolean(u.role_names),
      siteAccess: Number(u.org_unit_count || 0) > 0 ? 'scoped' : 'all'
    }))
  };
}

async function assertUserExists(userId) {
  const rows = await sequelize.query(
    `SELECT id FROM users WHERE id = :userId LIMIT 1`,
    { replacements: { userId }, type: sequelize.QueryTypes.SELECT }
  );
  if (!rows[0]) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return rows[0].id;
}

async function listSitesForPicker() {
  return sequelize.query(
    `SELECT id,
            TRIM(art_site_code) AS code,
            site_name,
            province_id,
            od_code
     FROM tblsites
     WHERE art_site_code IS NOT NULL
       AND TRIM(art_site_code) <> ''
     ORDER BY art_site_code`,
    { type: sequelize.QueryTypes.SELECT }
  );
}

/** Distinct provinces from tblsites for admin scope assignment. */
async function listProvincesForPicker() {
  return sequelize.query(
    `SELECT province_id AS id, COUNT(*) AS site_count
     FROM tblsites
     WHERE province_id IS NOT NULL
     GROUP BY province_id
     ORDER BY province_id`,
    { type: sequelize.QueryTypes.SELECT }
  );
}

/** Distinct ODs from tblsites for admin scope assignment. */
async function listOdsForPicker() {
  return sequelize.query(
    `SELECT TRIM(od_code) AS code, COUNT(*) AS site_count
     FROM tblsites
     WHERE od_code IS NOT NULL AND TRIM(od_code) <> ''
     GROUP BY TRIM(od_code)
     ORDER BY code`,
    { type: sequelize.QueryTypes.SELECT }
  );
}

async function resolveSiteId({ siteId, siteCode }) {
  if (siteId != null) {
    const rows = await sequelize.query(
      `SELECT id FROM tblsites WHERE id = :siteId LIMIT 1`,
      { replacements: { siteId }, type: sequelize.QueryTypes.SELECT }
    );
    if (!rows[0]) {
      const err = new Error('Site not found');
      err.statusCode = 400;
      throw err;
    }
    return rows[0].id;
  }
  const code = String(siteCode || '').trim();
  if (!code) {
    const err = new Error('siteId or siteCode is required');
    err.statusCode = 400;
    throw err;
  }
  const rows = await sequelize.query(
    `SELECT id FROM tblsites WHERE TRIM(art_site_code) = :code LIMIT 1`,
    { replacements: { code }, type: sequelize.QueryTypes.SELECT }
  );
  if (!rows[0]) {
    const err = new Error(`Site code "${code}" not found`);
    err.statusCode = 400;
    throw err;
  }
  return rows[0].id;
}

async function getUserAdminDetail(userId) {
  const rows = await sequelize.query(
    `SELECT id, username, first_name, last_name, email, status_id, last_login_at, login_at, created_at, updated_at
     FROM users
     WHERE id = :userId
     LIMIT 1`,
    { replacements: { userId }, type: sequelize.QueryTypes.SELECT }
  );
  const user = rows[0];
  if (!user) return null;

  const roleRows = await sequelize.query(
    `SELECT ur.id AS assignment_id, r.id, r.role_name, r.role_desc
     FROM user_roles ur
     INNER JOIN roles r ON r.id = ur.role_id
     WHERE ur.user_id = :userId
     ORDER BY r.id`,
    { replacements: { userId }, type: sequelize.QueryTypes.SELECT }
  );
  const orgRows = await fetchUserOrgUnitRows(userId);
  const { assignedSites, orgScope } = await resolveSiteScope(orgRows);

  return {
    id: user.id,
    username: user.username,
    fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
    email: user.email,
    statusId: Number(user.status_id ?? 1),
    active: Number(user.status_id ?? 1) === 1,
    lastLoginAt: user.last_login_at,
    loginAt: user.login_at,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    roles: roleRows.map((r) => ({
      assignmentId: r.assignment_id,
      id: r.id,
      name: r.role_name,
      slug: roleNameToSlug(r.role_name),
      description: r.role_desc
    })),
    orgUnits: orgRows.map((row) => ({
      id: row.id,
      provinceId: row.province_id,
      odCode: row.od_code,
      siteId: row.site_id,
      siteCode: row.art_site_code ? String(row.art_site_code).trim() : null,
      siteName: row.site_name ? String(row.site_name).trim() : null,
      scopeType: row.site_id != null ? 'site' : row.province_id != null ? 'province' : row.od_code ? 'od' : 'unknown'
    })),
    assignedSites,
    orgScope
  };
}

const MIN_PASSWORD_LENGTH = 6;

function validatePassword(password) {
  const value = String(password || '');
  if (value.length < MIN_PASSWORD_LENGTH) {
    const err = new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    err.statusCode = 400;
    throw err;
  }
  return value;
}

async function hashPassword(password) {
  return bcrypt.hash(validatePassword(password), 10);
}

async function assertUsernameAvailable(username, excludeUserId = null) {
  const rows = await sequelize.query(
    `SELECT id FROM users WHERE LOWER(TRIM(username)) = LOWER(TRIM(:username)) LIMIT 1`,
    { replacements: { username }, type: sequelize.QueryTypes.SELECT }
  );
  if (rows[0] && Number(rows[0].id) !== Number(excludeUserId)) {
    const err = new Error('Username already exists');
    err.statusCode = 409;
    throw err;
  }
}

async function assertEmailAvailable(email, excludeUserId = null) {
  const normalized = String(email || '').trim();
  if (!normalized) return null;
  const rows = await sequelize.query(
    `SELECT id FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM(:email)) LIMIT 1`,
    { replacements: { email: normalized }, type: sequelize.QueryTypes.SELECT }
  );
  if (rows[0] && Number(rows[0].id) !== Number(excludeUserId)) {
    const err = new Error('Email already exists');
    err.statusCode = 409;
    throw err;
  }
  return normalized;
}

async function createUser(payload) {
  const username = String(payload.username || '').trim();
  if (username.length < 3) {
    const err = new Error('Username must be at least 3 characters');
    err.statusCode = 400;
    throw err;
  }

  await assertUsernameAvailable(username);
  const email = await assertEmailAvailable(payload.email);
  const passwordHash = await hashPassword(payload.password);

  const firstName = String(payload.firstName || payload.first_name || '').trim() || null;
  const lastName = String(payload.lastName || payload.last_name || '').trim() || null;
  const statusId = payload.active === false || Number(payload.statusId) === 0 ? 0 : 1;

  await sequelize.query(
    `INSERT INTO users (first_name, last_name, username, email, password, status_id, created_at, updated_at)
     VALUES (:firstName, :lastName, :username, :email, :password, :statusId, NOW(), NOW())`,
    {
      replacements: {
        firstName,
        lastName,
        username,
        email,
        password: passwordHash,
        statusId
      }
    }
  );

  const [idRow] = await sequelize.query(`SELECT LAST_INSERT_ID() AS id`, {
    type: sequelize.QueryTypes.SELECT
  });
  const userId = Number(idRow.id);

  const roleId = Number(payload.roleId);
  if (Number.isFinite(roleId)) {
    await assignUserRole(userId, roleId, null);
  }

  const scope = payload.orgUnit || payload.initialScope;
  if (scope && typeof scope === 'object') {
    await addUserOrgUnit(userId, scope);
  } else if (payload.siteId || payload.siteCode) {
    await addUserOrgUnit(userId, {
      scopeType: 'site',
      siteId: payload.siteId,
      siteCode: payload.siteCode
    });
  }

  return getUserAdminDetail(userId);
}

async function changeUserPassword(userId, password) {
  await assertUserExists(userId);
  const passwordHash = await hashPassword(password);
  await sequelize.query(
    `UPDATE users SET password = :password, updated_at = NOW() WHERE id = :userId`,
    { replacements: { userId, password: passwordHash } }
  );
  return getUserAdminDetail(userId);
}

async function updateUserStatus(userId, statusId) {
  await assertUserExists(userId);
  const next = Number(statusId) === 1 ? 1 : 0;
  await sequelize.query(`UPDATE users SET status_id = :statusId, updated_at = NOW() WHERE id = :userId`, {
    replacements: { userId, statusId: next }
  });
  return getUserAdminDetail(userId);
}

async function assignUserRole(userId, roleId, actingAdminId) {
  await assertUserExists(userId);
  const roleRows = await sequelize.query(`SELECT id FROM roles WHERE id = :roleId LIMIT 1`, {
    replacements: { roleId },
    type: sequelize.QueryTypes.SELECT
  });
  if (!roleRows[0]) {
    const err = new Error('Role not found');
    err.statusCode = 400;
    throw err;
  }

  const existing = await sequelize.query(
    `SELECT id FROM user_roles WHERE user_id = :userId AND role_id = :roleId LIMIT 1`,
    { replacements: { userId, roleId }, type: sequelize.QueryTypes.SELECT }
  );
  if (existing[0]) {
    const err = new Error('Role already assigned');
    err.statusCode = 409;
    throw err;
  }

  await sequelize.query(`INSERT INTO user_roles (user_id, role_id, created_at) VALUES (:userId, :roleId, NOW())`, {
    replacements: { userId, roleId }
  });
  return getUserAdminDetail(userId);
}

async function removeUserRole(assignmentId, actingAdminId) {
  const rows = await sequelize.query(
    `SELECT ur.id, ur.user_id, ur.role_id, r.role_name
     FROM user_roles ur
     INNER JOIN roles r ON r.id = ur.role_id
     WHERE ur.id = :assignmentId
     LIMIT 1`,
    { replacements: { assignmentId }, type: sequelize.QueryTypes.SELECT }
  );
  const row = rows[0];
  if (!row) {
    const err = new Error('Role assignment not found');
    err.statusCode = 404;
    throw err;
  }

  if (Number(row.user_id) === Number(actingAdminId) && roleNameToSlug(row.role_name) === 'admin') {
    const [countRow] = await sequelize.query(
      `SELECT COUNT(*) AS n
       FROM user_roles ur
       INNER JOIN roles r ON r.id = ur.role_id
       WHERE ur.user_id = :userId AND LOWER(r.role_name) = 'admin'`,
      { replacements: { userId: row.user_id }, type: sequelize.QueryTypes.SELECT }
    );
    if (Number(countRow.n) <= 1) {
      const err = new Error('Cannot remove your only Admin role');
      err.statusCode = 400;
      throw err;
    }
  }

  await sequelize.query(`DELETE FROM user_roles WHERE id = :assignmentId`, {
    replacements: { assignmentId }
  });
  return getUserAdminDetail(row.user_id);
}

async function clearUserOrgUnits(userId) {
  await assertUserExists(userId);
  await sequelize.query(`DELETE FROM user_org_units WHERE user_id = :userId`, {
    replacements: { userId }
  });
  return getUserAdminDetail(userId);
}

async function addUserOrgUnit(userId, payload) {
  await assertUserExists(userId);
  const scopeType = String(payload.scopeType || '').toLowerCase();

  if (scopeType === 'all') {
    return clearUserOrgUnits(userId);
  }

  let siteId = null;
  let provinceId = null;
  let odCode = null;

  if (scopeType === 'site') {
    siteId = await resolveSiteId({ siteId: payload.siteId, siteCode: payload.siteCode });
  } else if (scopeType === 'province') {
    provinceId = Number(payload.provinceId);
    if (!Number.isFinite(provinceId)) {
      const err = new Error('provinceId is required for province scope');
      err.statusCode = 400;
      throw err;
    }
  } else if (scopeType === 'od') {
    odCode = String(payload.odCode || '').trim();
    if (!odCode) {
      const err = new Error('odCode is required for OD scope');
      err.statusCode = 400;
      throw err;
    }
  } else {
    const err = new Error('scopeType must be site, province, od, or all');
    err.statusCode = 400;
    throw err;
  }

  await sequelize.query(
    `INSERT INTO user_org_units (user_id, province_id, od_code, site_id, created_at)
     VALUES (:userId, :provinceId, :odCode, :siteId, NOW())`,
    { replacements: { userId, provinceId, odCode, siteId } }
  );
  return getUserAdminDetail(userId);
}

async function removeUserOrgUnit(orgUnitId) {
  const rows = await sequelize.query(
    `SELECT id, user_id FROM user_org_units WHERE id = :orgUnitId LIMIT 1`,
    { replacements: { orgUnitId }, type: sequelize.QueryTypes.SELECT }
  );
  if (!rows[0]) {
    const err = new Error('Org unit assignment not found');
    err.statusCode = 404;
    throw err;
  }
  await sequelize.query(`DELETE FROM user_org_units WHERE id = :orgUnitId`, {
    replacements: { orgUnitId }
  });
  return getUserAdminDetail(rows[0].user_id);
}

module.exports = {
  getAdminStats,
  listUsers,
  getUserAdminDetail,
  listAllRoles,
  listSitesForPicker,
  listProvincesForPicker,
  listOdsForPicker,
  createUser,
  changeUserPassword,
  updateUserStatus,
  assignUserRole,
  removeUserRole,
  clearUserOrgUnits,
  addUserOrgUnit,
  removeUserOrgUnit
};
