import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/libs/prismaDb";
import { requireAdminPage } from "@/libs/require-admin-page";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Müşteri Detayı",
};

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3003";

function getAvatarUrl(image: string | null): string | null {
  if (!image) return null;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  if (image.startsWith("/storage/users/")) return `${FRONTEND_URL}${image}`;
  return image;
}

/**
 * Sorgu alanları TEK TEK sayılır (`include` DEĞİL).
 *
 * `include` ile `User` çekilirse `password` hash'i, `passwordResetToken` ve
 * `activationCode` de gelir. Bu sayfa server component olduğu için bunlar
 * tarayıcıya gitmezdi, ama alan listesini açık tutmak bu sayfanın ileride
 * client component'e çevrilmesi veya bir alt bileşene prop geçilmesi hâlinde
 * sızıntıyı baştan imkânsız kılar.
 */
async function getCustomer(id: string) {
  const [customer, paidAggregate] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,

        gender: true,
        birthDate: true,
        pendingEmail: true,
        pendingEmailExp: true,

        smsConsent: true,
        emailConsent: true,
        callConsent: true,
        personalizationConsent: true,
        consentUpdatedAt: true,

        consentLogs: {
          select: {
            id: true,
            channel: true,
            granted: true,
            previousValue: true,
            source: true,
            consentTextKey: true,
            consentTextVer: true,
            ipAddress: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        },

        addresses: {
          // Müşterinin sildiği adresler kayıtta duruyor (yumuşak silme) ama
          // panelde güncel adres listesi olarak gösterilmemeli.
          where: { deletedAt: null },
          select: {
            id: true,
            title: true,
            fullName: true,
            firstName: true,
            lastName: true,
            address: true,
            addressLine1: true,
            addressLine2: true,
            district: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
            phone: true,
            isDefault: true,
            type: true,
            addressCategory: true,
            invoiceType: true,
            company: true,
            taxNumber: true,
            taxOffice: true,
          },
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        },

        orders: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },

        reviews: {
          select: {
            id: true,
            rating: true,
            title: true,
            comment: true,
            isApproved: true,
            createdAt: true,
            product: { select: { name: true, slug: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 3,
        },

        _count: {
          select: {
            orders: true,
            reviews: true,
            addresses: { where: { deletedAt: null } },
          },
        },
      },
    }),

    // Toplam harcama son 10 siparişten değil, TÜM ödemesi alınan siparişlerden
    // hesaplanır — aksi hâlde liste ekranındaki "Harcama" ile uyuşmaz.
    prisma.order.aggregate({
      where: { userId: id, paymentStatus: "PAID" },
      _sum: { total: true },
      _count: true,
    }),
  ]);

  if (!customer) return null;

  const paidCount = paidAggregate._count;
  const totalSpent = Number(paidAggregate._sum.total ?? 0);

  return {
    ...customer,
    orders: customer.orders.map((order) => ({
      ...order,
      total: Number(order.total),
    })),
    paidCount,
    totalSpent,
    averageBasket: paidCount > 0 ? totalSpent / paidCount : 0,
  };
}

const GENDER_LABELS: Record<string, string> = {
  FEMALE: "Kadın",
  MALE: "Erkek",
  UNSPECIFIED: "Belirtmek istemiyor",
};

