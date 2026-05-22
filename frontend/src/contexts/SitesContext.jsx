import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import siteApi from '../services/siteApi';

const SitesContext = createContext(null);

const CACHE_MS = 30 * 60 * 1000;
let moduleCache = null;
let moduleCacheAt = 0;
let inflight = null;

async function fetchSitesOnce() {
  const now = Date.now();
  if (moduleCache && moduleCacheAt + CACHE_MS > now) {
    return moduleCache;
  }
  if (inflight) return inflight;
  inflight = siteApi
    .getAllSites()
    .then((data) => {
      const rows = Array.isArray(data) ? data : data?.sites || data?.data || [];
      moduleCache = rows;
      moduleCacheAt = Date.now();
      inflight = null;
      return rows;
    })
    .catch((error) => {
      inflight = null;
      throw error;
    });
  return inflight;
}

export function SitesProvider({ children }) {
  const [sites, setSites] = useState(moduleCache || []);
  const [loading, setLoading] = useState(!moduleCache?.length);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    moduleCache = null;
    moduleCacheAt = 0;
    setLoading(true);
    setError('');
    try {
      const rows = await fetchSitesOnce();
      setSites(rows);
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Failed to load sites');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetchSitesOnce()
      .then((rows) => {
        if (active) setSites(rows);
      })
      .catch((e) => {
        if (active) setError(e.response?.data?.error || e.message || 'Failed to load sites');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => ({ sites, loading, error, refresh }), [sites, loading, error, refresh]);

  return <SitesContext.Provider value={value}>{children}</SitesContext.Provider>;
}

export function useSites() {
  const ctx = useContext(SitesContext);
  if (!ctx) {
    throw new Error('useSites must be used inside SitesProvider');
  }
  return ctx;
}

/** Use cached sites when provider is not mounted (fallback). */
export async function getCachedSites() {
  return fetchSitesOnce();
}
