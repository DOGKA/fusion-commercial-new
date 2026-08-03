import { Metadata } from "next";
import { prisma } from "@/libs/prismaDb";
import { requireAdminPage } from "@/libs/require-admin-page";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Müşteriler",
};

/**
 * İzin durumu üç durumludur: true = izin verdi, false = reddetti,
 * null = hiç sorulmadı. `null` ile `false` AYNI ŞEY DEĞİL — ayrıntı için
 * müşteri detay ekranındaki İletişim İzinleri kartına bakın.
 */
function consentDotClass(value: boolean | null): string {
  if (value === true) return "bg-green-500";
  if (value === false) return "bg-red-500";
  return "bg-gray-300 dark:bg-dark-3";
}

function consentTitle(label: string, value: boolean | null): string {
  if (value === true) return `${label}: izin verdi`;
  if (value === false) return `${label}: reddetti`;
  return `${label}: hiç sorulmadı`;
}

// Frontend URL for avatar images (cross-app)
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3003";

// Helper to get full avatar URL
function getAvatarUrl(image: string | null): string | null {
  if (!image) return null;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  // Müşteri avatarları - frontend'de kayıtlı (/storage/users/)
  if (image.startsWith("/storage/users/")) {
    return `${FRONTEND_URL}${image}`;
  }
  // Admin avatarları - admin panelde (/storage/avatars/) - lokal kal
  return image;
}

const PAGE_SIZE = 25;

/**
 * Müşteri listesi — arama ve sayfalama sunucuda (F2-56).
 *
 * Önceden **tüm** `CUSTOMER` kayıtları ve her birinin ödenmiş siparişleri tek
 * seferde çekilip tek sayfada basılıyordu; arama kutusu bile yoktu. Müşteri
 * sayısı büyüdükçe hem sorgu hem sayfa şişiyordu.
 *
 * Harcama toplamı artık ilişki üzerinden değil tek bir `groupBy` ile geliyor:
 * sayfadaki 25 müşterinin siparişlerini satır satır belleğe çekmek gereksizdi.
 */
