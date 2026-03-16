"use client";

import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface LegalPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  isActive: boolean;
  showOnCheckout: boolean;
  requireAcceptance: boolean;
  sortOrder: number;
  updatedAt?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT TEMPLATES (HTML)
// ═══════════════════════════════════════════════════════════════════════════

const defaultTemplates: Record<string, string> = {
  "mesafeli-satis-sozlesmesi": `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="font-size: 18px; font-weight: 700; color: #10b981; margin-bottom: 8px;">
      MESAFELİ SATIŞ SÖZLEŞMESİ
    </h1>
    <div style="font-size: 12px; color: rgba(255,255,255,0.5);">
      Ref: <strong style="color: #60a5fa;">{{ORDER_REF}}</strong> | 
      Tarih: <strong style="color: #60a5fa;">{{DATE}}</strong>
    </div>
  </div>

  <div style="font-size: 14px; font-weight: 700; color: #10b981; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">
    Taraflar
  </div>
  
  <div style="font-size: 12px; font-weight: 600; color: #60a5fa; margin-bottom: 8px; margin-top: 16px;">
    Satıcı Bilgileri
  </div>
  <div style="padding: 14px; background-color: rgba(255, 255, 255, 0.03); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08); margin-bottom: 14px; font-size: 12px;">
    <div style="margin-bottom: 8px;">
      <span style="color: rgba(255, 255, 255, 0.5);">Ticaret Unvanı:</span><br/>
      <span style="color: rgba(255, 255, 255, 0.9); font-weight: 500;">ASDTC MÜHENDİSLİK TİCARET A.Ş. / FUSIONMARKT LLC</span>
    </div>
    <div style="margin-bottom: 8px;">
      <span style="color: rgba(255, 255, 255, 0.5);">Genel Merkez:</span><br/>
      <span style="color: rgba(255, 255, 255, 0.9); font-weight: 500;">Turan Güneş Bulvarı, Cezayir Cd. No.6/7, Yıldızevler, ÇANKAYA, ANKARA</span>
    </div>
    <div style="margin-bottom: 8px;">
      <span style="color: rgba(255, 255, 255, 0.5);">Telefon:</span><br/>
      <span style="color: rgba(255, 255, 255, 0.9); font-weight: 500;">+90 850 840 6160</span>
    </div>
    <div>
      <span style="color: rgba(255, 255, 255, 0.5);">E-posta:</span><br/>
      <span style="color: rgba(255, 255, 255, 0.9); font-weight: 500;">sales@fusionmarkt.com</span>
    </div>
  </div>

  <div style="font-size: 12px; font-weight: 600; color: #60a5fa; margin-bottom: 8px; margin-top: 16px;">
    Alıcı Bilgileri
  </div>
  <div style="padding: 14px; background-color: rgba(255, 255, 255, 0.03); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08); margin-bottom: 14px; font-size: 12px;">
    <div style="margin-bottom: 8px;">
      <span style="color: rgba(255, 255, 255, 0.5);">Ad/Soyad:</span><br/>
      <span style="color: rgba(255, 255, 255, 0.9); font-weight: 500;">{{BUYER_NAME}}</span>
    </div>
    <div style="margin-bottom: 8px;">
      <span style="color: rgba(255, 255, 255, 0.5);">T.C. Kimlik No:</span><br/>
      <span style="color: rgba(255, 255, 255, 0.9); font-weight: 500;">{{BUYER_TC}}</span>
    </div>
    <div style="margin-bottom: 8px;">
      <span style="color: rgba(255, 255, 255, 0.5);">Adres:</span><br/>
      <span style="color: rgba(255, 255, 255, 0.9); font-weight: 500;">{{BUYER_ADDRESS}}</span>
    </div>
    <div style="margin-bottom: 8px;">
      <span style="color: rgba(255, 255, 255, 0.5);">Telefon:</span><br/>
      <span style="color: rgba(255, 255, 255, 0.9); font-weight: 500;">{{BUYER_PHONE}}</span>
    </div>
    <div>
      <span style="color: rgba(255, 255, 255, 0.5);">E-posta:</span><br/>
      <span style="color: rgba(255, 255, 255, 0.9); font-weight: 500;">{{BUYER_EMAIL}}</span>
    </div>
  </div>

  <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 16px 0;"></div>

  <div style="font-size: 14px; font-weight: 700; color: #10b981; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">
    Konu
  </div>
  <p style="font-size: 12px; line-height: 1.7; color: rgba(255, 255, 255, 0.85); margin-bottom: 12px;">
    İşbu Mesafeli Satış Sözleşmesi'nin konusu, SATICI'ya ait www.fusionmarkt.com ve işbu sözleşme kapsamında 
    ALICI tarafından online olarak verilen siparişe karşılık, satış bedelinin ALICI tarafından ödenmesi, 
    ürünlerin teslimi ve tarafların 27.11.2014 tarihli Resmi Gazete'de yayınlanan Mesafeli Satışlar Yönetmeliği 
    ve 6502 sayılı Tüketicinin Korunması Hakkında Kanun kapsamındaki diğer hak ve yükümlülükleri kapsamaktadır.
  </p>

  <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 16px 0;"></div>

  <div style="font-size: 14px; font-weight: 700; color: #10b981; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">
    Sipariş Ürünleri
  </div>
  
  {{PRODUCTS_TABLE}}

  <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 16px 0;"></div>

  <div style="font-size: 14px; font-weight: 700; color: #10b981; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">
    Ödeme
  </div>
  <p style="font-size: 12px; line-height: 1.7; color: rgba(255, 255, 255, 0.85); margin-bottom: 12px;">
    Minimum Sipariş: İnternet mağazasında minimum sipariş tutarı 150 TL'dir.
  </p>
  <ul style="font-size: 12px; line-height: 1.7; color: rgba(255, 255, 255, 0.8); margin-bottom: 12px; padding-left: 16px; list-style-type: disc;">
    <li style="margin-bottom: 6px;">Kabul Edilen Kartlar: Visa, Amex, MasterCard kredi kartları</li>
    <li style="margin-bottom: 6px;">Ön Provizyon: Siparişler banka onayı sonrası işleme alınır</li>
  </ul>

  <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 16px 0;"></div>

  <div style="font-size: 14px; font-weight: 700; color: #10b981; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">
    Teslimat
  </div>
  <p style="font-size: 12px; line-height: 1.7; color: rgba(255, 255, 255, 0.85); margin-bottom: 12px;">
    Ürünler 30 günlük yasal süre içerisinde kargo ile teslim edilir.
  </p>
  <ul style="font-size: 12px; line-height: 1.7; color: rgba(255, 255, 255, 0.8); margin-bottom: 12px; padding-left: 16px; list-style-type: disc;">
    <li style="margin-bottom: 6px;"><strong>Aynı Gün Teslimat:</strong> Ürünler siparişin verildiği gün teslim edilir.</li>
    <li style="margin-bottom: 6px;"><strong>Randevulu Teslimat:</strong> ALICI'nın belirlediği tarihte teslim edilir.</li>
  </ul>

  <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 16px 0;"></div>

  <div style="font-size: 14px; font-weight: 700; color: #10b981; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">
    Cayma Hakkı
  </div>
  <p style="font-size: 12px; line-height: 1.7; color: rgba(255, 255, 255, 0.85); margin-bottom: 12px;">
    ALICI, ürün tesliminden itibaren <strong style="color: #10b981;">14 gün</strong> içinde cayma hakkını kullanabilir.
  </p>
  <div style="font-size: 12px; font-weight: 600; color: #60a5fa; margin-bottom: 8px; margin-top: 16px;">
    Cayma Hakkı Şartları:
  </div>
  <ul style="font-size: 12px; line-height: 1.7; color: rgba(255, 255, 255, 0.8); margin-bottom: 12px; padding-left: 16px; list-style-type: disc;">
    <li style="margin-bottom: 6px;">Ürünler hasarsız ve orijinal ambalajında olmalıdır</li>
    <li style="margin-bottom: 6px;">SATICI'ya bildirimde bulunulmalıdır</li>
    <li style="margin-bottom: 6px;">İade masrafları SATICI tarafından karşılanır</li>
  </ul>

  <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 16px 0;"></div>

  <div style="font-size: 14px; font-weight: 700; color: #10b981; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">
    Garanti ve Sorumluluk
  </div>
  <ul style="font-size: 12px; line-height: 1.7; color: rgba(255, 255, 255, 0.8); margin-bottom: 12px; padding-left: 16px; list-style-type: disc;">
    <li style="margin-bottom: 6px;"><strong>2 Yıl Garanti</strong> - teslimat tarihinden itibaren</li>
    <li style="margin-bottom: 6px;">Garanti kapsamında değiştirilen ürünler için süre, ilk ürünün kalan garanti süresi ile sınırlıdır</li>
  </ul>

  <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 16px 0;"></div>

  <div style="font-size: 14px; font-weight: 700; color: #10b981; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">
    Kişisel Verilerin Korunması
  </div>
  <p style="font-size: 12px; line-height: 1.7; color: rgba(255, 255, 255, 0.85); margin-bottom: 12px;">
    SATICI, ALICI'ya ait kişisel bilgileri KVKK kapsamında işleyebilir ve saklayabilir.
  </p>

  <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 16px 0;"></div>

  <div style="font-size: 14px; font-weight: 700; color: #10b981; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">
    Uyuşmazlıkların Çözümü
  </div>
  <p style="font-size: 12px; line-height: 1.7; color: rgba(255, 255, 255, 0.85); margin-bottom: 12px;">
    İşbu Sözleşme'nin uygulanmasından doğabilecek uyuşmazlıklarda Türk Hukuku uygulanacaktır. 
    Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.
  </p>

  <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 16px 0;"></div>

  <div style="font-size: 14px; font-weight: 700; color: #10b981; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">
    Sözleşme Onayı
  </div>
  <div style="padding: 14px; background-color: rgba(16, 185, 129, 0.1); border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.3);">
    <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
      <div>
        <div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-bottom: 4px;">SATICI</div>
        <div style="font-size: 12px; font-weight: 600; color: #10b981;">
          ASDTC MÜHENDİSLİK TİCARET A.Ş.
        </div>
      </div>
      <div>
        <div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-bottom: 4px;">ALICI</div>
        <div style="font-size: 12px; font-weight: 600; color: #60a5fa;">
          {{BUYER_NAME}}
        </div>
      </div>
    </div>
  </div>
</div>`,

  "kullanici-sozlesmesi": `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="font-size: 18px; font-weight: 700; color: #10b981; margin-bottom: 8px;">
      KULLANICI SÖZLEŞMESİ VE ŞARTLAR
    </h1>
  </div>

  <div style="font-size: 14px; font-weight: 700; color: #10b981; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">
    1. Genel Hükümler
  </div>
  <p style="font-size: 12px; line-height: 1.7; color: rgba(255, 255, 255, 0.85); margin-bottom: 12px;">
    Bu web sitesini (www.fusionmarkt.com) kullanarak, işbu kullanım koşullarını kabul etmiş sayılırsınız. 
    Site üzerinden alışveriş yapmanız halinde Mesafeli Satış Sözleşmesi hükümleri de geçerli olacaktır.
  </p>
  <div style="padding: 14px; background-color: rgba(251, 191, 36, 0.1); border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.3); margin-bottom: 14px;">
    <p style="font-size: 12px; margin: 0; color: #fbbf24; font-weight: 500;">
      ⚠️ LÜTFEN BU SİTEYİ KULLANMADAN ÖNCE AŞAĞIDAKİ HÜKÜM VE KOŞULLARI DİKKATLİCE OKUYUN.
    </p>
  </div>

  <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 16px 0;"></div>

  <div style="font-size: 14px; font-weight: 700; color: #10b981; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">
    2. Hizmet Tanımı
  </div>
  <p style="font-size: 12px; line-height: 1.7; color: rgba(255, 255, 255, 0.85); margin-bottom: 12px;">
    FusionMarkt, teknoloji ürünleri satan bir e-ticaret platformudur. Sitede sunulan ürünler stok durumuna göre 
    değişebilir ve fiyatlar önceden haber verilmeksizin güncellenebilir.
  </p>

  <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 16px 0;"></div>

  <div style="font-size: 14px; font-weight: 700; color: #10b981; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">
    3. Üyelik Koşulları
  </div>
  <ul style="font-size: 12px; line-height: 1.7; color: rgba(255, 255, 255, 0.8); margin-bottom: 12px; padding-left: 16px; list-style-type: disc;">
    <li style="margin-bottom: 6px;">Üyelik için 18 yaşından büyük olmak veya yasal veli iznine sahip olmak gerekmektedir</li>
    <li style="margin-bottom: 6px;">Sağlanan bilgilerin doğruluğundan kullanıcı sorumludur</li>
    <li style="margin-bottom: 6px;">Hesap güvenliği kullanıcının sorumluluğundadır</li>
    <li style="margin-bottom: 6px;">Şifrenizin üçüncü kişilerle paylaşılmaması gerekmektedir</li>
  </ul>

  <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 16px 0;"></div>

  <div style="font-size: 14px; font-weight: 700; color: #10b981; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">
    4. Fikri Mülkiyet Hakları
  </div>
  <p style="font-size: 12px; line-height: 1.7; color: rgba(255, 255, 255, 0.85); margin-bottom: 12px;">
    Site içeriği, logoları, tasarımları ve diğer tüm materyaller FusionMarkt'ın mülkiyetindedir. İzinsiz kullanımı yasaktır.
  </p>

  <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 16px 0;"></div>

  <div style="font-size: 14px; font-weight: 700; color: #10b981; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">
    5. Gizlilik
  </div>
  <ul style="font-size: 12px; line-height: 1.7; color: rgba(255, 255, 255, 0.8); margin-bottom: 12px; padding-left: 16px; list-style-type: disc;">
    <li style="margin-bottom: 6px;">Verileriniz yalnızca hizmet amaçlı kullanılır</li>
    <li style="margin-bottom: 6px;">Yasal zorunluluklar dışında üçüncü taraflarla paylaşılmaz</li>
    <li style="margin-bottom: 6px;">256-bit SSL şifreleme ile korunmaktadır</li>
  </ul>

  <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 16px 0;"></div>

  <div style="font-size: 14px; font-weight: 700; color: #10b981; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">
    6. Sorumluluk Reddi
  </div>
  <p style="font-size: 12px; line-height: 1.7; color: rgba(255, 255, 255, 0.85); margin-bottom: 12px;">
    FusionMarkt, site kullanımından kaynaklanabilecek doğrudan veya dolaylı zararlardan sorumlu tutulamaz.
  </p>

  <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 16px 0;"></div>

  <div style="font-size: 14px; font-weight: 700; color: #10b981; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">
    7. Değişiklikler
  </div>
  <p style="font-size: 12px; line-height: 1.7; color: rgba(255, 255, 255, 0.85); margin-bottom: 12px;">
    Bu sözleşme şartları önceden haber verilmeksizin değiştirilebilir. Güncel versiyon her zaman sitede yayınlanacaktır.
  </p>

  <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 16px 0;"></div>

  <div style="font-size: 14px; font-weight: 700; color: #10b981; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">
    8. Uygulanacak Hukuk
  </div>
  <p style="font-size: 12px; line-height: 1.7; color: rgba(255, 255, 255, 0.85); margin-bottom: 12px;">
    Bu sözleşme Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlıklarda Ankara Mahkemeleri ve İcra Daireleri yetkilidir.
  </p>

  <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 16px 0;"></div>

  <div style="font-size: 14px; font-weight: 700; color: #10b981; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">
    Onay
  </div>
  <div style="padding: 14px; background-color: rgba(16, 185, 129, 0.1); border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.3);">
    <div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-bottom: 8px;">
      Son Güncelleme: {{DATE}}
    </div>
    <div style="font-size: 12px; font-weight: 600; color: #10b981;">
      ASDTC MÜHENDİSLİK TİCARET A.Ş. | FUSIONMARKT LLC
    </div>
  </div>
</div>`,
};

