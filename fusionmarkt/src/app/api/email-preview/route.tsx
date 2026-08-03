import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/components";

// Email templates
import { OrderConfirmationEmail } from "@/emails/templates/OrderConfirmationEmail";
import { CartReminderEmail } from "@/emails/templates/CartReminderEmail";
import { OrderShippedEmail } from "@/emails/templates/OrderShippedEmail";
import { PaymentConfirmedEmail } from "@/emails/templates/PaymentConfirmedEmail";
import { PasswordResetEmail } from "@/emails/templates/PasswordResetEmail";
import { ActivationEmail } from "@/emails/templates/ActivationEmail";
import { InvoiceReadyEmail } from "@/emails/templates/InvoiceReadyEmail";
import { OrderPendingPaymentEmail } from "@/emails/templates/OrderPendingPaymentEmail";
import { OrderStatusEmail } from "@/emails/templates/OrderStatusEmail";
import { AdminNewOrderEmail } from "@/emails/templates/AdminNewOrderEmail";

// Sample data for previews
const sampleAddress = {
  fullName: "Ahmet Yılmaz",
  address: "Atatürk Cad. No: 123",
  city: "İstanbul",
  district: "Kadıköy",
  postalCode: "34710",
  phone: "+90 532 123 4567",
};

const sampleItems = [
  { name: "EcoFlow DELTA 2 Taşınabilir Güç İstasyonu", quantity: 1, price: 42999 },
  { name: "EcoFlow 220W Taşınabilir Güneş Paneli", quantity: 2, price: 15999 },
];

