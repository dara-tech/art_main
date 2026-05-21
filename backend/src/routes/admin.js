const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const adminService = require('../services/adminService');
const { roleNameToSlug } = require('../services/userRoleService');

const router = express.Router();

router.use(authenticateToken, requireRole(['admin']));

function handleError(res, error) {
  const status = error.statusCode || 500;
  res.status(status).json({ success: false, message: error.message });
}

router.get('/stats', async (_req, res) => {
  try {
    const stats = await adminService.getAdminStats();
    res.json({ success: true, stats });
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/roles', async (_req, res) => {
  try {
    const rows = await adminService.listAllRoles();
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
    handleError(res, error);
  }
});

router.get('/sites', async (_req, res) => {
  try {
    const sites = await adminService.listSitesForPicker();
    res.json({
      success: true,
      count: sites.length,
      sites: sites.map((s) => ({
        id: s.id,
        code: s.code,
        name: s.site_name ? String(s.site_name).trim() : s.code,
        provinceId: s.province_id,
        odCode: s.od_code
      }))
    });
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/provinces', async (_req, res) => {
  try {
    const rows = await adminService.listProvincesForPicker();
    res.json({
      success: true,
      count: rows.length,
      provinces: rows.map((p) => ({
        id: Number(p.id),
        siteCount: Number(p.site_count || 0)
      }))
    });
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/ods', async (_req, res) => {
  try {
    const rows = await adminService.listOdsForPicker();
    res.json({
      success: true,
      count: rows.length,
      ods: rows.map((o) => ({
        code: o.code,
        siteCount: Number(o.site_count || 0)
      }))
    });
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/users', async (req, res) => {
  try {
    const result = await adminService.listUsers({
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search
    });
    res.json({ success: true, ...result });
  } catch (error) {
    handleError(res, error);
  }
});

router.post('/users', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'username and password are required' });
    }
    const user = await adminService.createUser(req.body || {});
    res.status(201).json({ success: true, user });
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/users/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (!Number.isFinite(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }
    const user = await adminService.getUserAdminDetail(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    handleError(res, error);
  }
});

router.put('/users/:userId/password', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const { password } = req.body || {};
    if (!password) {
      return res.status(400).json({ success: false, message: 'password is required' });
    }
    const user = await adminService.changeUserPassword(userId, password);
    res.json({ success: true, user });
  } catch (error) {
    handleError(res, error);
  }
});

router.put('/users/:userId/status', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const user = await adminService.updateUserStatus(userId, req.body?.statusId ?? (req.body?.active ? 1 : 0));
    res.json({ success: true, user });
  } catch (error) {
    handleError(res, error);
  }
});

router.post('/users/:userId/roles', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const roleId = Number(req.body?.roleId);
    if (!Number.isFinite(roleId)) {
      return res.status(400).json({ success: false, message: 'roleId is required' });
    }
    const user = await adminService.assignUserRole(userId, roleId, req.user.userId);
    res.json({ success: true, user });
  } catch (error) {
    handleError(res, error);
  }
});

router.delete('/users/:userId/roles/:assignmentId', async (req, res) => {
  try {
    const assignmentId = Number(req.params.assignmentId);
    const user = await adminService.removeUserRole(assignmentId, req.user.userId);
    res.json({ success: true, user });
  } catch (error) {
    handleError(res, error);
  }
});

router.delete('/users/:userId/org-units', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const user = await adminService.clearUserOrgUnits(userId);
    res.json({ success: true, user });
  } catch (error) {
    handleError(res, error);
  }
});

router.post('/users/:userId/org-units', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const user = await adminService.addUserOrgUnit(userId, req.body || {});
    res.json({ success: true, user });
  } catch (error) {
    handleError(res, error);
  }
});

router.delete('/users/:userId/org-units/:orgUnitId', async (req, res) => {
  try {
    const orgUnitId = Number(req.params.orgUnitId);
    const user = await adminService.removeUserOrgUnit(orgUnitId);
    res.json({ success: true, user });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
