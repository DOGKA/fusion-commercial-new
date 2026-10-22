import type { BlogInput } from "./tip";

export const yazilar: BlogInput[] = [
  // ══════════════════════════════════════════════════════════════════
  // 13 — AIRFRYER / KETTLE / KAHVE MAKİNESİ
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "airfryer-kettle-power-station-ile-calisir-mi",
    title: "Airfryer, Kettle ve Kahve Makinesi Power Station ile Çalışır mı? Model Model Hesap",
    excerpt:
      "Airfryer, kettle, kahve makinesi, tost makinesi ve mikrodalga kaç watt çeker, hangi power station hangisini çalıştırır? Kullanım başına harcanan Wh'yi ve her modelin kaç kullanım sağladığını hesapladık.",
    category: "Rehber",
    tags: [
      "airfryer",
      "kettle",
      "kahve makinesi",
      "power station",
      "mutfak aletleri",
      "kamp mutfağı",
      "watt hesaplama",
    ],
    metaTitle: "Airfryer ve Kettle Power Station ile Çalışır mı? 2026",
    metaDescription:
      "Airfryer, kettle ve kahve makinesi kaç watt çeker? Hangi power station hangisini çalıştırır, kullanım başına kaç Wh gider ve kaç kullanım sağlar, tabloda.",
    metaKeywords: [
      "airfryer power station ile çalışır mı",
      "airfryer kaç watt",
      "kettle kaç watt çeker",
      "kahve makinesi güç kaynağı",
      "power station ile kettle",
      "tost makinesi kaç watt",
      "kampta airfryer kullanmak",
    ],
    content: `<p>Elektrik kesildiğinde ya da kamp alanında sabah olduğunda ilk akla gelen şey çoğu zaman bir fincan sıcak kahvedir. Akşam yemeğinde ise airfryer veya tost makinesi devreye girer. Bu cihazlar küçük görünür ama mutfaktaki en yüksek güç çeken aletler arasındadır.</p>

<p>Bu yazıda ısıtıcılı mutfak aletlerinin tipik watt aralıklarını, hangi power station modelinin hangisini kaldırabildiğini ve bir kullanımın bataryadan ne kadar enerji götürdüğünü somut hesaplarla anlatıyoruz. Kısacası: “Çalışır mı?” ve “Kaç kez çalışır?” sorularını ayrı ayrı yanıtlıyoruz.</p>

<blockquote><p><strong>Kısa cevap:</strong> Airfryer tipik olarak 1400–2000W, kettle 1800–2200W çeker; bu yüzden belirleyici olan bataryanın kapasitesi değil, güç kaynağının sürekli çıkış gücüdür. 800W'lık P800 bu cihazların çoğunu çalıştıramaz, 1800W'lık P1800 yalnızca etiketi 1800W'ın altında kalan modelleri kaldırır; 2000W ve üzeri cihazlar için Singo2000PRO, P3200 veya SH4000 gerekir. 20 dakikalık bir airfryer pişirmesi bataryadan yaklaşık 470Wh, 1 litre su kaynatmak ise yaklaşık 140Wh enerji götürür.</p></blockquote>

<h2>Mutfak Aletleri Neden Bu Kadar Çok Watt Çeker?</h2>

<p>Airfryer, kettle, tost makinesi ve kahve makinesi rezistanslı (dirençli) cihazlardır. Rezistanslı cihaz, elektriği doğrudan ısıya çeviren bir ısıtıcı tel ile çalışan alettir. Isıyı hızlı üretmek için kısa sürede çok enerji harcarlar; bu yüzden gücü yüksek, çalışma süresi kısadır.</p>

<p>Bu cihazların iyi bir yanı da var: kompresörlü buzdolabı veya motorlu aletler gibi büyük bir kalkış akımı çekmezler. Çektikleri güç baştan itibaren etikette yazan değere yakındır. Dolayısıyla güç kaynağının tepe gücü burada pek işe yaramaz; asıl sınır <strong>sürekli çıkış gücüdür</strong>. Cihaz sürekli güç sınırını aşarsa güç kaynağı aşırı yük korumasına geçer ve çıkışı keser.</p>

<h2>Airfryer, Kettle ve Kahve Makinesi Kaç Watt Çeker?</h2>

<p>Aşağıdaki değerler piyasadaki cihazlar için tipik aralıklardır. Aynı ürün grubunda bile modeller arasında ciddi fark olabilir; kendi cihazınızın altındaki veya arkasındaki etiketi mutlaka kontrol edin.</p>

<table>
<thead>
<tr><th>Cihaz</th><th>Tipik güç (etiket)</th><th>Not</th></tr>
</thead>
<tbody>
<tr><td>Airfryer</td><td>1400–2000W</td><td>Büyük hazneli modeller üst sınıra yakındır</td></tr>
<tr><td>Kettle (su ısıtıcı)</td><td>1800–2200W</td><td>Seyahat tipi küçük kettle'lar daha düşük olabilir</td></tr>
<tr><td>Filtre kahve makinesi</td><td>800–1000W</td><td>Isıtma plakası demlemeden sonra da çalışır</td></tr>
<tr><td>Espresso makinesi</td><td>1200–1500W</td><td>Isınma sırasında tam güç çeker</td></tr>
<tr><td>Tost makinesi</td><td>700–2000W</td><td>Model ve plaka sayısına göre çok değişir</td></tr>
<tr><td>Mikrodalga fırın</td><td>800W çıkış ≈ 1100–1300W giriş</td><td>Etiketteki “çıkış gücü” prizden çekilen değil</td></tr>
<tr><td>Tek gözlü elektrikli / indüksiyon ocak</td><td>1500–2000W</td><td>Düşük kademede ortalama güç azalır</td></tr>
</tbody>
</table>

<h3>Mikrodalga etiketinde neden iki değer var?</h3>

<p>Mikrodalga fırınlarda kutuda büyük puntoyla yazan değer genellikle yemeğe aktarılan çıkış gücüdür. Prizden çekilen giriş gücü bundan belirgin şekilde yüksektir. 800W diye satılan bir mikrodalga tipik olarak 1100–1300W giriş gücü çeker. Güç kaynağı seçerken her zaman <strong>giriş gücünü</strong> esas alın.</p>

<h2>Hangi Power Station Hangi Mutfak Aletini Çalıştırır?</h2>

<p>Kural basit: cihazın etiketindeki güç, güç kaynağının sürekli AC çıkışının altında kalmalı. Güvenli tarafta kalmak için en az %10–20 pay bırakmak iyi bir alışkanlıktır; aynı anda prize bağlı başka yükler de toplama eklenir.</p>

<ul>
<li><strong><a href="/urun/512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800">P800</a> (800W sürekli):</strong> Airfryer, kettle, espresso makinesi ve mikrodalganın çoğunu çalıştıramaz. Etiketi 800W'ın belirgin şekilde altında kalan küçük cihazlar dışında mutfak ısıtıcıları için uygun değildir.</li>
<li><strong><a href="/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800">P1800</a> (1800W sürekli):</strong> Filtre kahve makinesi, çoğu espresso makinesi, 800W çıkışlı mikrodalga ve düşük güçlü tost makineleri sorunsuzdur. Airfryer ve kettle ise yalnızca etiketi yaklaşık 1500–1600W'ı aşmayan modellerde mantıklıdır; 2000W'lık bir kettle çalışmaz.</li>
<li><strong><a href="/urun/1920wh-4000w-max-lifepo4-tasinabilir-guc-kaynagi-aplikasyon-kablosuz-sarj-operasyonel-kullanim-4000-ustu-dongu-99-99-bms-coklu-cikis-singo2000pro">Singo2000PRO</a> (2000W sürekli):</strong> 2000W'a kadar airfryer ve indüksiyon ocaklar sınırda çalışır. 2200W'lık bir kettle için yetersizdir; 1800W'lık bir kettle uygundur.</li>
<li><strong><a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200</a> (3200W sürekli):</strong> Tablodaki cihazların hepsini tek tek rahatça çalıştırır. Taşınabilir modeller arasında mutfak kullanımına en uygun olanıdır.</li>
<li><strong><a href="/urun/5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000">SH4000</a> (4000W sürekli):</strong> 5120Wh kapasitesiyle ev mutfağında kesinti boyunca birden çok pişirme yapabilir. Taşınabilir bir kamp cihazı değil, evde sabit kullanılan bir enerji depolama sistemidir.</li>
</ul>

<h2>Bir Kullanım Bataryadan Kaç Wh Götürür?</h2>

<p>Isıtıcılı cihazlar termostatla çalışır: hedef sıcaklığa ulaşınca rezistans kapanır, sıcaklık düşünce yeniden açılır. Bu yüzden ortalama tüketim etiketteki gücün altındadır. Aşağıdaki hesaplar yaklaşıktır; gerçek değer cihazınıza, içine koyduğunuz yiyeceğe ve ortam sıcaklığına göre değişir.</p>

<p>Bataryadan çekilen enerjiyi bulmak için cihazın harcadığı enerjiyi 0,85'e bölüyoruz; bu, invertör ve dönüşüm kayıplarını kabaca hesaba katar.</p>

<h3>1 litre su kaynatmak kaç Wh?</h3>

<p>Fizik açısından 1 litre suyu yaklaşık 15°C'den kaynama noktasına çıkarmak teorik olarak yaklaşık 0,1 kWh (100Wh) enerji ister. Kettle'ın gövdesi ve çevreye kaçan ısı nedeniyle pratikte bu değer 110–130Wh civarına çıkar. Ortalama 120Wh kabul edersek: 120 ÷ 0,85 ≈ 140Wh bataryadan gider.</p>

<h3>20 dakikalık airfryer pişirmesi kaç Wh?</h3>

<p>1800W'lık bir airfryer ön ısıtmada tam güç çeker, sonra termostat devreye girip çıkar. 20 dakikalık bir pişirmede ortalamayı yaklaşık 1200W kabul edersek: 1200W × 1/3 saat ≈ 400Wh. Bataryadan: 400 ÷ 0,85 ≈ 470Wh.</p>

<h3>Diğer cihazlar için yaklaşık değerler</h3>

<ul>
<li><strong>Filtre kahve, bir demlik:</strong> 900W × yaklaşık 10 dakika ≈ 150Wh; bataryadan ≈ 175Wh. Isıtma plakasını açık bırakırsanız tüketim artar.</li>
<li><strong>Espresso, bir fincan (ısınma dahil):</strong> yaklaşık 60–80Wh; bataryadan ≈ 80Wh civarı.</li>
<li><strong>Tost makinesi, 5 dakika:</strong> 1500W × 1/12 saat ≈ 125Wh; bataryadan ≈ 150Wh.</li>
<li><strong>Mikrodalga, 3 dakika ısıtma:</strong> 1200W giriş × 1/20 saat = 60Wh; bataryadan ≈ 70Wh.</li>
<li><strong>İndüksiyon ocakta 15 dakikalık pişirme:</strong> ortalama 1200W ile ≈ 300Wh; bataryadan ≈ 350Wh.</li>
</ul>

<h2>Her Model Kaç Kullanım Sağlar?</h2>

<p>Kullanılabilir enerjiyi kapasitenin %85'i olarak alıyoruz: P1800 için 1024 × 0,85 ≈ 870Wh, Singo2000PRO için ≈ 1.630Wh, P3200 için ≈ 1.740Wh, SH4000 için ≈ 4.350Wh. Aşağıdaki tablo, bataryanın tamamı yalnızca o cihaza harcanırsa kaç kullanım çıktığını gösterir. Cihazın gücü modelin sürekli çıkışını aşıyorsa sayı anlamsızdır; önce bir önceki bölümdeki uyumluluğu kontrol edin.</p>

<table>
<thead>
<tr><th>Kullanım (bataryadan)</th><th>P1800 (≈ 870Wh)</th><th>Singo2000PRO (≈ 1.630Wh)</th><th>P3200 (≈ 1.740Wh)</th><th>SH4000 (≈ 4.350Wh)</th></tr>
</thead>
<tbody>
<tr><td>1 litre su kaynatma (≈ 140Wh)</td><td>≈ 6 kez*</td><td>≈ 11 kez</td><td>≈ 12 kez</td><td>≈ 31 kez</td></tr>
<tr><td>20 dk airfryer (≈ 470Wh)</td><td>≈ 1,8 kez*</td><td>≈ 3,5 kez</td><td>≈ 3,7 kez</td><td>≈ 9 kez</td></tr>
<tr><td>Filtre kahve, bir demlik (≈ 175Wh)</td><td>≈ 5 kez</td><td>≈ 9 kez</td><td>≈ 10 kez</td><td>≈ 25 kez</td></tr>
<tr><td>5 dk tost (≈ 150Wh)</td><td>≈ 5,8 kez</td><td>≈ 11 kez</td><td>≈ 11,6 kez</td><td>≈ 29 kez</td></tr>
<tr><td>3 dk mikrodalga (≈ 70Wh)</td><td>≈ 12 kez</td><td>≈ 23 kez</td><td>≈ 25 kez</td><td>≈ 62 kez</td></tr>
</tbody>
</table>

<p>* P1800 için yalnızca etiketi 1800W sürekli çıkışın altında kalan kettle ve airfryer modelleri geçerlidir. P800'ü tabloya almadık; 512Wh kapasitesi ve 800W sürekli gücüyle mutfak ısıtıcıları yerine aydınlatma, telefon, laptop ve modem gibi küçük yükler için tasarlanmıştır.</p>

<h2>Mutfakta Power Station Kullanırken Enerjiyi Nasıl Korursunuz?</h2>

<ol>
<li><strong>Düşük güç modlarını kullanın.</strong> Birçok airfryer, tost makinesi ve indüksiyon ocakta kademeli güç ayarı vardır. Daha düşük kademe, sürekli çıkış sınırının altında kalmanızı ve bataryayı daha yavaş tüketmenizi sağlar.</li>
<li><strong>Yalnızca ihtiyacınız kadar su kaynatın.</strong> Bir fincan için tam dolu kettle kaynatmak, enerjinin büyük kısmını boşa harcar. 250 ml su, 1 litrenin yaklaşık dörtte biri kadar enerji ister.</li>
<li><strong>İki ısıtıcıyı aynı anda çalıştırmayın.</strong> Kettle ve tost makinesini birlikte açmak toplam gücü kolayca 3000W'ın üzerine çıkarır. Cihazları sırayla kullanın.</li>
<li><strong>Kahveyi demledikten sonra termosa alın.</strong> Filtre kahve makinesinin ısıtma plakası saatlerce açık kalırsa demlemenin kendisinden fazla enerji harcayabilir.</li>
<li><strong>Kampta uzun pişirmeyi gazla yapın.</strong> Kuru fasulye, çorba gibi uzun süre ocakta kalacak yemekleri tüp gazlı ocakta pişirin; power station'ı kahve, tost ve kısa ısıtmalar için saklayın.</li>
<li><strong>Cihazı uzatma kablosuyla değil, doğrudan prize takın.</strong> Yüksek güçlü ısıtıcılarda ince ve uzun kablolar ısınmaya yol açabilir.</li>
</ol>

<p>Ev aletlerinde enerji tasarrufuna dair genel öneriler için <a href="https://www.energy.gov/energysaver/energy-saver" target="_blank" rel="noopener noreferrer">ABD Enerji Bakanlığı Energy Saver</a> sayfasına göz atabilirsiniz. Isıtıcı ve klima gibi daha büyük yüklerin hesabını ise <a href="/blog/ev-tipi-klima-isitici-guc-kaynagi-watt-hesaplama">klima ve ısıtıcı watt hesaplama rehberimizde</a> anlattık.</p>

<h2>Kampta ve Kesintide Hangi Model Mantıklı?</h2>

<ul>
<li><strong>Kampta sabah kahvesi ve ara sıra tost:</strong> P1800, filtre kahve ve düşük güçlü tost makinesi için yeterlidir. Kamp için genel kapasite seçimini <a href="/blog/kamp-icin-tasinabilir-guc-kaynagi-rehberi">kamp güç kaynağı rehberimizde</a> ayrıntılı ele aldık.</li>
<li><strong>Kampta airfryer ve kettle düzenli kullanılacaksa:</strong> Singo2000PRO veya P3200. P3200'ün tekerlekli gövdesi ve teleskopik kolu, 24,35 kg'lık ağırlığı taşımayı kolaylaştırır.</li>
<li><strong>Evde uzun kesintide tam mutfak:</strong> SH4000, 4000W sürekli güç ve 5120Wh kapasitesiyle bir öğün boyunca birkaç cihazı sırayla çalıştırabilir.</li>
</ul>

<p>Mutfak aletlerinizi buzdolabı, modem ve aydınlatmayla birlikte toplamak için <a href="/guc-hesaplayici">güç hesaplayıcımızı</a> kullanabilir, tüm modelleri <a href="/kategori/tasinabilir-guc-kaynaklari">taşınabilir güç kaynakları kategorimizde</a> karşılaştırabilirsiniz.</p>

<h2>Mutfakta Watt Sınırı, Kapasiteden Önce Gelir</h2>

<p>Isıtıcılı mutfak aletlerinde ilk soru “kaç Wh?” değil, “kaç watt?” olmalıdır. Cihazın etiketindeki güç, power station'ın sürekli çıkışını aşıyorsa kapasite ne kadar büyük olursa olsun çalışmaz. Sınırın altında kalıyorsa, bir kahve veya tost bataryadan beklediğinizden az enerji götürür.</p>

<p>Pratikte en verimli düzen şudur: kısa ve yüksek güçlü işleri power station'a, uzun pişirmeyi gaza bırakmak. Böylece aynı batarya hem mutfağı hem de akşam ışığını ve telefonları idare eder.</p>

<h2>Sık Sorulan Sorular</h2>

<h3>Airfryer power station ile çalışır mı?</h3>
<p>Çalışır, ancak güç kaynağının sürekli çıkışı airfryer'ın etiketindeki gücü karşılamalıdır. Tipik 1400–2000W'lık bir airfryer için en az 2000W sürekli güç veren Singo2000PRO, P3200 veya SH4000 gibi bir model gerekir.</p>

<h3>P1800 ile kettle çalışır mı?</h3>
<p>Yalnızca etiketi 1800W'ın altında kalan kettle'larla çalışır. Çoğu ev tipi kettle 2000–2200W çektiği için P1800'ün aşırı yük koruması devreye girer.</p>

<h3>Kahve makinesi için hangi güç kaynağı yeterli?</h3>
<p>800–1000W'lık filtre kahve makineleri ve 1200–1500W'lık espresso makineleri için P1800 yeterlidir. Bir demlik filtre kahve bataryadan yaklaşık 175Wh götürür.</p>

<h3>Mikrodalga etiketinde 800W yazıyor, P800 çalıştırır mı?</h3>
<p>Genellikle hayır. 800W mikrodalganın çıkış gücüdür; prizden çektiği giriş gücü tipik olarak 1100–1300W'tır ve bu P800'ün 800W sürekli çıkışını aşar.</p>

<h3>Airfryer bataryayı ne kadar tüketir?</h3>
<p>20 dakikalık bir pişirmede ortalama 1200W kabul edilirse yaklaşık 400Wh harcanır; kayıplarla bataryadan yaklaşık 470Wh gider. Bu, P3200'ün kullanılabilir enerjisinin dörtte birinden biraz fazlasıdır.</p>

<h3>Power station ile elektrikli ocakta yemek pişirilir mi?</h3>
<p>1500–2000W'lık tek gözlü bir ocak, en az 2000W sürekli güç veren bir modelle kısa pişirmeler için kullanılabilir. Uzun süren pişirmeler bataryayı hızla tükettiğinden, kampta tüp gaz daha pratiktir.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // 14 — OYUN BİLGİSAYARI / PLAYSTATION
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "oyun-bilgisayari-playstation-power-station-kac-saat",
    title: "PlayStation ve Oyun Bilgisayarı Kaç Watt? Elektrik Kesintisinde Power Station ile Kaç Saat Oynanır?",
    excerpt:
      "PS5, Xbox Series X, Nintendo Switch ve oyun bilgisayarı kaç watt çeker? Kesintide her power station modeliyle kaç saat oynanabileceğini, UPS geçişini ve saf sinüsün neden önemli olduğunu hesaplarla anlattık.",
    category: "Rehber",
    tags: [
      "playstation",
      "oyun bilgisayarı",
      "ps5 kaç watt",
      "elektrik kesintisi",
      "power station",
      "ups",
      "konsol",
    ],
    metaTitle: "PlayStation Kaç Watt? Power Station ile Kaç Saat? (2026)",
    metaDescription:
      "PS5, Xbox ve oyun bilgisayarı kaç watt çeker? Kesintide power station ile kaç saat oynanır, UPS geçişi ve saf sinüs neden önemli; model model süre tablosu.",
    metaKeywords: [
      "playstation kaç watt",
      "ps5 kaç watt çeker",
      "oyun bilgisayarı kaç watt",
      "elektrik kesintisinde oyun bilgisayarı",
      "power station ile ps5",
      "oyun bilgisayarı için ups",
      "xbox series x kaç watt",
    ],
    content: `<p>Akşam bir maçın ya da çevrim içi bir oyunun ortasındayken elektrik kesilir, ekran kararır ve kaydedilmemiş ilerleme gider. Oyun bilgisayarı veya konsol kullananlar için kesinti yalnızca bir rahatsızlık değil, çoğu zaman kayıp demektir.</p>

<p>Bu yazıda PlayStation, Xbox, Nintendo Switch ve oyun bilgisayarlarının tipik güç tüketimini, bunlara eşlik eden monitör, TV ve modemle birlikte bir power station'ın kaç saat dayandığını hesaplıyoruz. Ayrıca UPS geçişinin ve saf sinüs çıkışın oyun donanımı için neden önemli olduğunu açıklıyoruz.</p>

<blockquote><p><strong>Kısa cevap:</strong> PS5 oyun sırasında tipik olarak 150–220W, Xbox Series X 150–200W, orta ve üst seviye bir oyun bilgisayarı ise ekran kartına bağlı olarak 300–600W veya daha fazla çeker. PS5, TV ve modemden oluşan yaklaşık 315W'lık bir düzeni 1024Wh'lik P1800 yaklaşık 2,8 saat, 2048Wh'lik P3200 yaklaşık 5,5 saat çalıştırır. Yaklaşık 10 ms'lik UPS geçişi çoğu cihazda kesintisiz devam sağlar ama her güç ünitesinde garanti değildir; önceden test edin.</p></blockquote>

<h2>PlayStation Kaç Watt Çeker?</h2>

<p>Bir konsolun çektiği güç sabit değildir. Menüde dolaşırken, video izlerken ve grafik açısından ağır bir oyun oynarken çok farklı değerler görülür. Üreticilerin güç ünitesi etiketinde yazan değer ise genellikle maksimum kapasitedir; günlük kullanımda konsol bunun altında kalır.</p>

<p>Aşağıdaki tablo oyun sırasındaki tipik aralıkları gösterir. Değerler modele, oyuna ve ayarlara göre değişir; en doğru sonuç için prizle cihaz arasına takılan bir wattmetreyle kendi ölçümünüzü yapın.</p>

<table>
<thead>
<tr><th>Cihaz</th><th>Tipik tüketim (kullanım sırasında)</th><th>Not</th></tr>
</thead>
<tbody>
<tr><td>PlayStation 5</td><td>150–220W</td><td>Ölçüme göre değişir; menüde daha düşük</td></tr>
<tr><td>Xbox Series X</td><td>150–200W</td><td>Ölçüme göre değişir</td></tr>
<tr><td>Nintendo Switch (dock'ta)</td><td>10–20W</td><td>El modunda daha da düşük</td></tr>
<tr><td>Oyun bilgisayarı (kasa)</td><td>300–600W ve üzeri</td><td>En büyük belirleyici ekran kartı</td></tr>
<tr><td>Oyun laptopu</td><td>yaklaşık 120–200W</td><td>Şarj adaptörünün gücüne göre değişir</td></tr>
<tr><td>Monitör</td><td>25–60W</td><td>Boyut, parlaklık ve yenileme hızına bağlı</td></tr>
<tr><td>Televizyon</td><td>60–150W</td><td>Boyut ve parlaklığa bağlı</td></tr>
<tr><td>Modem / router</td><td>10–20W</td><td>Çevrim içi oyun için gerekli</td></tr>
</tbody>
</table>

<h3>Oyun bilgisayarının tüketimi neden bu kadar değişken?</h3>

<p>Oyun bilgisayarında enerjinin büyük kısmını ekran kartı ve işlemci harcar. Giriş seviyesi bir sistem oyun sırasında 300W civarında kalırken, üst seviye bir ekran kartıyla toplam tüketim 600W'ı aşabilir. Kasadaki güç ünitesinin 850W veya 1000W yazması, bilgisayarın sürekli bu gücü çektiği anlamına gelmez; bu değer ünitenin verebileceği üst sınırdır.</p>

<p>Bir de ani güç sıçramaları vardır: güçlü ekran kartları çok kısa anlarda ortalamanın üzerine çıkabilir. Power station'ın tepe gücü bu kısa sıçramaları karşılamaya yardım eder; yine de ortalama tüketimin sürekli çıkış gücünün belirgin şekilde altında kalması gerekir.</p>

<h2>Power Station ile Kaç Saat Oyun Oynanır?</h2>

<p>Hesap formülü: <strong>Süre ≈ Kapasite (Wh) × 0,85 ÷ Toplam güç (W)</strong>. 0,85 katsayısı, invertör ve dönüşüm kayıplarını kabaca hesaba katar. Örneğin P1800 ile PS5 + TV + modem düzeni: 1024Wh × 0,85 ≈ 870Wh; 870 ÷ 315W ≈ 2,8 saat.</p>

<p>Tabloda beş yaygın düzeni karşılaştırdık:</p>

<ul>
<li><strong>Switch + TV:</strong> 15W + 85W ≈ 100W</li>
<li><strong>Oyun laptopu + modem:</strong> 150W + 15W ≈ 165W</li>
<li><strong>PS5 + TV + modem:</strong> 200W + 100W + 15W ≈ 315W</li>
<li><strong>Orta seviye oyun PC + monitör + modem:</strong> 400W + 40W + 15W ≈ 455W</li>
<li><strong>Üst seviye oyun PC + monitör + modem:</strong> 600W + 40W + 15W ≈ 655W</li>
</ul>

<table>
<thead>
<tr><th>Model (kullanılabilir enerji)</th><th>Switch + TV (100W)</th><th>Laptop + modem (165W)</th><th>PS5 + TV + modem (315W)</th><th>Orta PC (455W)</th><th>Üst PC (655W)</th></tr>
</thead>
<tbody>
<tr><td>P800 (≈ 435Wh)</td><td>≈ 4,4 saat</td><td>≈ 2,6 saat</td><td>≈ 1,4 saat</td><td>≈ 1 saat</td><td>önerilmez</td></tr>
<tr><td>P1800 (≈ 870Wh)</td><td>≈ 8,7 saat</td><td>≈ 5,3 saat</td><td>≈ 2,8 saat</td><td>≈ 1,9 saat</td><td>≈ 1,3 saat</td></tr>
<tr><td>Singo2000PRO (≈ 1.630Wh)</td><td>≈ 16,3 saat</td><td>≈ 9,9 saat</td><td>≈ 5,2 saat</td><td>≈ 3,6 saat</td><td>≈ 2,5 saat</td></tr>
<tr><td>P3200 (≈ 1.740Wh)</td><td>≈ 17,4 saat</td><td>≈ 10,6 saat</td><td>≈ 5,5 saat</td><td>≈ 3,8 saat</td><td>≈ 2,7 saat</td></tr>
<tr><td>SH4000 (≈ 4.350Wh)</td><td>≈ 43 saat</td><td>≈ 26 saat</td><td>≈ 13,8 saat</td><td>≈ 9,6 saat</td><td>≈ 6,6 saat</td></tr>
</tbody>
</table>

<p>P800 teknik olarak 655W'lık bir düzeni 800W sürekli gücün altında taşıyabilir; ancak ekran kartının ani sıçramalarıyla sınıra çok yaklaşır ve süre bir saatin altında kalır. Bu yüzden üst seviye bir oyun bilgisayarı için en az P1800 sınıfı bir model öneriyoruz. Kendi cihazlarınızla toplamı görmek için <a href="/guc-hesaplayici">güç hesaplayıcımızı</a> kullanabilirsiniz.</p>

<h2>UPS Modu Oyunu Kesintisiz Sürdürür mü?</h2>

<p>UPS (kesintisiz güç kaynağı) modu, cihazlar power station üzerinden şebekeye bağlıyken elektrik kesildiğinde beslemeyi bataryaya aktaran işlevdir. IEETek güç kaynaklarında bu geçiş yaklaşık 10 ms sürer. Bu kurulumda konsol veya bilgisayar her zaman power station'ın çıkışına takılıdır; şebeke varken cihazlar şebekeden beslenir, power station da şarjda kalır.</p>

<p>10 ms çok kısa bir süredir ve birçok bilgisayar güç ünitesi ile konsol bu boşluğu içindeki kondansatörlerle tolere eder. Ancak bu her güç ünitesi için garanti değildir. Özellikle yüksek yük altında çalışan veya eski güç üniteleri, geçiş anında yeniden başlayabilir. Bu yüzden şu adımları izleyin:</p>

<ol>
<li><strong>Önceden test edin.</strong> Önemli bir oturumdan önce, cihaz açıkken power station'ın şebeke fişini çekip geçişi deneyin. Testi kaydedilmiş bir oyunda veya masaüstünde yapın.</li>
<li><strong>Oyunu ve işinizi sık kaydedin.</strong> Geçiş sorunsuz olsa bile otomatik kayıt ayarlarını açık tutun.</li>
<li><strong>Modemi de aynı güç kaynağına bağlayın.</strong> Konsol açık kalsa bile modem kapanırsa çevrim içi oturum kopar.</li>
<li><strong>Yükü sınırlı tutun.</strong> UPS modunda bağlı olan toplam güç, sürekli çıkışın belirgin şekilde altında kalsın.</li>
</ol>

<p>UPS kullanımını ve şarj olurken cihaz besleme mantığını <a href="/blog/guc-istasyonunda-pass-through-sarj-ups-modu">pass-through şarj ve UPS modu yazımızda</a> ayrıntılı anlattık.</p>

<h2>Oyun Donanımı İçin Saf Sinüs Neden Önemli?</h2>

<p>Saf sinüs dalga, şebekeden gelen elektriğe benzer düzgün bir alternatif akım biçimidir. Modifiye sinüs ise basamaklı, kaba bir dalga şeklidir. Bilgisayar ve konsolların güç üniteleri, özellikle aktif PFC (güç faktörü düzeltme) devresi olanlar, modifiye sinüste ısınabilir, ses çıkarabilir veya hiç çalışmayabilir.</p>

<p>IEETek güç kaynaklarının AC çıkışı saf sinüstür ve harmonik bozulma (THD) %1,5'in altındadır. Bu, pahalı bir ekran kartı veya konsol için önemli bir güvencedir. Konunun teknik ayrıntısını <a href="/blog/saf-sinus-dalga-vs-modifiye-sinus-fark-nedir">saf sinüs ve modifiye sinüs karşılaştırmamızda</a> bulabilirsiniz.</p>

<h2>Kesintide Daha Uzun Oynamak İçin Ne Yapabilirsiniz?</h2>

<ul>
<li><strong>Kare hızını sınırlayın.</strong> Oyunda FPS sınırı koymak veya dikey senkronizasyonu açmak, ekran kartının gereksiz yere tam güçte çalışmasını engeller.</li>
<li><strong>Güç tasarrufu modunu kullanın.</strong> Konsolların ve bilgisayarların enerji ayarlarında daha düşük tüketimli profiller bulunur.</li>
<li><strong>Ekran parlaklığını düşürün.</strong> TV ve monitörde parlaklık, tüketimi doğrudan etkiler. Küçük bir monitör, büyük bir TV'den genellikle daha az çeker.</li>
<li><strong>Mümkünse laptop kullanın.</strong> Oyun laptopları, benzer oyunlarda masaüstü sistemlere göre genellikle daha az enerji harcar ve kendi bataryaları ek bir tampon sağlar.</li>
<li><strong>Kullanmadığınız cihazları kapatın.</strong> Hoparlör, RGB aydınlatma ve ikinci monitör gibi yükler küçük görünse de saatler içinde toplanır.</li>
</ul>

<p>Elektronik cihazlarda enerji tasarrufuna dair genel ilkeler için <a href="https://www.energy.gov/energysaver/energy-saver" target="_blank" rel="noopener noreferrer">ABD Enerji Bakanlığı Energy Saver</a> sayfası iyi bir kaynaktır. Oyun dışında evden çalışıyorsanız laptop, modem ve monitör hesabını <a href="/blog/uzaktan-calisanlar-icin-tasinabilir-enerji-laptop-modem">uzaktan çalışanlar için enerji rehberimizde</a> ayrıca yaptık.</p>

<h2>Hangi Oyuncuya Hangi Model?</h2>

<ul>
<li><strong>Switch veya oyun laptopu kullananlar:</strong> <a href="/urun/512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800">P800</a>, düşük güçlü düzenleri birkaç saat idare eder ve 6,55 kg ağırlığıyla kolay taşınır.</li>
<li><strong>PS5 veya Xbox ile birkaç saatlik kesinti:</strong> <a href="/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800">P1800</a> yaklaşık 3 saatlik oyun sağlar; uygulama üzerinden kalan enerjiyi takip edebilirsiniz.</li>
<li><strong>Oyun bilgisayarı ve uzun kesintiler:</strong> <a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200</a> veya <a href="/urun/1920wh-4000w-max-lifepo4-tasinabilir-guc-kaynagi-aplikasyon-kablosuz-sarj-operasyonel-kullanim-4000-ustu-dongu-99-99-bms-coklu-cikis-singo2000pro">Singo2000PRO</a>, orta seviye bir sistemi 3,5–4 saat çalıştırır.</li>
<li><strong>Bütün evin yedeği düşünülüyorsa:</strong> SH4000, 5120Wh kapasitesiyle oyun düzeninin yanında buzdolabı, aydınlatma ve modem gibi temel yükleri de taşıyabilir.</li>
</ul>

<p>Tüm modelleri yan yana görmek için <a href="/kategori/tasinabilir-guc-kaynaklari">taşınabilir güç kaynakları kategorimize</a> göz atabilirsiniz.</p>

<h2>Kesinti Gelse de Oturumunuz Kaybolmasın</h2>

<p>Oyun düzeninin güç ihtiyacını bilmek, doğru power station'ı seçmenin ilk adımıdır. Konsollar ve laptoplar orta boy bir modelle saatlerce çalışır; güçlü bir oyun bilgisayarı ise daha büyük kapasite ve yüksek sürekli güç ister.</p>

<p>UPS modunu önceden test eder, modemi de aynı kaynağa bağlar ve oyunlarınızı sık kaydederseniz, bir kesinti çoğu zaman yalnızca ışıkların kararmasından ibaret kalır.</p>

<h2>Sık Sorulan Sorular</h2>

<h3>PS5 kaç watt çeker?</h3>
<p>PS5 oyun sırasında tipik olarak 150–220W çeker; menüde ve video izlerken bu değer düşer. Kesin değer oyuna ve modele göre değişir, wattmetreyle ölçmek en doğrusudur.</p>

<h3>P1800 ile PS5 kaç saat çalışır?</h3>
<p>PS5, TV ve modemden oluşan yaklaşık 315W'lık bir düzende 1024Wh × 0,85 ÷ 315W ≈ 2,8 saat. Yalnızca konsol ve küçük bir monitör kullanılırsa süre uzar.</p>

<h3>Oyun bilgisayarı power station ile çalışır mı?</h3>
<p>Çalışır. Oyun sırasındaki tüketim 300–600W ve üzerinde olabildiği için sürekli çıkışı bunun belirgin şekilde üzerinde olan bir model seçin; üst seviye sistemler için en az P1800 sınıfı öneriyoruz.</p>

<h3>Elektrik kesildiğinde bilgisayar kapanır mı?</h3>
<p>Bilgisayar UPS modunda power station'a bağlıysa yaklaşık 10 ms'lik geçişte çoğu sistem çalışmaya devam eder. Bu her güç ünitesi için garanti olmadığından önceden test edin ve işinizi kaydedin.</p>

<h3>Konsol için modifiye sinüs invertör kullanılabilir mi?</h3>
<p>Önerilmez. Konsol ve bilgisayar güç üniteleri modifiye sinüste ısınabilir veya düzgün çalışmayabilir. Saf sinüs çıkış veren bir kaynak tercih edin.</p>

<h3>Nintendo Switch power station ile ne kadar çalışır?</h3>
<p>Switch dock'ta tipik olarak 10–20W çeker. TV ile birlikte yaklaşık 100W'lık bir düzende P800 yaklaşık 4,4 saat, P1800 yaklaşık 8,7 saat çalışır.</p>`,
  },
];
