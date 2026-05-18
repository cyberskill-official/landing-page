type RateBucket = {
  count: number;
  resetAt: number;
};

type IdempotencyEntry = {
  leadId: string;
  resetAt: number;
};

const buckets = new Map<string, RateBucket>();
const idempotencyCache = new Map<string, IdempotencyEntry>();

export function checkRateLimit(key: string, limit = 5, windowSec = 60, now = Date.now()) {
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return { ok: true as const, remaining: limit - 1, retryAfter: 0 };
  }

  if (bucket.count >= limit) {
    return {
      ok: false as const,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return {
    ok: true as const,
    remaining: Math.max(0, limit - bucket.count),
    retryAfter: 0,
  };
}

export function getCachedLeadId(key: string, now = Date.now()) {
  const entry = idempotencyCache.get(key);
  if (!entry) return null;
  if (now >= entry.resetAt) {
    idempotencyCache.delete(key);
    return null;
  }
  return entry.leadId;
}

export function cacheLeadId(key: string, leadId: string, ttlSec = 60, now = Date.now()) {
  idempotencyCache.set(key, { leadId, resetAt: now + ttlSec * 1000 });
}

export function resetLeadRateLimitState() {
  buckets.clear();
  idempotencyCache.clear();
}
