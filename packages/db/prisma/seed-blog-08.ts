/**
 * FusionMarkt Blog Seed — 08
 * 15) Gerçek Kullanılabilir Kapasite: Etiketteki Wh Neden Tamamen Kullanılamaz?
 * 16) 4000 Döngü Ne Demek? Power Station Kaç Yıl Dayanır?
 *
 * Kullanım:
 *   cd packages/db && npx tsx prisma/seed-blog-08.ts
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
  // 15 — GERÇEK KULLANILABİLİR KAPASİTE
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "gercek-kullanilabilir-kapasite-wh-verim-kayiplari",
    title: "Etiketinde 512Wh Yazıyor, Neden 430Wh Kullanabiliyorum?",
    excerpt:
      "Batarya kapasitesinin tamamı hiçbir zaman prize ulaşmaz. Kaybın nereye gittiğini kalem kalem açıklıyor, her model için gerçekçi kullanılabilir enerji rakamlarını veriyoruz.",
    category: "Teknik",
    tags: [
      "kullanılabilir kapasite",
      "invertör verimi",
      "Wh hesaplama",
      "batarya verim kaybı",
      "power station kapasite",
    ],
    metaTitle: "Power Station Kapasitesi Neden Az Çıkıyor? Gerçek Wh Hesabı",
    metaDescription:
      "İnvertör kaybı, bekleme tüketimi, DoD rezervi ve sıcaklık etkisi. Etiketteki Wh ile prizden alabildiğiniz enerji arasındaki farkın kalem kalem açıklaması.",
    metaKeywords: [
      "power station gerçek kapasite",
      "invertör verim kaybı",
      "kullanılabilir wh",
      "batarya kapasitesi neden az",
      "wh hesaplama",
    ],
    content: `<p>Kutudan çıkan cihazın üzerinde 512Wh yazıyor. 50W'lık bir lambayı bağlıyorsunuz ve teorik olarak 10 saat çalışmasını bekliyorsunuz. Cihaz 8,5 saatte kapanıyor.</p>

<p>Bu, arızalı bir ürün değil ve yanıltıcı bir etiket de değil. Batarya kapasitesi ile prizden alabildiğiniz enerji arasında her zaman bir fark vardır; sorun, bu farkın çoğu ürün sayfasında hiç konuşulmaması. Aşağıda kaybın nereye gittiğini kalem kalem ayırıyor, her model için gerçekte ne kadar enerji beklemeniz gerektiğini paylaşıyoruz.</p>

<blockquote>
<strong>Hızlı Cevap:</strong> AC prizden kullandığınızda etiket kapasitesinin yaklaşık <strong>%83–88'ini</strong> alırsınız; USB ve araç çıkışı gibi DC portlardan kullanırsanız bu oran %92–95'e çıkar. Kaybın büyük kısmı DC bataryayı 220V AC'ye çeviren invertörden, geri kalanı bekleme tüketimi, BMS rezervi ve sıcaklıktan gelir. Planlama yaparken kapasiteyi <strong>0,85 ile çarpmak</strong> gerçeğe en yakın sonucu verir.
</blockquote>

<h2>Etiketteki Wh Nereden Geliyor?</h2>

<p>Batarya kapasitesi iki değerin çarpımıdır: nominal gerilim ve amper-saat kapasitesi.</p>

<p><strong>Kapasite (Wh) = Gerilim (V) × Amper-saat (Ah)</strong></p>

<p>Örneğin <a href="/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800">P1800</a>'ün 51,2V nominal gerilimli ve 20Ah kapasiteli bir batarya paketi vardır: 51,2 × 20 = 1024Wh. Bu rakam bataryanın <em>içinde depolanan</em> kimyasal enerjidir ve doğru bir değerdir. Ancak o enerjinin prize ulaşana kadar geçmesi gereken birkaç istasyon var ve her istasyonda bir miktar kayıp oluşuyor.</p>

<p>Wh, V ve Ah kavramları arasındaki ilişkiyi daha temelden okumak isterseniz <a href="/blog/watt-volt-amper-wh-enerji-birimleri-rehberi">enerji birimleri rehberimiz</a> bu konuyu sıfırdan anlatıyor.</p>

<h2>Kayıp Nereye Gidiyor? Beş Kalem</h2>

<h3>1. İnvertör Dönüşümü — En Büyük Kalem</h3>

<p>Batarya doğru akım (DC) üretir; ev cihazlarınız 220V alternatif akım (AC) ister. Aradaki dönüşümü invertör yapar ve bu işlem hiçbir zaman kayıpsız değildir. İyi bir saf sinüs invertör optimum yükte %90–94 verimle çalışır; yani her 100Wh'lik bataryaya karşılık prizden 90–94Wh alırsınız. Kaybolan kısım ısıya dönüşür — cihazın yüksek yükte ısınmasının ve fan çalıştırmasının nedeni budur.</p>

<p>İnvertörün ürettiği dalga biçimi de önemlidir. Ucuz modifiye sinüs invertörler daha ucuz üretilir ama hassas cihazlarda sorun çıkarır; farkı <a href="/blog/saf-sinus-dalga-vs-modifiye-sinus-fark-nedir">saf sinüs karşılaştırmamızda</a> açıkladık.</p>

<h3>2. Bekleme Tüketimi</h3>

<p>Cihaz açıkken hiçbir yük bağlı olmasa bile enerji harcar: LCD ekran, BMS devresi, Wi-Fi ve Bluetooth modülü, soğutma fanı. Bu "boşta tüketim" tipik olarak 8–15W arasındadır.</p>

<p>Rakam küçük görünüyor ama süreye yayıldığında büyür. 10W boşta tüketimle açık bırakılan bir cihaz, 24 saatte 240Wh harcar — <a href="/urun/512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800">P800</a>'ün yarısı. Kullanmadığınızda AC çıkışını kapatmak, kapasitenizi ciddi biçimde korur.</p>

<h3>3. BMS Rezervi (Kullanılabilir Derinlik)</h3>

<p>Batarya yönetim sistemi, hücreleri korumak için hem üst hem alt uçta bir rezerv bırakır. Ekranda "%100" gördüğünüzde hücreler mutlak dolulukta değildir; "%0" gördüğünüzde de tamamen boş değildir. Bu rezerv, hücrelerin aşırı şarj ve aşırı deşarjdan korunmasını sağlar ve döngü ömrünü doğrudan uzatır.</p>

<p>LiFePO4 kimyasında bu rezerv, kurşun-asit akülere göre çok daha dardır — kullanılabilir derinlik %90'ın üzerindedir. Yine de hesaba katılması gereken birkaç puanlık bir pay oluşturur.</p>

<h3>4. Düşük Yük Tuzağı</h3>

<p>Az bilinen ama pratikte en can sıkıcı kalem bu. İnvertörün verimi sabit değildir; nominal gücünün %20–80'i arasında çalışırken en verimli noktadadır, çok düşük yüklerde verim çöker.</p>

<p>Somut örnek: 1800W'lık bir invertörle 5W'lık bir gece lambası çalıştırdığınızı düşünün. İnvertör 220V üretmek için devrelerini tam kapasiteyle ayakta tutmak zorundadır ve bunun sabit bir maliyeti vardır. Bataryadan çekilen toplam güç 5W değil, 18–20W olur. Verim %25'e düşmüştür.</p>

<p>Bu yüzden küçük cihazları mümkün olduğunca <strong>DC çıkışlardan</strong> beslemek gerekir. USB-C, USB-A, araç çıkışı ve <a href="/blog/dc5525-cikis-nedir-hangi-cihazlar-kullanilir">DC5525 portu</a> invertörü hiç devreye sokmaz, dolayısıyla dönüşüm kaybı yaşanmaz.</p>

<h3>5. Sıcaklık</h3>

<p>Lityum hücrelerin kimyasal aktivitesi sıcaklığa bağlıdır. Etiket değerleri 25 °C için geçerlidir; sıcaklık düştükçe hücrenin iç direnci artar ve teslim edebildiği enerji azalır.</p>

<table>
  <thead>
    <tr>
      <th>Ortam Sıcaklığı</th>
      <th>Kullanılabilir Kapasite</th>
      <th>Not</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>25 °C</td><td>%100</td><td>Referans koşul</td></tr>
    <tr><td>10 °C</td><td>%93–96</td><td>Fark hissedilmez</td></tr>
    <tr><td>0 °C</td><td>%85–90</td><td>Şarj kabul edilmez, deşarj sürer</td></tr>
    <tr><td>−10 °C</td><td>%70–80</td><td>Belirgin düşüş</td></tr>
    <tr><td>−20 °C</td><td>%50–65</td><td>Isıtmadan kullanılmamalı</td></tr>
    <tr><td>45 °C</td><td>%98</td><td>Kapasite iyi, ömür kısalır</td></tr>
  </tbody>
</table>

<p>Kışın kamp, karavan ve şantiye kullanımında bu tablo çok belirleyici olur; ayrıntısını <a href="/blog/kisin-guc-istasyonu-kullanimi-soguk-hava-performans-rehberi">soğuk hava performans rehberimizde</a> bulabilirsiniz.</p>

<h2>Model Model Gerçek Kullanılabilir Enerji</h2>

<p>Aşağıdaki tablo, 25 °C ortamda ve invertör için uygun bir yük seviyesinde beklenebilecek gerçek değerleri gösterir. AC sütunu prizden, DC sütunu USB ve araç çıkışından alınabilecek enerjidir.</p>

<table>
  <thead>
    <tr>
      <th>Model</th>
      <th>Etiket Kapasitesi</th>
      <th>AC Prizden (~%85)</th>
      <th>DC Portlardan (~%93)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><a href="/urun/512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800">P800</a></td>
      <td>512 Wh</td>
      <td>~435 Wh</td>
      <td>~476 Wh</td>
    </tr>
    <tr>
      <td>P1800</td>
      <td>1.024 Wh</td>
      <td>~870 Wh</td>
      <td>~952 Wh</td>
    </tr>
    <tr>
      <td><a href="/urun/1920wh-4000w-max-lifepo4-tasinabilir-guc-kaynagi-aplikasyon-kablosuz-sarj-operasyonel-kullanim-4000-ustu-dongu-99-99-bms-coklu-cikis-singo2000pro">Singo 2000 Pro</a></td>
      <td>1.920 Wh</td>
      <td>~1.630 Wh</td>
      <td>~1.785 Wh</td>
    </tr>
    <tr>
      <td><a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200</a></td>
      <td>2.048 Wh</td>
      <td>~1.740 Wh</td>
      <td>~1.905 Wh</td>
    </tr>
    <tr>
      <td><a href="/urun/5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000">SH4000</a></td>
      <td>5.120 Wh</td>
      <td>~4.350 Wh</td>
      <td>~4.760 Wh</td>
    </tr>
  </tbody>
</table>

<p>Sitemizdeki tüm çalışma süresi hesaplarında bu kayıpları zaten dahil ediyoruz. <a href="/blog/ev-icin-tasinabilir-guc-kaynagi-kac-saat-calisir">Ev cihazları için kaç saat çalışır</a> tablomuzdaki süreler, ham kapasiteye değil kullanılabilir enerjiye göre hesaplanmıştır.</p>

<h2>Aynı Cihazdan Daha Fazla Enerji Almanın Yolları</h2>

<p>Kayıpların bir kısmı fizik, bir kısmı kullanım alışkanlığı. İkincisi üzerinde yapabileceğiniz şeyler var:</p>

<ul>
  <li><strong>Küçük cihazları DC'den besleyin.</strong> Telefon, tablet, kamera ve dizüstü bilgisayarı adaptörle AC prize takmak yerine doğrudan USB-C'den şarj edin. Hem invertör kaybını hem de adaptörün kendi kaybını ortadan kaldırırsınız; toplam kazanç %15–20'ye ulaşır. USB-C güç seviyelerini <a href="/blog/usb-pd-power-delivery-nedir-usb-if-sertifikasi">USB PD rehberimizde</a> anlattık.</li>
  <li><strong>Kullanmadığınızda AC çıkışını kapatın.</strong> Cihazların çoğunda AC bölümü ayrı bir düğmeyle kapatılabilir. Kapalıyken boşta tüketim birkaç watt'a iner.</li>
  <li><strong>Yükleri gruplayın.</strong> İnvertörü açtıysanız, o sırada çalıştırabileceğiniz tüm AC cihazları birlikte çalıştırın. İnvertörü günde on kez kısa sürelerle açmak, bir kez uzun süre açmaktan daha pahalıdır.</li>
  <li><strong>Cihazı ılıman ortamda tutun.</strong> Karavanda ve arabada bagajda değil, kabin içinde saklayın. 5 derecelik bir sıcaklık farkı bile ölçülebilir kazanç sağlar.</li>
  <li><strong>Uzatma kablosu kalitesine dikkat edin.</strong> İnce kesitli, uzun ve sarılı halde bırakılmış uzatma kabloları hem gerilim düşümü hem ısı kaybı üretir.</li>
</ul>

<h2>Kendi Cihazınızı Nasıl Test Edersiniz?</h2>

<p>Beklentinizin doğru olup olmadığını yarım günde ölçebilirsiniz. Gereken tek şey ucuz bir priz tipi watt-metre:</p>

<ol>
  <li>Cihazı %100'e kadar şarj edin ve şarj kablosunu çıkarın.</li>
  <li>Watt-metreyi cihazın AC prizine takın, üzerine sabit bir yük bağlayın. İnvertör verimini adil ölçmek için nominal gücün %20–50'si arasında bir yük seçin — 1800W'lık bir cihaz için 300–800W arası ideal.</li>
  <li>Cihaz kendini kapatana kadar bekleyin.</li>
  <li>Watt-metrenin gösterdiği toplam kWh değerini okuyun.</li>
</ol>

<p>Bu değerin etiket kapasitesine oranı, cihazınızın gerçek AC verimidir. %83'ün üzerindeyse normal aralıktasınız. %75'in altında bir sonuç çıkarsa ya çok düşük bir yükle test etmişsinizdir ya da bataryada yaşlanma başlamıştır — ikincisini ayırt etmek için <a href="/blog/4000-dongu-ne-demek-power-station-kac-yil-dayanir">döngü ömrü yazımıza</a> bakabilirsiniz.</p>

<h2>Satın Alırken Nelere Bakmalı?</h2>

<p>Farklı markaları karşılaştırırken kapasite rakamlarının aynı temelde verilip verilmediğini kontrol edin. Bazı üreticiler hücre seviyesindeki brüt kapasiteyi, bazıları BMS rezervi düşülmüş net kapasiteyi yazar. İkisi arasında %10'a varan fark olabilir.</p>

<p>Güvenilir bir karşılaştırma için şu üç bilgiyi arayın:</p>

<ul>
  <li><strong>Nominal gerilim ve Ah değeri.</strong> İkisi verilmişse Wh'ı kendiniz doğrulayabilirsiniz.</li>
  <li><strong>İnvertör verimi.</strong> Datasheet'te belirtilmiyorsa bu genellikle iyiye işaret değildir.</li>
  <li><strong>Boşta tüketim değeri.</strong> Uzun süreli yedekleme senaryolarında en belirleyici parametredir ve nadiren öne çıkarılır.</li>
</ul>

<h2>Sıkça Sorulan Sorular</h2>

<h3>Cihaz %20'de uyarı veriyor ama hâlâ çalışıyor, tam olarak ne zaman biter?</h3>
<p>Yüzde göstergesi, hücre geriliminden türetilen bir tahmindir ve LiFePO4'ün gerilim eğrisi çok düz olduğu için orta bantta hassasiyeti düşüktür. %30 ile %10 arasında gösterge hızlı düşebilir. Kritik cihaz besliyorsanız %20'yi pratik alt sınır kabul edin.</p>

<h3>Şarj ederken de kayıp oluyor mu?</h3>
<p>Evet. Şebekeden çektiğiniz enerjinin bir kısmı AC-DC dönüşümünde ısıya gider. Bataryaya 1 kWh koymak için şebekeden yaklaşık 1,10–1,15 kWh çekersiniz. Bu, şarj ve deşarjı birlikte kapsayan "gidiş-dönüş verimi" hesabının parçasıdır. ABD Enerji Bakanlığı'nın <a href="https://www.energy.gov/sites/default/files/2024-01/bess-evaluation-method.pdf" target="_blank" rel="noopener noreferrer">batarya enerji depolama değerlendirme yöntemi</a>, bu verimi deşarj edilen enerjinin şarj için alınan enerjiye oranı olarak tanımlar ve sıcaklıkla çalışma gücünün sonucu değiştirdiğini belirtir. Tarife tasarrufu senaryosunda bunun neden önemli olduğunu <a href="/blog/uc-zamanli-tarife-power-station-elektrik-tasarrufu">üç zamanlı tarife yazımızda</a> gösterdik.</p>

<h3>Solar ile şarj ederken kayıp daha mı az?</h3>
<p>Solar şarjda AC-DC dönüşümü yoktur; MPPT kontrolcü panelden gelen DC'yi doğrudan batarya gerilimine uyarlar ve verimi %95–98 bandındadır. Yani solar şarj, şebeke şarjından daha verimlidir. MPPT'nin nasıl çalıştığını <a href="/blog/mppt-vs-pwm-sarj-kontrolcusu-fark-nedir">MPPT ve PWM karşılaştırmamızda</a> anlattık.</p>

<h3>Kapasite zamanla azalır mı?</h3>
<p>Azalır. LiFePO4 hücreler kullanıldıkça ve yaşlandıkça kapasite kaybeder; ürünlerimizde kullanılan hücreler 4000 döngü sonunda başlangıç kapasitesinin yaklaşık %80'ini korur. Yıllık kayıp normal kullanımda %2–3 civarındadır.</p>

<h3>İki cihazı paralel bağlayıp kapasiteyi ikiye katlayabilir miyim?</h3>
<p>Taşınabilir modellerin AC çıkışları paralellenemez — bu tehlikelidir ve cihaza zarar verir. Kapasite genişletmesi yalnızca üreticinin desteklediği yöntemle yapılır; SH4000 için B5120 modüler batarya paketleri bu amaçla tasarlanmıştır.</p>

<h2>Doğru Beklentiyle Seçim Yapmak</h2>

<p>Kapasite seçerken pratik kural şu: ihtiyacınız olan enerjiyi hesaplayın, 0,85'e bölün, çıkan rakamın üzerindeki ilk modeli alın. Günde 800Wh'lik bir tüketiminiz varsa 800 ÷ 0,85 = 941Wh eder; yani 1024Wh'lik P1800 tam oturur, 512Wh'lik P800 yetmez.</p>

<p>Kışın kullanacaksanız bu hesabın üzerine bir %15 daha ekleyin. Cihaz listenizi ve günlük kullanım sürelerinizi <a href="/guc-hesaplayici">güç hesaplayıcıya</a> girerseniz bu düzeltmeleri zaten hesaba katılmış halde görürsünüz. Model seçenekleri için <a href="/kategori/tasinabilir-guc-kaynaklari">taşınabilir güç kaynakları</a> sayfamıza göz atabilir, tereddütte kaldığınız noktada <a href="/iletisim">bize yazabilirsiniz</a>.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // 16 — 4000 DÖNGÜ NE DEMEK
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "4000-dongu-ne-demek-power-station-kac-yil-dayanir",
    title: "4000 Döngü Ne Demek? Taşınabilir Güç Kaynağı Kaç Yıl Dayanır?",
    excerpt:
      "Etiketteki döngü sayısını yıla ve kWh başına maliyete çeviriyoruz. LiFePO4, NMC ve kurşun-asit karşılaştırması, ömrü kısaltan beş faktör ve takvim yaşlanması.",
    category: "Teknik",
    tags: [
      "döngü ömrü",
      "LiFePO4 ömrü",
      "batarya kaç yıl dayanır",
      "cycle life",
      "kWh başına maliyet",
    ],
    metaTitle: "4000 Döngü Kaç Yıl Eder? Power Station Ömrü ve Maliyeti",
    metaDescription:
      "Döngü nasıl sayılır, 4000 döngü kaç yıl eder, ömür sonunda ne olur? LiFePO4 ile kurşun-asit akünün kWh başına maliyet karşılaştırması ve ömrü uzatma yöntemleri.",
    metaKeywords: [
      "4000 döngü ne demek",
      "lifepo4 kaç yıl dayanır",
      "batarya döngü ömrü",
      "power station ömrü",
      "kwh başına batarya maliyeti",
    ],
    content: `<p>Ürün sayfasında "4000+ döngü" yazıyor. Bu, satın alma kararında en sık göz ardı edilen ama en belirleyici teknik veri. Çünkü bir enerji depolama cihazının gerçek maliyeti etiket fiyatı değil, <strong>ömrü boyunca teslim ettiği toplam enerjiye bölünmüş fiyatı</strong>.</p>

<p>Bu hesabı yaptığınızda, ilk bakışta pahalı görünen bir LiFePO4 sistemin kurşun-asit alternatifinden birkaç kat ucuz çıktığını görürsünüz. Aşağıda döngünün nasıl sayıldığını, 4000'in kaç yıla denk geldiğini ve o yılların sonunda ne olacağını açıklıyoruz.</p>

<blockquote>
<strong>Hızlı Cevap:</strong> Bir döngü, bataryanın kümülatif olarak bir kez tamamen boşalıp dolması demektir; yarım boşaltma yarım döngü sayılır. 4000 döngü, günde bir tam kullanımla yaklaşık <strong>11 yıl</strong>, hafta sonu kullanımıyla takvim ömrü sınırına kadar gider. Döngü sonunda cihaz durmaz — kapasitesinin %80'ini korur. Depolanan kWh başına maliyette LiFePO4, kurşun-asit aküye göre yaklaşık <strong>7–10 kat</strong> daha ekonomiktir.
</blockquote>

<h2>Döngü Nasıl Sayılır?</h2>

<p>Yaygın yanlış anlama, cihazı her prize taktığınızda bir döngü harcadığınızı düşünmek. Öyle değil.</p>

<p>Bir <strong>tam döngü</strong>, bataryadan kapasitesi kadar enerji çekilmesi anlamına gelir. Bu, tek seferde ya da parça parça gerçekleşebilir. 1024Wh'lik bir bataryadan bugün 300Wh, yarın 400Wh, ertesi gün 324Wh çekerseniz — üç günün sonunda bir döngü tamamlamış olursunuz.</p>

<p>Pratik sonucu şu: cihazı %80'den %100'e tamamlamak için sık sık prize takmak döngü ömrünü tüketmez. Aksine, kısmi döngülerle çalışmak hücreler için tam boşaltmadan daha nazik bir kullanım biçimidir.</p>

<h3>Test Koşullarını Okumak</h3>

<p>Döngü sayıları belirli laboratuvar koşullarında ölçülür ve bu koşullar rakam kadar önemlidir. Ürünlerimizde belirtilen değer şu şartlarda geçerlidir:</p>

<ul>
  <li><strong>25 °C ortam sıcaklığı</strong> — hücreler için ideal aralık</li>
  <li><strong>0,5C şarj/deşarj hızı</strong> — bataryanın iki saatte dolup iki saatte boşalması</li>
  <li><strong>%80 deşarj derinliği (DoD)</strong> — her döngüde kapasitenin %80'inin kullanılması</li>
  <li><strong>Ömür sonu tanımı: başlangıç kapasitesinin %80'i</strong></li>
</ul>

<p>Bu şartların dışına çıkıldığında sayı değişir. 45 derecede çalışan bir batarya aynı döngü sayısına ulaşamaz; buna karşılık her döngüde yalnızca %30 boşaltılan bir batarya ilan edilenden çok daha fazla döngü verir.</p>

<h2>4000 Döngü Kaç Yıl Eder?</h2>

<p>Cevap tamamen kullanım profilinize bağlı. Dört tipik senaryo:</p>

<table>
  <thead>
    <tr>
      <th>Kullanım Profili</th>
      <th>Yıllık Döngü</th>
      <th>4000 Döngü Süresi</th>
      <th>Gerçekte Belirleyici Olan</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Günlük tarife arbitrajı / off-grid ev</td>
      <td>~330</td>
      <td>~12 yıl</td>
      <td>Döngü ömrü</td>
    </tr>
    <tr>
      <td>Karavan, düzenli hafta sonu (haftada 2)</td>
      <td>~100</td>
      <td>~40 yıl</td>
      <td>Takvim ömrü (10–15 yıl)</td>
    </tr>
    <tr>
      <td>Kamp sezonu (yılda 30 gün)</td>
      <td>~30</td>
      <td>~130 yıl</td>
      <td>Takvim ömrü (10–15 yıl)</td>
    </tr>
    <tr>
      <td>Yalnızca kesinti yedeklemesi</td>
      <td>~15</td>
      <td>Pratikte ulaşılamaz</td>
      <td>Takvim ömrü (10–15 yıl)</td>
    </tr>
  </tbody>
</table>

<p>Tablodan çıkan önemli gerçek şu: <strong>çoğu kullanıcı 4000 döngüye hiçbir zaman ulaşmaz.</strong> Yedekleme amaçlı alınan bir cihazın ömrünü belirleyen şey döngü sayısı değil, takvim yaşlanmasıdır.</p>

<h2>Takvim Yaşlanması: Kullanmasanız da Yaşlanır</h2>

<p>Lityum hücreler, hiç kullanılmasalar bile zamanla kapasite kaybeder. Elektrot yüzeyinde biriken katman kalınlaşır ve iyon hareketi yavaşlar. Bu kayıp normal koşullarda yılda %2–3 civarındadır ve iki faktörle hızlanır. Sıcaklık, şarj seviyesi ve deşarj derinliğinin ömür üzerindeki karşılaştırmalı etkisini <a href="https://batteryuniversity.com/article/bu-808-how-to-prolong-lithium-based-batteries" target="_blank" rel="noopener noreferrer">Battery University'nin lityum batarya ömrü çalışmasında</a> görebilirsiniz.</p>

<ul>
  <li><strong>Yüksek şarj seviyesinde bekletmek.</strong> %100 dolulukta aylarca duran bir batarya, %50'de bekleyenden belirgin biçimde hızlı yaşlanır.</li>
  <li><strong>Yüksek sıcaklıkta saklamak.</strong> 30 derece üzerindeki depolama, yaşlanmayı katlar. Yazın kapalı araç bagajında bırakılan bir cihaz en kötü koşulu yaşar.</li>
</ul>

<p>İdeal depolama koşulu, <strong>%50–60 şarj seviyesi ve 10–25 °C arası serin bir ortam</strong>. Uzun süre kullanmayacaksanız üç ayda bir kontrol edip seviyeyi bu banda getirmek yeterlidir. Ayrıntılı yöntemi <a href="/blog/tasinabilir-guc-kaynagi-bakim-ve-depolama-rehberi">bakım ve depolama rehberimizde</a> paylaştık.</p>

<h2>Ömür Sonunda Ne Oluyor?</h2>

<p>"4000 döngü" bir son kullanma tarihi değil. Sektörde ömür sonu (EOL), bataryanın <strong>başlangıç kapasitesinin %80'ine düştüğü nokta</strong> olarak tanımlanır. 4001. döngüde cihaz kapanmaz.</p>

<p>Somutlaştıralım: P3200'ün 2048Wh kapasitesi, 4000 döngü sonunda yaklaşık 1640Wh'a iner. Yeni bir cihazın hemen hemen dörtte üçü. Cihaz çalışmaya devam eder; sadece çalışma süreleri kısalmıştır. Birçok kullanıcı bu noktadan sonra da yıllarca kullanmayı sürdürür.</p>

<table>
  <thead>
    <tr>
      <th>Döngü</th>
      <th>Tipik Kalan Kapasite</th>
      <th>P3200 Karşılığı</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>0</td><td>%100</td><td>2.048 Wh</td></tr>
    <tr><td>1.000</td><td>%95–97</td><td>~1.960 Wh</td></tr>
    <tr><td>2.000</td><td>%90–93</td><td>~1.870 Wh</td></tr>
    <tr><td>3.000</td><td>%85–88</td><td>~1.770 Wh</td></tr>
    <tr><td>4.000</td><td>%80–83</td><td>~1.670 Wh</td></tr>
    <tr><td>5.000</td><td>%74–78</td><td>~1.560 Wh</td></tr>
  </tbody>
</table>

<h2>Kimyasal Karşılaştırma: Neden LiFePO4?</h2>

<p>Farklı batarya kimyaları arasındaki döngü farkı, fiyat farkını kolayca gölgede bırakır.</p>

<table>
  <thead>
    <tr>
      <th>Batarya Tipi</th>
      <th>Döngü Ömrü</th>
      <th>Kullanılabilir Derinlik</th>
      <th>Termal Kaçış Sıcaklığı</th>
      <th>Ağırlık (aynı enerji)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>LiFePO4</strong></td>
      <td>3.000–6.000</td>
      <td>%90–95</td>
      <td>~270 °C</td>
      <td>Referans</td>
    </tr>
    <tr>
      <td>Lityum NMC</td>
      <td>800–1.500</td>
      <td>%80–90</td>
      <td>~170 °C</td>
      <td>%25 daha hafif</td>
    </tr>
    <tr>
      <td>Jel / AGM akü</td>
      <td>500–800</td>
      <td>%50</td>
      <td>Yanmaz</td>
      <td>3–4 kat ağır</td>
    </tr>
    <tr>
      <td>Kurşun-asit (sulu)</td>
      <td>300–500</td>
      <td>%50</td>
      <td>Yanmaz</td>
      <td>3–4 kat ağır</td>
    </tr>
  </tbody>
</table>

<p>LiFePO4'ün NMC'ye göre biraz daha ağır olması, taşınabilir cihazlarda kabul edilen bir takas. Karşılığında hem üç-dört kat döngü ömrü hem de belirgin biçimde daha yüksek termal güvenlik elde edilir. Kimyanın güvenlik boyutunu <a href="/blog/lityum-batarya-yangin-riski-lifepo4-guvenlik">lityum batarya yangın riski yazımızda</a>, teknik özelliklerini ise <a href="/blog/lifepo4-batarya-nedir-avantajlari-nelerdir">LiFePO4 nedir</a> yazımızda ele aldık.</p>

<h2>Asıl Hesap: kWh Başına Maliyet</h2>

<p>Bir bataryanın ömrü boyunca teslim edeceği toplam enerji şöyle bulunur:</p>

<p><strong>Toplam enerji (kWh) = Kapasite (kWh) × Döngü sayısı × Deşarj derinliği</strong></p>

<p>Bu rakamı cihaz fiyatına böldüğünüzde, depoladığınız her kilovatsaatin gerçek maliyetini elde edersiniz. Fiyatlar değiştiği için burada mutlak tutar vermiyoruz; ancak toplam enerji kapasiteleri sabit ve karşılaştırma için yeterli:</p>

<table>
  <thead>
    <tr>
      <th>Sistem</th>
      <th>Kapasite</th>
      <th>Döngü</th>
      <th>DoD</th>
      <th>Ömür Boyu Toplam Enerji</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>P800</td>
      <td>0,51 kWh</td>
      <td>4.000</td>
      <td>%80</td>
      <td><strong>1.638 kWh</strong></td>
    </tr>
    <tr>
      <td>P1800</td>
      <td>1,02 kWh</td>
      <td>4.000</td>
      <td>%80</td>
      <td><strong>3.277 kWh</strong></td>
    </tr>
    <tr>
      <td>P3200</td>
      <td>2,05 kWh</td>
      <td>4.000</td>
      <td>%80</td>
      <td><strong>6.554 kWh</strong></td>
    </tr>
    <tr>
      <td>SH4000</td>
      <td>5,12 kWh</td>
      <td>4.000</td>
      <td>%80</td>
      <td><strong>16.384 kWh</strong></td>
    </tr>
    <tr>
      <td>100Ah jel akü</td>
      <td>1,20 kWh</td>
      <td>700</td>
      <td>%50</td>
      <td><strong>420 kWh</strong></td>
    </tr>
    <tr>
      <td>100Ah kurşun-asit akü</td>
      <td>1,20 kWh</td>
      <td>400</td>
      <td>%50</td>
      <td><strong>240 kWh</strong></td>
    </tr>
  </tbody>
</table>

<p>Rakamlar çarpıcı: benzer nominal kapasitedeki bir kurşun-asit akü, P1800'ün teslim ettiği enerjinin ancak on üçte birini verir. Aküyü satın alma fiyatı düşük olsa bile, aynı toplam enerjiye ulaşmak için onu on üç kez yenilemeniz gerekir — üstelik her seferinde eskisini bertaraf etme yükü de doğar.</p>

<p>Jeneratör ve akü ile detaylı bir karşılaştırma yaptığımız <a href="/blog/tasinabilir-guc-istasyonu-vs-jenerator-vs-aku-karsilastirma">güç istasyonu, jeneratör ve akü karşılaştırması</a> yazımızda bu tabloyu yakıt ve bakım maliyetleriyle birlikte genişlettik.</p>

<h2>Döngü Ömrünü Kısaltan Beş Alışkanlık</h2>

<ol>
  <li><strong>Sürekli %100'de tutmak.</strong> Bataryayı sürekli tam dolu bekletmek hücre üzerinde gerilim stresi yaratır. Yedekleme amaçlı kullanıyorsanız uygulamadan şarj üst sınırını %90'a çekin.</li>
  <li><strong>Sıfıra kadar boşaltmak.</strong> Her döngüde tamamen boşaltmak, %20 rezerv bırakmaya göre ömrü belirgin biçimde kısaltır.</li>
  <li><strong>Sıcakta şarj etmek.</strong> 40 derece üzerinde şarj, yaşlanmayı hızlandırır. Yaz öğleninde güneş altında bırakılan bir cihazda hem şarj yavaşlar hem hücre yıpranır.</li>
  <li><strong>Donma noktası altında şarja zorlamak.</strong> LiFePO4 hücreler 0 °C altında şarj kabul etmez; BMS bunu zaten engeller ama cihazı ısıtmadan şarja takmak boşuna bekleme demektir.</li>
  <li><strong>Sürekli maksimum hızda şarj etmek.</strong> Hızlı şarj pratik ama hücre için yorucudur. Aceleniz yoksa uygulamadan şarj gücünü düşürmek ömre yatırımdır.</li>
</ol>

<h2>Sıkça Sorulan Sorular</h2>

<h3>Cihazı sürekli prize takılı bırakmam zarar verir mi?</h3>
<p>Modern BMS'ler batarya dolduğunda şarjı keser ve cihaz doğrudan şebekeden beslenmeye geçer, yani sürekli şarj akımı hücreye gitmez. Yine de uzun vadede bataryayı %100'de bekletmek ideal değildir. Kesinti yedeklemesi için sürekli takılı tutuyorsanız, şarj üst sınırını %90'a ayarlamak iyi bir orta yoldur. Bu modun nasıl çalıştığını <a href="/blog/guc-istasyonunda-pass-through-sarj-ups-modu">pass-through ve UPS modu yazımızda</a> anlattık.</p>

<h3>Döngü sayısını nereden takip edebilirim?</h3>
<p>P1800, P3200, Singo 2000 Pro ve SH4000 modelleri Wi-Fi/Bluetooth uygulama desteği sunar; uygulama üzerinden döngü sayısı ve batarya sağlık durumu görüntülenebilir. Uygulaması olmayan modellerde döngü sayısını kabaca kendiniz hesaplayabilirsiniz: toplam kullandığınız enerjiyi kapasiteye bölmeniz yeterli.</p>

<h3>Bataryası bitince değiştirilebilir mi?</h3>
<p>Batarya paketi yetkili servis tarafından değiştirilebilir bir bileşendir; cihazın invertörü, BMS'i ve kasası kullanılmaya devam eder. Garanti kapsamı ve servis süreçleri için <a href="/blog/guc-kaynagi-garanti-servis-rehberi">garanti ve servis rehberimize</a> bakabilirsiniz.</p>

<h3>Solar ile şarj etmek döngü ömrünü etkiler mi?</h3>
<p>Olumlu yönde etkiler. Solar şarj genellikle daha düşük akımla ve gün boyuna yayılarak gerçekleşir; bu, hücreler için hızlı AC şarjdan daha nazik bir profildir. Ayrıca MPPT dönüşümü AC şarjdan verimli olduğu için aynı enerjiyi daha az kayıpla depolarsınız. Panel eşleşmesi için <a href="/blog/tasinabilir-gunes-paneli-secimi-100w-200w-400w">güneş paneli seçim rehberimize</a> bakabilirsiniz.</p>

<h3>Garanti süresi ile döngü ömrü aynı şey mi?</h3>
<p>Değil. Garanti, üretim ve malzeme hatalarını kapsayan ticari bir taahhüttür; döngü ömrü ise hücrenin teknik performans beklentisidir. Bir cihazın garantisi iki yıl olabilir ama beklenen kullanım ömrü on yılın üzerindedir.</p>

<h2>Karar Verirken Bu Rakamı Nasıl Kullanmalı</h2>

<p>İki cihaz arasında kararsızsanız, fiyatı ömür boyu toplam enerjiye bölün ve kilovatsaat başına maliyeti karşılaştırın. Bu tek metrik, kapasite ve fiyat tablolarının anlatmadığı şeyi anlatır — özellikle farklı batarya kimyalarını karşılaştırıyorsanız.</p>

<p>Kullanım sıklığınızı da hesaba katın: yılda birkaç kez kullanacaksanız yüksek döngü sayısına prim ödemenin karşılığını alamazsınız, çünkü cihazınızı sınırlayan şey takvim ömrü olacaktır. Buna karşılık günlük kullanım planlıyorsanız döngü ömrü doğrudan cebinizi ilgilendirir.</p>

<p>Kendi kullanım sıklığınıza uygun kapasiteyi <a href="/guc-hesaplayici">güç hesaplayıcı</a> ile belirleyebilir, model karşılaştırması için <a href="/kategori/tasinabilir-guc-kaynaklari">taşınabilir güç kaynakları</a> sayfamızı inceleyebilir veya kullanım senaryonuzu <a href="/iletisim">bizimle paylaşabilirsiniz</a>.</p>`,
  },
];

async function main() {
  console.log("🚀 Blog Seed 08 başlıyor...\n");

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

  console.log("\n🎉 Blog Seed 08 tamamlandı.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Hata:", e);
  prisma.$disconnect();
  process.exit(1);
});
