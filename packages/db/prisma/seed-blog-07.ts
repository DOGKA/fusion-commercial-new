  /**
 * FusionMarkt Blog Seed — 07
 * 13) Balkonda Güneş Paneli: Apartman Dairesinde Solar Enerji
 * 14) Üç Zamanlı Tarife ile Power Station: Gece Şarj, Gündüz Kullan
 *
 * Kullanım:
 *   cd packages/db && npx tsx prisma/seed-blog-07.ts
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
  // 13 — BALKONDA GÜNEŞ PANELİ
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "balkonda-gunes-paneli-apartman-solar-kurulum",
    title: "Balkonda Güneş Paneli: Apartman Dairesinde Solar Enerji Kurulabilir mi?",
    excerpt:
      "Çatınız yoksa da güneşten yararlanabilirsiniz. Balkon paneli kurulumunun izin durumu, gerçekçi üretim rakamları, montaj güvenliği ve neye yeteceği.",
    category: "Solar",
    tags: [
      "balkon güneş paneli",
      "apartmanda solar",
      "balkon tipi solar panel",
      "dairede güneş enerjisi",
      "SP100",
    ],
    metaTitle: "Balkonda Güneş Paneli Kurulumu: Apartman Solar Rehberi 2026",
    metaDescription:
      "Apartman balkonuna güneş paneli kurulur mu? İzin durumu, güney-doğu-batı balkon üretim farkı, montaj güvenliği ve hangi cihazları çalıştırabileceğiniz.",
    metaKeywords: [
      "balkon güneş paneli",
      "apartmanda güneş paneli",
      "balkon solar sistem",
      "dairede solar enerji",
      "balkon tipi güneş enerjisi",
    ],
    content: `<p>Güneş enerjisi denince akla müstakil ev çatısı geliyor ve Türkiye'de hanelerin büyük çoğunluğu apartman dairesinde oturuyor. Çatı sizin değil, kat maliklerinin ortak mülkü; yönetimden karar çıkarmak aylar sürüyor. Bu noktada çoğu insan konuyu kapatıyor.</p>

<p>Oysa güneyi gören bir balkon, ciddi miktarda kullanılabilir enerji üretir. Almanya'da son üç yılda milyonlarca hane balkonuna panel taktı ve bu, ülkedeki en hızlı büyüyen enerji kategorisi haline geldi. Türkiye'de aynı modelin bire bir kopyalanması mevzuat açısından mümkün değil — ama çalışan ve tamamen yasal bir alternatifi var.</p>

<blockquote>
<strong>Hızlı Cevap:</strong> Türkiye'de balkon panelini doğrudan evin prizine bağlayarak şebekeye enerji basmak, dağıtım şirketi izni ve çift yönlü sayaç olmadan yapılamaz. Yasal ve pratik yol, paneli şebekeden bağımsız bir <strong>ada sistem</strong> olarak kurmaktır: panel bir güç istasyonunu şarj eder, cihazlarınızı bu istasyondan beslersiniz. Güney cepheli bir balkonda <a href="/urun/tasinabilir-gunes-paneli-200w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp200">SP200</a> yazın günde 700–900Wh üretir; bu, modem, aydınlatma ve tüm mobil cihazlarınızın günlük ihtiyacını fazlasıyla karşılar.
</blockquote>

<h2>İki Farklı Kurulum Modeli ve Aradaki Hukuki Fark</h2>

<p>Balkon solar denince birbirine karıştırılan iki yöntem var. Ayrımı bilmek, hem yasal sorun yaşamamanız hem de doğru ekipmanı almanız için kritik.</p>

<h3>Şebekeye Bağlı Model (Almanya tipi "balkon santrali")</h3>

<p>Panele küçük bir mikro invertör takılır, çıkışı doğrudan evdeki bir prize sokulur. Panel ürettikçe evin tüketimi şebekeden değil panelden karşılanır, fazlası sayaç üzerinden şebekeye gider. Almanya'da belirli güç sınırının altındaki bu kurulumlar basit bir bildirimle serbest bırakıldı.</p>

<p>Türkiye'de durum farklı. Şebekeye enerji vermek — miktarı ne olursa olsun — dağıtım şirketine yapılan başvuru, teknik uygunluk onayı ve çift yönlü sayaç değişimi gerektirir. Mevzuat çatı üzeri lisanssız üretim üzerine kurgulanmıştır; kiracı ya da tek daire sahibi olarak bu süreci işletmek pratikte mümkün değildir. İzinsiz kurulumda hem sayaç müdahalesi riski hem de şebeke arızası anında hatta enerji vermeye devam ederek bakım ekiplerini tehlikeye atma sorumluluğu doğar.</p>

<h3>Ada Sistem (şebekeden bağımsız)</h3>

<p>Panel hiçbir noktada ev tesisatına veya şebekeye temas etmez. Panelden çıkan kablo doğrudan bir taşınabilir güç istasyonuna girer; cihazlarınızı bu istasyonun prizlerinden beslersiniz. Sayaçla, dağıtım şirketiyle ve mevzuatla hiçbir teması olmayan, tamamen kişisel bir ekipman kullanımıdır.</p>

<p>Bu modelin fazladan bir avantajı var: kesinti olduğunda sisteminiz çalışmaya devam eder. Şebekeye bağlı bir balkon santrali, elektrik kesildiğinde güvenlik gereği kendini kapatır. Ada sistemde bataryanız zaten doludur.</p>

<h2>Kat Mülkiyeti ve Yönetim İzni</h2>

<p>Balkon, kat mülkiyeti mevzuatında bağımsız bölümün eklentisi sayılır; içini kullanmak sizin hakkınızdır. Ancak binanın <strong>dış cephe görünümünü</strong> değiştiren müdahaleler ortak alanı ilgilendirir. Pratikte ayrım şöyle işler:</p>

<ul>
  <li><strong>Genellikle sorun çıkmayan:</strong> Paneli balkon zeminine ayaklı olarak koymak, korkuluğun iç yüzüne dışarıdan görünmeyecek şekilde sabitlemek, gündüz açıp akşam içeri almak.</li>
  <li><strong>Yönetim kararı gerektiren:</strong> Paneli korkuluğun dış yüzüne asmak, cepheye delik açarak braket monte etmek, balkon üstüne çatı benzeri sabit konstrüksiyon kurmak.</li>
  <li><strong>Kiracıysanız:</strong> Delik açmayan, sökülebilir çözümlerle sınırlı kalın. Katlanabilir paneller bu açıdan idealdir — taşındığınızda beraberinizde götürürsünüz.</li>
</ul>

<p>Site yönetimiyle konuşurken en ikna edici argüman, sistemin şebekeye bağlanmadığı ve binanın elektrik tesisatına hiçbir müdahale içermediğidir. Teknik olarak balkona koyulan bir şezlongdan farkı yoktur.</p>

<h2>Balkonunuz Ne Kadar Üretir?</h2>

<p>Balkon kurulumunun çatıya göre iki dezavantajı vardır: cephe yönünü siz seçemezsiniz ve panel çoğu zaman ideal eğimde değil, dikeye yakın durur. Optimum konumlandırılmış bir panelin üretimini 100 kabul edersek:</p>

<table>
  <thead>
    <tr>
      <th>Balkon Yönü</th>
      <th>Dikey Montaj (korkuluk)</th>
      <th>Ayaklı Eğimli Montaj (zemin)</th>
      <th>Üretim Profili</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Güney</td>
      <td>%65–70</td>
      <td>%85–95</td>
      <td>Öğle saatlerinde tepe yapar</td>
    </tr>
    <tr>
      <td>Güneydoğu / Güneybatı</td>
      <td>%58–65</td>
      <td>%80–88</td>
      <td>Sabah veya ikindiye kayar</td>
    </tr>
    <tr>
      <td>Doğu</td>
      <td>%45–55</td>
      <td>%60–70</td>
      <td>Sabah yoğun, öğleden sonra düşük</td>
    </tr>
    <tr>
      <td>Batı</td>
      <td>%45–55</td>
      <td>%60–70</td>
      <td>İkindi yoğun, sabah düşük</td>
    </tr>
    <tr>
      <td>Kuzey</td>
      <td>%20–30</td>
      <td>%25–35</td>
      <td>Yalnızca yayılı ışık, verimsiz</td>
    </tr>
  </tbody>
</table>

<p>Buradan çıkan en önemli sonuç: <strong>paneli korkuluğa dik asmak yerine balkon zeminine eğimli koymak, üretimi yaklaşık üçte bir artırır.</strong> Katlanabilir panellerin ayaklı yapısı bu yüzden balkonda dikey sabit panellerden daha iyi iş çıkarır. Yer kaplaması sorun oluyorsa panel yalnızca gündüz açılıp akşam katlanabilir.</p>

<p>Somut rakama çevirelim. Ankara'da güney cepheli bir balkonda, zeminde eğimli konumlandırılmış panellerin günlük üretimi:</p>

<table>
  <thead>
    <tr>
      <th>Panel</th>
      <th>Yaz Günü</th>
      <th>Bahar / Güz</th>
      <th>Kış Günü</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><a href="/urun/tasinabilir-gunes-paneli-100w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp100">SP100</a> (100W)</td>
      <td>450 Wh</td>
      <td>270 Wh</td>
      <td>140 Wh</td>
    </tr>
    <tr>
      <td><a href="/urun/tasinabilir-gunes-paneli-200w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp200">SP200</a> (200W)</td>
      <td>900 Wh</td>
      <td>540 Wh</td>
      <td>280 Wh</td>
    </tr>
    <tr>
      <td>2× SP200 (400W)</td>
      <td>1.800 Wh</td>
      <td>1.080 Wh</td>
      <td>560 Wh</td>
    </tr>
  </tbody>
</table>

<p>Kendi ilinizin ışınım verilerine göre bu rakamları yeniden hesaplamak isterseniz, il bazlı verimli güneş saati tablomuzu <a href="/blog/turkiye-il-il-gunes-paneli-verimli-gunes-saati">Türkiye'de güneş paneli kaç saat üretir</a> yazısında bulabilirsiniz. Parsel düzeyinde resmi veri için Enerji Bakanlığı'nın <a href="https://gepa.enerji.gov.tr/MyCalculator/" target="_blank" rel="noopener noreferrer">GEPA atlası</a> kullanılabilir.</p>

<h2>Bu Enerji Neye Yeter?</h2>

<p>Günde 900Wh soyut bir sayı. Somutlaştıralım — bir yaz gününde SP200'ün ürettiği enerjiyle neler çalıştırılabilir:</p>

<table>
  <thead>
    <tr>
      <th>Cihaz</th>
      <th>Tüketim</th>
      <th>900Wh ile</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Modem + router (7/24)</td><td>12W</td><td>75 saat — üç günlük ihtiyaç</td></tr>
    <tr><td>Dizüstü bilgisayar</td><td>55W</td><td>16 saat</td></tr>
    <tr><td>LED TV (42")</td><td>70W</td><td>12 saat</td></tr>
    <tr><td>Oda LED aydınlatması</td><td>15W</td><td>60 saat</td></tr>
    <tr><td>Mini buzdolabı</td><td>30W ortalama</td><td>30 saat</td></tr>
    <tr><td>Vantilatör</td><td>45W</td><td>20 saat</td></tr>
    <tr><td>Telefon şarjı</td><td>20W</td><td>45 tam şarj</td></tr>
  </tbody>
</table>

<p>Tipik bir hanenin "sürekli açık kalan küçük yükler" grubu — modem, birkaç LED, telefon ve tablet şarjları, çalışma masası — günde 400–700Wh arasında tüketir. Güney cepheli bir balkonda 200W panel, bu yükün tamamını yaz ve bahar aylarında karşılar.</p>

<p>Klima, elektrikli ısıtıcı, su ısıtıcısı ve çamaşır makinesi gibi ısıtma yapan cihazlar bu tabloya girmez; onlar için gereken kapasite hesabını <a href="/blog/elektrik-kesintisinde-kac-wh-gerekir">hangi cihaz için kaç Wh gerekir</a> yazımızda paylaştık.</p>

<h2>Hangi Ekipmanı Almalı?</h2>

<p>Balkon sistemi üç parçadan oluşur: panel, güç istasyonu ve bağlantı kablosu. Panel ile güç istasyonu arasındaki eşleşmede iki şeye bakılır — panelin açık devre gerilimi istasyonun kabul aralığına oturmalı, panel gücü de istasyonun maksimum solar giriş limitini aşmamalıdır.</p>

<table>
  <thead>
    <tr>
      <th>Kullanım Profili</th>
      <th>Önerilen Set</th>
      <th>Günlük Karşıladığı</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Modem, aydınlatma, telefon/tablet</td>
      <td>SP100 + <a href="/urun/512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800">P800</a></td>
      <td>~450 Wh</td>
    </tr>
    <tr>
      <td>Ev ofisi: laptop, monitör, modem, aydınlatma</td>
      <td>SP200 + <a href="/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800">P1800</a></td>
      <td>~900 Wh</td>
    </tr>
    <tr>
      <td>Yukarıdakiler + buzdolabı yedeklemesi</td>
      <td>2× SP200 + <a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200</a></td>
      <td>~1.800 Wh</td>
    </tr>
  </tbody>
</table>

<p>P800 maksimum 300W, P1800 500W, P3200 ise 1000W solar giriş kabul eder. Birden fazla panel bağlayacaksanız seri mi paralel mi bağlayacağınıza gerilim hesabıyla karar verin; ayrıntısı <a href="/blog/solar-panel-seri-paralel-baglanti-rehberi">seri ve paralel bağlantı rehberimizde</a>. Uzaktan çalışan bir kullanıcıysanız <a href="/blog/uzaktan-calisanlar-icin-tasinabilir-enerji-laptop-modem">laptop ve modem senaryosunu</a> ayrıca ele aldık.</p>

<h2>Montaj Güvenliği: Atlanmaması Gerekenler</h2>

<p>Yüksek katta, açık havada ve rüzgâra maruz bir yüzeye ekipman monte ediyorsunuz. Birkaç nokta hayati:</p>

<ul>
  <li><strong>Rüzgâr yükü.</strong> Bir metrekarelik panel, fırtınada üzerine 50 kilogramı aşan itme kuvveti alabilir. Ayaklı kurulumda paneli mutlaka korkuluğa iple veya kelepçeyle emniyete alın. Fırtına uyarısı varsa içeri alın.</li>
  <li><strong>Korkuluk dayanımı.</strong> Eski binalarda korkuluk bağlantı noktaları paslanmış olabilir. Panel asmadan önce korkuluğu elle zorlayarak kontrol edin.</li>
  <li><strong>Kablo geçişi.</strong> Kabloyu kapı veya pencere arasından sıkıştırarak geçirmeyin; zamanla izolasyon zedelenir. Kapı altından geçen yassı geçiş kablosu kullanın.</li>
  <li><strong>Güç istasyonunun yeri.</strong> Cihazı balkonda değil, içeride tutun. SP serisi paneller IP67 korumalıdır ve yağmurda dışarıda kalabilir; taşınabilir güç istasyonları IP20'dir, yağmur ve nemden korunmalıdır. Bu ayrımı <a href="/blog/ip20-ip54-ip65-ip67-koruma-sinifi-rehberi">koruma sınıfı rehberimizde</a> açıkladık.</li>
  <li><strong>Yaz sıcağı.</strong> Kapalı balkonda sıcaklık 45 °C'yi aşabilir. Güç istasyonunu doğrudan güneş altında veya kapalı bir dolapta bırakmayın.</li>
</ul>

<h2>Maliyeti Kendini Amorti Eder mi?</h2>

<p>Dürüst cevap: yalnızca elektrik faturasını düşürmek amacıyla bakarsanız, hayır. Günde 900Wh üretim, ayda yaklaşık 27 kWh eder. Bu miktarın mesken tarifesindeki parasal karşılığı, sistemin maliyetini kısa sürede geri getirecek bir rakam değildir.</p>

<p>Balkon solar yatırımı üç faydanın toplamıyla anlam kazanır:</p>

<ol>
  <li><strong>Kesinti bağımsızlığı.</strong> Elektrik kesildiğinde modeminiz, aydınlatmanız ve telefonlarınız çalışmaya devam eder. Bu, birçok hane için parasal tasarruftan daha değerli.</li>
  <li><strong>Taşınabilirlik.</strong> Aldığınız ekipman balkona sabitlenmiş değil. Aynı set kampa, karavana, yazlığa gider; taşındığınızda yeni evinize gelir. Çatı kurulumunda böyle bir esneklik yoktur.</li>
  <li><strong>Afet hazırlığı.</strong> Deprem sonrası şebekenin günlerce gelmediği senaryoda, güneşten yeniden şarj edilebilen bir enerji kaynağı bambaşka bir kategoriye girer. <a href="/blog/deprem-cantasi-icin-guc-kaynagi-afete-hazirlik">Afete hazırlık yazımızda</a> bunu ayrıntılandırdık.</li>
</ol>

<p>Faturaya doğrudan etki eden bir kullanım biçimi de var: pahalı saat dilimindeki tüketimi ucuz saatte depolanmış enerjiyle karşılamak. Hesabını <a href="/blog/uc-zamanli-tarife-power-station-elektrik-tasarrufu">üç zamanlı tarife yazımızda</a> ayrı ayrı çıkardık.</p>

<h2>Sıkça Sorulan Sorular</h2>

<h3>Kiracıyım, yine de kurabilir miyim?</h3>
<p>Ada sistemde evet. Duvara delik açmadığınız, cepheye kalıcı müdahale yapmadığınız sürece ev sahibinden özel izin gerektiren bir durum oluşmaz. Katlanabilir panel ve taşınabilir güç istasyonu, mobilya gibi sizinle taşınan eşyalardır.</p>

<h3>Kapalı (camlı) balkonum var, cam arkasından çalışır mı?</h3>
<p>Çalışır ama verimi belirgin düşer. Standart pencere camı gelen ışınımın %20–40'ını tutar, ısı camlı sistemlerde bu oran daha da yükselir. Ayrıca kapalı alanda panel soğuyamadığı için sıcaklık kaybı eklenir. Mümkünse camı açıp paneli dışarıda bırakın; değilse üretim beklentinizi yarıya indirin.</p>

<h3>Panel balkonda gece ve yağmurda kalabilir mi?</h3>
<p>SP serisi paneller IP67 korumalıdır — toza tamamen kapalı, geçici su altında kalmaya dayanıklı. Yağmur, nem ve gece dışarıda kalma sorun değildir. Dikkat edilecek tek şey konnektörlerin yere değmemesi ve su birikintisinde kalmamasıdır.</p>

<h3>Kuzey cepheli balkonum var, hiç mi olmaz?</h3>
<p>Doğrudan güneş almayan bir yüzey yalnızca yayılı gökyüzü ışığından üretim yapar; bu da nominal gücün dörtte biri civarındadır. 200W panelden günde 200–250Wh alırsınız. Modem ve telefon şarjı için yeterli ama yatırımın mantığı zayıflar. Bu durumda paneli sabit kurmak yerine hafta sonu bahçeye, pikniğe, kampa taşıyabileceğiniz bir ekipman olarak düşünmek daha akılcı olur.</p>

<h3>Panelden gelen kabloyu güç istasyonuna nasıl bağlarım?</h3>
<p>SP serisi paneller MC4 konnektörle çıkış verir; güç istasyonları XT60 girişi kullanır. Kutudan çıkan XT60–MC4 dönüştürücü kablo bu bağlantıyı sağlar. Panel ile istasyon arasındaki mesafe artıyorsa kablo kesitini büyütmek gerekir, aksi halde gerilim düşümü yaşarsınız.</p>

<h2>Başlamak İçin Ne Gerekiyor</h2>

<p>Önce balkonunuzun yönünü ve gün içinde kaç saat doğrudan güneş gördüğünü not edin — bu tek veri, alacağınız panel gücünü belirler. Ardından sürekli açık kalan cihazlarınızın günlük tüketimini toplayın. İkisi eşleşiyorsa sistem kendini her gün yeniler.</p>

<p>Tüketim hesabını <a href="/guc-hesaplayici">güç hesaplayıcı</a> ile birkaç dakikada çıkarabilirsiniz. Panel seçenekleri <a href="/kategori/gunes-panelleri">güneş panelleri</a> sayfasında, uyumlu bataryalar <a href="/kategori/tasinabilir-guc-kaynaklari">taşınabilir güç kaynakları</a> sayfasında listeli. Balkonunuzun fotoğrafını ve yönünü <a href="/iletisim">iletişim sayfamızdan</a> paylaşırsanız uygun set için birlikte karar verebiliriz.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // 14 — ÜÇ ZAMANLI TARİFE ile POWER STATION
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "uc-zamanli-tarife-power-station-elektrik-tasarrufu",
    title: "Üç Zamanlı Tarife ile Power Station: Gece Ucuza Şarj Et, Puant Saatte Kullan",
    excerpt:
      "Gece tarifesiyle şarj edip pahalı saatlerde kullanmak faturayı gerçekten düşürür mü? Gidiş-dönüş verimi, döngü maliyeti ve geri ödeme süresi üzerinden dürüst bir hesap.",
    category: "Rehber",
    tags: [
      "üç zamanlı tarife",
      "elektrik faturası düşürme",
      "puant saat",
      "gece tarifesi",
      "power station tasarruf",
    ],
    metaTitle: "Üç Zamanlı Tarife + Power Station: Fatura Ne Kadar Düşer?",
    metaDescription:
      "Gece ucuz tarifeyle şarj, puant saatte kullanım. Gidiş-dönüş verimi dahil gerçek tasarruf hesabı, geri ödeme süresi ve solar eklendiğinde değişen tablo.",
    metaKeywords: [
      "üç zamanlı tarife",
      "puant saat tasarrufu",
      "gece tarifesi elektrik",
      "power station elektrik faturası",
      "elektrik faturası düşürme yöntemleri",
    ],
    content: `<p>Elektriğin fiyatı günün her saatinde aynı değil. Üç zamanlı tarifeye geçmiş bir mesken abonesi, gece 22:00 ile sabah 06:00 arasında gündüz fiyatının yaklaşık yarısına, akşam 17:00–22:00 arasındaki puant diliminde ise gündüzün bir buçuk katına elektrik kullanır.</p>

<p>Bu fark, akla mantıklı bir fikir getiriyor: geceleyin ucuz elektrikle bir bataryayı doldur, akşam pahalı saatte o bataryadan kullan. Enerji sektöründe bu işleme "arbitraj" deniyor ve şebeke ölçeğinde milyarlarca dolarlık bir iş modeli. Peki ev ölçeğinde, tek bir taşınabilir güç istasyonuyla yapıldığında rakamlar tutuyor mu?</p>

<p>Hesabı sonuna kadar götürdük. Cevap, çoğu sitede bulacağınızdan daha nüanslı.</p>

<blockquote>
<strong>Hızlı Cevap:</strong> Yalnızca gece-puant arbitrajı, bir güç istasyonunun maliyetini makul sürede amorti etmez; kazanç döngü başına birkaç lira mertebesindedir. Ancak denklemi değiştiren iki unsur var: <strong>solar şarj eklendiğinde</strong> girdi maliyeti sıfıra iner ve <strong>cihazın yedekleme değeri</strong> hesaba katıldığında yatırım tamamen farklı bir zemine oturur. Tasarrufu tek gerekçe yapmayın; toplam faydanın bir parçası olarak görün.
</blockquote>

<h2>Üç Zamanlı Tarife Nasıl Çalışır?</h2>

<p>Standart mesken aboneliğinde tek bir birim fiyat üzerinden ödeme yaparsınız. Üç zamanlı tarifede ise gün üçe bölünür:</p>

<table>
  <thead>
    <tr>
      <th>Dilim</th>
      <th>Saat Aralığı</th>
      <th>Tek Zamanlı Fiyata Göre</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Gündüz</td><td>06:00 – 17:00</td><td>Yaklaşık aynı seviye</td></tr>
    <tr><td>Puant</td><td>17:00 – 22:00</td><td>Belirgin biçimde yüksek</td></tr>
    <tr><td>Gece</td><td>22:00 – 06:00</td><td>Yaklaşık yarısı</td></tr>
  </tbody>
</table>

<p>Geçiş için dağıtım şirketinize başvurmanız ve sayacınızın üç zamanlı ölçüme uygun olması gerekir; günümüzde takılan elektronik sayaçların büyük kısmı bu özelliği zaten destekler. Güncel birim fiyatlar ve dilim tanımları için <a href="https://www.epdk.gov.tr/Detay/Icerik/3-0-0-122/elektrik-faturalara-esas-tarife-tablolari" target="_blank" rel="noopener noreferrer">EPDK'nın faturalara esas tarife tabloları</a> tek resmi kaynaktır — bu yazıda mutlak fiyat vermek yerine oranlarla çalışacağız, çünkü tarifeler yıl içinde güncelleniyor.</p>

<p>Önemli bir uyarı: mesken tarifesinde kademeli fiyatlandırma da uygulanır, yani belirli bir aylık tüketim eşiğini geçtiğinizde birim fiyat yükselir. Bir güç istasyonu <strong>toplam tüketiminizi azaltmaz</strong> — aksine kayıplar nedeniyle çok az artırır. Yalnızca tüketimin hangi saatte gerçekleştiğini değiştirir. Kademeyi düşürmeyi hedefliyorsanız bu cihaz doğru araç değildir.</p>

<h2>Hesabın Gizli Değişkeni: Gidiş-Dönüş Verimi</h2>

<p>Bataryaya koyduğunuz enerjinin tamamını geri alamazsınız. Kayıp üç yerde oluşur:</p>

<ul>
  <li><strong>Şarj dönüşümü:</strong> Şebekeden gelen AC, bataryayı besleyecek DC'ye çevrilir.</li>
  <li><strong>Deşarj dönüşümü:</strong> Bataryadaki DC, cihazlarınız için tekrar 220V AC'ye çevrilir.</li>
  <li><strong>Bekleme tüketimi:</strong> Ekran, BMS, iletişim modülü ve fan, cihaz boştayken dahi birkaç watt çeker.</li>
</ul>

<p>Modern LiFePO4 güç istasyonlarında her bir dönüşüm adımı datasheet koşullarında %99'a yaklaşır. Ancak gerçek kullanımda bekleme tüketimi, kısmi yükte düşen invertör verimi ve sıcaklık etkisi devreye girer. Sağlıklı bir planlama için <strong>gidiş-dönüş verimini %85–90</strong> kabul etmek gerekir. Bu yazıda %87 kullanıyoruz.</p>

<p>Pratik anlamı şu: <a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200</a>'ün 2048Wh bataryasını tam doldurmak için şebekeden yaklaşık 2,35 kWh çekersiniz ve karşılığında cihazlarınıza 2,05 kWh verirsiniz. Kapasite etiketleri ile gerçek kullanılabilir enerji arasındaki farkı ayrıntılı incelediğimiz <a href="/blog/gercek-kullanilabilir-kapasite-wh-verim-kayiplari">kullanılabilir kapasite yazımız</a> bu konuyu daha da açıyor.</p>

<h2>Döngü Başına Kazanç Hesabı</h2>

<p>Mutlak fiyatlar değiştiği için oranla çalışalım. Gündüz birim fiyatına <strong>B</strong> diyelim. Tipik üç zamanlı tarifede gece yaklaşık <strong>0,55 × B</strong>, puant ise yaklaşık <strong>1,60 × B</strong> seviyesindedir.</p>

<p>Bir tam döngüde (gece doldur, puant boşalt) hesap şöyle işler:</p>

<table>
  <thead>
    <tr>
      <th>Model</th>
      <th>Batarya</th>
      <th>Gece Çekilen</th>
      <th>Puantta Verilen</th>
      <th>Döngü Kazancı</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><a href="/urun/512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800">P800</a></td>
      <td>0,51 kWh</td>
      <td>0,59 kWh × 0,55B</td>
      <td>0,51 kWh × 1,60B</td>
      <td>0,49 × B</td>
    </tr>
    <tr>
      <td><a href="/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800">P1800</a></td>
      <td>1,02 kWh</td>
      <td>1,18 kWh × 0,55B</td>
      <td>1,02 kWh × 1,60B</td>
      <td>0,99 × B</td>
    </tr>
    <tr>
      <td>P3200</td>
      <td>2,05 kWh</td>
      <td>2,35 kWh × 0,55B</td>
      <td>2,05 kWh × 1,60B</td>
      <td>1,98 × B</td>
    </tr>
    <tr>
      <td><a href="/urun/5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000">SH4000</a></td>
      <td>5,12 kWh</td>
      <td>5,89 kWh × 0,55B</td>
      <td>5,12 kWh × 1,60B</td>
      <td>4,95 × B</td>
    </tr>
  </tbody>
</table>

<p>Yorumu basit: <strong>her tam döngüde, bataryanın kWh cinsinden kapasitesi kadar bir "gündüz birim fiyatı" kazanırsınız.</strong> Yani kendi faturanızdaki gündüz kWh fiyatını alın, bataryanızın kWh değeriyle çarpın; günlük kazancınız yaklaşık odur.</p>

<p>Bunu aya çevirdiğinizde, her gün eksiksiz döngü yapıldığı varsayımıyla P3200 için ayda yaklaşık 60 × B, SH4000 için 150 × B çıkar. Cihaz fiyatını bu aylık kazanca böldüğünüzde ortaya çıkan geri ödeme süresi, tek başına yatırımı gerekçelendirecek kadar kısa değildir. Bunu açıkça söylemeyi tercih ediyoruz.</p>

<h2>Solar Eklendiğinde Tablo Değişiyor</h2>

<p>Arbitrajın zayıf halkası, gece elektriğini yine parayla satın alıyor olmanız. Girdi maliyetini sıfıra indirdiğinizde denklem tamamen değişir.</p>

<p>Bir güneş paneli bataryayı gündüz doldurursa, puant saatte kullandığınız her kWh doğrudan kazanç olur — çıkarılacak bir şarj maliyeti yoktur. Aynı P3200 örneğinde döngü kazancı 1,98 × B'den <strong>3,28 × B</strong>'ye çıkar; yani yaklaşık %65 artar.</p>

<table>
  <thead>
    <tr>
      <th>Şarj Kaynağı</th>
      <th>Girdi Maliyeti</th>
      <th>P3200 Döngü Kazancı</th>
      <th>Yıllık (300 döngü)</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Gece tarifesi</td><td>1,29 × B</td><td>1,98 × B</td><td>594 × B</td></tr>
    <tr><td>Solar (SP400)</td><td>0</td><td>3,28 × B</td><td>984 × B</td></tr>
    <tr><td>Karma: yazın solar, kışın gece</td><td>Değişken</td><td>~2,7 × B</td><td>~810 × B</td></tr>
  </tbody>
</table>

<p>Panel yatırımının kendisi bir maliyet elbette, ama panelin ömrü 25 yıl ve bakım gerektirmiyor. <a href="/urun/tasinabilir-gunes-paneli-400w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp400">SP400</a> Türkiye ortalamasında yılda yaklaşık 470 kWh üretir; bu üretimin puant fiyatıyla değerlendirildiğinde ortaya çıkan yıllık getiri, panelin kendisini gece arbitrajından çok daha hızlı amorti eder.</p>

<p>İlinize göre gerçekçi üretim rakamlarını <a href="/blog/turkiye-il-il-gunes-paneli-verimli-gunes-saati">il il verimli güneş saati tablomuzdan</a> alabilirsiniz.</p>

<h2>Pratikte Nasıl Kurulur?</h2>

<p>Sistemi çalıştırmanın iki yolu var; hangisini seçeceğiniz ne kadar yükü kaydırmak istediğinize bağlı.</p>

<h3>Basit Yöntem: Seçili Prizler</h3>

<p>Güç istasyonunu oturma odanıza koyar, sürekli çalışan yükleri — modem, TV, bilgisayar, aydınlatma grubu — bir uzatma kablosuyla istasyona bağlarsınız. Gece 22:00'de istasyonu şebekeye takarsınız, sabah 06:00'da fişini çekersiniz. Bu yöntem hiçbir kurulum, elektrikçi veya izin gerektirmez.</p>

<p>Güç istasyonlarımızın pass-through özelliği burada işe yarar: cihaz şarj olurken bağlı yükleri beslemeye devam eder, dolayısıyla gece fişe taktığınızda TV kapanmaz. Detayları <a href="/blog/guc-istasyonunda-pass-through-sarj-ups-modu">pass-through şarj yazımızda</a>.</p>

<h3>Kalıcı Yöntem: Pano Entegrasyonu</h3>

<p>SH4000 gibi hibrit invertörlü bir sistemde, cihaz doğrudan elektrik panosuna bağlanır ve seçilmiş bir devre grubunu (örneğin priz hattı ve aydınlatma) besler. Zaman ayarı cihazın kendi uygulaması üzerinden yapılır; gece otomatik şarj olur, puantta otomatik olarak bataryaya geçer. Kullanıcının hiçbir şey yapması gerekmez.</p>

<p>Bu kurulum yetkili bir elektrik teknisyeni gerektirir. Nasıl çalıştığını <a href="/blog/hibrit-invertor-ats-nedir-ev-panosu-baglanti">hibrit invertör ve ATS yazımızda</a> anlattık.</p>

<h2>Bu Kullanım Bataryayı Yıpratır mı?</h2>

<p>Haklı bir soru: günde bir tam döngü, cihazı normalden çok daha hızlı tüketir mi?</p>

<p>LiFePO4 hücreler bu senaryo için oldukça uygun. Ürünlerimizde kullanılan hücreler <strong>4000'in üzerinde döngü</strong> ömrüne sahiptir ve bu, günde bir döngüyle yaklaşık 11 yıl demektir. Üstelik 4000 döngü sonunda batarya ölmez; başlangıç kapasitesinin yaklaşık %80'ini korur.</p>

<p>Ömrü uzatmak için iki pratik öneri: bataryayı sürekli %100'e kadar doldurmak yerine %90 civarında bırakmak ve tamamen boşaltmamak. Döngü ömrünün nasıl hesaplandığını ve kWh başına maliyete nasıl çevrildiğini <a href="/blog/4000-dongu-ne-demek-power-station-kac-yil-dayanir">4000 döngü ne demek</a> yazımızda ele aldık. Genel bakım prensipleri için <a href="/blog/tasinabilir-guc-kaynagi-bakim-ve-depolama-rehberi">bakım ve depolama rehberimize</a> bakabilirsiniz.</p>

<h2>Sıkça Sorulan Sorular</h2>

<h3>Üç zamanlı tarifeye geçmek her hane için avantajlı mı?</h3>
<p>Hayır. Tüketiminizin büyük kısmı akşam 17:00–22:00 arasında gerçekleşiyorsa — ki çalışan bir hanede genellikle öyledir — üç zamanlı tarifeye geçmek faturanızı yükseltebilir. Geçmeden önce son üç ayın tüketim profilini kontrol edin. Bir güç istasyonu tam da bu noktada işe yarar: puant tüketimini bataryaya kaydırarak tarifeyi avantajlı hale getirir.</p>

<h3>Güç istasyonu toplam elektrik tüketimimi artırır mı?</h3>
<p>Evet, az miktarda. Gidiş-dönüş kaybı nedeniyle bataryadan kullandığınız her kWh için şebekeden yaklaşık 1,15 kWh çekersiniz. Kazanç, tüketimi azaltmaktan değil, ucuz saatte satın almaktan gelir.</p>

<h3>Cihazı gece otomatik şarja alacak bir zamanlayıcı kullanabilir miyim?</h3>
<p>Taşınabilir modellerde harici bir akıllı priz ile bunu yapabilirsiniz; şarj başlangıç saatini 22:00'ye ayarlamanız yeterli. P1800 ve üzeri modellerde uygulama üzerinden şarj gücünü sınırlandırmak da mümkündür — düşük güçle şarj, hücre ömrü açısından daha nazik bir yöntemdir.</p>

<h3>Aynı cihazı hem tasarruf hem yedekleme için kullanabilir miyim?</h3>
<p>Kullanabilirsiniz ama bir denge kurmanız gerekir. Tasarruf için bataryayı her akşam boşaltırsanız, kesinti tam o anda gelirse elinizde enerji kalmaz. Pratik çözüm, cihazı %100 boşaltmak yerine %30 rezerv bırakacak şekilde kullanmaktır. Uygulama üzerinden alt sınır tanımlayabilirsiniz.</p>

<h3>Bu yöntem jeneratöre göre nasıl konumlanıyor?</h3>
<p>Jeneratör yalnızca kesinti anında değer üretir, normal günlerde park halinde bekler ve bakım maliyeti doğurur. Güç istasyonu ise kesinti olmayan günlerde de tarife arbitrajı ve solar depolamayla çalışmaya devam eder. İki teknolojinin kapsamlı karşılaştırmasını <a href="/blog/sessiz-jenerator-alternatifi-power-station">sessiz jeneratör alternatifi</a> yazımızda yaptık.</p>

<h2>Karar Verirken Neye Bakmalı</h2>

<p>Elinizdeki faturayı açın ve gündüz kWh birim fiyatını bulun. Bunu, almayı düşündüğünüz cihazın kWh cinsinden kapasitesiyle çarpın — günlük tasarruf tavanınız bu. Sonra kendinize şu soruyu sorun: bu rakam tek başına yeterli değilse, kesinti güvencesi ve solar depolama kapasitesi eklendiğinde yatırım anlamlı hale geliyor mu?</p>

<p>Çoğu hane için cevap evet, ama bunun nedeni tarife farkı değil; cihazın aynı anda üç işi birden yapması. Kendi kullanım profilinize göre kapasite ve panel eşleşmesini <a href="/guc-hesaplayici">güç hesaplayıcı</a> ile çıkarabilir, model önerisi için <a href="/kategori/tasinabilir-guc-kaynaklari">taşınabilir güç kaynakları</a> sayfamızı inceleyebilir ya da doğrudan <a href="/iletisim">bize yazabilirsiniz</a>.</p>`,
  },
];

async function main() {
  console.log("🚀 Blog Seed 07 başlıyor...\n");

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

  console.log("\n🎉 Blog Seed 07 tamamlandı.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Hata:", e);
  prisma.$disconnect();
  process.exit(1);
});
