/**
 * FusionMarkt Blog Seed — 10
 * 19) Hibrit İnvertör ve ATS Nedir? Power Station'ı Ev Panosuna Bağlamak
 * 20) Solar Kablo ve Konnektör Rehberi: MC4, XT60, Anderson ve Kablo Kesiti
 *
 * Kullanım:
 *   cd packages/db && npx tsx prisma/seed-blog-10.ts
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
  // 19 — HİBRİT İNVERTÖR ve ATS
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "hibrit-invertor-ats-nedir-ev-panosu-baglanti",
    title: "Hibrit İnvertör ve ATS Nedir? Power Station'ı Ev Panosuna Bağlamak",
    excerpt:
      "Prizden cihaz beslemekle evi panodan yedeklemek aynı şey değil. Hibrit invertör, ATS, kritik yük panosu ve güvenli bağlantı mimarisini sade bir dille açıklıyoruz.",
    category: "Teknik",
    tags: [
      "hibrit invertör",
      "ATS nedir",
      "ev yedekleme sistemi",
      "power station pano bağlantısı",
      "kritik yük panosu",
      "SH4000",
    ],
    metaTitle: "Hibrit İnvertör ve ATS Nedir? Ev Panosu Bağlantı Rehberi",
    metaDescription:
      "Hibrit invertör, ATS ve kritik yük panosu nasıl çalışır? Power station ev tesisatına güvenli biçimde nasıl bağlanır, hangi cihazlar yedeklenir ve elektrikçi neyi hesaplar?",
    metaKeywords: [
      "hibrit invertör nedir",
      "ats nedir",
      "power station ev panosu bağlantısı",
      "otomatik transfer şalteri",
      "ev yedekleme sistemi",
      "kritik yük panosu",
    ],
    content: `<p>Taşınabilir bir güç istasyonunu kullanmanın en kolay yolu, cihazı odaya koyup ihtiyaç duyduğunuz ekipmanı doğrudan üzerindeki prizlere takmaktır. Modem, buzdolabı ve birkaç lamba için bu yöntem gayet iyi çalışır. Ancak beklentiniz elektrik kesildiğinde evdeki seçili devrelerin otomatik olarak çalışmaya devam etmesiyse, artık tek bir cihazdan değil küçük bir enerji sisteminden söz ediyoruz.</p>

<p>Bu sistemin merkezinde hibrit invertör, otomatik transfer şalteri ve kritik yük panosu bulunur. Terimler ilk bakışta endüstriyel görünse de mantık basit: enerji nereden gelirse gelsin güvenli biçimde yönetilir, şebeke kesilince seçili yükler bataryaya aktarılır ve şebeke geri geldiğinde sistem normal düzene döner.</p>

<blockquote>
<strong>Hızlı Cevap:</strong> Hibrit invertör; şebeke, güneş paneli ve bataryayı aynı sistemde yönetir. ATS, şebeke kesildiğinde yükü otomatik olarak yedek kaynağa geçirir. Ev panosuna bağlantı yalnızca bu amaç için tasarlanmış, sabit bağlantıyı destekleyen bir sistemle ve yetkili elektrikçi tarafından yapılmalıdır. <a href="/urun/5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000">SH4000</a>; 5120Wh batarya, 4000W sürekli çıkış, 8000W pik güç ve ATS uyumuyla bu kullanım için geliştirilmiştir.
</blockquote>

<h2>Önce İnvertörün İşini Ayıralım</h2>

<p>Batarya doğru akım (DC) depolar, ev tesisatı ise 220–230V alternatif akımla (AC) çalışır. İnvertör, bataryadaki DC enerjiyi ev cihazlarının kullanabileceği AC enerjiye dönüştürür. Solar panel sisteme bağlıysa bunun tersi yönde çalışan şarj elektroniği de gerekir: panelden gelen değişken DC gerilim, bataryanın kabul edeceği gerilime çevrilir.</p>

<p>Klasik bir invertör yalnızca dönüşüm yapar. <strong>Hibrit invertör</strong> ise aynı anda üç enerji kaynağını yönetir:</p>

<ul>
  <li><strong>Şebeke:</strong> Evi besler veya bataryayı şarj eder.</li>
  <li><strong>Güneş paneli:</strong> Önce anlık yükleri, sonra bataryayı besler.</li>
  <li><strong>Batarya:</strong> Güneş yetmediğinde veya şebeke kesildiğinde devreye girer.</li>
</ul>

<p>Bu kaynakların önceliği yazılımla belirlenebilir. Örneğin gündüz solar üretimi önce evde kullanıp fazlasını bataryaya gönderebilir, akşam bataryayı kullanabilir ve yalnızca batarya belirlenen seviyenin altına düştüğünde şebekeye geçebilirsiniz. Üç zamanlı tarifede gece şarj edip puant saatinde batarya kullanma senaryosunu <a href="/blog/uc-zamanli-tarife-power-station-elektrik-tasarrufu">elektrik tarifesi ve power station</a> yazımızda hesapladık.</p>

<h2>ATS Tam Olarak Ne Yapıyor?</h2>

<p>ATS, İngilizce <em>Automatic Transfer Switch</em> ifadesinin kısaltmasıdır; Türkçede otomatik transfer şalteri denir. Görevi, bir enerji kaynağı kullanılamaz hale geldiğinde yükü ikinci kaynağa aktarmaktır.</p>

<p>Şebeke varken kritik yük panosu normal biçimde şebekeden beslenir. ATS, gerilim ve frekansı sürekli izler. Şebeke belirlenen sınırların dışına çıktığında ya da tamamen kesildiğinde bağlantıyı ayırır, ardından yedek kaynağı devreye alır. Şebeke geri geldiğinde kararlı hale gelmesini birkaç saniye izler ve yükü yeniden şebekeye aktarır.</p>

<p>Buradaki en önemli güvenlik işlevi iki kaynağın aynı anda hatta bağlanmasını önlemektir. Şebeke kesildiğinde evinizdeki bataryanın sokaktaki hatta enerji basması, arıza üzerinde çalışan ekip için ölümcül olabilir. Uygun transfer ekipmanı bu geri beslemeyi fiziksel ve elektriksel olarak engeller.</p>

<h3>ATS ile UPS Aynı Şey mi?</h3>

<p>Değil. UPS, bağlı cihazı çok kısa bir geçiş süresiyle beslemeye devam eden bütünleşik bir güç sistemidir. ATS ise iki kaynağı seçen anahtarlama elemanıdır. Birlikte çalışabilirler ama aynı görevi yapmazlar.</p>

<table>
  <thead>
    <tr>
      <th>Özellik</th>
      <th>ATS</th>
      <th>UPS / EPS</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Ana görevi</td><td>İki kaynak arasında güvenli geçiş</td><td>Kesintide yükü beslemeye devam etmek</td></tr>
    <tr><td>Enerji depolar mı?</td><td>Hayır</td><td>Evet, batarya kullanır</td></tr>
    <tr><td>Tipik geçiş</td><td>Modele göre milisaniye–saniye</td><td>0–20 ms</td></tr>
    <tr><td>Ev panosuna uygunluk</td><td>Evet, doğru projelendirmeyle</td><td>Modele göre değişir</td></tr>
    <tr><td>Geri besleme koruması</td><td>Temel işlevlerinden biri</td><td>Tek başına her zaman sağlamaz</td></tr>
  </tbody>
</table>

<p>Bilgisayar, modem ve bazı elektronik cihazlar 10–20 milisaniyelik geçişi fark etmez. Motorlu cihazlar da genellikle sorun yaşamaz. Hastane cihazı, sunucu veya sıfır kesinti isteyen profesyonel yüklerde ise çevrim içi UPS gibi özel bir çözüm gerekir. İki sistemin farkını <a href="/blog/ups-mi-power-station-mi">UPS mi power station mı</a> yazımızda ayrıntılı karşılaştırdık.</p>

<h2>Kritik Yük Panosu Neden Gerekli?</h2>

<p>Bir evin tüm cihazlarını yedeklemek teoride mümkün, fakat her zaman ekonomik veya gerekli değil. Elektrikli fırın, ani su ısıtıcısı, elektrikli ocak ve büyük klima aynı anda çalıştığında toplam güç kolayca 10–15kW'a çıkar. Bu yükü yedeklemek büyük bir invertör ve çok daha fazla batarya gerektirir.</p>

<p>Kritik yük panosu, kesintide gerçekten çalışması gereken devreleri ana panodan ayırır. Tipik bir evde şunlar seçilir:</p>

<ul>
  <li>Buzdolabı ve derin dondurucu</li>
  <li>Modem, ağ ekipmanı ve güvenlik sistemi</li>
  <li>Kombi pompası ve kontrol elektroniği</li>
  <li>Temel aydınlatma devreleri</li>
  <li>Çalışma odası veya ev ofisi prizleri</li>
  <li>İhtiyaca göre tek bir küçük inverter klima</li>
</ul>

<p>Elektrikli fırın, ocak, termosifon, sauna ve yüksek güçlü ısıtıcılar genellikle kritik yük dışında bırakılır. Böylece 5,12kWh'lik bir batarya birkaç saatte tükenmek yerine temel ihtiyaçları gece boyunca besleyebilir.</p>

<h2>SH4000 ile Sistem Mimarisi</h2>

<p>SH4000, taşınabilir modellerden farklı olarak sabit ev enerjisi sistemi sınıfındadır. Temel teknik çerçevesi:</p>

<table>
  <thead>
    <tr><th>Özellik</th><th>SH4000</th><th>Pratik Karşılığı</th></tr>
  </thead>
  <tbody>
    <tr><td>Batarya</td><td>5120Wh LiFePO4</td><td>Temel ev yükleri için gece boyu yedekleme</td></tr>
    <tr><td>AC çıkış</td><td>4000W sürekli / 8000W pik</td><td>Buzdolabı, kombi, ofis ve inverter klima gibi karma yükler</td></tr>
    <tr><td>HV solar giriş</td><td>3000W, 70–450V</td><td>Sabit çatı panel dizisiyle hızlı günlük yenileme</td></tr>
    <tr><td>LV solar giriş</td><td>600W, 12–50V</td><td>Katlanabilir panel veya düşük gerilimli dizi</td></tr>
    <tr><td>AC şarj</td><td>3600W</td><td>Şebekeden hızlı tamamlama</td></tr>
    <tr><td>Koruma</td><td>IP54, IP65 opsiyonu</td><td>Toza ve su sıçramasına karşı koruma</td></tr>
    <tr><td>Genişletme</td><td>B5120 batarya modülleri</td><td>İhtiyaç büyüdükçe kapasite ekleme</td></tr>
  </tbody>
</table>

<p>Tipik enerji akışı şöyledir: solar paneller hibrit invertöre girer; invertör önce evdeki kritik yükleri besler, artan enerjiyi bataryaya gönderir. Güneş yetersizse batarya devreye girer. Batarya alt sınıra ulaştığında şebeke destek olur. Kesinti halinde ATS şebekeyi ayırır ve kritik yükler batarya-solardan çalışmayı sürdürür.</p>

<p>Panel kapasitesini bulunduğunuz şehre göre planlamak için <a href="/blog/turkiye-il-il-gunes-paneli-verimli-gunes-saati">il il verimli güneş saati tablomuzu</a>, seri dizi gerilimini belirlemek için <a href="/blog/solar-panel-seri-paralel-baglanti-rehberi">solar panel seri-paralel bağlantı rehberimizi</a> kullanabilirsiniz. Konuma özel üretim simülasyonu için Avrupa Komisyonu'nun <a href="https://re.jrc.ec.europa.eu/pvg_tools/en/" target="_blank" rel="noopener noreferrer">PVGIS aracında</a> panel yönü, eğimi ve sistem kaybı girilebilir.</p>

<h2>Çalışma Süresi Nasıl Hesaplanır?</h2>

<p>5120Wh etiket kapasitesinin tamamı AC tarafta kullanılamaz. İnvertör ve sistem kayıplarıyla gerçekçi kullanılabilir enerji yaklaşık 4350Wh kabul edilebilir. Ayrıntılı kayıp hesabını <a href="/blog/gercek-kullanilabilir-kapasite-wh-verim-kayiplari">gerçek kullanılabilir kapasite</a> yazımızda yaptık.</p>

<table>
  <thead>
    <tr><th>Yük Grubu</th><th>Ortalama Güç</th><th>Yaklaşık Süre</th></tr>
  </thead>
  <tbody>
    <tr><td>Modem + aydınlatma</td><td>30W</td><td>145 saat</td></tr>
    <tr><td>Buzdolabı + modem + aydınlatma</td><td>105W</td><td>41 saat</td></tr>
    <tr><td>Yukarıdakiler + kombi</td><td>205W</td><td>21 saat</td></tr>
    <tr><td>Ev ofisi + buzdolabı + temel yükler</td><td>350W</td><td>12 saat</td></tr>
    <tr><td>9000 BTU inverter klima + temel yükler</td><td>950W</td><td>4,5 saat</td></tr>
    <tr><td>1200W sabit yük</td><td>1200W</td><td>3,6 saat</td></tr>
  </tbody>
</table>

<p>Buzdolabı ve kombi gibi cihazlar kesintili çalıştığı için gerçek süre ortam sıcaklığına ve termostat davranışına bağlıdır. Klima için başlangıç akımı ve BTU hesabını <a href="/blog/power-station-ile-klima-calisir-mi">power station ile klima çalışır mı</a> yazımızda bulabilirsiniz.</p>

<h2>Ev Panosuna Güvenli Bağlantının Kuralları</h2>

<p>Bu bölüm bir montaj talimatı değildir. Ev panosu üzerinde çalışma elektrik çarpması, yangın ve geri besleme riski taşır; proje ve bağlantı yetkili elektrikçi tarafından yapılmalıdır. Kullanıcı olarak doğru teklifi değerlendirebilmeniz için kontrol edilmesi gereken başlıklar şunlardır:</p>

<ol>
  <li><strong>Yük envanteri çıkarılır.</strong> Hangi devrelerin yedekleneceği ve aynı anda çekebilecekleri sürekli-pik güç belirlenir.</li>
  <li><strong>Kritik yükler ayrılır.</strong> Seçili sigortalar ayrı bir alt panoya taşınır; yüksek güçlü gereksiz yükler dışarıda bırakılır.</li>
  <li><strong>Transfer sistemi boyutlandırılır.</strong> ATS'nin kutup sayısı, nominal akımı, geçiş mantığı ve mekanik-elektriksel kilitlemesi tesisata uygun seçilir.</li>
  <li><strong>Nötr ve topraklama düzeni incelenir.</strong> İnvertör çıkış topolojisine göre nötr anahtarlama ve kaçak akım koruması projelendirilir. Bu konu varsayımla çözülemez.</li>
  <li><strong>Kablo kesiti ve koruma elemanları hesaplanır.</strong> Hat uzunluğu, akım, döşeme biçimi ve gerilim düşümü dikkate alınır.</li>
  <li><strong>Solar tarafta DC koruma kurulur.</strong> Uygun DC sigorta, ayırıcı, aşırı gerilim koruması ve doğru polarite kullanılır.</li>
  <li><strong>Devreye alma testi yapılır.</strong> Şebeke kesilmesi, geri gelmesi, aşırı yük, kaçak akım ve acil ayırma senaryoları gerçek yük altında sınanır.</li>
</ol>

<p>IEC'nin alçak gerilim tesisatları için hazırladığı standart ailesi, bu koruma yaklaşımının uluslararası çerçevesidir. Güncel standart kataloğuna <a href="https://webstore.iec.ch/en/publication/4558" target="_blank" rel="noopener noreferrer">IEC 60364 sayfasından</a> ulaşılabilir. Türkiye'deki kurulumda yürürlükteki ulusal yönetmelik ve dağıtım şirketi şartları ayrıca uygulanır.</p>

<h2>Kesinlikle Yapılmaması Gereken Bağlantı</h2>

<p>İnternette zaman zaman görülen “erkek-erkek kabloyla power station'ı duvar prizine bağlama” yöntemi ölümcüldür. Halk arasında suicide cable olarak anılan bu kablo, fiş uçlarını enerjili bırakır ve elektrik çarpmasına yol açabilir. Ana şalter kapatılsa bile mekanik kilit olmadığı için birinin şalteri açmasıyla şebekeye geri besleme başlar.</p>

<p>Taşınabilir <a href="/urun/512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800">P800</a>, <a href="/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800">P1800</a> ve <a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200</a> modelleri cihazları kendi prizlerinden beslemek için kullanılmalıdır. Ev tesisatına kalıcı entegrasyon için ATS uyumlu sabit sistem tercih edilmelidir.</p>

<h2>Sıkça Sorulan Sorular</h2>

<h3>Elektrik kesildiğinde geçişi hisseder miyim?</h3>
<p>Sistemin moduna ve transfer donanımına bağlıdır. Milisaniye seviyesindeki EPS geçişinde modem, televizyon ve bilgisayarların çoğu çalışmaya devam eder. Aydınlatmada kısa bir titreme görülebilir. Sıfır kesinti gerektiren ekipman için çevrim içi UPS kullanılmalıdır.</p>

<h3>SH4000 bütün evi çalıştırabilir mi?</h3>
<p>4000W sürekli güç sınırı içinde evet, fakat “bütün ev” aynı anda çalışan cihazlara bağlıdır. Buzdolabı, kombi, modem, ışıklar, televizyon ve küçük bir inverter klima birlikte yönetilebilir. Fırın, ocak, termosifon ve birden fazla klima aynı anda kullanılırsa sınır aşılır. Bu yüzden kritik yük panosu önerilir.</p>

<h3>Solar panel olmadan kullanılabilir mi?</h3>
<p>Evet. Sistem yalnızca şebekeden şarj edilip kesinti yedeklemesi olarak çalışabilir. Solar eklendiğinde günlük tüketimin bir kısmı güneşten karşılanır ve uzun kesintilerde batarya yeniden doldurulabilir.</p>

<h3>ATS yerine manuel transfer şalteri kullanılabilir mi?</h3>
<p>Kullanılabilir. Manuel şalter daha basit ve ekonomiktir ancak kesinti anında sizin müdahale etmeniz gerekir. Ev boşken, gece veya erişimin zor olduğu kurulumlarda otomatik transfer daha kullanışlıdır. Her iki çözümde de mekanik kilitleme ve geri besleme koruması zorunludur.</p>

<h3>Kurulum için dağıtım şirketi izni gerekir mi?</h3>
<p>Sistem şebekeye enerji ihraç etmeyen, yalnızca yedekleme yapan ada modunda kuruluyorsa süreç; tesisat ve uygulama biçimine göre değerlendirilir. Şebekeye üretim satılacak veya çift yönlü bağlantı kurulacaksa dağıtım şirketi başvurusu ve ilgili lisanssız üretim prosedürleri gerekir. Kurulumdan önce yetkili elektrik mühendisi ve bölgenizdeki dağıtım şirketiyle doğrulama yapılmalıdır.</p>

<h2>Eviniz İçin Doğru Mimari</h2>

<p>Önce kesintide açık kalması gereken cihazları seçin, sonra bu grubun eşzamanlı gücünü ve günlük enerjisini hesaplayın. İhtiyaç birkaç prizle sınırlıysa taşınabilir model daha sade ve ekonomiktir. Seçili ev devrelerinin otomatik çalışması ve solar üretimin sürekli yönetilmesi gerekiyorsa hibrit sistem anlam kazanır.</p>

<p>Cihaz listenizi <a href="/guc-hesaplayici">güç hesaplayıcıya</a> girerek başlangıç kapasitesini bulabilir, sabit sistem için <a href="/sh4000">SH4000 çözüm sayfasını</a> inceleyebilirsiniz. Pano fotoğrafı, cihaz listesi ve solar kurulum alanını <a href="/iletisim">bizimle paylaştığınızda</a> elektrikçinizin projelendirmesine temel olacak sistem boyutunu birlikte çıkarabiliriz.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // 20 — SOLAR KABLO ve KONNEKTÖR
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "solar-kablo-konnektor-mc4-xt60-anderson-kesit-hesabi",
    title: "Solar Kablo ve Konnektör Rehberi: MC4, XT60, Anderson ve Kablo Kesiti",
    excerpt:
      "Panel ile güç istasyonu arasındaki küçük görünen bağlantılar üretimi ve güvenliği belirler. Konnektör türleri, polarite, uzatma kablosu ve kesit hesabı tek rehberde.",
    category: "Solar",
    tags: [
      "solar kablo",
      "MC4 konnektör",
      "XT60",
      "Anderson konnektör",
      "kablo kesiti hesaplama",
      "solar gerilim düşümü",
    ],
    metaTitle: "Solar Kablo Rehberi: MC4, XT60 ve Kablo Kesiti Hesabı",
    metaDescription:
      "MC4, XT60 ve Anderson konnektör farkları; doğru polarite, solar uzatma kablosu ve 2,5–4–6 mm² kesit seçimi. Gerilim düşümü hesabı ve güvenli bağlantı kuralları.",
    metaKeywords: [
      "solar kablo kesiti",
      "mc4 xt60 dönüştürücü",
      "güneş paneli uzatma kablosu",
      "anderson konnektör",
      "solar gerilim düşümü hesaplama",
      "mc4 bağlantı",
    ],
    content: `<p>Güneş paneli kurulumunda bütün dikkat panelin watt değerine ve bataryanın kapasitesine gider. Aradaki kablo ve konnektörler ise kutudan çıkan aksesuar gibi görülür. Oysa yanlış kesitli on metrelik bir kablo, panelinizin ürettiği enerjinin %10'undan fazlasını daha güç istasyonuna ulaşmadan ısıya çevirebilir.</p>

<p>Daha kötüsü, farklı üreticilerin konnektörlerini görünüşleri uyuyor diye birleştirmek temas direncini yükseltebilir; bu da uzun süreli yüksek akım altında erime ve yangın riski doğurur. Solar bağlantı zincirinin her parçasını doğru seçmek hem verim hem güvenlik meselesidir.</p>

<blockquote>
<strong>Hızlı Cevap:</strong> Panel tarafında dış ortam dayanımı için MC4, taşınabilir güç istasyonu girişinde kompakt ve güvenli bağlantı için XT60 yaygındır. Uzatma kablosunda 5 metreye kadar çoğu 100–200W sistem için 2,5–4 mm², 10 metre ve yüksek akım için 4–6 mm² bakır kablo gerekir. Hedef toplam gerilim düşümü <strong>%3'ün altında</strong> olmalıdır. SP100, SP200 ve SP400 paneller MC4 çıkış verir; ürünlerimizle gelen MC4–XT60 kablo doğrudan uyum sağlar.
</blockquote>

<h2>Bağlantı Zincirini Haritalandıralım</h2>

<p>Taşınabilir bir solar sistemde enerji şu yolu izler:</p>

<p><strong>Panel hücreleri → panel çıkış kablosu → MC4 konnektör → uzatma veya dönüştürücü kablo → XT60 giriş → MPPT kontrolcü → batarya</strong></p>

<p>Bu zincirin her noktasında üç değer uyumlu olmalıdır: gerilim, akım ve polarite. Panelin açık devre gerilimi güç istasyonunun kabul aralığını aşmamalı; akım konnektör ve kablonun taşıma kapasitesi içinde kalmalı; artı ve eksi uçlar doğru bağlanmalıdır.</p>

<p>Gerilim ve akımı panel etiketinden nasıl okuyacağınızı <a href="/blog/batarya-voc-degeri-nedir-neden-yukselir">VOC ve açık devre gerilimi</a> yazımızda, birden fazla panelde değerlerin nasıl toplandığını <a href="/blog/solar-panel-seri-paralel-baglanti-rehberi">seri-paralel bağlantı rehberimizde</a> anlattık.</p>

<h2>MC4: Panel Tarafının Standardı</h2>

<p>MC4 adı “Multi-Contact, 4 mm” ifadesinden gelir. Güneş paneli sektöründe fiili standarttır çünkü dış ortamda yıllarca kalacak şekilde tasarlanmıştır: kilitli bağlantı, düşük temas direnci, UV dayanımlı gövde ve uygun montajda su-toz koruması.</p>

<p>MC4'ün en önemli özellikleri:</p>

<ul>
  <li>Takıldığında kendiliğinden çıkmayan kilitli yapı</li>
  <li>Tipik olarak 30A ve 1000–1500V DC seviyesine kadar ürün seçenekleri</li>
  <li>UV, sıcaklık değişimi ve dış ortam koşullarına dayanıklı plastik gövde</li>
  <li>Özel sıkma pensesiyle düşük dirençli krimp bağlantı</li>
  <li>Seri ve paralel dallandırma için standart Y konnektör seçenekleri</li>
</ul>

<p>Ancak “MC4 uyumlu” ifadesi, iki farklı markanın konnektörlerinin güvenli biçimde eşleştiği anlamına gelmez. Boyutlar çok yakın görünse de temas yüzeyi, metal alaşım ve conta toleransı farklı olabilir. IEC 62852 standardı fotovoltaik DC konnektörlerin tasarım ve test şartlarını tanımlar; standardın kapsamı <a href="https://webstore.iec.ch/en/publication/32834" target="_blank" rel="noopener noreferrer">IEC'nin resmi kataloğunda</a> görülebilir.</p>

<h3>MC4 Bağlantıda En Sık Yapılan Hatalar</h3>

<ul>
  <li><strong>Pense yerine pense-benzeri el aleti kullanmak:</strong> Terminal kabloyu tam kavramaz, temas direnci ve ısınma artar.</li>
  <li><strong>Farklı marka gövdeleri eşleştirmek:</strong> Dışarıdan kilitlense bile metal terminaller tam temas etmeyebilir.</li>
  <li><strong>Kablo çapına uymayan conta kullanmak:</strong> Su sızdırmazlık bozulur.</li>
  <li><strong>Yük altında ayırmak:</strong> DC arkı oluşabilir ve terminal yüzeyi zarar görür. Önce paneli gölgeleyin veya DC ayırıcıyı kapatın.</li>
  <li><strong>Konnektörü yerde bırakmak:</strong> IP derecesi takılı ve doğru monte edilmiş bağlantı için geçerlidir; açık uç suya karşı korunmaz.</li>
</ul>

<h2>XT60: Güç İstasyonlarının Kompakt Girişi</h2>

<p>XT60, uzaktan kumandalı araç ve batarya dünyasından doğup taşınabilir enerji sistemlerine geçen iki kutuplu bir DC konnektördür. Adındaki 60, tasarım ailesinin nominal akım sınıfını ifade eder. Altın kaplamalı yaylı terminalleri, küçük hacimde düşük temas direnci sağlar.</p>

<p>Taşınabilir güç istasyonlarında tercih edilmesinin nedenleri:</p>

<ul>
  <li>Artı ve eksiyi tek gövdede taşıdığı için ters takılamaz.</li>
  <li>Kompakt, sağlam ve çok sayıda tak-çıkar döngüsüne dayanıklıdır.</li>
  <li>100–1000W sınıfındaki taşınabilir solar sistemlerin akımını rahatlıkla taşır.</li>
  <li>MC4–XT60 ve araç prizi–XT60 dönüştürücüleri yaygındır.</li>
</ul>

<p>XT60 dış ortam konnektörü değildir. MC4 bağlantı yağmurda panel yanında kalabilir; XT60 uç ve güç istasyonu ise kuru alanda tutulmalıdır. <a href="/urun/tasinabilir-gunes-paneli-100w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp100">SP100</a>, <a href="/urun/tasinabilir-gunes-paneli-200w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp200">SP200</a> ve <a href="/urun/tasinabilir-gunes-paneli-400w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp400">SP400</a> IP67 korumalıdır; taşınabilir güç istasyonları IP20 sınıfındadır. Farkı <a href="/blog/ip20-ip54-ip65-ip67-koruma-sinifi-rehberi">IP koruma sınıfı rehberimizde</a> bulabilirsiniz.</p>

<h2>Anderson: Yüksek Akım ve Araç Uygulamaları</h2>

<p>Anderson tipi konnektörler, cinsiyetsiz gövdeleri ve yüksek akım kapasiteleriyle karavan, araç, forklift ve büyük DC sistemlerinde kullanılır. Aynı iki gövde birbirine bağlandığı için erkek-dişi ayrımı yoktur; renk kodları farklı gerilim sistemlerinin yanlışlıkla birleştirilmesini önlemeye yardımcı olur.</p>

<p>Solar panelden ziyade şu noktalarda anlamlıdır:</p>

<ul>
  <li>Araç alternatöründen yüksek akımlı şarj hattı</li>
  <li>Karavan servis bataryası bağlantısı</li>
  <li>Harici batarya modülleri</li>
  <li>20A üzerindeki düşük gerilimli DC yükler</li>
</ul>

<p>Anderson gövdelerinin fiziksel olarak birbirine uyması, farklı gerilimlerin güvenle bağlanabileceği anlamına gelmez. Renk, kablo etiketi ve sigorta koordinasyonu mutlaka yapılmalıdır.</p>

<h2>Hangi Konnektör Nerede Kullanılır?</h2>

<table>
  <thead>
    <tr>
      <th>Konnektör</th>
      <th>En Uygun Yer</th>
      <th>Güçlü Yönü</th>
      <th>Dikkat Edilecek</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>MC4</td><td>Panel ve dış ortam DC hattı</td><td>UV, su ve kilit dayanımı</td><td>Aynı üretici ailesini eşleştirin; yük altında ayırmayın</td></tr>
    <tr><td>XT60 / XT60i</td><td>Taşınabilir güç istasyonu girişi</td><td>Kompakt, düşük dirençli, ters takılamaz</td><td>Su geçirmez değildir; polarite adaptörde kontrol edilmeli</td></tr>
    <tr><td>Anderson SB</td><td>Karavan, araç, yüksek akım DC</td><td>Cinsiyetsiz, dayanıklı, yüksek akım</td><td>Gövde boyutu, renk ve terminal kesiti uyumlu olmalı</td></tr>
    <tr><td>DC5525</td><td>Küçük modem, kamera ve DC cihazlar</td><td>Ucuz ve yaygın</td><td>Düşük akım; gevşemeye ve polarite farkına dikkat</td></tr>
    <tr><td>Araç prizi</td><td>12V araç aksesuarları</td><td>Çok yaygın</td><td>Titreşimde gevşer, yüksek akım için verimsizdir</td></tr>
  </tbody>
</table>

<p>Küçük DC cihazlarda kullanılan silindirik çıkışlar için <a href="/blog/dc5525-cikis-nedir-hangi-cihazlar-kullanilir">DC5525 çıkış rehberimize</a> bakabilirsiniz.</p>

<h2>Kablo Kesiti Neden Önemli?</h2>

<p>Kablonun elektriksel direnci üç şeye bağlıdır: malzeme, uzunluk ve kesit. Bakır sabit kabul edilirse kablo uzadıkça direnç artar, kesit büyüdükçe azalır.</p>

<p><strong>Gerilim düşümü (V) = Akım (A) × Kablo direnci (Ω)</strong></p>

<p>Gidiş ve dönüş iletkenleri birlikte hesaba katıldığı için panel ile güç istasyonu arasındaki fiziksel mesafenin iki katı kullanılır. Bakır kablo için pratik formül:</p>

<p><strong>Gerilim düşümü (V) ≈ 0,0175 × 2 × Mesafe (m) × Akım (A) ÷ Kesit (mm²)</strong></p>

<p>Örnek: 18V ve 5,6A üreten <a href="/urun/tasinabilir-gunes-paneli-100w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp100">SP100</a>, güç istasyonundan 10 metre uzakta ve 2,5 mm² kablo kullanılıyor:</p>

<p><strong>Düşüm = 0,0175 × 2 × 10 × 5,6 ÷ 2,5 = 0,78V</strong></p>

<p>0,78V / 18V = <strong>%4,3 kayıp</strong>. Bu hedefimiz olan %3'ün üzerinde. Aynı hattı 4 mm² yaparsak düşüm 0,49V'a, yani %2,7'ye iner. Sadece kablo kesitini büyüterek yaklaşık 1,6 puan üretimi geri kazanırız.</p>

<h2>SP Serisi İçin Pratik Kesit Tablosu</h2>

<p>Aşağıdaki öneriler saf bakır, solar uyumlu kablo ve toplam gerilim düşümünün yaklaşık %3 altında tutulması hedefiyle hazırlanmıştır. Mesafe, panel ile güç istasyonu arasındaki tek yön uzaklıktır.</p>

<table>
  <thead>
    <tr>
      <th>Panel</th>
      <th>Çalışma Değeri</th>
      <th>0–5 m</th>
      <th>5–10 m</th>
      <th>10–20 m</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>SP100</td>
      <td>18V / 5,6A</td>
      <td>2,5 mm²</td>
      <td>4 mm²</td>
      <td>6 mm²</td>
    </tr>
    <tr>
      <td>SP200</td>
      <td>24V / 8,33A</td>
      <td>2,5 mm²</td>
      <td>4 mm²</td>
      <td>6 mm²</td>
    </tr>
    <tr>
      <td>SP400</td>
      <td>44V / 10A</td>
      <td>2,5 mm²</td>
      <td>4 mm²</td>
      <td>6 mm²</td>
    </tr>
    <tr>
      <td>2× SP200 paralel</td>
      <td>24V / 16,66A</td>
      <td>4 mm²</td>
      <td>6 mm²</td>
      <td>10 mm² veya seri bağlantı</td>
    </tr>
    <tr>
      <td>2× SP400 paralel</td>
      <td>44V / 20A</td>
      <td>4 mm²</td>
      <td>6 mm²</td>
      <td>10 mm² veya seri bağlantı</td>
    </tr>
  </tbody>
</table>

<p>Tablo aynı zamanda seri bağlantının kablo avantajını gösteriyor. İki paneli seri bağladığınızda gerilim iki katına çıkar, akım aynı kalır; aynı enerjiyi daha düşük yüzde kayıpla taşırsınız. Ancak toplam açık devre gerilimi güç istasyonunun giriş sınırını aşmamalıdır. <a href="/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800">P1800</a> 10–52V, <a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200</a> 12–80V solar giriş aralığına sahiptir.</p>

<h2>Kesitten Başka Kablo Üzerinde Ne Aranmalı?</h2>

<ul>
  <li><strong>Saf bakır iletken:</strong> CCA adı verilen bakır kaplı alüminyum kablo, aynı kesitte bakırdan yaklaşık %60 daha yüksek dirence sahiptir. Solar hatta kullanmayın.</li>
  <li><strong>Solar kablo standardı:</strong> H1Z2Z2-K veya eşdeğer PV kablolar, UV, ozon, sıcaklık ve dış ortam koşulları için tasarlanır.</li>
  <li><strong>Gerilim sınıfı:</strong> Sabit yüksek gerilimli dizilerde kablonun DC gerilim sınıfı panel dizisinin maksimum Voc değerinin üzerinde olmalıdır.</li>
  <li><strong>Sıcaklık dayanımı:</strong> Çatı altında ve panel arkasında kablo sıcaklığı ortamdan çok daha yükseğe çıkabilir.</li>
  <li><strong>Esneklik:</strong> Katlanabilir panelle sürekli sarılıp açılan kablo, ince çok telli yapıda olmalıdır.</li>
  <li><strong>Renk ve etiket:</strong> Artı-eksi uçları iki tarafta da kalıcı biçimde işaretleyin; adaptör değişiminde yalnızca kablo rengine güvenmeyin.</li>
</ul>

<h2>Polarite: “Takılıyorsa Doğrudur” Varsayımı Yapmayın</h2>

<p>MC4'te gövdenin dış görünüşü ile elektriksel cinsiyet kafa karıştırabilir. Üstelik XT60 adaptörleri farklı üreticiler tarafından ters polaritede hazırlanabilir. Uyumlu görünen bir kabloyu ilk kez kullanmadan önce multimetreyle kontrol edin.</p>

<ol>
  <li>Multimetreyi DC voltaj konumuna alın ve panelin beklenen geriliminden yüksek aralığı seçin.</li>
  <li>Kırmızı probu adaptörün artı kabul edilen ucuna, siyah probu eksi ucuna değdirin.</li>
  <li>Ekranda pozitif değer görüyorsanız polarite doğrudur. Değerin önünde eksi işareti varsa uçlar terstir.</li>
  <li>Ölçülen açık devre geriliminin cihazın maksimum solar girişinden düşük olduğunu tekrar doğrulayın.</li>
</ol>

<p>Ters polarite koruması bulunan cihazlarda BMS veya MPPT bağlantıyı reddedebilir; ancak korumaya güvenip yanlış kablo kullanmak doğru değildir. Bazı cihazlarda ters bağlantı giriş katına kalıcı zarar verebilir.</p>

<h2>Sigorta ve Ayırıcı Ne Zaman Gerekir?</h2>

<p>Tek bir katlanabilir paneli kutudan çıkan kısa kabloyla güç istasyonuna bağladığınız basit sistemde ayrı sigorta çoğunlukla gerekmez; panelin kısa devre akımı kendi kablosunun taşıma kapasitesinin altındadır ve istasyonun giriş koruması bulunur.</p>

<p>Şu durumlarda DC sigorta veya ayırıcı profesyonel tasarımın parçası olmalıdır:</p>

<ul>
  <li>Üç veya daha fazla paralel panel kolu varsa</li>
  <li>Kablo uzunluğu ve fiziksel hasar riski yüksekse</li>
  <li>Sabit çatı veya bina kurulumu yapılıyorsa</li>
  <li>Batarya tarafında yüksek akımlı DC hat bulunuyorsa</li>
  <li>Bakım sırasında panel dizisini güvenli biçimde ayırmak gerekiyorsa</li>
</ul>

<p>DC akımın sıfır geçişi olmadığı için AC sigorta veya şalteri DC hatta gelişigüzel kullanılamaz. Koruma elemanının açıkça DC gerilim ve akım sınıfına sahip olması gerekir. Sabit ev sistemi planlıyorsanız bağlantı mimarisini <a href="/blog/hibrit-invertor-ats-nedir-ev-panosu-baglanti">hibrit invertör ve ATS rehberimizde</a> okuyabilirsiniz.</p>

<h2>Sahada Sorun Bulmanın Hızlı Yolu</h2>

<p>Paneliniz beklenenden az üretiyorsa doğrudan paneli suçlamadan önce bağlantı zincirini sırayla kontrol edin:</p>

<ol>
  <li><strong>Panel çıkışında Voc ölçün.</strong> Etiket değerine yakınsa panel ve ana kablo çalışıyor.</li>
  <li><strong>Uzatma kablosunun sonunda Voc ölçün.</strong> Yüksüz gerilim ciddi düşüyorsa bağlantıda kopukluk veya kötü temas vardır.</li>
  <li><strong>Yük altında iki uçtaki gerilimi karşılaştırın.</strong> Fark, kablo ve konnektör kaybını gösterir.</li>
  <li><strong>Konnektör sıcaklığını kontrol edin.</strong> Diğer kablodan belirgin sıcak bir konnektör yüksek temas direnci işaretidir; sistemi kapatın.</li>
  <li><strong>Gölge ve açıya bakın.</strong> Kablo sorunu yoksa panelin bir hücresindeki küçük gölge bile üretimi düşürebilir.</li>
</ol>

<p>Mevsim, sıcaklık ve gölgenin üretime etkisini <a href="/blog/gunes-paneli-verimi-mevsimler-hava-durumu-cografya">güneş paneli verimi</a> yazımızda; şehrinize göre beklenebilecek günlük enerjiyi <a href="/blog/turkiye-il-il-gunes-paneli-verimli-gunes-saati">il il solar üretim tablomuzda</a> bulabilirsiniz.</p>

<h2>Sıkça Sorulan Sorular</h2>

<h3>MC4 kablosunu kesip XT60 lehimleyebilir miyim?</h3>
<p>Teknik olarak yapılabilir ama dış ortam dayanımı ve garanti açısından hazır, doğru kesitli MC4–XT60 adaptör kullanmak daha güvenlidir. Lehimli ek titreşim altında yorulabilir; kablo birleşimi yapılacaksa uygun krimp terminal, ısıyla daralan yapışkanlı makaron ve mekanik gerilim koruması gerekir.</p>

<h3>Kabloyu uzattıkça panelin şarj gücü düşer mi?</h3>
<p>Evet, aynı kesitte uzunluk arttıkça direnç ve kayıp artar. Mesafeyi iki katına çıkarırsanız gerilim düşümü de iki katına çıkar. Çözüm kablo kesitini büyütmek veya giriş sınırı izin veriyorsa panelleri seri bağlayarak akımı düşürmektir.</p>

<h3>4 mm² yerine 6 mm² kullanmak zarar verir mi?</h3>
<p>Elektriksel olarak zarar vermez; kaybı azaltır. Ancak büyük kesit konnektör terminaline fiziksel olarak sığmayabilir ve kablo ağırlaşır. Konnektörün kabul ettiği kesit aralığını kontrol edin.</p>

<h3>MC4 bağlantı yağmurda kalabilir mi?</h3>
<p>Aynı üreticiye ait uyumlu parçalar doğru krimplenmiş, somunları sıkılmış ve birbirine tam kilitlenmişse dış ortam için tasarlanmıştır. Açık, eşleşmemiş MC4 uçları su geçirmez kabul edilmez; kullanmadığınız uçlara koruyucu kapak takın.</p>

<h3>Paneli güç istasyonuna bağlarken önce hangi ucu takmalıyım?</h3>
<p>Üreticinin kılavuzu önceliklidir. Genel pratikte dönüştürücü kablo önce güç istasyonuna, ardından panel MC4 uçlarına bağlanır; sökme işlemi ters sırada yapılır. MC4'ü yük altında ayırmadan önce solar girişi kapatın veya paneli tamamen gölgeleyin.</p>

<h3>İki farklı marka paneli Y konnektörle paralel bağlayabilir miyim?</h3>
<p>Gerilim değerleri yakınsa teknik olarak mümkündür, ancak düşük gerilimli panel çalışma noktasını sınırlar ve farklı konnektör markalarının eşleştirilmesi risk oluşturur. En güvenli ve verimli yöntem aynı model, aynı güç ve aynı kablo uzunluğundaki panelleri kullanmaktır.</p>

<h2>Bağlantı Setinizi Seçerken</h2>

<p>Panelin Voc, çalışma gerilimi ve akımını; güç istasyonunun giriş aralığıyla yan yana yazın. Ardından tek yön kablo mesafesini belirleyip kesiti %3 gerilim düşümü sınırına göre seçin. Son olarak konnektörlerin aynı aileden, kablonun saf bakır ve dış ortam kullanımına uygun olduğunu doğrulayın.</p>

<p>Hazır bir başlangıç için <a href="/kategori/gunes-panelleri">SP100, SP200 ve SP400 güneş panelleri</a> kendi MC4 çıkışları ve uyumlu dönüştürücü kablolarıyla sunulur. Batarya-panel eşleşmesini <a href="/guc-hesaplayici">güç hesaplayıcı</a> üzerinden yapabilir, uzun mesafe veya çoklu panel kurulumu için değerlerinizi <a href="/iletisim">bize göndererek</a> kablo ve bağlantı önerisi alabilirsiniz.</p>`,
  },
];

async function main() {
  console.log("🚀 Blog Seed 10 başlıyor...\n");

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

  console.log("\n🎉 Blog Seed 10 tamamlandı.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Hata:", e);
  prisma.$disconnect();
  process.exit(1);
});
