import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma } from "@repo/db";
import { 
  selectBannerPublic, 
  mapBannersToPublicDTO,
} from "@/server/dto";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get("placement");
    const limit = searchParams.get("limit");

    // Build where clause
    const where: Prisma.BannerWhereInput = { isActive: true };
    if (placement) {
      where.placement = placement as Prisma.EnumBannerPlacementFilter;
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

    return NextResponse.json(dto);
  } catch (error: unknown) {
    console.error("❌ [PUBLIC API] Error fetching banners:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { 
        error: "Failed to fetch banners",
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined 
      },
      { status: 500 }
    );
  }
}
