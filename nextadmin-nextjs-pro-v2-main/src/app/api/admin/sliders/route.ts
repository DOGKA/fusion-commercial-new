import { NextRequest, NextResponse } from "next/server";
import { prisma, ButtonStyle, TextAlign, SliderTheme } from "@repo/db";
import { CreateSliderSchema } from "@/server/validation/slider.validation";
import { revalidateTag } from "next/cache";
import { revalidateSliders } from "@/lib/revalidate-frontend";
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
 * GET /api/admin/sliders
 * List all sliders with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    // 🔒 Yetkilendirme kontrolü
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};
    if (active !== null && active !== undefined) {
      where.isActive = active === "true";
    }

    const [sliders, total] = await Promise.all([
      prisma.slider.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        take: limit,
        skip: offset,
      }),
      prisma.slider.count({ where }),
    ]);

    return NextResponse.json({ sliders, total, limit, offset });
  } catch (error) {
    console.error("❌ [SLIDERS API] List error:", error);
    return NextResponse.json({ error: "Failed to fetch sliders" }, { status: 500 });
  }
}

/**
 * POST /api/admin/sliders
 * Create a new slider
 */
export async function POST(request: NextRequest) {
  try {
    // 🔒 Yetkilendirme kontrolü
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const validated = CreateSliderSchema.parse(body);

    const { effect: _effect, effectSpeed: _effectSpeed, animation: _animation, animationDelay: _animationDelay, autoplay: _autoplay, autoplayDelay: _autoplayDelay, loop: _loop, ...sliderData } = validated;
    
    const slider = await prisma.slider.create({
      data: {
        ...sliderData,
        buttonStyle: sliderData.buttonStyle as ButtonStyle,
        button2Style: sliderData.button2Style as ButtonStyle,
        textAlign: sliderData.textAlign as TextAlign,
        theme: sliderData.theme as SliderTheme,
      },
    });

    console.log(`✅ Slider created: ${slider.id} (${slider.name})`);

    // Revalidate admin cache
    revalidateTag("sliders");
    revalidateTag("homepage");

    // Revalidate frontend (fusionmarkt) cache
    await revalidateSliders();

    return NextResponse.json(slider, { status: 201 });
  } catch (error: any) {
    console.error("❌ [SLIDERS API] Create error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create slider" }, { status: 500 });
  }
}
