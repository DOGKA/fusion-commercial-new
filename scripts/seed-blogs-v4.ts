/**
 * FusionMarkt Blog Seed V4
 * Blog 14: Güç İstasyonu vs Jeneratör vs NiCd Akü Karşılaştırma
 * Blog 15: Solar Panel Seri ve Paralel Bağlantı Rehberi
 *
 * Kullanım:
 *   npx tsx scripts/seed-blogs-v4.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const blogs = [
  // ─── BLOG 14: GÜÇ İSTASYONU vs JENERATÖR vs NiCd AKÜ ────────────────
  {
    slug: "tasinabilir-guc-istasyonu-vs-jenerator-vs-aku-karsilastirma",
    title: "Taşınabilir Güç İstasyonu vs Jeneratör vs Nikel-Kadmiyum Akü: Hangisi Daha İyi?",
    excerpt: "LiFePO4 güç istasyonları, benzinli/dizel jeneratörler ve geleneksel NiCd/kurşun-asit akülerin detaylı karşılaştırması. Maliyet, ömür, güvenlik, çevre ve kullanım senaryoları.",
    category: "Enerji",
    tags: ["güç istasyonu", "jeneratör", "nikel kadmiyum", "NiCd", "kurşun asit akü", "LiFePO4", "karşılaştırma"],
    metaTitle: "Güç İstasyonu vs Jeneratör vs Akü Karşılaştırma - Hangisi Daha İyi?",
    metaDescription: "Taşınabilir güç istasyonu mu, benzinli jeneratör mü, geleneksel NiCd/kurşun-asit akü mü? Maliyet, ömür, gürültü, güvenlik ve çevre etkisi karşılaştırması.",
    metaKeywords: ["güç istasyonu vs jeneratör", "jeneratör alternatifi", "nikel kadmiyum akü", "LiFePO4 vs kurşun asit", "taşınabilir enerji karşılaştırma"],
    publishedAt: new Date("2026-02-17"),
    content: `<h2>Giriş: Taşınabilir Enerji Çözümleri Evrimi</h2>
<p>Taşınabilir enerji ihtiyacı insanlık tarihi kadar eskidir. Geçmişte bu ihtiyaç benzinli/dizel jeneratörler ve nikel-kadmiyum (NiCd) veya kurşun-asit akülerle karşılanıyordu. Ancak LiFePO4 batarya teknolojisinin olgunlaşmasıyla birlikte <strong>taşınabilir güç istasyonları</strong> bu alanı kökten değiştirdi.</p>

<p>Bu yazıda üç farklı taşınabilir enerji çözümünü — <strong>LiFePO4 güç istasyonu</strong>, <strong>benzinli/dizel jeneratör</strong> ve <strong>geleneksel akü (NiCd / kurşun-asit)</strong> — 12 farklı kriterde karşılaştırıyoruz.</p>

<h2>Büyük Karşılaştırma Tablosu</h2>

<table>
<tr><th>Kriter</th><th>LiFePO4 Güç İstasyonu</th><th>Benzinli/Dizel Jeneratör</th><th>NiCd / Kurşun-Asit Akü</th></tr>
<tr><td><strong>Enerji Kaynağı</strong></td><td>Şarj edilebilir LiFePO4 batarya</td><td>Benzin veya dizel yakıt</td><td>Şarj edilebilir kimyasal hücreler</td></tr>
<tr><td><strong>Kapasite Aralığı</strong></td><td>256Wh – 6kWh+</td><td>Yakıt tankı boyutuna bağlı (pratik olarak sınırsız)</td><td>50Wh – 2kWh (ağırlık sınırlayıcı)</td></tr>
<tr><td><strong>Sürekli Çıkış Gücü</strong></td><td>500W – 4000W</td><td>1000W – 10.000W+</td><td>100W – 1500W (inverter ile)</td></tr>
<tr><td><strong>Gürültü Seviyesi</strong></td><td><strong>0 dB (tamamen sessiz)</strong></td><td>60-90 dB (çamaşır makinesi – motosiklet arası)</td><td>0 dB (sessiz, inverter hafif fan sesi)</td></tr>
<tr><td><strong>Egzoz / Emisyon</strong></td><td><strong>Sıfır emisyon</strong></td><td>CO, CO₂, NOx (kapalı alanda ölümcül!)</td><td>Şarj sırasında hidrojen gazı (kurşun-asit)</td></tr>
<tr><td><strong>İç Mekanda Kullanım</strong></td><td><strong>Güvenle kullanılabilir</strong></td><td><strong>ASLA!</strong> (karbonmonoksit zehirlenmesi)</td><td>Sınırlı (havalandırma gerekli, asit sızıntısı riski)</td></tr>
<tr><td><strong>Döngü Ömrü</strong></td><td><strong>4000-6000 döngü (10-15 yıl)</strong></td><td>Motor ömrüne bağlı (~2000-5000 saat)</td><td>NiCd: 1000-1500 / Kurşun-asit: 300-500 döngü</td></tr>
<tr><td><strong>Bakım</strong></td><td><strong>Bakımsız</strong></td><td>Yağ değişimi, filtre, buji, yakıt stabilizatörü</td><td>Kurşun-asit: su ekleme, terminal temizliği / NiCd: düşük</td></tr>
<tr><td><strong>Ağırlık (1kWh başına)</strong></td><td>~8-12 kg</td><td>~15-25 kg (yakıt hariç)</td><td>NiCd: ~20-30 kg / Kurşun-asit: ~30-40 kg</td></tr>
<tr><td><strong>Şarj Yöntemi</strong></td><td>AC priz + Solar + Araç + USB-C</td><td>Yakıt ikmal</td><td>AC şarj cihazı</td></tr>
<tr><td><strong>Güneş Enerjisi Uyumu</strong></td><td><strong>Yerleşik MPPT kontrolcü, doğrudan panel bağlantısı</strong></td><td>Yok</td><td>Harici şarj kontrolcüsü gerekli</td></tr>
<tr><td><strong>Çevre Etkisi</strong></td><td><strong>Minimum</strong> (toksik madde yok)</td><td>Yüksek (fosil yakıt, gürültü kirliliği)</td><td>NiCd: <strong>çok yüksek</strong> (kadmiyum toksik) / Kurşun-asit: yüksek</td></tr>
<tr><td><strong>İlk Yatırım Maliyeti</strong></td><td>Orta-Yüksek</td><td>Düşük-Orta</td><td>Düşük</td></tr>
<tr><td><strong>10 Yıllık Toplam Maliyet</strong></td><td><strong>En düşük</strong> (yakıt yok, bakım yok)</td><td>En yüksek (yakıt + bakım)</td><td>Yüksek (erken değişim, bakım)</td></tr>
</table>

<h2>Detaylı Kriter Analizi</h2>

<h3>1. Gürültü: Sessizlik Kazanır</h3>
<p>Benzinli jeneratörler 60-90 dB arası gürültü üretir. Bu, normal konuşma ile motosiklet sesi arasında bir değerdir. Kamp alanında, apartman balkonunda veya gece kullanımda son derece rahatsız edicidir. Birçok kamp alanı ve site yönetimi jeneratör kullanımını yasaklamaktadır.</p>

<p>LiFePO4 güç istasyonları <strong>tamamen sessizdir</strong>. Hiçbir hareketli parça, motor veya fan (düşük yükte) çalışmaz. Gece çadırın içinde, hastanede veya bebek odasında bile rahatlıkla kullanılabilir.</p>

<h3>2. Güvenlik: İç Mekan Kullanımı</h3>
<p>Jeneratörlerin ürettiği <strong>karbonmonoksit (CO)</strong> gazı renksiz ve kokusuz olup kapalı veya yarı kapalı alanlarda <strong>ölümcüldür</strong>. ABD'de her yıl yüzlerce kişi jeneratör kaynaklı CO zehirlenmesinden hayatını kaybetmektedir. Garaj, bodrum, çadır veya karavan içinde ASLA jeneratör çalıştırılmamalıdır.</p>

<p>Kurşun-asit aküler şarj sırasında <strong>hidrojen gazı</strong> üretir (patlama riski) ve sülfürik asit sızıntısı olabilir. NiCd aküler ise kadmiyum maruziyeti riski taşır.</p>

<p>LiFePO4 güç istasyonları gaz, sıvı veya toksik madde üretmez. Termal olarak kararlıdır (270°C'ye kadar). <strong>Ev içinde, çadırda, karavanda güvenle kullanılabilir.</strong></p>

<h3>3. Ömür ve Toplam Sahiplik Maliyeti</h3>
<p>İlk bakışta jeneratör veya akü daha ucuz görünür. Ancak 10 yıllık toplam maliyet hesabı yapıldığında tablo değişir:</p>

<h4>Örnek: 10 Yıllık Maliyet Karşılaştırması (1000W ihtiyaç, haftada 10 saat)</h4>
<table>
<tr><th>Kalem</th><th>LiFePO4 Güç İstasyonu</th><th>Benzinli Jeneratör</th><th>Kurşun-Asit Akü + İnverter</th></tr>
<tr><td>İlk yatırım</td><td>~35.000₺</td><td>~15.000₺</td><td>~12.000₺</td></tr>
<tr><td>Yakıt (10 yıl)</td><td>0₺ (solar ile bedava)</td><td>~80.000₺+</td><td>~15.000₺ (elektrik)</td></tr>
<tr><td>Bakım (10 yıl)</td><td>0₺</td><td>~20.000₺</td><td>~5.000₺</td></tr>
<tr><td>Yenileme</td><td>Gerekmez (4000+ döngü)</td><td>1× motor revizyon ~15.000₺</td><td>3× akü değişimi ~36.000₺</td></tr>
<tr><td><strong>10 Yıl Toplam</strong></td><td><strong>~35.000₺</strong></td><td><strong>~130.000₺</strong></td><td><strong>~68.000₺</strong></td></tr>
</table>

<p>LiFePO4 güç istasyonu, 10 yıllık periyotta jeneratörden <strong>yaklaşık 4 kat</strong>, kurşun-asit akü sisteminden <strong>yaklaşık 2 kat daha ekonomiktir</strong>.</p>

<h3>4. Çevre ve Sürdürülebilirlik</h3>
<p><strong>Nikel-kadmiyum (NiCd)</strong> aküler çevresel açıdan en sorunlu seçenektir. Kadmiyum, son derece toksik bir ağır metaldir. AB'de 2006'dan bu yana NiCd akülerin tüketici elektroniğinde kullanımı Batteries Directive (2006/66/EC) ile yasaklanmıştır. Endüstriyel ve acil durum uygulamalarında sınırlı muafiyetler devam etmektedir, ancak bu muafiyetler de kaldırılma sürecindedir.</p>

<p><strong>Kurşun-asit</strong> aküler de kurşun ve sülfürik asit içerir. Geri dönüşüm oranları yüksek olsa da üretim ve bertaraf süreçleri çevreye zararlıdır.</p>

<p><strong>Jeneratörler</strong> fosil yakıt tüketir, CO₂ ve NOx salar, gürültü kirliliği yaratır.</p>

<p><strong>LiFePO4</strong> bataryalar kobalt, kadmiyum veya kurşun gibi toksik maddeler içermez. Geri dönüştürülebilir. Güneş enerjisiyle şarj edildiğinde karbon ayak izi sıfıra yakındır.</p>

<h3>5. Taşınabilirlik</h3>
<p>Aynı enerji kapasitesi için ağırlık karşılaştırması:</p>
<ul>
<li><strong>LiFePO4 güç istasyonu 1kWh:</strong> ~10 kg (IEETek P1800: 12.7 kg)</li>
<li><strong>Kurşun-asit akü 1kWh:</strong> ~30-35 kg</li>
<li><strong>NiCd akü 1kWh:</strong> ~20-25 kg</li>
<li><strong>Benzinli jeneratör 1kW:</strong> ~15-25 kg + yakıt ağırlığı</li>
</ul>

<p>LiFePO4 güç istasyonu, aynı kapasitede <strong>kurşun-asit aküden 3 kat daha hafiftir</strong>. Kamp, seyahat ve taşıma kolaylığı açısından açık ara üstündür.</p>

<h3>6. Şarj Esnekliği</h3>
<p>LiFePO4 güç istasyonları 4 farklı kaynaktan şarj edilebilir:</p>
<ol>
<li><strong>Ev prizi (AC):</strong> En hızlı, 1-3 saat tam şarj</li>
<li><strong>Güneş paneli:</strong> Off-grid, bedava enerji. Yerleşik MPPT kontrolcü ile doğrudan bağlantı</li>
<li><strong>Araç çakmağı (12V DC):</strong> Seyahatte şarj</li>
<li><strong>USB-C PD:</strong> Bazı modellerde PD girişiyle şarj</li>
</ol>
<p>Jeneratör sadece yakıt ile çalışır. Akü ise sadece AC şarj cihazıyla doldurulur (solar için harici MPPT şarj kontrolcüsü ve kablolama gerekir).</p>

<h3>7. Çıkış Port Çeşitliliği</h3>
<p>LiFePO4 güç istasyonları tek bir ünitede birden fazla çıkış sunar:</p>
<ul>
<li>AC 220V priz (saf sinüs dalga)</li>
<li>USB-A hızlı şarj</li>
<li>USB-C PD (100W'a kadar)</li>
<li>DC5525 (12V DC)</li>
<li>12V araç çıkışı</li>
<li>Kablosuz şarj (bazı modeller)</li>
</ul>
<p>Jeneratörde sadece AC priz çıkışı bulunur; USB veya DC için ek adaptör gerekir. Geleneksel akülerde sadece DC çıkış vardır; AC için ayrı inverter satın alınmalıdır.</p>

<h2>Ne Zaman Hangi Çözümü Seçmelisiniz?</h2>

<h3>LiFePO4 Güç İstasyonu Seçin:</h3>
<ul>
<li>Sessiz çalışma istiyorsanız (kamp, gece kullanımı, hastane)</li>
<li>İç mekanda kullanacaksanız (ev, çadır, karavan)</li>
<li>Güneş enerjisiyle şarj etmek istiyorsanız</li>
<li>Bakımsız, uzun ömürlü çözüm arıyorsanız</li>
<li>Çevre dostu bir tercih yapmak istiyorsanız</li>
<li>Hafif ve taşınabilir bir çözüm gerekiyorsa</li>
<li>USB-C, DC, AC gibi çoklu çıkış ihtiyacınız varsa</li>
</ul>

<h3>Jeneratör Seçin:</h3>
<ul>
<li>5000W+ çok yüksek sürekli güç ihtiyacınız varsa</li>
<li>Günlerce kesintisiz çalışma gerekiyorsa (yakıt doldurarak)</li>
<li>İnşaat şantiyesi gibi ağır endüstriyel uygulamalarda</li>
<li>Bütçe çok kısıtlı ve kısa vadeli çözüm yeterliyse</li>
</ul>

<h3>Geleneksel Akü Sistemi:</h3>
<p>Günümüzde NiCd aküler çevresel riskleri nedeniyle tüketici uygulamalarından neredeyse tamamen çekilmiştir. Kurşun-asit aküler ise sadece araç marş aküleri ve sabit UPS sistemlerinde kullanılmaya devam etmektedir. Taşınabilir enerji ihtiyaçları için artık <strong>LiFePO4 güç istasyonları açık ara en iyi seçenektir</strong>.</p>

<h2>Sonuç</h2>
<p>Teknoloji ilerledikçe LiFePO4 güç istasyonları, jeneratör ve geleneksel akülerin sunduğu her avantajı birleştirirken dezavantajlarını ortadan kaldırıyor. Sessiz, güvenli, bakımsız, çevre dostu ve uzun vadede çok daha ekonomik. <a href="/kategori/tasinabilir-guc-kaynaklari">FusionMarkt güç istasyonlarını</a> inceleyin ve enerji çözümünüzü modernleştirin.</p>`,
  },

  // ─── BLOG 15: SOLAR PANEL SERİ vs PARALEL BAĞLANTI ────────────────────
  {
    slug: "solar-panel-seri-paralel-baglanti-rehberi",
    title: "Solar Panel Seri ve Paralel Bağlantı: Farkları, Avantajları ve Doğru Seçim",
    excerpt: "Güneş panellerini seri mi yoksa paralel mi bağlamalısınız? Voltaj ve akım davranışları, gölgelenme etkisi, güç istasyonu uyumu ve pratik bağlantı şemaları.",
    category: "Enerji",
    tags: ["solar panel", "seri bağlantı", "paralel bağlantı", "güneş paneli", "MC4", "VOC"],
    metaTitle: "Solar Panel Seri vs Paralel Bağlantı Rehberi - FusionMarkt",
    metaDescription: "Güneş panellerini seri mi paralel mi bağlamalısınız? Voltaj, akım, gölgelenme etkisi, güç istasyonu uyumu, MC4 konnektör bağlantı şemaları. Kapsamlı rehber.",
    metaKeywords: ["solar panel seri bağlantı", "solar panel paralel bağlantı", "güneş paneli bağlantı", "MC4 konnektör", "solar panel VOC", "panel dizisi"],
    publishedAt: new Date("2026-02-17"),
    content: `<h2>Neden Birden Fazla Panel Bağlanır?</h2>
<p>Tek bir güneş paneli güç istasyonunuzu şarj edebilir, ancak daha hızlı şarj istiyorsanız veya daha fazla enerji üretmeniz gerekiyorsa birden fazla paneli bir arada kullanmanız gerekir. İki temel bağlantı yöntemi vardır: <strong>seri</strong> ve <strong>paralel</strong>. Her birinin davranışı, avantajları ve güç istasyonunuza etkisi farklıdır.</p>

<p>Yanlış bağlantı güç istasyonunuza zarar verebileceğinden, bu rehberi dikkatlice okuyun.</p>

<h2>Temel Elektrik Kavramları (Hızlı Hatırlatma)</h2>
<ul>
<li><strong>Voltaj (V):</strong> Elektrik basıncı. Suyun boru içindeki basıncına benzer.</li>
<li><strong>Akım (A - Amper):</strong> Elektrik akışı miktarı. Suyun akış hızına benzer.</li>
<li><strong>Güç (W - Watt):</strong> Voltaj × Akım = Güç. Toplam enerji aktarım kapasitesi.</li>
<li><strong>VOC:</strong> Açık devre voltajı — panelin yüksüz durumdaki maksimum voltajı.</li>
<li><strong>ISC:</strong> Kısa devre akımı — panelin üretebileceği maksimum akım.</li>
<li><strong>Vmp / Imp:</strong> Maksimum güç noktasındaki çalışma voltajı ve akımı.</li>
</ul>

<h2>Seri Bağlantı (Seri Dizisi / String)</h2>

<h3>Nasıl Bağlanır?</h3>
<p>Bir panelin <strong>(+) çıkışı</strong>, diğer panelin <strong>(-) girişine</strong> bağlanır. Zincir şeklinde devam eder. İlk panelin (-) ve son panelin (+) uçları güç istasyonuna bağlanır.</p>

<pre>
Panel A (+) ──── Panel B (-) 
Panel A (-)                    Panel B (+)
   │                              │
   └──── Güç İstasyonu ───────────┘
         Solar Giriş
</pre>

<h3>Elektriksel Davranış</h3>
<table>
<tr><th>Parametre</th><th>Seri Bağlantıda Davranış</th></tr>
<tr><td><strong>Voltaj</strong></td><td><strong>TOPLANIR</strong> (V₁ + V₂ + V₃...)</td></tr>
<tr><td><strong>Akım</strong></td><td>Sabit kalır (en düşük akımlı panele eşit)</td></tr>
<tr><td><strong>Güç</strong></td><td>Toplanır (kayıp yoksa)</td></tr>
</table>

<h3>Örnek: 2× IEETek SP200 Seri Bağlantı</h3>
<table>
<tr><th>Parametre</th><th>Tek Panel</th><th>2 Panel Seri</th></tr>
<tr><td>VOC</td><td>28.8V</td><td><strong>57.6V</strong> (28.8+28.8)</td></tr>
<tr><td>ISC</td><td>9.12A</td><td><strong>9.12A</strong> (değişmez)</td></tr>
<tr><td>Maks. Güç</td><td>200W</td><td><strong>400W</strong></td></tr>
</table>

<h3>Seri Bağlantının Avantajları</h3>
<ul>
<li><strong>Daha yüksek voltaj:</strong> Uzun kablo mesafelerinde voltaj kaybı azalır</li>
<li><strong>MPPT kontrolcü verimi artar:</strong> Yüksek voltajda MPPT daha verimli çalışır</li>
<li><strong>İnce kablo yeterli:</strong> Akım artmadığından daha ince kablo kullanılabilir</li>
<li><strong>Basit kablolama:</strong> Ek Y-konnektör veya birleştirici gerekmez</li>
</ul>

<h3>Seri Bağlantının Dezavantajları</h3>
<ul>
<li><strong>Gölgelenme etkisi çok büyük:</strong> Bir panelin kısmen gölgelenmesi, tüm serinin performansını düşürür. Seri bağlı panellerde akım, en zayıf halka tarafından belirlenir. Bir panel %50 gölgelenirse, tüm dizinin akımı %50 düşer!</li>
<li><strong>VOC limiti aşılabilir:</strong> Toplam VOC, güç istasyonunun maksimum solar giriş voltajını aşmamalıdır. Soğuk havada VOC daha da yükselir (bkz: <a href="/blog/batarya-voc-degeri-nedir-neden-yukselir">VOC rehberimiz</a>).</li>
<li><strong>Panel uyumsuzluğu:</strong> Farklı güçteki paneller seri bağlanırsa verim düşer</li>
</ul>

<h2>Paralel Bağlantı</h2>

<h3>Nasıl Bağlanır?</h3>
<p>Tüm panellerin <strong>(+) çıkışları birbirine</strong>, tüm <strong>(-) çıkışları birbirine</strong> bağlanır. Bunun için <strong>MC4 Y-konnektör</strong> (dallandırıcı) kullanılır.</p>

<pre>
Panel A (+) ────┐
                ├──── (+) Güç İstasyonu Solar Giriş
Panel B (+) ────┘

Panel A (-) ────┐
                ├──── (-) Güç İstasyonu Solar Giriş
Panel B (-) ────┘
</pre>

<h3>Elektriksel Davranış</h3>
<table>
<tr><th>Parametre</th><th>Paralel Bağlantıda Davranış</th></tr>
<tr><td><strong>Voltaj</strong></td><td>Sabit kalır (en düşük voltajlı panele eşit)</td></tr>
<tr><td><strong>Akım</strong></td><td><strong>TOPLANIR</strong> (I₁ + I₂ + I₃...)</td></tr>
<tr><td><strong>Güç</strong></td><td>Toplanır (kayıp yoksa)</td></tr>
</table>

<h3>Örnek: 2× IEETek SP200 Paralel Bağlantı</h3>
<table>
<tr><th>Parametre</th><th>Tek Panel</th><th>2 Panel Paralel</th></tr>
<tr><td>VOC</td><td>28.8V</td><td><strong>28.8V</strong> (değişmez)</td></tr>
<tr><td>ISC</td><td>9.12A</td><td><strong>18.24A</strong> (9.12+9.12)</td></tr>
<tr><td>Maks. Güç</td><td>200W</td><td><strong>400W</strong></td></tr>
</table>

<h3>Paralel Bağlantının Avantajları</h3>
<ul>
<li><strong>Gölgelenme dayanıklılığı:</strong> Bir panel gölgelendiğinde sadece o panelin üretimi düşer, diğer paneller etkilenmez. Kamp gibi gölge riski yüksek ortamlarda büyük avantaj!</li>
<li><strong>VOC artışı yok:</strong> Voltaj toplanmadığından güç istasyonunun voltaj limitini aşma riski yoktur</li>
<li><strong>Farklı paneller birleştirilebilir:</strong> Farklı güçteki paneller (100W + 200W) paralel bağlanabilir (aynı voltajda oldukları sürece)</li>
<li><strong>Esneklik:</strong> İstediğiniz zaman panel ekleyip çıkarabilirsiniz</li>
</ul>

<h3>Paralel Bağlantının Dezavantajları</h3>
<ul>
<li><strong>Yüksek akım:</strong> Toplam akım arttığından daha kalın kablo gerekir (voltaj düşüşünü önlemek için)</li>
<li><strong>MC4 Y-konnektör gerekli:</strong> Ek bağlantı parçası satın alınmalıdır</li>
<li><strong>Akım limiti kontrolü:</strong> Güç istasyonunun solar giriş akım limitini kontrol edin. Toplam akım bu limiti aşmamalıdır.</li>
<li><strong>Ters akım riski:</strong> Bir panel gölgelendiğinde diğer panellerden gölgeli panele doğru akım akabilir. Kaliteli panellerde bypass diyot bu sorunu çözer.</li>
</ul>

<h2>Seri vs Paralel: Hangi Durumda Hangisi?</h2>

<table>
<tr><th>Senaryo</th><th>Önerilen Bağlantı</th><th>Neden?</th></tr>
<tr><td>Açık alan, gölge yok</td><td><strong>Seri</strong></td><td>Daha verimli, basit kablolama</td></tr>
<tr><td>Kamp / ağaç altı, gölge riski</td><td><strong>Paralel</strong></td><td>Gölge bir paneli etkilese diğerleri çalışmaya devam eder</td></tr>
<tr><td>Uzun kablo mesafesi (10m+)</td><td><strong>Seri</strong></td><td>Yüksek voltajda kablo kaybı daha az</td></tr>
<tr><td>Güç istasyonu düşük VOC limiti</td><td><strong>Paralel</strong></td><td>Voltaj artmaz, güvenli</td></tr>
<tr><td>Farklı güçte paneller</td><td><strong>Paralel</strong></td><td>Seri bağlantıda uyumsuz paneller verimi düşürür</td></tr>
<tr><td>Aynı panellerden maksimum verim</td><td><strong>Seri (voltaj limiti dahilinde)</strong></td><td>MPPT daha verimli çalışır</td></tr>
<tr><td>Karavan çatı (sabit montaj)</td><td><strong>Seri</strong></td><td>Gölge riski az, verim yüksek</td></tr>
<tr><td>3+ panel büyük sistem</td><td><strong>Seri-Paralel hibrit</strong></td><td>Dengelenmiş voltaj ve akım</td></tr>
</table>

<h2>Güç İstasyonu Uyumluluk Kontrolü</h2>
<p>Panel bağlamadan önce şu limitleri kontrol edin:</p>

<h3>IEETek Güç İstasyonları Solar Giriş Limitleri</h3>
<table>
<tr><th>Model</th><th>Maks. Giriş Voltajı (VOC)</th><th>Maks. Giriş Akımı</th><th>Maks. Solar Giriş Gücü</th></tr>
<tr><td>P800</td><td>60V</td><td>10A</td><td>300W</td></tr>
<tr><td>P1800</td><td>52V</td><td>11A</td><td>500W</td></tr>
<tr><td>P2400</td><td>60V</td><td>10A</td><td>500W</td></tr>
<tr><td>P3200</td><td>80V</td><td>16A</td><td>1000W</td></tr>
<tr><td>Singo 2000 Pro</td><td>50V</td><td>11A</td><td>500W</td></tr>
<tr><td>SH4000 — LV (XT60)</td><td>50V</td><td>16A</td><td>600W</td></tr>
<tr><td>SH4000 — HV (MC4)</td><td>450V</td><td>16A</td><td>3000W</td></tr>
</table>

<p>SH4000'in HV girişi diğerlerinden farklı olarak bir <strong>alt sınıra</strong> da sahiptir: dizi voltajı 70V'un altındaysa giriş hiç devreye girmez. Bu yüzden HV girişine bağlanan paneller mutlaka seri bağlanır.</p>

<h3>Güvenli Bağlantı Kontrol Listesi</h3>
<ol>
<li><strong>Seri bağlantıda:</strong> Toplam VOC (soğuk hava faktörü dahil) &lt; Güç istasyonu maks. giriş voltajı</li>
<li><strong>Paralel bağlantıda:</strong> Toplam ISC &lt; Güç istasyonu maks. giriş akımı</li>
<li><strong>Her iki durumda:</strong> Toplam güç &lt; Güç istasyonu maks. solar giriş gücü</li>
</ol>

<h3>Örnek Hesaplamalar</h3>

<p><strong>P1800 + 2× SP200 Seri:</strong></p>
<ul>
<li>Toplam VOC: 28.8V + 28.8V = 57.6V → P1800 limiti 52V → <strong>YAPMAYIN.</strong> Dizi, soğuk hava payı hesaba katılmadan bile limitin üzerinde; soğukta 57.6 × 1.20 = 69.1V'a çıkar.</li>
</ul>

<p><strong>P1800 + 2× SP200 Paralel:</strong></p>
<ul>
<li>VOC: 28.8V (değişmez) → Soğukta: 28.8 × 1.20 = 34.6V → P1800 limiti 52V → <strong>GÜVENLİ</strong></li>
<li>Toplam akım: 9.12A + 9.12A = 18.24A → P1800 limiti 11A → <strong>AŞIYOR! Güç istasyonu otomatik sınırlayacak.</strong> Güç kaybı olur ama zarar vermez.</li>
</ul>

<p><strong>P3200 + 2× SP200 Seri:</strong></p>
<ul>
<li>Toplam VOC: 57.6V → Soğukta: 57.6 × 1.20 = 69.1V → P3200 limiti 80V → <strong>GÜVENLİ</strong></li>
<li>Toplam güç: 400W → P3200 limiti 1000W → <strong>GÜVENLİ</strong></li>
</ul>

<h2>Seri-Paralel Hibrit Bağlantı (3+ Panel)</h2>
<p>3 veya daha fazla paneliniz varsa, seri ve paralelin avantajlarını birleştiren hibrit bağlantı yapabilirsiniz:</p>

<pre>
String 1: Panel A + Panel B (seri) → 57.6V, 9.12A
String 2: Panel C + Panel D (seri) → 57.6V, 9.12A

String 1 ──┐
            ├──── Paralel birleştirme → 57.6V, 18.24A → Güç İstasyonu
String 2 ──┘
</pre>

<p>Bu yöntemle hem voltajı yüksek tutarsınız (MPPT verimi) hem de gölgelenme etkisini string bazında sınırlarsınız.</p>

<h2>MC4 Konnektör ve Y-Konnektör</h2>
<p><strong>MC4</strong>, güneş panellerinde kullanılan endüstri standardı su geçirmez konnektördür. Erkek ve dişi uçları birbirine kilitlenir.</p>
<ul>
<li><strong>Seri bağlantı için:</strong> Ek konnektör gerekmez. Panel çıkışları doğrudan birbirine bağlanır.</li>
<li><strong>Paralel bağlantı için:</strong> MC4 Y-konnektör (2'li dallandırıcı) gerekir. (+) ve (-) için ayrı Y-konnektör alınmalıdır (toplam 1 çift).</li>
</ul>

<p><strong>Önemli:</strong> Mutlaka IP67 su geçirmez, UV dayanımlı, kaliteli MC4 konnektör kullanın. Ucuz konnektörler kötü temas, ısınma ve yangın riski oluşturabilir.</p>

<h2>Sonuç</h2>
<p>Güneş paneli bağlantı yönteminin doğru seçimi, sisteminizin verimini ve güvenliğini doğrudan etkiler. Açık alanda seri bağlantı daha verimli çalışırken, gölge riski olan kamp ortamlarında paralel bağlantı çok daha güvenilirdir. Hangi yöntemi seçerseniz seçin, mutlaka güç istasyonunuzun voltaj ve akım limitlerini kontrol edin. <a href="/kategori/solar-panel">FusionMarkt güneş panellerini</a> ve <a href="/kategori/tasinabilir-guc-kaynaklari">güç istasyonlarını</a> inceleyin.</p>`,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// SEED
// ═══════════════════════════════════════════════════════════════════════════

async function seedBlogs() {
  console.log("🚀 Blog V4 seed başlıyor (Jeneratör karşılaştırma + Seri/Paralel)...\n");

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
