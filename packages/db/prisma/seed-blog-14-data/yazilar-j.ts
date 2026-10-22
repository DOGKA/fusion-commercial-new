import type { BlogInput } from "./tip";

export const yazilar: BlogInput[] = [
  // ══════════════════════════════════════════════════════════════════
  // 18 — BEBEKLİ EVDE ELEKTRİK KESİNTİSİ
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "bebekli-evde-elektrik-kesintisi-guc-kaynagi",
    title: "Bebekli Evde Elektrik Kesintisi: Hangi Cihaz Kaç Watt, Hangi Güç Kaynağı Yeter?",
    excerpt:
      "Süt pompası, mama ısıtıcı, bebek telsizi ve buzdolabı elektrik kesintisinde ne kadar enerji ister? 8 ve 24 saatlik senaryolarla Wh hesabı, model seçimi ve bebekli evde güvenli kullanım kuralları.",
    category: "Rehber",
    tags: [
      "bebekli evde elektrik kesintisi",
      "süt pompası",
      "mama ısıtıcı",
      "bebek telsizi",
      "elektrik kesintisi",
      "taşınabilir güç kaynağı",
      "ups eps",
    ],
    metaTitle: "Bebekli Evde Elektrik Kesintisi: Güç Kaynağı Rehberi 2026",
    metaDescription:
      "Bebekli evde elektrik kesintisi için süt pompası, mama ısıtıcı, bebek telsizi ve buzdolabı kaç Wh ister? 8 ve 24 saatlik hesap, model seçimi ve güvenlik.",
    metaKeywords: [
      "bebekli evde elektrik kesintisi",
      "süt pompası kaç watt",
      "mama ısıtıcı kaç watt",
      "bebek telsizi elektrik kesintisi",
      "elektrik kesintisinde bebek odası ısıtma",
      "bebek için yedek güç kaynağı",
    ],
    content: `<p>Gece saat ikide elektrik kesildiğinde bebekli bir evde ilk sorulan soru “şimdi ne olacak?” olur. Bebek telsizi susar, gece lambası söner, mama ısıtıcı çalışmaz, buzdolabında sakladığınız süt için içiniz rahat etmez. Kış aylarında buna oda sıcaklığı endişesi de eklenir.</p>

<p>Bu rehberde bebekli bir evde kesinti sırasında gerçekten gerekli olan cihazların tipik olarak kaç watt çektiğini, 8 ve 24 saatlik kesintiler için kaç Wh enerji gerektiğini ve hangi senaryoya hangi taşınabilir güç kaynağının uyduğunu adım adım hesaplıyoruz.</p>

<blockquote><p><strong>Kısa cevap:</strong> Bebek telsizi, gece lambası, beyaz gürültü cihazı, modem, süt pompası ve mama ısıtıcıdan oluşan hafif bir set 8 saatte yaklaşık 325Wh harcar; bu yük 512Wh'lik P800'ün yaklaşık 435Wh'lik kullanılabilir enerjisine sığar. Buzdolabını da eklediğinizde 8 saatlik ihtiyaç yaklaşık 805Wh'e çıkar ve 1024Wh'lik P1800 gerekir. 24 saati aşabilecek kesintiler ve kış koşulları için 2048Wh'lik P3200, tercihen güneş paneliyle birlikte daha uygun bir seçimdir.</p></blockquote>

<h2>Bebekli Evde Kesintide Hangi Cihazlar Gerçekten Gerekli?</h2>

<p>Kesinti planı, “her şeyi çalıştırmak” yerine öncelik sırası belirlemekle başlar. Bebekli bir evde öncelikler genellikle şunlardır: bebeği izleme (telsiz veya kamera), uyku düzeni (gece lambası, beyaz gürültü), beslenme (süt pompası, mama ısıtıcı, buzdolabı) ve iletişim (telefon, modem).</p>

<p>Aşağıdaki değerler tipik aralıklardır; markaya ve modele göre değişir. Kendi cihazınızın etiketini veya kullanım kılavuzunu kontrol edin, mümkünse bir priz tipi wattmetre ile ölçün.</p>

<table>
<thead>
<tr><th>Cihaz</th><th>Tipik güç</th><th>Kullanım şekli</th><th>Not</th></tr>
</thead>
<tbody>
<tr><td>Elektrikli süt pompası</td><td>Yaklaşık 10–30W</td><td>Seans başına 15–30 dk</td><td>Birçok model USB ile şarj edilir</td></tr>
<tr><td>Mama / biberon ısıtıcı</td><td>Yaklaşık 100–400W</td><td>Kısa ısıtma, birkaç dakika</td><td>Kısa ama yüksek güç</td></tr>
<tr><td>Buharlı sterilizatör</td><td>Yaklaşık 400–650W</td><td>Döngü başına 6–15 dk</td><td>Kesintide ertelenebilir</td></tr>
<tr><td>Bebek telsizi / kamerası</td><td>Yaklaşık 3–10W</td><td>Sürekli</td><td>Kesintisiz kalması önemli</td></tr>
<tr><td>Gece lambası</td><td>Yaklaşık 1–5W</td><td>Gece boyunca</td><td>USB modeller çok az çeker</td></tr>
<tr><td>Beyaz gürültü cihazı</td><td>Yaklaşık 2–10W</td><td>Uyku süresince</td><td>Telefon uygulaması da olur</td></tr>
<tr><td>Modem / ONT</td><td>Yaklaşık 10–20W</td><td>Sürekli</td><td>Wi-Fi kamera için gerekli</td></tr>
<tr><td>Buzdolabı</td><td>Ortalama yaklaşık 40–80W</td><td>Kompresör aralıklı çalışır</td><td>Kalkışta anlık güç yükselir</td></tr>
<tr><td>Vantilatör</td><td>Yaklaşık 30–60W</td><td>Sıcak havada saatlerce</td><td>Rahatlıkla karşılanır</td></tr>
<tr><td>Elektrikli ısıtıcı</td><td>Yaklaşık 1000–2000W</td><td>Sürekli çalıştırılırsa</td><td>Bataryayı çok hızlı tüketir</td></tr>
</tbody>
</table>

<h2>8 Saatlik Kesinti İçin Kaç Wh Gerekir?</h2>

<p>Günlük enerji ihtiyacı, her cihaz için “güç (W) × çalışma süresi (saat)” çarpılıp toplanarak bulunur. Gece boyunca süren, yaklaşık 8 saatlik bir kesinti için örnek bir hesap yapalım:</p>

<ul>
<li>Modem: 12W × 8 saat = 96Wh</li>
<li>Bebek kamerası: 5W × 8 saat = 40Wh</li>
<li>Gece lambası: 3W × 8 saat = 24Wh</li>
<li>Beyaz gürültü cihazı: 5W × 8 saat = 40Wh</li>
<li>Süt pompası: 20W × toplam 1 saat (2–3 seans) = 20Wh</li>
<li>Telefon şarjı: 2 telefon × yaklaşık 15Wh = 30Wh</li>
<li>Mama ısıtıcı: 300W × 3 kez 5 dakika (toplam 0,25 saat) = 75Wh</li>
</ul>

<p>Toplam yaklaşık <strong>325Wh</strong> eder. Güç kaynaklarında invertör ve dönüşüm kayıpları nedeniyle etiket kapasitesinin tamamı kullanılamaz; pratikte yaklaşık 0,85 verimle hesap yapmak doğru olur. P800 için kullanılabilir enerji 512Wh × 0,85 ≈ 435Wh'tir. Yani bu hafif set 8 saati rahatça karşılar ve yaklaşık 110Wh pay kalır.</p>

<p>Buzdolabını da eklediğinizde tablo değişir: ortalama 60W çeken bir buzdolabı 8 saatte 60W × 8 = 480Wh harcar ve toplam ihtiyaç yaklaşık 805Wh'e çıkar. Bu, P1800'ün 1024Wh × 0,85 ≈ 870Wh'lik kullanılabilir enerjisine sığar. Ancak bir de 500W'lık sterilizatörü 10 dakika çalıştırırsanız (yaklaşık 83Wh) toplam 888Wh olur ve sınır aşılır. Kesintide sterilizasyonu ertelemek ya da daha büyük kapasite seçmek bu yüzden önemlidir.</p>

<h2>24 Saatlik Kesintide Hesap Nasıl Değişir?</h2>

<p>Deprem, fırtına veya kar gibi olaylardan sonra kesintiler bir günü aşabilir. Uzun kesintide en büyük kalem neredeyse her zaman buzdolabıdır.</p>

<table>
<thead>
<tr><th>Kalem</th><th>8 saat</th><th>24 saat</th></tr>
</thead>
<tbody>
<tr><td>Modem (12W)</td><td>96Wh</td><td>192Wh (gece 8 saat kapalı)</td></tr>
<tr><td>Bebek kamerası (5W)</td><td>40Wh</td><td>120Wh</td></tr>
<tr><td>Gece lambası ve beyaz gürültü</td><td>64Wh</td><td>90Wh</td></tr>
<tr><td>Süt pompası</td><td>20Wh</td><td>40Wh</td></tr>
<tr><td>Telefon şarjı</td><td>30Wh</td><td>45Wh</td></tr>
<tr><td>Mama ısıtıcı (300W)</td><td>75Wh</td><td>150Wh</td></tr>
<tr><td><strong>Ara toplam (buzdolabısız)</strong></td><td><strong>325Wh</strong></td><td><strong>637Wh</strong></td></tr>
<tr><td>Buzdolabı (ortalama 60W)</td><td>480Wh</td><td>1440Wh</td></tr>
<tr><td><strong>Toplam (buzdolabıyla)</strong></td><td><strong>805Wh</strong></td><td><strong>2077Wh</strong></td></tr>
</tbody>
</table>

<p>Buzdolabısız 637Wh'lik 24 saatlik ihtiyaç P1800'ün yaklaşık 870Wh'lik kullanılabilir enerjisine sığar. Buzdolabıyla birlikte 2077Wh ise P3200'ün 2048Wh × 0,85 ≈ 1741Wh'lik kullanılabilir enerjisini de aşar. Bu durumda ya gün içinde güneş paneliyle şarj etmeniz ya da buzdolabını kapağı kapalı tutarak aralıklı çalıştırmanız gerekir. Kendi cihaz listenizle hesabı hızlıca tekrarlamak için <a href="/guc-hesaplayici">güç hesaplayıcı</a> aracını kullanabilirsiniz.</p>

<p>Buzdolabındaki gıdaların kesintide ne kadar dayandığı için <a href="/blog/elektrik-kesintisinde-buzdolabi-gida-guvenligi-kac-saat">buzdolabı ve gıda güvenliği rehberimize</a> göz atabilirsiniz. Anne sütü veya hazır mamanın saklama koşulları ve süreleri ise ayrı bir konudur; bu konuda çocuk doktorunuzun önerilerine uyun.</p>

<h2>Kesintide Bebek Odası Nasıl Isıtılır veya Serinletilir?</h2>

<p>Bebekli evlerde en sık gelen soru, güç kaynağıyla oda ısıtıcısı çalıştırılıp çalıştırılamayacağıdır. Teknik olarak 1800W sürekli çıkış veren P1800 veya 3200W veren P3200, 1500W'lık bir ısıtıcıyı çalıştırabilir; ancak süre çok kısadır:</p>

<ul>
<li>P1800 ile 1500W ısıtıcı: 1024Wh × 0,85 ÷ 1500W ≈ 0,58 saat, yani yaklaşık 35 dakika</li>
<li>P3200 ile 1500W ısıtıcı: 2048Wh × 0,85 ÷ 1500W ≈ 1,16 saat, yani yaklaşık 70 dakika</li>
<li>P800 ile 1000W ve üzeri ısıtıcı: 800W sürekli çıkış sınırını aştığı için uygun değil</li>
</ul>

<p>Bu nedenle ısıtıcıyı yalnızca odayı kısa süre ılıtmak için düşünün; bataryanın büyük kısmını telsiz, buzdolabı ve beslenme cihazlarına ayırın. Odanın kapısını kapalı tutmak, pencere boşluklarını perdeyle kapatmak ve bebeği mevsime uygun katmanlarla giydirmek çoğu zaman daha verimli bir çözümdür. Bebeğiniz için uygun oda sıcaklığı ve giydirme konusunda çocuk doktorunuza danışın.</p>

<p>Yaz kesintilerinde iş daha kolaydır: 40W'lık bir vantilatör P800 ile 512Wh × 0,85 ÷ 40W ≈ 10,9 saat çalışabilir. Klima gibi yüksek güçlü cihazlarda ise hesap ısıtıcıya benzer şekilde kısa sürelere iner.</p>

<h2>Bebek Telsizi Kesintide Kapanır mı? UPS/EPS Ne İşe Yarar?</h2>

<p>Bebek telsizi veya kamerası doğrudan prize takılıysa, elektrik kesildiği anda kapanır ve yeniden açılıp bağlanması zaman alabilir. Gece uyurken bunu fark etmeyebilirsiniz.</p>

<p>IEETek güç kaynaklarındaki UPS/EPS fonksiyonu bu sorunu hafifletir: cihaz prize bağlıyken ve kameranız güç kaynağının çıkışına takılıyken şebeke kesildiğinde, yaklaşık 10 ms içinde bataryaya geçilir. Telsiz, kamera, modem ve gece lambası gibi düşük güçlü cihazlar bu geçişte genellikle kapanmadan çalışmaya devam eder. Wi-Fi kamera kullanıyorsanız modemi de aynı güç kaynağına bağlamayı unutmayın.</p>

<p>Bu kurulumu kesinti olmadan önce deneyin: güç kaynağının fişini prizden çekip telsizin ve kameranın kesintisiz çalıştığını kontrol edin. Saf sinüs AC çıkış (THD %1,5'in altında) sayesinde adaptörlü cihazlar şebekedeki gibi çalışır.</p>

<h2>Hangi Senaryoya Hangi Güç Kaynağı Uygun?</h2>

<ol>
<li><strong>Hafif set, buzdolabı yok:</strong> Telsiz, gece lambası, beyaz gürültü, modem, süt pompası ve mama ısıtıcı için <a href="/urun/512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800">P800</a> (512Wh, 800W sürekli) yeterlidir. 6,55 kg ağırlığıyla odadan odaya taşınabilir; dahili LED feneri gece kesintilerinde işe yarar. Sürekli 25W'lık yük (modem, kamera, lamba, beyaz gürültü) ile 512Wh × 0,85 ÷ 25W ≈ 17,4 saat çalışır.</li>
<li><strong>Buzdolabı ve kısa yüksek güç:</strong> Buzdolabıyla birlikte 8 saatlik kesinti, kısa mama ısıtma ve ara sıra sterilizatör için <a href="/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800">P1800</a> (1024Wh, 1800W sürekli) dengeli bir seçimdir. 85W'lık sürekli yükte (buzdolabı + hafif set) 1024Wh × 0,85 ÷ 85W ≈ 10,2 saat dayanır.</li>
<li><strong>Uzun kesinti ve kış:</strong> 24 saate yaklaşan kesintiler veya kısa ısıtıcı kullanımı için <a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200</a> (2048Wh, 3200W sürekli) uygundur. Aynı 85W yükte 2048Wh × 0,85 ÷ 85W ≈ 20,5 saat çalışır; tekerlekleri ve teleskopik kolu taşımayı kolaylaştırır.</li>
</ol>

<p>Kesintinin birkaç gün sürebileceği bölgelerde güneş paneli eklemek hesabı değiştirir. <a href="/urun/solar-veteran-paketi-p3200-sp400">Solar Veteran Paketi</a> (P3200 + SP400) ile 4 tepe güneş saatinde 400W × 4 × 0,75 ≈ 1200Wh günlük üretim beklenebilir; bu, buzdolabının günlük ihtiyacının önemli bir kısmını karşılar. Kış aylarında üretim düşeceği için bu değeri iyimser bir üst sınır olarak düşünün.</p>

<h2>Bebekli Evde Güç Kaynağı Güvenli Nasıl Kullanılır?</h2>

<p>Güç kaynağı egzoz gazı üretmez, bu yüzden jeneratörün aksine kapalı alanda kullanılabilir. Yine de bebekli ve emekleyen çocuklu evlerde birkaç kurala dikkat etmek gerekir:</p>

<ul>
<li>Cihazı çocuğun ulaşamayacağı bir yere, kuru ve düz bir zemine koyun; dolap üstü gibi düşme riski olan yerlerden kaçının.</li>
<li>Kabloları toparlayın, yürüme yollarından ve kapı önlerinden geçirmeyin; takılıp düşme ve cihazı çekip devirme riskini azaltır.</li>
<li>Havalandırma deliklerini açık tutun; cihazın üzerini battaniye, örtü veya çamaşırla kapatmayın.</li>
<li>Kullanılmayan prizlere, evdeki diğer prizlerde olduğu gibi çocuk emniyet kapağı takmak genel olarak iyi bir alışkanlıktır.</li>
<li>Bebek odasına yakın kullanacaksanız fan sesini önceden dinleyin; datasheet değerlerine göre P800 60 dB'in, P1800 65 dB'in altındadır.</li>
</ul>

<p>LiFePO4 kimyası, termal açıdan daha kararlı olduğu için ev içi kullanımda tercih edilir ve tüm modellerde BMS koruması bulunur. Evde şarj ve konumlandırma kurallarının ayrıntıları için <a href="/blog/lityum-batarya-yangin-riski-lifepo4-guvenlik">lityum batarya yangın riski rehberimizi</a> okuyabilirsiniz.</p>

<h2>Bebekli Ev İçin Kesinti Hazırlık Listesi</h2>

<p>Hazırlığı kesinti gelmeden yapmak, gece telaşını büyük ölçüde azaltır. Kısa bir kontrol listesi:</p>

<ol>
<li>Güç kaynağını her zaman tam dolu ve prize bağlı tutun; UPS/EPS modunda telsizi ve modemi üzerine bağlayın.</li>
<li>USB ile şarj edilen süt pompası, gece lambası ve telsizi akşamları tam şarjda tutun.</li>
<li>Mama ısıtma ihtiyacı için kısa süreli kullanım planlayın; sterilizasyonu kesinti bitene kadar erteleyin.</li>
<li>Buzdolabının kapağını gereksiz yere açmayın ve hangi ürünlerin öncelikli olduğunu bilin.</li>
<li>Bölgenizin planlı kesinti duyurularını takip edin; ayrıntılar için <a href="/blog/planli-elektrik-kesintisi-sorgulama-ve-hazirlik">planlı elektrik kesintisi sorgulama rehberimize</a> bakın.</li>
</ol>

<p>Afet ve uzun süreli kesintilere genel hazırlık için <a href="https://www.afad.gov.tr/" target="_blank" rel="noopener noreferrer">AFAD</a>'ın aile afet planı önerileri de iyi bir başlangıç noktasıdır. Bebeğinize özel ihtiyaçları (mama, ilaç, bez) bu plana eklemeyi unutmayın.</p>

<h2>Bebeğiniz İçin Sessiz ve Kesintisiz Bir Gece Planı</h2>

<p>Bebekli bir evde kesinti hazırlığının amacı tüm evi çalıştırmak değil, bebeğin izlenmesini, uykusunu ve beslenmesini kesintisiz sürdürmektir. Hafif bir set için 512Wh, buzdolabını da kapsayan bir plan için 1024Wh, uzun ve kış kesintileri için 2048Wh sınıfı bir güç kaynağı çoğu aile için doğru başlangıç noktasıdır.</p>

<p>Kendi cihazlarınızın etiket değerlerini not alın, hesabı bir kez yapın ve sistemi kesinti gelmeden deneyin. Tüm modelleri karşılaştırmak için <a href="/kategori/tasinabilir-guc-kaynaklari">taşınabilir güç kaynakları</a> kategorimize göz atabilirsiniz.</p>

<h2>Sık Sorulan Sorular</h2>

<h3>Süt pompası güç kaynağıyla çalışır mı?</h3>
<p>Evet. Elektrikli süt pompaları tipik olarak 10–30W çeker; birçoğu USB ile şarj edildiği için güç kaynağının USB-C veya USB-A çıkışından da beslenebilir. Kendi pompanızın etiketini kontrol edin.</p>

<h3>Mama ısıtıcı P800 ile çalışır mı?</h3>
<p>Genellikle evet. Yaklaşık 100–400W çeken mama ısıtıcılar P800'ün 800W sürekli çıkış sınırının altındadır ve birkaç dakikalık ısıtma bataryadan yalnızca 10–30Wh kadar harcar.</p>

<h3>Bebek telsizi güç kaynağıyla kaç saat çalışır?</h3>
<p>5W çeken bir bebek kamerası P800 ile 512Wh × 0,85 ÷ 5W ≈ 87 saat çalışabilir. Pratikte modem ve gece lambası gibi diğer yükler bu süreyi kısaltır.</p>

<h3>Elektrik kesintisinde bebek odasını güç kaynağıyla ısıtabilir miyim?</h3>
<p>Kısa süreli olarak mümkündür ama verimli değildir: 1500W'lık bir ısıtıcı P1800'ü yaklaşık 35 dakikada, P3200'ü yaklaşık 70 dakikada tüketir. Kapıyı kapalı tutmak ve uygun giydirme genellikle daha etkilidir; ayrıntılar için çocuk doktorunuza danışın.</p>

<h3>Güç kaynağını bebek odasında kullanmak güvenli mi?</h3>
<p>Egzoz gazı olmadığı için kapalı alanda kullanılabilir. Cihazı çocuğun ulaşamayacağı, havalandırması açık, kuru ve düz bir yere koyun, üzerini örtmeyin ve kabloları yürüme yollarından uzak tutun.</p>

<h3>Anne sütü kesintide buzdolabında ne kadar saklanabilir?</h3>
<p>Saklama süresi ve koşulları için çocuk doktorunuzun önerilerine uyun. Güç kaynağıyla buzdolabını çalışır tutmak, kesinti boyunca soğuk zinciri korumanıza yardımcı olur.</p>`,
  },
];
