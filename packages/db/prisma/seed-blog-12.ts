/**
 * FusionMarkt Blog Seed — 12
 * 25) Su Pompası ve Hidrofor İçin Kaç Watt Gerekir?
 * 26) Jump Starter Nedir? Power Station ile Akü Takviyesi
 * 27) Ofis ve Küçük İşletmede Elektrik Kesilirse
 * 28) Elektrik Kesintisinde Buzdolabındaki Yiyecekler Kaç Saat Dayanır?
 *
 * Kullanım:
 *   cd packages/db && npx tsx prisma/seed-blog-12.ts
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
  // 25 — SU POMPASI / HİDROFOR
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "su-pompasi-hidrofor-icin-kac-watt-guc-kaynagi-gerekir",
    title: "Su Pompası ve Hidrofor İçin Kaç Watt Güç Kaynağı Gerekir?",
    excerpt:
      "Etiketinde 750W yazan hidrofor, ilk saniyede 3000W'ın üzerine çıkabilir. Kalkış akımının neden bu kadar önemli olduğunu ve doğru modeli nasıl seçeceğinizi hesaplarla anlatıyoruz.",
    category: "Rehber",
    tags: [
      "su pompası power station",
      "hidrofor kaç watt",
      "kalkış akımı",
      "pik güç",
      "dalgıç pompa",
      "elektrik kesintisi su",
    ],
    metaTitle: "Su Pompası ve Hidrofor Kaç Watt Çeker? Doğru Kapasite Seçimi",
    metaDescription:
      "Hidrofor ve su pompası için hangi güç kaynağı yeterli? Kalkış akımı, pik güç, günlük enerji hesabı ve model karşılaştırmasıyla adım adım seçim rehberi.",
    metaKeywords: [
      "hidrofor kaç watt çeker",
      "su pompası power station",
      "kalkış akımı nedir",
      "dalgıç pompa jeneratör",
      "hidrofor yedek güç",
      "pompa pik güç",
    ],
    content: `<p>Su pompası, taşınabilir güç kaynağı seçiminde en çok hata yapılan cihazdır. Sebebi basit: etikette yazan sayı, cihazın çektiği en yüksek gücü göstermez. Etiketinde 750W yazan bir hidrofor, motorun döndüğü ilk yarım saniyede bunun birkaç katını ister.</p>

<p>Bu farkı hesaba katmadan alınan bir güç kaynağı, pompayı hiç çalıştıramaz. Ekranda hata görür, koruma devreye girer ve cihaz kapanır. Kapasite yeterli olsa bile sonuç değişmez, çünkü sorun kapasitede değil anlık güçtedir.</p>

<blockquote>
<strong>Hızlı Cevap:</strong> Elektrik motorlu pompalar çalışmaya başlarken nominal güçlerinin tipik olarak 3–6 katı kadar anlık akım çeker. 0,5 HP (≈370W) bir hidrofor için 1500–2200W, 1 HP (≈750W) için 2500–4000W pik güç gerekir. Bu yüzden pompa besleyecek bir güç kaynağında bakılması gereken değer sürekli çıkış değil, <strong>pik (surge) güç</strong> değeridir. 0,5 HP için <a href="/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800">P1800</a>, 1 HP ve üzeri için <a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200</a> veya <a href="/urun/5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000">SH4000</a> uygun sınıftır.
</blockquote>

<h2>Kalkış Akımı Neden Oluşur?</h2>

<p>Duran bir elektrik motoru, rotoru döndürmeye başlarken hem ataleti yenmek hem de manyetik alanı kurmak zorundadır. Rotor henüz dönmediği için motorun kendi ürettiği ters gerilim yoktur ve sargılardan çok yüksek bir akım geçer. Motor devrine ulaştıkça akım hızla nominal seviyeye iner.</p>

<p>Bu olay saniyenin küçük bir kesrinde biter. Şebeke bunu fark etmez bile; arkasında koca bir dağıtım sistemi vardır. Ancak taşınabilir bir invertörün verebileceği anlık güç sınırlıdır ve sınırı aşan talep karşısında koruma devreye girer.</p>

<p>Pompalarda durum bir de suyun ağırlığıyla ağırlaşır. Boru dolu, çekvalf kapalı ve basınç yüksekken motor yüke karşı kalkış yapar; bu da tepe akımını artırır.</p>

<h2>Pompa Tiplerine Göre Tipik Değerler</h2>

<table>
  <thead>
    <tr>
      <th>Pompa Tipi</th>
      <th>Tipik Nominal Güç</th>
      <th>Beklenen Pik Güç</th>
      <th>Önerilen Model</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Küçük sirkülasyon pompası</td><td>25–90W</td><td>150–300W</td><td>P800 ve üzeri</td></tr>
    <tr><td>Şofben/kombi devir daim</td><td>50–120W</td><td>200–400W</td><td>P800 ve üzeri</td></tr>
    <tr><td>Hidrofor 0,5 HP</td><td>~370W</td><td>1500–2200W</td><td>P1800 ve üzeri</td></tr>
    <tr><td>Hidrofor 1 HP</td><td>~750W</td><td>2500–4000W</td><td>P3200 / SH4000</td></tr>
    <tr><td>Dalgıç pompa 1 HP</td><td>~750W</td><td>3000–4500W</td><td>P3200 / SH4000</td></tr>
    <tr><td>Dalgıç pompa 1,5 HP</td><td>~1100W</td><td>4000–6000W</td><td>SH4000</td></tr>
    <tr><td>Havuz/bahçe pompası 2 HP</td><td>~1500W</td><td>5000W üzeri</td><td>SH4000 (mühendislik değerlendirmesi)</td></tr>
  </tbody>
</table>

<p>Tablodaki değerler tipik aralıklardır. Kesin sayı motor tipine, kondansatörlü marş olup olmadığına ve sistemdeki basınca göre değişir. Cihazınızın etiketindeki güç ve akım değerlerini mutlaka okuyun.</p>

<h2>Modellerin Pik Güç Sınırları</h2>

<table>
  <thead>
    <tr><th>Model</th><th>Sürekli Çıkış</th><th>Pik Güç</th><th>Kapasite</th></tr>
  </thead>
  <tbody>
    <tr><td><a href="/urun/512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800">P800</a></td><td>800W (1200W Smart-Boost)</td><td>1600W</td><td>512Wh</td></tr>
    <tr><td><a href="/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800">P1800</a></td><td>1800W</td><td>3600W</td><td>1024Wh</td></tr>
    <tr><td><a href="/urun/1920wh-4000w-max-lifepo4-tasinabilir-guc-kaynagi-aplikasyon-kablosuz-sarj-operasyonel-kullanim-4000-ustu-dongu-99-99-bms-coklu-cikis-singo2000pro">Singo 2000 Pro</a></td><td>2000W</td><td>4000W</td><td>1920Wh</td></tr>
    <tr><td><a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200</a></td><td>3200W</td><td>6400W</td><td>2048Wh</td></tr>
    <tr><td><a href="/urun/5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000">SH4000</a></td><td>4000W</td><td>8000W</td><td>5120Wh</td></tr>
  </tbody>
</table>

<p>Seçim yaparken pompanın beklenen pik değerinin, modelin pik sınırının altında kalması gerekir. Sınırın hemen dibinde çalışmak yerine bir üst modele geçmek daha güvenli bir tercihtir; özellikle pompa eskidikçe kalkış akımı artabilir.</p>

<h2>Enerji Hesabı: Ne Kadar Su Çekebilirsiniz?</h2>

<p>Pik güç pompanın <em>çalışıp çalışmayacağını</em> belirler. Kapasite ise <em>ne kadar süre</em> çalışacağını. İkisini karıştırmamak gerekir.</p>

<p>Hidroforlar sürekli çalışmaz; su kullanıldıkça devreye girer, basınç dolunca durur. Ortalama bir evde günlük toplam çalışma süresi 15–30 dakikadır.</p>

<p><strong>Örnek:</strong> 750W'lık bir hidrofor günde toplam 20 dakika çalışıyorsa günlük tüketim yaklaşık 250Wh olur.</p>

<table>
  <thead>
    <tr><th>Model</th><th>Kullanılabilir Enerji</th><th>0,5 HP Hidrofor (günlük ~125Wh)</th><th>1 HP Hidrofor (günlük ~250Wh)</th></tr>
  </thead>
  <tbody>
    <tr><td>P1800</td><td>~870Wh</td><td>~7 gün</td><td>~3,5 gün</td></tr>
    <tr><td>P3200</td><td>~1740Wh</td><td>~14 gün</td><td>~7 gün</td></tr>
    <tr><td>SH4000</td><td>~4350Wh</td><td>~35 gün</td><td>~17 gün</td></tr>
  </tbody>
</table>

<p>Bu tablo yalnızca pompayı besleme senaryosudur. Aynı cihazdan buzdolabı ve aydınlatma da besleyecekseniz süre kısalır. Etiket kapasitesiyle kullanılabilir enerji arasındaki farkın nedenini <a href="/blog/gercek-kullanilabilir-kapasite-wh-verim-kayiplari">gerçek kullanılabilir kapasite</a> yazımızda açıkladık.</p>

<h2>Kesintide Pompayı Çalıştırırken Dikkat Edilecekler</h2>

<ol>
  <li><strong>Diğer yükleri ayırın.</strong> Pompa kalkarken sistemde başka büyük cihaz olmasın; pik güç bütçesini boşaltın.</li>
  <li><strong>Uzatma kablosunu kısa ve kalın tutun.</strong> İnce ve uzun kablo, kalkış anında gerilim düşümü yaratır ve motoru zorlar. Kesit hesabı için <a href="/blog/solar-kablo-konnektor-mc4-xt60-anderson-kesit-hesabi">kablo ve kesit rehberimize</a> bakın.</li>
  <li><strong>Saf sinüs çıkış şart.</strong> Motorlu cihazlar modifiye sinüste ısınır ve verim kaybeder. Farkı <a href="/blog/saf-sinus-dalga-vs-modifiye-sinus-fark-nedir">bu yazıda</a> anlattık; ürünlerimizin tamamı saf sinüs çıkış verir.</li>
  <li><strong>Depo kullanmayı düşünün.</strong> Basınçlı tanka veya üst depoya bir kez su basıp yerçekimiyle kullanmak, pompanın çalışma sayısını ciddi biçimde azaltır.</li>
  <li><strong>Kuru çalıştırmayın.</strong> Su gelmiyorsa pompayı zorlamak hem motoru hem bataryayı boşa yorar.</li>
</ol>

<h2>Tarım ve Bağ Evi Senaryosu</h2>

<p>Şebekesi olmayan arazide pompa çalıştırmak istiyorsanız hesap değişir: enerji sadece harcanmaz, güneşten yeniden üretilir. Günlük su ihtiyacınıza göre panel gücü seçilir ve batarya gece ile bulutlu günler için tampon görevi görür.</p>

<p><a href="/urun/tasinabilir-gunes-paneli-400w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp400">SP400</a> gibi bir panel, iyi bir günde 1,5–2 kWh üretebilir; bu da orta ölçekli bir sulama pompasının günlük ihtiyacını karşılar. Panel ve cihaz uyumu için gerilim aralıklarını kontrol etmek gerekir; ayrıntıları <a href="/blog/solar-panel-seri-paralel-baglanti-rehberi">seri-paralel bağlantı rehberimizde</a> bulabilirsiniz.</p>

<h2>Sıkça Sorulan Sorular</h2>

<h3>Pompam etiketinde 750W yazıyor ama 1800W'lık cihazda çalışmıyor, neden?</h3>
<p>Çünkü kalkış anında 2500–4000W isteyebilir. Sürekli çıkış 1800W olsa da pik sınır 3600W'tır ve pompa bunun üzerine çıkmış olabilir. Bir üst pik sınıfına geçmek gerekir.</p>

<h3>Yumuşak yol verici (soft starter) işe yarar mı?</h3>
<p>Evet, kalkış akımını düşürerek daha küçük bir kaynakla çalışmayı mümkün kılabilir. Ancak pompa devresine ekipman eklemek elektrikçi işidir; uygunluğu yerinde değerlendirilmelidir.</p>

<h3>Frekans (Hz) önemli mi?</h3>
<p>Evet. Motorların devri şebeke frekansına bağlıdır; Türkiye'de 50 Hz kullanılır. Ürünlerimiz 220–230V / 50 Hz saf sinüs çıkış verir, bu yüzden pompa devri normal davranır.</p>

<h3>Dalgıç pompam derin kuyuda, hesap değişir mi?</h3>
<p>Evet. Derinlik arttıkça motor daha yüksek yüke karşı kalkış yapar ve hem pik hem sürekli tüketim artar. Derin kuyu uygulamalarında <a href="/urun/5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000">SH4000</a> sınıfına bakmak ve kurulum öncesi <a href="/iletisim">bize danışmak</a> daha doğru olur.</p>

<h3>Motor gücü ve akım ilişkisini nereden öğrenebilirim?</h3>
<p>Asenkron motorların kalkış davranışı standartlarda tanımlanır. Genel bir teknik giriş için <a href="https://www.energy.gov/eere/amo/articles/premium-efficiency-motor-selection-and-application-guide-handbook-industry" target="_blank" rel="noopener noreferrer">ABD Enerji Bakanlığı'nın motor seçim el kitabı</a> faydalıdır.</p>

<h2>Doğru Sayıya Bakın</h2>

<p>Pompa seçiminde tek kural şudur: kapasiteye değil pik güce bakın. Kapasite süreyi belirler ama cihazın hiç çalışmaması pik sınırından kaynaklanır.</p>

<p>Pompanızın etiket değerlerini ve birlikte çalıştırmak istediğiniz diğer cihazları <a href="/guc-hesaplayici">güç hesaplayıcıya</a> girin. Emin olamadığınız bir kurulum varsa pompa marka-modelini <a href="/iletisim">bize iletin</a>; uygun sınıfı birlikte belirleyelim. Tüm seçenekleri <a href="/kategori/tasinabilir-guc-kaynaklari">taşınabilir güç kaynakları kategorisinde</a> görebilirsiniz.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // 26 — JUMP STARTER
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "jump-starter-nedir-power-station-ile-aku-takviyesi",
    title: "Jump Starter Nedir? Power Station ile Araç Aküsü Takviye Edilir mi?",
    excerpt:
      "Akü bitti, yol ortasındasınız. Jump starter nasıl çalışır, kaç amper gerekir, güç istasyonunun AC çıkışıyla akü takviyesi neden farklı bir iştir? Adım adım güvenli kullanım.",
    category: "Rehber",
    tags: [
      "jump starter",
      "akü takviye",
      "araç aküsü bitti",
      "P3200 jump starter",
      "marş akımı",
      "araç yardımı",
    ],
    metaTitle: "Jump Starter Nedir? Power Station ile Akü Takviyesi Rehberi",
    metaDescription:
      "Jump starter nasıl çalışır, kaç amper gerekir? Power station ile araç aküsü takviye edilir mi? Doğru kullanım adımları, güvenlik kuralları ve yaygın hatalar.",
    metaKeywords: [
      "jump starter nedir",
      "akü takviye cihazı",
      "araba aküsü bitti ne yapmalı",
      "jump starter kaç amper",
      "power station akü takviyesi",
      "marş akımı",
    ],
    content: `<p>Sabah aceleniz var, kontağı çeviriyorsunuz ve motordan sadece boğuk bir tıkırtı geliyor. Akü bitmiş. Klasik çözüm, başka bir araç bulup takviye kablosuyla bağlantı yapmaktır. Ama park halindeyken yan tarafta araç olmayabilir, ya da kablo bağlantısını yanlış yapma riskini almak istemeyebilirsiniz.</p>

<p>Jump starter tam olarak bu boşluğu doldurur: kendi enerjisini taşıyan, tek başına marş verebilen bir cihaz.</p>

<blockquote>
<strong>Hızlı Cevap:</strong> Jump starter, aküsü zayıflamış aracın marş motoruna birkaç saniyeliğine yüksek akım sağlayan taşınabilir cihazdır. Aküyü şarj etmez, sadece motoru döndürecek anlık akımı verir. Benzinli 1.6 motor için tipik olarak 400–600A tepe akım yeterlidir; dizel ve büyük hacimli motorlarda 800–1200A gerekir. Güç istasyonunun AC çıkışı bu işi <strong>doğrudan</strong> yapamaz; ya cihazın dahili jump starter fonksiyonu ya da ayrı bir jump starter modülü gerekir. <a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200</a> dahili jump starter ile gelir.
</blockquote>

<h2>Marş Motoru Neden Bu Kadar Akım İster?</h2>

<p>Marş motorunun görevi, sıkıştırma direncine karşı motor bloğunu döndürmektir. Bu birkaç saniyelik iş, aracın en yüksek elektrik talebini oluşturur.</p>

<p>12V bir sistemde marş anında 150–300A akım akması normaldir; soğuk havada ve dizel motorlarda bu değer daha da yükselir. Jump starter'ların üzerinde yazan “tepe akım” değeri ise çok kısa süreli maksimum kapasiteyi ifade eder ve gerçek marş akımından yüksektir.</p>

<table>
  <thead>
    <tr><th>Araç Tipi</th><th>Tipik Marş Akımı</th><th>Önerilen Tepe Akım</th></tr>
  </thead>
  <tbody>
    <tr><td>Küçük benzinli (1.0–1.4)</td><td>120–200A</td><td>400A ve üzeri</td></tr>
    <tr><td>Orta benzinli (1.6–2.0)</td><td>150–250A</td><td>600A ve üzeri</td></tr>
    <tr><td>Küçük dizel (1.5–1.6)</td><td>200–300A</td><td>800A ve üzeri</td></tr>
    <tr><td>Büyük dizel / SUV / kamyonet</td><td>300–450A</td><td>1000–2000A</td></tr>
  </tbody>
</table>

<p>Soğuk hava bu tabloyu olumsuz etkiler. Düşük sıcaklıkta motor yağı koyulaşır, direnç artar ve aynı motor daha fazla akım ister. Kışın takviye ihtiyacının artmasının sebebi budur.</p>

<h2>Jump Starter ile Powerbank Aynı Şey Değildir</h2>

<p>Görünüşleri benzese de iki cihaz farklı iş yapar. Powerbank sabit ve düşük bir akımı uzun süre verir; jump starter ise çok kısa süreli, çok yüksek bir akım darbesi verir.</p>

<p>Bu yüzden jump starter'da kapasiteden (Wh veya mAh) çok, çıkış akımı ve kablo/kelepçe kalitesi önemlidir. İnce kablolu bir cihaz, etiketinde yüksek amper yazsa bile o akımı aküye ulaştıramaz.</p>

<h2>Neden Güç İstasyonunun Prizinden Marş Verilemez?</h2>

<p>Bu, sık sorulan ve mantıklı görünen bir sorudur: elimde 3200W verebilen bir cihaz var, neden aküyü çalıştıramıyorum?</p>

<p>Sebep gerilim ve akım biçimidir. Marş motoru 12V doğru akımla ve yüzlerce amperle çalışır. Güç istasyonunun AC prizi ise 230V alternatif akım verir. Aracın marş devresi bu gerilimi kullanamaz.</p>

<p>Araç çıkışı (12V soket) da yeterli değildir; bu çıkış tipik olarak 10A civarında sınırlıdır ve marş için gereken akımın yanında son derece küçüktür. Ayrıntı için <a href="/blog/watt-volt-amper-wh-enerji-birimleri-rehberi">enerji birimleri rehberimize</a> bakabilirsiniz.</p>

<p>Uygulanabilir iki yol vardır:</p>

<ul>
  <li><strong>Dahili jump starter fonksiyonu.</strong> <a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200</a> bu amaç için ayrı bir çıkış ve kelepçe seti ile gelir.</li>
  <li><strong>Ayrı jump starter cihazı.</strong> Güç istasyonu bu cihazı şarjlı tutmak için kullanılır; marşı jump starter verir.</li>
</ul>

<h2>Adım Adım Güvenli Takviye</h2>

<p>Sıra ve kutup yönü kritik önemdedir. Yanlış bağlantı, aracın elektronik modüllerine kalıcı zarar verebilir.</p>

<ol>
  <li><strong>Kontağı kapatın.</strong> Farlar, klima ve müzik sistemi dahil tüm tüketiciler kapalı olmalı.</li>
  <li><strong>Akü kutuplarını temizleyin.</strong> Oksitlenmiş kutup başı, akımın geçmesini engeller.</li>
  <li><strong>Önce kırmızıyı bağlayın.</strong> Kırmızı kelepçe akünün artı (+) kutbuna.</li>
  <li><strong>Sonra siyahı bağlayın.</strong> Siyah kelepçe, akünün eksi kutbuna veya üreticinin önerdiği şasi noktasına.</li>
  <li><strong>Cihazı açın ve göstergeyi kontrol edin.</strong> Modern jump starter'lar ters bağlantı ve kısa devre uyarısı verir; kırmızı uyarı varsa marş vermeyin.</li>
  <li><strong>Marş verin.</strong> Tek seferde 3–5 saniyeyi geçmeyin.</li>
  <li><strong>Başarısızsa bekleyin.</strong> Denemeler arasında en az 30 saniye ara verin. Üç denemede çalışmazsa sorun aküden başka bir yerdedir; zorlamayın.</li>
  <li><strong>Ters sırayla sökün.</strong> Motor çalıştıktan sonra önce siyah, sonra kırmızı kelepçeyi çıkarın.</li>
</ol>

<h3>Yapılmaması Gerekenler</h3>

<ul>
  <li>Kelepçeleri birbirine değdirmeyin.</li>
  <li>Şişmiş, çatlamış veya sızıntı yapan aküye takviye vermeyin.</li>
  <li>Donmuş aküye marş vermeyin.</li>
  <li>Kapalı garajda uzun süre denemeyin; akü gaz çıkarabilir.</li>
  <li>Cihazı yağmurda veya su birikintisinde ıslatmayın.</li>
</ul>

<p>Akü bakımı ve güvenli elleçleme hakkında genel bilgi için <a href="https://www.nhtsa.gov/road-safety/vehicle-maintenance" target="_blank" rel="noopener noreferrer">NHTSA'nın araç bakım sayfası</a> gibi resmi kaynaklara başvurabilirsiniz. Aracınızın kullanım kılavuzundaki şasi bağlantı noktası uyarıları her zaman önceliklidir.</p>

<h2>Marş Verdi Ama Sonrası?</h2>

<p>Jump starter aküyü doldurmaz. Motor çalıştıktan sonra şarj işini alternatör devralır, ancak boşalmış bir aküyü doldurmak yarım saatlik kısa bir sürüşle olmaz.</p>

<p>Aracınız sık sık aynı sorunu yaşıyorsa akü ömrünü tamamlamış olabilir. Marş aküsü ile enerji depolama çözümlerinin neden farklı işler için tasarlandığını <a href="/blog/tasinabilir-guc-istasyonu-vs-jenerator-vs-aku-karsilastirma">güç istasyonu, jeneratör ve akü karşılaştırmasında</a> anlattık.</p>

<h2>Araçta Bir Güç İstasyonu Bulundurmanın Diğer Faydaları</h2>

<p>Jump starter yılda belki bir kez işe yarar. Ancak araçta taşınan bir güç istasyonu, günlük hayatta çok daha sık kullanılır:</p>

<ul>
  <li>Telefon, tablet ve dizüstü şarjı</li>
  <li>Kamp ve piknikte buzdolabı, ocak ve aydınlatma</li>
  <li>Yol kenarında acil durum aydınlatması</li>
  <li>Uzaktan çalışırken laptop ve mobil modem</li>
  <li>Elektrik kesintisinde evde yedek güç</li>
</ul>

<p><a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200</a> bu senaryoların hepsini tek cihazda toplar: 2048Wh kapasite, 3200W sürekli çıkış, dahili powerbank, jump starter ve fener. Araçtan şarj imkânıyla yolculuk sırasında kendini yeniler. Daha kompakt bir çözüm arıyorsanız 6,55 kg ağırlığındaki <a href="/urun/512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800">P800</a> araç içi kullanım için pratik bir alternatiftir.</p>

<h2>Sıkça Sorulan Sorular</h2>

<h3>Jump starter kaç amper olmalı?</h3>
<p>Benzinli araçlar için 600A tepe akım çoğu durumda yeterlidir. Dizel ve büyük hacimli motorlarda 1000A üzeri tercih edilmelidir. Aracınızın kılavuzundaki akü CCA değeri iyi bir referanstır.</p>

<h3>Cihaz aracın elektroniğine zarar verir mi?</h3>
<p>Doğru kutupla ve koruma özellikli bir cihazla yapılan takviye risk oluşturmaz. Zarar genellikle ters bağlantı veya kelepçelerin kıvılcım çıkarmasıyla oluşur. Bu yüzden ters bağlantı korumalı cihaz tercih edin.</p>

<h3>Cihazı ne sıklıkla şarj etmeliyim?</h3>
<p>Kullanmasanız bile birkaç ayda bir kontrol edin. Boş bekleyen bir jump starter, ihtiyaç anında işe yaramaz. LiFePO4 bataryaların depolama davranışı için <a href="/blog/tasinabilir-guc-kaynagi-bakim-ve-depolama-rehberi">bakım ve depolama rehberimize</a> bakın.</p>

<h3>Kışın performansı düşer mi?</h3>
<p>Evet, çift yönlü olarak: soğukta hem araç daha fazla akım ister hem de cihazın verebileceği akım azalır. Cihazı mümkünse araç kabininde saklayın. Ayrıntılar <a href="/blog/kisin-guc-istasyonu-kullanimi-soguk-hava-performans-rehberi">soğuk hava rehberimizde</a>.</p>

<h3>Motosiklet veya tekne için de kullanılır mı?</h3>
<p>12V sistemli araçlarda genel olarak kullanılabilir. 24V sistemlerde ise cihazın bu gerilimi desteklemesi gerekir; kılavuzu kontrol edin.</p>

<h2>Yolda Kalmamak İçin</h2>

<p>Jump starter, yılın 364 günü çantada bekleyip bir gün sizi kurtaran cihazlardan biridir. Dahili jump starter'lı bir güç istasyonu ise aynı işi görürken geri kalan zamanda kamp, çalışma ve kesinti senaryolarında da işinize yarar.</p>

<p>Kullanım profilinize uygun modeli belirlemek için <a href="/guc-hesaplayici">güç hesaplayıcıyı</a> deneyebilir, tüm seçenekleri <a href="/kategori/tasinabilir-guc-kaynaklari">taşınabilir güç kaynakları kategorimizde</a> inceleyebilirsiniz. Emin olamadığınız bir nokta olursa <a href="/iletisim">bize yazın</a>.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // 27 — OFİS VE KÜÇÜK İŞLETME
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "ofis-kucuk-isletme-elektrik-kesintisi-yedek-guc",
    title: "Ofis ve Küçük İşletmede Elektrik Kesilirse: POS, Kasa ve Modem Ne Kadar Dayanır?",
    excerpt:
      "Kesinti bir işletme için sadece karanlık değil, satış kaybı demek. POS cihazı, yazarkasa, modem ve bilgisayarların gerçek tüketimini hesaplayıp doğru yedekleme kapasitesini belirliyoruz.",
    category: "Rehber",
    tags: [
      "işletme yedek güç",
      "ofis elektrik kesintisi",
      "POS cihazı yedekleme",
      "yazarkasa kesinti",
      "kafe restoran enerji",
      "iş sürekliliği",
    ],
    metaTitle: "Ofis ve Küçük İşletme İçin Yedek Güç: Kaç Wh Gerekir?",
    metaDescription:
      "Elektrik kesintisinde POS, yazarkasa, modem, kamera ve bilgisayarlar ne kadar dayanır? Küçük işletmeler için watt hesabı, kapasite seçimi ve kurulum önerileri.",
    metaKeywords: [
      "işletme için yedek güç",
      "ofis elektrik kesintisi çözümü",
      "pos cihazı kesintide çalışır mı",
      "yazarkasa yedek güç",
      "kafe restoran jeneratör alternatifi",
      "küçük işletme ups",
    ],
    content: `<p>Bir evde elektrik kesildiğinde en kötü ihtimalle canınız sıkılır. Bir işletmede ise kasa kapanır, POS cihazı çalışmaz, sipariş alınamaz ve müşteri kapıdan döner. Kesinti bir saat sürse bile maliyeti, o saatte yapılamayan ciroyla ölçülür.</p>

<p>İyi haber şu: bir işletmenin kritik cihazlarının toplam tüketimi, çoğu işletme sahibinin tahmin ettiğinden çok daha düşüktür. Ciddi bir jeneratör kurmadan da satışın devam etmesini sağlamak mümkündür.</p>

<blockquote>
<strong>Hızlı Cevap:</strong> Tipik bir küçük işletmede POS cihazı, yazarkasa, modem-router, bir bilgisayar ve temel aydınlatmanın toplamı 150–300W arasındadır. 1024Wh'lik <a href="/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800">P1800</a> bu yükü yaklaşık 3–5 saat, 2048Wh'lik <a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200</a> ise 6–10 saat besler. Buzdolabı ve vitrin dolabı gibi soğutucular da yedeklenecekse <a href="/urun/5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000">SH4000</a> sınıfına çıkmak gerekir.
</blockquote>

<h2>Önce Kritik Yükleri Ayırın</h2>

<p>Yedeklemenin ilk kuralı, her şeyi yedeklemeye çalışmamaktır. Cihazları üç gruba ayırın:</p>

<table>
  <thead>
    <tr><th>Öncelik</th><th>Cihazlar</th><th>Neden</th></tr>
  </thead>
  <tbody>
    <tr><td>Kritik</td><td>POS, yazarkasa, modem, router, temel aydınlatma</td><td>Satış bunlar olmadan yapılamaz</td></tr>
    <tr><td>Önemli</td><td>Bilgisayar, kamera/NVR, telefon santrali, soğutucular</td><td>Operasyon ve güvenlik sürer</td></tr>
    <tr><td>Ertelenebilir</td><td>Klima, ısıtıcı, fırın, ütü, kurutucu</td><td>Yüksek watt, kısa süre kapanabilir</td></tr>
  </tbody>
</table>

<p>Üçüncü gruptaki cihazlar toplam tüketimin büyük kısmını oluşturur ve kesinti boyunca kapalı kalabilir. İlk iki grubu yedeklemek, işletmenin çalışmaya devam etmesi için genellikle yeterlidir.</p>

<h2>Cihaz Cihaz Gerçek Tüketim</h2>

<table>
  <thead>
    <tr><th>Cihaz</th><th>Tipik Güç</th><th>Günlük 8 Saat</th></tr>
  </thead>
  <tbody>
    <tr><td>POS / kredi kartı terminali</td><td>5–15W</td><td>~80Wh</td></tr>
    <tr><td>Yazarkasa (ÖKC)</td><td>10–25W</td><td>~140Wh</td></tr>
    <tr><td>Fiş yazıcısı (termal)</td><td>Bekleme 5W, baskı 50W</td><td>~60Wh</td></tr>
    <tr><td>Modem + router</td><td>10–20W</td><td>~120Wh</td></tr>
    <tr><td>Dizüstü bilgisayar</td><td>45–65W</td><td>~440Wh</td></tr>
    <tr><td>Masaüstü + monitör</td><td>120–250W</td><td>~1500Wh</td></tr>
    <tr><td>Barkod okuyucu</td><td>2–5W</td><td>~30Wh</td></tr>
    <tr><td>Kamera sistemi (4 kamera + NVR)</td><td>30–60W</td><td>~360Wh</td></tr>
    <tr><td>LED aydınlatma (6 armatür)</td><td>60–120W</td><td>~720Wh</td></tr>
    <tr><td>Vitrin/buzdolabı</td><td>Ortalama 80–150W</td><td>~900Wh</td></tr>
  </tbody>
</table>

<p>Masaüstü bilgisayar ile dizüstü arasındaki fark dikkat çekicidir. Yedekleme planlaması yapan bir işletme için kasadaki bilgisayarı dizüstüne çevirmek, tek başına ciddi bir kazanç sağlar.</p>

<h2>Senaryo Hesapları</h2>

<h3>Senaryo 1 — Butik, kuaför, küçük ofis</h3>

<p>POS (10W) + yazarkasa (15W) + modem (15W) + dizüstü (55W) + LED aydınlatma (80W) = <strong>175W</strong></p>

<table>
  <thead>
    <tr><th>Model</th><th>Kullanılabilir</th><th>Tahmini Süre</th></tr>
  </thead>
  <tbody>
    <tr><td>P800 (512Wh)</td><td>~435Wh</td><td>~2,5 saat</td></tr>
    <tr><td>P1800 (1024Wh)</td><td>~870Wh</td><td>~5 saat</td></tr>
    <tr><td>P3200 (2048Wh)</td><td>~1740Wh</td><td>~10 saat</td></tr>
  </tbody>
</table>

<p>Bu profil için P1800 çoğu kesintiyi rahatlıkla karşılar. Tam iş günü hedefliyorsanız P3200 daha uygundur.</p>

<h3>Senaryo 2 — Kafe, market, eczane (soğutucu dahil)</h3>

<p>Kritik yükler (175W) + vitrin dolabı (ortalama 120W) + kamera sistemi (45W) = <strong>340W</strong></p>

<table>
  <thead>
    <tr><th>Model</th><th>Kullanılabilir</th><th>Tahmini Süre</th></tr>
  </thead>
  <tbody>
    <tr><td>P1800</td><td>~870Wh</td><td>~2,5 saat</td></tr>
    <tr><td>Singo 2000 Pro (1920Wh)</td><td>~1630Wh</td><td>~4,8 saat</td></tr>
    <tr><td>P3200</td><td>~1740Wh</td><td>~5 saat</td></tr>
    <tr><td>SH4000 (5120Wh)</td><td>~4350Wh</td><td>~12,8 saat</td></tr>
  </tbody>
</table>

<p>Soğutucularda kalkış akımı unutulmamalıdır: kompresör devreye girerken nominal gücün birkaç katını ister. Bu yüzden pik güç sınırı yüksek modeller tercih edilmelidir. Soğutucu davranışı hakkında <a href="/blog/buzdolabi-icin-kac-wh-gerekir">buzdolabı için kaç Wh gerekir</a> yazımıza bakabilirsiniz.</p>

<h3>Senaryo 3 — Çok kullanıcılı ofis</h3>

<p>4 dizüstü (220W) + ağ ekipmanı (40W) + küçük sunucu/NAS (60W) + aydınlatma (100W) + yazıcı bekleme (10W) = <strong>430W</strong></p>

<p>Bu profil için 4 AC çıkışı bulunan <a href="/urun/1920wh-4000w-max-lifepo4-tasinabilir-guc-kaynagi-aplikasyon-kablosuz-sarj-operasyonel-kullanim-4000-ustu-dongu-99-99-bms-coklu-cikis-singo2000pro">Singo 2000 Pro</a> pratik bir çözümdür ve yaklaşık 3,8 saat çalışma sağlar. Tam gün kesintisizlik hedefleniyorsa SH4000 ile sabit kurulum düşünülmelidir.</p>

<h2>UPS Modu: Kesintide Kesinti Yaşanmasın</h2>

<p>Bilgisayar, sunucu ve NVR gibi cihazlar aniden kapandığında veri kaybı yaşanabilir. Bu yüzden yedeklemenin sadece kapasitesi değil, geçiş hızı da önemlidir.</p>

<p><a href="/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800">P1800</a> yaklaşık 10 ms'de devreye girer; bu süre bilgisayarların ve ağ cihazlarının kapanmasına yol açmayacak kadar kısadır. Cihaz normalde şebekeden geçiş yapar, kesinti anında otomatik olarak bataryaya döner.</p>

<p>Klasik ofis UPS'i ile güç istasyonu arasındaki farkları <a href="/blog/ups-mi-power-station-mi">UPS mi power station mı</a> yazımızda karşılaştırdık. Kısaca: UPS dakikalar için, güç istasyonu saatler için tasarlanmıştır.</p>

<h2>Sabit Kurulum ve Otomatik Devreye Girme</h2>

<p>Her kesintide cihazların fişini prizden prize taşımak sürdürülebilir değildir. Kalıcı çözüm, işletmenin kritik yüklerini ayrı bir panoya alıp yedek kaynağa bağlamaktır.</p>

<p><a href="/urun/5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000">SH4000</a> bu mimari için tasarlanmıştır: 5120Wh kapasite, 4000W sürekli çıkış, ATS uyumu, IP54 koruma ve 40 dB altı sessiz çalışma. B5120 modülleriyle kapasitesi genişletilebilir. Pano bağlantısının nasıl kurgulandığını <a href="/blog/hibrit-invertor-ats-nedir-ev-panosu-baglanti">hibrit invertör ve ATS rehberimizde</a> anlattık. Kurulum yetkili elektrikçi tarafından yapılmalıdır.</p>

<h3>Jeneratöre Göre Avantajları</h3>

<ul>
  <li>Egzoz gazı yok; kapalı mekânda çalışabilir</li>
  <li>40 dB altı ses; müşteri alanında rahatsız etmez</li>
  <li>Yakıt taşıma, depolama ve bakım derdi yok</li>
  <li>Anında devreye girer; marş bekleme süresi yoktur</li>
</ul>

<p>Karşılaştırmanın tamamı <a href="/blog/power-station-nedir-jenerator-farki">power station ve jeneratör farkı</a> yazımızda.</p>

<h2>Elektrik Faturasını da Düşürmek</h2>

<p>Yedek güç sistemi yılda birkaç kez kullanılan bir sigorta olmak zorunda değil. Üç zamanlı tarife kullanan işletmelerde sistem gece ucuz tarifeden şarj olur, gündüz pahalı saatlerde kritik yükleri besler.</p>

<p>Buna güneş paneli eklenirse tasarruf artar. <a href="/urun/tasinabilir-gunes-paneli-400w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp400">SP400</a> panelleri, gündüz üretimiyle sistemi sürekli besler. Tarife stratejisini <a href="/blog/uc-zamanli-tarife-power-station-elektrik-tasarrufu">üç zamanlı tarife</a> yazımızda hesapladık. Türkiye'deki tarife dilimlerini <a href="https://www.epdk.gov.tr/" target="_blank" rel="noopener noreferrer">EPDK'nın resmi sitesinden</a> takip edebilirsiniz.</p>

<h2>Sıkça Sorulan Sorular</h2>

<h3>POS cihazım kesintide internetsiz çalışır mı?</h3>
<p>Çoğu POS terminali işlem için bağlantıya ihtiyaç duyar. Bu yüzden modem ve router'ı da yedeklemek şarttır. Bazı terminaller mobil veri ile yedek bağlantı yapar; operatörünüzden teyit alın.</p>

<h3>Yazarkasanın kendi bataryası var, yine de yedeklemeli miyim?</h3>
<p>Yazarkasaların dahili bataryası genellikle kısa sürelidir. Uzun kesintilerde yedek güç kaynağına bağlamak gerekir.</p>

<h3>Kesinti sırasında kredi kartı ödemesi alamazsam ne yapmalıyım?</h3>
<p>Bu tam olarak yedeklemeyle çözülen bir sorundur. POS, yazarkasa ve modemin toplamı 50W'ı geçmez; en küçük modelimiz bile bu üçlüyü uzun saatler besler.</p>

<h3>Sistemi kaç yılda amorti ederim?</h3>
<p>Bu, kesinti sıklığınıza ve saatlik cironuza bağlıdır. Saatlik cirosu belirli bir işletme için birkaç kesinti bile yatırımı anlamlı kılabilir. Üç zamanlı tarife ile birlikte kullanıldığında geri dönüş süresi kısalır.</p>

<h3>Kurumsal fatura ve toplu alım mümkün mü?</h3>
<p>Evet. İşletme ihtiyaçlarınız için <a href="/iletisim">bizimle iletişime geçin</a>; yük listenize göre kapasite ve kurulum önerisi hazırlayalım.</p>

<h2>Kesintiyi Planlanmış Bir Duruma Çevirin</h2>

<p>Bir işletme için elektrik kesintisi öngörülemez bir olay olmak zorunda değil. Kritik yüklerinizi belirleyip toplam tüketiminizi ölçtüğünüzde, ihtiyacınız olan kapasite şaşırtıcı derecede net çıkar.</p>

<p>Cihaz listenizi <a href="/guc-hesaplayici">güç hesaplayıcıya</a> girerek başlangıç kapasitesini görebilir, <a href="/kategori/tasinabilir-guc-kaynaklari">güç kaynakları kategorimizden</a> modelleri karşılaştırabilirsiniz. Sabit kurulum düşünüyorsanız <a href="/sh4000">SH4000 sayfasını</a> incelemenizi öneririz.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // 28 — BUZDOLABI GIDA GÜVENLİĞİ
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "elektrik-kesintisinde-buzdolabi-gida-guvenligi-kac-saat",
    title: "Elektrik Kesintisinde Buzdolabındaki Yiyecekler Kaç Saat Bozulmaz?",
    excerpt:
      "Kapağı kapalı bir buzdolabı yaklaşık 4 saat, dolu bir derin dondurucu 48 saate kadar güvenli kalır. Sınırları, hangi gıdanın atılacağını ve yedek güçle sürenin nasıl uzatılacağını anlatıyoruz.",
    category: "Rehber",
    tags: [
      "buzdolabı elektrik kesintisi",
      "gıda güvenliği",
      "derin dondurucu kesinti",
      "yiyecek bozulur mu",
      "kesintide buzdolabı",
      "4 saat kuralı",
    ],
    metaTitle: "Kesintide Buzdolabı Kaç Saat Dayanır? Gıda Güvenliği Rehberi",
    metaDescription:
      "Elektrik kesintisinde buzdolabı 4, dolu derin dondurucu 48 saate kadar güvenli kalır. Hangi gıda atılmalı, süre nasıl uzatılır ve yedek güçle kaç saat kazanılır?",
    metaKeywords: [
      "kesintide buzdolabı kaç saat dayanır",
      "elektrik kesintisi gıda güvenliği",
      "derin dondurucu kesinti",
      "yiyecekler bozulur mu",
      "buzdolabı yedek güç",
      "4 saat kuralı gıda",
    ],
    content: `<p>Elektrik kesildiğinde ilk akla gelen soru genellikle telefonun şarjıdır. Oysa maliyeti en yüksek kayıp çoğu zaman buzdolabında bekler: dolu bir dondurucunun içeriği, bir kesintide kolayca birkaç bin liralık zarara dönüşebilir.</p>

<p>İyi haber, buzdolabının kapağı kapalı kaldığı sürece şaşırtıcı derecede iyi bir termos gibi davranmasıdır. Kötü haber ise sürenin sanıldığından kısa olması ve bozulmuş gıdanın her zaman kokudan anlaşılmamasıdır.</p>

<blockquote>
<strong>Hızlı Cevap:</strong> Kapağı hiç açılmayan bir buzdolabı yaklaşık <strong>4 saat</strong>, yarı dolu bir derin dondurucu <strong>24 saat</strong>, tamamen dolu bir derin dondurucu ise <strong>48 saate</strong> kadar güvenli sıcaklığı korur. Gıda 4°C üzerinde 2 saatten uzun kaldıysa risk başlar. Süreyi uzatmanın en etkili yolu kapağı açmamak; kalıcı çözüm ise buzdolabını yedek güç kaynağına bağlamaktır. Ortalama 60W tüketen bir buzdolabı, 1024Wh'lik <a href="/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800">P1800</a> ile yaklaşık 14 saat çalışır.
</blockquote>

<h2>Güvenli Sıcaklık Aralığı</h2>

<p>Gıda güvenliğinde kritik eşik 4°C'dir. Bu sıcaklığın üzerinde bakteri üremesi hızlanır ve 60°C'ye kadar olan aralık “tehlike bölgesi” olarak adlandırılır.</p>

<table>
  <thead>
    <tr><th>Bölme</th><th>Hedef Sıcaklık</th><th>Kesintide Güvenli Süre</th></tr>
  </thead>
  <tbody>
    <tr><td>Soğutucu bölme</td><td>0–4°C</td><td>~4 saat (kapak kapalı)</td></tr>
    <tr><td>Dondurucu (yarı dolu)</td><td>-18°C</td><td>~24 saat</td></tr>
    <tr><td>Dondurucu (tam dolu)</td><td>-18°C</td><td>~48 saat</td></tr>
  </tbody>
</table>

<p>Bu süreler ABD Gıda ve İlaç Dairesi ile Tarım Bakanlığı'nın kesinti rehberlerinde kullanılan referans değerlerdir; ayrıntı için <a href="https://www.fda.gov/food/buy-store-serve-safe-food/food-and-water-safety-during-power-outages-and-floods" target="_blank" rel="noopener noreferrer">FDA'nın kesinti sırasında gıda güvenliği sayfasına</a> bakabilirsiniz.</p>

<h2>Neden Dolu Dondurucu Daha Uzun Dayanır?</h2>

<p>Donmuş her kütle bir soğuk deposudur. Dondurucu doluysa içindeki donmuş gıdalar birbirini soğuk tutar ve sıcaklık çok daha yavaş yükselir. Yarı boş bir dondurucuda ise hacmin büyük kısmı havadır ve hava ısıyı hızla alır.</p>

<p>Bu yüzden pratik bir öneri: dondurucunuz sürekli yarı boşsa, boş alanlara su doldurulmuş kapalı şişeler koyun. Bu şişeler donduğunda kesinti sırasında ek soğuk deposu görevi görür ve normal zamanda enerji tüketimini de düşürür.</p>

<h2>Kesinti Başladığında Yapılacaklar</h2>

<ol>
  <li><strong>Kapağı açmayın.</strong> Her açış birikmiş soğuğun önemli bir kısmını dışarı verir. Kısa kesintilerde tek başına en etkili önlem budur.</li>
  <li><strong>Bir termometre koyun.</strong> Buzdolabı ve dondurucu içine ucuz bir termometre yerleştirmek, tahmin yerine ölçüme dayalı karar vermenizi sağlar.</li>
  <li><strong>Dondurucudan soğutucuya geçiş yapın.</strong> Kesinti uzayacaksa dondurucudaki bir iki donmuş paketi soğutucu bölmeye alarak orayı soğuk tutabilirsiniz.</li>
  <li><strong>Buz temin edin.</strong> Uzun kesintilerde kuru buz veya blok buz, soğutucu bölmenin ömrünü uzatır.</li>
  <li><strong>Bozulabilir gıdayı önceliklendirin.</strong> Süt ürünleri, çiğ et, pişmiş yemek ve açılmış konserveler önce risk altına girer.</li>
</ol>

<h2>Kesinti Bitince: Neyi Atmalı, Neyi Saklamalı?</h2>

<p>Buradaki temel kural nettir: koku ve görünüm güvenilir bir test değildir. Bazı patojenler gıdanın tadını ve görüntüsünü hiç değiştirmez.</p>

<table>
  <thead>
    <tr><th>Gıda</th><th>4°C üzeri 2 saatten fazla kaldıysa</th></tr>
  </thead>
  <tbody>
    <tr><td>Çiğ et, tavuk, balık, kıyma</td><td>Atın</td></tr>
    <tr><td>Süt, yoğurt, krema, taze peynir</td><td>Atın</td></tr>
    <tr><td>Pişmiş yemek, çorba, pilav</td><td>Atın</td></tr>
    <tr><td>Yumurta ve yumurtalı ürünler</td><td>Atın</td></tr>
    <tr><td>Açılmış konserve, salata sosu (kremalı)</td><td>Atın</td></tr>
    <tr><td>Sert peynir (kaşar, eski kaşar)</td><td>Genellikle saklanabilir</td></tr>
    <tr><td>Tereyağı, margarin</td><td>Genellikle saklanabilir</td></tr>
    <tr><td>Taze meyve ve sebze</td><td>Genellikle saklanabilir</td></tr>
    <tr><td>Reçel, turşu, ketçap, hardal</td><td>Genellikle saklanabilir</td></tr>
    <tr><td>Ekmek, kek, kuru gıda</td><td>Saklanabilir</td></tr>
  </tbody>
</table>

<h3>Dondurucudaki Gıda Çözüldüyse</h3>

<p>Gıda hâlâ buz kristalleri içeriyorsa ve sıcaklığı 4°C'nin altındaysa yeniden dondurulabilir. Tamamen çözülmüş ve 4°C üzerinde 2 saatten fazla kalmış çiğ et ve deniz ürünleri ise atılmalıdır.</p>

<p>Tereddüt ettiğiniz her durumda atmak, riski almaktan ucuzdur.</p>

<h2>Buzdolabını Yedek Güçle Beslemek</h2>

<p>Yukarıdaki bütün önlemler kesintiyi yönetmeye yarar. Sorunu ortadan kaldıran çözüm ise buzdolabını çalışır tutmaktır.</p>

<p>Buzdolapları sürekli çalışmaz; kompresör termostat isteğine göre devreye girer. Bu yüzden etiketinde 150W yazan bir buzdolabının günlük ortalaması genellikle 50–80W arasındadır.</p>

<table>
  <thead>
    <tr><th>Model</th><th>Kullanılabilir Enerji</th><th>Buzdolabı (60W ort.)</th><th>Buzdolabı + Modem + Işık (90W)</th></tr>
  </thead>
  <tbody>
    <tr><td>P800 (512Wh)</td><td>~435Wh</td><td>~7 saat</td><td>~4,8 saat</td></tr>
    <tr><td>P1800 (1024Wh)</td><td>~870Wh</td><td>~14 saat</td><td>~9,6 saat</td></tr>
    <tr><td>Singo 2000 Pro (1920Wh)</td><td>~1630Wh</td><td>~27 saat</td><td>~18 saat</td></tr>
    <tr><td>P3200 (2048Wh)</td><td>~1740Wh</td><td>~29 saat</td><td>~19 saat</td></tr>
    <tr><td>SH4000 (5120Wh)</td><td>~4350Wh</td><td>~72 saat</td><td>~48 saat</td></tr>
  </tbody>
</table>

<p>Bu tablo tek başına şunu söyler: orta sınıf bir güç kaynağı, gıda kaybı riskini pratikte ortadan kaldırır. Kapasite hesabının detayları <a href="/blog/buzdolabi-icin-kac-wh-gerekir">buzdolabı için kaç Wh gerekir</a> yazımızda.</p>

<h3>Kalkış Akımını Unutmayın</h3>

<p>Kompresör devreye girerken nominal gücünün 3–5 katını anlık olarak ister. Etiketinde 150W yazan bir buzdolabı ilk saniyede 600–900W çekebilir. Bu yüzden pik güç değeri yüksek bir model seçmek gerekir. P1800'ün 3600W pik gücü ev tipi buzdolapları için rahat bir marjdır.</p>

<h3>Otomatik Devreye Girme</h3>

<p>Kesintinin gece yaşandığını düşünün. Sabah kalktığınızda buzdolabı 6 saattir kapalıysa gıdanın büyük kısmı gitmiş demektir. UPS modu bu yüzden önemlidir: cihaz kesintiyi milisaniyeler içinde algılar ve buzdolabı hiç durmaz. <a href="/blog/guc-istasyonunda-pass-through-sarj-ups-modu">UPS modu yazımızda</a> nasıl çalıştığını anlattık.</p>

<h2>Uzun Kesintiler İçin: Güneşle Yenileme</h2>

<p>Doğal afet sonrası gibi günlerce süren kesintilerde batarya tek başına yetmez; enerjiyi yenilemek gerekir. <a href="/urun/tasinabilir-gunes-paneli-200w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp200">SP200</a> paneli iyi bir günde 800–1000Wh üretebilir; bu, tek başına bir buzdolabının günlük ihtiyacını karşılamaya yakındır. Panel gücü seçimi için <a href="/blog/turkiye-il-il-gunes-paneli-verimli-gunes-saati">il il verimli güneş saati</a> tablomuza bakabilirsiniz.</p>

<p>Afete hazırlık kapsamındaki diğer başlıkları <a href="/blog/deprem-cantasi-icin-guc-kaynagi-afete-hazirlik">deprem çantası ve afete hazırlık</a> yazımızda topladık.</p>

<h2>Sıkça Sorulan Sorular</h2>

<h3>Kesintide buzdolabının fişini çekmeli miyim?</h3>
<p>Elektrik geldiğinde ani gerilim dalgalanması olasılığına karşı çekmek makul bir önlemdir. Ancak yedek güç kaynağına bağlıysa buna gerek yoktur.</p>

<h3>Dondurucu alarmı çalıyor, gıda bozulmuş mudur?</h3>
<p>Alarm sıcaklığın yükseldiğini söyler ama gıdanın durumunu söylemez. Termometre değerine bakın; buz kristalleri hâlâ varsa büyük ihtimalle güvendedir.</p>

<h3>Buzdolabını jeneratöre bağlamak daha mı iyi?</h3>
<p>Jeneratör kapalı mekânda çalıştırılamaz, gürültülüdür ve marş süresi boyunca kesinti devam eder. Ev içi senaryolarda güç istasyonu daha pratiktir. Karşılaştırmayı <a href="/blog/power-station-nedir-jenerator-farki">bu yazıda</a> yaptık.</p>

<h3>Buzdolabımın gerçek tüketimini nasıl ölçerim?</h3>
<p>Priz tipi bir watt ölçer takıp 24 saat bekleyin. Toplam Wh değeri, günlük gerçek tüketiminizi verir. Bu, etikete bakmaktan çok daha doğrudur.</p>

<h3>Hangi modeli almalıyım?</h3>
<p>Kısa kesintiler için P800 yeterlidir. Gün boyu süren kesintiler için P1800, çok günlük senaryolar için P3200 veya SH4000 uygundur. Kendi listenizle hesaplamak için <a href="/guc-hesaplayici">güç hesaplayıcıyı</a> kullanın.</p>

<h2>Dört Saatlik Pencereyi İyi Kullanın</h2>

<p>Kesinti başladığında elinizde yaklaşık dört saatlik bir güvenlik payı var. Kapağı kapalı tutmak bu payı korur, yedek güç kaynağı ise pencereyi tamamen ortadan kaldırır.</p>

<p>Buzdolabınızın etiket bilgileriyle birlikte diğer kritik cihazlarınızı <a href="/guc-hesaplayici">güç hesaplayıcıya</a> girerek ihtiyacınız olan kapasiteyi görebilir, modelleri <a href="/kategori/tasinabilir-guc-kaynaklari">taşınabilir güç kaynakları kategorimizde</a> karşılaştırabilirsiniz. Sorularınız için <a href="/iletisim">bize yazmaktan</a> çekinmeyin.</p>`,
  },
];

async function main() {
  console.log("🚀 Blog Seed 12 başlıyor...\n");

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

  console.log("\n🎉 Blog Seed 12 tamamlandı.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Hata:", e);
  prisma.$disconnect();
  process.exit(1);
});
