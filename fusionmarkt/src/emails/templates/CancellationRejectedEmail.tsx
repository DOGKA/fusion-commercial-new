/**
 * Cancellation Rejected Email
 * Sent when admin rejects a cancellation request
 */

import { Layout } from "../components/Layout";
import {
  Greeting,
  Paragraph,
  InfoCard,
  StatusBadge,
  Button,
} from "../components/shared";

interface CancellationRejectedEmailProps {
  orderNumber: string;
  name?: string;
  reason?: string;
}

export const CancellationRejectedEmail = ({
  orderNumber,
  name,
  reason,
}: CancellationRejectedEmailProps) => {
  return (
    <Layout preview={`İptal Reddedildi - ${orderNumber}`}>
      <Greeting name={name} />

      <StatusBadge label="İptal Reddedildi" status="error" />

      <Paragraph>
        <strong>#{orderNumber}</strong> numaralı siparişinizin iptal talebi reddedildi.
      </Paragraph>

      {reason && (
        <div style={{ 
          padding: "16px", 
          backgroundColor: "#fef2f2", 
          borderRadius: "8px", 
          marginBottom: "24px",
          borderLeft: "4px solid #ef4444"
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: "12px", 
            color: "#991b1b", 
            marginBottom: "4px",
            fontWeight: "600"
          }}>
            Ret Sebebi:
          </p>
          <p style={{ margin: 0, fontSize: "14px", color: "#7f1d1d" }}>
            {reason}
          </p>
        </div>
      )}

      <Paragraph>
        Siparişiniz planlandığı şekilde devam edecektir. Sorularınız için bizimle iletişime geçebilirsiniz.
      </Paragraph>

      <Button href="https://fusionmarkt.com/hesabim">Siparişimi Görüntüle</Button>

      <Paragraph muted>
        Sorularınız için info@fusionmarkt.com adresinden bize ulaşabilirsiniz.
      </Paragraph>
    </Layout>
  );
};

export default CancellationRejectedEmail;
