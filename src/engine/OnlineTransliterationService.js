// Matra Keyboard — Online Transliteration Service
// Queries Google Input Tools endpoint with LRU caching, timeout guards, and retry backoff.

const CACHE_MAX_SIZE = 1000;
const onlineCache = new Map();

export async function fetchOnlineSuggestions(token, options = {}) {
  if (!token || typeof token !== 'string') return [];
  const cleanToken = token.trim();
  if (!cleanToken) return [];

  // 1. Check in-memory cache
  if (onlineCache.has(cleanToken)) {
    return onlineCache.get(cleanToken);
  }

  const timeoutMs = options.timeoutMs || 850;
  const maxRetries = options.retries !== undefined ? options.retries : 1;

  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const url = `https://inputtools.google.com/request?text=${encodeURIComponent(cleanToken)}&itc=bn-t-i0-und&num=5&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      // Format: ["SUCCESS", [["token", ["cand1", "cand2", "cand3", ...], ...]]]
      if (Array.isArray(data) && data[0] === 'SUCCESS' && Array.isArray(data[1])) {
        const item = data[1][0];
        if (item && Array.isArray(item[1])) {
          const candidates = item[1].slice(0, 5);
          
          // Cache successful result
          if (onlineCache.size >= CACHE_MAX_SIZE) {
            const firstKey = onlineCache.keys().next().value;
            onlineCache.delete(firstKey);
          }
          onlineCache.set(cleanToken, candidates);

          return candidates;
        }
      }
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        // Small backoff before retry
        await new Promise(r => setTimeout(r, 120));
      }
    }
  }

  throw lastError || new Error('Online transliteration unavailable');
}

export function clearOnlineCache() {
  onlineCache.clear();
}
