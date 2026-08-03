/**
 * Sipariş kuralları ve durum sözlükleri — TEK GERÇEK KAYNAK
 *
 * ⚠️ BU DOSYA REACT İÇERMEZ ve içermemeli.
 *
 * Sebebi mimari: `GET /api/orders/[orderNumber]/detail` bu fonksiyonları
 * sunucuda çalıştırıp `permissions` alanını hesaplıyor, istemci de aynı
 * fonksiyonları butonları göstermek için çalıştırıyor. Kural iki yerde
 * kopyalanırsa kaçınılmaz olarak ayrışır — projede bunun canlı örneği vardı:
 * iade penceresi kuralı yalnızca istemcide yaşadığı için API doğrudan
 * çağrılarak atlatılabiliyordu (plan 03 §7.B.3).
 *
 * Bu yüzden `lucide-react` ikonları ve renk sınıfları burada DEĞİL: onlar
 * sunum katmanına ait ve buraya girerse dosya API route'larından
 * import edilemez hale gelir. Durum → ikon eşlemesi bileşenlerde durur.
 */

export type OrderStatusKey =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatusKey = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

/** Görsel ton anahtarı. Renk sınıfına çevirmek sunum katmanının işi. */
export type StatusTone = "warning" | "info" | "progress" | "success" | "danger" | "neutral";

export const ORDER_STATUS_LABELS: Record<OrderStatusKey, string> = {
  PENDING: "Onay Bekliyor",
  PROCESSING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal Edildi",
  REFUNDED: "İade Edildi",
};

