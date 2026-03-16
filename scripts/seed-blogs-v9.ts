/**
 * FusionMarkt Blog Seed V9
 * Blog 24: MPPT vs PWM Şarj Kontrolcüsü
 * Blog 25: Pass-Through Şarj ve UPS Modunda Kullanım
 *
 * Kullanım: npx tsx scripts/seed-blogs-v9.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const blogs = [
  {
    slug: "mppt-vs-pwm-sarj-kontrolcusu-fark-nedir",
    title: "MPPT vs PWM Şarj Kontrolcüsü: Fark Nedir? Hangisi Daha Verimli?",
    excerpt: "Güneş paneli şarj kontrolcülerinde MPPT ve PWM teknolojileri arasındaki fark. Verimlilik, maliyet, uyumluluk karşılaştırması ve güç istasyonlarındaki MPPT avantajı.",
    category: "Enerji",
    tags: ["MPPT", "PWM", "şarj kontrolcüsü", "solar regülatör", "güneş paneli"],
    metaTitle: "MPPT vs PWM Şarj Kontrolcüsü: Teknik Karşılaştırma - FusionMarkt",
    metaDescription: "MPPT ve PWM güneş paneli şarj kontrolcüleri arasındaki fark nedir? Verimlilik (%99 vs %75), maliyet, soğuk hava performansı ve IEETek güç istasyonlarındaki MPPT avantajı.",
    metaKeywords: ["MPPT nedir", "PWM nedir", "MPPT vs PWM", "solar şarj kontrolcüsü", "güneş paneli regülatör"],
    publishedAt: new Date("2026-02-22"),
    content: `<h2>Şarj Kontrolcüsü Nedir?</h2>
<p>Güneş paneli doğrudan bataryaya bağlanırsa, voltaj dalgalanmaları bataryaya zarar verir ve aşırı şarj riski oluşur. <strong>Şarj kontrolcüsü (solar regülatör)</strong>, güneş panelinden gelen enerjiyi düzenleyerek bataryaya güvenli ve verimli şekilde aktaran elektronik devredir.</p>

<p>İki temel teknoloji vardır: <strong>PWM (Pulse Width Modulation)</strong> ve <strong>MPPT (Maximum Power Point Tracking)</strong>.</p>

<h2>PWM (Pulse Width Modulation) Nasıl Çalışır?</h2>
<p>PWM kontrolcü, güneş panelinin voltajını batarya voltajına düşürerek çalışır. Basitçe bir anahtar (switch) gibi davranır: panelden gelen akımı hızlı açma/kapama darbeleriyle batarya voltajına düşürür.</p>

<p><strong>Sorun:</strong> Panel 24V üretirken batarya 13V ise, aradaki 11V fark ısı olarak kaybolur. Panelin Vmp (maksimum güç noktası voltajı) değil, batarya voltajında çalışmasını zorlar — bu da paneli optimum noktasından uzaklaştırır.</p>

<h3>PWM Özellikleri</h3>
<ul>
<li>Panel voltajını doğrudan batarya voltajına çeker</li>
<li>Verimlilik: <strong>%65-80</strong></li>
<li>Basit ve ucuz devre tasarımı</li>
<li>Panel voltajı ile batarya voltajı yakın olmalı (12V panel → 12V batarya)</li>
<li>Yüksek voltajlı panellerle (24V+) çok verimsiz çalışır</li>
</ul>

<h2>MPPT (Maximum Power Point Tracking) Nasıl Çalışır?</h2>
<p>MPPT kontrolcü, güneş panelinin <strong>maksimum güç noktasını (MPP)</strong> sürekli izler ve panelin her an bu optimum noktada çalışmasını sağlar. Gelen yüksek voltajı, DC-DC dönüştürücü ile batarya voltajına düşürürken akımı artırır — böylece enerji kaybı minimuma iner.</p>

<p><strong>Analoji:</strong> PWM bir vitessiz bisiklet gibidir — iniş/yokuş fark etmez aynı tempoda gider. MPPT ise otomatik vitesli bisiklet — her an en verimli viteste pedal çevirirsiniz.</p>

<h3>MPPT Özellikleri</h3>
<ul>
<li>Panelin MPP noktasını milisaniyeler içinde bulur ve takip eder</li>
<li>Verimlilik: <strong>%95-99.9</strong></li>
<li>DC-DC dönüştürücü ile voltaj/akım optimize eder</li>
<li>Farklı voltajlardaki panellerle uyumlu çalışır (24V, 36V, 48V panel → 12V/24V batarya)</li>
<li>Bulutlu geçişlerde ve kısmi gölgede çok daha iyi performans</li>
<li>Soğuk havada VOC artışından faydalanır (PWM faydalanmaz)</li>
</ul>

<h2>Karşılaştırma Tablosu</h2>
<table>
<tr><th>Kriter</th><th>MPPT</th><th>PWM</th></tr>
<tr><td>Verimlilik</td><td><strong>%95-99.9</strong></td><td>%65-80</td></tr>
<tr><td>Düşük ışıkta performans</td><td><strong>Yüksek</strong> (MPP takibi)</td><td>Düşük</td></tr>
<tr><td>Soğuk hava avantajı</td><td><strong>Evet</strong> (yüksek VOC'dan faydalanır)</td><td>Hayır</td></tr>
<tr><td>Panel-batarya voltaj uyumu</td><td><strong>Esnek</strong> (geniş voltaj aralığı)</td><td>Katı (yakın voltaj gerekli)</td></tr>
<tr><td>Kısmi gölge</td><td><strong>İyi yönetir</strong></td><td>Kötü yönetir</td></tr>
<tr><td>Maliyet</td><td>Daha pahalı</td><td><strong>Ucuz</strong></td></tr>
<tr><td>Boyut/ağırlık</td><td>Daha büyük</td><td><strong>Kompakt</strong></td></tr>
<tr><td>İdeal kullanım</td><td><strong>Her senaryo</strong></td><td>Küçük, sabit 12V sistemler</td></tr>
</table>

<h2>Gerçek Dünya Farkı: Aynı Panel, Farklı Kontrolcü</h2>
<p>200W güneş paneli, güneşli bir günde 5 saat çalışırsa:</p>
<table>
<tr><th>Kontrolcü</th><th>Verimlilik</th><th>Gerçek Üretim</th><th>Günlük Fark</th></tr>
<tr><td><strong>MPPT (%98)</strong></td><td>200W × 5h × 0.98</td><td><strong>980Wh</strong></td><td>—</td></tr>
<tr><td>PWM (%72)</td><td>200W × 5h × 0.72</td><td>720Wh</td><td><strong>-260Wh (%26 kayıp!)</strong></td></tr>
</table>
<p>Günde 260Wh fark, bir haftada 1820Wh demek — neredeyse bir P1800'ün tam kapasitesi kadar enerji boşa gider!</p>

<h2>IEETek Güç İstasyonlarında MPPT</h2>
<p>IEETek'in tüm güç istasyonları (P800, P1800, P2400, P3200, Singo serisi, SH4000) <strong>yerleşik MPPT şarj kontrolcüsü</strong> ile donatılmıştır. Bu, harici kontrolcü satın almanıza gerek olmadığı anlamına gelir — güneş panelini doğrudan güç istasyonuna bağlarsınız, yerleşik MPPT geri kalanını halleder.</p>

<p>Bu, geleneksel akü + harici PWM/MPPT kontrolcü + inverter sistemiyle kıyaslandığında büyük bir kolaylık ve maliyet avantajıdır.</p>

<h2>Sonuç</h2>
<p>MPPT teknolojisi, güneş enerjisinden maksimum verim almanın anahtarıdır. PWM'e göre %20-35 daha fazla enerji üretimi sağlar ve her hava koşulunda üstün performans gösterir. <a href="/kategori/solar-panel">FusionMarkt güneş panelleri</a> ve IEETek güç istasyonlarının yerleşik MPPT kontrolcüsüyle birlikte maksimum verimlilik elde edin.</p>`,
  },

  {
    slug: "guc-istasyonunda-pass-through-sarj-ups-modu",
    title: "Güç İstasyonunda Pass-Through Şarj: Aynı Anda Şarj ve Kullanım (UPS Modu)",
    excerpt: "Pass-through şarj nedir? Güç istasyonu prize takılıyken cihazlarınızı beslerken kendisi de şarj olabilir mi? UPS modu, batarya etkisi ve doğru kullanım rehberi.",
    category: "Enerji",
    tags: ["pass-through şarj", "UPS modu", "kesintisiz güç", "güç istasyonu ev", "eş zamanlı şarj"],
    metaTitle: "Pass-Through Şarj ve UPS Modu: Güç İstasyonu Ev Kullanımı",
    metaDescription: "Pass-through şarj nedir? Güç istasyonunu UPS olarak kullanma. Aynı anda şarj ve cihaz besleme, batarya etkisi, SH4000 10ms geçiş ve doğru kullanım ipuçları.",
    metaKeywords: ["pass-through şarj", "UPS güç kaynağı", "kesintisiz güç", "güç istasyonu ev kullanımı", "eş zamanlı şarj kullanım"],
    publishedAt: new Date("2026-02-22"),
    content: `<h2>Pass-Through Şarj Nedir?</h2>
<p><strong>Pass-through şarj</strong>, güç istasyonunun aynı anda hem şarj edilmesi hem de bağlı cihazlara enerji sağlaması anlamına gelir. Yani güç istasyonu AC prize takılıyken, çıkış portlarından cihazlarınızı besleyebilir.</p>

<p>Bu özellik, güç istasyonunu evde sürekli prize takılı bir <strong>UPS (Kesintisiz Güç Kaynağı)</strong> olarak kullanmanıza olanak tanır: normal durumda şebeke elektriğini bypass eder, elektrik kesildiğinde otomatik olarak bataryadan beslemeye geçer.</p>

<h2>Nasıl Çalışır?</h2>

<h3>Normal Durum (Şebeke Var)</h3>
<ol>
<li>Güç istasyonu AC prize takılıdır</li>
<li>Şebeke elektriği, bağlı cihazları doğrudan besler (veya batarya üzerinden iletir)</li>
<li>Fazla enerji bataryayı şarj eder</li>
<li>Batarya %100 olduğunda şarj durur, cihazlar şebekeden beslenmeye devam eder</li>
</ol>

<h3>Kesinti Anı</h3>
<ol>
<li>Şebeke elektriği kesilir</li>
<li>Güç istasyonu bunu algılar</li>
<li>Milisaniyeler içinde batarya beslemesine geçer</li>
<li>Bağlı cihazlar kesintisiz çalışmaya devam eder</li>
</ol>

<h2>UPS Geçiş Süresi: Neden Milisaniyeler Önemli?</h2>
<p>Bir güç istasyonunun UPS olarak kullanılabilmesi için <strong>geçiş süresi (switchover time)</strong> kritiktir:</p>

<table>
<tr><th>Geçiş Süresi</th><th>Etki</th><th>Hangi Cihazlar Etkilenir?</th></tr>
<tr><td><strong>&lt;10ms</strong></td><td>Hiçbir cihaz fark etmez</td><td>Bilgisayar, modem, NAS, medikal — hepsi sorunsuz</td></tr>
<tr><td>10-20ms</td><td>Çoğu cihaz tolere eder</td><td>Masaüstü PC güç kaynakları genellikle 16ms hold-up time'a sahip</td></tr>
<tr><td>20-100ms</td><td>Hassas cihazlar kapanabilir</td><td>Bazı bilgisayarlar, ağ ekipmanları resetlenebilir</td></tr>
<tr><td>&gt;100ms</td><td>UPS değil, sadece pass-through</td><td>Çoğu cihaz kısa bir kesinti yaşar</td></tr>
</table>

<h3>IEETek Modellerin Geçiş Süreleri</h3>
<table>
<tr><th>Model</th><th>Pass-Through</th><th>UPS Geçiş Süresi</th><th>UPS Modu</th></tr>
<tr><td>P800</td><td>Var</td><td><strong>&lt;10ms</strong></td><td>UPS</td></tr>
<tr><td>P1800</td><td>Var</td><td><strong>&lt;10ms</strong></td><td>UPS</td></tr>
<tr><td>P2400</td><td>Var</td><td><strong>&lt;10ms</strong></td><td>UPS</td></tr>
<tr><td>P3200</td><td>Var</td><td><strong>&lt;10ms</strong></td><td>UPS</td></tr>
<tr><td>SH4000</td><td>Var</td><td><strong>&lt;10ms</strong></td><td>Profesyonel UPS</td></tr>
</table>

<p>IEETek güç istasyonlarının tümü <strong>10ms altı geçiş süresiyle</strong> bilgisayar, modem, NAS, güvenlik kamerası ve CPAP gibi hassas cihazlar için tam anlamıyla kesintisiz güç kaynağı görevi görür.</p>

<h2>Pass-Through Şarjın Bataryaya Etkisi</h2>
<p>En çok sorulan sorulardan biri: "Sürekli prize takılı bırakmak bataryayı yıpratır mı?"</p>

<h3>LiFePO4 Avantajı</h3>
<p>LiFePO4 bataryalar bu konuda diğer lityum kimyalarına göre çok daha dayanıklıdır:</p>
<ul>
<li><strong>Yüksek şarjda beklemeye toleranslı:</strong> NMC bataryalar %100'de uzun süre tutulduğunda hızla degradasyona uğrar. LiFePO4 ise çok daha stabil — %100'de aylarca bekleyebilir.</li>
<li><strong>Düşük ısınma:</strong> Pass-through sırasında LiFePO4'ün iç direnci düşük olduğundan minimal ısı oluşur.</li>
<li><strong>BMS koruması:</strong> IEETek BMS sistemi, batarya %100 olduğunda şarjı keser ve doğrudan bypass moduna geçer — batarya üzerinden sürekli akım akmaz.</li>
</ul>

<h3>Uzun Vadede Öneriler</h3>
<ul>
<li>Sürekli %100'de tutmak yerine <strong>%80-90 şarj limiti</strong> ayarlayabiliyorsanız idealdir (SH4000'de bu ayar mevcuttur)</li>
<li>Havalandırmanın yeterli olduğundan emin olun — güç istasyonunu kapalı dolaba koymayın</li>
<li>Yüksek güçlü cihazları (1000W+) sürekli pass-through ile beslemek daha fazla ısınma yaratır — bu tür yükler için doğrudan AC prizi tercih edin</li>
</ul>

<h2>Ev UPS Kullanım Senaryoları</h2>

<h3>Senaryo 1: Home Office UPS</h3>
<p>Masaüstü PC + monitör + modem = ~200-350W</p>
<p><strong>P1800 (1024Wh):</strong> Pass-through modunda çalışır. Elektrik kesildiğinde 3-5 saat çalışma süresi. İşinizi kaydetmeye ve güvenli kapanmaya yeterli.</p>

<h3>Senaryo 2: Ev Güvenlik Sistemi</h3>
<p>4× IP kamera + NVR + modem = ~60-100W</p>
<p><strong>P800 (512Wh):</strong> 5-8 saat kesintisiz güvenlik kaydı. SH4000 ile günlerce.</p>

<h3>Senaryo 3: Medikal Cihaz (CPAP/Oksijen)</h3>
<p>CPAP ~30W, oksijen konsantratörü ~120-300W</p>
<p><strong>SH4000 (5120Wh, 10ms UPS):</strong> Kritik medikal kullanım için ideal. Gece boyunca CPAP kesintisiz çalışır, siz fark bile etmezsiniz.</p>

<h3>Senaryo 4: Ağ Ekipmanları (Modem + NAS)</h3>
<p>Modem + WiFi AP + NAS = ~40-80W</p>
<p><strong>P800 (512Wh):</strong> 6-12 saat internet ve veri erişimi. Uzaktan çalışanlar ve akıllı ev kullanıcıları için kritik.</p>

<h2>Pass-Through vs Geleneksel UPS Karşılaştırma</h2>
<table>
<tr><th>Kriter</th><th>Güç İstasyonu (Pass-Through)</th><th>Geleneksel UPS</th></tr>
<tr><td>Batarya kapasitesi</td><td><strong>500-5000Wh+</strong></td><td>100-500Wh (genellikle)</td></tr>
<tr><td>Yedekleme süresi</td><td><strong>Saatler-günler</strong></td><td>5-30 dakika</td></tr>
<tr><td>Taşınabilirlik</td><td><strong>Taşınabilir</strong></td><td>Sabit</td></tr>
<tr><td>Solar şarj</td><td><strong>Var</strong></td><td>Yok</td></tr>
<tr><td>Çoklu çıkış (USB/DC)</td><td><strong>Var</strong></td><td>Sadece AC</td></tr>
<tr><td>Batarya ömrü</td><td><strong>4000+ döngü (LiFePO4)</strong></td><td>300-500 döngü (kurşun-asit)</td></tr>
<tr><td>Geçiş süresi</td><td><strong>&lt;10ms (tüm modeller)</strong></td><td>2-5ms (online UPS)</td></tr>
<tr><td>Fiyat</td><td>Daha yüksek</td><td>Daha uygun (düşük kapasitede)</td></tr>
</table>

<h2>Sonuç</h2>
<p>Pass-through şarj özellikli güç istasyonları, geleneksel UPS'lerin sunduğu kesintisiz güç korumasını çok daha yüksek kapasite, taşınabilirlik ve güneş enerjisi desteğiyle birleştirir. Ev ofisi, güvenlik sistemi, medikal cihaz veya ağ ekipmanları için ideal bir yatırımdır. <a href="/kategori/tasinabilir-guc-kaynaklari">FusionMarkt güç istasyonlarını</a> inceleyin — özellikle <a href="/sh4000">IEETek SH4000</a> ile profesyonel UPS deneyimi yaşayın.</p>`,
  },
];

async function seed() {
  console.log("🚀 Blog V9 seed (MPPT vs PWM + Pass-Through/UPS)...\n");
  for (const b of blogs) {
    const exists = await prisma.blogPost.findUnique({ where: { slug: b.slug } });
    if (exists) { console.log(`⚠️  Atlandı: ${b.slug}`); continue; }
    await prisma.blogPost.create({ data: { ...b, authorName: "FusionMarkt", status: "PUBLISHED" } });
    console.log(`✅ ${b.title}`);
  }
  console.log(`\n🎉 ${blogs.length} blog eklendi.`);
}
seed().catch(e => { console.error("❌", e); process.exit(1); }).finally(() => prisma.$disconnect());
