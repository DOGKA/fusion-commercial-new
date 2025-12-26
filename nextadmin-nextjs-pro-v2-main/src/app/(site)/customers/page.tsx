import { Metadata } from "next";
import { prisma } from "@/libs/prismaDb";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Müşteriler",
};

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

async function getCustomers() {
  const customers = await prisma.user.findMany({
    where: {
      role: "CUSTOMER",
    },
    include: {
      orders: {
        select: {
          id: true,
          total: true,
          status: true,
        },
      },
      _count: {
        select: {
          orders: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  
  return customers.map((customer) => ({
    ...customer,
    totalSpent: customer.orders.reduce((sum, order) => sum + Number(order.total), 0),
    orderCount: customer._count.orders,
  }));
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
          some: {},
        },
      },
    }),
  ]);
  
  return { totalCustomers, newThisMonth, withOrders };
}

export default async function CustomersPage() {
  const customers = await getCustomers();
  const stats = await getStats();

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
        <div className="border-b border-stroke px-6 py-4 dark:border-dark-3">
          <h2 className="text-lg font-semibold text-dark dark:text-white">Müşteri Listesi</h2>
        </div>

        {customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <p className="text-gray-500">Henüz müşteri yok</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stroke dark:border-dark-3">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Müşteri</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Telefon</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Kayıt Tarihi</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Sipariş</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Harcama</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-stroke last:border-0 dark:border-dark-3">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
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
                      </div>
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
                      <span className="font-medium text-dark dark:text-white">{customer.orderCount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-primary">
                        {customer.totalSpent.toLocaleString("tr-TR")} ₺
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="rounded p-2 hover:bg-gray-100 dark:hover:bg-dark-2"
                          title="Detay"
                        >
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
