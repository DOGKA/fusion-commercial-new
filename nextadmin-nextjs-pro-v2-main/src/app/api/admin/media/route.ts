import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { CreateMediaSchema } from "@/server/validation/media.validation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

// 🔒 Yetkilendirme kontrolü helper
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { authorized: false, error: "Yetkilendirme gerekli", status: 401 };
  }
  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    return { authorized: false, error: "Bu işlem için yetkiniz yok", status: 403 };
  }
  return { authorized: true, session };
}

/**
 * POST /api/admin/media
 * Create media record in DB after successful S3 upload
 * alt text is REQUIRED for SEO
 */
export async function POST(request: NextRequest) {
  try {
    // 🔒 Yetkilendirme kontrolü
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();

    // Validate with zod (matches @repo/db Media model)
    const validated = CreateMediaSchema.parse(body);

    // Create media record
    const media = await prisma.media.create({
      data: validated,
    });

    console.log(`✅ Media record created: ${media.id} (usage: ${validated.usage})`);

    return NextResponse.json(media, { status: 201 });
  } catch (error: any) {
    console.error("❌ [MEDIA API] Create error:", error);

    // Zod validation error
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create media record", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/media
 * List media with filters and pagination
 * 
 * Query params:
 * - usage: Filter by usage (BANNER, SLIDER, PRODUCT, CATEGORY, OTHER)
 * - limit: Max results (default 100)
 * - offset: Pagination offset
 */
export async function GET(request: NextRequest) {
  try {
    // 🔒 Yetkilendirme kontrolü
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const usage = searchParams.get("usage");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Validate limit
    const safeLimit = isNaN(limit) ? 100 : Math.min(limit, 500);
    const safeOffset = isNaN(offset) ? 0 : Math.max(offset, 0);

    // Build where clause
    const where: any = {};
    if (usage && usage !== "ALL") {
      where.usage = usage;
    }

    // Fetch media
    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: safeLimit,
        skip: safeOffset,
      }),
      prisma.media.count({ where }),
    ]);

    return NextResponse.json({
      media,
      total,
      limit: safeLimit,
      offset: safeOffset,
    });
  } catch (error: any) {
    console.error("❌ [MEDIA API] List error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch media",
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
        media: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}
