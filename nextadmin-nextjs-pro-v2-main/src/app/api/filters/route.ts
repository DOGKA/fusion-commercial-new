import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prismaDb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

// GET - Tüm filtreleri getir
export async function GET() {
  try {
    // SQL ile tüm alanları al
    const filters = await prisma.$queryRaw`
      SELECT 
        f.*,
        c.name as category_name,
        c.slug as category_slug
      FROM filters f
      LEFT JOIN categories c ON f."categoryId" = c.id
      ORDER BY f.order ASC
    `;

    // Array olarak dönüştür ve options'ı ekle
    const filtersArray = Array.isArray(filters) ? filters : [];
    const filtersWithOptions = filtersArray.map((filter: any) => ({
      id: filter.id,
      presetId: filter.presetId,
      name: filter.name,
      categoryId: filter.categoryId,
      categoryName: filter.category_name,
      categorySlug: filter.category_slug,
      sourceType: filter.sourceType,
      attributeId: filter.attributeId,
      autoPopulate: filter.autoPopulate,
      selectedTermIds: filter.selectedTermIds || [],
      filterType: filter.filterType,
      displayStyle: filter.displayStyle,
      showCount: filter.showCount,
      showHierarchy: filter.showHierarchy,
      allowMultiple: filter.allowMultiple,
      isCollapsible: filter.isCollapsible,
      isCollapsed: filter.isCollapsed,
      minValue: filter.minValue,
      maxValue: filter.maxValue,
      step: filter.step,
      order: filter.order,
      isActive: filter.isActive,
      createdAt: filter.createdAt,
      updatedAt: filter.updatedAt,
      options: filter.customOptions || [],
    }));

    return NextResponse.json(filtersWithOptions);
  } catch (error: any) {
    console.error("Error fetching filters:", error);
    return NextResponse.json(
      { error: "Filtreler yüklenirken hata oluştu: " + error.message },
      { status: 500 }
    );
  }
}

// POST - Yeni filtre oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // TypeScript tip hatası olduğu için any kullanıyoruz
    // categoryId schema'da var ama Prisma client type'ları güncellenmemiş
    const filter = await (prisma.filter as any).create({
      data: {
        name: data.name,
        categoryId: data.categoryId || null,
        sourceType: data.sourceType || "ATTRIBUTE",
        autoPopulate: data.autoPopulate ?? true,
        selectedTermIds: data.selectedTermIds || [],
        filterType: data.filterType || "CHECKBOX",
        displayStyle: data.displayStyle || "LIST",
        showCount: data.showCount ?? true,
        showHierarchy: data.showHierarchy || "FLAT",
        allowMultiple: data.allowMultiple ?? true,
        isCollapsible: data.isCollapsible ?? true,
        isCollapsed: data.isCollapsed ?? false,
        minValue: data.minValue,
        maxValue: data.maxValue,
        step: data.step,
        order: data.order || 0,
        isActive: data.isActive ?? true,
        customOptions: data.customOptions || [],
      },
    });

    return NextResponse.json(filter, { status: 201 });
  } catch (error: any) {
    console.error("Error creating filter:", error);
    return NextResponse.json(
      { error: "Filtre oluşturulurken hata oluştu: " + error.message },
      { status: 500 }
    );
  }
}
