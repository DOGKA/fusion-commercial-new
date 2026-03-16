import { NextRequest, NextResponse } from "next/server";
import { prisma, BannerType, BannerPlacement } from "@repo/db";
import { CreateBannerSchema } from "@/server/validation/banner.validation";
import { revalidateTag } from "next/cache";
import { revalidateBanners } from "@/lib/revalidate-frontend";
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
 * GET /api/admin/banners
 * List all banners with optional filters
 * 
 * Query params:
 * - type: Filter by bannerType
 * - placement: Filter by placement
 * - active: Filter by isActive (true/false)
 * - limit: Max results (default 50)
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
    const type = searchParams.get("type");
    const placement = searchParams.get("placement");
    const active = searchParams.get("active");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build where clause
    const where: any = {};
    if (type) where.bannerType = type;
    if (placement) where.placement = placement;
    if (active !== null && active !== undefined) {
      where.isActive = active === "true";
    }

    // Fetch banners with cards
    const [banners, total] = await Promise.all([
      prisma.banner.findMany({
        where,
        include: {
          cards: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        take: limit,
        skip: offset,
      }),
      prisma.banner.count({ where }),
    ]);

    return NextResponse.json({
      banners,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("❌ [BANNERS API] List error:", error);
    return NextResponse.json(
      { error: "Failed to fetch banners" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/banners
 * Create a new banner with optional cards
 */
export async function POST(request: NextRequest) {
  try {
    // 🔒 Yetkilendirme kontrolü
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();

    // Validate with zod
    const validated = CreateBannerSchema.parse(body);

    // Separate cards from banner data
    const { cards, ...bannerData } = validated;

    // Create banner
    const banner = await prisma.banner.create({
      data: {
        ...bannerData,
        bannerType: bannerData.bannerType as BannerType,
        placement: bannerData.placement as BannerPlacement,
        cards: cards
          ? {
              create: cards.map((card, index) => ({
                ...card,
                order: card.order ?? index,
              })),
            }
          : undefined,
      },
      include: {
        cards: {
          orderBy: { order: "asc" },
        },
      },
    });

    console.log(`✅ Banner created: ${banner.id} (${banner.name})`);

    // Revalidate admin cache
    revalidateTag("banners");
    if (
      banner.placement === "HOME_HERO" ||
      banner.placement === "HOME_CATEGORY" ||
      banner.placement === "HOME_PROMO" ||
      banner.placement === "HOME_BOTTOM"
    ) {
      revalidateTag("homepage");
    }

    // Revalidate frontend (fusionmarkt) cache
    await revalidateBanners(banner.placement);

    return NextResponse.json(banner, { status: 201 });
  } catch (error: any) {
    console.error("❌ [BANNERS API] Create error:", error);

    // Zod validation error
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create banner" },
      { status: 500 }
    );
  }
}