const templates: Record<string, { component: React.ReactElement; name: string }> = {
  "order-confirmation": {
    name: "Sipariş Onayı",
    component: (
      <OrderConfirmationEmail
        orderNumber="FM-TEST-1234"
        orderDate={new Date()}
        customerEmail="ahmet@example.com"
        customerName="Ahmet Yılmaz"
        items={sampleItems}
        subtotal={74997}
        shipping={0}
        discount={5000}
        total={69997}
        shippingAddress={sampleAddress}
        billingAddress={sampleAddress}
        paymentMethod="CREDIT_CARD"
      />
    ),
  },
  "cart-reminder": {
    name: "Sepet Hatırlatma",
    component: (
      <CartReminderEmail
        name="Mehmet Demir"
        items={[{ name: "EcoFlow RIVER 2 Pro", price: 28999, quantity: 1 }]}
        total={28999}
        coupon={{
          code: "HOSGELDIN10",
          discountType: "PERCENTAGE",
          discountValue: 10,
          minOrderAmount: 500,
          expiryDate: "31 Aralık 2025",
        }}
      />
    ),
  },
  "cart-reminder-no-coupon": {
    name: "Sepet Hatırlatma (Kuponsuz)",
    component: (
      <CartReminderEmail
        name="Mehmet Demir"
        items={[
          { name: "EcoFlow RIVER 2 Pro", price: 28999, quantity: 1 },
          { name: "EcoFlow 160W Solar Panel", price: 12999, quantity: 1 },
        ]}
        total={41998}
      />
    ),
  },
  "order-shipped": {
    name: "Sipariş Kargoya Verildi",
    component: (
      <OrderShippedEmail
        orderNumber="FM-TEST-1234"
        name="Ahmet Yılmaz"
        trackingNumber="TR123456789"
        carrier="Aras Kargo"
      />
    ),
  },
  "payment-confirmed": {
    name: "Ödeme Onaylandı",
    component: (
      <PaymentConfirmedEmail
        orderNumber="FM-TEST-1234"
        name="Ahmet Yılmaz"
        total={69997}
      />
    ),
  },
  "password-reset": {
    name: "Şifre Sıfırlama",
    component: (
      <PasswordResetEmail
        name="Ahmet Yılmaz"
        resetLink="https://fusionmarkt.com/sifre-sifirla?token=abc123def456"
      />
    ),
  },
  activation: {
    name: "Hesap Aktivasyonu",
    component: (
      <ActivationEmail
        name="Ahmet Yılmaz"
        code="123456"
      />
    ),
  },
  "invoice-ready": {
    name: "Fatura Hazır",
    component: (
      <InvoiceReadyEmail
        orderNumber="FM-TEST-1234"
        name="Ahmet Yılmaz"
      />
    ),
  },
  "order-pending-payment": {
    name: "Ödeme Bekliyor (Havale/EFT)",
    component: (
      <OrderPendingPaymentEmail
        orderNumber="FM-TEST-1234"
        name="Ahmet Yılmaz"
        total={69997}
      />
    ),
  },
  "order-status-confirmed": {
    name: "Sipariş Durumu: Onaylandı",
    component: (
      <OrderStatusEmail
        orderNumber="FM-TEST-1234"
        name="Ahmet Yılmaz"
        status="CONFIRMED"
      />
    ),
  },
  "order-status-preparing": {
    name: "Sipariş Durumu: Hazırlanıyor",
    component: (
      <OrderStatusEmail
        orderNumber="FM-TEST-1234"
        name="Ahmet Yılmaz"
        status="PREPARING"
      />
    ),
  },
  "order-status-shipped": {
    name: "Sipariş Durumu: Kargoda",
    component: (
      <OrderStatusEmail
        orderNumber="FM-TEST-1234"
        name="Ahmet Yılmaz"
        status="SHIPPED"
        trackingNumber="TR123456789"
        carrier="Aras Kargo"
      />
    ),
  },
  "order-status-delivered": {
    name: "Sipariş Durumu: Teslim Edildi",
    component: (
      <OrderStatusEmail
        orderNumber="FM-TEST-1234"
        name="Ahmet Yılmaz"
        status="DELIVERED"
      />
    ),
  },
  "order-status-cancelled": {
    name: "Sipariş Durumu: İptal Edildi",
    component: (
      <OrderStatusEmail
        orderNumber="FM-TEST-1234"
        name="Ahmet Yılmaz"
        status="CANCELLED"
      />
    ),
  },
  "admin-new-order": {
    name: "Admin: Yeni Sipariş Bildirimi",
    component: (
      <AdminNewOrderEmail
        orderNumber="FM-TEST-1234"
        orderDate={new Date()}
        customerName="Ahmet Yılmaz"
        customerEmail="ahmet@example.com"
        customerPhone="+90 532 123 4567"
        total={69997}
        itemCount={3}
        paymentMethod="CREDIT_CARD"
        shippingCity="İstanbul"
        items={sampleItems}
      />
    ),
  },
};

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const template = searchParams.get("template");

  // If no template specified, show list
  if (!template) {
    const templateList = Object.entries(templates)
      .map(
        ([key, { name }]) =>
          `<li style="margin: 10px 0;">
            <a href="?template=${key}" style="color: #10b981; text-decoration: none; font-size: 15px; display: flex; align-items: center; gap: 8px;">
              <span style="color: #666;">→</span> ${name}
            </a>
          </li>`
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Email Önizleme - FusionMarkt</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              background: #0a0a0a; 
              color: #fff; 
              padding: 40px;
              max-width: 600px;
              margin: 0 auto;
            }
            h1 { color: #10b981; margin-bottom: 8px; }
            .subtitle { color: #888; margin-bottom: 32px; }
            ul { list-style: none; padding: 0; }
            li a { 
              padding: 12px 16px; 
              display: block; 
              background: rgba(255,255,255,0.03); 
              border-radius: 8px; 
              margin-bottom: 8px;
              border: 1px solid rgba(255,255,255,0.1);
              transition: all 0.2s;
            }
            li a:hover { 
              background: rgba(16, 185, 129, 0.1); 
              border-color: rgba(16, 185, 129, 0.3);
            }
          </style>
        </head>
        <body>
          <h1>📧 Email Şablonları</h1>
          <p class="subtitle">Önizlemek için bir şablon seçin:</p>
          <ul>${templateList}</ul>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  }

  // Render specific template
  const templateData = templates[template];
  if (!templateData) {
    return new NextResponse("Template not found", { status: 404 });
  }

  try {
    const emailHtml = await render(templateData.component);

    // Wrap with navigation
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${templateData.name} - Email Önizleme</title>
          <style>
            body { margin: 0; padding: 0; }
            .nav { 
              background: #111; 
              padding: 12px 20px; 
              display: flex; 
              align-items: center; 
              gap: 20px; 
              border-bottom: 1px solid #333;
              position: sticky;
              top: 0;
              z-index: 100;
            }
            .nav a { color: #10b981; text-decoration: none; font-size: 14px; }
            .nav a:hover { text-decoration: underline; }
            .nav span { color: #fff; font-weight: 600; font-size: 14px; }
            .preview { background: #f5f5f5; min-height: calc(100vh - 50px); }
          </style>
        </head>
        <body>
          <div class="nav">
            <a href="/api/email-preview">← Tüm Şablonlar</a>
            <span>${templateData.name}</span>
          </div>
          <div class="preview">
            ${emailHtml}
          </div>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("Email render error:", error);
    return new NextResponse(`Render error: ${error}`, { status: 500 });
  }
}
