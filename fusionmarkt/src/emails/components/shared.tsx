/**
 * Shared Email Components
 * Reusable building blocks for all email templates
 */

import {
  Button as EmailButton,
  Column,
  Hr,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { theme, commonStyles } from "../styles/theme";

// ═══════════════════════════════════════════════════════════════════════════
// TYPOGRAPHY
// ═══════════════════════════════════════════════════════════════════════════

interface GreetingProps {
  name?: string;
}

export const Greeting = ({ name }: GreetingProps) => (
  <Text
    style={{
      ...commonStyles.text,
      marginBottom: theme.spacing[4],
    }}
  >
    Merhaba{name ? <strong style={{ color: theme.colors.text }}> {name}</strong> : ""},
  </Text>
);

interface ParagraphProps {
  children: React.ReactNode;
  muted?: boolean;
}

export const Paragraph = ({ children, muted }: ParagraphProps) => (
  <Text
    style={{
      color: muted ? theme.colors.textFaded : theme.colors.textMuted,
      fontSize: theme.fontSizes.md,
      lineHeight: theme.lineHeights.normal,
      margin: 0,
      marginBottom: theme.spacing[4],
    }}
  >
    {children}
  </Text>
);

export const SmallText = ({ children }: { children: React.ReactNode }) => (
  <Text
    style={{
      ...commonStyles.textSmall,
      marginTop: theme.spacing[4],
      textAlign: "center" as const,
    }}
  >
    {children}
  </Text>
);

// ═══════════════════════════════════════════════════════════════════════════
// BUTTONS
// ═══════════════════════════════════════════════════════════════════════════

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export const Button = ({ href, children, variant = "primary" }: ButtonProps) => (
  <Section style={{ textAlign: "center", margin: `${theme.spacing[6]} 0` }}>
    <EmailButton
      href={href}
      style={variant === "primary" ? commonStyles.button : commonStyles.buttonSecondary}
    >
      {children}
    </EmailButton>
  </Section>
);

// ═══════════════════════════════════════════════════════════════════════════
// CARDS & PANELS
// ═══════════════════════════════════════════════════════════════════════════

interface InfoCardProps {
  label: string;
  value: string;
  mono?: boolean;
  accent?: boolean;
}

export const InfoCard = ({ label, value, mono, accent }: InfoCardProps) => (
  <Section
    style={{
      ...commonStyles.glassPanel,
      padding: theme.spacing[5],
      marginBottom: theme.spacing[4],
      textAlign: "center" as const,
      borderColor: accent ? theme.colors.borderAccent : theme.colors.border,
    }}
  >
    <Text style={{ ...commonStyles.label, marginBottom: theme.spacing[2] }}>
      {label}
    </Text>
    <Text
      style={{
        color: accent ? theme.colors.primary : theme.colors.text,
        fontSize: mono ? theme.fontSizes.xl : theme.fontSizes.lg,
        fontWeight: theme.fontWeights.semibold,
        fontFamily: mono ? theme.fonts.mono : theme.fonts.sans,
        letterSpacing: mono ? "2px" : "normal",
        margin: 0,
      }}
    >
      {value}
    </Text>
  </Section>
);

interface StatusBadgeProps {
  label: string;
  status: "success" | "warning" | "error" | "info" | "purple";
}

const statusColors = {
  success: { bg: "rgba(16, 185, 129, 0.12)", text: theme.colors.success },
  warning: { bg: "rgba(245, 158, 11, 0.12)", text: theme.colors.warning },
  error: { bg: "rgba(239, 68, 68, 0.12)", text: theme.colors.error },
  info: { bg: "rgba(59, 130, 246, 0.12)", text: theme.colors.info },
  purple: { bg: "rgba(139, 92, 246, 0.12)", text: theme.colors.purple },
};

export const StatusBadge = ({ label, status }: StatusBadgeProps) => (
  <Section style={{ textAlign: "center", margin: `${theme.spacing[4]} 0` }}>
    <span
      style={{
        display: "inline-block",
        backgroundColor: statusColors[status].bg,
        color: statusColors[status].text,
        fontSize: theme.fontSizes.sm,
        fontWeight: theme.fontWeights.semibold,
        padding: `${theme.spacing[2]} ${theme.spacing[5]}`,
        borderRadius: theme.radius.full,
      }}
    >
      {label}
    </span>
  </Section>
);

// ═══════════════════════════════════════════════════════════════════════════
// ADDRESS DISPLAY
// ═══════════════════════════════════════════════════════════════════════════

interface AddressDisplayProps {
  title: string;
  name: string;
  address: string;
  city: string;
  district: string;
  postalCode?: string;
  phone?: string;
  masked?: boolean;
}

export const AddressDisplay = ({
  title,
  name,
  address,
  city,
  district,
  postalCode,
  phone,
}: AddressDisplayProps) => (
  <Section
    style={{
      ...commonStyles.glassPanel,
      padding: theme.spacing[4],
      marginBottom: theme.spacing[3],
    }}
  >
    <Text
      style={{
        ...commonStyles.label,
        marginBottom: theme.spacing[3],
        color: theme.colors.textFaded,
      }}
    >
      {title}
    </Text>
    <Text
      style={{
        color: theme.colors.text,
        fontSize: theme.fontSizes.base,
        fontWeight: theme.fontWeights.medium,
        margin: 0,
        marginBottom: theme.spacing[1],
      }}
    >
      {name}
    </Text>
    <Text
      style={{
        color: theme.colors.textMuted,
        fontSize: theme.fontSizes.sm,
        lineHeight: theme.lineHeights.relaxed,
        margin: 0,
      }}
    >
      {address}
      <br />
      {district}/{city}
      {postalCode && ` - ${postalCode}`}
      {phone && (
        <>
          <br />
          Tel: {phone}
        </>
      )}
    </Text>
  </Section>
);

// ═══════════════════════════════════════════════════════════════════════════
// ORDER ITEMS
// ═══════════════════════════════════════════════════════════════════════════

interface OrderItemProps {
  name: string;
  quantity: number;
  price: string;
}

export const OrderItem = ({ name, quantity, price }: OrderItemProps) => (
  <Row style={{ marginBottom: theme.spacing[3] }}>
    <Column style={{ width: "60%" }}>
      <Text
        style={{
          color: theme.colors.text,
          fontSize: theme.fontSizes.sm,
          margin: 0,
        }}
      >
        {name}
      </Text>
      <Text
        style={{
          color: theme.colors.textFaded,
          fontSize: theme.fontSizes.xs,
          margin: 0,
        }}
      >
        Adet: {quantity}
      </Text>
    </Column>
    <Column style={{ width: "40%", textAlign: "right" as const }}>
      <Text
        style={{
          color: theme.colors.text,
          fontSize: theme.fontSizes.sm,
          fontWeight: theme.fontWeights.medium,
          margin: 0,
        }}
      >
        {price}
      </Text>
    </Column>
  </Row>
);

interface OrderSummaryProps {
  subtotal: string;
  shipping: string;
  discount?: string;
  total: string;
}

export const OrderSummary = ({ subtotal, shipping, discount, total }: OrderSummaryProps) => (
  <Section
    style={{
      borderTop: `1px solid ${theme.colors.border}`,
      paddingTop: theme.spacing[4],
      marginTop: theme.spacing[4],
    }}
  >
    <Row style={{ marginBottom: theme.spacing[2] }}>
      <Column>
        <Text style={{ ...commonStyles.textSmall }}>Ara Toplam</Text>
      </Column>
      <Column style={{ textAlign: "right" as const }}>
        <Text style={{ ...commonStyles.textSmall }}>{subtotal}</Text>
      </Column>
    </Row>
    <Row style={{ marginBottom: theme.spacing[2] }}>
      <Column>
        <Text style={{ ...commonStyles.textSmall }}>Kargo</Text>
      </Column>
      <Column style={{ textAlign: "right" as const }}>
        <Text style={{ ...commonStyles.textSmall }}>{shipping}</Text>
      </Column>
    </Row>
    {discount && (
      <Row style={{ marginBottom: theme.spacing[2] }}>
        <Column>
          <Text style={{ ...commonStyles.textSmall, color: theme.colors.success }}>
            İndirim
          </Text>
        </Column>
        <Column style={{ textAlign: "right" as const }}>
          <Text style={{ ...commonStyles.textSmall, color: theme.colors.success }}>
            -{discount}
          </Text>
        </Column>
      </Row>
    )}
    <Hr style={{ borderColor: theme.colors.border, margin: `${theme.spacing[3]} 0` }} />
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
          Toplam
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
          {total}
        </Text>
      </Column>
    </Row>
  </Section>
);

// ═══════════════════════════════════════════════════════════════════════════
// TRACKING INFO
// ═══════════════════════════════════════════════════════════════════════════

interface TrackingInfoProps {
  trackingNumber: string;
  carrier?: string;
}

export const TrackingInfo = ({ trackingNumber, carrier }: TrackingInfoProps) => (
  <Section
    style={{
      backgroundColor: "rgba(139, 92, 246, 0.08)",
      border: `1px solid rgba(139, 92, 246, 0.2)`,
      borderRadius: theme.radius.lg,
      padding: theme.spacing[5],
      textAlign: "center" as const,
      marginBottom: theme.spacing[4],
    }}
  >
    <Text style={{ ...commonStyles.label, marginBottom: theme.spacing[2] }}>
      Kargo Takip Numarası
    </Text>
    <Text
      style={{
        color: theme.colors.purple,
        fontSize: theme.fontSizes.lg,
        fontWeight: theme.fontWeights.bold,
        fontFamily: theme.fonts.mono,
        letterSpacing: "2px",
        margin: 0,
      }}
    >
      {trackingNumber}
    </Text>
    {carrier && (
      <Text
        style={{
          color: theme.colors.textMuted,
          fontSize: theme.fontSizes.sm,
          marginTop: theme.spacing[3],
          marginBottom: 0,
        }}
      >
        Kargo: <strong>{carrier}</strong>
      </Text>
    )}
  </Section>
);

// ═══════════════════════════════════════════════════════════════════════════
// BANK INFO
// ═══════════════════════════════════════════════════════════════════════════

interface BankInfoProps {
  orderNumber: string;
}

export const BankInfo = ({ orderNumber }: BankInfoProps) => (
  <Section
    style={{
      backgroundColor: "rgba(245, 158, 11, 0.06)",
      border: `1px solid rgba(245, 158, 11, 0.2)`,
      borderRadius: theme.radius.lg,
      padding: theme.spacing[5],
      marginBottom: theme.spacing[4],
    }}
  >
    <Text
      style={{
        color: theme.colors.warning,
        fontSize: theme.fontSizes.base,
        fontWeight: theme.fontWeights.semibold,
        marginBottom: theme.spacing[4],
        marginTop: 0,
      }}
    >
      Havale / EFT Bilgileri
    </Text>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <tbody>
        <tr>
          <td
            style={{
              color: theme.colors.textFaded,
              fontSize: theme.fontSizes.sm,
              padding: `${theme.spacing[1]} 0`,
              width: "100px",
            }}
          >
            Banka
          </td>
          <td
            style={{
              color: theme.colors.text,
              fontSize: theme.fontSizes.sm,
              padding: `${theme.spacing[1]} 0`,
            }}
          >
            Ziraat Bankası
          </td>
        </tr>
        <tr>
          <td
            style={{
              color: theme.colors.textFaded,
              fontSize: theme.fontSizes.sm,
              padding: `${theme.spacing[1]} 0`,
            }}
          >
            Hesap Sahibi
          </td>
          <td
            style={{
              color: theme.colors.text,
              fontSize: theme.fontSizes.sm,
              padding: `${theme.spacing[1]} 0`,
            }}
          >
            FusionMarkt A.Ş.
          </td>
        </tr>
        <tr>
          <td
            style={{
              color: theme.colors.textFaded,
              fontSize: theme.fontSizes.sm,
              padding: `${theme.spacing[1]} 0`,
            }}
          >
            IBAN
          </td>
          <td
            style={{
              color: theme.colors.text,
              fontSize: theme.fontSizes.sm,
              fontFamily: theme.fonts.mono,
              padding: `${theme.spacing[1]} 0`,
            }}
          >
            TR00 0000 0000 0000 0000 0000 00
          </td>
        </tr>
      </tbody>
    </table>
    <Hr style={{ borderColor: "rgba(255, 255, 255, 0.08)", margin: `${theme.spacing[4]} 0` }} />
    <Text
      style={{
        color: theme.colors.textFaded,
        fontSize: theme.fontSizes.xs,
        textAlign: "center" as const,
        margin: 0,
      }}
    >
      Açıklama kısmına sipariş numaranızı yazınız:{" "}
      <strong style={{ color: theme.colors.warning }}>{orderNumber}</strong>
    </Text>
  </Section>
);

// ═══════════════════════════════════════════════════════════════════════════
// DIVIDER
// ═══════════════════════════════════════════════════════════════════════════

export const Divider = () => (
  <Hr
    style={{
      borderColor: theme.colors.border,
      margin: `${theme.spacing[6]} 0`,
    }}
  />
);
