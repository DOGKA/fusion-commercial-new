/**
 * Cancellation Approved Email
 * Sent when admin approves a cancellation request
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

interface CancellationApprovedEmailProps {
  orderNumber: string;
  name?: string;
  total: string;
  paymentMethod: "card" | "bank";
  adminNote?: string;
}

export const CancellationApprovedEmail = ({
  orderNumber,
  name,
  total,
  paymentMethod,
  adminNote,
}: CancellationApprovedEmailProps) => {
  const refundMessage =
    paymentMethod === "card"
      ? "Ödemeniz kredi kartınıza iade edilecektir. İade işlemi 3-5 iş günü içinde hesabınıza yansıyacaktır."
      : "Ödemeniz 3 iş günü içinde banka hesabınıza iade edilecektir.";

  return (
    <Layout preview={`İptal Onaylandı - ${orderNumber}`}>
      <Greeting name={name} />

      <StatusBadge label="İptal Onaylandı" status="success" />

      <Paragraph>
        <strong>#{orderNumber}</strong> numaralı siparişinizin iptal talebi onaylandı.
      </Paragraph>

      <InfoCard label="İade Tutarı" value={total} />

      <Paragraph>{refundMessage}</Paragraph>

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
                  Not:
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

      <Button href="https://fusionmarkt.com/hesabim">Hesabımı Görüntüle</Button>

      <Paragraph muted>
        Sorularınız için info@fusionmarkt.com adresinden bize ulaşabilirsiniz.
      </Paragraph>
    </Layout>
  );
};

export default CancellationApprovedEmail;
