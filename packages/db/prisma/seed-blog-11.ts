/**
 * FusionMarkt Blog Seed — 11
 * 21) BMS Nedir? %99,99 BMS Ne Anlama Geliyor?
 * 22) Kombim Power Station'a Bağlayınca Neden Çalışmıyor?
 * 23) Güç İstasyonum Neden Beklediğimden Erken Bitiyor?
 * 24) CE, UN38.3, MSDS, FCC Ne Anlama Gelir?
 *
 * Kullanım:
 *   cd packages/db && npx tsx prisma/seed-blog-11.ts
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
  // 21 — BMS NEDİR
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "bms-nedir-batarya-yonetim-sistemi-korumalari",
    title: "BMS Nedir? %99,99 BMS Ne Anlama Geliyor ve Hangi Korumaları Sağlar?",
    excerpt:
      "Ürün başlıklarında geçen BMS ifadesi pazarlama süsü değil, bataryanın beyni. Hücre dengeleme, aşırı akım kesme ve sıcaklık koruması nasıl çalışır, sade bir dille anlatıyoruz.",
    category: "Teknik",
    tags: [
      "BMS nedir",
      "batarya yönetim sistemi",
      "hücre dengeleme",
      "LiFePO4 koruma",
      "aşırı akım koruması",
      "batarya güvenliği",
    ],
    metaTitle: "BMS Nedir? Batarya Yönetim Sistemi ve Koruma Katmanları",
    metaDescription:
      "BMS (Batarya Yönetim Sistemi) nedir, ne işe yarar? Hücre dengeleme, aşırı şarj, aşırı akım, kısa devre ve sıcaklık korumaları nasıl çalışır? %99,99 BMS ifadesinin anlamı.",
    metaKeywords: [
      "bms nedir",
      "batarya yönetim sistemi nedir",
      "hücre dengeleme",
      "lifepo4 bms",
      "batarya koruma devresi",
      "power station bms",
    ],
    content: `<p>Taşınabilir güç kaynaklarının ürün başlıklarında sürekli aynı ifadeyi görürsünüz: “%99,99 BMS”. Çoğu kişi bunu bir pazarlama süsü sanır ve geçer. Oysa BMS, bir güç istasyonunun içindeki en kritik elektronik karttır. Bataryayı yöneten, koruyan ve ömrünü belirleyen şey odur.</p>

<p>Aynı hücrelerden yapılmış iki cihazdan biri sekiz yıl sorunsuz çalışırken diğerinin üçüncü yılda kapasitesinin yarısını kaybetmesinin sebebi genellikle hücre kalitesi değil, o hücreleri yöneten sistemin kalitesidir.</p>

<blockquote>
<strong>Hızlı Cevap:</strong> BMS (Battery Management System / Batarya Yönetim Sistemi), batarya paketindeki her hücrenin gerilimini, akımını ve sıcaklığını sürekli ölçen; sınır aşıldığında devreyi kesen elektronik kontrol sistemidir. Aşırı şarj, aşırı deşarj, aşırı akım, kısa devre ve sıcaklık korumalarını sağlar, hücreleri birbirine dengeler. “%99,99” ifadesi, sistemin ölçüm ve koruma tetikleme doğruluğuna işaret eden üretici beyanıdır; hücrelerin dengede tutulma hassasiyetini anlatır.
</blockquote>

<h2>Batarya Paketi Aslında Tek Bir Parça Değil</h2>

<p>Bir LiFePO4 hücresinin nominal gerilimi yaklaşık 3,2 volttur. Ev cihazlarını besleyecek gerilime ulaşmak için bu hücreler seri bağlanır. <a href="/urun/512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800">P800</a> modelindeki 25,6V'luk paket 8 hücrenin, <a href="/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800">P1800</a> ve <a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200</a> modellerindeki 51,2V'luk paket ise 16 hücrenin arka arkaya dizilmesiyle oluşur.</p>

<p>Buradaki sorun şu: seri bağlı hücreler aynı akımı taşır ama tamamen aynı davranmaz. Üretim toleransı, iç direnç farkı ve paketin içindeki sıcaklık dağılımı yüzünden bir hücre diğerlerinden biraz daha hızlı dolar veya biraz daha hızlı boşalır.</p>

<p>Zincirin gücü en zayıf halkası kadardır. Şarj sırasında bir hücre üst sınıra ilk ulaştığında paketin tamamı durmak zorundadır; deşarjda ise bir hücre alt sınıra düştüğünde sistem kapanır. Yani en zayıf hücre, diğer 15 hücrenin ne kadar enerji verebileceğini belirler.</p>

<h2>BMS'in Beş Temel Görevi</h2>

<h3>1. Ölçüm ve İzleme</h3>

<p>BMS her hücrenin gerilimini ayrı ayrı okur, paketten geçen akımı ölçer ve pakete yerleştirilmiş sıcaklık sensörlerini takip eder. Bu veriler saniyede birçok kez yenilenir. Uygulama üzerinden gördüğünüz kalan yüzde, tahmini süre ve giriş-çıkış gücü değerleri bu ölçümlerden üretilir.</p>

<h3>2. Hücre Dengeleme (Balancing)</h3>

<p>Dengeleme, hücreler arasındaki gerilim farkını kapatma işlemidir. En yaygın yöntem pasif dengelemedir: şarjın sonuna doğru öne geçen hücrenin fazla enerjisi küçük bir direnç üzerinden ısıya çevrilerek harcanır, diğerlerinin yetişmesi beklenir. Aktif dengeleme ise enerjiyi harcamak yerine dolu hücreden boş hücreye aktarır; daha verimli ama daha karmaşık ve pahalıdır.</p>

<p>Dengeleme olmadan geçen her döngüde farklar birikir. Birkaç yüz döngü sonra paket, en zayıf hücresi yüzünden etiket kapasitesinin belirgin biçimde altında çalışmaya başlar. İşte “%99,99” gibi ifadeler, üreticinin hücreleri birbirine ne kadar yakın tuttuğunu anlatan hassasiyet beyanıdır.</p>

<h3>3. Koruma ve Kesme</h3>

<p>BMS, sınır aşıldığında yükü veya şarjı fiziksel olarak keser. Temel koruma katmanları şunlardır:</p>

<table>
  <thead>
    <tr>
      <th>Koruma</th>
      <th>Ne Zaman Devreye Girer</th>
      <th>Önlediği Sonuç</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Aşırı şarj (OVP)</td><td>Hücre gerilimi üst sınırı aşarsa</td><td>Hücre şişmesi, kimyasal bozunma, ısınma</td></tr>
    <tr><td>Aşırı deşarj (UVP)</td><td>Hücre gerilimi alt sınırın altına düşerse</td><td>Kalıcı kapasite kaybı, hücrenin ölmesi</td></tr>
    <tr><td>Aşırı akım (OCP)</td><td>Çekilen akım tasarım sınırını aşarsa</td><td>Aşırı ısınma, iletken ve konnektör hasarı</td></tr>
    <tr><td>Kısa devre (SCP)</td><td>Çıkışta ani ve çok yüksek akım oluşursa</td><td>Ark, erime, yangın riski</td></tr>
    <tr><td>Yüksek sıcaklık (OTP)</td><td>Hücre veya kart sıcaklığı sınırı geçerse</td><td>Hızlanmış yaşlanma, güvenlik riski</td></tr>
    <tr><td>Düşük sıcaklık şarj kilidi</td><td>Sıfırın altındaki sıcaklıkta şarj denenirse</td><td>Lityum kaplama (plating) ve kalıcı hasar</td></tr>
  </tbody>
</table>

<p>Bu listedeki son madde en çok yanlış anlaşılanıdır. Lityum bataryalar donma noktasının altında <em>deşarj</em> edilebilir ama <em>şarj</em> edilmemelidir. Kışın cihazınız şarja girmiyorsa arıza değil, koruma çalışıyor olabilir. Ayrıntıyı <a href="/blog/kisin-guc-istasyonu-kullanimi-soguk-hava-performans-rehberi">soğuk hava performans rehberimizde</a> anlattık.</p>

<h3>4. Durum Tahmini (SOC ve SOH)</h3>

<p>SOC (State of Charge) anlık doluluk yüzdesidir. SOH (State of Health) ise paketin ilk günkü kapasitesinin ne kadarını koruduğunu gösterir. BMS bu değerleri gerilim eğrisi ve akım integrali gibi yöntemleri birleştirerek tahmin eder.</p>

<p>LiFePO4 kimyasının gerilim eğrisi orta bölgede çok düz olduğu için yalnızca gerilime bakarak yüzde hesaplamak zordur. Bu yüzden yüzde göstergesi bazen %60'ta uzun süre takılı kalıp sonra hızla düşebilir. Panik yapmadan önce <a href="/blog/batarya-voc-degeri-nedir-neden-yukselir">açık devre gerilimi yazımıza</a> göz atın.</p>

<h3>5. İletişim</h3>

<p>Modern BMS kartları invertör, şarj devresi ve uygulama arayüzüyle konuşur. <a href="/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800">P1800</a> ve <a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200</a> modellerinde telefondan gördüğünüz şarj limiti, sessiz şarj modu ve kalan süre bilgileri bu iletişim hattı üzerinden gelir.</p>

<h2>İyi Bir BMS ile Ucuz Bir BMS Arasındaki Fark</h2>

<table>
  <thead>
    <tr>
      <th>Özellik</th>
      <th>Kaliteli BMS</th>
      <th>Düşük Maliyetli BMS</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Hücre ölçümü</td><td>Her hücre ayrı ayrı izlenir</td><td>Yalnızca toplam paket gerilimi okunur</td></tr>
    <tr><td>Dengeleme</td><td>Her döngüde otomatik çalışır</td><td>Yok veya çok zayıf</td></tr>
    <tr><td>Sıcaklık sensörü</td><td>Paketin farklı noktalarında birden fazla</td><td>Tek nokta veya hiç</td></tr>
    <tr><td>Koruma tepkisi</td><td>Kademeli: önce güç sınırlama, sonra kesme</td><td>Doğrudan kapanma</td></tr>
    <tr><td>Uzun vadeli sonuç</td><td>4000+ döngü boyunca dengeli kapasite</td><td>Erken kapasite kaybı</td></tr>
  </tbody>
</table>

<p>Ürünlerimizde belirtilen 4000+ döngü ömrü, doğru çalışan bir dengeleme sistemi olduğu varsayımına dayanır. Döngü sayısının pratikte ne anlama geldiğini <a href="/blog/4000-dongu-ne-demek-power-station-kac-yil-dayanir">4000 döngü ne demek</a> yazımızda hesapladık.</p>

<h2>BMS Devreye Girdiğinde Ne Yapmalısınız?</h2>

<p>Cihazınız aniden kapandıysa veya çıkış vermeyi bıraktıysa büyük olasılıkla bir koruma tetiklenmiştir. Sırayla şunları kontrol edin:</p>

<ol>
  <li><strong>Toplam yükü hesaplayın.</strong> Bağlı cihazların watt değerlerini toplayın; sürekli çıkış sınırını aşıyor olabilirsiniz.</li>
  <li><strong>Kalkış akımını düşünün.</strong> Motorlu cihazlar ilk saniyede nominal gücün çok üzerinde akım çeker. Pik güç sınırı bu yüzden vardır.</li>
  <li><strong>Sıcaklığı ölçün.</strong> Cihaz güneş altında, kapalı bir bagajda veya havalandırması kapalı bir dolapta çalışıyorsa soğumasını bekleyin.</li>
  <li><strong>Şarj sıcaklığını kontrol edin.</strong> Sıfırın altındaki ortamda şarj başlamayabilir; cihazı önce oda sıcaklığına alın.</li>
  <li><strong>Tüm yükleri çıkarıp yeniden başlatın.</strong> Koruma sıfırlanmazsa ve durum tekrar ediyorsa <a href="/iletisim">servis ekibimizle iletişime geçin</a>.</li>
</ol>

<p>Sürekli koruma tetikleniyorsa cihazı zorlamak yerine kapasite ve güç sınıfını yeniden değerlendirmek gerekir. Cihaz listenizi <a href="/guc-hesaplayici">güç hesaplayıcıya</a> girerek doğru sınıfı görebilirsiniz.</p>

<h2>Sıkça Sorulan Sorular</h2>

<h3>BMS bataryayı tamamen güvenli yapar mı?</h3>
<p>BMS riski büyük ölçüde azaltır ama tek başına mutlak güvenlik sağlamaz. Hücre kimyası, mekanik tasarım, kablolama ve kullanım koşulları da belirleyicidir. LiFePO4'ün diğer lityum kimyalarına göre neden daha kararlı olduğunu <a href="/blog/lityum-batarya-yangin-riski-lifepo4-guvenlik">lityum batarya yangın riski</a> yazımızda açıkladık.</p>

<h3>Hücre dengeleme ne zaman çalışır?</h3>
<p>Pasif dengeleme genellikle şarjın son aşamasında, hücreler üst gerilim bölgesine yaklaşırken devreye girer. Bu yüzden cihazı ara sıra %100'e kadar şarj etmek dengeleme için faydalıdır. Uzun süreli depolamada ise %50–60 seviyesi önerilir; ayrıntıları <a href="/blog/tasinabilir-guc-kaynagi-bakim-ve-depolama-rehberi">bakım ve depolama rehberimizde</a> bulabilirsiniz.</p>

<h3>Uygulamadaki yüzde neden bazen aniden değişiyor?</h3>
<p>LiFePO4 gerilim eğrisi düz olduğu için SOC tahmini zordur. Sistem tam şarj veya tam deşarj noktalarında kendini yeniden kalibre eder. Ara sıra tam bir şarj döngüsü yapmak göstergenin doğruluğunu artırır.</p>

<h3>BMS ile invertör aynı şey mi?</h3>
<p>Hayır. BMS bataryayı yönetir ve korur; invertör bataryadaki doğru akımı cihazların kullandığı alternatif akıma çevirir. İkisi birlikte çalışır ama farklı işler yapar. İnvertör çıkış kalitesinin neden önemli olduğunu <a href="/blog/saf-sinus-dalga-vs-modifiye-sinus-fark-nedir">saf sinüs dalga</a> yazımızda anlattık.</p>

<h3>Batarya güvenlik standartları neye göre belirleniyor?</h3>
<p>Taşınabilir lityum sistemler için IEC 62133 gibi uluslararası standartlar hücre ve paket düzeyinde test şartlarını tanımlar. Standardın kapsamına <a href="https://webstore.iec.ch/en/publication/32834" target="_blank" rel="noopener noreferrer">IEC resmi kataloğundan</a> ulaşabilirsiniz.</p>

<h2>Kağıt Üzerindeki Wh Değerinden Fazlası</h2>

<p>İki cihazı karşılaştırırken kapasite ve çıkış gücü ilk bakılan değerlerdir. Ancak o kapasiteyi yıllar boyunca koruyacak olan şey, hücreleri her gün sessizce dengeleyen karttır. Bu yüzden ürün seçerken hücre kimyası, döngü ömrü beyanı ve koruma katmanlarını birlikte değerlendirmek gerekir.</p>

<p><a href="/kategori/tasinabilir-guc-kaynaklari">Taşınabilir güç kaynakları kategorimizdeki</a> tüm modeller LiFePO4 hücre ve çok katmanlı BMS ile üretilir. Hangi kapasitenin size uygun olduğundan emin değilseniz cihaz listenizi <a href="/guc-hesaplayici">güç hesaplayıcıya</a> girin veya <a href="/iletisim">bize yazın</a>, kullanım profilinize göre birlikte belirleyelim.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // 22 — KOMBİ NEDEN ÇALIŞMIYOR
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "kombi-power-station-ile-calismiyor-faz-notr-topraklama",
    title: "Kombim Power Station'a Bağlayınca Neden Çalışmıyor? Faz-Nötr ve Topraklama",
    excerpt:
      "Güç kaynağı yeterli watt veriyor ama kombi ateşlemiyor ya da arıza veriyor. Sebep genellikle güç değil, iyonizasyon devresinin toprak referansı bulamaması. Nedenini ve çözüm yollarını açıklıyoruz.",
    category: "Teknik",
    tags: [
      "kombi power station",
      "kombi çalışmıyor",
      "faz nötr",
      "topraklama",
      "iyonizasyon elektrodu",
      "elektrik kesintisi kombi",
    ],
    metaTitle: "Kombi Power Station'da Neden Çalışmaz? Faz-Nötr ve Topraklama",
    metaDescription:
      "Kombi güç kaynağına bağlandığında ateşlemiyor veya arıza veriyor mu? İyonizasyon devresi, faz-nötr yönü ve topraklama referansının nedeni ve güvenli çözüm yolları.",
    metaKeywords: [
      "kombi power station çalışmıyor",
      "kombi jeneratörde çalışmıyor",
      "kombi faz nötr",
      "kombi topraklama sorunu",
      "iyonizasyon arızası",
      "kesintide kombi çalıştırma",
    ],
    content: `<p>Senaryo tanıdık geliyor olabilir. Elektrik kesildi, güç istasyonunu çıkardınız, kombinin fişini taktınız. Ekran yandı, pompa döndü ama brülör ateşlemedi. Ya da birkaç saniye çalışıp arıza koduna düştü. Cihazın etiketinde 100–150W yazıyor, elinizdeki güç kaynağı ise 1800W verebiliyor. Güç fazlasıyla yeterli, buna rağmen kombi çalışmıyor.</p>

<p>Bu durumda sorun neredeyse hiçbir zaman watt değeri değildir. Kombiler, evdeki şebeke elektriğinin belirli bir elektriksel düzene sahip olduğunu varsayarak tasarlanır. Taşınabilir bir güç kaynağının çıkışı bu düzenden farklı olabilir ve cihazın güvenlik devresi bunu arıza olarak yorumlar.</p>

<blockquote>
<strong>Hızlı Cevap:</strong> Kombiler alevi, iyonizasyon elektrodundan toprağa akan mikroamper seviyesindeki bir akımla algılar. Bu devrenin çalışması için nötr ile toprak arasında kararlı bir referans gerekir. Şebekede nötr trafo merkezinde topraklanmıştır. Bazı invertör çıkışlarında ise nötr “yüzer” durumdadır; bu durumda alev fiziksel olarak yansa bile cihaz alevi göremez ve emniyet için gazı keser. Ayrıca birçok kombi faz ile nötrün doğru uçlara gelmesini bekler; fiş ters takıldığında da aynı belirti görülür.
</blockquote>

<h2>Kombi Aleve Nasıl “Bakar”?</h2>

<p>Kombi içindeki brülör ateşlendikten sonra cihazın gerçekten yanıp yanmadığını doğrulaması gerekir. Gaz akıyor ama alev yoksa ortama yanmamış gaz dolar; bu yüzden alev denetimi hayati bir emniyet fonksiyonudur.</p>

<p>Bu denetim çoğu kombide iyonizasyon yöntemiyle yapılır. Alevin içi iyonize gazdır ve elektrik iletir. Elektronik kart, alevin içine uzanan bir elektrota küçük bir gerilim uygular ve alev üzerinden toprağa doğru akan çok küçük bir akımı ölçer. Bu akım mikroamper mertebesindedir.</p>

<p>Ölçümün anlamlı olması için devrenin bir referansa ihtiyacı vardır. Referans, tesisatın topraklama düzenidir. Toprak referansı belirsizse kart akımı okuyamaz, “alev yok” sonucuna varır ve gaz valfini kapatır. Sizin gördüğünüz belirti şudur: cihaz ateşleme sesi çıkarır, kısa bir alev olur, ardından arıza lambası yanar.</p>

<h2>Yüzer Nötr Nedir?</h2>

<p>Ev tesisatında nötr iletkeni, dağıtım şebekesinde topraklanmıştır. Faz ile toprak arasında ölçüm yaparsanız yaklaşık 230V, nötr ile toprak arasında ise sıfıra yakın bir değer görürsünüz.</p>

<p>Taşınabilir invertörlerin bir kısmında çıkış sargısı toprağa bağlı değildir. Bu düzende iki çıkış ucu arasında yine 230V vardır ama her iki uç da toprağa göre yaklaşık yarı gerilimde “yüzer”. Buna yüzer nötr denir. Basit dirençli yükler bunu umursamaz; ısıtıcı, lamba ve çoğu elektronik cihaz sorunsuz çalışır.</p>

<p>Ancak toprak referansına bakan cihazlar bu düzeni tanımaz. Kombi kartı, bazı kaçak akım korumalı sistemler ve faz yönüne duyarlı bazı kontrol elektronikleri bu gruba girer.</p>

<table>
  <thead>
    <tr>
      <th>Durum</th>
      <th>Şebeke Elektriği</th>
      <th>Yüzer Nötrlü İnvertör Çıkışı</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Faz–Nötr gerilimi</td><td>~230V</td><td>~230V</td></tr>
    <tr><td>Nötr–Toprak gerilimi</td><td>Sıfıra yakın</td><td>Yaklaşık yarı gerilim okunabilir</td></tr>
    <tr><td>Isıtıcı, lamba, laptop</td><td>Çalışır</td><td>Çalışır</td></tr>
    <tr><td>İyonizasyonlu kombi</td><td>Çalışır</td><td>Ateşlemeyebilir veya arıza verir</td></tr>
    <tr><td>Faz yönüne duyarlı kart</td><td>Çalışır</td><td>Yönü yanlış algılayabilir</td></tr>
  </tbody>
</table>

<h2>İkinci Sebep: Faz ile Nötrün Yer Değiştirmesi</h2>

<p>Bazı kombiler yalnızca toprak referansına değil, faz ve nötrün hangi uçtan geldiğine de bakar. Evdeki prizde faz sabit bir uçtadır. Fişi ters çevirdiğinizde faz ile nötr yer değiştirir.</p>

<p>Şebekede bile bu duruma rastlanır: kombi bir prizde çalışırken diğerinde arıza verir. Fişi 180 derece çevirip denemek bu yüzden ilk ve en zararsız kontroldür. Güç istasyonu çıkışında da aynı deneme yapılabilir.</p>

<h2>Adım Adım Kontrol Listesi</h2>

<p>Kombiniz güç kaynağında çalışmıyorsa şu sırayı izleyin:</p>

<ol>
  <li><strong>Fişi ters çevirin.</strong> En basit ve risksiz adım. Faz-nötr yönü bazı kartlarda tek başına belirleyicidir.</li>
  <li><strong>Gaz vanasını ve su basıncını kontrol edin.</strong> Kesintiyle ilgisiz bir arıza olabilir; kombinin kendi hata kodunu okuyun.</li>
  <li><strong>Cihazı doğrudan bağlayın.</strong> Uzatma kablosu, priz çoklayıcı veya ara adaptör kullanmayın; ek dirençler ve kötü temas belirtiyi karmaşıklaştırır.</li>
  <li><strong>Yalnızca kombiyi bağlayın.</strong> Aynı çıkışta başka cihaz varsa geçici olarak çıkarın.</li>
  <li><strong>Hata kodunu üreticinin kılavuzuyla eşleştirin.</strong> Alev/iyonizasyon arızası kodu, sorunun kaynağını doğrudan gösterir.</li>
  <li><strong>Yetkili servise veya elektrikçiye danışın.</strong> Belirti iyonizasyon kaynaklıysa çözüm, tesisatın topraklama düzeniyle ilgilidir ve deneme yanılmayla çözülmemelidir.</li>
</ol>

<h3>İnternetteki “Nötr-Toprak Köprüsü” Önerisi Hakkında</h3>

<p>Forumlarda sık karşılaşılan öneri, fiş içinde nötr ile toprağı birleştiren bir adaptör kullanmaktır. Bu yöntem elektriksel olarak yüzer nötrü referanslar; ancak kaçak akım koruma davranışını, cihaz gövde güvenliğini ve invertörün çıkış topolojisini doğrudan etkiler. Yanlış uygulandığında çarpılma riski doğurur ve cihazın garantisini geçersiz kılabilir.</p>

<p>Bu nedenle kendi başınıza uygulanacak bir çözüm olarak önermiyoruz. Kombinizi kesintide çalıştırmak istiyorsanız doğru yol, hem cihazınızın çıkış topolojisini hem de evinizin topraklama düzenini bilen bir elektrikçiyle değerlendirmektir. Alçak gerilim tesisatlarında koruma yaklaşımının uluslararası çerçevesi için <a href="https://webstore.iec.ch/en/publication/4558" target="_blank" rel="noopener noreferrer">IEC 60364 standart ailesine</a> bakılabilir; Türkiye'de ayrıca yürürlükteki ulusal yönetmelik geçerlidir.</p>

<h2>Kalıcı Çözüm: Sabit Sistem ve Kritik Yük Panosu</h2>

<p>Kombiyi her kesintide fişten çekip taşınabilir cihaza takmak pratik bir çözüm değildir. Kalıcı kurulumda kombi, kritik yük panosuna alınır ve şebeke kesildiğinde otomatik olarak yedek kaynaktan beslenir. Bu mimaride nötr-toprak düzeni proje aşamasında doğru kurulur, dolayısıyla iyonizasyon sorunu baştan ortadan kalkar.</p>

<p><a href="/urun/5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000">SH4000</a>; 5120Wh batarya, 4000W sürekli çıkış ve ATS uyumuyla bu senaryo için tasarlanmıştır. Sistem mimarisini ve elektrikçinizin kontrol etmesi gereken başlıkları <a href="/blog/hibrit-invertor-ats-nedir-ev-panosu-baglanti">hibrit invertör ve ATS rehberimizde</a> ayrıntılı anlattık.</p>

<h2>Kombi Ne Kadar Enerji Harcar?</h2>

<p>İyi haber şu: doğalgazlı kombi ısıyı gazdan üretir, elektriği yalnızca pompa, fan ve kart için kullanır. Bu yüzden enerji ihtiyacı düşüktür.</p>

<table>
  <thead>
    <tr><th>Model</th><th>Kullanılabilir Enerji</th><th>Kombi (100W ort.)</th><th>Kombi + Modem + Aydınlatma (145W)</th></tr>
  </thead>
  <tbody>
    <tr><td>P800 (512Wh)</td><td>~435Wh</td><td>~4,3 saat</td><td>~3 saat</td></tr>
    <tr><td>P1800 (1024Wh)</td><td>~870Wh</td><td>~8,7 saat</td><td>~6 saat</td></tr>
    <tr><td>P3200 (2048Wh)</td><td>~1740Wh</td><td>~17 saat</td><td>~12 saat</td></tr>
    <tr><td>SH4000 (5120Wh)</td><td>~4350Wh</td><td>~43 saat</td><td>~30 saat</td></tr>
  </tbody>
</table>

<p>Kombi sürekli değil, termostat isteğine göre aralıklı çalışır. Gerçek süreler bu yüzden tablodakinden daha uzun olur. Etiket kapasitesi ile kullanılabilir enerji arasındaki farkı <a href="/blog/gercek-kullanilabilir-kapasite-wh-verim-kayiplari">gerçek kullanılabilir kapasite</a> yazımızda hesapladık.</p>

<p>Dikkat edilmesi gereken tek istisna elektrikli ısıtıcı içeren kombilerdir. Bu modellerde tüketim 1500–2000W'a çıkar ve tablo tamamen değişir. Cihazınızın etiketini mutlaka kontrol edin.</p>

<h2>Sıkça Sorulan Sorular</h2>

<h3>Kombi jeneratörde çalışıyor ama güç istasyonunda çalışmıyor, neden?</h3>
<p>Jeneratörlerin bir kısmında nötr gövdeye bağlıdır ve gövde topraklanır; bu da kombinin aradığı referansı sağlar. Yüzer nötrlü bir invertör çıkışında aynı referans oluşmayabilir. Belirti aynı cihazda farklı kaynaklarda değişebilir.</p>

<h3>Kombi kartı zarar görür mü?</h3>
<p>Saf sinüs çıkışlı kaliteli bir kaynakta karta zarar gelmesi beklenmez; cihaz emniyet gereği kapanır. Riskli olan modifiye sinüs çıkışlardır. Farkı <a href="/blog/saf-sinus-dalga-vs-modifiye-sinus-fark-nedir">saf sinüs vs modifiye sinüs</a> yazımızda açıkladık. Ürünlerimizin tamamı saf sinüs çıkış verir.</p>

<h3>Yerden ısıtma veya klimayla ısınıyorum, durum aynı mı?</h3>
<p>Hayır. Elektrikli ısıtma çözümlerinde sorun referans değil güçtür; tüketim kilowatt seviyesindedir. Klima ve ısıtıcı hesaplarını <a href="/blog/ev-tipi-klima-isitici-guc-kaynagi-watt-hesaplama">watt hesaplama rehberimizde</a> bulabilirsiniz.</p>

<h3>Kesintide kombiyi çalıştırmanın en garantili yolu nedir?</h3>
<p>Kritik yük panosu üzerinden sabit bir yedekleme sistemi kurmak. Bu yöntemde bağlantı bir kez doğru projelendirilir; kesintide sizin hiçbir şey yapmanız gerekmez.</p>

<h3>Hangi modeli almalıyım?</h3>
<p>Yalnızca kombi ve birkaç temel yük için P1800 çoğu evde yeterlidir. Buzdolabı ve daha uzun kesintiler hedefleniyorsa P3200 mantıklıdır. Otomatik ve kalıcı çözüm arıyorsanız SH4000 sınıfına bakmalısınız. Karşılaştırma için <a href="/blog/elektrik-kesintisinde-kac-wh-gerekir">kaç Wh gerekir</a> yazımıza bakabilirsiniz.</p>

<h2>Önce Belirtiyi Doğru Okuyun</h2>

<p>Kombinin güç kaynağında çalışmaması çoğu zaman cihazın arızalı olduğu anlamına gelmez. Watt yeterliyken ateşleme olmuyorsa, aradığınız cevap güç tablosunda değil tesisatın referans düzenindedir. Fişi ters çevirmek gibi basit bir adım bazen sorunu çözer; çözmezse doğru adres yetkili servis ve elektrikçidir.</p>

<p>Kesintide hangi cihazları ne kadar süre çalıştırmak istediğinizi <a href="/guc-hesaplayici">güç hesaplayıcıya</a> girerek başlangıç kapasitesini görebilir, kombi marka-modelinizi ve pano durumunuzu <a href="/iletisim">bize ilettiğinizde</a> uygun kurulum yaklaşımını birlikte değerlendirebiliriz.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // 23 — ŞARJ NEDEN ERKEN BİTİYOR
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "guc-istasyonu-sarji-neden-erken-bitiyor",
    title: "Güç İstasyonum Neden Beklediğimden Erken Bitiyor? 9 Yaygın Sebep",
    excerpt:
      "Hesapta 10 saat çıkan süre gerçekte 6 saatte bitiyorsa cihaz arızalı olmayabilir. Etiket kapasitesi, invertör kaybı, bekleme tüketimi ve sıcaklık gibi dokuz sebebi tek tek inceliyoruz.",
    category: "Teknik",
    tags: [
      "güç istasyonu erken bitiyor",
      "batarya çabuk bitiyor",
      "invertör kaybı",
      "bekleme tüketimi",
      "Wh hesaplama",
      "kapasite kaybı",
    ],
    metaTitle: "Güç İstasyonu Neden Çabuk Bitiyor? 9 Sebep ve Çözümü",
    metaDescription:
      "Taşınabilir güç kaynağınız beklediğinizden erken mi bitiyor? Etiket kapasitesi, invertör verimi, bekleme tüketimi, sıcaklık ve yanlış watt hesabı dahil 9 sebep ve çözümleri.",
    metaKeywords: [
      "güç istasyonu çabuk bitiyor",
      "power station erken bitiyor",
      "batarya ömrü düştü",
      "invertör verim kaybı",
      "bekleme tüketimi",
      "wh hesaplama hatası",
    ],
    content: `<p>Kapasiteyi cihazın gücüne bölersiniz, karşınıza güzel bir sayı çıkar. 1024Wh'lik bir güç kaynağı ve 100W'lık bir yük: 10 saat. Sonra gerçek hayatta cihaz altıncı saatte kapanır. İlk akla gelen şey bataryanın arızalı olduğudur.</p>

<p>Çoğu durumda arıza yoktur. Basit bölme işlemi, gerçek dünyada devreye giren yarım düzine faktörü hesaba katmaz. Aşağıdaki dokuz sebep, beklenen süre ile gerçek süre arasındaki farkın neredeyse tamamını açıklar.</p>

<blockquote>
<strong>Hızlı Cevap:</strong> Etiketteki Wh değeri hücrelerin depoladığı ham enerjidir; prizden alabileceğiniz enerji invertör ve sistem kayıpları nedeniyle tipik olarak bunun %85 civarıdır. Buna cihazların etiket değerinden fazla çekmesi, bekleme tüketimi, düşük sıcaklık, yaşlanma ve ölçüm hataları eklenince süre belirgin biçimde kısalır. Gerçekçi hesap için <strong>Süre ≈ Kapasite (Wh) × 0,85 ÷ Gerçek ortalama güç (W)</strong> formülünü kullanın.
</blockquote>

<h2>1. Etiket Kapasitesi Prizden Alacağınız Enerji Değildir</h2>

<p>Bu, farkın en büyük tek sebebidir. Etiketteki Wh, batarya hücrelerinin kimyasal olarak depoladığı enerjidir. Bu enerjinin AC prize ulaşması için invertörden geçmesi gerekir ve her dönüşüm bir miktar ısı üretir.</p>

<table>
  <thead>
    <tr><th>Model</th><th>Etiket Kapasitesi</th><th>Tipik Kullanılabilir (AC)</th></tr>
  </thead>
  <tbody>
    <tr><td>P800</td><td>512Wh</td><td>~435Wh</td></tr>
    <tr><td>P1800</td><td>1024Wh</td><td>~870Wh</td></tr>
    <tr><td>Singo 2000 Pro</td><td>1920Wh</td><td>~1630Wh</td></tr>
    <tr><td>P3200</td><td>2048Wh</td><td>~1740Wh</td></tr>
    <tr><td>SH4000</td><td>5120Wh</td><td>~4350Wh</td></tr>
  </tbody>
</table>

<p>Yani 1024Wh ile 100W'lık yükü 10 saat değil, yaklaşık 8,7 saat çalıştırırsınız. Kayıpların nereden geldiğini <a href="/blog/gercek-kullanilabilir-kapasite-wh-verim-kayiplari">gerçek kullanılabilir kapasite</a> yazımızda ayrıntılı hesapladık.</p>

<h2>2. Cihazlar Etiketlerinde Yazan Gücü Çekmez</h2>

<p>Etiket değeri genellikle maksimum tüketimi gösterir, ortalamayı değil. Buzdolabı bunun en klasik örneğidir: etiketinde 150W yazar ama kompresör sürekli çalışmadığı için günlük ortalaması 60W civarındadır.</p>

<p>Ters yönde de sürprizler olur. “65W” yazan bir dizüstü adaptörü, batarya boşken ve işlemci yüklüyken 65W'ın üzerine çıkabilir. Oyun konsolu, lazer yazıcı ve ısıtıcılı cihazlar da etiketin üstünde anlık tepeler yapar.</p>

<p>Doğru yaklaşım, tahmin etmek yerine ölçmektir. Basit bir priz tipi watt ölçer, gerçek ortalama tüketimi birkaç saat içinde net biçimde gösterir.</p>

<h2>3. İnvertörün Kendi Tüketimi (Bekleme Kaybı)</h2>

<p>AC çıkışı açık olduğu sürece invertör, hiçbir cihaz bağlı olmasa bile enerji harcar. Bu genellikle 5–20W arasındadır. Küçük görünür ama bir gece boyunca sessizce birikir.</p>

<p>Örneğin 15W bekleme tüketimi 12 saatte 180Wh eder. P800 için bu, kullanılabilir enerjinin yaklaşık %40'ıdır. Sadece 10W'lık bir modemi beslediğinizi sanırken aslında 25W çekiyor olabilirsiniz.</p>

<p><strong>Çözüm:</strong> Yalnızca USB veya DC cihaz besliyorsanız AC çıkışını kapatın. Küçük cihazlar için AC yerine doğrudan DC kullanmak, dönüşüm adımını tamamen atlar. <a href="/blog/dc5525-cikis-nedir-hangi-cihazlar-kullanilir">DC5525 çıkış rehberimiz</a> ve <a href="/blog/usb-pd-power-delivery-nedir-usb-if-sertifikasi">USB PD yazımız</a> bu konuda yol gösterir.</p>

<h2>4. Soğuk Hava</h2>

<p>Lityum bataryaların iç direnci sıcaklık düştükçe artar. 0°C civarında kullanılabilir kapasite belirgin biçimde azalır; eksi değerlerde kayıp daha da büyür. Cihaz bozulmaz, enerji geçici olarak erişilemez hale gelir ve ortam ısındığında kapasite geri döner.</p>

<p>Kışın bagajda, balkonda veya çadırda bekleyen bir cihazın süresi, aynı cihazın oda sıcaklığındaki süresinden kısadır. Ayrıntılar <a href="/blog/kisin-guc-istasyonu-kullanimi-soguk-hava-performans-rehberi">soğuk hava performans rehberimizde</a>.</p>

<h2>5. Aynı Anda Şarj ve Kullanım</h2>

<p>Pass-through modunda cihaz hem şarj olur hem yük besler. Bu sırada enerji iki dönüşümden birden geçer ve toplam verim düşer. Ayrıca solar giriş değişkense sistem sürekli çalışma noktası arar.</p>

<p>Bu bir kusur değil, modun doğasıdır; ancak “şarjdayken neden yavaş doluyor” sorusunun cevabı çoğunlukla budur. <a href="/blog/guc-istasyonunda-pass-through-sarj-ups-modu">Pass-through ve UPS modu</a> yazımızda ayrıntısı var.</p>

<h2>6. Yüzde Göstergesine Fazla Güvenmek</h2>

<p>LiFePO4 hücrelerin gerilim eğrisi orta bölgede çok düzdür. Bu yüzden yüzde tahmini zordur: gösterge uzun süre %60'ta durup sonra hızla düşebilir. Cihaz erken bitmiyor, gösterge doğrusal davranmıyordur.</p>

<p>Ara sıra tam bir şarj-deşarj döngüsü yapmak, sistemin kendini yeniden kalibre etmesine yardım eder. Konunun teknik arka planı <a href="/blog/batarya-voc-degeri-nedir-neden-yukselir">açık devre gerilimi</a> yazımızda.</p>

<h2>7. Yaşlanma ve Döngü Sayısı</h2>

<p>Her batarya zamanla kapasite kaybeder. LiFePO4 bu konuda iyimser bir kimyadır: ürünlerimiz 4000+ döngü sonunda başlangıç kapasitesinin önemli bir kısmını korur. Ancak cihaz üç yaşındaysa ve neredeyse her gün tam döngü yapıyorsa, ilk günkü süreyi beklemek gerçekçi değildir.</p>

<p>Günde bir tam döngüyle 4000 döngünün kaç yıla karşılık geldiğini <a href="/blog/4000-dongu-ne-demek-power-station-kac-yil-dayanir">4000 döngü ne demek</a> yazımızda hesapladık. Yaşlanmayı yavaşlatan alışkanlıklar <a href="/blog/tasinabilir-guc-kaynagi-bakim-ve-depolama-rehberi">bakım ve depolama rehberimizde</a>.</p>

<h2>8. Görünmeyen Ek Yükler</h2>

<p>Çoklu prizde unutulmuş bir şarj adaptörü, açık kalan bir monitör, bekleme modundaki televizyon veya sürekli çalışan bir modem-router-switch üçlüsü toplamda beklediğinizden fazla tutar.</p>

<p>Ekranda görünen anlık watt değerini okumak bu konuda en hızlı teşhis yöntemidir. Beklediğinizden yüksek bir sayı görüyorsanız cihazları tek tek çıkararak farkı bulun.</p>

<h2>9. Yanlış Birim: Wh ile mAh Karıştırmak</h2>

<p>Powerbank'lerde mAh, güç istasyonlarında Wh kullanılır. İkisi doğrudan karşılaştırılamaz; çevirmek için gerilim gerekir.</p>

<p><strong>Wh = mAh ÷ 1000 × Volt</strong></p>

<p>20.000 mAh'lik bir powerbank 3,7V hücre gerilimiyle yaklaşık 74Wh eder — yani P800'ün yaklaşık yedide biri. Birimler arası ilişkiyi <a href="/blog/watt-volt-amper-wh-enerji-birimleri-rehberi">enerji birimleri rehberimizde</a> topladık.</p>

<h2>Gerçekçi Süre Nasıl Hesaplanır?</h2>

<p>Pratik formül şudur:</p>

<p><strong>Süre (saat) ≈ Kapasite (Wh) × 0,85 ÷ (Cihazların gerçek ortalama gücü + Bekleme tüketimi)</strong></p>

<p>Örnek: P1800 ile buzdolabı (60W ortalama), modem (12W) ve iki LED lamba (20W) besleyeceksiniz. Bekleme tüketimini 10W kabul edelim.</p>

<p><strong>870Wh ÷ 102W ≈ 8,5 saat</strong></p>

<p>Kaba bölme işlemi (1024 ÷ 92) 11 saatin üzerinde bir sonuç verirdi. Aradaki fark, cihazın kusuru değil hesabın eksikliğidir. Kendi cihaz listeniz için bu hesabı <a href="/guc-hesaplayici">güç hesaplayıcı</a> otomatik yapar.</p>

<h2>Süreyi Uzatmanın Pratik Yolları</h2>

<ul>
  <li>Kullanmadığınızda AC çıkışını kapatın; bekleme kaybını sıfırlayın.</li>
  <li>Telefon, tablet ve ışık için AC adaptör yerine USB-C çıkışlarını kullanın.</li>
  <li>Cihazı oda sıcaklığında ve havalandırması açık şekilde çalıştırın.</li>
  <li>Buzdolabını kesintide gereksiz açmayın; kompresör çalışma oranı düşsün.</li>
  <li>Isıtma ve pişirme gibi yüksek watt'lı işleri bataryadan yapmayın.</li>
  <li>Uzun kesinti bekliyorsanız güneş paneliyle gün içinde yenileme yapın.</li>
</ul>

<p>Son madde en etkili olanıdır. <a href="/urun/tasinabilir-gunes-paneli-200w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp200">SP200</a> veya <a href="/urun/tasinabilir-gunes-paneli-400w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp400">SP400</a> gibi bir panel, gün boyunca bataryayı sürekli beslediği için toplam çalışma süresini katlar. Panel seçimi için <a href="/kategori/gunes-panelleri">güneş panelleri kategorimize</a> bakabilirsiniz.</p>

<h2>Sıkça Sorulan Sorular</h2>

<h3>Cihazım gerçekten arızalı mı, nasıl anlarım?</h3>
<p>Bilinen sabit bir yük kullanarak test edin. Örneğin 60W'lık bir ampulü tam şarjdan boşalana kadar çalıştırın ve süreyi ölçün. Sonuç, kullanılabilir kapasitenin %70'inin belirgin biçimde altındaysa ve cihaz görece yeniyse <a href="/blog/guc-kaynagi-garanti-servis-rehberi">garanti sürecini</a> başlatmak için <a href="/iletisim">bize ulaşın</a>.</p>

<h3>Sürekli %100'de tutmak zarar verir mi?</h3>
<p>Uzun süre tam dolu bekletmek lityum bataryalarda yaşlanmayı bir miktar hızlandırır. Günlük kullanımda sorun değildir; aylarca depolayacaksanız %50–60 seviyesi daha uygundur.</p>

<h3>Kapasite kaybı geri kazanılır mı?</h3>
<p>Soğuktan kaynaklanan kayıp geçicidir, ortam ısınınca geri döner. Döngüsel yaşlanmadan kaynaklanan kayıp ise kalıcıdır. Batarya kimyasının ömür davranışı hakkında <a href="https://batteryuniversity.com/article/bu-808-how-to-prolong-lithium-based-batteries" target="_blank" rel="noopener noreferrer">Battery University'nin derlemesi</a> iyi bir başlangıçtır.</p>

<h3>Daha büyük model almak çözüm mü?</h3>
<p>Hesabınızı doğru yaptıktan sonra hâlâ yetmiyorsa evet. Ancak önce gerçek tüketiminizi ölçün; birçok kullanıcı yanlış watt tahminiyle gereğinden büyük cihaz alıyor. <a href="/blog/elektrik-kesintisinde-kac-wh-gerekir">Kaç Wh gerekir</a> yazımız senaryo bazlı karşılaştırma sunar.</p>

<h2>Beklentiyi Doğru Kurmak</h2>

<p>Bir güç istasyonundan memnun kalmanın yolu, kapasiteyi doğru okumaktan geçer. Etiket değerinin %85'ini kullanılabilir kabul edip cihazların gerçek ortalama tüketimini ölçtüğünüzde tahminleriniz sahayla örtüşmeye başlar.</p>

<p>Kendi senaryonuzu görmek için cihaz listenizi <a href="/guc-hesaplayici">güç hesaplayıcıya</a> girin. Ölçtüğünüz değerler beklediğinizin çok altındaysa cihaz modelinizi ve kullanım koşullarınızı <a href="/iletisim">bize iletin</a>, birlikte kontrol edelim.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // 24 — SERTİFİKALAR
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "batarya-sertifikalari-ce-un38-3-msds-fcc-nedir",
    title: "CE, UN38.3, MSDS ve FCC Ne Anlama Gelir? Batarya Sertifikaları Rehberi",
    excerpt:
      "Ürün sayfalarındaki sertifika kısaltmaları neyi garanti eder, neyi etmez? Taşıma testinden elektromanyetik uyumluluğa kadar her belgenin ne işe yaradığını açıklıyoruz.",
    category: "Teknik",
    tags: [
      "UN38.3",
      "CE belgesi",
      "MSDS",
      "FCC",
      "batarya sertifikası",
      "lityum batarya taşıma",
    ],
    metaTitle: "UN38.3, CE, MSDS, FCC Nedir? Batarya Sertifikaları Rehberi",
    metaDescription:
      "Lityum batarya sertifikaları ne anlama gelir? UN38.3 taşıma testleri, CE uygunluk beyanı, MSDS güvenlik bilgi formu, FCC ve RoHS arasındaki farklar sade bir dille.",
    metaKeywords: [
      "un38.3 nedir",
      "ce belgesi nedir",
      "msds nedir",
      "fcc sertifikası",
      "lityum batarya sertifikaları",
      "iec 62133",
    ],
    content: `<p>Bir güç istasyonunun ürün sayfasında sıralanan kısaltmalar çoğu alıcı için anlamsız bir harf yığınıdır: CE, UN38.3, MSDS, FCC, RoHS. Satıcılar bunları güven işareti olarak listeler, alıcılar da genellikle “çok belge var, sağlamdır” diye geçer.</p>

<p>Oysa bu belgeler birbirinden tamamen farklı şeyleri kanıtlar. Biri ürünün uçakla taşınabilirliğini, diğeri radyo parazitini, bir başkası içindeki kimyasalları ilgilendirir. Hangisinin neyi güvence altına aldığını bilmek, iki ürün arasında seçim yaparken işinize yarar.</p>

<blockquote>
<strong>Hızlı Cevap:</strong> <strong>UN38.3</strong> lityum bataryanın taşınabilmesi için geçmesi zorunlu sekiz fiziksel test dizisidir. <strong>CE</strong> üreticinin ürünü ilgili Avrupa mevzuatına uygun beyan ettiğini gösterir. <strong>MSDS/SDS</strong> hücre kimyasını ve acil durum talimatlarını içeren güvenlik bilgi formudur. <strong>FCC</strong> ABD pazarı için elektromanyetik girişim uyumluluğudur. <strong>RoHS</strong> zararlı madde sınırlarını, <strong>IEC 62133</strong> ise hücre ve paket güvenlik testlerini kapsar.
</blockquote>

<h2>UN38.3 — Taşıma Güvenliği Testi</h2>

<p>Bu, lityum batarya dünyasındaki en somut belgedir. Birleşmiş Milletler'in tehlikeli madde taşımacılığı el kitabının 38.3 numaralı bölümünde tanımlanır ve bataryanın nakliye koşullarına dayanıp dayanmadığını sınar.</p>

<p>Test dizisi sekiz aşamadan oluşur:</p>

<table>
  <thead>
    <tr><th>Test</th><th>Neyi Simüle Eder</th></tr>
  </thead>
  <tbody>
    <tr><td>T1 — Yükseklik</td><td>Uçak kargo bölümündeki düşük basınç</td></tr>
    <tr><td>T2 — Termal döngü</td><td>Aşırı sıcak ve soğuk arasında tekrarlanan geçişler</td></tr>
    <tr><td>T3 — Titreşim</td><td>Uzun yol taşımacılığındaki sarsıntı</td></tr>
    <tr><td>T4 — Şok</td><td>Ani darbe ve sert elleçleme</td></tr>
    <tr><td>T5 — Dış kısa devre</td><td>Terminallerin yanlışlıkla temas etmesi</td></tr>
    <tr><td>T6 — Darbe/ezilme</td><td>Hücrenin fiziksel olarak zorlanması</td></tr>
    <tr><td>T7 — Aşırı şarj</td><td>Şarj devresinin sınırı aşması</td></tr>
    <tr><td>T8 — Zorlanmış deşarj</td><td>Hücrenin ters yönde zorlanması</td></tr>
  </tbody>
</table>

<p>UN38.3 belgesi olmayan bir lityum batarya yasal olarak hava, deniz veya kara yoluyla taşınamaz. Yani ürünü Türkiye'ye getiren her meşru ithalatçının bu belgeye sahip olması gerekir. Bu yönüyle UN38.3, pazarlama tercihi değil zorunluluktur.</p>

<p>Uçakla seyahat ederken geçerli olan Wh sınırları ise ayrı bir konudur ve havayolu kurallarına tabidir. Kabine alınabilecek kapasiteler ve onay gerektiren aralıklar için <a href="/blog/guc-istasyonu-ile-ucaga-binmek-tsa-iata-kurallari">uçakta güç istasyonu</a> yazımıza bakın; güncel kuralları <a href="https://www.iata.org/en/programs/cargo/dgr/lithium-batteries/" target="_blank" rel="noopener noreferrer">IATA'nın lityum batarya sayfasından</a> doğrulayabilirsiniz.</p>

<h2>CE — Avrupa Uygunluk İşareti</h2>

<p>CE işareti sık yanlış anlaşılır. Bir kalite ödülü ya da bağımsız bir kurumun verdiği onay değildir. Üreticinin, ürünün ilgili Avrupa direktiflerine (elektromanyetik uyumluluk, alçak gerilim, radyo ekipmanı gibi) uygun olduğunu <em>beyan ettiği</em> anlamına gelir.</p>

<p>Beyanın arkasında teknik dosya, risk analizi ve test raporları bulunmalıdır. Bazı ürün gruplarında onaylanmış kuruluş denetimi zorunludur, bazılarında üreticinin öz beyanı yeterlidir. İşaretin resmi kapsamı <a href="https://single-market-economy.ec.europa.eu/single-market/ce-marking_en" target="_blank" rel="noopener noreferrer">Avrupa Komisyonu'nun CE sayfasında</a> açıklanır.</p>

<p>Pratik sonuç: CE işareti olan bir üründe teknik dosyanın var olması beklenir, ancak işaretin kendisi tek başına bağımsız test garantisi vermez. Bu yüzden CE'yi diğer belgelerle birlikte değerlendirmek gerekir.</p>

<h2>MSDS / SDS — Güvenlik Bilgi Formu</h2>

<p>MSDS (Material Safety Data Sheet), günümüzde daha yaygın adıyla SDS, ürünün içerdiği kimyasalları ve acil durumda yapılması gerekenleri belgeleyen standart formdur.</p>

<p>Bir batarya SDS'inde şunlar bulunur:</p>

<ul>
  <li>Hücre kimyası ve bileşen oranları</li>
  <li>Sızıntı, yangın ve temas durumunda ilk yardım</li>
  <li>Uygun yangın söndürme yöntemi</li>
  <li>Depolama ve elleçleme koşulları</li>
  <li>Atık bertaraf yönlendirmesi</li>
</ul>

<p>Bireysel kullanıcı bu belgeyi nadiren okur; ancak nakliye şirketleri, gümrük ve iş yeri güvenlik birimleri talep eder. Kurumsal alımlarda SDS istemek olağandır.</p>

<h2>FCC — ABD Elektromanyetik Uyumluluk</h2>

<p>FCC (Federal Communications Commission) uyumluluğu, cihazın çalışırken çevresindeki radyo iletişimini bozacak seviyede parazit üretmediğini gösterir. İnvertörler yüksek frekansta anahtarlama yaptığı için bu test anlamlıdır.</p>

<p>FCC bir ABD düzenlemesidir; Türkiye'de yasal zorunluluk değildir. Buna rağmen ürün sayfalarında görülmesinin sebebi, aynı üretim hattının küresel pazarlara çıkması ve testlerin zaten yapılmış olmasıdır. Avrupa'daki karşılığı CE kapsamındaki EMC direktifidir.</p>

<h2>RoHS ve IEC 62133</h2>

<p><strong>RoHS</strong>, elektronik ürünlerde kurşun, cıva, kadmiyum gibi zararlı maddelerin sınırlarını belirler. Çevre ve insan sağlığıyla ilgilidir, performansla değil.</p>

<p><strong>IEC 62133</strong> ise taşınabilir uygulamalarda kullanılan lityum hücre ve bataryalar için güvenlik test standardıdır. Aşırı şarj, kısa devre, mekanik zorlama ve sıcaklık koşullarını kapsar. Kapsamı <a href="https://webstore.iec.ch/en/publication/32834" target="_blank" rel="noopener noreferrer">IEC kataloğunda</a> yer alır.</p>

<h2>Hangi Belge Neyi Söyler? Özet Tablo</h2>

<table>
  <thead>
    <tr>
      <th>Belge</th>
      <th>Kapsamı</th>
      <th>Zorunlu mu?</th>
      <th>Alıcı İçin Anlamı</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>UN38.3</td><td>Taşıma dayanımı (8 test)</td><td>Evet, nakliye için</td><td>Meşru ithalatın temel şartı</td></tr>
    <tr><td>CE</td><td>AB mevzuatına uygunluk beyanı</td><td>AB/TR pazarı için gerekli</td><td>Teknik dosyanın varlığı beklenir</td></tr>
    <tr><td>MSDS / SDS</td><td>Kimyasal içerik ve acil durum</td><td>Nakliye ve iş güvenliğinde</td><td>Kurumsal alımlarda istenir</td></tr>
    <tr><td>FCC</td><td>Elektromanyetik girişim (ABD)</td><td>Türkiye'de hayır</td><td>Ek test geçmişi göstergesi</td></tr>
    <tr><td>RoHS</td><td>Zararlı madde sınırları</td><td>AB pazarında evet</td><td>Çevresel uyum</td></tr>
    <tr><td>IEC 62133</td><td>Hücre ve paket güvenlik testi</td><td>Referans standart</td><td>Güvenlik tasarımının kanıtı</td></tr>
  </tbody>
</table>

<h2>Belge Listesine Bakarken Nelere Dikkat Etmeli?</h2>

<ol>
  <li><strong>Belge hangi ürüne ait?</strong> Bazı satıcılar hücre üreticisinin belgesini kendi ürününün belgesi gibi gösterir. Model numarası eşleşmelidir.</li>
  <li><strong>Tarih güncel mi?</strong> Standartlar revize edilir; çok eski tarihli raporlar güncel sürümü karşılamayabilir.</li>
  <li><strong>Test laboratuvarı belli mi?</strong> Raporda laboratuvar adı ve test koşulları yer almalıdır.</li>
  <li><strong>Kapsam ne kadar geniş?</strong> Yalnızca adaptörü kapsayan bir rapor, batarya paketi için kanıt sayılmaz.</li>
  <li><strong>Garanti ve satış sonrası var mı?</strong> Belge kadar, arıza halinde muhatap bulabilmek de önemlidir. Süreci <a href="/blog/guc-kaynagi-garanti-servis-rehberi">garanti ve servis rehberimizde</a> anlattık.</li>
</ol>

<h2>Sertifika Güvenliği Tek Başına Sağlar mı?</h2>

<p>Hayır. Belgeler, ürünün belirli koşullarda test edildiğini gösterir; günlük kullanımdaki davranışı ise hücre kimyası, BMS kalitesi ve kullanıcı alışkanlıkları belirler.</p>

<p>Bu yüzden LiFePO4 gibi termal olarak daha kararlı bir kimya seçmek, çok katmanlı bir <a href="/blog/bms-nedir-batarya-yonetim-sistemi-korumalari">BMS</a> bulunması ve şarj kurallarına uyulması, sertifika listesinin uzunluğundan daha belirleyicidir. Evde şarj güvenliği için <a href="/blog/lityum-batarya-yangin-riski-lifepo4-guvenlik">lityum batarya yangın riski</a> yazımızdaki kuralları öneriyoruz; konunun uluslararası çerçevesi için <a href="https://www.nfpa.org/education-and-research/home-fire-safety/lithium-ion-batteries" target="_blank" rel="noopener noreferrer">NFPA'nın rehberi</a> iyi bir kaynaktır.</p>

<h2>Sıkça Sorulan Sorular</h2>

<h3>UN38.3 belgesi olmayan ürün alınır mı?</h3>
<p>Alınmamalıdır. Bu belge olmadan lityum batarya yasal olarak taşınamaz; belgenin yokluğu ithalat zincirinde bir sorun olduğunu gösterir.</p>

<h3>CE işareti sahte olabilir mi?</h3>
<p>Ne yazık ki işaretin fiziksel olarak basılması kolaydır. Bu yüzden işaretin kendisinden çok, arkasındaki uygunluk beyanı ve teknik dosyanın talep edilebilir olması önemlidir.</p>

<h3>Türkiye'de ayrıca bir belge aranır mı?</h3>
<p>Ürün grubuna göre ilgili teknik düzenlemelere uygunluk ve piyasaya arz şartları geçerlidir. Standart ve belgelendirme süreçleri hakkında <a href="https://www.tse.org.tr/" target="_blank" rel="noopener noreferrer">Türk Standardları Enstitüsü</a> başvuru kaynağıdır.</p>

<h3>IP koruma sınıfı da bir sertifika mı?</h3>
<p>IP derecesi, toz ve suya karşı korumayı tanımlayan bir sınıflandırmadır. Güç istasyonlarımız IP20, <a href="/urun/5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000">SH4000</a> IP54, güneş panellerimiz IP67 sınıfındadır. Ne anlama geldiklerini <a href="/blog/ip20-ip54-ip65-ip67-koruma-sinifi-rehberi">IP koruma sınıfı rehberimizde</a> açıkladık.</p>

<h3>Kurumsal alımda hangi belgeleri istemeliyim?</h3>
<p>Genellikle UN38.3 test özeti, CE uygunluk beyanı, SDS ve varsa IEC 62133 raporu talep edilir. Kurumsal teklif ve belge paketi için <a href="/iletisim">bizimle iletişime geçebilirsiniz</a>.</p>

<h2>Belgeyi Okumak, Listeyi Saymaktan İyidir</h2>

<p>Uzun bir sertifika listesi tek başına iyi ürün göstergesi değildir. Önemli olan, belgelerin gerçekten satın aldığınız modele ait olması ve arkalarındaki test raporlarının talep edildiğinde sunulabilmesidir.</p>

<p>Ürünlerimizin teknik ve belge dosyaları için <a href="/kategori/tasinabilir-guc-kaynaklari">güç kaynakları kategorimizi</a> inceleyebilir, kurumsal ihtiyaçlarınız için <a href="/iletisim">bize yazabilirsiniz</a>. Doğru kapasiteyi belirlemek isterseniz <a href="/guc-hesaplayici">güç hesaplayıcı</a> ilk adım için yeterli olacaktır.</p>`,
  },
];

async function main() {
  console.log("🚀 Blog Seed 11 başlıyor...\n");

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

  console.log("\n🎉 Blog Seed 11 tamamlandı.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Hata:", e);
  prisma.$disconnect();
  process.exit(1);
});
