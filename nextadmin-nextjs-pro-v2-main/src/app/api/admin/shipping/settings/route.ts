import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

// GET - Kargo ayarlarını getir
export async function GET() {
  try {
    // Ayarları getir veya varsayılan oluştur
    let settings = await prisma.shippingSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      // Varsayılan ayarları oluştur
      settings = await prisma.shippingSettings.create({
        data: {
          id: "default",
          freeShippingLimit: 2000,
          heavyClassFreeLimit: 0, // Ağır sınıf her zaman ücretsiz
          taxRate: 20,
          enableShippingCalc: true,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching shipping settings:", error);
    return NextResponse.json(
      { error: "Kargo ayarları alınamadı" },
      { status: 500 }
    );
  }
}

// PUT - Kargo ayarlarını güncelle
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    
    const {
      freeShippingLimit,
      heavyClassFreeLimit,
      taxRate,
      defaultShippingClassId,
      enableShippingCalc,
    } = body;

    const settings = await prisma.shippingSettings.upsert({
      where: { id: "default" },
      update: {
        freeShippingLimit: freeShippingLimit !== undefined ? parseFloat(freeShippingLimit) : undefined,
        heavyClassFreeLimit: heavyClassFreeLimit !== undefined ? parseFloat(heavyClassFreeLimit) : undefined,
        taxRate: taxRate !== undefined ? parseFloat(taxRate) : undefined,
        defaultShippingClassId: defaultShippingClassId || null,
        enableShippingCalc: enableShippingCalc ?? true,
      },
      create: {
        id: "default",
        freeShippingLimit: parseFloat(freeShippingLimit) || 2000,
        heavyClassFreeLimit: parseFloat(heavyClassFreeLimit) || 0,
        taxRate: parseFloat(taxRate) || 20,
        defaultShippingClassId: defaultShippingClassId || null,
        enableShippingCalc: enableShippingCalc ?? true,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating shipping settings:", error);
    return NextResponse.json(
      { error: "Kargo ayarları güncellenemedi" },
      { status: 500 }
    );
  }
}
