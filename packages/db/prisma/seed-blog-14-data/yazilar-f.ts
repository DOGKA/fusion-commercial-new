import type { BlogInput } from "./tip";

export const yazilar: BlogInput[] = [
  // ══════════════════════════════════════════════════════════════════
  // 8 — ARICILAR İÇİN GÜNEŞ PANELİ VE TAŞINABİLİR ENERJİ
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "aricilar-icin-gunes-paneli-ve-tasinabilir-enerji",
    title: "Arıcılar İçin Güneş Paneli ve Taşınabilir Enerji: Göçer Arılıkta Elektrik Nasıl Sağlanır?",
    excerpt:
      "Göçer arıcılıkta aydınlatma, telefon, kovan terazisi, bal santrifüjü ve sır alma bıçağı için günlük Wh hesabı; hangi power station ve güneş paneli kombinasyonunun arılığa uygun olduğu.",
    category: "Solar",
    tags: [
      "arıcılar için güneş paneli",
      "göçer arıcılık",
      "arılık enerji",
      "bal santrifüjü",
      "kovan terazisi",
      "solar paket",
    ],
    metaTitle: "Arıcılar İçin Güneş Paneli ve Power Station Rehberi 2026",
    metaDescription:
      "Göçer arıcılıkta enerji: bal santrifüjü, sır alma bıçağı, kovan terazisi ve buzdolabı için günlük Wh hesabı, uygun power station ve güneş paneli seçimi.",
    metaKeywords: [
      "arıcılar için güneş paneli",
      "göçer arıcılık elektrik",
      "arılıkta güneş enerjisi",
      "bal santrifüjü kaç watt",
      "kovan terazisi güç kaynağı",
      "arıcılık power station",
    ],
    content: `<p>Göçer arıcılık, sezon boyunca kovanları çiçeklenmeyi takip ederek bir bölgeden diğerine taşımak demektir. Bu yolculuğun çoğu zaman şebekeden uzak yaylalarda, orman kenarlarında ya da tarla aralarında geçmesi, enerji ihtiyacını da beraberinde getirir. Akşam çadırda ışık, telefonun ve telsizin şarjı, kovan izleme cihazları ve hasat günü çalışacak elektrikli ekipman için bir çözüm gerekir.</p>

<p>Bu yazıda arılıkta karşılaşılan tipik yükleri tek tek ele alıyor, günlük Wh ihtiyacını örnek bir tabloyla hesaplıyor ve hangi power station ile hangi güneş panelinin bu tabloya uyduğunu gösteriyoruz. Sonunda toz, sıcak ve taşıma koşulları için pratik önerileri bulacaksınız.</p>

<blockquote><p><strong>Kısa cevap:</strong> Hasat yapılmayan sıradan bir arılık gününde aydınlatma, telefon, kovan izleme, mini buzdolabı ve laptop için tipik olarak 600–700Wh yeterlidir; bunu P1800 + SP200 (Solar Operatör Paketi) karşılar. Bal santrifüjü ve elektrikli sır alma bıçağının çalıştığı hasat günlerinde ihtiyaç 1.600Wh'in üzerine çıkabilir; bu senaryo için 2048Wh'lik P3200 ve 400W'lık SP400'den oluşan Solar Veteran Paketi daha uygundur.</p></blockquote>

<h2>Arılıkta Hangi Cihazlar Elektrik İster?</h2>

<p>Her arıcının ekipmanı farklıdır, ama göçer arılıklarda öne çıkan yükler büyük ölçüde benzerdir. Aşağıdaki watt değerleri genel aralıklardır; kendi cihazınızın etiketini veya kullanım kılavuzunu mutlaka kontrol edin, mümkünse bir prizli wattmetreyle ölçün.</p>

<ul>
  <li><strong>LED aydınlatma:</strong> Çadır, karavan veya bal evinde kullanılan LED lambalar tipik olarak 5–20W arasındadır.</li>
  <li><strong>Telefon, GPS ve telsiz şarjı:</strong> Cihaz başına genellikle 5–20W; günde birkaç cihaz için toplam tüketim çoğunlukla 30–50Wh civarında kalır.</li>
  <li><strong>Kovan izleme sensörleri ve kovan terazisi:</strong> Birçok sensör kendi pil veya bataryasıyla çalışır; sahadaki ağ geçidi, modem ya da şarj ünitesi ise tipik olarak birkaç watt çeker ama 24 saat açıktır.</li>
  <li><strong>Elektrikli bal sağım (santrifüj) makinesi:</strong> Küçük ve orta boy modellerde motor gücü tipik olarak 150–400W aralığındadır. Motor kalkışında kısa süreli daha yüksek akım çekebilir.</li>
  <li><strong>Elektrikli sır alma bıçağı:</strong> Isıtıcılı bıçaklar tipik olarak 400–1.000W arasındadır; bazı modeller daha yüksek olabilir. Termostatlı olanlar sürekli tam güç çekmez.</li>
  <li><strong>Mini buzdolabı veya kompresörlü soğutucu:</strong> Çalışırken genellikle 40–80W çeker, ancak kompresör aralıklı çalıştığı için günlük tüketim çoğunlukla 250–500Wh aralığındadır.</li>
  <li><strong>Laptop:</strong> Kayıt tutma, satış ve kovan verilerini incelemek için kullanılan bir dizüstü bilgisayar tipik olarak 30–65W çeker.</li>
</ul>

<h3>Bal santrifüjü power station ile çalışır mı?</h3>

<p>Çalışır, ancak iki değere birlikte bakmak gerekir: sürekli güç ve kapasite. Güç kaynağının sürekli AC gücü, aynı anda çalışan cihazların toplam wattından yüksek olmalı. Motorlu cihazlar kalkışta kısa süreli ek güç ister; bu yüzden tepe gücün de yeterli olması önemlidir. IEETek güç kaynaklarının saf sinüs AC çıkışı (THD %1,5'in altında) motorlu cihazlar için de uygundur.</p>

<h2>Göçer Arılıkta Günlük Kaç Wh Gerekir?</h2>

<p>Aşağıdaki tablo iki farklı günü ayrı ayrı gösteriyor: arıların kontrol edildiği sıradan bir gün ve santrifüj ile sır alma bıçağının devreye girdiği hasat günü. Değerler örnek amaçlıdır; kendi cihazlarınızın wattını ve kullanım sürenizi yazarak aynı hesabı tekrarlayın.</p>

<table>
  <thead>
    <tr><th>Cihaz</th><th>Örnek güç</th><th>Günlük kullanım</th><th>Günlük enerji</th></tr>
  </thead>
  <tbody>
    <tr><td>LED aydınlatma</td><td>15W</td><td>4 saat</td><td>60Wh</td></tr>
    <tr><td>Telefon, GPS, telsiz</td><td>—</td><td>Birkaç şarj</td><td>40Wh</td></tr>
    <tr><td>Kovan izleme ağ geçidi / şarj ünitesi</td><td>5W</td><td>24 saat</td><td>120Wh</td></tr>
    <tr><td>Mini buzdolabı / soğutucu</td><td>Aralıklı</td><td>24 saat</td><td>350Wh</td></tr>
    <tr><td>Laptop</td><td>50W</td><td>2 saat</td><td>100Wh</td></tr>
    <tr><td><strong>Sıradan gün toplamı</strong></td><td></td><td></td><td><strong>670Wh</strong></td></tr>
    <tr><td>Bal santrifüjü</td><td>250W</td><td>2 saat</td><td>500Wh</td></tr>
    <tr><td>Elektrikli sır alma bıçağı</td><td>500W</td><td>1 saat (termostatlı)</td><td>500Wh</td></tr>
    <tr><td><strong>Hasat günü toplamı</strong></td><td></td><td></td><td><strong>1.670Wh</strong></td></tr>
  </tbody>
</table>

<p>Bataryanın etiket kapasitesinin tamamı kullanılamaz; invertör dönüşümü ve iç kayıplar nedeniyle hesaplarda yaklaşık 0,85 verim katsayısı kullanıyoruz. Bu katsayının nereden geldiğini <a href="/blog/gercek-kullanilabilir-kapasite-wh-verim-kayiplari">kullanılabilir kapasite yazımızda</a> ayrıntılı anlattık. Kendi cihaz listeniz için hızlı bir hesap yapmak isterseniz <a href="/guc-hesaplayici">güç hesaplayıcıyı</a> kullanabilirsiniz.</p>

<h3>Santrifüj tek başına kaç saat çalışır?</h3>

<p>Formül basittir: Çalışma süresi ≈ Kapasite (Wh) × 0,85 ÷ Ortalama güç (W). 250W'lık bir santrifüjü P1800 ile çalıştırdığınızda 1024Wh × 0,85 ÷ 250W ≈ 3,5 saat elde edersiniz. Aynı santrifüj P3200 ile 2048Wh × 0,85 ÷ 250W ≈ 7 saat çalışır. Santrifüj ve 500W'lık bıçak birlikte çalışırsa toplam 750W olur; P1800 bu yükü 1024 × 0,85 ÷ 750 ≈ 1,2 saat taşır.</p>

<h2>Arılığa Hangi Power Station ve Güneş Paneli Uygun?</h2>

<p>Seçimi belirleyen iki soru var: Hasatı sahada mı yapıyorsunuz ve aynı anda hangi cihazlar çalışacak? Aşağıdaki karşılaştırma bu iki soruya göre hazırlanmıştır.</p>

<table>
  <thead>
    <tr><th>Model</th><th>Kapasite / kullanılabilir</th><th>Sürekli / tepe AC</th><th>Arılık senaryosu</th></tr>
  </thead>
  <tbody>
    <tr><td>P800</td><td>512Wh / ≈435Wh</td><td>800W / 1600W</td><td>Aydınlatma, telefon, sensör; hasat ekipmanı için sınırlı</td></tr>
    <tr><td>P1800</td><td>1024Wh / ≈870Wh</td><td>1800W / 3600W</td><td>Sıradan arılık günü; kısa süreli santrifüj ve bıçak</td></tr>
    <tr><td>P3200</td><td>2048Wh / ≈1.741Wh</td><td>3200W / 6400W</td><td>Hasat günü dahil tüm tablo</td></tr>
  </tbody>
</table>

<p>P800'ün 800W sürekli gücü, 500W'lık bir bıçağı tek başına çalıştırabilir; ancak santrifüjle birlikte kullanımda sınıra yaklaşırsınız ve 435Wh'lik kullanılabilir kapasite hasat için kısa kalır. Daha güçlü bir bıçak kullanıyorsanız etiketteki watt değerinin güç kaynağının sürekli gücünün altında kaldığından emin olun.</p>

<h3>Sıradan günler için: Solar Operatör Paketi</h3>

<p><a href="/urun/solar-operator-paketi-p1800-sp200">Solar Operatör Paketi</a>, <a href="/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800">P1800</a> ve SP200'den oluşur. 870Wh kullanılabilir kapasite, tablodaki 670Wh'lik sıradan günü rahatça karşılar. SP200'ün günlük üretimi 200W × 5 tepe güneş saati × 0,75 ≈ 750Wh olduğu için güneşli günlerde batarya her gün yeniden dolabilir. P1800'ün uygulama desteği (Wi-Fi/Bluetooth) sayesinde kalan şarjı telefondan izlemek de mümkündür.</p>

<h3>Hasatı sahada yapanlar için: Solar Veteran Paketi</h3>

<p><a href="/urun/solar-veteran-paketi-p3200-sp400">Solar Veteran Paketi</a>, 2048Wh'lik <a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200</a> ile 400W'lık SP400'ü bir araya getirir. Yaklaşık 1.741Wh kullanılabilir kapasite, 1.670Wh'lik hasat gününü karşılar; 3200W sürekli güç de santrifüj ve bıçağın aynı anda çalışmasına geniş pay bırakır. SP400 günde yaklaşık 400W × 5 × 0,75 ≈ 1.500Wh üretir. P3200'ün tekerlekli ve teleskopik kollu gövdesi, 24,35 kg'lık ağırlığı arazide taşımayı kolaylaştırır.</p>

<p>Not: SP400, P1800'e uyumlu değildir; Voc değeri 52,8V ile P1800'ün 52V'luk üst sınırını aşar. P1800 için SP200 veya seri bağlı 2×SP100 kullanın. Panel seçeneklerinin tamamını <a href="/kategori/gunes-panelleri">güneş panelleri kategorisinde</a> görebilirsiniz.</p>

<h2>Güneşle Şarj Arılıkta Ne Kadar Sürer?</h2>

<p>Solar şarj süresini güneşli saat cinsinden şu formülle tahmin ediyoruz: Kapasite (Wh) ÷ (Panel W × 0,75). Gün sayısı içinse varsayım olarak günde 5 tepe güneş saati alıyoruz; bu değer yaz aylarında Türkiye'nin birçok bölgesi için makul bir ortalamadır, ilkbahar başında ve sonbaharda düşer.</p>

<ul>
  <li><strong>P1800 + SP200:</strong> 1024 ÷ (200 × 0,75) ≈ 6,8 güneşli saat, yani yaklaşık 1,4 gün.</li>
  <li><strong>P3200 + SP400:</strong> 2048 ÷ (400 × 0,75) ≈ 6,8 güneşli saat, yani yaklaşık 1,4 gün.</li>
  <li><strong>P800 + SP200:</strong> 512 ÷ (200 × 0,75) ≈ 3,4 güneşli saat; tek bir güneşli günde dolar.</li>
</ul>

<p>Arılık konumunuz için daha doğru bir tahmin isterseniz Avrupa Komisyonu'nun <a href="https://re.jrc.ec.europa.eu/pvg_tools/en/" target="_blank" rel="noopener noreferrer">PVGIS aracı</a> veya Enerji ve Tabii Kaynaklar Bakanlığı'nın <a href="https://gepa.enerji.gov.tr/MyCalculator/" target="_blank" rel="noopener noreferrer">GEPA (Güneş Enerjisi Potansiyel Atlası)</a> haritası ile aylık ışınım değerlerine bakabilirsiniz. Yayla ve dağ eteklerinde sabah sisi ile öğleden sonra bulutlanması üretimi azaltabilir; planı biraz temkinli yapmak iyi olur.</p>

<h2>Toz, Sıcak ve Arılar: Kurulumda Nelere Dikkat Edilmeli?</h2>

<p>Arılık, elektronik cihazlar için kolay bir ortam değildir. Yaz sıcağı, toz ve sürekli hareket halindeki arılar, kurulumu düşünerek yapmayı gerektirir. Güç kaynaklarının P serisi IP20 korumalıdır; yani suya ve yoğun toza karşı korumalı değildir.</p>

<ol>
  <li><strong>Güç kaynağını gölgede tutun.</strong> Doğrudan güneş altında kalan bir gövde ısınır ve performans düşebilir. Çadır, araç içi veya gölgelik altı, havalandırması olan kuru ve düz bir zemin tercih edin.</li>
  <li><strong>Havalandırma deliklerini açık bırakın.</strong> Cihazın etrafını örtmeyin; toz yoğunsa kullanım sonrası kapağı kapalı bir kutuda saklayın.</li>
  <li><strong>Kovan girişlerinden ve uçuş hattından uzak durun.</strong> Güç kaynağını, kabloları ve paneli arıların kovana giriş-çıkış yaptığı yönün dışına yerleştirin. Fan sesi ve titreşimin kovana yakın olmaması da çalışmanızı kolaylaştırır.</li>
  <li><strong>Paneli kovanları gölgelemeyecek şekilde konumlandırın.</strong> Paneli kovan dizisinin önüne değil, açık ve ayrı bir alana kurun; kabloyu yürüme yolunu kesmeyecek şekilde yönlendirin.</li>
  <li><strong>Panel yüzeyini düzenli silin.</strong> Toz ve polen birikimi üretimi azaltır. SP serisi IP67 korumalı ve ETFE yüzeylidir; yumuşak bir bez ve suyla temizlemek genellikle yeterlidir.</li>
</ol>

<p>Panel temizliğinin üretime etkisini ve doğru yöntemi <a href="/blog/gunes-paneli-temizligi-verim-artisi-nasil-temizlenir">panel temizliği rehberimizde</a> bulabilirsiniz.</p>

<h3>Kovanlar taşınırken güç kaynağı nasıl korunur?</h3>

<p>Göçte kamyon veya pikap kasasında yaşanan sarsıntı, sabitlenmemiş bir cihaz için en büyük risktir. Güç kaynağını araçta kayıp devrilmeyecek şekilde sabitleyin, mümkünse yumuşak bir zemin üzerinde dik konumda taşıyın ve üzerine yük koymayın. Panelleri katlı hâlde, ayakları kapalı olarak bir kılıf veya kutu içinde taşıyın. Yolda şarj gerekiyorsa P800, P1800 ve P3200 araç çakmaklığından yaklaşık 120W'a kadar şarj olabilir; bu, uzun bir göç yolculuğunda bataryayı kısmen doldurmaya yardımcı olur.</p>

<h2>Göçer Arıcının Enerji Planı: Sezon Başında Yapılacaklar</h2>

<p>Sezon başlamadan önce ekipman listenizi çıkarın ve her cihazın wattını not edin. Hasatı sahada mı, yoksa bal evinde şebeke elektriğiyle mi yapacağınızı belirleyin; bu karar, P1800 ile P3200 arasındaki seçimi büyük ölçüde netleştirir. Ardından ilk konaklama noktasında birkaç günlük gerçek tüketimi uygulama üzerinden izleyin ve planınızı buna göre düzeltin.</p>

<p>LiFePO4 bataryanın 4000'in üzerindeki döngü ömrü, her gün şarj edilip boşaltılan bir arılık düzeninde bile uzun yıllar kullanım sağlar. Kış döneminde cihazı nasıl saklamanız gerektiğini <a href="/blog/tasinabilir-guc-kaynagi-bakim-ve-depolama-rehberi">bakım ve depolama rehberimizde</a> anlattık. Hazır eşleştirilmiş panel ve güç kaynağı kombinasyonlarını <a href="/kategori/bundle-paket-urunler">solar paketler</a> sayfasında karşılaştırabilirsiniz.</p>

<h2>Sık Sorulan Sorular</h2>

<h3>Arılık için kaç watt güneş paneli gerekir?</h3>
<p>Hasat yapılmayan günlerde 600–700Wh tüketim için 200W'lık bir panel genellikle yeterlidir; 5 tepe güneş saatinde yaklaşık 750Wh üretir. Sahada hasat yapıyorsanız 400W panel ve 2048Wh batarya daha uygundur.</p>

<h3>Elektrikli sır alma bıçağı power station ile çalışır mı?</h3>
<p>Bıçağın etiketindeki watt değeri güç kaynağının sürekli AC gücünün altındaysa çalışır. Tipik 400–1.000W'lık bıçaklar P1800 ve P3200 ile rahatça kullanılabilir.</p>

<h3>P800 bal santrifüjünü çalıştırır mı?</h3>
<p>150–400W'lık küçük bir santrifüjü 800W sürekli gücüyle çalıştırabilir; ancak 512Wh kapasite, 250W'lık bir santrifüj için yaklaşık 1,7 saat (512 × 0,85 ÷ 250) kullanım demektir. Hasat için P1800 veya P3200 daha uygundur.</p>

<h3>Kovan terazisi ve sensörler güç kaynağından beslenebilir mi?</h3>
<p>Birçok sensör kendi bataryasıyla çalışır; ağ geçidi, modem veya şarj ünitesi USB ya da AC çıkıştan beslenebilir. Cihaz üreticisinin önerdiği adaptör ve voltajı kullanın.</p>

<h3>Güç kaynağını kovanların yanına koymak sorun olur mu?</h3>
<p>Kovan girişlerinden ve uçuş hattından uzak, gölgeli ve havalandırmalı bir yerde tutmanızı öneririz. Bu hem cihazı ısınmaya karşı korur hem de arılık içindeki çalışmanızı kolaylaştırır.</p>

<h3>Göç sırasında güç kaynağını şarj edebilir miyim?</h3>
<p>P800, P1800 ve P3200 araç çakmaklığından yaklaşık 120W'a kadar şarj olabilir. Cihazı yolculuk boyunca sabitlenmiş ve dik konumda tutun.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // 9 — BUNGALOV / GLAMPING TESİSİ İÇİN SOLAR ENERJİ
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "bungalov-glamping-tesisi-icin-solar-enerji",
    title: "Bungalov ve Glamping Tesisi İçin Güneş Enerjisi: Ünite Başına Kaç Wh, Hangi Sistem?",
    excerpt:
      "Küçük bungalov, glamping ve kamp işletmeleri için ünite başına enerji hesabı, bataryayla beslenmemesi gereken cihazlar, ünite başına power station ile merkezi SH4000 yaklaşımının karşılaştırması ve 4 bungalovluk örnek hesap.",
    category: "Enerji",
    tags: [
      "bungalov güneş enerjisi",
      "glamping enerji",
      "kamp işletmesi",
      "off-grid tesis",
      "sh4000",
      "solar paket",
    ],
    metaTitle: "Bungalov ve Glamping İçin Güneş Enerjisi Rehberi 2026",
    metaDescription:
      "Bungalov ve glamping tesisinde güneş enerjisi: ünite başına Wh hesabı, P800/P1800 mi merkezi SH4000 mü, panel boyutlandırma ve misafir güvenliği önerileri.",
    metaKeywords: [
      "bungalov güneş enerjisi",
      "glamping elektrik çözümü",
      "bungalov solar sistem",
      "kamp alanı güneş paneli",
      "off-grid bungalov enerji",
      "glamping power station",
    ],
    content: `<p>Doğanın içinde birkaç bungalov, çadır ya da glamping ünitesi işletiyorsanız elektrik konusu genellikle ilk gün değil, ilk sezonda gerçek bir soruna dönüşür. Şebeke hattı uzaktadır veya yetersizdir; jeneratör ise misafirlerin aradığı sessizliği bozar. Güneş enerjisi ve batarya depolaması bu noktada mantıklı bir seçenek olarak öne çıkar, ama doğru boyutlandırılmadığında akşamüstü biten bir sistemle karşılaşabilirsiniz.</p>

<p>Bu yazıda ünite başına tipik yükleri, bataryayla beslenmemesi gereken cihazları, her üniteye ayrı power station koymak ile merkezi bir sistem kurmak arasındaki farkı ve 4 bungalovluk bir tesis için örnek hesabı adım adım ele alıyoruz.</p>

<blockquote><p><strong>Kısa cevap:</strong> LED aydınlatma, telefon şarjı, vantilatör ve mini buzdolabı olan bir bungalov günde tipik olarak 700–800Wh tüketir; bu yük için ünite başına 1024Wh'lik P1800 yeterlidir. 4 bungalov ve ortak alan için örnek ihtiyaç yaklaşık 3.500Wh/gündür ve 5120Wh'lik SH4000 bunu yaklaşık 4.350Wh kullanılabilir kapasiteyle merkezi olarak karşılayabilir. Elektrikli ısıtıcı, kettle ve uzun süreli klima kullanımı batarya sistemine dahil edilmemelidir.</p></blockquote>

<h2>Bir Bungalov Günde Kaç Wh Elektrik Tüketir?</h2>

<p>Glamping ünitelerindeki temel yükler büyük ölçüde benzerdir. Aşağıdaki değerler tipik aralıklardır; kullandığınız cihazların etiketini kontrol edin ve mümkünse bir prizli wattmetreyle gerçek tüketimi ölçün.</p>

<ul>
  <li><strong>LED aydınlatma:</strong> Lamba başına genellikle 5–10W. İç mekân ve veranda için 4 lamba yaygındır.</li>
  <li><strong>Telefon şarjı:</strong> Cihaz başına tipik olarak 10–20W; iki misafir için günlük toplam çoğunlukla 20–40Wh.</li>
  <li><strong>Vantilatör:</strong> Masa ve ayaklı vantilatörler tipik olarak 30–60W çeker.</li>
  <li><strong>Mini buzdolabı:</strong> Kompresörlü küçük modellerde günlük tüketim genellikle 250–500Wh aralığındadır; termoelektrik minibarlar daha fazla tüketebilir.</li>
  <li><strong>Modem / Wi-Fi:</strong> Tipik olarak 8–15W ve 24 saat açık. Genellikle her ünitede değil, tesiste merkezi olarak bulunur.</li>
</ul>

<h3>Örnek ünite hesabı</h3>

<p>4 adet 8W LED lamba 5 saat (160Wh), iki telefon şarjı (30Wh), 40W vantilatör 6 saat (240Wh) ve mini buzdolabı (350Wh) toplandığında bir bungalovun günlük ihtiyacı yaklaşık 780Wh olur. Buzdolabı olmayan ve vantilatörü 4 saat çalışan bir çadır ünitesinde bu rakam yaklaşık 350Wh'e düşer.</p>

<h2>Batarya Sistemine Hangi Cihazlar Bağlanmamalı?</h2>

<p>Off-grid bir tesiste sistemin boyutunu en çok belirleyen şey, neyi bağladığınız değil, neyi bağlamadığınızdır. Isı üreten cihazlar kısa sürede yüksek enerji tüketir ve bataryayı hızla boşaltır.</p>

<ul>
  <li><strong>Elektrikli ısıtıcılar:</strong> Tipik olarak 1.000–2.000W çeker. 1.500W'lık bir ısıtıcı 2 saatte 3.000Wh tüketir; bu, 4 bungalovun bir günlük toplam ihtiyacına yakındır. Serin geceler için kaliteli battaniye, yalıtım ve uygun koşullarda güvenli alternatif ısınma yöntemlerini değerlendirin.</li>
  <li><strong>Uzun süreli klima kullanımı:</strong> Klimanın çalışma süresi ve gücü, batarya kapasitesini birkaç saatte tüketebilir. Gölgelendirme, çapraz havalandırma ve vantilatör çoğu zaman daha sürdürülebilir bir çözümdür. Ayrıntılar için <a href="/blog/power-station-ile-klima-calisir-mi">klima yazımıza</a> bakabilirsiniz.</li>
  <li><strong>Her ünitede kettle:</strong> Kettle'lar tipik olarak 1.500–2.200W çeker. Kısa süreli olsa da her ünitede aynı anda kullanılması tepe yük ve toplam tüketim yaratır. Sıcak su ve çay için ortak mutfakta tüpgazlı ocak veya merkezi bir çay noktası daha pratiktir.</li>
  <li><strong>Saç kurutma makinesi ve ütü:</strong> Benzer şekilde yüksek watt çeker; misafirlere ortak alanda, kontrollü kullanım sunmak daha uygundur.</li>
</ul>

<h2>Ünite Başına Power Station mı, Merkezi SH4000 mü?</h2>

<p>İki temel yaklaşım vardır. Birincisinde her bungalova kendi güç kaynağı ve paneli konur; ikincisinde tek bir merkezi depolama sistemi tüm tesisi besler. Doğru seçim tesisin büyüklüğüne, ünitelerin dağınıklığına ve kurulum bütçesine bağlıdır.</p>

<table>
  <thead>
    <tr><th>Kriter</th><th>Ünite başına P800 / P1800</th><th>Merkezi SH4000</th></tr>
  </thead>
  <tbody>
    <tr><td>Kurulum</td><td>Tesisat gerektirmez, fişe takılır</td><td>Ünitelere dağıtım hattı ve pano gerekir; yetkili elektrikçi işidir</td></tr>
    <tr><td>Arıza etkisi</td><td>Yalnızca ilgili ünite etkilenir</td><td>Sistem durursa tüm tesis etkilenir</td></tr>
    <tr><td>Esneklik</td><td>Cihazlar sezon dışında başka işlerde kullanılabilir</td><td>Sabit konumlu, tesise hizmet eder</td></tr>
    <tr><td>Kapasite paylaşımı</td><td>Boş ünitenin enerjisi diğerine aktarılamaz</td><td>Tüm kapasite ihtiyaca göre paylaşılır</td></tr>
    <tr><td>Genişleme</td><td>Yeni ünite için yeni cihaz</td><td>B5120 modüllerle yaklaşık 20 kWh'a kadar</td></tr>
    <tr><td>Koruma ve ses</td><td>IP20; P800 60 dB altı, P1800 65 dB altı</td><td>IP54; 40 dB altı</td></tr>
  </tbody>
</table>

<h3>Ünite başına yaklaşım kimler için uygun?</h3>

<p>Az sayıda ve birbirinden uzak ünite işletiyorsanız ünite başına sistem pratiktir. 780Wh'lik bir bungalov için <a href="/urun/solar-operator-paketi-p1800-sp200">Solar Operatör Paketi</a> (P1800 + SP200) 1024Wh × 0,85 ≈ 870Wh kullanılabilir kapasite sunar. SP200 güneşli bir günde 200W × 5 × 0,75 ≈ 750Wh üretir; yani denge yakındır ve bulutlu günlerde misafirlere tasarruflu kullanım önerisi yapmak gerekebilir. Buzdolabı olmayan çadır üniteleri için <a href="/urun/512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800">P800</a> yeterli olabilir: 512Wh × 0,85 ≈ 435Wh, 350Wh'lik ihtiyacı karşılar.</p>

<h3>Merkezi yaklaşım kimler için uygun?</h3>

<p>Üniteleri birbirine yakın, dört ve üzeri bungalovlu tesislerde merkezi sistem kapasiteyi daha verimli kullanır. <a href="/sh4000">SH4000</a>, entegre hibrit invertörüyle hem şebekeye bağlı hem off-grid çalışabilir, ATS uyumludur ve IP54 koruma sınıfına sahiptir. Ancak bu sistemin ünitelere dağıtımı; kablo kesiti, kaçak akım koruması, topraklama ve pano tasarımı gerektirir. Bu işlerin mutlaka yetkili bir elektrikçi tarafından planlanıp yapılması gerekir. Hibrit invertör ve ATS'nin mantığını <a href="/blog/hibrit-invertor-ats-nedir-ev-panosu-baglanti">hibrit invertör yazımızda</a> anlattık.</p>

<h2>4 Bungalovluk Tesis İçin Örnek Hesap</h2>

<p>Aşağıdaki tablo, her biri 780Wh tüketen dört bungalov ile merkezi modem ve ortak alan aydınlatmasını içeren bir tesisi gösteriyor. Kendi tesisinizin değerleriyle aynı hesabı <a href="/guc-hesaplayici">güç hesaplayıcı</a> ile tekrarlayabilirsiniz.</p>

<table>
  <thead>
    <tr><th>Kalem</th><th>Hesap</th><th>Günlük enerji</th></tr>
  </thead>
  <tbody>
    <tr><td>Bungalov (4 ünite)</td><td>4 × 780Wh</td><td>3.120Wh</td></tr>
    <tr><td>Modem / Wi-Fi (merkezi)</td><td>10W × 24 saat</td><td>240Wh</td></tr>
    <tr><td>Ortak alan LED aydınlatma</td><td>20W × 6 saat</td><td>120Wh</td></tr>
    <tr><td><strong>Toplam günlük ihtiyaç</strong></td><td></td><td><strong>3.480Wh</strong></td></tr>
    <tr><td>SH4000 kullanılabilir kapasite</td><td>5120Wh × 0,85</td><td>≈ 4.352Wh</td></tr>
    <tr><td>SH4000 + B5120 kullanılabilir kapasite</td><td>10240Wh × 0,85</td><td>≈ 8.704Wh</td></tr>
  </tbody>
</table>

<p>Tek SH4000, 3.480Wh'lik günü yaklaşık 870Wh pay ile karşılar. Güneşsiz bir günü de depodan karşılamak istiyorsanız bir B5120 modülü eklemek, kullanılabilir kapasiteyi yaklaşık 8.700Wh'e çıkararak tesise yaklaşık iki günlük özerklik sağlar.</p>

<h2>Tesis İçin Kaç Watt Güneş Paneli Gerekir?</h2>

<p>Panel günlük üretimini Panel W × tepe güneş saati × 0,75 formülüyle hesaplıyoruz. Buradaki 0,75, açı, sıcaklık, kablo ve dönüşüm kayıplarını temsil eder. Varsayım olarak günde 5 tepe güneş saati alıyoruz; bu değer Türkiye'nin birçok bölgesinde yaz sezonuna yakındır, ilkbahar ve sonbaharda düşer.</p>

<ol>
  <li><strong>Gerekli panel gücünü bulun:</strong> 3.480Wh ÷ (5 × 0,75) ≈ 928W.</li>
  <li><strong>Mevcut paketi değerlendirin:</strong> <a href="/urun/solar-titan-paket-sh4000-5120wh-hibrit-ess-800w-solar">Solar Titan Paket</a> HV girişine seri bağlı 2×SP400 ile 800W sunar: 800 × 5 × 0,75 ≈ 3.000Wh/gün.</li>
  <li><strong>Açığı kapatın:</strong> 480Wh'lik fark için SH4000'in LV girişine (12–50V, 600W) bir SP200 eklenebilir: 200 × 5 × 0,75 ≈ 750Wh. Toplam üretim yaklaşık 3.750Wh/gün olur.</li>
  <li><strong>Bölgesel veriyi kontrol edin:</strong> Tesisinizin konumu için <a href="https://gepa.enerji.gov.tr/MyCalculator/" target="_blank" rel="noopener noreferrer">GEPA (Güneş Enerjisi Potansiyel Atlası)</a> veya <a href="https://re.jrc.ec.europa.eu/pvg_tools/en/" target="_blank" rel="noopener noreferrer">PVGIS</a> ile aylık ışınım değerlerine bakın ve sezonun en zayıf ayına göre plan yapın.</li>
</ol>

<p>HV girişine daha uzun seri diziler eklemek mümkündür, ancak soğuk havada yükselen Voc dahil 450V sınırının aşılmaması gerekir. Bu tür genişletmeleri yetkili bir elektrikçi ve destek ekibimizle birlikte planlayın.</p>

<h2>Misafir Güvenliği İçin Nelere Dikkat Edilmeli?</h2>

<p>Glamping tesisinde sistemi kullanan kişi siz değil, cihazı ilk kez gören misafirlerdir. Bu yüzden kurulumun kendiliğinden güvenli olması gerekir.</p>

<ul>
  <li><strong>Yerleşim:</strong> Güç kaynaklarını kuru, düz, havalandırmalı ve doğrudan güneş almayan bir yere koyun. P serisi IP20 korumalıdır; yağmur ve nemden uzak tutulmalıdır.</li>
  <li><strong>Kablolar:</strong> Yürüme yollarından geçen kabloları sabitleyin veya kablo kanalıyla koruyun; takılma riskini ortadan kaldırın.</li>
  <li><strong>Havalandırma:</strong> Power station egzoz üretmez ve kapalı alanda kullanılabilir, ancak havalandırma deliklerinin önü açık kalmalıdır.</li>
  <li><strong>Bilgilendirme:</strong> Ünitede hangi cihazların kullanılabileceğini ve ısıtıcı, kettle gibi yüksek güçlü cihazların neden bağlanmaması gerektiğini kısa bir notla açıklayın.</li>
  <li><strong>Paneller:</strong> Panelleri çocukların oynadığı alanlardan uzak, rüzgâra karşı sabitlenmiş şekilde kurun.</li>
</ul>

<h3>Jeneratöre göre sessizlik ne kadar fark eder?</h3>

<p>Glamping deneyiminin önemli bir kısmı sessizliktir. Power station'larda motor ve egzoz yoktur; duyulan tek ses yük altında çalışan fandır. SH4000 40 dB'in altındaki ses seviyesiyle oldukça sessiz çalışır. Bu fark, özellikle gece saatlerinde misafir memnuniyetini doğrudan etkiler. Konuyu <a href="/blog/sessiz-jenerator-alternatifi-power-station">sessiz jeneratör alternatifi yazımızda</a> daha ayrıntılı ele aldık.</p>

<h2>Glamping İşletmeniz İçin Enerji Planını Sezon Öncesi Kurun</h2>

<p>Sezon açılmadan önce bir üniteyi birkaç gün gerçek koşullarda deneyin ve uygulama üzerinden tüketimi izleyin. Bu deneme, tablodaki varsayımları kendi tesisinizin verisiyle değiştirmenizi sağlar. Yerel mevzuat, imar durumu ve işletme izinleri ayrıca değerlendirilmelidir; şebeke bağlantısı söz konusuysa dağıtım şirketinize danışın.</p>

<p>Benzer planlama mantığını geçici kurulumlar için <a href="/blog/festival-acik-hava-etkinlikleri-enerji-planlamasi">festival enerji planlaması</a>, sabit ve küçük ölçekli yapılar için <a href="/blog/yazlik-bag-evi-solar-enerji-sistemi-kurulumu">yazlık ve bağ evi solar rehberimizde</a> bulabilirsiniz. Tüm modelleri karşılaştırmak için <a href="/kategori/tasinabilir-guc-kaynaklari">taşınabilir güç kaynakları</a> sayfasına göz atabilirsiniz.</p>

<h2>Sık Sorulan Sorular</h2>

<h3>Bir bungalov için kaç Wh batarya gerekir?</h3>
<p>LED aydınlatma, telefon şarjı, vantilatör ve mini buzdolabı olan bir bungalov günde tipik olarak 700–800Wh tüketir. Bu yük için 1024Wh'lik P1800 (yaklaşık 870Wh kullanılabilir) uygun bir başlangıçtır.</p>

<h3>Glamping çadırında elektrikli ısıtıcı power station ile çalışır mı?</h3>
<p>Teknik olarak sürekli gücü yeterli bir modelde çalışabilir, ancak 1.500W'lık bir ısıtıcı 2 saatte 3.000Wh tüketir. Bu nedenle batarya sistemine dahil edilmemesini öneririz.</p>

<h3>Merkezi SH4000 sistemini kendim kurabilir miyim?</h3>
<p>Ünitelere dağıtım hattı, pano ve koruma elemanları gerektirdiği için kurulum yetkili bir elektrikçi tarafından yapılmalıdır. Cihazın kendisi tekerlekli ve tek gövdelidir, ancak tesisat ayrı bir iştir.</p>

<h3>4 bungalov için kaç watt güneş paneli gerekir?</h3>
<p>Günde yaklaşık 3.480Wh tüketen bir tesis için 3.480 ÷ (5 × 0,75) ≈ 928W panel gerekir. Solar Titan Paket'in 800W'ına LV girişten bir SP200 eklemek bu ihtiyacı karşılar.</p>

<h3>Bulutlu günlerde sistem yeter mi?</h3>
<p>Üretim kapalı havada belirgin biçimde düşer. Bir B5120 modülü eklemek kullanılabilir kapasiteyi yaklaşık 8.700Wh'e çıkararak yaklaşık iki günlük özerklik sağlar.</p>

<h3>Bungalov tesisi için güneş enerjisinde izin gerekir mi?</h3>
<p>Şebekeye bağlanmayan taşınabilir sistemler için genellikle ayrı başvuru gerekmez; ancak işletme, imar ve şebeke bağlantısı konuları yerel mevzuata göre ayrıca değerlendirilmelidir.</p>`,
  },
];
