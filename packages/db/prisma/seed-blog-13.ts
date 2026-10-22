/**
 * FusionMarkt Blog Seed — 13
 * 29) Güneş Paneli Temizliği Verimi Ne Kadar Artırır?
 * 30) Güneş Paneli Kaç Derece Eğimle ve Hangi Yöne Bakmalı?
 * 31) Sera, Bağ Evi ve Tarım Sulaması İçin Solar Sistem
 * 32) Taşınabilir Enerji Terimleri Sözlüğü
 *
 * Kullanım:
 *   cd packages/db && npx tsx prisma/seed-blog-13.ts
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
  // 29 — PANEL TEMİZLİĞİ
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "gunes-paneli-temizligi-verim-artisi-nasil-temizlenir",
    title: "Güneş Paneli Temizliği Verimi Ne Kadar Artırır? Doğru Temizlik Yöntemi",
    excerpt:
      "Toz, polen ve kuş pisliği panel üretimini sessizce düşürür. Kirlilik kaybı gerçekte ne kadar, hangi sıklıkla ve nasıl temizlenmeli? Panele zarar vermeden yapılacak doğru yöntem.",
    category: "Solar",
    tags: [
      "güneş paneli temizliği",
      "panel verimi",
      "kirlilik kaybı",
      "solar bakım",
      "panel bakımı",
      "gölgelenme",
    ],
    metaTitle: "Güneş Paneli Temizliği: Verim Kaybı ve Doğru Yöntem",
    metaDescription:
      "Kirli güneş paneli ne kadar verim kaybettirir? Toz, polen, kuş pisliği ve gölge etkisi, temizlik sıklığı, kullanılacak malzemeler ve panele zarar vermeyen yöntem.",
    metaKeywords: [
      "güneş paneli temizliği",
      "panel verim kaybı",
      "solar panel nasıl temizlenir",
      "kirlilik kaybı soiling",
      "güneş paneli bakımı",
      "panel gölgelenme etkisi",
    ],
    content: `<p>Güneş paneli, hareketli parçası olmayan nadir enerji ekipmanlarından biridir. Kurup unutabileceğiniz bir cihazdır. Ancak “bakım gerektirmez” ile “hiç ilgilenmeyin” aynı şey değildir.</p>

<p>Panelin tek işi ışığı geçirmektir. Cam yüzeydeki ince bir toz tabakası bile bu işi zorlaştırır ve üretim, siz fark etmeden düşmeye başlar. Kayıp yavaş biriktiği için genellikle bir arıza gibi görünmez; sadece “panel eskisi kadar iyi değil” hissi bırakır.</p>

<blockquote>
<strong>Hızlı Cevap:</strong> Hafif tozlanma tipik olarak %2–5, yoğun toz veya polen birikimi %10–20, kuş pisliği gibi nokta kirlilikler ise gölgeleme etkisiyle çok daha yüksek kayba yol açabilir. Yağış alan bölgelerde yılda 2–3 temizlik yeterlidir; tozlu, tarımsal veya sahil bölgelerinde aylık kontrol gerekir. Temizlik sabah erken veya akşamüstü, panel soğukken, bol su ve yumuşak bir bezle yapılmalı; deterjan, sert fırça ve yüksek basınçlı su kullanılmamalıdır.
</blockquote>

<h2>Kirlilik Üretimi Nasıl Düşürür?</h2>

<p>Fotovoltaik hücre, üzerine düşen ışık miktarıyla orantılı akım üretir. Işığın bir kısmı yüzeydeki partiküller tarafından yansıtılır veya emilir; hücreye ulaşan enerji azalır ve akım düşer.</p>

<p>Bu etkinin büyüklüğü kirliliğin türüne göre değişir:</p>

<table>
  <thead>
    <tr><th>Kirlilik Türü</th><th>Tipik Verim Kaybı</th><th>Açıklama</th></tr>
  </thead>
  <tbody>
    <tr><td>İnce toz tabakası</td><td>%2–5</td><td>Yağmurla büyük ölçüde temizlenir</td></tr>
    <tr><td>Yoğun toz / kum</td><td>%10–20</td><td>Kurak ve rüzgârlı bölgelerde hızlı birikir</td></tr>
    <tr><td>Polen (ilkbahar)</td><td>%5–15</td><td>Yapışkandır, yağmurla tam çıkmaz</td></tr>
    <tr><td>Kuş pisliği</td><td>Nokta bazında çok yüksek</td><td>Tam gölgeleme yaptığı için hücre grubunu devre dışı bırakabilir</td></tr>
    <tr><td>Yaprak, dal</td><td>Kapladığı alan oranında</td><td>Fiziksel olarak kaldırılmalı</td></tr>
    <tr><td>Kar</td><td>%100'e kadar</td><td>Panel eğimliyse genellikle kendi kayar</td></tr>
    <tr><td>Deniz tuzu / kireç lekesi</td><td>%3–10</td><td>Sahil ve sert su bölgelerinde birikir</td></tr>
  </tbody>
</table>

<h3>Nokta Kirliliği Neden Bu Kadar Kötü?</h3>

<p>Panelin tamamına yayılan ince toz, üretimi orantılı olarak düşürür. Ancak tek bir hücreyi tamamen kapatan bir kuş pisliği, o hücrenin bağlı olduğu tüm seri zincirin akımını kısıtlar.</p>

<p>Modern panellerde bypass diyotları bu etkiyi sınırlar; yine de küçük bir leke, kapladığı alandan çok daha büyük bir kayba yol açabilir. Aynı mantık gölgelenme için de geçerlidir: bir direk gölgesi veya asılı kablo, panelin küçük bir kısmını kapatsa bile üretimi orantısız biçimde düşürür.</p>

<h2>Ne Sıklıkla Temizlenmeli?</h2>

<table>
  <thead>
    <tr><th>Ortam</th><th>Önerilen Sıklık</th></tr>
  </thead>
  <tbody>
    <tr><td>Düzenli yağış alan şehir</td><td>Yılda 2–3 kez</td></tr>
    <tr><td>Kurak / tozlu bölge</td><td>Ayda bir kontrol, gerekirse temizlik</td></tr>
    <tr><td>Tarım arazisi, sera çevresi</td><td>2–4 haftada bir kontrol</td></tr>
    <tr><td>Sahil (tuz birikimi)</td><td>Ayda bir</td></tr>
    <tr><td>Ağaç altı / kuş yoğun alan</td><td>Haftalık göz kontrolü</td></tr>
    <tr><td>Taşınabilir panel (kamp, karavan)</td><td>Her kullanım sonrası silme</td></tr>
  </tbody>
</table>

<p>Sabit kurulumlarda en pratik takip yöntemi üretim verisini izlemektir. Benzer hava koşullarında üretim düşmeye başladıysa, muhtemelen temizlik zamanı gelmiştir.</p>

<h2>Doğru Temizlik: Adım Adım</h2>

<ol>
  <li><strong>Zamanı seçin.</strong> Sabah erken veya akşamüstü. Sıcak cama soğuk su dökmek termal şok ve çatlak riski yaratır.</li>
  <li><strong>Bağlantıyı kesin.</strong> Taşınabilir panellerde MC4 konnektörleri ayırın. Sabit sistemlerde üreticinin talimatına uyun.</li>
  <li><strong>Kuru kirleri önce alın.</strong> Yaprak, toz ve kum tanelerini yumuşak bir fırçayla veya üfleyerek uzaklaştırın. Islak bezle silmeye başlamak kum tanelerini cam üzerinde sürükler ve çizik bırakır.</li>
  <li><strong>Bol suyla yıkayın.</strong> Normal basınçlı su yeterlidir. Mümkünse damla lekesi bırakmaması için yumuşak su veya damıtık su tercih edin.</li>
  <li><strong>Yumuşak bezle silin.</strong> Mikrofiber bez veya yumuşak sünger. Dairesel değil, düz hareketlerle.</li>
  <li><strong>İnatçı lekeler için ılık su.</strong> Kuş pisliği ve polen için ılık suyla birkaç dakika ıslatın, sonra silin. Kazımayın.</li>
  <li><strong>Kurumaya bırakın.</strong> Silme kurutması genellikle gerekmez; lekeli su kullanıyorsanız temiz bezle kurutun.</li>
</ol>

<h3>Kesinlikle Yapılmaması Gerekenler</h3>

<ul>
  <li><strong>Yüksek basınçlı yıkama.</strong> Çerçeve sızdırmazlığını ve arka yüzey filmini zorlar.</li>
  <li><strong>Deterjan, cam suyu, çamaşır suyu.</strong> Kalıntı bırakır, kaplamaya zarar verebilir.</li>
  <li><strong>Sert fırça, ovma teli, aşındırıcı sünger.</strong> Camdaki yansıma önleyici kaplamayı çizer; çizik kalıcıdır.</li>
  <li><strong>Sıcak panele soğuk su.</strong> Termal şok riski.</li>
  <li><strong>Panelin üzerine basmak.</strong> Görünmeyen mikro çatlaklar oluşur ve üretim kalıcı olarak düşer.</li>
  <li><strong>Çatıda tek başına ve emniyetsiz çalışmak.</strong> Erişilemeyen kurulumlarda profesyonel destek alın.</li>
</ul>

<h2>Panellerimizin Yapısı ve Temizlik</h2>

<p><a href="/urun/tasinabilir-gunes-paneli-100w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp100">SP100</a>, <a href="/urun/tasinabilir-gunes-paneli-200w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp200">SP200</a> ve <a href="/urun/tasinabilir-gunes-paneli-400w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp400">SP400</a> modelleri IP67 koruma sınıfındadır; yani suyla temizliğe uygundur. IP derecelerinin ne anlama geldiğini <a href="/blog/ip20-ip54-ip65-ip67-koruma-sinifi-rehberi">koruma sınıfı rehberimizde</a> açıkladık.</p>

<p>Katlanabilir paneller kullanıldıktan sonra nemli katlanıp çantaya konursa yüzeyde leke ve küf oluşabilir. Toplamadan önce kurumasını bekleyin. Panelleri ve güç istasyonlarını depolarken izlenecek adımlar <a href="/blog/tasinabilir-guc-kaynagi-bakim-ve-depolama-rehberi">bakım ve depolama rehberimizde</a>.</p>

<h2>Temizlik Dışında Kontrol Edilecekler</h2>

<p>Yılda bir kez yapılacak kısa bir kontrol, temizlikten daha değerli olabilir:</p>

<ul>
  <li><strong>Konnektörler.</strong> MC4 uçlarında oksitlenme, gevşeklik veya su izi var mı? Bağlantı standartları için <a href="/blog/solar-kablo-konnektor-mc4-xt60-anderson-kesit-hesabi">kablo ve konnektör rehberimize</a> bakın.</li>
  <li><strong>Kablo yalıtımı.</strong> UV ile sertleşmiş veya kemirgen zararı görmüş bölüm var mı?</li>
  <li><strong>Çerçeve ve conta.</strong> Kenar sızdırmazlığında ayrılma var mı?</li>
  <li><strong>Mikro çatlak.</strong> Camda ince çatlak veya hücrede renk değişimi görülüyor mu?</li>
  <li><strong>Gölge kaynağı.</strong> Yeni büyüyen bir ağ dalı veya sonradan konulmuş bir anten panele gölge düşürüyor mu?</li>
</ul>

<h2>Gerçek Kazanç Ne Kadar?</h2>

<p>Örnek bir hesap: <a href="/urun/tasinabilir-gunes-paneli-400w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp400">SP400</a> paneliniz iyi bir günde yaklaşık 1,6 kWh üretiyor olsun. %12'lik bir kirlilik kaybı, günde yaklaşık 190Wh demektir — yani bir buzdolabının üç saatlik enerjisi.</p>

<p>Bir sezon boyunca bu kayıp birikir. On dakikalık bir temizlik, birkaç yüz watt-saatlik günlük üretimi geri kazandırır. Panel veriminin mevsim ve hava koşullarıyla nasıl değiştiğini <a href="/blog/gunes-paneli-verimi-mevsimler-hava-durumu-cografya">bu yazıda</a> ele aldık.</p>

<h2>Sıkça Sorulan Sorular</h2>

<h3>Yağmur paneli temizler mi?</h3>
<p>İnce tozu büyük ölçüde alır ama polen, kuş pisliği ve yağlı kirleri çıkarmaz. Ayrıca sert suyla gelen yağmur, kuruduğunda kireç lekesi bırakabilir.</p>

<h3>Kar yağdığında ne yapmalı?</h3>
<p>Eğimli panellerde kar genellikle kendi kayar. Kazımaya çalışmak cam yüzeyi çizer. Zorunluysa yumuşak uçlu bir kar süpürgesi kullanın, plastik veya metal kürek asla kullanmayın.</p>

<h3>Otomatik temizlik sistemleri işe yarar mı?</h3>
<p>Büyük ölçekli santrallerde ekonomik olabilir. Ev ve küçük ölçekli kurulumlarda maliyeti kazandırdığı verimi aşar.</p>

<h3>Panelin verimi zamanla düşer mi?</h3>
<p>Evet, fotovoltaik modüller yılda tipik olarak binde birkaç oranında bozunur. Bu doğal bir süreçtir ve kirlilikten ayrı değerlendirilmelidir. Fotovoltaik performans ve bozunma konusunda <a href="https://www.nrel.gov/solar/" target="_blank" rel="noopener noreferrer">NREL'in solar araştırma sayfası</a> kapsamlı bir kaynaktır.</p>

<h3>Panel tipine göre temizlik değişir mi?</h3>
<p>Cam yüzeyli monokristal ve polikristal paneller aynı şekilde temizlenir. Esnek panellerde yüzey polimer olduğu için çizilmeye daha duyarlıdır; yalnızca yumuşak bez kullanın. Tipler arasındaki farkları <a href="/blog/gunes-paneli-monokristal-polikristal-esnek-fark">bu karşılaştırmada</a> anlattık.</p>

<h2>Küçük Bakım, Kalıcı Kazanç</h2>

<p>Güneş paneli sistemi kurulduktan sonra kendi kendine çalışır ama tamamen kendi kendine bakmaz. Yılda birkaç kez yapılan basit bir temizlik ve kısa bir görsel kontrol, sistemin ilk günkü performansına yakın kalmasını sağlar.</p>

<p>Panel seçenekleri için <a href="/kategori/gunes-panelleri">güneş panelleri kategorimizi</a> inceleyebilir, panelinizi hangi güç kaynağıyla eşleştireceğinizden emin değilseniz <a href="/iletisim">bize danışabilirsiniz</a>.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // 30 — EĞİM AÇISI VE YÖN
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "gunes-paneli-egim-acisi-ve-yon-nasil-ayarlanir",
    title: "Güneş Paneli Kaç Derece Eğimle ve Hangi Yöne Bakmalı?",
    excerpt:
      "Aynı panel, doğru açıyla yerleştirildiğinde yanlış açıya göre belirgin biçimde fazla üretir. Türkiye için enlem bazlı eğim tablosu, mevsimsel ayar ve yön sapmasının etkisi.",
    category: "Solar",
    tags: [
      "güneş paneli eğim açısı",
      "panel yönü",
      "azimut",
      "güney cephe",
      "panel konumlandırma",
      "solar verim",
    ],
    metaTitle: "Güneş Paneli Eğim Açısı ve Yönü: Türkiye İçin Optimum Ayar",
    metaDescription:
      "Güneş paneli kaç derece eğimle kurulmalı, hangi yöne bakmalı? Enlem bazlı eğim tablosu, mevsimsel ayar, doğu-batı sapmasının etkisi ve pratik kurulum önerileri.",
    metaKeywords: [
      "güneş paneli eğim açısı",
      "panel hangi yöne bakmalı",
      "optimum panel açısı türkiye",
      "azimut açısı solar",
      "mevsimsel panel ayarı",
      "panel verimi açı",
    ],
    content: `<p>Bir güneş panelinin ürettiği enerji, üzerine düşen ışığın miktarına bağlıdır. Bu miktarı belirleyen tek şey güneşin parlaklığı değil; ışının panel yüzeyine hangi açıyla çarptığıdır.</p>

<p>Işınlar yüzeye dik geldiğinde panel maksimum enerjiyi toplar. Açı yatıklaştıkça aynı ışık demeti daha geniş bir alana yayılır ve birim alana düşen enerji azalır. Bu yüzden panelin eğimi ve baktığı yön, panelin gücü kadar belirleyicidir.</p>

<blockquote>
<strong>Hızlı Cevap:</strong> Kuzey yarımkürede paneller <strong>güneye</strong> bakmalıdır. Yıl geneli için en iyi eğim, bulunduğunuz yerin enlemine yakın bir değerdir: Türkiye'de kabaca <strong>30–40°</strong>. Yazın daha yatık (enlem − 15°), kışın daha dik (enlem + 15°) açı daha verimlidir. Güneyden 30°'ye kadar sapma yıllık üretimi genellikle %5'in altında etkiler; doğu veya batıya tam dönük kurulumda kayıp %15–20'ye çıkabilir. Taşınabilir panellerde açıyı gün içinde iki kez elle değiştirmek bile kayda değer kazanç sağlar.
</blockquote>

<h2>Yön (Azimut): Neden Güney?</h2>

<p>Kuzey yarımkürede güneş gün boyunca güney yönünde bir yay çizer. Öğle saatlerinde en yüksek noktasına ulaşır ve ışınlar en kısa yoldan atmosferi geçer; bu yüzden en güçlü olduğu saatlerdir.</p>

<p>Güneye bakan bir panel, günün en verimli saatlerini tam kapasiteyle kullanır. Sapma arttıkça bu saatlerdeki kazanç azalır.</p>

<table>
  <thead>
    <tr><th>Panel Yönü</th><th>Yıllık Üretime Etkisi</th><th>Karakteri</th></tr>
  </thead>
  <tbody>
    <tr><td>Tam güney</td><td>Referans (%100)</td><td>Öğle saatlerinde tepe üretim</td></tr>
    <tr><td>Güneydoğu / güneybatı</td><td>%95–98</td><td>Neredeyse fark yok</td></tr>
    <tr><td>Doğu veya batı</td><td>%80–85</td><td>Üretim güne yayılır, tepe düşer</td></tr>
    <tr><td>Kuzeydoğu / kuzeybatı</td><td>%60–70</td><td>Belirgin kayıp</td></tr>
    <tr><td>Tam kuzey</td><td>%50–60</td><td>Önerilmez</td></tr>
  </tbody>
</table>

<p>Tabloda dikkat çeken şey, küçük sapmaların cezasının düşük olmasıdır. Çatınız tam güneye bakmıyorsa panel kurmaktan vazgeçmeniz için bir sebep yok.</p>

<h3>Doğu-Batı Kurulumun Kendine Özgü Avantajı</h3>

<p>Doğuya bakan panel sabah, batıya bakan panel akşam üretir. Toplam günlük enerji güney kurulumdan azdır ama üretim güne daha eşit yayılır. Sabah ve akşam tüketimi yoğun olan bir evde, bataryayı gün boyu dengeli beslediği için pratikte işe yarayabilir.</p>

<h2>Eğim Açısı: Enlem Kuralı</h2>

<p>Yıl geneli için pratik kural şudur: <strong>eğim açısı ≈ enlem</strong>. Türkiye 36° ile 42° enlemleri arasında yer alır.</p>

<table>
  <thead>
    <tr><th>Şehir</th><th>Yaklaşık Enlem</th><th>Yıllık Optimum</th><th>Yaz Ayarı</th><th>Kış Ayarı</th></tr>
  </thead>
  <tbody>
    <tr><td>Antalya</td><td>36,9°</td><td>~35°</td><td>~20°</td><td>~50°</td></tr>
    <tr><td>Adana</td><td>37,0°</td><td>~35°</td><td>~20°</td><td>~50°</td></tr>
    <tr><td>İzmir</td><td>38,4°</td><td>~36°</td><td>~22°</td><td>~52°</td></tr>
    <tr><td>Konya</td><td>37,9°</td><td>~36°</td><td>~22°</td><td>~52°</td></tr>
    <tr><td>Ankara</td><td>39,9°</td><td>~38°</td><td>~24°</td><td>~54°</td></tr>
    <tr><td>İstanbul</td><td>41,0°</td><td>~39°</td><td>~25°</td><td>~55°</td></tr>
    <tr><td>Erzurum</td><td>39,9°</td><td>~38°</td><td>~24°</td><td>~55°</td></tr>
    <tr><td>Trabzon</td><td>41,0°</td><td>~39°</td><td>~25°</td><td>~55°</td></tr>
  </tbody>
</table>

<p>Bu değerler pratik yaklaşımlardır. Bölgenizin gerçek güneşlenme verisi için <a href="/blog/turkiye-il-il-gunes-paneli-verimli-gunes-saati">il il verimli güneş saati tablomuza</a> ve <a href="https://gepa.enerji.gov.tr/MyCalculator/" target="_blank" rel="noopener noreferrer">Enerji Bakanlığı'nın GEPA haritasına</a> bakabilirsiniz. Avrupa Komisyonu'nun <a href="https://re.jrc.ec.europa.eu/pvg_tools/en/" target="_blank" rel="noopener noreferrer">PVGIS aracı</a> ise koordinat bazında optimum açıyı hesaplar.</p>

<h3>Neden Kışın Daha Dik?</h3>

<p>Güneşin gökyüzündeki yüksekliği mevsime göre değişir. Kışın güneş ufka yakın bir yay çizer; bu yüzden ışınları yakalamak için panelin daha dik durması gerekir. Yazın güneş tepeye yakın olduğundan panel daha yatık olmalıdır.</p>

<p>Dik açının kışın ikinci bir faydası vardır: kar üzerinde birikmeden kayar, yağmur yüzeyi daha iyi yıkar.</p>

<h2>Mevsimsel Ayar Gerçekten Değer mi?</h2>

<p>Sabit bir açıda bırakılan panel, optimum ayarlıya göre yıllık olarak yaklaşık %5–8 daha az üretir. Yılda iki kez (ilkbaharda yatıklaştırıp sonbaharda dikleştirmek) açı değiştirmek bu farkın büyük kısmını kapatır.</p>

<p>Bu, sabit çatı kurulumlarında çoğu zaman zahmete değmez. Ancak taşınabilir panellerde açı değiştirmek zaten kolaydır. <a href="/urun/tasinabilir-gunes-paneli-100w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp100">SP100</a>, <a href="/urun/tasinabilir-gunes-paneli-200w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp200">SP200</a> ve <a href="/urun/tasinabilir-gunes-paneli-400w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp400">SP400</a> modellerimiz üç kademeli açı ayarına sahiptir; mevsime ve saate göre kademeyi değiştirmek birkaç saniye sürer.</p>

<h2>Taşınabilir Panelde Pratik Kurallar</h2>

<ol>
  <li><strong>Gölgesiz nokta seçin.</strong> Küçük bir gölge bile üretimi orantısız düşürür. Ağaç, direk, baca ve karavan anteni dikkat edilecek başlıca kaynaklardır.</li>
  <li><strong>Sabah doğuya, öğlen güneye, akşam batıya çevirin.</strong> Gün içinde iki kez yön değiştirmek bile toplam üretimi belirgin biçimde artırır.</li>
  <li><strong>Paneli yere düz sermeyin.</strong> Yatay panel hem daha az ışık alır hem toz tutar. Açı kademesini mutlaka kullanın.</li>
  <li><strong>Sıcaklığa dikkat edin.</strong> Paneller ısındıkça verimi düşer. Arkasında hava dolaşımı olacak şekilde konumlandırın.</li>
  <li><strong>Kabloyu gölge yapmayacak şekilde geçirin.</strong> Panelin üzerinden geçen kablo, ince bir gölge çizgisi oluşturur.</li>
  <li><strong>Rüzgâra karşı sabitleyin.</strong> Katlanabilir paneller hafiftir; devrilme cam kırılmasına yol açabilir.</li>
</ol>

<h2>Açıdan Önce: Panel-Cihaz Uyumu</h2>

<p>Doğru açı, ancak panel güç kaynağınıza uygunsa işe yarar. Her cihazın kabul ettiği bir gerilim aralığı vardır ve panelin açık devre gerilimi (Voc) bu aralığın dışına çıkmamalıdır.</p>

<table>
  <thead>
    <tr><th>Güç Kaynağı</th><th>Solar Giriş</th><th>Gerilim Aralığı</th></tr>
  </thead>
  <tbody>
    <tr><td>P800</td><td>300W</td><td>12–60V, 10A</td></tr>
    <tr><td>P1800</td><td>500W</td><td>10–52V, 11A</td></tr>
    <tr><td>Singo 2000 Pro</td><td>500W</td><td>10–50V</td></tr>
    <tr><td>P3200</td><td>1000W</td><td>12–80V</td></tr>
    <tr><td>SH4000 (HV)</td><td>3000W</td><td>70–450V, 16A</td></tr>
    <tr><td>SH4000 (LV)</td><td>600W</td><td>12–50V</td></tr>
  </tbody>
</table>

<p>Örneğin SP400'ün açık devre gerilimi 52,8V'tur; bu değer P1800 ve Singo 2000 Pro'nun üst sınırının üzerindedir. Bu paneli P3200 ile eşleştirmek gerekir. Ayrıca soğuk havalarda Voc yükselir; marj bırakmak önemlidir. Konuyu <a href="/blog/batarya-voc-degeri-nedir-neden-yukselir">Voc değeri neden yükselir</a> yazımızda ele aldık.</p>

<p>Birden fazla panel kullanacaksanız seri ve paralel bağlantının gerilim-akım üzerindeki etkisini <a href="/blog/solar-panel-seri-paralel-baglanti-rehberi">bağlantı rehberimizde</a> anlattık. Şarj kontrolcüsünün rolü için <a href="/blog/mppt-vs-pwm-sarj-kontrolcusu-fark-nedir">MPPT ve PWM farkı</a> yazımıza bakabilirsiniz.</p>

<h2>Balkon ve Apartman Kurulumu</h2>

<p>Şehirde yaşayanlar için ideal açı çoğu zaman ulaşılamaz bir hedeftir. Balkon korkuluğuna dik açıyla asılan bir panel, teorik optimumun altında kalır ama yine de anlamlı üretim yapar.</p>

<p>Bu senaryoda önceliğiniz açıyı mükemmelleştirmek değil, gölgesiz ve güvenli bir konum bulmaktır. Uygulama detaylarını <a href="/blog/balkonda-gunes-paneli-apartman-solar-kurulum">balkonda güneş paneli</a> yazımızda topladık.</p>

<h2>Sıkça Sorulan Sorular</h2>

<h3>Panelimi güneşi takip eden bir sisteme bağlasam mantıklı olur mu?</h3>
<p>Takip sistemleri üretimi artırır ancak maliyet, mekanik bakım ve arıza riski getirir. Küçük ölçekli kurulumlarda genellikle aynı bütçeyle ek panel almak daha verimlidir.</p>

<h3>Düz çatıya nasıl kurmalıyım?</h3>
<p>Düz çatılarda panel, açılı bir konstrüksiyonla yükseltilir. Rüzgâr yükü ve su yalıtımı açısından bu iş uzmanlık gerektirir.</p>

<h3>Kışın açıyı değiştiremiyorum, ne yapmalıyım?</h3>
<p>Sabit kalacaksa enleme yakın bir açı (Türkiye için 30–35°) yıl geneli en dengeli sonucu verir. Kışın üretimi öncelikliyse enlem + 10° tercih edilebilir.</p>

<h3>Panel sıcakken verim neden düşüyor?</h3>
<p>Fotovoltaik hücrelerin gerilimi sıcaklıkla azalır. Bu yüzden çok sıcak yaz günlerinde üretim, ılık bahar günlerine göre beklenenden düşük olabilir. Ayrıntısı <a href="/blog/gunes-paneli-verimi-mevsimler-hava-durumu-cografya">mevsim ve hava durumu</a> yazımızda.</p>

<h3>Panelimi tamamen dik (90°) koysam ne olur?</h3>
<p>Yıllık üretim belirgin biçimde düşer, ancak kış aylarında ve karlı bölgelerde dikey kurulum bazen tercih edilir. Genel amaçlı kullanımda önerilmez.</p>

<h2>Küçük Ayar, Ölçülebilir Fark</h2>

<p>Panelin gücünü satın alırsınız; açısını ise siz belirlersiniz. Güneye bakan ve enleme yakın bir eğimle yerleştirilmiş bir panel, aynı ürünün gelişigüzel konumlandırılmış haline göre gözle görülür biçimde fazla üretir. Taşınabilir kullanımda ise gün içinde iki kez yön değiştirmek, ek panel almadan kazanç sağlar.</p>

<p>Sisteminize uygun panel ve güç kaynağı eşleşmesi için <a href="/kategori/gunes-panelleri">güneş panelleri</a> ve <a href="/kategori/tasinabilir-guc-kaynaklari">taşınabilir güç kaynakları</a> kategorilerimize göz atabilir, kurulum planınızı <a href="/iletisim">bizimle paylaşabilirsiniz</a>.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // 31 — SERA / TARIM SULAMA
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "sera-tarim-sulama-solar-enerji-sistemi-kurulumu",
    title: "Sera, Bağ Evi ve Tarım Sulaması İçin Solar Enerji Sistemi Nasıl Kurulur?",
    excerpt:
      "Şebekesi olmayan arazide sulama pompası, fan ve kamera çalıştırmak için ne kadar panel ve batarya gerekir? Günlük enerji bütçesi çıkarmayı adım adım gösteriyoruz.",
    category: "Solar",
    tags: [
      "tarımsal sulama solar",
      "sera enerji",
      "bağ evi güneş enerjisi",
      "solar pompa",
      "off-grid tarım",
      "arazi elektrik",
    ],
    metaTitle: "Sera ve Tarım Sulaması İçin Solar Sistem: Kapasite Hesabı",
    metaDescription:
      "Şebekesiz arazide sulama pompası, sera fanı ve kamera için kaç watt panel ve kaç Wh batarya gerekir? Günlük enerji bütçesi, model seçimi ve kurulum önerileri.",
    metaKeywords: [
      "tarım sulama güneş enerjisi",
      "sera solar sistem",
      "bağ evi elektrik çözümü",
      "solar su pompası",
      "off grid tarım enerjisi",
      "arazide elektrik nasıl sağlanır",
    ],
    content: `<p>Tarımsal arazilerin çoğunda şebeke elektriği ya yoktur ya da bağlantı maliyeti arazinin değerine yaklaşır. Bu yüzden sulama uzun yıllar mazotlu motopomplarla yapıldı: yakıt taşımak, bakım yapmak ve gürültüye katlanmak gerekiyordu.</p>

<p>Sulamanın en çok ihtiyaç duyulduğu saatlerin, güneşin en güçlü olduğu saatlerle örtüşmesi bu iş için doğal bir avantaj yaratıyor. Enerjiyi tam ihtiyaç anında, üretildiği yerde kullanabiliyorsunuz.</p>

<blockquote>
<strong>Hızlı Cevap:</strong> Önce günlük enerji bütçesi çıkarılır: her cihazın gücü, günlük çalışma süresiyle çarpılıp toplanır. Küçük bir damla sulama sistemi (0,5 HP pompa, günde 2 saat) yaklaşık 750Wh, sera fanı ve kontrol elektroniği ise 300–600Wh tüketir. Bu profil için <a href="/urun/tasinabilir-gunes-paneli-400w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp400">SP400</a> panel ve <a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200</a> uygun bir başlangıçtır. Pompa seçiminde kapasiteden çok <strong>pik güç</strong> belirleyicidir.
</blockquote>

<h2>Adım 1 — Günlük Enerji Bütçesi</h2>

<p>Sistem tasarımının tamamı tek bir sayıya dayanır: günde kaç watt-saat harcayacaksınız?</p>

<p><strong>Günlük Wh = Cihaz gücü (W) × Günlük çalışma süresi (saat)</strong></p>

<table>
  <thead>
    <tr><th>Cihaz</th><th>Tipik Güç</th><th>Günlük Süre</th><th>Günlük Enerji</th></tr>
  </thead>
  <tbody>
    <tr><td>Damla sulama pompası (0,5 HP)</td><td>370W</td><td>2 saat</td><td>~740Wh</td></tr>
    <tr><td>Dalgıç pompa (1 HP)</td><td>750W</td><td>1,5 saat</td><td>~1125Wh</td></tr>
    <tr><td>Sera sirkülasyon fanı</td><td>60W</td><td>8 saat</td><td>~480Wh</td></tr>
    <tr><td>Sera havalandırma motoru</td><td>120W</td><td>1 saat</td><td>~120Wh</td></tr>
    <tr><td>Otomasyon / sensör kontrol ünitesi</td><td>10W</td><td>24 saat</td><td>~240Wh</td></tr>
    <tr><td>Güvenlik kamerası (2 adet + kayıt)</td><td>25W</td><td>24 saat</td><td>~600Wh</td></tr>
    <tr><td>LED aydınlatma (bekçi kulübesi)</td><td>30W</td><td>5 saat</td><td>~150Wh</td></tr>
    <tr><td>Küçük buzdolabı</td><td>Ortalama 50W</td><td>24 saat</td><td>~1200Wh</td></tr>
    <tr><td>Mobil modem / router</td><td>12W</td><td>24 saat</td><td>~290Wh</td></tr>
  </tbody>
</table>

<p>Örnek bir sera + sulama profili: pompa (740Wh) + fan (480Wh) + otomasyon (240Wh) + kamera (600Wh) = <strong>~2060Wh/gün</strong>.</p>

<h2>Adım 2 — Panel Gücünü Belirleyin</h2>

<p>Bir panel, etiketindeki gücü gün boyu vermez. Pratikte kullanılan yöntem, bölgenin “verimli güneş saati” değeriyle çarpmaktır.</p>

<p><strong>Günlük üretim ≈ Panel gücü (W) × Verimli güneş saati × 0,75</strong></p>

<p>Son çarpan; sıcaklık, kablo kaybı, açı sapması ve dönüşüm verimini temsil eder.</p>

<table>
  <thead>
    <tr><th>Panel</th><th>4 saat (kış)</th><th>5,5 saat (bahar)</th><th>7 saat (yaz)</th></tr>
  </thead>
  <tbody>
    <tr><td>SP100 (100W)</td><td>~300Wh</td><td>~410Wh</td><td>~525Wh</td></tr>
    <tr><td>SP200 (200W)</td><td>~600Wh</td><td>~825Wh</td><td>~1050Wh</td></tr>
    <tr><td>SP400 (400W)</td><td>~1200Wh</td><td>~1650Wh</td><td>~2100Wh</td></tr>
    <tr><td>2× SP400 (800W)</td><td>~2400Wh</td><td>~3300Wh</td><td>~4200Wh</td></tr>
  </tbody>
</table>

<p>Örneğimizdeki 2060Wh'lik ihtiyaç, yaz sezonunda tek SP400 ile karşılanabilir. Yıl boyu kesintisiz çalışma isteniyorsa iki panel gerekir. Bölgenizin gerçek güneş saati için <a href="/blog/turkiye-il-il-gunes-paneli-verimli-gunes-saati">il il tablomuza</a> bakın.</p>

<h2>Adım 3 — Batarya Kapasitesi</h2>

<p>Panel gündüz üretir, sistem ise gece de çalışır. Batarya bu farkı kapatır.</p>

<p>Pratik yaklaşım: günlük tüketimin en az 1,5 katı kapasite. Bulutlu günlerde kesinti istemiyorsanız 2 kat hedefleyin.</p>

<table>
  <thead>
    <tr><th>Model</th><th>Kapasite</th><th>Kullanılabilir</th><th>Uygun Günlük Bütçe</th></tr>
  </thead>
  <tbody>
    <tr><td><a href="/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800">P1800</a></td><td>1024Wh</td><td>~870Wh</td><td>500Wh'e kadar</td></tr>
    <tr><td><a href="/urun/1920wh-4000w-max-lifepo4-tasinabilir-guc-kaynagi-aplikasyon-kablosuz-sarj-operasyonel-kullanim-4000-ustu-dongu-99-99-bms-coklu-cikis-singo2000pro">Singo 2000 Pro</a></td><td>1920Wh</td><td>~1630Wh</td><td>900Wh'e kadar</td></tr>
    <tr><td><a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200</a></td><td>2048Wh</td><td>~1740Wh</td><td>1000Wh'e kadar</td></tr>
    <tr><td><a href="/urun/5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000">SH4000</a></td><td>5120Wh</td><td>~4350Wh</td><td>2500Wh'e kadar</td></tr>
  </tbody>
</table>

<p>2060Wh'lik örneğimiz için SH4000 rahat bir seçimdir. Bütçe kısıtlıysa P3200 ile başlayıp kamera ve buzdolabı gibi 24 saat çalışan yükleri azaltmak da bir yoldur.</p>

<h2>Adım 4 — Pik Gücü Kontrol Edin</h2>

<p>Bu adım atlandığında sistem kâğıt üzerinde doğru, sahada çalışmaz olur. Pompa motoru kalkarken nominal gücünün 3–6 katını anlık olarak çeker.</p>

<table>
  <thead>
    <tr><th>Pompa</th><th>Nominal</th><th>Beklenen Pik</th><th>Gereken Model</th></tr>
  </thead>
  <tbody>
    <tr><td>0,5 HP hidrofor</td><td>370W</td><td>1500–2200W</td><td>P1800 (3600W pik)</td></tr>
    <tr><td>1 HP dalgıç</td><td>750W</td><td>3000–4500W</td><td>P3200 (6400W pik)</td></tr>
    <tr><td>1,5 HP dalgıç</td><td>1100W</td><td>4000–6000W</td><td>SH4000 (8000W pik)</td></tr>
  </tbody>
</table>

<p>Konunun ayrıntısını <a href="/blog/su-pompasi-hidrofor-icin-kac-watt-guc-kaynagi-gerekir">su pompası ve hidrofor rehberimizde</a> ele aldık.</p>

<h2>Panel ve Cihaz Uyumu</h2>

<p>Paneli cihaza bağlamadan önce gerilim aralığı kontrol edilmelidir. SP400'ün açık devre gerilimi 52,8V'tur ve bu değer P1800 (10–52V) ile Singo 2000 Pro (10–50V) için sınırın üzerindedir. SP400 ile çalışacaksanız 12–80V aralığını kabul eden P3200 uygundur.</p>

<p>SH4000'in yüksek gerilimli girişi (70–450V) ise seri bağlı panel dizileri için tasarlanmıştır ve 3000W'a kadar solar giriş kabul eder. Seri-paralel kombinasyonlarını <a href="/blog/solar-panel-seri-paralel-baglanti-rehberi">bu rehberde</a> anlattık.</p>

<h2>Sahada Verimi Artıran Uygulamalar</h2>

<ul>
  <li><strong>Depo kullanın.</strong> Güneşliyken depoyu doldurup gece yerçekimiyle sulamak, batarya ihtiyacını ciddi biçimde azaltır. Bu, en ucuz "enerji depolama" yöntemidir.</li>
  <li><strong>Sulamayı gündüze alın.</strong> Pompayı panel üretimi tepedeyken çalıştırmak, bataryayı hiç kullanmadan iş görmenizi sağlar.</li>
  <li><strong>Damla sulamaya geçin.</strong> Salma sulamaya göre çok daha az su, dolayısıyla çok daha az pompa süresi demektir.</li>
  <li><strong>Toprak nem sensörü kullanın.</strong> Gereksiz sulama, boşa harcanan enerjidir.</li>
  <li><strong>Panelleri temiz tutun.</strong> Tarım arazilerinde toz ve toprak birikimi hızlıdır; <a href="/blog/gunes-paneli-temizligi-verim-artisi-nasil-temizlenir">temizlik rehberimize</a> bakın.</li>
  <li><strong>Kablo kesitini doğru seçin.</strong> Arazide mesafeler uzundur ve ince kablo ciddi gerilim düşümü yaratır. Hesap için <a href="/blog/solar-kablo-konnektor-mc4-xt60-anderson-kesit-hesabi">kablo rehberimizi</a> kullanın.</li>
</ul>

<h2>Ekipmanı Hava Koşullarından Koruyun</h2>

<p>Arazi ortamı ev içine göre çok daha zorludur: toz, nem, sıcaklık farkı ve böcek. Güç kaynağı mutlaka kapalı, havalandırmalı ve gölgede bir kabinde tutulmalıdır.</p>

<p>Panellerimiz IP67 sınıfındadır ve dış ortama uygundur. Güç kaynaklarında P800, P1800, Singo 2000 Pro ve P3200 IP20'dir; yani kapalı alan içinde konumlandırılmalıdır. <a href="/urun/5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000">SH4000</a> ise IP54 koruma ile daha zorlu ortamlara uygundur. Sınıflandırmaların anlamı <a href="/blog/ip20-ip54-ip65-ip67-koruma-sinifi-rehberi">IP koruma rehberimizde</a>.</p>

<p>Kışın arazide bırakılan sistemlerde sıcaklık ayrı bir konudur; lityum bataryalar donma noktası altında şarj kabul etmez. <a href="/blog/kisin-guc-istasyonu-kullanimi-soguk-hava-performans-rehberi">Soğuk hava rehberimizde</a> alınacak önlemleri anlattık.</p>

<h2>Örnek Kurulumlar</h2>

<h3>Küçük bahçe / hobi serası</h3>
<p>Günlük ihtiyaç ~600Wh. 0,5 HP küçük pompa, LED aydınlatma ve bir sensör ünitesi.<br>
<strong>Öneri:</strong> SP200 + P1800.</p>

<h3>Orta ölçekli sera + damla sulama</h3>
<p>Günlük ihtiyaç ~2000Wh. 1 HP pompa, fan, otomasyon ve kamera.<br>
<strong>Öneri:</strong> 2× SP400 + P3200 veya SH4000.</p>

<h3>Bağ evi + sulama + yaşam alanı</h3>
<p>Günlük ihtiyaç ~3500Wh. Pompa, buzdolabı, aydınlatma, kamera ve küçük ev aletleri.<br>
<strong>Öneri:</strong> 2–3× SP400 + SH4000 (gerekirse B5120 genişletme).</p>

<p>Yaşam alanı ağırlıklı bir kurulum planlıyorsanız <a href="/blog/yazlik-bag-evi-solar-enerji-sistemi-kurulumu">yazlık ve bağ evi solar sistem</a> yazımız tamamlayıcı olacaktır.</p>

<h2>Sıkça Sorulan Sorular</h2>

<h3>Mazotlu motopompa göre maliyet nasıl?</h3>
<p>İlk yatırım solar tarafta daha yüksektir; işletme maliyeti ise neredeyse sıfırdır. Yakıt, taşıma ve bakım giderleri ortadan kalkar. Geri dönüş süresi sulama sıklığınıza ve yakıt fiyatlarına bağlı olarak değişir.</p>

<h3>Panelleri araziye sabitlemek güvenli mi?</h3>
<p>Rüzgâr yükü ve hırsızlık iki ana risktir. Panelleri zemine sağlam ankrajlamak ve mümkünse çevrili bir alana yerleştirmek gerekir.</p>

<h3>Tarımsal sulamada devlet desteği var mı?</h3>
<p>Yenilenebilir enerji ve tarımsal sulama yatırımlarına yönelik destek programları dönemsel olarak açılır. Güncel durumu <a href="https://www.tarimorman.gov.tr/" target="_blank" rel="noopener noreferrer">Tarım ve Orman Bakanlığı</a> üzerinden takip edebilirsiniz.</p>

<h3>Sistemi uzaktan izleyebilir miyim?</h3>
<p>P1800 ve P3200 modelleri uygulama üzerinden izlenebilir; arazide mobil bağlantı varsa şarj durumunu ve tüketimi uzaktan görebilirsiniz.</p>

<h3>Kışın sera ısıtması da yapabilir miyim?</h3>
<p>Elektrikli ısıtma çok yüksek enerji ister ve solar sistemle karşılanması pratik değildir. Isıtma için termal çözümler, enerji sistemini ise pompa, fan, kontrol ve aydınlatma için planlamak daha doğrudur.</p>

<h2>Rakamlarla Başlayın</h2>

<p>Tarımsal solar kurulumda başarı, doğru ürün seçmekten önce doğru hesap yapmaya bağlıdır. Cihaz listesi, günlük çalışma süreleri ve pompanın pik gücü belirlendiğinde sistem neredeyse kendini tasarlar.</p>

<p>Hesabınızı hızlıca çıkarmak için <a href="/guc-hesaplayici">güç hesaplayıcıyı</a> kullanabilir, panel seçenekleri için <a href="/kategori/gunes-panelleri">güneş panelleri kategorimize</a> bakabilirsiniz. Arazi kurulumunuzun detaylarını <a href="/iletisim">bize ilettiğinizde</a> uygun kombinasyonu birlikte belirleyelim.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // 32 — TERİMLER SÖZLÜĞÜ
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "tasinabilir-enerji-terimleri-sozlugu",
    title: "Taşınabilir Enerji Terimleri Sözlüğü: Wh, BMS, MPPT ve 40+ Terim",
    excerpt:
      "Ürün sayfalarındaki teknik terimleri tek yerde topladık. Wh'den Voc'a, pass-through'dan ATS'ye kadar bilmeniz gereken her kavramın kısa ve net açıklaması.",
    category: "Teknik",
    tags: [
      "enerji terimleri",
      "solar sözlük",
      "teknik terimler",
      "Wh nedir",
      "MPPT nedir",
      "power station sözlük",
    ],
    metaTitle: "Taşınabilir Enerji Terimleri Sözlüğü: 40+ Kavram Açıklaması",
    metaDescription:
      "Wh, Ah, BMS, MPPT, Voc, saf sinüs, pass-through, ATS, DoD, IP koruma ve daha fazlası. Taşınabilir güç kaynağı ve solar terimlerinin sade açıklamaları.",
    metaKeywords: [
      "enerji terimleri sözlüğü",
      "wh nedir",
      "mppt nedir",
      "voc nedir",
      "bms nedir",
      "solar terimler",
      "power station terimleri",
    ],
    content: `<p>Bir güç istasyonu ürün sayfası, ilk bakışta kısaltmalardan oluşan bir duvar gibi görünebilir: 2048Wh, 51,2V, LiFePO4, MPPT, Voc, IP54, ATS. Her biri gerçek bir anlam taşır ve doğru ürünü seçmek çoğu zaman bu terimleri anlamaktan geçer.</p>

<p>Bu sözlüğü, tek tek yazılarımıza dağılmış tanımları bir arada bulabilmeniz için hazırladık. Konuları başlıklara göre grupladık; her terimin yanında daha derin anlatım için ilgili yazımızın bağlantısı var.</p>

<h2>Enerji ve Güç Birimleri</h2>

<table>
  <thead>
    <tr><th>Terim</th><th>Anlamı</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>Watt (W)</strong></td><td>Anlık güç birimi. Bir cihazın o an ne kadar enerji tükettiğini gösterir.</td></tr>
    <tr><td><strong>Watt-saat (Wh)</strong></td><td>Enerji birimi. 100W'lık cihazın 1 saatte harcadığı enerji 100Wh'tir. Güç kaynaklarının kapasitesi bu birimle verilir.</td></tr>
    <tr><td><strong>Kilowatt-saat (kWh)</strong></td><td>1000 Wh. Elektrik faturalarında kullanılan birim.</td></tr>
    <tr><td><strong>Volt (V)</strong></td><td>Elektriksel potansiyel farkı. Devredeki "basınç" gibi düşünülebilir.</td></tr>
    <tr><td><strong>Amper (A)</strong></td><td>Akım şiddeti. Devreden geçen elektrik miktarının hızı.</td></tr>
    <tr><td><strong>Amper-saat (Ah)</strong></td><td>Batarya kapasitesi birimi. Wh'ye çevirmek için gerilimle çarpılır: Wh = Ah × V.</td></tr>
    <tr><td><strong>mAh</strong></td><td>Miliamper-saat. Powerbank'lerde kullanılır. Wh = mAh ÷ 1000 × V.</td></tr>
    <tr><td><strong>Hertz (Hz)</strong></td><td>Alternatif akımın frekansı. Türkiye'de 50 Hz.</td></tr>
    <tr><td><strong>Güç faktörü (PF)</strong></td><td>Görünür güç ile aktif güç arasındaki oran. Motorlu cihazlarda 1'den küçüktür.</td></tr>
    <tr><td><strong>VA (Volt-Amper)</strong></td><td>Görünür güç. UPS'lerde sık kullanılır; watt ile aynı şey değildir.</td></tr>
  </tbody>
</table>

<p>Birimler arası dönüşümleri örneklerle <a href="/blog/watt-volt-amper-wh-enerji-birimleri-rehberi">enerji birimleri rehberimizde</a> anlattık.</p>

<h2>Batarya Terimleri</h2>

<table>
  <thead>
    <tr><th>Terim</th><th>Anlamı</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>LiFePO4</strong></td><td>Lityum demir fosfat. Termal olarak kararlı, uzun ömürlü batarya kimyası. Tüm ürünlerimizde kullanılır.</td></tr>
    <tr><td><strong>NMC</strong></td><td>Nikel manganez kobalt. Daha yüksek enerji yoğunluğu, daha kısa döngü ömrü.</td></tr>
    <tr><td><strong>Hücre (Cell)</strong></td><td>Bataryanın en küçük birimi. LiFePO4 hücre nominal 3,2V'tur.</td></tr>
    <tr><td><strong>Paket (Pack)</strong></td><td>Seri ve paralel bağlanmış hücrelerin oluşturduğu bütün.</td></tr>
    <tr><td><strong>BMS</strong></td><td>Batarya Yönetim Sistemi. Hücreleri izler, dengeler ve korur.</td></tr>
    <tr><td><strong>Hücre dengeleme</strong></td><td>Seri bağlı hücreler arasındaki gerilim farkını kapatma işlemi.</td></tr>
    <tr><td><strong>Döngü (Cycle)</strong></td><td>Bir tam şarj ve deşarj. 4000+ döngü, bataryanın uzun ömürlü olduğunu gösterir.</td></tr>
    <tr><td><strong>DoD (Depth of Discharge)</strong></td><td>Deşarj derinliği. Bataryanın yüzde kaçının kullanıldığı.</td></tr>
    <tr><td><strong>SOC (State of Charge)</strong></td><td>Anlık doluluk yüzdesi.</td></tr>
    <tr><td><strong>SOH (State of Health)</strong></td><td>Bataryanın ilk günkü kapasitesinin ne kadarını koruduğu.</td></tr>
    <tr><td><strong>Voc</strong></td><td>Açık devre gerilimi. Yük bağlı değilken ölçülen gerilim.</td></tr>
    <tr><td><strong>İç direnç</strong></td><td>Bataryanın akıma karşı gösterdiği direnç. Soğukta artar, verim düşer.</td></tr>
    <tr><td><strong>Kendiliğinden deşarj</strong></td><td>Kullanılmasa bile bataryanın zamanla enerji kaybetmesi.</td></tr>
  </tbody>
</table>

<p>Daha derin okuma: <a href="/blog/lifepo4-batarya-nedir-avantajlari-nelerdir">LiFePO4 nedir</a>, <a href="/blog/bms-nedir-batarya-yonetim-sistemi-korumalari">BMS nedir</a>, <a href="/blog/4000-dongu-ne-demek-power-station-kac-yil-dayanir">4000 döngü ne demek</a>, <a href="/blog/batarya-voc-degeri-nedir-neden-yukselir">Voc değeri</a>.</p>

<h2>İnvertör ve Çıkış Terimleri</h2>

<table>
  <thead>
    <tr><th>Terim</th><th>Anlamı</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>İnvertör</strong></td><td>Bataryadaki doğru akımı (DC) cihazların kullandığı alternatif akıma (AC) çeviren devre.</td></tr>
    <tr><td><strong>Saf sinüs dalga</strong></td><td>Şebeke elektriğiyle aynı kalitede AC çıkış. Hassas elektronik için gereklidir.</td></tr>
    <tr><td><strong>Modifiye sinüs</strong></td><td>Basamaklı, daha ucuz AC çıkış. Motorlu ve hassas cihazlarda sorun çıkarır.</td></tr>
    <tr><td><strong>Sürekli güç</strong></td><td>Cihazın kesintisiz verebileceği maksimum watt değeri.</td></tr>
    <tr><td><strong>Pik / surge güç</strong></td><td>Çok kısa süreli olarak verilebilen maksimum güç. Motorlu cihazların kalkışı için kritiktir.</td></tr>
    <tr><td><strong>Kalkış akımı (inrush)</strong></td><td>Motorlu cihazların çalışmaya başlarken çektiği yüksek anlık akım.</td></tr>
    <tr><td><strong>Bekleme tüketimi</strong></td><td>AC çıkışı açıkken, yük olmasa bile invertörün harcadığı enerji.</td></tr>
    <tr><td><strong>Pass-through</strong></td><td>Cihazın aynı anda şarj olurken yük besleyebilmesi.</td></tr>
    <tr><td><strong>UPS modu</strong></td><td>Kesinti anında milisaniyeler içinde bataryaya geçerek cihazların kapanmasını önleme.</td></tr>
    <tr><td><strong>ATS</strong></td><td>Otomatik transfer şalteri. Şebeke ile yedek kaynak arasında otomatik geçiş sağlar.</td></tr>
    <tr><td><strong>Hibrit invertör</strong></td><td>Şebeke, solar ve bataryayı birlikte yönetebilen invertör.</td></tr>
    <tr><td><strong>Kritik yük panosu</strong></td><td>Kesintide beslenecek devrelerin ayrıldığı alt pano.</td></tr>
  </tbody>
</table>

<p>Daha derin okuma: <a href="/blog/saf-sinus-dalga-vs-modifiye-sinus-fark-nedir">saf sinüs vs modifiye</a>, <a href="/blog/guc-istasyonunda-pass-through-sarj-ups-modu">pass-through ve UPS modu</a>, <a href="/blog/hibrit-invertor-ats-nedir-ev-panosu-baglanti">hibrit invertör ve ATS</a>, <a href="/blog/ups-mi-power-station-mi">UPS mi power station mı</a>.</p>

<h2>Solar Terimleri</h2>

<table>
  <thead>
    <tr><th>Terim</th><th>Anlamı</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>Fotovoltaik (PV)</strong></td><td>Işığı doğrudan elektriğe çeviren teknoloji.</td></tr>
    <tr><td><strong>Monokristal</strong></td><td>Tek kristalli hücre. Yüksek verim, daha yüksek maliyet.</td></tr>
    <tr><td><strong>Polikristal</strong></td><td>Çok kristalli hücre. Biraz daha düşük verim, daha ekonomik.</td></tr>
    <tr><td><strong>Vmp</strong></td><td>Maksimum güç noktasındaki gerilim.</td></tr>
    <tr><td><strong>Imp</strong></td><td>Maksimum güç noktasındaki akım.</td></tr>
    <tr><td><strong>Voc</strong></td><td>Panelin açık devre gerilimi. Cihaz giriş sınırıyla karşılaştırılması gereken değer.</td></tr>
    <tr><td><strong>Isc</strong></td><td>Kısa devre akımı. Panelin verebileceği maksimum akım.</td></tr>
    <tr><td><strong>MPPT</strong></td><td>Maksimum güç noktası takibi. Panelden en yüksek gücü çekmeyi sağlayan şarj kontrolcüsü tipi.</td></tr>
    <tr><td><strong>PWM</strong></td><td>Darbe genişlik modülasyonlu, daha basit ve daha verimsiz şarj kontrolcüsü.</td></tr>
    <tr><td><strong>Verimli güneş saati</strong></td><td>Günlük toplam ışınımın 1000 W/m² eşdeğerine bölünmesiyle bulunan pratik değer.</td></tr>
    <tr><td><strong>Azimut</strong></td><td>Panelin baktığı yön. Kuzey yarımkürede güney tercih edilir.</td></tr>
    <tr><td><strong>Eğim (tilt)</strong></td><td>Panelin yatayla yaptığı açı.</td></tr>
    <tr><td><strong>Soiling / kirlilik kaybı</strong></td><td>Toz ve kir birikiminin yol açtığı üretim kaybı.</td></tr>
    <tr><td><strong>Bypass diyot</strong></td><td>Gölgelenen hücre grubunu devre dışı bırakarak toplam kaybı sınırlayan bileşen.</td></tr>
    <tr><td><strong>MC4</strong></td><td>Solar panellerde kullanılan standart su geçirmez konnektör.</td></tr>
  </tbody>
</table>

<p>Daha derin okuma: <a href="/blog/mppt-vs-pwm-sarj-kontrolcusu-fark-nedir">MPPT ve PWM</a>, <a href="/blog/gunes-paneli-egim-acisi-ve-yon-nasil-ayarlanir">eğim açısı ve yön</a>, <a href="/blog/gunes-paneli-monokristal-polikristal-esnek-fark">panel tipleri</a>, <a href="/blog/solar-panel-seri-paralel-baglanti-rehberi">seri-paralel bağlantı</a>.</p>

<h2>Bağlantı ve Çıkış Tipleri</h2>

<table>
  <thead>
    <tr><th>Terim</th><th>Anlamı</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>USB-A</strong></td><td>Klasik dikdörtgen USB portu. Genellikle 12–30W arası çıkış verir.</td></tr>
    <tr><td><strong>USB-C</strong></td><td>Ters takılabilen modern port. PD ile 100W'a kadar güç aktarabilir.</td></tr>
    <tr><td><strong>USB PD</strong></td><td>Power Delivery. USB-C üzerinden yüksek güçlü, pazarlıklı şarj protokolü.</td></tr>
    <tr><td><strong>DC5525</strong></td><td>5,5 × 2,5 mm silindirik DC çıkış. Router, kamera ve küçük cihazlar için.</td></tr>
    <tr><td><strong>Araç çıkışı (12V)</strong></td><td>Çakmak soketi standardı. Tipik olarak 10A ile sınırlıdır.</td></tr>
    <tr><td><strong>XT60 / Anderson</strong></td><td>Yüksek akım taşıyan DC bağlantı konnektörleri.</td></tr>
    <tr><td><strong>Kesit (mm²)</strong></td><td>Kablonun iletken alanı. Uzun mesafede gerilim düşümünü belirler.</td></tr>
  </tbody>
</table>

<p>Daha derin okuma: <a href="/blog/usb-pd-power-delivery-nedir-usb-if-sertifikasi">USB PD nedir</a>, <a href="/blog/dc5525-cikis-nedir-hangi-cihazlar-kullanilir">DC5525 çıkış</a>, <a href="/blog/solar-kablo-konnektor-mc4-xt60-anderson-kesit-hesabi">kablo ve konnektörler</a>.</p>

<h2>Koruma, Sertifika ve Güvenlik</h2>

<table>
  <thead>
    <tr><th>Terim</th><th>Anlamı</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>IP kodu</strong></td><td>Toz ve suya karşı koruma sınıfı. İlk rakam katı cisim, ikincisi su.</td></tr>
    <tr><td><strong>IP20 / IP54 / IP67</strong></td><td>Sırasıyla iç mekân, dış mekâna dayanıklı ve suya batırılabilir sınıflar.</td></tr>
    <tr><td><strong>UN38.3</strong></td><td>Lityum bataryaların taşınabilmesi için zorunlu 8 aşamalı test dizisi.</td></tr>
    <tr><td><strong>CE</strong></td><td>Ürünün ilgili Avrupa mevzuatına uygunluk beyanı.</td></tr>
    <tr><td><strong>MSDS / SDS</strong></td><td>Kimyasal içerik ve acil durum bilgilerini içeren güvenlik formu.</td></tr>
    <tr><td><strong>RoHS</strong></td><td>Zararlı madde kullanımını sınırlayan düzenleme.</td></tr>
    <tr><td><strong>IEC 62133</strong></td><td>Taşınabilir lityum hücre ve bataryalar için güvenlik test standardı.</td></tr>
    <tr><td><strong>Termal kaçak (thermal runaway)</strong></td><td>Bataryanın kontrolsüz ısınma döngüsüne girmesi. LiFePO4'te riski düşüktür.</td></tr>
  </tbody>
</table>

<p>Daha derin okuma: <a href="/blog/ip20-ip54-ip65-ip67-koruma-sinifi-rehberi">IP koruma sınıfları</a>, <a href="/blog/batarya-sertifikalari-ce-un38-3-msds-fcc-nedir">batarya sertifikaları</a>, <a href="/blog/lityum-batarya-yangin-riski-lifepo4-guvenlik">lityum güvenlik</a>.</p>

<h2>Pratik Formüller</h2>

<table>
  <thead>
    <tr><th>Ne Bulmak İstiyorsunuz</th><th>Formül</th></tr>
  </thead>
  <tbody>
    <tr><td>Enerji</td><td>Wh = W × saat</td></tr>
    <tr><td>Ah'den Wh'ye</td><td>Wh = Ah × V</td></tr>
    <tr><td>mAh'den Wh'ye</td><td>Wh = mAh ÷ 1000 × V</td></tr>
    <tr><td>Güç</td><td>W = V × A</td></tr>
    <tr><td>Gerçekçi çalışma süresi</td><td>Saat ≈ Wh × 0,85 ÷ Toplam W</td></tr>
    <tr><td>Panel günlük üretimi</td><td>Wh ≈ Panel W × Güneş saati × 0,75</td></tr>
    <tr><td>Şarj süresi (solar)</td><td>Saat ≈ Kapasite Wh ÷ (Panel W × 0,75)</td></tr>
  </tbody>
</table>

<p>Bu formülleri elle uygulamak istemiyorsanız <a href="/guc-hesaplayici">güç hesaplayıcı</a> aynı işi cihaz listenizle otomatik yapar.</p>

<h2>Sıkça Karıştırılan Üç Çift</h2>

<h3>Wh ile W</h3>
<p>W anlık gücü, Wh toplam enerjiyi anlatır. Bir cihazın kaç watt çektiği ile kaç saat çalışacağı farklı sorulardır.</p>

<h3>Sürekli güç ile pik güç</h3>
<p>Sürekli güç, cihazın uzun süre verebileceği değerdir. Pik güç ise yalnızca saniyenin kesirlerinde geçerlidir. Motorlu cihaz seçiminde pik belirleyicidir.</p>

<h3>Etiket kapasitesi ile kullanılabilir kapasite</h3>
<p>Etiketteki Wh, hücrelerin depoladığı enerjidir. Prizden alacağınız enerji dönüşüm kayıpları nedeniyle bunun tipik olarak %85'i kadardır. Ayrıntısı <a href="/blog/gercek-kullanilabilir-kapasite-wh-verim-kayiplari">bu yazıda</a>.</p>

<h2>Terimleri Bilmek, Doğru Seçim Yapmanın Yarısı</h2>

<p>Bir ürünü diğerinden ayıran şey çoğu zaman büyük puntoyla yazılan kapasite değil, teknik tabloda geçen küçük ayrıntılardır: hücre kimyası, pik güç, solar giriş aralığı ve koruma sınıfı.</p>

<p>Bu sözlüğü referans olarak saklayabilirsiniz. Ürünleri karşılaştırmak için <a href="/kategori/tasinabilir-guc-kaynaklari">güç kaynakları</a> ve <a href="/kategori/gunes-panelleri">güneş panelleri</a> kategorilerimize göz atabilir, tüm ürünleri <a href="/magaza">mağaza sayfamızda</a> görebilirsiniz. Anlamını bulamadığınız bir terim varsa <a href="/iletisim">bize yazın</a>, hem yanıtlayalım hem de listeye ekleyelim.</p>`,
  },
];

async function main() {
  console.log("🚀 Blog Seed 13 başlıyor...\n");

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

  console.log("\n🎉 Blog Seed 13 tamamlandı.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Hata:", e);
  prisma.$disconnect();
  process.exit(1);
});
