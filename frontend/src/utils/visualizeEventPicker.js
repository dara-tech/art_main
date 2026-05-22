import { ART_EVENT_GROUPS, INFANT_EVENT_GROUP_TITLE, PNTT_EVENT_GROUP_TITLE } from '../constants/indicatorEventTemplates';
import { labelForIndicatorId } from '../constants/indicatorLabels';
import { indicatorSortKey } from './visualizeChartData';

function labelForCatalogItem(item) {
  return labelForIndicatorId(item.id, item.id, item.label);
}

function matchesSearch(item, q) {
  if (!q) return true;
  const hay = `${item.label} ${item.id}`.toLowerCase();
  return hay.includes(q);
}

function sortEvents(events) {
  return [...events].sort((a, b) => {
    const ka = indicatorSortKey(a.id, a.label);
    const kb = indicatorSortKey(b.id, b.label);
    const len = Math.max(ka.length, kb.length);
    for (let i = 0; i < len; i += 1) {
      const diff = (ka[i] ?? 0) - (kb[i] ?? 0);
      if (diff !== 0) return diff;
    }
    return 0;
  });
}

function artEventGroups(catalogIds, q) {
  const groups = [];
  for (const g of ART_EVENT_GROUPS) {
    const events = sortEvents(
      g.indicatorIds
        .filter((id) => catalogIds.has(id))
        .map((id) => ({ id, label: labelForIndicatorId(id) }))
        .filter((e) => matchesSearch(e, q))
    );
    if (events.length) groups.push({ key: `art:${g.id}`, title: g.labelKh, events });
  }
  return groups;
}

function programEventGroup(catalog, program, titlePrefix, catalogIds, q) {
  const items = catalog
    .filter((c) => c.program === program)
    .map((c) => ({ id: c.id, label: labelForCatalogItem(c), chapter: String(c.chapter || '').trim() }))
    .filter((e) => catalogIds.has(e.id) && matchesSearch(e, q));

  if (!items.length) return [];

  const byChapter = new Map();
  items.forEach((item) => {
    const ch = item.chapter || 'other';
    if (!byChapter.has(ch)) byChapter.set(ch, []);
    byChapter.get(ch).push(item);
  });

  const chapters = [...byChapter.keys()].sort((a, b) => {
    const na = Number(a);
    const nb = Number(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    return String(a).localeCompare(String(b));
  });

  return chapters.map((ch) => ({
    key: `${program}:${ch}`,
    title: `${titlePrefix} — ${ch}`,
    events: sortEvents(byChapter.get(ch).map(({ id, label }) => ({ id, label })))
  }));
}

/**
 * Event-report picker: curated clinical groups (no DB table list).
 */
export function buildEventPickerGroups(catalog = [], { programFilter = 'all', search = '' } = {}) {
  const catalogIds = new Set(catalog.map((c) => c.id));
  const q = String(search || '')
    .trim()
    .toLowerCase();
  const groups = [];

  if (programFilter === 'all' || programFilter === 'adult-child') {
    groups.push(...artEventGroups(catalogIds, q));
  }
  if (programFilter === 'all' || programFilter === 'infant') {
    groups.push(...programEventGroup(catalog, 'infant', INFANT_EVENT_GROUP_TITLE, catalogIds, q));
  }
  if (programFilter === 'all' || programFilter === 'pntt') {
    groups.push(...programEventGroup(catalog, 'pntt', PNTT_EVENT_GROUP_TITLE, catalogIds, q));
  }

  return groups;
}

export function eventIdsForProgram(catalog, programFilter) {
  return buildEventPickerGroups(catalog, { programFilter, search: '' }).flatMap((g) =>
    g.events.map((e) => e.id)
  );
}
