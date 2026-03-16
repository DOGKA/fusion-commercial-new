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
        name: v.type || v.name || 'Varyasyon', // Attribute adı (örn: "Eldiven Numarası", "Renk")
        type: v.type || 'size',
        value: v.value || v.name?.split(' / ')?.[0] || '', // Gerçek değer (örn: "09", "Beyaz")
        stock: v.stock ?? 0,
        inStock: (v.stock ?? 0) > 0,
        color: v.colorCode || null,
        image: v.image,
        price: v.price ? Number(v.price) : null,
      })) || [],
      categoryId: p.categoryId || null,
      category: p.category ? { id: p.category.id, name: p.category.name } : null,
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
          brand: body.brandName || body.brand || null,
          weight: body.weight ? parseFloat(body.weight) : null,
          dimensions: body.dimensions ? JSON.stringify(body.dimensions) : null,
          metaTitle: body.seo?.title || body.metaTitle || null,
          metaDescription: body.seo?.description || body.metaDescription || null,
          metaKeywords: body.tags || [],
          isActive: body.status === 'PUBLISHED' || (body.isActive ?? true),
          isFeatured: body.isFeatured ?? false,
          isNew: body.isNew ?? false,
          freeShipping: body.freeShipping ?? false,
          thumbnail: body.thumbnail || null,
          images: body.images || [],
          videoUrl: body.video || body.videoUrl || null,
          productType: body.productType === 'variable' ? 'VARIABLE' : 'SIMPLE',
          categoryId: body.categoryId,
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

      // Key Features oluştur (ürün öne çıkan özellikleri)
      if (body.features && Array.isArray(body.features)) {
        for (let i = 0; i < body.features.length; i++) {
          const feature = body.features[i];
          await tx.keyFeature.create({
            data: {
              productId: product.id,
              title: feature.title,
              icon: feature.svg || null,
              order: i,
            },
          });
        }
      }

      // Technical Features oluştur (kategori bazlı teknik özellikler)
      if (body.technicalFeatures && Array.isArray(body.technicalFeatures)) {
        for (const techFeature of body.technicalFeatures) {
          if (!techFeature.featureId || !techFeature.value) continue;
          
          await tx.productFeatureValue.create({
            data: {
              productId: product.id,
              featureId: techFeature.featureId,
              valueText: techFeature.value,
              displayOrder: 0,
            },
          });
        }
      }

      // Related Products oluştur
      if (body.linkedProducts) {
        const relations = [];
        
        if (body.linkedProducts.frequentlyBoughtTogether) {
          relations.push(...body.linkedProducts.frequentlyBoughtTogether.map((relatedId: string) => ({
            productId: product.id,
            relatedProductId: relatedId,
            relationType: 'FREQUENTLY_BOUGHT',
            isAutoGenerated: false,
            priority: 0,
          })));
        }
        
        if (body.linkedProducts.customersAlsoViewed) {
          relations.push(...body.linkedProducts.customersAlsoViewed.map((relatedId: string) => ({
            productId: product.id,
            relatedProductId: relatedId,
            relationType: 'ALSO_VIEWED',
            isAutoGenerated: false,
            priority: 0,
          })));
        }
        
        if (body.linkedProducts.upsellProducts) {
          relations.push(...body.linkedProducts.upsellProducts.map((relatedId: string) => ({
            productId: product.id,
            relatedProductId: relatedId,
            relationType: 'UPSELL',
            isAutoGenerated: false,
            priority: 0,
          })));
        }
        
        if (body.linkedProducts.crossSellProducts) {
          relations.push(...body.linkedProducts.crossSellProducts.map((relatedId: string) => ({
            productId: product.id,
            relatedProductId: relatedId,
            relationType: 'CROSS_SELL',
            isAutoGenerated: false,
            priority: 0,
          })));
        }
        
        // Toplu oluştur
        if (relations.length > 0) {
          await tx.relatedProduct.createMany({
            data: relations,
            skipDuplicates: true,
          });
        }
      }

      return product;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { 
        error: "Ürün oluşturulamadı",
        message: error?.message || "Bilinmeyen hata",
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
