const STORAGE_KEY = 'artweb_visualize_session_v1';

export function saveVisualizeSession(snapshot) {
  if (typeof sessionStorage === 'undefined' || !snapshot) return;
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...snapshot,
        savedAt: Date.now()
      })
    );
  } catch {
    /* quota or private mode */
  }
}

export function loadVisualizeSession() {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearVisualizeSession() {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
