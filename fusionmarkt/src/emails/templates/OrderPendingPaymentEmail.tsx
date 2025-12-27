/**
 * Order Pending Payment Email
 * Sent when order is placed with bank transfer payment
 */

import { Layout } from "../components/Layout";
import {
  Greeting,
  Paragraph,
  InfoCard,
  StatusBadge,
  BankInfo,
  Button,
  Divider,
  SmallText,
} from "../components/shared";
import { formatCurrency } from "../utils/mask";

interface OrderPendingPaymentEmailProps {
  orderNumber: string;
  name?: string;
  total: number;
}

export const OrderPendingPaymentEmail = ({
  orderNumber,
  name,
  total,
}: OrderPendingPaymentEmailProps) => {
  return (
    <Layout preview={`Ödeme bekleniyor - ${orderNumber}`}>
      <Greeting name={name} />

      <Paragraph>
        Siparişiniz oluşturuldu. Havale/EFT ödemenizi bekliyoruz.
      </Paragraph>

      <StatusBadge label="Ödeme Bekleniyor" status="warning" />

      <InfoCard label="Sipariş Numarası" value={orderNumber} mono />

      <InfoCard label="Ödenecek Tutar" value={formatCurrency(total)} accent />

      <BankInfo orderNumber={orderNumber} />

      <Button href="https://fusionmarkt.com/hesabim">Siparişimi Görüntüle</Button>

      <SmallText>
        Ödemenizi yaptıktan sonra siparişiniz onaylanacaktır.
        Ödeme onay süreci 1-2 iş günü içerisinde tamamlanır.
      </SmallText>

      <Divider />

      <Paragraph muted>
        Sorularınız için iletisim@fusionmarkt.com adresinden bize ulaşabilirsiniz.
      </Paragraph>
    </Layout>
  );
};

export default OrderPendingPaymentEmail;
