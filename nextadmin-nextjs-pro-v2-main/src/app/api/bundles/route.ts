import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";

// GET - Tüm bundle'ları getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const categoryId = searchParams.get("categoryId");
    const featured = searchParams.get("featured");

    let whereClause: any = {};

    if (categoryId) {
      whereClause.categories = {
        some: { categoryId },
      };
    }

    if (featured === "true") {
      whereClause.isFeatured = true;
      whereClause.isActive = true;
    }

    const bundles = await (prisma.bundle as any).findMany({
      where: whereClause,
      include: {
        categories: {
          include: {
            category: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                thumbnail: true,
                price: true,
                stock: true,
              },
            },
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Bundle item'larında seçili varyant varsa, stock hesabında varyant stoğunu baz al
    const allVariantIds: string[] = bundles
      .flatMap((b: any) => (b.items || []).map((it: any) => it.variantId).filter(Boolean));
    const uniqueVariantIds = Array.from(new Set(allVariantIds));
    const variantStockMap = new Map<string, number>();
    if (uniqueVariantIds.length > 0) {
      const variants: Array<{ id: string; stock: number }> = await (prisma.productVariant as any).findMany({
        where: { id: { in: uniqueVariantIds } },
        select: { id: true, stock: true },
      });
      for (const v of variants) variantStockMap.set(v.id, Number(v.stock ?? 0));
    }

    // Bundle stok hesaplama (min stoklu ürüne göre)
    const transformedBundles = bundles.map((bundle: any) => {
      const minStock = bundle.items.length > 0
        ? Math.min(
            ...bundle.items.map((item: any) => {
              const qty = Math.max(1, Number(item.quantity ?? 1));
              const baseStock = item.variantId
                ? (variantStockMap.get(String(item.variantId)) ?? 0)
                : Number(item.product?.stock ?? 0);
              return Math.floor(baseStock / qty);
            })
          )
        : 0;

      // Ürünlerin toplam değerini hesapla
      const totalValue = bundle.items.reduce((sum: number, item: any) => {
        return sum + (Number(item.product?.price || 0) * item.quantity);
      }, 0);

      return {
        id: bundle.id,
        name: bundle.name,
        slug: bundle.slug,
        shortDescription: bundle.shortDescription,
        price: Number(bundle.price),
        comparePrice: bundle.comparePrice ? Number(bundle.comparePrice) : totalValue,
        thumbnail: bundle.thumbnail,
        brand: bundle.brand,
        sku: bundle.sku,
        isActive: bundle.isActive,
        isFeatured: bundle.isFeatured,
        pricingType: bundle.pricingType,
        stock: minStock,
        itemCount: bundle.items.length,
        categories: bundle.categories.map((bc: any) => ({
          id: bc.category.id,
          name: bc.category.name,
          slug: bc.category.slug,
          isPrimary: bc.isPrimary,
        })),
        createdAt: bundle.createdAt,
      };
    });

    return NextResponse.json({ bundles: transformedBundles });
  } catch (error) {
    console.error("Error fetching bundles:", error);
    return NextResponse.json(
      { error: "Paket ürünler getirilemedi" },
      { status: 500 }
    );
  }
}

// POST - Yeni bundle oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Slug oluştur
    const slug = body.slug || body.name
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    // Slug benzersizlik kontrolü
    const existingBundle = await (prisma.bundle as any).findUnique({
      where: { slug },
    });

    if (existingBundle) {
      return NextResponse.json(
        { error: "Bu slug zaten kullanılıyor" },
        { status: 400 }
      );
    }

    // Ürünlerin toplam değerini + bundle stokunu hesapla (comparePrice/stock için)
    let totalValue = 0;
    let minStock = 0;
    if (body.items && body.items.length > 0) {
      const productIds: string[] = body.items.map((item: any) => String(item.productId));
      const variantIds: string[] = body.items.map((item: any) => item.variantId).filter(Boolean).map(String);
      const products: Array<{ id: string; price: unknown; stock: unknown }> = await (prisma.product as any).findMany({
        where: { id: { in: productIds } },
        select: { id: true, price: true, stock: true },
      });
      const variants: Array<{ id: string; stock: unknown }> = variantIds.length > 0
        ? await (prisma.productVariant as any).findMany({
            where: { id: { in: Array.from(new Set(variantIds)) } },
            select: { id: true, stock: true },
          })
        : [];

      const priceMap = new Map<string, number>(
        products.map((p) => [p.id, Number(p.price ?? 0)])
      );
      const stockMap = new Map<string, number>(
        products.map((p) => [p.id, Number(p.stock ?? 0)])
      );
      const variantStockMap = new Map<string, number>(
        variants.map((v) => [v.id, Number(v.stock ?? 0)])
      );

      totalValue = body.items.reduce((sum: number, item: any) => {
        const productPrice = priceMap.get(String(item.productId)) ?? 0;
        const qty = Math.max(1, Number(item.quantity ?? 1));
        return sum + productPrice * qty;
      }, 0);

      minStock =
        body.items.length > 0
          ? Math.min(
              ...body.items.map((item: any) => {
                const qty = Math.max(1, Number(item.quantity ?? 1));
                const baseStock = item.variantId
                  ? (variantStockMap.get(String(item.variantId)) ?? 0)
                  : (stockMap.get(String(item.productId)) ?? 0);
                return Math.floor(baseStock / qty);
              })
            )
          : 0;
    }

    // Transaction ile bundle ve ilişkili verileri oluştur
    const result = await prisma.$transaction(async (tx: any) => {
      // SKU için boş string'i null'a çevir (unique constraint için)
      const skuValue = body.sku && body.sku.trim() !== "" ? body.sku.trim() : null;
      
      // Bundle oluştur
      const bundle = await tx.bundle.create({
        data: {
          name: body.name,
          slug,
          description: body.description || null,
          shortDescription: body.shortDescription || null,
          pricingType: body.pricingType || "FIXED",
          price: body.price ? parseFloat(body.price) : 0,
          comparePrice: totalValue > 0 ? totalValue : null,
          thumbnail: body.thumbnail || null,
          images: body.images || [],
          videoUrl: body.videoUrl || null,
          brand: body.brand || null,
          sku: skuValue,
          metaTitle: body.metaTitle || null,
          metaDescription: body.metaDescription || null,
          metaKeywords: body.metaKeywords || [],
          isActive: body.isActive ?? true,
          isFeatured: body.isFeatured ?? false,
          publishedAt: body.isActive ? new Date() : null,
        },
      });

      // Kategorileri ekle
      if (body.categories && body.categories.length > 0) {
        for (let i = 0; i < body.categories.length; i++) {
          const cat = body.categories[i];
          await tx.bundleCategory.create({
            data: {
              bundleId: bundle.id,
              categoryId: typeof cat === "string" ? cat : cat.categoryId,
              isPrimary: typeof cat === "string" ? i === 0 : cat.isPrimary ?? i === 0,
              sortOrder: i,
            },
          });
        }
      }

      // Bundle items oluştur
      if (body.items && body.items.length > 0) {
        for (let i = 0; i < body.items.length; i++) {
          const item = body.items[i];
          await tx.bundleItem.create({
            data: {
              bundleId: bundle.id,
              productId: item.productId,
              variantId: item.variantId || null,
              quantity: item.quantity || 1,
              sortOrder: i,
            },
          });
        }
      }

      return bundle;
    });

    return NextResponse.json({
      success: true,
      bundle: {
        ...result,
        price: Number((result as any).price),
        comparePrice: (result as any).comparePrice
          ? Number((result as any).comparePrice)
          : totalValue,
        stock: minStock,
      },
    });
  } catch (error) {
    console.error("Error creating bundle:", error);
    return NextResponse.json(
      { error: "Paket ürün oluşturulamadı" },
      { status: 500 }
    );
  }
}

