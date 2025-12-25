import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

// GET - Tüm kargo yöntemlerini getir
export async function GET() {
  try {
    const methods = await prisma.shippingMethod.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json(methods);
  } catch (error) {
    console.error("Error fetching shipping methods:", error);
    return NextResponse.json(
      { error: "Kargo yöntemleri alınamadı" },
      { status: 500 }
    );
  }
}

// POST - Yeni kargo yöntemi oluştur
export async function POST(req: Request) {
  try {
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

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Yöntem adı zorunludur" },
        { status: 400 }
      );
    }

    const method = await prisma.shippingMethod.create({
      data: {
        name,
        type: type || "FLAT_RATE",
        description: description || null,
        cost: parseFloat(cost) || 0,
        freeShippingRequirement: freeShippingRequirement || "NONE",
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        taxStatus: taxStatus || "TAXABLE",
        order: order ?? 0,
        isEnabled: isEnabled ?? true,
      },
    });

    return NextResponse.json(method, { status: 201 });
  } catch (error) {
    console.error("Error creating shipping method:", error);
    return NextResponse.json(
      { error: "Kargo yöntemi oluşturulamadı" },
      { status: 500 }
    );
  }
}
