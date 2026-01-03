import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";

// GET - Tek bundle getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const bundle = await (prisma.bundle as any).findUnique({
      where: { id },
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
                comparePrice: true,
                stock: true,
                brand: true,
                variants: {
                  where: { isActive: true },
                  select: {
                    id: true,
                    name: true,
                    value: true,
                    colorCode: true,
                    stock: true,
                    price: true,
                    salePrice: true,
                  },
                },
              },
            },
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

    if (!bundle) {
      return NextResponse.json(
        { error: "Paket ürün bulunamadı" },
        { status: 404 }
      );
    }

    // Stok hesaplama (varyant seçiliyse varyant stoğu baz alınır)
    const variantIds: string[] = (bundle.items || [])
      .map((it: any) => it.variantId)
      .filter(Boolean)
      .map(String);
    const variantStockMap = new Map<string, number>();
    if (variantIds.length > 0) {
      const variants: Array<{ id: string; stock: number }> = await (prisma.productVariant as any).findMany({
        where: { id: { in: Array.from(new Set(variantIds)) } },
        select: { id: true, stock: true },
      });
      for (const v of variants) variantStockMap.set(v.id, Number(v.stock ?? 0));
    }

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

    return NextResponse.json({
      ...bundle,
      price: Number(bundle.price),
      comparePrice: bundle.comparePrice ? Number(bundle.comparePrice) : totalValue,
      stock: minStock,
      categories: bundle.categories.map((bc: any) => ({
        id: bc.category.id,
        name: bc.category.name,
        slug: bc.category.slug,
        isPrimary: bc.isPrimary,
      })),
      items: bundle.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        sortOrder: item.sortOrder,
        product: item.product
          ? {
              ...item.product,
              price: Number(item.product.price),
              comparePrice: item.product.comparePrice
                ? Number(item.product.comparePrice)
                : null,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error("Error fetching bundle:", error);
    return NextResponse.json(
      { error: "Paket ürün getirilemedi" },
      { status: 500 }
    );
  }
}

// PUT - Bundle güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Ürünlerin toplam değerini + bundle stokunu hesapla
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

    // Transaction ile güncelle
    const result = await prisma.$transaction(async (tx: any) => {
      // SKU: boş string -> null (unique constraint için)
      const skuValue =
        body.sku && String(body.sku).trim() !== "" ? String(body.sku).trim() : null;

      // Bundle güncelle
      const bundle = await tx.bundle.update({
        where: { id },
        data: {
          name: body.name,
          slug: body.slug,
          description: body.description,
          shortDescription: body.shortDescription,
          pricingType: body.pricingType,
          price: body.price ? parseFloat(body.price) : undefined,
          comparePrice: totalValue > 0 ? totalValue : undefined,
          thumbnail: body.thumbnail,
          images: body.images,
          videoUrl: body.videoUrl,
          brand: body.brand,
          sku: skuValue,
          metaTitle: body.metaTitle,
          metaDescription: body.metaDescription,
          metaKeywords: body.metaKeywords,
          isActive: body.isActive,
          isFeatured: body.isFeatured,
          updatedAt: new Date(),
        },
      });

      // Kategorileri güncelle (önce sil, sonra ekle)
      if (body.categories !== undefined) {
        await tx.bundleCategory.deleteMany({
          where: { bundleId: id },
        });

        if (body.categories && body.categories.length > 0) {
          for (let i = 0; i < body.categories.length; i++) {
            const cat = body.categories[i];
            await tx.bundleCategory.create({
              data: {
                bundleId: id,
                categoryId: typeof cat === "string" ? cat : cat.categoryId,
                isPrimary: typeof cat === "string" ? i === 0 : cat.isPrimary ?? i === 0,
                sortOrder: i,
              },
            });
          }
        }
      }

      // Items güncelle (önce sil, sonra ekle)
      if (body.items !== undefined) {
        await tx.bundleItem.deleteMany({
          where: { bundleId: id },
        });

        if (body.items && body.items.length > 0) {
          for (let i = 0; i < body.items.length; i++) {
            const item = body.items[i];
            await tx.bundleItem.create({
              data: {
                bundleId: id,
                productId: item.productId,
                variantId: item.variantId || null,
                quantity: item.quantity || 1,
                sortOrder: i,
              },
            });
          }
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
  } catch (error: any) {
    if (error?.code === "P2002") {
      const target = Array.isArray(error?.meta?.target)
        ? error.meta.target.join(",")
        : String(error?.meta?.target ?? "");
      if (target.includes("sku")) {
        return NextResponse.json({ error: "SKU zaten kullanılıyor" }, { status: 409 });
      }
      if (target.includes("slug")) {
        return NextResponse.json({ error: "Bu slug zaten kullanılıyor" }, { status: 409 });
      }
    }
    console.error("Error updating bundle:", error);
    return NextResponse.json(
      { error: "Paket ürün güncellenemedi" },
      { status: 500 }
    );
  }
}

// DELETE - Bundle sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await (prisma.bundle as any).delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Paket ürün silindi",
    });
  } catch (error) {
    console.error("Error deleting bundle:", error);
    return NextResponse.json(
      { error: "Paket ürün silinemedi" },
      { status: 500 }
    );
  }
}

