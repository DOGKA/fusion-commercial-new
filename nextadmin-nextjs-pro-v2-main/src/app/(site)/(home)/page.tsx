import { prisma } from "@/libs/prismaDb";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getDashboardStats() {
  // Date calculations
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalProducts,
    activeProducts,
    totalOrders,
    totalCustomers,
    lowStockProducts,
    recentOrders,
    // Order status counts
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    // Revenue stats
    todayOrders,
    weekOrders,
    monthOrders,
    // Total revenue
    totalRevenue,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count({ where: { stock: { lte: 5 } } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
    // Status counts
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "PROCESSING" } }),
    prisma.order.count({ where: { status: "SHIPPED" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    // Today's orders (only PAID)
    prisma.order.aggregate({
      where: { 
        createdAt: { gte: todayStart },
        paymentStatus: "PAID",
      },
      _sum: { total: true },
      _count: true,
    }),
    // Week's orders (only PAID)
    prisma.order.aggregate({
      where: { 
        createdAt: { gte: weekStart },
        paymentStatus: "PAID",
      },
      _sum: { total: true },
      _count: true,
    }),
    // Month's orders (only PAID)
    prisma.order.aggregate({
      where: { 
        createdAt: { gte: monthStart },
        paymentStatus: "PAID",
      },
      _sum: { total: true },
      _count: true,
    }),
    // Total revenue (only PAID)
    prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { total: true },
    }),
  ]);

  return {
    totalProducts,
    activeProducts,
    totalOrders,
    totalCustomers,
    lowStockProducts,
    recentOrders,
    // Order status breakdown
    ordersByStatus: {
      pending: pendingOrders,
      processing: processingOrders,
      shipped: shippedOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders,
    },
    // Revenue stats
    revenue: {
      today: {
        total: Number(todayOrders._sum.total || 0),
        count: todayOrders._count,
      },
      week: {
        total: Number(weekOrders._sum.total || 0),
        count: weekOrders._count,
      },
      month: {
        total: Number(monthOrders._sum.total || 0),
        count: monthOrders._count,
      },
      allTime: Number(totalRevenue._sum.total || 0),
    },
  };
}

