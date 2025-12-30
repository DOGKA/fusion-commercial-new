/**
 * Order Confirmation Email
 * Sent when order is placed successfully
 * Single unified table - NO dividers, NO borders between sections
 */

import { Link } from "@react-email/components";
import { Layout } from "../components/Layout";
import { theme } from "../styles/theme";
import {
  maskName,
  maskAddress,
  maskPhone,
  formatCurrency,
  formatDateTime,
} from "../utils/mask";

interface OrderItemType {
  name: string;
  quantity: number;
  price: number;
}

interface Address {
  fullName: string;
  address: string;
  city: string;
  district: string;
  postalCode?: string;
  phone: string;
}

interface OrderConfirmationEmailProps {
  orderNumber: string;
  orderDate: Date | string;
  customerName?: string;
  customerEmail: string;
  items: OrderItemType[];
  subtotal: number;
  shipping: number;
  discount?: number;
  total: number;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: "CREDIT_CARD" | "BANK_TRANSFER";
}

export const OrderConfirmationEmail = ({
  orderNumber,
  orderDate,
  customerName,
  items,
  subtotal,
  shipping,
  discount,
  total,
  shippingAddress,
  billingAddress,
  paymentMethod,
}: OrderConfirmationEmailProps) => {
  const maskedShippingAddress = {
    name: maskName(shippingAddress.fullName),
    address: maskAddress(shippingAddress.address),
    city: shippingAddress.city,
    district: shippingAddress.district,
    postalCode: shippingAddress.postalCode,
    phone: maskPhone(shippingAddress.phone),
  };

  const maskedBillingAddress = {
    name: maskName(billingAddress.fullName),
    address: maskAddress(billingAddress.address),
    city: billingAddress.city,
    district: billingAddress.district,
    postalCode: billingAddress.postalCode,
    phone: maskPhone(billingAddress.phone),
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fusionmarkt.com";

  // Inline text style - no p tags, just spans with line breaks
  const textStyle = {
    color: theme.colors.textMuted,
    fontSize: "15px",
    lineHeight: "1.6",
    fontFamily: theme.fonts.sans,
  };

  const labelStyle = {
    color: theme.colors.textFaded,
    fontSize: "11px",
    fontWeight: "500" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    fontFamily: theme.fonts.sans,
  };

  const smallTextStyle = {
    color: theme.colors.textFaded,
    fontSize: "12px",
    fontFamily: theme.fonts.sans,
  };

  return (
    <Layout preview={`Siparişiniz alındı - ${orderNumber}`}>
      {/* Single continuous content block */}
      <div style={{ fontFamily: theme.fonts.sans }}>
        {/* Greeting + Message */}
        <p style={{ ...textStyle, marginTop: 0, marginBottom: "16px" }}>
          Merhaba{customerName ? <strong style={{ color: theme.colors.text }}> {customerName}</strong> : ""},
        </p>
        <p style={{ ...textStyle, marginTop: 0, marginBottom: "20px" }}>
          Siparişiniz başarıyla alındı. Teşekkür ederiz.
        </p>

        {/* Status Badge - centered */}
        <p style={{ textAlign: "center", margin: "0 0 20px 0" }}>
          <span style={{
            display: "inline-block",
            backgroundColor: "#d1fae5",
            color: "#047857",
            fontSize: "13px",
            fontWeight: "600",
            padding: "8px 20px",
            borderRadius: "9999px",
            fontFamily: theme.fonts.sans,
          }}>
            Sipariş Alındı
          </span>
        </p>

        {/* Order Number Box */}
        <div style={{
          backgroundColor: theme.colors.bgGlass,
          border: `1px solid ${theme.colors.borderAccent}`,
          borderRadius: "12px",
          padding: "20px",
          textAlign: "center",
          marginBottom: "8px",
        }}>
          <span style={{ ...labelStyle, display: "block", marginBottom: "8px" }}>Sipariş Numarası</span>
          <span style={{
            color: theme.colors.primary,
            fontSize: "20px",
            fontWeight: "600",
            fontFamily: theme.fonts.mono,
            letterSpacing: "2px",
          }}>
            {orderNumber}
          </span>
        </div>

        {/* Order Date */}
        <p style={{ ...smallTextStyle, textAlign: "center", margin: "0 0 28px 0" }}>
          Sipariş Tarihi: {formatDateTime(orderDate)}
        </p>

        {/* Order Details Label */}
        <p style={{ ...labelStyle, margin: "0 0 12px 0" }}>Sipariş Detayları</p>

        {/* Items */}
        {items.map((item, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <span style={{ color: theme.colors.text, fontSize: "14px", fontFamily: theme.fonts.sans }}>
              {item.name}
            </span>
            <span style={{ float: "right", color: theme.colors.text, fontSize: "14px", fontWeight: "500", fontFamily: theme.fonts.sans }}>
              {formatCurrency(item.price * item.quantity)}
            </span>
            <br />
            <span style={{ color: theme.colors.textFaded, fontSize: "12px", fontFamily: theme.fonts.sans }}>
              Adet: {item.quantity}
            </span>
          </div>
        ))}

        {/* Summary - no dividers, just spacing */}
        <div style={{ marginTop: "20px", marginBottom: "8px" }}>
          <span style={smallTextStyle}>Ara Toplam</span>
          <span style={{ ...smallTextStyle, float: "right" }}>{formatCurrency(subtotal)}</span>
        </div>
        <div style={{ marginBottom: "8px" }}>
          <span style={smallTextStyle}>Kargo</span>
          <span style={{ ...smallTextStyle, float: "right" }}>{shipping === 0 ? "Ücretsiz" : formatCurrency(shipping)}</span>
        </div>
        {discount && (
          <div style={{ marginBottom: "8px" }}>
            <span style={{ ...smallTextStyle, color: theme.colors.success }}>İndirim</span>
            <span style={{ ...smallTextStyle, float: "right", color: theme.colors.success }}>-{formatCurrency(discount)}</span>
          </div>
        )}

        {/* Total - emphasized with background */}
        <div style={{
          backgroundColor: "#ecfdf5",
          borderRadius: "8px",
          padding: "12px",
          marginTop: "12px",
          marginBottom: "28px",
        }}>
          <span style={{ color: theme.colors.text, fontSize: "15px", fontWeight: "600", fontFamily: theme.fonts.sans }}>
            Toplam
          </span>
          <span style={{ float: "right", color: theme.colors.primary, fontSize: "18px", fontWeight: "700", fontFamily: theme.fonts.sans }}>
            {formatCurrency(total)}
          </span>
        </div>

        {/* Address Label */}
        <p style={{ ...labelStyle, margin: "0 0 12px 0" }}>Adres Bilgileri</p>

        {/* Addresses - inline, side by side using float */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ width: "48%", display: "inline-block", verticalAlign: "top" }}>
            <span style={{ ...smallTextStyle, display: "block", marginBottom: "4px" }}>Teslimat</span>
            <span style={{ color: theme.colors.text, fontSize: "14px", display: "block", fontFamily: theme.fonts.sans }}>
              {maskedShippingAddress.name}
            </span>
            <span style={{ color: theme.colors.textMuted, fontSize: "12px", lineHeight: "1.5", display: "block", fontFamily: theme.fonts.sans }}>
              {maskedShippingAddress.address}<br />
              {maskedShippingAddress.district}/{maskedShippingAddress.city}
              {maskedShippingAddress.postalCode && ` - ${maskedShippingAddress.postalCode}`}<br />
              Tel: {maskedShippingAddress.phone}
            </span>
          </div>
          <div style={{ width: "48%", display: "inline-block", verticalAlign: "top", marginLeft: "4%" }}>
            <span style={{ ...smallTextStyle, display: "block", marginBottom: "4px" }}>Fatura</span>
            <span style={{ color: theme.colors.text, fontSize: "14px", display: "block", fontFamily: theme.fonts.sans }}>
              {maskedBillingAddress.name}
            </span>
            <span style={{ color: theme.colors.textMuted, fontSize: "12px", lineHeight: "1.5", display: "block", fontFamily: theme.fonts.sans }}>
              {maskedBillingAddress.address}<br />
              {maskedBillingAddress.district}/{maskedBillingAddress.city}
              {maskedBillingAddress.postalCode && ` - ${maskedBillingAddress.postalCode}`}<br />
              Tel: {maskedBillingAddress.phone}
            </span>
          </div>
        </div>

        {/* Payment Method */}
        <p style={{ ...smallTextStyle, textAlign: "center", margin: "0 0 24px 0" }}>
          Ödeme: {paymentMethod === "CREDIT_CARD" ? "Kredi Kartı" : "Havale/EFT"}
        </p>

        {/* Button */}
        <p style={{ textAlign: "center", margin: "0 0 24px 0" }}>
          <a
            href={`${siteUrl}/hesabim`}
            style={{
              display: "inline-block",
              backgroundColor: theme.colors.primary,
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "600",
              padding: "14px 32px",
              borderRadius: "10px",
              textDecoration: "none",
              fontFamily: theme.fonts.sans,
            }}
          >
            Siparişimi Görüntüle
          </a>
        </p>

        {/* Contracts - subtle background */}
        <div style={{
          backgroundColor: "#f0fdf4",
          borderRadius: "12px",
          padding: "16px",
        }}>
          <span style={{ ...labelStyle, display: "block", marginBottom: "12px", fontSize: "10px" }}>
            Kabul Edilen Sözleşmeler
          </span>

          <div style={{ marginBottom: "8px" }}>
            <span style={{ color: theme.colors.primary, fontSize: "14px", marginRight: "8px" }}>✓</span>
            <Link
              href={`${siteUrl}/sozlesmeler/${orderNumber}?contract=terms`}
              style={{ color: theme.colors.text, fontSize: "13px", textDecoration: "none", fontFamily: theme.fonts.sans }}
            >
              Kullanıcı Sözleşmesi ve Şartlar
            </Link>
            <Link
              href={`${siteUrl}/sozlesmeler/${orderNumber}?contract=terms`}
              style={{ float: "right", color: theme.colors.primary, fontSize: "12px", textDecoration: "none", fontFamily: theme.fonts.sans }}
            >
              Görüntüle →
            </Link>
          </div>

          <div>
            <span style={{ color: theme.colors.primary, fontSize: "14px", marginRight: "8px" }}>✓</span>
            <Link
              href={`${siteUrl}/sozlesmeler/${orderNumber}?contract=distance`}
              style={{ color: theme.colors.text, fontSize: "13px", textDecoration: "none", fontFamily: theme.fonts.sans }}
            >
              Mesafeli Satış Sözleşmesi
            </Link>
            <Link
              href={`${siteUrl}/sozlesmeler/${orderNumber}?contract=distance`}
              style={{ float: "right", color: theme.colors.primary, fontSize: "12px", textDecoration: "none", fontFamily: theme.fonts.sans }}
            >
              Görüntüle →
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmationEmail;
