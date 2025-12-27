/**
 * Email Service - Resend Integration with React Email
 * 
 * Required Environment Variables:
 * - RESEND_API_KEY: Resend API key (https://resend.com)
 * - EMAIL_FROM: Verified sender email (e.g., noreply@fusionmarkt.com)
 * 
 * @see https://resend.com/docs
 */

import { render } from "@react-email/components";

// Import all email templates
import { ActivationEmail } from "@/emails/templates/ActivationEmail";
import { PasswordResetEmail } from "@/emails/templates/PasswordResetEmail";
import { OrderConfirmationEmail } from "@/emails/templates/OrderConfirmationEmail";
import { OrderPendingPaymentEmail } from "@/emails/templates/OrderPendingPaymentEmail";
import { OrderShippedEmail } from "@/emails/templates/OrderShippedEmail";
import { OrderStatusEmail } from "@/emails/templates/OrderStatusEmail";
import { InvoiceReadyEmail } from "@/emails/templates/InvoiceReadyEmail";
import { PaymentConfirmedEmail } from "@/emails/templates/PaymentConfirmedEmail";
import { CartReminderEmail } from "@/emails/templates/CartReminderEmail";
import { AdminNewOrderEmail } from "@/emails/templates/AdminNewOrderEmail";

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "FusionMarkt <noreply@fusionmarkt.com>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// Email feature toggle
const EMAIL_ENABLED = !!RESEND_API_KEY;

