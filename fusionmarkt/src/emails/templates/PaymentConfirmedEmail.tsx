/**
 * Payment Confirmed Email
 * Sent when bank transfer payment is confirmed
 */

import { Layout } from "../components/Layout";
import {
  Greeting,
  Paragraph,
  InfoCard,
  StatusBadge,
  Button,
  Divider,
} from "../components/shared";
import { formatCurrency } from "../utils/mask";

interface PaymentConfirmedEmailProps {
  orderNumber: string;
  name?: string;
  total: number;
}

export const PaymentConfirmedEmail = ({
  orderNumber,
  name,
  total,
}: PaymentConfirmedEmailProps) => {
  return (
    <Layout preview={`Ödemeniz onaylandı - ${orderNumber}`}>
      <Greeting name={name} />

      <Paragraph>
        Ödemeniz başarıyla onaylandı. Siparişiniz hazırlanmaya başlandı.
      </Paragraph>

      <StatusBadge label="Ödeme Onaylandı" status="success" />

      <InfoCard label="Sipariş Numarası" value={orderNumber} mono />

      <InfoCard label="Ödenen Tutar" value={formatCurrency(total)} accent />

      <Button href="https://fusionmarkt.com/hesabim">Siparişimi Görüntüle</Button>

      <Divider />

      <Paragraph muted>
        Siparişiniz hazırlanıyor. Kargoya verildiğinde bilgilendirileceksiniz.
      </Paragraph>
    </Layout>
  );
};

export default PaymentConfirmedEmail;
