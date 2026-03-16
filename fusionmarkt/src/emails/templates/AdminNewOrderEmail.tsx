/**
 * Admin New Order Notification
 * Sent to admin when a new order is placed
 * 100% table-based for email client compatibility
 */

import { Link } from "@react-email/components";
import { Layout } from "../components/Layout";
import { InfoCard, Button, GlassPanel } from "../components/shared";
import { theme } from "../styles/theme";
import { formatCurrency } from "../utils/mask";

interface AdminNewOrderEmailProps {
  orderNumber: string;
  orderDate: Date | string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: number;
  itemCount: number;
  paymentMethod: "CREDIT_CARD" | "BANK_TRANSFER";
  shippingCity: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export const AdminNewOrderEmail = ({
  orderNumber,
  orderDate: _orderDate,
  customerName,
  customerEmail,
  customerPhone,
  total,
  itemCount,
  paymentMethod,
  shippingCity,
  items,
}: AdminNewOrderEmailProps) => {
  void _orderDate; // Reserved for future use
  const adminUrl = process.env.ADMIN_URL || "https://admin.fusionmarkt.com";

  return (
    <Layout preview={`Yeni Sipariş: ${orderNumber} - ${formatCurrency(total)}`}>
      <p
        style={{
          color: theme.colors.primary,
          fontSize: theme.fontSizes.lg,
          fontWeight: theme.fontWeights.semibold,
          textAlign: "center" as const,
          margin: 0,
          marginBottom: theme.spacing[4],
          fontFamily: theme.fonts.sans,
        }}
      >
        Yeni Sipariş Alındı
      </p>

      <InfoCard label="Sipariş Numarası" value={orderNumber} mono accent />

      {/* Order Summary */}
      <GlassPanel>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td
                style={{
                  color: theme.colors.textFaded,
                  fontSize: theme.fontSizes.sm,
                  padding: `${theme.spacing[2]} 0`,
                  width: "120px",
                  fontFamily: theme.fonts.sans,
                }}
              >
                Müşteri
              </td>
              <td
                style={{
                  color: theme.colors.text,
                  fontSize: theme.fontSizes.sm,
                  fontWeight: theme.fontWeights.medium,
                  padding: `${theme.spacing[2]} 0`,
                  fontFamily: theme.fonts.sans,
                }}
              >
                {customerName}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  color: theme.colors.textFaded,
                  fontSize: theme.fontSizes.sm,
                  padding: `${theme.spacing[2]} 0`,
                  fontFamily: theme.fonts.sans,
                }}
              >
                E-posta
              </td>
              <td
                style={{
                  color: theme.colors.text,
                  fontSize: theme.fontSizes.sm,
                  padding: `${theme.spacing[2]} 0`,
                  fontFamily: theme.fonts.sans,
                }}
              >
                <Link
                  href={`mailto:${customerEmail}`}
                  style={{ color: theme.colors.text, textDecoration: "underline" }}
                >
                  {customerEmail}
                </Link>
              </td>
            </tr>
            <tr>
              <td
                style={{
                  color: theme.colors.textFaded,
                  fontSize: theme.fontSizes.sm,
                  padding: `${theme.spacing[2]} 0`,
                  fontFamily: theme.fonts.sans,
                }}
              >
                Telefon
              </td>
              <td
                style={{
                  color: theme.colors.text,
                  fontSize: theme.fontSizes.sm,
                  padding: `${theme.spacing[2]} 0`,
                  fontFamily: theme.fonts.sans,
                }}
              >
                {customerPhone}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  color: theme.colors.textFaded,
                  fontSize: theme.fontSizes.sm,
                  padding: `${theme.spacing[2]} 0`,
                  fontFamily: theme.fonts.sans,
                }}
              >
                Şehir
              </td>
              <td
                style={{
                  color: theme.colors.text,
                  fontSize: theme.fontSizes.sm,
                  padding: `${theme.spacing[2]} 0`,
                  fontFamily: theme.fonts.sans,
                }}
              >
                {shippingCity}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  color: theme.colors.textFaded,
                  fontSize: theme.fontSizes.sm,
                  padding: `${theme.spacing[2]} 0`,
                  fontFamily: theme.fonts.sans,
                }}
              >
                Ürün Sayısı
              </td>
              <td
                style={{
                  color: theme.colors.text,
                  fontSize: theme.fontSizes.sm,
                  padding: `${theme.spacing[2]} 0`,
                  fontFamily: theme.fonts.sans,
                }}
              >
                {itemCount} adet
              </td>
            </tr>
            <tr>
              <td
                style={{
                  color: theme.colors.textFaded,
                  fontSize: theme.fontSizes.sm,
                  padding: `${theme.spacing[2]} 0`,
                  fontFamily: theme.fonts.sans,
                }}
              >
                Ödeme
              </td>
              <td
                style={{
                  color: theme.colors.text,
                  fontSize: theme.fontSizes.sm,
                  padding: `${theme.spacing[2]} 0`,
                  fontFamily: theme.fonts.sans,
                }}
              >
                {paymentMethod === "CREDIT_CARD" ? "Kredi Kartı" : "Havale/EFT"}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Divider */}
        <table cellPadding="0" cellSpacing="0" border={0} width="100%" style={{ margin: `${theme.spacing[3]} 0` }}>
          <tbody>
            <tr>
              <td style={{ borderTop: `1px solid ${theme.colors.border}`, height: "1px" }}>&nbsp;</td>
            </tr>
          </tbody>
        </table>

        <table cellPadding="0" cellSpacing="0" border={0} width="100%">
          <tbody>
            <tr>
              <td>
                <p
                  style={{
                    color: theme.colors.textMuted,
                    fontSize: theme.fontSizes.md,
                    fontWeight: theme.fontWeights.semibold,
                    margin: 0,
                    fontFamily: theme.fonts.sans,
                  }}
                >
                  Toplam
                </p>
              </td>
              <td style={{ textAlign: "right" }}>
                <p
                  style={{
                    color: theme.colors.primary,
                    fontSize: theme.fontSizes.xl,
                    fontWeight: theme.fontWeights.bold,
                    margin: 0,
                    fontFamily: theme.fonts.sans,
                  }}
                >
                  {formatCurrency(total)}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </GlassPanel>

      {/* Order Items */}
      <GlassPanel>
        <p
          style={{
            color: theme.colors.textFaded,
            fontSize: theme.fontSizes.xs,
            textTransform: "uppercase" as const,
            letterSpacing: "0.5px",
            margin: 0,
            marginBottom: theme.spacing[3],
            fontFamily: theme.fonts.sans,
          }}
        >
          Sipariş İçeriği
        </p>

        {items.map((item, index) => (
          <table key={index} cellPadding="0" cellSpacing="0" border={0} width="100%" style={{ marginBottom: theme.spacing[2] }}>
            <tbody>
              <tr>
                <td style={{ width: "60%" }}>
                  <p
                    style={{
                      color: theme.colors.text,
                      fontSize: theme.fontSizes.sm,
                      margin: 0,
                      fontFamily: theme.fonts.sans,
                    }}
                  >
                    {item.name}
                  </p>
                </td>
                <td style={{ width: "15%", textAlign: "center" }}>
                  <p
                    style={{
                      color: theme.colors.textFaded,
                      fontSize: theme.fontSizes.sm,
                      margin: 0,
                      fontFamily: theme.fonts.sans,
                    }}
                  >
                    x{item.quantity}
                  </p>
                </td>
                <td style={{ width: "25%", textAlign: "right" }}>
                  <p
                    style={{
                      color: theme.colors.text,
                      fontSize: theme.fontSizes.sm,
                      margin: 0,
                      fontFamily: theme.fonts.sans,
                    }}
                  >
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        ))}
      </GlassPanel>

      <Button href={`${adminUrl}/orders`}>Siparişi Görüntüle</Button>
    </Layout>
  );
};

export default AdminNewOrderEmail;
