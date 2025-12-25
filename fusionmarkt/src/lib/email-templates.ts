/**
 * Email Templates - FusionMarkt
 * Minimal, professional email templates with inline SVG icons
 * 
 * Usage:
 * import { emailTemplates } from "@/lib/email-templates";
 * const { subject, html } = emailTemplates.orderConfirmation("FM-2025-12345", "Ahmet");
 */

// ═══════════════════════════════════════════════════════════════════════════
// SVG ICONS (Inline, compatible with email clients)
// ═══════════════════════════════════════════════════════════════════════════

const icons = {
  // Checkmark circle - success
  checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
  
  // Package - order
  package: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
  
  // Truck - shipping
  truck: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18h2"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>`,
  
  // Clock - pending
  clock: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  
  // X Circle - cancelled
  xCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`,
  
  // File text - invoice
  fileText: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`,
  
  // Shield check - verified
  shieldCheck: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>`,
  
  // Key - password reset
  key: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/></svg>`,
  
  // Rotating arrows - refund
  refund: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>`,
  
  // Gift - delivered
  gift: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 4.8 0 0 1 12 8a4.8 4.8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>`,
};

// ═══════════════════════════════════════════════════════════════════════════
// BASE TEMPLATE - Shared layout for all emails
// ═══════════════════════════════════════════════════════════════════════════

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>FusionMarkt</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #050505; color: #ffffff;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #050505;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="520" style="margin: 0 auto; max-width: 520px;">
          <!-- Logo Header -->
          <tr>
            <td style="text-align: center; padding-bottom: 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="16" height="10" rx="2" ry="2"/><line x1="22" y1="11" x2="22" y2="13"/></svg>
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Fusion<span style="color: #10b981;">Markt</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Content Card -->
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
              <p style="margin: 0 0 8px 0; font-size: 13px; color: rgba(255,255,255,0.4);">
                Bu e-posta FusionMarkt tarafından gönderilmiştir.
              </p>
              <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.3);">
                © ${new Date().getFullYear()} FusionMarkt. Tüm hakları saklıdır.
              </p>
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
// COMPONENT BUILDERS
// ═══════════════════════════════════════════════════════════════════════════

const components = {
  // Greeting text
  greeting: (name?: string) => `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: rgba(255,255,255,0.8); line-height: 1.6;">
      Merhaba${name ? ` <strong style="color: #ffffff;">${name}</strong>` : ""},
    </p>
  `,

  // Description text
  text: (content: string) => `
    <p style="margin: 0 0 24px 0; font-size: 15px; color: rgba(255,255,255,0.7); line-height: 1.6;">
      ${content}
    </p>
  `,

  // Icon box with status
  iconBox: (icon: string, bgColor: string, borderColor: string) => `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 24px 0;">
      <tr>
        <td style="text-align: center;">
          <div style="display: inline-block; width: 80px; height: 80px; background-color: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 50%; line-height: 80px; text-align: center;">
            ${icon}
          </div>
        </td>
      </tr>
    </table>
  `,

  // Info card
  infoCard: (label: string, value: string, mono: boolean = false) => `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; margin: 16px 0;">
      <tr>
        <td style="padding: 20px; text-align: center;">
          <p style="margin: 0 0 6px 0; font-size: 12px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.5px;">${label}</p>
          <p style="margin: 0; font-size: ${mono ? '22px' : '18px'}; font-weight: 600; color: #ffffff; ${mono ? 'font-family: ui-monospace, monospace; letter-spacing: 1px;' : ''}">${value}</p>
        </td>
      </tr>
    </table>
  `,

  // Status badge
  statusBadge: (label: string, bgColor: string, textColor: string) => `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 16px auto;">
      <tr>
        <td style="background-color: ${bgColor}; border-radius: 20px; padding: 8px 20px;">
          <span style="font-size: 14px; font-weight: 600; color: ${textColor};">${label}</span>
        </td>
      </tr>
    </table>
  `,

  // Primary button
  button: (text: string, href: string, color: string = "#10b981") => `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 24px 0;">
      <tr>
        <td style="text-align: center;">
          <a href="${href}" target="_blank" style="display: inline-block; background-color: ${color}; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 14px; font-weight: 600;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `,

  // Tracking info box
  trackingBox: (trackingNumber: string, carrier?: string) => `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: rgba(139, 92, 246, 0.08); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 12px; margin: 20px 0;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="text-align: center; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08);">
                <p style="margin: 0 0 4px 0; font-size: 11px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.5px;">Kargo Takip Numarası</p>
                <p style="margin: 0; font-size: 18px; font-weight: 700; color: #8b5cf6; font-family: ui-monospace, monospace; letter-spacing: 1px;">${trackingNumber}</p>
              </td>
            </tr>
            ${carrier ? `
            <tr>
              <td style="text-align: center; padding-top: 12px;">
                <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.6);">
                  <span style="color: rgba(255,255,255,0.4);">Kargo:</span> <strong>${carrier}</strong>
                </p>
              </td>
            </tr>
            ` : ''}
          </table>
        </td>
      </tr>
    </table>
  `,

  // Bank info box
  bankInfo: (orderNumber: string) => `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: rgba(251, 191, 36, 0.06); border: 1px solid rgba(251, 191, 36, 0.2); border-radius: 12px; margin: 20px 0;">
      <tr>
        <td style="padding: 24px;">
          <p style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #fbbf24;">Havale / EFT Bilgileri</p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: rgba(255,255,255,0.5); width: 100px;">Banka</td>
              <td style="padding: 6px 0; font-size: 13px; color: #ffffff;">Ziraat Bankası</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: rgba(255,255,255,0.5);">Hesap Sahibi</td>
              <td style="padding: 6px 0; font-size: 13px; color: #ffffff;">FusionMarkt A.Ş.</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: rgba(255,255,255,0.5);">IBAN</td>
              <td style="padding: 6px 0; font-size: 13px; color: #ffffff; font-family: ui-monospace, monospace;">TR00 0000 0000 0000 0000 0000 00</td>
            </tr>
          </table>
          <p style="margin: 16px 0 0 0; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 12px; color: rgba(255,255,255,0.5); text-align: center;">
            Açıklama kısmına sipariş numaranızı yazınız: <strong style="color: #fbbf24;">${orderNumber}</strong>
          </p>
        </td>
      </tr>
    </table>
  `,

  // Warning/Info note
  note: (text: string, color: string = "#f59e0b") => `
    <p style="margin: 16px 0 0 0; font-size: 12px; color: ${color}; text-align: center;">
      ${text}
    </p>
  `,

  // Divider
  divider: () => `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 24px 0;">
      <tr>
        <td style="border-top: 1px solid rgba(255,255,255,0.08);"></td>
      </tr>
    </table>
  `,
};

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

