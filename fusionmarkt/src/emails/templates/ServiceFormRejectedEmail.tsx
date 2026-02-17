/**
 * Service Form Rejected Email
 * Sent when admin rejects a service form request
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

interface ServiceFormRejectedEmailProps {
  name?: string;
  invoiceNo: string;
  platform: string;
  reason?: string;
}

export const ServiceFormRejectedEmail = ({
  name,
  invoiceNo,
  platform,
  reason,
}: ServiceFormRejectedEmailProps) => {
  return (
    <Layout preview="Servis Talebiniz Reddedildi">
      <Greeting name={name} />

      <StatusBadge label="Servis Talebi Reddedildi" status="error" />

      <Paragraph>
        <strong>{platform}</strong> platformundan satın aldığınız ürüne ait{" "}
        <strong>{invoiceNo}</strong> fatura numaralı servis talebiniz reddedilmiştir.
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
        Sorularınız veya itirazınız için bizimle iletişime geçebilirsiniz.
      </Paragraph>

      <Button href="https://fusionmarkt.com/iletisim">İletişime Geç</Button>

      <Paragraph muted>
        Sorularınız için info@fusionmarkt.com adresinden bize ulaşabilirsiniz.
      </Paragraph>
    </Layout>
  );
};

export default ServiceFormRejectedEmail;
