/**
 * Shared Email Components
 * 100% table-based for maximum email client compatibility
 * Section kullanılmıyor - sadece table, tr, td
 */

import {
  Button as EmailButton,
} from "@react-email/components";
import { theme, commonStyles } from "../styles/theme";

// ═══════════════════════════════════════════════════════════════════════════
// TYPOGRAPHY
// ═══════════════════════════════════════════════════════════════════════════

interface GreetingProps {
  name?: string;
}

export const Greeting = ({ name }: GreetingProps) => (
  <p
    style={{
      ...commonStyles.text,
      marginBottom: theme.spacing[4],
      marginTop: 0,
    }}
  >
    Merhaba{name ? <strong style={{ color: theme.colors.text }}> {name}</strong> : ""},
  </p>
);

interface ParagraphProps {
  children: React.ReactNode;
  muted?: boolean;
}

export const Paragraph = ({ children, muted }: ParagraphProps) => (
  <p
    style={{
      color: muted ? theme.colors.textFaded : theme.colors.textMuted,
      fontSize: theme.fontSizes.md,
      lineHeight: theme.lineHeights.normal,
      margin: 0,
      marginBottom: theme.spacing[4],
      fontFamily: theme.fonts.sans,
    }}
  >
    {children}
  </p>
);

export const SmallText = ({ children }: { children: React.ReactNode }) => (
  <p
    style={{
      ...commonStyles.textSmall,
      marginTop: theme.spacing[4],
      marginBottom: 0,
      textAlign: "center" as const,
      fontFamily: theme.fonts.sans,
    }}
  >
    {children}
  </p>
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
  <table cellPadding="0" cellSpacing="0" border={0} width="100%" style={{ margin: `${theme.spacing[6]} 0` }}>
    <tbody>
      <tr>
        <td style={{ textAlign: "center" }}>
          <EmailButton
            href={href}
            style={variant === "primary" ? commonStyles.button : commonStyles.buttonSecondary}
          >
            {children}
          </EmailButton>
        </td>
      </tr>
    </tbody>
  </table>
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
  <table
    cellPadding="0"
    cellSpacing="0"
    border={0}
    width="100%"
    style={{
      backgroundColor: theme.colors.bgGlass,
      border: `1px solid ${accent ? theme.colors.borderAccent : theme.colors.border}`,
      borderRadius: theme.radius.lg,
      marginBottom: theme.spacing[4],
    }}
  >
    <tbody>
      <tr>
        <td style={{ padding: theme.spacing[5], textAlign: "center" }}>
          <p
            style={{
              ...commonStyles.label,
              marginBottom: theme.spacing[2],
              marginTop: 0,
            }}
          >
            {label}
          </p>
          <p
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
          </p>
        </td>
      </tr>
    </tbody>
  </table>
);

interface StatusBadgeProps {
  label: string;
  status: "success" | "warning" | "error" | "info" | "purple";
}

const statusColors = {
  success: { bg: "#d1fae5", text: "#047857" },  // Light emerald bg, dark emerald text
  warning: { bg: "#fef3c7", text: "#b45309" },  // Light amber bg, dark amber text
  error: { bg: "#fee2e2", text: "#b91c1c" },    // Light red bg, dark red text
  info: { bg: "#dbeafe", text: "#1d4ed8" },     // Light blue bg, dark blue text
  purple: { bg: "#ede9fe", text: "#6d28d9" },   // Light purple bg, dark purple text
};

