import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prismaDb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

// GET - Belirli bir attribute value'yu getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; valueId: string }> }
) {
  try {
    const { id, valueId } = await params;

    const attributeValue = await prisma.attributeValue.findFirst({
      where: {
        id: valueId,
        attributeId: id,
      },
      include: {
        attribute: true,
      },
    });

    if (!attributeValue) {
      return NextResponse.json(
        { error: "Özellik değeri bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(attributeValue);
  } catch (error) {
    console.error("Error fetching attribute value:", error);
    return NextResponse.json(
      { error: "Özellik değeri yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT - Attribute value güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; valueId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, valueId } = await params;
    const data = await request.json();

    // Değerin var olduğunu kontrol et
    const existingValue = await prisma.attributeValue.findFirst({
      where: {
        id: valueId,
        attributeId: id,
      },
    });

    if (!existingValue) {
      return NextResponse.json(
        { error: "Özellik değeri bulunamadı" },
        { status: 404 }
      );
    }

    // Slug oluştur (eğer değiştiyse)
    let slug = data.slug;
    if (data.name && data.name !== existingValue.name && !data.slug) {
      slug = data.name
        .toLowerCase()
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    }

    const updatedValue = await prisma.attributeValue.update({
      where: { id: valueId },
      data: {
        name: data.name ?? existingValue.name,
        slug: slug ?? existingValue.slug,
        value: data.value,
        color: data.color,
        image: data.image,
        order: data.order ?? existingValue.order,
        isActive: data.isActive ?? existingValue.isActive,
      },
      include: {
        attribute: true,
      },
    });

    return NextResponse.json(updatedValue);
  } catch (error: any) {
    console.error("Error updating attribute value:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Bu slug zaten kullanımda" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Özellik değeri güncellenirken hata oluştu: " + error.message },
      { status: 500 }
    );
  }
}

// DELETE - Attribute value sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; valueId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, valueId } = await params;

    // Değerin var olduğunu kontrol et
    const existingValue = await prisma.attributeValue.findFirst({
      where: {
        id: valueId,
        attributeId: id,
      },
    });

    if (!existingValue) {
      return NextResponse.json(
        { error: "Özellik değeri bulunamadı" },
        { status: 404 }
      );
    }

    await prisma.attributeValue.delete({
      where: { id: valueId },
    });

    return NextResponse.json({ message: "Özellik değeri silindi" });
  } catch (error: any) {
    console.error("Error deleting attribute value:", error);
    return NextResponse.json(
      { error: "Özellik değeri silinirken hata oluştu: " + error.message },
      { status: 500 }
    );
  }
}

