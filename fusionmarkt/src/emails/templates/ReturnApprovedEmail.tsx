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
  adminNote?: string;
}

export const ReturnApprovedEmail = ({
  orderNumber,
  name,
  total,
  returnAddress,
  returnInstructions,
  adminNote,
}: ReturnApprovedEmailProps) => {
  return (
    <Layout preview={`İade Onaylandı - ${orderNumber}`}>
      <Greeting name={name} />

      <StatusBadge label="İade Onaylandı" status="success" />

      <Paragraph>
        <strong>#{orderNumber}</strong> numaralı siparişinizin iade talebi onaylandı.
      </Paragraph>

      <InfoCard label="İade Tutarı" value={total} />

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
