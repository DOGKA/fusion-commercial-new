/**
 * Return Request API
 * POST /api/orders/[orderNumber]/return-request - Create return request with images
 * GET /api/orders/[orderNumber]/return-request - Get return requests
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReturnReason } from "@prisma/client";
import {
  checkRateLimit,
  getClientIP,
  RATE_LIMITS,
  isIpBanned,
  getBanTimeRemaining,
} from "@/lib/rate-limit";
import { uploadToS3, generateReturnImageKey, isS3Configured } from "@/lib/s3";
import {
  REQUEST_TYPE_LABELS,
  REASONS_REQUIRING_IMAGE,
  RETURN_BLOCKING_STATUSES,
  RETURN_WINDOW_DAYS,
  DESCRIPTION_MIN_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  isDescriptionRequired,
  isOpenRequestStatus,
  isSelectableReturnReason,
  isWithinReturnWindow,
  returnReasonLabel,
  type RequestTypeKey,
  type ReturnReasonKey,
} from "@/lib/orders";

// Max dosya boyutu: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 3;

// İzin verilen dosya tipleri
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Allowed magic bytes for image validation
const IMAGE_MAGIC_BYTES: Record<string, number[]> = {
  "image/jpeg": [0xFF, 0xD8, 0xFF],
  "image/jpg": [0xFF, 0xD8, 0xFF],
  "image/png": [0x89, 0x50, 0x4E, 0x47],
  "image/webp": [0x52, 0x49, 0x46, 0x46], // RIFF header
};

function validateImageMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const expectedBytes = IMAGE_MAGIC_BYTES[mimeType];
  if (!expectedBytes) return false;
  
  for (let i = 0; i < expectedBytes.length; i++) {
    if (buffer[i] !== expectedBytes[i]) return false;
  }
  return true;
}

interface RouteParams {
  params: Promise<{ orderNumber: string }>;
}

/*
 * Neden sözlüğü ve kabul listesi ARTIK BURADA DEĞİL.
 *
 * Bu dosyanın kendi `RETURN_REASON_LABELS` kopyası vardı ve kabul listesini
 * ondan türetiyordu. Sonuç: bir seçenek `lib/orders.ts`'ten kaldırıldığında
 * form onu göstermeyi bırakıyor ama uç nokta kabul etmeye devam ediyordu —
 * yani düğmesi olmayan bir arka kapı. "Fikrimi değiştirdim" kaldırılırken
 * ortaya çıkan tam olarak bu tuzaktı; kopya silindi.
 */

function isRequestType(value: string): value is RequestTypeKey {
  return Object.prototype.hasOwnProperty.call(REQUEST_TYPE_LABELS, value);
}

/**
 * Hangi talep tipi hangi sipariş durumunda açılabilir.
 *
 * Tek kural olarak `status IN (SHIPPED, DELIVERED)` yetmiyordu: fatura ancak
 * teslim sonrası talep edilebilir, "hatalı fatura" ise ortada bir fatura
 * yoksa anlamsızdır.
 */
function isRequestTypeAllowed(
  requestType: RequestTypeKey,
  order: { status: string; invoiceUrl: string | null }
): boolean {
  switch (requestType) {
    case "RETURN":
    case "EXTRA_ITEM":
      return order.status === "SHIPPED" || order.status === "DELIVERED";
    case "INVOICE_REQUEST":
      return order.status === "DELIVERED";
    case "WRONG_INVOICE":
      return !!order.invoiceUrl;
    case "OTHER":
      return order.status !== "CANCELLED" && order.status !== "REFUNDED";
  }
}

/** İstemciden gelen kalem seçimi. */
type SelectedItemInput = { orderItemId: string; quantity: number };

/**
 * Kalem seçimini ayrıştırır ve siparişe göre doğrular.
 *
 * Seçim **isteğe bağlı**: gönderilmezse talep tüm siparişi kapsar ve bu, alan
 * eklenmeden önceki davranışın aynısıdır. Gönderildiğinde her kalemin gerçekten
 * bu siparişe ait olduğu ve adedin sipariştekini aşmadığı doğrulanır — aksi
 * hâlde müşteri hiç almadığı bir ürünü iade ediyormuş gibi kayıt açabilirdi.
 */