export const ORDER_STATUS_TONES: Record<OrderStatusKey, StatusTone> = {
  PENDING: "warning",
  PROCESSING: "info",
  SHIPPED: "progress",
  DELIVERED: "success",
  CANCELLED: "danger",
  REFUNDED: "neutral",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatusKey, string> = {
  PENDING: "Ödeme Bekleniyor",
  PAID: "Ödendi",
  FAILED: "Ödeme Başarısız",
  REFUNDED: "İade Edildi",
};

export const PAYMENT_STATUS_TONES: Record<PaymentStatusKey, StatusTone> = {
  PENDING: "warning",
  PAID: "success",
  FAILED: "danger",
  REFUNDED: "neutral",
};

/**
 * Talep tipleri. `RETURN` dışındakiler iade DEĞİL — fatura talebi veya fazla
 * ürün bildirimi iade sürecine sokulursa admin panelinde iade kuyruğu
 * kirlenir ve iade istatistikleri yanlış çıkar (plan 03 §7.B.1/M2).
 */
export const REQUEST_TYPE_LABELS = {
  RETURN: "İade talebi",
  INVOICE_REQUEST: "Fatura talebi",
  WRONG_INVOICE: "Hatalı fatura bildirimi",
  EXTRA_ITEM: "Fazla ürün bildirimi",
  OTHER: "Diğer",
} as const;

export type RequestTypeKey = keyof typeof REQUEST_TYPE_LABELS;

/**
 * Talep tipi seçim listesinde etiketin altında görünen açıklamalar.
 *
 * Etiketler tek başına ayırt edici değil: "Fatura talebi" ile "Hatalı fatura
 * bildirimi" arasındaki farkı müşteri ancak ne zaman hangisini seçeceğini
 * okuyunca anlıyor. Yanlış tip seçilmesi admin kuyruğunu kirletiyor.
 */
export const REQUEST_TYPE_DESCRIPTIONS: Record<RequestTypeKey, string> = {
  RETURN: "Ürünü geri göndermek istiyorum",
  INVOICE_REQUEST: "Siparişimin faturasına ulaşamıyorum",
  WRONG_INVOICE: "Faturamdaki bilgiler hatalı",
  EXTRA_ITEM: "Sipariş etmediğim bir ürün geldi",
  OTHER: "Yukarıdakilerin dışında bir konu",
};

/**
 * Müşterinin fiziksel gönderi yapması beklenen talep tipleri.
 *
 * Fazla ürün bildirimi de listede: yanlışlıkla gelen ürün geri gönderiliyor,
 * dolayısıyla iade kodu ve adres onda da gerekiyor. Bu kuralın ikizi admin
 * tarafında (`lib/return-code.ts` → `requiresReturnShipment`) ve **iade kodunu
 * üreten taraf orası.** İkisi ayrışırsa admin kod üretir ama müşteri kodu
 * ekranda görmez; o yüzden liste aynı tutulmalı.
 */
const REQUEST_TYPES_REQUIRING_SHIPMENT: RequestTypeKey[] = ["RETURN", "EXTRA_ITEM"];

export function requiresReturnShipment(requestType: RequestTypeKey): boolean {
  return REQUEST_TYPES_REQUIRING_SHIPMENT.includes(requestType);
}

/**
 * İptal nedenleri.
 *
 * `CancellationRequest.reason` şemada serbest metin (`String?`), enum değil.
 * Bu yüzden sunucuya **etiketin kendisi** gönderiliyor: admin paneli
 * (`cancellation-requests/page.tsx:24`) alanı olduğu gibi bastığı için
 * anahtar göndermek orada "FOUND_CHEAPER" gibi okunamayan bir metin bırakırdı.
 *
 * Nedenler referans ekranından birebir alındı; sıralaması da aynı.
 */
export const CANCEL_REASON_LABELS = {
  DELIVERY_DATE: "Teslimat tarihi bana uymuyor",
  FOUND_CHEAPER: "Daha uygun fiyata buldum",
  CHANGE_ADDRESS: "Adresimi değiştirmek istiyorum",
  CHANGE_PAYMENT: "Ödeme yöntemimi değiştirmek istiyorum",
  WRONG_PRODUCT: "Yanlış ürün seçtim",
  OTHER: "Diğer",
} as const;

export type CancelReasonKey = keyof typeof CANCEL_REASON_LABELS;

/** "Diğer" seçilirse serbest metin zorunlu — aksi halde neden bilgisi boş kalır. */
export const CANCEL_REASON_REQUIRING_TEXT: CancelReasonKey = "OTHER";

/**
 * Talep durumları. İki ayrı onay var ve bunları ayırmak kritik:
 *
 *   `APPROVED`  → "gönderebilirsin, iade kodun bu". **Para çıkmadı.**
 *   `COMPLETED` → inceleme olumlu, ödeme iade edildi.
 *
 * Arada `RECEIVED` var: koli depoya ulaştı, inceleniyor. Eskiden yalnızca
 * `APPROVED` vardı ve onay anında para çıkıyordu; ürün gelmeden ödeme yapmak
 * mağazayı korumasız bırakıyordu.
 */
export const REQUEST_STATUS_LABELS = {
  PENDING_ADMIN_APPROVAL: "Değerlendiriliyor",
  APPROVED: "Onaylandı · kargoya verilmesi bekleniyor",
  RECEIVED: "Ürün bize ulaştı · inceleniyor",
  COMPLETED: "İade tamamlandı · ödeme iade edildi",
  REJECTED: "Reddedildi",
} as const;

export type RequestStatusKey = keyof typeof REQUEST_STATUS_LABELS;

/**
 * Süreci devam eden talep durumları.
 *
 * Aynı sipariş için ikinci bir talep açılmasını engellemekte kullanılıyor:
 * müşterinin kolisi yoldayken veya incelenirken yeni talep açması, admin'in
 * hangisini işleyeceğini belirsiz bırakır. Yalnızca `PENDING_ADMIN_APPROVAL`
 * kontrol etmek yetmez — onaylanmış ama henüz tamamlanmamış talep de açıktır.
 */
export const OPEN_REQUEST_STATUSES: RequestStatusKey[] = [
  "PENDING_ADMIN_APPROVAL",
  "APPROVED",
  "RECEIVED",
];

export function isOpenRequestStatus(status: string): boolean {
  return (OPEN_REQUEST_STATUSES as string[]).includes(status);
}

/**
 * Yeni bir İADE talebinin önünü kesen durumlar.
 *
 * `REJECTED` burada, `OPEN_REQUEST_STATUSES`'ta değil: ret **kesindir**,
 * reddedilen müşteri aynı sipariş için ikinci bir talep açamaz. Ayrı bir liste
 * olmasının sebebi `OPEN_REQUEST_STATUSES`'ın başka bir soruyu yanıtlaması —
 * "süreç devam ediyor mu" ile "yeni talep açılabilir mi" aynı şey değil.
 *
 * `COMPLETED` BİLİNÇLİ olarak yok. Tam iadede sipariş `REFUNDED` olur ve iade
 * kapısı zaten sipariş durumundan kapanır; kısmi iadede sipariş `DELIVERED`
 * kalır ve müşterinin iade etmediği kalemler durur. `COMPLETED`'ı da
 * engellemek, kısmi iade yeteneğini (`ReturnRequestItem`, `refundedAmount`)
 * sessizce ölü hale getirirdi.
 */
export const RETURN_BLOCKING_STATUSES: RequestStatusKey[] = [
  ...OPEN_REQUEST_STATUSES,
  "REJECTED",
];

/**
 * Bu talep kaydı yeni bir iade talebini engelliyor mu.
 *
 * Tip filtresi şart: reddedilmiş bir FATURA talebi iade hakkını yakmamalı,
 * tersi de geçerli. Kural yalnızca `RETURN` kayıtlarına bakıyor.
 */
export function blocksNewReturnRequest(request: {
  requestType: string;
  status: string;
}): boolean {
  if (request.requestType !== "RETURN") return false;
  return (RETURN_BLOCKING_STATUSES as string[]).includes(request.status);
}

/**
 * Müşterinin SEÇEBİLECEĞİ iade nedenleri.
 *
 * Bu sözlük iki işi birden yapıyordu — "hangi neden seçilebilir" ve "kayıttaki
 * neden nasıl yazılır". `CHANGED_MIND` kaldırılınca ikisi ayrılmak zorunda
 * kaldı: seçenek listeden çıkıyor ama o nedenle açılmış eski kayıtlar hâlâ
 * ekrana basılıyor. Görüntüleme tarafı için `returnReasonLabel()` var.
 */
export const RETURN_REASON_LABELS = {
  DAMAGED: "Ürün hasarlı / kırık geldi",
  WRONG_PRODUCT: "Yanlış ürün gönderildi",
  SPECS_MISMATCH: "Ürün açıklamasıyla uyuşmuyor",
  MISSING_ITEM: "Eksik ürün / teslim edilmedi",
  NOT_RECEIVED: "Kargom ulaşmadı",
} as const;

export type ReturnReasonKey = keyof typeof RETURN_REASON_LABELS;

/**
 * Artık teklif edilmeyen ama VERİTABANINDA duran nedenler.
 *
 * `ReturnReason` yerel bir Postgres enum'u; bir değeri kaldırmak tipin yeniden
 * yaratılmasını gerektirir ve o değeri taşıyan satır varsa yıkıcıdır. Bu yüzden
 * `CHANGED_MIND` veritabanında bırakıldı, yalnızca formdan ve sunucunun kabul
 * listesinden çıkarıldı. Etiketi burada duruyor ki eski talepler müşteri ve
 * admin ekranlarında ham enum adıyla görünmesin.
 */
const LEGACY_RETURN_REASON_LABELS = {
  CHANGED_MIND: "Fikrimi değiştirdim (cayma hakkı)",
} as const;

/** Kayıtlarda karşılaşılabilecek tüm nedenler — seçilebilir olanlar + tarihsel. */
export type StoredReturnReasonKey = ReturnReasonKey | keyof typeof LEGACY_RETURN_REASON_LABELS;

/**
 * Neden etiketi. Sözlükte olmayan bir değer gelirse ham metin döner: enum'a
 * ileride eklenecek bir değer ekranı çökertmemeli, en kötü ihtimalle
 * okunmayan bir dize göstermeli.
 */
export function returnReasonLabel(reason: string): string {
  const all: Record<string, string> = {
    ...RETURN_REASON_LABELS,
    ...LEGACY_RETURN_REASON_LABELS,
  };
  return all[reason] ?? reason;
}

/**
 * Sunucunun kabul listesi. Tarihsel nedenler BİLEREK dışarıda: kaldırılan bir
 * seçenek yalnızca formdan silinirse uç nokta onu kabul etmeye devam eder ve
 * düğmesi olmayan bir arka kapı kalır.
 */
export function isSelectableReturnReason(value: string): value is ReturnReasonKey {
  return Object.prototype.hasOwnProperty.call(RETURN_REASON_LABELS, value);
}

/**
 * Fotoğraf olmadan değerlendirilemeyen nedenler.
 *
 * `SPECS_MISMATCH` listede, çünkü iddia müşterinin elindeki FİZİKSEL ürün
 * hakkında; ilanla karşılaştırma ancak görselle yapılabiliyor.
 *
 * `MISSING_ITEM` ve `NOT_RECEIVED` bilinçli olarak dışarıda: ikisi de teslim
 * sorunu ve üründen yoksun müşteriden fotoğraf istemek onu gönderilemeyen bir
 * formda kilitler (şema yorumu, `ReturnReason` enum'u). Gereksiz zorunluluk ile
 * gereksiz esneklik arasındaki maliyet asimetrik: birincisi talebi imkânsız
 * kılar, ikincisi admin'in bir soru sormasına yol açar.
 */
export const REASONS_REQUIRING_IMAGE: ReturnReasonKey[] = [
  "DAMAGED",
  "WRONG_PRODUCT",
  "SPECS_MISMATCH",
];

/**
 * Açıklamanın zorunlu olduğu talep tipleri.
 *
 * `RETURN` bu turda eklendi: iade sebebi radyo listesinden geliyor ama tek
 * başına "ürün hasarlı" admin'e neyin nasıl hasarlı olduğunu söylemiyor ve o
 * soru müşteriye ikinci kez sorulamıyor.
 *
 * `INVOICE_REQUEST` dışarıda kalıyor — faturasını isteyen müşteriden gerekçe
 * beklemek anlamsız sürtünme.
 */
export const DESCRIPTION_REQUIRED_TYPES: RequestTypeKey[] = [
  "RETURN",
  "OTHER",
  "EXTRA_ITEM",
  "WRONG_INVOICE",
];

export function isDescriptionRequired(requestType: RequestTypeKey): boolean {
  return DESCRIPTION_REQUIRED_TYPES.includes(requestType);
}

/**
 * Açıklama uzunluk sınırları — `trim()` SONRASI ölçülür.
 *
 * Alt sınır 10: tek harfi, noktayı ve "asd" türü geçiştirmeleri eliyor ama
 * "kutu ezilmiş" gibi gerçek kısa cevapları geçiriyor. Daha yükseği (20+)
 * meşru açıklamaları reddeder ve müşteriyi anlamsızca uzun yazmaya zorlar;
 * o noktada form terk ediliyor.
 *
 * Üst sınır sunucuda da uygulanıyor: `maxLength` yalnızca bir DOM özniteliği,
 * uç nokta doğrudan çağrıldığında hiçbir şey ifade etmiyor.
 */
export const DESCRIPTION_MIN_LENGTH = 10;
export const DESCRIPTION_MAX_LENGTH = 1000;

export const CANCELLATION_REASONS = [
  { value: "DeliveryDateNotSuitable", label: "Teslimat tarihi bana uymuyor" },
  { value: "FoundCheaper", label: "Daha uygun fiyata buldum" },
  { value: "ChangedMind", label: "Siparişimden vazgeçtim" },
  { value: "WantToChangePaymentMethod", label: "Ödeme yöntemimi değiştirmek istiyorum" },
  { value: "SelectedWrongProduct", label: "Yanlış ürün seçtim" },
  { value: "Other", label: "Diğer" },
] as const;

/**
 * İADE PENCERESİ — teslimattan itibaren 14 gün, arayüzde ve sunucuda AYNI.
 *
 * Yasal cayma süresiyle aynı; iade politikası sayfası, mesafeli satış
 * sözleşmesi ve kategori SSS'leri de bu sayıyı söylüyor. Müşteri artık
 * politikada yazan hakkını ekrandan kullanabiliyor.
 *
 * **Neden ayrımsız:** iade nedenine göre istisna YOK (kullanıcı kararı,
 * 31 Tem — "ayıplı mal diye bir şey yok, hepsi 14 gün"). Hasarlı ürün de,
 * fikir değişikliği de aynı pencereye tabi.
 *
 * **Geçmiş:** buton eskiden 2. günde gizleniyordu, sunucuda ise hiç sınır
 * yoktu. Yani müşteri 3. günde ekrandan iade edemiyor ama API doğrudan
 * çağrılırsa 3 yıl sonra bile talep açılabiliyordu — iki yönde de yanlış
 * (F2-10). Tek pencereye indirildi; ekranda geri sayım gösterilmiyor, süre
 * dolunca buton sessizce kayboluyor.
 */
export const RETURN_WINDOW_DAYS = 14;

/**
 * Pencere hâlâ açık mı.
 *
 * Teslim damgası yoksa `true`: sipariş henüz teslim edilmediyse (kargoda ya da
 * hiç ulaşmadıysa) sayacak bir süre de yoktur. Aynı gerekçe eksik veri için de
 * geçerli — müşteriyi bizim damgamızın eksikliği yüzünden hakkından mahrum
 * etmeyiz.
 */
export function isWithinReturnWindow(order: OrderRuleInput): boolean {
  const deliveredTime = toTime(order.deliveredAt);
  if (deliveredTime === null) return true;

  const elapsed = Date.now() - deliveredTime;
  return elapsed < RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

/**
 * Kural fonksiyonlarının ihtiyaç duyduğu asgari sipariş şekli.
 *
 * Yapısal tip: hem `/api/orders` yanıtındaki `Order` (tarihler `string`) hem
 * Prisma kaydı (tarihler `Date`) bu şekle uyar, böylece aynı fonksiyon iki
 * tarafta da çağrılabilir.
 */
export interface OrderRuleInput {
  status: string;
  paymentStatus?: string;
  trackingNumber?: string | null;
  invoiceUrl?: string | null;
  deliveredAt?: Date | string | null;
  shippedAt?: Date | string | null;
  preparingAt?: Date | string | null;
  confirmedAt?: Date | string | null;
  paidAt?: Date | string | null;
  cancelledAt?: Date | string | null;
}

function toTime(value: Date | string | null | undefined): number | null {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

// ═══════════════════════════════════════════════════════════════════════════
// DURUM SORGULARI
// ═══════════════════════════════════════════════════════════════════════════

export const isPaid = (order: OrderRuleInput) =>
  order.paymentStatus === "PAID" || !!order.paidAt;

export const isDelivered = (order: OrderRuleInput) =>
  order.status === "DELIVERED" || !!order.deliveredAt;

/** Teslim edilmiş sipariş de bir noktada kargoya verilmiştir. */
export const isShipped = (order: OrderRuleInput) =>
  isDelivered(order) || order.status === "SHIPPED" || !!order.shippedAt;

export const isPreparing = (order: OrderRuleInput) =>
  isShipped(order) || order.status === "PROCESSING" || !!order.preparingAt;

export const isCancelled = (order: OrderRuleInput) =>
  order.status === "CANCELLED" || !!order.cancelledAt;

export const isRefunded = (order: OrderRuleInput) => order.status === "REFUNDED";

/** Sipariş kapanmış mı — iptal veya iade edilmiş. */
export const isClosed = (order: OrderRuleInput) => isCancelled(order) || isRefunded(order);

// ═══════════════════════════════════════════════════════════════════════════
// İZİN KURALLARI
// ═══════════════════════════════════════════════════════════════════════════

/** Kargoya verilmemiş ve kapanmamış siparişler iptal edilebilir. */
export function canCancel(
  order: OrderRuleInput,
  opts: { hasCancellationRequest?: boolean } = {}
): boolean {
  if (opts.hasCancellationRequest) return false;
  return !["SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"].includes(order.status);
}

/**
 * İade/talep butonu gösterilsin mi.
 *
 * Pencere sunucudakiyle aynı fonksiyondan geliyor (`isWithinReturnWindow`), yani
 * buton görünüyorsa istek de kabul edilir — tersi de doğru. İkisi ayrı hesaplanır
 * hâlde bırakılırsa biri değişip diğeri unutulabilir.
 */
export function canReturn(
  order: OrderRuleInput,
  opts: {
    hasPendingReturnRequest?: boolean;
    /**
     * Bu sipariş için daha önce reddedilmiş bir iade talebi var mı. Ret kesin
     * olduğu için açık talep kadar bağlayıcı. İsteğe bağlı tanımlandı: alanı
     * hesaplamayan eski çağıranlar eski davranışı görmeye devam ediyor.
     */
    hasRejectedReturnRequest?: boolean;
  } = {}
): boolean {
  if (opts.hasPendingReturnRequest) return false;
  if (opts.hasRejectedReturnRequest) return false;

  // Kargodaki sipariş: müşteri henüz teslim almadı, süreç açık.
  if (order.status === "SHIPPED") return true;
  if (order.status !== "DELIVERED") return false;

  return isWithinReturnWindow(order);
}

/**
 * Kargo takibi gösterilsin mi.
 *
 * `DELIVERED` de dahil: teslim edilmiş siparişin takip geçmişine bakmak
 * meşru bir ihtiyaç ("ne zaman hangi şubeye gitti"). Eski kod bunu yalnızca
 * `SHIPPED` iken gösteriyordu, teslim anında takip bağlantısı kayboluyordu.
 */
export function canTrack(order: OrderRuleInput): boolean {
  if (!order.trackingNumber) return false;
  return order.status === "SHIPPED" || isDelivered(order);
}

/** Değerlendirme yalnızca teslim edilmiş siparişlerde açılır. */
export const canReview = (order: OrderRuleInput) => isDelivered(order);

/**
 * Fatura satırının üç durumu:
 *  - `active`  → fatura yüklü, görüntülenebilir
 *  - `pending` → teslim edildi ama fatura henüz yüklenmedi (pasif satır +
 *                bilgilendirme; müşteri faturayı arıyorsa boşluğa bakmasın)
 *  - `hidden`  → henüz teslim edilmedi, satır hiç gösterilmez
 */
export function invoiceRowState(order: OrderRuleInput): "active" | "pending" | "hidden" {
  if (order.invoiceUrl) return "active";
  return isDelivered(order) ? "pending" : "hidden";
}

/**
 * Sipariş durumuna göre açılabilecek talep tipleri.
 *
 * Sunucu ve istemci aynı listeyi buradan okur; `RequestSheet` kendi kurallarını
 * yazmaz (plan 03 §8/6.2).
 */
export function enabledRequestTypes(
  order: OrderRuleInput,
  /** `canReturn`'e olduğu gibi geçiyor; ret kesinliği burada da geçerli. */
  opts: { hasRejectedReturnRequest?: boolean } = {}
): RequestTypeKey[] {
  const types: RequestTypeKey[] = [];

  if (canReturn(order, opts)) types.push("RETURN");
  // Fatura ancak teslim sonrası talep edilebilir; öncesinde henüz kesilmemiştir.
  if (isDelivered(order) && !order.invoiceUrl) types.push("INVOICE_REQUEST");
  if (order.invoiceUrl) types.push("WRONG_INVOICE");
  if (isShipped(order)) types.push("EXTRA_ITEM");
  if (!isClosed(order)) types.push("OTHER");

  return types;
}

// ═══════════════════════════════════════════════════════════════════════════
// BİÇİMLENDİRME
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Referans biçimi: `29 Temmuz 2026 Çarşamba`. Gün adı, kullanıcının "kargo
 * hangi gün çıktı" sorusunu tarihi zihninde çevirmeden yanıtlamasını sağlıyor.
 */
export function formatOrderDate(
  value: Date | string | null | undefined,
  opts: { weekday?: boolean; time?: boolean } = {}
): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(opts.weekday ? { weekday: "long" as const } : {}),
    ...(opts.time ? { hour: "2-digit" as const, minute: "2-digit" as const } : {}),
  });
}

