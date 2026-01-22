/**
 * Return Rejected Email
 * Sent when admin rejects a return request
 * 100% table-based for Gmail compatibility
 */

import { Layout } from "../components/Layout";
import { theme } from "../styles/theme";
import {
  Greeting,
  Paragraph,
  StatusBadge,
  Button,
} from "../components/shared";

interface ReturnRejectedEmailProps {
  orderNumber: string;
  name?: string;
  reason?: string;
}

export const ReturnRejectedEmail = ({
  orderNumber,
  name,
  reason,
}: ReturnRejectedEmailProps) => {
  return (
    <Layout preview={`İade Reddedildi - ${orderNumber}`}>
      <Greeting name={name} />

      <StatusBadge label="İade Reddedildi" status="error" />

      <Paragraph>
        <strong>#{orderNumber}</strong> numaralı siparişinizin iade talebi reddedildi.
      </Paragraph>

      {reason && (
        <table
          cellPadding="0"
          cellSpacing="0"
          border={0}
          width="100%"
          style={{
            backgroundColor: "#fef2f2",
            borderRadius: "8px",
            borderLeft: "4px solid #ef4444",
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
                    color: "#991b1b",
                    marginBottom: "4px",
                    fontWeight: 600,
                    fontFamily: theme.fonts.sans,
                  }}
                >
                  Ret Sebebi:
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: "#7f1d1d",
                    fontFamily: theme.fonts.sans,
                  }}
                >
                  {reason}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      )}

      <Paragraph>
        İade talebiniz değerlendirildi ancak uygun bulunmadı. Detaylı bilgi için bizimle iletişime geçebilirsiniz.
      </Paragraph>

      <Button href="https://fusionmarkt.com/hesabim">Hesabımı Görüntüle</Button>

      <Paragraph muted>
        Sorularınız için info@fusionmarkt.com adresinden bize ulaşabilirsiniz.
      </Paragraph>
    </Layout>
  );
};

export default ReturnRejectedEmail;
