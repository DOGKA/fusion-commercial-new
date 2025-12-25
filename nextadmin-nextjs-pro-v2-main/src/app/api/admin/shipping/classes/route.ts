import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

// Slug oluştur
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET - Tüm kargo sınıflarını getir
export async function GET() {
  try {
    const classes = await prisma.shippingClass.findMany({
      orderBy: { priority: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    // productCount ekle
    const classesWithCount = classes.map((c) => ({
      ...c,
      productCount: c._count.products,
    }));

    return NextResponse.json(classesWithCount);
  } catch (error) {
    console.error("Error fetching shipping classes:", error);
    return NextResponse.json(
      { error: "Kargo sınıfları alınamadı" },
      { status: 500 }
    );
  }
}

// POST - Yeni kargo sınıfı oluştur
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const { name, description, cost, alwaysFree, priority, isActive } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Sınıf adı zorunludur" },
        { status: 400 }
      );
    }

    // Slug oluştur
    let slug = generateSlug(name);
    
    // Benzersizlik kontrolü
    const existing = await prisma.shippingClass.findFirst({
      where: { OR: [{ name }, { slug }] },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Bu isimde bir kargo sınıfı zaten var" },
        { status: 400 }
      );
    }

    const shippingClass = await prisma.shippingClass.create({
      data: {
        name,
        slug,
        description: description || null,
        cost: cost !== undefined ? parseFloat(cost) : 0,
        alwaysFree: alwaysFree ?? false,
        priority: priority ?? 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(shippingClass, { status: 201 });
  } catch (error) {
    console.error("Error creating shipping class:", error);
    return NextResponse.json(
      { error: "Kargo sınıfı oluşturulamadı" },
      { status: 500 }
    );
  }
}
