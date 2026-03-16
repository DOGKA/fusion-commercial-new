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
  
  // Cancellation request - strict (per user)
  cancellationRequestUser: {
    limit: 2,
    windowSeconds: 3600, // 2 requests per hour
  },
  
  // Cancellation request - strict (per IP)
  cancellationRequestIp: {
    limit: 3,
    windowSeconds: 3600, // 3 requests per hour
  },
  
  // Return request - moderate (per user)
  returnRequestUser: {
    limit: 5,
    windowSeconds: 3600, // 5 requests per hour
  },
  
  // Return request - moderate (per IP)
  returnRequestIp: {
    limit: 8,
    windowSeconds: 3600, // 8 requests per hour
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// IP BAN CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const BAN_DURATIONS = {
  // Soft ban for cancellation abuse (3 hours)
  cancellationAbuse: 3 * 60 * 60 * 1000, // 3 hours in ms
  
  // Order creation block after cancellation abuse (3 hours)
  orderCreationBlock: 3 * 60 * 60 * 1000, // 3 hours in ms
} as const;

// In-memory IP ban store (for quick checks, backed by database)
const ipBanStore = new Map<string, { bannedUntil: number; reason: string }>();

/**
 * Check if an IP is banned
 */
export function isIpBanned(ip: string): { banned: boolean; reason?: string; bannedUntil?: Date } {
  const ban = ipBanStore.get(ip);
  
  if (!ban) {
    return { banned: false };
  }
  
  const now = Date.now();
  
  if (now > ban.bannedUntil) {
    // Ban expired, remove it
    ipBanStore.delete(ip);
    return { banned: false };
  }
  
  return {
    banned: true,
    reason: ban.reason,
    bannedUntil: new Date(ban.bannedUntil),
  };
}

/**
 * Ban an IP address
 */
export function banIp(ip: string, durationMs: number, reason: string): void {
  const bannedUntil = Date.now() + durationMs;
  ipBanStore.set(ip, { bannedUntil, reason });
}

/**
 * Unban an IP address
 */
export function unbanIp(ip: string): void {
  ipBanStore.delete(ip);
}

/**
 * Get remaining ban time in human readable format
 */
export function getBanTimeRemaining(bannedUntil: Date): string {
  const now = Date.now();
  const remaining = bannedUntil.getTime() - now;
  
  if (remaining <= 0) return "0 dakika";
  
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.ceil((remaining % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours} saat ${minutes} dakika`;
  }
  return `${minutes} dakika`;
}

