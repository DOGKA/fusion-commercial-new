/**
 * Email Service - Resend Integration with Tracking
 * 
 * Uses Resend API (https://resend.com)
 * Domain: fusionmarkt.com (verified, eu-west-1)
 * 
 * E-posta gönderimlerini otomatik olarak EmailLog tablosuna kaydeder.
 * Resend webhook'ları ile durum güncellemeleri yapılır.
 */

import { prisma } from "@/libs/prismaDb";

// EmailLog model
const emailLog = prisma.emailLog;

// Email Type enum (schema ile aynı)
export type EmailType = 
  | "ORDER_CONFIRMATION"
  | "ORDER_STATUS"
  | "ORDER_SHIPPED"
  | "ORDER_DELIVERED"
  | "ORDER_CANCELLED"
  | "ORDER_REFUNDED"
  | "INVOICE"
  | "PAYMENT_CONFIRMED"
  | "WELCOME"
  | "PASSWORD_RESET"
  | "ABANDONED_CART"
  | "MARKETING"
  | "OTHER";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  // Tracking için opsiyonel alanlar
  type?: EmailType;
  orderId?: string;
  userId?: string;
};

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "FusionMarkt <noreply@fusionmarkt.com>";

// Email feature toggle
const EMAIL_ENABLED = !!RESEND_API_KEY;

export const sendEmail = async (data: EmailPayload) => {
  // Check if email is enabled
  if (!EMAIL_ENABLED) {
    if (process.env.NODE_ENV === "development") {
      console.log("📧 [DEV] Email would be sent to:", data.to, "Subject:", data.subject);
    }
    return { success: true, messageId: "email-disabled" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [data.to],
        subject: data.subject,
        html: data.html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Resend API error:", error);
      
      // Başarısız gönderim logu
      try {
        await emailLog.create({
          data: {
            resendId: `failed-${Date.now()}`,
            to: data.to,
            subject: data.subject,
            type: data.type || "OTHER",
            status: "FAILED",
            orderId: data.orderId,
            userId: data.userId,
            errorMessage: error.message || "Email send failed",
          }
        });
      } catch (logError) {
        console.error("❌ Failed to log email error:", logError);
      }
      
      throw new Error(error.message || "Email send failed");
    }

    const result = await response.json();
    console.log("📧 Email sent via Resend:", result.id);
    
    // Başarılı gönderim logu oluştur
    try {
      await emailLog.create({
        data: {
          resendId: result.id,
          to: data.to,
          subject: data.subject,
          type: data.type || "OTHER",
          status: "SENT",
          orderId: data.orderId,
          userId: data.userId,
        }
      });
      console.log("📝 Email logged:", result.id);
    } catch (logError) {
      // Log hatası e-posta gönderimini engellemez
      console.error("❌ Failed to log email:", logError);
    }
    
    return { success: true, messageId: result.id };
  } catch (error) {
    console.error("❌ Email error:", error);
    throw error;
  }
};

export const formatEmail = (email: string) => {
  return email.replace(/\s+/g, "").toLowerCase().trim();
};
