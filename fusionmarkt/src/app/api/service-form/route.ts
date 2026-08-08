/**
 * Service Form API
 * POST /api/service-form - Submit service form (multipart/form-data)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToS3, generateServiceFormKey, isS3Configured } from "@/lib/s3";
import { sendServiceFormNotification } from "@/lib/email";
import {
  buildDiagnosticSummary,
  findModel,
  getCategoryLabel,
  pruneHiddenAnswers,
  validateDiagnostics,
  type DiagnosticAnswers,
  type ProductCategoryId,
  type StoredDiagnostics,
} from "@/lib/service-form/diagnostics";

// Rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 3;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (record.count >= RATE_LIMIT) return false;
  record.count++;
  return true;
}

// reCAPTCHA verification (optional - skips if no secret key configured)
async function verifyRecaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return true;
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${secret}&response=${token}`,
    });
    const data = await res.json();
    return data.success && (data.score === undefined || data.score >= 0.5);
  } catch {
    console.error("reCAPTCHA verification failed");
    return false;
  }
}

// Allowed file types
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "video/mp4", "video/quicktime", "video/webm",
];
const ALLOWED_PDF_TYPES = ["application/pdf"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const VALID_CATEGORIES: ProductCategoryId[] = ["power-station", "solar-panel"];

/** Gövdenin dört yönü + port/konnektör yakın çekimi. */
const REQUIRED_MEDIA_COUNT = 5;

/** "Hiç tepki vermiyor / hiç üretmiyor" beyanlarında kısa video isteniyor. */
function requiresPowerOnVideo(answers: DiagnosticAnswers): boolean {
  return (
    answers.powerOn === "Güç tuşuna basınca hiçbir tepki vermiyor" ||
    answers.problemType === "Hiç güç üretmiyor"
  );
}