function parseSelectedItems(
  raw: string | null,
  orderItems: Array<{ id: string; quantity: number }>
): { items: SelectedItemInput[] } | { error: string } {
  if (!raw || !raw.trim()) return { items: [] };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "Seçilen ürün bilgisi okunamadı" };
  }

  if (!Array.isArray(parsed)) {
    return { error: "Seçilen ürün bilgisi okunamadı" };
  }
  if (parsed.length === 0) return { items: [] };

  const byId = new Map(orderItems.map((item) => [item.id, item.quantity]));
  const seen = new Set<string>();
  const items: SelectedItemInput[] = [];

  for (const entry of parsed) {
    if (typeof entry !== "object" || entry === null) {
      return { error: "Seçilen ürün bilgisi okunamadı" };
    }
    const { orderItemId, quantity } = entry as Record<string, unknown>;

    if (typeof orderItemId !== "string" || !byId.has(orderItemId)) {
      return { error: "Seçilen ürün bu siparişe ait değil" };
    }
    if (seen.has(orderItemId)) {
      return { error: "Aynı ürün birden fazla kez seçilmiş" };
    }
    seen.add(orderItemId);

    const ordered = byId.get(orderItemId)!;
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
      return { error: "Geçersiz adet" };
    }
    if (quantity > ordered) {
      return { error: "Seçilen adet sipariştekinden fazla olamaz" };
    }

    items.push({ orderItemId, quantity });
  }

  return { items };
}

function requestTypeRejectionMessage(requestType: RequestTypeKey, status: string): string {
  if (requestType === "INVOICE_REQUEST") {
    return "Fatura talebi yalnızca teslim edilmiş siparişler için oluşturulabilir.";
  }
  if (requestType === "WRONG_INVOICE") {
    return "Bu siparişe ait yüklenmiş bir fatura bulunmuyor.";
  }
  if (requestType === "OTHER") {
    return "Kapanmış siparişler için talep oluşturulamaz.";
  }

  const statusMessages: Record<string, string> = {
    PENDING:
      "Beklemedeki siparişler için iade talebi oluşturulamaz. İptal talebinde bulunabilirsiniz.",
    PROCESSING:
      "Hazırlanan siparişler için iade talebi oluşturulamaz. İptal talebinde bulunabilirsiniz.",
    CANCELLED: "Bu sipariş iptal edilmiş.",
    REFUNDED: "Bu sipariş zaten iade edilmiş.",
  };
  return statusMessages[status] || "Bu sipariş için talep oluşturulamaz";
}

