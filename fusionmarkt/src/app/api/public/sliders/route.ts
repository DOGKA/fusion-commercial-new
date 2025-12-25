import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { 
  selectSliderPublic, 
  mapSlidersToPublicDTO,
  filterActiveSliders,
} from "@/server/dto";

/**
 * GET /api/public/sliders
 * Public endpoint for frontend consumption
 * Returns only active sliders with DTO mapping
 * Filters by date range and device visibility
 * 
 * Query params:
 * - device: 'mobile' | 'desktop' (optional)
 * - limit: Max results (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const device = searchParams.get("device") as 'mobile' | 'desktop' | null;
    const limit = searchParams.get("limit");

    // Fetch active sliders
    const sliders = await prisma.slider.findMany({
      where: { isActive: true },
      select: selectSliderPublic,
      orderBy: { order: 'asc' },
      take: limit ? parseInt(limit) : undefined,
    });

    // Map to DTO
    let dto = mapSlidersToPublicDTO(sliders);

    // Filter by device and date range
    if (device) {
      dto = filterActiveSliders(dto, device);
    }

    // Cache strategy: s-maxage=60, stale-while-revalidate=300
    return NextResponse.json(dto, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: any) {
    console.error("❌ [PUBLIC API] Error fetching sliders:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch sliders",
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined 
      },
      { status: 500 }
    );
  }
}
