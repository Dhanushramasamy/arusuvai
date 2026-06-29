'use client';

// Client-side cache memory
const cacheMap = new Map<string, { data: any; timestamp: number }>();
const listenersMap = new Map<string, Set<(data: any) => void>>();

// Default time-to-live: 60 seconds
const DEFAULT_TTL = 60 * 1000;

/**
 * Perform a GET request with Stale-While-Revalidate caching.
 * @param url The endpoint to fetch.
 * @param onData Callback that receives the data (potentially called twice: first with cached, then with fresh).
 * @param options Additional options like bypassCache or custom ttl.
 */
export function swrFetch(
  url: string,
  onData: (data: any) => void,
  options?: { bypassCache?: boolean; ttl?: number }
) {
  const now = Date.now();
  const ttl = options?.ttl ?? DEFAULT_TTL;
  const bypass = options?.bypassCache ?? false;

  // Add listener for this URL to dispatch fresh updates to all active hooks/components
  if (!listenersMap.has(url)) {
    listenersMap.set(url, new Set());
  }
  listenersMap.get(url)!.add(onData);

  const cleanup = () => {
    const listeners = listenersMap.get(url);
    if (listeners) {
      listeners.delete(onData);
      if (listeners.size === 0) {
        listenersMap.delete(url);
      }
    }
  };

  // If cache exists and is not bypassed, return cached data immediately
  const cached = cacheMap.get(url);
  if (!bypass && cached) {
    onData(cached.data);
    // If cache is still fresh within TTL, don't trigger background fetch
    if (now - cached.timestamp < ttl) {
      return cleanup;
    }
  }

  // Trigger background fetch
  fetch(url)
    .then((res) => res.json())
    .then((json) => {
      if (json.success) {
        cacheMap.set(url, { data: json, timestamp: Date.now() });
        // Notify all current active listeners for this URL
        const listeners = listenersMap.get(url);
        if (listeners) {
          listeners.forEach((listener) => {
            try {
              listener(json);
            } catch (err) {
              console.error('Error in swrFetch listener:', err);
            }
          });
        }
      }
    })
    .catch((err) => {
      console.error(`Error background-fetching ${url}:`, err);
    });

  return cleanup;
}

/**
 * Invalidate specific cache keys or all keys matching a prefix.
 */
export function invalidateCache(urlPrefix?: string) {
  if (!urlPrefix) {
    cacheMap.clear();
  } else {
    for (const key of Array.from(cacheMap.keys())) {
      if (key.startsWith(urlPrefix)) {
        cacheMap.delete(key);
      }
    }
  }
}
