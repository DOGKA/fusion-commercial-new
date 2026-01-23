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

// Return reason labels for Turkish
const RETURN_REASON_LABELS: Record<string, string> = {
  DAMAGED: "Ürün Hasarlı Geldi",
  WRONG_PRODUCT: "Ürün Yanlış Gönderildi",
  SPECS_MISMATCH: "Teknik Özellikler Siparişimle Uyuşmamaktadır",
};

/**
 * GET - Get return requests for an order
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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
      reasonLabel: RETURN_REASON_LABELS[req.reason] || req.reason,
    }));

    return NextResponse.json({
      hasReturnRequest: returnRequests.length > 0,
      hasPendingReturnRequest: returnRequests.some(
        (r) => r.status === "PENDING_ADMIN_APPROVAL"
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

    const reason = formData.get("reason") as string;
    const description = formData.get("description") as string | null;

    // Validate reason
    const validReasons = [
      "DAMAGED",
      "WRONG_PRODUCT",
      "SPECS_MISMATCH",
    ];
    if (!reason || !validReasons.includes(reason)) {
      return NextResponse.json(
        { error: "Geçerli bir iade sebebi seçiniz" },
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
        returnRequests: {
          where: { status: "PENDING_ADMIN_APPROVAL" },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı" },
        { status: 404 }
      );
    }

    // Check if order already has a pending return request
    if (order.returnRequests.length > 0) {
      return NextResponse.json(
        { error: "Bu sipariş için bekleyen bir iade talebi mevcut" },
        { status: 400 }
      );
    }

    // Check if order status allows return
    const returnableStatuses = ["SHIPPED", "DELIVERED"];
    if (!returnableStatuses.includes(order.status)) {
      const statusMessages: Record<string, string> = {
        PENDING: "Beklemedeki siparişler için iade talebi oluşturulamaz. İptal talebinde bulunabilirsiniz.",
        PROCESSING: "Hazırlanan siparişler için iade talebi oluşturulamaz. İptal talebinde bulunabilirsiniz.",
        CANCELLED: "Bu sipariş iptal edilmiş.",
        REFUNDED: "Bu sipariş zaten iade edilmiş.",
      };
      return NextResponse.json(
        { error: statusMessages[order.status] || "Bu sipariş için iade talebi oluşturulamaz" },
        { status: 400 }
      );
    }

    // Process images
    const imageUrls: string[] = [];
    const imageFiles = formData.getAll("images") as File[];
    
    if (imageFiles.length > MAX_IMAGES) {
      return NextResponse.json(
        { error: `En fazla ${MAX_IMAGES} görsel yükleyebilirsiniz` },
        { status: 400 }
      );
    }

    // Upload images to S3 if any
    if (imageFiles.length > 0 && isS3Configured()) {
      for (const file of imageFiles) {
        // Skip empty files
        if (!file || file.size === 0) continue;

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

        // Generate S3 key and upload
        const key = generateReturnImageKey(orderNumber, file.name);
        const url = await uploadToS3(key, buffer, file.type);
        imageUrls.push(url);
      }
    }

    // Create return request
    const returnRequest = await prisma.returnRequest.create({
      data: {
        orderId: order.id,
        userId: user.id,
        reason: reason as ReturnReason,
        description: description?.trim() || null,
        images: imageUrls,
        requestIp: clientIp,
        status: "PENDING_ADMIN_APPROVAL",
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
      message: "İade talebiniz alındı. İnceleme sonrası bilgilendirileceksiniz.",
      returnRequest: {
        id: returnRequest.id,
        status: returnRequest.status,
        reason: returnRequest.reason,
        reasonLabel: RETURN_REASON_LABELS[returnRequest.reason],
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
