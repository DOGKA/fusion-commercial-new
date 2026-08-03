/**
 * Admin Return Request API - Single Request Operations
 * GET /api/admin/return-requests/[id] - Get request details
 * PATCH /api/admin/return-requests/[id] - Approve/Reject request
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { createRefund, IYZICO_ENABLED } from "@/lib/iyzico";
import { generateReturnCode, requiresReturnShipment } from "@/lib/return-code";
import { canApply, rejectionReason, RETURN_ACTIONS } from "@/lib/return-flow";
import {
  calculateRefund,
  isFullyRefunded,
  refundExceedsRemaining,
  transactionRefundShare,
  type RefundItemInput,
} from "@/lib/return-refund";
import { sendOrderStatusEmail } from "@/lib/email";
import { revalidateTag } from "next/cache";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// 🔒 Authorization check helper
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { authorized: false, error: "Yetkilendirme gerekli", status: 401 };
  }
  
  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    return { authorized: false, error: "Bu işlem için yetkiniz yok", status: 403 };
  }
  
  return { authorized: true, session, userId: (session.user as any).id };
}

// Helper: Normalize IP
function normalizeIyzicoIp(rawIp?: string | null): string {
  const candidate = (rawIp || "").split(",")[0]?.trim();
  if (!candidate) {
    return process.env.IYZICO_IP_OVERRIDE || "127.0.0.1";
  }
  if (candidate.startsWith("::ffff:")) {
    return candidate.replace("::ffff:", "");
  }
  if (candidate.includes(":")) {
    return process.env.IYZICO_IP_OVERRIDE || "127.0.0.1";
  }
  return candidate;
}

/**
 * `OrderItem.variantInfo` içindeki varyant kimliği.
 *
 * Alan serbest biçimli JSON metni; bozuk kayıtta `JSON.parse` patlar ve tüm
 * iade işlemini düşürürdü. Varyant kimliği okunamazsa stok ürün düzeyinde
 * güncelleniyor — eksik bilgi, işlemi iptal etmekten iyi.
 */
function parseVariantId(variantInfo: string | null): string | null {
  if (!variantInfo) return null;
  try {
    const parsed = JSON.parse(variantInfo);
    return typeof parsed?.id === "string" ? parsed.id : null;
  } catch {
    return null;
  }
}

// Helper: Normalize price
function normalizeRefundPrice(rawPrice: unknown, orderTotal?: number): number | null {
  let value: number;
  if (typeof rawPrice === "string") {
    const normalized = rawPrice.replace(",", ".").trim();
    value = Number(normalized);
  } else if (typeof rawPrice === "number") {
    value = rawPrice;
  } else {
    return null;
  }

  if (!Number.isFinite(value)) {
    return null;
  }

  if (typeof orderTotal === "number" && Number.isFinite(orderTotal) && orderTotal > 0) {
    if (value > orderTotal * 10) {
      value = value / 100;
    }
  }

  return Math.round(value * 100) / 100;
}

// Reason labels
const REASON_LABELS: Record<string, string> = {
  DAMAGED: "Ürün Hasarlı Geldi",
  WRONG_PRODUCT: "Ürün Yanlış Gönderildi",
  SPECS_MISMATCH: "Teknik Özellikler Siparişimle Uyuşmamaktadır",
  CHANGED_MIND: "Fikrini Değiştirdi (Cayma Hakkı)",
  MISSING_ITEM: "Eksik Ürün / Teslim Edilmedi",
  NOT_RECEIVED: "Kargo Ulaşmadı",
};