/**
 * Takip numarasını 4'erli gruplar: `1234567890123` → `1234 5678 9012 3`.
 * Uzun barkodu telefonda okuyup elle girmek gruplamasız neredeyse imkânsız.
 */
export function groupTrackingNumber(trackingNumber: string | null | undefined): string {
  if (!trackingNumber) return "";
  const clean = trackingNumber.replace(/\s+/g, "");
  return clean.replace(/(.{4})/g, "$1 ").trim();
}

/** Sipariş numarasını 3'erli gruplar (referans deseni): `4901496027` → `490 149 602 7`. */
export function groupOrderNumber(orderNumber: string): string {
  const digits = orderNumber.replace(/\D/g, "");
  if (digits.length < 7) return orderNumber;
  return digits.replace(/(.{3})/g, "$1 ").trim();
}

// ═══════════════════════════════════════════════════════════════════════════
// LİSTE FİLTRELERİ
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Liste filtre çipleri. `all` dışındakiler ham `OrderStatus` DEĞİL — birden
 * fazla durumu veya talep varlığını kapsıyorlar, bu yüzden ayrı bir sözlük.
 */
export const ORDER_FILTERS = [
  { value: "all", label: "Tüm Siparişler" },
  { value: "ongoing", label: "Devam Eden" },
  { value: "delivered", label: "Teslim Edilen" },
  { value: "cancelled", label: "İptal Edilen" },
  { value: "returned", label: "İade Edilen" },
] as const;

export type OrderFilterValue = (typeof ORDER_FILTERS)[number]["value"];

export function isOrderFilterValue(value: string): value is OrderFilterValue {
  return ORDER_FILTERS.some((filter) => filter.value === value);
}
