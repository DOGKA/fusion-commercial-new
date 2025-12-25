import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prismaDb";

/**
 * GET /api/admin/feature-definitions
 * Tüm özellik tanımlarını listeler
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includePresets = searchParams.get("includePresets") === "true";
    const activeOnly = searchParams.get("activeOnly") !== "false";

    const features = await prisma.featureDefinition.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      include: {
        presetValues: includePresets ? {
          orderBy: { order: "asc" },
        } : false,
        _count: {
          select: {
            categories: true,
            productValues: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({
      success: true,
      features,
      total: features.length,
    });
  } catch (error) {
    console.error("Error fetching feature definitions:", error);
    return NextResponse.json(
      { success: false, error: "Özellik tanımları yüklenemedi" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/feature-definitions
 * Yeni özellik tanımı oluşturur
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, inputType, unit, description, placeholder, presetValues } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: "İsim ve slug zorunludur" },
        { status: 400 }
      );
    }

    // Slug kontrolü
    const existing = await prisma.featureDefinition.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Bu slug zaten kullanılıyor" },
        { status: 400 }
      );
    }

    // Özellik tanımı oluştur
    const feature = await prisma.featureDefinition.create({
      data: {
        name,
        slug,
        inputType: inputType || "TEXT",
        unit,
        description,
        placeholder,
      },
    });

    // Preset değerleri ekle (SELECT tipi için)
    if (inputType === "SELECT" && presetValues && presetValues.length > 0) {
      await prisma.featurePresetValue.createMany({
        data: presetValues.map((value: string, index: number) => ({
          featureId: feature.id,
          value,
          order: index,
        })),
      });
    }

    // Güncel veriyi getir
    const createdFeature = await prisma.featureDefinition.findUnique({
      where: { id: feature.id },
      include: {
        presetValues: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      feature: createdFeature,
    });
  } catch (error) {
    console.error("Error creating feature definition:", error);
    return NextResponse.json(
      { success: false, error: "Özellik tanımı oluşturulamadı" },
      { status: 500 }
    );
  }
}
