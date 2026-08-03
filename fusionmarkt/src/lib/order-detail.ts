/**
 * Sipariş detayının sorgusu ve sunumu — tek kaynak.
 *
 * Neden ayrı dosya: aynı veriyi hem `GET /api/orders/[orderNumber]/detail` hem
 * de sipariş detay sayfasının sunucu tarafı ilk render'ı (F2-45) kullanıyor.
 * Mantık route handler'ında kalsaydı sayfa `permissions` hesabını import
 * edemez, ikisi de ikinci kez yazılırdı.
 *
 * Çizelge burada ÜRETİLMİYOR, `_lib/timeline.ts`'ten çağrılıyor: aynı
 * fonksiyonu liste akordiyonu da kullanıyor ve iki ekranın adımları böyle
 * ayrışmıyor (plan 07 M-15).
 *
 * `permissions` alanı `lib/orders.ts` fonksiyonlarıyla SUNUCUDA hesaplanır.
 * Kuralları istemciye kopyalamak, projede daha önce iade penceresinin yalnızca
 * istemcide yaşamasına ve API'nin doğrudan çağrılarak atlatılabilmesine yol
 * açmıştı (plan 03 §7.B.3).
 */

import { prisma } from "@repo/db";
import { getCarrierByName } from "@/lib/shipping";
import type { OrderDetail } from "@/app/hesabim/siparisler/_lib/detail-types";
import { buildOrderTimeline } from "@/app/hesabim/siparisler/_lib/timeline";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  RETURN_REASON_LABELS,
  REQUEST_TYPE_LABELS,
  blocksNewReturnRequest,
  canCancel,
  canReturn,
  canTrack,
  canReview,
  invoiceRowState,
  enabledRequestTypes,
  isDelivered,
  isOpenRequestStatus,
  returnReasonLabel,
  type OrderStatusKey,
  type PaymentStatusKey,
  type ReturnReasonKey,
  type RequestTypeKey,
} from "@/lib/orders";

interface SnapshotAddress {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  addressLine1?: string;
  addressLine2?: string;
  address?: string;
}

interface StatusHistoryEntry {
  type?: string;
  status?: string;
  date?: string;
  note?: string;
  addresses?: {
    billingAddress?: SnapshotAddress;
    shippingAddress?: SnapshotAddress;
  };
}

type AddressDTO = {
  id: string;
  title: string | null;
  fullName: string | null;
  phone: string | null;
  city: string | null;
  district: string | null;
  postalCode: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
};

function snapshotToDto(snapshot: SnapshotAddress | undefined): AddressDTO | null {
  if (!snapshot) return null;
  const fullName =
    snapshot.fullName ||
    `${snapshot.firstName || ""} ${snapshot.lastName || ""}`.trim() ||
    null;
  return {
    id: "snapshot",
    title: "Sipariş Adresi",
    fullName,
    phone: snapshot.phone || null,
    city: snapshot.city || null,
    district: snapshot.district || null,
    postalCode: snapshot.postalCode || null,
    addressLine1: snapshot.addressLine1 || snapshot.address || null,
    addressLine2: snapshot.addressLine2 || null,
  };
}

type DbAddress = {
  id: string;
  title: string | null;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string;
  city: string;
  district: string | null;
  postalCode: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  address: string | null;
};

/**
 * `Address` modelinde eski ve yeni alanlar bir arada duruyor
 * (`addressLine1` vs `address`, `firstName`+`lastName` vs `fullName`).
 * Fallback zinciri olmadan eski kayıtlarda alanlar boş görünür.
 */
function addressToDto(address: DbAddress | null): AddressDTO | null {
  if (!address) return null;
  return {
    id: address.id,
    title: address.title,
    fullName:
      address.fullName ||
      `${address.firstName || ""} ${address.lastName || ""}`.trim() ||
      null,
    phone: address.phone || null,
    city: address.city || null,
    district: address.district,
    postalCode: address.postalCode,
    addressLine1: address.addressLine1 || address.address || null,
    addressLine2: address.addressLine2,
  };
}

/**
 * Tarihleri ISO metnine çevirir.
 *
 * ZORUNLU, kozmetik değil: istemci sözleşmesi (`OrderDetail`) her tarihi `string`
 * yazıyor. API yolunda `JSON.stringify` bunu kendiliğinden yapıyordu, ama sunucu
 * bileşeninden istemciye geçerken `Date` nesnesi `Date` kalır ve arayüz metin
 * beklediği yerde nesne bulurdu.
 */
