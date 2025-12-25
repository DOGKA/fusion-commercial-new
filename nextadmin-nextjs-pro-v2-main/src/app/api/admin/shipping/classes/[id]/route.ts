import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

// GET - Tek kargo sınıfı getir
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const shippingClass = await prisma.shippingClass.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!shippingClass) {
      return NextResponse.json(
        { error: "Kargo sınıfı bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...shippingClass,
      productCount: shippingClass._count.products,
    });
  } catch (error) {
    console.error("Error fetching shipping class:", error);
    return NextResponse.json(
      { error: "Kargo sınıfı alınamadı" },
      { status: 500 }
    );
  }
}

// PUT - Kargo sınıfı güncelle
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const { name, description, cost, alwaysFree, priority, isActive } = body;

    // Mevcut sınıfı kontrol et
    const existing = await prisma.shippingClass.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Kargo sınıfı bulunamadı" },
        { status: 404 }
      );
    }

    // İsim değiştiyse benzersizlik kontrolü
    if (name && name !== existing.name) {
      const duplicate = await prisma.shippingClass.findFirst({
        where: { name, id: { not: id } },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "Bu isimde bir kargo sınıfı zaten var" },
          { status: 400 }
        );
      }
    }

    const shippingClass = await prisma.shippingClass.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        cost: cost !== undefined ? parseFloat(cost) : undefined,
        alwaysFree: alwaysFree !== undefined ? alwaysFree : undefined,
        priority: priority !== undefined ? priority : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    return NextResponse.json(shippingClass);
  } catch (error) {
    console.error("Error updating shipping class:", error);
    return NextResponse.json(
      { error: "Kargo sınıfı güncellenemedi" },
      { status: 500 }
    );
  }
}

// DELETE - Kargo sınıfı sil
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Bağlı ürün kontrolü
    const productCount = await prisma.product.count({
      where: { shippingClassId: id },
    });

    if (productCount > 0) {
      return NextResponse.json(
        { error: `Bu sınıfa bağlı ${productCount} ürün var. Önce ürünlerin kargo sınıfını değiştirin.` },
        { status: 400 }
      );
    }

    await prisma.shippingClass.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting shipping class:", error);
    return NextResponse.json(
      { error: "Kargo sınıfı silinemedi" },
      { status: 500 }
    );
  }
}