export default async function Home() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-white">Dashboard</h1>
        <p className="text-gray-500">FusionMarkt E-Ticaret Yönetim Paneli</p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Toplam Ürün */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">{stats.totalProducts}</p>
              <p className="text-sm text-gray-500">Toplam Ürün</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-green-500">{stats.activeProducts} aktif</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">{stats.totalProducts - stats.activeProducts} pasif</span>
          </div>
        </div>

        {/* Toplam Sipariş */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">{stats.totalOrders}</p>
              <p className="text-sm text-gray-500">Toplam Sipariş</p>
            </div>
          </div>
          <Link href="/orders" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
            Siparişleri Gör
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Toplam Müşteri */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">{stats.totalCustomers}</p>
              <p className="text-sm text-gray-500">Toplam Müşteri</p>
            </div>
          </div>
          <Link href="/customers" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
            Müşterileri Gör
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Düşük Stok */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">{stats.lowStockProducts}</p>
              <p className="text-sm text-gray-500">Düşük Stok</p>
            </div>
          </div>
          <Link href="/products" className="mt-4 inline-flex items-center gap-1 text-sm text-orange-500 hover:underline">
            Stokları Kontrol Et
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Sipariş İstatistikleri */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Bugünkü Ciro */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Bugün</p>
              <p className="text-2xl font-bold text-dark dark:text-white">
                {stats.revenue.today.total.toLocaleString("tr-TR")} ₺
              </p>
              <p className="text-xs text-gray-400 mt-1">{stats.revenue.today.count} sipariş</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Haftalık Ciro */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Son 7 Gün</p>
              <p className="text-2xl font-bold text-dark dark:text-white">
                {stats.revenue.week.total.toLocaleString("tr-TR")} ₺
              </p>
              <p className="text-xs text-gray-400 mt-1">{stats.revenue.week.count} sipariş</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Aylık Ciro */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Bu Ay</p>
              <p className="text-2xl font-bold text-dark dark:text-white">
                {stats.revenue.month.total.toLocaleString("tr-TR")} ₺
              </p>
              <p className="text-xs text-gray-400 mt-1">{stats.revenue.month.count} sipariş</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Toplam Ciro */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Toplam Ciro</p>
              <p className="text-2xl font-bold text-dark dark:text-white">
                {stats.revenue.allTime.toLocaleString("tr-TR")} ₺
              </p>
              <p className="text-xs text-green-500 mt-1">Onaylanan ödemeler</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Sipariş Durumu Dağılımı */}
      <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
        <h3 className="font-semibold text-dark dark:text-white mb-4">Sipariş Durumları</h3>
        <div className="grid grid-cols-5 gap-4">
          <Link href="/orders?status=PENDING" className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-500/10 hover:bg-yellow-100 dark:hover:bg-yellow-500/20 transition-colors">
            <p className="text-2xl font-bold text-yellow-600">{stats.ordersByStatus.pending}</p>
            <p className="text-xs text-yellow-600/70 mt-1">Beklemede</p>
          </Link>
          <Link href="/orders?status=PROCESSING" className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
            <p className="text-2xl font-bold text-blue-600">{stats.ordersByStatus.processing}</p>
            <p className="text-xs text-blue-600/70 mt-1">Hazırlanıyor</p>
          </Link>
          <Link href="/orders?status=SHIPPED" className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors">
            <p className="text-2xl font-bold text-purple-600">{stats.ordersByStatus.shipped}</p>
            <p className="text-xs text-purple-600/70 mt-1">Kargoda</p>
          </Link>
          <Link href="/orders?status=DELIVERED" className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-500/10 hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors">
            <p className="text-2xl font-bold text-green-600">{stats.ordersByStatus.delivered}</p>
            <p className="text-xs text-green-600/70 mt-1">Teslim Edildi</p>
          </Link>
          <Link href="/orders?status=CANCELLED" className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
            <p className="text-2xl font-bold text-red-600">{stats.ordersByStatus.cancelled}</p>
            <p className="text-xs text-red-600/70 mt-1">İptal</p>
          </Link>
        </div>
      </div>

      {/* İki Kolonlu Bölüm */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Son Siparişler */}
        <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center justify-between px-6 py-4 border-b border-stroke dark:border-dark-3">
            <h2 className="font-semibold text-dark dark:text-white">Son Siparişler</h2>
            <Link href="/orders" className="text-sm text-primary hover:underline">Tümünü Gör</Link>
          </div>
          <div className="p-6">
            {stats.recentOrders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Henüz sipariş yok</p>
            ) : (
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-dark-2">
                    <div>
                      <p className="font-medium text-dark dark:text-white">#{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{order.user?.name || order.user?.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-dark dark:text-white">{Number(order.total).toLocaleString("tr-TR")} ₺</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        order.status === "DELIVERED" ? "bg-green-100 text-green-600" :
                        order.status === "SHIPPED" ? "bg-blue-100 text-blue-600" :
                        order.status === "PROCESSING" ? "bg-yellow-100 text-yellow-600" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {order.status === "DELIVERED" ? "Teslim Edildi" :
                         order.status === "SHIPPED" ? "Kargoda" :
                         order.status === "PROCESSING" ? "Hazırlanıyor" :
                         order.status === "CANCELLED" ? "İptal" : "Bekliyor"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hızlı Erişim */}
        <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
          <div className="px-6 py-4 border-b border-stroke dark:border-dark-3">
            <h2 className="font-semibold text-dark dark:text-white">Hızlı Erişim</h2>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <Link href="/products/new" className="flex items-center gap-3 p-4 rounded-lg border border-stroke dark:border-dark-3 hover:border-primary hover:bg-primary/5 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-dark dark:text-white">Yeni Ürün</p>
                <p className="text-xs text-gray-500">Ürün ekle</p>
              </div>
            </Link>

            <Link href="/orders" className="flex items-center gap-3 p-4 rounded-lg border border-stroke dark:border-dark-3 hover:border-primary hover:bg-primary/5 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-dark dark:text-white">Siparişler</p>
                <p className="text-xs text-gray-500">Yönet</p>
              </div>
            </Link>

            <Link href="/categories" className="flex items-center gap-3 p-4 rounded-lg border border-stroke dark:border-dark-3 hover:border-primary hover:bg-primary/5 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-dark dark:text-white">Kategoriler</p>
                <p className="text-xs text-gray-500">Düzenle</p>
              </div>
            </Link>

            <Link href="/coupons/new" className="flex items-center gap-3 p-4 rounded-lg border border-stroke dark:border-dark-3 hover:border-primary hover:bg-primary/5 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-dark dark:text-white">Kupon Oluştur</p>
                <p className="text-xs text-gray-500">İndirim ekle</p>
              </div>
            </Link>

            <Link href="/pages" className="flex items-center gap-3 p-4 rounded-lg border border-stroke dark:border-dark-3 hover:border-primary hover:bg-primary/5 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-dark dark:text-white">Sayfalar</p>
                <p className="text-xs text-gray-500">Page Builder</p>
              </div>
            </Link>

            <Link href="/settings" className="flex items-center gap-3 p-4 rounded-lg border border-stroke dark:border-dark-3 hover:border-primary hover:bg-primary/5 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-500/10">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-dark dark:text-white">Ayarlar</p>
                <p className="text-xs text-gray-500">Yapılandır</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
