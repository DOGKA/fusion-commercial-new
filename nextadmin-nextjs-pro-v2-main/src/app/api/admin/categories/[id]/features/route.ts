import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prismaDb";

/**
 * GET /api/admin/categories/[id]/features
 * Kategoriye bağlı özellik tanımlarını listeler
 * Admin panelde ürün ekleme/düzenleme sırasında kullanılır
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Kategori kontrolü
    const category = await prisma.category.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Kategori bulunamadı" },
        { status: 404 }
      );
    }

    // Kategoriye bağlı özellik tanımlarını getir
    const categoryFeatures = await prisma.categoryFeature.findMany({
      where: { categoryId: id },
      include: {
        feature: {
          include: {
            presetValues: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    // Response formatla
    const features = categoryFeatures.map((cf) => ({
      id: cf.feature.id,
      name: cf.feature.name,
      slug: cf.feature.slug,
      inputType: cf.feature.inputType,
      unit: cf.feature.unit,
      description: cf.feature.description,
      placeholder: cf.feature.placeholder,
      presetValues: cf.feature.presetValues.map((pv) => ({
        value: pv.value,
        label: pv.label || pv.value,
      })),
      // Kategori spesifik ayarlar
      sortOrder: cf.sortOrder,
      isRequired: cf.isRequired,
      isDefault: cf.isDefault,
    }));

    return NextResponse.json({
      success: true,
      category,
      features,
      total: features.length,
    });
  } catch (error) {
    console.error("Error fetching category features:", error);
    return NextResponse.json(
      { success: false, error: "Kategori özellikleri yüklenemedi" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/categories/[id]/features
 * Kategoriye özellik bağlar
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: categoryId } = await params;
    const body = await request.json();
    const { featureId, sortOrder, isRequired, isDefault } = body;

    if (!featureId) {
      return NextResponse.json(
        { success: false, error: "Feature ID zorunludur" },
        { status: 400 }
      );
    }

    // Kategori kontrolü
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Kategori bulunamadı" },
        { status: 404 }
      );
    }

    // Özellik kontrolü
    const feature = await prisma.featureDefinition.findUnique({
      where: { id: featureId },
    });

    if (!feature) {
      return NextResponse.json(
        { success: false, error: "Özellik tanımı bulunamadı" },
        { status: 404 }
      );
    }

    // Bağlantı oluştur (upsert)
    const categoryFeature = await prisma.categoryFeature.upsert({
      where: {
        categoryId_featureId: {
          categoryId,
          featureId,
        },
      },
      update: {
        sortOrder: sortOrder ?? 0,
        isRequired: isRequired ?? false,
        isDefault: isDefault ?? false,
      },
      create: {
        categoryId,
        featureId,
        sortOrder: sortOrder ?? 0,
        isRequired: isRequired ?? false,
        isDefault: isDefault ?? false,
      },
      include: {
        feature: true,
      },
    });

    return NextResponse.json({
      success: true,
      categoryFeature,
    });
  } catch (error) {
    console.error("Error linking category feature:", error);
    return NextResponse.json(
      { success: false, error: "Özellik kategoriye bağlanamadı" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/categories/[id]/features
 * Kategorinin tüm özellik bağlantılarını günceller (bulk update)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: categoryId } = await params;
    const body = await request.json();
    const { features } = body; // [{featureId, sortOrder, isRequired, isDefault}]

    if (!features || !Array.isArray(features)) {
      return NextResponse.json(
        { success: false, error: "Features array zorunludur" },
        { status: 400 }
      );
    }

    // Mevcut bağlantıları sil
    await prisma.categoryFeature.deleteMany({
      where: { categoryId },
    });

    // Yeni bağlantıları oluştur
    if (features.length > 0) {
      await prisma.categoryFeature.createMany({
        data: features.map((f: any, index: number) => ({
          categoryId,
          featureId: f.featureId,
          sortOrder: f.sortOrder ?? index,
          isRequired: f.isRequired ?? false,
          isDefault: f.isDefault ?? false,
        })),
      });
    }

    // Güncel listeyi getir
    const updatedFeatures = await prisma.categoryFeature.findMany({
      where: { categoryId },
      include: {
        feature: {
          include: {
            presetValues: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({
      success: true,
      features: updatedFeatures,
      total: updatedFeatures.length,
    });
  } catch (error) {
    console.error("Error updating category features:", error);
    return NextResponse.json(
      { success: false, error: "Kategori özellikleri güncellenemedi" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/categories/[id]/features
 * Kategoriden özellik bağlantısını kaldırır
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: categoryId } = await params;
    const { searchParams } = new URL(request.url);
    const featureId = searchParams.get("featureId");

    if (!featureId) {
      return NextResponse.json(
        { success: false, error: "Feature ID zorunludur" },
        { status: 400 }
      );
    }

    await prisma.categoryFeature.delete({
      where: {
        categoryId_featureId: {
          categoryId,
          featureId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Özellik kategoriden kaldırıldı",
    });
  } catch (error) {
    console.error("Error removing category feature:", error);
    return NextResponse.json(
      { success: false, error: "Özellik kategoriden kaldırılamadı" },
      { status: 500 }
    );
  }
}
