const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return res.status(401).json({ success: false, message: 'Missing token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (error) {
    const expired = error?.name === 'TokenExpiredError';
    return res.status(401).json({
      success: false,
      message: expired ? 'Session expired' : 'Invalid token'
    });
  }
}

/** Check primary role slug or any assigned role slug from the database. */
function requireRole(allowedRoles) {
  const allowed = new Set((allowedRoles || []).map((r) => String(r).toLowerCase()));
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const slugs = new Set(
      [req.user.role, ...(req.user.roles || []).map((r) => r.slug)].filter(Boolean).map((s) => String(s).toLowerCase())
    );
    const ok = [...allowed].some((role) => slugs.has(role));
    if (!ok) {
      return res.status(403).json({
        success: false,
        message: `Insufficient permissions. Required roles: ${[...allowed].join(', ')}`
      });
    }
    return next();
  };
}

module.exports = { authenticateToken, requireRole };
