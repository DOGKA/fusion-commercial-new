/**
 * Contract HTML Generator
 * Generates styled HTML for contracts to be stored with orders
 * Uses the EXACT same design as ContractModal.tsx
 */

interface BuyerInfo {
  fullName: string;
  tcKimlikNo?: string;
  address: string;
  phone: string;
  email: string;
}

interface OrderItem {
  name: string;
  variant?: { value?: string };
  price: number;
  quantity: number;
}

interface OrderTotals {
  subtotal: number;
  shipping: number;
  discount: number;
  grandTotal: number;
}

// Utility functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Generate Distance Sales Contract HTML - Same design as ContractModal
 */
export function generateDistanceSalesContractHTML(
  buyer: BuyerInfo,
  items: OrderItem[],
  totals: OrderTotals,
  orderNumber: string,
  contractDate: Date
): string {
  const formattedDate = formatDate(contractDate);
  
  const itemsHTML = items
    .map(
      (item, idx) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 13px; color: rgba(255, 255, 255, 0.9);">
        ${item.name}${item.variant?.value ? ` <span style="color: rgba(255, 255, 255, 0.5);">(${item.variant.value})</span>` : ""}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 13px; color: rgba(255, 255, 255, 0.9); text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 13px; color: rgba(255, 255, 255, 0.9); text-align: right;">${formatCurrency(item.price)}</td>
      <td style="padding: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 13px; color: rgba(255, 255, 255, 0.9); text-align: right; font-weight: 500;">${formatCurrency(item.price * item.quantity)}</td>
    </tr>
  `
    )
    .join("");

  return `
<div style="background-color: rgb(15, 15, 15); border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1); overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <!-- Header -->
  <div style="padding: 20px 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); display: flex; align-items: center; justify-content: space-between; background-color: rgba(16, 185, 129, 0.05);">
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="width: 44px; height: 44px; border-radius: 12px; background-color: rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path>
          <path d="M14 2v5a1 1 0 0 0 1 1h5"></path>
          <path d="M10 9H8"></path>
          <path d="M16 13H8"></path>
          <path d="M16 17H8"></path>
        </svg>
      </div>
      <div>
        <h2 style="font-size: 18px; font-weight: 600; color: rgb(255, 255, 255); margin: 0;">Mesafeli Satış Sözleşmesi</h2>
        <p style="font-size: 13px; color: rgba(255, 255, 255, 0.5); margin: 0;">Ref: ${orderNumber}</p>
      </div>
    </div>
    <div style="display: inline-block; background-color: rgba(16, 185, 129, 0.15); color: #10b981; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 500;">
      ✓ Onaylandı
    </div>
  </div>

  <!-- Content -->
  <div style="padding: 24px;">
    <!-- Title -->
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="font-size: 22px; font-weight: 700; color: rgb(16, 185, 129); margin-bottom: 8px;">MESAFELİ SATIŞ SÖZLEŞMESİ</h1>
      <div style="display: flex; justify-content: center; gap: 30px; flex-wrap: wrap; font-size: 12px; color: rgba(255, 255, 255, 0.5);">
        <span>Ref: <strong style="color: rgb(96, 165, 250);">${orderNumber}</strong></span>
        <span>Tarih: <strong style="color: rgb(96, 165, 250);">${formattedDate}</strong></span>
      </div>
    </div>

    <!-- Satıcı Bilgileri -->
    <div style="font-size: 16px; font-weight: 700; color: rgb(16, 185, 129); margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">SATICI BİLGİLERİ</div>
    <div style="padding: 16px; background-color: rgba(255, 255, 255, 0.03); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08); margin-bottom: 16px;">
      <div style="display: flex; margin-bottom: 8px; font-size: 13px;">
        <span style="color: rgba(255, 255, 255, 0.5); min-width: 140px;">Unvan:</span>
        <span style="color: rgba(255, 255, 255, 0.9); font-weight: 500;">ASDTC MÜHENDİSLİK TİCARET A.Ş.</span>
      </div>
      <div style="display: flex; margin-bottom: 8px; font-size: 13px;">
        <span style="color: rgba(255, 255, 255, 0.5); min-width: 140px;">Adres:</span>
        <span style="color: rgba(255, 255, 255, 0.9); font-weight: 500;">Ankara, Türkiye</span>
      </div>
      <div style="display: flex; margin-bottom: 8px; font-size: 13px;">
        <span style="color: rgba(255, 255, 255, 0.5); min-width: 140px;">E-posta:</span>
        <span style="color: rgba(255, 255, 255, 0.9); font-weight: 500;">info@fusionmarkt.com</span>
      </div>
      <div style="display: flex; font-size: 13px;">
        <span style="color: rgba(255, 255, 255, 0.5); min-width: 140px;">Telefon:</span>
        <span style="color: rgba(255, 255, 255, 0.9); font-weight: 500;">+90 850 840 6160</span>
      </div>
    </div>

    <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 20px 0;"></div>

    <!-- Alıcı Bilgileri -->
    <div style="font-size: 16px; font-weight: 700; color: rgb(16, 185, 129); margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">ALICI BİLGİLERİ</div>
    <div style="padding: 16px; background-color: rgba(255, 255, 255, 0.03); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08); margin-bottom: 16px;">
      <div style="display: flex; margin-bottom: 8px; font-size: 13px;">
        <span style="color: rgba(255, 255, 255, 0.5); min-width: 140px;">Ad Soyad:</span>
        <span style="color: rgba(255, 255, 255, 0.9); font-weight: 500;">${buyer.fullName}</span>
      </div>
      ${buyer.tcKimlikNo ? `
      <div style="display: flex; margin-bottom: 8px; font-size: 13px;">
        <span style="color: rgba(255, 255, 255, 0.5); min-width: 140px;">TC Kimlik No:</span>
        <span style="color: rgba(255, 255, 255, 0.9); font-weight: 500;">${buyer.tcKimlikNo}</span>
      </div>
      ` : ""}
      <div style="display: flex; margin-bottom: 8px; font-size: 13px;">
        <span style="color: rgba(255, 255, 255, 0.5); min-width: 140px;">Adres:</span>
        <span style="color: rgba(255, 255, 255, 0.9); font-weight: 500;">${buyer.address}</span>
      </div>
      <div style="display: flex; margin-bottom: 8px; font-size: 13px;">
        <span style="color: rgba(255, 255, 255, 0.5); min-width: 140px;">Telefon:</span>
        <span style="color: rgba(255, 255, 255, 0.9); font-weight: 500;">${buyer.phone}</span>
      </div>
      <div style="display: flex; font-size: 13px;">
        <span style="color: rgba(255, 255, 255, 0.5); min-width: 140px;">E-posta:</span>
        <span style="color: rgba(255, 255, 255, 0.9); font-weight: 500;">${buyer.email}</span>
      </div>
    </div>

    <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 20px 0;"></div>

    <!-- Ürünler -->
    <div style="font-size: 16px; font-weight: 700; color: rgb(16, 185, 129); margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">SİPARİŞ EDİLEN ÜRÜNLER</div>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
      <thead>
        <tr style="background-color: rgba(16, 185, 129, 0.1);">
          <th style="padding: 10px; text-align: left; font-size: 12px; color: #10b981; border-bottom: 1px solid rgba(16, 185, 129, 0.3);">Ürün</th>
          <th style="padding: 10px; text-align: center; font-size: 12px; color: #10b981; border-bottom: 1px solid rgba(16, 185, 129, 0.3);">Adet</th>
          <th style="padding: 10px; text-align: right; font-size: 12px; color: #10b981; border-bottom: 1px solid rgba(16, 185, 129, 0.3);">Birim Fiyat</th>
          <th style="padding: 10px; text-align: right; font-size: 12px; color: #10b981; border-bottom: 1px solid rgba(16, 185, 129, 0.3);">Toplam</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>

    <!-- Fiyat Özeti -->
    <div style="padding: 16px; background-color: rgba(16, 185, 129, 0.05); border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.2); margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: rgba(255, 255, 255, 0.7);">
        <span>Ara Toplam:</span>
        <span style="font-weight: 500;">${formatCurrency(totals.subtotal)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: rgba(255, 255, 255, 0.7);">
        <span>Kargo:</span>
        <span style="font-weight: 500; color: ${totals.shipping === 0 ? "#10b981" : "inherit"};">${totals.shipping === 0 ? "Ücretsiz" : formatCurrency(totals.shipping)}</span>
      </div>
      ${totals.discount > 0 ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: #f87171;">
        <span>İndirim:</span>
        <span style="font-weight: 500;">-${formatCurrency(totals.discount)}</span>
      </div>
      ` : ""}
      <div style="display: flex; justify-content: space-between; padding-top: 12px; margin-top: 12px; border-top: 2px solid rgba(16, 185, 129, 0.3); font-size: 16px; font-weight: 700; color: #10b981;">
        <span>TOPLAM (KDV Dahil):</span>
        <span>${formatCurrency(totals.grandTotal)}</span>
      </div>
    </div>

    <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 20px 0;"></div>

    <!-- Sözleşme Maddeleri -->
    <div style="font-size: 16px; font-weight: 700; color: rgb(16, 185, 129); margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">ÖDEME</div>
    <p style="font-size: 13px; line-height: 1.7; color: rgba(255, 255, 255, 0.85); margin-bottom: 14px;">
      Minimum Sipariş: İnternet mağazasında minimum sipariş tutarı 150 TL'dir.
    </p>
    <p style="font-size: 13px; line-height: 1.7; color: rgba(255, 255, 255, 0.85); margin-bottom: 14px;">
      ALICI, işbu Sözleşme kapsamında sipariş verdiği ürün(ler) için KDV dahil satış bedelini ve kargo ücretlerini Sözleşme'de belirtilen ödeme koşullarına uygun olarak ödeyecektir.
    </p>
    <ul style="font-size: 13px; line-height: 1.7; color: rgba(255, 255, 255, 0.8); margin-bottom: 14px; padding-left: 20px;">
      <li style="margin-bottom: 6px;">Kabul Edilen Kartlar: Visa, Amex, MasterCard kredi kartları</li>
      <li style="margin-bottom: 6px;">Ön Provizyon: Siparişler banka onayı sonrası işleme alınır</li>
    </ul>

    <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 20px 0;"></div>

    <div style="font-size: 16px; font-weight: 700; color: rgb(16, 185, 129); margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">TESLİMAT</div>
    <ul style="font-size: 13px; line-height: 1.7; color: rgba(255, 255, 255, 0.8); margin-bottom: 14px; padding-left: 20px;">
      <li style="margin-bottom: 6px;">Sipariş onayından itibaren 1-5 iş günü içinde kargoya verilir</li>
      <li style="margin-bottom: 6px;">Kargo takip bilgileri e-posta ile bildirilir</li>
      <li style="margin-bottom: 6px;">Teslim alınamayan siparişler 3 gün bekletilir</li>
    </ul>

    <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 20px 0;"></div>

    <div style="font-size: 16px; font-weight: 700; color: rgb(16, 185, 129); margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">CAYMA HAKKI</div>
    <p style="font-size: 13px; line-height: 1.7; color: rgba(255, 255, 255, 0.85); margin-bottom: 14px;">
      ALICI, sözleşme konusu ürünü teslim aldığı tarihten itibaren 14 (on dört) gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin cayma hakkına sahiptir.
    </p>

    <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 20px 0;"></div>

    <div style="font-size: 16px; font-weight: 700; color: rgb(16, 185, 129); margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">YETKİLİ MAHKEME</div>
    <p style="font-size: 13px; line-height: 1.7; color: rgba(255, 255, 255, 0.85); margin-bottom: 14px;">
      İşbu sözleşmeden doğan uyuşmazlıklarda Ankara Mahkemeleri ve İcra Daireleri yetkilidir.
    </p>

    <!-- Footer -->
    <div style="margin-top: 30px; padding: 16px; background-color: rgba(16, 185, 129, 0.1); border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.3); text-align: center;">
      <div style="display: inline-block; background-color: rgba(16, 185, 129, 0.15); color: #10b981; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 500; margin-bottom: 12px;">
        ✓ Elektronik Ortamda Onaylandı
      </div>
      <p style="font-size: 12px; color: rgba(255, 255, 255, 0.5); margin: 0 0 8px 0;">
        Bu sözleşme ${formattedDate} tarihinde elektronik ortamda onaylanmıştır.
      </p>
      <p style="font-size: 14px; font-weight: 600; color: #10b981; margin: 0;">
        ASDTC MÜHENDİSLİK TİCARET A.Ş. | FUSIONMARKT
      </p>
    </div>
  </div>
</div>
  `;
}

/**
 * Generate Terms and Conditions Contract HTML - Same design as ContractModal
 */
export function generateTermsAndConditionsHTML(
  buyer: { fullName: string; email: string },
  orderNumber: string,
  contractDate: Date
): string {
  const formattedDate = formatDate(contractDate);
  
  return `
<div style="background-color: rgb(15, 15, 15); border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1); overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <!-- Header -->
  <div style="padding: 20px 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); display: flex; align-items: center; justify-content: space-between; background-color: rgba(16, 185, 129, 0.05);">
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="width: 44px; height: 44px; border-radius: 12px; background-color: rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path>
          <path d="M14 2v5a1 1 0 0 0 1 1h5"></path>
          <path d="M10 9H8"></path>
          <path d="M16 13H8"></path>
          <path d="M16 17H8"></path>
        </svg>
      </div>
      <div>
        <h2 style="font-size: 18px; font-weight: 600; color: rgb(255, 255, 255); margin: 0;">Kullanıcı Sözleşmesi ve Şartlar</h2>
        <p style="font-size: 13px; color: rgba(255, 255, 255, 0.5); margin: 0;">Ref: ${orderNumber}</p>
      </div>
    </div>
    <div style="display: inline-block; background-color: rgba(16, 185, 129, 0.15); color: #10b981; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 500;">
      ✓ Onaylandı
    </div>
  </div>

  <!-- Content -->
  <div style="padding: 24px;">
    <!-- Title -->
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="font-size: 22px; font-weight: 700; color: rgb(16, 185, 129); margin-bottom: 8px;">KULLANICI SÖZLEŞMESİ VE ŞARTLAR</h1>
      <div style="display: flex; justify-content: center; gap: 30px; flex-wrap: wrap; font-size: 12px; color: rgba(255, 255, 255, 0.5);">
        <span>Ref: <strong style="color: rgb(96, 165, 250);">${orderNumber}</strong></span>
        <span>Tarih: <strong style="color: rgb(96, 165, 250);">${formattedDate}</strong></span>
      </div>
    </div>

    <!-- Kullanıcı Bilgileri -->
    <div style="padding: 16px; background-color: rgba(255, 255, 255, 0.03); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08); margin-bottom: 16px;">
      <div style="display: flex; margin-bottom: 8px; font-size: 13px;">
        <span style="color: rgba(255, 255, 255, 0.5); min-width: 140px;">Kullanıcı:</span>
        <span style="color: rgba(255, 255, 255, 0.9); font-weight: 500;">${buyer.fullName}</span>
      </div>
      <div style="display: flex; font-size: 13px;">
        <span style="color: rgba(255, 255, 255, 0.5); min-width: 140px;">E-posta:</span>
        <span style="color: rgba(255, 255, 255, 0.9); font-weight: 500;">${buyer.email}</span>
      </div>
    </div>

    <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 20px 0;"></div>

    <!-- 1. Genel Hükümler -->
    <div style="font-size: 16px; font-weight: 700; color: rgb(16, 185, 129); margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">1. Genel Hükümler</div>
    <p style="font-size: 13px; line-height: 1.7; color: rgba(255, 255, 255, 0.85); margin-bottom: 14px;">
      Bu web sitesini (www.fusionmarkt.com) kullanarak, işbu kullanım koşullarını kabul etmiş sayılırsınız. Site üzerinden alışveriş yapmanız halinde Mesafeli Satış Sözleşmesi hükümleri de geçerli olacaktır.
    </p>
    <div style="padding: 16px; background-color: rgba(251, 191, 36, 0.1); border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.3); margin-bottom: 16px;">
      <p style="font-size: 13px; line-height: 1.7; color: rgb(251, 191, 36); margin: 0; font-weight: 500;">
        ⚠️ LÜTFEN BU SİTEYİ KULLANMADAN ÖNCE AŞAĞIDAKİ HÜKÜM VE KOŞULLARI DİKKATLİCE OKUYUN.
      </p>
    </div>

    <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 20px 0;"></div>

    <!-- 2. Hizmet Tanımı -->
    <div style="font-size: 16px; font-weight: 700; color: rgb(16, 185, 129); margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">2. Hizmet Tanımı</div>
    <p style="font-size: 13px; line-height: 1.7; color: rgba(255, 255, 255, 0.85); margin-bottom: 14px;">
      FusionMarkt, teknoloji ürünleri satan bir e-ticaret platformudur. Sitede sunulan ürünler stok durumuna göre değişebilir ve fiyatlar önceden haber verilmeksizin güncellenebilir.
    </p>

    <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 20px 0;"></div>

    <!-- 3. Üyelik Koşulları -->
    <div style="font-size: 16px; font-weight: 700; color: rgb(16, 185, 129); margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">3. Üyelik Koşulları</div>
    <ul style="font-size: 13px; line-height: 1.7; color: rgba(255, 255, 255, 0.8); margin-bottom: 14px; padding-left: 20px;">
      <li style="margin-bottom: 6px;">Üyelik için 18 yaşından büyük olmak veya yasal veli iznine sahip olmak gerekmektedir</li>
      <li style="margin-bottom: 6px;">Sağlanan bilgilerin doğruluğundan kullanıcı sorumludur</li>
      <li style="margin-bottom: 6px;">Hesap güvenliği kullanıcının sorumluluğundadır</li>
      <li style="margin-bottom: 6px;">Şifrenizin üçüncü kişilerle paylaşılmaması gerekmektedir</li>
    </ul>

    <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 20px 0;"></div>

    <!-- 4. Fikri Mülkiyet -->
    <div style="font-size: 16px; font-weight: 700; color: rgb(16, 185, 129); margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">4. Fikri Mülkiyet Hakları</div>
    <p style="font-size: 13px; line-height: 1.7; color: rgba(255, 255, 255, 0.85); margin-bottom: 14px;">
      Site içeriği, logoları, tasarımları ve diğer tüm materyaller FusionMarkt'ın mülkiyetindedir. İzinsiz kullanımı yasaktır.
    </p>
    <ul style="font-size: 13px; line-height: 1.7; color: rgba(255, 255, 255, 0.8); margin-bottom: 14px; padding-left: 20px;">
      <li style="margin-bottom: 6px;">Site tasarımının kopyalanması yasaktır</li>
      <li style="margin-bottom: 6px;">Ürün görsellerinin izinsiz kullanımı yasaktır</li>
      <li style="margin-bottom: 6px;">Marka ve logoların üçüncü taraflarca kullanımı yasaktır</li>
    </ul>

    <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 20px 0;"></div>

    <!-- 5. Gizlilik -->
    <div style="font-size: 16px; font-weight: 700; color: rgb(16, 185, 129); margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">5. Gizlilik</div>
    <p style="font-size: 13px; line-height: 1.7; color: rgba(255, 255, 255, 0.85); margin-bottom: 14px;">
      Kişisel verileriniz Gizlilik Politikamız ve KVKK kapsamında işlenmektedir.
    </p>
    <ul style="font-size: 13px; line-height: 1.7; color: rgba(255, 255, 255, 0.8); margin-bottom: 14px; padding-left: 20px;">
      <li style="margin-bottom: 6px;">Verileriniz yalnızca hizmet amaçlı kullanılır</li>
      <li style="margin-bottom: 6px;">Yasal zorunluluklar dışında üçüncü taraflarla paylaşılmaz</li>
      <li style="margin-bottom: 6px;">256-bit SSL şifreleme ile korunmaktadır</li>
    </ul>

    <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 20px 0;"></div>

    <!-- 6. Sorumluluk Reddi -->
    <div style="font-size: 16px; font-weight: 700; color: rgb(16, 185, 129); margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">6. Sorumluluk Reddi</div>
    <p style="font-size: 13px; line-height: 1.7; color: rgba(255, 255, 255, 0.85); margin-bottom: 14px;">
      FusionMarkt, site kullanımından kaynaklanabilecek doğrudan veya dolaylı zararlardan sorumlu tutulamaz.
    </p>
    <div style="font-size: 14px; font-weight: 600; color: rgb(96, 165, 250); margin-bottom: 12px; margin-top: 20px;">Ancak şu durumlarda sorumluluk kabul eder:</div>
    <ul style="font-size: 13px; line-height: 1.7; color: rgba(255, 255, 255, 0.8); margin-bottom: 14px; padding-left: 20px;">
      <li style="margin-bottom: 6px;">Sipariş edilen ürünlerin teslimi</li>
      <li style="margin-bottom: 6px;">Garanti kapsamındaki ürün arızaları</li>
      <li style="margin-bottom: 6px;">Yasal cayma hakkı süresinde iadeler</li>
    </ul>

    <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 20px 0;"></div>

    <!-- 7. Değişiklikler -->
    <div style="font-size: 16px; font-weight: 700; color: rgb(16, 185, 129); margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">7. Değişiklikler</div>
    <p style="font-size: 13px; line-height: 1.7; color: rgba(255, 255, 255, 0.85); margin-bottom: 14px;">
      Bu sözleşme şartları önceden haber verilmeksizin değiştirilebilir. Güncel versiyon her zaman sitede yayınlanacaktır.
    </p>

    <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 20px 0;"></div>

    <!-- 8. Uygulanacak Hukuk -->
    <div style="font-size: 16px; font-weight: 700; color: rgb(16, 185, 129); margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">8. Uygulanacak Hukuk</div>
    <p style="font-size: 13px; line-height: 1.7; color: rgba(255, 255, 255, 0.85); margin-bottom: 14px;">
      Bu sözleşme Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlıklarda Ankara Mahkemeleri ve İcra Daireleri yetkilidir.
    </p>

    <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 20px 0;"></div>

    <!-- Onay -->
    <div style="font-size: 16px; font-weight: 700; color: rgb(16, 185, 129); margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">Onay</div>
    <p style="font-size: 13px; line-height: 1.7; color: rgba(255, 255, 255, 0.85); margin-bottom: 14px;">
      Bu sözleşmeyi elektronik ortamda onaylayarak, yukarıdaki tüm şartları okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan etmiş olursunuz.
    </p>

    <!-- Footer -->
    <div style="margin-top: 30px; padding: 16px; background-color: rgba(16, 185, 129, 0.1); border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.3); text-align: center;">
      <div style="font-size: 12px; color: rgba(255, 255, 255, 0.5); margin-bottom: 8px;">Son Güncelleme: 25 Aralık 2024</div>
      <div style="display: inline-block; background-color: rgba(16, 185, 129, 0.15); color: #10b981; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 500; margin-bottom: 12px;">
        ✓ Elektronik Ortamda Onaylandı
      </div>
      <p style="font-size: 12px; color: rgba(255, 255, 255, 0.5); margin: 0 0 8px 0;">
        Bu sözleşme ${formattedDate} tarihinde elektronik ortamda onaylanmıştır.
      </p>
      <p style="font-size: 14px; font-weight: 600; color: #10b981; margin: 0;">
        ASDTC MÜHENDİSLİK TİCARET A.Ş. | FUSIONMARKT
      </p>
    </div>
  </div>
</div>
  `;
}

/**
 * Generate both contracts and return as an object
 */
export function generateContractsHTML(
  buyer: BuyerInfo,
  items: OrderItem[],
  totals: OrderTotals,
  orderNumber: string,
  contractDate: Date = new Date()
): {
  termsAndConditions: string;
  distanceSalesContract: string;
  acceptedAt: string;
} {
  return {
    termsAndConditions: generateTermsAndConditionsHTML(
      { fullName: buyer.fullName, email: buyer.email },
      orderNumber,
      contractDate
    ),
    distanceSalesContract: generateDistanceSalesContractHTML(
      buyer,
      items,
      totals,
      orderNumber,
      contractDate
    ),
    acceptedAt: contractDate.toISOString(),
  };
}