function parseDiagnosticsPayload(
  rawAnswers: string | null,
  rawSummary: string | null,
  modelIdOrLabel: string
): { ok: true; data: StoredDiagnostics } | { ok: false; error: string } {
  const model = findModel(modelIdOrLabel);
  if (!model) {
    return { ok: false, error: "Geçersiz ürün modeli" };
  }

  let answers: DiagnosticAnswers = {};
  if (rawAnswers) {
    try {
      const parsed = JSON.parse(rawAnswers);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return { ok: false, error: "Teşhis cevapları geçersiz" };
      }
      answers = parsed as DiagnosticAnswers;
    } catch {
      return { ok: false, error: "Teşhis cevapları okunamadı" };
    }
  }

  const pruned = pruneHiddenAnswers(model, answers);
  const errors = validateDiagnostics(model, pruned);
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: "Teşhis anketindeki zorunlu sorular eksik" };
  }

  // Client summary varsa kullan (soru metinleri zamanla değişebilir diye client'tan gelen
  // özeti tercih ediyoruz), yoksa sunucuda yeniden üret.
  let summary = buildDiagnosticSummary(model, pruned);
  if (rawSummary) {
    try {
      const parsed = JSON.parse(rawSummary);
      if (
        Array.isArray(parsed) &&
        parsed.every(
          (item) =>
            item &&
            typeof item === "object" &&
            typeof item.group === "string" &&
            typeof item.label === "string" &&
            typeof item.value === "string"
        )
      ) {
        summary = parsed;
      }
    } catch {
      // Client özeti bozuksa sunucu özetiyle devam et.
    }
  }

  return { ok: true, data: { answers: pruned, summary } };
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Çok fazla talep gönderdiniz. Lütfen daha sonra tekrar deneyin." },
        { status: 429 }
      );
    }

    const formData = await request.formData();

    // Extract text fields
    const name = formData.get("name") as string;
    const title = formData.get("title") as string | null;
    const invoiceNo = formData.get("invoiceNo") as string;
    const platform = formData.get("platform") as string;
    const phone = formData.get("phone") as string;
    const purchaseDateStr = formData.get("purchaseDate") as string;
    const invoiceType = formData.get("invoiceType") as string;
    const orderNumber = formData.get("orderNumber") as string | null;
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;
    const returnAddress = formData.get("returnAddress") as string;
    const packagingConfirm = formData.get("packagingConfirm") === "true";
    const faultFeeConfirm = formData.get("faultFeeConfirm") === "true";
    const recaptchaToken = formData.get("recaptchaToken") as string | null;

    const productCategory = (formData.get("productCategory") as string | null)?.trim() || "";
    const productModelId = (formData.get("productModelId") as string | null)?.trim() || "";
    const productModelLabel = (formData.get("productModel") as string | null)?.trim() || "";
    const serialNumber = (formData.get("serialNumber") as string | null)?.trim() || null;
    const diagnosticsRaw = formData.get("diagnostics") as string | null;
    const diagnosticsSummaryRaw = formData.get("diagnosticsSummary") as string | null;

    // Validation
    if (!name?.trim()) {
      return NextResponse.json({ error: "İsim Soyisim gereklidir" }, { status: 400 });
    }
    if (!invoiceNo?.trim()) {
      return NextResponse.json({ error: "Fatura No gereklidir" }, { status: 400 });
    }
    if (!platform?.trim()) {
      return NextResponse.json({ error: "Satın alınan platform gereklidir" }, { status: 400 });
    }
    if (!phone?.trim()) {
      return NextResponse.json({ error: "Telefon numarası gereklidir" }, { status: 400 });
    }
    if (!purchaseDateStr) {
      return NextResponse.json({ error: "Satın alım tarihi gereklidir" }, { status: 400 });
    }
    if (!invoiceType?.trim()) {
      return NextResponse.json({ error: "Fatura tipi gereklidir" }, { status: 400 });
    }
    if (!email?.trim()) {
      return NextResponse.json({ error: "E-posta adresi gereklidir" }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Geçersiz e-posta adresi" }, { status: 400 });
    }
    if (!message?.trim()) {
      return NextResponse.json({ error: "Mesaj gereklidir" }, { status: 400 });
    }
    if (!returnAddress?.trim()) {
      return NextResponse.json({ error: "Geri gönderim adresi gereklidir" }, { status: 400 });
    }
    if (!packagingConfirm) {
      return NextResponse.json({ error: "Paketleme onayı gereklidir" }, { status: 400 });
    }
    if (!faultFeeConfirm) {
      return NextResponse.json({ error: "Arıza tespit onayı gereklidir" }, { status: 400 });
    }

    if (!VALID_CATEGORIES.includes(productCategory as ProductCategoryId)) {
      return NextResponse.json({ error: "Ürün kategorisi gereklidir" }, { status: 400 });
    }
    const modelKey = productModelId || productModelLabel;
    if (!modelKey) {
      return NextResponse.json({ error: "Ürün modeli gereklidir" }, { status: 400 });
    }
    const model = findModel(modelKey);
    if (!model || model.category !== productCategory) {
      return NextResponse.json({ error: "Geçersiz ürün modeli" }, { status: 400 });
    }

    const diagnosticsResult = parseDiagnosticsPayload(
      diagnosticsRaw,
      diagnosticsSummaryRaw,
      model.id
    );
    if (!diagnosticsResult.ok) {
      return NextResponse.json({ error: diagnosticsResult.error }, { status: 400 });
    }

    // reCAPTCHA verification
    if (recaptchaToken) {
      const isValid = await verifyRecaptcha(recaptchaToken);
      if (!isValid) {
        return NextResponse.json(
          { error: "Güvenlik doğrulaması başarısız. Lütfen tekrar deneyin." },
          { status: 400 }
        );
      }
    }

    // Parse purchase date
    const purchaseDate = new Date(purchaseDateStr);
    if (isNaN(purchaseDate.getTime())) {
      return NextResponse.json({ error: "Geçersiz tarih formatı" }, { status: 400 });
    }

    // File uploads
    let invoicePdfUrl = "";
    const mediaUrls: string[] = [];

    if (isS3Configured()) {
      // Invoice PDF
      const invoicePdf = formData.get("invoicePdf") as File | null;
      if (!invoicePdf || invoicePdf.size === 0) {
        return NextResponse.json({ error: "Fatura PDF dosyası gereklidir" }, { status: 400 });
      }
      if (!ALLOWED_PDF_TYPES.includes(invoicePdf.type)) {
        return NextResponse.json({ error: "Fatura dosyası PDF formatında olmalıdır" }, { status: 400 });
      }
      if (invoicePdf.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "Fatura dosyası 10MB'dan küçük olmalıdır" }, { status: 400 });
      }

      const pdfBytes = await invoicePdf.arrayBuffer();
      const pdfKey = generateServiceFormKey(invoicePdf.name);
      invoicePdfUrl = await uploadToS3(pdfKey, Buffer.from(pdfBytes), invoicePdf.type);

      // Media files (images/videos)
      const mediaFiles = formData.getAll("media") as File[];
      let hasVideo = false;
      for (const file of mediaFiles) {
        if (!file || file.size === 0) continue;
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          return NextResponse.json(
            { error: `Desteklenmeyen dosya formatı: ${file.name}. JPEG, PNG, WebP, GIF, MP4, MOV, WebM desteklenir.` },
            { status: 400 }
          );
        }
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: `${file.name} dosyası 10MB'dan küçük olmalıdır` },
            { status: 400 }
          );
        }

        if (file.type.startsWith("video/")) hasVideo = true;

        const bytes = await file.arrayBuffer();
        const key = generateServiceFormKey(file.name);
        const url = await uploadToS3(key, Buffer.from(bytes), file.type);
        mediaUrls.push(url);
      }

      if (mediaUrls.length < REQUIRED_MEDIA_COUNT) {
        return NextResponse.json(
          {
            error: `Gövdenin dört yönü ve port bölgesi için en az ${REQUIRED_MEDIA_COUNT} dosya eklemelisiniz`,
          },
          { status: 400 }
        );
      }
      if (requiresPowerOnVideo(diagnosticsResult.data.answers) && !hasVideo) {
        return NextResponse.json(
          {
            error:
              "Cihazın tepki vermediğini belirttiğiniz için güç tuşuna bastığınızı gösteren kısa bir video eklemelisiniz",
          },
          { status: 400 }
        );
      }
    } else {
      // S3 not configured - store placeholder
      invoicePdfUrl = "s3-not-configured";
    }

    const userAgent = request.headers.get("user-agent") || undefined;
    const categoryLabel = getCategoryLabel(productCategory);

    // Save to database
    const prismaAny = prisma as unknown as Record<string, { create: (args: Record<string, unknown>) => Promise<{ id: string }> }>;
    if (!prismaAny.serviceFormMessage) {
      console.error("serviceFormMessage model not found in Prisma client. Run: npx prisma generate");
      return NextResponse.json(
        { error: "Veritabanı modeli bulunamadı. Lütfen yöneticiyle iletişime geçin." },
        { status: 500 }
      );
    }
    const serviceForm = await prismaAny.serviceFormMessage.create({
      data: {
        name: name.trim(),
        title: title?.trim() || null,
        invoiceNo: invoiceNo.trim(),
        platform: platform.trim(),
        phone: phone.trim(),
        purchaseDate,
        invoiceType: invoiceType.trim(),
        orderNumber: orderNumber?.trim() || null,
        email: email.trim().toLowerCase(),
        invoicePdfUrl,
        message: message.trim(),
        mediaUrls,
        returnAddress: returnAddress.trim(),
        productCategory,
        productModel: model.label,
        serialNumber,
        diagnostics: diagnosticsResult.data,
        packagingConfirm,
        faultFeeConfirm,
        ipAddress: ip,
        userAgent,
      },
    });

    console.log(
      `🔧 New service form from ${email} — ${model.label} (ID: ${serviceForm.id})`
    );

    // Send admin notification email
    try {
      await sendServiceFormNotification({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        platform: platform.trim(),
        invoiceNo: invoiceNo.trim(),
        invoiceType: invoiceType.trim(),
        message: message.trim(),
        productCategory: categoryLabel,
        productModel: model.label,
        serialNumber,
        diagnosticsSummary: diagnosticsResult.data.summary,
      });
    } catch (emailError) {
      console.error("Failed to send service form notification:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Servis talebiniz başarıyla gönderildi",
      id: serviceForm.id,
    });
  } catch (error) {
    console.error("Service form error:", error);
    return NextResponse.json(
      { error: "Servis talebi gönderilemedi. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
