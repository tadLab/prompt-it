// Best-effort, zero-infra rate limiter.
//
// Uses an in-process Map, so on serverless it only sees traffic that lands on
// the same warm instance — good enough to stop refresh-loops and casual abuse
// of the (unauthenticated, paid) generation endpoints. For real protection at
// scale, swap `hit()` for a shared store (Upstash Redis / Vercel KV); the
// call sites and the RateLimitResult contract stay identical.

interface Bucket {
  count: number;
  resetAt: number; // epoch ms
}

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 10_000; // safety cap so the map can't grow unbounded

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSec: number;
}

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

/**
 * Fixed-window counter. Pure and deterministic given `now`, so it's unit
 * testable. Returns whether the request is allowed plus headroom info.
 */
export function rateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
  now: number = Date.now()
): RateLimitResult {
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    if (buckets.size > MAX_KEYS) pruneExpired(now);
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limit - 1, resetAt, retryAfterSec: 0 };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return {
    ok: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
    retryAfterSec: 0,
  };
}

function pruneExpired(now: number) {
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
}

/** Best-effort client identity from proxy headers (Vercel sets x-forwarded-for). */
export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  return ip;
}

/** Standard 429 response with a Retry-After header. */
export function tooManyRequests(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({ error: "Too many requests. Please slow down." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(result.retryAfterSec),
        "X-RateLimit-Remaining": String(result.remaining),
      },
    }
  );
}

// For tests only — reset the in-memory state between cases.
export function __resetRateLimit() {
  buckets.clear();
}
