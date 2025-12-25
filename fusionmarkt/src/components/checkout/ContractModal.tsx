"use client";

import { X, FileText, Check, Printer, Info } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { AddressFormData } from "@/types/checkout";

// ═══════════════════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  contractType: "termsAndConditions" | "distanceSalesContract";
  billingAddress: AddressFormData | null;
  items: {
    title: string;
    sku?: string;
    variant?: { value?: string };
    price: number;
    quantity: number;
  }[];
  totals: {
    subtotal: number;
    shipping: number;
    discount: number;
    grandTotal: number;
  };
  orderRefNumber: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function formatPrice(price: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(price);
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

// ═══════════════════════════════════════════════════════════════════════════
// SHARED STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = {
  // Section styles
  sectionTitle: (isMobile: boolean) => ({
    fontSize: isMobile ? "14px" : "16px",
    fontWeight: "700" as const,
    color: "#10b981",
    marginBottom: isMobile ? "12px" : "16px",
    paddingBottom: "8px",
    borderBottom: "2px solid rgba(16, 185, 129, 0.3)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  }),
  subTitle: (isMobile: boolean) => ({
    fontSize: isMobile ? "12px" : "14px",
    fontWeight: "600" as const,
    color: "#60a5fa",
    marginBottom: isMobile ? "8px" : "12px",
    marginTop: isMobile ? "16px" : "20px",
  }),
  paragraph: (isMobile: boolean) => ({
    fontSize: isMobile ? "11px" : "13px",
    lineHeight: "1.7",
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: isMobile ? "10px" : "14px",
  }),
  list: (isMobile: boolean) => ({
    fontSize: isMobile ? "11px" : "13px",
    lineHeight: "1.7",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: isMobile ? "10px" : "14px",
    paddingLeft: isMobile ? "16px" : "20px",
    listStyleType: "disc" as const,
  }),
  listItem: {
    marginBottom: "6px",
  },
  infoBox: (isMobile: boolean) => ({
    padding: isMobile ? "12px" : "16px",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    marginBottom: isMobile ? "12px" : "16px",
  }),
  infoRow: (isMobile: boolean) => ({
    display: "flex" as const,
    flexDirection: isMobile ? "column" as const : "row" as const,
    marginBottom: "8px",
    fontSize: isMobile ? "11px" : "13px",
  }),
  infoLabel: (isMobile: boolean) => ({
    color: "rgba(255, 255, 255, 0.5)",
    minWidth: isMobile ? "auto" : "140px",
    marginBottom: isMobile ? "2px" : "0",
  }),
  infoValue: {
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500" as const,
  },
  divider: {
    height: "1px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    margin: "20px 0",
  },
  // Table styles
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    marginBottom: "16px",
  },
  tableHeader: (isMobile: boolean) => ({
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    fontSize: isMobile ? "10px" : "12px",
    fontWeight: "600" as const,
    color: "#10b981",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  }),
  tableHeaderCell: (isMobile: boolean, align: "left" | "center" | "right" = "left") => ({
    padding: isMobile ? "10px 8px" : "12px 16px",
    textAlign: align,
    borderBottom: "2px solid rgba(16, 185, 129, 0.3)",
  }),
  tableRow: {
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  },
  tableCell: (isMobile: boolean, align: "left" | "center" | "right" = "left") => ({
    padding: isMobile ? "10px 8px" : "12px 16px",
    textAlign: align,
    fontSize: isMobile ? "11px" : "13px",
    color: "rgba(255, 255, 255, 0.9)",
    verticalAlign: "top" as const,
  }),
  // Summary box
  summaryBox: (isMobile: boolean) => ({
    padding: isMobile ? "14px" : "20px",
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    borderRadius: "10px",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    marginTop: "16px",
  }),
  summaryRow: (isMobile: boolean) => ({
    display: "flex" as const,
    justifyContent: "space-between" as const,
    marginBottom: "8px",
    fontSize: isMobile ? "11px" : "13px",
    color: "rgba(255, 255, 255, 0.7)",
  }),
  summaryTotal: (isMobile: boolean) => ({
    display: "flex" as const,
    justifyContent: "space-between" as const,
    paddingTop: "12px",
    marginTop: "12px",
    borderTop: "2px solid rgba(16, 185, 129, 0.3)",
    fontSize: isMobile ? "14px" : "16px",
    fontWeight: "700" as const,
    color: "#10b981",
  }),
};

// ═══════════════════════════════════════════════════════════════════════════
// DISTANCE SALES CONTRACT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function DistanceSalesContract({ 
  buyer, 
  items, 
  totals, 
  orderRefNumber, 
  contractDate,
  isMobile 
}: {
  buyer: { fullName: string; tcKimlikNo?: string; address: string; phone: string; email: string };
  items: { title: string; variant?: { value?: string }; price: number; quantity: number }[];
  totals: { subtotal: number; shipping: number; discount: number; grandTotal: number };
  orderRefNumber: string;
  contractDate: string;
  isMobile: boolean;
}) {
  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: isMobile ? "20px" : "30px" }}>
        <h1 style={{ 
          fontSize: isMobile ? "16px" : "22px", 
          fontWeight: "700", 
          color: "#10b981",
          marginBottom: "8px"
        }}>
          MESAFELİ SATIŞ SÖZLEŞMESİ
        </h1>
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          gap: isMobile ? "16px" : "30px",
          flexWrap: "wrap",
          fontSize: isMobile ? "10px" : "12px",
          color: "rgba(255,255,255,0.5)"
        }}>
          <span>Ref: <strong style={{ color: "#60a5fa" }}>{orderRefNumber}</strong></span>
          <span>Tarih: <strong style={{ color: "#60a5fa" }}>{contractDate}</strong></span>
        </div>
      </div>

      {/* TARAFLAR */}
      <div style={styles.sectionTitle(isMobile)}>Taraflar</div>
      
      <div style={styles.subTitle(isMobile)}>Satıcı Bilgileri</div>
      <div style={styles.infoBox(isMobile)}>
        <div style={styles.infoRow(isMobile)}>
          <span style={styles.infoLabel(isMobile)}>Ticaret Unvanı:</span>
          <span style={styles.infoValue}>ASDTC MÜHENDİSLİK TİCARET A.Ş. / FUSIONMARKT LLC</span>
        </div>
        <div style={styles.infoRow(isMobile)}>
          <span style={styles.infoLabel(isMobile)}>Genel Merkez:</span>
          <span style={styles.infoValue}>Turan Güneş Bulvarı, Cezayir Cd. No.6/7, Yıldızevler, ÇANKAYA, ANKARA, TÜRKİYE</span>
        </div>
        <div style={styles.infoRow(isMobile)}>
          <span style={styles.infoLabel(isMobile)}>İade Adresi:</span>
          <span style={styles.infoValue}>Turan Güneş Bulvarı, Cezayir Cd. No.6/7, Yıldızevler, ÇANKAYA, ANKARA, TÜRKİYE</span>
        </div>
        <div style={styles.infoRow(isMobile)}>
          <span style={styles.infoLabel(isMobile)}>Telefon:</span>
          <span style={styles.infoValue}>+90 850 840 6160</span>
        </div>
        <div style={styles.infoRow(isMobile)}>
          <span style={styles.infoLabel(isMobile)}>E-posta:</span>
          <span style={styles.infoValue}>sales@fusionmarkt.com</span>
        </div>
      </div>

      <div style={styles.subTitle(isMobile)}>Alıcı Bilgileri</div>
      <div style={styles.infoBox(isMobile)}>
        <div style={styles.infoRow(isMobile)}>
          <span style={styles.infoLabel(isMobile)}>Ad/Soyad:</span>
          <span style={styles.infoValue}>{buyer.fullName}</span>
        </div>
        <div style={styles.infoRow(isMobile)}>
          <span style={styles.infoLabel(isMobile)}>T.C. Kimlik No:</span>
          <span style={styles.infoValue}>{buyer.tcKimlikNo || "Belirtilmedi"}</span>
        </div>
        <div style={styles.infoRow(isMobile)}>
          <span style={styles.infoLabel(isMobile)}>Adres:</span>
          <span style={styles.infoValue}>{buyer.address}</span>
        </div>
        <div style={styles.infoRow(isMobile)}>
          <span style={styles.infoLabel(isMobile)}>Telefon:</span>
          <span style={styles.infoValue}>{buyer.phone}</span>
        </div>
        <div style={styles.infoRow(isMobile)}>
          <span style={styles.infoLabel(isMobile)}>E-posta:</span>
          <span style={styles.infoValue}>{buyer.email}</span>
        </div>
      </div>

      <div style={styles.divider} />

      {/* KONU */}
      <div style={styles.sectionTitle(isMobile)}>Konu</div>
      <p style={styles.paragraph(isMobile)}>
        İşbu Mesafeli Satış Sözleşmesi&apos;nin konusu, SATICI&apos;ya ait www.fusionmarkt.com ve işbu sözleşme kapsamında 
        ALICI tarafından online olarak verilen siparişe karşılık, satış bedelinin ALICI tarafından ödenmesi, 
        ürünlerin teslimi ve tarafların 27.11.2014 tarihli Resmi Gazete&apos;de yayınlanan Mesafeli Satışlar Yönetmeliği 
        ve 6502 sayılı Tüketicinin Korunması Hakkında Kanun kapsamındaki diğer hak ve yükümlülükleri kapsamaktadır.
      </p>
      <p style={{ ...styles.paragraph(isMobile), fontStyle: "italic", color: "rgba(255,255,255,0.6)" }}>
        Not: Montaj hizmeti işbu Sözleşme&apos;nin konu ve kapsamı dışında tutulmuş olup, talep edilmesi halinde ayrı bir sözleşme ile düzenlenecektir.
      </p>

      <div style={styles.divider} />

      {/* SİPARİŞ ÜRÜNLERİ */}
      <div style={styles.sectionTitle(isMobile)}>Sipariş Ürünleri</div>
      <table style={styles.table}>
        <thead style={styles.tableHeader(isMobile)}>
          <tr>
            <th style={styles.tableHeaderCell(isMobile, "left")}>Ürün</th>
            <th style={styles.tableHeaderCell(isMobile, "center")}>Adet</th>
            <th style={styles.tableHeaderCell(isMobile, "right")}>Fiyat</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} style={styles.tableRow}>
              <td style={styles.tableCell(isMobile, "left")}>
                <div style={{ fontWeight: "500" }}>{item.title}</div>
                {item.variant?.value && (
                  <div style={{ fontSize: isMobile ? "10px" : "11px", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>
                    Varyant: {item.variant.value}
                  </div>
                )}
              </td>
              <td style={{ ...styles.tableCell(isMobile, "center"), fontWeight: "600" }}>{item.quantity}</td>
              <td style={{ ...styles.tableCell(isMobile, "right"), fontWeight: "600", color: "#10b981" }}>
                {formatPrice(item.price * item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Fiyat Özeti */}
      <div style={styles.summaryBox(isMobile)}>
        <div style={styles.summaryRow(isMobile)}>
          <span>Ara Toplam:</span>
          <span style={{ fontWeight: "500" }}>{formatPrice(totals.subtotal)}</span>
        </div>
        <div style={styles.summaryRow(isMobile)}>
          <span>Kargo:</span>
          <span style={{ fontWeight: "500", color: totals.shipping === 0 ? "#10b981" : "inherit" }}>
            {totals.shipping === 0 ? "Ücretsiz" : formatPrice(totals.shipping)}
          </span>
        </div>
        {totals.discount > 0 && (
          <div style={{ ...styles.summaryRow(isMobile), color: "#f87171" }}>
            <span>İndirim:</span>
            <span style={{ fontWeight: "500" }}>-{formatPrice(totals.discount)}</span>
          </div>
        )}
        <div style={styles.summaryTotal(isMobile)}>
          <span>TOPLAM (KDV Dahil):</span>
          <span>{formatPrice(totals.grandTotal)}</span>
        </div>
      </div>

      <div style={styles.divider} />

      {/* ÖDEME */}
      <div style={styles.sectionTitle(isMobile)}>Ödeme</div>
      <p style={styles.paragraph(isMobile)}>
        Minimum Sipariş: İnternet mağazasında minimum sipariş tutarı 150 TL&apos;dir.
      </p>
      <p style={styles.paragraph(isMobile)}>
        ALICI, işbu Sözleşme kapsamında sipariş verdiği ürün(ler) için KDV dahil satış bedelini ve kargo ücretlerini 
        Sözleşme&apos;de belirtilen ödeme koşullarına uygun olarak ödeyecektir.
      </p>
      <ul style={styles.list(isMobile)}>
        <li style={styles.listItem}>Kabul Edilen Kartlar: Visa, Amex, MasterCard kredi kartları</li>
        <li style={styles.listItem}>Ön Provizyon: Siparişler banka onayı sonrası işleme alınır</li>
      </ul>
      <p style={{ ...styles.paragraph(isMobile), fontSize: isMobile ? "10px" : "12px", color: "rgba(255,255,255,0.6)" }}>
        Promosyonlar ve indirimler, ürünün sipariş tarihinde geçerli ise uygulanacaktır. SATICI, bankaların kesintileri veya ücretlerinden sorumlu değildir.
      </p>

      <div style={styles.divider} />

      {/* TESLİMAT */}
      <div style={styles.sectionTitle(isMobile)}>Teslimat</div>
      <p style={styles.paragraph(isMobile)}>
        ALICI tarafından internet üzerinden siparişi verilen ürün/ürünler, verilen 30 (otuz) günlük yasal süre içerisinde 
        SATICI&apos;nın anlaşmalı kargo şirketi tarafından ALICI&apos;ya veya ALICI&apos;nın belirttiği adreste bulunan kişilere teslim edilir.
      </p>
      <ul style={styles.list(isMobile)}>
        <li style={styles.listItem}><strong>Aynı Gün Teslimat:</strong> Ürünler siparişin verildiği gün teslim edilir.</li>
        <li style={styles.listItem}><strong>Randevulu Teslimat:</strong> ALICI&apos;nın belirlediği tarihte teslim edilir.</li>
      </ul>
      <p style={{ ...styles.paragraph(isMobile), fontStyle: "italic", color: "rgba(255,255,255,0.6)" }}>
        Not: ALICI&apos;nın teslimat sırasında adreste bulunmaması halinde dahi SATICI edimini eksiksiz olarak yerine getirmiş sayılacaktır.
      </p>

      <div style={styles.divider} />

      {/* CAYMA HAKKI */}
      <div style={styles.sectionTitle(isMobile)}>Cayma Hakkı</div>
      <p style={styles.paragraph(isMobile)}>
        ALICI, Sözleşme kapsamındaki ürünlerin kendisine veya gösterdiği adresteki kişiye tesliminden itibaren 
        <strong style={{ color: "#10b981" }}> 14 (on dört) gün</strong> içinde cayma hakkını kullanabilir.
      </p>
      
      <div style={styles.subTitle(isMobile)}>Cayma Hakkı Şartları:</div>
      <ul style={styles.list(isMobile)}>
        <li style={styles.listItem}>Ürünler tekrar satılabilir durumda, hasarsız ve orijinal ambalajında olmalıdır</li>
        <li style={styles.listItem}>SATICI&apos;ya yazılı veya müşteri hizmetleri aracılığıyla bildirimde bulunulmalıdır</li>
        <li style={styles.listItem}>İade masrafları SATICI tarafından karşılanacaktır</li>
      </ul>

      <div style={styles.subTitle(isMobile)}>Cayma Hakkı Kapsamı Dışındaki Ürünler:</div>
      <ul style={styles.list(isMobile)}>
        <li style={styles.listItem}>Fiyatı finansal piyasalardaki dalgalanmalara bağlı olarak değişen ürünler</li>
        <li style={styles.listItem}>Sağlık ve hijyen nedenleriyle iade edilemeyen ürünler</li>
        <li style={styles.listItem}>Kişisel ihtiyaçlara göre hazırlanan ürünler</li>
      </ul>
      <p style={styles.paragraph(isMobile)}>
        <strong>İade Süresi:</strong> Cayma hakkının kullanılması halinde, ürünlerin iadesi sonrası 14 gün içinde ödenen tutar ALICI&apos;ya iade edilir.
      </p>

      <div style={styles.divider} />

      {/* GARANTİ */}
      <div style={styles.sectionTitle(isMobile)}>Garanti ve Sorumluluk</div>
      <ul style={styles.list(isMobile)}>
        <li style={styles.listItem}><strong>2 Yıl Garanti</strong> süresi, ürünün teslimat tarihinden itibaren geçerlidir.</li>
        <li style={styles.listItem}><strong>Değişim Durumu:</strong> Garanti kapsamında değiştirilen ürünler için süre, ilk ürünün kalan garanti süresi ile sınırlıdır.</li>
        <li style={styles.listItem}>SATICI, garanti koşullarına uymayan veya yetkisiz müdahaleye uğramış ürünler için sorumluluk kabul etmez.</li>
        <li style={styles.listItem}>ALICI, ürünlerin kullanım talimatlarına uygun olarak kullanılmaması durumunda doğacak zararlardan kendisinin sorumlu olduğunu kabul eder.</li>
      </ul>

      <div style={styles.divider} />

      {/* KİŞİSEL VERİLER */}
      <div style={styles.sectionTitle(isMobile)}>Kişisel Verilerin Korunması</div>
      <p style={styles.paragraph(isMobile)}>
        SATICI, ALICI&apos;ya ait kişisel bilgileri ilgili mevzuat kapsamında işleyebilir ve saklayabilir. 
        ALICI, kişisel verilerinin işlenmesi ile ilgili her türlü talebi SATICI&apos;ya iletebilir.
      </p>
      <div style={styles.subTitle(isMobile)}>KVKK Kapsamında Haklarınız:</div>
      <ul style={styles.list(isMobile)}>
        <li style={styles.listItem}>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
        <li style={styles.listItem}>Eksik veya hatalı işlenmişse düzeltilmesini isteme</li>
        <li style={styles.listItem}>İşlenme amacının ortadan kalkması durumunda silinmesini talep etme</li>
      </ul>

      <div style={styles.divider} />

      {/* UYUŞMAZLIK */}
      <div style={styles.sectionTitle(isMobile)}>Uyuşmazlıkların Çözümü</div>
      <p style={styles.paragraph(isMobile)}>
        İşbu Sözleşme&apos;nin uygulanmasından ve yorumlanmasından doğabilecek her türlü uyuşmazlıkların çözümünde Türk Hukuku uygulanacaktır.
      </p>
      <ul style={styles.list(isMobile)}>
        <li style={styles.listItem}><strong>Tüketici Hakem Heyetleri:</strong> 6502 sayılı Kanun kapsamında başvuru yapılabilir.</li>
        <li style={styles.listItem}><strong>Tüketici Mahkemeleri:</strong> Hakem heyeti sınırlarını aşan uyuşmazlıklar için yetkilidir.</li>
      </ul>
      <p style={{ ...styles.paragraph(isMobile), fontStyle: "italic", color: "rgba(255,255,255,0.6)" }}>
        Dil: ALICI ve SATICI arasında farklı dillerde yapılan sözleşmelerde çelişki olması halinde Türkçe versiyon geçerli olacaktır.
      </p>

      <div style={styles.divider} />

      {/* MÜCBİR SEBEP */}
      <div style={styles.sectionTitle(isMobile)}>Mücbir Sebep</div>
      <p style={styles.paragraph(isMobile)}>
        Mücbir sebep halleri (doğal afetler, savaş, ayaklanma, grev, salgın hastalıklar vb.) tarafların kontrolü dışında 
        gelişen ve tarafların yükümlülüklerini yerine getirmesini engelleyen durumlardır.
      </p>
      <p style={styles.paragraph(isMobile)}>
        Mücbir sebep halinde SATICI, ALICI&apos;ya durumu bildirir ve teslimat süresi ertelenebilir veya sipariş iptal edilerek iade yapılabilir.
      </p>

      <div style={styles.divider} />

      {/* ONAY */}
      <div style={styles.sectionTitle(isMobile)}>Sözleşme Tarihi ve Onayı</div>
      <p style={styles.paragraph(isMobile)}>
        Bu sözleşme, ALICI tarafından elektronik ortamda onaylandığı tarihte yürürlüğe girer.
      </p>
      <div style={{ 
        ...styles.infoBox(isMobile), 
        backgroundColor: "rgba(16, 185, 129, 0.1)", 
        border: "1px solid rgba(16, 185, 129, 0.3)" 
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ fontSize: isMobile ? "10px" : "11px", color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}>SATICI</div>
            <div style={{ fontSize: isMobile ? "12px" : "14px", fontWeight: "600", color: "#10b981" }}>
              ASDTC MÜHENDİSLİK TİCARET A.Ş. / FUSIONMARKT LLC
            </div>
          </div>
          <div>
            <div style={{ fontSize: isMobile ? "10px" : "11px", color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}>ALICI</div>
            <div style={{ fontSize: isMobile ? "12px" : "14px", fontWeight: "600", color: "#60a5fa" }}>
              {buyer.fullName}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TERMS AND CONDITIONS COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function TermsAndConditions({ 
  buyer, 
  orderRefNumber, 
  contractDate,
  isMobile 
}: {
  buyer: { fullName: string; email: string };
  orderRefNumber: string;
  contractDate: string;
  isMobile: boolean;
}) {
  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: isMobile ? "20px" : "30px" }}>
        <h1 style={{ 
          fontSize: isMobile ? "16px" : "22px", 
          fontWeight: "700", 
          color: "#10b981",
          marginBottom: "8px"
        }}>
          KULLANICI SÖZLEŞMESİ VE ŞARTLAR
        </h1>
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          gap: isMobile ? "16px" : "30px",
          flexWrap: "wrap",
          fontSize: isMobile ? "10px" : "12px",
          color: "rgba(255,255,255,0.5)"
        }}>
          <span>Ref: <strong style={{ color: "#60a5fa" }}>{orderRefNumber}</strong></span>
          <span>Tarih: <strong style={{ color: "#60a5fa" }}>{contractDate}</strong></span>
        </div>
      </div>

      {/* Kullanıcı Bilgileri */}
      <div style={styles.infoBox(isMobile)}>
        <div style={styles.infoRow(isMobile)}>
          <span style={styles.infoLabel(isMobile)}>Kullanıcı:</span>
          <span style={styles.infoValue}>{buyer.fullName}</span>
        </div>
        <div style={styles.infoRow(isMobile)}>
          <span style={styles.infoLabel(isMobile)}>E-posta:</span>
          <span style={styles.infoValue}>{buyer.email}</span>
        </div>
      </div>

      <div style={styles.divider} />

      {/* 1. GENEL HÜKÜMLER */}
      <div style={styles.sectionTitle(isMobile)}>1. Genel Hükümler</div>
      <p style={styles.paragraph(isMobile)}>
        Bu web sitesini (www.fusionmarkt.com) kullanarak, işbu kullanım koşullarını kabul etmiş sayılırsınız. 
        Site üzerinden alışveriş yapmanız halinde Mesafeli Satış Sözleşmesi hükümleri de geçerli olacaktır.
      </p>
      <div style={{ 
        ...styles.infoBox(isMobile), 
        backgroundColor: "rgba(251, 191, 36, 0.1)", 
        border: "1px solid rgba(251, 191, 36, 0.3)" 
      }}>
        <p style={{ ...styles.paragraph(isMobile), margin: 0, color: "#fbbf24", fontWeight: "500" }}>
          ⚠️ LÜTFEN BU SİTEYİ KULLANMADAN ÖNCE AŞAĞIDAKİ HÜKÜM VE KOŞULLARI DİKKATLİCE OKUYUN.
        </p>
      </div>

      <div style={styles.divider} />

      {/* 2. HİZMET TANIMI */}
      <div style={styles.sectionTitle(isMobile)}>2. Hizmet Tanımı</div>
      <p style={styles.paragraph(isMobile)}>
        FusionMarkt, teknoloji ürünleri satan bir e-ticaret platformudur. Sitede sunulan ürünler stok durumuna göre 
        değişebilir ve fiyatlar önceden haber verilmeksizin güncellenebilir.
      </p>

      <div style={styles.divider} />

      {/* 3. ÜYELİK KOŞULLARI */}
      <div style={styles.sectionTitle(isMobile)}>3. Üyelik Koşulları</div>
      <ul style={styles.list(isMobile)}>
        <li style={styles.listItem}>Üyelik için 18 yaşından büyük olmak veya yasal veli iznine sahip olmak gerekmektedir</li>
        <li style={styles.listItem}>Sağlanan bilgilerin doğruluğundan kullanıcı sorumludur</li>
        <li style={styles.listItem}>Hesap güvenliği kullanıcının sorumluluğundadır</li>
        <li style={styles.listItem}>Şifrenizin üçüncü kişilerle paylaşılmaması gerekmektedir</li>
      </ul>

      <div style={styles.divider} />

      {/* 4. FİKRİ MÜLKİYET */}
      <div style={styles.sectionTitle(isMobile)}>4. Fikri Mülkiyet Hakları</div>
      <p style={styles.paragraph(isMobile)}>
        Site içeriği, logoları, tasarımları ve diğer tüm materyaller FusionMarkt&apos;ın mülkiyetindedir. İzinsiz kullanımı yasaktır.
      </p>
      <ul style={styles.list(isMobile)}>
        <li style={styles.listItem}>Site tasarımının kopyalanması yasaktır</li>
        <li style={styles.listItem}>Ürün görsellerinin izinsiz kullanımı yasaktır</li>
        <li style={styles.listItem}>Marka ve logoların üçüncü taraflarca kullanımı yasaktır</li>
      </ul>

      <div style={styles.divider} />

      {/* 5. GİZLİLİK */}
      <div style={styles.sectionTitle(isMobile)}>5. Gizlilik</div>
      <p style={styles.paragraph(isMobile)}>
        Kişisel verileriniz Gizlilik Politikamız ve KVKK kapsamında işlenmektedir.
      </p>
      <ul style={styles.list(isMobile)}>
        <li style={styles.listItem}>Verileriniz yalnızca hizmet amaçlı kullanılır</li>
        <li style={styles.listItem}>Yasal zorunluluklar dışında üçüncü taraflarla paylaşılmaz</li>
        <li style={styles.listItem}>256-bit SSL şifreleme ile korunmaktadır</li>
      </ul>

      <div style={styles.divider} />

      {/* 6. SORUMLULUK REDDİ */}
      <div style={styles.sectionTitle(isMobile)}>6. Sorumluluk Reddi</div>
      <p style={styles.paragraph(isMobile)}>
        FusionMarkt, site kullanımından kaynaklanabilecek doğrudan veya dolaylı zararlardan sorumlu tutulamaz.
      </p>
      <div style={styles.subTitle(isMobile)}>Ancak şu durumlarda sorumluluk kabul eder:</div>
      <ul style={styles.list(isMobile)}>
        <li style={styles.listItem}>Sipariş edilen ürünlerin teslimi</li>
        <li style={styles.listItem}>Garanti kapsamındaki ürün arızaları</li>
        <li style={styles.listItem}>Yasal cayma hakkı süresinde iadeler</li>
      </ul>

      <div style={styles.divider} />

      {/* 7. DEĞİŞİKLİKLER */}
      <div style={styles.sectionTitle(isMobile)}>7. Değişiklikler</div>
      <p style={styles.paragraph(isMobile)}>
        Bu sözleşme şartları önceden haber verilmeksizin değiştirilebilir. Güncel versiyon her zaman sitede yayınlanacaktır.
      </p>
      <ul style={styles.list(isMobile)}>
        <li style={styles.listItem}>E-posta bültenimize abone olabilirsiniz</li>
        <li style={styles.listItem}>Siteyi düzenli olarak ziyaret edebilirsiniz</li>
      </ul>

      <div style={styles.divider} />

      {/* 8. UYGULANACAK HUKUK */}
      <div style={styles.sectionTitle(isMobile)}>8. Uygulanacak Hukuk</div>
      <p style={styles.paragraph(isMobile)}>
        Bu sözleşme Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlıklarda Ankara Mahkemeleri ve İcra Daireleri yetkilidir.
      </p>

      <div style={styles.divider} />

      {/* ONAY */}
      <div style={styles.sectionTitle(isMobile)}>Onay</div>
      <p style={styles.paragraph(isMobile)}>
        Bu sözleşmeyi elektronik ortamda onaylayarak, yukarıdaki tüm şartları okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan etmiş olursunuz.
      </p>
      <div style={{ 
        ...styles.infoBox(isMobile), 
        backgroundColor: "rgba(16, 185, 129, 0.1)", 
        border: "1px solid rgba(16, 185, 129, 0.3)" 
      }}>
        <div style={{ fontSize: isMobile ? "10px" : "12px", color: "rgba(255,255,255,0.5)", marginBottom: "8px" }}>
          Son Güncelleme: 25 Aralık 2024
        </div>
        <div style={{ fontSize: isMobile ? "12px" : "14px", fontWeight: "600", color: "#10b981" }}>
          ASDTC MÜHENDİSLİK TİCARET A.Ş. | FUSIONMARKT LLC
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN CONTRACT MODAL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function ContractModal({
  isOpen,
  onClose,
  onAccept,
  contractType,
  billingAddress,
  items,
  totals,
  orderRefNumber,
}: ContractModalProps) {
  const [isMobile, setIsMobile] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const contractDate = formatDate(new Date());
  const contractTitle = contractType === "distanceSalesContract" 
    ? "Mesafeli Satış Sözleşmesi" 
    : "Kullanıcı Sözleşmesi ve Şartlar";

  const buyerInfo = {
    fullName: billingAddress 
      ? `${billingAddress.firstName} ${billingAddress.lastName}` 
      : "Belirtilmedi",
    tcKimlikNo: billingAddress?.tcKimlikNo,
    address: billingAddress 
      ? `${billingAddress.addressLine1}${billingAddress.addressLine2 ? ", " + billingAddress.addressLine2 : ""}, ${billingAddress.district}, ${billingAddress.city}` 
      : "Belirtilmedi",
    phone: billingAddress?.phone || "Belirtilmedi",
    email: billingAddress?.email || "Belirtilmedi",
  };

  const handlePrint = () => {
    if (contentRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${contractTitle}</title>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                padding: 40px; 
                color: #1a1a1a;
                line-height: 1.6;
              }
              h1 { color: #059669; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th { background: #f0fdf4; color: #059669; padding: 12px; text-align: left; border-bottom: 2px solid #059669; }
              td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
              .section-title { color: #059669; font-size: 16px; font-weight: 600; margin-top: 24px; border-bottom: 2px solid #d1fae5; padding-bottom: 8px; }
              .info-box { background: #f9fafb; padding: 16px; border-radius: 8px; margin: 12px 0; }
              .summary-box { background: #f0fdf4; padding: 20px; border-radius: 8px; border: 1px solid #d1fae5; }
              ul { padding-left: 20px; }
              li { margin-bottom: 8px; }
              @media print { body { padding: 20px; } }
            </style>
          </head>
          <body>${contentRef.current.innerHTML}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(8px)",
        padding: isMobile ? "0" : "20px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          backgroundColor: "#0f0f0f",
          borderRadius: isMobile ? "0" : "16px",
          width: isMobile ? "100%" : "min(900px, 95vw)",
          height: isMobile ? "100%" : "min(90vh, 900px)",
          display: "flex",
          flexDirection: "column",
          border: isMobile ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: isMobile ? "16px" : "20px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            backgroundColor: "rgba(16, 185, 129, 0.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
            <div
              style={{
                width: isMobile ? "36px" : "44px",
                height: isMobile ? "36px" : "44px",
                borderRadius: "12px",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FileText size={isMobile ? 18 : 22} color="#10b981" />
            </div>
            <div style={{ minWidth: 0 }}>
              <h2
                style={{
                  fontSize: isMobile ? "15px" : "18px",
                  fontWeight: "600",
                  color: "#fff",
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {contractTitle}
              </h2>
              <p
                style={{
                  fontSize: isMobile ? "11px" : "13px",
                  color: "rgba(255, 255, 255, 0.5)",
                  margin: 0,
                }}
              >
                Ref: {orderRefNumber}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handlePrint}
              style={{
                width: isMobile ? "36px" : "40px",
                height: isMobile ? "36px" : "40px",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backgroundColor: "transparent",
                color: "rgba(255, 255, 255, 0.6)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
              title="Yazdır"
            >
              <Printer size={18} />
            </button>
            <button
              onClick={onClose}
              style={{
                width: isMobile ? "36px" : "40px",
                height: isMobile ? "36px" : "40px",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backgroundColor: "transparent",
                color: "rgba(255, 255, 255, 0.6)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div
          style={{
            padding: isMobile ? "10px 16px" : "12px 24px",
            backgroundColor: "rgba(59, 130, 246, 0.08)",
            borderBottom: "1px solid rgba(59, 130, 246, 0.2)",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            flexShrink: 0,
          }}
        >
          <Info size={16} color="#3b82f6" style={{ flexShrink: 0, marginTop: "2px" }} />
          <span style={{ fontSize: isMobile ? "11px" : "13px", color: "#93c5fd", lineHeight: 1.4 }}>
            Aşağıdaki sözleşme kişisel bilgileriniz ile doldurulmuştur. Onaylamadan önce lütfen dikkatle okuyunuz.
          </span>
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          style={{
            flex: 1,
            overflow: "auto",
            padding: isMobile ? "16px" : "24px",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {contractType === "distanceSalesContract" ? (
            <DistanceSalesContract
              buyer={buyerInfo}
              items={items}
              totals={totals}
              orderRefNumber={orderRefNumber}
              contractDate={contractDate}
              isMobile={isMobile}
            />
          ) : (
            <TermsAndConditions
              buyer={{ fullName: buyerInfo.fullName, email: buyerInfo.email }}
              orderRefNumber={orderRefNumber}
              contractDate={contractDate}
              isMobile={isMobile}
            />
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: isMobile ? "16px" : "20px 24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: "12px",
            flexShrink: 0,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
          }}
        >
          <button
            onClick={onAccept}
            style={{
              flex: 1,
              padding: isMobile ? "14px" : "16px 24px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "#10b981",
              color: "#fff",
              fontSize: isMobile ? "14px" : "15px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s ease",
            }}
          >
            <Check size={18} strokeWidth={3} />
            Okudum ve Kabul Ediyorum
          </button>
          <button
            onClick={onClose}
            style={{
              padding: isMobile ? "14px" : "16px 24px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              backgroundColor: "transparent",
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: isMobile ? "14px" : "15px",
              fontWeight: "500",
              cursor: "pointer",
              minWidth: isMobile ? "100%" : "120px",
            }}
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
