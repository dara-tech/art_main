let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = typeof handler === 'function' ? handler : null;
}

export function clearAuthStorage() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function handleUnauthorized() {
  clearAuthStorage();
  onUnauthorized?.();
}

export function isUnauthorizedResponse(status) {
  return status === 401 || status === 403;
}
