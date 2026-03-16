import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prismaDb";

/**
 * GET /api/admin/feature-definitions/[id]
 * Tek özellik tanımını getirir
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const feature = await prisma.featureDefinition.findUnique({
      where: { id },
      include: {
        presetValues: {
          orderBy: { order: "asc" },
        },
        categories: {
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
        _count: {
          select: { productValues: true },
        },
      },
    });

    if (!feature) {
      return NextResponse.json(
        { success: false, error: "Özellik tanımı bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      feature,
    });
  } catch (error) {
    console.error("Error fetching feature definition:", error);
    return NextResponse.json(
      { success: false, error: "Özellik tanımı yüklenemedi" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/feature-definitions/[id]
 * Özellik tanımını günceller
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, inputType, unit, description, placeholder, isActive, presetValues } = body;

    // Mevcut kontrolü
    const existing = await prisma.featureDefinition.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Özellik tanımı bulunamadı" },
        { status: 404 }
      );
    }

    // Güncelle
    const feature = await prisma.featureDefinition.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        inputType: inputType ?? existing.inputType,
        unit,
        description,
        placeholder,
        isActive: isActive ?? existing.isActive,
      },
    });

    // Preset değerleri güncelle (SELECT tipi için)
    if (presetValues !== undefined) {
      // Mevcut değerleri sil
      await prisma.featurePresetValue.deleteMany({
        where: { featureId: id },
      });

      // Yeni değerleri ekle
      if (presetValues && presetValues.length > 0) {
        await prisma.featurePresetValue.createMany({
          data: presetValues.map((value: string, index: number) => ({
            featureId: id,
            value,
            order: index,
          })),
        });
      }
    }

    // Güncel veriyi getir
    const updatedFeature = await prisma.featureDefinition.findUnique({
      where: { id },
      include: {
        presetValues: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      feature: updatedFeature,
    });
  } catch (error) {
    console.error("Error updating feature definition:", error);
    return NextResponse.json(
      { success: false, error: "Özellik tanımı güncellenemedi" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/feature-definitions/[id]
 * Özellik tanımını siler
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Kullanım kontrolü
    const usage = await prisma.productFeatureValue.count({
      where: { featureId: id },
    });

    if (usage > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Bu özellik ${usage} üründe kullanılıyor. Silmeden önce ürünlerden kaldırın.` 
        },
        { status: 400 }
      );
    }

    // Sil (cascade ile preset values ve category features de silinir)
    await prisma.featureDefinition.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Özellik tanımı silindi",
    });
  } catch (error) {
    console.error("Error deleting feature definition:", error);
    return NextResponse.json(
      { success: false, error: "Özellik tanımı silinemedi" },
      { status: 500 }
    );
  }
}
