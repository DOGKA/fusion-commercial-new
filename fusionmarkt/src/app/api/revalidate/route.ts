import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

// Simple in-memory rate limit (per IP per 60s)
const rateLimitMap = new Map<string, { count: number; ts: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20; // max 20 calls per window

const ALLOWED_TAGS = new Set([
  "banners",
  "sliders",
  "products",
  "categories",
  "homepage",
]);

/**
 * On-Demand Revalidation Endpoint
 * Admin panel banner/slider kaydettiğinde bu endpoint'i çağırarak
 * frontend cache'ini anında temizler
 * 
 * Usage:
 * POST /api/revalidate
 * Headers: { 'x-revalidate-secret': 'your-secret' }
 * Body: { tags: ["banners", "sliders"], path: "/" }
 */
export async function POST(request: NextRequest) {
  try {
    // ✅ Security: Check secret from header (REQUIRED in production)
    const secret = request.headers.get('x-revalidate-secret');
    const expectedSecret = process.env.REVALIDATE_SECRET;
    
    // Block requests without proper secret configuration
    if (!expectedSecret) {
      console.error('❌ REVALIDATE_SECRET not configured!');
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }
    
    if (secret !== expectedSecret) {
      console.warn('⚠️  Revalidation attempt with invalid secret from IP:', 
        request.headers.get("x-forwarded-for") || "unknown");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit by IP
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now - entry.ts > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.set(ip, { count: 1, ts: now });
    } else if (entry.count >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    } else {
      entry.count += 1;
      rateLimitMap.set(ip, entry);
    }

    const body = await request.json();
    const { path, tag, tags } = body;

    // Validate tags against whitelist
    const tagList: string[] = [];
    if (tag) tagList.push(tag);
    if (Array.isArray(tags)) tagList.push(...tags);
    if (
      tagList.length > 0 &&
      !tagList.every((t) => ALLOWED_TAGS.has(t))
    ) {
      return NextResponse.json(
        { error: "Invalid tag", allowed: Array.from(ALLOWED_TAGS) },
        { status: 400 }
      );
    }

    // Revalidate by path
    if (path) {
      revalidatePath(path);
      console.log(`✅ Revalidated path: ${path}`);
    }

    // Revalidate by tag (single)
    if (tag) {
      revalidateTag(tag);
      console.log(`✅ Revalidated tag: ${tag}`);
    }

    // Revalidate by tags (array)
    if (tags && Array.isArray(tags)) {
      tags.forEach(t => revalidateTag(t));
      console.log(`✅ Revalidated tags: ${tags.join(', ')}`);
    }

    // If no path or tags provided, revalidate common paths
    if (!path && !tag && !tags) {
      revalidatePath("/");
      revalidatePath("/magaza");
      revalidateTag("banners");
      revalidateTag("sliders");
      revalidateTag("homepage");
      console.log("✅ Revalidated: /, /magaza, banners, sliders, homepage");
    }

    return NextResponse.json(
      {
        revalidated: true,
        now: Date.now(),
        path,
        tag,
        tags: tagList.length ? tagList : undefined,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error: unknown) {
    console.error("Revalidation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Revalidation failed";
    return NextResponse.json(
      {
        revalidated: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

// Only POST allowed
export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
