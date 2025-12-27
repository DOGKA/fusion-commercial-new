/**
 * Order Shipped Email
 * Sent when order is shipped with tracking info
 */

import { Layout } from "../components/Layout";
import {
  Greeting,
  Paragraph,
  InfoCard,
  StatusBadge,
  TrackingInfo,
  Button,
  Divider,
} from "../components/shared";

interface OrderShippedEmailProps {
  orderNumber: string;
  name?: string;
  trackingNumber: string;
  carrier: string;
}

export const OrderShippedEmail = ({
  orderNumber,
  name,
  trackingNumber,
  carrier,
}: OrderShippedEmailProps) => {
  return (
    <Layout preview={`Siparişiniz kargoya verildi - ${orderNumber}`}>
      <Greeting name={name} />

      <Paragraph>
        Siparişiniz kargoya verildi ve yola çıktı.
      </Paragraph>

      <StatusBadge label="Kargoya Verildi" status="info" />

      <InfoCard label="Sipariş Numarası" value={orderNumber} mono />

      <TrackingInfo trackingNumber={trackingNumber} carrier={carrier} />

      <Button href="https://fusionmarkt.com/hesabim">Kargomu Takip Et</Button>

      <Divider />

      <Paragraph muted>
        Kargo takip bilgileriniz güncellendikçe hesabım sayfanızdan 
        takip edebilirsiniz.
      </Paragraph>
    </Layout>
  );
};

export default OrderShippedEmail;
