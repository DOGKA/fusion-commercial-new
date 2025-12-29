import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

// Related product types
interface RelatedProductRelation {
  relationType: string;
  relatedProduct: {
    id: string;
    name: string;
    slug: string;
    price?: number | null;
    comparePrice?: number | null;
    [key: string]: unknown;
  };
}

interface ProductWithRelations {
  relatedFrom?: RelatedProductRelation[];
  variants?: { value?: string; [key: string]: unknown }[];
  [key: string]: unknown;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Next.js 15+ params is a Promise
    const resolvedParams = await context.params;
    const slug = resolvedParams.slug;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variants: {
          where: {
            isActive: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        keyFeatures: {
          orderBy: {
            order: 'asc',
          },
        },
        technicalSpecs: {
          orderBy: {
            order: 'asc',
          },
        },
        // Kategori bazlı teknik özellik değerleri
        productFeatureValues: {
          orderBy: {
            displayOrder: 'asc',
          },
          include: {
            feature: {
              select: {
                id: true,
                name: true,
                slug: true,
                inputType: true,
                unit: true,
              },
            },
          },
        },
        reviews: {
          where: {
            isApproved: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 50,
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        // İlişkili ürünler
        relatedFrom: {
          orderBy: {
            priority: 'asc',
          },
          include: {
            relatedProduct: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                comparePrice: true,
                images: true,
                thumbnail: true,
                brand: true,
                stock: true,
                freeShipping: true,
                shortDescription: true,
                // Varyant bilgileri - frontend'de varyant seçimi için gerekli
                variants: {
                  where: { isActive: true },
                  select: {
                    id: true,
                    name: true,
                    type: true,
                    value: true,
                    colorCode: true,
                    image: true,
                    stock: true,
                    isActive: true,
                  },
                  orderBy: { createdAt: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Ürün bulunamadı" },
        { status: 404 }
      );
    }

    // İlişkili ürünleri türlerine göre ayır
    const productWithRelations = product as unknown as ProductWithRelations;
    const frequentlyBought = productWithRelations.relatedFrom
      ?.filter((r: RelatedProductRelation) => r.relationType === 'FREQUENTLY_BOUGHT')
      .map((r: RelatedProductRelation) => ({
        ...r.relatedProduct,
        price: r.relatedProduct.price ? Number(r.relatedProduct.price) : 0,
        comparePrice: r.relatedProduct.comparePrice ? Number(r.relatedProduct.comparePrice) : null,
      })) || [];

    const alsoViewed = productWithRelations.relatedFrom
      ?.filter((r: RelatedProductRelation) => r.relationType === 'ALSO_VIEWED')
      .map((r: RelatedProductRelation) => ({
        ...r.relatedProduct,
        price: r.relatedProduct.price ? Number(r.relatedProduct.price) : 0,
        comparePrice: r.relatedProduct.comparePrice ? Number(r.relatedProduct.comparePrice) : null,
      })) || [];

    // Varyantları sırala (08, 09, 10, 11 veya S, M, L, XL)
    const sortedVariants = [...(product.variants || [])].sort((a, b) => {
      const sizeOrder: Record<string, number> = { 'S': 1, 'M': 2, 'L': 3, 'XL': 4, 'XXL': 5 };
      const aVal = a.value || '';
      const bVal = b.value || '';
      
      // Eğer ikisi de harf beden ise
      if (sizeOrder[aVal] && sizeOrder[bVal]) {
        return sizeOrder[aVal] - sizeOrder[bVal];
      }
      
      // Eğer ikisi de sayı ise
      const aNum = parseInt(aVal.replace(/^0+/, ''), 10);
      const bNum = parseInt(bVal.replace(/^0+/, ''), 10);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      
      // Fallback: string karşılaştırma
      return aVal.localeCompare(bVal);
    });

    // Decimal değerleri number'a çevir
    const productCopy = { ...product } as Record<string, unknown>;
    delete productCopy.relatedFrom; // relatedFrom'u hariç tut
    
    const productData = {
      ...productCopy,
      variants: sortedVariants,
      price: product.price ? Number(product.price) : 0,
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      costPrice: product.costPrice ? Number(product.costPrice) : null,
      weight: product.weight ? Number(product.weight) : null,
      // İlişkili ürünler
      frequentlyBought,
      alsoViewed,
    };

    // Return product with all details
    return NextResponse.json(productData);
  } catch (error: unknown) {
    console.error("Error fetching product:", error);
    const errorMessage = error instanceof Error ? error.message : "Bilinmeyen hata";
    return NextResponse.json(
      { error: "Bir hata oluştu", details: errorMessage },
      { status: 500 }
    );
  }
}
