/**
 * FusionMarkt Blog Seed — 01
 * 01) Ev İçin Taşınabilir Güç Kaynağı: Modem, Kombi, Buzdolabı Kaç Saat Çalışır?
 * 02) Taşınabilir Güç Kaynağı Yorumları: P800, P1800, P3200 Kime Uygun?
 *
 * Kullanım:
 *   cd packages/db && npx tsx prisma/seed-blog-01.ts
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
  // 01 — EV İÇİN KAÇ SAAT ÇALIŞIR
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "ev-icin-tasinabilir-guc-kaynagi-kac-saat-calisir",
    title: "Ev İçin Taşınabilir Güç Kaynağı: Modem, Kombi, Buzdolabı Kaç Saat Çalışır?",
    excerpt:
      "Elektrik kesildiğinde evinizi ayakta tutacak güç kaynağını seçmeden önce bilmeniz gerekenler. Modem, kombi, buzdolabı ve klima için gerçek saat hesapları.",
    category: "Rehber",
    tags: [
      "ev için taşınabilir güç kaynağı",
      "elektrik kesintisi güç kaynağı",
      "buzdolabı power station",
      "kombi güç kaynağı",
      "P1800",
      "P3200",
    ],
    metaTitle: "Ev İçin Taşınabilir Güç Kaynağı: Kaç Saat Çalışır? (2026)",
    metaDescription:
      "Modem 40 saat, buzdolabı 16 saat, kombi 9 saat… Ev tipi taşınabilir güç kaynağı kaç saat çalışır? P800, P1800 ve P3200 için net hesaplar ve senaryolar.",
    metaKeywords: [
      "ev için taşınabilir güç kaynağı",
      "elektrik kesintisi için güç kaynağı",
      "buzdolabı için power station",
      "kombi çalıştıran güç kaynağı",
      "ev tipi güç kaynağı kaç saat çalışır",
    ],
    content: `<p>Türkiye'de son iki yılda elektrik kesintisi artık ev halkının pratik bir gündem maddesi haline geldi. Planlı trafo bakımları, yaz sıcağında şebeke yüklenmeleri, kış fırtınalarında dağıtım hattı arızaları — ortalama bir hanede yılda 8–12 kez kesinti yaşanıyor ve bunların önemli bir kısmı 2 saatin üzerinde sürüyor.</p>

<p>Müşterilerimize danışmanlık yaparken en sık karşılaştığımız soru şu: "Bir taşınabilir güç kaynağı alsam, evim kaç saat dayanır?" Sorunun kısa cevabı yok, çünkü bu süre hangi cihazları yedeklemek istediğinize, bu cihazların gerçek tüketimine ve seçtiğiniz kapasiteye bağlı değişkenlik gösterir. Aşağıda datasheet'teki Wh değerlerini Türkiye'deki tipik ev cihazlarının ortalama güç tüketimiyle eşleştirip, her kapasite için net saat aralıkları paylaşıyoruz.</p>

<blockquote>
<strong>Hızlı Cevap:</strong> Ortalama bir evde modem + birkaç led ışık + buzdolabı yedeklemek için 1024Wh kapasite (P1800) genellikle yeter ve 10–16 saat ömür verir. Kombi + buzdolabı + klima gibi komple ev beklentisi varsa 2048Wh (P3200) ya da 5120Wh (SH4000) gerekir. Sadece modem, laptop ve telefon için 512Wh (P800) yeterlidir.
</blockquote>

<h2>Önce Formülü Anlayalım: Wh Nedir?</h2>

<p>Kapasite <strong>watt-saat (Wh)</strong> birimiyle ölçülür. Anlamı basit: "1 saat boyunca kaç watt çekebilir?" Bir cihazın ne kadar çalışacağını bulmak için formül şu:</p>

<p><strong>Çalışma süresi (saat) ≈ Kapasite (Wh) × 0.9 ÷ Cihaz ortalama gücü (W)</strong></p>

<p>Buradaki 0.9 (yani %90) katsayısı önemlidir. İnvertör, DC bataryayı AC prize çevirirken ortalama %10 oranında kayıp yaşar. Ürün kataloglarında bu kayıp çoğu zaman belirtilmez; gerçek kullanımda P1800'ün 1024Wh bataryası AC tarafında yaklaşık 920Wh'lık bir kullanılabilir enerjiye karşılık gelir. Bu yazıdaki tüm saat hesaplarına bu kaybı dahil ettik — satın alma sonrasında beklenti-gerçek arasında farkla karşılaşmamanız için.</p>

<h2>Cihaz Cihaz Kaç Saat Çalışır? (Net Tablo)</h2>

<p>Aşağıdaki tablo Türkiye'deki tipik ev cihazlarının <em>ortalama</em> tüketimine göre hesaplanmıştır. Sol sütunda cihaz, sağdaki sütunlarda popüler modellerimizin verdiği gerçek süre var.</p>

<table>
  <thead>
    <tr>
      <th>Cihaz</th>
      <th>Ortalama Güç</th>
      <th>P800 (512Wh)</th>
      <th>P1800 (1024Wh)</th>
      <th>P3200 (2048Wh)</th>
      <th>SH4000 (5120Wh)</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Modem / Router</td><td>12W</td><td><strong>~38 saat</strong></td><td>~77 saat</td><td>~154 saat</td><td>~384 saat</td></tr>
    <tr><td>Dizüstü bilgisayar</td><td>55W</td><td>~8 saat</td><td>~17 saat</td><td>~34 saat</td><td>~84 saat</td></tr>
    <tr><td>LED TV (42")</td><td>70W</td><td>~6.5 saat</td><td>~13 saat</td><td>~26 saat</td><td>~66 saat</td></tr>
    <tr><td>CPAP (ısıtıcı kapalı)</td><td>35W</td><td>~13 saat</td><td>~26 saat</td><td>~52 saat</td><td>~132 saat</td></tr>
    <tr><td>Mini buzdolabı</td><td>30W ort.</td><td>~15 saat</td><td>~31 saat</td><td>~61 saat</td><td>~154 saat</td></tr>
    <tr><td>Ev buzdolabı (A++)</td><td>60W ort.</td><td>~7.5 saat</td><td>~15 saat</td><td><strong>~30 saat</strong></td><td>~77 saat</td></tr>
    <tr><td>Kombi (doğalgaz, sadece pompa)</td><td>100W</td><td>~4.5 saat</td><td>~9 saat</td><td>~18 saat</td><td>~46 saat</td></tr>
    <tr><td>LED aydınlatma (oda)</td><td>15W</td><td>~30 saat</td><td>~61 saat</td><td>~123 saat</td><td>~307 saat</td></tr>
    <tr><td>Klima (9000 BTU inverter)</td><td>800W</td><td>Çalışmaz*</td><td>~1 saat</td><td>~2.3 saat</td><td>~5.7 saat</td></tr>
  </tbody>
</table>

<p><em>* P800'ün 800W sürekli çıkış limitini klimaların ilk açılış yükü (~1500–2000W) aşar. P800'de Smart-Boost 1200W'a kadar çıkar ama inverter klima için güvenli değildir.</em></p>

<h2>Cihaz Cihaz Gerçek Durum: Gizlenen Detaylar</h2>

<h3>Modem ve İnternet: Kesinti Sırasında En Ucuz Konfor</h3>

<p>Modem + ONT + mesh wifi birlikte ortalama 15–20W çeker. Bu demek oluyor ki bir P800 (512Wh), sadece internet için <strong>yaklaşık 25 saat</strong> dayanır. Sekiz saatlik bir kesintide telefonlardan internet düşmez, uzaktan çalışabilirsiniz, çocuk yayın izleyebilir. Ev ofis kullananlar için bu tek başına yatırımı haklı çıkarır.</p>

<h3>Buzdolabı: En Yanlış Bilinen Hesap</h3>

<p>Buzdolabının etiketinde "150W" yazıyor diye "P800 benim buzdolabımı 3 saat çalıştırır" diye düşünmeyin. Buzdolabı <strong>döngüsel</strong> çalışır. Kompresör açıldığında 2–3 dakika 150W çeker, sonra susar. Saat bazında ortalama tüketim Türkiye'de A++ bir ev buzdolabında <strong>50–70W</strong> civarındadır.</p>

<p>Ayrıca hesaba katılması gereken kritik bir teknik detay var: buzdolabı kompresörü ilk açılışta <strong>başlangıç akımı (in-rush current)</strong> nedeniyle nominal gücünün 3–5 katı kadar anlık güç çeker. Bu sıçrama saniyenin altında bir süre devam etse bile 800W sürekli çıkışlı bir invertörde "Overload" korumasını tetikleyebilir. Ev tipi buzdolabı yedeklemesinde P1800 ve üstü modelleri önermemizin teknik gerekçesi budur — <a href="/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800">P1800'ün 3600W pik gücü</a> bu anlık yük sıçramasını güvenle karşılar.</p>

<p><strong>Gerçek çalışma süresi:</strong> Normal kullanım döngüsünde (kapak sıkça açılmıyorsa, termostat ayarı orta seviyedeyse) P1800, ev tipi A++ sınıfı bir buzdolabını yaklaşık <strong>15 saat</strong> boyunca çalıştırır.</p>

<h3>Kombi: Doğalgazlı mı Elektrikli mi?</h3>

<p>Türkiye'de en büyük karışıklık burada. Kombiyi çalıştırmak derken iki ayrı şey kastediliyor:</p>

<ul>
  <li><strong>Doğalgazlı kombi:</strong> Isıyı doğalgazdan alır. Elektrik sadece sirkülasyon pompası, brülör fanı ve kontrol kartı içindir. Toplam çekim <strong>80–120W</strong> arasıdır. P1800 rahatlıkla 9 saat çalıştırır, P3200 18 saat.</li>
  <li><strong>Elektrikli kombi:</strong> Tüm ısıtma yükü elektrikten gelir. Soğuk suyu ısıtırken 1500–2000W çeker. Sürekli değil ama yoğun kullanımda bir P3200 bile sadece 1–1.5 saat yetebilir. Bu senaryoda power station çözüm değildir — güneş panelli SH4000 + B5120 veya jeneratör gerekir.</li>
</ul>

<p>Kısacası: <strong>doğalgaz kombiniz varsa P1800 ideal</strong>, evinizi ısıtmaya devam eder. Elektrikli kombi kullanıyorsanız farklı bir çözüm önerimiz olacak (aşağıda senaryoda var).</p>

<h3>Klima: Limitleri Bilin</h3>

<p>9000 BTU <em>inverter</em> klima sürekli çalışmada 700–900W çeker. İlk çalıştırmada ise 1500–2000W sıçrama yapar. P1800 bunu tolere eder (3600W pik) ve yaklaşık 1 saat çalıştırır. P3200 aynı klimada <strong>2.5 saat</strong> verir. Uzun süreli serinletme düşünüyorsanız hedef doğrudan P3200 veya SH4000 olmalı. Bu konuyu ayrı bir yazıda daha detaylı ele alıyoruz: <a href="/blog/power-station-ile-klima-calisir-mi">Power Station ile Klima Çalışır mı?</a></p>

<h2>Örnek Senaryo: 6 Saatlik Planlı Kesinti</h2>

<p>3+1 standart bir apartman dairesinde, dört kişilik bir hanede 6 saatlik planlı bakım kesintisi yaşandığını varsayalım. Yedeklemek istenen cihazların toplam enerji ihtiyacı şöyle hesaplanır:</p>

<ul>
  <li>Modem + mesh Wi-Fi: 6 saat × 18W = 108 Wh</li>
  <li>İki adet LED lamba + ortam aydınlatması: 6 saat × 25W = 150 Wh</li>
  <li>LED TV (4 saat açık varsayımı): 4 × 70W = 280 Wh</li>
  <li>Telefon ve tablet şarjı: ≈ 80 Wh</li>
  <li>Buzdolabı (döngüsel tüketim, 6 saat ort. 50W): 300 Wh</li>
  <li>Doğalgazlı kombi (gün içi 3 saat devrede, 100W): 300 Wh</li>
</ul>

<p><strong>Toplam ihtiyaç: yaklaşık 1.218 Wh</strong></p>

<p>Bu hesap kapasite seçimini netleştirir. <a href="/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800">P1800 (1024Wh)</a> bu yükü sınırda karşılar; konforu korumak için ya son saatlerde birkaç cihazı devre dışı bırakmak ya da TV süresini kısaltmak gerekebilir. <a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200 (2048Wh)</a>, aynı senaryoda <strong>iki katı</strong> enerji sunduğu için 12 saatlik bir kesintiyi dahi kısıntısız kaldırır. Kapasite seçiminde belirleyici kriter, hanenin beklenen kesinti sıklığı ve süresidir.</p>

<h2>Hangi Model Sizin Evinize Uygun?</h2>

<ul>
  <li><strong>Stüdyo / bekar / sadece internet:</strong> <a href="/urun/512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800">P800 (512Wh)</a> — modem, laptop, birkaç ışık, telefon. 8–10 saatlik kesintide bile rahat. ~6.5 kg, tek elle taşınır.</li>
  <li><strong>2+1 / 3+1 aile, doğalgaz kombili:</strong> <a href="/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800">P1800 (1024Wh)</a> — modem + buzdolabı + aydınlatma + kombi pompası. Ev hayatı büyük ölçüde devam eder. 3600W pik güç buzdolabı başlangıcını sorunsuz karşılar.</li>
  <li><strong>Büyük aile / ev ofis / sık ve uzun kesinti:</strong> <a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200 (2048Wh)</a> — yukarıdakilerin hepsi + klima veya ütü gibi yüksek güçlü tek bir cihaz. Tekerlekli tasarım 24 kg ağırlığı kolaylaştırır.</li>
  <li><strong>Tam ev yedekleme / elektrikli kombi / off-grid düşüncesi:</strong> <a href="/urun/5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000">SH4000 (5120Wh)</a> — duvara sabitlenen hibrid invertör sistemi. ATS uyumu sayesinde kesinti olduğunda tüm ev otomatik geçer. B5120 modülleriyle 10–20 kWh'a büyütülür.</li>
</ul>

<p>Hangi cihazları aynı anda çalıştırmak istediğinize bakıp kendi watt toplamınızı çıkarmak istiyorsanız <a href="/guc-hesaplayici">Güç Hesaplayıcı</a> aracımız bir dakikada size modeli söyler.</p>

<h2>Sıkça Sorulan Sorular</h2>

<h3>Power station elektrik gelince otomatik şarj olur mu?</h3>

<p>Evet. P1800 ve üstü modellerde <strong>AC bypass</strong> vardır. Güç kaynağı prize takılıyken elektrik varken hem kendini şarj eder, hem de çıkış portlarını beslemeye devam eder. Kesinti olduğunda UPS modu <strong>10–20 ms</strong> içinde devreye girer — bilgisayarınız yeniden başlamaz, modem sıfırlanmaz.</p>

<h3>Ne kadar sürede tam şarj olur?</h3>

<p>P800 AC priz ile ~1.2 saat, P1800 yine ~1.2 saat (1200W AC şarj), P3200 ~1.5 saat (1800W AC şarj) içinde <strong>%0 → %100</strong> dolar. Yani ertesi gün yeni bir kesintiye tam dolu girersiniz.</p>

<h3>Sürekli prizde takılı kalsa bataryaya zarar verir mi?</h3>

<p>Hayır. LiFePO4 bataryaların BMS devresi şarj seviyesini %95'te tutar ve <strong>trickle charge</strong> ile dengede tutar. 4000+ döngü ömür bu sürekli kullanım senaryosunu öngörür. Ancak klasik lityum-ion bataryalarda bu farklıdır; bu yüzden biz LiFePO4 dışındaki modelleri önermiyoruz.</p>

<h3>Kaç yıl dayanır?</h3>

<p>Haftada 2 kez tam dolum-boşalım yaparsanız bile teorik ömür <strong>~40 yıl</strong>a denk gelir. Gerçekçi konuşalım: kullanım 10 yıl sonra bile kapasitenin %80'i civarında olur. Kısacası, bu cihazı bir kez alıyorsunuz, 10 yıl kullanıyorsunuz.</p>

<h3>Kombimi çalıştırır mı emin nasıl olurum?</h3>

<p>Kombi kullanım kılavuzunda "elektrik tüketimi" bölümüne bakın. Doğalgazlı kombilerin çoğu 100–150W arasıdır; P1800 ve üstü sorun yaşamaz. Elektrikli kombi (ısıtıcılı) kullanıyorsanız Wh ihtiyacınız çok artar; bizimle iletişime geçin, doğru sistemi birlikte belirleyelim.</p>

<h2>Son Söz</h2>

<p>Elektrik kesintisi bir afet değil, yönetilmesi gereken bir durum. Doğru seçilmiş bir taşınabilir güç kaynağı, 1 günlük çoğu kesintide evinizi normal akışında tutar, uzun kesintilerde ise öncelikli cihazlarınızı ayakta bırakır. <a href="/kategori/tasinabilir-guc-kaynaklari">Tüm taşınabilir güç kaynaklarını incelemek</a> veya kendi ihtiyacınızı hesaplamak için <a href="/guc-hesaplayici">Güç Hesaplayıcı</a>'yı kullanabilirsiniz.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // 02 — P800 / P1800 / P3200 YORUMLARI
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "tasinabilir-guc-kaynagi-yorumlari-p800-p1800-p3200",
    title: "Taşınabilir Güç Kaynağı Yorumları: P800, P1800, P3200 Kime Uygun?",
    excerpt:
      "P800, P1800 ve P3200 arasındaki gerçek fark ne? Bu üç modeli birlikte satan bir ekip olarak kim hangisini almalı, hangi senaryoda hayal kırıklığı yaşar — hepsini açıkladık.",
    category: "Karşılaştırma",
    tags: [
      "P800 yorumları",
      "P1800 yorumları",
      "P3200 yorumları",
      "taşınabilir güç kaynağı karşılaştırma",
      "power station",
    ],
    metaTitle: "P800, P1800, P3200 Yorumları ve Karşılaştırma — Kime Uygun?",
    metaDescription:
      "P800, P1800 ve P3200 arasında karar veremiyorsanız: üç modeli yan yana koyduk, kapasite, güç, ağırlık ve kullanıma göre kime ne önerdiğimizi yazdık.",
    metaKeywords: [
      "P800 yorumları",
      "P1800 yorumları",
      "P3200 yorumları",
      "P800 P1800 karşılaştırma",
      "P3200 P1800 fark",
      "taşınabilir güç kaynağı yorumları",
    ],
    content: `<p>P800, P1800 ve P3200 arasındaki karar, müşterilerimizin en çok zaman ayırdığı satın alma süreçlerinden biri. Üç modelin de LiFePO4 bataryası, saf sinüs invertörü, UPS/EPS özelliği ve 4000+ döngü ömrü ortak. Farkı yaratan; kapasite, pik güç, taşınabilirlik, solar giriş kapasitesi ve bağlantı seçenekleri gibi ikincil faktörler. Yanlış segment seçiminin en sık görülen iki sonucu ise şudur: ya kapasite yetersiz kalır ve ikinci bir yatırım kaçınılmaz olur, ya da ihtiyaç üzerinde bir modele fazla ödenir.</p>

<p>Bu yazıda üç modeli yalnızca teknik datasheet üzerinden değil, saha deneyimimize ve müşterilerimizden gelen geri bildirimlere dayanarak karşılaştırıyoruz. Hangi senaryoda hangi model doğru seçimdir, hangi durumda bir üst segment gereklidir, nerede fazla yatırım olur — hepsini bölüm bölüm ele alacağız.</p>

<blockquote>
<strong>Hızlı Cevap:</strong> <strong>P800</strong> — kamp, stüdyo, modem+laptop+telefon; en hafif ve en uygun fiyat. <strong>P1800</strong> — evin çoğu için doğru cevap; doğalgazlı kombi + buzdolabı + modem rahat çalışır. <strong>P3200</strong> — sık veya uzun kesinti yaşayanlar, karavan, 9000 BTU klima kullananlar için; tek model şart diyorsanız budur.
</blockquote>

<h2>Üçünü Yan Yana Koyduk</h2>

<table>
  <thead>
    <tr>
      <th>Özellik</th>
      <th>P800</th>
      <th>P1800</th>
      <th>P3200</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Kapasite</td><td>512 Wh</td><td>1024 Wh</td><td><strong>2048 Wh</strong></td></tr>
    <tr><td>Sürekli AC Çıkış</td><td>800 W</td><td>1800 W</td><td><strong>3200 W</strong></td></tr>
    <tr><td>Pik Güç (Surge)</td><td>1200 W Smart-Boost</td><td>3600 W</td><td><strong>6400 W</strong></td></tr>
    <tr><td>Batarya Tipi</td><td>LiFePO4</td><td>LiFePO4</td><td>LiFePO4</td></tr>
    <tr><td>Döngü Ömrü</td><td>4000+</td><td>4000+</td><td>4000+</td></tr>
    <tr><td>AC Şarj Gücü</td><td>600 W</td><td>1200 W</td><td>1800 W</td></tr>
    <tr><td>AC ile Tam Şarj</td><td>~1.2 saat</td><td>~1.2 saat</td><td>~1.5 saat</td></tr>
    <tr><td>Max Solar Giriş</td><td>300 W</td><td>500 W</td><td><strong>1000 W</strong></td></tr>
    <tr><td>USB-C PD Port</td><td>3× (100W)</td><td>2× (1×100W)</td><td>4× (2×100W)</td></tr>
    <tr><td>AC Priz Sayısı</td><td>2</td><td>2</td><td>4</td></tr>
    <tr><td>UPS / EPS</td><td>Evet</td><td>Evet (~10 ms)</td><td>Evet (~10 ms)</td></tr>
    <tr><td>Uygulama Kontrolü</td><td>—</td><td>Wi-Fi + Bluetooth</td><td>Wi-Fi + Bluetooth</td></tr>
    <tr><td>Ağırlık</td><td><strong>6.55 kg</strong></td><td>12.7 kg</td><td>24.35 kg</td></tr>
    <tr><td>Boyut</td><td>299×191×196 mm</td><td>361×269×232 mm</td><td>445×298×371 mm</td></tr>
    <tr><td>Tekerlekli</td><td>Hayır</td><td>Hayır</td><td><strong>Evet</strong></td></tr>
  </tbody>
</table>

<h2>P800 — Giriş Segmenti / Hafif Kullanım</h2>

<p>Ürün kutudan çıktığında öne çıkan iki teknik özellik: ilki <strong>Smart-Boost ile 1200W'a kadar uzanan kısa süreli yük kabulü</strong> — cihaz 800W sürekli çıkış verirken, başlangıç akımı yüksek olan cihazlarda (ör. bir kahve makinesi) kısa süreli olarak 1200W'a kadar yumuşak geçişle destek verir. İkinci özellik ise dahili LED fener modülü; 3 parlaklık kademesiyle acil aydınlatma ihtiyacını karşılar.</p>

<p>Saha geri bildirimlerimizde P800'ün en çok tercih edildiği kullanım senaryoları: ev ofis (modem + dizüstü bilgisayar + monitör kombinasyonu), öğrenci ve stüdyo daire yedeklemesi, hafta sonu kamp ve küçük çaplı acil durum çantası. Bu senaryolarda 512Wh kapasite genellikle yeterli kalmakta ve ürün beklentiyi karşılamaktadır.</p>

<p><strong>Segment sınırları ve dikkat edilmesi gerekenler:</strong></p>
<ul>
  <li>800W sürekli çıkış limiti; klima, ütü, mikrodalga, su ısıtıcısı gibi yüksek güçlü cihazlar için uygun değildir.</li>
  <li>Buzdolabı teknik olarak çalıştırılabilir ancak kompresör başlangıç akımı her açılışta Smart-Boost devresini zorlar. Uzun vadeli buzdolabı yedeklemesi için P1800 daha uygun bir seçimdir.</li>
  <li>Uygulama üzerinden izleme ve kontrol özelliği bu modelde bulunmamaktadır (P1800 ve P3200'de Wi-Fi/Bluetooth desteği standarttır).</li>
</ul>

<p><strong>Kimin için uygundur:</strong> Stüdyo veya 1+1 dairede yaşayan, ev ofisten çalışan, hafta sonu kamp / kısa kaçamaklar planlayan, taşınabilirlik (6.55 kg) önceliği olan kullanıcılar için mantıklı bir giriş seçimidir.</p>

<p><a href="/urun/512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800">P800 ürün sayfası →</a></p>

<h2>P1800 — Ev Yedeklemesinin Denge Noktası</h2>

<p>Saha verilerimize göre taşınabilir güç kaynağı satışlarımızda en yüksek paya sahip model P1800'dür. Bunun temel nedeni; 1024Wh kapasite, 1800W sürekli çıkış ve 12.7 kg ağırlık kombinasyonunun ev yedeklemesinin en sık karşılaşılan ihtiyaç profilini karşılamasıdır.</p>

<p>P1800'ün <strong>3600W pik gücü</strong>, ev tipi buzdolabının kompresör başlangıç akımını (tipik olarak 1500–1800W anlık sıçrama), saç kurutma makinesini veya elektrikli su ısıtıcısını güvenle kaldırır. 1800W sürekli çıkış, çamaşır makinesi gibi yüksek güçlü beyaz eşyaların düşük sıcaklık programlarını dahi destekler.</p>

<p>UPS/EPS özelliği, ürünün sık tercih edilmesindeki ikinci kritik faktördür. Cihaz AC prize bağlıyken, şebeke kesildiğinde yaklaşık 10 milisaniyelik bir geçiş süresiyle dahili bataryadan beslemeye geçer. Bu süre, masaüstü bilgisayar oturumunun kesintisiz devam etmesi ve modem/ONT cihazlarının yeniden başlamaması için yeterlidir. Böylece klasik bir UPS (kesintisiz güç kaynağı) görevini, çok daha yüksek kapasite ve daha fazla AC priz sayısıyla karşılar.</p>

<p>Sık karşılaştığımız tipik kullanım senaryosu; doğalgazlı kombi, modem, buzdolabı ve ana aydınlatma devresinin ortak bir hatta toplanıp P1800 üzerinden yedeklenmesidir. Bu konfigürasyonda 6–8 saatlik bir kesinti sonrasında bile batarya üzerinde kullanılabilir rezerv kalmakta ve olası ikinci kesinti için bir marj sağlanmaktadır.</p>

<p><strong>Segment sınırları ve dikkat edilmesi gerekenler:</strong></p>
<ul>
  <li>9000 BTU inverter klima başlatılabilir ancak sürekli çalışma süresi yaklaşık 1 saat ile sınırlıdır. Uzun süreli klima kullanımı için P3200 veya SH4000 daha uygundur.</li>
  <li>12.7 kg ağırlık ve tekerleksiz tasarım, ürünün günlük olarak farklı mekânlar arasında taşınmasını zorlaştırabilir; sabit konumlu ev yedeklemesi için ideal, günlük taşıma gerektiren saha kullanımı için orta düzey uygundur.</li>
  <li>Yüksek hızda USB-C PD şarj gerektiren iki cihazın eşzamanlı desteklenmesi sınırlıdır (C1 portu 100W, diğer USB-C portlar 30W).</li>
</ul>

<p><strong>Kimin için uygundur:</strong> 2+1 veya 3+1 hanede yaşayan, ev ofis çalışan, doğalgazlı kombi kullanan, kesinti sıklığı orta-yüksek olan bölgelerdeki müşteriler için en dengeli seçim. Ayrıca karavan ve hafta sonu kamp kullanımıyla ev yedeklemesinin birlikte düşünüldüğü ikili senaryolar için uygun bir çözümdür.</p>

<p><a href="/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800">P1800 ürün sayfası →</a></p>

<h2>P3200 — Yüksek Kapasite, Yazlık ve Klima Kullanım Senaryoları</h2>

<p>P3200, ürün gamımızın flagship taşınabilir modelidir. 2048Wh kapasite, 3200W sürekli çıkış ve 6400W pik gücüyle; ev tipi yüksek güçlü beyaz eşyayı, 9000 BTU inverter klimayı, elektrikli el aletlerini ve çoklu cihaz senaryolarını destekler. 4 AC prizi, aynı anda dört farklı cihazın doğrudan bağlanmasına imkân verir (P800 ve P1800'de 2'şer AC priz bulunur).</p>

<p>Ağırlık, bu segmente geçişte dikkat edilmesi gereken en önemli fiziksel farktır: 24.35 kg. Bu ağırlık tekerlek ve teleskopik kolla taşınabilir kılınmıştır; ancak ürünün farklı katlar arasında sürekli taşınması değil, belirli bir konumda sabit veya yarı-sabit kullanımı tasarlanan kullanım modelini yansıtır.</p>

<p>P3200'ün P1800'e göre ikinci kritik farkı <strong>1000W solar giriş kapasitesidir</strong>. İki adet <a href="/urun/tasinabilir-gunes-paneli-400w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp400">SP400 (400W)</a> panelinin paralel bağlantısıyla güneşli koşullarda 700–800W gerçek giriş elde edilebilir; bu sayede ürün güneşli bir günde yaklaşık 3 saatte tam dolum yapar. Yazlık, bağ evi, tarım arazisi ve off-grid kullanım senaryolarında bu özellik belirleyicidir.</p>

<p>Saha gözlemlerimize göre P3200'ün en başarılı kullanım senaryoları şunlardır: yaz sezonunda klima + buzdolabı + aydınlatma yüklerinin tek bir cihaz üzerinden beslenmesi; elektrikli el aleti kullanan profesyonellerin saha enerjisi; sık ve uzun süreli kesinti yaşayan büyük ailelerin tam ev yedeklemesi (elektrikli ısıtıcı/kombi hariç).</p>

<p><strong>Segment sınırları ve dikkat edilmesi gerekenler:</strong></p>
<ul>
  <li>24.35 kg ağırlık, ürünün sık sık farklı mekânlar arasında taşınmasını zorlaştırır. Taşınabilirlik ön planda olan kullanım senaryoları için P1800 + <a href="/urun/tasinabilir-gunes-paneli-200w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp200">SP200</a> kombinasyonu alternatif olarak değerlendirilebilir.</li>
  <li>Ürün dahili powerbank, jump-starter (araç akü takviye) ve LED fener modülü içerir. Bu özellikler, tek bir cihazla birden fazla saha ihtiyacına yanıt verilmesini sağlar.</li>
  <li>Uygulama üzerinden cihaz bazında anlık tüketim izleme desteklenmektedir; enerji yönetimi ve tüketim analizi yapmak isteyen kullanıcılar için fayda sağlar.</li>
</ul>

<p><strong>Kimin için uygundur:</strong> Sık ve uzun süreli elektrik kesintisi yaşayan büyük aileler, karavan ciddi kullanım senaryoları, yazlık ve bağ evi sahipleri, klima kullanan haneler, elektrikli el aleti gerektiren saha profesyonelleri için uygundur.</p>

<p><a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200 ürün sayfası →</a></p>

<h2>Karar Matrisi: Siz Hangisiniz?</h2>

<h3>Evim küçük, sadece modem ve laptop yedeklemek istiyorum</h3>
<p><strong>P800.</strong> Bu senaryoda P1800 almak için harcayacağınız paranın büyük kısmı boşa gider. P800'ün 512Wh'ı, modem+laptop için bir gecelik bile yeter.</p>

<h3>Ev üç oda, doğalgaz kombi, buzdolabını korumak kritik</h3>
<p><strong>P1800.</strong> Hem uygulama hem UPS hem de buzdolabı başlangıç akımını tolere eden pik güç bir arada. "Keşke P3200 alsaydım" en az gelen model bu.</p>

<h3>Elektrikli kombim var ve sık kesinti yaşıyorum</h3>
<p><strong>P3200 tek başına yetmez.</strong> Elektrikli kombi saatte 1500–2000W sürekli çeker; P3200 bile <1.5 saat verir. <a href="/urun/5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000">SH4000</a> + B5120 genişletme kombinasyonuna bakmalısınız.</p>

<h3>Karavanım var, haftada bir kullanıyoruz</h3>
<p><strong>P1800.</strong> Ağırlık/kapasite dengesi, buzdolabı + mini fan + aydınlatma için bir hafta sonu yeterli. SP200 solar paneli ile birleştirirseniz haftanın tamamı güneşle geçer.</p>

<h3>Yazlık, klima şart, yatırım bir kerelik olsun</h3>
<p><strong>P3200 + SP400.</strong> Bu kombinasyon klasik yazlık senaryosunun en dengeli çözümü. Güneşli 4–5 saat, klima serinletmesi 2–3 saat, aydınlatma ve küçük cihazlar sınırsız.</p>

<h2>Sıkça Sorulan Sorular</h2>

<h3>P1800 yerine iki tane P800 alsam olmaz mı?</h3>
<p>Kapasite olarak yakın (2×512Wh = 1024Wh) ama AC çıkışta sorun var. P800 800W sürekli verir, iki cihazı paralel bağlayamazsınız. Ayrıca pik güç P800'de 1200W ile sınırlı, P1800'de 3600W. Buzdolabı/büyük motor başlangıcı için bu kritik. Teknik olarak P1800 tek başına daha iyi bir seçim.</p>

<h3>P3200 ileride yetmezse ne yaparım?</h3>
<p>P3200 tek başına genişletme desteği sunmuyor. Eğer ileride tam ev yedekleme gelecekse P3200'ü elden çıkarıp SH4000'e geçmek daha mantıklı. Bu yüzden "ileride büyütmeyi düşünüyorum" diyen müşterilerimizi doğrudan SH4000'e yönlendiriyoruz.</p>

<h3>Kargo ile gelirken nasıl geliyor? Bataryayı söküyor muyum?</h3>
<p>Hayır, batarya entegre geliyor. Tamponlu strafor kutu içinde, pek çok müşterimiz "depo gibi ambalajlı" dedi. Kurulum yok, kutudan çıkarıyorsunuz, prize takıyorsunuz, 5 dakikada dolum başlıyor.</p>

<h3>Yanında kablo geliyor mu yoksa ekstra mı almam gerekiyor?</h3>
<p>Üç modelde de AC şarj kablosu, araç şarj kablosu ve XT60→MC4 solar dönüştürücü kablo geliyor. Solar paneli ayrıca alırsanız panelin kendi MC4 kablosu olur, bizim dönüştürücüye taktığınızda tak-kullan işler.</p>

<h3>Cihazı uzun süre kullanmasam ne yapmalıyım?</h3>
<p>3 ay veya daha uzun süre kullanılmayacaksa ideal saklama şarjı %50–60 arasıdır. Kapatıp kuru, oda sıcaklığında bir yerde saklayın. Altı ayda bir şarjı kontrol edin; LiFePO4'ün kendi kendini deşarj oranı çok düşük olduğu için zaten pek düşmez.</p>

<h2>Sonuç</h2>

<p>Üç modelin de LiFePO4 bataryası ve 4000+ döngü ömrü aynı. Farkı yaratan, sizin <strong>aynı anda</strong> kaç watt çekmek istediğiniz ve <strong>toplam kaç saat</strong> çalıştırmak istediğinizdir. Önce cihazlarınızı bir kenara yazın, toplamı bulun, ondan sonra model seçin. Yardım isterseniz <a href="/guc-hesaplayici">Güç Hesaplayıcı</a> bir dakikada öneri çıkarır ya da <a href="/iletisim">bize yazın</a>, sizin için hesaplayalım.</p>`,
  },
];

async function main() {
  console.log("🚀 Blog Seed 01 başlıyor...\n");

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
        publishedAt: undefined, // ilk yayın tarihini bozma
      },
    });

    console.log(`✅ ${blog.title}`);
  }

  console.log("\n🎉 Blog Seed 01 tamamlandı.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Hata:", e);
  prisma.$disconnect();
  process.exit(1);
});
