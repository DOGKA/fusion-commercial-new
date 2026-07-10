import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

// GET - Tek ürün getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        keyFeatures: true,
        technicalSpecs: true,
        relatedFrom: {
          orderBy: { priority: 'asc' },
        },
        // Kategori bazlı teknik özellik değerleri
        productFeatureValues: {
          orderBy: { displayOrder: 'asc' },
          include: {
            feature: {
              include: {
                presetValues: {
                  orderBy: { order: 'asc' },
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

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Error fetching product:", error);
    console.error("Error details:", error?.message, error?.stack);
    return NextResponse.json(
      { error: "Ürün getirilemedi", details: error?.message },
      { status: 500 }
    );
  }
}

// PUT - Ürün güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    
    // IMPORTANT: Badge fields are ignored here
    // Badges must be managed through /api/products/[id]/badges endpoints only
    // This prevents badge manipulation through product update
    
    // Transaction ile tüm işlemleri atomic yap
    const result = await prisma.$transaction(async (tx) => {
      // Sadece gönderilen değerleri güncelle
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (body.name !== undefined) updateData.name = body.name;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.shortDescription !== undefined) updateData.shortDescription = body.shortDescription;
      if (body.price !== undefined) updateData.price = body.price;
      if (body.comparePrice !== undefined) updateData.comparePrice = body.comparePrice;
      
      // SKU uniqueness kontrolü
      if (body.sku !== undefined) {
        const skuTrimmed = body.sku?.trim() || null;
        if (skuTrimmed) {
          // SKU zaten kullanılıyor mu kontrol et (kendi ID'si hariç)
          const existingSku = await (tx.product as any).findFirst({
            where: {
              sku: skuTrimmed,
              NOT: { id },
            },
          });
          
          if (existingSku) {
            // SKU duplicate, suffix ekle
            const suffix = Math.random().toString(36).substring(2, 5);
            updateData.sku = `${skuTrimmed}-${suffix}`;
          } else {
            updateData.sku = skuTrimmed;
          }
        } else {
          updateData.sku = null;
        }
      }
      
      if (body.stock !== undefined) updateData.stock = body.stock;
      if (body.brand !== undefined) updateData.brand = body.brand;
      
      // CategoryId validation - kategori var mı kontrol et
      if (body.categoryId !== undefined) {
        console.log('📦 CategoryId received:', body.categoryId);
        
        if (body.categoryId) {
          const categoryExists = await (tx.category as any).findUnique({
            where: { id: body.categoryId },
          });
          console.log('📦 Category exists:', !!categoryExists, categoryExists?.name);
          
          if (categoryExists) {
            updateData.categoryId = body.categoryId;
            console.log('✅ CategoryId will be updated to:', body.categoryId);
          } else {
            console.log('⚠️ Category not found, skipping categoryId update');
          }
        } else {
          console.log('⚠️ CategoryId is null/empty, skipping');
        }
      } else {
        console.log('⚠️ CategoryId not in payload');
      }
      
      if (body.weight !== undefined) updateData.weight = body.weight;
      if (body.dimensions !== undefined) updateData.dimensions = body.dimensions;
      if (body.metaTitle !== undefined) updateData.metaTitle = body.metaTitle;
      if (body.metaDescription !== undefined) updateData.metaDescription = body.metaDescription;
      if (body.isActive !== undefined) updateData.isActive = body.isActive;
      if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
      if (body.isNew !== undefined) updateData.isNew = body.isNew;
      if (body.freeShipping !== undefined) updateData.freeShipping = body.freeShipping;
      if (body.shippingClassId !== undefined) updateData.shippingClassId = body.shippingClassId || null;
      if (body.thumbnail !== undefined) updateData.thumbnail = body.thumbnail;
      if (body.images !== undefined) updateData.images = body.images;
      if (body.videoUrl !== undefined) updateData.videoUrl = body.videoUrl;
      if (body.productType !== undefined) updateData.productType = body.productType;
      if (body.saleEndDate !== undefined) updateData.saleEndDate = body.saleEndDate ? new Date(body.saleEndDate) : null;

      const product = await tx.product.update({
        where: { id },
        data: updateData,
      });

      // Variants güncelleme (variable ürünler için)
      // NOT: Frontend'den variants array gelmezse mevcut varyantlar korunur
      // Boş array gelirse (örn. ürün tipi variable -> simple çevrildiğinde) tüm varyantlar silinir
      if (Array.isArray(body.variants) && body.variants.length === 0) {
        await (tx.productVariant as any).deleteMany({
          where: { productId: id },
        });
      } else if (body.variants && Array.isArray(body.variants) && body.variants.length > 0) {
        // Mevcut varyantları al (cast to any for combinationKey)
        const existingVariants = await (tx.productVariant as any).findMany({
          where: { productId: id },
        });

        // Mevcut varyant ID'lerini al
        const existingIds = new Set(existingVariants.map((v: any) => v.id));
        // Frontend'den gelen ID'ler
        const incomingIds = new Set(body.variants.map((v: any) => v.id).filter((id: any) => id && existingIds.has(id)));

        // Artık gönderilmeyen varyantları sil (sadece mevcut olanları sil, yeni eklenenler hariç)
        const idsToDelete = [...existingIds].filter(existingId => !incomingIds.has(existingId));
        if (idsToDelete.length > 0) {
          await (tx.productVariant as any).deleteMany({
            where: {
              productId: id,
              id: { in: idsToDelete },
            },
          });
        }

        // Varyantları upsert et
        for (const variant of body.variants) {
          // Önce ID ile kontrol et (mevcut varyant güncelleme)
          let existing = null;
          if (variant.id && existingIds.has(variant.id)) {
            existing = await (tx.productVariant as any).findFirst({
              where: {
                id: variant.id,
                productId: id,
              },
            });
          }
          
          // ID ile bulunamadıysa combinationKey ile dene
          if (!existing && variant.combinationKey) {
            existing = await (tx.productVariant as any).findFirst({
              where: {
                productId: id,
                combinationKey: variant.combinationKey,
              },
            });
          }

          // SKU oluştur - her zaman unique olacak şekilde
          let finalSku = variant.sku?.trim() || null;
          
          if (!finalSku || finalSku === 'SKU ekle') {
            // SKU boş veya placeholder, unique oluştur
            const timestamp = Date.now().toString(36);
            const random = Math.random().toString(36).substring(2, 8);
            finalSku = `VAR-${timestamp}${random}`.toUpperCase();
          } else {
            // Mevcut SKU var, uniqueness kontrolü
            let attempts = 0;
            let baseSku = finalSku;
            
            while (attempts < 5) {
              const skuExists = await (tx.productVariant as any).findFirst({
                where: {
                  sku: finalSku,
                  NOT: existing ? { id: existing.id } : undefined,
                },
              });
              
              if (!skuExists) break;
              
              // SKU duplicate, suffix ekle
              attempts++;
              const suffix = Math.random().toString(36).substring(2, 5);
              finalSku = `${baseSku}-${suffix}`;
            }
            
            // 5 denemeden sonra hala duplicate ise, tamamen yeni SKU
            if (attempts >= 5) {
              const timestamp = Date.now().toString(36);
              const random = Math.random().toString(36).substring(2, 8);
              finalSku = `VAR-${timestamp}${random}`.toUpperCase();
            }
          }

          const variantData = {
            combinationKey: variant.combinationKey || null,
            name: Object.values(variant.combination).join(' / ') || null,
            sku: finalSku,
            price: variant.price ? parseFloat(variant.price) : null,
            salePrice: variant.salePrice ? parseFloat(variant.salePrice) : null,
            stock: variant.stock ? parseInt(variant.stock) : 0,
            image: variant.image || null,
            isActive: variant.isActive ?? true,
            // Squircle görünüm değerleri
            type: variant.colorCode ? 'color' : 'size',
            value: variant.displayValue || Object.values(variant.combination)[0] || '',
            colorCode: variant.colorCode || null,
          };

          if (existing) {
            // Güncelle
            await (tx.productVariant as any).update({
              where: { id: existing.id },
              data: variantData,
            });
          } else {
            // Yeni oluştur
            await (tx.productVariant as any).create({
              data: {
                ...variantData,
                productId: id,
              },
            });
          }
        }
      }

      // İlişkili ürünleri güncelle (Bağlantılı Ürünler)
      if (body.frequentlyBoughtTogether !== undefined || 
          body.customersAlsoViewed !== undefined ||
          body.upsellProducts !== undefined ||
          body.crossSellProducts !== undefined) {
        
        // Mevcut ilişkileri sil
        await (tx as any).relatedProduct.deleteMany({
          where: { productId: id },
        });
        
        // Yeni ilişkileri ekle
        const relationsToCreate: any[] = [];
        
        if (body.frequentlyBoughtTogether && Array.isArray(body.frequentlyBoughtTogether)) {
          body.frequentlyBoughtTogether.forEach((relatedId: string, idx: number) => {
            relationsToCreate.push({
              productId: id,
              relatedProductId: relatedId,
              relationType: 'FREQUENTLY_BOUGHT',
              priority: idx,
              isAutoGenerated: false,
            });
          });
        }
        
        if (body.customersAlsoViewed && Array.isArray(body.customersAlsoViewed)) {
          body.customersAlsoViewed.forEach((relatedId: string, idx: number) => {
            relationsToCreate.push({
              productId: id,
              relatedProductId: relatedId,
              relationType: 'ALSO_VIEWED',
              priority: idx,
              isAutoGenerated: false,
            });
          });
        }
        
        if (body.upsellProducts && Array.isArray(body.upsellProducts)) {
          body.upsellProducts.forEach((relatedId: string, idx: number) => {
            relationsToCreate.push({
              productId: id,
              relatedProductId: relatedId,
              relationType: 'UPSELL',
              priority: idx,
              isAutoGenerated: false,
            });
          });
        }
        
        if (body.crossSellProducts && Array.isArray(body.crossSellProducts)) {
          body.crossSellProducts.forEach((relatedId: string, idx: number) => {
            relationsToCreate.push({
              productId: id,
              relatedProductId: relatedId,
              relationType: 'CROSS_SELL',
              priority: idx,
              isAutoGenerated: false,
            });
          });
        }
        
        if (relationsToCreate.length > 0) {
          await (tx as any).relatedProduct.createMany({
            data: relationsToCreate,
          });
        }
      }

      // Teknik Özellik Değerlerini güncelle (productFeatureValues)
      if (body.productFeatureValues !== undefined && Array.isArray(body.productFeatureValues)) {
        // Mevcut değerleri sil
        await (tx as any).productFeatureValue.deleteMany({
          where: { productId: id },
        });

        // Yeni değerleri ekle
        const featureValuesToCreate = body.productFeatureValues
          .filter((fv: any) => fv.featureId && (fv.value || fv.value === 0))
          .map((fv: any, index: number) => {
            // inputType'a göre valueText veya valueNumber'a kaydet
            const isNumber = typeof fv.value === 'number' || 
              (!isNaN(parseFloat(fv.value)) && fv.inputType === 'NUMBER');
            
            return {
              productId: id,
              featureId: fv.featureId,
              valueText: isNumber ? null : String(fv.value),
              valueNumber: isNumber ? parseFloat(fv.value) : null,
              unit: fv.unit || null,
              displayOrder: fv.displayOrder ?? index,
            };
          });

        if (featureValuesToCreate.length > 0) {
          await (tx as any).productFeatureValue.createMany({
            data: featureValuesToCreate,
          });
        }
      }

      return product;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error updating product:", error);
    console.error("Error details:", error?.message, error?.stack);
    return NextResponse.json(
      { error: "Ürün güncellenemedi", details: error?.message },
      { status: 500 }
    );
  }
}

// PATCH - Ürün kısmi güncelle (isFeatured toggle için)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Sadece gönderilen alanları güncelle
    const updateData: any = {};
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.isNew !== undefined) updateData.isNew = body.isNew;
    
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error patching product:", error);
    return NextResponse.json(
      { error: "Ürün güncellenemedi" },
      { status: 500 }
    );
  }
}

// DELETE - Ürün sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Ürün silinemedi" },
      { status: 500 }
    );
  }
}
