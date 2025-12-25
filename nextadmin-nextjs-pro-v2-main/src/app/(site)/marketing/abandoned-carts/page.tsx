import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terk Edilmiş Sepetler",
};

const demoAbandonedCarts = [
  {
    id: "1",
    customerName: "Ahmet Yılmaz",
    email: "ahmet@example.com",
    items: [
      { name: "POWERTECH PRO 3600W", price: 28000, quantity: 1 },
    ],
    total: 28000,
    abandonedAt: "2024-12-11T14:30:00",
    reminderSent: false,
  },
  {
    id: "2",
    customerName: "Mehmet Demir",
    email: "mehmet@example.com",
    items: [
      { name: "POWERTECH Solar Panel 200W", price: 6990, quantity: 2 },
      { name: "POWERTECH AC Şarj Kablosu", price: 890, quantity: 1 },
    ],
    total: 14870,
    abandonedAt: "2024-12-11T10:15:00",
    reminderSent: true,
  },
  {
    id: "3",
    customerName: "Ayşe Kaya",
    email: "ayse@example.com",
    items: [
      { name: "EcoFlow Delta 2 Max", price: 40000, quantity: 1 },
    ],
    total: 40000,
    abandonedAt: "2024-12-10T18:45:00",
    reminderSent: true,
  },
];

export default function AbandonedCartsPage() {
  const totalValue = demoAbandonedCarts.reduce((sum, cart) => sum + cart.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Terk Edilmiş Sepetler</h1>
          <p className="text-gray-500">Tamamlanmamış siparişleri takip edin ve müşterilere hatırlatma gönderin</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-white hover:bg-primary/90">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Toplu Hatırlatma Gönder
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">{demoAbandonedCarts.length}</p>
              <p className="text-sm text-gray-500">Terk Edilen Sepet</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">{totalValue.toLocaleString("tr-TR")} ₺</p>
              <p className="text-sm text-gray-500">Potansiyel Kayıp</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">{demoAbandonedCarts.filter(c => c.reminderSent).length}</p>
              <p className="text-sm text-gray-500">Hatırlatma Gönderildi</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">%12</p>
              <p className="text-sm text-gray-500">Kurtarma Oranı</p>
            </div>
          </div>
        </div>
      </div>

      {/* Abandoned Carts Table */}
      <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
        <div className="border-b border-stroke px-6 py-4 dark:border-dark-3">
          <h2 className="text-lg font-semibold text-dark dark:text-white">Terk Edilmiş Sepetler</h2>
        </div>

        <div className="divide-y divide-stroke dark:divide-dark-3">
          {demoAbandonedCarts.map((cart) => (
            <div key={cart.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-medium text-primary">{cart.customerName.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-dark dark:text-white">{cart.customerName}</p>
                    <p className="text-sm text-gray-500">{cart.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {new Date(cart.abandonedAt).toLocaleDateString("tr-TR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {cart.reminderSent && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-500">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Hatırlatma gönderildi
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {cart.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-medium text-dark dark:text-white">
                      {(item.price * item.quantity).toLocaleString("tr-TR")} ₺
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-stroke dark:border-dark-3">
                <p className="font-semibold text-dark dark:text-white">
                  Toplam: {cart.total.toLocaleString("tr-TR")} ₺
                </p>
                <div className="flex gap-2">
                  {!cart.reminderSent && (
                    <button className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90">
                      Hatırlatma Gönder
                    </button>
                  )}
                  <button className="px-4 py-2 rounded-lg border border-stroke text-sm hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-dark-2">
                    Detay
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
