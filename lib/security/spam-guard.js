const requestBuckets = new Map();

export function isLikelySpam({ honeypotValue, startedAt }) {
  if (honeypotValue) return true;

  if (startedAt === undefined || startedAt === null || startedAt === "") {
    return false;
  }

  const parsed = Number(startedAt);
  if (!Number.isFinite(parsed)) return true;

  const elapsedMs = Date.now() - parsed;
  return elapsedMs < 4000;
}

export function isRateLimited({ key, limit = 6, windowMs = 60_000 }) {
  const now = Date.now();
  const history = requestBuckets.get(key) || [];
  const recent = history.filter((timestamp) => now - timestamp <= windowMs);

  if (recent.length >= limit) return true;

  recent.push(now);
  requestBuckets.set(key, recent);
  return false;
}
