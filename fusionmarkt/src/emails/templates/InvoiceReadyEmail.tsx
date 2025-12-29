/**
 * Invoice Ready Email
 * Sent when invoice is generated for an order
 */

import { Layout } from "../components/Layout";
import {
  Greeting,
  Paragraph,
  InfoCard,
  StatusBadge,
  Button,
} from "../components/shared";

interface InvoiceReadyEmailProps {
  orderNumber: string;
  name?: string;
}

export const InvoiceReadyEmail = ({
  orderNumber,
  name,
}: InvoiceReadyEmailProps) => {
  return (
    <Layout preview={`Faturanız hazır - ${orderNumber}`}>
      <Greeting name={name} />

      <Paragraph>
        #{orderNumber} numaralı siparişinizin faturası hazır.
      </Paragraph>

      <StatusBadge label="Fatura Hazır" status="success" />

      <InfoCard label="Sipariş Numarası" value={orderNumber} mono />

      <Button href="https://fusionmarkt.com/hesabim">Faturamı İndir</Button>

      <Paragraph muted>
        Faturanızı hesabım sayfasından indirebilirsiniz.
      </Paragraph>
    </Layout>
  );
};

export default InvoiceReadyEmail;
