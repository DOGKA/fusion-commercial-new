/**
 * Email Service for Admin Panel
 * Sends order status notifications to customers
 * 
 * Uses Resend API (https://resend.com)
 * Domain: fusionmarkt.com (verified, eu-west-1)
 */

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
// SVG ICONS
// ═══════════════════════════════════════════════════════════════════════════

const icons = {
  checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
  package: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
  truck: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18h2"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>`,
  xCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`,
  fileText: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`,
  gift: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 4.8 0 0 1 12 8a4.8 4.8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>`,
  refund: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>`,
};

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
// BASE TEMPLATE
// ═══════════════════════════════════════════════════════════════════════════

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FusionMarkt</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #050505; color: #ffffff;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #050505;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="520" style="margin: 0 auto; max-width: 520px;">
          <!-- Logo -->
          <tr>
            <td style="text-align: center; padding-bottom: 32px;">
              <span style="font-size: 22px; font-weight: 700; color: #ffffff;">Fusion<span style="color: #10b981;">Markt</span></span>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px;">
                <tr>
                  <td style="padding: 40px;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding-top: 32px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.3);">© ${new Date().getFullYear()} FusionMarkt</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL SEND FUNCTION (Resend API)
// ═══════════════════════════════════════════════════════════════════════════

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: SendEmailParams) {
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
    console.log("📧 Email sent via Resend:", data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error("❌ Email error:", error);
    return { success: false, error };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ORDER STATUS EMAIL
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
  
  // Status-based styling
  const statusStyles: Record<string, { icon: string; bg: string; border: string; color: string }> = {
    CONFIRMED: { icon: icons.checkCircle, bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)", color: "#10b981" },
    PROCESSING: { icon: icons.package, bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.2)", color: "#8b5cf6" },
    SHIPPED: { icon: icons.truck, bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)", color: "#3b82f6" },
    DELIVERED: { icon: icons.gift, bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)", color: "#10b981" },
    CANCELLED: { icon: icons.xCircle, bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", color: "#ef4444" },
    REFUNDED: { icon: icons.refund, bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", color: "#f59e0b" },
  };

  const style = statusStyles[status] || statusStyles.CONFIRMED;

  const trackingHtml = trackingNumber ? `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.2); border-radius: 12px; margin: 20px 0;">
      <tr>
        <td style="padding: 20px; text-align: center;">
          <p style="margin: 0 0 4px 0; font-size: 11px; color: rgba(255,255,255,0.5); text-transform: uppercase;">Kargo Takip Numarası</p>
          <p style="margin: 0; font-size: 18px; font-weight: 700; color: #8b5cf6; font-family: ui-monospace, monospace;">${trackingNumber}</p>
          ${carrierName ? `<p style="margin: 8px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.6);">Kargo: <strong>${carrierName}</strong></p>` : ''}
        </td>
      </tr>
    </table>
  ` : '';

  const html = baseTemplate(`
    <p style="margin: 0 0 16px 0; font-size: 15px; color: rgba(255,255,255,0.8);">
      Merhaba${customerName ? ` <strong style="color: #fff;">${customerName}</strong>` : ""},
    </p>
    <p style="margin: 0 0 24px 0; font-size: 15px; color: rgba(255,255,255,0.7);">
      Siparişinizin durumu güncellendi:
    </p>
    <!-- Icon -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 24px 0;">
      <tr>
        <td style="text-align: center;">
          <div style="display: inline-block; width: 80px; height: 80px; background-color: ${style.bg}; border: 1px solid ${style.border}; border-radius: 50%; line-height: 80px; text-align: center;">
            ${style.icon}
          </div>
        </td>
      </tr>
    </table>
    <!-- Status Badge -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 16px auto;">
      <tr>
        <td style="background-color: ${style.bg}; border-radius: 20px; padding: 8px 20px;">
          <span style="font-size: 14px; font-weight: 600; color: ${style.color};">${statusLabel}</span>
        </td>
      </tr>
    </table>
    <!-- Order Number -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; margin: 16px 0;">
      <tr>
        <td style="padding: 20px; text-align: center;">
          <p style="margin: 0 0 6px 0; font-size: 12px; color: rgba(255,255,255,0.5); text-transform: uppercase;">Sipariş Numarası</p>
          <p style="margin: 0; font-size: 22px; font-weight: 600; color: #ffffff; font-family: ui-monospace, monospace;">${orderNumber}</p>
        </td>
      </tr>
    </table>
    ${trackingHtml}
    <!-- Button -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 24px 0;">
      <tr>
        <td style="text-align: center;">
          <a href="https://fusionmarkt.com/hesabim" target="_blank" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 14px; font-weight: 600;">
            Siparişimi Görüntüle
          </a>
        </td>
      </tr>
    </table>
  `);

  return sendEmail({
    to,
    subject: `FusionMarkt - ${statusLabel} #${orderNumber}`,
    html,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// INVOICE READY EMAIL
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
  const html = baseTemplate(`
    <p style="margin: 0 0 16px 0; font-size: 15px; color: rgba(255,255,255,0.8);">
      Merhaba${customerName ? ` <strong style="color: #fff;">${customerName}</strong>` : ""},
    </p>
    <p style="margin: 0 0 24px 0; font-size: 15px; color: rgba(255,255,255,0.7);">
      #${orderNumber} numaralı siparişinizin faturası hazır.
    </p>
    <!-- Icon -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 24px 0;">
      <tr>
        <td style="text-align: center;">
          <div style="display: inline-block; width: 80px; height: 80px; background-color: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); border-radius: 50%; line-height: 80px; text-align: center;">
            ${icons.fileText}
          </div>
        </td>
      </tr>
    </table>
    <!-- Status Badge -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 16px auto;">
      <tr>
        <td style="background-color: rgba(16,185,129,0.15); border-radius: 20px; padding: 8px 20px;">
          <span style="font-size: 14px; font-weight: 600; color: #10b981;">Fatura Hazır</span>
        </td>
      </tr>
    </table>
    <!-- Order Number -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; margin: 16px 0;">
      <tr>
        <td style="padding: 20px; text-align: center;">
          <p style="margin: 0 0 6px 0; font-size: 12px; color: rgba(255,255,255,0.5); text-transform: uppercase;">Sipariş Numarası</p>
          <p style="margin: 0; font-size: 22px; font-weight: 600; color: #ffffff; font-family: ui-monospace, monospace;">${orderNumber}</p>
        </td>
      </tr>
    </table>
    <!-- Button -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 24px 0;">
      <tr>
        <td style="text-align: center;">
          <a href="https://fusionmarkt.com/hesabim" target="_blank" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 14px; font-weight: 600;">
            Faturamı İndir
          </a>
        </td>
      </tr>
    </table>
    <p style="margin: 24px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.5); text-align: center;">
      Faturanızı hesabım sayfasından indirebilirsiniz.
    </p>
  `);

  return sendEmail({
    to,
    subject: `FusionMarkt - Faturanız Hazır #${orderNumber}`,
    html,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// PAYMENT CONFIRMED EMAIL
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
  const html = baseTemplate(`
    <p style="margin: 0 0 16px 0; font-size: 15px; color: rgba(255,255,255,0.8);">
      Merhaba${customerName ? ` <strong style="color: #fff;">${customerName}</strong>` : ""},
    </p>
    <p style="margin: 0 0 24px 0; font-size: 15px; color: rgba(255,255,255,0.7);">
      Ödemeniz başarıyla onaylandı. Siparişiniz hazırlanmaya başlanacaktır.
    </p>
    <!-- Icon -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 24px 0;">
      <tr>
        <td style="text-align: center;">
          <div style="display: inline-block; width: 80px; height: 80px; background-color: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); border-radius: 50%; line-height: 80px; text-align: center;">
            ${icons.checkCircle}
          </div>
        </td>
      </tr>
    </table>
    <!-- Status Badge -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 16px auto;">
      <tr>
        <td style="background-color: rgba(16,185,129,0.15); border-radius: 20px; padding: 8px 20px;">
          <span style="font-size: 14px; font-weight: 600; color: #10b981;">Ödeme Onaylandı</span>
        </td>
      </tr>
    </table>
    <!-- Order Number -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; margin: 16px 0;">
      <tr>
        <td style="padding: 20px; text-align: center;">
          <p style="margin: 0 0 6px 0; font-size: 12px; color: rgba(255,255,255,0.5); text-transform: uppercase;">Sipariş Numarası</p>
          <p style="margin: 0; font-size: 22px; font-weight: 600; color: #ffffff; font-family: ui-monospace, monospace;">${orderNumber}</p>
        </td>
      </tr>
    </table>
    ${total ? `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; margin: 16px 0;">
      <tr>
        <td style="padding: 20px; text-align: center;">
          <p style="margin: 0 0 6px 0; font-size: 12px; color: rgba(255,255,255,0.5); text-transform: uppercase;">Ödenen Tutar</p>
          <p style="margin: 0; font-size: 18px; font-weight: 600; color: #ffffff;">${new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(total)}</p>
        </td>
      </tr>
    </table>
    ` : ''}
    <!-- Button -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 24px 0;">
      <tr>
        <td style="text-align: center;">
          <a href="https://fusionmarkt.com/hesabim" target="_blank" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 14px; font-weight: 600;">
            Siparişimi Görüntüle
          </a>
        </td>
      </tr>
    </table>
  `);

  return sendEmail({
    to,
    subject: `FusionMarkt - Ödemeniz Onaylandı #${orderNumber}`,
    html,
  });
}
