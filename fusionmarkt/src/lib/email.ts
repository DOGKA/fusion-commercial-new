/**
 * Email Service - Resend Integration
 * 
 * Required Environment Variables:
 * - RESEND_API_KEY: Resend API key (https://resend.com)
 * - EMAIL_FROM: Verified sender email (e.g., noreply@fusionmarkt.com)
 * 
 * Template'ler için: @/lib/email-templates
 * 
 * @see https://resend.com/docs
 */

// Re-export templates for convenience
export { emailTemplates, orderStatusLabels, getStatusLabel } from "./email-templates";

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "FusionMarkt <noreply@fusionmarkt.com>";

// Email feature toggle - set to false until Resend is configured
const EMAIL_ENABLED = !!RESEND_API_KEY;

if (!EMAIL_ENABLED && process.env.NODE_ENV === "production") {
  console.warn("⚠️  Email disabled! Set RESEND_API_KEY to enable email sending.");
}

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL SEND FUNCTION (Resend API)
// ═══════════════════════════════════════════════════════════════════════════

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string | unknown;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<EmailResult> {
  // Check if email is enabled
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
      return { success: false, error: error.message || "Email send failed" };
    }

    const data = await response.json();
    
    if (process.env.NODE_ENV === "development") {
      console.log("📧 Email sent via Resend:", data.id);
    }
    
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error("❌ Email error:", error);
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
// CONVENIENCE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

import { emailTemplates as templates } from "./email-templates";

/**
 * Send activation email
 */
export async function sendActivationEmail(to: string, code: string, name?: string) {
  const { subject, html } = templates.activation(code, name);
  return sendEmail({ to, subject, html });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(to: string, resetLink: string, name?: string) {
  const { subject, html } = templates.passwordReset(resetLink, name);
  return sendEmail({ to, subject, html });
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  to: string, 
  orderNumber: string, 
  name?: string, 
  total?: number
) {
  const { subject, html } = templates.orderConfirmation(orderNumber, name, total);
  return sendEmail({ to, subject, html });
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
  const { subject, html } = templates.orderPendingPayment(orderNumber, name, total);
  return sendEmail({ to, subject, html });
}

/**
 * Send order status update email
 */
export async function sendOrderStatusEmail(
  to: string,
  orderNumber: string,
  status: string,
  statusLabel: string,
  name?: string,
  trackingNumber?: string
) {
  const { subject, html } = templates.orderStatusUpdate(
    orderNumber, 
    status, 
    statusLabel, 
    name, 
    trackingNumber
  );
  return sendEmail({ to, subject, html });
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
  const { subject, html } = templates.orderShipped(orderNumber, trackingNumber, carrier, name);
  return sendEmail({ to, subject, html });
}

/**
 * Send invoice ready email
 */
export async function sendInvoiceReadyEmail(to: string, orderNumber: string, name?: string) {
  const { subject, html } = templates.invoiceReady(orderNumber, name);
  return sendEmail({ to, subject, html });
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
  const { subject, html } = templates.paymentConfirmed(orderNumber, name, total);
  return sendEmail({ to, subject, html });
}

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

// Admin email address for notifications (REQUIRED in production)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

if (!ADMIN_EMAIL && process.env.NODE_ENV === "production") {
  console.warn("⚠️  ADMIN_EMAIL not set! Admin notifications will fail.");
}

/**
 * Send new order notification to admin
 */
export async function sendAdminNewOrderNotification(params: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  total: number;
  itemCount: number;
  paymentMethod: string;
}) {
  if (!ADMIN_EMAIL) {
    console.error("❌ ADMIN_EMAIL not configured. Skipping admin notification.");
    return { success: false, error: "Admin email not configured" };
  }
  
  const { subject, html } = templates.adminNewOrder(params);
  return sendEmail({ to: ADMIN_EMAIL, subject, html });
}