const iso = (value: Date | null): string | null => (value ? value.toISOString() : null);

/** Detayı isteyen kişi. Yetki kararı yalnızca bu ikisine bakıyor. */
export interface OrderDetailViewer {
  userId: string;
  role?: string;
}

/**
 * Fonksiyonun sonucu. HTTP durum kodu burada üretiliyor ki hem route handler
 * hem de sayfa AYNI yetki kararını versin — sayfa kendi kuralını yazarsa iki
 * yerde iki farklı "erişebilir mi" mantığı oluşur.
 *
 * Başarılı dalın tipi doğrudan İSTEMCİ SÖZLEŞMESİ (`OrderDetail`). Böylece
 * sunucu çıktısı ile arayüzün beklediği şekil derleme zamanında karşılaştırılıyor;
 * eskiden `NextResponse.json(...)` her şeyi kabul ettiği için ikisi sessizce
 * ayrışabilirdi.
 */
export type OrderDetailResult =
  | { ok: true; data: OrderDetail }
  | { ok: false; status: 403 | 404; error: string };

export async function getOrderDetail(
  orderNumber: string,
  viewer: OrderDetailViewer
): Promise<OrderDetailResult> {
  {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                thumbnail: true,
                images: true,
                brand: true,
                isActive: true,
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        cancellationRequest: {
          select: {
            id: true,
            status: true,
            reason: true,
            adminNote: true,
            createdAt: true,
            reviewedAt: true,
          },
        },
        returnRequests: {
          select: {
            id: true,
            requestType: true,
            reason: true,
            description: true,
            images: true,
            status: true,
            adminNote: true,
            returnAddress: true,
            returnInstructions: true,
            returnCode: true,
            sendBackCarrier: true,
            sendBackTrackingNumber: true,
            sendBackAt: true,
            createdAt: true,
            // Boş dizi "talep tüm siparişi kapsıyor" demek (bkz. ReturnRequestItem).
            items: {
              select: {
                quantity: true,
                orderItem: {
                  select: {
                    id: true,
                    variantInfo: true,
                    product: { select: { name: true } },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return { ok: false, status: 404, error: "Sipariş bulunamadı" };
    }

    const isAdmin = viewer.role === "ADMIN" || viewer.role === "SUPER_ADMIN";
    if (order.userId !== viewer.userId && !isAdmin) {
      return { ok: false, status: 403, error: "Bu siparişe erişim yetkiniz yok" };
    }

    /**
     * Kullanıcının bu siparişteki ürünlere daha önce yazdığı yorumlar.
     *
     * TEK SORGU: kalem başına ayrı istek atmak "Değerlendir" butonunu N istekle
     * çizmek olurdu. `POST /api/reviews` mevcut yorumu bulup güncellediği için
     * arayüzün de bunu bilmesi şart — bilmezse kullanıcıya "Değerlendir" der,
     * gönderince sessizce eski yorumunu ezer ve yorum tekrar onaya düşer.
     *
     * Sipariş sahibinin yorumları okunuyor; admin başkasının siparişine
     * bakarken kendi yorumlarını görmemeli, o yüzden `order.userId`.
     */
    const productIds = order.items
      .map((item) => item.productId)
      .filter((id): id is string => !!id);
    const bundleIds = order.items
      .map((item) => item.bundleId)
      .filter((id): id is string => !!id);

    const ownReviews =
      productIds.length || bundleIds.length
        ? await prisma.review.findMany({
            where: {
              userId: order.userId,
              OR: [
                ...(productIds.length ? [{ productId: { in: productIds } }] : []),
                ...(bundleIds.length ? [{ bundleId: { in: bundleIds } }] : []),
              ],
            },
            select: {
              id: true,
              productId: true,
              bundleId: true,
              rating: true,
              title: true,
              comment: true,
              images: true,
              isApproved: true,
              createdAt: true,
            },
          })
        : [];

    const reviewByProduct = new Map(
      ownReviews.filter((r) => r.productId).map((r) => [r.productId, r])
    );
    const reviewByBundle = new Map(
      ownReviews.filter((r) => r.bundleId).map((r) => [r.bundleId, r])
    );

    const history = (order.statusHistory as unknown as StatusHistoryEntry[] | null) ?? [];
    const snapshot = history.find((entry) => entry.type === "ADDRESS_SNAPSHOT")?.addresses;

    // Kayıtlı adres silinmişse sipariş anındaki anlık görüntüye düşülür —
    // müşteri eski siparişinin nereye gittiğini görmeye devam etmeli.
    const shippingDto =
      addressToDto(order.shippingAddress as DbAddress | null) ??
      snapshotToDto(snapshot?.shippingAddress);
    const billingDto =
      addressToDto(order.billingAddress as DbAddress | null) ??
      snapshotToDto(snapshot?.billingAddress);

    const carrier = order.carrierName ? getCarrierByName(order.carrierName) : null;

    // "Açık" talep = süreci devam eden. Onaylanmış ama kolisi henüz gelmemiş
    // talep de açıktır; o sırada yeni talep açılmasına izin verilmemeli.
    const hasPendingReturnRequest = order.returnRequests.some((r) =>
      isOpenRequestStatus(r.status)
    );
    const hasCancellationRequest = order.cancellationRequest !== null;
    const hasPendingCancellationRequest =
      order.cancellationRequest?.status === "PENDING_ADMIN_APPROVAL";
    const hasRequestAwaitingAdminApproval = order.returnRequests.some(
      (request) => request.status === "PENDING_ADMIN_APPROVAL"
    );

    /**
     * Reddedilmiş iade talebi. RET KESİNDİR: müşteri aynı sipariş için ikinci
     * bir iade talebi açamıyor. Kuralın otoritesi uç noktada
     * (`return-request/route.ts`); burası yalnızca arayüzün onu yansıtması
     * için hesaplanıyor — buton görünüp istek reddedilirse müşteri kuralı
     * ancak hata mesajından öğrenir.
     */
    const rejectedReturnRequest =
      order.returnRequests.find(blocksNewReturnRequest) ?? null;
    const hasRejectedReturnRequest = rejectedReturnRequest !== null;

    const permissions = {
      canCancel: canCancel(order, { hasCancellationRequest }),
      canReturn: canReturn(order, { hasPendingReturnRequest, hasRejectedReturnRequest }),
      canTrack: canTrack(order),
      canReview: canReview(order),
      // Bekleyen bir talep varken yenisi açılmasın: admin aynı sipariş için
      // iki açık talep görürse hangisini işleyeceği belirsiz kalır. Ret
      // yalnızca İADE tipini kapatıyor, diğer talep tipleri açık kalıyor.
      availableRequestTypes: hasPendingReturnRequest
        ? []
        : enabledRequestTypes(order, { hasRejectedReturnRequest }),
      availableReturnReasons: Object.keys(RETURN_REASON_LABELS) as ReturnReasonKey[],
      /**
       * Ret durumu BİLEREK burada yok: reddedilen talebin gerekçesi zaten
       * `RequestStatusCards`'ın ret bloğunda, gerekçesiyle birlikte yazılı.
       * İkisini birden basmak aynı bilgiyi üst üste iki kutuda tekrarlardı.
       */
      disabledReason: hasRequestAwaitingAdminApproval
        ? "Bu sipariş için değerlendirilmeyi bekleyen bir talebiniz var."
        : hasPendingCancellationRequest
          ? "Bu sipariş için iptal talebiniz değerlendiriliyor."
          : null,
    };

    return { ok: true, data: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      statusLabel: ORDER_STATUS_LABELS[order.status as OrderStatusKey] ?? order.status,
      paymentStatus: order.paymentStatus,
      paymentStatusLabel:
        PAYMENT_STATUS_LABELS[order.paymentStatus as PaymentStatusKey] ?? order.paymentStatus,
      paymentMethod: order.paymentMethod,

      totals: {
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        discount: Number(order.discount),
        tax: Number(order.tax),
        total: Number(order.total),
        /**
         * Bugüne kadar iade edilen tutar. Kısmi iadede sipariş `DELIVERED`
         * kaldığı için durum rozetinden anlaşılmıyor; müşterinin "ne kadarı
         * geri geldi" sorusunun tek cevabı bu.
         */
        refundedAmount: Number(order.refundedAmount),
      },
      couponCode: order.couponCode,

      timestamps: {
        createdAt: order.createdAt.toISOString(),
        paidAt: iso(order.paidAt),
        confirmedAt: iso(order.confirmedAt),
        preparingAt: iso(order.preparingAt),
        shippedAt: iso(order.shippedAt),
        deliveredAt: iso(order.deliveredAt),
        cancelledAt: iso(order.cancelledAt),
        refundedAt: iso(order.refundedAt),
      },

      shipping: {
        trackingNumber: order.trackingNumber,
        carrierName: order.carrierName,
        carrier: carrier
          ? {
              id: carrier.id,
              name: carrier.name,
              phone: carrier.phone ?? null,
              website: carrier.website ?? null,
              trackingUrl: order.trackingNumber
                ? carrier.trackingUrl(order.trackingNumber.trim())
                : null,
            }
          : null,
      },

      invoice: {
        url: order.invoiceUrl,
        uploadedAt: iso(order.invoiceUploadedAt),
        state: invoiceRowState(order),
      },

      items: order.items.map((item) => {
        const own =
          (item.productId ? reviewByProduct.get(item.productId) : null) ??
          (item.bundleId ? reviewByBundle.get(item.bundleId) : null) ??
          null;

        return {
          id: item.id,
          productId: item.productId,
          bundleId: item.bundleId,
          quantity: item.quantity,
          price: Number(item.price),
          subtotal: Number(item.subtotal),
          variantInfo: item.variantInfo ? JSON.parse(item.variantInfo) : null,
          product: item.product,
          // Ürün silinmişse değerlendirilecek bir şey de kalmıyor: form
          // `productId` göndermek zorunda, `POST /api/reviews` onu doğruluyor.
          canReview: isDelivered(order) && !!(item.productId || item.bundleId),
          canReorder: !!item.product?.isActive,
          myReview: own
            ? {
                id: own.id,
                rating: own.rating,
                title: own.title,
                comment: own.comment,
                images: own.images,
                isApproved: own.isApproved,
                createdAt: own.createdAt.toISOString(),
              }
            : null,
        };
      }),

      addresses: { shipping: shippingDto, billing: billingDto },

      customerNote: order.customerNote,

      requests: {
        cancellation: order.cancellationRequest
          ? {
              ...order.cancellationRequest,
              createdAt: order.cancellationRequest.createdAt.toISOString(),
              reviewedAt: iso(order.cancellationRequest.reviewedAt),
            }
          : null,
        returns: order.returnRequests.map(({ items, ...r }) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
          sendBackAt: iso(r.sendBackAt),
          requestTypeLabel: REQUEST_TYPE_LABELS[r.requestType as RequestTypeKey] ?? r.requestType,
          // Kaldırılmış nedenleri de biliyor: "Fikrimi değiştirdim" artık
          // seçilemiyor ama o nedenle açılmış eski talepler hâlâ görüntüleniyor.
          reasonLabel: r.reason ? returnReasonLabel(r.reason) : null,
          // Boş dizi bilinçli: talebin tüm siparişi kapsadığı anlamına geliyor,
          // arayüz o durumda kalem listesi göstermiyor.
          items: items.map((entry) => ({
            orderItemId: entry.orderItem.id,
            quantity: entry.quantity,
            name: entry.orderItem.product?.name ?? "Ürün",
            variantInfo: entry.orderItem.variantInfo,
          })),
        })),
      },

      permissions,

      /**
       * Çizelge `_lib/timeline.ts`'ten geliyor: aynı fonksiyonu liste
       * akordiyonu da çağırıyor, böylece iki ekran aynı siparişte aynı
       * adımları gösteriyor (plan 07 M-15).
       */
      timeline: buildOrderTimeline(order),

      /**
       * Sipariş hareketleri. `ADDRESS_SNAPSHOT` ve `CONTRACT_ACCEPTANCE`
       * girdileri FİLTRELENİR: ilki adres verisi, ikincisi iki tam sözleşme
       * HTML'i taşıyor. İkisi de "hareket" değil ve süzülmezse yanıt
       * gereksiz yere yüz kilobaytlara çıkar.
       */
      history: history
        .filter((entry): entry is StatusHistoryEntry & { status: string } =>
          Boolean(entry.status) && !entry.type
        )
        .map((entry) => ({
          status: entry.status,
          date: entry.date ?? null,
          note: entry.note ?? null,
        })),
    } };
  }
}
