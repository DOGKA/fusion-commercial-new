/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    // Next.js 15+ params is a Promise, handle both cases
    const resolvedParams = context.params?.slug 
      ? context.params 
      : await context.params;
    const slug = resolvedParams?.slug;

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
    const frequentlyBought = (product as any).relatedFrom
      ?.filter((r: any) => r.relationType === 'FREQUENTLY_BOUGHT')
      .map((r: any) => ({
        ...r.relatedProduct,
        price: r.relatedProduct.price ? Number(r.relatedProduct.price) : 0,
        comparePrice: r.relatedProduct.comparePrice ? Number(r.relatedProduct.comparePrice) : null,
      })) || [];

    const alsoViewed = (product as any).relatedFrom
      ?.filter((r: any) => r.relationType === 'ALSO_VIEWED')
      .map((r: any) => ({
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
    const productData = {
      ...product,
      variants: sortedVariants,
      price: product.price ? Number(product.price) : 0,
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      costPrice: product.costPrice ? Number(product.costPrice) : null,
      weight: product.weight ? Number(product.weight) : null,
      // İlişkili ürünler
      frequentlyBought,
      alsoViewed,
    };

    // relatedFrom'u response'dan kaldır
    delete (productData as any).relatedFrom;

    // Return product with all details
    return NextResponse.json(productData);
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu", details: error.message },
      { status: 500 }
    );
  }
}
