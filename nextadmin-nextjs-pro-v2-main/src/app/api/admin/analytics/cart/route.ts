/**
 * GET /api/admin/analytics/cart
 *
 * Sepet ve sipariş analizleri.
 *
 * BU UÇTA TAHMİN/SABİT DEĞER YOK. Önceki sürüm ekranın yarısını uyduruyordu:
 * ürün dönüşüm oranı `Math.random()` ile üretiliyor, huni basamakları sipariş
 * sayısının 8 / 2,5 / 1,3 katı olarak hesaplanıyor, cihaz dağılımı ile terk
 * sebepleri ise kodda sabit yazılıyordu. Hepsi kaldırıldı.
 *
 * Ölçülmediği için burada OLMAYAN metrikler: ürün görüntüleme sayısı, sepete
 * ekleme oranı, ödeme başlatma sayısı, cihaz dağılımı, terk sebebi, saat bazlı
 * yoğunluk. Bunlar için olay (event) tablosu gerekiyor; sepete ekleme şu anda
 * yalnızca Google Ads'e gönderiliyor, veritabanına yazılmıyor.
 *
 * Sepet sayıları `Cart` tablosundan geliyor ve yalnızca GİRİŞ YAPMIŞ
 * kullanıcıları kapsıyor — misafir sepetleri sunucuya hiç yazılmıyor.
 */

import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

export const dynamic = "force-dynamic";

// abandoned-carts ekranıyla aynı eşik kullanılıyor; iki sayfanın farklı sayı
// göstermemesi için burada da 7 gün.
const ABANDONED_DAYS = 7;

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Beklemede",
  PROCESSING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal Edildi",
  REFUNDED: "İade Edildi",
};

function percentChange(current: number, previous: number): number | null {
  // Önceki dönem sıfırsa yüzde değişim tanımsız. Eskiden bu durumda 0
  // gösteriliyordu, "değişim yok" gibi okunuyordu; artık null dönüp arayüzde
  // tire gösteriliyor.
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export async function GET() {
  try {
    // Bu uçta oturum kontrolü yoktu: ciro ve sipariş sayıları kimlik
    // doğrulaması olmadan okunabiliyordu.
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
    }
    const userRole = (session.user as { role?: string }).role;
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Bu işlem için yetkiniz yok" }, { status: 403 });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const abandonedThreshold = new Date();
    abandonedThreshold.setDate(abandonedThreshold.getDate() - ABANDONED_DAYS);

    const paidOnly = { paymentStatus: "PAID" as const };

    const [
      totalOrders,
      cancelledOrders,
      paidAllTime,
      paidCurrentMonth,
      paidLastMonth,
      statusGroups,
      todayOrders,
      weekOrders,
      monthOrders,
      topProducts,
      activeCarts,
      abandonedCarts,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "CANCELLED" } }),
      // Ortalama sipariş değeri ve ciro yalnızca ödenmiş siparişlerden.
      // ESKİ HATA: pay ödenmiş siparişlerin cirosu, bölen ise TÜM siparişlerdi;
      // ortalama sistematik olarak düşük çıkıyordu.
      prisma.order.aggregate({ where: paidOnly, _sum: { total: true }, _count: true }),
      prisma.order.aggregate({
        where: { ...paidOnly, createdAt: { gte: monthStart } },
        _sum: { total: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: { ...paidOnly, createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
        _sum: { total: true },
        _count: true,
      }),
      prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.order.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.order.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        _count: { _all: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 10,
      }),
      prisma.cart.count({
        where: { items: { some: {} }, updatedAt: { gte: abandonedThreshold } },
      }),
      prisma.cart.count({
        where: { items: { some: {} }, updatedAt: { lt: abandonedThreshold } },
      }),
    ]);

    const productIds = topProducts
      .map((p) => p.productId)
      .filter((id): id is string => Boolean(id));

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, thumbnail: true, price: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const paidCount = paidAllTime._count;
    const paidRevenue = Number(paidAllTime._sum.total || 0);
    const currentMonthPaidCount = paidCurrentMonth._count;
    const currentMonthRevenue = Number(paidCurrentMonth._sum.total || 0);
    const lastMonthPaidCount = paidLastMonth._count;
    const lastMonthRevenue = Number(paidLastMonth._sum.total || 0);

    const avgAllTime = paidCount > 0 ? paidRevenue / paidCount : 0;
    const avgCurrentMonth =
      currentMonthPaidCount > 0 ? currentMonthRevenue / currentMonthPaidCount : 0;
    const avgLastMonth = lastMonthPaidCount > 0 ? lastMonthRevenue / lastMonthPaidCount : 0;

    const statusDistribution = statusGroups
      .map((group) => ({
        status: group.status,
        label: STATUS_LABELS[group.status] ?? group.status,
        count: group._count._all,
        percent: totalOrders > 0 ? Math.round((group._count._all / totalOrders) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      generatedAt: now.toISOString(),
      orders: {
        total: totalOrders,
        paid: paidCount,
        cancelled: cancelledOrders,
      },
      rates: {
        // Ödenmiş sipariş / toplam sipariş. "Satın alma oranı" DEĞİL — ziyaretçi
        // sayısı ölçülmediği için ziyaretçi bazlı bir oran hesaplanamıyor.
        paidRate: totalOrders > 0 ? Math.round((paidCount / totalOrders) * 100) : 0,
        // İptal edilmiş sipariş / toplam sipariş. Eskiden bu değer "Sepet Terk
        // Oranı" olarak gösteriliyordu; sepet terkiyle ilgisi yok.
        cancellationRate:
          totalOrders > 0 ? Math.round((cancelledOrders / totalOrders) * 100) : 0,
      },
      avgOrderValue: {
        allTime: Math.round(avgAllTime),
        currentMonth: Math.round(avgCurrentMonth),
        lastMonth: Math.round(avgLastMonth),
        // Aynı formülün iki dönemi karşılaştırılıyor. Eskiden tüm zamanların
        // ortalaması geçen ayın ortalamasıyla karşılaştırılıyordu.
        change: percentChange(avgCurrentMonth, avgLastMonth),
      },
      revenue: {
        paidAllTime: Math.round(paidRevenue),
        currentMonth: Math.round(currentMonthRevenue),
        lastMonth: Math.round(lastMonthRevenue),
        change: percentChange(currentMonthRevenue, lastMonthRevenue),
      },
      statusDistribution,
      timeStats: {
        todayOrders,
        weekOrders,
        monthOrders,
        totalOrders,
      },
      topProducts: topProducts.map((item) => {
        const product = item.productId ? productMap.get(item.productId) : null;
        return {
          id: item.productId,
          name: product?.name || "Silinmiş ürün",
          thumbnail: product?.thumbnail || null,
          price: Number(product?.price || 0),
          quantitySold: item._sum.quantity || 0,
          orderCount: item._count._all,
        };
      }),
      carts: {
        active: activeCarts,
        abandoned: abandonedCarts,
        thresholdDays: ABANDONED_DAYS,
      },
    });
  } catch (error) {
    console.error("Error fetching cart analytics:", error);
    return NextResponse.json(
      { error: "Sepet analizleri getirilemedi" },
      { status: 500 }
    );
  }
}
