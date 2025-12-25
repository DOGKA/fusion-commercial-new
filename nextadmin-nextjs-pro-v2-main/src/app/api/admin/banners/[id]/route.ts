import { NextRequest, NextResponse } from "next/server";
import { prisma, BannerType, BannerPlacement } from "@repo/db";
import { UpdateBannerSchema } from "@/server/validation/banner.validation";
import { revalidateTag } from "next/cache";
import { revalidateBanners } from "@/lib/revalidate-frontend";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/banners/[id]
 * Get a single banner by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const banner = await prisma.banner.findUnique({
      where: { id },
      include: {
        cards: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!banner) {
      return NextResponse.json(
        { error: "Banner not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.error("❌ [BANNERS API] Get error:", error);
    return NextResponse.json(
      { error: "Failed to fetch banner" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/banners/[id]
 * Update a banner and its cards
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if banner exists
    const existing = await prisma.banner.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Banner not found" },
        { status: 404 }
      );
    }

    // Validate with zod
    const validated = UpdateBannerSchema.parse(body);

    // Separate cards from banner data
    const { cards, ...bannerData } = validated;

    // Update banner with transaction
    const banner = await prisma.$transaction(async (tx) => {
      // If cards are provided, delete existing and create new
      if (cards !== undefined) {
        await tx.bannerCard.deleteMany({
          where: { bannerId: id },
        });

        if (cards.length > 0) {
          await tx.bannerCard.createMany({
            data: cards.map((card, index) => ({
              ...card,
              bannerId: id,
              order: card.order ?? index,
            })),
          });
        }
      }

      // Update banner
      return tx.banner.update({
        where: { id },
        data: {
          ...bannerData,
          bannerType: bannerData.bannerType as BannerType | undefined,
          placement: bannerData.placement as BannerPlacement | undefined,
        },
        include: {
          cards: {
            orderBy: { order: "asc" },
          },
        },
      });
    });

    console.log(`✅ Banner updated: ${banner.id} (${banner.name})`);

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

    return NextResponse.json(banner);
  } catch (error: any) {
    console.error("❌ [BANNERS API] Update error:", error);

    // Zod validation error
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update banner" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/banners/[id]
 * Delete a banner and all its cards
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if banner exists
    const existing = await prisma.banner.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Banner not found" },
        { status: 404 }
      );
    }

    // Delete banner (cards will be cascade deleted due to relation)
    await prisma.banner.delete({
      where: { id },
    });

    console.log(`✅ Banner deleted: ${id}`);

    // Revalidate admin cache
    revalidateTag("banners");
    if (
      existing.placement === "HOME_HERO" ||
      existing.placement === "HOME_CATEGORY" ||
      existing.placement === "HOME_PROMO" ||
      existing.placement === "HOME_BOTTOM"
    ) {
      revalidateTag("homepage");
    }

    // Revalidate frontend (fusionmarkt) cache
    await revalidateBanners(existing.placement);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ [BANNERS API] Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete banner" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/banners/[id]
 * Toggle banner active status
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if banner exists
    const existing = await prisma.banner.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Banner not found" },
        { status: 404 }
      );
    }

    // Update only isActive
    const banner = await prisma.banner.update({
      where: { id },
      data: {
        isActive: body.isActive ?? !existing.isActive,
      },
      include: {
        cards: {
          orderBy: { order: "asc" },
        },
      },
    });

    console.log(`✅ Banner toggled: ${banner.id} -> isActive: ${banner.isActive}`);

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

    return NextResponse.json(banner);
  } catch (error) {
    console.error("❌ [BANNERS API] Toggle error:", error);
    return NextResponse.json(
      { error: "Failed to toggle banner" },
      { status: 500 }
    );
  }
}
