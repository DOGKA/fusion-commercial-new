/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { 
  selectBannerPublic, 
  mapBannersToPublicDTO,
} from "@/server/dto";

/**
 * GET /api/public/banners
 * Public endpoint for frontend consumption
 * Returns only active banners with DTO mapping
 * 
 * Query params:
 * - placement: Filter by placement (optional)
 * - limit: Max results (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get("placement");
    const limit = searchParams.get("limit");

    // Build where clause
    const where: any = { isActive: true };
    if (placement) {
      where.placement = placement;
    }

    // Fetch with select preset (only public fields)
    const banners = await prisma.banner.findMany({
      where,
      select: selectBannerPublic,
      orderBy: { order: 'asc' },
      take: limit ? parseInt(limit) : undefined,
    });

    // Map to DTO (Enum → String conversion)
    const dto = mapBannersToPublicDTO(banners);

    // Cache strategy: s-maxage=60, stale-while-revalidate=300
    return NextResponse.json(dto, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: any) {
    console.error("❌ [PUBLIC API] Error fetching banners:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch banners",
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined 
      },
      { status: 500 }
    );
  }
}
