/**
 * FusionMarkt Blog Seed V3 - USB PD (Power Delivery) & USB-IF Detaylı Blog
 *
 * Kullanım:
 *   npx tsx scripts/seed-blogs-v3.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const blogs = [
  {
    slug: "usb-pd-power-delivery-nedir-usb-if-sertifikasi",
    title: "USB PD (Power Delivery) Nedir? USB-IF Sertifikası, Güç Seviyeleri ve Güç İstasyonlarında Kullanımı",
    excerpt: "USB Power Delivery teknolojisi nedir, nasıl çalışır? USB-IF sertifikası ne anlama gelir? PD 3.0 vs PD 3.1, güç seviyeleri (5V-48V/240W) ve taşınabilir güç istasyonlarında PD çıkışının önemi.",
    category: "Enerji",
    tags: ["USB PD", "Power Delivery", "USB-IF", "USB-C", "hızlı şarj", "güç istasyonu"],
    metaTitle: "USB PD (Power Delivery) Nedir? USB-IF Sertifikası Rehberi - FusionMarkt",
    metaDescription: "USB PD (Power Delivery) nedir? USB-IF sertifikası ne anlama gelir? PD güç seviyeleri 5V-48V, PD 3.0 vs 3.1, güç istasyonlarında PD çıkışının avantajları. Teknik rehber.",
    metaKeywords: ["USB PD nedir", "power delivery", "USB-IF", "USB-C şarj", "PD 3.0", "PD 3.1", "hızlı şarj", "100W şarj", "240W şarj"],
    publishedAt: new Date("2026-02-16"),
    content: `<h2>USB PD (Power Delivery) Nedir?</h2>
<p><strong>USB PD (Power Delivery)</strong>, USB-C konnektör üzerinden cihazlar arasında yüksek güçte enerji transferi yapılmasını sağlayan evrensel bir şarj protokolüdür. Geleneksel USB'nin 5V/2.4A (12W) sınırını aşarak, <strong>tek bir USB-C kablo ile 240W'a kadar güç</strong> taşıyabilir.</p>

<p>USB PD sayesinde aynı kablo ve aynı şarj cihazıyla telefonunuzu, tabletinizi, dizüstü bilgisayarınızı, hatta bazı monitörleri bile şarj edebilirsiniz. Bu "tek kablo, her cihaz" vizyonu USB PD'yi modern elektronik dünyasının temel taşı haline getirmiştir.</p>

<h2>USB-IF Nedir? Neden Önemli?</h2>

<h3>USB-IF (USB Implementers Forum)</h3>
<p><strong>USB-IF</strong>, USB teknolojisinin geliştirilmesi, standardizasyonu ve sertifikasyonundan sorumlu uluslararası kar amacı gütmeyen bir kuruluştur. 1995 yılında Apple, HP, Intel, Microsoft ve diğer teknoloji devleri tarafından kurulmuştur. Bugün 1000'den fazla üye şirketi bulunmaktadır.</p>

<p>USB-IF'nin temel görevleri:</p>
<ul>
<li><strong>Standart belirleme:</strong> USB 2.0, 3.0, 3.2, USB4, USB PD gibi tüm USB spesifikasyonlarını yazar ve yayınlar</li>
<li><strong>Uyumluluk testi:</strong> Üretici firmaların ürünlerini bağımsız laboratuvarlarda test eder</li>
<li><strong>Sertifikasyon:</strong> Testleri geçen ürünlere resmi USB-IF Sertifikası ve logo kullanım hakkı verir</li>
<li><strong>Tüketici koruması:</strong> Sertifikalı ürünlerin güvenli, uyumlu ve standartlara uygun olduğunu garanti eder</li>
</ul>

<h3>USB-IF Sertifikası Neden Önemli?</h3>
<p>Piyasada yüzlerce "USB PD uyumlu" ürün var, ancak hepsi gerçekten güvenli ve standartlara uygun değil. USB-IF sertifikası olan bir ürün:</p>
<ul>
<li><strong>Güvenlik testlerini geçmiştir:</strong> Aşırı akım, aşırı voltaj, kısa devre koruması doğrulanmıştır</li>
<li><strong>Uyumluluk garantisi vardır:</strong> Diğer USB-IF sertifikalı cihazlarla sorunsuz çalışır</li>
<li><strong>Doğru güç müzakeresi yapar:</strong> Cihazınıza zarar verecek voltajda güç göndermez</li>
<li><strong>E-Marker çip içerir (yüksek güçlü kablolarda):</strong> Kablonun taşıyabileceği maksimum gücü cihaza bildirir</li>
</ul>

<p><strong>Uyarı:</strong> USB-IF sertifikası olmayan ucuz kablo ve şarj cihazları, cihazınıza zarar verebilir veya beklenen hızda şarj yapamayabilir. Özellikle 60W üzeri güç taşıyan kablolarda mutlaka E-Marker çipli, USB-IF sertifikalı ürün tercih edin.</p>

<h2>USB PD Nasıl Çalışır? Güç Müzakeresi</h2>
<p>USB PD'nin en akıllı özelliği <strong>güç müzakeresi (power negotiation)</strong> mekanizmasıdır. Bir cihaz USB-C kabloyla güç kaynağına bağlandığında şu süreç işler:</p>

<ol>
<li><strong>Bağlantı algılama:</strong> Kaynak (şarj cihazı/güç istasyonu) ve alıcı (telefon/laptop) birbirini algılar</li>
<li><strong>Yetenek bildirimi:</strong> Kaynak, sunabileceği voltaj/akım profillerini bildirir (örn: 5V/3A, 9V/3A, 15V/3A, 20V/5A)</li>
<li><strong>Talep:</strong> Alıcı cihaz, ihtiyacına en uygun profili seçer ve talep eder</li>
<li><strong>Onay ve güç aktarımı:</strong> Kaynak talep edilen profili onaylar ve enerji transferi başlar</li>
<li><strong>Dinamik ayarlama:</strong> Şarj sırasında cihaz daha düşük güç talep edebilir (batarya doldukça güç azalır)</li>
</ol>

<p>Tüm bu iletişim <strong>CC (Configuration Channel)</strong> hattı üzerinden, milisaniyeler içinde gerçekleşir. Kullanıcı hiçbir şey yapmaz; tak ve şarj et.</p>

<h2>USB PD Versiyonları ve Güç Seviyeleri</h2>

<h3>USB PD 2.0 (2014)</h3>
<p>İlk yaygın PD standardı. Maksimum <strong>100W</strong> (20V/5A) güç desteği.</p>

<h3>USB PD 3.0 (2018)</h3>
<p>PD 2.0'ın geliştirilmiş hali. Aynı 100W maksimum güç, ama ek özellikler:</p>
<ul>
<li><strong>PPS (Programmable Power Supply):</strong> 3.3V-21V arasında 20mV adımlarla hassas voltaj ayarı. Samsung, Google Pixel gibi telefonların süper hızlı şarjı için kullanılır.</li>
<li><strong>Gelişmiş güvenlik:</strong> Daha detaylı hata raporlama ve koruma mekanizmaları</li>
<li><strong>FRS (Fast Role Swap):</strong> Güç kaynağı ve alıcı rollerinin hızlı değişimi (örn: laptop hub'a bağlıyken şarj cihazı çekilirse)</li>
</ul>

<h3>USB PD 3.1 (2021) - EPR (Extended Power Range)</h3>
<p>Devrim niteliğinde güncelleme. Maksimum güç <strong>100W → 240W</strong>'a yükseldi!</p>

<table>
<tr><th>Voltaj</th><th>Maks. Akım</th><th>Maks. Güç</th><th>Kullanım Alanı</th></tr>
<tr><td>5V</td><td>3A</td><td>15W</td><td>Telefon, kulaklık, küçük cihazlar</td></tr>
<tr><td>9V</td><td>3A</td><td>27W</td><td>Telefon hızlı şarj, tablet</td></tr>
<tr><td>15V</td><td>3A</td><td>45W</td><td>Ultrabook, tablet pro</td></tr>
<tr><td>20V</td><td>5A</td><td>100W</td><td>Dizüstü bilgisayar, taşınabilir monitör</td></tr>
<tr><td>28V (EPR)</td><td>5A</td><td>140W</td><td>Güçlü laptop, mini PC</td></tr>
<tr><td>36V (EPR)</td><td>5A</td><td>180W</td><td>Oyun laptopları, workstation</td></tr>
<tr><td>48V (EPR)</td><td>5A</td><td>240W</td><td>Oyun laptopları, profesyonel ekipman</td></tr>
</table>

<p><strong>Not:</strong> 48V/240W EPR için özel E-Marker çipli kablo gereklidir. Standart USB-C kablolar maksimum 60W (3A) veya 100W (5A E-Marker) taşıyabilir.</p>

<h2>Güç İstasyonlarında USB PD Çıkışı</h2>

<h3>Neden Önemli?</h3>
<p>Taşınabilir güç istasyonlarındaki USB PD çıkışı, <strong>dizüstü bilgisayar şarj etmenin en verimli yoludur</strong>. Bir MacBook Air'i AC çıkıştan (220V priz) şarj etmek yerine USB-C PD çıkıştan şarj ettiğinizde:</p>

<ul>
<li><strong>AC yöntem:</strong> Batarya (DC) → İnverter (DC→AC) → Apple adaptör (AC→DC) → MacBook. Toplam kayıp: %18-25</li>
<li><strong>USB PD yöntem:</strong> Batarya (DC) → DC-DC regülatör → USB-C PD çıkış → MacBook. Toplam kayıp: %3-8</li>
</ul>

<p>Yani USB PD çıkış kullanarak <strong>%15-20 daha az enerji</strong> harcarsınız. 1024Wh'lik bir güç istasyonuyla AC'den 12-13 saat laptop çalıştırabilirken, PD çıkıştan <strong>15-16 saat</strong> çalıştırabilirsiniz!</p>

<h3>IEETek Güç İstasyonlarında PD Çıkış</h3>
<table>
<tr><th>Model</th><th>USB-C PD Çıkış</th><th>Maks. PD Gücü</th><th>PD Versiyonu</th></tr>
<tr><td>IEETek P800</td><td>1× USB-C</td><td>100W</td><td>PD 3.0</td></tr>
<tr><td>IEETek P1800</td><td>2× USB-C</td><td>100W</td><td>PD 3.0</td></tr>
<tr><td>IEETek P2400</td><td>2× USB-C</td><td>100W</td><td>PD 3.0</td></tr>
<tr><td>IEETek P3200</td><td>2× USB-C</td><td>100W</td><td>PD 3.0</td></tr>
<tr><td>Singo2000 PRO</td><td>USB-C PD çıkışlar mevcut</td><td>100W</td><td>PD 3.0</td></tr>
</table>

<h3>PD Çıkışla Şarj Edilebilen Cihazlar</h3>

<h4>Dizüstü Bilgisayarlar (USB-C şarjlı)</h4>
<ul>
<li><strong>Apple MacBook Air / Pro:</strong> 30W-140W PD şarj (modele göre değişir)</li>
<li><strong>Dell XPS serisi:</strong> 45W-130W PD şarj</li>
<li><strong>Lenovo ThinkPad serisi:</strong> 45W-100W PD şarj</li>
<li><strong>HP Spectre / EliteBook:</strong> 45W-100W PD şarj</li>
<li><strong>ASUS ZenBook:</strong> 45W-100W PD şarj</li>
<li><strong>Huawei MateBook:</strong> 65W PD şarj</li>
</ul>

<h4>Tabletler</h4>
<ul>
<li><strong>iPad Pro / Air:</strong> 20W-45W PD şarj</li>
<li><strong>Samsung Galaxy Tab S serisi:</strong> 25W-45W PD şarj</li>
<li><strong>Microsoft Surface Pro (USB-C modeller):</strong> 45W-65W PD şarj</li>
</ul>

<h4>Akıllı Telefonlar</h4>
<ul>
<li><strong>iPhone 15/16 serisi:</strong> 20W-27W PD şarj (USB-C native)</li>
<li><strong>Samsung Galaxy S serisi:</strong> 25W-45W PD + PPS şarj</li>
<li><strong>Google Pixel serisi:</strong> 21W-30W PD + PPS şarj</li>
<li><strong>OnePlus (bazı modeller):</strong> PD uyumlu ama VOOC/Warp daha hızlı</li>
</ul>

<h4>Diğer Cihazlar</h4>
<ul>
<li><strong>Nintendo Switch:</strong> 18W-39W PD şarj (oyun oynarken bile şarj olur)</li>
<li><strong>Steam Deck:</strong> 45W PD şarj</li>
<li><strong>Taşınabilir monitörler:</strong> 10W-18W PD ile hem güç hem görüntü tek kablodan</li>
<li><strong>Kameralar (Sony, Canon bazı modeller):</strong> USB-C PD şarj</li>
<li><strong>Drone batarya şarj aletleri:</strong> DJI Mavic bazı modelleri PD destekler</li>
<li><strong>LED video ışıkları:</strong> Profesyonel kullanım için PD ile besleme</li>
</ul>

<h2>USB PD vs Diğer Hızlı Şarj Teknolojileri</h2>

<table>
<tr><th>Teknoloji</th><th>Geliştirici</th><th>Maks. Güç</th><th>Evrensel mi?</th><th>USB-IF Onaylı mı?</th></tr>
<tr><td><strong>USB PD 3.1</strong></td><td>USB-IF</td><td><strong>240W</strong></td><td><strong>Evet (evrensel)</strong></td><td><strong>Evet</strong></td></tr>
<tr><td>Qualcomm QC 5.0</td><td>Qualcomm</td><td>100W+</td><td>Hayır (Qualcomm SoC)</td><td>Kısmen (PD uyumlu)</td></tr>
<tr><td>Samsung Super Fast</td><td>Samsung</td><td>45W</td><td>Hayır (Samsung)</td><td>PD+PPS tabanlı</td></tr>
<tr><td>Apple Fast Charge</td><td>Apple</td><td>140W</td><td>Hayır (Apple)</td><td>PD 3.1 tabanlı</td></tr>
<tr><td>VOOC/SuperVOOC</td><td>OPPO/OnePlus</td><td>240W</td><td>Hayır (OPPO)</td><td>Hayır (özel protokol)</td></tr>
<tr><td>Xiaomi HyperCharge</td><td>Xiaomi</td><td>300W</td><td>Hayır (Xiaomi)</td><td>Hayır (özel protokol)</td></tr>
</table>

<p><strong>Sonuç:</strong> USB PD, tüm marka ve cihazlarla çalışan <strong>tek evrensel hızlı şarj standardıdır</strong>. Güç istasyonunuzdaki USB PD çıkışı, markadan bağımsız olarak her USB-C cihazınızı şarj edebilir.</p>

<h2>Kablo Seçimi: E-Marker ve Güç Kapasitesi</h2>

<p>USB-C kabloların hepsi aynı gücü taşıyamaz. Kablo içindeki <strong>E-Marker çip</strong>, kablonun güç kapasitesini cihaza bildirir:</p>

<table>
<tr><th>Kablo Türü</th><th>E-Marker</th><th>Maks. Akım</th><th>Maks. Güç</th></tr>
<tr><td>Standart USB-C kablo</td><td>Yok</td><td>3A</td><td>60W (20V×3A)</td></tr>
<tr><td>E-Marker USB-C kablo</td><td>Var</td><td>5A</td><td>100W (20V×5A)</td></tr>
<tr><td>EPR USB-C kablo</td><td>Var (EPR)</td><td>5A</td><td>240W (48V×5A)</td></tr>
</table>

<p><strong>Pratik kural:</strong> Laptopunuz 60W'tan fazla PD güç çekiyorsa (çoğu MacBook Pro, Dell XPS 15 vb.), mutlaka <strong>E-Marker çipli 100W kablo</strong> kullanın. Yoksa kablo 3A'da sınırlar ve laptop yavaş şarj olur veya hiç şarj olmaz.</p>

<h2>PD Çıkışı Verimli Kullanma İpuçları</h2>
<ol>
<li><strong>Laptop şarjı için her zaman PD çıkışı tercih edin:</strong> AC çıkıştan şarj etmek %15-20 daha fazla enerji harcar</li>
<li><strong>Kaliteli, USB-IF sertifikalı kablo kullanın:</strong> Ucuz kablolar güç kaybına ve ısınmaya neden olur</li>
<li><strong>Laptop kapağını kapatıp şarj edin:</strong> Ekran kapalıyken daha hızlı dolar ve daha az enerji harcar</li>
<li><strong>Geceleri PD'den şarj edin:</strong> Güç istasyonu AC inverteri kapalı kalır, sessiz ve verimli şarj</li>
<li><strong>PD şarj gücünü bilin:</strong> Laptopunuzun orijinal adaptör gücünü kontrol edin. 100W PD çıkışlı güç istasyonları çoğu laptopu tam hızda şarj eder</li>
<li><strong>Telefon + laptop aynı anda:</strong> İki USB-C PD portu olan güç istasyonlarında (P1800, P2400, P3200) laptop ve telefon eş zamanlı şarj edilebilir</li>
</ol>

<h2>Güç İstasyonunu PD ile Şarj Etmek (Giriş)</h2>
<p>Bazı güç istasyonları USB-C PD ile de şarj edilebilir (giriş olarak). Bu özellikle küçük kapasiteli modellerde kullanışlıdır: bir PD şarj cihazıyla veya araç şarj adaptörüyle güç istasyonunuzu doldurabilirsiniz. Ancak büyük kapasiteli modellerde AC veya solar şarj çok daha hızlıdır.</p>

<h2>Sonuç</h2>
<p>USB PD, güç istasyonunuzdaki en verimli ve en evrensel çıkış portudur. Laptop, tablet, telefon ve birçok profesyonel ekipmanı tek bir USB-C kablo ile şarj edebilirsiniz. USB-IF sertifikalı kablo ve aksesuarlar kullanarak hem güvenliği hem de performansı garanti altına alın. IEETek güç istasyonlarının tümünde 100W USB-C PD çıkışları bulunmaktadır. <a href="/kategori/tasinabilir-guc-kaynaklari">FusionMarkt güç istasyonlarını</a> inceleyin ve cihazlarınızı en verimli şekilde şarj edin.</p>`,
  },
];

async function seedBlogs() {
  console.log("🚀 Blog V3 seed başlıyor (USB PD + USB-IF)...\n");

  for (const blog of blogs) {
    const existing = await prisma.blogPost.findUnique({
      where: { slug: blog.slug },
    });

    if (existing) {
      console.log(`⚠️  Atlandı (zaten var): ${blog.slug}`);
      continue;
    }

    await prisma.blogPost.create({
      data: {
        slug: blog.slug,
        title: blog.title,
        content: blog.content,
        excerpt: blog.excerpt,
        category: blog.category,
        tags: blog.tags,
        metaTitle: blog.metaTitle,
        metaDescription: blog.metaDescription,
        metaKeywords: blog.metaKeywords,
        authorName: "FusionMarkt",
        status: "PUBLISHED",
        publishedAt: blog.publishedAt,
      },
    });

    console.log(`✅ ${blog.title}`);
  }

  console.log(`\n🎉 Tamamlandı! ${blogs.length} blog yazısı eklendi.`);
}

seedBlogs()
  .catch((e) => {
    console.error("❌ Seed hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
