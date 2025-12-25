import { NextRequest, NextResponse } from "next/server";
import { prisma, ButtonStyle, TextAlign, SliderTheme } from "@repo/db";
import { UpdateSliderSchema } from "@/server/validation/slider.validation";
import { revalidateTag } from "next/cache";
import { revalidateSliders } from "@/lib/revalidate-frontend";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/sliders/[id]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const slider = await prisma.slider.findUnique({ where: { id } });

    if (!slider) {
      return NextResponse.json({ error: "Slider not found" }, { status: 404 });
    }

    return NextResponse.json(slider);
  } catch (error) {
    console.error("❌ [SLIDERS API] Get error:", error);
    return NextResponse.json({ error: "Failed to fetch slider" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/sliders/[id]
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.slider.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Slider not found" }, { status: 404 });
    }

    const validated = UpdateSliderSchema.parse(body);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { effect, effectSpeed, animation, animationDelay, autoplay, autoplayDelay, loop, ...sliderData } = validated;
    
    const slider = await prisma.slider.update({
      where: { id },
      data: {
        ...sliderData,
        buttonStyle: sliderData.buttonStyle as ButtonStyle | undefined,
        button2Style: sliderData.button2Style as ButtonStyle | undefined,
        textAlign: sliderData.textAlign as TextAlign | undefined,
        theme: sliderData.theme as SliderTheme | undefined,
      },
    });

    console.log(`✅ Slider updated: ${slider.id}`);

    // Revalidate admin cache
    revalidateTag("sliders");
    revalidateTag("homepage");

    // Revalidate frontend (fusionmarkt) cache
    await revalidateSliders();

    return NextResponse.json(slider);
  } catch (error: any) {
    console.error("❌ [SLIDERS API] Update error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to update slider" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/sliders/[id]
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await prisma.slider.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Slider not found" }, { status: 404 });
    }

    await prisma.slider.delete({ where: { id } });

    console.log(`✅ Slider deleted: ${id}`);

    // Revalidate admin cache
    revalidateTag("sliders");
    revalidateTag("homepage");

    // Revalidate frontend (fusionmarkt) cache
    await revalidateSliders();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ [SLIDERS API] Delete error:", error);
    return NextResponse.json({ error: "Failed to delete slider" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/sliders/[id]
 * Toggle slider active status
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.slider.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Slider not found" }, { status: 404 });
    }

    const slider = await prisma.slider.update({
      where: { id },
      data: { isActive: body.isActive ?? !existing.isActive },
    });

    console.log(`✅ Slider toggled: ${slider.id} -> isActive: ${slider.isActive}`);

    // Revalidate admin cache
    revalidateTag("sliders");
    revalidateTag("homepage");

    // Revalidate frontend (fusionmarkt) cache
    await revalidateSliders();

    return NextResponse.json(slider);
  } catch (error) {
    console.error("❌ [SLIDERS API] Toggle error:", error);
    return NextResponse.json({ error: "Failed to toggle slider" }, { status: 500 });
  }
}
