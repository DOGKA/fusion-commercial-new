import type { BlogInput } from "./tip";

export const yazilar: BlogInput[] = [
  // ══════════════════════════════════════════════════════════════════
  // 15 — ELEKTRİKLİ SCOOTER VE BİSİKLET POWER STATION İLE ŞARJ
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "elektrikli-scooter-bisiklet-power-station-ile-sarj",
    title: "Elektrikli Scooter ve Bisiklet Power Station ile Şarj Edilir mi? Kaç Kez Dolar?",
    excerpt:
      "Elektrikli scooter veya e-bisiklet bataryanızı power station ile kaç kez doldurabilirsiniz? Wh hesabı, şarj cihazı tüketimi, dönüşüm kayıpları ve güneş paneliyle günlük şarj örneğiyle anlatıyoruz.",
    category: "Rehber",
    tags: [
      "elektrikli scooter şarj",
      "e-bisiklet şarj",
      "power station",
      "scooter batarya wh",
      "taşınabilir güç kaynağı",
      "güneş paneli ile şarj",
    ],
    metaTitle: "Elektrikli Scooter Power Station ile Şarj Rehberi 2026",
    metaDescription:
      "Elektrikli scooter ve e-bisiklet power station ile kaç kez şarj olur? 360Wh, 500Wh ve 672Wh bataryalar için hesap tablosu, kayıplar ve solar şarj örneği.",
    metaKeywords: [
      "elektrikli scooter power station ile şarj",
      "elektrikli bisiklet güç kaynağı ile şarj",
      "scooter şarj aleti kaç watt",
      "scooter bataryası kaç wh",
      "power station scooter kaç kez şarj eder",
      "güneş paneli ile elektrikli scooter şarjı",
    ],
    content: `<p>Elektrikli scooter ve e-bisiklet artık yalnızca şehir içi ulaşım aracı değil; kampa, yazlığa, bağ evine ya da prize erişimin zor olduğu bir otoparka da gidiyor. Bu noktada akla gelen soru basit: Prizin olmadığı yerde bataryayı bir power station ile doldurabilir miyim, doldurursam kaç kez?</p>

<p>Cevap evet, ama “kaç kez” sorusunun yanıtı etiketteki Wh değerini bataryanın Wh değerine bölmekten biraz daha karmaşık. Bu rehberde batarya kapasitesinin nasıl hesaplandığını, şarj cihazının prizden ne kadar çektiğini, aradaki kayıpları ve model bazında gerçekçi şarj sayılarını adım adım gösteriyoruz.</p>

<blockquote><p><strong>Kısa cevap:</strong> Elektrikli scooter ve e-bisikletler, kendi orijinal şarj cihazları power station'ın AC prizine takılarak sorunsuz şarj edilebilir; şarj cihazları genellikle yalnızca 90–110W çeker. İnvertör ve şarj cihazı kayıpları nedeniyle istasyon kapasitesinin yaklaşık %75'i bataryaya ulaşır: 1024Wh'lik bir model 360Wh'lik bir scooter bataryasını yaklaşık 2 kez, 2048Wh'lik bir model yaklaşık 4 kez doldurur.</p></blockquote>

<h2>Scooter Bataryası Kaç Wh? Volt ve Amper Saatten Nasıl Hesaplanır?</h2>

<p>Scooter ve e-bisiklet üreticileri batarya kapasitesini çoğu zaman Wh yerine volt (V) ve amper saat (Ah) olarak yazar. Enerji miktarını, yani Wh değerini bulmak için bu iki değeri çarpmanız yeterlidir: <strong>Wh = V × Ah</strong>.</p>

<ul>
<li><strong>36V 10Ah</strong> batarya: 36 × 10 = <strong>360Wh</strong>. Pek çok şehir içi scooter ve giriş seviyesi e-bisiklet bu sınıftadır.</li>
<li><strong>36V 14Ah</strong> veya <strong>48V 10,4Ah</strong> batarya: yaklaşık <strong>500Wh</strong>. Orta sınıf e-bisikletlerde sık görülür.</li>
<li><strong>48V 14Ah</strong> batarya: 48 × 14 = <strong>672Wh</strong>. Uzun menzilli scooter ve e-bisikletlerde kullanılır.</li>
</ul>

<p>Bataryanızın değerleri genellikle batarya gövdesindeki etikette, kullanım kılavuzunda veya üreticinin teknik sayfasında yazar. Birimlerin mantığını daha ayrıntılı görmek isterseniz <a href="/blog/watt-volt-amper-wh-enerji-birimleri-rehberi">Watt, Volt, Amper ve Wh rehberimize</a> göz atabilirsiniz.</p>

<h2>Scooter Şarj Aleti Kaç Watt Çeker?</h2>

<p>Scooter şarj cihazı, prizden aldığı 230V alternatif akımı bataryanın ihtiyaç duyduğu doğru akıma çeviren küçük bir adaptördür. 36V'luk bir batarya için tipik şarj cihazının çıkışı 42V 2A civarındadır; bu da çıkış tarafında yaklaşık 42 × 2 = <strong>84W</strong> eder.</p>

<p>Adaptörün kendisi de ısı olarak bir miktar enerji kaybeder. Bu yüzden prizden çektiği güç çıkış gücünden biraz fazladır ve bu sınıftaki şarj cihazlarında tipik olarak <strong>90–110W</strong> aralığındadır. Hızlı şarj cihazları ve 48V sistemler daha fazla çekebilir. Kesin değer için şarj cihazının üzerindeki etiketi kontrol edin; “Input” satırında giriş, “Output” satırında çıkış değerleri yazar.</p>

<p>Bu rakamlar power station açısından son derece hafif bir yüktür. En küçük modelimiz P800'ün bile sürekli AC çıkışı 800W'tır; yani şarj cihazı, istasyonun gücünü zorlamaz. Belirleyici olan güç değil, kapasitedir.</p>

<h2>Power Station ile Scooter Şarj Ederken Ne Kadar Enerji Kaybolur?</h2>

<p>Power station'dan scooter bataryasına giden yolda enerji iki kez dönüştürülür. Önce istasyonun invertörü bataryadaki doğru akımı 230V alternatif akıma çevirir; sonra scooter'ın şarj cihazı bu alternatif akımı tekrar doğru akıma çevirir. Her dönüşümde bir miktar enerji ısıya gider.</p>

<p>Genel çalışma süresi hesaplarımızda istasyon tarafındaki kayıplar için 0,85 katsayısını kullanıyoruz. Örneğin P800'ün 512Wh kapasitesinden prize yaklaşık 512 × 0,85 ≈ 435Wh ulaşır. Şarj cihazının verimini de yaklaşık %88 kabul edersek bataryaya 435 × 0,88 ≈ 383Wh kalır. Bu yüzden bu yazıdaki hesaplarda toplam verim için <strong>yaklaşık 0,75</strong> katsayısını kullanıyoruz. Bu değer bir varsayımdır; şarj cihazının kalitesi, ortam sıcaklığı ve bataryanın doluluk durumu sonucu birkaç puan değiştirebilir.</p>

<p>Etikette yazan kapasiteyle kullanılabilir enerji arasındaki farkın nedenlerini merak ediyorsanız <a href="/blog/gercek-kullanilabilir-kapasite-wh-verim-kayiplari">gerçek kullanılabilir kapasite ve verim kayıpları yazımız</a> konuyu ayrıntılı anlatıyor.</p>

<h2>Hangi Power Station Scooter'ı Kaç Kez Şarj Eder?</h2>

<p>Aşağıdaki tablo, sıfırdan tam doluma kadar kaç şarj alabileceğinizi yaklaşık olarak gösterir. Hesap şu şekilde yapılmıştır: <strong>istasyon kapasitesi × 0,75 ÷ scooter bataryası Wh</strong>. Örneğin P1800 için 1024 × 0,75 = 768Wh; 768 ÷ 360 ≈ 2,1 tam şarj.</p>

<table>
<thead>
<tr><th>Model (kapasite)</th><th>Bataryaya ulaşan enerji (≈ ×0,75)</th><th>360Wh paket</th><th>500Wh paket</th><th>672Wh paket</th></tr>
</thead>
<tbody>
<tr><td>P800 (512Wh)</td><td>≈ 384Wh</td><td>≈ 1,1 şarj</td><td>≈ 0,8 şarj</td><td>≈ 0,6 şarj</td></tr>
<tr><td>P1800 (1024Wh)</td><td>≈ 768Wh</td><td>≈ 2,1 şarj</td><td>≈ 1,5 şarj</td><td>≈ 1,1 şarj</td></tr>
<tr><td>Singo2000PRO (1920Wh)</td><td>≈ 1440Wh</td><td>≈ 4,0 şarj</td><td>≈ 2,9 şarj</td><td>≈ 2,1 şarj</td></tr>
<tr><td>P3200 (2048Wh)</td><td>≈ 1536Wh</td><td>≈ 4,3 şarj</td><td>≈ 3,1 şarj</td><td>≈ 2,3 şarj</td></tr>
</tbody>
</table>

<p>Pratikte bataryanızı nadiren tamamen boşaltırsınız. Scooter %30'dayken şarja takarsanız yalnızca %70'lik kısmı doldurursunuz; bu durumda tablodaki şarj sayısı orantılı olarak artar. Kendi senaryonuzu hızlıca denemek için <a href="/guc-hesaplayici">güç hesaplayıcımızı</a> kullanabilirsiniz.</p>

<h2>Power Station ile Scooter Şarjı Daha mı Uzun Sürer?</h2>

<p>Hayır. Şarj süresini belirleyen, scooter'ın şarj cihazıdır. Power station'ın AC çıkışı şarj cihazının ihtiyacından çok daha yüksek olduğu için cihaz evdeki prizde nasıl çalışıyorsa istasyonda da aynı hızda çalışır.</p>

<p>Kaba bir hesapla 360Wh'lik bir batarya, 84W çıkışlı bir şarj cihazıyla 360 ÷ 84 ≈ 4,3 saatte büyük ölçüde dolar. Son yüzdelerde şarj akımı düştüğü için toplam süre genellikle 5–6 saati bulabilir. Bu süre boyunca 100W civarında çeken şarj cihazı, P800'ü yaklaşık 512 × 0,85 ÷ 100 ≈ 4,4 saatte tüketir. Yani P800 küçük bir bataryayı bir kez doldurabilir, ama tam dolumun sonuna yetişmeyebilir.</p>

<h2>Güneş Paneliyle Her Gün Scooter Şarj Etmek Mümkün mü?</h2>

<p>Kampta veya prizin olmadığı bir arazide güneş paneli, power station'ı her gün yeniden doldurmanın en pratik yoludur. Hesap iki adımlıdır: önce panelin istasyona ne kadar enerji verdiğini, sonra bunun ne kadarının scooter'a ulaştığını buluruz.</p>

<ol>
<li><strong>Panel üretimi:</strong> SP200 (200W) paneli, günde 4,5 tepe güneş saati varsayımıyla yaklaşık 200 × 4,5 × 0,75 ≈ 675Wh enerji üretir.</li>
<li><strong>Scooter'a ulaşan enerji:</strong> Bu enerjinin yaklaşık 675 × 0,75 ≈ 506Wh'i şarj cihazı üzerinden bataryaya ulaşır.</li>
<li><strong>Sonuç:</strong> 506 ÷ 360 ≈ 1,4. Yani güneşli bir günde 360Wh'lik bir scooter'ı bir kez tam doldurup bir sonraki şarj için pay bırakabilirsiniz.</li>
</ol>

<p>4,5 tepe güneş saati yaz aylarında Türkiye'nin pek çok bölgesi için makul bir varsayımdır; kışın ve bulutlu havada bu değer belirgin şekilde düşer. Bulunduğunuz yerin güneş potansiyelini <a href="https://re.jrc.ec.europa.eu/pvg_tools/en/" target="_blank" rel="noopener noreferrer">PVGIS</a> aracıyla kontrol edebilirsiniz. Panel ile istasyonu birlikte almak isterseniz P800 ve SP200'den oluşan <a href="/urun/solar-usta-paketi-p800-sp200">Solar Usta Paketi</a> bu senaryo için dengeli bir başlangıçtır.</p>

<h2>Scooter Şarj Ederken Nelere Dikkat Etmelisiniz?</h2>

<p>Power station güvenli bir enerji kaynağıdır, ancak şarj edilen batarya scooter'ın kendi lityum bataryasıdır. Bu yüzden evde uyguladığınız genel kurallar burada da geçerlidir:</p>

<ul>
<li><strong>Orijinal şarj cihazını kullanın.</strong> Bataryanın voltajına ve kimyasına uygun olmayan bir adaptör, bataryaya ve BMS'ine zarar verebilir.</li>
<li><strong>Sürüşten hemen sonra şarj etmeyin.</strong> Uzun veya yokuşlu bir sürüşten sonra batarya ısınmış olabilir; şarja takmadan önce oda sıcaklığına yaklaşmasını bekleyin.</li>
<li><strong>Havalandırmalı bir yer seçin.</strong> Hem power station'ı hem şarj cihazını kuru, düz ve hava alan bir zemine koyun; üzerlerini örtmeyin.</li>
<li><strong>Gece boyunca gözetimsiz bırakmayın.</strong> Bu, power station olsun ya da olmasın, tüm lityum batarya şarjları için geçerli genel bir önlemdir.</li>
<li><strong>Hasarlı bataryayı şarj etmeyin.</strong> Şişme, çatlak, koku veya aşırı ısınma fark ederseniz şarjı durdurun ve üreticiye danışın.</li>
</ul>

<p>Power station, egzoz gazı üretmediği için kapalı alanda kullanılabilir; bu da apartman otoparkında veya kamp çadırının önünde şarjı pratik hale getirir.</p>

<h2>Elektrikli Motosiklet Gibi Büyük Bataryalar Şarj Edilebilir mi?</h2>

<p>Elektrikli motosiklet ve yük taşıyan e-bisikletlerde batarya kapasitesi çoğu zaman 1.500–3.000Wh aralığına çıkar. Örneğin 72V 30Ah bir batarya 72 × 30 = 2160Wh eder. P3200'ün bataryaya ulaşan yaklaşık 1536Wh'lik enerjisi bu bataryanın yaklaşık 1536 ÷ 2160 ≈ %71'ini doldurabilir.</p>

<p>Bu sınıftaki şarj cihazları genellikle birkaç yüz watt çeker; etiketteki giriş gücünün istasyonun sürekli AC çıkışının altında kaldığını mutlaka kontrol edin. Büyük bataryalarda power station tam şarjdan çok, yolda menzil takviyesi için mantıklıdır.</p>

<h2>Hangi Model Kime Uygun?</h2>

<ul>
<li><strong>Tek scooter, ara sıra şarj:</strong> <a href="/urun/512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800">P800</a> (512Wh, 6,55 kg) 360Wh'lik bir bataryayı yaklaşık bir kez doldurur; hafifliği sayesinde bagaja kolay sığar.</li>
<li><strong>Bir scooter + kamp ihtiyaçları:</strong> <a href="/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800">P1800</a> (1024Wh) iki şarja yakın enerji sunar, yanında telefon ve aydınlatma için pay bırakır.</li>
<li><strong>İki kişi, iki araç veya hafta sonu kampı:</strong> Singo2000PRO (1920Wh) veya <a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200</a> (2048Wh) dört şarja yakın kapasite sağlar. P3200'ün 1000W solar girişi, güneşli günlerde daha hızlı yeniden dolum anlamına gelir.</li>
</ul>

<p>Tüm modelleri karşılaştırmak için <a href="/kategori/tasinabilir-guc-kaynaklari">taşınabilir güç kaynakları kategorimize</a> bakabilirsiniz.</p>

<h2>Scooter Şarjı İçin Kapasite Planlaması Nasıl Yapılır?</h2>

<p>Doğru modeli seçmenin en kısa yolu üç soruyu yanıtlamaktır: Bataryanız kaç Wh, iki şebeke şarjı arasında kaç kez doldurmanız gerekiyor ve aynı istasyondan başka hangi cihazları besleyeceksiniz? Batarya Wh değerini 0,75'e bölüp istediğiniz şarj sayısıyla çarptığınızda ihtiyacınız olan minimum kapasiteyi bulursunuz. Örneğin 500Wh'lik bir bataryayı iki kez doldurmak için 500 × 2 ÷ 0,75 ≈ 1333Wh gerekir; bu da sizi 1920–2048Wh sınıfına yönlendirir.</p>

<p>Güneş paneli ekleyecekseniz hesabı günlük düşünün: panelin bir günde ürettiği enerji, bir günde tükettiğinizden fazlaysa istasyon her akşam yeniden dolu başlar.</p>

<h2>Sık Sorulan Sorular</h2>

<h3>Elektrikli scooter power station ile şarj edilir mi?</h3>
<p>Evet. Scooter'ın orijinal şarj cihazını power station'ın AC prizine takarak, evdeki prizde olduğu gibi şarj edebilirsiniz. Saf sinüs çıkış, şarj cihazının şebekedekine benzer şekilde çalışmasını sağlar.</p>

<h3>Scooter şarj aleti kaç watt çeker?</h3>
<p>36V scooterlarda yaygın 42V 2A şarj cihazları çıkışta yaklaşık 84W, prizden ise tipik olarak 90–110W çeker. Hızlı şarj cihazları daha fazla çekebilir; kesin değer için cihaz etiketine bakın.</p>

<h3>1024Wh power station scooter'ı kaç kez şarj eder?</h3>
<p>Yaklaşık 0,75 toplam verimle 1024Wh'lik bir model bataryaya yaklaşık 768Wh aktarır. Bu, 360Wh'lik bir bataryayı yaklaşık 2,1 kez, 672Wh'lik bir bataryayı yaklaşık 1,1 kez doldurmaya yeter.</p>

<h3>Power station ile şarj süresi uzar mı?</h3>
<p>Hayır. Şarj süresini scooter'ın şarj cihazı belirler; power station bu cihazın ihtiyacından çok daha fazla güç verebildiği için süre evdekiyle aynıdır.</p>

<h3>Scooter'ı power station'ın USB-C çıkışından şarj edebilir miyim?</h3>
<p>Scooter ve e-bisiklet bataryaları genellikle 36–48V ve kendi şarj cihazıyla çalışır; USB-C üzerinden şarj desteklemezler. Üreticiniz özel olarak belirtmedikçe orijinal şarj cihazını AC prizden kullanın.</p>

<h3>Güneş paneliyle scooter şarj etmek mümkün mü?</h3>
<p>Evet, power station üzerinden. Bir SP200 paneli 4,5 tepe güneş saati varsayımıyla günde yaklaşık 675Wh üretir; bunun yaklaşık 506Wh'i scooter bataryasına ulaşır ve 360Wh'lik bir bataryayı bir kez doldurmaya yeter.</p>
`,
  },

  // ══════════════════════════════════════════════════════════════════
  // 19 — AKVARYUM ELEKTRİK KESİNTİSİ, HAVA MOTORU VE YEDEK GÜÇ
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "akvaryum-elektrik-kesintisi-hava-motoru-yedek-guc",
    title: "Akvaryumda Elektrik Kesintisi: Hava Motoru, Filtre ve Isıtıcı Kaç Saat Çalışır?",
    excerpt:
      "Elektrik kesildiğinde akvaryumda önce ne risk altına girer, hava motoru ve filtre power station ile kaç saat çalışır? Watt aralıkları, öncelik listesi ve UPS modlu yedekleme planı.",
    category: "Rehber",
    tags: [
      "akvaryum elektrik kesintisi",
      "akvaryum hava motoru",
      "akvaryum filtresi",
      "akvaryum ısıtıcı",
      "yedek güç",
      "ups modu",
      "taşınabilir güç kaynağı",
    ],
    metaTitle: "Akvaryum Elektrik Kesintisi: Hava Motoru ve Yedek Güç 2026",
    metaDescription:
      "Akvaryumda elektrik kesintisi olunca ne yapılır? Hava motoru, filtre ve ısıtıcı kaç watt çeker, power station ile kaç saat çalışır; UPS modu ve öncelikler.",
    metaKeywords: [
      "akvaryum elektrik kesintisi",
      "akvaryum hava motoru kaç watt",
      "elektrik kesilince akvaryum ne olur",
      "akvaryum için yedek güç kaynağı",
      "akvaryum ısıtıcı kaç watt",
      "pilli hava motoru",
      "akvaryum ups",
    ],
    content: `<p>Akvaryum, elektriğe tamamen bağımlı küçük bir ekosistemdir. Hava motoru suya oksijen karıştırır, filtre suyu temizler ve içindeki yararlı bakterileri canlı tutar, ısıtıcı ise sıcaklığı sabit tutar. Elektrik kesildiğinde bu üç sistem aynı anda durur ve saat işlemeye başlar.</p>

<p>Kısa bir kesinti çoğu akvaryumda sorun yaratmaz; ama saatler süren bir arıza, kış gecesinde soğuyan bir oda ya da kalabalık bir tank söz konusu olduğunda hazırlıklı olmak önemlidir. Bu rehberde önce neyin risk altına girdiğini, cihazların kaç watt çektiğini ve bir power station ile ne kadar süre dayanabileceğinizi hesaplıyoruz.</p>

<blockquote><p><strong>Kısa cevap:</strong> Akvaryumda elektrik kesintisinde önceliği hava motoru ve filtreye verin; 10W'lık bir hava motoru ile 15W'lık bir filtre (toplam 25W) 512Wh'lik bir güç kaynağıyla yaklaşık 512 × 0,85 ÷ 25 ≈ 17 saat çalışır. Ortalama 40W çeken bir ısıtıcıyı da eklerseniz süre P800'de yaklaşık 6,7 saate, 2048Wh'lik P3200'de yaklaşık 27 saate iner. Güç kaynağını şebekeye takılı tutarsanız UPS/EPS fonksiyonu kesinti anında yaklaşık 10 ms içinde devreye girer.</p></blockquote>

<h2>Elektrik Kesilince Akvaryumda Önce Ne Olur?</h2>

<p>Kesintinin etkisi tankın büyüklüğüne, balık yoğunluğuna, bitki miktarına ve oda sıcaklığına göre değişir. Yine de genel akvaristik bilgisine göre üç sistem farklı hızlarda risk oluşturur.</p>

<h3>Oksijen: Hava motoru ve su hareketi</h3>
<p>Hava motoru ve filtrenin yarattığı su hareketi, yüzeydeki gaz alışverişini artırarak suyun oksijen almasını sağlar. Su durgunlaştığında oksijen seviyesi zamanla düşer; kalabalık ve sıcak tanklarda bu daha hızlı olur. Balıkların yüzeye yakın durup hızlı solunum yapması, genellikle dikkat edilmesi gereken bir işarettir.</p>

<h3>Filtre: Yararlı bakteriler</h3>
<p>Filtre yalnızca suyu süzmez; içindeki malzemede atıkları parçalayan yararlı bakteriler yaşar. Bu bakteriler sürekli akan suyla gelen oksijene ihtiyaç duyar. Filtre uzun süre durursa bakteri kolonisi zarar görebilir ve filtrenin içindeki durgun su bozulabilir. Saatlerce durmuş bir filtreyi yeniden çalıştırmadan önce ne yapmanız gerektiği konusunda akvaryum uzmanınıza danışın.</p>

<h3>Sıcaklık: Isıtıcı</h3>
<p>Tropikal akvaryumlar genellikle sabit bir sıcaklıkta tutulur. Su ısıyı havaya göre yavaş kaybettiği için sıcaklık birkaç saat içinde dramatik düşmez; ancak kışın ısıtılmayan bir odada uzun kesintide fark belirginleşir. Büyük tanklar sıcaklığı küçük tanklardan daha uzun korur.</p>

<h2>Akvaryum Cihazları Kaç Watt Çeker?</h2>

<p>Aşağıdaki değerler tipik aralıklardır. Kendi cihazlarınızın gerçek tüketimini öğrenmek için ürün etiketine bakın ya da bir priz tipi wattmetre ile ölçün.</p>

<ul>
<li><strong>Hava motoru:</strong> genellikle 2–10W. Küçük tek çıkışlı modeller alt sınırda, çok çıkışlı modeller üst sınırdadır.</li>
<li><strong>İç veya dış filtre:</strong> tipik olarak 5–40W. Tank hacmi ve pompa debisi arttıkça tüketim yükselir.</li>
<li><strong>Isıtıcı:</strong> tank büyüklüğüne göre 25–300W. Isıtıcı sürekli çalışmaz; termostat sıcaklığa ulaşınca kapanır ve gerektiğinde yeniden açılır.</li>
<li><strong>LED aydınlatma:</strong> genellikle 10–60W. Kesintide en kolay vazgeçilebilecek yüktür.</li>
</ul>

<p>Isıtıcı hesabında etiket gücünü değil, ortalama gücü kullanmak gerekir. Örneğin 100W'lık bir ısıtıcı, oda koşullarına bağlı olarak zamanın yaklaşık %40'ında çalışıyorsa ortalama tüketimi 100 × 0,40 ≈ 40W olur. Bu oran tamamen yaklaşıktır: soğuk odada artar, ılık odada azalır.</p>

<h2>Kesintide Akvaryum İçin Öncelik Sırası Nasıl Olmalı?</h2>

<p>Kapasiteniz sınırlıysa her şeyi çalıştırmak yerine yükleri öncelik sırasına göre açmak süreyi ciddi ölçüde uzatır. Genel bir sıralama şöyledir:</p>

<ol>
<li><strong>Hava motoru:</strong> En düşük tüketimle oksijen sağlar; tek bir cihaz çalıştırabilecekseniz bu olmalıdır.</li>
<li><strong>Filtre:</strong> Hem su hareketi yaratır hem de yararlı bakterileri korur.</li>
<li><strong>Isıtıcı:</strong> Tropikal tanklarda ve soğuk odalarda uzun kesintide gerekli hale gelir; en çok enerji tüketen kalemdir.</li>
<li><strong>Aydınlatma:</strong> Kesinti boyunca kapalı tutulabilir.</li>
</ol>

<p>Soğuk su balıkları, bitki yoğunluğu, CO₂ sistemi gibi özel durumlarda öncelikler değişebilir; tankınıza özel bir plan için akvaryum uzmanınıza danışın.</p>

<h2>Power Station ile Akvaryum Kaç Saat Çalışır?</h2>

<p>Çalışma süresini şu formülle hesaplıyoruz: <strong>kapasite (Wh) × 0,85 ÷ ortalama güç (W)</strong>. 0,85 katsayısı invertör ve dönüşüm kayıplarını temsil eder. Örneğin 10W hava motoru ve 15W filtreden oluşan 25W'lık bir yükte P800 için 512 × 0,85 ÷ 25 ≈ 17 saat çıkar.</p>

<table>
<thead>
<tr><th>Senaryo (ortalama güç)</th><th>P800 (512Wh)</th><th>P1800 (1024Wh)</th><th>Singo2000PRO (1920Wh)</th><th>P3200 (2048Wh)</th></tr>
</thead>
<tbody>
<tr><td>Yalnızca hava motoru (5W)</td><td>≈ 87 saat</td><td>≈ 174 saat</td><td>≈ 326 saat</td><td>≈ 348 saat</td></tr>
<tr><td>Hava motoru 10W + filtre 15W (25W)</td><td>≈ 17 saat</td><td>≈ 35 saat</td><td>≈ 65 saat</td><td>≈ 70 saat</td></tr>
<tr><td>+ 100W ısıtıcı, ~%40 çalışma (≈ 65W)</td><td>≈ 6,7 saat</td><td>≈ 13,4 saat</td><td>≈ 25 saat</td><td>≈ 27 saat</td></tr>
<tr><td>+ 20W LED aydınlatma (≈ 85W)</td><td>≈ 5,1 saat</td><td>≈ 10,2 saat</td><td>≈ 19 saat</td><td>≈ 20,5 saat</td></tr>
</tbody>
</table>

<p>Isıtıcılı satırlar yaklaşıktır; gerçek süre odanın sıcaklığına ve ısıtıcının ne sıklıkla devreye girdiğine bağlıdır. Çok düşük yüklerde (5W gibi) invertörün kendi boşta tüketimi de devreye girdiği için gerçek süre tablodakinden kısa olabilir. Kendi cihaz listenizle hesap yapmak için <a href="/guc-hesaplayici">güç hesaplayıcımızı</a> kullanabilirsiniz.</p>

<h2>UPS Modu Akvaryumu Kesintide Nasıl Korur?</h2>

<p>Akvaryumun en büyük sorunu, kesintinin çoğu zaman siz evde yokken ya da uyurken olmasıdır. Bu yüzden power station'ı yalnızca kesinti anında çıkarıp bağlamak yerine sürekli devrede tutmak daha güvenlidir.</p>

<p>IEETek güç kaynaklarındaki UPS/EPS fonksiyonu bu iş için tasarlanmıştır. Güç kaynağını şebekeye takılı bırakıp akvaryum cihazlarını onun AC çıkışına bağlarsınız. Elektrik varken cihazlar şebekeden beslenir, kesinti olduğunda güç kaynağı yaklaşık 10 ms içinde bataryaya geçer. Hava motoru, filtre ve ısıtıcı gibi cihazlar bu kısa geçişi genellikle fark etmez. Bu kullanım şeklinin ayrıntılarını <a href="/blog/guc-istasyonunda-pass-through-sarj-ups-modu">pass-through şarj ve UPS modu yazımızda</a> bulabilirsiniz.</p>

<p>Saf sinüs AC çıkış sayesinde pompa motorları şebekedekine benzer şekilde, gereksiz uğultu ve ısınma olmadan çalışır. Güç kaynağını akvaryumdan su sıçramayacak, kuru ve hava alan bir yere koyun; IEETek taşınabilir modeller IP20 sınıfındadır ve suya karşı korumalı değildir.</p>

<h2>Pilli Hava Motoru Yeterli mi?</h2>

<p>Pilli veya şarjlı hava motorları, kesinti anında devreye giren ucuz ve kullanışlı bir ek önlemdir. Bazı modeller elektrik kesildiğinde otomatik olarak çalışmaya başlar. Küçük tanklarda ve kısa kesintilerde oksijen ihtiyacını karşılamak için faydalıdır.</p>

<p>Ancak pilli hava motoru filtreyi ve ısıtıcıyı çalıştırmaz. Bu yüzden onu bir yedek güç çözümünün alternatifi değil, tamamlayıcısı olarak düşünün: güç kaynağı ana sistemi beslerken pilli motor ikinci bir güvenlik katmanı olur.</p>

<h2>Teraryum ve Kuluçka Makinesi İçin de Kullanılır mı?</h2>

<p>Evet, aynı mantık geçerlidir. Teraryumlarda ısıtma matı ve ısı lambası gibi ekipmanlar, tipik olarak birkaç on watttan 150W civarına kadar tüketebilir ve termostatla aralıklı çalışır. Ev tipi kuluçka makinelerinde ise ısıtıcı ve viyol çevirme motoru sıcaklığı korumak için kesintisiz çalışmalıdır; burada da ortalama gücü etiketten veya wattmetreyle öğrenip aynı formülü kullanabilirsiniz. Hayvanınız veya kuluçka süreci için kritik sıcaklık aralıklarını veteriner hekiminize ya da ekipman üreticisine danışın.</p>

<h2>Kesintiden Önce Sistemi Nasıl Test Edersiniz?</h2>

<p>Planınızın gerçekten çalıştığını görmenin en iyi yolu, kesinti gelmeden küçük bir deneme yapmaktır. Bu deneme hem cihazlarınızın gerçek tüketimini hem de güç kaynağının ne kadar dayanacağını netleştirir.</p>

<ol>
<li>Akvaryum cihazlarını güç kaynağının AC çıkışına bağlayın ve güç kaynağını şebekeye takılı bırakın.</li>
<li>Ekrandaki çıkış gücünü not edin; ısıtıcının açık ve kapalı olduğu anlardaki değerleri ayrı ayrı izleyin.</li>
<li>Güç kaynağının şebeke fişini kısa bir süre çekerek geçişi deneyin; hava motoru ve filtrenin kesintisiz çalıştığını kontrol edin.</li>
<li>Birkaç saat sonunda batarya yüzdesindeki düşüşe bakarak kendi tankınız için gerçek çalışma süresini tahmin edin.</li>
</ol>

<p>Bu kısa test, tablodaki yaklaşık değerleri kendi akvaryumunuzun gerçek rakamlarıyla değiştirmenizi sağlar.</p>

<h2>Akvaryumunuz İçin Hangi Güç Kaynağını Seçmelisiniz?</h2>

<ul>
<li><strong>Küçük ve orta tank, ısıtıcısız ya da ılık oda:</strong> <a href="/urun/512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800">P800</a> (512Wh) hava motoru ve filtreyi yaklaşık 17 saat çalıştırır; dahili LED feneri kesinti anında da işe yarar.</li>
<li><strong>Tropikal tank, ısıtıcı dahil gece boyu:</strong> <a href="/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800">P1800</a> (1024Wh) ısıtıcılı senaryoda yaklaşık 13 saat sağlar; uygulama üzerinden kalan kapasiteyi takip edebilirsiniz.</li>
<li><strong>Birden fazla tank veya uzun kesinti riski:</strong> <a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200</a> (2048Wh) ısıtıcılı tek tankı bir gün boyunca destekleyebilir; güneş paneliyle de şarj edilebilir.</li>
</ul>

<p>Akvaryumun yanı sıra modem ve buzdolabını da yedeklemek istiyorsanız <a href="/blog/elektrik-kesintisinde-ev-icin-guc-kaynagi">ev için elektrik kesintisi rehberimiz</a> toplam ihtiyacı planlamanıza yardımcı olur. Tüm modeller <a href="/kategori/tasinabilir-guc-kaynaklari">taşınabilir güç kaynakları kategorimizde</a> yer alıyor.</p>

<h2>Akvaryum İçin Kesinti Planınızı Bugün Hazırlayın</h2>

<p>İyi bir akvaryum kesinti planı üç adımdan oluşur: cihazlarınızın watt değerlerini öğrenin, öncelik sırasını belirleyin ve güç kaynağını UPS modunda sürekli devrede tutun. Pilli bir hava motoru ve evdeki bir el feneri de bu planı tamamlar. Uzun kesintilerde genel afet hazırlığı için <a href="https://www.afad.gov.tr/" target="_blank" rel="noopener noreferrer">AFAD</a> önerilerini de gözden geçirebilirsiniz.</p>

<h2>Sık Sorulan Sorular</h2>

<h3>Elektrik kesilince akvaryum balıkları kaç saat dayanır?</h3>
<p>Bu süre tankın büyüklüğüne, balık yoğunluğuna ve sıcaklığa göre çok değişir; genel bir rakam vermek doğru olmaz. Uzun kesintilerde oksijeni korumak için hava motorunu öncelikli çalıştırın ve tankınıza özel durum için akvaryum uzmanınıza danışın.</p>

<h3>Akvaryum hava motoru kaç watt çeker?</h3>
<p>Akvaryum hava motorları genellikle 2–10W arasında çeker. Bu düşük tüketim sayesinde 512Wh'lik bir güç kaynağı 5W'lık bir hava motorunu yaklaşık 87 saat çalıştırabilir.</p>

<h3>Akvaryum ısıtıcısı power station ile çalışır mı?</h3>
<p>Evet. 25–300W aralığındaki akvaryum ısıtıcıları tüm IEETek modellerinin sürekli AC gücünün altında kalır. Isıtıcı termostatla aralıklı çalıştığı için ortalama tüketimi etiket gücünden düşüktür, ama toplam süreyi en çok kısaltan kalem odur.</p>

<h3>Power station akvaryum için UPS gibi kullanılabilir mi?</h3>
<p>Evet. Güç kaynağını şebekeye takılı bırakıp akvaryumu AC çıkışına bağladığınızda, kesinti anında yaklaşık 10 ms içinde bataryaya geçer ve cihazlar çalışmaya devam eder.</p>

<h3>Kesintide akvaryum ışığını kapatmalı mıyım?</h3>
<p>Kapasite sınırlıysa evet. Aydınlatma 10–60W çekebilir ve balıkların hayati ihtiyaçları arasında değildir; kapatmak hava motoru ve filtrenin çalışma süresini uzatır.</p>

<h3>Pilli hava motoru power station yerine kullanılabilir mi?</h3>
<p>Kısa kesintilerde oksijen için yardımcı olur, ancak filtreyi ve ısıtıcıyı çalıştırmaz. Bu yüzden onu tek başına çözüm değil, güç kaynağına ek bir güvenlik katmanı olarak düşünün.</p>
`,
  },
];
