/**
 * Review Reminder Email
 * Sent to remind users to leave a review after product delivery
 * Single unified style - matches OrderConfirmationEmail
 */

import { Link, Img } from "@react-email/components";
import { Layout } from "../components/Layout";
import { theme } from "../styles/theme";
import { maskName, formatDateTime } from "../utils/mask";

interface ProductItem {
  id: string;
  name: string;
  thumbnail?: string;
  slug: string;
}

interface ReviewReminderEmailProps {
  name?: string;
  products: ProductItem[];
  orderNumber: string;
  deliveryDate: Date | string;
}

export const ReviewReminderEmail = ({
  name,
  products,
  orderNumber,
  deliveryDate,
}: ReviewReminderEmailProps) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fusionmarkt.com";
  const maskedName = name ? maskName(name) : undefined;

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
    <Layout preview={`Siparişinizi değerlendirin - ${orderNumber}`}>
      <div style={{ fontFamily: theme.fonts.sans }}>
        {/* Greeting + Message */}
        <p style={{ ...textStyle, marginTop: 0, marginBottom: "16px" }}>
          Merhaba{maskedName ? <strong style={{ color: theme.colors.text }}> {maskedName}</strong> : ""},
        </p>
        <p style={{ ...textStyle, marginTop: 0, marginBottom: "20px" }}>
          <strong>#{orderNumber}</strong> numaralı siparişiniz{" "}
          <strong>{formatDateTime(deliveryDate)}</strong> tarihinde teslim edildi.
          Deneyiminizi diğer müşterilerimizle paylaşır mısınız?
        </p>

        {/* Star Rating Badge - centered */}
        <p style={{ textAlign: "center", margin: "0 0 24px 0" }}>
          <span style={{
            display: "inline-block",
            backgroundColor: "#fef3c7",
            color: "#b45309",
            fontSize: "24px",
            padding: "12px 24px",
            borderRadius: "12px",
            fontFamily: theme.fonts.sans,
          }}>
            ⭐⭐⭐⭐⭐
          </span>
        </p>

        {/* Review Message Box */}
        <div style={{
          backgroundColor: theme.colors.bgGlass,
          border: `1px solid ${theme.colors.borderAccent}`,
          borderRadius: "12px",
          padding: "20px",
          textAlign: "center",
          marginBottom: "24px",
        }}>
          <span style={{ 
            color: theme.colors.text, 
            fontSize: "16px", 
            fontWeight: "600",
            display: "block",
            marginBottom: "8px",
            fontFamily: theme.fonts.sans,
          }}>
            Değerlendirmeniz Bizim İçin Önemli
          </span>
          <span style={{ 
            color: theme.colors.textMuted, 
            fontSize: "13px",
            fontFamily: theme.fonts.sans,
          }}>
            Yorumlarınız diğer müşterilerin doğru kararlar vermesine yardımcı olur
          </span>
        </div>

        {/* Products Label */}
        <p style={{ ...labelStyle, margin: "0 0 12px 0" }}>Değerlendirmenizi Bekleyen Ürünler</p>

        {/* Product Items */}
        {products.map((product, index) => (
          <div 
            key={product.id} 
            style={{ 
              marginBottom: "16px",
              paddingBottom: index < products.length - 1 ? "16px" : "0",
              borderBottom: index < products.length - 1 ? `1px solid ${theme.colors.border}` : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              {/* Product Thumbnail */}
              {product.thumbnail && (
                <Img
                  src={product.thumbnail}
                  alt={product.name}
                  width={60}
                  height={60}
                  style={{
                    borderRadius: "8px",
                    objectFit: "cover",
                    marginRight: "12px",
                  }}
                />
              )}
              
              {/* Product Info */}
              <div style={{ flex: 1 }}>
                <span style={{ 
                  color: theme.colors.text, 
                  fontSize: "14px", 
                  fontWeight: "500",
                  display: "block",
                  marginBottom: "6px",
                  fontFamily: theme.fonts.sans,
                }}>
                  {product.name}
                </span>
                <Link
                  href={`${siteUrl}/urun/${product.slug}#yorumlar`}
                  style={{ 
                    color: theme.colors.primary, 
                    fontSize: "13px", 
                    fontWeight: "600",
                    textDecoration: "none",
                    fontFamily: theme.fonts.sans,
                  }}
                >
                  Yorum Yaz →
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Tip Box */}
        <div style={{
          backgroundColor: "#ecfdf5",
          borderRadius: "12px",
          padding: "16px",
          marginTop: "24px",
          marginBottom: "24px",
        }}>
          <span style={{ 
            color: theme.colors.primary, 
            fontSize: "14px", 
            marginRight: "8px" 
          }}>
            💡
          </span>
          <span style={{ 
            color: theme.colors.text, 
            fontSize: "13px",
            fontFamily: theme.fonts.sans,
          }}>
            <strong>İpucu:</strong> Fotoğraf ekleyerek deneyiminizi daha iyi anlatabilirsiniz!
          </span>
        </div>

        {/* CTA Button */}
        <p style={{ textAlign: "center", margin: "0 0 24px 0" }}>
          <a
            href={`${siteUrl}/hesabim/siparislerim`}
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
            Siparişlerimi Görüntüle
          </a>
        </p>

        {/* Footer Note */}
        <p style={{ ...smallTextStyle, textAlign: "center", margin: "0" }}>
          Herhangi bir sorunuz varsa, müşteri hizmetlerimize her zaman ulaşabilirsiniz.
        </p>
      </div>
    </Layout>
  );
};

export default ReviewReminderEmail;
