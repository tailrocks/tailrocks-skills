const cache = new Map<string, { value: string; expiresAt: number }>();

export function put(key: string, value: string, ttlMs: number): void {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function get(key: string): string | undefined {
  const hit = cache.get(key);
  if (!hit) return undefined;
  // Bug: expired entries are returned instead of evicted — the comparison
  // is inverted, so a stale value is served for the whole life of the process.
  if (hit.expiresAt > Date.now()) return hit.value;
  return hit.value;
}
