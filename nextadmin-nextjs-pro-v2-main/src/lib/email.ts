/**
 * Email Service for Admin Panel
 * Sends order status notifications to customers
 * 
 * Uses Resend API (https://resend.com)
 * Domain: fusionmarkt.com (verified, eu-west-1)
 * 
 * ÖNEMLİ: Bu dosya fusionmarkt/src/emails/ klasöründeki React Email şablonlarını kullanır.
 * Tüm e-posta tasarımları orada tanımlanmıştır.
 * 
 * E-posta gönderimlerini otomatik olarak EmailLog tablosuna kaydeder.
 */

import { render } from "@react-email/components";
import { prisma } from "@/libs/prismaDb";

// React Email Templates from fusionmarkt
import { OrderStatusEmail } from "@emails/templates/OrderStatusEmail";
import { InvoiceReadyEmail } from "@emails/templates/InvoiceReadyEmail";
import { PaymentConfirmedEmail } from "@emails/templates/PaymentConfirmedEmail";

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

// ═══════════════════════════════════════════════════════════════════════════
// RESEND CONFIG
// ═══════════════════════════════════════════════════════════════════════════

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "FusionMarkt <noreply@fusionmarkt.com>";

// Email feature toggle
const EMAIL_ENABLED = !!RESEND_API_KEY;

if (!EMAIL_ENABLED && process.env.NODE_ENV === "production") {
  console.warn("⚠️  Email disabled! Set RESEND_API_KEY to enable email sending.");
}

// ═══════════════════════════════════════════════════════════════════════════
// STATUS LABELS
// ═══════════════════════════════════════════════════════════════════════════

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Beklemede",
  CONFIRMED: "Sipariş Onaylandı",
  PROCESSING: "Hazırlanıyor",
  SHIPPED: "Kargoya Verildi",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal Edildi",
  REFUNDED: "İade Edildi",
};

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL SEND FUNCTION (Resend API with Tracking)
// ═══════════════════════════════════════════════════════════════════════════

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  type?: EmailType;
  orderId?: string;
  userId?: string;
}

async function sendEmail({ to, subject, html, type, orderId, userId }: SendEmailParams) {
  if (!EMAIL_ENABLED) {
    if (process.env.NODE_ENV === "development") {
      console.log("📧 [DEV] Email would be sent to:", to, "Subject:", subject);
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
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Resend API error:", error);
      
      try {
        await emailLog.create({
          data: {
            resendId: `failed-${Date.now()}`,
            to,
            subject,
            type: type || "OTHER",
            status: "FAILED",
            orderId,
            userId,
            errorMessage: error.message || "Email send failed",
          }
        });
      } catch (logError) {
        console.error("❌ Failed to log email error:", logError);
      }
      
      return { success: false, error: error.message || "Email send failed" };
    }

    const data = await response.json();
    console.log("📧 Email sent via Resend:", data.id);
    
    try {
      await emailLog.create({
        data: {
          resendId: data.id,
          to,
          subject,
          type: type || "OTHER",
          status: "SENT",
          orderId,
          userId,
        }
      });
      console.log("📝 Email logged:", data.id);
    } catch (logError) {
      console.error("❌ Failed to log email:", logError);
    }
    
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error("❌ Email error:", error);
    return { success: false, error };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ORDER STATUS EMAIL - Uses React Email Template
// ═══════════════════════════════════════════════════════════════════════════

interface OrderStatusEmailParams {
  to: string;
  orderNumber: string;
  status: string;
  customerName?: string;
  trackingNumber?: string;
  carrierName?: string;
}

export async function sendOrderStatusEmail({
  to,
  orderNumber,
  status,
  customerName,
  trackingNumber,
  carrierName,
}: OrderStatusEmailParams) {
  const statusLabel = ORDER_STATUS_LABELS[status] || status;
  
  // Map status to template status type
  const statusMap: Record<string, "CONFIRMED" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED"> = {
    PENDING: "CONFIRMED",
    CONFIRMED: "CONFIRMED",
    PROCESSING: "PREPARING",
    SHIPPED: "SHIPPED",
    DELIVERED: "DELIVERED",
    CANCELLED: "CANCELLED",
    REFUNDED: "REFUNDED",
  };

  // Render React Email template to HTML
  const html = await render(
    OrderStatusEmail({
      orderNumber,
      status: statusMap[status] || "CONFIRMED",
      name: customerName,
      trackingNumber,
      carrier: carrierName,
    })
  );

  const emailTypeMap: Record<string, EmailType> = {
    CONFIRMED: "ORDER_CONFIRMATION",
    PROCESSING: "ORDER_STATUS",
    SHIPPED: "ORDER_SHIPPED",
    DELIVERED: "ORDER_DELIVERED",
    CANCELLED: "ORDER_CANCELLED",
    REFUNDED: "ORDER_REFUNDED",
  };

  return sendEmail({
    to,
    subject: `FusionMarkt - ${statusLabel} #${orderNumber}`,
    html,
    type: emailTypeMap[status] || "ORDER_STATUS",
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// INVOICE READY EMAIL - Uses React Email Template
// ═══════════════════════════════════════════════════════════════════════════

interface InvoiceReadyEmailParams {
  to: string;
  orderNumber: string;
  customerName?: string;
}

export async function sendInvoiceReadyEmail({
  to,
  orderNumber,
  customerName,
}: InvoiceReadyEmailParams) {
  // Render React Email template to HTML
  const html = await render(
    InvoiceReadyEmail({
      orderNumber,
      name: customerName,
    })
  );

  return sendEmail({
    to,
    subject: `FusionMarkt - Faturanız Hazır #${orderNumber}`,
    html,
    type: "INVOICE",
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// PAYMENT CONFIRMED EMAIL - Uses React Email Template
// ═══════════════════════════════════════════════════════════════════════════

interface PaymentConfirmedEmailParams {
  to: string;
  orderNumber: string;
  customerName?: string;
  total?: number;
}

export async function sendPaymentConfirmedEmail({
  to,
  orderNumber,
  customerName,
  total,
}: PaymentConfirmedEmailParams) {
  // Render React Email template to HTML
  const html = await render(
    PaymentConfirmedEmail({
      orderNumber,
      name: customerName,
      total: total || 0,
    })
  );

  return sendEmail({
    to,
    subject: `FusionMarkt - Ödemeniz Onaylandı #${orderNumber}`,
    html,
    type: "PAYMENT_CONFIRMED",
  });
}
