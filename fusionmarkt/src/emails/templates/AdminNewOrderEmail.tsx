/**
 * Admin New Order Notification
 * Sent to admin when a new order is placed
 */

import { Section, Text, Row, Column, Hr, Link } from "@react-email/components";
import { Layout } from "../components/Layout";
import { InfoCard, Button, Divider } from "../components/shared";
import { theme } from "../styles/theme";
import { formatCurrency, formatDateTime } from "../utils/mask";

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
  orderDate,
  customerName,
  customerEmail,
  customerPhone,
  total,
  itemCount,
  paymentMethod,
  shippingCity,
  items,
}: AdminNewOrderEmailProps) => {
  const adminUrl = process.env.ADMIN_URL || "https://admin.fusionmarkt.com";

  return (
    <Layout preview={`Yeni Sipariş: ${orderNumber} - ${formatCurrency(total)}`}>
      <Text
        style={{
          color: theme.colors.primary,
          fontSize: theme.fontSizes.lg,
          fontWeight: theme.fontWeights.semibold,
          textAlign: "center" as const,
          margin: 0,
          marginBottom: theme.spacing[4],
        }}
      >
        Yeni Sipariş Alındı
      </Text>

      <InfoCard label="Sipariş Numarası" value={orderNumber} mono accent />

      {/* Order Summary */}
      <Section
        style={{
          backgroundColor: theme.colors.bgGlass,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.lg,
          padding: theme.spacing[4],
          marginBottom: theme.spacing[4],
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td
                style={{
                  color: theme.colors.textFaded,
                  fontSize: theme.fontSizes.sm,
                  padding: `${theme.spacing[2]} 0`,
                  width: "120px",
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
                }}
              >
                E-posta
              </td>
              <td
                style={{
                  color: theme.colors.text,
                  fontSize: theme.fontSizes.sm,
                  padding: `${theme.spacing[2]} 0`,
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
                }}
              >
                Telefon
              </td>
              <td
                style={{
                  color: theme.colors.text,
                  fontSize: theme.fontSizes.sm,
                  padding: `${theme.spacing[2]} 0`,
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
                }}
              >
                Şehir
              </td>
              <td
                style={{
                  color: theme.colors.text,
                  fontSize: theme.fontSizes.sm,
                  padding: `${theme.spacing[2]} 0`,
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
                }}
              >
                Ürün Sayısı
              </td>
              <td
                style={{
                  color: theme.colors.text,
                  fontSize: theme.fontSizes.sm,
                  padding: `${theme.spacing[2]} 0`,
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
                }}
              >
                Ödeme
              </td>
              <td
                style={{
                  color: theme.colors.text,
                  fontSize: theme.fontSizes.sm,
                  padding: `${theme.spacing[2]} 0`,
                }}
              >
                {paymentMethod === "CREDIT_CARD" ? "Kredi Kartı" : "Havale/EFT"}
              </td>
            </tr>
          </tbody>
        </table>

        <Hr style={{ borderColor: theme.colors.border, margin: `${theme.spacing[3]} 0` }} />

        <Row>
          <Column>
            <Text
              style={{
                color: theme.colors.textMuted,
                fontSize: theme.fontSizes.md,
                fontWeight: theme.fontWeights.semibold,
                margin: 0,
              }}
            >
              Toplam
            </Text>
          </Column>
          <Column style={{ textAlign: "right" as const }}>
            <Text
              style={{
                color: theme.colors.primary,
                fontSize: theme.fontSizes.xl,
                fontWeight: theme.fontWeights.bold,
                margin: 0,
              }}
            >
              {formatCurrency(total)}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Order Items */}
      <Section
        style={{
          backgroundColor: theme.colors.bgGlass,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.lg,
          padding: theme.spacing[4],
          marginBottom: theme.spacing[4],
        }}
      >
        <Text
          style={{
            color: theme.colors.textFaded,
            fontSize: theme.fontSizes.xs,
            textTransform: "uppercase" as const,
            letterSpacing: "0.5px",
            margin: 0,
            marginBottom: theme.spacing[3],
          }}
        >
          Sipariş İçeriği
        </Text>

        {items.map((item, index) => (
          <Row key={index} style={{ marginBottom: theme.spacing[2] }}>
            <Column style={{ width: "60%" }}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: theme.fontSizes.sm,
                  margin: 0,
                }}
              >
                {item.name}
              </Text>
            </Column>
            <Column style={{ width: "15%", textAlign: "center" as const }}>
              <Text
                style={{
                  color: theme.colors.textFaded,
                  fontSize: theme.fontSizes.sm,
                  margin: 0,
                }}
              >
                x{item.quantity}
              </Text>
            </Column>
            <Column style={{ width: "25%", textAlign: "right" as const }}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: theme.fontSizes.sm,
                  margin: 0,
                }}
              >
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </Column>
          </Row>
        ))}
      </Section>

      <Button href={`${adminUrl}/orders`}>Siparişi Görüntüle</Button>

      <Divider />

      <Text
        style={{
          color: theme.colors.textDim,
          fontSize: theme.fontSizes.xs,
          textAlign: "center" as const,
          margin: 0,
        }}
      >
        {formatDateTime(orderDate)}
      </Text>
    </Layout>
  );
};

export default AdminNewOrderEmail;
