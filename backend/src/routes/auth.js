const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { siteDatabaseManager } = require('../config/siteDatabase');
const {
  buildAuthUser,
  fetchUserRoleRows,
  loadAuthProfileForUserId,
  listAllRoles,
  roleNameToSlug,
  filterRegistrySites
} = require('../services/userRoleService');

const router = express.Router();

function toPublicUser(authUser) {
  return {
    id: authUser.userId,
    username: authUser.username,
    fullName: authUser.fullName,
    role: authUser.role,
    roleId: authUser.roleId,
    roleName: authUser.roleName,
    roles: authUser.roles,
    assignedSites: authUser.assignedSites,
    orgScope: authUser.orgScope
  };
}

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const modernRows = await sequelize.query(
      `SELECT id, first_name, last_name, username, password, status_id
       FROM users
       WHERE LOWER(TRIM(username)) = LOWER(TRIM(:username))
       LIMIT 1`,
      { replacements: { username }, type: sequelize.QueryTypes.SELECT }
    );

    let safeUser = null;

    if (modernRows[0]) {
      const user = modernRows[0];
      if (Number(user.status_id || 1) !== 1) {
        return res.status(401).json({ success: false, message: 'Account disabled' });
      }

      let valid = false;
      try {
        valid = await bcrypt.compare(password, user.password);
      } catch {
        valid = false;
      }
      if (!valid) valid = String(user.password) === String(password);
      if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

      const roleRows = await fetchUserRoleRows(user.id);
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
      safeUser = await buildAuthUser({
        userId: user.id,
        username: user.username,
        fullName,
        statusId: user.status_id,
        roleRows
      });
    } else {
      const legacyRows = await sequelize.query(
        `SELECT Uid, Fullname, User, Pass, Status
         FROM tbluser
         WHERE LOWER(TRIM(User)) = LOWER(TRIM(:username))
         LIMIT 1`,
        { replacements: { username }, type: sequelize.QueryTypes.SELECT }
      );
      const user = legacyRows[0];
      if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
      if (Number(user.Status) !== 0 && Number(user.Status) !== 1) {
        return res.status(401).json({ success: false, message: 'Account disabled' });
      }

      let valid = false;
      if (user.Pass) {
        try {
          valid = await bcrypt.compare(password, user.Pass);
        } catch {
          valid = false;
        }
        if (!valid) valid = String(user.Pass) === String(password);
      }
      if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

      safeUser = await buildAuthUser({
        userId: user.Uid,
        username: user.User,
        fullName: user.Fullname || user.User,
        statusId: user.Status,
        roleRows: []
      });
    }

    const token = jwt.sign(safeUser, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

    return res.json({ success: true, token, user: toPublicUser(safeUser) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/verify', authenticateToken, async (req, res) => {
  try {
    const fresh = await loadAuthProfileForUserId(req.user.userId);
    if (!fresh) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    if (Number(fresh.statusId) !== 1) {
      return res.status(401).json({ success: false, message: 'Account disabled' });
    }
    return res.json({ success: true, user: toPublicUser(fresh) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/** Read-only: all roles defined in the database. */
router.get('/roles', authenticateToken, async (_req, res) => {
  try {
    const rows = await listAllRoles();
    res.json({
      success: true,
      count: rows.length,
      roles: rows.map((r) => ({
        id: r.id,
        name: r.role_name,
        slug: roleNameToSlug(r.role_name),
        description: r.role_desc
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/sites-registry', authenticateToken, async (req, res, next) => {
  try {
    const sites = await siteDatabaseManager.getAllSitesForManagement();
    const formatted = sites.map((site) => ({
      code: site.code,
      name: site.display_name || site.short_name || site.name,
      fullName: site.name,
      shortName: site.short_name,
      searchTerms: site.search_terms,
      fileName: site.file_name,
      tblsite: site.tblsite,
      province_id: site.province_id,
      province: site.province,
      od_code: site.od_code,
      type: site.type,
      database_name: site.database_name
    }));
    res.json(filterRegistrySites(formatted, req.user));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
