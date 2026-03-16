import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

// GET - Tüm kargo bölgelerini getir
export async function GET() {
  try {
    const zones = await prisma.shippingZone.findMany({
      orderBy: { order: "asc" },
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

    return NextResponse.json(zones);
  } catch (error) {
    console.error("Error fetching shipping zones:", error);
    return NextResponse.json(
      { error: "Kargo bölgeleri alınamadı" },
      { status: 500 }
    );
  }
}

// POST - Yeni kargo bölgesi oluştur
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const { name, regions, postalCodes, order, isActive } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Bölge adı zorunludur" },
        { status: 400 }
      );
    }

    const zone = await prisma.shippingZone.create({
      data: {
        name,
        regions: regions || null,
        postalCodes: postalCodes || null,
        order: order ?? 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(zone, { status: 201 });
  } catch (error) {
    console.error("Error creating shipping zone:", error);
    return NextResponse.json(
      { error: "Kargo bölgesi oluşturulamadı" },
      { status: 500 }
    );
  }
}
