const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export type LoginLimitStatus = {
  allowed: boolean;
  retryAfterSeconds: number;
};

/**
 * Small in-memory login throttle. It is deliberately process-local: good
 * enough to slow a single-instance demo, but a production deployment should
 * use a shared store (Redis, or a platform rate limiter).
 */
export function getLoginLimitStatus(key: string, now = Date.now()): LoginLimitStatus {
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    if (bucket) buckets.delete(key);
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

export function recordLoginFailure(key: string, now = Date.now()): void {
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });

    // Keep the map from growing without bound in long-running processes.
    if (buckets.size > 1000) {
      for (const [storedKey, stored] of buckets) {
        if (stored.resetAt <= now) buckets.delete(storedKey);
      }
    }

    return;
  }

  bucket.count += 1;
}

export function clearLoginLimit(key: string): void {
  buckets.delete(key);
}

/** Test helper: forget every in-memory attempt. */
export function resetLoginLimits(): void {
  buckets.clear();
}
