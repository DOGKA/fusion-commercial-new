import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

/**
 * POST /api/admin/cleanup-variants
 * Tüm ürünlerdeki duplike varyantları temizle
 */
export async function POST() {
  try {
    console.log('🧹 Duplike varyantları temizleme başlıyor...');

    // Tüm ürünleri al
    const products = await prisma.product.findMany({
      select: { id: true, name: true },
    });

    let totalDeleted = 0;
    const results: any[] = [];

    for (const product of products) {
      // Bu ürünün varyantlarını al
      const variants = await (prisma as any).productVariant.findMany({
        where: { productId: product.id },
        orderBy: { createdAt: 'asc' },
      });

      if (variants.length <= 1) continue;

      // Değere göre grupla
      const groupedByValue = new Map<string, any[]>();
      
      for (const variant of variants) {
        const key = variant.value || variant.name || 'unknown';
        if (!groupedByValue.has(key)) {
          groupedByValue.set(key, []);
        }
        groupedByValue.get(key)!.push(variant);
      }

      // Her grup için sadece ilkini tut
      const toDelete: string[] = [];
      
      for (const [value, group] of groupedByValue) {
        if (group.length > 1) {
          const [keep, ...duplicates] = group;
          toDelete.push(...duplicates.map((d: any) => d.id));
        }
      }

      if (toDelete.length > 0) {
        await (prisma as any).productVariant.deleteMany({
          where: { id: { in: toDelete } },
        });
        totalDeleted += toDelete.length;
        results.push({
          product: product.name.substring(0, 40),
          deleted: toDelete.length,
        });
      }
    }

    console.log(`✅ Toplam ${totalDeleted} duplike varyant silindi!`);

    return NextResponse.json({
      success: true,
      totalDeleted,
      results,
    });
  } catch (error: any) {
    console.error('❌ Cleanup error:', error);
    return NextResponse.json(
      { error: error.message || "Cleanup failed" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/cleanup-variants
 * Duplike varyant sayısını göster (dry run)
 */
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: { id: true, name: true },
    });

    let totalDuplicates = 0;
    const results: any[] = [];

    for (const product of products) {
      const variants = await (prisma as any).productVariant.findMany({
        where: { productId: product.id },
        orderBy: { createdAt: 'asc' },
      });

      if (variants.length <= 1) continue;

      const groupedByValue = new Map<string, any[]>();
      
      for (const variant of variants) {
        const key = variant.value || variant.name || 'unknown';
        if (!groupedByValue.has(key)) {
          groupedByValue.set(key, []);
        }
        groupedByValue.get(key)!.push(variant);
      }

      let productDuplicates = 0;
      for (const [value, group] of groupedByValue) {
        if (group.length > 1) {
          productDuplicates += group.length - 1;
        }
      }

      if (productDuplicates > 0) {
        totalDuplicates += productDuplicates;
        results.push({
          product: product.name.substring(0, 40),
          duplicates: productDuplicates,
          total: variants.length,
        });
      }
    }

    return NextResponse.json({
      totalDuplicates,
      affectedProducts: results.length,
      results,
    });
  } catch (error: any) {
    console.error('❌ Check error:', error);
    return NextResponse.json(
      { error: error.message || "Check failed" },
      { status: 500 }
    );
  }
}
