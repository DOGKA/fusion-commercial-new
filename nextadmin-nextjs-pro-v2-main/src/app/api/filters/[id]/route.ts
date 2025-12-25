import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prismaDb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

// GET - Tek bir filtreyi getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
    }

    const filter = await prisma.$queryRaw`
      SELECT 
        f.*,
        c.name as category_name,
        c.slug as category_slug
      FROM filters f
      LEFT JOIN categories c ON f."categoryId" = c.id
      WHERE f.id = ${id}
      LIMIT 1
    `;

    const filterArray = Array.isArray(filter) ? filter : [];
    if (filterArray.length === 0) {
      return NextResponse.json({ error: "Filtre bulunamadı" }, { status: 404 });
    }

    const f = filterArray[0] as any;
    const filterData = {
      id: f.id,
      name: f.name,
      categoryId: f.categoryId,
      categoryName: f.category_name,
      categorySlug: f.category_slug,
      sourceType: f.sourceType,
      filterType: f.filterType,
      displayStyle: f.displayStyle,
      showCount: f.showCount,
      allowMultiple: f.allowMultiple,
      isCollapsible: f.isCollapsible,
      isCollapsed: f.isCollapsed,
      minValue: f.minValue,
      maxValue: f.maxValue,
      step: f.step,
      order: f.order,
      isActive: f.isActive,
      options: f.customOptions || [],
    };

    return NextResponse.json(filterData);
  } catch (error: any) {
    console.error("Error fetching filter:", error);
    return NextResponse.json(
      { error: "Filtre yüklenirken hata oluştu: " + error.message },
      { status: 500 }
    );
  }
}

// PUT - Filtreyi güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
    }

    const data = await request.json();

    // Sadece gönderilen alanları güncelle (undefined olanları atla)
    const updateData: Record<string, any> = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.sourceType !== undefined) updateData.sourceType = data.sourceType;
    if (data.filterType !== undefined) updateData.filterType = data.filterType;
    if (data.displayStyle !== undefined) updateData.displayStyle = data.displayStyle;
    if (data.showCount !== undefined) updateData.showCount = data.showCount;
    if (data.allowMultiple !== undefined) updateData.allowMultiple = data.allowMultiple;
    if (data.isCollapsible !== undefined) updateData.isCollapsible = data.isCollapsible;
    if (data.isCollapsed !== undefined) updateData.isCollapsed = data.isCollapsed;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.minValue !== undefined) updateData.minValue = data.minValue;
    if (data.maxValue !== undefined) updateData.maxValue = data.maxValue;
    if (data.step !== undefined) updateData.step = data.step;
    if (data.customOptions !== undefined) updateData.customOptions = data.customOptions;

    // TypeScript tip hatası için any kullanıyoruz
    const filter = await (prisma.filter as any).update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(filter);
  } catch (error: any) {
    console.error("Error updating filter:", error);
    return NextResponse.json(
      { error: "Filtre güncellenirken hata oluştu: " + error.message },
      { status: 500 }
    );
  }
}

// DELETE - Filtreyi sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
    }

    await prisma.filter.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting filter:", error);
    return NextResponse.json(
      { error: "Filtre silinirken hata oluştu: " + error.message },
      { status: 500 }
    );
  }
}
