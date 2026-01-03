import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";

// GET - Tek bundle detayı (frontend için)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const bundle = await (prisma.bundle as any).findFirst({
      where: { 
        slug,
        isActive: true,
      },
      include: {
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
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
                shortDescription: true,
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

    // Stok hesaplama
    const minStock = bundle.items.length > 0
      ? Math.min(
          ...bundle.items.map((item: any) =>
            Math.floor((item.product?.stock || 0) / item.quantity)
          )
        )
      : 0;

    // Ürünlerin toplam değeri
    const totalValue = bundle.items.reduce((sum: number, item: any) => {
      return sum + (Number(item.product?.price || 0) * item.quantity);
    }, 0);

    // Kategorileri düzenle
    const categories = bundle.categories.map((bc: any) => ({
      id: bc.category.id,
      name: bc.category.name,
      slug: bc.category.slug,
      isPrimary: bc.isPrimary,
    }));

    // Ana kategori (breadcrumb için)
    const primaryCategory = categories.find((c: any) => c.isPrimary) || categories[0] || null;

    // Bundle items'ı düzenle
    const items = bundle.items.map((item: any) => ({
      id: item.id,
      quantity: item.quantity,
      product: item.product
        ? {
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            thumbnail: item.product.thumbnail,
            price: Number(item.product.price),
            comparePrice: item.product.comparePrice
              ? Number(item.product.comparePrice)
              : null,
            stock: item.product.stock,
            brand: item.product.brand,
            shortDescription: item.product.shortDescription,
          }
        : null,
    }));

    // Galeri görselleri (bundle görselleri + ürün görselleri)
    const images: string[] = [];
    if (bundle.thumbnail) images.push(bundle.thumbnail);
    if (bundle.images && bundle.images.length > 0) {
      images.push(...bundle.images);
    }
    // Ürün thumbnaillerini de ekle (alternatif görsel olarak)
    items.forEach((item: any) => {
      if (item.product?.thumbnail && !images.includes(item.product.thumbnail)) {
        images.push(item.product.thumbnail);
      }
    });

    return NextResponse.json({
      id: bundle.id,
      name: bundle.name,
      slug: bundle.slug,
      description: bundle.description,
      shortDescription: bundle.shortDescription,
      price: Number(bundle.price),
      comparePrice: bundle.comparePrice ? Number(bundle.comparePrice) : totalValue,
      pricingType: bundle.pricingType,
      thumbnail: bundle.thumbnail,
      images,
      videoUrl: bundle.videoUrl,
      brand: bundle.brand,
      sku: bundle.sku,
      isActive: bundle.isActive,
      isFeatured: bundle.isFeatured,
      metaTitle: bundle.metaTitle,
      metaDescription: bundle.metaDescription,
      metaKeywords: bundle.metaKeywords,
      
      // Hesaplanan değerler
      stock: minStock,
      totalValue,
      savings: totalValue - Number(bundle.price),
      savingsPercent: totalValue > 0 
        ? Math.round(((totalValue - Number(bundle.price)) / totalValue) * 100) 
        : 0,
      
      // İlişkiler
      categories,
      category: primaryCategory, // Ana kategori (breadcrumb için)
      items,
      itemCount: items.length,
      
      // Bundle olduğunu belirt
      isBundle: true,
      
      createdAt: bundle.createdAt,
      updatedAt: bundle.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching bundle:", error);
    return NextResponse.json(
      { error: "Paket ürün getirilemedi" },
      { status: 500 }
    );
  }
}

