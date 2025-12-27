/**
 * Order Status Update Email
 * Generic status update for various order states
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

type OrderStatus =
  | "CONFIRMED"
  | "PREPARING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

interface OrderStatusEmailProps {
  orderNumber: string;
  status: OrderStatus;
  name?: string;
  trackingNumber?: string;
  carrier?: string;
}

const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    badgeStatus: "success" | "warning" | "error" | "info" | "purple";
    message: string;
  }
> = {
  CONFIRMED: {
    label: "Sipariş Onaylandı",
    badgeStatus: "success",
    message: "Siparişiniz onaylandı ve hazırlanıyor.",
  },
  PREPARING: {
    label: "Hazırlanıyor",
    badgeStatus: "purple",
    message: "Siparişiniz paketleniyor ve kargoya verilmek üzere hazırlanıyor.",
  },
  SHIPPED: {
    label: "Kargoya Verildi",
    badgeStatus: "info",
    message: "Siparişiniz kargoya verildi.",
  },
  DELIVERED: {
    label: "Teslim Edildi",
    badgeStatus: "success",
    message: "Siparişiniz başarıyla teslim edildi. Alışverişiniz için teşekkür ederiz.",
  },
  CANCELLED: {
    label: "İptal Edildi",
    badgeStatus: "error",
    message: "Siparişiniz iptal edildi. Ödemeniz iade edilecektir.",
  },
  REFUNDED: {
    label: "İade Edildi",
    badgeStatus: "warning",
    message: "İade işleminiz tamamlandı. Tutar hesabınıza yatırılacaktır.",
  },
};

export const OrderStatusEmail = ({
  orderNumber,
  status,
  name,
  trackingNumber,
  carrier,
}: OrderStatusEmailProps) => {
  const config = statusConfig[status];

  return (
    <Layout preview={`${config.label} - ${orderNumber}`}>
      <Greeting name={name} />

      <Paragraph>
        Siparişinizin durumu güncellendi:
      </Paragraph>

      <StatusBadge label={config.label} status={config.badgeStatus} />

      <InfoCard label="Sipariş Numarası" value={orderNumber} mono />

      <Paragraph>{config.message}</Paragraph>

      {trackingNumber && (
        <TrackingInfo trackingNumber={trackingNumber} carrier={carrier} />
      )}

      <Button href="https://fusionmarkt.com/hesabim">Siparişimi Görüntüle</Button>

      <Divider />

      <Paragraph muted>
        Sorularınız için iletisim@fusionmarkt.com adresinden bize ulaşabilirsiniz.
      </Paragraph>
    </Layout>
  );
};

export default OrderStatusEmail;
