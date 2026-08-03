/**
 * Kısmi İade Tamamlandı E-postası (F2-73)
 *
 * NEDEN AYRI ŞABLON: Mevcut `OrderStatusEmail` "siparişiniz iade edildi" diyor.
 * Kısmi iadede bu yanlış — siparişin kalanı yolda ya da müşterinin elinde.
 * Dilim 18'de bu yüzden e-posta bilinçli olarak susturulmuştu; bu şablon o
 * boşluğu dolduruyor.
 *
 * Müşterinin bu e-postadan öğrenmesi gereken üç şey var: hangi ürünlerin iadesi
 * tamamlandı, ne kadar para geri geldi, ve siparişin geri kalanına ne oldu.
 *
 * Gmail uyumluluğu için tamamen tablo tabanlı.
 */

import { Layout } from "../components/Layout";
import { theme } from "../styles/theme";
import { Greeting, Paragraph, InfoCard, StatusBadge, Button } from "../components/shared";

export interface PartialRefundEmailItem {
  name: string;
  quantity: number;
}

interface PartialRefundEmailProps {
  orderNumber: string;
  name?: string;
  /** Biçimlendirilmiş tutar, örn. "₺1.699,00". */
  refundedTotal: string;
  items: PartialRefundEmailItem[];
  /** Kart ödemesinde banka yansıma süresi uyarısı gösterilir. */
  isCardPayment: boolean;
  adminNote?: string;
}

export const PartialRefundEmail = ({
  orderNumber,
  name,
  refundedTotal,
  // Liste boş gelirse şablon patlamasın: e-postanın hiç gitmemesindense
  // kalem listesi olmadan gitmesi yeğdir. Uçtaki doğrulama zaten boş listeyi
  // reddediyor, bu yalnızca son savunma hattı.
  items = [],
  isCardPayment,
  adminNote,
}: PartialRefundEmailProps) => {
  return (
    <Layout preview={`İadeniz tamamlandı - ${orderNumber}`}>
      <Greeting name={name} />

      <StatusBadge label="İade Tamamlandı" status="success" />

      <Paragraph>
        <strong>#{orderNumber}</strong> numaralı siparişinizde iade talebinde
        bulunduğunuz ürünlerin incelemesi tamamlandı ve ödemeniz iade edildi.
        Siparişinizin iade etmediğiniz ürünleri sizde kalmaya devam ediyor.
      </Paragraph>

      <InfoCard label="İade Edilen Tutar" value={refundedTotal} />

      {/* İade edilen kalemler */}
      {items.length > 0 && (
      <table
        cellPadding="0"
        cellSpacing="0"
        border={0}
        width="100%"
        style={{
          backgroundColor: "#f0fdf4",
          borderRadius: "8px",
          border: "1px solid #86efac",
          marginBottom: "24px",
        }}
      >
        <tbody>
          <tr>
            <td style={{ padding: "20px" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "#166534",
                  marginBottom: "10px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontFamily: theme.fonts.sans,
                }}
              >
                İadesi Tamamlanan Ürünler
              </p>
              <table cellPadding="0" cellSpacing="0" border={0} width="100%">
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td style={{ paddingBottom: "6px" }}>
                        <span
                          style={{
                            color: "#14532d",
                            fontSize: "14px",
                            fontFamily: theme.fonts.sans,
                          }}
                        >
                          • {item.name}
                          {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      )}

      {/*
        Kargo bedeli iade edilmiyor ve bunu müşteriye söylemek zorundayız:
        söylemezsek "eksik iade yapıldı" diye destek yükü doğar.
      */}
      <table
        cellPadding="0"
        cellSpacing="0"
        border={0}
        width="100%"
        style={{
          backgroundColor: "#fffbeb",
          borderRadius: "8px",
          border: "1px solid #fde68a",
          marginBottom: "24px",
        }}
      >
        <tbody>
          <tr>
            <td style={{ padding: "20px" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#92400e",
                  marginBottom: "12px",
                  fontWeight: 600,
                  fontFamily: theme.fonts.sans,
                }}
              >
                Tutar Nasıl Hesaplandı?
              </p>
              <table cellPadding="0" cellSpacing="0" border={0} width="100%">
                <tbody>
                  <tr>
                    <td style={{ paddingBottom: "6px" }}>
                      <span
                        style={{
                          color: "#78350f",
                          fontSize: "14px",
                          fontFamily: theme.fonts.sans,
                        }}
                      >
                        • Yalnızca iade ettiğiniz ürünlerin bedeli iade edildi
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: "6px" }}>
                      <span
                        style={{
                          color: "#78350f",
                          fontSize: "14px",
                          fontFamily: theme.fonts.sans,
                        }}
                      >
                        • Siparişinizde indirim kullandıysanız, indirimin bu
                        ürünlere düşen payı tutardan düşüldü
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: "6px" }}>
                      <span
                        style={{
                          color: "#78350f",
                          fontSize: "14px",
                          fontFamily: theme.fonts.sans,
                        }}
                      >
                        • Kargo bedeli iade edilmedi; gönderi siparişinizin
                        tamamı için zaten yapılmıştı
                      </span>
                    </td>
                  </tr>
                  {isCardPayment && (
                    <tr>
                      <td style={{ paddingBottom: "6px" }}>
                        <span
                          style={{
                            color: "#78350f",
                            fontSize: "14px",
                            fontFamily: theme.fonts.sans,
                          }}
                        >
                          • Tutarın kartınıza yansıması bankanıza göre 1–7 iş
                          günü sürebilir
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {adminNote && (
        <table
          cellPadding="0"
          cellSpacing="0"
          border={0}
          width="100%"
          style={{
            backgroundColor: "#f3f4f6",
            borderRadius: "8px",
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
                    color: "#6b7280",
                    marginBottom: "4px",
                    fontFamily: theme.fonts.sans,
                  }}
                >
                  Ek Not:
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: "#374151",
                    fontFamily: theme.fonts.sans,
                  }}
                >
                  {adminNote}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      )}

      <Button href="https://fusionmarkt.com/hesabim/siparisler">
        Siparişimi Görüntüle
      </Button>

      <Paragraph muted>
        Sorularınız için info@fusionmarkt.com adresinden bize ulaşabilirsiniz.
      </Paragraph>
    </Layout>
  );
};

/**
 * `npm run email:dev` önizlemesi için örnek veri. Şablon zorunlu bir dizi
 * (`items`) üzerinde döndüğü için bu olmadan önizleme çalışmaz.
 */
PartialRefundEmail.PreviewProps = {
  orderNumber: "FM-2026-83571",
  name: "Doğukan",
  refundedTotal: "₺1.699,00",
  items: [
    { name: "Solar Panel 450W Monokristal", quantity: 1 },
    { name: "MC4 Konnektör Seti", quantity: 2 },
  ],
  isCardPayment: true,
  adminNote: "Ürün hasarsız teslim alındı.",
} satisfies PartialRefundEmailProps;

export default PartialRefundEmail;
