import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

// GET - Tek kargo yöntemi getir
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const method = await prisma.shippingMethod.findUnique({
      where: { id },
    });

    if (!method) {
      return NextResponse.json(
        { error: "Kargo yöntemi bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(method);
  } catch (error) {
    console.error("Error fetching shipping method:", error);
    return NextResponse.json(
      { error: "Kargo yöntemi alınamadı" },
      { status: 500 }
    );
  }
}

// PUT - Kargo yöntemi güncelle
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const {
      name,
      type,
      description,
      cost,
      freeShippingRequirement,
      minOrderAmount,
      taxStatus,
      order,
      isEnabled,
    } = body;

    // Mevcut yöntemi kontrol et
    const existing = await prisma.shippingMethod.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Kargo yöntemi bulunamadı" },
        { status: 404 }
      );
    }

    const method = await prisma.shippingMethod.update({
      where: { id },
      data: {
        name: name || undefined,
        type: type || undefined,
        description: description !== undefined ? description : undefined,
        cost: cost !== undefined ? parseFloat(cost) : undefined,
        freeShippingRequirement: freeShippingRequirement || undefined,
        minOrderAmount: minOrderAmount !== undefined 
          ? (minOrderAmount ? parseFloat(minOrderAmount) : null) 
          : undefined,
        taxStatus: taxStatus || undefined,
        order: order !== undefined ? order : undefined,
        isEnabled: isEnabled !== undefined ? isEnabled : undefined,
      },
    });

    return NextResponse.json(method);
  } catch (error) {
    console.error("Error updating shipping method:", error);
    return NextResponse.json(
      { error: "Kargo yöntemi güncellenemedi" },
      { status: 500 }
    );
  }
}

// DELETE - Kargo yöntemi sil
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Zone ilişkilerini kontrol et
    const zoneMethodCount = await prisma.shippingZoneMethod.count({
      where: { methodId: id },
    });

    if (zoneMethodCount > 0) {
      return NextResponse.json(
        { error: `Bu yöntem ${zoneMethodCount} bölgede kullanılıyor. Önce bölge ilişkilerini kaldırın.` },
        { status: 400 }
      );
    }

    await prisma.shippingMethod.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting shipping method:", error);
    return NextResponse.json(
      { error: "Kargo yöntemi silinemedi" },
      { status: 500 }
    );
  }
}
