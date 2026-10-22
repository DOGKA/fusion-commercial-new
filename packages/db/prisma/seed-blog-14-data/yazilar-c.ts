import type { BlogInput } from "./tip";

const P800 = "/urun/512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800";
const P1800 = "/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800";
const SINGO = "/urun/1920wh-4000w-max-lifepo4-tasinabilir-guc-kaynagi-aplikasyon-kablosuz-sarj-operasyonel-kullanim-4000-ustu-dongu-99-99-bms-coklu-cikis-singo2000pro";
const P3200 = "/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200";
const SH4000 = "/urun/5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000";
const SP100 = "/urun/tasinabilir-gunes-paneli-100w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp100";
const SP200 = "/urun/tasinabilir-gunes-paneli-200w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp200";
const SP400 = "/urun/tasinabilir-gunes-paneli-400w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp400";

export const yazilar: BlogInput[] = [
  // ══════════════════════════════════════════════════════════════════
  // 11 — KARAVAN BUZDOLABI
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "karavan-buzdolabi-12v-power-station-kac-gun-gider",
    title: "Karavan Buzdolabı Power Station ile Kaç Gün Gider? 12V Kompresörlü Dolap Hesabı",
    excerpt:
      "12V kompresörlü oto buzdolabı, absorpsiyonlu (3 yollu) dolap ve 230V mini buzdolabı günde kaç Wh harcar? P800'den P3200'e her modelin solar şarjla ve şarjsız kaç gün dayandığını hesapladık.",
    category: "Karavan",
    tags: [
      "karavan buzdolabı",
      "12v buzdolabı",
      "kompresörlü oto buzdolabı",
      "power station",
      "karavan enerji",
      "güneş paneli",
    ],
    metaTitle: "Karavan Buzdolabı Power Station ile Kaç Gün Gider? (2026)",
    metaDescription:
      "12V kompresörlü karavan buzdolabı günde kaç Wh harcar? Absorpsiyonlu ve 230V dolap farkı, P800–P3200 için solarlı ve solarsız kaç gün tablosu ve ipuçları.",
    metaKeywords: [
      "karavan buzdolabı güç tüketimi",
      "12v oto buzdolabı kaç watt",
      "kompresörlü buzdolabı power station",
      "karavan buzdolabı kaç gün gider",
      "absorpsiyonlu buzdolabı akü",
      "oto buzdolabı güneş paneli",
    ],
    content: `<p>Karavanla yola çıkan herkesin ilk sorduğu soru aynıdır: “Buzdolabı kaç gün dayanır?” Işık, telefon ve laptop küçük yüklerdir; ama buzdolabı gece gündüz, siz uyurken bile çalışır. Enerji planınızın omurgası çoğu zaman bu tek cihazdır.</p>

<p>Bu yazıda karavanlarda kullanılan üç buzdolabı tipini karşılaştırıyor, günlük tüketimi gerçekçi aralıklarla hesaplıyor ve her power station modelinin güneş paneliyle ve paneller olmadan kaç gün götürdüğünü tablo halinde gösteriyoruz. Karavan enerji sisteminin genel tasarımını merak ediyorsanız önce <a href="/blog/karavan-icin-guc-kaynagi-ve-solar-panel-sistemi">karavan güç kaynağı ve solar sistem rehberimize</a> göz atabilirsiniz.</p>

<blockquote><p><strong>Kısa cevap:</strong> 12V kompresörlü bir oto buzdolabı çalışırken tipik olarak 40–60W çeker; termostat devreye girip çıktığı için günlük ortalama ılıman havada yaklaşık 250–450Wh, sıcak yaz günlerinde 500–700Wh civarındadır. Günde 400Wh tüketen bir dolabı 1024Wh'lik P1800 yaklaşık 2 gün, 2048Wh'lik P3200 yaklaşık 4,4 gün çalıştırır. 200W bir panel güneşli bir günde bu tüketimin tamamını karşılayabilir.</p></blockquote>

<h2>Karavanda Hangi Buzdolabı Tipleri Kullanılır?</h2>

<p>Karavan ve kamp dünyasında üç farklı soğutma yaklaşımı yaygındır. Aralarındaki fark yalnızca fiyat değil, enerjiyi nasıl harcadıklarıdır.</p>

<h3>12V kompresörlü oto buzdolabı nedir?</h3>

<p>Kompresörlü oto buzdolabı, ev buzdolabıyla aynı prensiple çalışan ama doğrudan 12V veya 24V DC ile beslenen bir soğutucudur. Kompresör çalışırken tipik olarak 40–60W çeker, hedef sıcaklığa ulaşınca durur. Bu yüzden saatlik ortalaması çalışma gücünün oldukça altındadır.</p>

<p>Taşınabilir enerjiyle en uyumlu seçenek budur: verimlidir, dış sıcaklık yüksek olsa da soğutmaya devam eder ve çoğu modelde “eco” modu bulunur.</p>

<h3>Absorpsiyonlu (3 yollu) buzdolabı nedir?</h3>

<p>Absorpsiyonlu buzdolabı, kompresör yerine ısı kaynağıyla çalışan bir soğutma döngüsü kullanır. “3 yollu” denmesinin sebebi tüp gaz, 230V ve 12V olmak üzere üç enerji kaynağıyla çalışabilmesidir. Sessizdir ama elektrikle çalışırken içindeki ısıtıcı rezistans sürekli enerji harcar.</p>

<p>12V modunda tipik olarak 100–150W çeker ve birçok modelde bu modda termostat yoktur; yani gün boyu aynı gücü çekmeye devam edebilir. Günde 2,4 kWh'i aşan bir tüketim, taşınabilir bir batarya için çok yüksektir. Bu dolaplar park halindeyken gazla, yolda ise aracın şarj sistemiyle kullanılmak üzere tasarlanmıştır.</p>

<h3>230V ev tipi mini buzdolabı mantıklı mı?</h3>

<p>Otel odalarındaki gibi küçük bir ev tipi buzdolabı da kullanılabilir. Bu cihazlar 230V AC ile çalıştığı için power station'ın invertörünü devreye sokar. İnvertör hem dönüşüm kaybı yaratır hem de açık kaldığı sürece kendi de bir miktar enerji harcar. Ayrıca kompresör kalkışında kısa süreli bir akım darbesi oluşur; saf sinüs ve yüksek tepe gücü bu noktada işe yarar.</p>

<p>Küçük bir mini buzdolabı günde tipik olarak 0,3–0,8 kWh harcar. Yani mümkün ama 12V kompresörlü bir dolaba göre genellikle daha az verimlidir. Ev buzdolapları için detaylı hesap <a href="/blog/buzdolabi-icin-kac-wh-gerekir">buzdolabı kaç Wh yazımızda</a> yer alıyor.</p>

<h2>Karavan Buzdolabı Günde Kaç Wh Harcar?</h2>

<p>Günlük tüketimi belirleyen asıl şey kompresörün ne kadar süre çalıştığıdır. Bu da dış sıcaklığa, dolabın ne sıklıkla açıldığına, içine sıcak ürün konup konmadığına ve ayarlanan sıcaklığa bağlıdır. Aşağıdaki değerler tipik aralıklardır; kendi dolabınızın etiketini ve mümkünse bir wattmetre ölçümünü esas alın.</p>

<table>
<thead>
<tr><th>Buzdolabı tipi</th><th>Çalışırken çekilen güç</th><th>Ilıman hava (günlük)</th><th>Sıcak yaz günü (günlük)</th></tr>
</thead>
<tbody>
<tr><td>12V kompresörlü (30–50 L)</td><td>40–60W</td><td>250–450Wh</td><td>500–700Wh</td></tr>
<tr><td>Absorpsiyonlu, 12V modunda</td><td>100–150W</td><td>2.400–3.600Wh</td><td>2.400–3.600Wh</td></tr>
<tr><td>Absorpsiyonlu, 230V modunda</td><td>100–150W</td><td>1.000–2.000Wh</td><td>1.500–2.500Wh</td></tr>
<tr><td>230V ev tipi mini buzdolabı</td><td>50–100W</td><td>300–600Wh</td><td>500–800Wh</td></tr>
</tbody>
</table>

<p>Tablodan çıkan sonuç net: power station ile beslenecek bir karavan buzdolabı için en mantıklı seçim 12V kompresörlü modeldir. Absorpsiyonlu dolabınız varsa elektriği yalnızca yolda veya şebekeye bağlıyken kullanmanız, park halindeyse gaza geçmeniz daha gerçekçidir.</p>

<h2>Neden 12V Araç Çıkışını Kullanmalısınız?</h2>

<p>Power station'ın içindeki batarya doğru akımla (DC) çalışır. 230V prizden bir cihaz beslediğinizde invertör bu enerjiyi alternatif akıma (AC) çevirir; 12V adaptörlü bir buzdolabı bu AC'yi tekrar DC'ye çevirir. Her dönüşüm bir miktar kayıp demektir.</p>

<p>Buzdolabını doğrudan araç çıkışından beslediğinizde bu çift dönüşüm ortadan kalkar ve invertörü hiç açmanız gerekmez. <a href="${P800}">P800</a> ve <a href="${P1800}">P1800</a> modellerinde araç çıkışı bulunur; oto buzdolabının çakmak fişini buraya takmanız yeterlidir. Diğer modellerde mevcut çıkışları ürün sayfasından ve kullanım kılavuzundan kontrol edin; 12V çıkış yoksa buzdolabını kendi AC adaptörüyle prizden çalıştırabilirsiniz.</p>

<p>Bu yazıdaki hesaplarda yine de muhafazakâr kalıp kapasitenin %85'ini kullanılabilir kabul ediyoruz. DC çıkıştan beslenen bir dolapta gerçek süre genellikle biraz daha uzun olur.</p>

<h2>Power Station Karavan Buzdolabını Kaç Gün Çalıştırır?</h2>

<p>Hesap formülü basit: <strong>Gün ≈ Kapasite (Wh) × 0,85 ÷ Günlük tüketim (Wh)</strong>. Örneğin P1800 için: 1024Wh × 0,85 ≈ 870Wh kullanılabilir enerji; günde 400Wh harcayan bir dolapla 870 ÷ 400 ≈ 2,2 gün.</p>

<p>Güneş paneli eklendiğinde soru değişir: “kaç gün” yerine “günlük denge pozitif mi?” diye sormak gerekir. Panel üretimini <strong>Panel W × tepe güneş saati × 0,75</strong> ile hesaplıyoruz. Yazın Türkiye'nin pek çok bölgesinde 5 tepe güneş saati makul bir varsayımdır; bu durumda 100W panel günde yaklaşık 375Wh, 200W panel yaklaşık 750Wh, 400W panel yaklaşık 1.500Wh üretir. Bölgenize özgü değerler için <a href="https://re.jrc.ec.europa.eu/pvg_tools/en/" target="_blank" rel="noopener noreferrer">PVGIS</a> aracını kullanabilirsiniz.</p>

<table>
<thead>
<tr><th>Model</th><th>Kullanılabilir enerji</th><th>Solarsız, 400Wh/gün</th><th>Solarsız, 600Wh/gün</th><th>Uyumlu panelle güneşli günde</th></tr>
</thead>
<tbody>
<tr><td>P800 (512Wh)</td><td>≈ 435Wh</td><td>≈ 1,1 gün</td><td>≈ 0,7 gün</td><td>SP100: ≈ 375Wh/gün, neredeyse dengede; SP200: ≈ 750Wh/gün, artı bakiye</td></tr>
<tr><td>P1800 (1024Wh)</td><td>≈ 870Wh</td><td>≈ 2,2 gün</td><td>≈ 1,5 gün</td><td>SP200: ≈ 750Wh/gün, dolap ve küçük yükler karşılanır</td></tr>
<tr><td>Singo2000PRO (1920Wh)</td><td>≈ 1.630Wh</td><td>≈ 4,1 gün</td><td>≈ 2,7 gün</td><td>SP200: ≈ 750Wh/gün, bulutlu günlere tampon kalır</td></tr>
<tr><td>P3200 (2048Wh)</td><td>≈ 1.740Wh</td><td>≈ 4,4 gün</td><td>≈ 2,9 gün</td><td>SP400: ≈ 1.500Wh/gün, dolap + laptop + aydınlatma rahat</td></tr>
</tbody>
</table>

<p>Panel eşleştirmesinde datasheet sınırlarına uyduk. P1800 ve Singo2000PRO'nun solar girişi 50–52V'ta sınırlandığı için SP400 bu iki modelle uyumsuzdur (açık devre gerilimi 52,8V). SP400 için doğru eş P3200'dür. P800'ün solar girişi 300W ile sınırlı olduğu için onunla SP100 veya SP200 kullanın.</p>

<h3>Bulutlu günler ne olacak?</h3>

<p>Kapalı havada panel üretimi tipik olarak güneşli güne göre çok daha düşük kalır. Bu yüzden sadece “güneşli gün dengesi”ne güvenmeyin; bataryada en az bir-iki günlük tampon bırakın. 1–2 günlük kamplarda P800 yeterli olabilir, ama bir hafta boyunca tek yerde kalacaksanız Singo2000PRO veya P3200 sınıfı bir kapasite daha az stres yaratır.</p>

<h2>Buzdolabının Tüketimini Azaltmanın 7 Yolu</h2>

<ol>
<li><strong>Evde önceden soğutun.</strong> Dolabı yola çıkmadan önceki akşam şebekeden çalıştırın ve içine soğuk ürün koyun. İlk soğutma, günün en yüksek tüketimidir.</li>
<li><strong>Gölgeye park edin.</strong> Doğrudan güneş alan bir karavanın içi dışarıdan çok daha sıcak olur. Dolabı güneş gören camdan ve sıcak yüzeylerden uzak tutun.</li>
<li><strong>Havalandırma boşluğu bırakın.</strong> Kompresör ısıyı arkadan ve yanlardan atar. Üreticinin önerdiği boşluğu bırakın; dolabı battaniye veya çantalarla sıkıştırmayın.</li>
<li><strong>Sıcaklığı makul ayarlayın.</strong> İçecekler ve günlük gıdalar için 3–5°C genellikle yeterlidir. Dondurucu modu çok daha fazla enerji harcar.</li>
<li><strong>Kapağı az açın.</strong> Ne alacağınızı önceden bilin. Sık açılan dolap, kompresörü daha uzun çalıştırır.</li>
<li><strong>Dolabı dolu tutun.</strong> Dolu bir dolap soğuğu daha iyi korur. Boşlukları su şişeleriyle doldurabilirsiniz.</li>
<li><strong>Eco modunu kullanın.</strong> Birçok kompresörlü oto buzdolabında bulunan düşük güç modu, ılıman havada tüketimi belirgin şekilde azaltır.</li>
</ol>

<p>Enerji verimliliğine dair genel ilkeler için <a href="https://www.energy.gov/energysaver/energy-saver" target="_blank" rel="noopener noreferrer">ABD Enerji Bakanlığı Energy Saver</a> sayfası iyi bir başlangıç noktasıdır.</p>

<h2>Hangi Senaryoya Hangi Model?</h2>

<ul>
<li><strong>Hafta sonu kaçamağı, kamp alanında bir gece:</strong> <a href="${P800}">P800</a> tek başına yaklaşık bir günlük buzdolabı enerjisi sağlar. <a href="${SP100}">SP100</a> veya <a href="${SP200}">SP200</a> eklenirse güneşli günlerde dengede kalırsınız.</li>
<li><strong>3–4 günlük tatil, buzdolabı + telefon + aydınlatma:</strong> <a href="${P1800}">P1800</a> ve SP200 birlikteliği dengeli bir başlangıçtır. Bu ikili hazır olarak <a href="/urun/solar-operator-paketi-p1800-sp200">Solar Operatör Paketi</a> içinde bulunur.</li>
<li><strong>Bir hafta ve üzeri, tek yerde konaklama:</strong> <a href="${SINGO}">Singo2000PRO</a> veya <a href="${P3200}">P3200</a> bulutlu günlere tampon bırakır. P3200 ile <a href="${SP400}">SP400</a> kullanan <a href="/urun/solar-veteran-paketi-p3200-sp400">Solar Veteran Paketi</a>, günlük 1,5 kWh civarındaki üretimiyle buzdolabının üstüne başka yükleri de taşıyabilir.</li>
</ul>

<p>Power station tek başına mı yoksa panelli bir paket olarak mı alınmalı sorusunu <a href="/blog/karavan-icin-power-station-mi-solar-paket-mi">bu karşılaştırmada</a> ayrıntılı ele aldık. Buzdolabının yanına ekleyeceğiniz diğer cihazları toplamak için <a href="/guc-hesaplayici">güç hesaplayıcımızı</a> kullanabilirsiniz.</p>

<h2>Soğuk Zincir Yolda Kopmasın</h2>

<p>Karavanda enerji planı aslında bir buzdolabı planıdır. 12V kompresörlü bir dolap, doğrudan araç çıkışından beslendiğinde ve gölgede, havalandırmalı bir yerde durduğunda, orta boy bir power station ile günlerce rahatça çalışır. Güneş paneli eklediğinizde ise “kaç gün” sorusu yerini “bugün ne kadar güneş var” sorusuna bırakır.</p>

<p>Kendi dolabınızın etiketindeki değeri ve tatil sürenizi bilirseniz, doğru kapasiteyi seçmek birkaç dakikalık bir hesaptır. Seçenekleri <a href="/kategori/tasinabilir-guc-kaynaklari">taşınabilir güç kaynakları kategorimizde</a> karşılaştırabilirsiniz.</p>

<h2>Sık Sorulan Sorular</h2>

<h3>12V oto buzdolabı kaç watt çeker?</h3>
<p>Kompresör çalışırken tipik olarak 40–60W çeker. Termostat nedeniyle sürekli çalışmadığı için günlük ortalama ılıman havada yaklaşık 250–450Wh, sıcak günlerde 500–700Wh civarındadır.</p>

<h3>Absorpsiyonlu buzdolabını power station ile çalıştırabilir miyim?</h3>
<p>Teknik olarak çalışır ama verimsizdir. 12V modunda 100–150W'ı saatlerce çeker ve günde 2,4 kWh'i aşabilir. Park halinde gaz modunu tercih etmek daha mantıklıdır.</p>

<h3>Buzdolabını AC prizden mi, 12V çıkıştan mı beslemeliyim?</h3>
<p>Dolabınız 12V destekliyorsa ve power station'da araç çıkışı varsa 12V çıkış tercih edilmelidir. İnvertör kaybı ve invertörün kendi tüketimi ortadan kalkar.</p>

<h3>P800 ile karavan buzdolabı bir gece dayanır mı?</h3>
<p>Evet. P800'ün yaklaşık 435Wh kullanılabilir enerjisi, günde 400Wh tüketen bir dolabı yaklaşık 1,1 gün çalıştırır. Bir gece için fazlasıyla yeterlidir.</p>

<h3>Buzdolabını güneş paneliyle sürekli çalıştırmak mümkün mü?</h3>
<p>Güneşli bölgelerde ve yaz aylarında evet. 200W panel günde yaklaşık 750Wh üretir ve tipik bir 12V dolabın tüketimini karşılar. Bulutlu günler için bataryada tampon bırakmak gerekir.</p>

<h3>Gece sıcaklığı tüketimi etkiler mi?</h3>
<p>Etkiler. Serin gecelerde kompresör daha seyrek çalışır ve günlük ortalama düşer. Dolabın gece boyunca gölgede ve havalandırmalı kalması, ertesi gün için enerji tasarrufu sağlar.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // 12 — YOLDA ARAÇ ŞARJI
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "karavanda-yolda-sarj-arac-sarji-ile-power-station",
    title: "Yolda Şarj: Araç Çakmaklığından Power Station Kaç Saatte Dolar?",
    excerpt:
      "Araç çakmaklığından power station şarjı yaklaşık 120W ile sınırlı. P800, P1800, Singo2000PRO ve P3200'ün kaç saatlik sürüşte dolduğunu, güneş paneliyle nasıl birleştirileceğini ve dikkat edilmesi gerekenleri anlattık.",
    category: "Karavan",
    tags: [
      "araç şarjı",
      "çakmaklık şarj",
      "yolda şarj",
      "karavan enerji",
      "power station",
      "12v priz",
    ],
    metaTitle: "Araç Çakmaklığından Power Station Şarjı Kaç Saat? 2026",
    metaDescription:
      "Araç çakmaklığından power station kaç saatte dolar? 512–2048Wh için sürüş saati tablosu, neden yavaş olduğu, solar ile birleştirme ve sigorta uyarıları.",
    metaKeywords: [
      "araç çakmaklığından power station şarjı",
      "power station araçta şarj",
      "12v çakmak şarj kaç watt",
      "karavanda yolda şarj",
      "power station kaç saatte dolar araç",
      "dc-dc şarj cihazı karavan",
    ],
    content: `<p>Karavanla ya da arabayla uzun bir yola çıktığınızda saatlerce direksiyon başında olursunuz. Bu süre boyunca aracın alternatörü zaten çalışıyor; o enerjinin bir kısmını power station'a aktarmak akla gelen ilk fikirdir. Kamp alanına vardığınızda bataryanın dolu olması, akşam için büyük bir rahatlıktır.</p>

<p>Ancak araç çakmaklığından şarj, beklendiğinden çok daha yavaştır. Bu yazıda nedenini, her modelin kaç saatlik sürüşte dolduğunu ve yolda şarjı güneş paneliyle nasıl birleştirebileceğinizi gerçekçi rakamlarla anlatıyoruz.</p>

<blockquote><p><strong>Kısa cevap:</strong> IEETek P800, P1800, Singo2000PRO ve P3200 araç çakmaklığından yaklaşık 120W'a kadar şarj olur. Kayıplarla birlikte 512Wh'lik P800 yaklaşık 5 saatlik sürüşte, 1024Wh'lik P1800 yaklaşık 10 saatte, 2048Wh'lik P3200 ise yaklaşık 20 saatte dolar. Bu yüzden araç şarjı tek başına ana şarj yöntemi değil, güneş paneli ve şebeke şarjını tamamlayan bir destektir.</p></blockquote>

<h2>Araç Çakmaklığından Power Station Şarj Edilebilir mi?</h2>

<p>Evet. Araç çakmaklığı (12V priz), aracın elektrik sisteminden doğru akım veren bir çıkıştır. Power station bu çıkıştan uygun bir kabloyla beslenebilir ve sürüş boyunca yavaş yavaş dolar. IEETek'in <a href="${P800}">P800</a>, <a href="${P1800}">P1800</a>, <a href="${SINGO}">Singo2000PRO</a> ve <a href="${P3200}">P3200</a> modellerinin datasheet'inde araç ile şarj yaklaşık 120W'a kadar olarak belirtilir.</p>

<p>P800 ve P1800 kullanıcıları için <a href="/urun/p800-p1800-cok-amacli-aksesuar-ki-ti">P800/P1800 çok amaçlı aksesuar kiti</a> içinde XT60–çakmaklık dönüştürücü bulunur. Diğer modellerde kutu içeriğini ve önerilen kabloyu ürün sayfasından ve kullanım kılavuzundan kontrol edin.</p>

<h2>Araç Şarjı Neden Bu Kadar Yavaş?</h2>

<p>Sebep power station değil, aracın prizidir. Çakmaklık soketleri genellikle 10–15A sigortayla korunur ve 12V sistemde bu, kabaca 120–180W'lık bir üst sınır demektir. Üreticiler güvenlik payı bırakmak için şarj gücünü bu sınırın altında tutar.</p>

<p>Bir de ince kablo meselesi var: düşük voltajda aynı gücü taşımak için yüksek akım gerekir. Yüksek akım, ince kablolarda ve soket temas noktalarında ısınmaya yol açar. 120W civarında bir limit, hem aracın sigortasını hem de kabloyu koruyan makul bir dengedir.</p>

<p>Kıyaslamak için: P1800 şebekeden 1200W ile yaklaşık 1,2 saatte dolarken, araçtan aynı enerjiyi almak on kata yakın daha uzun sürer. Watt, volt ve amper arasındaki ilişkiyi <a href="/blog/watt-volt-amper-wh-enerji-birimleri-rehberi">enerji birimleri rehberimizde</a> anlattık.</p>

<h2>Her Model Kaç Saatlik Sürüşte Dolar?</h2>

<p>Teorik süre basit bir bölmedir: Kapasite ÷ 120W. Gerçekte ise dönüşüm kayıpları ve kablo kayıpları nedeniyle bataryaya ulaşan güç biraz daha düşüktür. Gerçekçi tahmin için şarj gücünü %85 verimle yaklaşık 102W kabul ediyoruz. Örneğin P1800 için: 1024Wh ÷ 102W ≈ 10 saat.</p>

<table>
<thead>
<tr><th>Model</th><th>Kapasite</th><th>Teorik süre (120W)</th><th>Gerçekçi süre (≈102W)</th><th>Şebekeden şarj (AC)</th></tr>
</thead>
<tbody>
<tr><td>P800</td><td>512Wh</td><td>≈ 4,3 saat</td><td>≈ 5 saat</td><td>≈ 1,2 saat (600W)</td></tr>
<tr><td>P1800</td><td>1024Wh</td><td>≈ 8,5 saat</td><td>≈ 10 saat</td><td>≈ 1,2 saat (1200W)</td></tr>
<tr><td>Singo2000PRO</td><td>1920Wh</td><td>≈ 16 saat</td><td>≈ 18,8 saat</td><td>≈ 1,5 saat (1500W)</td></tr>
<tr><td>P3200</td><td>2048Wh</td><td>≈ 17,1 saat</td><td>≈ 20,1 saat</td><td>≈ 1,5 saat (1800W)</td></tr>
</tbody>
</table>

<p>Tablo, boş bataryadan tam dolum içindir. Pratikte batarya nadiren sıfırdan başlar. Örneğin P1800'ü %50'den %100'e çıkarmak, araçta yaklaşık 5 saatlik sürüş gerektirir.</p>

<h3>Kısa sürüşler işe yarar mı?</h3>

<p>Bir saatlik sürüş, yaklaşık 100Wh enerji kazandırır. Bu bir laptopun birkaç saatlik kullanımına, telefonların birkaç kez şarjına veya bir 12V oto buzdolabının birkaç saatlik tüketimine denk gelir. Büyük bir dolum değil ama gün içindeki tüketimin bir kısmını telafi eder. Oto buzdolabının günlük tüketimini <a href="/blog/karavan-buzdolabi-12v-power-station-kac-gun-gider">karavan buzdolabı yazımızda</a> hesapladık.</p>

<h2>Yolda Şarjı Güneş Paneliyle Nasıl Birleştirirsiniz?</h2>

<p>En verimli strateji, iki kaynağı birbirini tamamlayacak şekilde kullanmaktır: yolda araç şarjı, park halinde güneş paneli. Panel üretimini <strong>Panel W × tepe güneş saati × 0,75</strong> ile hesaplarsak, 200W'lık bir panel 4 saatlik iyi güneşte yaklaşık 600Wh üretir. Bu, altı saatlik sürüşün sağladığı enerjiye yakındır.</p>

<p>Örnek bir gün planı:</p>

<ol>
<li><strong>Sabah:</strong> P1800 gece boyunca kullanıldı ve %30'a indi (yaklaşık 300Wh kaldı).</li>
<li><strong>Yolculuk:</strong> 3 saatlik sürüşte araç şarjı yaklaşık 300Wh ekler. Batarya %60 civarına çıkar.</li>
<li><strong>Öğleden sonra:</strong> Kamp alanında <a href="${SP200}">SP200</a> açılır, 4 tepe güneş saatinde yaklaşık 600Wh üretir.</li>
<li><strong>Akşam:</strong> Batarya dolu veya doluya yakın; gece için yeniden hazır.</li>
</ol>

<p>Bu kombinasyonu hazır olarak almak isterseniz <a href="/urun/solar-operator-paketi-p1800-sp200">Solar Operatör Paketi</a> P1800 ve SP200'ü bir arada sunar. Panel ile şarjın adımlarını <a href="/blog/solar-panel-ile-guc-istasyonu-sarj-etme-rehberi">solar şarj rehberimizde</a> bulabilirsiniz.</p>

<h2>Araçta Şarj Ederken Nelere Dikkat Etmelisiniz?</h2>

<h3>Motor kapalıyken şarj etmeyin</h3>

<p>Bazı araçlarda çakmaklık kontak kapalıyken de enerji vermeye devam eder. Bu durumda power station, aracın marş aküsünden enerji çekmeye devam eder ve akü sabah aracı çalıştıramayacak kadar boşalabilir. Şarjı yalnızca motor çalışırken yapın; mola verdiğinizde kabloyu çıkarın.</p>

<p>Pratik bir alışkanlık: kabloyu motoru çalıştırdıktan sonra takın, motoru durdurmadan önce çıkarın. Böylece hem marş anındaki voltaj düşüşünden hem de istenmeyen akü boşalmasından kaçınırsınız.</p>

<h3>Soket sigortası araçtan araca değişir</h3>

<p>Çakmaklık sigortasının değeri marka ve modele göre farklıdır. Aracınızın kullanım kılavuzunda sigorta değerini kontrol edin. Aynı sokete başka cihazlar da bağlıysa (çoklayıcı, buzdolabı, şarj aleti) toplam akım sigortayı attırabilir. Power station şarj olurken o sokete başka yük eklemeyin.</p>

<h3>Kablo ve soket ısınmasını kontrol edin</h3>

<p>İlk kullanımlarda yarım saat sonra fişe dokunarak sıcaklığını kontrol edin. Hafif ılık olması normaldir; elle tutulamayacak kadar sıcaksa fiş tam oturmuyor ya da soket yıpranmış olabilir. Kabloyu paspas altından veya sıkışabileceği yerlerden geçirmeyin.</p>

<h3>Power station'ı sabitleyin</h3>

<p>Ani frende kayabilecek ağır bir cihaz yolcular için risklidir. P3200 gibi 24 kg'ı aşan modelleri bagajda kayışla sabitleyin; havalandırma ızgaralarının önünü kapatmayın.</p>

<h3>Yazın kapalı araçta bırakmayın</h3>

<p>Güneş altında park edilmiş bir aracın içi, özellikle yaz aylarında dış hava sıcaklığının çok üzerine çıkabilir. Lityum bataryalar yüksek sıcaklıkta hem daha yavaş şarj olur hem de uzun vadede daha hızlı yıpranır; BMS aşırı sıcakta şarjı durdurabilir. Mola verirken cihazı torpido veya cam önü gibi doğrudan güneş alan yerlerde bırakmayın, mümkünse gölgede ve havadar bir yerde tutun. Sıcaklığın batarya ömrüne etkisini <a href="/blog/tasinabilir-guc-kaynagi-bakim-ve-depolama-rehberi">bakım ve depolama rehberimizde</a> ayrıntılı anlattık.</p>

<h2>DC-DC Şarj Cihazı Nedir?</h2>

<p>DC-DC şarj cihazı (akü-akü şarj cihazı), aracın alternatöründen gelen enerjiyi ikinci bir bataryaya kontrollü biçimde aktaran bir dönüştürücüdür. Karavanlarda yaşam aküsünü yolda şarj etmek için yaygın olarak kullanılır ve genellikle çakmaklık soketine değil, doğrudan aküye uygun kesitte kablo ve sigortayla bağlanır.</p>

<p>Bu tür sistemler çakmaklıktan daha yüksek güç aktarabilir; ancak kurulum aracın elektrik sistemine müdahale gerektirir. Bir power station ile bu tür bir cihazın birlikte kullanılabilmesi, giriş voltajı ve akım sınırlarına bağlıdır. Bu konuda kendi başınıza bağlantı yapmayın; aracınızın yetkili servisine veya bir oto elektrikçisine danışın, güç kaynağınızın giriş değerlerini ise <a href="/kullanim-kilavuzlari">kullanım kılavuzlarından</a> doğrulayın.</p>

<h2>Marş Aküsü Zayıfsa Power Station Yardımcı Olur mu?</h2>

<p>Yolda şarjın tersi de bir ihtiyaçtır: kamp alanında birkaç gün durduktan sonra marş aküsü zayıflayabilir. P3200'ün dahili jump starter özelliği bu durumda işe yarar. Akü takviyesinin nasıl yapıldığını ve hangi durumlarda işe yaradığını <a href="/blog/jump-starter-nedir-power-station-ile-aku-takviyesi">jump starter rehberimizde</a> anlattık.</p>

<h2>Hangi Kapasite Yolda Şarja Uygun?</h2>

<ul>
<li><strong>Sık sık kısa yol yapanlar:</strong> P800 araç şarjıyla en hızlı dolan modeldir; günlük 4–5 saatlik sürüş onu baştan sona doldurabilir.</li>
<li><strong>Karavan tatili, gün aşırı yol:</strong> P1800 veya Singo2000PRO, yolda şarjla güneş panelini birleştiren bir planda dengeli çalışır.</li>
<li><strong>Uzun süre tek yerde konaklama:</strong> P3200'ü araçtan doldurmak 20 saat sürer. Bu kapasitede asıl şarj kaynağı güneş paneli olmalıdır; <a href="${SP400}">SP400</a> ile güneşli bir günde yaklaşık 1.500Wh üretilebilir.</li>
</ul>

<p>Yolculuk boyunca hangi cihazları kullanacağınızı ve toplam günlük ihtiyacınızı <a href="/guc-hesaplayici">güç hesaplayıcımızla</a> çıkarabilirsiniz. Karavan için genel sistem seçimi ise <a href="/blog/karavan-icin-power-station-mi-solar-paket-mi">power station mı solar paket mi yazımızda</a> yer alıyor.</p>

<h2>Direksiyondaki Saatleri Enerjiye Çevirmek</h2>

<p>Araç çakmaklığı, power station için bir yakıt istasyonu değil, yol boyu açık kalan ince bir musluktur. Her saat yaklaşık 100Wh ekler; küçük modellerde bir günlük yolculuk bataryayı doldurur, büyük modellerde ise günlük tüketimin bir kısmını telafi eder.</p>

<p>Gerçek gücü, güneş paneli ve şebeke şarjıyla birlikte kullanıldığında ortaya çıkar. Rotanızdaki güneşlenme süresini kontrol etmek için <a href="https://www.mgm.gov.tr/" target="_blank" rel="noopener noreferrer">Meteoroloji Genel Müdürlüğü</a> tahminlerine bakabilir, uygun modelleri <a href="/kategori/tasinabilir-guc-kaynaklari">taşınabilir güç kaynakları kategorimizde</a> karşılaştırabilirsiniz.</p>

<h2>Sık Sorulan Sorular</h2>

<h3>Araç çakmaklığı kaç watt verir?</h3>
<p>Genellikle 10–15A sigortayla korunan çakmaklık soketi, 12V sistemde kabaca 120–180W'lık bir üst sınıra sahiptir. Kesin değer araçtan araca değişir; aracınızın kullanım kılavuzuna bakın.</p>

<h3>P1800 araçta kaç saatte dolar?</h3>
<p>Araç şarjı yaklaşık 120W ile sınırlı olduğundan, kayıplarla birlikte boştan doluya yaklaşık 10 saatlik sürüş gerekir. Şebekeden ise yaklaşık 1,2 saatte dolar.</p>

<h3>Motor kapalıyken power station'ı araçta şarj edebilir miyim?</h3>
<p>Önerilmez. Motor kapalıyken çakmaklık hâlâ enerji veriyorsa power station marş aküsünü boşaltabilir ve araç çalışmayabilir.</p>

<h3>Araç şarjı power station'a zarar verir mi?</h3>
<p>Hayır. Şarj gücü datasheet sınırları içinde kaldığı ve BMS bataryayı koruduğu sürece araç şarjı normal bir şarj yöntemidir. Uygun ve sağlam bir kablo kullanmak yeterlidir.</p>

<h3>Araç şarjıyla güneş paneli aynı anda kullanılabilir mi?</h3>
<p>Bu, modelin giriş yapısına bağlıdır. Aynı anda kullanım konusunda kendi modelinizin kullanım kılavuzunu esas alın; pratikte en kolay yöntem yolda araç şarjı, park halinde panel kullanmaktır.</p>

<h3>DC-DC şarj cihazı ile daha hızlı şarj olur mu?</h3>
<p>DC-DC şarj cihazları genellikle çakmaklıktan daha yüksek güç aktarır ama kurulum aracın elektrik sistemine müdahale gerektirir. Uyumluluk ve bağlantı için oto elektrikçisine ve ürün kılavuzuna danışın.</p>`,
  },
];
