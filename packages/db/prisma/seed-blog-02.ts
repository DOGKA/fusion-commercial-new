/**
 * FusionMarkt Blog Seed — 02
 * 03) Taşınabilir Güç Kaynağı Fiyatları 2026: Hangi Kapasite Mantıklı?
 * 04) Taşınabilir Güneş Paneli Seçimi: 100W vs 200W vs 400W
 *
 * Kullanım:
 *   cd packages/db && npx tsx prisma/seed-blog-02.ts
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
  // 03 — FİYATLAR 2026 / KAPASİTE REHBERİ
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "tasinabilir-guc-kaynagi-fiyatlari-2026-kapasite-rehberi",
    title: "Taşınabilir Güç Kaynağı Fiyatları 2026: Hangi Kapasite Mantıklı?",
    excerpt:
      "500Wh, 1000Wh, 2000Wh, 5000Wh arasında karar veremeyenler için 2026 fiyat/kapasite rehberi. Wh başına maliyet, gerçek kullanım ömrü ve alım stratejisi.",
    category: "Rehber",
    tags: [
      "taşınabilir güç kaynağı fiyatları",
      "power station fiyat",
      "kapasite rehberi",
      "Wh başına fiyat",
      "2026",
    ],
    metaTitle: "Taşınabilir Güç Kaynağı Fiyatları 2026: Hangi Kapasite Mantıklı?",
    metaDescription:
      "2026'da taşınabilir güç kaynağı fiyatları nasıl şekilleniyor? 500Wh, 1000Wh, 2000Wh ve 5000Wh segmentlerinde Wh başına maliyet ve alım tavsiyesi.",
    metaKeywords: [
      "taşınabilir güç kaynağı fiyatları 2026",
      "500Wh power station",
      "1000Wh power station",
      "2000Wh power station",
      "power station kaç para",
    ],
    content: `<p>Taşınabilir güç kaynağı satın alımında en belirleyici karar noktalarından biri bütçe-kapasite dengesidir. Ancak kapasite, fiyatla doğrusal olarak artmaz; segmentten segmente geçişte Wh başına maliyet değişir ve ürün ailesinin teknik kısıtları (AC çıkış gücü, UPS desteği, solar giriş, genişletilebilirlik) fiyatı doğrudan şekillendirir. Pratikte; iki adet 500Wh ürün almak yerine tek 1024Wh ürün almak, hem toplam maliyet hem de sürekli/pik çıkış gücü açısından çoğu senaryoda daha avantajlıdır.</p>

<p>Bu yazıda 2026 itibarıyla Türkiye pazarında dört ana segmenti (500Wh, 1000Wh, 2000Wh, 5000Wh+) karşılaştırıyor, Wh başına maliyet mantığını açıklıyor ve farklı bütçe ile kullanım profillerine göre tavsiyemizi net biçimde ortaya koyuyoruz.</p>

<blockquote>
<strong>Hızlı Cevap:</strong> 500Wh segmenti giriş bütçesi için, 1000Wh segmenti çoğu ev için ideal denge, 2000Wh kategori ev + kısa süreli yedekleme gerekenler için. 5000Wh ise tam ev veya off-grid bir yatırım. Wh başına maliyet genellikle kapasite büyüdükçe düşer — ama taşıma ve kurulum kısıtları devreye girer.
</blockquote>

<h2>Yalnızca Fiyat Karşılaştırmasının Yanıltıcı Olduğu Durumlar</h2>

<p>Piyasada aynı kapasiteye sahip görünen iki ürün arasında bazen belirgin fiyat farkları oluşabilir. Ancak bu farkın gerisinde genellikle aşağıdaki teknik bileşenlerden birinde yapılan kısıtlamalar bulunmaktadır:</p>

<ul>
  <li><strong>Batarya kimyası:</strong> LiFePO4 yerine NMC (klasik lityum-ion). Ucuz ama ömrü 1/5. Toplam 10 yıllık maliyet bakıldığında LiFePO4 çok daha avantajlı.</li>
  <li><strong>İnvertör kalitesi:</strong> "Modifiye sinüs" invertör pahalı değildir; ama buzdolabı, TV, laptop adaptörü gibi hassas cihazları bozar. Saf sinüs invertör şart.</li>
  <li><strong>Pik güç:</strong> Aynı sürekli çıkışa sahip iki modelden biri 1.5× pik gücü verirken diğeri 2× verir. Buzdolabı gibi cihazları başlatmak için bu fark kritik.</li>
  <li><strong>UPS geçiş süresi:</strong> Düşük fiyatlı modellerde yok ya da 50 ms+. 10 ms altında olmayan bir cihazda masaüstü PC'niz yine de kapanır.</li>
  <li><strong>Genişletilebilirlik:</strong> Solar giriş Wattı, ikinci batarya desteği, paralel kullanım — fiyat farkını yaratan asıl şeyler.</li>
</ul>

<p>Bu yüzden Wh başına fiyat tek başına yeterli değil. Yine de başlangıç için iyi bir ölçü.</p>

<h2>Segment Segment Karşılaştırma</h2>

<table>
  <thead>
    <tr>
      <th>Segment</th>
      <th>Örnek Model</th>
      <th>Kapasite</th>
      <th>AC Çıkış</th>
      <th>Ağırlık</th>
      <th>Hedef Kullanıcı</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Giriş (500Wh)</td>
      <td><a href="/urun/512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800">P800</a></td>
      <td>512 Wh</td>
      <td>800 W / 1200 W Boost</td>
      <td>6.55 kg</td>
      <td>Stüdyo, kamp, ev ofis</td>
    </tr>
    <tr>
      <td>Orta (1000Wh)</td>
      <td><a href="/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800">P1800</a></td>
      <td>1024 Wh</td>
      <td>1800 W / 3600 W pik</td>
      <td>12.7 kg</td>
      <td>Aile evi, doğalgaz kombili ev</td>
    </tr>
    <tr>
      <td>Üst-Orta (2000Wh)</td>
      <td><a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200</a></td>
      <td>2048 Wh</td>
      <td>3200 W / 6400 W pik</td>
      <td>24.35 kg</td>
      <td>Büyük aile, klima, yazlık</td>
    </tr>
    <tr>
      <td>Flagship (5000Wh+)</td>
      <td><a href="/urun/5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000">SH4000</a></td>
      <td>5120 Wh (genişletilebilir)</td>
      <td>4000 W / 8000 W pik</td>
      <td>65 kg (sabit)</td>
      <td>Tam ev, off-grid, yazlık kurulum</td>
    </tr>
  </tbody>
</table>

<h2>Wh Başına Maliyet: Mantıklı Alım Noktası Nedir?</h2>

<p>Piyasadaki güncel fiyatlara bakıldığında şu genelleme çıkıyor:</p>

<ul>
  <li><strong>500Wh segmenti:</strong> Wh başına görece yüksek. Küçük kapasitelerde batarya dışı bileşenlerin (invertör, BMS, kasa, port seti) maliyeti sabit kalır, dolayısıyla "birim fiyat" artar.</li>
  <li><strong>1000Wh segmenti:</strong> En iyi denge noktası. Wh başına maliyet belirgin şekilde düşer, buna karşılık taşınabilirlik hâlâ makul (12–13 kg).</li>
  <li><strong>2000Wh segmenti:</strong> Wh başına en düşük noktaya yaklaşır. Ancak ağırlık ikiye katlanır; tek başına eve taşıması zor olabilir.</li>
  <li><strong>5000Wh+ segmenti:</strong> Birim maliyet kapasite arttıkça düşmeye devam etmez — çünkü hibrid invertör, ATS uyumu, duvar montajı gibi ek özellikler fiyata dahildir. Bu kategoride "Wh başına fiyat"tan çok "sistem değeri" bakılır.</li>
</ul>

<p>Pratik kural: <em>Aynı bütçeyle iki tane 500Wh almak yerine bir tane 1024Wh alın. Sürekli/pik güç limiti ve taşınabilirlik daha iyi olur.</em></p>

<h2>Kapasite Nasıl Seçilir? 3 Soruluk Test</h2>

<p>Şu üç soruyu dürüstçe cevaplayın:</p>

<p><strong>1. Aynı anda en fazla kaç Watt çekeceksiniz?</strong></p>
<p>Çekmek istediğiniz cihazların sürekli watt değerlerini toplayın. Buzdolabı (60W ort.) + modem (15W) + 3 led ışık (45W) + laptop (55W) + TV (70W) = 245W. Bu sürekli tüketim.</p>

<p><strong>2. Bu toplam yüke kaç saat ihtiyacınız var?</strong></p>
<p>Türkiye ortalaması: planlı kesinti 3–4 saat, bakım 6–8 saat, afet/büyük arıza 12–24 saat. En uzun beklenen süreyi baz alın.</p>

<p><strong>3. Satın aldığınızda hangi cihazları ekleyeceksiniz?</strong></p>
<p>İleride karavan, kamp, solar panel, klima gibi senaryolar için kapasite ve solar giriş wattajı önemli. 1 yıl sonraki ihtiyacınızı da düşünerek seçim yapın — genellikle bir üst segmenti seçmek "keşke"leri önler.</p>

<p>Gerekli Wh şu şekilde bulunur:</p>
<p><strong>İhtiyaç (Wh) ≈ Toplam güç (W) × Saat × 1.15</strong> (invertör kaybı ve güvenlik marjı dahil)</p>

<p>Örneğimizden devam: 245W × 6 saat × 1.15 ≈ <strong>1690 Wh</strong>. Bu değer 1024Wh'ı (P1800) aşar, 2048Wh'a (P3200) yakındır. P3200 rahatlıkla 8 saat verir; P1800 "5 saatte sınırda" kalır. Bütçe izin veriyorsa P3200 seçimi doğru; P1800'e indirerek 5 saat hedef koymak da geçerli.</p>

<h2>Gerçek Kullanım Örnekleri</h2>

<h3>Senaryo A — 2+1 Kiralık, 2 Kişi, Sık 4 Saatlik Kesinti</h3>
<p>Yük: Modem + TV + aydınlatma + laptop + buzdolabı (kısmen). Toplam ~180W × 4 saat × 1.15 ≈ <strong>830Wh</strong>. <strong>P1800 (1024Wh)</strong> rahatlıkla yeter, hatta 5. saat sonuna kadar dayanır.</p>

<h3>Senaryo B — 3+1 Aile, Doğalgaz Kombi, 8 Saatlik Planlı Kesinti</h3>
<p>Yük: Modem + buzdolabı + kombi pompası + aydınlatma + TV + cihaz şarjları ≈ 240W × 8 saat × 1.15 ≈ <strong>2210Wh</strong>. <strong>P3200 (2048Wh)</strong> sınırda kalır; gerçek dünyada kesinti sonuna birkaç saat daha dayanmasını isteyenler için SH4000 düşünülebilir.</p>

<h3>Senaryo C — Yazlık, Güneş Panelli, 2 Kişi Hafta Sonu</h3>
<p>Yük: Buzdolabı + 9000 BTU klima (3 saat) + aydınlatma. Klima tek başına 800W × 3 saat × 1.15 = 2760Wh. <strong>P3200 + SP400 panel</strong> kombosu doğru. Güneşli 5 saatte panel 1600–2000Wh üretir, P3200 gün içinde şarj kalır.</p>

<h3>Senaryo D — Tam Ev Kesintisi, Elektrikli Kombi</h3>
<p>P800/P1800/P3200 yetersiz. Elektrikli kombi 1500–2000W sürekli; P3200 bile 1 saat verir. Bu senaryoda <a href="/urun/5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000">SH4000</a> + 1–2 adet B5120 batarya modülü + solar panel dizimi gerekir.</p>

<h2>Ne Zaman "Üstünü Al" Demeliyiz?</h2>

<p>Şu üç durumda muhakkak bir segment yukarıyı seçin:</p>

<ol>
  <li><strong>Buzdolabınız tek kompresörlü, yaşlı (10+ yaş):</strong> Başlangıç akımı genç cihazların iki katına çıkabilir. P800 çoğu zaman başlatır ama zamanla BMS uyarısı verir. P1800 seçmek ilerideki baş ağrısını önler.</li>
  <li><strong>Evde uzaktan çalışan varsa:</strong> Masaüstü PC + 2 monitör ~300W. Yedeklemede 4 saat çalışmak 1400Wh'a yakın ister. P1800 sınırda, P3200 rahat.</li>
  <li><strong>Karavan/yazlık hayal ediyorsanız:</strong> İlk etapta "ev için" alınan cihaz sonra sahaya çıkar. Solar giriş wattajı yüksek olan P3200 veya SH4000 bu hibrit kullanıma daha uygun.</li>
</ol>

<h2>Fiyat Dalgalanmaları: 2026'da Ne Bekleyelim?</h2>

<p>LiFePO4 hücre fiyatları 2024'ten bu yana %20–25 geriledi. Ancak Türkiye'de kur etkisi bu düşüşü tüketici fiyatına yansımasını yumuşatıyor. Yine de şu eğilimler 2026 boyunca sürecek gibi görünüyor:</p>

<ul>
  <li>1000Wh ve 2000Wh segmenti fiyat-kapasite dengesinde en iyi noktalara gelmiş durumda; önemli bir düşüş beklemiyoruz.</li>
  <li>5000Wh+ segmenti (SH4000 gibi) üretim hacminin artmasıyla daha erişilebilir hale geliyor; <strong>bu segment en dikkat çekici fiyat iyileşmesinin yaşandığı kategori</strong>.</li>
  <li>Solar panel fiyatları W başına yavaş ama istikrarlı düşüşte. Panel + güç kaynağı kombosu alan müşterilerin toplam yatırım tutarı düşüyor.</li>
</ul>

<p>"Şimdi mi almalı, beklemeli miyim?" sorusunun cevabı: acil ihtiyacınız varsa beklemeyin. Kış ve kesinti dönemlerinde stok daralır, kargo süresi uzar. Kesin ihtiyaç yoksa nisan-haziran arası nispeten sakin bir dönemdir.</p>

<h2>Sıkça Sorulan Sorular</h2>

<h3>Fiyat/performans açısından en çok tercih edilen model hangisidir?</h3>
<p>Saha verilerimize göre <a href="/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800">P1800</a>, ürün ailemizin en yüksek paya sahip modelidir. 1024Wh kapasite, 1800W sürekli ve 3600W pik çıkış, 12.7 kg ağırlık kombinasyonu; ev yedeklemesinin yaklaşık %80'ini kapsayan ihtiyaç profilini tek ürünle karşılamaktadır.</p>

<h3>Ucuz bir model alıp sonra batarya ekleyebilir miyim?</h3>
<p>P800, P1800 ve P3200 <strong>genişletilebilir değil</strong>. Ekstra batarya modülü desteği sadece SH4000 ile B5120 arasında var. "Önce küçük al, sonra büyüt" planı bu ailede işlemiyor — baştan doğru kapasite seçin.</p>

<h3>İkinci el / yenilenmiş bir güç kaynağı mantıklı mı?</h3>
<p>LiFePO4'ün döngü ömrü uzun, yani batarya zamanla ciddi kapasite kaybetmez. Ama BMS kartı, invertör, portlar yıpranabilir; yenilenmiş olarak satılanlar yalnızca yetkili kaynaklardan alınmalı. Garanti süresinin kalan kısmına dikkat edin.</p>

<h3>Solar paneli sonra eklesem olur mu?</h3>
<p>Olur. Tüm modellerimizde XT60 veya MC4 solar giriş var. <a href="/urun/tasinabilir-gunes-paneli-100w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp100">SP100</a>, <a href="/urun/tasinabilir-gunes-paneli-200w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp200">SP200</a>, <a href="/urun/tasinabilir-gunes-paneli-400w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp400">SP400</a> panellerimizden birini doğrudan bağlarsınız; cihazla birlikte gelen dönüştürücü kablo gerekirse devreye girer. Panel seçimi için ayrı bir yazımız var: <a href="/blog/tasinabilir-gunes-paneli-secimi-100w-200w-400w">SP100 vs SP200 vs SP400</a>.</p>

<h3>Kredi kartına 9–12 taksit var mı?</h3>
<p>Dönem dönem 12 taksite kadar seçenekler açılıyor. Güncel kampanyaları sepet aşamasında görürsünüz. Kurumsal ve KOBİ faturalı satış için özel fiyatlandırma yapıyoruz — <a href="/iletisim">iletişim sayfasından</a> bize ulaşın.</p>

<h2>Sonuç</h2>

<p>Fiyatı tek başına sorgulamak doğru cevabı vermez. Önce ihtiyacınızı Wh olarak tespit edin, ardından segmentteki modeller arasından pik güç, UPS süresi, solar giriş gibi kriterlerle seçin. <a href="/guc-hesaplayici">Güç Hesaplayıcı</a> ihtiyacınızı 1 dakikada verir, <a href="/kategori/tasinabilir-guc-kaynaklari">tüm modelleri</a> yan yana gözden geçirebilirsiniz.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // 04 — SOLAR PANEL SEÇİMİ
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "tasinabilir-gunes-paneli-secimi-100w-200w-400w",
    title: "Taşınabilir Güneş Paneli Seçimi: 100W vs 200W vs 400W Hangisi?",
    excerpt:
      "SP100, SP200 ve SP400 arasında karar verecekseniz: gerçek şarj hızları, taşınabilirlik, karavan/kamp/ev senaryoları ve panel bağlantı ipuçları.",
    category: "Solar",
    tags: [
      "taşınabilir güneş paneli",
      "SP100",
      "SP200",
      "SP400",
      "solar panel karşılaştırma",
    ],
    metaTitle: "Taşınabilir Güneş Paneli Seçimi: 100W, 200W, 400W Karşılaştırma",
    metaDescription:
      "SP100, SP200 ve SP400 arasında kim hangisini almalı? Gerçek watt üretimi, katlama ölçüleri, IP67 dayanıklılık ve power station uyumu üzerine rehber.",
    metaKeywords: [
      "taşınabilir güneş paneli",
      "SP100 solar panel",
      "SP200 solar panel",
      "SP400 solar panel",
      "katlanabilir güneş paneli",
      "100W 200W 400W solar panel",
    ],
    content: `<p>Taşınabilir güneş panellerinin etiketlerinde belirtilen nominal watt değerleri, standart test koşullarında (STC — 1000 W/m² ışınım, 25°C hücre sıcaklığı) ölçülür. Gerçek kullanımda bu değere ulaşmak için; açık gökyüzü, güneşin panele yakın dik açıda düşmesi ve hücre sıcaklığının çok yüksek olmaması gerekir. Türkiye koşullarında yaz aylarında öğle saatlerinde etikete yakın üretim elde edilmesi olağandır; ilkbahar/sonbahar dönemlerinde veya bulutlu hava koşullarında üretim, etiketin %40–70'i aralığında gerçekleşir.</p>

<p>Bu yazıda SP100 (100W), SP200 (200W) ve SP400 (400W) modellerini teknik parametreler, kullanım senaryoları, güç kaynağı uyumluluğu ve bağlantı tipi açısından detaylı olarak karşılaştırıyoruz. Taşınabilirlik önceliği olan bir kamp çözümü mü arıyorsunuz, yoksa yazlık veya kalıcı bir off-grid kurulum mu planlıyorsunuz — bu iki senaryonun doğru cevapları farklıdır.</p>

<blockquote>
<strong>Hızlı Cevap:</strong> Kamp çantası ve P800 için <strong>SP100</strong> (5 kg, katlanmış 38×61 cm). Karavan ve P1800 için <strong>SP200</strong> (8 kg, dengeli bir tercih). Ev/yazlık ve P3200/SH4000 için <strong>SP400</strong> (16.3 kg, iki taneye kadar paralel bağlanabilir). Türkiye yazında gerçek üretim tipik olarak etiketin %75–85'i kadardır.
</blockquote>

<h2>Üç Modelin Teknik Farkı</h2>

<table>
  <thead>
    <tr>
      <th>Özellik</th>
      <th>SP100</th>
      <th>SP200</th>
      <th>SP400</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Nominal Güç</td><td>100 W (25W × 4 hücre)</td><td>200 W (50W × 4 hücre)</td><td>400 W (100W × 4 hücre)</td></tr>
    <tr><td>Hücre Tipi</td><td>Monokristal silikon</td><td>Monokristal silikon</td><td>Monokristal silikon</td></tr>
    <tr><td>Dönüşüm Verimliliği</td><td>%21–23</td><td>%21–23</td><td>%21–23</td></tr>
    <tr><td>Çalışma Voltajı</td><td>18 V</td><td>24 V</td><td>44 V</td></tr>
    <tr><td>Çalışma Akımı</td><td>5.6 A</td><td>8.33 A</td><td>10 A</td></tr>
    <tr><td>Açık Devre Voltajı (Voc)</td><td>21.6 V</td><td>28.8 V</td><td><strong>52.8 V</strong></td></tr>
    <tr><td>Kısa Devre Akımı (Isc)</td><td>6.16 A</td><td>9.12 A</td><td>10 A</td></tr>
    <tr><td>Çalışma Sıcaklığı</td><td>−20°C ~ +70°C</td><td>−20°C ~ +70°C</td><td>−20°C ~ +70°C</td></tr>
    <tr><td>IP Koruma</td><td><strong>IP67</strong></td><td><strong>IP67</strong></td><td><strong>IP67</strong></td></tr>
    <tr><td>Katlama</td><td>4 katlı</td><td>4 katlı</td><td>4 katlı</td></tr>
    <tr><td>Katlanmış Boyut</td><td>387×609×30 mm</td><td>610×608×45 mm</td><td>725×990×45 mm</td></tr>
    <tr><td>Açık Boyut</td><td>1250×609×10 mm</td><td>2074×608×30 mm</td><td>2617×990×30 mm</td></tr>
    <tr><td>Ağırlık</td><td>5 kg</td><td>8 kg</td><td>16.3 kg</td></tr>
    <tr><td>Bağlantı</td><td>MC4 + XT60 adaptör</td><td>MC4 + XT60 adaptör</td><td>MC4</td></tr>
  </tbody>
</table>

<h2>Voc Neden Önemli? (Kritik Uyumluluk Noktası)</h2>

<p>Açık devre voltajı, panelin yüksüz durumda ölçülen voltajıdır. Güç kaynakları "DC giriş voltaj aralığı" diye bir değer belirtir (örneğin P1800'de 10–52V). Panel Voc'u bu aralığın <strong>üstünde</strong> olursa cihaz kabul etmez; <strong>altında</strong> olursa ya hiç şarj etmez ya da düşük verimle çalışır.</p>

<p>Uyumluluk özeti:</p>

<ul>
  <li><strong>P800 (DC giriş 10–30V):</strong> SP100 ✅, SP200 — Voc 28.8V sınırda, öğle güneşinde dikkatli; <strong>SP400 bağlanmaz</strong> (52.8V limit aşımı).</li>
  <li><strong>P1800 (DC giriş 10–52V):</strong> SP100 ✅, SP200 ✅, <strong>SP400 sınırda</strong> (52.8V ≈ 52V limiti).</li>
  <li><strong>P3200 (DC giriş 12–80V):</strong> SP100 ✅, SP200 ✅, <strong>SP400 ideal</strong> ve iki adet <em>paralel</em> bağlanabilir.</li>
  <li><strong>SH4000 (LV XT60 12–50V, HV MC4 70–450V):</strong> SP100–200 XT60 girişine, <strong>SP400 paralel 2–3 adet HV MC4 girişine</strong> (seri bağlamak kaçınılmaz).</li>
</ul>

<p>Bu nedenle panel ve güç kaynağının birlikte seçilmesini ve satın alma öncesinde uyumluluğun birlikte kontrol edilmesini öneriyoruz. Yanlış eşleşmeler, kurulum aşamasında zaman ve ek kablo/dönüştürücü maliyetine yol açabilir.</p>

<h2>Gerçek Hayatta Ne Kadar Üretir?</h2>

<p>Laboratuvar rakamları bir yana, gerçekte ne beklemek doğru? Türkiye genelinde güneş verileri şöyle:</p>

<ul>
  <li><strong>Yaz, açık gökyüzü, öğlen saatleri:</strong> Etiketin %85–95'i. SP200 rahatlıkla 170–190W üretir.</li>
  <li><strong>İlkbahar/sonbahar, açık gün, öğlen:</strong> %65–80. SP200 130–160W.</li>
  <li><strong>Kış, açık gün, öğlen:</strong> %40–60. SP200 80–120W.</li>
  <li><strong>Bulutlu / puslu:</strong> %20–40. SP200 40–80W.</li>
  <li><strong>Sabah 9:00 / akşam 16:00:</strong> %30–50. Açı optimizasyonu ile artırılabilir.</li>
</ul>

<p>Pratik hesap: Yazın <strong>günlük 5 saat iyi güneşe</strong> denk gelirseniz, SP200 panelden tipik 700–900Wh / gün enerji alırsınız. Bu, <a href="/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800">P1800</a>'ün neredeyse tam bir dolumuna yeter.</p>

<h2>Katlama, Ağırlık, Taşıma</h2>

<h3>SP100 — Taşınabilirlik Önceliği</h3>
<p>Katlanmış boyutu 38×61 cm, kalınlığı 3 cm, ağırlığı 5 kg. Sırt çantası, motosiklet bagajı ve küçük araç sandığı için uygundur. IP67 koruma sınıfı sayesinde yağmur ve nemli koşullarda üretim kesintisiz sürer; kuruduktan sonra nominal verime döner. Kamp, bisiklet/motosiklet turu ve kısa kaçamaklar için tercih edilen modeldir.</p>

<h3>SP200 — Karavan ve Orta Ölçekli Saha Kullanımı</h3>
<p>Katlanmış ölçüsü 61×60 cm, kalınlığı 4.5 cm, ağırlığı 8 kg. Karavan iç dolabı ve standart otomobil bagajı için uygun boyuttadır. Açık hâldeyken panel 2074×608 mm'ye genişler; karavan yan kurulumu veya zemin sergilemesi için doğru büyüklüğü sunar. Panelin üzerindeki rüzgar delikleri belirli koşullarda yeterli olsa da, orta-şiddetli rüzgarda kamp kazığı veya ağırlık ile sabitleme yapılmasını öneriyoruz.</p>

<h3>SP400 — Kalıcı Kurulum ve Yüksek Üretim</h3>
<p>Katlanmış 72×99 cm, kalınlığı 4.5 cm, ağırlığı 16.3 kg. Bu segment, "sürekli taşıma" kullanım profilinin dışına çıkar; yazlık, bağ evi ve kalıcı off-grid kurulumlar için tasarlanmıştır. Açık boyutu 2617×990 mm'dir. Kullanım şekli; bahçe zemin standı veya duvar/sabit yüzey montajı üzerinden yaygındır. İki adet SP400'ün paralel bağlantısıyla <a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200</a>'ün 1000W solar giriş kapasitesi tam olarak kullanılır ve en verimli tam dolum süresi (yaklaşık 3 saat) elde edilir.</p>

<h2>Hangi Power Station ile Hangi Panel?</h2>

<h3>P800 + SP100</h3>
<p>En hafif, en ucuz kombo. Motosiklet/bisiklet turu, sırt çantalı kamp, 2 günlük sahil kaçamakları için ideal. SP100, P800'ü güneşli 3–4 saatte tam doldurur.</p>

<h3>P1800 + SP200</h3>
<p>Karavan ve ciddi kamp kullanıcısının standart kombosu. Bir SP200, P1800'ü günde tam doldurur; bir kat solar alanla haftanın 7 günü "elektriksiz" yaşayabilirsiniz.</p>

<h3>P3200 + SP400 (×2)</h3>
<p>Yazlık için kapalı çözüm. İki adet SP400 <strong>paralel</strong> bağlanırsa P3200'ün 1000W girişi sonuna kadar kullanılır. Güneşli 3 saatte P3200 tam dolar; kalan saatlerde anlık tüketim + batarya şarjı paralel devam eder.</p>

<h3>SH4000 + SP400 (×3–6)</h3>
<p>Tam ev/off-grid kurulum. HV girişe seri bağlanan 3 panel 3000W civarı üretim yapar. Ev gündüz elektriği tüketirken kendi güneşinden üretir, fazlasını bataryaya yazar. Bir yaz sezonu sonunda elektrik faturası ciddi düşüş yaşar.</p>

<h2>Montaj İpuçları: Panelinizin %10 Daha Fazla Üretmesi</h2>

<ul>
  <li><strong>Açı optimizasyonu:</strong> Paneli güneşe dik tutmak verimi %15–30 artırır. SP100/200/400'ün dayanak ayakları 3 farklı açıyı destekler. Günün saatine göre 1–2 kez ayarlamak rutine girer.</li>
  <li><strong>Gölge felaketi:</strong> Bir yaprak bile panelin bir hücresini gölgede bıraksa, <strong>tüm panelin çıkışı düşer</strong> (bypass diyotlara rağmen). Panel yerini seçerken gölgeyi takip edin.</li>
  <li><strong>Kablo uzunluğu:</strong> Uzun MC4 uzatma kabloları voltaj kaybına yol açar. 5 metreyi aşmamasını öneriyoruz; aşıyorsa 6 mm²'lik kablo kullanın.</li>
  <li><strong>Paralel vs seri:</strong> P3200'e 2 panel bağlayacaksanız <em>paralel</em> doğru (akım toplanır, voltaj sabit kalır, cihaz limitini aşmaz). SH4000 HV girişine bağlanacaksa <em>seri</em> (voltaj toplanır, 150V+ olur).</li>
  <li><strong>Temizlik:</strong> Ayda bir toz/toprak silinmesi yazın %5'e yakın fark yaratır. Nemli mikrofiber yeterli.</li>
</ul>

<h2>Sıkça Sorulan Sorular</h2>

<h3>Bulutlu günde de şarj eder mi?</h3>
<p>Evet, ancak düşük seviyede. SP200 kapalı havada 40–70W verebilir — modem+led için yeterli, ama power station'ın tam dolumu o gün mümkün olmayabilir.</p>

<h3>Panel yağmurda kalırsa ne olur?</h3>
<p>Hiçbir şey. Tüm panellerimiz IP67 sertifikalı. Yağmurda bile üretim (düşük de olsa) devam eder. Kuruduktan sonra verim aynı yerine döner.</p>

<h3>MC4 ile XT60 arasında adaptör geliyor mu?</h3>
<p>P800, P1800 ve P3200'ün kutusunda "XT60 → MC4 dönüştürücü kablo" standart olarak geliyor. Yani panelin MC4 ucunu bu kabloya, kablonun XT60 ucunu ise güç kaynağının solar girişine takarsınız. Ek satın alma gerekmez.</p>

<h3>İki panelim farklı watt ise birlikte kullanabilir miyim?</h3>
<p>Teknik olarak paralel bağlanırsa akımları toplanır ama en zayıf panelin voltajını takip ederler (verim düşer). Mümkünse aynı watt ve aynı marka panelleri karıştırın. Farklı watt kombinasyonu son seçenek olmalı.</p>

<h3>Kışın panel satın almak mantıklı mı?</h3>
<p>Evet. Kış-ilkbahar arasında fiyat biraz daha uygun, stok bol oluyor. Yaza sezon açıldığında panel ve kurulum konusunda rahat oluyorsunuz.</p>

<h3>Panel + power station'ı ayrı ayrı mı almalı, set olarak mı?</h3>
<p>Uyumluluğu doğru kurmak için birlikte almak daha güvenli. Özellikle SP400 + P3200 paralel bağlantısı gibi kombolarda doğru kablo seti gerekir; bunu set olarak tamamlıyoruz.</p>

<h2>Sonuç</h2>

<p>Solar panel satın alma kararı üç soruya iner: <strong>Nereye taşıyacaksınız? Hangi power station'a bağlayacaksınız? Günde ne kadar enerji istiyorsunuz?</strong> Bu üç soruya birer cümlelik net cevabınız varsa model seçimi netleşir. Tereddüt ederseniz <a href="/iletisim">bizimle iletişime geçin</a>, kombonuzu birlikte planlayalım. <a href="/kategori/gunes-panelleri">Tüm solar panel modelleri</a> ve <a href="/kategori/tasinabilir-guc-kaynaklari">güç kaynakları</a> sayfalarımızdan detayları inceleyebilirsiniz.</p>`,
  },
];

async function main() {
  console.log("🚀 Blog Seed 02 başlıyor...\n");

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

  console.log("\n🎉 Blog Seed 02 tamamlandı.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Hata:", e);
  prisma.$disconnect();
  process.exit(1);
});
