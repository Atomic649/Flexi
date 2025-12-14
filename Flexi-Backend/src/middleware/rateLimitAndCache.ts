import { NextFunction, Request, Response } from "express";

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
}

interface CacheEntry {
  expiry: number;
  payload: any;
}

const rateStore = new Map<string, { count: number; resetAt: number }>();
const cacheStore = new Map<string, CacheEntry>();

/**
 * Simple in-memory rate limiter. Suitable for single-instance deployments.
 */
export const rateLimiter = (options: RateLimitOptions = {}) => {
  const windowMs = options.windowMs ?? 60_000;
  const max = options.max ?? 60;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const existing = rateStore.get(key);

    if (!existing || existing.resetAt < now) {
      rateStore.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (existing.count >= max) {
      const retryAfter = Math.max(0, existing.resetAt - now) / 1000;
      res.setHeader("Retry-After", retryAfter.toFixed(0));
      return res.status(429).json({ message: "Too many requests, please slow down." });
    }

    existing.count += 1;
    rateStore.set(key, existing);
    next();
  };
};

/**
 * Simple in-memory response cache for GET endpoints. Suitable for single-instance deployments.
 */
export const cacheMiddleware = (ttlMs: number = 30_000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET") return next();

    const cacheKey = `${req.originalUrl}`;
    const now = Date.now();
    const entry = cacheStore.get(cacheKey);

    if (entry && entry.expiry > now) {
      return res.json(entry.payload);
    }

    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      cacheStore.set(cacheKey, { payload: body, expiry: now + ttlMs });
      return originalJson(body);
    };

    next();
  };
};
