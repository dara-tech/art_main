/**
 * Run async tasks with a concurrency limit (lower RAM than Promise.all).
 */
async function runPool(items, concurrency, worker) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return [];
  const limit = Math.max(1, Number(concurrency) || 1);
  const results = new Array(list.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < list.length) {
      const i = nextIndex;
      nextIndex += 1;
      results[i] = await worker(list[i], i);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, list.length) }, () => runWorker()));
  return results;
}

module.exports = { runPool };
