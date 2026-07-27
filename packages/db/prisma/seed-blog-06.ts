/**
 * FusionMarkt Blog Seed — 06
 * 11) Monokristal, Polikristal ve Esnek Güneş Paneli Farkı
 * 12) Türkiye'de Güneş Paneli Günde Kaç Saat Üretir? İl İl Verimli Güneş Saati
 *
 * Kullanım:
 *   cd packages/db && npx tsx prisma/seed-blog-06.ts
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
  // 11 — MONOKRİSTAL vs POLİKRİSTAL vs ESNEK PANEL
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "gunes-paneli-monokristal-polikristal-esnek-fark",
    title: "Monokristal, Polikristal ve Esnek Güneş Paneli Farkı: Hangisi Daha Verimli?",
    excerpt:
      "Aynı 200W etiketli iki panelin fiyatı neden iki katı fark eder? Hücre teknolojisi, verim, sıcaklık davranışı ve kapladığı alan üzerinden net bir karşılaştırma.",
    category: "Solar",
    tags: [
      "monokristal güneş paneli",
      "polikristal güneş paneli",
      "esnek güneş paneli",
      "güneş paneli verimi",
      "solar panel çeşitleri",
    ],
    metaTitle: "Monokristal mi Polikristal mi? Güneş Paneli Türleri (2026)",
    metaDescription:
      "Monokristal, polikristal, esnek ve ince film güneş panelleri arasındaki gerçek fark: verim, kapladığı alan, sıcaklık kaybı, ömür ve fiyat karşılaştırması.",
    metaKeywords: [
      "monokristal polikristal fark",
      "güneş paneli çeşitleri",
      "esnek güneş paneli",
      "en verimli güneş paneli",
      "monokristal panel verimi",
    ],
    content: `<p>İki panelin etiketinde de "200W" yazıyor. Biri diğerinin neredeyse iki katı fiyatta, üstelik daha küçük. Bir üçüncüsü rulo gibi kıvrılıyor ve karavan tavanına yapıştırılabiliyor ama satıcı "gücün tamamını alamazsınız" diyor. Bu üç panel de aynı işi yapıyor gibi görünüyor; yapmıyor.</p>

<p>Fark, panelin içindeki silikon hücrenin nasıl üretildiğinden geliyor. Bu yazıda hücre teknolojilerinin pratikte ne anlama geldiğini — yani panelin kaç metrekare yer kaplayacağını, yaz sıcağında ne kadar güç kaybedeceğini ve on yıl sonra ne kadarını hâlâ üretiyor olacağını — rakamlarla açıklıyoruz.</p>

<blockquote>
<strong>Hızlı Cevap:</strong> Monokristal panel %20–23 verimle en yüksek performansı verir, aynı gücü en küçük alanda üretir ve taşınabilir kullanımda tek mantıklı seçimdir. Polikristal %15–17 verimle daha ucuzdur ama aynı güç için yaklaşık %30 daha fazla alan ister; sabit çatı kurulumları dışında anlamı kalmamıştır. Esnek paneller kolaylık sunar, verim ve ömürde geri kalır. <a href="/kategori/gunes-panelleri">SP100, SP200 ve SP400</a> modellerimizin tamamı monokristal hücre kullanır.
</blockquote>

<h2>Panelin İçinde Ne Var?</h2>

<p>Bir güneş paneli, seri bağlanmış onlarca fotovoltaik hücreden oluşur. Her hücre silikon bir gofretten (wafer) üretilir ve bu gofretin kristal yapısı, panelin karakterini belirleyen tek en önemli faktördür.</p>

<p>Silikonu eritip yeniden katılaştırırken atomların nasıl dizildiği iki farklı sonuç üretir. Atomlar tek ve kesintisiz bir kristal kafes halinde dizilirse elektronlar bu yapı içinde engelsiz hareket eder — monokristal. Silikon bir kalıpta soğutulup birden çok kristal tanesi oluşursa, elektronlar tane sınırlarında takılır ve bir miktar enerji ısıya dönüşür — polikristal.</p>

<p>Bu mikroskobik fark, panel etiketindeki verim yüzdesinin ve dolayısıyla panelin boyutunun tek nedeni.</p>

<h2>Monokristal: Yüksek Verim, Küçük Alan</h2>

<p>Monokristal hücreler Czochralski yöntemiyle üretilir: erimiş silikonun içine bir tohum kristal daldırılır ve yavaşça döndürülerek çekilir. Ortaya tek parça, silindirik bir külçe çıkar. Bu külçe dilimlenip köşeleri kesildiği için monokristal hücreler tanınabilir bir görünüme sahiptir — köşeleri pahlı, düzgün siyah kareler.</p>

<p>Üretim süreci enerji yoğun ve yavaştır, maliyeti buradan gelir. Karşılığında elde edilen şey ise doğrudan verimdir:</p>

<ul>
  <li><strong>Ticari verim:</strong> %20–23 (premium TOPCon ve HJT hücrelerde %23–24)</li>
  <li><strong>Sıcaklık katsayısı:</strong> yaklaşık −%0,29 ile −%0,35 / °C</li>
  <li><strong>Düşük ışıkta davranış:</strong> Bulutlu havada ve sabahın erken saatlerinde polikristale göre belirgin biçimde daha iyi</li>
  <li><strong>Beklenen ömür:</strong> 25 yıl sonunda etiket gücünün %80–85'i</li>
</ul>

<p>Taşınabilir kullanımda bu verim farkı lüks değil, zorunluluk. Katlanabilir bir paneli sırt çantasına sığdırmak ya da karavan tavanına kurmak istiyorsanız kullanılabilir alanınız sabit; o alandan alabileceğiniz maksimum watt'ı belirleyen şey hücre verimidir. <a href="/urun/tasinabilir-gunes-paneli-200w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp200">SP200</a> açıldığında 2074 × 608 mm yer kaplar ve 200W üretir; aynı gücü polikristal hücreyle elde etmek için panelin yaklaşık 2,7 metre uzunluğa çıkması gerekirdi.</p>

<h3>Etikette Gördüğünüz Kısaltmalar</h3>

<p>Monokristal panellerin üzerinde sık sık ek teknoloji isimleri görürsünüz. Kısaca ne anlama geldikleri:</p>

<ul>
  <li><strong>PERC:</strong> Hücrenin arkasına yansıtıcı bir katman eklenir, emilmeyen ışık hücreye geri döner. Standart monokristale göre yaklaşık 1 puan verim kazandırır ve bugün sektör normudur.</li>
  <li><strong>TOPCon / HJT:</strong> PERC'in yerini almakta olan yeni nesil yapılar. Hem verimleri hem de sıcaklık katsayıları daha iyidir.</li>
  <li><strong>Half-cut (yarım kesim):</strong> Hücreler ikiye bölünür, akım yarıya iner, kablo kayıpları azalır. Ayrıca panelin yarısı gölgelenirse diğer yarısı üretmeye devam eder.</li>
  <li><strong>Shingled:</strong> Hücreler kiremit gibi üst üste bindirilir, aradaki boşluk kaybolur, aynı yüzeyden daha fazla güç alınır.</li>
</ul>

<p>Bu teknolojilerin verim üzerindeki kümülatif etkisini takip etmek isterseniz, Fraunhofer ISE'nin her yıl güncellediği <a href="https://www.ise.fraunhofer.de/en/publications/studies/photovoltaics-report.html" target="_blank" rel="noopener noreferrer">Photovoltaics Report</a> sektördeki en güvenilir açık kaynaktır.</p>

<h2>Polikristal: Ucuz Ama Yer İster</h2>

<p>Polikristal hücrede silikon doğrudan kare bir kalıba dökülür ve soğutulur. Kesme fire vermez, üretim hızlıdır, maliyet düşer. Panelin yüzeyinde görünen mavimsi, kar tanesi desenli görüntü tam olarak bu çok kristalli yapının izidir.</p>

<p>Verimi %15–17 bandındadır ve sıcak havada monokristale göre biraz daha hızlı güç kaybeder. On yıl önce fiyat farkı bu dezavantajları telafi ediyordu; bugün monokristal üretim maliyetleri o kadar düştü ki polikristalin ekonomik gerekçesi büyük ölçüde ortadan kalktı. Küresel üretimde payı hızla azalmaya devam ediyor.</p>

<p>Polikristalin hâlâ savunulabilir olduğu tek senaryo var: alanın bedava ve sınırsız olduğu, panel başına maliyetin tek kriter olduğu sabit arazi kurulumları. Taşınabilir bir üründe ise ağırlık ve hacim cezası anlamsızdır.</p>

<h2>Esnek Paneller ve İnce Film</h2>

<p>"Esnek panel" başlığı altında birbirinden oldukça farklı iki ürün satılıyor; ayırt etmek önemli.</p>

<h3>Esnek Monokristal (ETFE Kaplı)</h3>

<p>Bunlar aslında normal monokristal hücrelerdir; sadece cam yerine ETFE adı verilen şeffaf bir polimer tabakayla kaplanır ve ince bir tabana laminasyonlanır. Sonuç, birkaç kilo ağırlığında ve sınırlı ölçüde bükülebilen bir panel. Karavan tavanı, tekne güvertesi ve çadır gibi kavisli yüzeylerde işe yarar.</p>

<p>Bedeli şu: cam, hücreleri UV'den ve nemden korurken ETFE zamanla sararır ve mikro çatlaklar oluşturur. Cam kaplı bir panel 25 yıl garantiyle satılırken esnek panellerde tipik garanti 5–10 yıldır. Ayrıca yüzeye yapışık monte edildikleri için altlarında hava dolaşımı olmaz; yaz öğlesinde panel sıcaklığı 80 °C'yi aşabilir ve sıcaklık kaybı ciddi boyuta ulaşır.</p>

<h3>İnce Film (CIGS, Amorf Silikon)</h3>

<p>Bu teknolojilerde silikon gofret yoktur; yarı iletken malzeme doğrudan bir tabana buharlaştırılır. Çok hafif ve gerçekten bükülebilir olurlar, gölgelenmeye ve yüksek sıcaklığa daha dayanıklıdırlar. Ancak verimleri düşüktür: CIGS %12–15, amorf silikon %6–9 bandındadır.</p>

<p>Bir güç istasyonunu makul sürede doldurmak isteyen bir kullanıcı için bu verim seviyesi pratik değildir. 200W amorf panel, aynı gücü veren monokristal panelin yaklaşık üç katı alan kaplar.</p>

<h2>Yan Yana Karşılaştırma</h2>

<table>
  <thead>
    <tr>
      <th>Özellik</th>
      <th>Monokristal</th>
      <th>Polikristal</th>
      <th>Esnek Mono (ETFE)</th>
      <th>İnce Film (CIGS)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Hücre verimi</td>
      <td>%20–23</td>
      <td>%15–17</td>
      <td>%18–21</td>
      <td>%12–15</td>
    </tr>
    <tr>
      <td>200W için gereken alan</td>
      <td>~1,0 m²</td>
      <td>~1,3 m²</td>
      <td>~1,1 m²</td>
      <td>~1,6 m²</td>
    </tr>
    <tr>
      <td>Sıcaklık katsayısı</td>
      <td>−%0,29 / −%0,35 / °C</td>
      <td>−%0,38 / −%0,42 / °C</td>
      <td>−%0,35 / °C (montaja bağlı daha kötü)</td>
      <td>−%0,25 / −%0,30 / °C</td>
    </tr>
    <tr>
      <td>Düşük ışık performansı</td>
      <td>İyi</td>
      <td>Orta</td>
      <td>İyi</td>
      <td>Çok iyi</td>
    </tr>
    <tr>
      <td>Gölgelenme toleransı</td>
      <td>Düşük (bypass diyotla iyileşir)</td>
      <td>Düşük</td>
      <td>Düşük</td>
      <td>Yüksek</td>
    </tr>
    <tr>
      <td>Tipik ürün garantisi</td>
      <td>10–12 yıl</td>
      <td>10 yıl</td>
      <td>3–5 yıl</td>
      <td>5–10 yıl</td>
    </tr>
    <tr>
      <td>25 yıl sonu güç</td>
      <td>%80–85</td>
      <td>%80</td>
      <td>%70 veya altı</td>
      <td>%75–80</td>
    </tr>
    <tr>
      <td>Watt başına maliyet</td>
      <td>Orta</td>
      <td>Düşük</td>
      <td>Yüksek</td>
      <td>Çok yüksek</td>
    </tr>
  </tbody>
</table>

<h2>Sıcaklık: Türkiye'de Fark Yaratan Asıl Kalem</h2>

<p>Panel etiketindeki güç değeri STC adı verilen laboratuvar koşullarında ölçülür: 1000 W/m² ışınım, <strong>25 °C hücre sıcaklığı</strong> ve standart ışık spektrumu. Buradaki kritik ayrıntı, 25 derecenin hava sıcaklığı değil hücre sıcaklığı olması.</p>

<p>Temmuz öğleninde Konya'da hava 35 °C ise, doğrudan güneş altındaki bir panelin yüzey sıcaklığı rahatlıkla 65 °C'ye çıkar. Sıcaklık katsayısı −%0,35 / °C olan bir panelde hesap şöyle işler:</p>

<p><strong>Kayıp = (65 − 25) × 0,35 = %14</strong></p>

<p>Yani 200W etiketli panel, günün en parlak saatinde yalnızca sıcaklık nedeniyle yaklaşık 172W üretir. Polikristal bir panelde aynı koşulda kayıp %17'ye çıkar. Türkiye'nin güney illerinde yazın panel seçerken sıcaklık katsayısına bakmak, verim yüzdesine bakmak kadar önemlidir.</p>

<p>Pratik karşılığı da var: panelin altında hava dolaşımı bırakmak sıcaklığı 10–15 derece düşürür. <a href="/urun/tasinabilir-gunes-paneli-400w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp400">SP400</a> gibi ayaklı ve açılı kurulan panellerin yere yapışık esnek panellere karşı en somut avantajı budur. Mevsim ve hava koşullarının verim üzerindeki etkisini detaylı incelediğimiz <a href="/blog/gunes-paneli-verimi-mevsimler-hava-durumu-cografya">güneş paneli verimi</a> yazımızda bu konuyu daha da açıyoruz.</p>

<h2>Katlanabilir Panel Neden Ayrı Bir Kategori?</h2>

<p>Taşınabilir güç kaynaklarıyla kullanılan katlanabilir paneller, hücre teknolojisi açısından çatı panelleriyle aynıdır ama tasarım hedefleri tamamen farklıdır. Çatı paneli 25 yıl aynı yerde durmak üzere tasarlanır; katlanabilir panel yüzlerce kez açılıp kapanmak, ıslanmak, çantaya tıkılmak ve düşürülmek üzere tasarlanır.</p>

<p>Bu yüzden bakılması gereken kriterler de değişir:</p>

<ul>
  <li><strong>Menteşe ve kumaş dayanımı:</strong> Panelin kendisi değil, katlama noktaları yorulur.</li>
  <li><strong>Koruma sınıfı:</strong> SP serisi <strong>IP67</strong> sertifikalıdır — kısa süreli suya batmaya dahi dayanır. IP sınıflarının pratikte ne anlama geldiğini <a href="/blog/ip20-ip54-ip65-ip67-koruma-sinifi-rehberi">koruma sınıfı rehberimizde</a> anlattık.</li>
  <li><strong>Ayaklı açı ayarı:</strong> Panelin güneşe dik bakması, verimden çok daha büyük bir kazanç kalemidir. SP serisinde üç kademeli açı ayarı standarttır.</li>
  <li><strong>Voc uyumu:</strong> Panelin açık devre gerilimi, bağlanacağı güç istasyonunun giriş aralığına oturmalıdır. Ayrıntısı <a href="/blog/solar-panel-seri-paralel-baglanti-rehberi">seri ve paralel bağlantı rehberimizde</a>.</li>
</ul>

<h2>Hangi Senaryoda Hangi Panel?</h2>

<table>
  <thead>
    <tr>
      <th>Kullanım</th>
      <th>Önerilen Tip</th>
      <th>Gerekçe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Kamp, sırt çantası, günübirlik</td>
      <td>Katlanabilir monokristal 100W</td>
      <td>5 kg ağırlık, çantaya sığar, <a href="/urun/512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800">P800</a>'ü gün içinde doldurur</td>
    </tr>
    <tr>
      <td>Karavan — park halinde kurulum</td>
      <td>Katlanabilir monokristal 200W</td>
      <td>Açı ayarlanabilir, sökülüp gölgesiz alana taşınabilir</td>
    </tr>
    <tr>
      <td>Karavan — tavana sabit montaj</td>
      <td>Esnek mono veya cam panel</td>
      <td>Yükseklik kısıtı varsa esnek; yoksa cam panel daha uzun ömürlü</td>
    </tr>
    <tr>
      <td>Yazlık, bağ evi, off-grid</td>
      <td>Katlanabilir 400W veya sabit cam panel</td>
      <td>Yüksek günlük üretim; <a href="/urun/5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000">SH4000</a>'in 3000W HV solar girişi</td>
    </tr>
    <tr>
      <td>Tekne, güverte, kavisli yüzey</td>
      <td>Esnek monokristal</td>
      <td>Ağırlık ve yüzey uyumu belirleyici, ömür ikinci planda</td>
    </tr>
    <tr>
      <td>Sabit çatı, geniş arazi</td>
      <td>Cam monokristal (PERC / TOPCon)</td>
      <td>Watt başına en düşük 25 yıllık maliyet</td>
    </tr>
  </tbody>
</table>

<h2>Sıkça Sorulan Sorular</h2>

<h3>Monokristal panel gerçekten polikristalden daha mı dayanıklıdır?</h3>
<p>Mekanik dayanım hücre tipiyle değil, panelin cam kalınlığı, çerçevesi ve laminasyon kalitesiyle ilgilidir. İkisi de aynı IEC test standartlarına tabi tutulur. Fark yıllık güç kaybı oranındadır: monokristal paneller tipik olarak yılda %0,4–0,5 güç kaybederken polikristalde bu oran %0,5–0,7'dir.</p>

<h3>Panelin bir köşesi gölgede kalırsa üretim tamamen durur mu?</h3>
<p>Hücreler seri bağlı olduğu için gölgelenen bir hücre tüm dizinin akımını sınırlar. Modern panellerde bypass diyotları bu etkiyi sınırlandırır: gölgelenen bölüm devre dışı kalır, geri kalan bölümler üretmeye devam eder. Yine de tek bir yaprak, üretimi beklediğinizden fazla düşürebilir; paneli kurarken gün boyu gölge geçişini kontrol etmek gerekir.</p>

<h3>İki farklı marka veya güçte paneli birlikte kullanabilir miyim?</h3>
<p>Teknik olarak mümkün ama verimsizdir. Seri bağlantıda en düşük akımlı panel tüm diziyi kendi seviyesine çeker, paralel bağlantıda en düşük gerilimli panel benzer bir sınırlama yaratır. Mümkünse aynı model panelleri eşleştirin. Karma bağlantı yapmanız gerekiyorsa hesap detayları <a href="/blog/solar-panel-seri-paralel-baglanti-rehberi">seri-paralel bağlantı yazımızda</a>.</p>

<h3>Esnek panel karavan tavanına yapıştırılabilir mi?</h3>
<p>Yapıştırılabilir ama tavsiye etmiyoruz. Yüzeye tam temas eden panel soğuyamaz; yaz aylarında %20'yi bulan sıcaklık kaybı yaşarsınız ve ETFE kaplama daha hızlı yaşlanır. Panel ile tavan arasına 2–3 cm hava boşluğu bırakan alüminyum profil kullanmak hem verimi hem ömrü belirgin biçimde artırır.</p>

<h3>SP serisi panellerin verimi tam olarak kaç?</h3>
<p>SP100, SP200 ve SP400 modellerinin tamamı monokristal silikon hücre kullanır ve <strong>%21–23</strong> dönüşüm verimiyle çalışır. Üçü de IP67 korumalı, dört katlı ve üç kademeli açı ayarlıdır. Hangi kapasitenin size uyduğunu <a href="/blog/tasinabilir-gunes-paneli-secimi-100w-200w-400w">100W, 200W ve 400W karşılaştırmamızda</a> bulabilirsiniz.</p>

<h2>Peki Siz Hangisini Almalısınız?</h2>

<p>Taşınabilir bir sistem kuruyorsanız karar aslında verilmiş durumda: monokristal. Alanın ve ağırlığın kısıtlı olduğu her senaryoda hücre verimi doğrudan kullanılabilir enerjiye dönüşür ve aradaki fiyat farkı ilk sezonda kapanır. Polikristali yalnızca yer sıkıntısı olmayan sabit kurulumlarda, esnek paneli ise cam panelin fiziksel olarak monte edilemediği kavisli yüzeylerde değerlendirin.</p>

<p>Panel gücünüzü güç istasyonunuzun solar giriş limitine göre seçmeyi unutmayın — <a href="/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800">P1800</a> maksimum 500W, <a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200</a> ise 1000W solar giriş kabul eder. Günlük tüketiminize uygun panel-batarya eşleşmesini <a href="/guc-hesaplayici">güç hesaplayıcı</a> ile birkaç dakikada çıkarabilir, model bazlı öneri için <a href="/iletisim">bize ulaşabilirsiniz</a>.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // 12 — TÜRKİYE'DE GÜNEŞ PANELİ GÜNDE KAÇ SAAT ÜRETİR
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "turkiye-il-il-gunes-paneli-verimli-gunes-saati",
    title: "Türkiye'de Güneş Paneli Günde Kaç Saat Üretir? İl İl Verimli Güneş Saati Tablosu",
    excerpt:
      "Antalya'da 4 saatte dolan bir güç istasyonu Rize'de neden 9 saat sürer? Bölge bölge verimli güneş saati verileri ve panel-kapasite bazlı gerçek şarj süreleri.",
    category: "Solar",
    tags: [
      "güneşlenme süresi",
      "verimli güneş saati",
      "peak sun hours",
      "solar şarj süresi",
      "Türkiye güneş enerjisi potansiyeli",
    ],
    metaTitle: "Türkiye'de Güneş Paneli Kaç Saat Üretir? İl İl Tablo (2026)",
    metaDescription:
      "İl il verimli güneş saati verileri, panel açısı, mevsimsel değişim ve SP100/SP200/SP400 ile gerçek şarj süreleri. GEPA ve MGM verilerine dayalı hesap tabloları.",
    metaKeywords: [
      "türkiye güneşlenme süresi",
      "verimli güneş saati",
      "güneş paneli günlük üretim",
      "solar panel şarj süresi",
      "il il güneş enerjisi potansiyeli",
    ],
    content: `<p>"400W panelim var, güç istasyonumu kaç saatte doldurur?" Bu sorunun tek bir doğru cevabı yok, çünkü aynı panel Şanlıurfa'da temmuz ayında günde 2600Wh üretirken Rize'de aralık ayında 400Wh üretir. Altı kat fark.</p>

<p>Panel seçerken herkes watt değerine bakıyor, oysa günlük üretimi belirleyen ikinci çarpan — yaşadığınız yerin verimli güneş saati — çoğu zaman hiç hesaba katılmıyor. Bu yazıda Türkiye'nin bölge ve il bazlı güneşlenme verilerini alıp doğrudan kullanılabilir şarj süresi tablolarına çevirdik.</p>

<blockquote>
<strong>Hızlı Cevap:</strong> Türkiye'nin yıllık ortalama verimli güneş saati günde <strong>4,1 saat</strong>; yaz aylarında 6,5–7,5 saate çıkar, kışın 1,8–3,0 saate iner. Pratikte bu şu demek: yaz ortasında <a href="/urun/tasinabilir-gunes-paneli-200w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp200">SP200</a> ile <a href="/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800">P1800</a>'ü Akdeniz'de tek günde doldurursunuz; Karadeniz'de kışın aynı iş üç güne yayılır.
</blockquote>

<h2>"Güneşlenme Süresi" ile "Verimli Güneş Saati" Aynı Şey Değil</h2>

<p>Bu ayrım, solar hesabında en sık yapılan hatanın kaynağı.</p>

<p><strong>Güneşlenme süresi</strong>, meteoroloji istasyonlarının ölçtüğü, güneşin ufkun üzerinde ve bulutsuz olduğu toplam saat sayısıdır. Ankara için yıllık yaklaşık 2600 saat, yani günde ortalama 7,1 saat. Ama bu saatlerin çoğunda güneş alçak açıdadır ve paneliniz nominal gücünün çok altında üretir.</p>

<p><strong>Verimli güneş saati</strong> (peak sun hours) ise farklı bir soruyu cevaplar: "Gün boyunca gelen toplam ışınım enerjisi, 1000 W/m² şiddetinde kaç saatlik ışığa denk gelir?" Panel etiketleri tam olarak bu 1000 W/m² koşulunda ölçüldüğü için, üretim hesabında kullanılması gereken sayı budur.</p>

<p>Aradaki farkı bir örnekle netleştirelim. Ankara'da bir temmuz günü güneş 14 saat gökyüzünde kalır, ama toplam ışınım 6,4 kWh/m² eder. Yani o gün paneliniz "6,4 verimli güneş saati" görmüştür — 14 değil.</p>

<p><strong>Günlük üretim (Wh) = Panel gücü (W) × Verimli güneş saati × Sistem verimi</strong></p>

<p>Sistem verimi, gerçek hayatta kaçınılmaz olan kayıpları toplar: sıcaklık kaybı, kablo direnci, MPPT dönüşüm verimi, cam üzerindeki toz ve panelin güneşe tam dik bakmamasından doğan açı kaybı. Katlanabilir bir panel ile taşınabilir güç istasyonu ikilisinde bu katsayı pratikte <strong>0,75 ile 0,85</strong> arasında oturur. Aşağıdaki tüm hesaplarda 0,80 kullandık.</p>

<h2>Bölge Bölge Türkiye'nin Solar Potansiyeli</h2>

<p>Enerji ve Tabii Kaynaklar Bakanlığı'nın yayımladığı bölgesel güneş enerjisi verileri, Türkiye ortalamasını yılda <strong>1.527 kWh/m²</strong> toplam ışınım ve <strong>2.741 saat</strong> güneşlenme olarak belirler. Bölge dağılımı ise oldukça çarpıcı:</p>

<table>
  <thead>
    <tr>
      <th>Bölge</th>
      <th>Yıllık Işınım (kWh/m²)</th>
      <th>Yıllık Güneşlenme (saat)</th>
      <th>Günlük Ort. Verimli Güneş Saati</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Güneydoğu Anadolu</td><td>1.460</td><td>2.993</td><td>4,0</td></tr>
    <tr><td>Akdeniz</td><td>1.390</td><td>2.956</td><td>3,8</td></tr>
    <tr><td>Doğu Anadolu</td><td>1.365</td><td>2.664</td><td>3,7</td></tr>
    <tr><td>İç Anadolu</td><td>1.314</td><td>2.628</td><td>3,6</td></tr>
    <tr><td>Ege</td><td>1.304</td><td>2.738</td><td>3,6</td></tr>
    <tr><td>Marmara</td><td>1.168</td><td>2.409</td><td>3,2</td></tr>
    <tr><td>Karadeniz</td><td>1.120</td><td>1.971</td><td>3,1</td></tr>
  </tbody>
</table>

<p>Güneydoğu ile Karadeniz arasındaki fark %30'un üzerinde. Doğu Anadolu'nun beklenmedik biçimde yüksek çıkması ise rakımla ilgili: atmosfer tabakası inceldikçe yere ulaşan ışınım artıyor, üstelik soğuk hava panelin sıcaklık kaybını azaltıyor. Erzurum'da kış güneşi, aynı ışınımdaki bir Adana gününden daha verimli üretim yapar.</p>

<p>Kendi konumunuz için parsel düzeyinde veri almak isterseniz Enerji Bakanlığı'nın <a href="https://gepa.enerji.gov.tr/MyCalculator/" target="_blank" rel="noopener noreferrer">GEPA Güneş Enerjisi Potansiyel Atlası</a> ücretsizdir ve il-ilçe bazında aylık ışınım değerleri verir. Avrupa Komisyonu'nun <a href="https://re.jrc.ec.europa.eu/pvg_tools/en/" target="_blank" rel="noopener noreferrer">PVGIS aracı</a> ise panel açısını ve yönünü girerek simülasyon yapmanıza izin verir.</p>

<h2>İl İl Verimli Güneş Saati</h2>

<p>Aşağıdaki tablo, Türkiye'nin farklı iklim bölgelerinden temsili illeri günlük verimli güneş saati üzerinden karşılaştırıyor. Değerler optimum eğimde konumlandırılmış, güneye bakan bir panel içindir.</p>

<table>
  <thead>
    <tr>
      <th>İl</th>
      <th>Yaz (Haz–Ağu)</th>
      <th>Bahar / Güz</th>
      <th>Kış (Ara–Şub)</th>
      <th>Yıllık Ortalama</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Şanlıurfa</td><td>7,4</td><td>4,6</td><td>2,6</td><td>4,6</td></tr>
    <tr><td>Antalya</td><td>7,2</td><td>4,5</td><td>2,7</td><td>4,5</td></tr>
    <tr><td>Mersin</td><td>7,0</td><td>4,4</td><td>2,6</td><td>4,4</td></tr>
    <tr><td>Konya</td><td>7,1</td><td>4,3</td><td>2,3</td><td>4,3</td></tr>
    <tr><td>Diyarbakır</td><td>7,3</td><td>4,4</td><td>2,3</td><td>4,3</td></tr>
    <tr><td>Muğla</td><td>7,0</td><td>4,3</td><td>2,4</td><td>4,3</td></tr>
    <tr><td>Kayseri</td><td>6,9</td><td>4,2</td><td>2,3</td><td>4,2</td></tr>
    <tr><td>Van</td><td>7,0</td><td>4,2</td><td>2,4</td><td>4,2</td></tr>
    <tr><td>İzmir</td><td>6,9</td><td>4,2</td><td>2,2</td><td>4,1</td></tr>
    <tr><td>Erzurum</td><td>6,7</td><td>4,1</td><td>2,3</td><td>4,1</td></tr>
    <tr><td>Ankara</td><td>6,6</td><td>4,0</td><td>2,1</td><td>4,0</td></tr>
    <tr><td>Eskişehir</td><td>6,4</td><td>3,9</td><td>2,0</td><td>3,8</td></tr>
    <tr><td>Bursa</td><td>6,2</td><td>3,7</td><td>1,9</td><td>3,6</td></tr>
    <tr><td>İstanbul</td><td>6,0</td><td>3,5</td><td>1,7</td><td>3,4</td></tr>
    <tr><td>Samsun</td><td>5,6</td><td>3,3</td><td>1,6</td><td>3,2</td></tr>
    <tr><td>Trabzon</td><td>5,4</td><td>3,2</td><td>1,6</td><td>3,1</td></tr>
    <tr><td>Rize</td><td>5,0</td><td>3,0</td><td>1,4</td><td>2,9</td></tr>
  </tbody>
</table>

<p>Bu değerler bölgesel ışınım ortalamalarından türetilmiş yaklaşık rakamlardır; mikro iklim, rakım ve yerel bulutlanma nedeniyle aynı il içinde bile fark görülebilir. Kendi ilçenizin uzun yıllar güneşlenme istatistiklerine <a href="https://www.mgm.gov.tr/veridegerlendirme/il-ve-ilceler-istatistik.aspx" target="_blank" rel="noopener noreferrer">Meteoroloji Genel Müdürlüğü'nün il ve ilçe istatistikleri</a> sayfasından ulaşabilirsiniz.</p>

<h2>Panelinizin Günlük Üretimi</h2>

<p>Formülü SP serisine uygulayalım. Sistem verimi 0,80 kabul edilmiştir.</p>

<table>
  <thead>
    <tr>
      <th>Panel</th>
      <th>Antalya Yaz (7,2 sa)</th>
      <th>Ankara Yaz (6,6 sa)</th>
      <th>Ankara Kış (2,1 sa)</th>
      <th>Trabzon Kış (1,6 sa)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><a href="/urun/tasinabilir-gunes-paneli-100w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp100">SP100</a> (100W)</td>
      <td>576 Wh</td>
      <td>528 Wh</td>
      <td>168 Wh</td>
      <td>128 Wh</td>
    </tr>
    <tr>
      <td><a href="/urun/tasinabilir-gunes-paneli-200w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp200">SP200</a> (200W)</td>
      <td>1.152 Wh</td>
      <td>1.056 Wh</td>
      <td>336 Wh</td>
      <td>256 Wh</td>
    </tr>
    <tr>
      <td><a href="/urun/tasinabilir-gunes-paneli-400w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp400">SP400</a> (400W)</td>
      <td>2.304 Wh</td>
      <td>2.112 Wh</td>
      <td>672 Wh</td>
      <td>512 Wh</td>
    </tr>
  </tbody>
</table>

<h2>Güç İstasyonunuz Kaç Günde Dolar?</h2>

<p>Yukarıdaki günlük üretim değerlerini batarya kapasitelerine böldüğümüzde pratik sonuç ortaya çıkıyor. Tabloda "gün" ifadesi, o gün boyunca panelin kesintisiz güneş gördüğü ve cihazdan eşzamanlı tüketim yapılmadığı varsayımına dayanır.</p>

<table>
  <thead>
    <tr>
      <th>Kombinasyon</th>
      <th>Akdeniz Yaz</th>
      <th>İç Anadolu Yaz</th>
      <th>İç Anadolu Kış</th>
      <th>Karadeniz Kış</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>P800 (512Wh) + SP100</td>
      <td>0,9 gün</td>
      <td>1,0 gün</td>
      <td>3,0 gün</td>
      <td>4,0 gün</td>
    </tr>
    <tr>
      <td>P800 (512Wh) + SP200</td>
      <td>0,5 gün</td>
      <td>0,5 gün</td>
      <td>1,5 gün</td>
      <td>2,0 gün</td>
    </tr>
    <tr>
      <td>P1800 (1024Wh) + SP200</td>
      <td>0,9 gün</td>
      <td>1,0 gün</td>
      <td>3,0 gün</td>
      <td>4,0 gün</td>
    </tr>
    <tr>
      <td>P1800 (1024Wh) + SP400</td>
      <td>0,4 gün</td>
      <td>0,5 gün</td>
      <td>1,5 gün</td>
      <td>2,0 gün</td>
    </tr>
    <tr>
      <td>P3200 (2048Wh) + SP400</td>
      <td>0,9 gün</td>
      <td>1,0 gün</td>
      <td>3,0 gün</td>
      <td>4,0 gün</td>
    </tr>
    <tr>
      <td>P3200 (2048Wh) + 2× SP400</td>
      <td>0,4 gün</td>
      <td>0,5 gün</td>
      <td>1,5 gün</td>
      <td>2,0 gün</td>
    </tr>
  </tbody>
</table>

<p>Tablodan çıkan pratik kural şu: <strong>yaz aylarında panel watt değeri, batarya kapasitesinin yaklaşık beşte biri kadarsa sistem günlük olarak kendini yeniler.</strong> 1024Wh için 200W, 2048Wh için 400W panel. Kışın aynı bağımsızlığı istiyorsanız bu oranı üçe katlamanız gerekir.</p>

<p>Bu noktada güç istasyonunuzun solar giriş limitini aşmadığınızdan emin olun: P800 maksimum 300W, P1800 500W, P3200 1000W, <a href="/urun/5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000">SH4000</a> ise HV girişten 3000W kabul eder. Panelleri birden fazla bağlarken gerilim ve akım hesabını <a href="/blog/solar-panel-seri-paralel-baglanti-rehberi">seri ve paralel bağlantı rehberimizden</a> yapabilirsiniz.</p>

<h2>Panel Açısı: Bedava Verim</h2>

<p>Panelin eğimi, hiçbir ek maliyet gerektirmeden yıllık üretiminizi %10–25 arasında değiştirir. Türkiye enlemleri için pratik kurallar:</p>

<ul>
  <li><strong>Yıl boyu sabit bırakacaksanız:</strong> Bulunduğunuz enlem eksi 5–10 derece. Ankara ve Eskişehir için 30–35°, Antalya ve Mersin için 27–32°, Trabzon için 33–36°.</li>
  <li><strong>Yaz kullanımı ağırlıklıysa:</strong> Enlem eksi 15 derece. Güneş yüksekte olduğu için panel daha yatık durmalıdır.</li>
  <li><strong>Kış kullanımı kritikse:</strong> Enlem artı 15 derece. Alçak kış güneşini yakalamak için panel neredeyse dikleşir — bu aynı zamanda kar ve yaprak birikmesini de engeller.</li>
  <li><strong>Yön:</strong> Kuzey yarımkürede tam güney. Doğu veya batıya 20 dereceye kadar sapma %3'ten az kayıp yaratır; 45 derece sapma %10–15 kaybettirir.</li>
</ul>

<p>SP serisi panellerin üç kademeli ayak sistemi tam olarak bu sebeple var. Kampta paneli sabah doğuya, öğlen güneye, ikindi batıya çevirmek — yani günde iki kez elle takip yapmak — sabit kurulumla kıyaslandığında günlük üretimi %20'ye yakın artırır.</p>

<h2>Kışın Ne Yapmalı?</h2>

<p>Kış aylarında üretim düşüşü yalnızca güneşin alçalmasından değil; kısalan gün süresi, artan bulutluluk ve panel üzerindeki kar ya da nemin birleşiminden kaynaklanır. Üç yaklaşım var:</p>

<ol>
  <li><strong>Panel gücünü büyütmek.</strong> Aynı günlük enerjiyi kışın elde etmek için panel watt'ını üçe katlamak gerekir. Küçük bir sistemde ekonomik, büyük sistemde maliyetli bir çözümdür.</li>
  <li><strong>Karma şarj yapmak.</strong> Gündüz solar, gece şebeke. Güç istasyonlarımız AC ve solar girişi eşzamanlı kullanabilir; bu konuyu <a href="/blog/guc-istasyonunda-pass-through-sarj-ups-modu">pass-through şarj yazımızda</a> ele aldık.</li>
  <li><strong>Kullanımı mevsime göre planlamak.</strong> Yazlık ve bağ evi senaryolarında zaten yoğun kullanım yaz aylarındadır; kış için sistemi büyütmek çoğu zaman gereksiz yatırımdır. <a href="/blog/yazlik-bag-evi-solar-enerji-sistemi-kurulumu">Yazlık solar kurulum yazımızda</a> bu dengeyi detaylandırdık.</li>
</ol>

<p>Soğuğun bataryaya etkisi ayrı bir konu: LiFePO4 hücreler 0 °C altında şarj kabul etmez. Kış kullanımında dikkat edilmesi gerekenleri <a href="/blog/kisin-guc-istasyonu-kullanimi-soguk-hava-performans-rehberi">soğuk hava performans rehberimizde</a> topladık.</p>

<h2>Sıkça Sorulan Sorular</h2>

<h3>Bulutlu havada panel hiç üretmez mi?</h3>
<p>Üretir. Yoğun bulutlu bir günde panel nominal gücünün %10–25'i arasında çalışmaya devam eder; ince bulutlu havada bu oran %50'ye çıkabilir. 400W bir panel kapalı havada 40–100W üretiyor demektir — telefon, modem ve aydınlatma yükü için hâlâ anlamlı bir enerjidir.</p>

<h3>Cam arkasından, balkon içinden panel çalışır mı?</h3>
<p>Pencere camı ışınımın %20–40'ını tutar ve panelin üretimi orantılı olarak düşer. Ayrıca kapalı alanda panel soğuyamaz. Paneli mutlaka açık havaya, doğrudan güneş görecek şekilde yerleştirin.</p>

<h3>Panelin tozlanması ne kadar kayıp yaratır?</h3>
<p>Yağış almayan kurak dönemlerde biriken toz üretimi %5–15 düşürebilir; tarım bölgelerinde ve şantiye ortamında bu oran daha yükselir. Ayda bir yumuşak bezle ve temiz suyla silmek yeterlidir. Aşındırıcı fırça ve deterjan kullanmayın, ETFE ve cam yüzeyi çizersiniz.</p>

<h3>Tabloda verilen saatler benim bahçemde de geçerli mi?</h3>
<p>Tablodaki değerler açık ufuklu, gölgesiz bir konum varsayar. Bahçenizde ağaç, duvar veya bitişik bina varsa gün içinde birkaç saatlik gölge kaybı yaşarsınız. Panel kurmadan önce yaz ve kış gündönümlerinde gölgenin nereden geçtiğini gözlemlemek, panel watt'ını artırmaktan daha etkili olabilir.</p>

<h3>Şarj sırasında cihazdan elektrik çekersem süre nasıl değişir?</h3>
<p>Panelin ürettiği enerjiden önce anlık tüketiminiz karşılanır, kalan kısım bataryaya gider. 200W panel takılıyken 100W'lık bir yük çalıştırıyorsanız bataryaya net 60–70W gider ve dolum süresi yaklaşık üçe katlanır. Gerçekçi planlama için <a href="/guc-hesaplayici">güç hesaplayıcı</a> ile önce günlük tüketiminizi çıkarın.</p>

<h2>Kendi Rakamınızı Çıkarmak İçin</h2>

<p>İlinizin yıllık ortalama değerini tablodan alın, panel gücünüzle ve 0,80 katsayısıyla çarpın; günlük üretiminizi bulmuş olursunuz. Bunu tüketiminize bölünce sistemin kendini yenileyip yenilemediğini görürsünüz. Kışın açık kalıyorsa ya panel eklersiniz ya da şebeke desteğini planınıza dahil edersiniz.</p>

<p>Kapasite ve panel eşleşmesini konuşmak isterseniz, kullanım profilinizi <a href="/guc-hesaplayici">güç hesaplayıcıya</a> girip çıkan sonucu <a href="/iletisim">bize iletebilirsiniz</a>. Panel seçenekleri için <a href="/kategori/gunes-panelleri">güneş panelleri</a>, uyumlu bataryalar için <a href="/kategori/tasinabilir-guc-kaynaklari">taşınabilir güç kaynakları</a> sayfalarımıza göz atabilirsiniz.</p>`,
  },
];

async function main() {
  console.log("🚀 Blog Seed 06 başlıyor...\n");

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

  console.log("\n🎉 Blog Seed 06 tamamlandı.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Hata:", e);
  prisma.$disconnect();
  process.exit(1);
});