// ═══════════════════════════════════════════════════════════════════════════
// LOCAL DEFAULT PAGES (for demo without DB)
// ═══════════════════════════════════════════════════════════════════════════

const localPages: LegalPage[] = [
  {
    id: "1",
    slug: "mesafeli-satis-sozlesmesi",
    title: "Mesafeli Satış Sözleşmesi",
    content: defaultTemplates["mesafeli-satis-sozlesmesi"],
    isActive: true,
    showOnCheckout: true,
    requireAcceptance: true,
    sortOrder: 1,
  },
  {
    id: "2",
    slug: "kullanici-sozlesmesi",
    title: "Kullanıcı Sözleşmesi",
    content: defaultTemplates["kullanici-sozlesmesi"],
    isActive: true,
    showOnCheckout: true,
    requireAcceptance: true,
    sortOrder: 2,
  },
  {
    id: "3",
    slug: "gizlilik-politikasi",
    title: "Gizlilik Politikası ve Güvenlik",
    content: "<div><h1>Gizlilik Politikası</h1><p>İçerik buraya...</p></div>",
    isActive: true,
    showOnCheckout: false,
    requireAcceptance: false,
    sortOrder: 3,
  },
  {
    id: "4",
    slug: "iade-politikasi",
    title: "İade Politikası",
    content: "<div><h1>İade Politikası</h1><p>İçerik buraya...</p></div>",
    isActive: true,
    showOnCheckout: true,
    requireAcceptance: false,
    sortOrder: 4,
  },
  {
    id: "5",
    slug: "ucretlendirme-politikasi",
    title: "Ücretlendirme Politikası",
    content: "<div><h1>Ücretlendirme Politikası</h1><p>İçerik buraya...</p></div>",
    isActive: true,
    showOnCheckout: false,
    requireAcceptance: false,
    sortOrder: 5,
  },
  {
    id: "6",
    slug: "cerez-politikasi",
    title: "Çerez Politikası",
    content: "<div><h1>Çerez Politikası</h1><p>İçerik buraya...</p></div>",
    isActive: true,
    showOnCheckout: false,
    requireAcceptance: false,
    sortOrder: 6,
  },
  {
    id: "7",
    slug: "gonderim-yerleri",
    title: "Gönderim Yerleri",
    content: "<div><h1>Gönderim Yerleri</h1><p>İçerik buraya...</p></div>",
    isActive: true,
    showOnCheckout: false,
    requireAcceptance: false,
    sortOrder: 7,
  },
  {
    id: "8",
    slug: "odeme-secenekleri",
    title: "Ödeme Seçenekleri",
    content: "<div><h1>Ödeme Seçenekleri</h1><p>İçerik buraya...</p></div>",
    isActive: true,
    showOnCheckout: false,
    requireAcceptance: false,
    sortOrder: 8,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function LegalPage() {
  const [pages, setPages] = useState<LegalPage[]>(localPages);
  const [selectedPage, setSelectedPage] = useState<LegalPage>(localPages[0]);
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [editedContent, setEditedContent] = useState(localPages[0].content);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch pages from API on mount
  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await fetch("/api/legal");
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setPages(data);
            setSelectedPage(data[0]);
            setEditedContent(data[0].content);
          }
        }
      } catch (error) {
        console.log("Using local pages (DB not available)", error);
      }
    };
    fetchPages();
  }, []);

  const handlePageSelect = (page: LegalPage) => {
    setSelectedPage(page);
    setEditedContent(page.content);
    setSaveMessage(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch(`/api/legal/${selectedPage.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...selectedPage,
          content: editedContent,
        }),
      });

      if (res.ok) {
        // Update local state
        const updatedPages = pages.map(p => 
          p.id === selectedPage.id ? { ...p, content: editedContent } : p
        );
        setPages(updatedPages);
        setSelectedPage({ ...selectedPage, content: editedContent });
        
        setSaveMessage({ type: "success", text: "✓ Kaydedildi! Frontend'e yansıdı." });
      } else {
        // If API fails, still update local state for demo
        const updatedPages = pages.map(p => 
          p.id === selectedPage.id ? { ...p, content: editedContent } : p
        );
        setPages(updatedPages);
        setSelectedPage({ ...selectedPage, content: editedContent });
        
        setSaveMessage({ type: "success", text: "✓ Yerel olarak kaydedildi (DB bağlantısı yok)" });
      }
    } catch {
      // If API fails, still update local state for demo
      const updatedPages = pages.map(p => 
        p.id === selectedPage.id ? { ...p, content: editedContent } : p
      );
      setPages(updatedPages);
      setSelectedPage({ ...selectedPage, content: editedContent });
      
      setSaveMessage({ type: "success", text: "✓ Yerel olarak kaydedildi" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleSettingChange = (key: keyof LegalPage, value: boolean) => {
    const updated = { ...selectedPage, [key]: value };
    setSelectedPage(updated);
    
    const updatedPages = pages.map(p => 
      p.id === selectedPage.id ? updated : p
    );
    setPages(updatedPages);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Yasal Sayfalar & Sözleşmeler</h1>
          <p className="text-gray-500">HTML kodunu düzenleyerek frontend&apos;i güncelleyin</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-white hover:bg-primary/90">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Sayfa
        </button>
      </div>

      {/* Checkout Preview */}
      <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
        <h2 className="mb-4 text-lg font-semibold text-dark dark:text-white">Ödeme Sayfası Önizlemesi</h2>
        <div className="rounded-lg border border-stroke p-4 dark:border-dark-3 bg-gray-50 dark:bg-dark-2">
          <div className="space-y-3">
            {pages.filter(p => p.showOnCheckout && p.isActive).map((page) => (
              <label key={page.id} className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="mt-1 h-4 w-4 rounded border-stroke text-primary" 
                  defaultChecked={page.requireAcceptance}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  <a href="#" className="text-primary hover:underline">{page.title}</a>
                  {page.requireAcceptance && <span className="text-red-500"> *</span>}
                  {" "}bölümünü okudum ve kabul ediyorum.
                </span>
              </label>
            ))}
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1 h-4 w-4 rounded border-stroke text-primary" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Haber bültenimize abone olun (isteğe bağlı)
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Page List */}
        <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
          <div className="border-b border-stroke px-4 py-3 dark:border-dark-3">
            <h2 className="font-semibold text-dark dark:text-white">Sayfalar</h2>
          </div>
          <div className="divide-y divide-stroke dark:divide-dark-3">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => handlePageSelect(page)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors ${
                  selectedPage.id === page.id ? "bg-primary/5 border-l-2 border-primary" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-medium ${selectedPage.id === page.id ? "text-primary" : "text-dark dark:text-white"}`}>
                    {page.title}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${page.isActive ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500"}`}>
                    {page.isActive ? "Aktif" : "Pasif"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {page.showOnCheckout && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Ödemede
                    </span>
                  )}
                  {page.requireAcceptance && (
                    <span className="text-red-500">Zorunlu</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Page Settings */}
          <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
            <h3 className="mb-4 font-semibold text-dark dark:text-white">{selectedPage.title} - Ayarlar</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">Sayfa URL</label>
                <input 
                  type="text" 
                  value={`/legal/${selectedPage.slug}`}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 text-sm dark:border-dark-3"
                  readOnly
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">Slug</label>
                <input 
                  type="text" 
                  value={selectedPage.slug}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 text-sm dark:border-dark-3"
                  readOnly
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6 mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={selectedPage.isActive} 
                  onChange={(e) => handleSettingChange("isActive", e.target.checked)}
                  className="h-4 w-4 rounded text-primary" 
                />
                <span className="text-sm text-dark dark:text-white">Aktif</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={selectedPage.showOnCheckout} 
                  onChange={(e) => handleSettingChange("showOnCheckout", e.target.checked)}
                  className="h-4 w-4 rounded text-primary" 
                />
                <span className="text-sm text-dark dark:text-white">Ödeme Sayfasında Göster</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={selectedPage.requireAcceptance} 
                  onChange={(e) => handleSettingChange("requireAcceptance", e.target.checked)}
                  className="h-4 w-4 rounded text-primary" 
                />
                <span className="text-sm text-dark dark:text-white">Onay Zorunlu</span>
              </label>
            </div>
          </div>

          {/* Content Editor */}
          <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark overflow-hidden">
            <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-dark-3">
              <h3 className="font-semibold text-dark dark:text-white">İçerik Düzenleyici</h3>
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-stroke dark:border-dark-3 overflow-hidden">
                  <button
                    onClick={() => setViewMode("preview")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      viewMode === "preview" 
                        ? "bg-primary text-white" 
                        : "bg-transparent text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-dark-2"
                    }`}
                  >
                    Önizleme
                  </button>
                  <button
                    onClick={() => setViewMode("code")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      viewMode === "code" 
                        ? "bg-primary text-white" 
                        : "bg-transparent text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-dark-2"
                    }`}
                  >
                    HTML Kodu
                  </button>
                </div>
              </div>
            </div>
            
            {viewMode === "code" ? (
              <div className="p-4">
                <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Dinamik değişkenler: {`{{BUYER_NAME}}, {{BUYER_EMAIL}}, {{BUYER_ADDRESS}}, {{BUYER_PHONE}}, {{BUYER_TC}}, {{ORDER_REF}}, {{DATE}}, {{PRODUCTS_TABLE}}`}</span>
                </div>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={25}
                  className="w-full rounded-lg border border-stroke bg-gray-50 dark:bg-dark-2 px-4 py-3 font-mono text-xs dark:border-dark-3 text-dark dark:text-white"
                  placeholder="HTML kodunuzu buraya yazın..."
                  spellCheck={false}
                />
              </div>
            ) : (
              <div 
                className="p-6 max-h-[600px] overflow-y-auto"
                style={{ backgroundColor: "#0f0f0f" }}
              >
                <div 
                  dangerouslySetInnerHTML={{ __html: editedContent }}
                />
              </div>
            )}

            <div className="flex items-center justify-between gap-3 p-4 border-t border-stroke dark:border-dark-3">
              <div>
                {saveMessage && (
                  <span className={`text-sm ${saveMessage.type === "success" ? "text-green-500" : "text-red-500"}`}>
                    {saveMessage.text}
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setEditedContent(selectedPage.content)}
                  className="px-4 py-2 rounded-lg border border-stroke text-sm hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-dark-2 text-dark dark:text-white"
                >
                  İptal
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Kaydet ve Frontend&apos;e Uygula
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
