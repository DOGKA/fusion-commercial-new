import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { UpdateMediaSEOSchema } from "@/server/validation/media.validation";
import { deleteS3Object } from "@/lib/s3";

/**
 * GET /api/admin/media/[id]
 * Get single media record
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const media = await prisma.media.findUnique({
      where: { id: params.id },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    return NextResponse.json(media);
  } catch (error) {
    console.error("❌ [MEDIA API] Get error:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/media/[id]
 * Update media SEO metadata (alt, title, description)
 * Does NOT modify S3 object, only DB record
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validate (alt is REQUIRED)
    const validated = UpdateMediaSEOSchema.parse(body);

    // Update media record
    const media = await prisma.media.update({
      where: { id: params.id },
      data: {
        alt: validated.alt,
        title: validated.title,
        description: validated.description,
      },
    });

    console.log(`✅ Media SEO updated: ${media.id}`);

    return NextResponse.json(media);
  } catch (error: any) {
    console.error("❌ [MEDIA API] Update error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update media" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/media/[id]
 * Partial update - update only provided fields (alt, description)
 * No validation required - fields are optional
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Build update data with only provided fields
    const updateData: any = {};
    if (body.alt !== undefined) updateData.alt = body.alt;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Update media record
    const media = await prisma.media.update({
      where: { id: params.id },
      data: updateData,
    });

    console.log(`✅ Media partially updated: ${media.id}`, updateData);

    return NextResponse.json(media);
  } catch (error: any) {
    console.error("❌ [MEDIA API] Patch error:", error);
    return NextResponse.json(
      { error: "Failed to update media" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/media/[id]
 * Delete media record and S3 object
 * 
 * Safety check: Prevent delete if media is referenced by:
 * - Banner (desktopImage, mobileImage)
 * - Slider (desktopImage, mobileImage)
 * - Product (images array, thumbnail)
 * - Category (image)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get media record
    const media = await prisma.media.findUnique({
      where: { id: params.id },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // ✅ Usage check - prevent delete if referenced
    const usage = await checkMediaUsage(media.url);
    
    if (usage.isUsed) {
      return NextResponse.json(
        { 
          error: "Media is in use and cannot be deleted",
          usage: usage.details 
        },
        { status: 409 }
      );
    }

    // Delete from S3 if provider is S3
    if (media.provider === "S3") {
      try {
        await deleteS3Object(media.key);
      } catch (s3Error) {
        console.error("⚠️  S3 delete failed:", s3Error);
        // Continue anyway - S3 object might already be deleted
      }
    }

    // Delete from DB
    await prisma.media.delete({
      where: { id: params.id },
    });

    console.log(`✅ Media deleted: ${media.id} (${media.provider})`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ [MEDIA API] Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}

/**
 * Check if media URL is referenced in DB
 * Returns usage details if found
 */
async function checkMediaUsage(url: string): Promise<{
  isUsed: boolean;
  details?: string[];
}> {
  const details: string[] = [];

  // Check Banners
  const bannersWithImage = await prisma.banner.count({
    where: {
      OR: [
        { desktopImage: url },
        { mobileImage: url },
      ],
    },
  });
  if (bannersWithImage > 0) {
    details.push(`${bannersWithImage} banner(s)`);
  }

  // Check Sliders
  const slidersWithImage = await prisma.slider.count({
    where: {
      OR: [
        { desktopImage: url },
        { mobileImage: url },
        { backgroundVideo: url },
      ],
    },
  });
  if (slidersWithImage > 0) {
    details.push(`${slidersWithImage} slider(s)`);
  }

  // Check Products (images array or thumbnail)
  const productsWithImage = await prisma.product.count({
    where: {
      OR: [
        { images: { has: url } },
        { thumbnail: url },
      ],
    },
  });
  if (productsWithImage > 0) {
    details.push(`${productsWithImage} product(s)`);
  }

  // Check Categories
  const categoriesWithImage = await prisma.category.count({
    where: { image: url },
  });
  if (categoriesWithImage > 0) {
    details.push(`${categoriesWithImage} category(ies)`);
  }

  return {
    isUsed: details.length > 0,
    details: details.length > 0 ? details : undefined,
  };
}
