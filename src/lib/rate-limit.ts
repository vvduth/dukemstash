import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

// Lazy-initialize Redis client (fails open if not configured)
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

// Pre-configured rate limiters for each auth endpoint
const limiters = {
  login: () =>
    new Ratelimit({
      redis: getRedis()!,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      prefix: "rl:login",
    }),
  register: () =>
    new Ratelimit({
      redis: getRedis()!,
      limiter: Ratelimit.slidingWindow(3, "1 h"),
      prefix: "rl:register",
    }),
  forgotPassword: () =>
    new Ratelimit({
      redis: getRedis()!,
      limiter: Ratelimit.slidingWindow(3, "1 h"),
      prefix: "rl:forgot-password",
    }),
  resetPassword: () =>
    new Ratelimit({
      redis: getRedis()!,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      prefix: "rl:reset-password",
    }),
  resendVerification: () =>
    new Ratelimit({
      redis: getRedis()!,
      limiter: Ratelimit.slidingWindow(3, "15 m"),
      prefix: "rl:resend-verification",
    }),
} as const;

export type RateLimitType = keyof typeof limiters;

/**
 * Extract client IP from request headers.
 * Falls back to "unknown" if no IP header is found.
 */
function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

/**
 * Build rate limit key from IP and optional identifier (e.g. email).
 */
function buildKey(ip: string, identifier?: string): string {
  if (identifier) return `${ip}:${identifier}`;
  return ip;
}

/**
 * Format remaining seconds into a human-readable string.
 */
function formatRetryAfter(resetMs: number): { seconds: number; message: string } {
  const seconds = Math.ceil((resetMs - Date.now()) / 1000);
  const minutes = Math.ceil(seconds / 60);
  const message =
    minutes > 1
      ? `Too many attempts. Please try again in ${minutes} minutes.`
      : `Too many attempts. Please try again in ${seconds} seconds.`;
  return { seconds, message };
}

interface RateLimitResult {
  limited: false;
}

interface RateLimitedResult {
  limited: true;
  response: NextResponse;
}

/**
 * Check rate limit for a given endpoint type.
 * Fails open: if Redis is unavailable, the request is allowed through.
 *
 * @param type - The rate limiter to use (login, register, etc.)
 * @param request - The incoming request (for IP extraction)
 * @param identifier - Optional additional key (e.g. email) for tighter limits
 * @returns `{ limited: false }` if allowed, or `{ limited: true, response }` with a 429 response
 */
export async function checkRateLimit(
  type: RateLimitType,
  request: Request,
  identifier?: string
): Promise<RateLimitResult | RateLimitedResult> {
  try {
    const redisClient = getRedis();
    if (!redisClient) {
      // Fail open: no Redis configured
      return { limited: false };
    }

    const ip = getClientIp(request);
    const key = buildKey(ip, identifier);
    const limiter = limiters[type]();
    const { success, reset } = await limiter.limit(key);

    if (!success) {
      const { seconds, message } = formatRetryAfter(reset);
      return {
        limited: true,
        response: NextResponse.json(
          { error: message },
          {
            status: 429,
            headers: { "Retry-After": String(seconds) },
          }
        ),
      };
    }

    return { limited: false };
  } catch {
    // Fail open: if Upstash errors, allow the request
    return { limited: false };
  }
}
