/**
 * FusionMarkt SSS Seed Script
 * Tüm yasal belgeler, ürün bilgileri ve site yapısı analiz edilerek hazırlanmıştır.
 * 
 * Kullanım:
 *   npx tsx scripts/seed-faqs.ts
 * 
 * veya prisma client erişimi olan ortamda:
 *   cd packages/db && npx tsx ../../scripts/seed-faqs.ts
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
// SSS KATEGORİLERİ
// ═══════════════════════════════════════════════════════════════════════════

const categories: FaqCategoryInput[] = [
  {
    name: "Ürünler ve Teknik Bilgiler",
    slug: "urunler-teknik",
    description: "Taşınabilir güç kaynağı, solar panel ve ürün teknik özellikleri hakkında sorular",
    icon: "HelpCircle",
    color: "#10B981",
    order: 1,
  },
  {
    name: "Sipariş ve Kargo",
    slug: "siparis-kargo",
    description: "Sipariş süreci, kargo takip ve teslimat bilgileri",
    icon: "Truck",
    color: "#3B82F6",
    order: 2,
  },
  {
    name: "Ödeme",
    slug: "odeme",
    description: "Ödeme yöntemleri, taksit ve güvenlik bilgileri",
    icon: "CreditCard",
    color: "#8B5CF6",
    order: 3,
  },
  {
    name: "İade ve Değişim",
    slug: "iade-degisim",
    description: "İade süreci, cayma hakkı ve değişim koşulları",
    icon: "RefreshCcw",
    color: "#F59E0B",
    order: 4,
  },
  {
    name: "Hesap ve Üyelik",
    slug: "hesap-uyelik",
    description: "Hesap oluşturma, üyelik ve kişisel bilgi yönetimi",
    icon: "User",
    color: "#EC4899",
    order: 5,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// SSS SORULARI VE CEVAPLARI (Kategori slug'ına göre gruplandı)
// ═══════════════════════════════════════════════════════════════════════════

const faqsByCategory: Record<string, FaqInput[]> = {
  // ──────────────────────────────────────────────────────────────────────
  // 1. ÜRÜNLER VE TEKNİK BİLGİLER
  // ──────────────────────────────────────────────────────────────────────
  "urunler-teknik": [
    {
      question: "Taşınabilir güç kaynağı (portable power station) nedir?",
      answer: "Taşınabilir güç kaynağı, içinde büyük kapasiteli batarya barındıran ve elektrik prizine ihtiyaç duymadan cihazlarınızı şarj edebilen portatif bir enerji ünitesidir. LiFePO4 (Lityum Demir Fosfat) batarya teknolojisi ile üretilen modellerimiz 4000+ şarj döngüsü ömrü sunar. Kamp, karavan, açık hava etkinlikleri, acil durum yedekleme ve off-grid yaşam için idealdir. FusionMarkt'ta 256Wh'den 6kWh'e kadar farklı kapasite seçenekleri bulunmaktadır.",
      order: 1,
    },
    {
      question: "LiFePO4 batarya nedir ve neden tercih edilmeli?",
      answer: "LiFePO4 (Lityum Demir Fosfat), güç istasyonlarında kullanılan en güvenli ve uzun ömürlü batarya teknolojisidir. Geleneksel lityum-ion bataryalara kıyasla 4000+ şarj döngüsü (yaklaşık 10 yıl kullanım), termal kararlılık sayesinde patlama veya yanma riski yok denecek kadar düşük, geniş çalışma sıcaklığı aralığı (-20°C ile +60°C), çevre dostu (toksik madde içermez) gibi avantajlar sunar. FusionMarkt'taki tüm IEETek güç istasyonları LiFePO4 teknolojisi kullanmaktadır.",
      order: 2,
    },
    {
      question: "Hangi güç kaynağı benim için uygun? Nasıl seçmeliyim?",
      answer: "Doğru güç kaynağını seçmek için şarj etmek istediğiniz cihazların toplam watt değerini bilmeniz gerekir. Örneğin: telefon şarjı ~20W, dizüstü bilgisayar ~65W, mini buzdolabı ~60W, CPAP cihazı ~30W. Güç Hesaplayıcı aracımızı (fusionmarkt.com/guc-hesaplayici) kullanarak cihazlarınızın toplam ihtiyacını hesaplayabilir ve size en uygun modeli bulabilirsiniz. Genel kılavuz: Kamp/telefon şarjı için P800 (512Wh), ev yedekleme için P1800 (1024Wh), profesyonel kullanım için P2400-P3200 (2-3kWh) önerilir.",
      order: 3,
    },
    {
      question: "Solar panel ile güç kaynağı nasıl şarj edilir?",
      answer: "IEETek güneş panelleri, güç istasyonlarıyla doğrudan uyumludur. Bağlantı adımları: 1) Güneş panelini açık havada güneşe doğru konumlandırın, 2) Panel çıkış kablosunu güç istasyonunun DC girişine (MC4 veya XT60) bağlayın, 3) Güç istasyonu otomatik olarak şarj olmaya başlar. MPPT şarj kontrolcüsü sayesinde %99,9 verimlilik ile maksimum enerji aktarımı sağlanır. Tam şarj süresi panel gücüne ve güneş koşullarına göre değişir (örn: SP200 panel ile P1800 yaklaşık 6-7 saatte dolar).",
      order: 4,
    },
    {
      question: "Güç istasyonunu evde UPS (kesintisiz güç kaynağı) olarak kullanabilir miyim?",
      answer: "Evet! IEETek güç istasyonlarının UPS özellikli modelleri (özellikle SH4000), 10ms gibi çok kısa bir sürede şebeke elektriğinden batarya beslemesine geçiş yapar. Bu sayede bilgisayar, modem, güvenlik kamerası gibi hassas cihazlarınız elektrik kesintisinde bile çalışmaya devam eder. P1800 ve üzeri modellerde de pass-through şarj özelliği bulunur; yani güç istasyonu prize takılıyken hem kendisi şarj olur hem de cihazlarınızı besler.",
      order: 5,
    },
    {
      question: "Yalıtkan merdiven nedir ve ne işe yarar?",
      answer: "Yalıtkan merdivenler, elektrik sektöründe yüksek gerilim hatları yakınında güvenli çalışma imkanı sağlayan, fiberglas gövdeli özel merdivenlerdir. EN 50528 sertifikalı Telesteps yalıtkan merdivenlerimiz 1000V'a kadar yalıtım sağlar. DGUV sertifikalı Kevlar modeller ise ekstra hafiflik ve dayanıklılık sunar. Elektrik dağıtım şirketleri, telekomünikasyon firmaları ve inşaat sektöründe profesyonel kullanım için tasarlanmıştır.",
      order: 6,
    },
    {
      question: "Traffi iş güvenliği eldivenleri hangi sertifikalara sahip?",
      answer: "Traffi güvenlik eldivenleri CE onaylı ve EN 388 sertifikalıdır. Kesim dayanım seviyeleri A1'den A5'e kadar farklı modellerde sunulur. Ayrıca dokunmatik ekran uyumlu modeller, kimyasal dayanımlı seçenekler ve karbon-nötr üretim sertifikası mevcuttur. Traffi, Birleşik Krallık merkezli olup dünyada karbon-nötr güvenlik eldiveni üreten ilk markadır. FusionMarkt, Traffi'nin Türkiye yetkili distribütörüdür.",
      order: 7,
    },
    {
      question: "Ürünlerinizin garantisi ne kadar?",
      answer: "FusionMarkt'tan satın alınan tüm ürünler 2 yıl üretici garantisi kapsamındadır. Garanti, üretim hataları ve malzeme kusurlarını kapsar. LiFePO4 bataryalar için 4000+ döngü ömür garantisi ayrıca geçerlidir. Garanti kapsamında arızalanan ürünler ücretsiz olarak onarılır veya değiştirilir. Garanti dışı durumlar: fiziksel hasar, yanlış kullanım, yetkisiz müdahale ve doğal afet kaynaklı hasarlar.",
      order: 8,
    },
    {
      question: "FusionMarkt hangi markaların yetkili distribütörüdür?",
      answer: "FusionMarkt, IEETek (taşınabilir güç istasyonları ve güneş panelleri), Traffi (iş güvenliği eldivenleri), Telesteps (yalıtkan teleskopik merdivenler) ve RGP Balls (hassas bilyalar) markalarının Türkiye yetkili distribütörüdür. Tüm ürünler orijinal ve garantilidir. Detaylı marka bilgilerine marka sayfalarımızdan ulaşabilirsiniz.",
      order: 9,
    },
    {
      question: "Güç hesaplayıcı aracını nasıl kullanabilirim?",
      answer: "fusionmarkt.com/guc-hesaplayici adresindeki interaktif aracımızı kullanarak, şarj etmek istediğiniz cihazları listeye ekleyin ve her birinin watt değerini girin. Araç otomatik olarak toplam enerji ihtiyacınızı hesaplayacak ve size uygun IEETek güç istasyonu modelini önerecektir. Örneğin: telefon + dizüstü bilgisayar + LED aydınlatma için P800 yeterli olurken, mini buzdolabı + TV + birden fazla cihaz için P1800 veya üzeri önerilir.",
      order: 10,
    },
  ],

  // ──────────────────────────────────────────────────────────────────────
  // 2. SİPARİŞ VE KARGO
  // ──────────────────────────────────────────────────────────────────────
  "siparis-kargo": [
    {
      question: "Siparişim ne zaman kargoya verilir?",
      answer: "Stokta bulunan ürünler için siparişiniz, ödeme onayının ardından 1 iş günü içinde kargoya verilir. Türkiye saati (GMT+3) ile sabah 07:00'den önce verilen ve stokta mevcut olan siparişler, aynı gün kargoya teslim edilir. Özel sipariş veya stok dışı ürünlerde teslimat süresi 3-7 iş günü olabilir; bu durumda size e-posta ile bilgi verilir.",
      order: 1,
    },
    {
      question: "Kargo ücreti ne kadar? Ücretsiz kargo var mı?",
      answer: "FusionMarkt'ta belirlenen tutarın üzerindeki siparişlerde Türkiye genelinde ücretsiz kargo uygulanmaktadır. Ücretsiz kargo alt limiti ürün sayfalarında ve sepetinizde görüntülenir. Alt limitin altındaki siparişlerde kargo ücreti, sipariş ağırlığı ve teslimat adresine göre hesaplanır ve ödeme sayfasında gösterilir.",
      order: 2,
    },
    {
      question: "Hangi kargo firmaları ile çalışıyorsunuz?",
      answer: "Türkiye içi gönderimlerimiz Yurtiçi Kargo, Aras Kargo, MNG Kargo, PTT Kargo, Sürat Kargo ve Sendeo ile yapılmaktadır. Uluslararası gönderimler için DHL Express veya FedEx kullanılır. Siparişiniz kargoya verildiğinde, takip numaranız e-posta ve SMS ile iletilir. Hesabım > Siparişlerim bölümünden de kargo durumunu anlık takip edebilirsiniz.",
      order: 3,
    },
    {
      question: "Yurt dışına gönderim yapıyor musunuz?",
      answer: "Evet, FusionMarkt dünya çapında gönderim yapmaktadır. Uluslararası gönderimler DHL Express veya FedEx ile yapılır. Gümrük vergileri ve ithalat harçları alıcının sorumluluğundadır. İran, Sudan, Küba, Suriye, Kuzey Kore ve Uganda'ya gönderim yapılmamaktadır. Uluslararası kargo ücreti, ürün ağırlığı ve varış noktasına göre sepet sayfasında hesaplanır.",
      order: 4,
    },
    {
      question: "Siparişimi nasıl takip edebilirim?",
      answer: "Siparişinizi takip etmek için: 1) fusionmarkt.com'da hesabınıza giriş yapın, 2) Hesabım > Siparişlerim bölümüne gidin, 3) İlgili siparişin yanındaki 'Kargo Takip' butonuna tıklayın. Ayrıca siparişiniz kargoya verildiğinde gönderilen e-postadaki takip linkinden de doğrudan kargo firmasının sitesinde durumu sorgulayabilirsiniz.",
      order: 5,
    },
    {
      question: "Siparişimi iptal edebilir miyim?",
      answer: "Siparişiniz henüz kargoya verilmediyse, Hesabım > Siparişlerim bölümünden iptal talebinde bulunabilirsiniz. 'Beklemede' veya 'Hazırlanıyor' durumundaki siparişler iptal edilebilir. İptal talebiniz onaylandıktan sonra ödemeniz aynı yöntemle iade edilir. Kargoya verilmiş siparişlerde iptal yerine iade süreci uygulanır.",
      order: 6,
    },
    {
      question: "Teslimat sırasında imza gerekiyor mu?",
      answer: "Evet, tüm gönderimlerimizde teslimat sırasında imza zorunludur. Bu uygulama, siparişinizin güvenli bir şekilde doğru kişiye ulaşmasını sağlamak için yapılmaktadır. Teslimat sırasında adreste bulunmuyorsanız, kargo firması tekrar teslimat denemesi yapacaktır.",
      order: 7,
    },
  ],

  // ──────────────────────────────────────────────────────────────────────
  // 3. ÖDEME
  // ──────────────────────────────────────────────────────────────────────
  "odeme": [
    {
      question: "Hangi ödeme yöntemlerini kabul ediyorsunuz?",
      answer: "FusionMarkt'ta kredi kartı (Visa, Mastercard, American Express, Troy) ve havale/EFT ile ödeme yapabilirsiniz. Kredi kartı ödemeleri İyzico altyapısı ile 3D Secure güvenlik sistemi kullanılarak gerçekleştirilir. Kart bilgileriniz hiçbir şekilde tarafımızca saklanmaz.",
      order: 1,
    },
    {
      question: "Taksit imkanı var mı?",
      answer: "Evet, kredi kartı ile yapılan ödemelerde 12 aya varan taksit imkanı sunulmaktadır. Taksit seçenekleri bankanıza ve kartınızın türüne göre değişiklik gösterebilir. Güncel taksit tablosu, ödeme sayfasında kartınızın ilk 6 hanesini girdiğinizde otomatik olarak görüntülenir.",
      order: 2,
    },
    {
      question: "Ödemelerim güvenli mi?",
      answer: "Kesinlikle. Tüm ödeme işlemleri 256-Bit SSL şifreleme ile korunmaktadır. Kredi kartı ödemelerinde 3D Secure (3 boyutlu güvenlik) doğrulaması zorunludur. PCI DSS ödeme güvenlik standardına uyuyoruz. Kart bilgileriniz doğrudan bankanız aracılığıyla doğrulanır ve hiçbir şekilde sistemimizde saklanmaz. Ödeme altyapımız İyzico tarafından sağlanmaktadır.",
      order: 3,
    },
    {
      question: "Havale/EFT ile ödeme nasıl yapılır?",
      answer: "Sipariş sırasında 'Havale/EFT' seçeneğini seçin. Sipariş numaranızı banka havalesi açıklama kısmına yazın. Ödemeyi yaptıktan sonra dekontunuzu WhatsApp hattımıza (+90 850 840 6160) gönderin. Ödemeniz kontrol edildikten sonra siparişiniz onaylanır ve hazırlanmaya başlar. Banka hesap bilgilerimiz sipariş onay e-postasında da yer almaktadır.",
      order: 4,
    },
  ],

  // ──────────────────────────────────────────────────────────────────────
  // 4. İADE VE DEĞİŞİM
  // ──────────────────────────────────────────────────────────────────────
  "iade-degisim": [
    {
      question: "İade hakkım var mı? Kaç gün içinde iade edebilirim?",
      answer: "Evet, Mesafeli Satışlar Yönetmeliği kapsamında teslim tarihinden itibaren 14 gün içinde cayma hakkınızı kullanabilirsiniz. İade talebi oluşturmak için Hesabım > Siparişlerim bölümüne gidin ve ilgili siparişte 'İade Talebi' butonuna tıklayın. Ürünün orijinal ambalajında, eksiksiz ve kullanılmamış olması gerekmektedir.",
      order: 1,
    },
    {
      question: "İade süreci nasıl işliyor?",
      answer: "İade süreci 4 adımda tamamlanır: 1) Hesabım > Siparişlerim'den iade talebi oluşturun, 2) İade sebebini seçin ve varsa fotoğraf ekleyin (en fazla 3 adet), 3) Talebiniz incelendikten sonra iade adresi ve talimatlar e-posta ile gönderilir, 4) Ürünü orijinal ambalajında, tüm aksesuarları ile birlikte kargolayın. Sigortalı kargo kullanmanızı öneririz.",
      order: 2,
    },
    {
      question: "Para iadem ne zaman yansır?",
      answer: "Kredi kartı ile yapılan ödemelerde iade 5-7 iş günü içinde kartınıza yansır. Havale/EFT ödemelerinde ise ödemeniz 3 iş günü içinde banka hesabınıza iade edilir. Yalnızca orijinal satın alma fiyatı iade edilir; nakliye masrafları iade edilmez. Kusurlu ürün iadelerinde kargo masrafı tarafımızdan karşılanır.",
      order: 3,
    },
    {
      question: "Hangi ürünler iade edilemez?",
      answer: "Şu ürünler iade kapsamı dışındadır: Kurulmuş ve kullanılmış güneş panelleri, fiziksel hasar görmüş veya çizilmiş ürünler, eksik aksesuar veya parça içeren ürünler, orijinal ambalajı olmayan veya hasarlı ambalajlı ürünler, ürün sayfasında 'iade edilemez' olarak belirtilen ürünler.",
      order: 4,
    },
    {
      question: "Hasarlı veya kusurlu ürün geldi, ne yapmalıyım?",
      answer: "Hasarlı veya kusurlu ürünler onarım, değişim veya iade için kabul edilir. Teslimattan sonraki 2 iş günü içinde Hesabım > Siparişlerim bölümünden iade talebi oluşturun ve hasarın fotoğraflarını ekleyin. Kusurlu ürün iadelerinde nakliye masrafları FusionMarkt tarafından karşılanır. İade öncesi güç istasyonlarının pil şarj seviyesini %20-50 aralığına getirmeniz ve WiFi/kullanıcı ayarlarını sıfırlamanız önerilir.",
      order: 5,
    },
    {
      question: "Değişim yapabilir miyim?",
      answer: "Evet, ürün değişimi yapılabilir. Değişim talebinizi iade talebi ile aynı süreçte oluşturabilirsiniz. Posta yoluyla yapılan değişimlerin işleme alınması 5-7 iş günü sürebilir. Değişilecek ürün stokta bulunmalıdır; stokta yoksa iade olarak işleme alınır.",
      order: 6,
    },
  ],

  // ──────────────────────────────────────────────────────────────────────
  // 5. HESAP VE ÜYELİK
  // ──────────────────────────────────────────────────────────────────────
  "hesap-uyelik": [
    {
      question: "Hesap oluşturmak zorunlu mu?",
      answer: "Sipariş verebilmek için üyelik gereklidir. Hesap oluşturmak ücretsizdir ve sadece birkaç dakika sürer. E-posta adresiniz ve temel bilgileriniz ile kayıt olabilir veya Google hesabınız ile hızlı giriş yapabilirsiniz. Üyelik avantajları: sipariş geçmişi görüntüleme, kargo takip, iade talebi oluşturma, favori listeleri ve hızlı alışveriş.",
      order: 1,
    },
    {
      question: "Şifremi unuttum, ne yapmalıyım?",
      answer: "Giriş sayfasında 'Şifremi Unuttum' bağlantısına tıklayın. Kayıtlı e-posta adresinizi girin ve şifre sıfırlama bağlantısı e-postanıza gönderilecektir. Link 24 saat geçerlidir. E-posta gelmezse spam/gereksiz klasörünü kontrol edin veya info@fusionmarkt.com adresine yazın.",
      order: 2,
    },
    {
      question: "Kişisel verilerim güvende mi?",
      answer: "Evet. Tüm kişisel verileriniz KVKK (6698 Sayılı Kişisel Verilerin Korunması Kanunu) ve ilgili yasal mevzuat çerçevesinde korunmaktadır. 256-Bit SSL şifreleme ile veri transferi yapılır. Kart bilgileriniz saklanmaz. Detaylı bilgi için Gizlilik Politikası sayfamızı inceleyebilirsiniz.",
      order: 3,
    },
    {
      question: "FusionMarkt'a nasıl ulaşabilirim?",
      answer: "Bize birden fazla kanaldan ulaşabilirsiniz: Telefon: +90 850 840 6160 (Hafta içi 09:00-18:00), E-posta: info@fusionmarkt.com, WhatsApp: +90 850 840 6160 (Canlı destek), İletişim formu: fusionmarkt.com/iletisim. Adresimiz: Turan Güneş Bulvarı, Cezayir Cd. No.6/7, Yıldızevler, Çankaya/Ankara. Türkçe, İngilizce ve Almanca destek sunulmaktadır.",
      order: 4,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// SEED FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

async function seedFaqs() {
  console.log("🚀 SSS seed başlıyor...\n");

  for (const cat of categories) {
    // Kategoriyi oluştur veya güncelle
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

    console.log(`✅ Kategori: ${category.name} (${category.id})`);

    // Bu kategorinin sorularını ekle
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
      console.log(`   📝 ${faq.question.substring(0, 60)}...`);
    }

    console.log(`   → ${faqs.length} soru eklendi\n`);
  }

  const totalFaqs = Object.values(faqsByCategory).reduce((sum, arr) => sum + arr.length, 0);
  console.log(`\n🎉 Tamamlandı! ${categories.length} kategori, ${totalFaqs} soru eklendi.`);
}

// ═══════════════════════════════════════════════════════════════════════════
// RUN
// ═══════════════════════════════════════════════════════════════════════════

seedFaqs()
  .catch((e) => {
    console.error("❌ Seed hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
