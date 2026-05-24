const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { assertResolvedSiteAccess } = require('../services/userRoleService');
const { siteDatabaseManager } = require('../config/siteDatabase');
const {
  inferSiteLevel,
  isFacilitySite,
  resolveFacilityCodesByHierarchy,
  provinceIdFromCode
} = require('../utils/reportAggregation');
const visualizeService = require('../services/visualizeService');

const router = express.Router();

async function resolveSiteContext(req) {
  const sites = await siteDatabaseManager.getAllSitesForManagement();
  const scopeMode = String(req.body?.scopeMode || req.query?.scopeMode || 'rollup').toLowerCase();
  const compareSiteCodes = [...new Set((Array.isArray(req.body?.compareSiteCodes) ? req.body.compareSiteCodes : [])
    .map(String)
    .map((c) => c.trim())
    .filter(Boolean))];

  if (scopeMode === 'compare') {
    if (!compareSiteCodes.length) {
      return { error: 'Select at least one site to compare', status: 400 };
    }
    if (compareSiteCodes.length > visualizeService.VISUALIZE_MAX_COMPARE_FACILITIES) {
      return {
        error: `Maximum ${visualizeService.VISUALIZE_MAX_COMPARE_FACILITIES} items per compare run`,
        status: 400
      };
    }

    const isProvinceCode = (code) => String(code).startsWith('province:');
    const allProvince = compareSiteCodes.every(isProvinceCode);
    const allFacility = compareSiteCodes.every((code) => {
      const selected = sites.find((s) => String(s.code) === code);
      return isFacilitySite(selected);
    });
    if (!allProvince && !allFacility) {
      return { error: 'Compare must use all facilities or all provinces (not mixed)', status: 400 };
    }

    const compareLevel = allProvince ? 'province' : 'facility';
    const resolvedForAccess = [];

    if (compareLevel === 'province') {
      for (const code of compareSiteCodes) {
        const provinceId = provinceIdFromCode(code);
        if (!provinceId) {
          return { error: `Invalid province code: ${code}`, status: 400 };
        }
        const facilityCodes = resolveFacilityCodesByHierarchy(sites, code, 'province');
        if (!facilityCodes.length) {
          return { error: `No facilities found for province: ${code}`, status: 400 };
        }
        resolvedForAccess.push(...facilityCodes);
      }
    } else {
      for (const code of compareSiteCodes) {
        const selected = sites.find((s) => String(s.code) === code);
        if (!isFacilitySite(selected)) {
          return { error: `Not a facility site: ${code}`, status: 400 };
        }
        resolvedForAccess.push(code);
      }
    }

    const access = assertResolvedSiteAccess(req.user, compareSiteCodes[0], {
      resolvedSiteCodes: [...new Set(resolvedForAccess)]
    });
    if (!access.ok) {
      return { error: access.message || 'Access denied for this site', status: 403 };
    }
    return {
      scopeMode: 'compare',
      compareLevel,
      siteCode: compareSiteCodes[0],
      siteLevel: compareLevel === 'province' ? 'province' : 'facility',
      compareSiteCodes,
      sites
    };
  }

  const siteCode = String(req.body?.siteCode || req.query?.siteCode || '').trim();
  if (!siteCode) return { error: 'siteCode is required', status: 400 };
  const selected = sites.find((s) => String(s.code) === siteCode);
  const siteLevel = String(req.body?.siteLevel || req.query?.siteLevel || inferSiteLevel(siteCode, selected)).toLowerCase();

  if (siteLevel === 'facility') {
    if (selected && !isFacilitySite(selected)) {
      return { error: 'Select a facility site code (not province or country rollup).', status: 400 };
    }
    const access = assertResolvedSiteAccess(req.user, siteCode, { resolvedSiteCodes: [siteCode] });
    if (!access.ok) {
      return { error: access.message || 'Access denied for this site', status: 403 };
    }
    return { scopeMode: 'rollup', siteCode, siteLevel: 'facility', compareSiteCodes: [], sites };
  }

  const resolvedSiteCodes = resolveFacilityCodesByHierarchy(sites, siteCode, siteLevel);
  const allowAll =
    siteLevel === 'country' &&
    (String(siteCode).toLowerCase() === 'all' || String(siteCode) === '__CAMBODIA__');
  const access = assertResolvedSiteAccess(req.user, siteCode, {
    allowAll,
    resolvedSiteCodes: resolvedSiteCodes.length ? resolvedSiteCodes : [siteCode]
  });
  if (!access.ok) {
    return { error: access.message || 'Access denied for this site', status: 403 };
  }

  if (siteLevel === 'province' && resolvedSiteCodes.length > visualizeService.VISUALIZE_MAX_ROLLUP_FACILITIES) {
    return {
      error: `Too many facilities (${resolvedSiteCodes.length}). Max ${visualizeService.VISUALIZE_MAX_ROLLUP_FACILITIES} for province rollup.`,
      status: 400
    };
  }

  return {
    scopeMode: 'rollup',
    siteCode,
    siteLevel,
    compareSiteCodes: [],
    resolvedSiteCodes,
    sites
  };
}

router.get('/catalog', authenticateToken, async (_req, res) => {
  try {
    const indicators = visualizeService.getCatalog();
    res.json({
      success: true,
      readOnly: true,
      indicators,
      limits: {
        maxPeriods: visualizeService.VISUALIZE_MAX_PERIODS,
        maxIndicators: visualizeService.VISUALIZE_MAX_INDICATORS,
        maxRuns: visualizeService.VISUALIZE_MAX_RUNS,
        maxCompareFacilities: visualizeService.VISUALIZE_MAX_COMPARE_FACILITIES,
        maxRollupFacilities: visualizeService.VISUALIZE_MAX_ROLLUP_FACILITIES
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/run', authenticateToken, async (req, res) => {
  try {
    const ctx = await resolveSiteContext(req);
    if (ctx.error) return res.status(ctx.status).json({ success: false, message: ctx.error });
    const payload = await visualizeService.runBatch(ctx, {
      periods: req.body?.periods,
      indicatorIds: req.body?.indicatorIds
    });
    res.json(payload);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message });
  }
});

router.post('/run/stream', authenticateToken, async (req, res) => {
  try {
    const ctx = await resolveSiteContext(req);
    if (ctx.error) return res.status(ctx.status).json({ success: false, message: ctx.error });

    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    const write = (payload) => {
      res.write(`${JSON.stringify(payload)}\n`);
    };

    await visualizeService.runBatchStream(
      ctx,
      { periods: req.body?.periods, indicatorIds: req.body?.indicatorIds },
      write
    );
    res.end();
  } catch (error) {
    if (!res.headersSent) {
      const status = error.statusCode || 500;
      return res.status(status).json({ success: false, message: error.message });
    }
    res.write(`${JSON.stringify({ type: 'error', message: error.message })}\n`);
    res.end();
  }
});

module.exports = router;
