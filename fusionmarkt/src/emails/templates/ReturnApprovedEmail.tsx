/**
 * Return Approved Email
 * Sent when admin approves a return request
 * Includes return address and shipping instructions
 * 100% table-based for Gmail compatibility
 */

import { Layout } from "../components/Layout";
import { theme } from "../styles/theme";
import {
  Greeting,
  Paragraph,
  InfoCard,
  StatusBadge,
  Button,
} from "../components/shared";

interface ReturnApprovedEmailProps {
  orderNumber: string;
  name?: string;
  total: string;
  returnAddress: string;
  returnInstructions?: string;
  /** Fiziksel gönderi beklenmeyen talep tiplerinde kod üretilmez. */
  returnCode?: string | null;
  adminNote?: string;
}

export const ReturnApprovedEmail = ({
  orderNumber,
  name,
  total,
  returnAddress,
  returnInstructions,
  returnCode,
  adminNote,
}: ReturnApprovedEmailProps) => {
  return (
    <Layout preview={`İade talebiniz onaylandı - ${orderNumber}`}>
      <Greeting name={name} />

      <StatusBadge label="İade Talebi Onaylandı" status="success" />

      <Paragraph>
        <strong>#{orderNumber}</strong> numaralı siparişinizin iade talebi onaylandı.
        Ürünü aşağıdaki adrese gönderebilirsiniz. Ödemeniz, ürün bize ulaşıp
        incelendikten sonra iade edilecek ve size ayrıca bilgi vereceğiz.
      </Paragraph>

      <InfoCard label="İade Edilecek Tutar" value={total} />

      {/* İade Kodu - kargoyu depoda eşleştirmek için zorunlu */}
      {returnCode && (
        <table
          cellPadding="0"
          cellSpacing="0"
          border={0}
          width="100%"
          style={{
            backgroundColor: "#ecfdf5",
            borderRadius: "8px",
            border: "2px solid #10b981",
            marginBottom: "24px",
          }}
        >
          <tbody>
            <tr>
              <td style={{ padding: "20px", textAlign: "center" }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "#047857",
                    marginBottom: "8px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontFamily: theme.fonts.sans,
                  }}
                >
                  İade Kodunuz
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "26px",
                    color: "#065f46",
                    fontWeight: 700,
                    letterSpacing: "2px",
                    fontFamily: "Courier New, Courier, monospace",
                  }}
                >
                  {returnCode}
                </p>
                <p
                  style={{
                    margin: "10px 0 0 0",
                    fontSize: "13px",
                    color: "#047857",
                    lineHeight: "1.6",
                    fontFamily: theme.fonts.sans,
                  }}
                >
                  Bu kodu kargo paketinin üzerine yazın ve kutunun içine bir not
                  olarak ekleyin. Kodu taşımayan gönderiler depomuzda
                  eşleştirilemediği için işleme alınamaz.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {/* Return Address - Table based */}
      <table
        cellPadding="0"
        cellSpacing="0"
        border={0}
        width="100%"
        style={{
          backgroundColor: "#f0fdf4",
          borderRadius: "8px",
          border: "1px solid #86efac",
          marginBottom: "24px",
        }}
      >
        <tbody>
          <tr>
            <td style={{ padding: "20px" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "#166534",
                  marginBottom: "8px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontFamily: theme.fonts.sans,
                }}
              >
                İade Adresi
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#14532d",
                  whiteSpace: "pre-line",
                  lineHeight: "1.6",
                  fontFamily: theme.fonts.sans,
                }}
              >
                {returnAddress}
              </p>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Important Instructions - Table based */}
      <table
        cellPadding="0"
        cellSpacing="0"
        border={0}
        width="100%"
        style={{
          backgroundColor: "#fffbeb",
          borderRadius: "8px",
          border: "1px solid #fde68a",
          marginBottom: "24px",
        }}
      >
        <tbody>
          <tr>
            <td style={{ padding: "20px" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#92400e",
                  marginBottom: "12px",
                  fontWeight: 600,
                  fontFamily: theme.fonts.sans,
                }}
              >
                Önemli Bilgiler
              </p>
              <table cellPadding="0" cellSpacing="0" border={0} width="100%">
                <tbody>
                  <tr>
                    <td style={{ paddingBottom: "6px" }}>
                      <span style={{ color: "#78350f", fontSize: "14px", fontFamily: theme.fonts.sans }}>
                        • Kargo ücreti alıcı ödemeli olarak gönderilmelidir
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: "6px" }}>
                      <span style={{ color: "#78350f", fontSize: "14px", fontFamily: theme.fonts.sans }}>
                        • Ürünü orijinal kutusunda gönderin
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: "6px" }}>
                      <span style={{ color: "#78350f", fontSize: "14px", fontFamily: theme.fonts.sans }}>
                        • Faturanızı kutuya koyun
                      </span>
                    </td>
                  </tr>
                  {returnCode && (
                    <tr>
                      <td style={{ paddingBottom: "6px" }}>
                        <span style={{ color: "#78350f", fontSize: "14px", fontFamily: theme.fonts.sans }}>
                          • İade kodunu ({returnCode}) paketin üzerine yazın
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {returnInstructions && (
                <p
                  style={{
                    margin: "12px 0 0 0",
                    fontSize: "14px",
                    color: "#78350f",
                    paddingTop: "12px",
                    borderTop: "1px solid #fde68a",
                    fontFamily: theme.fonts.sans,
                  }}
                >
                  {returnInstructions}
                </p>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {adminNote && (
        <table
          cellPadding="0"
          cellSpacing="0"
          border={0}
          width="100%"
          style={{
            backgroundColor: "#f3f4f6",
            borderRadius: "8px",
            marginBottom: "24px",
          }}
        >
          <tbody>
            <tr>
              <td style={{ padding: "16px" }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "#6b7280",
                    marginBottom: "4px",
                    fontFamily: theme.fonts.sans,
                  }}
                >
                  Ek Not:
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: "#374151",
                    fontFamily: theme.fonts.sans,
                  }}
                >
                  {adminNote}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      )}

      <Paragraph>
        Ürününüzü teslim aldığımızda iade işleminiz tamamlanacak ve ödemeniz iade edilecektir.
      </Paragraph>

      <Button href="https://fusionmarkt.com/hesabim">Hesabımı Görüntüle</Button>

      <Paragraph muted>
        Sorularınız için info@fusionmarkt.com adresinden bize ulaşabilirsiniz.
      </Paragraph>
    </Layout>
  );
};

export default ReturnApprovedEmail;