/**
 * GET /api/admin/return-requests/[id]
 * Get return request details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;

    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    thumbnail: true,
                  },
                },
              },
            },
            shippingAddress: true,
            billingAddress: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        // Boş dizi "talep tüm siparişi kapsıyor" demek (bkz. ReturnRequestItem).
        items: {
          select: {
            quantity: true,
            orderItem: {
              select: {
                id: true,
                quantity: true,
                price: true,
                variantInfo: true,
                product: { select: { name: true, thumbnail: true } },
              },
            },
          },
        },
      },
    });

    if (!returnRequest) {
      return NextResponse.json(
        { error: "İade talebi bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...returnRequest,
      // İade dışı taleplerde neden yoktur (bkz. schema `ReturnRequest.reason`).
      reasonLabel: returnRequest.reason
        ? REASON_LABELS[returnRequest.reason] || returnRequest.reason
        : null,
      /**
       * Kısmi talep mi? Panel bu bayrağa bakarak otomatik para iadesini
       * kilitliyor — tutar hesabı henüz kalem bazına inmedi (F2-67, 2. dilim).
       */
      isPartial: returnRequest.items.length > 0,
      selectedItems: returnRequest.items.map((entry) => ({
        orderItemId: entry.orderItem.id,
        quantity: entry.quantity,
        orderedQuantity: entry.orderItem.quantity,
        unitPrice: Number(entry.orderItem.price),
        name: entry.orderItem.product?.name ?? "Ürün",
        thumbnail: entry.orderItem.product?.thumbnail ?? null,
        variantInfo: entry.orderItem.variantInfo,
      })),
    });
  } catch (error) {
    console.error("❌ [RETURN REQUEST] GET error:", error);
    return NextResponse.json(
      { error: "İade talebi alınamadı" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/return-requests/[id]
 * Approve or Reject a return request
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      action,
      adminNote,
      returnAddress,
      returnInstructions,
      sendBackCarrier,
      sendBackTrackingNumber,
    } = body;

    if (!action || !RETURN_ACTIONS.includes(action)) {
      return NextResponse.json(
        { error: `Geçersiz işlem. Şunlardan biri olmalı: ${RETURN_ACTIONS.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate return address for approval
    if (action === "approve" && !returnAddress?.trim()) {
      return NextResponse.json(
        { error: "İade adresi zorunludur" },
        { status: 400 }
      );
    }

    // Geri gönderimin tek anlamı takip edilebilmesi; numarasız kayıt işe yaramaz.
    if (action === "send-back" && !sendBackTrackingNumber?.trim()) {
      return NextResponse.json(
        { error: "Kargo takip numarası zorunludur" },
        { status: 400 }
      );
    }

    // Get the return request with order and user
    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            // Ürün adı iade e-postasında gerekiyor: müşteriye hangi ürünün
            // iadesinin tamamlandığını yazmadan "iadeniz tamamlandı" demek
            // yeni soru doğurur.
            items: { include: { product: { select: { name: true } } } },
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
        // Boş dizi "tüm sipariş" demek; dolu dizi kısmi iade hesabının girdisi.
        items: {
          select: {
            quantity: true,
            orderItem: {
              select: {
                id: true,
                productId: true,
                quantity: true,
                price: true,
                variantInfo: true,
              },
            },
          },
        },
      },
    });

    if (!returnRequest) {
      return NextResponse.json(
        { error: "İade talebi bulunamadı" },
        { status: 404 }
      );
    }

    // Geçiş kontrolü tek yerde: hangi aksiyonun hangi durumdan uygulanabildiği
    // `lib/return-flow.ts` içinde. Eski tek satırlık "zaten işlenmiş" kontrolü
    // iki aşamalı akışta yanıltıcıydı — onaylanmış bir talep işlenmiş olsa da
    // sıradaki adımı (teslim alma) bekliyor olabilir.
    if (!canApply(action, returnRequest.status)) {
      return NextResponse.json(
        { error: rejectionReason(action, returnRequest.status) },
        { status: 400 }
      );
    }

    const order = returnRequest.order;
    const now = new Date();
    let iyzicoResult: any = null;

    if (action === "approve") {
      // 1. AŞAMA — "İade inceleme talebi onaylandı."
      //
      // Bu adım müşteriye yalnızca "gönderebilirsin, kodun bu" der. Stok geri
      // yüklenmez ve PARA ÇIKMAZ; ikisi de `refund` aksiyonunda, ürün depoya
      // ulaşıp incelendikten sonra. Eskiden üçü birlikte burada yapılıyordu:
      // ürün henüz yola çıkmamışken para gidiyor, gelmeyen ürün de satılabilir
      // stok olarak görünüyordu.
      //
      // İade kodu: müşteri koliye bu kodu yazar, depo geleni kodla eşleştirir.
      // Yalnızca fiziksel gönderi beklenen tiplerde üretilir (fatura talebinde
      // gönderilecek bir şey yok).
      const returnCode = requiresReturnShipment(returnRequest.requestType)
        ? await generateReturnCode()
        : null;

      await prisma.returnRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          adminNote,
          returnAddress: returnAddress?.trim(),
          returnInstructions: returnInstructions?.trim() || null,
          returnCode,
          reviewedBy: auth.userId,
          reviewedAt: now,
        },
      });

      console.log(
        `✅ Return inspection approved for order ${order.orderNumber}` +
          (returnCode ? ` (iade kodu: ${returnCode})` : "")
      );

      if (order.user?.email) {
        try {
          const emailApiUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://fusionmarkt.com";
          await fetch(`${emailApiUrl}/api/email/return-approved`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: order.user.email,
              orderNumber: order.orderNumber,
              name: order.user.name,
              total: `₺${Number(order.total).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`,
              returnAddress: returnAddress?.trim(),
              returnInstructions: returnInstructions?.trim(),
              returnCode,
              adminNote,
            }),
          });
          console.log(`📧 Return approved email sent to ${order.user.email}`);
        } catch (emailError) {
          console.error(`❌ Email send error:`, emailError);
        }
      }

      revalidateTag("return-requests");

      return NextResponse.json({
        success: true,
        message: "İade inceleme talebi onaylandı. Ödeme, ürün teslim alınıp incelendikten sonra iade edilecek.",
        returnCode,
      });
    } else if (action === "receive") {
      // 2. AŞAMA — koli depoya ulaştı, kodla eşleştirildi. Para hâlâ çıkmıyor;
      // `receivedAt` inceleme süresinin (14 gün) sayacını başlatıyor.
      await prisma.returnRequest.update({
        where: { id },
        data: {
          status: "RECEIVED",
          receivedAt: now,
          adminNote: adminNote ?? returnRequest.adminNote,
        },
      });

      console.log(`📦 Return package received for order ${order.orderNumber}`);

      revalidateTag("return-requests");

      return NextResponse.json({
        success: true,
        message: "Ürün teslim alındı olarak işaretlendi. İnceleme sonrası para iadesini başlatabilirsiniz.",
      });
    } else if (action === "refund") {
      // 3. AŞAMA — "İade onaylandı." İnceleme olumlu: stok geri yüklenir, ödeme
      // iade edilir. Paranın hareket ettiği TEK yer.
      //
      // KISMİ / TAM ayrımı: talebin `items` kaydı varsa yalnızca o kalemler
      // işlenir, yoksa siparişin tamamı (bkz. `ReturnRequestItem` — kayıt yoksa
      // talep tüm siparişi kapsar).
      const isPartial = returnRequest.items.length > 0;

      /**
       * İşlenecek kalemler. Tam iadede sipariş kalemlerinin tamamı, kısmi
       * iadede yalnızca seçilenler — her ikisi de aynı biçime indirgeniyor ki
       * aşağıdaki stok ve tutar kodu iki durumu ayırt etmek zorunda kalmasın.
       */
      const refundItems: RefundItemInput[] = isPartial
        ? returnRequest.items.map((entry) => ({
            orderItemId: entry.orderItem.id,
            productId: entry.orderItem.productId,
            quantity: entry.quantity,
            orderedQuantity: entry.orderItem.quantity,
            unitPrice: Number(entry.orderItem.price),
            variantId: parseVariantId(entry.orderItem.variantInfo),
          }))
        : order.items.map((item) => ({
            orderItemId: item.id,
            productId: item.productId,
            quantity: item.quantity,
            orderedQuantity: item.quantity,
            unitPrice: Number(item.price),
            variantId: parseVariantId(item.variantInfo),
          }));

      /** Kalem kimliği → ürün adı; iade e-postasındaki liste için. */
      const orderItemNames = new Map(
        order.items.map((item) => [item.id, item.product?.name ?? "Ürün"])
      );

      const orderMoney = {
        subtotal: Number(order.subtotal),
        discount: Number(order.discount),
        total: Number(order.total),
        refundedAmount: Number(order.refundedAmount),
      };
      const breakdown = calculateRefund(orderMoney, refundItems);

      /**
       * ⚠️ ÇİFT İADE KORUMASI. Talepler sırayla açılıp kapanabildiği için üç
       * kalemli bir sipariş üç ayrı talepte tamamen iade edilebilir; dördüncü
       * talep hiçbir şey iade etmemeli. Kontrol tutar üzerinden yapılıyor,
       * çünkü kalem bazlı kontrol tam ve kısmi talepleri karşılaştırmayı
       * gerektirirdi ve tam taleplerde kalem kaydı yok.
       */
      if (isPartial) {
        const { exceeds, remaining } = refundExceedsRemaining(
          orderMoney,
          breakdown.total
        );
        if (exceeds) {
          return NextResponse.json(
            {
              error:
                `Bu iade tutarı (₺${breakdown.total.toFixed(2)}) siparişte iade edilebilecek ` +
                `kalan tutarı (₺${remaining.toFixed(2)}) aşıyor. Bu kalemler daha önce iade edilmiş olabilir.`,
              code: "REFUND_EXCEEDS_REMAINING",
            },
            { status: 400 }
          );
        }
      }

      // 1. Stok geri yükleme — yalnızca iade edilen kalem ve adet kadar.
      for (const item of refundItems) {
        if (!item.productId) continue;

        if (item.variantId) {
          await prisma.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        } else {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
      console.log(
        `✅ Stock restored for order ${order.orderNumber}` +
          (isPartial ? ` (kısmi: ${refundItems.length} kalem)` : "")
      );

      // 2. Process iyzico refund if applicable
      const orderData = order as any; // Cast for iyzico fields
      const isCardPayment = order.paymentMethod === "CREDIT_CARD" || order.paymentMethod === "iyzico";
      
      if (isCardPayment && IYZICO_ENABLED && orderData.iyzicoPaymentId) {
        const clientIp = normalizeIyzicoIp(
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip")
        );
        const orderTotal = Number(order.total);

        try {
          // Use Refund API (for returns, payment is already settled)
          if (orderData.iyzicoPaymentTransactions && Array.isArray(orderData.iyzicoPaymentTransactions)) {
            console.log(`💸 iyzico Refund başlatılıyor: ${order.orderNumber}`);
            for (const tx of orderData.iyzicoPaymentTransactions) {
              const refundPrice = normalizeRefundPrice(tx.paidPrice ?? tx.price, orderTotal);
              if (!refundPrice) continue;

              /**
               * KISMİ İADEDE İŞLEM SEÇİMİ. iyzico her sepet kalemi için ayrı
               * `paymentTransactionId` tutuyor ve `itemId` bizim ürün
               * kimliğimiz (`basketItems[].id = productId`). İade edilmeyen
               * kalemin işlemi atlanıyor; kargo kalemi de (`itemId: "SHIPPING"`)
               * hiçbir kalemle eşleşmediği için doğal olarak atlanmış oluyor —
               * kısmi iadede kargo geri ödenmiyor (kullanıcı kararı).
               */
              let priceToRefund = refundPrice;
              if (isPartial) {
                const match = refundItems.find(
                  (item) => item.productId && item.productId === tx.itemId
                );
                if (!match) continue;
                priceToRefund = transactionRefundShare(
                  refundPrice,
                  match.quantity,
                  match.orderedQuantity
                );
                if (priceToRefund <= 0) continue;
              }

              iyzicoResult = await createRefund({
                conversationId: orderData.iyzicoConversationId || order.orderNumber,
                paymentTransactionId: tx.paymentTransactionId,
                price: priceToRefund.toFixed(2),
                ip: clientIp,
              });
              
              if (iyzicoResult.status === "success") {
                console.log(`✅ iyzico Refund başarılı: ${tx.paymentTransactionId}`);
              } else {
                console.error(`❌ iyzico Refund başarısız: ${iyzicoResult.errorMessage}`);
              }
            }
          }
        } catch (iyzicoError) {
          console.error(`❌ iyzico işlem hatası:`, iyzicoError);
        }
      }

      // 3. Update order status - fetch fresh order to get statusHistory
      const freshOrder = await prisma.order.findUnique({
        where: { id: order.id },
        select: { statusHistory: true },
      });

      /**
       * Sipariş tamamen mi iade edildi?
       *
       * Tam talepte her zaman evet. Kısmi talepte ancak bu iadeyle birlikte
       * iade edilen toplam, siparişin iade edilebilir tutarına (kargo hariç)
       * ulaştıysa. Aksi hâlde sipariş `DELIVERED` KALIR — durum enum'una
       * `PARTIALLY_REFUNDED` eklememek bilinçli karardı, "ne kadarı iade
       * edildi" bilgisi `refundedAmount` kolonunda duruyor.
       */
      const fullyRefunded = !isPartial || isFullyRefunded(orderMoney, breakdown.total);

      const historyNote = isPartial
        ? `Kısmi iade tamamlandı: ${refundItems.length} kalem, ₺${breakdown.total.toFixed(2)}` +
          (adminNote ? ` — ${adminNote}` : "")
        : `İade incelemesi tamamlandı, ödeme iade edildi${adminNote ? `: ${adminNote}` : ""}`;

      const existingHistory = Array.isArray(freshOrder?.statusHistory) ? freshOrder.statusHistory : [];
      const updatedHistory = [
        ...existingHistory,
        {
          // Kısmi iadede sipariş durumu değişmiyor; hareket kaydı da gerçeği
          // yazmalı, yoksa çizelgede olmayan bir durum geçişi görünürdü.
          status: fullyRefunded ? "REFUNDED" : order.status,
          date: now.toISOString(),
          previousStatus: order.status,
          note: historyNote,
        },
      ];

      await prisma.order.update({
        where: { id: order.id },
        data: {
          ...(fullyRefunded
            ? {
                status: "REFUNDED" as const,
                paymentStatus: isCardPayment ? ("REFUNDED" as const) : order.paymentStatus,
                refundedAt: now,
              }
            : {}),
          // Tam iadede de yazılıyor: "bu siparişin ne kadarı geri döndü"
          // sorusunun cevabı tek bir yerde olsun.
          refundedAmount: { increment: breakdown.total },
          statusHistory: updatedHistory,
        },
      });

      await prisma.returnRequest.update({
        where: { id },
        data: {
          status: "COMPLETED",
          refundedAt: now,
          adminNote: adminNote ?? returnRequest.adminNote,
        },
      });

      console.log(
        `💰 Return refunded for order ${order.orderNumber}: ₺${breakdown.total.toFixed(2)}` +
          (isPartial ? ` (kısmi${fullyRefunded ? ", sipariş tükendi" : ""})` : "")
      );

      /**
       * Müşteri parasının çıktığını bilmeli — ama iki farklı metinle.
       *
       * Sipariş tamamen iade edildiyse mevcut sipariş durumu e-postası doğru
       * metni ("siparişiniz iade edildi") zaten taşıyor. Kısmi iadede o metin
       * YANLIŞ olurdu: siparişin kalanı yolda ya da müşterinin elinde. Bu
       * yüzden kısmi iadenin kendi şablonu var (F2-73) ve hangi ürünlerin
       * iade edildiğini, tutarın nasıl hesaplandığını yazıyor.
       */
      if (order.user?.email) {
        try {
          if (fullyRefunded) {
            await sendOrderStatusEmail({
              to: order.user.email,
              orderNumber: order.orderNumber,
              status: "REFUNDED",
              customerName: order.user.name ?? undefined,
            });
            console.log(`📧 Refund email sent to ${order.user.email}`);
          } else if (returnRequest.items.length > 0) {
            const emailApiUrl =
              process.env.NEXT_PUBLIC_FRONTEND_URL || "https://fusionmarkt.com";
            const response = await fetch(`${emailApiUrl}/api/email/partial-refund`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                to: order.user.email,
                orderNumber: order.orderNumber,
                name: order.user.name,
                refundedTotal: `₺${breakdown.total.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                })}`,
                items: returnRequest.items.map((entry) => ({
                  name: orderItemNames.get(entry.orderItem.id) ?? "Ürün",
                  quantity: entry.quantity,
                })),
                isCardPayment,
                adminNote,
              }),
            });
            if (response.ok) {
              console.log(`📧 Partial refund email sent to ${order.user.email}`);
            } else {
              console.error(`❌ Kısmi iade e-postası reddedildi: ${response.status}`);
            }
          } else {
            /**
             * Sipariş tükenmedi ama kalem listesi de yok — tüm kalemleri kapsayan
             * bir talep, siparişte daha önce iade yapıldığı için tavanı
             * doldurmamış demektir. Hangi ürünlerin iade edildiğini
             * yazamadığımız için e-posta göndermiyoruz; yanlış metin atmaktansa
             * susmak yeğdir. Durum Hesabım'daki talep kartından görülüyor.
             */
            console.warn(
              `⚠️ Kısmi iade e-postası atlandı (kalem listesi yok): ${order.orderNumber}`
            );
          }
        } catch (emailError) {
          console.error(`❌ Email send error:`, emailError);
        }
      }

      revalidateTag("orders");
      revalidateTag("return-requests");

      return NextResponse.json({
        success: true,
        message: isPartial
          ? `Kısmi iade tamamlandı: ₺${breakdown.total.toFixed(2)} iade edildi` +
            (fullyRefunded ? ". Siparişin tamamı iade edildiği için durumu güncellendi." : ".")
          : "İade onaylandı ve ödeme iade edildi",
        refundedAmount: breakdown.total,
        fullyRefunded,
        iyzicoResult: iyzicoResult ? {
          status: iyzicoResult.status,
          errorMessage: iyzicoResult.errorMessage,
        } : null,
      });
    } else if (action === "send-back") {
      // İnceleme olumsuz çıktı ve ürün müşteriye geri gönderiliyor. Talebin
      // durumu değişmiyor (REJECTED kalıyor), yalnızca kargo bilgisi işleniyor:
      // müşterinin "ürünüm ne oldu?" sorusunun cevabı ve koli teslim alınmayıp
      // bize dönerse depoda eşleştirmenin tek yolu bu takip numarası.
      if (!returnRequest.receivedAt) {
        return NextResponse.json(
          {
            error:
              "Bu talepte ürün depomuza hiç ulaşmamış — geri gönderilecek bir şey yok.",
          },
          { status: 400 }
        );
      }

      await prisma.returnRequest.update({
        where: { id },
        data: {
          sendBackCarrier: sendBackCarrier?.trim() || null,
          sendBackTrackingNumber: sendBackTrackingNumber.trim(),
          sendBackAt: now,
          adminNote: adminNote?.trim() || returnRequest.adminNote,
        },
      });

      console.log(
        `📤 Rejected return sent back to customer for order ${order.orderNumber} (takip: ${sendBackTrackingNumber.trim()})`
      );

      revalidateTag("return-requests");

      return NextResponse.json({
        success: true,
        message: "Geri gönderim bilgisi kaydedildi. Müşteri bunu Hesabım'da görecek.",
      });
    } else {
      // RET — iki noktada mümkün: gönderim öncesi (talep haksız) ve inceleme
      // sonrası (ürün hasarlı/eksik geldi). İkincisinde müşterinin ürünü bizde
      // kaldığı için gerekçe zorunlu: "reddedildi" deyip susmak olmaz.
      const rejectedAfterInspection = returnRequest.status === "RECEIVED";

      if (rejectedAfterInspection && !adminNote?.trim()) {
        return NextResponse.json(
          {
            error:
              "İnceleme sonrası ret için gerekçe zorunludur — müşterinin ürünü depoda ve neden iade edilmediğini bilmesi gerekiyor.",
          },
          { status: 400 }
        );
      }

      // Stok BİLİNÇLİ olarak geri yüklenmiyor: inceleme olumsuzsa ürün satılabilir
      // durumda değil. Depoya fiziken gelmiş olması onu stok yapmaz.
      await prisma.returnRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          adminNote,
          reviewedBy: auth.userId,
          reviewedAt: now,
        },
      });

      console.log(
        `❌ Return request rejected for order ${order.orderNumber}` +
          (rejectedAfterInspection ? " (inceleme sonrası)" : "")
      );

      // Send rejection email
      if (order.user?.email) {
        try {
          const emailApiUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://fusionmarkt.com";
          await fetch(`${emailApiUrl}/api/email/return-rejected`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: order.user.email,
              orderNumber: order.orderNumber,
              name: order.user.name,
              reason: adminNote,
            }),
          });
          console.log(`📧 Return rejected email sent to ${order.user.email}`);
        } catch (emailError) {
          console.error(`❌ Email send error:`, emailError);
        }
      }

      revalidateTag("return-requests");

      return NextResponse.json({
        success: true,
        message: "İade talebi reddedildi",
      });
    }
  } catch (error) {
    console.error("❌ [RETURN REQUEST] PATCH error:", error);
    return NextResponse.json(
      { error: "İade talebi işlenemedi" },
      { status: 500 }
    );
  }
}