/**
 * GET - Get return requests for an order
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      );
    }

    const { orderNumber } = await params;

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Get order with return requests
    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        userId: user.id,
      },
      include: {
        returnRequests: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı" },
        { status: 404 }
      );
    }

    // Map return requests with Turkish labels
    const returnRequests = order.returnRequests.map((req) => ({
      ...req,
      requestTypeLabel: REQUEST_TYPE_LABELS[req.requestType as RequestTypeKey] ?? req.requestType,
      // İade dışı taleplerde neden yoktur. `returnReasonLabel` kaldırılmış
      // nedenleri de biliyor, eski kayıtlar ham enum adıyla dönmüyor.
      reasonLabel: req.reason ? returnReasonLabel(req.reason) : null,
    }));

    return NextResponse.json({
      hasReturnRequest: returnRequests.length > 0,
      hasPendingReturnRequest: returnRequests.some((r) =>
        isOpenRequestStatus(r.status)
      ),
      returnRequests,
    });
  } catch (error) {
    console.error("❌ [RETURN REQUEST] GET error:", error);
    return NextResponse.json(
      { error: "İade talepleri alınamadı" },
      { status: 500 }
    );
  }
}

/**
 * POST - Create return request with images
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      );
    }

    const clientIp = getClientIP(request.headers);
    const { orderNumber } = await params;

    // Check IP ban
    const banCheck = isIpBanned(clientIp);
    if (banCheck.banned) {
      const timeRemaining = getBanTimeRemaining(banCheck.bannedUntil!);
      return NextResponse.json(
        {
          error: `İşlem geçici olarak kısıtlandı. Lütfen ${timeRemaining} sonra tekrar deneyiniz.`,
          bannedUntil: banCheck.bannedUntil,
        },
        { status: 429 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Rate limit check - User based
    const userRateLimit = checkRateLimit(
      `return-request:user:${user.id}`,
      RATE_LIMITS.returnRequestUser
    );
    if (!userRateLimit.success) {
      return NextResponse.json(
        {
          error: `Son 1 saat içinde çok fazla iade talebi oluşturdunuz. Lütfen ${Math.ceil(userRateLimit.resetIn / 60)} dakika sonra tekrar deneyiniz.`,
        },
        { status: 429 }
      );
    }

    // Rate limit check - IP based
    const ipRateLimit = checkRateLimit(
      `return-request:ip:${clientIp}`,
      RATE_LIMITS.returnRequestIp
    );
    if (!ipRateLimit.success) {
      return NextResponse.json(
        {
          error: `Son 1 saat içinde çok fazla iade talebi oluşturdunuz. Lütfen ${Math.ceil(ipRateLimit.resetIn / 60)} dakika sonra tekrar deneyiniz.`,
        },
        { status: 429 }
      );
    }

    // Parse FormData
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { error: "Geçersiz istek verisi" },
        { status: 400 }
      );
    }

    const reason = formData.get("reason") as string | null;
    const description = formData.get("description") as string | null;

    // `requestType` verilmezse RETURN varsayılır: eski istemciler bu alanı
    // göndermiyor ve bozulmamaları gerekiyor.
    const rawRequestType = (formData.get("requestType") as string | null) || "RETURN";
    if (!isRequestType(rawRequestType)) {
      return NextResponse.json({ error: "Geçersiz talep tipi" }, { status: 400 });
    }
    const requestType = rawRequestType;

    // İade nedeni YALNIZCA gerçek iadelerde zorunlu; fatura talebinin nedeni olmaz.
    // Kabul listesi `lib/orders.ts`'ten geliyor, yani formdan kaldırılan bir
    // seçenek burada da otomatik olarak reddediliyor.
    if (requestType === "RETURN") {
      if (!reason || !isSelectableReturnReason(reason)) {
        return NextResponse.json(
          { error: "Geçerli bir iade sebebi seçiniz" },
          { status: 400 }
        );
      }
    }
    const reasonValue = requestType === "RETURN" ? (reason as ReturnReason) : null;

    /**
     * Açıklama kuralı. `RETURN` bu turda zorunlu tiplere katıldı: radyo
     * listesinden gelen "ürün hasarlı" tek başına neyin nasıl hasarlı olduğunu
     * söylemiyor ve o soru müşteriye ikinci kez sorulamıyor.
     *
     * Alt sınır boşluk kırpıldıktan SONRA ölçülüyor; on boşluk açıklama değil.
     * Üst sınır da burada: `maxLength` yalnızca bir DOM özniteliği ve uç nokta
     * doğrudan çağrıldığında hiçbir şey ifade etmiyor.
     */
    const trimmedDescription = description?.trim() ?? "";

    if (isDescriptionRequired(requestType)) {
      if (!trimmedDescription) {
        return NextResponse.json(
          { error: "Lütfen talebinizi kısaca açıklayın" },
          { status: 400 }
        );
      }
      if (trimmedDescription.length < DESCRIPTION_MIN_LENGTH) {
        return NextResponse.json(
          {
            error: `Açıklama en az ${DESCRIPTION_MIN_LENGTH} karakter olmalıdır. Talebinizi biraz daha ayrıntılı yazınız.`,
            code: "DESCRIPTION_TOO_SHORT",
          },
          { status: 400 }
        );
      }
    }

    if (trimmedDescription.length > DESCRIPTION_MAX_LENGTH) {
      return NextResponse.json(
        { error: `Açıklama en fazla ${DESCRIPTION_MAX_LENGTH} karakter olabilir.` },
        { status: 400 }
      );
    }

    // Get order
    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        userId: user.id,
      },
      include: {
        /**
         * Yeni talebin önünü kesebilecek kayıtlar. İki farklı gerekçe var ve
         * ikisi tek sorguda çekiliyor:
         *  - süreci devam eden talep (kolisi yolda ya da inceleniyor),
         *  - REDDEDİLMİŞ iade talebi — ret kesindir.
         */
        returnRequests: {
          where: { status: { in: RETURN_BLOCKING_STATUSES } },
          select: { status: true, requestType: true, adminNote: true },
        },
        items: { select: { id: true, quantity: true } },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı" },
        { status: 404 }
      );
    }

    // Süreci devam eden talep, TİPİNDEN BAĞIMSIZ olarak yeni talebi engelliyor:
    // admin aynı sipariş için iki açık kayıt görürse hangisini işleyeceği belirsiz.
    if (order.returnRequests.some((r) => isOpenRequestStatus(r.status))) {
      return NextResponse.json(
        { error: "Bu sipariş için devam eden bir talebiniz var" },
        { status: 400 }
      );
    }

    /**
     * RET KESİNDİR — reddedilen müşteri aynı sipariş için ikinci bir iade
     * talebi açamaz. Kural SUNUCUDA: arayüzde butonu gizlemek yetmez, uç nokta
     * doğrudan çağrılabiliyor.
     *
     * Yalnızca `RETURN` → `RETURN` yolunu kapatıyor. Reddedilmiş bir fatura
     * talebi iade hakkını yakmamalı, reddedilmiş bir iade de müşterinin fatura
     * isteyebilmesini engellememeli.
     *
     * Gerekçe yanıta konuyor: kapıyı kapatırken sebebini söylememek müşteriyi
     * çıkışsız bırakıyor ve aramaya zorluyor.
     */
    if (requestType === "RETURN") {
      const rejectedReturn = order.returnRequests.find(
        (r) => r.requestType === "RETURN" && r.status === "REJECTED"
      );
      if (rejectedReturn) {
        return NextResponse.json(
          {
            error: rejectedReturn.adminNote?.trim()
              ? `Bu sipariş için iade talebiniz daha önce reddedildi, yeni talep oluşturulamıyor. Ret gerekçesi: ${rejectedReturn.adminNote.trim()}`
              : "Bu sipariş için iade talebiniz daha önce reddedildi ve yeni talep oluşturulamıyor. Konuyu görüşmek isterseniz müşteri hizmetlerimize ulaşabilirsiniz.",
            code: "RETURN_REJECTED_FINAL",
          },
          { status: 400 }
        );
      }
    }

    // Durum kontrolü talep tipine göre.
    if (!isRequestTypeAllowed(requestType, order)) {
      return NextResponse.json(
        { error: requestTypeRejectionMessage(requestType, order.status) },
        { status: 400 }
      );
    }

    /**
     * İade penceresi (F2-10) — arayüzdeki butonla aynı fonksiyon, aynı 14 gün.
     * Öncesinde sunucuda HİÇ sınır yoktu, yani yıllar önce teslim edilmiş bir
     * siparişe API doğrudan çağrılarak iade talebi açılabiliyordu.
     *
     * Yalnızca `RETURN` için: fatura talebi, hatalı fatura ve "diğer" cayma
     * hakkına dayanmıyor, onları 14. günde kapatmak müşteriyi iletişimsiz
     * bırakırdı. İade nedenine göre istisna yok (kullanıcı kararı).
     */
    if (requestType === "RETURN" && !isWithinReturnWindow(order)) {
      return NextResponse.json(
        {
          error: `İade süresi doldu. Teslimattan sonra ${RETURN_WINDOW_DAYS} gün içinde iade talebi oluşturabilirsiniz. Yine de bir sorun varsa müşteri hizmetlerimize ulaşın.`,
          code: "RETURN_WINDOW_CLOSED",
        },
        { status: 400 }
      );
    }

    const selection = parseSelectedItems(
      formData.get("items") as string | null,
      order.items
    );
    if ("error" in selection) {
      return NextResponse.json({ error: selection.error }, { status: 400 });
    }
    const selectedItems = selection.items;

    // Process images
    const imageUrls: string[] = [];
    const imageFiles = formData.getAll("images") as File[];
    
    if (imageFiles.length > MAX_IMAGES) {
      return NextResponse.json(
        { error: `En fazla ${MAX_IMAGES} görsel yükleyebilirsiniz` },
        { status: 400 }
      );
    }

    const realImageFiles = imageFiles.filter((file) => file && file.size > 0);
    const imageRequired =
      requestType === "RETURN" &&
      !!reasonValue &&
      REASONS_REQUIRING_IMAGE.includes(reasonValue as ReturnReasonKey);

    if (imageRequired && realImageFiles.length === 0) {
      return NextResponse.json(
        {
          error: "Bu iade sebebi için en az bir fotoğraf eklemeniz gerekiyor.",
          code: "IMAGE_REQUIRED",
        },
        { status: 400 }
      );
    }

    /**
     * 🐛 DÜZELTİLEN HATA: depolama yapılandırılmamışsa görseller **sessizce yok
     * sayılıyordu.** Hasarlı ürün iadesinde müşteri fotoğrafı yüklüyor, ekranda
     * başarı mesajı görüyor, ama admin'e boş bir talep düşüyordu — sonra da
     * "fotoğraf göndermemiş" diye reddedilebiliyordu. Görsel zorunlu bir
     * tipte bu sessiz kayıp kabul edilemez, artık 503 dönüyor.
     */
    if (imageRequired && !isS3Configured()) {
      return NextResponse.json(
        {
          error:
            "Fotoğraf yükleme servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin veya müşteri hizmetlerine ulaşın.",
          code: "UPLOAD_UNAVAILABLE",
        },
        { status: 503 }
      );
    }

    /**
     * Görsel zorunlu değilken depolama kapalıysa talebi bloklamıyoruz: iade
     * hakkı isteğe bağlı bir ekten daha önemli. Ama sunucu kaydına yazıyoruz,
     * yoksa kayıp hiçbir yerde görünmez.
     */
    if (realImageFiles.length > 0 && !isS3Configured()) {
      console.warn(
        `[return-request] ${orderNumber}: depolama yapılandırılmadığı için ${realImageFiles.length} görsel kaydedilemedi.`
      );
    }

    // Görselleri depolamaya (Cloudflare R2) yükle
    if (realImageFiles.length > 0 && isS3Configured()) {
      for (const file of realImageFiles) {
        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
          return NextResponse.json(
            { error: "Sadece JPEG, PNG ve WebP formatları desteklenir" },
            { status: 400 }
          );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: "Her görsel 5MB'dan küçük olmalıdır" },
            { status: 400 }
          );
        }

        // Convert to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Validate magic bytes
        if (!validateImageMagicBytes(buffer, file.type)) {
          return NextResponse.json(
            { error: "Geçersiz dosya formatı" },
            { status: 400 }
          );
        }

        /**
         * Depolama hatası ayrı yakalanıyor. Öncesinde döngüde `try/catch`
         * yoktu ve R2 tek bir dosyada hata verdiğinde istisna en dıştaki
         * `catch`'e düşüp müşteriye "İade talebi oluşturulamadı" yazdırıyordu:
         * kendi hatası sandığı, ne yapacağını söylemeyen bir mesaj. Artık
         * hatanın depolama kaynaklı olduğu söyleniyor.
         */
        const key = generateReturnImageKey(orderNumber, file.name);
        try {
          const url = await uploadToS3(key, buffer, file.type);
          imageUrls.push(url);
        } catch (uploadError) {
          console.error(
            `❌ [RETURN REQUEST] ${orderNumber}: görsel yüklenemedi (${key})`,
            uploadError
          );
          return NextResponse.json(
            {
              error:
                "Fotoğraflarınız yüklenemedi. Lütfen birkaç dakika sonra tekrar deneyin; sorun sürerse müşteri hizmetlerimize ulaşın.",
              code: "UPLOAD_FAILED",
            },
            { status: 502 }
          );
        }
      }
    }

    // Create return request
    const returnRequest = await prisma.returnRequest.create({
      data: {
        orderId: order.id,
        userId: user.id,
        requestType,
        reason: reasonValue,
        description: trimmedDescription || null,
        images: imageUrls,
        requestIp: clientIp,
        status: "PENDING_ADMIN_APPROVAL",
        // Seçim yoksa kayıt da yazılmaz; boşluk "tüm sipariş" demek.
        items: selectedItems.length
          ? { create: selectedItems.map((item) => ({
              orderItemId: item.orderItemId,
              quantity: item.quantity,
            })) }
          : undefined,
      },
    });

    // Log rate limit action
    await prisma.rateLimitLog.create({
      data: {
        ip: clientIp,
        userId: user.id,
        action: "RETURN_REQUEST",
      },
    });

    console.log(`✅ Return request created for order ${orderNumber} with ${imageUrls.length} images`);

    return NextResponse.json({
      success: true,
      message:
        requestType === "RETURN"
          ? "İade talebiniz alındı. İnceleme sonrası bilgilendirileceksiniz."
          : "Talebiniz alındı. İnceleme sonrası bilgilendirileceksiniz.",
      returnRequest: {
        id: returnRequest.id,
        status: returnRequest.status,
        requestType: returnRequest.requestType,
        requestTypeLabel: REQUEST_TYPE_LABELS[returnRequest.requestType as RequestTypeKey],
        reason: returnRequest.reason,
        reasonLabel: returnRequest.reason ? returnReasonLabel(returnRequest.reason) : null,
        images: returnRequest.images,
        createdAt: returnRequest.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ [RETURN REQUEST] POST error:", error);
    return NextResponse.json(
      { error: "İade talebi oluşturulamadı" },
      { status: 500 }
    );
  }
}
