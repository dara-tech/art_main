/** Merge duplicate schema table rows from catalog API (same id repeated in schema.txt sections). */
export function dedupeSchemaTables(tables = []) {
  const byId = new Map();
  for (const t of tables) {
    const id = String(t?.id || t?.name || '').trim().toLowerCase();
    if (!id) continue;
    const prev = byId.get(id);
    if (!prev) {
      byId.set(id, { ...t, id, name: t.name || id });
      continue;
    }
    byId.set(id, {
      ...prev,
      ...t,
      id,
      name: t.name || id,
      analyzable: Boolean(prev.analyzable || t.analyzable),
      programId: prev.programId || t.programId,
      fieldCount: Math.max(Number(prev.fieldCount) || 0, Number(t.fieldCount) || 0)
    });
  }
  return [...byId.values()].sort((a, b) => String(a.name).localeCompare(String(b.name)));
}
