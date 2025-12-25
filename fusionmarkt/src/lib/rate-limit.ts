/**
 * Simple In-Memory Rate Limiter
 * 
 * For production with multiple instances, consider:
 * - Redis-based rate limiting
 * - Cloudflare Rate Limiting (recommended - built-in DDoS protection)
 * 
 * This provides basic protection for single-instance deployments.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (resets on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically (every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number; // seconds until reset
}

/**
 * Check if request should be rate limited
 * 
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns RateLimitResult
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const key = identifier;

  let entry = rateLimitStore.get(key);

  // Create new entry if doesn't exist or expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, entry);
    
    return {
      success: true,
      remaining: config.limit - 1,
      resetIn: config.windowSeconds,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.limit) {
    const resetIn = Math.ceil((entry.resetTime - now) / 1000);
    return {
      success: false,
      remaining: 0,
      resetIn,
    };
  }

  // Increment counter
  entry.count += 1;
  rateLimitStore.set(key, entry);

  return {
    success: true,
    remaining: config.limit - entry.count,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
  };
}

/**
 * Get client IP from request headers
 * Works with Cloudflare, nginx, and direct connections
 */
export function getClientIP(headers: Headers): string {
  // Cloudflare
  const cfConnectingIP = headers.get("cf-connecting-ip");
  if (cfConnectingIP) return cfConnectingIP;

  // Standard proxy header
  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    // Take first IP (original client)
    return xForwardedFor.split(",")[0].trim();
  }

  // Real IP header (nginx)
  const xRealIP = headers.get("x-real-ip");
  if (xRealIP) return xRealIP;

  // Fallback
  return "unknown";
}

// ═══════════════════════════════════════════════════════════════════════════
// PRESET CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const RATE_LIMITS = {
  // Authentication endpoints - strict
  auth: {
    limit: 5,
    windowSeconds: 60, // 5 requests per minute
  },
  
  // Registration - very strict (prevent spam accounts)
  register: {
    limit: 3,
    windowSeconds: 300, // 3 requests per 5 minutes
  },
  
  // Password reset - strict
  passwordReset: {
    limit: 3,
    windowSeconds: 300, // 3 requests per 5 minutes
  },
  
  // Order creation - moderate
  order: {
    limit: 10,
    windowSeconds: 60, // 10 orders per minute
  },
  
  // General API - lenient
  api: {
    limit: 100,
    windowSeconds: 60, // 100 requests per minute
  },
  
  // Public endpoints - more lenient
  public: {
    limit: 200,
    windowSeconds: 60, // 200 requests per minute
  },
} as const;

