/**
 * Cart Reminder Email
 * Sent to remind users about abandoned cart
 * Supports optional coupon code
 */

import { Section, Text, Row, Column } from "@react-email/components";
import { Layout } from "../components/Layout";
import { Greeting, Paragraph, Button, Divider } from "../components/shared";
import { theme } from "../styles/theme";
import { formatCurrency } from "../utils/mask";

interface CartItem {
  name: string;
  price: number;
  quantity: number;
}

interface Coupon {
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount?: number;
  expiryDate?: string;
}

interface CartReminderEmailProps {
  name?: string;
  items: CartItem[];
  total: number;
  coupon?: Coupon;
}

export const CartReminderEmail = ({
  name,
  items,
  total,
  coupon,
}: CartReminderEmailProps) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fusionmarkt.com";

  // Calculate discount if coupon exists
  const getDiscountText = () => {
    if (!coupon) return null;
    if (coupon.discountType === "PERCENTAGE") {
      return `%${coupon.discountValue} indirim`;
    }
    return `${formatCurrency(coupon.discountValue)} indirim`;
  };

  return (
    <Layout preview={coupon ? `Sepetiniz için özel indirim kodu: ${coupon.code}` : "Sepetinizde ürünler bekliyor"}>
      <Greeting name={name} />

      <Text
        style={{
          color: theme.colors.text,
          fontSize: theme.fontSizes.lg,
          fontWeight: theme.fontWeights.semibold,
          textAlign: "center" as const,
          margin: `${theme.spacing[4]} 0`,
        }}
      >
        Sepetinizde ürünler bekliyor
      </Text>

      <Paragraph>
        Sepetinize eklediğiniz ürünler hâlâ sizi bekliyor. 
        Alışverişi tamamlamak ister misiniz?
      </Paragraph>

      {/* Coupon Section - Only if coupon exists */}
      {coupon && (
        <Section
          style={{
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            border: `2px dashed ${theme.colors.primary}`,
            borderRadius: theme.radius.lg,
            padding: theme.spacing[5],
            marginBottom: theme.spacing[4],
            textAlign: "center" as const,
          }}
        >
          <Text
            style={{
              color: theme.colors.primary,
              fontSize: theme.fontSizes.xs,
              fontWeight: theme.fontWeights.semibold,
              textTransform: "uppercase" as const,
              letterSpacing: "1px",
              margin: 0,
              marginBottom: theme.spacing[2],
            }}
          >
            Size özel indirim kodu
          </Text>

          <Text
            style={{
              color: theme.colors.text,
              fontSize: theme.fontSizes.xl,
              fontWeight: theme.fontWeights.bold,
              fontFamily: theme.fonts.mono,
              letterSpacing: "2px",
              margin: 0,
              marginBottom: theme.spacing[2],
              padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
              backgroundColor: theme.colors.bgDark,
              borderRadius: theme.radius.md,
              display: "inline-block",
            }}
          >
            {coupon.code}
          </Text>

          <Text
            style={{
              color: theme.colors.primary,
              fontSize: theme.fontSizes.md,
              fontWeight: theme.fontWeights.semibold,
              margin: 0,
              marginTop: theme.spacing[2],
            }}
          >
            {getDiscountText()}
          </Text>

          {coupon.minOrderAmount && coupon.minOrderAmount > 0 && (
            <Text
              style={{
                color: theme.colors.textFaded,
                fontSize: theme.fontSizes.xs,
                margin: 0,
                marginTop: theme.spacing[2],
              }}
            >
              Minimum sipariş tutarı: {formatCurrency(coupon.minOrderAmount)}
            </Text>
          )}

          {coupon.expiryDate && (
            <Text
              style={{
                color: theme.colors.textDim,
                fontSize: theme.fontSizes.xs,
                margin: 0,
                marginTop: theme.spacing[1],
              }}
            >
              Son geçerlilik: {coupon.expiryDate}
            </Text>
          )}
        </Section>
      )}

      {/* Cart Items */}
      <Section
        style={{
          backgroundColor: theme.colors.bgGlass,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.lg,
          padding: theme.spacing[4],
          marginBottom: theme.spacing[4],
        }}
      >
        {items.map((item, index) => (
          <Row key={index} style={{ marginBottom: theme.spacing[3] }}>
            <Column style={{ width: "70%" }}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: theme.fontSizes.sm,
                  margin: 0,
                }}
              >
                {item.name}
              </Text>
              <Text
                style={{
                  color: theme.colors.textFaded,
                  fontSize: theme.fontSizes.xs,
                  margin: 0,
                }}
              >
                Adet: {item.quantity}
              </Text>
            </Column>
            <Column style={{ width: "30%", textAlign: "right" as const }}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: theme.fontSizes.sm,
                  fontWeight: theme.fontWeights.medium,
                  margin: 0,
                }}
              >
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </Column>
          </Row>
        ))}

        <Section
          style={{
            borderTop: `1px solid ${theme.colors.border}`,
            paddingTop: theme.spacing[3],
            marginTop: theme.spacing[3],
          }}
        >
          <Row>
            <Column>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: theme.fontSizes.md,
                  fontWeight: theme.fontWeights.semibold,
                  margin: 0,
                }}
              >
                Sepet Toplamı
              </Text>
            </Column>
            <Column style={{ textAlign: "right" as const }}>
              <Text
                style={{
                  color: theme.colors.primary,
                  fontSize: theme.fontSizes.lg,
                  fontWeight: theme.fontWeights.bold,
                  margin: 0,
                }}
              >
                {formatCurrency(total)}
              </Text>
            </Column>
          </Row>
        </Section>
      </Section>

      <Button href={`${siteUrl}/checkout`}>
        {coupon ? "İndirimli Alışverişi Tamamla" : "Alışverişi Tamamla"}
      </Button>

      <Divider />

      <Paragraph muted>
        Stok durumu değişebilir. En kısa sürede siparişinizi tamamlamanızı öneririz.
      </Paragraph>
    </Layout>
  );
};

export default CartReminderEmail;