if (!EMAIL_ENABLED && process.env.NODE_ENV === "production") {
  console.warn("Email disabled! Set RESEND_API_KEY to enable email sending.");
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string | unknown;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// BASE EMAIL SEND FUNCTION (Resend API)
// ═══════════════════════════════════════════════════════════════════════════

async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<EmailResult> {
  if (!EMAIL_ENABLED) {
    if (process.env.NODE_ENV === "development") {
      console.log("[DEV] Email would be sent to:", to, "Subject:", subject);
    }
    return { success: true, messageId: "email-disabled" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
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
      console.error("Resend API error:", error);
      return { success: false, error: error.message || "Email send failed" };
    }

    const data = await response.json();

    if (process.env.NODE_ENV === "development") {
      console.log("Email sent via Resend:", data.id);
    }

    return { success: true, messageId: data.id };
  } catch (error) {
    console.error("Email error:", error);
    return { success: false, error };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TOKEN GENERATORS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate activation code (F-XXXXXX)
 */
export function generateActivationCode(): string {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `F-${code}`;
}

/**
 * Generate password reset token
 */
export function generateResetToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL SEND FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Send activation email
 */
export async function sendActivationEmail(to: string, code: string, name?: string) {
  const html = await render(ActivationEmail({ code, name }));
  return sendEmail({
    to,
    subject: `FusionMarkt - Hesap Aktivasyonu`,
    html,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(to: string, resetLink: string, name?: string) {
  const html = await render(PasswordResetEmail({ resetLink, name }));
  return sendEmail({
    to,
    subject: `FusionMarkt - Şifre Sıfırlama`,
    html,
  });
}


/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  to: string,
  params: {
    orderNumber: string;
    orderDate: Date | string;
    customerName?: string;
    customerEmail: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    subtotal: number;
    shipping: number;
    discount?: number;
    total: number;
    shippingAddress: {
      fullName: string;
      address: string;
      city: string;
      district: string;
      postalCode?: string;
      phone: string;
    };
    billingAddress: {
      fullName: string;
      address: string;
      city: string;
      district: string;
      postalCode?: string;
      phone: string;
    };
    paymentMethod: "CREDIT_CARD" | "BANK_TRANSFER";
  }
) {
  const html = await render(OrderConfirmationEmail(params));
  return sendEmail({
    to,
    subject: `FusionMarkt - Siparişiniz Alındı #${params.orderNumber}`,
    html,
  });
}

/**
 * Send order pending payment email (bank transfer)
 */
export async function sendOrderPendingPaymentEmail(
  to: string,
  orderNumber: string,
  name?: string,
  total?: number
) {
  const html = await render(
    OrderPendingPaymentEmail({ orderNumber, name, total: total || 0 })
  );
  return sendEmail({
    to,
    subject: `FusionMarkt - Ödeme Bekleniyor #${orderNumber}`,
    html,
  });
}

/**
 * Send order shipped email
 */
export async function sendOrderShippedEmail(
  to: string,
  orderNumber: string,
  trackingNumber: string,
  carrier: string,
  name?: string
) {
  const html = await render(
    OrderShippedEmail({ orderNumber, trackingNumber, carrier, name })
  );
  return sendEmail({
    to,
    subject: `FusionMarkt - Siparişiniz Kargoya Verildi #${orderNumber}`,
    html,
  });
}

/**
 * Send order status update email
 */
export async function sendOrderStatusEmail(
  to: string,
  orderNumber: string,
  status: "CONFIRMED" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED",
  name?: string,
  trackingNumber?: string,
  carrier?: string
) {
  const html = await render(
    OrderStatusEmail({ orderNumber, status, name, trackingNumber, carrier })
  );
  
  const statusLabels: Record<string, string> = {
    CONFIRMED: "Sipariş Onaylandı",
    PREPARING: "Hazırlanıyor",
    SHIPPED: "Kargoya Verildi",
    DELIVERED: "Teslim Edildi",
    CANCELLED: "İptal Edildi",
    REFUNDED: "İade Edildi",
  };
  
  return sendEmail({
    to,
    subject: `FusionMarkt - ${statusLabels[status]} #${orderNumber}`,
    html,
  });
}

/**
 * Send invoice ready email
 */
export async function sendInvoiceReadyEmail(to: string, orderNumber: string, name?: string) {
  const html = await render(InvoiceReadyEmail({ orderNumber, name }));
  return sendEmail({
    to,
    subject: `FusionMarkt - Faturanız Hazır #${orderNumber}`,
    html,
  });
}

/**
 * Send payment confirmed email
 */
export async function sendPaymentConfirmedEmail(
  to: string,
  orderNumber: string,
  name?: string,
  total?: number
) {
  const html = await render(
    PaymentConfirmedEmail({ orderNumber, name, total: total || 0 })
  );
  return sendEmail({
    to,
    subject: `FusionMarkt - Ödemeniz Onaylandı #${orderNumber}`,
    html,
  });
}

/**
 * Send cart reminder email
 */
export async function sendCartReminderEmail(
  to: string,
  name: string | undefined,
  items: Array<{ name: string; price: number; quantity: number }>,
  total: number,
  coupon?: {
    code: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    minOrderAmount?: number;
    expiryDate?: string;
  }
) {
  const html = await render(CartReminderEmail({ name, items, total, coupon }));
  
  const subject = coupon 
    ? `FusionMarkt - Sepetiniz için özel indirim: ${coupon.code}`
    : `FusionMarkt - Sepetinizde Ürünler Bekliyor`;
    
  return sendEmail({
    to,
    subject,
    html,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Send new order notification to admin
 */
export async function sendAdminNewOrderNotification(params: {
  orderNumber: string;
  orderDate: Date | string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: number;
  itemCount: number;
  paymentMethod: "CREDIT_CARD" | "BANK_TRANSFER";
  shippingCity: string;
  items: Array<{ name: string; quantity: number; price: number }>;
}) {
  if (!ADMIN_EMAIL) {
    console.error("ADMIN_EMAIL not configured. Skipping admin notification.");
    return { success: false, error: "Admin email not configured" };
  }

  const html = await render(AdminNewOrderEmail(params));
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `Yeni Sipariş #${params.orderNumber} - ${new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(params.total)}`,
    html,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// ORDER STATUS LABELS (for backward compatibility)
// ═══════════════════════════════════════════════════════════════════════════

export const orderStatusLabels: Record<string, string> = {
  PENDING: "Beklemede",
  CONFIRMED: "Sipariş Onaylandı",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Kargoya Verildi",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal Edildi",
  REFUNDED: "İade Edildi",
};

export function getStatusLabel(status: string): string {
  return orderStatusLabels[status] || status;
}
