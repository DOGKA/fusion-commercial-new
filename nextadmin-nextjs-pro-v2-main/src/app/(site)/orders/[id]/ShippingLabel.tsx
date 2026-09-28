"use client";

type LabelAddress = {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  title?: string;
  phone: string;
  city: string;
  district?: string;
  address?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
} | null;

type LabelItem = {
  id: string;
  quantity: number;
  variantInfo: string | null;
  product: {
    name: string;
    sku: string | null;
  } | null;
  bundle?: {
    name: string;
    sku: string | null;
  } | null;
};

type ShippingLabelOrder = {
  orderNumber: string;
  createdAt: string;
  trackingNumber: string | null;
  carrierName: string | null;
  user: {
    name: string | null;
    phone: string | null;
  } | null;
  items: LabelItem[];
  shippingAddress: LabelAddress;
};

function recipientName(address: LabelAddress, fallback?: string | null) {
  if (!address) return fallback || "-";
  return (
    address.fullName ||
    `${address.firstName || ""} ${address.lastName || ""}`.trim() ||
    address.title ||
    fallback ||
    "-"
  );
}

function formatStreet(address: LabelAddress) {
  if (!address) return "-";
  return [address.address || address.addressLine1, address.addressLine2]
    .filter(Boolean)
    .join(" ");
}

function formatCityLine(address: LabelAddress) {
  if (!address) return "";
  return [
    address.district,
    address.city,
    address.postalCode,
  ]
    .filter(Boolean)
    .join(" ");
}

function itemName(item: LabelItem) {
  return item.product?.name || item.bundle?.name || "Ürün";
}

function itemSku(item: LabelItem) {
  return item.product?.sku || item.bundle?.sku || null;
}

function variantLabel(variantInfo: string | null) {
  if (!variantInfo) return "";
  try {
    const parsed = JSON.parse(variantInfo);
    const variant = parsed?.variant || (parsed?.name ? parsed : null);
    if (variant?.name && variant?.value) return `${variant.name}: ${variant.value}`;
  } catch {
    return "";
  }
  return "";
}

export default function ShippingLabel({ order }: { order: ShippingLabelOrder }) {
  const address = order.shippingAddress;
  const name = recipientName(address, order.user?.name);
  const phone = address?.phone || order.user?.phone || "-";
  const orderDate = new Date(order.createdAt).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="shipping-label hidden print:block">
      <style>{`
        @media print {
          @page { size: A5 portrait; margin: 8mm; }
          html, body {
            background: #fff !important;
            color: #111 !important;
          }
          body * { visibility: hidden; }
          .shipping-label,
          .shipping-label * { visibility: visible; }
          .shipping-label {
            display: block !important;
            position: absolute;
            inset: 0;
            width: 100%;
            color: #111;
            font-family: Arial, Helvetica, sans-serif;
          }
        }
      `}</style>

      <div style={{ border: "2px solid #111", padding: "12px 14px", minHeight: "180mm" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #111", paddingBottom: 10, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo/logo.svg" alt="FusionMarkt" style={{ height: 36, width: "auto" }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 0.3 }}>FusionMarkt</div>
              <div style={{ fontSize: 11, color: "#444" }}>ASDTC Mühendislik Ticaret A.Ş.</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>KARGO ETİKETİ</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>#{order.orderNumber}</div>
            <div style={{ fontSize: 11 }}>{orderDate}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div style={{ border: "1px solid #111", padding: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, marginBottom: 6 }}>GÖNDEREN</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>FusionMarkt</div>
            <div style={{ fontSize: 11, lineHeight: 1.45 }}>
              Cezayir Caddesi No:6<br />
              Kat: -2 Depo<br />
              Çankaya / Ankara 06550<br />
              fusionmarkt.com
            </div>
          </div>

          <div style={{ border: "2px solid #111", padding: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, marginBottom: 6 }}>ALICI</div>
            <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.25, marginBottom: 6 }}>{name}</div>
            <div style={{ fontSize: 13, lineHeight: 1.45 }}>
              {formatStreet(address)}<br />
              {formatCityLine(address)}<br />
              Tel: {phone}
            </div>
          </div>
        </div>

        <div style={{ border: "1px solid #111", padding: 10, marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, marginBottom: 8 }}>ÜRÜN DETAYI</div>
          {order.items.map((item) => {
            const extra = variantLabel(item.variantInfo);
            const sku = itemSku(item);
            return (
              <div key={item.id} style={{ marginBottom: 8, fontSize: 12, lineHeight: 1.4 }}>
                <div style={{ fontWeight: 700 }}>
                  {item.quantity} adet · {itemName(item)}
                </div>
                {extra ? <div>{extra}</div> : null}
                {sku ? <div>SKU: {sku}</div> : null}
              </div>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12 }}>
          <div style={{ border: "1px solid #111", padding: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, marginBottom: 6 }}>KARGO</div>
            <div>Firma: {order.carrierName || "-"}</div>
            <div>Takip no: {order.trackingNumber || "-"}</div>
          </div>
          <div style={{ border: "1px solid #111", padding: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, marginBottom: 6 }}>TESLİMAT NOTU</div>
            <div>Kırılacak eşya / batarya içeren kargo. Dikkatli taşıyınız.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
