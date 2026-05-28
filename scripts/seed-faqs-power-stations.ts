/**
 * FusionMarkt - Taşınabilir Güç Kaynağı SSS Seed Script
 *
 * IEETek "Portable Power Station - Comprehensive FAQ & User Guide" dokümanının
 * Türkçe çevirisini SSS veritabanına ekler.
 *
 * 5 yeni kategori oluşturur:
 *   1. Batarya Yaşam Döngüsü ve Bakım
 *   2. Kapasite, Çalışma Süresi ve Genişletme
 *   3. Şarj Yöntemleri ve Hızı
 *   4. Güvenlik ve Günlük Kullanım
 *   5. Akıllı Uygulama Kullanımı
 *
 * Script idempotent'tir: tekrar çalıştırılırsa duplikasyon yapmaz,
 * bu 5 kategori altındaki mevcut soruları silip yeniden oluşturur.
 *
 * Kullanım:
 *   npx tsx scripts/seed-faqs-power-stations.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface FaqCategoryInput {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  order: number;
}

interface FaqInput {
  question: string;
  answer: string;
  order: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// YENİ KATEGORİLER (Güç Kaynakları alt kategorileri)
// ═══════════════════════════════════════════════════════════════════════════

const categories: FaqCategoryInput[] = [
  {
    name: "Batarya Yaşam Döngüsü ve Bakım",
    slug: "guc-kaynagi-batarya-bakim",
    description:
      "LiFePO4 batarya ömrü, depolama, bakım ve şarj alışkanlıkları hakkında sorular",
    icon: "Battery",
    color: "#10B981",
    order: 10,
  },
  {
    name: "Kapasite, Çalışma Süresi ve Genişletme",
    slug: "guc-kaynagi-kapasite-genisletme",
    description:
      "Çalışma süresi, ev aletleri uyumluluğu, SmartDrive ve genişletme bataryaları",
    icon: "Gauge",
    color: "#06B6D4",
    order: 11,
  },
  {
    name: "Şarj Yöntemleri ve Hızı",
    slug: "guc-kaynagi-sarj-yontemleri",
    description:
      "Şebeke, solar, araç, jeneratör şarjı ve şarj hızı ile ilgili sorular",
    icon: "Zap",
    color: "#F59E0B",
    order: 12,
  },
  {
    name: "Güvenlik ve Günlük Kullanım",
    slug: "guc-kaynagi-guvenlik-kullanim",
    description:
      "BMS koruması, UPS modu, iç mekan kullanımı ve güvenlik önlemleri",
    icon: "ShieldCheck",
    color: "#EF4444",
    order: 13,
  },
  {
    name: "Akıllı Uygulama Kullanımı",
    slug: "guc-kaynagi-akilli-uygulama",
    description: "IEETek mobil uygulama, Wi-Fi/Bluetooth bağlantısı ve OTA güncelleme",
    icon: "Smartphone",
    color: "#8B5CF6",
    order: 14,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// SORULAR VE CEVAPLAR (Kategori slug'ına göre)
// ═══════════════════════════════════════════════════════════════════════════

const faqsByCategory: Record<string, FaqInput[]> = {
  // ──────────────────────────────────────────────────────────────────────
  // BÖLÜM 1: BATARYA YAŞAM DÖNGÜSÜ VE BAKIM
  // ──────────────────────────────────────────────────────────────────────
  "guc-kaynagi-batarya-bakim": [
    {
      question: "IEETek hangi tip batarya kullanıyor ve beklenen yaşam ömrü nedir?",
      answer:
        "IEETek, tüm taşınabilir güç kaynaklarında premium EV sınıfı LiFePO₄ (Lityum Demir Fosfat) bataryalar kullanır. Olağanüstü güvenlik ve dayanıklılıkları ile bilinen bu bataryalar, kendi geliştirdiğimiz şirket içi inverter kartımızla birlikte 4.000 şarj döngüsüne kadar (25°C'de, 0.5C şarj/deşarj, %80 deşarj derinliğinde) ömür sağlar. Bu, yaklaşık 10 yıllık düzenli günlük kullanıma eşdeğerdir ve bu süre sonunda dahi mükemmel kapasitesini korumaya devam eder.",
      order: 1,
    },
    {
      question: "Taşınabilir güç kaynağı uzun süre kullanılmazsa bakım gerekir mi?",
      answer:
        "Evet. Uzun süreli depolama sırasında optimum batarya sağlığını korumak için üniteyi kuru bir yerde tutmanızı ve gövdesi ile tüm çıkış portlarını (DC, AC ve USB) tüy bırakmayan bir bezle temizlemenizi öneririz. IEETek ürünleri, kritik düşük batarya durumuna girmeden bir yıla kadar kullanılmadan saklanabilse de batarya hücrelerini aktif tutmak için üniteyi her üç ayda bir tamamen şarj edip deşarj etmenizi şiddetle tavsiye ederiz.",
      order: 2,
    },
    {
      question: "Hiçbir cihaz bağlı değilken taşınabilir güç kaynağı enerji harcamaya devam eder mi?",
      answer:
        "Evet. DC veya AC çıkışları açık olduğunda sistem bekleme modunda kalır ve bu durum küçük ama sürekli bir batarya tüketimine (boşta güç tüketimi) yol açar. Uzun süre herhangi bir cihaz takmayı planlamıyorsanız, enerjiden tasarruf etmek için tüm AC ve DC çıkışlarını kapatmanızı şiddetle öneririz.",
      order: 3,
    },
    {
      question: "Prizde takılı bırakmak bataryaya zarar verir mi?",
      answer:
        "Hayır. IEETek güç kaynakları, sıkı aşırı şarj korumasına sahip gelişmiş bir Batarya Yönetim Sistemi (BMS) ile donatılmıştır. Tam dolduğunda otomatik olarak güç çekmeyi durdurur. Ev acil durum UPS'i olarak kullanmak üzere güvenle prize takılı bırakabilirsiniz.",
      order: 4,
    },
    {
      question: "Yaşam ömrü dolduğunda dahili bataryayı kendim değiştirebilir miyim?",
      answer:
        "Hayır. Dahili LiFePO4 batarya paketi, karmaşık kablolama ve Batarya Yönetim Sistemi (BMS) ile entegredir. Gövdeyi kendiniz açmak ciddi elektriksel güvenlik riskleri oluşturur ve garantiyi geçersiz kılar. Profesyonel onarım veya değişim seçenekleri için lütfen yetkili bayinize başvurun.",
      order: 5,
    },
    {
      question: "Sık hızlı şarj bataryayı daha hızlı yıpratır mı?",
      answer:
        "EV sınıfı LiFePO4 bataryalarımız hızlı şarjı verimli şekilde işlemek için tasarlanmış olsa ve geleneksel bataryalardan daha az ısı üretse de, her gün yalnızca maksimum hızda AC şarja güvenmek teorik olarak küçük, uzun vadeli yıpranmaya yol açabilir. Mutlak maksimum kullanım ömrü için, zaman izin verdiğinde 'Yavaş Şarj Modu'nu kullanmanızı öneririz.",
      order: 6,
    },
    {
      question: "Bu bataryalarda \"hafıza etkisi\" var mı? Her seferinde %0'a kadar boşaltmam gerekiyor mu?",
      answer:
        "Hayır. Eski Nikel-Kadmiyum (Ni-Cd) bataryaların aksine, LiFePO4 bataryalarımızda hiçbir hafıza etkisi yoktur. Tekrar şarj etmeden önce bataryayı tamamen boşaltmanıza gerek yoktur. Aslında, sık \"kısmi şarjlar\" yapmak (örn. %30'dan %80'e) batarya için tamamen sağlıklıdır.",
      order: 7,
    },
    {
      question: "Güç kaynağını nasıl güvenli şekilde temizlemeliyim?",
      answer:
        "Temizlemeden önce güç kaynağının tamamen kapalı ve fişten çekilmiş olduğundan her zaman emin olun. Dış yüzeyi nazikçe silmek için kuru, yumuşak ve tüy bırakmayan bir bez kullanın. Asla kimyasal çözücüler, alkol veya ıslak mendiller kullanmayın ve soğutma havalandırma deliklerine veya çıkış portlarına sıvı ya da toz girmemesine dikkat edin.",
      order: 8,
    },
    {
      question: "Batarya %100'e şarj olduktan hemen sonra yüzde değeri neden hafifçe düşer?",
      answer:
        "Bu, normal bir BMS kalibrasyon sürecidir. Şarj tamamlandığında, bataryanın voltajı doğal olarak \"şarj zirvesinden\" stabil bir \"dinlenme float voltajına\" iner. BMS bu küçük voltaj düşüşünü kaydeder ve fişten çıkarıldıktan kısa süre sonra ekranda %99 görünmesine neden olabilir.",
      order: 9,
    },
  ],

  // ──────────────────────────────────────────────────────────────────────
  // BÖLÜM 2: KAPASİTE, ÇALIŞMA SÜRESİ VE GENİŞLETME
  // ──────────────────────────────────────────────────────────────────────
  "guc-kaynagi-kapasite-genisletme": [
    {
      question: "Cihazları çalıştırırken tahmini çalışma süresi nedir?",
      answer:
        "Güç kaynağının cihazınızı ne kadar süre çalıştıracağını tahmin etmek için şu basit formülü kullanabilirsiniz: Tahmini Çalışma Süresi = (Wh cinsinden Batarya Kapasitesi × 0.85) ÷ Cihaz Watt Değeri. Örnek: 100W'lık bir TV'yi çalıştırmak için IEETek P3200'ü (2048Wh kapasite) kullanmak: (2048Wh × 0.85) ÷ 100W ≈ 17.4 saat. (Not: 0.85 faktörü, batarya deşarjı ve inverter dönüşümü sırasındaki standart enerji kayıplarını hesaba katar.)",
      order: 1,
    },
    {
      question: "Güç kaynağı hangi ev aletlerini çalıştırabilir?",
      answer:
        "Bu, IEETek güç kaynağınızın nominal çıkış gücüne bağlıdır. Cihazlarınızın hem nominal gücünü hem de dalgalanma gücünü (başlangıç gücünü) her zaman kontrol edin. Motorlu cihazlar (buzdolabı veya klima gibi) çalışmaya başladıklarında, nominal güçlerinin 3 ila 6 katı kadar kısa süreli güç dalgalanmasına ihtiyaç duyar. Bu toplam dalgalanma watt değerinin güç kaynağının maksimum tepe çıkışını aşmadığından emin olun.",
      order: 2,
    },
    {
      question: "'SmartDrive Modu' nedir ve nasıl çalışır?",
      answer:
        "Rezistans yükleri (ısıtıcılar, su ısıtıcıları veya elektrikli ocaklar gibi) taşınabilir güç kaynağının standart nominal çıkışını aştığında, 'SmartDrive Modu' voltajı akıllıca ayarlayarak daha yüksek güç taleplerini desteklemek için otomatik olarak devreye girer. Bu, yüksek watt'lı ısıtma cihazlarını sorunsuz şekilde çalıştırmanıza olanak tanır. Not: SmartDrive varsayılan olarak etkindir (AC tuşunu basılı tutarak değiştirilebilir), ancak endüktif yükler, hassas cihazlar veya katı voltaj gereksinimi olan cihazlar için uygun değildir.",
      order: 3,
    },
    {
      question: "Batarya kapasitesini nasıl artırabilirim? (Genişletilebilir Modeller İçin)",
      answer:
        "Batarya genişletmeyi destekleyen IEETek modelleri için, uyumlu genişletme bataryaları satın alarak kapasiteyi sorunsuz biçimde artırabilirsiniz. Ana üniteyi genişletme bataryasının üzerine yerleştirmeniz yeterlidir; fiziksel konektörler hizalandığında bataryalar otomatik olarak bağlanır. Ek kablo gerekmez. Not: Genişletme bataryaları, ana ünite ile protokol iletişimine dayanır ve tek başlarına kullanılamaz.",
      order: 4,
    },
    {
      question: "Bir genişletme ünitesi bağlandığında hangi batarya önce deşarj olur?",
      answer:
        "Sistemin yerleşik akıllı güç yönetimi mantığına göre deşarj olurlar. Tipik olarak ana ünite önce deşarj olurken aynı anda genişletme bataryası tarafından yeniden şarj edilir. Bu otomatik sıralama optimum performans, güvenlik ve batarya ömrünü sağladığından manuel önceliklendirme desteklenmez.",
      order: 5,
    },
    {
      question: "Ekranda görünen kalan süre doğru mu?",
      answer:
        "Evet, ancak dinamiktir. Kalan süre, gerçek zamanlı çıkış gücünüze göre hesaplanır. Cihazınızın değişken güç ihtiyaçları varsa görüntülenen süre otomatik olarak ayarlanır.",
      order: 6,
    },
    {
      question: "Bir genişletme bataryası bağlarsam, maksimum çıkış watt değeri (örn. 3000W) artar mı?",
      answer:
        "Hayır. Bir genişletme bataryası bağlamak yalnızca toplam kapasiteyi (Wh) artırır, yani cihazlarınız çok daha uzun süre çalışır. Maksimum çıkış watt değerini (W) artırmaz. Tepe güç çıkışı kesinlikle ana ünitenin dahili inverter'ı tarafından belirlenir.",
      order: 7,
    },
    {
      question: "USB/DC portlarını kullanmak, AC priz çıkışlarını kullanmaya göre bataryayı daha yavaş tüketir mi?",
      answer:
        "Evet! AC çıkışlarını kullandığınızda, DC batarya gücünü AC güce dönüştürmek için dahili inverter'ın açık kalması gerekir; bu da yaklaşık %10-15'lik bir enerji kaybına neden olur. USB-C, USB-A veya 12V DC portlarını kullanmak doğrudan DC gücü çeker; bu da telefonlarınızı, tabletlerinizi ve dizüstü bilgisayarlarınızı şarj etmenin en enerji verimli yoludur.",
      order: 8,
    },
    {
      question: "Farklı model veya marka genişletme bataryalarını karıştırabilir miyim?",
      answer:
        "Hayır. Ana üniteniz için belirlenmiş özel genişletme batarya modellerini kullanmanız gerekir. Farklı modellerin farklı voltaj platformları ve iletişim protokolleri vardır. Bunları karıştırmak uyumsuzdur ve sistem kilitlenmesine neden olabilir.",
      order: 9,
    },
    {
      question: "Güç kaynağından aldığım toplam gerçek enerji neden nominal kapasitesinden (Wh) biraz az?",
      answer:
        "Bu, fizik yasaları nedeniyledir. Bataryanın DC gücünü cihazlarınız için 110V/220V AC güce dönüştürürken, inverter bir miktar enerjiyi (ısı olarak) tüketir. Ayrıca BMS, derin deşarj hasarını önlemek için küçük bir güç miktarını yedek tutar. Gerçek dünya tahminleri için \"Kapasite × 0.85\" formülünü kullanmamızın nedeni budur.",
      order: 10,
    },
    {
      question: "Genişletme bataryası ana ünite olmadan bağımsız olarak şarj edilebilir mi?",
      answer:
        "Genişletme bataryalarının yerleşik AC inverter'ı veya MPPT solar kontrolcüsü yoktur. Prizden veya güneş panellerinden şarj almak için fiziksel olarak ana ünitenin üzerine yerleştirilmeleri veya bağlanmaları gerekir.",
      order: 11,
    },
  ],

  // ──────────────────────────────────────────────────────────────────────
  // BÖLÜM 3: ŞARJ YÖNTEMLERİ VE HIZI
  // ──────────────────────────────────────────────────────────────────────
  "guc-kaynagi-sarj-yontemleri": [
    {
      question: "Şebeke şarjı hızlı şarjı destekler mi?",
      answer:
        "Evet! Birlikte verilen AC şarj kablosu kullanılarak prize bağlandığında, IEETek güç kaynakları %0'dan %100'e sadece 1.2 ile 1.5 saat arasında (modele bağlı olarak) tamamen şarj olabilir. Alternatif olarak kullanıcılar, soğutma fanı gürültüsünü azaltmak için sistem üzerinden 'Yavaş Şarj Modu'nu etkinleştirebilir; bu, gece veya daha sessiz ortamlar için idealdir.",
      order: 1,
    },
    {
      question: "Üniteyi güneş panelleri ile şarj edebilir miyim?",
      answer:
        "Tüm IEETek güç kaynakları XT60 portu üzerinden güneş enerjisi şarjını destekler. Önemli: Güneş panellerinizin birleşik Açık Devre Voltajının (VOC) belirli modelinizin desteklediği maksimum güneş giriş voltajını aşmadığından emin olun. Örnek: P3200, 12–60V (Maks. 20A) güneş enerjisi girişini destekler. Bu nedenle seri olarak bağlanan toplam güneş paneli açık devre voltajı kesinlikle 60V'un altında kalmalıdır.",
      order: 2,
    },
    {
      question: "Güneş panellerimden neden tam nominal watt değerini alamıyorum?",
      answer:
        "Güneş paneli watt değeri, mutlak ideal laboratuvar koşulları (STC) altında nominal olarak belirlenir. Gerçek dünyada kullanımda; güneş ışığı açısı, bulut örtüsü, cam yansıması ve yüksek sıcaklıklar gibi faktörler verimliliği etkiler.",
      order: 3,
    },
    {
      question: "Güç kaynağı aynı anda güneş enerjisi ve şebeke gücü ile şarj edilebilir mi?",
      answer:
        "Evet, maksimum verimlilik için çift şarj desteklenmektedir. Örnek: P3200, 1800W'a kadar AC girişi ve maksimum 1000W güneş enerjisi girişini destekler. Toplam giriş gücü 2800W'a kadar çıkabilir.",
      order: 4,
    },
    {
      question: "Arabamın çakmak yuvası üzerinden şarj edebilir miyim?",
      answer:
        "Evet, birlikte verilen araç şarj kablosunu kullanarak 12V veya 24V araç portu üzerinden şarj edebilirsiniz. Ancak arabanızın marş bataryasının boşalmasını önlemek için yalnızca aracın motoru çalışırken şarj ettiğinizden emin olun.",
      order: 5,
    },
    {
      question: "Güç kaynağı şarj olurken cihazları çalıştırmak için kullanabilir miyim?",
      answer:
        "Evet, IEETek güç kaynakları geçişli (pass-through) şarjı destekler; böylece ünitenin kendisi şarj olurken cihazlarınıza güvenli şekilde güç sağlayabilirsiniz.",
      order: 6,
    },
    {
      question: "Güç kaynağını benzinli jeneratör kullanarak şarj edebilir miyim?",
      answer:
        "Evet, jeneratör Saf Sinüs Dalga AC akımı çıkışı verdiği ve voltaj/frekansı güç kaynağımızın kabul edilebilir giriş aralığında olduğu sürece, geleneksel bir benzinli jeneratör kullanarak şarj edebilirsiniz. (Temiz güç için inverter jeneratörleri şiddetle tavsiye edilir.)",
      order: 7,
    },
    {
      question: "AC şarj kablosunun hızlı şarj sırasında ısınması normal mi?",
      answer:
        "Evet. Yüksek hızlı AC şarjı sırasında kablodan önemli miktarda akım geçer ve bu hafif ısı oluşturur. Kablolarımız aleve dayanıklı, yüksek sıcaklığa dayanıklı malzemelerden yapılmıştır. Ancak kablo dokunulamayacak kadar ısınırsa veya yanmış kauçuk gibi kokarsa derhal şarjı durdurun.",
      order: 8,
    },
    {
      question: "Batarya %80 veya %90'a ulaştığında şarj hızı neden önemli ölçüde yavaşlar?",
      answer:
        "Bu, \"Trickle Charging\" (damla şarj) olarak adlandırılan Batarya Yönetim Sisteminin (BMS) kasıtlı bir güvenlik özelliğidir. Hücreleri aşırı voltajdan korumak, aşırı ısınmayı önlemek ve tüm tekil batarya hücrelerinde voltajı dengelemek için sistem, son %10-20'lik kısımda şarj akımını kasıtlı olarak azaltır.",
      order: 9,
    },
    {
      question: "Güç kaynağını şarj etmek için rüzgar türbini kullanabilir miyim?",
      answer:
        "Evet, ancak dolaylı olarak. Rüzgar türbini, ünitemizin güneş/DC giriş portunun (XT60) izin verilen voltaj (VOC) ve amper sınırları dahilinde stabil DC güç çıkışı veren uyumlu bir şarj kontrolcüsüne bağlanmalıdır.",
      order: 10,
    },
    {
      question: "AC şarj belirli prizlere veya jeneratörlere bağlandığında neden başlamıyor?",
      answer:
        "Yerel şebeke voltajı veya frekansı yüksek derecede stabil değilse, güç kaynağının dahili AC Giriş Koruması şarjı otomatik olarak engelleyecektir. Bu bir arıza değildir; dahili inverter ve batarya hücrelerini \"kirli\" veya düzensiz güçten korumak için tasarlanmış kasıtlı bir güvenlik özelliğidir. Bunu kalitesiz şebekenin olduğu bölgelerde veya eski geleneksel jeneratörler kullanırken yaşıyorsanız bir hat içi voltaj sabitleyici, saf sinüs dalga inverter jeneratör kullanmanızı veya güneş/araç şarjına geçmenizi öneririz.",
      order: 11,
    },
  ],

  // ──────────────────────────────────────────────────────────────────────
  // BÖLÜM 4: GÜVENLİK VE GÜNLÜK KULLANIM
  // ──────────────────────────────────────────────────────────────────────
  "guc-kaynagi-guvenlik-kullanim": [
    {
      question: "IEETek güç kaynaklarının güvenliğini sağlamak için hangi önlemler alınmıştır?",
      answer:
        "En üst sınıf üreticilerden A sınıfı LiFePO4 batarya hücreleri kullanıyoruz. Ayrıca gelişmiş BMS'imiz birden fazla koruma katmanını içerir; bunlar arasında: AC Çıkış Aşırı Akım ve Kısa Devre Koruması, AC Çıkış Aşırı/Düşük Voltaj ve Frekans Koruması, AC Şarj Aşırı Akım ve Aşırı/Düşük Voltaj Koruması, İnverter Aşırı Sıcaklık Koruması, Batarya Yüksek/Düşük Sıcaklık ve Aşırı/Düşük Voltaj Koruması yer alır.",
      order: 1,
    },
    {
      question: "Kesintilerde yedek güç kaynağı (UPS gibi) olarak işlev görebilir mi?",
      answer:
        "Evet. Şebekeye ve cihazlarınıza bağlandığında güç kaynağı güvenilir bir EPS olarak görev yapar. Elektrik kesintisi sırasında, 10 milisaniye (10ms) içinde otomatik olarak batarya yedek gücüne geçer ve masaüstü bilgisayar veya buzdolabı gibi kritik yüklerin kesintisiz çalışmaya devam etmesini sağlar. Şebeke gücü geri geldiğinde, otomatik olarak bataryayı şarj etmeye ve AC gücü geçirmeye devam eder.",
      order: 2,
    },
    {
      question: "Hiçbir yük tespit edilmediğinde ünite otomatik olarak kapanır mı?",
      answer:
        "Evet. Hem AC hem de DC çıkışları kapatıldıysa veya aktif bir yük tespit edilmiyorsa, sistem enerjiden tasarruf etmek için yaklaşık bir saat sonra otomatik olarak uyku moduna girer. Ünitenin uykuya geçmesini önlemek için (örn. düşük watt'lı bir mini buzdolabını aralıklı çalıştırmak için), sadece AC veya DC çıkışını manuel olarak etkin bırakın.",
      order: 3,
    },
    {
      question: "Kapalı alanda kullanmak güvenli mi? Zehirli gaz çıkarır mı?",
      answer:
        "%100 güvenli! Benzinli jeneratörlerin aksine, güç kaynaklarımız tamamen temiz batarya gücüyle çalışır. Egzoz veya karbon monoksit üretmezler ve sessiz çalışırlar; bu da onları yatak odaları, oturma odaları veya çadırlar için mükemmel kılar.",
      order: 4,
    },
    {
      question: "Bu güç kaynağını uçağa alabilir miyim?",
      answer:
        "Hayır. Havacılık yönetmelikleri genellikle 100Wh'in üzerindeki lityum bataryaları hem kabin hem de bagaj olarak yasaklar.",
      order: 5,
    },
    {
      question: "Güç kaynağı su geçirmez mi?",
      answer:
        "Hayır. Gövde, soğutma fanları için gerekli havalandırma deliklerine sahiptir. Dahili kısa devreleri önlemek için lütfen üniteyi yağmurdan, ıslak çimlerden ve havuzlardan uzak tutun.",
      order: 6,
    },
    {
      question: "Fan neden bazen sesli çalışıyor?",
      answer:
        "Bu, akıllı sıcaklık kontrol sisteminin çalışmasıdır. Yüksek güçlü cihazlar çalıştırılırken veya hızlı şarj kullanılırken, yerleşik soğutma fanları inverter ve bataryaları korumak için otomatik olarak devreye girer. Sıcaklık normale döndüğünde kapanırlar.",
      order: 7,
    },
    {
      question: "\"Saf Sinüs Dalga\" inverter, CPAP makineleri gibi tıbbi cihazlar için güvenli olduğu anlamına mı gelir?",
      answer:
        "Saf Sinüs Dalga teknolojisi, ev şebekenizle aynı temiz ve stabil elektrik sağlar. CPAP makineleri, oksijen yoğunlaştırıcıları ve üst düzey ses/PC ekipmanları dahil hassas elektronikler için güvenlidir.",
      order: 8,
    },
    {
      question: "Yaz aylarında güç kaynağını sıcak bir arabada bırakmak güvenli mi?",
      answer:
        "Önerilmez. Doğrudan güneş ışığında park edilmiş bir arabanın içindeki sıcaklık kolaylıkla 60°C'yi (140°F) geçebilir. Bataryayı bu kadar aşırı sıcaklıkta saklamak BMS yüksek sıcaklık kilidini tetikleyebilir, batarya ömrünü düşürebilir ve uç durumlarda güvenlik riskleri oluşturabilir. Her zaman gölgeli ve serin bir ortamda saklayın.",
      order: 9,
    },
    {
      question: "Çalışma sırasında ünite yan veya baş aşağı yerleştirilebilir mi?",
      answer:
        "Hayır. Güç kaynağı her zaman kesinlikle dik tutulmalıdır. Yan veya baş aşağı yerleştirmek, havalandırma fanlarını engelleyebilir, tehlikeli aşırı ısınmaya yol açabilir ve dahili yapısal bütünlüğü tehlikeye atabilir.",
      order: 10,
    },
    {
      question: "Portlar toz ve suya karşı korumalı mı?",
      answer:
        "Bazı modellerimizde portların üzerinde koruyucu kauçuk kapaklar bulunmasına rağmen, ünitenin tamamı su veya ciddi toza karşı IP dereceli değildir. Portlara giren kum, kir veya nem kısa devrelere neden olabilir. Açık havada kullanırken lütfen üniteyi yerden yukarıda tutun.",
      order: 11,
    },
    {
      question: "Bu üniteyi tüm evim için kalıcı, 24/7 şebekeden bağımsız güç kaynağı olarak kullanabilir miyim?",
      answer:
        "IEETek taşınabilir güç kaynakları yedekleme, kamp ve DIY projeleri için inanılmaz derecede sağlam olsa da, taşınabilir ve acil durum çözümleri olarak tasarlanmıştır. Tüm evi 24/7 kalıcı olarak çalıştırmak için, özel ve sabit kablolu bir Ev Enerji Depolama Sistemi (duvara monte bataryalar gibi) daha uygundur.",
      order: 12,
    },
  ],

  // ──────────────────────────────────────────────────────────────────────
  // BÖLÜM 5: AKILLI UYGULAMA KULLANIMI
  // ──────────────────────────────────────────────────────────────────────
  "guc-kaynagi-akilli-uygulama": [
    {
      question: "Hangi IEETek modelleri uygulama bağlantısını destekler?",
      answer:
        "P800 hariç, diğer tüm IEETek taşınabilir güç kaynağı modelleri uygulama bağlantısını destekleyen hem Wi-Fi hem de Bluetooth özellikleriyle donatılmıştır.",
      order: 1,
    },
    {
      question: "Bağlantı süreci sırasında Bluetooth ve Wi-Fi birlikte nasıl çalışır?",
      answer:
        "Bluetooth, uygulamanın cihazı hızlıca keşfetmesine yardımcı olmak için yalnızca ilk eşleştirme süreci sırasında yardımcı bir araç olarak kullanılır. İlk kurulum tamamlandığında, uzaktan izleme ve kontrol için sürekli bir 2.4GHz Wi-Fi ortamı gereklidir.",
      order: 2,
    },
    {
      question: "Uygulama neden ev Wi-Fi'me bağlanamıyor?",
      answer:
        "IEETek güç kaynağı yalnızca 2.4GHz Wi-Fi ağlarını destekler ve 5GHz ağlarını desteklemez. Lütfen ilk kurulum sırasında akıllı telefonunuzun router'ınızın 2.4GHz bandına bağlı olduğundan emin olun. Evinizde 2.4GHz Wi-Fi ağınız yoksa, uygulama bağlantısını tamamlamak için geçici çözüm olarak akıllı telefonunuzun mobil hotspot'unu (2.4GHz bandına ayarlandığından emin olarak) etkinleştirebilirsiniz.",
      order: 3,
    },
    {
      question: "Güç kaynağını uygulama üzerinden uzaktan açıp kapatabilir miyim?",
      answer:
        "AC ve DC çıkış portlarını uygulama üzerinden uzaktan AÇIP KAPATABİLİRSİNİZ. Ancak makinedeki ana fiziksel güç düğmesi tamamen KAPATILMIŞSA (sistem kapanma), uygulama üzerinden cihazı uyandıramazsınız.",
      order: 4,
    },
    {
      question: "Uygulamada şarj hızını nasıl ayarlarım?",
      answer:
        "Uygulamaya giriş yaptıktan sonra şarj ayarlarına gidin. İstediğiniz şarj hızına ulaşmak için giriş şarj gücünü %3 ile %100 arasında manuel olarak ayarlayabilirsiniz. Güç yüzdesini düşürmek, daha sessiz ortamlarda soğutma fanı gürültüsünü azaltmak için idealdir; %100'e ayarlamak ise maksimum hızlı şarjı sağlar.",
      order: 5,
    },
    {
      question: "Firmware'i nasıl güncellerim ve hangi önlemleri almalıyım?",
      answer:
        "Düzenli olarak kablosuz (OTA) firmware güncellemeleri yayınlıyoruz. Bir güncelleme mevcut olduğunda, güç kaynağına bağlanıp uygulamaya giriş yapar yapmaz otomatik olarak bir açılır bildirim görünür. \"Yükselt\"e dokunmadan önce lütfen şunlardan emin olun: Güç kaynağının en az %30 batarya seviyesi vardır. Tüm cihazlar ve şarj kabloları üniteden çıkarılmıştır. Telefonunuzu üniteye yakın tutarsınız ve 2-5 dakikalık güncelleme süreci boyunca uygulamayı kapatmazsınız.",
      order: 6,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// SEED FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

async function seedPowerStationFaqs() {
  console.log("🚀 Güç Kaynağı SSS seed başlıyor...\n");

  let totalCreatedFaqs = 0;

  for (const cat of categories) {
    // Kategoriyi oluştur veya güncelle (idempotent)
    const category = await prisma.faqCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        order: cat.order,
        isActive: true,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        order: cat.order,
        isActive: true,
      },
    });

    console.log(`✅ Kategori: ${category.name}`);

    // Bu kategoriye bağlı eski SSS'leri sil (yeniden seed için)
    const deleted = await prisma.faq.deleteMany({
      where: { categoryId: category.id },
    });
    if (deleted.count > 0) {
      console.log(`   🧹 ${deleted.count} eski SSS silindi`);
    }

    // Yeni SSS'leri ekle
    const faqs = faqsByCategory[cat.slug] || [];
    for (const faq of faqs) {
      await prisma.faq.create({
        data: {
          question: faq.question,
          answer: faq.answer,
          categoryId: category.id,
          order: faq.order,
          isActive: true,
        },
      });
    }

    totalCreatedFaqs += faqs.length;
    console.log(`   📝 ${faqs.length} soru eklendi\n`);
  }

  console.log(
    `🎉 Tamamlandı! ${categories.length} kategori, toplam ${totalCreatedFaqs} soru eklendi/güncellendi.`,
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RUN
// ═══════════════════════════════════════════════════════════════════════════

seedPowerStationFaqs()
  .catch((e) => {
    console.error("❌ Seed hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
