/**
 * Cart Reminder Email
 * Sent to remind users about abandoned cart
 * 100% table-based for email client compatibility
 */

import { Layout } from "../components/Layout";
import { Greeting, Paragraph, Button, GlassPanel } from "../components/shared";
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

      <p
        style={{
          color: theme.colors.text,
          fontSize: theme.fontSizes.lg,
          fontWeight: theme.fontWeights.semibold,
          textAlign: "center" as const,
          margin: `${theme.spacing[4]} 0`,
          fontFamily: theme.fonts.sans,
        }}
      >
        Sepetinizde ürünler bekliyor
      </p>

      <Paragraph>
        Sepetinize eklediğiniz ürünler hâlâ sizi bekliyor. 
        Alışverişi tamamlamak ister misiniz?
      </Paragraph>

      {/* Coupon Section - Only if coupon exists */}
      {coupon && (
        <table
          cellPadding="0"
          cellSpacing="0"
          border={0}
          width="100%"
          style={{
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            border: `2px dashed ${theme.colors.primary}`,
            borderRadius: theme.radius.lg,
            marginBottom: theme.spacing[4],
          }}
        >
          <tbody>
            <tr>
              <td style={{ padding: theme.spacing[5], textAlign: "center" }}>
                <p
                  style={{
                    color: theme.colors.primary,
                    fontSize: theme.fontSizes.xs,
                    fontWeight: theme.fontWeights.semibold,
                    textTransform: "uppercase" as const,
                    letterSpacing: "1px",
                    margin: 0,
                    marginBottom: theme.spacing[2],
                    fontFamily: theme.fonts.sans,
                  }}
                >
                  Size özel indirim kodu
                </p>

                <p
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
                </p>

                <p
                  style={{
                    color: theme.colors.primary,
                    fontSize: theme.fontSizes.md,
                    fontWeight: theme.fontWeights.semibold,
                    margin: 0,
                    marginTop: theme.spacing[2],
                    fontFamily: theme.fonts.sans,
                  }}
                >
                  {getDiscountText()}
                </p>

                {coupon.minOrderAmount && coupon.minOrderAmount > 0 && (
                  <p
                    style={{
                      color: theme.colors.textFaded,
                      fontSize: theme.fontSizes.xs,
                      margin: 0,
                      marginTop: theme.spacing[2],
                      fontFamily: theme.fonts.sans,
                    }}
                  >
                    Minimum sipariş tutarı: {formatCurrency(coupon.minOrderAmount)}
                  </p>
                )}

                {coupon.expiryDate && (
                  <p
                    style={{
                      color: theme.colors.textDim,
                      fontSize: theme.fontSizes.xs,
                      margin: 0,
                      marginTop: theme.spacing[1],
                      fontFamily: theme.fonts.sans,
                    }}
                  >
                    Son geçerlilik: {coupon.expiryDate}
                  </p>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {/* Cart Items */}
      <GlassPanel>
        {items.map((item, index) => (
          <table key={index} cellPadding="0" cellSpacing="0" border={0} width="100%" style={{ marginBottom: theme.spacing[3] }}>
            <tbody>
              <tr>
                <td style={{ width: "70%", verticalAlign: "top" }}>
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
                  <p
                    style={{
                      color: theme.colors.textFaded,
                      fontSize: theme.fontSizes.xs,
                      margin: 0,
                      fontFamily: theme.fonts.sans,
                    }}
                  >
                    Adet: {item.quantity}
                  </p>
                </td>
                <td style={{ width: "30%", textAlign: "right", verticalAlign: "top" }}>
                  <p
                    style={{
                      color: theme.colors.text,
                      fontSize: theme.fontSizes.sm,
                      fontWeight: theme.fontWeights.medium,
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

        {/* Divider */}
        <table cellPadding="0" cellSpacing="0" border={0} width="100%" style={{ margin: `${theme.spacing[3]} 0` }}>
          <tbody>
            <tr>
              <td style={{ borderTop: `1px solid ${theme.colors.border}`, paddingTop: theme.spacing[3] }}></td>
            </tr>
          </tbody>
        </table>

        <table cellPadding="0" cellSpacing="0" border={0} width="100%">
          <tbody>
            <tr>
              <td>
                <p
                  style={{
                    color: theme.colors.text,
                    fontSize: theme.fontSizes.md,
                    fontWeight: theme.fontWeights.semibold,
                    margin: 0,
                    fontFamily: theme.fonts.sans,
                  }}
                >
                  Sepet Toplamı
                </p>
              </td>
              <td style={{ textAlign: "right" }}>
                <p
                  style={{
                    color: theme.colors.primary,
                    fontSize: theme.fontSizes.lg,
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

      <Button href={`${siteUrl}/checkout`}>
        {coupon ? "İndirimli Alışverişi Tamamla" : "Alışverişi Tamamla"}
      </Button>

      <Paragraph muted>
        Stok durumu değişebilir. En kısa sürede siparişinizi tamamlamanızı öneririz.
      </Paragraph>
    </Layout>
  );
};

export default CartReminderEmail;
