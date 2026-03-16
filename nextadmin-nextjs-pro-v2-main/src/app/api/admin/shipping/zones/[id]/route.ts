import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

// GET - Tek kargo bölgesi getir
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const zone = await prisma.shippingZone.findUnique({
      where: { id },
      include: {
        methods: {
          include: {
            method: true,
            classCosts: {
              include: {
                shippingClass: true,
              },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!zone) {
      return NextResponse.json(
        { error: "Kargo bölgesi bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(zone);
  } catch (error) {
    console.error("Error fetching shipping zone:", error);
    return NextResponse.json(
      { error: "Kargo bölgesi alınamadı" },
      { status: 500 }
    );
  }
}

// PUT - Kargo bölgesi güncelle
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const { name, regions, postalCodes, order, isActive, methods } = body;

    // Mevcut bölgeyi kontrol et
    const existing = await prisma.shippingZone.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Kargo bölgesi bulunamadı" },
        { status: 404 }
      );
    }

    // Bölgeyi güncelle
    const zone = await prisma.shippingZone.update({
      where: { id },
      data: {
        name: name || undefined,
        regions: regions !== undefined ? regions : undefined,
        postalCodes: postalCodes !== undefined ? postalCodes : undefined,
        order: order !== undefined ? order : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    // Methods güncellemesi varsa işle
    if (methods && Array.isArray(methods)) {
      // Mevcut zone-method ilişkilerini sil
      await prisma.shippingZoneMethod.deleteMany({
        where: { zoneId: id },
      });

      // Yeni ilişkileri oluştur
      for (const method of methods) {
        const zoneMethod = await prisma.shippingZoneMethod.create({
          data: {
            zoneId: id,
            methodId: method.methodId,
            costOverride: method.costOverride ? parseFloat(method.costOverride) : null,
            order: method.order ?? 0,
            isEnabled: method.isEnabled ?? true,
          },
        });

        // Class costs varsa ekle
        if (method.classCosts && Array.isArray(method.classCosts)) {
          for (const classCost of method.classCosts) {
            await prisma.shippingMethodClassCost.create({
              data: {
                zoneMethodId: zoneMethod.id,
                shippingClassId: classCost.shippingClassId,
                additionalCost: parseFloat(classCost.additionalCost) || 0,
              },
            });
          }
        }
      }
    }

    // Güncellenmiş zone'u getir
    const updatedZone = await prisma.shippingZone.findUnique({
      where: { id },
      include: {
        methods: {
          include: {
            method: true,
            classCosts: {
              include: {
                shippingClass: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedZone);
  } catch (error) {
    console.error("Error updating shipping zone:", error);
    return NextResponse.json(
      { error: "Kargo bölgesi güncellenemedi" },
      { status: 500 }
    );
  }
}

// DELETE - Kargo bölgesi sil
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.shippingZone.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting shipping zone:", error);
    return NextResponse.json(
      { error: "Kargo bölgesi silinemedi" },
      { status: 500 }
    );
  }
}