export const StatusBadge = ({ label, status }: StatusBadgeProps) => (
  <table cellPadding="0" cellSpacing="0" border={0} width="100%" style={{ margin: `${theme.spacing[4]} 0` }}>
    <tbody>
      <tr>
        <td style={{ textAlign: "center" }}>
          <span
            style={{
              display: "inline-block",
              backgroundColor: statusColors[status].bg,
              color: statusColors[status].text,
              fontSize: theme.fontSizes.sm,
              fontWeight: theme.fontWeights.semibold,
              padding: `${theme.spacing[2]} ${theme.spacing[5]}`,
              borderRadius: theme.radius.full,
              fontFamily: theme.fonts.sans,
            }}
          >
            {label}
          </span>
        </td>
      </tr>
    </tbody>
  </table>
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
  <table
    cellPadding="0"
    cellSpacing="0"
    border={0}
    width="100%"
    style={{
      backgroundColor: theme.colors.bgGlass,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.radius.lg,
      marginBottom: theme.spacing[3],
    }}
  >
    <tbody>
      <tr>
        <td style={{ padding: theme.spacing[4] }}>
          <p
            style={{
              ...commonStyles.label,
              marginBottom: theme.spacing[3],
              marginTop: 0,
              color: theme.colors.textFaded,
            }}
          >
            {title}
          </p>
          <p
            style={{
              color: theme.colors.text,
              fontSize: theme.fontSizes.base,
              fontWeight: theme.fontWeights.medium,
              margin: 0,
              marginBottom: theme.spacing[1],
              fontFamily: theme.fonts.sans,
            }}
          >
            {name}
          </p>
          <p
            style={{
              color: theme.colors.textMuted,
              fontSize: theme.fontSizes.sm,
              lineHeight: theme.lineHeights.relaxed,
              margin: 0,
              fontFamily: theme.fonts.sans,
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
          </p>
        </td>
      </tr>
    </tbody>
  </table>
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
  <table cellPadding="0" cellSpacing="0" border={0} width="100%" style={{ marginBottom: theme.spacing[3] }}>
    <tbody>
      <tr>
        <td style={{ width: "60%", verticalAlign: "top" }}>
          <p
            style={{
              color: theme.colors.text,
              fontSize: theme.fontSizes.sm,
              margin: 0,
              fontFamily: theme.fonts.sans,
            }}
          >
            {name}
          </p>
          <p
            style={{
              color: theme.colors.textFaded,
              fontSize: theme.fontSizes.xs,
              margin: 0,
              fontFamily: theme.fonts.sans,
            }}
          >
            Adet: {quantity}
          </p>
        </td>
        <td style={{ width: "40%", textAlign: "right", verticalAlign: "top" }}>
          <p
            style={{
              color: theme.colors.text,
              fontSize: theme.fontSizes.sm,
              fontWeight: theme.fontWeights.medium,
              margin: 0,
              fontFamily: theme.fonts.sans,
            }}
          >
            {price}
          </p>
        </td>
      </tr>
    </tbody>
  </table>
);

interface OrderSummaryProps {
  subtotal: string;
  shipping: string;
  discount?: string;
  total: string;
}

export const OrderSummary = ({ subtotal, shipping, discount, total }: OrderSummaryProps) => (
  <table cellPadding="0" cellSpacing="0" border={0} width="100%" style={{ marginTop: theme.spacing[4] }}>
    <tbody>
      {/* Divider */}
      <tr>
        <td colSpan={2} style={{ borderTop: `1px solid ${theme.colors.border}`, paddingTop: theme.spacing[4] }}>
        </td>
      </tr>
      {/* Ara Toplam */}
      <tr>
        <td>
          <p style={{ ...commonStyles.textSmall, margin: 0, marginBottom: theme.spacing[2] }}>Ara Toplam</p>
        </td>
        <td style={{ textAlign: "right" }}>
          <p style={{ ...commonStyles.textSmall, margin: 0, marginBottom: theme.spacing[2] }}>{subtotal}</p>
        </td>
      </tr>
      {/* Kargo */}
      <tr>
        <td>
          <p style={{ ...commonStyles.textSmall, margin: 0, marginBottom: theme.spacing[2] }}>Kargo</p>
        </td>
        <td style={{ textAlign: "right" }}>
          <p style={{ ...commonStyles.textSmall, margin: 0, marginBottom: theme.spacing[2] }}>{shipping}</p>
        </td>
      </tr>
      {/* İndirim */}
      {discount && (
        <tr>
          <td>
            <p style={{ ...commonStyles.textSmall, margin: 0, marginBottom: theme.spacing[2], color: theme.colors.success }}>İndirim</p>
          </td>
          <td style={{ textAlign: "right" }}>
            <p style={{ ...commonStyles.textSmall, margin: 0, marginBottom: theme.spacing[2], color: theme.colors.success }}>-{discount}</p>
          </td>
        </tr>
      )}
      {/* Divider before total */}
      <tr>
        <td colSpan={2} style={{ borderTop: `1px solid ${theme.colors.border}`, paddingTop: theme.spacing[3] }}>
        </td>
      </tr>
      {/* Toplam */}
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
            Toplam
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
            {total}
          </p>
        </td>
      </tr>
    </tbody>
  </table>
);

// ═══════════════════════════════════════════════════════════════════════════
// TRACKING INFO
// ═══════════════════════════════════════════════════════════════════════════

interface TrackingInfoProps {
  trackingNumber: string;
  carrier?: string;
}

export const TrackingInfo = ({ trackingNumber, carrier }: TrackingInfoProps) => (
  <table
    cellPadding="0"
    cellSpacing="0"
    border={0}
    width="100%"
    style={{
      backgroundColor: "#ede9fe",
      border: "1px solid #c4b5fd",
      borderRadius: theme.radius.lg,
      marginBottom: theme.spacing[4],
    }}
  >
    <tbody>
      <tr>
        <td style={{ padding: theme.spacing[5], textAlign: "center" }}>
          <p style={{ ...commonStyles.label, marginBottom: theme.spacing[2], marginTop: 0 }}>
            Kargo Takip Numarası
          </p>
          <p
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
          </p>
          {carrier && (
            <p
              style={{
                color: theme.colors.textMuted,
                fontSize: theme.fontSizes.sm,
                marginTop: theme.spacing[3],
                marginBottom: 0,
                fontFamily: theme.fonts.sans,
              }}
            >
              Kargo: <strong>{carrier}</strong>
            </p>
          )}
        </td>
      </tr>
    </tbody>
  </table>
);

// ═══════════════════════════════════════════════════════════════════════════
// BANK INFO
// ═══════════════════════════════════════════════════════════════════════════

interface BankInfoProps {
  orderNumber: string;
}

export const BankInfo = ({ orderNumber }: BankInfoProps) => (
  <table
    cellPadding="0"
    cellSpacing="0"
    border={0}
    width="100%"
    style={{
      backgroundColor: "#fef3c7",
      border: "1px solid #fcd34d",
      borderRadius: theme.radius.lg,
      marginBottom: theme.spacing[4],
    }}
  >
    <tbody>
      <tr>
        <td style={{ padding: theme.spacing[5] }}>
          <p
            style={{
              color: theme.colors.warning,
              fontSize: theme.fontSizes.base,
              fontWeight: theme.fontWeights.semibold,
              marginBottom: theme.spacing[4],
              marginTop: 0,
              fontFamily: theme.fonts.sans,
            }}
          >
            Havale / EFT Bilgileri
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td
                  style={{
                    color: theme.colors.textFaded,
                    fontSize: theme.fontSizes.sm,
                    padding: `${theme.spacing[1]} 0`,
                    width: "100px",
                    fontFamily: theme.fonts.sans,
                  }}
                >
                  Banka
                </td>
                <td
                  style={{
                    color: theme.colors.text,
                    fontSize: theme.fontSizes.sm,
                    padding: `${theme.spacing[1]} 0`,
                    fontFamily: theme.fonts.sans,
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
                    fontFamily: theme.fonts.sans,
                  }}
                >
                  Hesap Sahibi
                </td>
                <td
                  style={{
                    color: theme.colors.text,
                    fontSize: theme.fontSizes.sm,
                    padding: `${theme.spacing[1]} 0`,
                    fontFamily: theme.fonts.sans,
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
                    fontFamily: theme.fonts.sans,
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
          {/* Divider */}
          <table cellPadding="0" cellSpacing="0" border={0} width="100%" style={{ margin: `${theme.spacing[4]} 0` }}>
            <tbody>
              <tr>
                <td style={{ borderTop: "1px solid #fcd34d", height: "1px" }}>&nbsp;</td>
              </tr>
            </tbody>
          </table>
          <p
            style={{
              color: theme.colors.textFaded,
              fontSize: theme.fontSizes.xs,
              textAlign: "center" as const,
              margin: 0,
              fontFamily: theme.fonts.sans,
            }}
          >
            Açıklama kısmına sipariş numaranızı yazınız:{" "}
            <strong style={{ color: theme.colors.warning }}>{orderNumber}</strong>
          </p>
        </td>
      </tr>
    </tbody>
  </table>
);

// ═══════════════════════════════════════════════════════════════════════════
// DIVIDER
// ═══════════════════════════════════════════════════════════════════════════

export const Divider = () => (
  <table cellPadding="0" cellSpacing="0" border={0} width="100%" style={{ margin: `${theme.spacing[6]} 0` }}>
    <tbody>
      <tr>
        <td
          style={{
            borderTop: `1px solid ${theme.colors.border}`,
            height: "1px",
            lineHeight: "1px",
            fontSize: "1px",
          }}
        >
          &nbsp;
        </td>
      </tr>
    </tbody>
  </table>
);

// ═══════════════════════════════════════════════════════════════════════════
// GLASS PANEL (for wrapping content sections)
// ═══════════════════════════════════════════════════════════════════════════

interface GlassPanelProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const GlassPanel = ({ children, style }: GlassPanelProps) => (
  <table
    cellPadding="0"
    cellSpacing="0"
    border={0}
    width="100%"
    style={{
      backgroundColor: theme.colors.bgGlass,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.radius.lg,
      marginBottom: theme.spacing[4],
      ...style,
    }}
  >
    <tbody>
      <tr>
        <td style={{ padding: theme.spacing[4] }}>
          {children}
        </td>
      </tr>
    </tbody>
  </table>
);
