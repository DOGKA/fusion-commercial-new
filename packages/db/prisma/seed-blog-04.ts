/**
 * FusionMarkt Blog Seed — 04
 * 07) UPS mi Power Station mı? Elektrik Kesintisi İçin Hangisi?
 * 08) Elektrik Kesintisinde Hangi Cihaz İçin Kaç Wh Gerekir?
 *
 * Kullanım:
 *   cd packages/db && npx tsx prisma/seed-blog-04.ts
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
  // 07 — UPS mi POWER STATION mı?
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "ups-mi-power-station-mi",
    title: "UPS mi Power Station mı? Elektrik Kesintisi İçin Hangisi?",
    excerpt:
      "Klasik UPS cihazı ile taşınabilir güç kaynağı (power station) arasındaki teknik farklar, kapasite, geçiş süresi, dalga formu ve maliyet karşılaştırması.",
    category: "Karşılaştırma",
    tags: [
      "UPS mi power station mı",
      "UPS power station karşılaştırma",
      "elektrik kesintisi UPS",
      "modem UPS",
      "bilgisayar UPS",
    ],
    metaTitle: "UPS mi Power Station mı? Karşılaştırma ve Seçim Rehberi",
    metaDescription:
      "UPS ile power station arasındaki 8 teknik fark, kapasite-fiyat analizi ve hangi senaryoda hangisinin tercih edilmesi gerektiğine dair detaylı rehber.",
    metaKeywords: [
      "UPS vs power station",
      "UPS mi power station mı",
      "taşınabilir güç kaynağı UPS",
      "kesintisiz güç kaynağı",
      "ev UPS",
    ],
    content: `<p>Elektrik kesintisine karşı koruma gerektiğinde iki farklı teknoloji öne çıkmaktadır: klasik UPS (Uninterruptible Power Supply / Kesintisiz Güç Kaynağı) cihazları ve taşınabilir güç kaynakları (power station). Her ikisi de şebeke kesildiğinde yedek bataryadan besleme yapar, ancak tasarım felsefeleri, kapasiteleri, dalga formları ve kullanım amaçları birbirinden belirgin biçimde farklıdır.</p>

<p>Bu yazıda iki sistemi teknik, pratik ve maliyet açısından karşılaştırıyor, hangi kullanım senaryosunda hangi çözümün tercih edilmesi gerektiğini açıklıyoruz.</p>

<blockquote>
<strong>Özet:</strong> Klasik UPS cihazları; sunucu, masaüstü bilgisayar ve kritik elektroniklerin 5–15 dakikalık bir süre içinde düzenli kapatılmasını sağlayacak kısa süreli besleme için tasarlanmıştır. Kapasiteleri düşüktür ve kesintisiz uzun çalışmaya uygun değildir. Power station ürünleri ise hem UPS işlevini (10–20 ms geçiş süresi) hem de yüksek kapasiteyi (500–5000+ Wh) tek ünitede sunar; saatlerce süren kesintileri yönetebilir. Ev, ofis ve küçük işletme senaryolarında power station çoğu durumda daha uygun bir çözümdür.
</blockquote>

<h2>UPS Nedir?</h2>

<p>Klasik UPS cihazları; AC girişindeki şebeke gerilimini filtreleyip cihazlara aktaran, şebeke kesildiğinde ise dahili batarya üzerinden besleme yapan sistemlerdir. Üç ana tipte üretilir:</p>

<ul>
  <li><strong>Offline (standby) UPS:</strong> Normalde şebekeyi doğrudan geçirir; kesinti olduğunda bataryaya geçer. Geçiş süresi 4–8 ms. Düşük fiyatlı, ev/küçük ofis kullanımı için.</li>
  <li><strong>Line-interactive UPS:</strong> AVR (Automatic Voltage Regulation) devresi ile gerilim dalgalanmalarını düzeltir. Orta fiyat segmenti, ofis ve küçük sunucu odası için yaygındır.</li>
  <li><strong>Online (double-conversion) UPS:</strong> Şebeke geriliminin tamamı sürekli olarak DC'ye çevrilir, ardından invertör ile yeniden AC üretilir. Kesinti geçiş süresi sıfıra yakındır (≤1 ms). Veri merkezi ve hassas sanayi uygulamalarında tercih edilir; maliyeti en yüksek tip.</li>
</ul>

<p>UPS cihazlarının kapasitesi <strong>VA (Volt-Amper)</strong> ile ifade edilir ve genellikle 600 VA – 3000 VA aralığındadır. Watt karşılığı, güç faktörüne göre bu değerin %60–90'ıdır. Örneğin 1000 VA bir UPS ortalama 600–700 W yüke yaklaşık 5–10 dakika enerji verir. Daha uzun süre için harici batarya modülü eklenmesi gerekir.</p>

<h2>Power Station Nedir?</h2>

<p>Taşınabilir güç kaynağı; LiFePO4 batarya, BMS, saf sinüs invertör ve çoklu giriş/çıkış portlarını tek gövdede birleştiren entegre bir enerji ünitesidir. Modern ürünlerde UPS/EPS fonksiyonu standart olarak yer almakta ve klasik bir UPS'e eşdeğer veya daha iyi performans sergilemektedir. Ayrıntılı anlatım için <a href="/blog/power-station-nedir-jenerator-farki">Power Station Nedir?</a> yazımızı inceleyebilirsiniz.</p>

<h2>8 Teknik Fark</h2>

<table>
  <thead>
    <tr>
      <th>Kriter</th>
      <th>Klasik UPS (Line-interactive)</th>
      <th>Power Station</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Batarya Tipi</td><td>VRLA / AGM (tipik)</td><td>LiFePO4</td></tr>
    <tr><td>Batarya Ömrü</td><td>2–4 yıl (500 döngü civarı)</td><td>10+ yıl (4000+ döngü)</td></tr>
    <tr><td>Tipik Kapasite</td><td>300–2000 Wh eşdeğeri</td><td>500–5000+ Wh</td></tr>
    <tr><td>Tipik Yedekleme Süresi</td><td>5–15 dakika</td><td>Saatler (yüke göre 2–50+ saat)</td></tr>
    <tr><td>Geçiş Süresi (kesinti anı)</td><td>4–8 ms</td><td>10–20 ms</td></tr>
    <tr><td>Dalga Formu</td><td>Modifiye sinüs (çoğu model)</td><td>Saf sinüs</td></tr>
    <tr><td>Şarj Kaynakları</td><td>Yalnız AC</td><td>AC + Solar + Araç (12V)</td></tr>
    <tr><td>Taşınabilirlik</td><td>Sabit (rack / masa altı)</td><td>Taşınabilir</td></tr>
    <tr><td>Çoklu Amaç</td><td>Yalnız kesinti koruması</td><td>Kesinti + kamp + karavan + saha</td></tr>
  </tbody>
</table>

<h2>Farkların Kullanım Açısından Anlamı</h2>

<h3>Kapasite ve Süre</h3>

<p>UPS cihazlarının temel tasarım amacı, şebeke kesildiğinde sunucu veya bilgisayarın "düzgün şekilde kapanması" için gerekli olan 5–15 dakikalık süreyi sağlamaktır. Uzun süreli bir kesintide (örneğin 2 saat) klasik UPS'in rolü sınırlıdır. Ev ortamında modem + mesh Wi-Fi için satın alınan 800 VA'lık bir UPS, 6 saatlik bir kesintinin belki ilk yarım saatinde dayanır.</p>

<p>Power station ise tasarımı gereği uzun süreli kullanım için optimize edilmiştir. <a href="/urun/p800">P800</a> sınıfı bir ürün, modem + mesh Wi-Fi kombinasyonunu (ort. 20W) yaklaşık 23 saat çalıştırabilir. Bu süre aynı ürünle laptop, TV, aydınlatma eklenmiş olarak bile 5–6 saate ulaşır.</p>

<h3>Batarya Ömrü</h3>

<p>Klasik UPS ürünlerinde kullanılan VRLA/AGM kurşun-asit bataryalar tipik olarak 2–4 yılda değişim gerektirir. Bu süre, cihazın kendi ömründen kısa olabilir; kullanıcı genellikle 3 yıl sonunda ya ürünü komple yenilemek ya da batarya değişimi yapmak zorunda kalır. Batarya değişimi ürünün %40–60'ı kadar maliyet oluşturabilir.</p>

<p>Power station ürünlerindeki LiFePO4 bataryalar 4000+ tam döngü ömür sunar. Haftada 3 tam şarj-deşarj senaryosunda bile teorik olarak 25 yıllık kullanım sağlarlar. Gerçek kullanımda 10 yıl sonunda kapasite %80 civarında kalır ve ürün hâlâ kullanılabilir durumdadır.</p>

<h3>Dalga Formu</h3>

<p>Ev ve ofis tipi line-interactive UPS cihazlarının büyük bir kısmı <strong>modifiye sinüs</strong> çıkışı verir. Masaüstü bilgisayar, modem gibi güç kaynağı tabanlı cihazlarla sorun yaratmaz. Ancak buzdolabı kompresörü, bazı laptop adaptörleri, tıbbi cihazlar (CPAP) ve hassas elektronikler modifiye sinüsü "temiz" algılamayabilir; uzun vadede bileşen ömrü kısalabilir ya da cihaz anlık olarak çalışmayabilir. Online UPS modelleri saf sinüs üretir ancak fiyatı ev/ofis segmentinin çok üzerindedir.</p>

<p>Power station ürünlerinde saf sinüs çıkış standart olarak sunulur. Buzdolabı, CPAP, laptop, TV, akıllı saat şarjı gibi hassas yüklerde sorun yaşanmaz.</p>

<h3>Çoklu Amaç ve Esneklik</h3>

<p>UPS, tek amaçlı bir cihazdır: şebeke kesintisinde kısa süreli koruma. Kamp, karavan, saha, afet çantası gibi farklı senaryolarda kullanılamaz. Power station ise aynı yatırımla hem ev yedeklemesi, hem kamp enerjisi, hem karavan enerjisi, hem de saha kullanımı sunar. Bu çok-amaçlılık özellikle kesintinin nadir olduğu ancak yılda birkaç kez kampa çıkılan haneler için önemli bir avantajdır.</p>

<h2>Geçiş Süresi: 8 ms ile 20 ms Arasındaki Fark Pratikte Ne İfade Eder?</h2>

<p>UPS üreticileri geçiş süresi tartışmasını öne çıkarır çünkü teorik olarak 4–8 ms'lik süre 10–20 ms'den kısadır. Ancak ev ve küçük ofis donanımlarında bu fark pratikte anlamlı değildir; masaüstü bilgisayarlar, modemler ve TV'ler 20 ms'lik bir kesintiyi farketmez ve yeniden başlamaz.</p>

<p>Fark asıl olarak hassas sanayi ekipmanları, yüksek frekanslı switch-mode güç kaynakları ve bazı tıbbi cihazlarda hissedilir. Bu senaryolarda online double-conversion UPS tek çözümdür. Normal ev ve ofis kullanımında ise power station'ın 10–20 ms geçiş süresi yeterli ve güvenli kabul edilir.</p>

<h2>Maliyet Perspektifi</h2>

<p>Klasik line-interactive bir UPS (1000 VA civarı) görece düşük bir başlangıç maliyeti sunar. Ancak batarya değişim gereksinimi, kapasite kısıtlaması ve tek amaçlı olması, uzun vadeli toplam sahip olma maliyetini yukarı çeker. 5 yıllık pencere bakıldığında; kurşun-asit batarya 1–2 kez yenilenmiş olur ve ürün ikinci değişim noktasında zaten yenilenmesi gerekir.</p>

<p>Power station ürünü, örneğin P800, başlangıçta daha yüksek bir bedeldir ancak 10+ yıllık ömrü, çok-amaçlılığı ve saha kullanımındaki esnekliği dikkate alındığında yıllık ortalama maliyeti klasik UPS ile benzer veya altındadır. Üstelik ikinci bir kamp/karavan/afet çantası yatırımına gerek kalmaz.</p>

<h2>Hangi Senaryoda Hangisi?</h2>

<h3>Veri Merkezi, Sunucu Odası, Sanayi Ekipmanı</h3>
<p><strong>Online double-conversion UPS.</strong> Profesyonel senaryolarda standart, güvenilir ve gerekli çözüm. Power station bu segmente alternatif değildir.</p>

<h3>Masaüstü Bilgisayar ve Ofis (5–15 Dakikalık Koruma)</h3>
<p><strong>Klasik line-interactive UPS yeterlidir.</strong> Dosyaların kaydedilip bilgisayarın düzgün kapatılması için bu süre yeterlidir. Kesintilerin uzun sürdüğü bir bölgede çalışıyorsanız power station'a yönelin.</p>

<h3>Ev Kesinti Yedeklemesi (Modem + Buzdolabı + Aydınlatma + TV)</h3>
<p><strong>Power station.</strong> Klasik UPS bu yükü kaldırmaz; power station hem kapasite hem dalga formu hem de çok-amaçlılık açısından doğru seçimdir. <a href="/urun/p1800">P1800</a> ev ihtiyaçlarının büyük çoğunluğunu karşılar.</p>

<h3>Küçük İşletme / Kafe / Mağaza</h3>
<p><strong>Power station veya hybrid kurulum.</strong> POS cihazı + modem + aydınlatma tipik yüktür. 4 saatlik kesintiyi kaldırabilecek power station (P1800/P3200) satış sürekliliğini korur ve akıllı telefon üzerinden izlenebilir.</p>

<h3>Tıbbi Cihaz Kullanıcısı (CPAP, Nebulizatör, Sıvı Pompası)</h3>
<p><strong>Power station (saf sinüs).</strong> CPAP gibi cihazlar dalga formuna hassastır; klasik UPS'in modifiye sinüsü bazı modellerde sorun yaratabilir. Power station saf sinüs + yüksek kapasite ile güvenli bir çözümdür.</p>

<h3>Kamp / Karavan / Afet Hazırlığı</h3>
<p><strong>Power station.</strong> UPS kesinlikle bu senaryolar için tasarlanmamıştır.</p>

<h2>Hybrid Kullanım: UPS + Power Station Birlikte</h2>

<p>Bazı ileri düzey kurulumlarda iki sistem birlikte kullanılır. Sunucu ve kritik elektronikler doğrudan profesyonel bir UPS'e bağlanır; power station ise power station'ın UPS özelliğiyle modem, buzdolabı, aydınlatma gibi uzun süreli yükleri besler. Böylece kritik sistemler yüksek kaliteli online UPS'in ≤1 ms geçiş süresiyle korunurken, uzun süreli kesintide evin geri kalanı da power station ile ayakta kalır.</p>

<h2>Sıkça Sorulan Sorular</h2>

<h3>Masaüstü PC'me direkt power station bağlayabilir miyim?</h3>
<p>Evet. Power station'ı AC prize takıp masaüstü PC'nizi power station'ın AC çıkışına bağlayın. Normal çalışmada şebekeden geçiş yapılır ve PC normal elektrik alır; kesinti olduğunda 10–20 ms geçişle batarya beslemesine geçer. PC oturumu kesilmez, kaydedilmemiş çalışma kaybolmaz.</p>

<h3>Power station'ın UPS modu her zaman açık mı?</h3>
<p>Evet, UPS/EPS fonksiyonu varsayılan olarak etkindir. P1800 ve P3200 uygulamasında bazı kullanım modları değiştirilebilir (ör. saf UPS modu, ECO modu). Modem ve PC için varsayılan mod yeterlidir.</p>

<h3>Power station ile beraber ek UPS gerekiyor mu?</h3>
<p>Ev ve küçük ofis senaryolarında gerekmez. Power station kendi başına hem UPS hem de uzun süreli yedekleme görevini üstlenir. Kritik sunucu barındıran iş yerlerinde ise ikisinin birlikte kullanımı (hybrid) önerilir.</p>

<h3>Modemime ayrı küçük UPS taktım, power station'a ihtiyacım var mı?</h3>
<p>Yalnızca modemi koruyan küçük bir UPS size sadece internet sürekliliği sağlar. Kesinti uzun sürerse ve evin diğer cihazları (aydınlatma, buzdolabı, TV) etkilenirse yine sıkıntı yaşarsınız. Power station, modem dahil evin birkaç temel ihtiyacını tek ünitede birleştirerek daha kapsayıcı bir çözüm sunar.</p>

<h3>Klasik UPS'imi tamamen değiştirmem gerekiyor mu?</h3>
<p>Zorunlu değil. Mevcut UPS'iniz masaüstü PC ve modem için doğru çalışıyorsa bırakabilirsiniz. Ek olarak bir power station satın alıp uzun süreli kesinti senaryosu için diğer cihazları (buzdolabı, aydınlatma, TV) besleyebilirsiniz. İki sistem çakışmadan birlikte çalışır.</p>

<h2>Sonuç</h2>

<p>UPS ve power station aslında birbirine rakip değil, farklı tasarım hedefleriyle üretilmiş iki farklı teknolojidir. Klasik UPS; kısa süreli, kritik IT yüklerinin düzgün kapatılması için. Power station; uzun süreli ev yedeklemesi, saha enerjisi ve çok-amaçlı kullanım için. Çoğu ev ve küçük ofis senaryosunda power station tek başına hem UPS işlevini hem de daha geniş bir kullanım alanını kapsar.</p>

<p>Kendi kullanım profilinize uygun kapasiteyi belirlemek için <a href="/guc-hesaplayici">Güç Hesaplayıcı</a>'yı kullanabilir veya <a href="/kategori/tasinabilir-guc-kaynaklari">taşınabilir güç kaynağı modellerini</a> inceleyebilirsiniz.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // 08 — KAÇ WH GEREKİR (CİHAZ BAZLI)
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "elektrik-kesintisinde-kac-wh-gerekir",
    title: "Elektrik Kesintisinde Hangi Cihaz İçin Kaç Wh Gerekir?",
    excerpt:
      "Modem, laptop, TV, buzdolabı, CPAP ve kombi için gerçek enerji ihtiyacı. Cihaz bazlı Wh hesapları ve kapasite seçim rehberi.",
    category: "Rehber",
    tags: [
      "kaç Wh gerekir",
      "cihaz güç tüketimi",
      "modem Wh",
      "CPAP Wh",
      "buzdolabı Wh",
      "kombi Wh",
    ],
    metaTitle: "Kaç Wh Güç Kaynağı Gerekir? Cihaz Bazlı Hesap Rehberi (2026)",
    metaDescription:
      "Modem, laptop, TV, buzdolabı, CPAP, kombi için kaç Wh power station gerekir? Gerçek güç tüketimi ve kapasite seçim rehberi.",
    metaKeywords: [
      "kaç Wh güç kaynağı",
      "cihaz bazlı Wh hesabı",
      "modem için power station",
      "CPAP için güç kaynağı",
      "buzdolabı Wh hesabı",
    ],
    content: `<p>Taşınabilir güç kaynağı seçiminde en sık yapılan hata, kapasite seçiminin ihtiyacın önüne geçmesidir. Kullanıcılar çoğu zaman "büyük bir model alayım, nasıl olsa yeter" veya "küçüğü alayım, gerekirse başka bir tane alırım" yaklaşımıyla karar verirler. Her iki yaklaşım da ya fazla yatırıma ya da yetersiz kapasiteye yol açar.</p>

<p>Doğru yaklaşım cihaz bazında enerji ihtiyacını hesaplamaktan geçer. Bu yazıda Türkiye'deki tipik ev ve ofis cihazlarının gerçek güç tüketimlerini, hangi kapasitenin ne kadar süre çalışma sağladığını ve toplam Wh ihtiyacının nasıl hesaplandığını açıklıyoruz.</p>

<blockquote>
<strong>Özet formül:</strong> Bir cihazın güç kaynağında çalışma süresi, <strong>Kapasite (Wh) × 0.9 ÷ Cihaz ortalama gücü (W)</strong> ile bulunur. Buradaki 0.9 katsayısı invertör kaybını (yaklaşık %10) temsil eder. Toplam ihtiyaç için cihaz güçlerini toplar, beklenen kesinti süresiyle çarpar ve %15 güvenlik marjı eklersiniz.
</blockquote>

<h2>Cihaz Cihaz Gerçek Tüketim</h2>

<h3>Modem + Router + Mesh Wi-Fi</h3>
<p>Fiber modem (ONT): 8–12W. Ana router: 8–12W. Mesh nokta (opsiyonel): her biri 5–10W. Toplam ev internet altyapısı ortalama <strong>15–25W</strong> çeker. Bu ihtiyaç düşük olmasına rağmen modern hanede kritik öneme sahiptir: iletişim, çağrı, uzaktan çalışma, güvenlik kameraları ve akıllı ev cihazları internete bağımlıdır.</p>

<h3>Dizüstü Bilgisayar</h3>
<p>Tipik iş laptopu (Intel/AMD orta seviye): <strong>40–65W</strong>. MacBook Air: 30W civarı. Oyun laptopu: 120–240W (yüksek yükte daha fazla). Şarj sürecinde pik tüketim daha yüksek olabilir; power station'ın sürekli çıkış kapasitesinin laptop adaptörünün nominal değerinden en az %20 fazla olması tavsiye edilir.</p>

<h3>Masaüstü Bilgisayar</h3>
<p>Standart ofis PC: 60–100W. Profesyonel/oyun PC (orta sınıf GPU ile): 200–400W. Render/high-end oyun sistemi: 500–800W. Monitörler ayrı: LED monitör 20–40W, 27" 4K monitör 40–60W.</p>

<h3>LED Televizyon</h3>
<p>32": 25–40W. 42": 50–80W. 55": 80–130W. 65" 4K: 130–200W. Ekran boyutu ve parlaklık ayarı tüketimi doğrudan etkiler; gece modu veya düşük parlaklık kullanımında değerler %30 düşebilir.</p>

<h3>CPAP Cihazı</h3>
<p>Uyku apnesi kullanıcıları için kritik bir cihazdır. Standart kullanımda (ısıtmalı nemlendirici kapalı): <strong>30–40W</strong>. Isıtmalı nemlendirici açık: 60–90W. Isıtmalı hortum dahil: 80–120W. CPAP kullanıcıları, kesinti anında kesintisiz beslemenin sağlık açısından kritik olduğu bir gruptur; UPS özellikli power station burada belirleyici bir çözümdür.</p>

<h3>Mini Buzdolabı (Karavan / Ofis Tipi)</h3>
<p>50–80L kapasiteli mini buzdolabı: çalışırken 60W, ortalama tüketim döngüsel olduğu için <strong>25–35W</strong>. Kamp/karavan tipi (kompresörlü) 12V buzdolabı: 40–60W çalışma, ortalama 20–30W.</p>

<h3>Ev Tipi Buzdolabı</h3>
<p>A++ / A+++ sınıfı: çalışırken 100–180W, döngüsel ortalama <strong>50–70W</strong>. Kompresör başlangıç akımı 1500–1800W anlık sıçrama yapar. Bu anlık sıçrama, seçilecek power station'ın <strong>pik güç</strong> kapasitesinin en az 1800W olmasını gerektirir. P800'ün 1200W Smart-Boost limiti teorik olarak yeterli görünse de uzun vadede P1800 ve üstü güvenlidir.</p>

<h3>Doğalgazlı Kombi</h3>
<p>Türkiye'deki evlerde yaygın olan doğalgazlı kombiler, ısıyı doğalgazdan alır; elektrik yalnızca sirkülasyon pompası, brülör fanı ve kontrol kartı için kullanılır. Ortalama tüketim <strong>80–120W</strong>. İlk ateşleme anında fan 200–300W'a çıkabilir; ancak bu süre saniyenin altındadır ve standart power station'lar sorunsuz karşılar.</p>

<h3>Elektrikli Kombi / Elektrikli Termosifon</h3>
<p>Elektrikli kombi: 1500–2000W sürekli. Elektrikli termosifon: 1500–3000W (kapasiteye göre). Bu cihazlar için taşınabilir power station pratik bir çözüm değildir; ev enerji sistemi (<a href="/sh4000">SH4000</a> gibi) veya sabit solar kurulumu gereklidir.</p>

<h3>LED Aydınlatma</h3>
<p>Oda aydınlatması (2–3 ampul): 15–30W. Dolaylı LED şerit: 10–25W. Odabaşı lamba: 5–10W. Evin ana aydınlatma yükü 40–80W aralığında kalır; bu ihtiyaç düşük Wh ile uzun süre karşılanır.</p>

<h3>Klima</h3>
<p>9000 BTU inverter klima: 700–900W sürekli, 1500–2000W pik. 12000 BTU: 1100–1400W sürekli. 18000 BTU: 1500–2000W sürekli. Klima uzun süreli kullanımda enerji ihtiyacını ciddi biçimde artırır; kapasite seçiminde belirleyici faktördür. Ayrıntılı analiz için <a href="/blog/power-station-ile-klima-calisir-mi">Power Station ile Klima Çalışır mı?</a> yazımıza bakınız.</p>

<h3>Mutfak Cihazları</h3>
<p>Mikrodalga (800W nominal): 1100–1300W çekim. Kettle (su ısıtıcı): 1500–2200W. Kahve makinesi: 600–1500W. Tost makinesi: 800–1200W. Ekmek kızartıcı: 800–1100W. Bu cihazlar kısa süreli kullanım için tasarlanır; toplam Wh ihtiyacı zaman bazında düşüktür ancak pik güç yüksektir, 1800W+ invertör gerektirir.</p>

<h3>Küçük Elektronikler</h3>
<p>Akıllı telefon şarjı: 15–25W (başına ort. 10Wh enerji). Tablet: 20–30W. Akıllı saat: 5W. Bluetooth hoparlör: 10–20W. Günlük şarj ihtiyaçları toplamı 50–100Wh'ı nadiren aşar.</p>

<h2>Cihaz Bazlı Çalışma Süresi Tablosu</h2>

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
    <tr><td>Modem + Router</td><td>20W</td><td>~23 saat</td><td>~46 saat</td><td>~92 saat</td><td>~230 saat</td></tr>
    <tr><td>Dizüstü bilgisayar</td><td>55W</td><td>~8 saat</td><td>~17 saat</td><td>~34 saat</td><td>~84 saat</td></tr>
    <tr><td>Masaüstü PC (orta)</td><td>250W</td><td>~1.8 saat</td><td>~3.7 saat</td><td>~7.4 saat</td><td>~18 saat</td></tr>
    <tr><td>LED TV (42")</td><td>70W</td><td>~6.5 saat</td><td>~13 saat</td><td>~26 saat</td><td>~66 saat</td></tr>
    <tr><td>CPAP (ısıtıcı kapalı)</td><td>35W</td><td>~13 saat</td><td>~26 saat</td><td>~52 saat</td><td>~132 saat</td></tr>
    <tr><td>CPAP (ısıtıcı açık)</td><td>75W</td><td>~6 saat</td><td>~12 saat</td><td>~24 saat</td><td>~61 saat</td></tr>
    <tr><td>Mini buzdolabı</td><td>30W ort.</td><td>~15 saat</td><td>~31 saat</td><td>~61 saat</td><td>~154 saat</td></tr>
    <tr><td>Ev buzdolabı (A++)</td><td>60W ort.</td><td>~7.5 saat</td><td>~15 saat</td><td>~30 saat</td><td>~77 saat</td></tr>
    <tr><td>Doğalgazlı kombi</td><td>100W</td><td>~4.5 saat</td><td>~9 saat</td><td>~18 saat</td><td>~46 saat</td></tr>
    <tr><td>LED aydınlatma (oda)</td><td>15W</td><td>~30 saat</td><td>~61 saat</td><td>~123 saat</td><td>~307 saat</td></tr>
    <tr><td>Klima 9000 BTU inverter</td><td>800W</td><td>Çalışmaz*</td><td>~1 saat</td><td>~2.3 saat</td><td>~5.7 saat</td></tr>
    <tr><td>Mikrodalga (800W nominal)</td><td>1200W çekim</td><td>Çalışmaz*</td><td>~45 dk</td><td>~1.5 saat</td><td>~3.8 saat</td></tr>
    <tr><td>Elektrikli kombi</td><td>1800W</td><td>Çalışmaz*</td><td>~30 dk</td><td>~1 saat</td><td>~2.5 saat</td></tr>
  </tbody>
</table>

<p><em>* P800'ün 800W sürekli çıkış limiti aşılır. P800 Smart-Boost moduyla 1200W'a kadar anlık yük kabul eder; ancak uzun süreli 1000W+ yük için uygun tasarlanmamıştır.</em></p>

<h2>Toplam Wh İhtiyacı Nasıl Hesaplanır?</h2>

<p>Adım adım toplam ihtiyacı bulmak için basit bir yöntem:</p>

<ol>
  <li><strong>Yedeklenecek cihazları listeleyin.</strong> Aynı anda çalıştırmayı planladıklarınızı yazın.</li>
  <li><strong>Her cihazın ortalama gücünü bulun (W).</strong> Yukarıdaki tablodan veya cihazın etiketinden.</li>
  <li><strong>Her cihaz için çalışma süresini belirleyin (saat).</strong> Tüm cihazlar kesinti boyunca sürekli çalışmayabilir; buzdolabı sürekli devrede olurken TV belki 3 saat, laptop 4 saat kullanılır.</li>
  <li><strong>Wh = Güç (W) × Süre (saat)</strong> ile her cihaz için enerji ihtiyacını hesaplayın.</li>
  <li><strong>Tüm cihazların Wh değerlerini toplayın.</strong></li>
  <li><strong>%15 güvenlik marjı ekleyin</strong> (invertör verimi + beklenmedik ek kullanım için).</li>
</ol>

<h3>Örnek Hesap — 6 Saatlik Kesinti, 3+1 Aile</h3>

<table>
  <thead>
    <tr><th>Cihaz</th><th>Güç</th><th>Süre</th><th>Enerji</th></tr>
  </thead>
  <tbody>
    <tr><td>Modem + mesh</td><td>20W</td><td>6 saat</td><td>120 Wh</td></tr>
    <tr><td>Buzdolabı (ort.)</td><td>60W</td><td>6 saat</td><td>360 Wh</td></tr>
    <tr><td>Doğalgazlı kombi</td><td>100W</td><td>3 saat</td><td>300 Wh</td></tr>
    <tr><td>LED aydınlatma</td><td>30W</td><td>4 saat</td><td>120 Wh</td></tr>
    <tr><td>LED TV (42")</td><td>70W</td><td>3 saat</td><td>210 Wh</td></tr>
    <tr><td>Telefon/tablet şarjı</td><td>—</td><td>—</td><td>80 Wh</td></tr>
    <tr><td>Laptop (kısmi)</td><td>55W</td><td>2 saat</td><td>110 Wh</td></tr>
    <tr><td><strong>Toplam</strong></td><td></td><td></td><td><strong>1300 Wh</strong></td></tr>
    <tr><td>+ %15 güvenlik marjı</td><td></td><td></td><td>+195 Wh</td></tr>
    <tr><td><strong>Net İhtiyaç</strong></td><td></td><td></td><td><strong>~1495 Wh</strong></td></tr>
  </tbody>
</table>

<p>Bu senaryo, <a href="/urun/p3200">P3200 (2048Wh)</a> kapasitesinde rahatlıkla karşılanır ve sonunda %25 rezerv kalır. <a href="/urun/p1800">P1800 (1024Wh)</a> bu senaryoda yetersiz kalır; cihaz sayısının azaltılması veya klima/TV sürelerinin kısaltılması gerekir.</p>

<h2>Kapasite Seçimi İçin Pratik Öneri</h2>

<p>Hesapladığınız Wh ihtiyacına göre seçim matrisi:</p>

<ul>
  <li><strong>400 Wh altı ihtiyaç:</strong> <a href="/urun/p800">P800</a> uygundur. Modem + laptop + aydınlatma + telefon şarjı senaryosu bu aralığa girer.</li>
  <li><strong>400–900 Wh ihtiyaç:</strong> <a href="/urun/p800">P800</a> sınırda; <a href="/urun/p1800">P1800</a> rahat eder. Tercih bütçeye göre yapılır.</li>
  <li><strong>900–1700 Wh ihtiyaç:</strong> <a href="/urun/p1800">P1800</a> ideal; <a href="/urun/p3200">P3200</a> konforlu seçim.</li>
  <li><strong>1700–3500 Wh ihtiyaç:</strong> <a href="/urun/p3200">P3200</a> uygundur. Sık ve uzun kesinti yaşayanlar için doğru kapasite.</li>
  <li><strong>3500 Wh üstü:</strong> <a href="/sh4000">SH4000</a> + B5120 modül kombinasyonu. Tam ev yedekleme veya off-grid senaryolar için.</li>
</ul>

<h2>Sıkça Sorulan Sorular</h2>

<h3>Cihazımın etiketinde Amper var, Watt yok. Nasıl hesaplarım?</h3>
<p>Watt = Volt × Amper. Türkiye'deki ev şebeke gerilimi 220V'dur. Örneğin "1.5A" yazan bir cihaz yaklaşık 330W çeker (220 × 1.5 = 330). Bu pratik formül çoğu cihaz için yeterlidir.</p>

<h3>Cihazım aralıklı çalışıyor (buzdolabı gibi), saat başı tüketimi nasıl hesaplarım?</h3>
<p>Döngüsel cihazlar için etiketteki nominal güç değil, ortalama tüketim dikkate alınır. A++ ev buzdolabı 150W nominal olabilir ancak ortalama 50–70W tüketir. Yukarıdaki tablo bu gerçek ortalama değerlerle hazırlanmıştır.</p>

<h3>Güç kaynağı belirtilenden az çıkar mı?</h3>
<p>Teorik kapasite ile kullanılabilir kapasite arasında %10 civarı bir invertör kaybı normal kabul edilir. Kaliteli ürünlerde bu kayıp %7–10 arası tutulur. LiFePO4 bataryalar ayrıca uzun süre ömür korur; 10 yıl sonra bile kapasite %80 civarındadır.</p>

<h3>Yetersiz kapasite aldığımı düşünüyorum, ikinci bir güç kaynağı alabilir miyim?</h3>
<p>P800, P1800 ve P3200 paralel kullanımı resmi olarak desteklenmez; ancak iki ürünü farklı hatlara bağlayarak ev içinde yük paylaştırabilirsiniz (örneğin P800 modem+laptop hatında, P1800 buzdolabı+aydınlatma hatında). Sonraki genişletme planlarınız varsa doğrudan SH4000 + B5120 sistemine yönelmek daha ekonomik bir yoldur.</p>

<h3>Günlük enerji tüketimimi nasıl ölçerim?</h3>
<p>Priz bazlı watt-metre cihazlar (genellikle 100–200 TL aralığında) hane cihazlarının tüketimini 24 saat boyunca kaydeder. Kapasite seçiminde en doğru yöntem budur; bir hafta evin aktivitesi gerçekçi profili ortaya koyar.</p>

<h2>Sonuç</h2>

<p>Wh ihtiyacınızı cihaz bazında hesaplamak, hem yetersiz kapasite hem de fazla yatırım riskini ortadan kaldırır. Yukarıdaki yöntemle 15 dakikada kendi ihtiyacınızı çıkarabilirsiniz. Pratik bir araç tercih ediyorsanız <a href="/guc-hesaplayici">Güç Hesaplayıcı</a>'mız cihaz seçimini otomatikleştirir ve size uygun modeli önerir. <a href="/kategori/tasinabilir-guc-kaynaklari">Tüm taşınabilir güç kaynağı modellerini</a> yan yana karşılaştırmak için kategori sayfamızı inceleyebilirsiniz.</p>`,
  },
];

async function main() {
  console.log("🚀 Blog Seed 04 başlıyor...\n");

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

  console.log("\n🎉 Blog Seed 04 tamamlandı.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Hata:", e);
  prisma.$disconnect();
  process.exit(1);
});
