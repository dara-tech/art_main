import patient360Api from './patient360Api';

const CACHE_KEY = 'p360_dict_v1';

let memory = null;
let inflight = null;

export async function getPatient360Dictionary() {
  if (memory) return memory;

  const cached = sessionStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      memory = JSON.parse(cached);
      return memory;
    } catch {
      sessionStorage.removeItem(CACHE_KEY);
    }
  }

  if (!inflight) {
    inflight = patient360Api
      .getDictionary()
      .then((dict) => {
        memory = dict;
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(dict));
        } catch {
          /* quota — keep in memory only */
        }
        return dict;
      })
      .finally(() => {
        inflight = null;
      });
  }

  return inflight;
}