const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  PENDING: { label: "Beklemede", color: "text-yellow-600", bgColor: "bg-yellow-100 dark:bg-yellow-500/10" },
  PROCESSING: { label: "Hazırlanıyor", color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-500/10" },
  SHIPPED: { label: "Kargoda", color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-500/10" },
  DELIVERED: { label: "Teslim Edildi", color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-500/10" },
  CANCELLED: { label: "İptal", color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-500/10" },
  REFUNDED: { label: "İade", color: "text-gray-600", bgColor: "bg-gray-100 dark:bg-gray-500/10" },
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  PENDING: { label: "Ödeme Bekliyor", color: "text-yellow-600", bgColor: "bg-yellow-100 dark:bg-yellow-500/10" },
  PAID: { label: "Ödendi", color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-500/10" },
  FAILED: { label: "Başarısız", color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-500/10" },
  REFUNDED: { label: "İade Edildi", color: "text-gray-600", bgColor: "bg-gray-100 dark:bg-gray-500/10" },
};

const CONSENT_CHANNEL_LABELS: Record<string, string> = {
  SMS: "SMS",
  EMAIL: "E-posta",
  CALL: "Telefon Araması",
  PERSONALIZATION: "Kişiselleştirme",
};

const CONSENT_SOURCE_LABELS: Record<string, string> = {
  REGISTER: "Kayıt formu",
  ACCOUNT_SETTINGS: "Hesap ayarları",
  CHECKOUT: "Ödeme adımı",
  ADMIN: "Yönetici",
  CALL_CENTER: "Çağrı merkezi",
};

const ADDRESS_TYPE_LABELS: Record<string, string> = {
  SHIPPING: "Teslimat",
  BILLING: "Fatura",
  BOTH: "Teslimat + Fatura",
};

function formatDate(date: Date | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("tr-TR");
}

function formatDateTime(date: Date | null) {
  if (!date) return "-";
  return new Date(date).toLocaleString("tr-TR");
}

function formatPhone(phone: string | null) {
  if (!phone) return "-";
  const d = phone.replace(/\D/g, "");
  if (d.length !== 10) return phone;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8, 10)}`;
}

function formatCurrency(value: number) {
  return `${value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺`;
}

const CARD = "rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark";
const CARD_TITLE = "mb-4 text-lg font-semibold text-dark dark:text-white";

/**
 * İzin durumu ÜÇ DURUMLUDUR ve bu ayrım korunmak zorundadır:
 *   true  → izin verdi
 *   false → reddetti (bir daha sorulmamalı)
 *   null  → hiç sorulmadı (sorulabilir)
 *
 * İki duruma indirilirse pazarlama, izni hiç sorulmamış üyeleri "reddetmiş"
 * sanar ya da gerçekten reddedenlere tekrar sorup izin ihlali yapar.
 */
function ConsentBadge({ value }: { value: boolean | null }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-600 dark:bg-green-500/10">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        İzin verdi
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600 dark:bg-red-500/10">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        Reddetti
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 dark:bg-gray-500/10">
      <span className="h-2 w-2 rounded-full bg-gray-400" />
      Hiç sorulmadı
    </span>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-stroke py-3 last:border-0 dark:border-dark-3">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-right text-sm font-medium text-dark dark:text-white">{children}</span>
    </div>
  );
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Bu kontrol "katmanlı savunma" diye eklenmişti ve iyi ki eklenmiş:
  // middleware'in koruduğu varsayılıyordu ama hiç yüklenmiyordu (F2-71),
  // yani 31 Tem'e kadar bu sayfayı koruyan tek şey buydu.
  await requireAdminPage();

  const { id } = await params;
  const customer = await getCustomer(id);

  if (!customer) notFound();

  const avatarUrl = getAvatarUrl(customer.image);
  const displayName = customer.name || customer.email || "İsimsiz müşteri";

  const membershipDays = Math.floor(
    (Date.now() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  const lastOrderDate = customer.orders[0]?.createdAt ?? null;

  const consentRows: { label: string; value: boolean | null }[] = [
    { label: "SMS", value: customer.smsConsent },
    { label: "E-posta", value: customer.emailConsent },
    { label: "Telefon Araması", value: customer.callConsent },
    { label: "Kişiselleştirme", value: customer.personalizationConsent },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/customers"
            className="rounded-lg border border-stroke p-2 hover:bg-gray-100 dark:border-dark-3 dark:hover:bg-dark-2"
            title="Müşterilere dön"
          >
            <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-dark dark:text-white">{displayName}</h1>
            <p className="text-sm text-gray-500">
              {formatDate(customer.createdAt)} tarihinden beri üye · {membershipDays} gün
            </p>
          </div>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {customer.role}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── SOL KOLON ────────────────────────────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">
          {/* Profil */}
          <div className={CARD}>
            <h2 className={CARD_TITLE}>Profil Bilgileri</h2>

            <div className="mb-6 flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-100 dark:bg-dark-2">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl font-medium text-gray-400">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-dark dark:text-white">{customer.name || "-"}</p>
                <p className="text-sm text-gray-500">{customer.email || "-"}</p>
              </div>
            </div>

            <div>
              <InfoRow label="E-posta">
                <span className="flex items-center justify-end gap-2">
                  {customer.email || "-"}
                  {customer.emailVerified ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-600 dark:bg-green-500/10">
                      Doğrulandı
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-500/10">
                      Doğrulanmadı
                    </span>
                  )}
                </span>
              </InfoRow>

              {customer.pendingEmail && (
                <InfoRow label="Bekleyen e-posta">
                  <span className="flex flex-col items-end">
                    <span>{customer.pendingEmail}</span>
                    <span className="text-[11px] font-normal text-gray-500">
                      Değişiklik bekliyor
                      {customer.pendingEmailExp
                        ? ` · ${formatDateTime(customer.pendingEmailExp)} tarihine kadar`
                        : ""}
                    </span>
                  </span>
                </InfoRow>
              )}

              <InfoRow label="Telefon">{formatPhone(customer.phone)}</InfoRow>
              <InfoRow label="Cinsiyet">
                {customer.gender ? GENDER_LABELS[customer.gender] : "—"}
              </InfoRow>
              <InfoRow label="Doğum Tarihi">{customer.birthDate || "—"}</InfoRow>
              <InfoRow label="Kayıt Tarihi">{formatDateTime(customer.createdAt)}</InfoRow>
              <InfoRow label="Son Güncelleme">{formatDateTime(customer.updatedAt)}</InfoRow>
            </div>
          </div>

          {/* İletişim İzinleri */}
          <div className={CARD}>
            <h2 className={CARD_TITLE}>İletişim İzinleri</h2>
            <div>
              {consentRows.map((row) => (
                <InfoRow key={row.label} label={row.label}>
                  <ConsentBadge value={row.value} />
                </InfoRow>
              ))}
            </div>
            <p className="mt-4 text-xs text-gray-500">
              {customer.consentUpdatedAt
                ? `Son izin değişikliği: ${formatDateTime(customer.consentUpdatedAt)}`
                : "Bu üye hiç izin tercihi belirtmemiş."}
            </p>
          </div>

          {/* İzin Geçmişi */}
          <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
            <div className="border-b border-stroke px-6 py-4 dark:border-dark-3">
              <h2 className="text-lg font-semibold text-dark dark:text-white">İzin Geçmişi</h2>
              <p className="text-xs text-gray-500">
                İYS/KVKK kanıt kaydı — iznin ne zaman, hangi kanalda ve hangi metinle alındığı
              </p>
            </div>

            {customer.consentLogs.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-gray-500">Bu üye için henüz izin kaydı yok.</p>
                <p className="mt-1 text-xs text-gray-400">
                  İzin kaydı tutulmaya 30 Temmuz 2026&apos;da başlandı; bu tarihten önce
                  üye olanlarda kayıt bulunmaz. Eksik veri değildir.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stroke dark:border-dark-3">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Tarih</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Kanal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Değişim</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Kaynak</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Metin</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.consentLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-stroke last:border-0 dark:border-dark-3"
                      >
                        <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                          {formatDateTime(log.createdAt)}
                        </td>
                        <td className="px-6 py-3 text-sm text-dark dark:text-white">
                          {CONSENT_CHANNEL_LABELS[log.channel] || log.channel}
                        </td>
                        <td className="whitespace-nowrap px-6 py-3 text-sm">
                          {log.previousValue === null ? (
                            <span className="text-gray-500">
                              İlk kez →{" "}
                              <span className={log.granted ? "text-green-600" : "text-red-600"}>
                                {log.granted ? "izin verildi" : "reddedildi"}
                              </span>
                            </span>
                          ) : (
                            <span className="text-gray-500">
                              {log.previousValue ? "izinli" : "izinsiz"} →{" "}
                              <span className={log.granted ? "text-green-600" : "text-red-600"}>
                                {log.granted ? "izinli" : "izinsiz"}
                              </span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                          {CONSENT_SOURCE_LABELS[log.source] || log.source}
                        </td>
                        <td className="px-6 py-3 text-xs text-gray-500">
                          {log.consentTextKey ? (
                            <>
                              <span className="block">{log.consentTextKey}</span>
                              {log.consentTextVer && (
                                <span className="block text-gray-400">
                                  sürüm {log.consentTextVer}
                                </span>
                              )}
                            </>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-3 text-xs text-gray-500">{log.ipAddress || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Son Alışverişler */}
          <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stroke px-6 py-4 dark:border-dark-3">
              <h2 className="text-lg font-semibold text-dark dark:text-white">Son Alışverişler</h2>
              {customer._count.orders > customer.orders.length && (
                <Link
                  href={`/orders?search=${encodeURIComponent(customer.email || "")}`}
                  className="text-sm text-primary hover:underline"
                >
                  Tümünü gör ({customer._count.orders})
                </Link>
              )}
            </div>

            {customer.orders.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-gray-500">
                Bu üyenin henüz siparişi yok.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stroke dark:border-dark-3">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Sipariş No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Tarih</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Durum</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Ödeme</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">Tutar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.orders.map((order) => {
                      const status = ORDER_STATUS_CONFIG[order.status];
                      const payment = PAYMENT_STATUS_CONFIG[order.paymentStatus];
                      return (
                        <tr
                          key={order.id}
                          className="border-b border-stroke last:border-0 hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-dark-2"
                        >
                          <td className="px-6 py-3">
                            <Link
                              href={`/orders/${order.id}`}
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              {order.orderNumber}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-6 py-3">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${status?.bgColor ?? ""} ${status?.color ?? ""}`}
                            >
                              {status?.label ?? order.status}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${payment?.bgColor ?? ""} ${payment?.color ?? ""}`}
                            >
                              {payment?.label ?? order.paymentStatus}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right text-sm font-medium text-dark dark:text-white">
                            {formatCurrency(order.total)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── SAĞ KOLON ────────────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Özet */}
          <div className={CARD}>
            <h2 className={CARD_TITLE}>Özet</h2>
            <div>
              <InfoRow label="Toplam sipariş">{customer._count.orders}</InfoRow>
              <InfoRow label="Ödemesi alınan">{customer.paidCount}</InfoRow>
              <InfoRow label="Toplam harcama">
                <span className="text-primary">{formatCurrency(customer.totalSpent)}</span>
              </InfoRow>
              <InfoRow label="Ortalama sepet">{formatCurrency(customer.averageBasket)}</InfoRow>
              <InfoRow label="Son sipariş">{formatDate(lastOrderDate)}</InfoRow>
              <InfoRow label="Değerlendirme">{customer._count.reviews}</InfoRow>
              <InfoRow label="Kayıtlı adres">{customer._count.addresses}</InfoRow>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Harcama ve ortalama sepet yalnızca <strong>ödemesi alınan</strong> siparişlerden
              hesaplanır.
            </p>
          </div>

          {/* Adres Defteri */}
          <div className={CARD}>
            <h2 className={CARD_TITLE}>Adres Defteri</h2>

            {customer.addresses.length === 0 ? (
              <p className="text-sm text-gray-500">Kayıtlı adres yok.</p>
            ) : (
              <div className="space-y-4">
                {customer.addresses.map((address) => {
                  // Eski ve yeni alanlar şemada bir arada duruyor; fallback zinciri
                  // olmadan eski kayıtlarda alanlar boş görünür.
                  const name =
                    address.fullName ||
                    `${address.firstName || ""} ${address.lastName || ""}`.trim() ||
                    address.title ||
                    "-";
                  const line = address.address || address.addressLine1 || "";

                  return (
                    <div
                      key={address.id}
                      className="rounded-lg border border-stroke p-4 dark:border-dark-3"
                    >
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-dark dark:text-white">
                          {address.title || "Adres"}
                        </span>
                        {address.isDefault && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                            Varsayılan
                          </span>
                        )}
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-500/10">
                          {ADDRESS_TYPE_LABELS[address.type] || address.type}
                        </span>
                      </div>

                      <div className="space-y-1 text-sm">
                        <p className="font-medium text-dark dark:text-white">{name}</p>
                        {line && <p className="text-gray-600 dark:text-gray-400">{line}</p>}
                        {address.addressLine2 && (
                          <p className="text-gray-600 dark:text-gray-400">{address.addressLine2}</p>
                        )}
                        <p className="text-gray-600 dark:text-gray-400">
                          {address.district && `${address.district}, `}
                          {address.city}
                          {address.postalCode && ` ${address.postalCode}`}
                        </p>
                        <p className="text-gray-500">{formatPhone(address.phone)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Değerlendirmeler */}
          <div className={CARD}>
            <h2 className={CARD_TITLE}>Son Değerlendirmeler</h2>

            {customer.reviews.length === 0 ? (
              <p className="text-sm text-gray-500">Henüz değerlendirme yok.</p>
            ) : (
              <div className="space-y-4">
                {customer.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-lg border border-stroke p-4 dark:border-dark-3"
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-yellow-500">
                        {"★".repeat(review.rating)}
                        <span className="text-gray-300">{"★".repeat(5 - review.rating)}</span>
                      </span>
                      {review.isApproved ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-600 dark:bg-green-500/10">
                          Onaylı
                        </span>
                      ) : (
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-600 dark:bg-yellow-500/10">
                          Onay bekliyor
                        </span>
                      )}
                    </div>
                    {review.product?.name && (
                      <p className="text-xs text-gray-500">{review.product.name}</p>
                    )}
                    {review.title && (
                      <p className="mt-1 text-sm font-medium text-dark dark:text-white">
                        {review.title}
                      </p>
                    )}
                    <p className="mt-1 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
                      {review.comment}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">{formatDate(review.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
