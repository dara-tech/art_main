const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { siteDatabaseManager } = require('../config/siteDatabase');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    // Primary auth source: modern `users` table (schema_main_dbs_07-May-26.md).
    const modernRows = await sequelize.query(
      `SELECT id, first_name, last_name, username, password, status_id
       FROM users
       WHERE LOWER(TRIM(username)) = LOWER(TRIM(:username))
       LIMIT 1`,
      { replacements: { username }, type: sequelize.QueryTypes.SELECT }
    );

    let safeUser = null;
    let valid = false;

    if (modernRows[0]) {
      const user = modernRows[0];
      if (Number(user.status_id || 1) !== 1) {
        return res.status(401).json({ success: false, message: 'Account disabled' });
      }

      try {
        valid = await bcrypt.compare(password, user.password);
      } catch (error) {
        valid = false;
      }
      // Optional plaintext fallback for environments where passwords were seeded un-hashed.
      if (!valid) valid = String(user.password) === String(password);
      if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
      const normalizedUser = String(user.username || '').trim().toLowerCase();
      const role = normalizedUser === 'portal_admin' ? 'super_admin' : 'viewer';
      safeUser = {
        userId: user.id,
        username: user.username,
        fullName,
        role,
        assignedSites: null
      };
    } else {
      // Legacy fallback: `tbluser`
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

      if (user.Pass) {
        try {
          valid = await bcrypt.compare(password, user.Pass);
        } catch (error) {
          valid = false;
        }
        if (!valid) valid = String(user.Pass) === String(password);
      }
      if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

      const normalizedUser = String(user.User || '').trim().toLowerCase();
      const role = normalizedUser === 'portal_admin' ? 'super_admin' : 'viewer';
      safeUser = {
        userId: user.Uid,
        username: user.User,
        fullName: user.Fullname || user.User,
        role,
        assignedSites: null
      };
    }

    const token = jwt.sign(safeUser, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

    return res.json({ success: true, token, user: safeUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.userId,
      username: req.user.username,
      fullName: req.user.fullName,
      role: req.user.role,
      assignedSites: req.user.assignedSites
    }
  });
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
      province: site.province,
      type: site.type,
      database_name: site.database_name
    }));
    res.json(formatted);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
