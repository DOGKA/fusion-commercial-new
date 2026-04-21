/**
 * FusionMarkt Blog Seed — 05
 * 09) Power Station ile Klima Çalışır mı? Hangi Model Gerekir?
 * 10) Sessiz Jeneratör Alternatifi: Power Station Rehberi
 *
 * Kullanım:
 *   cd packages/db && npx tsx prisma/seed-blog-05.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface BlogInput {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  content: string;
}

const blogs: BlogInput[] = [
  // ══════════════════════════════════════════════════════════════════
  // 09 — POWER STATION ile KLİMA ÇALIŞIR mı?
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "power-station-ile-klima-calisir-mi",
    title: "Power Station ile Klima Çalışır mı? Hangi Model Gerekir?",
    excerpt:
      "9000, 12000 ve 18000 BTU klimalar için gerekli power station kapasitesi, sürekli çalışma süreleri ve başlangıç akımı uyumluluğu.",
    category: "Rehber",
    tags: [
      "power station klima",
      "klima power station",
      "taşınabilir güç kaynağı klima",
      "P3200 klima",
      "SH4000 klima",
    ],
    metaTitle: "Power Station ile Klima Çalışır mı? (2026 Detaylı Rehber)",
    metaDescription:
      "9000, 12000 ve 18000 BTU klimalar için hangi power station gerekir? Sürekli çalışma süresi, pik güç ve uyumluluk hesapları.",
    metaKeywords: [
      "power station ile klima",
      "klima için güç kaynağı",
      "9000 BTU klima güç kaynağı",
      "P3200 klima",
      "klima başlangıç akımı",
    ],
    content: `<p>"Taşınabilir güç kaynağı ile klima çalıştırabilir miyim?" sorusu, özellikle yaz aylarında ve yazlık/karavan kullanımında müşterilerimizin en çok sorduğu sorular arasında yer alır. Cevap, klimanın kapasitesine (BTU değerine), tipine (inverter / klasik on-off) ve beklenen çalışma süresine bağlı olarak değişir. Bu yazıda üç yaygın klima kapasitesi (9000, 12000, 18000 BTU) için uyumluluk ve süre hesaplarını, başlangıç akımı yönetimini ve gerçek kullanım senaryolarını detaylandırıyoruz.</p>

<blockquote>
<strong>Özet:</strong> 9000 BTU inverter klima; P1800 ile 1 saat, <a href="/urun/p3200">P3200</a> ile 2–2.5 saat, <a href="/sh4000">SH4000</a> ile 5–6 saat çalıştırılabilir. 12000 BTU klimalar P3200 ile ~1.5 saat, SH4000 ile ~4 saat. 18000 BTU ve üzeri büyük klimalar SH4000 + solar + B5120 modüler batarya paketini gerektirir. Klasik (on-off) klimalar yüksek başlangıç akımı nedeniyle inverter modellere göre daha zorlu yüklerdir.
</blockquote>

<h2>Klima Gücünü Doğru Okumak</h2>

<p>Klima etiketlerinde birden fazla güç değeri bulunur. Doğru hesaplama için şu üç kavram ayırt edilmelidir:</p>

<ul>
  <li><strong>BTU (British Thermal Unit):</strong> Klimanın soğutma kapasitesini gösterir. Elektriksel güç değildir. 9000 BTU ≈ 2,6 kW soğutma kapasitesi.</li>
  <li><strong>Soğutma Gücü (W):</strong> Klimanın elektrik tüketimi. Etiketlerde "Input Power — Cooling" olarak geçer. 9000 BTU inverter klimanın tipik elektrik tüketimi 700–900 W'tır.</li>
  <li><strong>Başlangıç Akımı (Inrush / Startup Current):</strong> Kompresör ilk çalıştığında saniyenin altında bir süre için nominal değerin 2–5 katı güç çekilebilir. 9000 BTU bir klimanın başlangıç sıçraması 1500–2000 W arasındadır.</li>
</ul>

<p>Power station seçiminde dikkat edilmesi gereken iki kritik parametre; <strong>sürekli AC çıkış</strong> gücünün klimanın elektrik tüketimini karşılaması, <strong>pik çıkış</strong> gücünün ise başlangıç akımını tolere edebilmesidir.</p>

<h2>Klima Tipleri: Inverter vs Klasik (On-Off)</h2>

<p>İki klima tipi, power station üzerinden çalıştırılma performansı açısından farklı davranır.</p>

<h3>Inverter Klima</h3>
<p>İstenen sıcaklığa yaklaşıldığında kompresör hızı yavaşlar, tam soğutmaya ihtiyaç olmadığı anlarda düşük güçte çalışmaya devam eder. Bu, sürekli tüketimi düşürür ve power station için daha uygun bir yüktür. Başlangıç akımı hâlâ yüksektir ancak sonraki saatlerde ortalama tüketim belirgin biçimde düşer.</p>

<h3>Klasik (On-Off) Klima</h3>
<p>Kompresör ya tam güçte çalışır ya da tamamen durur. Sıcaklık hedefe ulaştığında kompresör kapanır, hedefin üstüne çıkıldığında yeniden açılır. Her açılışta yüksek başlangıç akımı devreye girer; power station'ın pik güç desteğini sık sık zorlar. Ortalama tüketim inverter klimaya göre yaklaşık %20–30 daha yüksek seyreder.</p>

<p>Power station üzerinden klima çalıştırılacaksa <strong>inverter tipi klima</strong> her açıdan daha uygundur.</p>

<h2>Kapasite-Bazlı Uyumluluk Tablosu</h2>

<table>
  <thead>
    <tr>
      <th>Klima</th>
      <th>Sürekli Tüketim</th>
      <th>Başlangıç Akımı</th>
      <th>P800 (800W/1200W)</th>
      <th>P1800 (1800W/3600W)</th>
      <th>P3200 (3200W/6400W)</th>
      <th>SH4000 (4000W/8000W)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>9000 BTU inverter</td>
      <td>700–900 W</td>
      <td>1500–2000 W</td>
      <td>Çalışmaz</td>
      <td>Başlar, ~1 saat</td>
      <td>Başlar, ~2–2.5 saat</td>
      <td>Başlar, ~5–6 saat</td>
    </tr>
    <tr>
      <td>12000 BTU inverter</td>
      <td>1100–1400 W</td>
      <td>2200–3000 W</td>
      <td>Çalışmaz</td>
      <td>Sınırda, ~45 dk</td>
      <td>Başlar, ~1.5 saat</td>
      <td>Başlar, ~4 saat</td>
    </tr>
    <tr>
      <td>9000 BTU on-off</td>
      <td>900–1100 W</td>
      <td>1800–2500 W</td>
      <td>Çalışmaz</td>
      <td>Sınırda, ~50 dk</td>
      <td>Başlar, ~1.8 saat</td>
      <td>Başlar, ~4.5 saat</td>
    </tr>
    <tr>
      <td>12000 BTU on-off</td>
      <td>1200–1500 W</td>
      <td>2500–3500 W</td>
      <td>Çalışmaz</td>
      <td>Çalışmaz</td>
      <td>Başlar, ~1.3 saat</td>
      <td>Başlar, ~3.5 saat</td>
    </tr>
    <tr>
      <td>18000 BTU inverter</td>
      <td>1500–2000 W</td>
      <td>3000–4500 W</td>
      <td>Çalışmaz</td>
      <td>Çalışmaz</td>
      <td>Sınırda, ~1 saat</td>
      <td>Başlar, ~2.5 saat</td>
    </tr>
  </tbody>
</table>

<h2>Neden P800 Klima İçin Uygun Değildir?</h2>

<p>P800'ün sürekli AC çıkış gücü 800W, Smart-Boost modu ile kısa süreli 1200W'a kadar yük kabul eder. 9000 BTU inverter klimanın başlangıç akımı (1500W+) Smart-Boost sınırını aştığı için cihaz koruma moduna geçer; klima başlatılamaz veya anlık kapanır. Bu ürün ailesinde klima senaryoları için minimum tercih P1800, konforlu seçim P3200'dür.</p>

<h2>P1800 ile Klima: Sınırlı Ancak Kullanılabilir Bir Çözüm</h2>

<p>P1800'ün 1800W sürekli / 3600W pik çıkışı, 9000 BTU inverter klimayı başlatmak ve sürekli çalıştırmak için yeterlidir. Ancak 1024Wh kapasite, klimanın sürekli tüketimi altında yaklaşık <strong>1 saatlik</strong> bir çalışma süresi sunar. Bu süre; karavan içi kısa süreli serinletme, çekilmiş bir klima molası veya kesintinin ilk aşamasında oda içi konforu korumak için uygundur. Uzun süreli klima kullanımı için P1800 yeterli değildir.</p>

<p>12000 BTU ve üzeri klima modelleri P1800'ün kapasite-performans sınırlarını aşar. Başlangıç akımı sınırda karşılansa bile sürekli tüketim (1200W+) ürünü yüksek fanda tutar ve toplam çalışma süresi 30–45 dakikada biter.</p>

<h2>P3200 ile Klima: Konforlu Seçim</h2>

<p><a href="/urun/p3200">P3200</a>; 3200W sürekli / 6400W pik çıkış kapasitesi ile 9000 ve 12000 BTU inverter klimaların hem başlangıç akımını hem de sürekli tüketimini rahatça karşılar. 2048Wh kapasite; 9000 BTU klimayı 2–2.5 saat, 12000 BTU klimayı yaklaşık 1.5 saat çalıştırır. Karavan gece serinleme, yazlık gün ortası kullanım ve saha ofis klima senaryolarında dengeli bir çözümdür.</p>

<p>P3200'ün ayrıca 1000W solar giriş kapasitesi, gün içinde solar panel ile eşleştirildiğinde klimanın çalışma süresini belirgin biçimde uzatır. İki adet <a href="/urun/sp400">SP400 (400W)</a> paralel bağlantısıyla güneşli bir öğlen saatinde yaklaşık 700W gerçek üretim alınır; bu üretim klimanın anlık tüketiminin büyük kısmını karşılar ve batarya rezervi korunur.</p>

<h2>SH4000 ile Klima: Uzun Süreli ve Tam Ev Çözümü</h2>

<p><a href="/sh4000">SH4000</a>, hibrid invertör mimarisi ve 5120Wh başlangıç kapasitesi ile klima içeren tam ev yedeklemesi için uygundur. Başlangıç kapasitesi tek başına 9000 BTU klimayı 5–6 saat, 12000 BTU klimayı 4 saat, 18000 BTU klimayı 2.5 saat çalıştırır. B5120 batarya modülleriyle kapasite 10–25 kWh aralığına genişletilebilir ve uzun süreli (gece boyunca) klima kullanımı mümkün hale gelir.</p>

<p>SH4000'in HV MC4 solar girişine (3000W) paralel bağlanacak 6–8 adet SP400 paneli, yaz aylarında günlük klima tüketiminin çoğunu üretim tarafında karşılar ve evin tamamen off-grid çalışmasını destekler.</p>

<h2>Pratik Kullanım Senaryoları</h2>

<h3>Karavan Gece Serinlemesi (9000 BTU inverter, 2 saat)</h3>
<p><strong>P3200</strong> yeterlidir. 2 saat çalışma sonrası batarya rezervi ertesi günün güneş üretimine kadar kalabilir. SP400 paneli eklendiğinde sürdürülebilir bir sistem oluşur.</p>

<h3>Yazlık Gün Ortası Klima (12000 BTU, 4–5 saat, güneşli gün)</h3>
<p><strong>P3200 + 2× SP400 kombinasyonu.</strong> Güneşli öğlen saatlerinde panel üretimi klima tüketimini karşılar; batarya net tüketim düşük seviyede kalır. Gün sonunda batarya üzerinde %30–40 rezerv kalır.</p>

<h3>Ev Yaz Kesintisi (9000 BTU, 3 saat)</h3>
<p><strong>P3200 tek başına.</strong> Kesinti sırasında oda içi konforu korumak için yeterlidir. Kesinti 3 saati aşarsa klima sürelerini parçalayarak (örneğin 20 dk açık, 40 dk kapalı döngüsü) süre uzatılabilir.</p>

<h3>Tam Ev Yedeklemesi (Salon 9000 + Yatak Odası 9000 BTU, Gece)</h3>
<p><strong>SH4000 + 1 adet B5120 modül</strong> ideal. İki klimanın birlikte tüketimi saatte 1400–1600W seviyesinde seyreder; toplam 10 kWh kapasite ile gece boyunca çalışma sağlanır.</p>

<h3>Off-Grid Yazlık / Bağ Evi</h3>
<p><strong>SH4000 + B5120 + 4–6 adet SP400.</strong> Güneş üretimi günlük tüketimi karşılarken batarya gece rezervi sağlar. Enerji tüketim profiline göre kapasite ölçeklendirmesi yapılır.</p>

<h2>Başlangıç Akımını Yumuşatma: Yumuşak Başlatıcı (Soft Starter)</h2>

<p>Bazı klima modelleri, <strong>yumuşak başlatıcı (soft starter)</strong> adı verilen ek bir kompresör kontrol devresi ile donatılmıştır veya sonradan eklenebilir. Bu devre, kompresörün başlangıç akımını %30–70 azaltır. Özellikle sınırda kalan kapasiteler (P1800 ile 12000 BTU gibi) için soft starter entegre bir çözüm olabilir. Kurulum için klima teknisyeni ve modelinizin uyumluluğu kontrol edilmelidir.</p>

<h2>Ekonomi: Power Station ile Klima Kullanımı Mantıklı mı?</h2>

<p>Sürekli şebeke bağlantısı olan bir evde klimayı power station üzerinden çalıştırmak ekonomik açıdan gerekçelendirilemez; şebeke doğrudan klimayı beslediğinde kWh bedeli en düşüktür. Power station ile klima senaryosu üç durumda anlamlıdır:</p>

<ol>
  <li><strong>Elektrik kesintisi / afet yedekleme:</strong> Kesinti boyunca oda içi konforu korumak, tıbbi ihtiyacı olanlar için hayati.</li>
  <li><strong>Off-grid / karavan / kamp:</strong> Şebeke zaten yok; güneş + batarya kombinasyonu tek çözümdür.</li>
  <li><strong>Gündüz solar üretim fazlası:</strong> Solar panel ile güneş saatlerinde üretilen fazla enerji klima çalıştırma için kullanılabilir; şebekeye geri satılamayan (Türkiye'de ev/küçük ölçekte yaygın değil) fazla enerjinin değerlendirilmesi.</li>
</ol>

<h2>Sıkça Sorulan Sorular</h2>

<h3>24 saat klima çalıştırabilir miyim?</h3>
<p>Sabit şebeke bağlantısı olmadan 24 saat klima çalıştırmak için; SH4000 + 1–2 adet B5120 + 4+ adet SP400 seviyesinde bir sistem gereklidir. Tek başına herhangi bir taşınabilir güç kaynağı bu senaryoyu karşılamaz.</p>

<h3>Klimamın Soft Start özelliği yok, ekleyebilir miyim?</h3>
<p>Çoğu split klima modeline dışarıdan soft starter modülü eklenebilir. Klima teknisyeniyle modelinizin uyumluluğunu kontrol edin; tipik montaj yarım saat-1 saat arası sürer.</p>

<h3>9000 BTU inverter klimamı kaç saat çalıştıracağımı nasıl doğrulayabilirim?</h3>
<p>Kullanılabilir enerji = Kapasite × 0.9. Çalışma süresi = Kullanılabilir enerji ÷ Ortalama tüketim. Örneğin P3200 (2048Wh × 0.9 = 1843Wh) / 800W = 2.3 saat. Formülü kendi klima tüketim değerinizle çalıştırabilirsiniz.</p>

<h3>Klima kullanırken başka cihaz da çalıştırabilir miyim?</h3>
<p>Evet, ancak toplam tüketim power station'ın sürekli çıkış limitini aşmamalıdır. Örneğin P3200 (3200W sürekli) 9000 BTU inverter klima (800W) + buzdolabı (ortalama 60W) + modem + aydınlatma kombinasyonunu sorunsuz çalıştırır.</p>

<h3>Solar panel olmadan klima kullanmak ekonomik mi?</h3>
<p>Ekonomi hesabı, kullanım senaryosuna göre değişir. Sadece kesinti anlarında kullanılan bir sistem "ekonomi" kavramının dışındadır; afet-hazırlık yatırımıdır. Günlük kullanım için solar entegre olmayan bir power station-klima sistemi, şebekeye göre daha pahalı olur.</p>

<h2>Sonuç</h2>

<p>Power station ile klima çalıştırmak teknik olarak mümkündür ancak kapasite ve güç seçimi doğru yapılmalıdır. 9000 BTU inverter klima en kolay yönetilen yüktür; P3200 ve SH4000 modelleri bu senaryoyu konforlu şekilde karşılar. 12000 BTU ve üzeri kapasiteler için SH4000 ailesine ve batarya genişletme modüllerine yönelmek doğru stratejidir.</p>

<p>Kendi klima + ev kullanım profilinize uygun sistem tasarımı için <a href="/iletisim">bizimle iletişime geçin</a>; solar panel ve batarya modülü kombinasyonunu birlikte planlayalım. <a href="/kategori/tasinabilir-guc-kaynaklari">Tüm taşınabilir güç kaynağı modellerini</a> ve <a href="/kategori/gunes-panelleri">solar panel seçeneklerini</a> kategori sayfalarımızdan inceleyebilirsiniz.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // 10 — SESSİZ JENERATÖR ALTERNATİFİ
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "sessiz-jenerator-alternatifi-power-station",
    title: "Sessiz Jeneratör Alternatifi: Power Station Rehberi",
    excerpt:
      "Gürültü ve emisyon sorunu olmadan jeneratör ihtiyacını karşılayan power station çözümleri. Ev, kamp, karavan ve afet için sessiz enerji rehberi.",
    category: "Taşınabilir Enerji",
    tags: [
      "sessiz jeneratör",
      "jeneratör alternatifi",
      "power station jeneratör yerine",
      "sessiz güç kaynağı",
      "apartman jeneratör",
    ],
    metaTitle: "Sessiz Jeneratör Alternatifi: Power Station Rehberi (2026)",
    metaDescription:
      "Gürültüsüz, emisyonsuz ve bakımsız jeneratör alternatifi arayanlar için taşınabilir güç kaynağı rehberi. Apartman, kamp, karavan ve afet için sessiz enerji çözümleri.",
    metaKeywords: [
      "sessiz jeneratör",
      "jeneratör alternatifi",
      "sessiz güç kaynağı",
      "apartman için jeneratör",
      "sessiz taşınabilir enerji",
    ],
    content: `<p>"Sessiz jeneratör" arayışının temelinde üç ortak sorun vardır: gürültü, emisyon ve bakım yükü. Geleneksel benzinli veya dizel jeneratörler içten yanmalı motor temelli olduğu için bu üç sorundan bağımsız bir sessiz varyant üretmek teknik olarak mümkün değildir. "İnverter jeneratör" olarak pazarlanan modeller, klasik jeneratörlere göre daha az gürültülü olsa da mutlak sessizlik ve emisyonsuzluk sağlamazlar.</p>

<p>Taşınabilir güç kaynağı (power station) teknolojisi, bu üç sorunu temelden çözer: içten yanmalı motor yerine LiFePO4 batarya ve saf sinüs invertör kullanır. Gürültü yalnızca pasif soğutma fanından gelir, emisyon sıfırdır, bakım gerektirmez. Bu yazıda jeneratör alternatifi olarak power station çözümlerini; ev, kamp, karavan ve afet hazırlığı senaryoları açısından detaylı olarak değerlendiriyoruz.</p>

<blockquote>
<strong>Özet:</strong> Apartman, site, karavan, kamp ve kapalı alan kullanımlarında power station jeneratöre göre her yönüyle üstündür: sessiz (40–65 dB), sıfır emisyon, bakımsız, kapalı alanda güvenli, UPS özellikli. Yakıt beslemesiyle günlerce süren 24/7 endüstriyel kullanımlarda ise jeneratör hâlâ gerekli bir teknoloji olmaya devam etmektedir.
</blockquote>

<h2>Neden "Sessiz Jeneratör" Aslında Bir Çelişkidir?</h2>

<p>Jeneratör teknolojisinin gürültüsü, mekanik tasarımının kaçınılmaz bir sonucudur. Tipik gürültü seviyeleri şöyledir:</p>

<ul>
  <li>Klasik benzinli jeneratör (2–5 kW): <strong>75–95 dB</strong> (7 metre mesafede)</li>
  <li>Dizel jeneratör (5 kW ve üzeri): <strong>80–100 dB</strong></li>
  <li>İnverter tipi benzinli jeneratör (1–3 kW): <strong>55–70 dB</strong></li>
  <li>"Sessiz kabinli" endüstriyel jeneratör: <strong>65–75 dB</strong></li>
  <li><strong>Power station (fan açık, yüksek yükte):</strong> 40–65 dB</li>
  <li><strong>Power station (düşük yükte, fan kapalı):</strong> &lt;30 dB (çevre gürültüsü düzeyi)</li>
</ul>

<p>60 dB normal konuşma seviyesindedir. 80 dB ise yoğun trafikli cadde gürültüsüne yakındır. Apartman ortamında gece saatlerinde 55 dB üzeri bir sürekli gürültü, komşuluk ilişkilerini ve ev konforunu olumsuz etkiler. "Sessiz jeneratör" etiketli ürünlerin en iyi örnekleri dahi 55 dB seviyesinin altına inmekte zorlanır; power station ise pratikte 30–45 dB aralığında kalır.</p>

<h2>Emisyon Sorunu: Kapalı Alan Kullanımı</h2>

<p>Jeneratörlerin kapalı veya yarı kapalı alanlarda kullanımı hayati risk oluşturur. İçten yanmalı motorlar; karbon monoksit (CO), azot oksitleri (NOₓ), partikül madde ve diğer yanma ürünleri açığa çıkarır. CO; renksiz, kokusuz ve son derece zehirli bir gazdır. Garaj, balkon, mutfak pencereye yakın kullanım gibi senaryolarda bile gaz iç mekâna sızabilir ve fark edilmeden zehirlenmeye yol açabilir.</p>

<p>Her yıl Türkiye genelinde benzinli jeneratör kullanımına bağlı CO zehirlenme vakaları raporlanmaktadır; bu vakaların önemli bir kısmı kesinti sırasında iyi niyetle kapalı alanda çalıştırılan jeneratör kaynaklıdır. Power station teknolojisi bu riski tamamen ortadan kaldırır; oturma odasında, yatak odasında, karavan içinde, çadırda güvenle çalıştırılır.</p>

<h2>Bakım Farkı: Operasyonel Yük</h2>

<p>Jeneratör sahipliği belirli bir bakım disiplinini gerektirir. Standart bakım kalemleri:</p>

<ul>
  <li><strong>Motor yağı değişimi:</strong> Her 50–100 çalışma saatinde</li>
  <li><strong>Hava filtresi:</strong> Her 100 saatte bir</li>
  <li><strong>Buji kontrolü/değişimi:</strong> 100–200 saatte</li>
  <li><strong>Yakıt deposu:</strong> Yakıtın kullanılmadan bekletilmesi karbüratör tıkanıklığına yol açar; düzenli tüketim veya katkı maddesi gerekir</li>
  <li><strong>Mevsim bakımı:</strong> Uzun süreli depolama öncesi yakıt boşaltma veya stabilizatör eklenmesi</li>
  <li><strong>Kış hazırlığı:</strong> Dizel jeneratörlerde soğuk mevsim için yakıt türünün değiştirilmesi (kışlık mazot)</li>
</ul>

<p>Power station için bu bakım kalemlerinin tamamı ortadan kalkar. Önerilen tek rutin; uzun süre kullanılmayacaksa 6 ayda bir şarj seviyesinin %50–60 aralığında korunmasıdır. LiFePO4 bataryaların düşük kendini deşarj oranı (%2–3/ay) sayesinde ürün aylarca beklediğinde bile kapasite önemli ölçüde korunur.</p>

<h2>Hangi Senaryoda Hangi Power Station?</h2>

<h3>Apartman ve Site Kullanımı (Sessizlik Kritik)</h3>
<p>Çoğu apartman yönetmeliği ve kat mülkiyeti kuralları, balkonda veya ortak alanlarda jeneratör çalıştırılmasını yasaklar. Power station bu kısıtlamalara tâbi değildir. <a href="/urun/p1800">P1800</a> tipik ev yedeklemesinde, <a href="/urun/p3200">P3200</a> büyük aile ve klima kullanımında tercih edilir. Sabit bir kurulum tercih edenler için <a href="/sh4000">SH4000</a> hibrid invertör sistemi, evin ana elektrik hattına ATS üzerinden entegre edilerek kesintide otomatik devreye alınabilir.</p>

<h3>Kamp ve Dağ/Göl Kaçamakları</h3>
<p>Doğa turizminde kamp alanı yönetmelikleri genellikle jeneratör kullanımını kısıtlar veya yasaklar. Power station, gürültüsüz ve emisyonsuz yapısı sayesinde kamp deneyimini bozmadan ihtiyacı karşılar. <a href="/urun/p800">P800</a> hafta sonu kamp, P1800 haftalık kamp ve karavan kullanımları için tercih edilen modellerdir. <a href="/urun/sp100">SP100</a> veya <a href="/urun/sp200">SP200</a> solar paneli eklenerek sürdürülebilir enerji sistemi oluşturulur.</p>

<h3>Karavan Kullanımı</h3>
<p>Klasik jeneratör karavan içinde kullanılamaz; kompartman havalandırması ve yakıt deposu güvenliği gibi ek kısıtlamalar vardır. Power station bu sınırlamalardan bağımsızdır. Karavan için tipik öneri <a href="/urun/p1800">P1800 + SP200</a> veya <a href="/urun/p3200">P3200 + SP400</a> kombinasyonudur. Detaylı karşılaştırma için <a href="/blog/karavan-icin-power-station-mi-solar-paket-mi">Karavan İçin Power Station mı Solar Paket mi?</a> yazımızı inceleyebilirsiniz.</p>

<h3>Afet Çantası / Hazırlık Kiti</h3>
<p>Depremde veya uzun süreli altyapı kesintisinde jeneratörün iki kritik dezavantajı öne çıkar: yakıt tedarik zorluğu ve kapalı alan kullanım yasağı. Power station bu iki sorundan azadedir. <a href="/urun/p800">P800</a> afet çantası için ideal boyut ve ağırlıktadır; şarj edilip yıllarca bekletildiğinde kapasite büyük ölçüde korunur. P1800 ve üstü modeller ise tam ev hazırlığı için tercih edilir.</p>

<h3>Küçük İşletme ve Mağaza</h3>
<p>Kafe, market, berber, küçük ofis gibi mekanların kesinti yedeklemesinde sessizlik hem çalışan hem müşteri deneyimi açısından önemlidir. P1800 ve P3200 ana yük kalemlerini (aydınlatma, POS, soğutucu, internet) saatlerce karşılar. SH4000 ile sabit kurulumda elektrik kesintisi müşteriye hiç yansımadan çözülür.</p>

<h3>Saha / Şantiye / Endüstriyel</h3>
<p>24 saat yüksek yük (10+ kW) gerektiren şantiyeler ve endüstriyel sahalar; günde 8+ saat elektrikli alet kullanan büyük projeler için klasik dizel jeneratör hâlâ standart çözümdür. Power station bu segmentte doğrudan rakip değildir; ancak mola, gece ve hassas ölçüm ekipmanları için yardımcı bir sessiz güç kaynağı olarak kullanılır.</p>

<h2>Hybrid Çözüm: Jeneratör + Power Station</h2>

<p>Uzun süreli kesinti veya off-grid yerleşimlerde iki sistemin birlikte kullanımı en dayanıklı çözümü sunar. Mantık şöyledir:</p>

<ul>
  <li>Evin normal işletmesi power station (varsa solar ile desteklenerek) üzerinden yürür. Sessiz, bakımsız, kesintisiz.</li>
  <li>Batarya seviyesi kritik seviyeye indiğinde ve güneş üretimi yeterli olmadığında küçük bir jeneratör (1–2 kW inverter tip) 2–3 saat çalıştırılır. Bu süre içinde power station hızlı AC şarj modunda dolar.</li>
  <li>Jeneratör sonrası power station tekrar evi sessizce besler; jeneratör kapanır.</li>
</ul>

<p>Bu hybrid model, jeneratörün uzun süre kesintisiz çalıştırılmasını önler ve yakıt tüketimini belirgin biçimde azaltır. Yakıt deposu azaldığında ise power station'ın mevcut rezervi devreye girer. Afet ve uzak yerleşim senaryoları için tavsiye ettiğimiz yaklaşımdır.</p>

<h2>Gerçek Gürültü Karşılaştırması</h2>

<table>
  <thead>
    <tr>
      <th>Kaynak</th>
      <th>dB</th>
      <th>Algılanma</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Kütüphane</td><td>30 dB</td><td>Sessiz</td></tr>
    <tr><td>Power station (düşük yük)</td><td>30–40 dB</td><td>Sessiz</td></tr>
    <tr><td>Normal konuşma</td><td>60 dB</td><td>Orta</td></tr>
    <tr><td>Power station (yüksek yük, fan açık)</td><td>55–65 dB</td><td>Hafif duyulur</td></tr>
    <tr><td>İnverter jeneratör (düşük yük)</td><td>55–65 dB</td><td>Duyulur</td></tr>
    <tr><td>Klasik benzinli jeneratör</td><td>75–90 dB</td><td>Rahatsız edici</td></tr>
    <tr><td>Trafik (yoğun cadde)</td><td>80 dB</td><td>Yüksek</td></tr>
    <tr><td>Çim biçme makinesi</td><td>90 dB</td><td>Çok yüksek</td></tr>
  </tbody>
</table>

<p>Power station'ın yüksek yükte 55–65 dB'e ulaşabilmesi, belirli senaryolarda (sürekli tam yük, yüksek sıcaklık) karşılaşılan bir durumdur. Normal ev yükünde ve ılıman ortam sıcaklığında bu değer tipik olarak 30–45 dB aralığında kalır.</p>

<h2>Sıkça Sorulan Sorular</h2>

<h3>En sessiz jeneratör modeli power station kadar sessiz olabilir mi?</h3>
<p>Pratikte hayır. Kompakt boyuttaki en iyi inverter jeneratör dahi 50 dB seviyesinin altına nadiren iner; endüstriyel "sessiz kabinli" modeller 65 dB civarındadır. Power station'ın düşük yükteki 30–40 dB seviyesi jeneratör teknolojisi için erişilmez bir değerdir.</p>

<h3>Sessiz jeneratör alayım, yakıt beslemesi sürsün, yine de avantaj mı?</h3>
<p>Uzun süreli kesintiler veya off-grid yerleşimde yakıt beslemesi sağlanabiliyorsa jeneratörün "sınırsız çalışma" avantajı değerlidir. Ancak günlük şehir ve ev kullanımında bu avantajın pratik karşılığı azdır; bakım, yakıt stoğu, gürültü ve emisyon dezavantajları ağır basar. Hybrid (jeneratör + power station) yaklaşım çoğu zaman en dengeli çözümdür.</p>

<h3>Power station ile gaz sobası/doğalgaz kombisi çalıştırılır mı?</h3>
<p>Doğalgazlı cihazlar ısıyı doğalgazdan alır; elektrik yalnızca pompa, fan ve kontrol kartı için gereklidir. Tüketim 80–150W aralığındadır. P1800 ve üstü tüm modellerimiz bu cihazları uzun süre besleyebilir. Detay için <a href="/blog/ev-icin-tasinabilir-guc-kaynagi-kac-saat-calisir">Ev İçin Power Station</a> yazımıza bakabilirsiniz.</p>

<h3>Apartman balkonuna dışarıdan solar panel koyulabilir mi?</h3>
<p>Teknik olarak evet; <a href="/urun/sp100">SP100</a> veya <a href="/urun/sp200">SP200</a> gibi katlanabilir paneller balkon korkuluğuna monte edilebilir. Site yönetimi onayı ve güvenlik önlemleri dikkate alınmalıdır. Balkonunuza sabit montaj için daha farklı sabit tip paneller tercih edilebilir.</p>

<h3>Power station kurulumu bir uzmanlık gerektirir mi?</h3>
<p>Taşınabilir modeller (P800, P1800, P3200) için kurulum yoktur; kutudan çıkarılır, AC prize takılır, kullanılmaya başlanır. Sabit ev enerji sistemleri (SH4000) için ATS ve elektrik panosu bağlantısı yetkili bir elektrik teknisyeni tarafından yapılmalıdır.</p>

<h3>Power station 220V priz üretir, herhangi bir modifikasyon gerektirir mi?</h3>
<p>Hayır. AC prizleri standart Türkiye tipi Schuko prizidir. Ev cihazlarınızı doğrudan takıp kullanabilirsiniz. Adaptör veya dönüştürücü gerekmez.</p>

<h2>Sonuç</h2>

<p>Ev, apartman, karavan, kamp ve afet hazırlığı senaryolarında power station; jeneratöre göre teknik, pratik ve komşuluk açısından üstün bir çözümdür. Sessizlik, sıfır emisyon, bakımsızlık ve çok-amaçlılık gibi avantajlar; başlangıç maliyeti farkını uzun vadede fazlasıyla telafi eder. 24 saat yüksek güçlü endüstriyel senaryolar dışında jeneratör teknolojisi yerini büyük ölçüde power station ailesine bırakmaktadır.</p>

<p>Kullanım profilinize uygun kapasite için <a href="/guc-hesaplayici">Güç Hesaplayıcı</a>'yı kullanabilir; ürün ailesini <a href="/kategori/tasinabilir-guc-kaynaklari">taşınabilir güç kaynakları</a> sayfamızdan inceleyebilirsiniz. Özel senaryolar için <a href="/iletisim">iletişim sayfamızdan</a> ulaşarak sistem tasarımı desteği alabilirsiniz.</p>`,
  },
];

async function main() {
  console.log("🚀 Blog Seed 05 başlıyor...\n");

  for (const blog of blogs) {
    const data = {
      slug: blog.slug,
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt,
      category: blog.category,
      tags: blog.tags,
      metaTitle: blog.metaTitle,
      metaDescription: blog.metaDescription,
      metaKeywords: blog.metaKeywords,
      featuredImage: null,
      status: "PUBLISHED" as const,
      authorName: "FusionMarkt",
      publishedAt: new Date(),
    };

    await prisma.blogPost.upsert({
      where: { slug: blog.slug },
      create: data,
      update: {
        ...data,
        publishedAt: undefined,
      },
    });

    console.log(`✅ ${blog.title}`);
  }

  console.log("\n🎉 Blog Seed 05 tamamlandı.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Hata:", e);
  prisma.$disconnect();
  process.exit(1);
});
