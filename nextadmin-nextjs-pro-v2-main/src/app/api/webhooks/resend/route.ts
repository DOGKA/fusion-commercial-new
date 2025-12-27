/**
 * Resend Webhook Handler
 * 
 * Bu endpoint Resend'den gelen webhook event'lerini işler.
 * Event türleri:
 * - email.sent: E-posta gönderildi
 * - email.delivered: E-posta teslim edildi
 * - email.opened: E-posta açıldı
 * - email.clicked: Link tıklandı
 * - email.bounced: E-posta geri döndü
 * - email.complained: Spam şikayeti
 * - email.delivery_delayed: Teslimatta gecikme
 * 
 * Webhook oluşturma: Resend Dashboard -> Webhooks -> Add Webhook
 * URL: https://admin.fusionmarkt.com/api/webhooks/resend
 * Events: email.sent, email.delivered, email.opened, email.clicked, email.bounced, email.complained
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prismaDb";
import crypto from "crypto";

// EmailLog model types (prisma generate sonrası kaldırılacak)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const emailLog = (prisma as any).emailLog;

// Resend webhook secret (opsiyonel ama önerilir)
const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET;

// Webhook imzasını doğrula
function verifyWebhookSignature(payload: string, signature: string | null): boolean {
  if (!WEBHOOK_SECRET || !signature) {
    // Secret yoksa doğrulama atla (development)
    return true;
  }
  
  const expectedSignature = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Event tipi eşleştirme
type ResendEventType = 
  | "email.sent"
  | "email.delivered"
  | "email.opened"
  | "email.clicked"
  | "email.bounced"
  | "email.complained"
  | "email.delivery_delayed";

interface ResendWebhookEvent {
  type: ResendEventType;
  created_at: string;
  data: {
    email_id: string;
    to: string[];
    from: string;
    subject: string;
    created_at: string;
    // Bounce/complaint için
    bounce?: {
      message: string;
    };
    // Click için
    click?: {
      link: string;
      timestamp: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("svix-signature");
    
    // İmza doğrulama
    if (!verifyWebhookSignature(payload, signature)) {
      console.error("❌ Resend webhook: Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    
    const event: ResendWebhookEvent = JSON.parse(payload);
    const { type, data } = event;
    const emailId = data.email_id;
    
    console.log(`📧 Resend webhook: ${type} for ${emailId}`);
    
    // Mevcut log kaydını bul
    const existingLog = await emailLog.findUnique({
      where: { resendId: emailId }
    });
    
    // Eğer log yoksa ve bu "sent" event'i değilse, sadece logla
    if (!existingLog && type !== "email.sent") {
      console.log(`⚠️ EmailLog not found for ${emailId}, skipping ${type} event`);
      return NextResponse.json({ success: true, message: "Log not found, skipped" });
    }
    
    // Event türüne göre işlem yap
    switch (type) {
      case "email.sent":
        // İlk gönderim - log yoksa oluştur (normalde sendEmail'de oluşturulur)
        if (!existingLog) {
          await emailLog.create({
            data: {
              resendId: emailId,
              to: data.to[0] || "",
              subject: data.subject || "",
              status: "SENT",
              sentAt: new Date(data.created_at),
            }
          });
        }
        break;
        
      case "email.delivered":
        if (existingLog) {
          await emailLog.update({
            where: { resendId: emailId },
            data: {
              status: "DELIVERED",
              deliveredAt: new Date(),
            }
          });
        }
        break;
        
      case "email.opened":
        if (existingLog) {
          await emailLog.update({
            where: { resendId: emailId },
            data: {
              status: "OPENED",
              openedAt: existingLog.openedAt || new Date(), // İlk açılma zamanını koru
            }
          });
        }
        break;
        
      case "email.clicked":
        if (existingLog) {
          await emailLog.update({
            where: { resendId: emailId },
            data: {
              status: "CLICKED",
              clickedAt: existingLog.clickedAt || new Date(),
              metadata: {
                ...(existingLog.metadata as object || {}),
                lastClickedLink: data.click?.link,
              }
            }
          });
        }
        break;
        
      case "email.bounced":
        if (existingLog) {
          await emailLog.update({
            where: { resendId: emailId },
            data: {
              status: "BOUNCED",
              bouncedAt: new Date(),
              errorMessage: data.bounce?.message || "Email bounced",
            }
          });
        }
        break;
        
      case "email.complained":
        if (existingLog) {
          await emailLog.update({
            where: { resendId: emailId },
            data: {
              status: "COMPLAINED",
              complainedAt: new Date(),
            }
          });
        }
        break;
        
      case "email.delivery_delayed":
        // Sadece logla, status değiştirme
        console.log(`⏳ Email delivery delayed: ${emailId}`);
        break;
        
      default:
        console.log(`❓ Unknown webhook event type: ${type}`);
    }
    
    return NextResponse.json({ success: true, event: type });
    
  } catch (error) {
    console.error("❌ Resend webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// GET - Health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Resend webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}

