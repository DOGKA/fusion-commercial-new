import type { BlogInput } from "./tip";

export const yazilar: BlogInput[] = [
  // ══════════════════════════════════════════════════════════════════
  // 6 — PANEL ↔ GÜÇ KAYNAĞI UYUMLULUK + SOLAR ŞARJ SÜRESİ
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "gunes-paneli-guc-kaynagi-uyumluluk-solar-sarj-suresi",
    title: "Güneş Paneli ve Power Station Uyumluluğu: Hangi Panel Hangi Modele Bağlanır, Solar Şarj Kaç Saat Sürer?",
    excerpt:
      "SP100, SP200 ve SP400 panellerin P800, P1800, Singo2000PRO, P3200 ve SH4000 ile uyumluluk tablosu; Voc, Isc ve maksimum solar giriş sınırları ile güneşli saat cinsinden şarj süreleri.",
    category: "Solar",
    tags: [
      "güneş paneli uyumluluk",
      "solar şarj süresi",
      "power station solar giriş",
      "voc değeri",
      "seri bağlantı",
      "mppt",
    ],
    metaTitle: "Güneş Paneli ve Power Station Uyumluluğu 2026",
    metaDescription:
      "SP100, SP200, SP400 panellerin P800, P1800, Singo2000PRO, P3200 ve SH4000 ile uyumu: Voc, Isc, maksimum solar giriş ve solar şarj kaç saat sürer?",
    metaKeywords: [
      "güneş paneli power station uyumluluk",
      "solar şarj kaç saat",
      "power station hangi panel",
      "güneş paneli voc sınırı",
      "solar panel seri bağlama güç kaynağı",
      "p3200 güneş paneli",
    ],
    content: `<p>Bir güneş panelini power station'a bağlamadan önce sorulması gereken soru “Kaç watt?” değil, “Bu panel bu girişe güvenle bağlanabilir mi?” sorusudur. Çünkü her güç kaynağının solar girişinin bir voltaj aralığı, bir akım sınırı ve bir watt sınırı vardır. Bu üç sınırdan birini yanlış okumak, en iyi ihtimalle boşa giden üretim, en kötü ihtimalle cihaz arızası demektir.</p>

<p>Bu yazıda FusionMarkt'ta bulunan SP100, SP200 ve SP400 katlanabilir panellerin P800, P1800, Singo2000PRO, P3200 ve SH4000 ile hangi düzende kullanılabileceğini tek tabloda topladık. Ardından her makul kombinasyon için solar şarj süresini güneşli saat ve gün cinsinden hesapladık.</p>

<blockquote><p><strong>Kısa cevap:</strong> P800, P1800 ve Singo2000PRO için güvenli seçimler SP100, SP200 ve seri bağlı 2×SP100'dür; SP400 bu üç modelden yalnızca P800'ün voltaj aralığına girer ama 300W girişi nedeniyle önerilmez. P3200 tek SP400 veya seri 2×SP200 ile 400W alır, SH4000'in HV girişi ise seri bağlı 2×SP400 ile çalışır. Solar şarj süresi yaklaşık Kapasite (Wh) ÷ (Panel W × 0,75) formülüyle hesaplanır; örneğin P3200 + SP400 yaklaşık 6,8 güneşli saatte dolar.</p></blockquote>

<h2>Uyumluluğu Belirleyen Üç Değer: Voc, Isc ve Maksimum Giriş</h2>

<p>Panel etiketinde dört temel değer görürsünüz: Vmp, Imp, Voc ve Isc. Vmp ve Imp, panelin en verimli çalıştığı noktadaki voltaj ve akımdır. Uyumluluk kontrolünde ise asıl belirleyici olanlar Voc ve Isc'dir.</p>

<ul>
  <li><strong>Voc (açık devre voltajı):</strong> Panel hiçbir yüke bağlı değilken ürettiği en yüksek voltajdır. Güç kaynağının solar girişindeki üst voltaj sınırı Voc'a göre kontrol edilir. Bu sınır kesindir; aşılması girişe kalıcı zarar verebilir.</li>
  <li><strong>Isc (kısa devre akımı):</strong> Panelin verebileceği en yüksek akımdır. Girişin akım sınırıyla karşılaştırılır. MPPT denetleyiciler akımı genellikle sınırlar, ancak sınırın sürekli zorlanması önerilmez.</li>
  <li><strong>Maksimum solar giriş (W):</strong> Güç kaynağının panelden çekebileceği en yüksek güçtür. Bunun üzerindeki panel gücü boşa gider; daha büyük panel, daha hızlı şarj anlamına gelmez.</li>
</ul>

<p>Voc kavramını ve neden yükseldiğini daha ayrıntılı merak ediyorsanız <a href="/blog/batarya-voc-degeri-nedir-neden-yukselir">VOC değeri rehberimize</a>, seri ve paralel bağlantının temel mantığı için <a href="/blog/solar-panel-seri-paralel-baglanti-rehberi">seri-paralel bağlantı yazımıza</a> göz atabilirsiniz. Burada yalnızca uyumluluk için gereken kısmı özetliyoruz.</p>

<h3>Soğuk havada Voc neden yükselir?</h3>

<p>Güneş hücresinin voltajı sıcaklıkla ters orantılıdır. Hücre soğudukça voltaj artar. Datasheet değerleri 25°C hücre sıcaklığında ölçülür; açık ve ayaz bir kış sabahında hücre sıcaklığı sıfırın altına inebilir.</p>

<p>Monokristal panellerde Voc sıcaklık katsayısı tipik olarak derece başına yaklaşık %0,3 civarındadır (kesin değer panelin teknik belgesinde yer alır). Bu katsayıyla −10°C'de Voc, etiket değerinin yaklaşık %10 üzerine çıkabilir. Örneğin seri bağlı 2×SP200'ün 57,6V olan Voc'u böyle bir sabahta 63V civarına ulaşabilir. Bu yüzden sınıra çok yakın kombinasyonları tabloda “önerilmez” olarak işaretledik.</p>

<h2>Panel ve Güç Kaynağı Uyumluluk Tablosu</h2>

<p>Aşağıdaki tablo datasheet değerlerine göre hazırlanmış muhafazakâr bir rehberdir. “Önerilmez” işareti, bağlantının fiziksel olarak mümkün olabileceği ama watt, akım veya soğuk hava voltaj payı nedeniyle tavsiye etmediğimiz durumları gösterir. “Doğrulayın” işaretli kombinasyonlar için kullanım kılavuzunu veya destek ekibimizi kontrol edin.</p>

<table>
  <thead>
    <tr><th>Panel düzeni (Voc / Isc / güç)</th><th>P800 (12–60V, 10A, 300W)</th><th>P1800 (10–52V, 11A, 500W)</th><th>Singo2000PRO (10–50V, 11A, 500W)</th><th>P3200 (12–80V, 16A, 1000W)</th><th>SH4000 HV (70–450V, 16A)</th><th>SH4000 LV (12–50V, 600W)</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>SP100</strong> (21,6V / 6,16A / 100W)</td><td>Uyumlu</td><td>Uyumlu</td><td>Uyumlu</td><td>Uyumlu</td><td>Uyumsuz (voltaj düşük)</td><td>Uyumlu</td></tr>
    <tr><td><strong>SP200</strong> (28,8V / 9,12A / 200W)</td><td>Uyumlu</td><td>Uyumlu</td><td>Uyumlu</td><td>Uyumlu</td><td>Uyumsuz (voltaj düşük)</td><td>Uyumlu</td></tr>
    <tr><td><strong>SP400</strong> (52,8V / 10A / 400W)</td><td>Önerilmez (300W sınırı)</td><td>Uyumsuz (Voc sınırı aşar)</td><td>Uyumsuz (Voc sınırı aşar)</td><td>Uyumlu</td><td>Uyumsuz (voltaj düşük)</td><td>Uyumsuz</td></tr>
    <tr><td><strong>2×SP100 seri</strong> (43,2V / 6,16A / 200W)</td><td>Uyumlu</td><td>Uyumlu</td><td>Uyumlu</td><td>Uyumlu</td><td>Uyumsuz (voltaj düşük)</td><td>Doğrulayın</td></tr>
    <tr><td><strong>2×SP100 paralel</strong> (21,6V / 12,32A / 200W)</td><td>Önerilmez (akım)</td><td>Önerilmez (akım)</td><td>Önerilmez (akım)</td><td>Doğrulayın</td><td>Uyumsuz</td><td>Doğrulayın</td></tr>
    <tr><td><strong>2×SP200 seri</strong> (57,6V / 9,12A / 400W)</td><td>Önerilmez (soğukta Voc payı yok, 300W sınırı)</td><td>Uyumsuz (Voc)</td><td>Uyumsuz (Voc)</td><td>Uyumlu</td><td>Uyumsuz (voltaj düşük)</td><td>Uyumsuz (Voc)</td></tr>
    <tr><td><strong>2×SP200 paralel</strong> (28,8V / 18,24A / 400W)</td><td>Önerilmez (akım)</td><td>Önerilmez (akım)</td><td>Önerilmez (akım)</td><td>Önerilmez (akım)</td><td>Uyumsuz</td><td>Doğrulayın</td></tr>
    <tr><td><strong>2×SP400 seri</strong> (105,6V / 10A / 800W)</td><td>Uyumsuz</td><td>Uyumsuz</td><td>Uyumsuz</td><td>Uyumsuz (80V aşılır)</td><td>Uyumlu</td><td>Uyumsuz</td></tr>
  </tbody>
</table>

<p>Tablodan çıkan pratik sonuç şu: P1800 ve Singo2000PRO'nun 500W girişini doldurmak için tek bir panelle değil, SP200 veya seri 2×SP100 gibi 200W'lık düzenlerle çalışmak gerekir. SP400 ise P3200 ve SH4000 (seri dizide) için tasarlanmış bir paneldir. P3200'de 400W'ın üzerindeki kombinasyonları kurmadan önce mutlaka kullanım kılavuzu veya destek ekibiyle doğrulama yapın.</p>

<h3>SH4000'de HV ve LV girişleri farklı çalışır</h3>

<p>SH4000'in HV girişi 70–450V aralığındadır. Tek bir SP400'ün Vmp'si 44V olduğu için bu girişe tek panel yetmez; paneller seri bağlanarak voltaj yükseltilir. Seri 2×SP400, 88V Vmp ve 105,6V Voc ile aralığa rahatça girer; <a href="/urun/solar-titan-paket-sh4000-5120wh-hibrit-ess-800w-solar">Solar Titan Paket</a> bu kurguyla 800W solar sunar. Daha uzun dizilerde soğuk havada yükselen Voc dahil 450V'un aşılmaması gerekir. LV girişi (12–50V, 600W) ise SP100 ve SP200'ü tek başına kabul eder.</p>

<h2>Solar Şarj Kaç Saat Sürer?</h2>

<p>Panelin etiket gücü, laboratuvar koşullarında ölçülür. Sahada açı, sıcaklık, kablo ve MPPT dönüşüm kayıpları nedeniyle gerçek üretim tipik olarak etiketin yaklaşık %75'i civarında kalır. Bu yüzden hesapta şu formülü kullanıyoruz:</p>

<p><strong>Solar şarj süresi (güneşli saat) ≈ Kapasite (Wh) ÷ (Panel W × 0,75)</strong></p>

<p>Gün sayısını bulmak için bir varsayım daha gerekir: tepe güneş saati. Bu, panelin günlük toplam ışınımının “tam güçte kaç saate” eşdeğer olduğunu gösterir. Aşağıdaki tabloda <strong>varsayım olarak günde 5 tepe güneş saati</strong> aldık; bu değer Türkiye'nin pek çok bölgesinde yaz aylarına yakın bir ortalamadır, kışın belirgin biçimde düşer.</p>

<table>
  <thead>
    <tr><th>Kombinasyon</th><th>Kapasite</th><th>Panel gücü</th><th>Hesap</th><th>Güneşli saat</th><th>Gün (5 saat varsayımı)</th></tr>
  </thead>
  <tbody>
    <tr><td>P800 + SP100</td><td>512Wh</td><td>100W</td><td>512 ÷ 75</td><td>≈ 6,8 saat</td><td>≈ 1,4 gün</td></tr>
    <tr><td>P800 + SP200</td><td>512Wh</td><td>200W</td><td>512 ÷ 150</td><td>≈ 3,4 saat</td><td>Aynı gün</td></tr>
    <tr><td>P1800 + SP200</td><td>1024Wh</td><td>200W</td><td>1024 ÷ 150</td><td>≈ 6,8 saat</td><td>≈ 1,4 gün</td></tr>
    <tr><td>P1800 + 2×SP100 seri</td><td>1024Wh</td><td>200W</td><td>1024 ÷ 150</td><td>≈ 6,8 saat</td><td>≈ 1,4 gün</td></tr>
    <tr><td>Singo2000PRO + SP200</td><td>1920Wh</td><td>200W</td><td>1920 ÷ 150</td><td>≈ 12,8 saat</td><td>≈ 2,6 gün</td></tr>
    <tr><td>P3200 + SP200</td><td>2048Wh</td><td>200W</td><td>2048 ÷ 150</td><td>≈ 13,7 saat</td><td>≈ 2,7 gün</td></tr>
    <tr><td>P3200 + SP400</td><td>2048Wh</td><td>400W</td><td>2048 ÷ 300</td><td>≈ 6,8 saat</td><td>≈ 1,4 gün</td></tr>
    <tr><td>P3200 + 2×SP200 seri</td><td>2048Wh</td><td>400W</td><td>2048 ÷ 300</td><td>≈ 6,8 saat</td><td>≈ 1,4 gün</td></tr>
    <tr><td>SH4000 + 2×SP400 seri (HV)</td><td>5120Wh</td><td>800W</td><td>5120 ÷ 600</td><td>≈ 8,5 saat</td><td>≈ 1,7 gün</td></tr>
  </tbody>
</table>

<p>Bu süreler bataryanın tamamen boştan dolduğu ve şarj sırasında çıkıştan yük çekilmediği senaryoyu gösterir. Gündüz buzdolabı veya laptop çalıştırıyorsanız, panel üretiminin bir kısmı doğrudan bu yüklere gider ve bataryaya kalan pay azalır.</p>

<h3>Kendi bölgeniz için tepe güneş saatini nasıl bulursunuz?</h3>

<p>Avrupa Komisyonu'nun ücretsiz <a href="https://re.jrc.ec.europa.eu/pvg_tools/en/" target="_blank" rel="noopener noreferrer">PVGIS aracı</a>, harita üzerinde seçtiğiniz nokta için aylık ışınım verisi verir. İl bazında pratik bir özet için <a href="/blog/turkiye-il-il-gunes-paneli-verimli-gunes-saati">Türkiye il il güneş saati tablomuza</a> bakabilirsiniz. Kış aylarında bu değerin yarıya, hatta daha aşağıya inebileceğini hesaba katın.</p>

<h2>Doğru Kombinasyonu Seçmek İçin 5 Adım</h2>

<ol>
  <li><strong>Voc'u kontrol edin.</strong> Seri bağlıyorsanız panellerin Voc'larını toplayın ve sonucun girişin üst sınırının en az %10–15 altında kaldığından emin olun.</li>
  <li><strong>Isc'yi kontrol edin.</strong> Paralel bağlıyorsanız Isc'leri toplayın; toplam, girişin akım sınırını aşmamalı.</li>
  <li><strong>Watt sınırını hesaba katın.</strong> Toplam panel gücü maksimum solar girişi büyük ölçüde aşıyorsa fazla kısım üretime dönüşmez.</li>
  <li><strong>Alt voltaj sınırına bakın.</strong> Özellikle SH4000 HV gibi yüksek voltajlı girişlerde, Vmp alt sınırın altında kalırsa şarj başlamaz.</li>
  <li><strong>Doğru kabloyu kullanın.</strong> MC4 ile XT60 gibi farklı konnektörler arasında uygun dönüştürücü gerekir; P800 ve P1800 için <a href="/urun/p800-p1800-cok-amacli-aksesuar-ki-ti">aksesuar kitinde</a> XT60-MC4 kablosu bulunur.</li>
</ol>

<p>Bağlantı sırasında dikkat edilecek pratik adımları <a href="/blog/solar-panel-ile-guc-istasyonu-sarj-etme-rehberi">solar panel ile güç istasyonu şarj etme rehberimizde</a> adım adım anlattık.</p>

<h2>Hangi Senaryoya Hangi Paket?</h2>

<p>Uyumluluk kontrolünü sizin yerinize yapılmış hâliyle almak istiyorsanız <a href="/kategori/bundle-paket-urunler">solar paketler</a> en kolay yoldur. Her paketteki panel, ilgili güç kaynağının giriş sınırlarıyla eşleştirilmiştir.</p>

<ul>
  <li><strong>Hafta sonu kampı, telefon ve aydınlatma:</strong> P800 + SP100 veya P800 + SP200. SP200 ile 512Wh'lik batarya tek bir güneşli günde dolabilir.</li>
  <li><strong>Karavan, bağ evi, uzaktan çalışma:</strong> <a href="/urun/solar-operator-paketi-p1800-sp200">Solar Operatör Paketi</a> (P1800 + SP200). Günde yaklaşık 750Wh üretim (200W × 5 saat × 0,75) birçok küçük yükü karşılar.</li>
  <li><strong>Daha yüksek kapasite ve hızlı solar şarj:</strong> <a href="/urun/solar-veteran-paketi-p3200-sp400">Solar Veteran Paketi</a> (P3200 + SP400). 400W panel, 2048Wh bataryayı yaklaşık 1,4 güneşli günde doldurur.</li>
  <li><strong>Ev ve uzun süreli kullanım:</strong> Solar Titan Paket (SH4000 + 2×SP400). 800W solar ile günde yaklaşık 3.000Wh üretim beklenebilir.</li>
</ul>

<p>Günlük tüketiminizi bilmiyorsanız önce <a href="/guc-hesaplayici">güç hesaplayıcı</a> ile cihazlarınızın toplam Wh ihtiyacını çıkarın; panel ve batarya seçimi bu rakama göre çok daha net olur.</p>

<h2>Uyumluluk Hatalarında En Sık Görülen Tablo</h2>

<p>Sahada karşılaştığımız sorunların büyük kısmı tek bir yanlış varsayımdan doğar: “Daha büyük panel, daha hızlı şarj.” P1800'e SP400 bağlamak bu varsayımın tipik örneğidir; panel daha güçlüdür ama Voc'u girişin sınırını aşar. Diğer yaygın hata, iki paneli paralel bağlayıp akım sınırını gözden kaçırmaktır.</p>

<p>Kural basit: önce voltaj, sonra akım, en son watt. Bu sırayla kontrol ettiğinizde hem panelinizden tam verim alırsınız hem de güç kaynağınızın solar girişini uzun yıllar sorunsuz kullanırsınız.</p>

<h2>Sık Sorulan Sorular</h2>

<h3>P1800'e SP400 bağlanır mı?</h3>
<p>Hayır. SP400'ün Voc değeri 52,8V'tur ve P1800'ün 52V'luk üst sınırını aşar. P1800 için SP200 veya seri bağlı 2×SP100 uygun seçeneklerdir.</p>

<h3>Panel gücü solar girişten büyükse ne olur?</h3>
<p>Voltaj ve akım sınırları içindeyse güç kaynağı yalnızca maksimum giriş gücü kadar çeker, fazlası kullanılmaz. Ancak voltaj sınırını aşan bir panel cihaza zarar verebilir.</p>

<h3>Solar şarj süresi nasıl hesaplanır?</h3>
<p>Kapasite (Wh) ÷ (Panel W × 0,75) formülüyle güneşli saat cinsinden yaklaşık süre bulunur. Örneğin 1024Wh ÷ (200W × 0,75) ≈ 6,8 saat.</p>

<h3>SH4000'e tek bir SP400 bağlanabilir mi?</h3>
<p>HV girişine tek panel yetmez, çünkü 44V'luk Vmp 70V alt sınırının altında kalır; HV için en az 2×SP400 seri gerekir. SP400 LV girişine de uyumlu değildir.</p>

<h3>Bulutlu havada şarj süresi ne kadar uzar?</h3>
<p>Kapalı havada üretim tipik olarak etiket gücünün küçük bir kısmına düşer ve süre birkaç katına çıkabilir. Kış aylarında tepe güneş saati de azaldığı için planlamayı daha temkinli yapmak gerekir.</p>

<h3>Soğuk havada seri bağlantı neden riskli olabilir?</h3>
<p>Hücre sıcaklığı düştükçe Voc yükselir; −10°C'de etiket değerinin yaklaşık %10 üzerine çıkabilir. Sınıra yakın seri diziler bu nedenle girişin üst voltaj sınırını aşabilir.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // 7 — TAŞINABİLİR PANEL vs ÇATI PANELİ
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "tasinabilir-gunes-paneli-mi-cati-gunes-paneli-mi",
    title: "Taşınabilir Güneş Paneli mi, Çatı Güneş Paneli mi? Kurulum, Maliyet ve Kullanım Farkları",
    excerpt:
      "Katlanabilir taşınabilir paneller ile sabit çatı modülleri arasında kurulum, izin süreci, maliyet kalemleri, verim ve kiracı uygunluğu açısından dürüst bir karşılaştırma ve iki yaklaşımı birleştiren hibrit seçenek.",
    category: "Karşılaştırma",
    tags: [
      "taşınabilir güneş paneli",
      "çatı güneş paneli",
      "katlanabilir panel",
      "çatı ges",
      "kiracı için güneş enerjisi",
      "hibrit solar",
    ],
    metaTitle: "Taşınabilir Güneş Paneli mi Çatı Paneli mi? 2026 Rehberi",
    metaDescription:
      "Taşınabilir katlanabilir panel mi, sabit çatı paneli mi? Kurulum, izin süreci, maliyet kalemleri, verim, kiracıya uygunluk ve hibrit kullanım farkları.",
    metaKeywords: [
      "taşınabilir güneş paneli mi çatı paneli mi",
      "katlanabilir güneş paneli",
      "çatı güneş paneli kurulumu",
      "kiracı güneş paneli",
      "çatı ges izin",
      "taşınabilir solar sistem",
    ],
    content: `<p>Güneş enerjisine geçmek isteyenlerin çoğu aynı yol ayrımında durur: çatıya kalıcı modüller mi kurulmalı, yoksa ihtiyaç anında açılıp toplanan taşınabilir paneller mi alınmalı? İki seçenek de güneşten elektrik üretir, ama çözdükleri problem, maliyet yapıları ve yaşamınıza girme biçimleri birbirinden oldukça farklıdır.</p>

<p>Bu yazıda iki yaklaşımı kurulum, izin süreci, maliyet kalemleri, verim, taşınabilirlik ve kiracılık gibi gerçek hayattaki kriterlerle karşılaştırıyoruz. Amaç birini kazanan ilan etmek değil; hangi durumda hangisinin mantıklı olduğunu netleştirmek.</p>

<blockquote><p><strong>Kısa cevap:</strong> Ev sahibiyseniz, uygun bir çatınız varsa ve yıllık tüketiminizin önemli bir kısmını şebekeye bağlı olarak karşılamak istiyorsanız sabit çatı sistemi daha uygundur. Kiracıysanız, apartmanda yaşıyorsanız, kamp, karavan veya bağ evi gibi farklı yerlerde enerjiye ihtiyaç duyuyorsanız ya da izin süreciyle uğraşmadan başlamak istiyorsanız, power station ile birlikte kullanılan taşınabilir paneller daha esnek bir çözümdür.</p></blockquote>

<h2>Taşınabilir Güneş Paneli Nedir, Çatı Paneli Nedir?</h2>

<p><strong>Taşınabilir güneş paneli</strong>, birden fazla hücre grubunun katlanabilir bir gövdede birleştirildiği, ayaklarıyla yere kurulan ve bir power station'ın solar girişine bağlanan paneldir. Örneğin <a href="/urun/tasinabilir-gunes-paneli-400w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp400">SP400</a>, 4 katlı yapısıyla 725×990 mm'ye katlanır, 16,3 kg ağırlığındadır ve 35°, 45° ya da 55° açıyla kurulabilir.</p>

<p><strong>Çatı güneş paneli</strong> ise alüminyum çerçeveli, cam yüzeyli, sabit montaj sistemine vidalanan modüllerdir. Genellikle birden fazla modül seri dizilere bağlanır ve bir invertör üzerinden ev tesisatına ya da şebekeye aktarılır. Tek bir modül tipik olarak birkaç yüz watt güçtedir ve yerinden sökülüp taşınmak üzere tasarlanmamıştır.</p>

<h2>Karşılaştırma Tablosu: Hangi Kriterde Hangisi Öne Çıkar?</h2>

<table>
  <thead>
    <tr><th>Kriter</th><th>Taşınabilir panel + power station</th><th>Sabit çatı sistemi</th></tr>
  </thead>
  <tbody>
    <tr><td>Kurulum</td><td>Dakikalar içinde açılır, kablo bağlanır</td><td>Montaj, kablolama ve devreye alma için profesyonel ekip gerekir</td></tr>
    <tr><td>İzin süreci</td><td>Genellikle gerekmez (şebekeye bağlanmaz)</td><td>Şebekeye bağlı sistemlerde dağıtım şirketine başvuru ve proje süreci gerekir</td></tr>
    <tr><td>Maliyet kalemleri</td><td>Panel + power station (depolama dahil)</td><td>Modüller, invertör, montaj konstrüksiyonu, kablolama, işçilik, proje; depolama ayrı kalem</td></tr>
    <tr><td>Toplam güç ölçeği</td><td>Yüzlerce watt (ör. 100–800W)</td><td>Genellikle birkaç kilovat ve üzeri</td></tr>
    <tr><td>Konumlandırma</td><td>Güneşe göre gün içinde çevrilebilir</td><td>Çatının yönü ve eğimiyle sabittir</td></tr>
    <tr><td>Kiracı / apartman</td><td>Uygun; taşınırken yanınızda gelir</td><td>Genellikle uygun değil; bina ve mülk sahibi onayı gerekir</td></tr>
    <tr><td>Mobilite</td><td>Kamp, karavan, bahçe, bağ evi</td><td>Yok, tek bir adrese bağlı</td></tr>
    <tr><td>Kesintide çalışma</td><td>Evet, batarya üzerinden</td><td>Şebekeye bağlı sistemler kesintide genellikle durur; depolama ve uygun invertör gerekir</td></tr>
    <tr><td>Hava koşulları</td><td>Fırtınada toplanabilir; IP67 panel gövdesi</td><td>Kalıcı dış ortam montajı için tasarlanır</td></tr>
  </tbody>
</table>

<h2>Kurulum ve İzin Süreci Nasıl Farklılaşır?</h2>

<p>Taşınabilir bir panelin kurulumu fiziksel olarak paneli açmak, ayaklarını ayarlamak ve MC4 kablosunu güç kaynağına bağlamaktan ibarettir. Sistem şebekeye bağlanmadığı ve binaya kalıcı bir değişiklik yapılmadığı için genellikle herhangi bir resmi başvuru gerektirmez.</p>

<p>Şebekeye bağlı çatı sistemlerinde tablo farklıdır. Bu tür sistemler için dağıtım şirketine başvuru yapılması, bir projenin hazırlanması ve sistemin yetkili ekiplerce kurulması gerekir. Çatının taşıma kapasitesi ve bina mülkiyet durumu da süreci etkiler. Güncel mevzuat ve başvuru koşulları değişebildiği için kesin bilgi için dağıtım şirketinize danışmanızı ve <a href="https://www.epdk.gov.tr/" target="_blank" rel="noopener noreferrer">EPDK</a> duyurularını takip etmenizi öneririz.</p>

<h3>Apartmanda yaşıyorsanız</h3>

<p>Apartman çatısı çoğunlukla ortak alandır ve bu alanda kalıcı bir kurulum yapmak bina yönetimi ve diğer malikler açısından ayrıca değerlendirilmesi gereken bir konudur. Balkon veya teras kullanımı ise daha pratik bir başlangıç noktası olabilir; bu senaryoyu <a href="/blog/balkonda-gunes-paneli-apartman-solar-kurulum">balkonda güneş paneli yazımızda</a> ayrıntılı ele aldık.</p>

<h2>Maliyet Yapısı: Ne İçin Para Ödüyorsunuz?</h2>

<p>İki sistemi aynı fiyat etiketiyle karşılaştırmak yanıltıcıdır, çünkü farklı şeyler satın alırsınız.</p>

<ul>
  <li><strong>Çatı sisteminde</strong> modüllerin yanında invertör, montaj konstrüksiyonu, DC ve AC kablolama, koruma ekipmanları, işçilik ve proje hizmetleri maliyetin önemli kısmını oluşturur. Kesintide de çalışmasını istiyorsanız batarya depolaması ayrı bir yatırım kalemidir.</li>
  <li><strong>Taşınabilir sistemde</strong> maliyet büyük ölçüde panel ve power station'dan oluşur. Power station invertörü, MPPT şarj denetleyicisini ve LiFePO4 bataryayı tek gövdede barındırdığı için ayrı kalem yoktur; ancak kurulu güç ölçeği çok daha küçüktür.</li>
</ul>

<p>Özetle çatı sistemi kilovat başına daha ekonomik ölçeklenirken, taşınabilir sistem küçük ölçekte, depolamayla birlikte ve “bugün kurup bugün kullanma” esnekliğiyle gelir.</p>

<h2>Verim ve Konumlandırma: Hangisi Daha Fazla Üretir?</h2>

<p>Hücre verimi açısından fark sanıldığı kadar büyük değildir. SP serisi paneller monokristal hücrelerle %21–23 dönüşüm verimi sunar; bu, güncel çatı modüllerinin tipik aralığına yakındır. Asıl fark, kurulu toplam güç ve konumlandırmadadır.</p>

<p>Çatı modülleri çatının yönü ve eğimine mahkûmdur. Kuzeye bakan veya gölgelenen bir çatıda yapabileceğiniz pek bir şey yoktur. Taşınabilir paneli ise sabah doğuya, öğleden sonra batıya çevirebilir, mevsime göre açısını değiştirebilirsiniz. Doğru açı ve yönün etkisini <a href="/blog/gunes-paneli-egim-acisi-ve-yon-nasil-ayarlanir">eğim açısı rehberimizde</a> anlattık.</p>

<p>Basit bir hesapla günlük üretimi karşılaştıralım (varsayım: 5 tepe güneş saati, %75 sistem verimi):</p>

<ul>
  <li>SP200: 200W × 5 × 0,75 ≈ 750Wh/gün</li>
  <li>SP400: 400W × 5 × 0,75 ≈ 1.500Wh/gün</li>
  <li>Seri 2×SP400: 800W × 5 × 0,75 ≈ 3.000Wh/gün</li>
  <li>Örnek 5 kW çatı sistemi: 5.000W × 5 × 0,75 ≈ 18.750Wh/gün</li>
</ul>

<p>Rakamlar net: tüm evin yıllık tüketimini güneşten karşılamak hedefse ölçek avantajı çatı sistemindedir. Belirli cihazları, kesinti anlarını veya şebekeden uzak bir yeri beslemek hedefse taşınabilir sistem yeterli ve çok daha pratiktir.</p>

<h2>Kimler İçin Taşınabilir Panel Daha Mantıklı?</h2>

<ol>
  <li><strong>Kiracılar:</strong> Taşındığınızda sisteminiz de sizinle gelir; ev sahibinden kalıcı değişiklik izni gerekmez.</li>
  <li><strong>Kesintiye hazırlık yapanlar:</strong> Batarya zaten sistemin parçasıdır; modem, buzdolabı ve aydınlatma kesintide çalışmaya devam eder.</li>
  <li><strong>Mobil kullanıcılar:</strong> Kamp, karavan, tekne, bahçe ve bağ evi gibi farklı noktalarda aynı ekipman kullanılır.</li>
  <li><strong>Denemek isteyenler:</strong> Büyük bir yatırım öncesinde güneş enerjisinin kendi kullanımınıza nasıl uyduğunu görmek için düşük riskli bir başlangıçtır.</li>
</ol>

<h3>Kimler için çatı sistemi daha mantıklı?</h3>

<p>Kendi müstakil evinde yaşayan, güneye bakan gölgesiz bir çatısı olan, yüksek ve düzenli elektrik tüketimi bulunan ve uzun vadeli yatırım yapmak isteyen kullanıcılar için sabit çatı sistemi genellikle daha uygundur. Bu senaryoda temel adımları <a href="/blog/eviniz-icin-gunes-enerjisi-paneli-kurulum-rehberi">ev için güneş paneli kurulum rehberimizde</a> bulabilirsiniz.</p>

<h2>Hibrit Yaklaşım: İki Dünyanın Arası</h2>

<p>Taşınabilir ile sabit arasında kesin bir çizgi çekmek zorunda değilsiniz. <a href="/sh4000">SH4000</a> hibrit enerji depolama sistemi, 70–450V aralığındaki HV girişine seri bağlı panel dizilerini kabul eder ve 3000W'a kadar solar giriş sunar. Ayrıca 12–50V LV girişinden 600W'a kadar taşınabilir panel bağlanabilir.</p>

<p>Bu sayede örneğin seri bağlı 2×SP400 ile başlayıp ihtiyaca göre büyüyen bir sistem kurabilirsiniz; <a href="/urun/solar-titan-paket-sh4000-5120wh-hibrit-ess-800w-solar">Solar Titan Paket</a> tam olarak bu kurgudadır. SH4000 entegre hibrit invertörü sayesinde şebekeye bağlı ve off-grid çalışabilir, ATS uyumludur ve B5120 modüllerle yaklaşık 20 kWh'a kadar genişletilebilir. Ev panosuna bağlantı gibi tesisat işlerinin mutlaka yetkili bir elektrikçi tarafından yapılması gerekir.</p>

<p>Daha küçük ölçekte başlamak isteyenler için <a href="/kategori/gunes-panelleri">katlanabilir güneş panelleri</a> ve uyumlu güç kaynakları iyi bir giriş noktasıdır. İhtiyacınız olan kapasiteyi görmek için cihazlarınızı <a href="/guc-hesaplayici">güç hesaplayıcıya</a> girerek günlük Wh tüketiminizi çıkarabilirsiniz.</p>

<h2>Bakım ve Kullanım Alışkanlığı Açısından Fark Var mı?</h2>

<p>Çatı sistemi bir kez kurulduktan sonra günlük ilgi gerektirmez; periyodik temizlik ve üretim verisinin takibi çoğu zaman yeterlidir. Buna karşılık çatıya erişim her zaman kolay olmadığı için temizlik ve kontrol işleri genellikle profesyonel destekle yapılır.</p>

<p>Taşınabilir panelde ise kullanım bir alışkanlık meselesidir. Paneli sabah açıp akşam toplamak, gün içinde güneşe göre çevirmek ve her kullanım sonrası yüzeyini silmek birkaç dakikanızı alır. Karşılığında panel yere yakın olduğu için temizliği zahmetsizdir ve kötü havada içeri alınarak korunabilir. Doğru temizlik yöntemi için <a href="/blog/gunes-paneli-temizligi-verim-artisi-nasil-temizlenir">panel temizliği rehberimize</a> göz atabilirsiniz.</p>

<p>Depolama tarafında da benzer bir ayrım vardır. Taşınabilir sistemde LiFePO4 batarya zaten pakettedir ve 4000'in üzerinde döngü ömrüyle uzun yıllar kullanılabilir. Çatı sisteminde batarya eklemek isterseniz invertör uyumluluğu, yerleşim alanı ve ek tesisat ayrıca planlanmalıdır.</p>

<h2>Karar Verirken Sormanız Gereken Üç Soru</h2>

<p>Birincisi: Bu evde en az birkaç yıl kalacak mısınız ve çatı size mi ait? İkincisi: Amacınız elektrik faturasını genel olarak düşürmek mi, yoksa belirli cihazları ve kesinti anlarını güvenceye almak mı? Üçüncüsü: Enerjiye tek bir adreste mi, yoksa farklı yerlerde mi ihtiyacınız var?</p>

<p>İlk iki soruya “evet” ve “faturayı düşürmek” diyorsanız çatı sistemi için bir kurulum firması ve dağıtım şirketiyle görüşmeye başlayabilirsiniz. Cevaplarınız esneklik, mobilite ve kesinti güvenliği yönündeyse taşınabilir panel ve power station kombinasyonu sizi bugünden güneş enerjisiyle tanıştırır.</p>

<h2>Sık Sorulan Sorular</h2>

<h3>Taşınabilir güneş paneli için izin gerekir mi?</h3>
<p>Şebekeye bağlanmayan ve bir power station'ı şarj eden taşınabilir paneller için genellikle resmi başvuru gerekmez. Apartmanda ortak alan kullanımı söz konusuysa bina yönetimiyle görüşmek yerinde olur.</p>

<h3>Taşınabilir panel çatı paneli kadar verimli mi?</h3>
<p>Hücre verimi benzer aralıktadır; SP serisi %21–23 dönüşüm verimi sunar. Fark, toplam kurulu güçte ve konumlandırmadadır; taşınabilir paneli güneşe göre çevirebilirsiniz.</p>

<h3>Kiracıyım, güneş enerjisinden nasıl faydalanabilirim?</h3>
<p>Balkon, teras veya bahçede kullanacağınız katlanabilir bir panel ve bir power station en pratik yoldur. Taşındığınızda sistemi yanınızda götürürsünüz.</p>

<h3>Çatı sistemi elektrik kesintisinde çalışır mı?</h3>
<p>Şebekeye bağlı sistemler kesintide genellikle güvenlik nedeniyle durur. Kesintide çalışmak için depolama ve buna uygun bir hibrit invertör gerekir.</p>

<h3>Taşınabilir panelleri sabit sisteme dönüştürebilir miyim?</h3>
<p>SH4000 gibi hibrit bir sistemde seri bağlı panel dizileri HV girişine bağlanabilir. Kalıcı montaj ve tesisat işleri için yetkili bir elektrikçiyle çalışmanız gerekir.</p>

<h3>Taşınabilir panel dışarıda sürekli kalabilir mi?</h3>
<p>SP serisi IP67 korumalı ve ETFE yüzeylidir, ancak kalıcı montaj için tasarlanmamıştır. Fırtına ve kuvvetli rüzgâr öncesinde toplamanız önerilir.</p>`,
  },
];
