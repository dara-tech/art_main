export function userRoleSlugs(user) {
  if (!user) return [];
  const slugs = [user.role, ...(user.roles || []).map((r) => r.slug)].filter(Boolean);
  return [...new Set(slugs.map((s) => String(s).toLowerCase()))];
}

export function isAdmin(user) {
  return userRoleSlugs(user).includes('admin');
}

export function hasRole(user, roleSlug) {
  return userRoleSlugs(user).includes(String(roleSlug).toLowerCase());
}

export function isGuest(user) {
  const slugs = userRoleSlugs(user);
  return slugs.length === 0 || (slugs.length === 1 && slugs[0] === 'guest');
}
