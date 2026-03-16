/**
 * Service Form Approved Email
 * Sent when admin approves a service form request
 * 100% table-based for Gmail compatibility
 */

import { Layout } from "../components/Layout";
import { theme } from "../styles/theme";
import {
  Greeting,
  Paragraph,
  StatusBadge,
  Button,
  GlassPanel,
} from "../components/shared";

interface ServiceFormApprovedEmailProps {
  name?: string;
  invoiceNo: string;
  platform: string;
  reason?: string;
}

export const ServiceFormApprovedEmail = ({
  name,
  invoiceNo,
  platform,
  reason,
}: ServiceFormApprovedEmailProps) => {
  return (
    <Layout preview="Servis Talebiniz Onaylandı">
      <Greeting name={name} />

      <StatusBadge label="Servis Talebi Onaylandı" status="success" />

      <Paragraph>
        <strong>{platform}</strong> platformundan satın aldığınız ürüne ait{" "}
        <strong>{invoiceNo}</strong> fatura numaralı servis talebiniz onaylanmıştır.
      </Paragraph>

      <GlassPanel>
        <table cellPadding="0" cellSpacing="0" border={0} width="100%">
          <tbody>
            <tr>
              <td style={{ padding: "4px 0" }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: theme.fontSizes.xs,
                    color: theme.colors.textFaded,
                    fontFamily: theme.fonts.sans,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.5px",
                    marginBottom: "4px",
                  }}
                >
                  Fatura No
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: theme.fontSizes.base,
                    color: theme.colors.text,
                    fontWeight: theme.fontWeights.medium,
                    fontFamily: theme.fonts.sans,
                  }}
                >
                  {invoiceNo}
                </p>
              </td>
            </tr>
            <tr>
              <td style={{ padding: "12px 0 4px 0" }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: theme.fontSizes.xs,
                    color: theme.colors.textFaded,
                    fontFamily: theme.fonts.sans,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.5px",
                    marginBottom: "4px",
                  }}
                >
                  Platform
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: theme.fontSizes.base,
                    color: theme.colors.text,
                    fontWeight: theme.fontWeights.medium,
                    fontFamily: theme.fonts.sans,
                  }}
                >
                  {platform}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </GlassPanel>

      {reason && (
        <table
          cellPadding="0"
          cellSpacing="0"
          border={0}
          width="100%"
          style={{
            backgroundColor: "#d1fae5",
            borderRadius: "8px",
            borderLeft: "4px solid #10b981",
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
                    color: "#047857",
                    marginBottom: "4px",
                    fontWeight: 600,
                    fontFamily: theme.fonts.sans,
                  }}
                >
                  Açıklama:
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: "#065f46",
                    fontFamily: theme.fonts.sans,
                    whiteSpace: "pre-wrap" as const,
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
        Servis süreciniz hakkında detaylı bilgi için bizimle iletişime geçebilirsiniz.
      </Paragraph>

      <Button href="https://fusionmarkt.com/iletisim">İletişime Geç</Button>

      <Paragraph muted>
        Sorularınız için info@fusionmarkt.com adresinden bize ulaşabilirsiniz.
      </Paragraph>
    </Layout>
  );
};

export default ServiceFormApprovedEmail;
