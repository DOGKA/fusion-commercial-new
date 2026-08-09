/**
 * Mesafeli satış sözleşmesinin hukuki metin kaynağı.
 *
 * Checkout önizlemesi ve siparişe kaydedilen değişmez HTML aynı sabitleri
 * kullanır. Metin değiştiğinde sürüm de değiştirilmelidir; eski siparişlerde
 * saklanan HTML geriye dönük güncellenmez.
 */
export const DISTANCE_CONTRACT_VERSION = "2026-08-09";
export const DISTANCE_CONTRACT_VERSION_LABEL = "9 Ağustos 2026";

export const DISTANCE_CONTRACT_SELLER = {
  title: "ASDTC MÜHENDİSLİK TİCARET A.Ş. / FUSIONMARKT LLC",
  address:
    "Turan Güneş Bulvarı, Cezayir Cd. No.6/7, Yıldızevler, ÇANKAYA, ANKARA, TÜRKİYE",
  returnAddress:
    "Turan Güneş Bulvarı, Cezayir Cd. No.6/7, Yıldızevler, ÇANKAYA, ANKARA, TÜRKİYE",
  /** Telefon hattı yayınlanmıyor; müşteri iletişimi form üzerinden. */
  contactUrl: "https://fusionmarkt.com/iletisim",
  email: "sales@fusionmarkt.com",
} as const;

export const DISTANCE_CONTRACT_TEXT = {
  subject:
    "İşbu Mesafeli Satış Sözleşmesi'nin konusu, SATICI'ya ait www.fusionmarkt.com ve işbu sözleşme kapsamında ALICI tarafından online olarak verilen siparişe karşılık, satış bedelinin ALICI tarafından ödenmesi, ürünlerin teslimi ve tarafların 27.11.2014 tarihli Resmi Gazete'de yayınlanan Mesafeli Satışlar Yönetmeliği ve 6502 sayılı Tüketicinin Korunması Hakkında Kanun kapsamındaki diğer hak ve yükümlülükleri kapsamaktadır.",
  montageNote:
    "Not: Montaj hizmeti işbu Sözleşme'nin konu ve kapsamı dışında tutulmuş olup, talep edilmesi halinde ayrı bir sözleşme ile düzenlenecektir.",
  minimumOrder: "Minimum Sipariş: İnternet mağazasında minimum sipariş tutarı 150 TL'dir.",
  payment:
    "ALICI, işbu Sözleşme kapsamında sipariş verdiği ürün(ler) için KDV dahil satış bedelini ve kargo ücretlerini Sözleşme'de belirtilen ödeme koşullarına uygun olarak ödeyecektir.",
  paymentNotes: [
    "Kabul Edilen Kartlar: Visa, Amex, MasterCard kredi kartları",
    "Ön Provizyon: Siparişler banka onayı sonrası işleme alınır",
  ],
  promotions:
    "Promosyonlar ve indirimler, ürünün sipariş tarihinde geçerli ise uygulanacaktır. SATICI, bankaların kesintileri veya ücretlerinden sorumlu değildir.",
  delivery:
    "ALICI tarafından internet üzerinden siparişi verilen ürün/ürünler, verilen 30 (otuz) günlük yasal süre içerisinde SATICI'nın anlaşmalı kargo şirketi tarafından ALICI'ya veya ALICI'nın belirttiği adreste bulunan kişilere teslim edilir.",
  deliveryOptions: [
    "Aynı Gün Teslimat: Ürünler siparişin verildiği gün teslim edilir.",
    "Randevulu Teslimat: ALICI'nın belirlediği tarihte teslim edilir.",
  ],
  deliveryNote:
    "Not: ALICI'nın teslimat sırasında adreste bulunmaması halinde dahi SATICI edimini eksiksiz olarak yerine getirmiş sayılacaktır.",
  withdrawal:
    "ALICI, Sözleşme kapsamındaki ürünlerin kendisine veya gösterdiği adresteki kişiye tesliminden itibaren 14 (on dört) gün içinde cayma hakkını kullanabilir.",
  withdrawalConditions: [
    "Ürünler tekrar satılabilir durumda, hasarsız ve orijinal ambalajında olmalıdır",
    "SATICI'ya yazılı veya müşteri hizmetleri aracılığıyla bildirimde bulunulmalıdır",
    "İade masrafları SATICI tarafından karşılanacaktır",
  ],
  withdrawalExceptions: [
    "Fiyatı finansal piyasalardaki dalgalanmalara bağlı olarak değişen ürünler",
    "Sağlık ve hijyen nedenleriyle iade edilemeyen ürünler",
    "Kişisel ihtiyaçlara göre hazırlanan ürünler",
  ],
  refund:
    "İade Süresi: Cayma hakkının kullanılması halinde, ürünlerin iadesi sonrası 14 gün içinde ödenen tutar ALICI'ya iade edilir.",
  warranty: [
    "2 Yıl Garanti süresi, ürünün teslimat tarihinden itibaren geçerlidir.",
    "Değişim Durumu: Garanti kapsamında değiştirilen ürünler için süre, ilk ürünün kalan garanti süresi ile sınırlıdır.",
    "SATICI, garanti koşullarına uymayan veya yetkisiz müdahaleye uğramış ürünler için sorumluluk kabul etmez.",
    "ALICI, ürünlerin kullanım talimatlarına uygun olarak kullanılmaması durumunda doğacak zararlardan kendisinin sorumlu olduğunu kabul eder.",
  ],
  privacy:
    "SATICI, ALICI'ya ait kişisel bilgileri ilgili mevzuat kapsamında işleyebilir ve saklayabilir. ALICI, kişisel verilerinin işlenmesi ile ilgili her türlü talebi SATICI'ya iletebilir.",
  privacyRights: [
    "Kişisel verilerinizin işlenip işlenmediğini öğrenme",
    "Eksik veya hatalı işlenmişse düzeltilmesini isteme",
    "İşlenme amacının ortadan kalkması durumunda silinmesini talep etme",
  ],
  disputes:
    "İşbu Sözleşme'nin uygulanmasından ve yorumlanmasından doğabilecek her türlü uyuşmazlıkların çözümünde Türk Hukuku uygulanacaktır.",
  disputeOptions: [
    "Tüketici Hakem Heyetleri: 6502 sayılı Kanun kapsamında başvuru yapılabilir.",
    "Tüketici Mahkemeleri: Hakem heyeti sınırlarını aşan uyuşmazlıklar için yetkilidir.",
  ],
  language:
    "Dil: ALICI ve SATICI arasında farklı dillerde yapılan sözleşmelerde çelişki olması halinde Türkçe versiyon geçerli olacaktır.",
  forceMajeure:
    "Mücbir sebep halleri (doğal afetler, savaş, ayaklanma, grev, salgın hastalıklar vb.) tarafların kontrolü dışında gelişen ve tarafların yükümlülüklerini yerine getirmesini engelleyen durumlardır.",
  forceMajeureResult:
    "Mücbir sebep halinde SATICI, ALICI'ya durumu bildirir ve teslimat süresi ertelenebilir veya sipariş iptal edilerek iade yapılabilir.",
  acceptance:
    "Bu sözleşme, ALICI tarafından elektronik ortamda onaylandığı tarihte yürürlüğe girer.",
} as const;