async function getCustomers(query: string, page: number) {
  const where = {
    role: "CUSTOMER" as const,
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" as const } },
            { email: { contains: query, mode: "insensitive" as const } },
            { phone: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [totalCount, customers] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      // Alanlar TEK TEK sayılır: `include` kullanılsa `password` hash'i,
      // `passwordResetToken` ve `activationCode` de belleğe çekilirdi. Liste
      // yalnızca aşağıdaki alanları gösteriyor.
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        createdAt: true,
        smsConsent: true,
        emailConsent: true,
        callConsent: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  // Yalnızca ödemesi alınmış siparişler sayılıyor (iptal ve bekleyen hariç).
  const totals = customers.length
    ? await prisma.order.groupBy({
        by: ["userId"],
        where: {
          paymentStatus: "PAID",
          userId: { in: customers.map((customer) => customer.id) },
        },
        _sum: { total: true },
        _count: { _all: true },
      })
    : [];

  const totalsByUser = new Map(
    totals.map((row) => [
      row.userId,
      { spent: Number(row._sum.total ?? 0), count: row._count._all },
    ])
  );

  return {
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    customers: customers.map((customer) => ({
      ...customer,
      totalSpent: totalsByUser.get(customer.id)?.spent ?? 0,
      orderCount: totalsByUser.get(customer.id)?.count ?? 0,
    })),
  };
}

async function getStats() {
  const [totalCustomers, newThisMonth, withOrders] = await Promise.all([
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({
      where: {
        role: "CUSTOMER",
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.user.count({
      where: {
        role: "CUSTOMER",
        orders: {
          some: {
            paymentStatus: "PAID",
          },
        },
      },
    }),
  ]);
  
  return { totalCustomers, newThisMonth, withOrders };
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireAdminPage();

  const params = await searchParams;
  const query = (params.q || "").trim();
  const page = Math.max(1, Number.parseInt(params.page || "1", 10) || 1);

  const { customers, totalCount, totalPages } = await getCustomers(query, page);
  const stats = await getStats();

  // Sayfa bağlantıları aramayı koruyor; aksi halde 2. sayfaya geçince filtre
  // düşer ve kullanıcı aradığını kaybeder.
  const pageHref = (target: number) => {
    const search = new URLSearchParams();
    if (query) search.set("q", query);
    if (target > 1) search.set("page", String(target));
    const qs = search.toString();
    return qs ? `/customers?${qs}` : "/customers";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-white">Müşteriler</h1>
        <p className="text-gray-500">Müşteri listesi ve istatistikleri</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">{stats.totalCustomers}</p>
              <p className="text-sm text-gray-500">Toplam Müşteri</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">{stats.newThisMonth}</p>
              <p className="text-sm text-gray-500">Bu Ay Yeni</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">{stats.withOrders}</p>
              <p className="text-sm text-gray-500">Sipariş Veren</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stroke px-6 py-4 dark:border-dark-3">
          <h2 className="text-lg font-semibold text-dark dark:text-white">
            Müşteri Listesi
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({totalCount} müşteri)
            </span>
          </h2>

          {/* Sunucu tarafı arama: JavaScript gerekmiyor, GET formu yeter. */}
          <form method="get" action="/customers" className="flex items-center gap-2">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Ad, e-posta veya telefon"
              className="h-9 w-56 rounded-lg border border-stroke bg-transparent px-3 text-sm text-dark outline-none focus:border-primary dark:border-dark-3 dark:text-white"
            />
            <button
              type="submit"
              className="h-9 rounded-lg bg-primary px-4 text-sm text-white"
            >
              Ara
            </button>
            {query && (
              <Link href="/customers" className="text-sm text-gray-500 hover:underline">
                Temizle
              </Link>
            )}
          </form>
        </div>

        {customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <p className="text-gray-500">
              {query ? "Aramaya uygun müşteri bulunamadı" : "Henüz müşteri yok"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stroke dark:border-dark-3">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Müşteri</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Telefon</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Kayıt Tarihi</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                    <span title="Sırayla: SMS · E-posta · Arama — yeşil izinli, kırmızı reddetti, gri hiç sorulmadı">
                      İzinler
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Sipariş</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Harcama</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-stroke last:border-0 dark:border-dark-3">
                    <td className="px-6 py-4">
                      <Link
                        href={`/customers/${customer.id}`}
                        className="flex items-center gap-3 hover:opacity-80"
                      >
                        <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-100 dark:bg-dark-2">
                          {getAvatarUrl(customer.image) ? (
                            <Image
                              src={getAvatarUrl(customer.image)!}
                              alt={customer.name || ""}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-400 font-medium">
                              {customer.name?.charAt(0).toUpperCase() || customer.email?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-dark dark:text-white">{customer.name || "-"}</p>
                          <p className="text-sm text-gray-500">{customer.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 dark:text-gray-300">{customer.phone || "-"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 dark:text-gray-300">
                        {new Date(customer.createdAt).toLocaleDateString("tr-TR")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${consentDotClass(customer.smsConsent)}`}
                          title={consentTitle("SMS", customer.smsConsent)}
                        />
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${consentDotClass(customer.emailConsent)}`}
                          title={consentTitle("E-posta", customer.emailConsent)}
                        />
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${consentDotClass(customer.callConsent)}`}
                          title={consentTitle("Telefon araması", customer.callConsent)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-dark dark:text-white">{customer.orderCount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-primary">
                        {customer.totalSpent.toLocaleString("tr-TR")} ₺
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/customers/${customer.id}`}
                          className="rounded p-2 hover:bg-gray-100 dark:hover:bg-dark-2"
                          title="Detay"
                        >
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-stroke px-6 py-4 dark:border-dark-3">
            <p className="text-sm text-gray-500">
              {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, totalCount)} / {totalCount} müşteri
            </p>
            <div className="flex items-center gap-2">
              {page > 1 ? (
                <Link
                  href={pageHref(page - 1)}
                  className="rounded-lg border border-stroke px-3 py-1.5 text-sm dark:border-dark-3"
                >
                  Önceki
                </Link>
              ) : (
                <span className="rounded-lg border border-stroke px-3 py-1.5 text-sm opacity-50 dark:border-dark-3">
                  Önceki
                </span>
              )}
              <span className="px-3 text-sm text-gray-500">
                {page} / {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={pageHref(page + 1)}
                  className="rounded-lg border border-stroke px-3 py-1.5 text-sm dark:border-dark-3"
                >
                  Sonraki
                </Link>
              ) : (
                <span className="rounded-lg border border-stroke px-3 py-1.5 text-sm opacity-50 dark:border-dark-3">
                  Sonraki
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
