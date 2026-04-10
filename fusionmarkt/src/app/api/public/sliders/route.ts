import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { 
  selectSliderPublic, 
  mapSlidersToPublicDTO,
  filterActiveSliders,
} from "@/server/dto";

export const dynamic = "force-dynamic";

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

    return NextResponse.json(dto);
  } catch (error: unknown) {
    console.error("❌ [PUBLIC API] Error fetching sliders:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { 
        error: "Failed to fetch sliders",
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined 
      },
      { status: 500 }
    );
  }
}