export const emailTemplates = {
  // ─────────────────────────────────────────────────────────────────────────
  // Account Activation
  // ─────────────────────────────────────────────────────────────────────────
  activation: (code: string, name?: string) => ({
    subject: "FusionMarkt - Hesap Aktivasyonu",
    html: baseTemplate(`
      ${components.greeting(name)}
      ${components.text("Hesabınızı aktifleştirmek için aşağıdaki kodu kullanın:")}
      ${components.iconBox(icons.shieldCheck, "rgba(16,185,129,0.08)", "rgba(16,185,129,0.2)")}
      ${components.infoCard("Aktivasyon Kodu", code, true)}
      ${components.note("Bu kod 5 dakika içinde geçerliliğini yitirecektir.")}
      ${components.divider()}
      ${components.text("Eğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.")}
    `),
  }),

  // ─────────────────────────────────────────────────────────────────────────
  // Password Reset
  // ─────────────────────────────────────────────────────────────────────────
  passwordReset: (resetLink: string, name?: string) => ({
    subject: "FusionMarkt - Şifre Sıfırlama",
    html: baseTemplate(`
      ${components.greeting(name)}
      ${components.text("Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:")}
      ${components.iconBox(icons.key, "rgba(245,158,11,0.08)", "rgba(245,158,11,0.2)")}
      ${components.button("Şifremi Sıfırla", resetLink, "#f59e0b")}
      <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.4); text-align: center; word-break: break-all;">
        Buton çalışmıyorsa: ${resetLink}
      </p>
      ${components.note("Bu link 1 saat içinde geçerliliğini yitirecektir.")}
      ${components.divider()}
      ${components.text("Eğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.")}
    `),
  }),

  // ─────────────────────────────────────────────────────────────────────────
  // Order Confirmation
  // ─────────────────────────────────────────────────────────────────────────
  orderConfirmation: (orderNumber: string, name?: string, total?: number) => ({
    subject: `FusionMarkt - Siparişiniz Alındı #${orderNumber}`,
    html: baseTemplate(`
      ${components.greeting(name)}
      ${components.text("Siparişiniz başarıyla alındı. Teşekkür ederiz!")}
      ${components.iconBox(icons.checkCircle, "rgba(16,185,129,0.08)", "rgba(16,185,129,0.2)")}
      ${components.statusBadge("Sipariş Alındı", "rgba(16,185,129,0.15)", "#10b981")}
      ${components.infoCard("Sipariş Numarası", orderNumber, true)}
      ${total ? components.infoCard("Toplam Tutar", new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(total)) : ''}
      ${components.button("Siparişimi Görüntüle", "https://fusionmarkt.com/hesabim")}
    `),
  }),

  // ─────────────────────────────────────────────────────────────────────────
  // Order Pending Payment (Bank Transfer)
  // ─────────────────────────────────────────────────────────────────────────
  orderPendingPayment: (orderNumber: string, name?: string, total?: number) => ({
    subject: `FusionMarkt - Ödeme Bekleniyor #${orderNumber}`,
    html: baseTemplate(`
      ${components.greeting(name)}
      ${components.text("Siparişiniz oluşturuldu. Havale/EFT ödemenizi bekliyoruz.")}
      ${components.iconBox(icons.clock, "rgba(245,158,11,0.08)", "rgba(245,158,11,0.2)")}
      ${components.statusBadge("Ödeme Bekleniyor", "rgba(245,158,11,0.15)", "#f59e0b")}
      ${components.infoCard("Sipariş Numarası", orderNumber, true)}
      ${total ? components.infoCard("Ödenecek Tutar", new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(total)) : ''}
      ${components.bankInfo(orderNumber)}
      ${components.button("Siparişimi Görüntüle", "https://fusionmarkt.com/hesabim", "#f59e0b")}
    `),
  }),

  // ─────────────────────────────────────────────────────────────────────────
  // Order Status Update
  // ─────────────────────────────────────────────────────────────────────────
  orderStatusUpdate: (
    orderNumber: string, 
    status: string, 
    statusLabel: string, 
    name?: string, 
    trackingNumber?: string
  ) => {
    // Status-based styling
    const statusStyles: Record<string, { icon: string; bg: string; border: string; badgeBg: string; badgeColor: string }> = {
      CONFIRMED: { icon: icons.checkCircle, bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)", badgeBg: "rgba(16,185,129,0.15)", badgeColor: "#10b981" },
      PREPARING: { icon: icons.package, bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.2)", badgeBg: "rgba(139,92,246,0.15)", badgeColor: "#8b5cf6" },
      SHIPPED: { icon: icons.truck, bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)", badgeBg: "rgba(59,130,246,0.15)", badgeColor: "#3b82f6" },
      DELIVERED: { icon: icons.gift, bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)", badgeBg: "rgba(16,185,129,0.15)", badgeColor: "#10b981" },
      CANCELLED: { icon: icons.xCircle, bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", badgeBg: "rgba(239,68,68,0.15)", badgeColor: "#ef4444" },
      REFUNDED: { icon: icons.refund, bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", badgeBg: "rgba(245,158,11,0.15)", badgeColor: "#f59e0b" },
    };

    const style = statusStyles[status] || statusStyles.CONFIRMED;

    return {
      subject: `FusionMarkt - Sipariş Durumu: ${statusLabel} #${orderNumber}`,
      html: baseTemplate(`
        ${components.greeting(name)}
        ${components.text("Siparişinizin durumu güncellendi:")}
        ${components.iconBox(style.icon, style.bg, style.border)}
        ${components.statusBadge(statusLabel, style.badgeBg, style.badgeColor)}
        ${components.infoCard("Sipariş Numarası", orderNumber, true)}
        ${trackingNumber ? components.trackingBox(trackingNumber) : ''}
        ${components.button("Siparişimi Görüntüle", "https://fusionmarkt.com/hesabim")}
      `),
    };
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Order Shipped
  // ─────────────────────────────────────────────────────────────────────────
  orderShipped: (orderNumber: string, trackingNumber: string, carrier: string, name?: string) => ({
    subject: `FusionMarkt - Siparişiniz Kargoya Verildi #${orderNumber}`,
    html: baseTemplate(`
      ${components.greeting(name)}
      ${components.text("Siparişiniz kargoya verildi!")}
      ${components.iconBox(icons.truck, "rgba(59,130,246,0.08)", "rgba(59,130,246,0.2)")}
      ${components.statusBadge("Kargoya Verildi", "rgba(59,130,246,0.15)", "#3b82f6")}
      ${components.infoCard("Sipariş Numarası", orderNumber, true)}
      ${components.trackingBox(trackingNumber, carrier)}
      ${components.button("Kargo Takibi", "https://fusionmarkt.com/hesabim", "#3b82f6")}
    `),
  }),

  // ─────────────────────────────────────────────────────────────────────────
  // Invoice Ready
  // ─────────────────────────────────────────────────────────────────────────
  invoiceReady: (orderNumber: string, name?: string) => ({
    subject: `FusionMarkt - Faturanız Hazır #${orderNumber}`,
    html: baseTemplate(`
      ${components.greeting(name)}
      ${components.text(`#${orderNumber} numaralı siparişinizin faturası hazır.`)}
      ${components.iconBox(icons.fileText, "rgba(16,185,129,0.08)", "rgba(16,185,129,0.2)")}
      ${components.statusBadge("Fatura Hazır", "rgba(16,185,129,0.15)", "#10b981")}
      ${components.infoCard("Sipariş Numarası", orderNumber, true)}
      ${components.button("Faturamı İndir", "https://fusionmarkt.com/hesabim")}
      ${components.text("Faturanızı hesabım sayfasından indirebilirsiniz.")}
    `),
  }),

  // ─────────────────────────────────────────────────────────────────────────
  // Payment Confirmed
  // ─────────────────────────────────────────────────────────────────────────
  paymentConfirmed: (orderNumber: string, name?: string, total?: number) => ({
    subject: `FusionMarkt - Ödemeniz Onaylandı #${orderNumber}`,
    html: baseTemplate(`
      ${components.greeting(name)}
      ${components.text("Ödemeniz başarıyla onaylandı. Siparişiniz hazırlanmaya başlanacaktır.")}
      ${components.iconBox(icons.checkCircle, "rgba(16,185,129,0.08)", "rgba(16,185,129,0.2)")}
      ${components.statusBadge("Ödeme Onaylandı", "rgba(16,185,129,0.15)", "#10b981")}
      ${components.infoCard("Sipariş Numarası", orderNumber, true)}
      ${total ? components.infoCard("Ödenen Tutar", new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(total)) : ''}
      ${components.button("Siparişimi Görüntüle", "https://fusionmarkt.com/hesabim")}
    `),
  }),

  // ─────────────────────────────────────────────────────────────────────────
  // Admin: New Order Notification
  // ─────────────────────────────────────────────────────────────────────────
  adminNewOrder: (params: {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    total: number;
    itemCount: number;
    paymentMethod: string;
  }) => ({
    subject: `🔔 Yeni Sipariş #${params.orderNumber} - ${new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(params.total)}`,
    html: baseTemplate(`
      <p style="margin: 0 0 16px 0; font-size: 15px; color: rgba(255,255,255,0.8);">
        <strong style="color: #10b981;">Yeni sipariş alındı!</strong>
      </p>
      ${components.iconBox(icons.package, "rgba(16,185,129,0.08)", "rgba(16,185,129,0.2)")}
      ${components.infoCard("Sipariş Numarası", params.orderNumber, true)}
      
      <!-- Order Details -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; margin: 16px 0;">
        <tr>
          <td style="padding: 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="padding: 8px 0; font-size: 13px; color: rgba(255,255,255,0.5); width: 120px;">Müşteri</td>
                <td style="padding: 8px 0; font-size: 13px; color: #ffffff; font-weight: 500;">${params.customerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 13px; color: rgba(255,255,255,0.5);">E-posta</td>
                <td style="padding: 8px 0; font-size: 13px; color: #ffffff;">${params.customerEmail}</td>
              </tr>
              ${params.customerPhone ? `
              <tr>
                <td style="padding: 8px 0; font-size: 13px; color: rgba(255,255,255,0.5);">Telefon</td>
                <td style="padding: 8px 0; font-size: 13px; color: #ffffff;">${params.customerPhone}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; font-size: 13px; color: rgba(255,255,255,0.5);">Ürün Sayısı</td>
                <td style="padding: 8px 0; font-size: 13px; color: #ffffff;">${params.itemCount} adet</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 13px; color: rgba(255,255,255,0.5);">Ödeme</td>
                <td style="padding: 8px 0; font-size: 13px; color: #ffffff;">${params.paymentMethod === 'BANK_TRANSFER' ? 'Havale/EFT' : 'Kredi Kartı'}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.08);"></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 15px; color: rgba(255,255,255,0.7); font-weight: 600;">Toplam</td>
                <td style="padding: 8px 0; font-size: 18px; color: #10b981; font-weight: 700;">${new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(params.total)}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      
      ${components.button("Siparişi Görüntüle", `${process.env.ADMIN_URL || 'https://admin.fusionmarkt.com'}/orders`)}
      
      <p style="margin: 24px 0 0 0; font-size: 12px; color: rgba(255,255,255,0.4); text-align: center;">
        ${new Date().toLocaleString("tr-TR", { dateStyle: "long", timeStyle: "short" })}
      </p>
    `),
  }),
};

// ═══════════════════════════════════════════════════════════════════════════
// ORDER STATUS LABELS
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

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export function getStatusLabel(status: string): string {
  return orderStatusLabels[status] || status;
}
