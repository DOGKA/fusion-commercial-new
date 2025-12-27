/**
 * Order Confirmation Email
 * Sent when order is placed successfully
 * Includes: Order details, masked addresses, links to accepted agreements
 */

import { Section, Text, Column, Row, Link } from "@react-email/components";
import { Layout } from "../components/Layout";
import {
  Greeting,
  Paragraph,
  InfoCard,
  StatusBadge,
  AddressDisplay,
  OrderItem,
  OrderSummary,
  Button,
  Divider,
} from "../components/shared";
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
  // Mask sensitive data for KVKK compliance
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

  return (
    <Layout preview={`Siparişiniz alındı - ${orderNumber}`}>
      <Greeting name={customerName} />

      <Paragraph>
        Siparişiniz başarıyla alındı. Teşekkür ederiz.
      </Paragraph>

      <StatusBadge label="Sipariş Alındı" status="success" />

      <InfoCard label="Sipariş Numarası" value={orderNumber} mono accent />

      {/* Order Date */}
      <Section
        style={{
          backgroundColor: theme.colors.bgGlass,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.lg,
          padding: theme.spacing[3],
          marginBottom: theme.spacing[4],
          textAlign: "center" as const,
        }}
      >
        <Text style={{ color: theme.colors.textFaded, fontSize: theme.fontSizes.xs, margin: 0 }}>
          Sipariş Tarihi
        </Text>
        <Text
          style={{
            color: theme.colors.text,
            fontSize: theme.fontSizes.sm,
            margin: 0,
            marginTop: theme.spacing[1],
          }}
        >
          {formatDateTime(orderDate)}
        </Text>
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
            fontWeight: theme.fontWeights.medium,
            textTransform: "uppercase" as const,
            letterSpacing: "0.5px",
            margin: 0,
            marginBottom: theme.spacing[4],
          }}
        >
          Sipariş Detayları
        </Text>

        {items.map((item, index) => (
          <OrderItem
            key={index}
            name={item.name}
            quantity={item.quantity}
            price={formatCurrency(item.price * item.quantity)}
          />
        ))}

        <OrderSummary
          subtotal={formatCurrency(subtotal)}
          shipping={shipping === 0 ? "Ücretsiz" : formatCurrency(shipping)}
          discount={discount ? formatCurrency(discount) : undefined}
          total={formatCurrency(total)}
        />
      </Section>

      {/* Addresses - Masked for KVKK */}
      <Row style={{ marginBottom: theme.spacing[4] }}>
        <Column style={{ width: "50%", paddingRight: theme.spacing[2] }}>
          <AddressDisplay
            title="Teslimat Adresi"
            name={maskedShippingAddress.name}
            address={maskedShippingAddress.address}
            city={maskedShippingAddress.city}
            district={maskedShippingAddress.district}
            postalCode={maskedShippingAddress.postalCode}
            phone={maskedShippingAddress.phone}
            masked
          />
        </Column>
        <Column style={{ width: "50%", paddingLeft: theme.spacing[2] }}>
          <AddressDisplay
            title="Fatura Adresi"
            name={maskedBillingAddress.name}
            address={maskedBillingAddress.address}
            city={maskedBillingAddress.city}
            district={maskedBillingAddress.district}
            postalCode={maskedBillingAddress.postalCode}
            phone={maskedBillingAddress.phone}
            masked
          />
        </Column>
      </Row>

      {/* Payment Method Info */}
      <Section
        style={{
          backgroundColor: theme.colors.bgGlass,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.lg,
          padding: theme.spacing[4],
          marginBottom: theme.spacing[4],
          textAlign: "center" as const,
        }}
      >
        <Text style={{ color: theme.colors.textFaded, fontSize: theme.fontSizes.xs, margin: 0 }}>
          Ödeme Yöntemi
        </Text>
        <Text
          style={{
            color: theme.colors.text,
            fontSize: theme.fontSizes.base,
            fontWeight: theme.fontWeights.medium,
            margin: 0,
            marginTop: theme.spacing[1],
          }}
        >
          {paymentMethod === "CREDIT_CARD" ? "Kredi Kartı" : "Havale/EFT"}
        </Text>
      </Section>

      <Button href={`${siteUrl}/hesabim`}>Siparişimi Görüntüle</Button>

      <Divider />

      {/* Accepted Agreements Section */}
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
            fontWeight: theme.fontWeights.medium,
            textTransform: "uppercase" as const,
            letterSpacing: "0.5px",
            margin: 0,
            marginBottom: theme.spacing[3],
          }}
        >
          Kabul Edilen Sözleşmeler
        </Text>

        <Text
          style={{
            color: theme.colors.textDim,
            fontSize: theme.fontSizes.xs,
            margin: 0,
            marginBottom: theme.spacing[3],
            lineHeight: 1.5,
          }}
        >
          Bu sipariş ile aşağıdaki sözleşmeleri kabul ettiğinizi onayladınız.
          Sözleşmelerin tam metnine hesabınızdan veya aşağıdaki linklerden ulaşabilirsiniz.
        </Text>

        {/* Terms and Conditions */}
        <Section
          style={{
            backgroundColor: "rgba(16, 185, 129, 0.05)",
            border: `1px solid rgba(16, 185, 129, 0.2)`,
            borderRadius: theme.radius.md,
            padding: theme.spacing[3],
            marginBottom: theme.spacing[2],
          }}
        >
          <Row>
            <Column style={{ width: "24px", verticalAlign: "middle" }}>
              <Text style={{ color: theme.colors.primary, fontSize: "14px", margin: 0 }}>
                ✓
              </Text>
            </Column>
            <Column style={{ verticalAlign: "middle" }}>
              <Link
                href={`${siteUrl}/sozlesmeler/${orderNumber}?contract=terms`}
                style={{
                  color: theme.colors.text,
                  fontSize: theme.fontSizes.sm,
                  textDecoration: "none",
                }}
              >
                Kullanıcı Sözleşmesi ve Şartlar
              </Link>
            </Column>
            <Column style={{ width: "80px", textAlign: "right" as const, verticalAlign: "middle" }}>
              <Link
                href={`${siteUrl}/sozlesmeler/${orderNumber}?contract=terms`}
                style={{
                  color: theme.colors.primary,
                  fontSize: theme.fontSizes.xs,
                  textDecoration: "none",
                }}
              >
                Görüntüle →
              </Link>
            </Column>
          </Row>
        </Section>

        {/* Distance Sales Contract */}
        <Section
          style={{
            backgroundColor: "rgba(16, 185, 129, 0.05)",
            border: `1px solid rgba(16, 185, 129, 0.2)`,
            borderRadius: theme.radius.md,
            padding: theme.spacing[3],
          }}
        >
          <Row>
            <Column style={{ width: "24px", verticalAlign: "middle" }}>
              <Text style={{ color: theme.colors.primary, fontSize: "14px", margin: 0 }}>
                ✓
              </Text>
            </Column>
            <Column style={{ verticalAlign: "middle" }}>
              <Link
                href={`${siteUrl}/sozlesmeler/${orderNumber}?contract=distance`}
                style={{
                  color: theme.colors.text,
                  fontSize: theme.fontSizes.sm,
                  textDecoration: "none",
                }}
              >
                Mesafeli Satış Sözleşmesi
              </Link>
            </Column>
            <Column style={{ width: "80px", textAlign: "right" as const, verticalAlign: "middle" }}>
              <Link
                href={`${siteUrl}/sozlesmeler/${orderNumber}?contract=distance`}
                style={{
                  color: theme.colors.primary,
                  fontSize: theme.fontSizes.xs,
                  textDecoration: "none",
                }}
              >
                Görüntüle →
              </Link>
            </Column>
          </Row>
        </Section>

        <Text
          style={{
            color: theme.colors.textDim,
            fontSize: theme.fontSizes.xs,
            margin: 0,
            marginTop: theme.spacing[3],
            fontStyle: "italic",
          }}
        >
          Sipariş detaylarınızı ve kabul ettiğiniz sözleşmelerin tam metinlerini 
          hesabınızdaki sipariş sayfasından da görüntüleyebilirsiniz.
        </Text>
      </Section>
    </Layout>
  );
};

export default OrderConfirmationEmail;
