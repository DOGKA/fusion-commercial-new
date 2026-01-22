/**
 * Return Approved Email
 * Sent when admin approves a return request
 * Includes return address and shipping instructions
 */

import { Layout } from "../components/Layout";
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

      {/* Return Address */}
      <div style={{ 
        padding: "20px", 
        backgroundColor: "#f0fdf4", 
        borderRadius: "8px", 
        marginBottom: "24px",
        border: "1px solid #86efac"
      }}>
        <p style={{ 
          margin: 0, 
          fontSize: "12px", 
          color: "#166534", 
          marginBottom: "8px",
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}>
          İade Adresi
        </p>
        <p style={{ 
          margin: 0, 
          fontSize: "14px", 
          color: "#14532d",
          whiteSpace: "pre-line",
          lineHeight: "1.6"
        }}>
          {returnAddress}
        </p>
      </div>

      {/* Important Instructions */}
      <div style={{ 
        padding: "20px", 
        backgroundColor: "#fffbeb", 
        borderRadius: "8px", 
        marginBottom: "24px",
        border: "1px solid #fde68a"
      }}>
        <p style={{ 
          margin: 0, 
          fontSize: "14px", 
          color: "#92400e", 
          marginBottom: "12px",
          fontWeight: "600"
        }}>
          Önemli Bilgiler
        </p>
        <ul style={{ 
          margin: 0, 
          padding: "0 0 0 20px", 
          color: "#78350f",
          fontSize: "14px",
          lineHeight: "1.8"
        }}>
          <li>Kargo ücreti alıcı ödemeli olarak gönderilmelidir</li>
          <li>Ürünü orijinal kutusunda gönderin</li>
          <li>Faturanızı kutuya koyun</li>
        </ul>
        {returnInstructions && (
          <p style={{ 
            margin: "12px 0 0 0", 
            fontSize: "14px", 
            color: "#78350f",
            paddingTop: "12px",
            borderTop: "1px solid #fde68a"
          }}>
            {returnInstructions}
          </p>
        )}
      </div>

      {adminNote && (
        <div style={{ 
          padding: "16px", 
          backgroundColor: "#f3f4f6", 
          borderRadius: "8px", 
          marginBottom: "24px" 
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: "12px", 
            color: "#6b7280", 
            marginBottom: "4px" 
          }}>
            Ek Not:
          </p>
          <p style={{ margin: 0, fontSize: "14px", color: "#374151" }}>
            {adminNote}
          </p>
        </div>
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
