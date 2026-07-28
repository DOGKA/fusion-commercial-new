/**
 * FusionMarkt Blog Seed V2 - VOC & DC5525 Teknik Bloglar
 * 
 * Kullanım:
 *   npx tsx scripts/seed-blogs-v2.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface BlogInput {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  publishedAt: Date;
}

const blogs: BlogInput[] = [
  // ─── 1. VOC DEĞERİ ────────────────────────────────────────────────────
  {
    slug: "batarya-voc-degeri-nedir-neden-yukselir",
    title: "Batarya VOC (Açık Devre Gerilimi) Nedir? Neden Yükselir, Nasıl Ölçülür?",
    excerpt: "Güneş paneli ve batarya sistemlerinde VOC (Open Circuit Voltage) değeri ne anlama gelir? Neden yükselir, hangi koşullarda düşer ve güç istasyonunuzu nasıl etkiler? Teknik rehber.",
    category: "Enerji",
    tags: ["VOC", "açık devre gerilimi", "batarya", "solar panel", "güneş paneli teknik"],
    metaTitle: "Batarya VOC Değeri Nedir? Açık Devre Gerilimi Rehberi - FusionMarkt",
    metaDescription: "VOC (Open Circuit Voltage) açık devre gerilimi nedir? Güneş paneli ve batarya sistemlerinde VOC neden yükselir, nasıl ölçülür ve güç istasyonunuzu nasıl etkiler?",
    metaKeywords: ["VOC nedir", "açık devre gerilimi", "open circuit voltage", "güneş paneli VOC", "batarya gerilim", "solar panel teknik"],
    publishedAt: new Date("2026-02-16"),
    content: `<h2>VOC Nedir? Açık Devre Gerilimi Tanımı</h2>
<p><strong>VOC (Open Circuit Voltage - Açık Devre Gerilimi)</strong>, bir bataryanın veya güneş panelinin herhangi bir yüke bağlı olmadığı durumda (yani akım akmadan) ölçülen maksimum voltaj değeridir. Basitçe söylemek gerekirse: cihaza hiçbir şey bağlı değilken multimetre ile ölçtüğünüzde gördüğünüz voltaj, VOC'dir.</p>

<p>Bu kavram hem <strong>güneş panelleri</strong> hem de <strong>LiFePO4/lityum-ion bataryalar</strong> için kritik öneme sahiptir ve güç istasyonunuzun performansını doğrudan etkiler.</p>

<h2>Güneş Panellerinde VOC</h2>

<h3>VOC Değeri Ne Anlama Gelir?</h3>
<p>Bir güneş panelinin etiketi üzerinde gördüğünüz <strong>VOC</strong> değeri, o panelin üretebileceği maksimum voltajı gösterir. Örneğin IEETek SP200 güneş panelinin VOC değeri <strong>28.8V</strong>'tur; aynı panelin çalışma voltajı (Vmp) ise 24V'tur. Etiketteki bu iki değeri karıştırmamak önemli, çünkü cihazın giriş limitiyle karşılaştırılması gereken VOC'dir. Bu, panelin en parlak güneş altında, hiçbir cihaza bağlı değilken üretebileceği en yüksek gerilimdir.</p>

<p>Güneş paneli bir güç istasyonuna bağlandığında ise <strong>Vmp (Maximum Power Point Voltage)</strong> yani çalışma voltajında çalışır. Vmp her zaman VOC'den düşüktür (genellikle VOC'nin %75-85'i civarında).</p>

<h3>Güneş Panelinde VOC Neden Yükselir?</h3>
<p>Güneş panelinin VOC değeri şu koşullarda normalden <strong>yükselebilir</strong>:</p>

<ul>
<li><strong>Düşük sıcaklık:</strong> Bu en önemli faktördür. Güneş paneli hücreleri soğudukça voltaj artar. Kışın güneşli ama soğuk bir günde (-5°C ile +5°C arası) panel VOC'si etiket değerinin <strong>%10-20 üzerine</strong> çıkabilir. Örneğin etiket VOC'si 28.8V olan SP200, soğukta 32-35V üretebilir.</li>
<li><strong>Yüksek ışınım (irradiance):</strong> Güneş ışığının yoğunluğu arttığında VOC da hafif yükselir, ancak sıcaklık etkisi kadar belirgin değildir.</li>
<li><strong>Yüksek rakım:</strong> Dağ kamplarında atmosfer daha ince olduğundan güneş ışınımı daha yoğundur ve VOC biraz artabilir.</li>
</ul>

<h3>VOC Neden Düşer?</h3>
<ul>
<li><strong>Yüksek sıcaklık:</strong> Panel sıcaklığı arttıkça VOC düşer. Yazın panel yüzeyi 60-70°C'ye ulaştığında VOC etiket değerinin <strong>%10-15 altına</strong> inebilir. Bu yüzden panellerin havalandırma boşluğu bırakılarak monte edilmesi önerilir.</li>
<li><strong>Kısmi gölgelenme:</strong> Panelin bir kısmı gölgelendiğinde gerilim önemli ölçüde düşer.</li>
<li><strong>Panel yaşlanması:</strong> Yıllar içinde hafif VOC düşüşü normaldir (yıllık %0.3-0.5).</li>
<li><strong>Bulutlu hava:</strong> Işınım azaldığında VOC hafifçe düşer.</li>
</ul>

<h3>VOC Neden Önemli? Güç İstasyonunuzu Nasıl Etkiler?</h3>
<p>Her güç istasyonunun solar girişinde bir <strong>maksimum giriş voltajı limiti</strong> vardır. Örneğin:</p>

<table>
<tr><th>Güç İstasyonu</th><th>Maks. Solar Giriş Voltajı</th></tr>
<tr><td>IEETek P800</td><td>60V</td></tr>
<tr><td>IEETek P1800</td><td>52V</td></tr>
<tr><td>IEETek P2400</td><td>60V</td></tr>
<tr><td>IEETek P3200</td><td>80V</td></tr>
<tr><td>IEETek Singo 2000 Pro</td><td>50V</td></tr>
<tr><td>IEETek SH4000</td><td>LV girişi 50V · HV girişi 450V (alt sınır 70V)</td></tr>
</table>

<p><strong>Eğer güneş panelinin VOC değeri, güç istasyonunun maksimum giriş voltajını aşarsa, güç istasyonunun MPPT kontrolcüsü veya giriş devresi zarar görebilir!</strong> Bu yüzden panel seçerken, özellikle soğuk havadaki VOC artışını hesaba katmanız gerekir.</p>

<h3>Güvenli Panel Seçimi Formülü</h3>
<p>Güvenli panel seçimi için şu formül kullanılır:</p>
<p><strong>Maks. VOC (soğukta) = Etiket VOC × 1.20</strong></p>
<p>Bu değerin, güç istasyonunuzun maksimum giriş voltajından <strong>düşük</strong> olması gerekir.</p>
<p>Örnek: SP200 panelin etiket VOC'si 28.8V → Soğukta tahmini maks: 28.8 × 1.20 = <strong>34.6V</strong>. Bu değer hem P1800'ün 52V hem de P800'ün 60V limitinin altında kaldığı için güvenlidir.</p>

<p>Karşı örnek: SP400'ün etiket VOC'si <strong>52.8V</strong>. Soğuk hava payı hesaba katılmadan bile P1800'ün 52V ve Singo 2000 Pro'nun 50V limitinin üzerindedir; bu panel o cihazlara bağlanmaz. P3200'ün 80V limiti içinse rahatça uygundur.</p>

<h2>Bataryalarda VOC</h2>

<h3>LiFePO4 Bataryada VOC</h3>
<p>LiFePO4 hücresinin VOC değeri şarj durumuna (SOC - State of Charge) göre değişir:</p>
<table>
<tr><th>Şarj Durumu (SOC)</th><th>Hücre VOC (V)</th><th>4S Paket (V)</th></tr>
<tr><td>%100 (Tam dolu)</td><td>3.60-3.65V</td><td>14.4-14.6V</td></tr>
<tr><td>%80</td><td>3.35-3.40V</td><td>13.4-13.6V</td></tr>
<tr><td>%50</td><td>3.28-3.30V</td><td>13.1-13.2V</td></tr>
<tr><td>%20</td><td>3.15-3.20V</td><td>12.6-12.8V</td></tr>
<tr><td>%0 (Boş)</td><td>2.50-2.80V</td><td>10.0-11.2V</td></tr>
</table>

<h3>Batarya VOC'si Neden Normalden Yüksek Olabilir?</h3>
<ul>
<li><strong>Şarj sonrası dinlenme:</strong> Batarya tam şarj olduktan hemen sonra VOC geçici olarak yükselebilir (surface charge etkisi). 30-60 dakika dinlendikten sonra gerçek VOC değerine iner.</li>
<li><strong>Düşük sıcaklık:</strong> Soğukta kimyasal reaksiyonlar yavaşlar ve geçici voltaj artışı görülebilir.</li>
<li><strong>BMS (Battery Management System) dengesizliği:</strong> Hücreler arası dengesizlik varsa toplam voltaj normalden farklı olabilir. Bu durumda BMS dengeleme döngüsü (balance charge) gerekebilir.</li>
<li><strong>Arızalı hücre:</strong> Nadir durumlarda arızalı bir hücre anormal yüksek voltaj gösterebilir. Bu ciddi bir durumdur ve servis gerektirir.</li>
</ul>

<h2>VOC Nasıl Ölçülür?</h2>
<ol>
<li><strong>Güneş panelinde:</strong> Paneli güç istasyonundan ayırın. Multimetreyi DC voltaj moduna alın. Kırmızı probu panelin (+) çıkışına, siyah probu (-) çıkışına temas ettirin. Okunan değer VOC'dir.</li>
<li><strong>Bataryada:</strong> Tüm yükleri çıkarın (güç istasyonunu kapatın, hiçbir cihaz bağlı olmasın). 30 dakika bekleyin. Multimetre ile DC çıkış voltajını ölçün.</li>
</ol>

<h2>Pratik İpuçları</h2>
<ul>
<li>Güneş paneli alırken, panelin VOC değerini güç istasyonunuzun maksimum solar giriş voltajıyla karşılaştırın</li>
<li>Soğuk iklimde kamp yapacaksanız VOC'nin %20 yükselebileceğini hesaba katın</li>
<li>Birden fazla paneli <strong>seri</strong> bağladığınızda VOC değerleri toplanır! 2× SP200 (28.8V VOC) seri bağlanırsa toplam VOC 57.6V olur — bu değer P1800'ün 52V limitini aşar</li>
<li>Birden fazla paneli <strong>paralel</strong> bağladığınızda VOC değişmez, sadece akım (amper) artar</li>
<li>Güç istasyonunuzun ekranında "Over Voltage" veya "Aşırı Voltaj" hatası görürseniz, paneli hemen çıkarın ve uyumluluğu kontrol edin</li>
</ul>

<h2>Sonuç</h2>
<p>VOC (Açık Devre Gerilimi), güneş paneli ve batarya sistemlerinde performans ve güvenlik açısından en önemli parametrelerden biridir. Özellikle güneş paneli + güç istasyonu kombinasyonlarında, soğuk hava koşullarındaki VOC artışını hesaba katmak ekipmanınızı korumanın anahtarıdır. IEETek panelleri IEETek güç istasyonlarıyla birlikte kullanılmak üzere tasarlanmıştır, ancak her panel her modele uymaz: SP400'ün 52.8V VOC değeri P1800 (52V), Singo 2000 Pro (50V) ve SH4000'in LV girişi (50V) için fazla yüksektir. Satın almadan önce panelin VOC değerini cihazınızın giriş limitiyle karşılaştırın. <a href="/kategori/solar-panel">FusionMarkt güneş paneli koleksiyonu</a>'nu inceleyin.</p>`,
  },

  // ─── 2. DC5525 ÇIKIŞI ─────────────────────────────────────────────────
  {
    slug: "dc5525-cikis-nedir-hangi-cihazlar-kullanilir",
    title: "DC5525 Çıkış Nedir? Hangi Cihazlarda Kullanılır ve AC'ye Göre Avantajları",
    excerpt: "Güç istasyonlarındaki DC5525 çıkış portu ne işe yarar? 13.2V/8A DC çıkışla hangi cihazları çalıştırabilirsiniz? AC'ye göre enerji verimliliği farkı ve pratik kullanım senaryoları.",
    category: "Enerji",
    tags: ["DC5525", "DC çıkış", "güç istasyonu port", "enerji verimliliği", "12V cihazlar"],
    metaTitle: "DC5525 Çıkış Nedir? Hangi Cihazlar Kullanılır? - FusionMarkt",
    metaDescription: "Güç istasyonlarındaki DC5525 (5.5mm×2.5mm) çıkış portu nedir? 13.2V DC ile hangi cihazlar çalıştırılır? AC'ye göre %15-20 enerji tasarrufu avantajı. Detaylı rehber.",
    metaKeywords: ["DC5525 nedir", "DC5525 çıkış", "güç istasyonu DC port", "12V DC cihaz", "AC vs DC verimlilik", "DC barrel jack"],
    publishedAt: new Date("2026-02-14"),
    content: `<h2>DC5525 Nedir?</h2>
<p><strong>DC5525</strong>, güç istasyonları ve birçok elektronik cihazda yaygın olarak kullanılan bir DC (Doğru Akım) güç konnektörüdür. Adı fiziksel ölçülerinden gelir: <strong>dış çap 5.5mm, iç çap 2.5mm</strong>. "Barrel jack" veya "barrel konnektör" olarak da bilinir. Silindirik metal yapısıyla kolay takılıp çıkarılır ve güvenilir elektriksel temas sağlar.</p>

<p>IEETek güç istasyonlarının çoğunda DC5525 çıkış portları bulunur ve <strong>13.2V DC / maksimum 8A</strong> güç sunar. Bu, yaklaşık <strong>105W</strong>'a kadar DC güç beslemesi anlamına gelir.</p>

<h2>Hangi IEETek Modellerinde DC5525 Var?</h2>
<table>
<tr><th>Model</th><th>DC5525 Port Sayısı</th><th>Çıkış Özellikleri</th></tr>
<tr><td><strong>IEETek P800</strong></td><td>2× DC5525</td><td>13.2V / max 8A</td></tr>
<tr><td><strong>IEETek P1800</strong></td><td>2× DC5525</td><td>13.2V / max 8A</td></tr>
<tr><td><strong>IEETek P3200</strong></td><td>2× DC5525</td><td>13.2V / max 8A</td></tr>
<tr><td><strong>Singo2000 PRO</strong></td><td>2× DC5525</td><td>13.2V / max 10A</td></tr>
</table>

<h2>DC5525 ile Hangi Cihazlar Çalıştırılabilir?</h2>
<p>DC5525 çıkışı 12-13.2V DC besleme sağladığından, 12V DC girişli birçok cihazla uyumludur:</p>

<h3>Aydınlatma</h3>
<ul>
<li><strong>12V LED şerit:</strong> Çadır, karavan veya çalışma alanı aydınlatması. DC5525→DC barrel dönüştürücü ile doğrudan bağlanır. Saatler süren verimli aydınlatma.</li>
<li><strong>12V masa lambası:</strong> Kamp veya uzaktan çalışma için göz yormayan ışık.</li>
<li><strong>USB-DC hibrit kamp lambaları:</strong> Birçok kamp lambası DC5525 girişi destekler.</li>
</ul>

<h3>Soğutma ve Havalandırma</h3>
<ul>
<li><strong>12V araç buzdolabı:</strong> Kompresörlü mini buzdolabı (Alpicool, Dometic, Indel B gibi). DC5525→araç çakmak (cigarette lighter) adaptörü ile bağlanabilir veya doğrudan güç istasyonunun 12V araç çıkışı kullanılabilir.</li>
<li><strong>12V fanlar:</strong> USB fanlardan çok daha güçlü hava akımı sağlar.</li>
</ul>

<h3>İletişim ve Ağ</h3>
<ul>
<li><strong>WiFi router/modem:</strong> Çoğu ev modemi 12V DC ile çalışır. DC5525 kablo ile doğrudan bağlanabilir. Elektrik kesintisinde internet erişimi sağlar.</li>
<li><strong>Güvenlik kamerası (IP kamera):</strong> PoE olmayan 12V DC güvenlik kameraları doğrudan beslenebilir.</li>
<li><strong>Ham radyo / telsiz:</strong> 12V DC çıkış ile amatör radyo cihazları çalıştırılabilir.</li>
</ul>

<h3>Bilgi Teknolojileri</h3>
<ul>
<li><strong>NAS (Network Attached Storage):</strong> Birçok NAS cihazı 12V DC adaptör kullanır.</li>
<li><strong>Mini bilgisayar (Intel NUC, Raspberry Pi):</strong> DC barrel jack ile doğrudan besleme.</li>
<li><strong>Monitör:</strong> Bazı taşınabilir monitörler DC5525 12V girişi destekler.</li>
</ul>

<h3>Medikal Cihazlar</h3>
<ul>
<li><strong>CPAP uyku apnesi cihazı:</strong> Birçok CPAP modeli DC adaptör seçeneği sunar. Gece boyunca sessiz ve verimli çalışma.</li>
<li><strong>Nebülizör:</strong> 12V DC girişli modeller mevcuttur.</li>
</ul>

<h3>Hobi ve Outdoor</h3>
<ul>
<li><strong>Elektrikli hava pompası:</strong> Şişme bot, kamp yatağı şişirme.</li>
<li><strong>Drone batarya şarj cihazı:</strong> Bazı şarj aletleri 12V DC girişi destekler.</li>
<li><strong>12V lehim havyası:</strong> Saha tamiratlarda kullanışlı.</li>
<li><strong>Araç kompresörü:</strong> Lastik şişirme.</li>
</ul>

<h2>DC5525 vs AC Çıkış: Enerji Verimliliği Karşılaştırması</h2>
<p>Bu bölüm, güç istasyonunuzdan <strong>neden DC çıkış kullanmanız gerektiğinin</strong> en önemli sebebini açıklar.</p>

<h3>Enerji Dönüşüm Zinciri</h3>
<p><strong>AC çıkış kullanıldığında:</strong></p>
<p>Batarya (DC) → İnverter (DC→AC dönüşüm) → Cihaz adaptörü (AC→DC dönüşüm) → Cihaz</p>
<p>Bu zincirde <strong>iki dönüşüm</strong> gerçekleşir ve her dönüşümde enerji kaybı olur:</p>
<ul>
<li>İnverter verimliliği: %85-92 (yani %8-15 kayıp)</li>
<li>Adaptör verimliliği: %80-90 (yani %10-20 kayıp)</li>
<li><strong>Toplam kayıp: %18-32</strong></li>
</ul>

<p><strong>DC5525 çıkış kullanıldığında:</strong></p>
<p>Batarya (DC) → DC-DC regülatör → Cihaz</p>
<p>Sadece <strong>bir dönüşüm</strong> ve DC-DC dönüşüm verimliliği çok yüksektir:</p>
<ul>
<li>DC-DC regülatör verimliliği: %95-98</li>
<li><strong>Toplam kayıp: sadece %2-5</strong></li>
</ul>

<h3>Gerçek Dünya Etkisi</h3>
<table>
<tr><th>Senaryo</th><th>AC ile</th><th>DC5525 ile</th><th>Tasarruf</th></tr>
<tr><td>WiFi modem (12W) 24 saat</td><td>~340Wh tüketim</td><td>~295Wh tüketim</td><td><strong>%13 tasarruf</strong></td></tr>
<tr><td>CPAP (30W) 8 saat</td><td>~285Wh tüketim</td><td>~248Wh tüketim</td><td><strong>%13 tasarruf</strong></td></tr>
<tr><td>LED aydınlatma (20W) 6 saat</td><td>~142Wh tüketim</td><td>~124Wh tüketim</td><td><strong>%13 tasarruf</strong></td></tr>
<tr><td>12V buzdolabı (50W ort.) 24 saat</td><td>~1420Wh tüketim</td><td>~1230Wh tüketim</td><td><strong>%13 tasarruf</strong></td></tr>
</table>

<p>Ortalama <strong>%13-20 enerji tasarrufu</strong> demek, güç istasyonunuzun <strong>aynı batarya ile %13-20 daha uzun çalışması</strong> demektir. Kamp gibi her Wh'in kıymetli olduğu durumlarda bu fark çok büyüktür!</p>

<h3>Diğer DC Avantajları</h3>
<ul>
<li><strong>Sessizlik:</strong> AC inverter çalışırken fan devreye girer ve hafif vızıltı yapar. DC çıkışta inverter devrede değildir, tamamen sessiz çalışır.</li>
<li><strong>Daha az ısı:</strong> İnverter ısı üretir. DC kullanımda güç istasyonu daha serin kalır.</li>
<li><strong>Daha uzun batarya ömrü:</strong> Daha az ısı = daha az termal stres = daha uzun batarya ömrü.</li>
<li><strong>Boşta tüketim:</strong> AC inverter açıkken yük olmasa bile 5-15W boşta enerji harcar. DC çıkış boşta neredeyse hiç harcamaz.</li>
</ul>

<h2>DC5525 Kullanırken Dikkat Edilecekler</h2>

<h3>Voltaj ve Polarite Uyumu</h3>
<p>DC5525 çıkışı <strong>13.2V</strong> sağlar. Bağlayacağınız cihazın giriş voltajının bu değerle uyumlu olduğundan emin olun (genellikle 12V DC cihazlar 10-15V aralığında çalışır). Polarite (merkez pin +, dış halka -) doğru olmalıdır. Yanlış polarite cihaza zarar verebilir!</p>

<h3>Akım Limiti</h3>
<p>DC5525 çıkışı maksimum <strong>8A</strong> sağlar. Cihazınızın çektiği akımın bu limitin altında olması gerekir. Hesaplama: Akım (A) = Güç (W) ÷ Voltaj (V). Örn: 60W cihaz → 60 ÷ 13.2 = 4.5A (güvenli aralıkta).</p>

<h3>Kablo Kalitesi</h3>
<p>Uzun kablolarda voltaj düşüşü yaşanabilir. Mümkünse 2 metreden kısa ve kalın kesitli (AWG 18 veya daha kalın) kablo kullanın.</p>

<h3>Adaptör ve Dönüştürücüler</h3>
<p>DC5525 → başka DC konnektörlere dönüştürücü kablolar piyasada yaygındır:</p>
<ul>
<li>DC5525 → DC5521 (5.5mm × 2.1mm) - en yaygın dönüşüm</li>
<li>DC5525 → Araç çakmak soketi (female cigarette lighter)</li>
<li>DC5525 → Anderson Powerpole</li>
<li>DC5525 → CPAP cihazı özel konnektörler (ResMed, Philips vb.)</li>
</ul>

<h2>Pratik Kullanım Senaryosu: Kamp Gecesi</h2>
<p>IEETek P1800 (1024Wh) ile bir kamp gecesi DC5525 kullanarak:</p>
<ul>
<li>12V LED şerit aydınlatma (15W × 5 saat) = 75Wh</li>
<li>12V buzdolabı (40W ort. × 12 saat) = 480Wh</li>
<li>WiFi hotspot (8W × 8 saat) = 64Wh</li>
<li>CPAP (25W × 8 saat) = 200Wh</li>
<li><strong>Toplam: 819Wh</strong> → P1800'ün %80'i, hala %20 yedek kalır</li>
</ul>
<p>Aynı cihazları AC ile çalıştırsaydınız ~940Wh harcanırdı ve yedek neredeyse kalmazdı!</p>

<h2>Sonuç</h2>
<p>DC5525 çıkışı, güç istasyonunuzdan maksimum verimlilik almanın anahtarıdır. 12V DC ile çalışan cihazlarınızı doğrudan DC çıkışa bağlayarak ortalama <strong>%13-20 enerji tasarrufu</strong> sağlar, daha sessiz çalışır ve güç istasyonunuzun batarya ömrünü uzatırsınız. IEETek P800, P1800, P3200 ve Singo2000 PRO modellerinin hepsinde DC5525 çıkışları mevcuttur. <a href="/kategori/tasinabilir-guc-kaynaklari">FusionMarkt güç istasyonlarını</a> inceleyin ve doğru modeli seçin.</p>`,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// SEED FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

async function seedBlogs() {
  console.log("🚀 Blog V2 seed başlıyor (VOC + DC5525)...\n");

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
