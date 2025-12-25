import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";

// GET - Tüm ürünleri getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured");
    const bestseller = searchParams.get("bestseller");
    const limit = parseInt(searchParams.get("limit") || "100");

    let whereClause: any = {};
    let orderBy: any = { createdAt: "desc" };

    if (featured === "true") {
      whereClause.isFeatured = true;
      whereClause.isActive = true;
    }

    if (bestseller === "true") {
      whereClause.isActive = true;
      // Stok satışına göre sırala (stock düşük olanlar daha çok satılmış varsayılabilir)
      // Ya da soldCount varsa onu kullanabiliriz
    }

    // Cast to any to avoid Prisma type issues with generated client
    const products = await (prisma.product as any).findMany({
      where: whereClause,
      include: {
        category: true,
        productBadges: {
          include: {
            badge: true,
          },
          orderBy: {
            position: 'asc',
          },
        },
        // Variants for ProductCard preview (size swatches)
        variants: {
          where: { isActive: true },
          take: 5,
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy,
      take: limit,
    });

    // Transform products for API response
    // Orijinal ProductCard ile birebir uyum için tüm alanlar
    const transformedProducts = products.map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
      saleEndDate: p.saleEndDate,
      stock: p.stock,
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      isNew: p.isNew,
      freeShipping: p.freeShipping,
      thumbnail: p.thumbnail,
      brand: p.brand,
      createdAt: p.createdAt,
      // ProductCard önizleme için ek alanlar
      shortDescription: p.shortDescription || null,
      videoUrl: p.videoUrl || null,
      ratingAverage: p.ratingAverage ? Number(p.ratingAverage) : null,
      ratingCount: p.ratingCount ? Number(p.ratingCount) : null,
      // Variants - ProductCard'daki size swatches için
      variants: p.variants?.map((v: any) => ({
        id: v.id,
        name: v.name,
        type: 'size', // Default to size for now
        value: v.name?.split(' / ')?.[0] || v.name || '',
        inStock: v.stock > 0,
        color: null,
        image: v.image,
      })) || [],
      category: p.category ? { name: p.category.name } : null,
      productBadges: p.productBadges,
    }));

    return NextResponse.json({ products: transformedProducts });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Ürünler getirilemedi" },
      { status: 500 }
    );
  }
}

// POST - Yeni ürün oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // IMPORTANT: Badge fields are ignored here
    // Badges must be managed through /api/products/[id]/badges endpoints only
    // This prevents badge manipulation through product creation
    
    // Transaction ile tüm işlemleri atomic yap
    // Cast to any to avoid Prisma type issues
    const result = await prisma.$transaction(async (tx: any) => {
      // Ürün oluştur
      const product = await tx.product.create({
        data: {
          name: body.name,
          slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
          description: body.description || null,
          shortDescription: body.shortDescription || null,
          price: body.price ? parseFloat(body.price) : 0,
          comparePrice: body.comparePrice ? parseFloat(body.comparePrice) : null,
          saleEndDate: body.saleEndDate ? new Date(body.saleEndDate) : null,
          sku: body.sku || null,
          stock: body.stock ? parseInt(body.stock) : 0,
          brand: body.brand || null,
          weight: body.weight ? parseFloat(body.weight) : null,
          dimensions: body.dimensions || null,
          metaTitle: body.metaTitle || null,
          metaDescription: body.metaDescription || null,
          isActive: body.isActive ?? true,
          isFeatured: body.isFeatured ?? false,
          isNew: body.isNew ?? false,
          freeShipping: body.freeShipping ?? false,
          thumbnail: body.thumbnail || null,
          images: body.images || [],
          productType: body.productType || 'SIMPLE',
          categoryId: body.categoryId || 'default-category-id', // TODO: Handle category properly
        },
      });

      // Variants oluştur (variable ürünler için)
      if (body.variants && Array.isArray(body.variants) && body.variants.length > 0) {
        for (const variant of body.variants) {
          await tx.productVariant.create({
            data: {
              productId: product.id,
              combinationKey: variant.combinationKey,
              name: Object.values(variant.combination || {}).join(' / '),
              sku: variant.sku || null,
              price: variant.price ? parseFloat(variant.price) : null,
              salePrice: variant.salePrice ? parseFloat(variant.salePrice) : null,
              stock: variant.stock ? parseInt(variant.stock) : 0,
              image: variant.image || null,
              isActive: variant.isActive ?? true,
            },
          });
        }
      }

      return product;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Ürün oluşturulamadı" },
      { status: 500 }
    );
  }
}
