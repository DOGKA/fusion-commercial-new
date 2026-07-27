/**
 * FusionMarkt Blog Seed — 09
 * 17) Jackery, EcoFlow, Bluetti, Anker ve IEETek: Marka Karşılaştırma Rehberi
 * 18) Lityum Batarya Yangın Riski: LiFePO4 Neden Daha Güvenli?
 *
 * Kullanım:
 *   cd packages/db && npx tsx prisma/seed-blog-09.ts
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
  // 17 — MARKA KARŞILAŞTIRMA
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "jackery-ecoflow-bluetti-anker-ieetek-karsilastirma",
    title: "Jackery, EcoFlow, Bluetti, Anker ve IEETek: Hangi Markayı Seçmeli?",
    excerpt:
      "Marka seçerken kapasite ve fiyat yeterli değil. Hücre kimyası, döngü beyanının hangi kritere göre verildiği, Türkiye'de garanti ve servis erişimi üzerinden bir karşılaştırma çerçevesi.",
    category: "Karşılaştırma",
    tags: [
      "Jackery",
      "EcoFlow",
      "Bluetti",
      "Anker Solix",
      "IEETek",
      "power station marka karşılaştırma",
    ],
    metaTitle: "Jackery mi EcoFlow mu? Power Station Marka Karşılaştırma 2026",
    metaDescription:
      "Jackery, EcoFlow, Bluetti, Anker ve IEETek karşılaştırması. Hücre kimyası, döngü beyanı, Türkiye'de garanti, servis ve yedek parça erişimi üzerinden seçim rehberi.",
    metaKeywords: [
      "jackery mi ecoflow mu",
      "en iyi power station markası",
      "bluetti türkiye",
      "anker solix alternatifi",
      "ieetek power station",
    ],
    content: `<p>Taşınabilir güç kaynağı pazarında bir düzineden fazla marka var ve ürün sayfalarına baktığınızda hepsi birbirine benziyor: benzer kapasiteler, benzer port dizilimleri, benzer pazarlama görselleri. Kapasite ve fiyatı yan yana koyup karar vermek kolay görünüyor ama bu iki sayı, on yıl kullanacağınız bir cihaz hakkında en az şey söyleyen iki sayı.</p>

<p>Bu yazıda markaları puanlamak yerine, hangi kriterlere bakmanız gerektiğini ve o kriterlerde markaların nerede konumlandığını anlatıyoruz. Amacımız size hazır bir cevap vermek değil, kendi cevabınızı verebileceğiniz bir çerçeve sunmak.</p>

<blockquote>
<strong>Hızlı Cevap:</strong> Teknik olarak üst segment markalar arasındaki fark, çoğu kullanıcının fark edeceğinden daha küçük — hepsi benzer hücre tedarikçilerinden besleniyor. Asıl ayrım <strong>döngü beyanının hangi kritere göre verildiği</strong>, <strong>hücre kimyası</strong> ve <strong>Türkiye'de garanti-servis erişimi</strong>nde ortaya çıkıyor. Lityum bataryaların uluslararası kargo kısıtları nedeniyle, yurt dışından getirilen bir cihazın servise gönderilmesi pratikte çok zordur; bu, teknik özelliklerin önüne geçebilecek bir kriterdir.
</blockquote>

<h2>Karşılaştırma Yaparken Bakılacak Yedi Kriter</h2>

<h3>1. Hücre Kimyası: LiFePO4 mü, NMC mi?</h3>

<p>En belirleyici teknik fark bu. LiFePO4 (lityum demir fosfat) hücreler tipik olarak 3.000–6.000 döngü verir ve termal kaçış eşiği 270 °C civarındadır. NMC (nikel-manganez-kobalt) hücreler daha hafif ve daha kompakttır ama döngü ömrü 800–1.500 bandında kalır, termal eşiği 170–210 °C'dir.</p>

<p>Sektörde birkaç yıl önce NMC yaygındı; bugün ciddi markaların büyük kısmı taşınabilir güç kaynaklarında LiFePO4'e geçti. Yine de eski nesil modeller ve giriş segmenti ürünler hâlâ NMC ile satılıyor. Ürün sayfasında kimya belirtilmiyorsa, bu bilgiyi mutlaka sorun. İki kimya arasındaki farkı <a href="/blog/lifepo4-batarya-nedir-avantajlari-nelerdir">LiFePO4 nedir</a> yazımızda ayrıntılandırdık.</p>

<h3>2. Döngü Beyanının Küçük Yazısı</h3>

<p>Bu, marka karşılaştırmasında en sık gözden kaçan nokta ve gerçekten önemli.</p>

<p>"4000 döngü" ifadesi tek başına bir şey ifade etmez; hangi kapasite seviyesine kadar olduğu belirtilmelidir. Sektörde iki farklı ömür sonu tanımı kullanılıyor:</p>

<ul>
  <li><strong>%80'e kadar 4000 döngü</strong> — batarya, 4000. döngüde hâlâ başlangıç kapasitesinin %80'ini veriyor.</li>
  <li><strong>%70'e kadar 4000 döngü</strong> — aynı döngü sayısında kapasite %70'e inmiş. Bu, ilk tanıma göre belirgin biçimde daha zayıf bir performanstır.</li>
</ul>

<p>İki ürün de kutusuna "4000 döngü" yazabilir ama gerçek dayanıklılıkları aynı değildir. Ürünlerimizde belirtilen 4000+ döngü değeri, <strong>25 °C ortamda, 0,5C hızda, %80 deşarj derinliğinde ve %80 kapasite eşiğine kadar</strong> ölçülmüştür. Bu kriterlerin ne anlama geldiğini <a href="/blog/4000-dongu-ne-demek-power-station-kac-yil-dayanir">4000 döngü ne demek</a> yazımızda açıkladık.</p>

<h3>3. Sürekli Güç mü, Pik Güç mü?</h3>

<p>Pazarlama görsellerinde büyük puntoyla yazılan sayı çoğu zaman pik güçtür. Oysa cihazınızı saatlerce besleyecek olan sürekli çıkış gücüdür. Bir modelde "3600W" yazıyorsa, bunun 1800W sürekli / 3600W pik mi yoksa 3600W sürekli mi olduğunu netleştirin.</p>

<p>Kompresörlü cihazlar (buzdolabı, klima, derin dondurucu) çalışmaya başlarken nominal güçlerinin 2–5 katını kısa süreliğine çeker; bu yüzden her iki değere de bakmak gerekir. Klima özelinde hesabı <a href="/blog/power-station-ile-klima-calisir-mi">klima çalışır mı</a> yazımızda yaptık.</p>

<h3>4. Voltaj, Frekans ve Priz Tipi</h3>

<p>Yurt dışı pazarlar için üretilen modeller 110V / 60Hz çıkış verebilir ve Amerikan tipi priz taşıyabilir. Türkiye şebekesi 220–230V / 50Hz'dir. Yanlış modelin dönüştürücüyle kullanılması hem verim kaybı hem güvenlik sorunu doğurur.</p>

<p>Yurt dışından getirilen ürünlerde kontrol edilecekler: AC çıkış gerilimi ve frekansı, priz tipi (Türkiye'de Schuko), AC şarj giriş aralığının 220V'u kapsayıp kapsamadığı.</p>

<h3>5. Solar Giriş Aralığı</h3>

<p>Panel bağlayacaksanız, cihazın MPPT giriş gerilim aralığı ve maksimum solar gücü kritik. Dar bir giriş aralığı, bağlayabileceğiniz panel kombinasyonlarını sınırlar. Örneğin <a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200</a> 12–80V arasında 1000W'a kadar solar kabul eder; bu, seri bağlı üç panele kadar esneklik demektir.</p>

<p>Panel gerilimini ve seri-paralel kombinasyonlarını nasıl hesaplayacağınızı <a href="/blog/solar-panel-seri-paralel-baglanti-rehberi">seri ve paralel bağlantı rehberimizde</a> anlattık.</p>

<h3>6. Garanti ve Servis Erişimi</h3>

<p>Burası, teknik özelliklerin önüne geçebilecek tek kalem.</p>

<p>Lityum bataryalar tehlikeli madde sınıfındadır. Uluslararası havayolu taşımacılığında belirli watt-saat eşiğini aşan bataryaların gönderimi ciddi kısıtlara tabidir; kuralları <a href="https://www.iata.org/en/programs/cargo/dgr/lithium-batteries/" target="_blank" rel="noopener noreferrer">IATA'nın lityum batarya düzenlemeleri</a> sayfasında görebilirsiniz. Pratik sonucu şu: <strong>1000Wh'lik bir güç istasyonunu arıza durumunda yurt dışındaki servise kargoyla göndermek çoğu zaman mümkün değildir.</strong></p>

<p>Bu yüzden marka seçerken sorulacak sorular şunlar:</p>

<ul>
  <li>Türkiye'de yetkili distribütörü var mı, yoksa ürün paralel ithalat mı?</li>
  <li>Garanti Türkiye'de mi geçerli, yoksa üreticinin kendi ülkesinde mi?</li>
  <li>Arıza durumunda cihazı nereye göndereceksiniz?</li>
  <li>Yedek parça (batarya paketi, invertör kartı, fan) temin edilebiliyor mu?</li>
  <li>Türkçe fatura, iade hakkı ve tüketici mevzuatı koruması var mı?</li>
</ul>

<p>Pazar yerlerinden veya yurt dışı sitelerden alınan cihazlarda bu soruların cevabı genellikle olumsuzdur. Garanti kapsamının ne içerip ne içermediğini <a href="/blog/guc-kaynagi-garanti-servis-rehberi">garanti ve servis rehberimizde</a> ayrıntılı yazdık.</p>

<h3>7. Uygulama, Güncelleme ve Genişletilebilirlik</h3>

<p>Wi-Fi veya Bluetooth uygulaması bir konfor özelliği gibi görünür ama pratikte işlevseldir: şarj üst sınırını ayarlamak, şarj gücünü düşürerek hücre ömrünü korumak, uzaktan tüketim takibi yapmak ve döngü sayısını görmek uygulama üzerinden mümkündür.</p>

<p>Genişletilebilirlik ise ev yedeklemesi düşünüyorsanız önemlidir. Modüler batarya desteği olan sistemler, ihtiyacınız büyüdüğünde cihazı değiştirmek yerine paket eklemenize izin verir — <a href="/urun/5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000">SH4000</a> ve B5120 kombinasyonu bu mantıkla tasarlanmıştır.</p>

<h2>Markalar Nerede Konumlanıyor?</h2>

<p>Aşağıdaki tablo, markaların genel pazar konumlanmasını özetler. Model bazında istisnalar olabileceği için, karar vermeden önce ilgilendiğiniz spesifik modelin datasheet'ini kontrol etmenizi öneririz.</p>

<table>
  <thead>
    <tr>
      <th>Marka</th>
      <th>Öne Çıkan Yön</th>
      <th>Tipik Kullanıcı</th>
      <th>Türkiye'de Dikkat Edilecek</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Jackery</td>
      <td>Kategorinin tanınır markası, outdoor ve kamp odaklı geniş model yelpazesi</td>
      <td>Kampçı, karavancı, hafif kullanım</td>
      <td>Model nesline göre kimya değişir; yetkili satış kanalı ve garanti geçerliliği doğrulanmalı</td>
    </tr>
    <tr>
      <td>EcoFlow</td>
      <td>Hızlı AC şarj ve geniş ev enerjisi ekosistemi, güçlü uygulama</td>
      <td>Ev yedeklemesi, hızlı dolum önceliği olanlar</td>
      <td>Ekosistem aksesuarlarının Türkiye'de bulunabilirliği</td>
    </tr>
    <tr>
      <td>Bluetti</td>
      <td>Yüksek kapasite ve modüler genişletme odaklı ürün hattı</td>
      <td>Off-grid, yazlık, uzun süreli bağımsızlık</td>
      <td>Büyük modellerde servis lojistiği ve yedek parça erişimi</td>
    </tr>
    <tr>
      <td>Anker Solix</td>
      <td>Kompakt modeller ve tüketici elektroniği ekosistemi</td>
      <td>Şehir içi, ev ofisi, taşınabilirlik önceliği</td>
      <td>Üst kapasite segmentinde model çeşitliliği daha sınırlı</td>
    </tr>
    <tr>
      <td>IEETek</td>
      <td>Üretici kökenli mühendislik, VDE (1893)Almanya Onaylı Üretim ve Uzun süreli Performans</td>
      <td>Ev yedekleme, karavan, off-grid, denizcilik</td>
      <td>FusionMarkt Türkiye yetkili distribütörüdür; garanti ve servis yurt içindedir</td>
    </tr>
  </tbody>
</table>

<h2>IEETek Ürünlerinin Teknik Konumu</h2>

<p>Şeffaflık adına kendi ürün hattımızın rakamlarını da açıkça paylaşalım — yukarıdaki kriterleri kendi ürünlerimize uyguladığımızda tablo şöyle:</p>

<table>
  <thead>
    <tr>
      <th>Model</th>
      <th>Kapasite</th>
      <th>Sürekli / Pik AC</th>
      <th>Maks. Solar</th>
      <th>Kimya / Döngü</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><a href="/urun/512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800">P800</a></td>
      <td>512 Wh</td>
      <td>800W / 1200W</td>
      <td>300W</td>
      <td>LiFePO4 / 4000+</td>
    </tr>
    <tr>
      <td><a href="/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800">P1800</a></td>
      <td>1.024 Wh</td>
      <td>1800W / 3600W</td>
      <td>500W</td>
      <td>LiFePO4 / 4000+</td>
    </tr>
    <tr>
      <td><a href="/urun/1920wh-4000w-max-lifepo4-tasinabilir-guc-kaynagi-aplikasyon-kablosuz-sarj-operasyonel-kullanim-4000-ustu-dongu-99-99-bms-coklu-cikis-singo2000pro">Singo 2000 Pro</a></td>
      <td>1.920 Wh</td>
      <td>2000W / 4000W</td>
      <td>500W</td>
      <td>LiFePO4 / 4000+</td>
    </tr>
    <tr>
      <td>P3200</td>
      <td>2.048 Wh</td>
      <td>3200W / 6400W</td>
      <td>1000W</td>
      <td>LiFePO4 / 4000+</td>
    </tr>
    <tr>
      <td>SH4000</td>
      <td>5.120 Wh</td>
      <td>4000W / 8000W</td>
      <td>3000W (HV)</td>
      <td>LiFePO4 / 4000+</td>
    </tr>
  </tbody>
</table>

<p>Tüm modellerde çıkış 220/230/240V ve 50/60Hz, prizler Türkiye tipi Schuko'dur. Döngü değerleri %80 kapasite eşiğine göre verilmiştir. Ayrıntılı model karşılaştırması için <a href="/blog/tasinabilir-guc-kaynagi-yorumlari-p800-p1800-p3200">P800, P1800 ve P3200 incelemesine</a> bakabilirsiniz.</p>

<h2>Nasıl Karar Vermeli?</h2>

<p>Pratik bir sıralama önerelim. Bu adımları takip ederseniz marka tartışması kendiliğinden sadeleşir:</p>

<ol>
  <li><strong>Önce kapasiteyi belirleyin.</strong> Çalıştıracağınız cihazların günlük tüketimini toplayın, 0,85'e bölün. Bu, marka bağımsız bir sayıdır. <a href="/guc-hesaplayici">Güç hesaplayıcı</a> bunu birkaç dakikada verir.</li>
  <li><strong>Sürekli güç ihtiyacınızı kontrol edin.</strong> En yüksek güçlü cihazınız hangisiyse, sürekli çıkış onun üzerinde olmalı; pik değer başlangıç akımını karşılamalı.</li>
  <li><strong>Kimyayı filtreleyin.</strong> Uzun kullanım planlıyorsanız LiFePO4 dışındaki seçenekleri listeden çıkarın.</li>
  <li><strong>Döngü beyanının eşiğini sorun.</strong> %80'e mi %70'e mi — cevap alamıyorsanız bu bir sinyaldir.</li>
  <li><strong>Servis erişimini doğrulayın.</strong> Cihaz iki yıl sonra arızalanırsa ne olacağını satın almadan önce netleştirin.</li>
  <li><strong>En son fiyata bakın.</strong> Bu noktada elinizde zaten kısa bir liste olacak.</li>
</ol>

<h2>Sıkça Sorulan Sorular</h2>

<h3>Pazar yerinden çok daha ucuza aynı model buldum, sorun olur mu?</h3>
<p>Fiyat farkının nedenini araştırın. Sıklıkla karşılaşılan durumlar: farklı bölge için üretilmiş model (110V), eski nesil ürün, garantisiz paralel ithalat veya yenilenmiş cihaz. Bu ürünlerde Türkiye'de garanti hizmeti alamazsınız ve arıza durumunda cihazı göndereceğiniz bir adres bulunmaz.</p>

<h3>Markalar aynı hücreleri mi kullanıyor?</h3>
<p>Büyük ölçüde evet. Sektörde sınırlı sayıda büyük LiFePO4 hücre üreticisi var ve markaların çoğu aynı tedarikçilerden alım yapıyor. Farkı yaratan şey hücrenin kendisinden çok; BMS yazılımı, invertör kalitesi, termal tasarım ve üretim kalite kontrolüdür.</p>

<h3>Yurt dışından getirsem gümrükte sorun çıkar mı?</h3>
<p>Lityum bataryalar tehlikeli madde sınıfında olduğu için hava kargoda kısıtlıdır ve belirli watt-saat eşiğinin üzerindeki ürünler yolcu beraberinde de taşınamaz. Uçakla seyahat kurallarını <a href="/blog/guc-istasyonu-ile-ucaga-binmek-tsa-iata-kurallari">uçağa binme kuralları</a> yazımızda topladık. Ticari ithalatta ayrıca gümrük vergisi, uygunluk belgeleri ve TSE süreçleri devreye girer.</p>

<h3>EcoFlow yerine alabileceğim bir alternatif var mı?</h3>
<p>Kapasite ve güç sınıfı bazında eşdeğer alternatifler mevcut. Model bazlı bir karşılaştırmayı <a href="/blog/ecoflow-alternatifi-ieetek">EcoFlow alternatifi</a> yazımızda yaptık; hangi modelin hangisine denk düştüğünü orada bulabilirsiniz.</p>

<h3>Marka yerine jeneratör alsam olmaz mı?</h3>
<p>Kullanım profilinize bağlı. Günlerce süren yüksek güçlü ihtiyaçlarda ve yakıt erişiminin kolay olduğu senaryolarda jeneratör hâlâ mantıklıdır. Ev, apartman ve kamp kullanımında gürültü, emisyon ve bakım kalemleri nedeniyle güç istasyonu öne geçer. Detaylı karşılaştırmayı <a href="/blog/sessiz-jenerator-alternatifi-power-station">sessiz jeneratör alternatifi</a> yazımızda yaptık.</p>

<h2>Kısa Listeyi Nasıl Daraltırsınız</h2>

<p>Marka tartışmasına girmeden önce ihtiyacınızı sayıya dökün: kaç Wh, kaç watt sürekli, kaç watt pik, ne kadar solar. Bu dört sayı elinizde olduğunda seçenek listesi zaten birkaç modele iner ve karar teknik bir karşılaştırmaya dönüşür.</p>

<p>Ardından tek bir soruyla eleyin: bu cihaz üçüncü yılında arızalanırsa ne yapacağım? Cevabı net olan markayla devam edin.</p>

<p>Dört sayıyı çıkarmak için <a href="/guc-hesaplayici">güç hesaplayıcıyı</a> kullanabilir, model seçeneklerini <a href="/kategori/tasinabilir-guc-kaynaklari">taşınabilir güç kaynakları</a> ve <a href="/kategori/gunes-panelleri">güneş panelleri</a> sayfalarımızda inceleyebilirsiniz. Karşılaştırmak istediğiniz belirli bir model varsa <a href="/iletisim">bize yazın</a>, teknik verilerle yan yana koyalım.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // 18 — LİTYUM BATARYA YANGIN RİSKİ
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "lityum-batarya-yangin-riski-lifepo4-guvenlik",
    title: "Lityum Batarya Yangın Riski: LiFePO4 Neden Daha Güvenli ve Evde Şarj Kuralları",
    excerpt:
      "Elektrikli scooter yangınlarının nedeni nedir, aynı risk güç istasyonlarında var mı? Termal kaçış, kimya farkı, BMS koruma katmanları ve evde uygulanacak güvenlik kuralları.",
    category: "Teknik",
    tags: [
      "lityum batarya yangını",
      "LiFePO4 güvenlik",
      "termal kaçış",
      "batarya güvenliği",
      "BMS koruma",
    ],
    metaTitle: "Lityum Batarya Yangın Riski: LiFePO4 Güvenli mi? (2026)",
    metaDescription:
      "Termal kaçış nedir, LiFePO4 ile NMC arasındaki güvenlik farkı ne kadar? BMS koruma katmanları, sertifikalar ve evde güvenli şarj-saklama kuralları.",
    metaKeywords: [
      "lityum batarya yangını",
      "lifepo4 güvenli mi",
      "termal kaçış nedir",
      "batarya yangını söndürme",
      "power station güvenlik",
    ],
    content: `<p>Elektrikli bisiklet ve scooter bataryalarından çıkan yangın haberleri son yıllarda arttı. Bir tanesi evde şarjdayken alev alan bir batarya nedeniyle çıkan yangının görüntüleri olan bu haberler, doğal olarak şu soruyu doğuruyor: evimin salonunda duran ve gece boyunca şarj olan şu 2 kilovatsaatlik cihaz güvenli mi?</p>

<p>Sorunun ciddiye alınması gerekiyor, çünkü haberlerdeki fiziksel olay gerçek. Ama olayın nedenlerine bakıldığında, taşınabilir güç kaynaklarını farklı bir kategoriye yerleştiren üç yapısal ayrım ortaya çıkıyor: hücre kimyası, batarya yönetim sistemi ve şarj mimarisi.</p>

<blockquote>
<strong>Hızlı Cevap:</strong> Yangınların büyük çoğunluğu NMC ve benzeri yüksek enerji yoğunluklu kimyalar, sertifikasız hücreler, uyumsuz şarj cihazları ve mekanik hasar görmüş batarya paketlerinden kaynaklanıyor. LiFePO4 kimyasının termal kaçış eşiği <strong>~270 °C</strong>'dir; NMC'de bu değer 170–210 °C bandındadır. Ayrıca LiFePO4, yapısındaki fosfat bağı nedeniyle ısındığında oksijen salmaz — yani yanmayı kendi kendine besleyemez. Buna rağmen doğru şarj alışkanlıkları hâlâ önemlidir.
</blockquote>

<h2>Termal Kaçış: Aslında Ne Oluyor?</h2>

<p>Batarya yangınlarının teknik adı <strong>termal kaçış</strong> (thermal runaway). Bir zincirleme reaksiyon:</p>

<ol>
  <li>Hücre içinde bir noktada aşırı ısı oluşur. Nedeni iç kısa devre, aşırı şarj, delinme veya dış kaynaklı ısı olabilir.</li>
  <li>Sıcaklık kritik eşiği aştığında elektrolit ve elektrot malzemesi kimyasal olarak ayrışmaya başlar.</li>
  <li>Bu ayrışma ısı üretir. Üretilen ısı sıcaklığı daha da yükseltir, bu da ayrışmayı hızlandırır.</li>
  <li>Döngü kendini besler; sıcaklık saniyeler içinde yüzlerce dereceye tırmanır ve hücre yanıcı gaz açığa çıkarır.</li>
  <li>Bir hücre komşularını ısıtır, olay pakete yayılır.</li>
</ol>

<p>Reaksiyonun başlaması için gereken sıcaklık eşiği, hücre kimyasına göre değişir ve güvenlik farkının merkezinde bu sayı yatar.</p>

<h2>Kimya Farkı: Neden LiFePO4?</h2>

<p>Lityum demir fosfat (LiFePO4) katot malzemesindeki fosfor-oksijen bağı, nikel bazlı katotlardaki metal-oksijen bağından belirgin biçimde güçlüdür. Bunun iki pratik sonucu var: reaksiyonun başlaması için daha yüksek sıcaklık gerekir ve hücre ısındığında yapısından oksijen salmaz.</p>

<p>İkincisi kritik. Yanma için oksijen gerekir; yapısından oksijen salan bir hücre, kapalı bir ortamda dahi kendi yangınını besleyebilir ve söndürmeyi çok zorlaştırır. LiFePO4 bu davranışı göstermez.</p>

<table>
  <thead>
    <tr>
      <th>Kimya</th>
      <th>Termal Kaçış Eşiği</th>
      <th>Isındığında Oksijen Salımı</th>
      <th>Tipik Kullanım</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>LiFePO4</strong></td>
      <td>~270 °C</td>
      <td>Yok denecek kadar az</td>
      <td>Güç istasyonu, ev enerji depolama</td>
    </tr>
    <tr>
      <td>NMC</td>
      <td>~170–210 °C</td>
      <td>Var</td>
      <td>Elektrikli araç, eski nesil güç istasyonu</td>
    </tr>
    <tr>
      <td>LCO (kobalt oksit)</td>
      <td>~150 °C</td>
      <td>Belirgin</td>
      <td>Telefon, dizüstü bilgisayar</td>
    </tr>
  </tbody>
</table>

<p>Yaklaşık 100 derecelik eşik farkı, gerçek dünyada devasa bir güvenlik marjı anlamına gelir. Kimyanın diğer avantajlarını <a href="/blog/lifepo4-batarya-nedir-avantajlari-nelerdir">LiFePO4 nedir</a> yazımızda topladık.</p>

<h2>Peki Neden Scooter Bataryaları Yanıyor?</h2>

<p>Kimya tek başına açıklamıyor. İtfaiye raporlarında ve uluslararası güvenlik kuruluşlarının analizlerinde tekrarlanan dört neden var:</p>

<h3>Sertifikasız veya İkinci Kalite Hücre</h3>
<p>Ucuz batarya paketlerinde sıklıkla test edilmemiş, hurda ya da ikinci el hücreler kullanılıyor. Bu hücrelerde iç kısa devre riski üretim aşamasından itibaren yüksektir. <a href="https://www.nfpa.org/education-and-research/home-fire-safety/lithium-ion-batteries" target="_blank" rel="noopener noreferrer">NFPA'nın lityum batarya güvenliği rehberi</a> bu konudaki en kapsamlı halka açık kaynaklardan biri.</p>

<h3>Uyumsuz Şarj Cihazı</h3>
<p>Batarya paketine ait olmayan bir adaptörle şarj etmek, gerilim ve akım sınırlarının aşılmasına yol açabilir. Aşırı şarj, termal kaçışın en yaygın tetikleyicilerinden biridir. Güç istasyonlarında bu risk yapısal olarak yoktur: şarj devresi cihazın içindedir, harici bir adaptörün yanlış değerler göndermesi mümkün değildir.</p>

<h3>Mekanik Hasar</h3>
<p>Scooter ve bisiklet bataryaları sürekli titreşime, darbeye ve yol koşullarına maruz kalır. Hücre içindeki ayırıcı zarın delinmesi iç kısa devre yaratır ve bu hasar dışarıdan görülmez. Bir güç istasyonu ise sağlam bir kasa içinde ve genellikle sabit bir konumda durur.</p>

<h3>BMS Yokluğu veya Yetersizliği</h3>
<p>Ucuz paketlerde batarya yönetim sistemi ya hiç yoktur ya da yalnızca temel bir koruma sunar. Bu, hücre dengesizliğinin ve aşırı sıcaklığın fark edilmeden ilerlemesi demektir.</p>

<h2>BMS Ne Yapıyor?</h2>

<p>Batarya yönetim sistemi, hücrelerle dış dünya arasındaki denetleyici katmandır. Ürünlerimizde kullanılan BMS'ler yedi ayrı koruma sağlar:</p>

<ul>
  <li><strong>Aşırı şarj koruması:</strong> Hücre gerilimi üst sınıra ulaştığında şarj akımı kesilir.</li>
  <li><strong>Aşırı deşarj koruması:</strong> Alt gerilim sınırında çıkış durdurulur; derin deşarjın kalıcı hasarı önlenir.</li>
  <li><strong>Aşırı akım ve kısa devre koruması:</strong> Anormal akım tespitinde devre milisaniyeler içinde açılır.</li>
  <li><strong>Yüksek sıcaklık koruması:</strong> Hücre sıcaklığı eşiği aşarsa şarj veya deşarj durdurulur.</li>
  <li><strong>Düşük sıcaklık koruması:</strong> 0 °C altında şarj engellenir — lityum kaplama oluşumu bu şekilde önlenir.</li>
  <li><strong>Hücre dengeleme:</strong> Paketteki hücreler arasındaki gerilim farkı sürekli eşitlenir; dengesizlik hem kapasiteyi hem güvenliği bozar.</li>
  <li><strong>Yalıtım ve kaçak izleme:</strong> Anormal durumlarda sistem kendini devre dışı bırakır.</li>
</ul>

<p>Ürünlerimizde belirtilen %99,99 BMS koruma oranı, bu katmanların bir arada çalışmasını ifade eder. Hücre gerilimlerinin normal davranışını ve dengesizliğin nasıl fark edileceğini <a href="/blog/batarya-voc-degeri-nedir-neden-yukselir">VOC değeri yazımızda</a> anlattık.</p>

<h2>Sertifikalar Ne Anlama Geliyor?</h2>

<p>Ürün kutusundaki logolar dekoratif değil; her biri belirli bir test setini temsil eder.</p>

<table>
  <thead>
    <tr>
      <th>Sertifika</th>
      <th>Neyi Test Eder</th>
      <th>Neden Önemli</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>UN 38.3</td>
      <td>Taşıma güvenliği: irtifa, termal döngü, titreşim, darbe, dış kısa devre, aşırı şarj</td>
      <td>Bataryanın uluslararası kargoyla taşınabilmesi için zorunlu; en temel güvenlik eşiği</td>
    </tr>
    <tr>
      <td>IEC 62619</td>
      <td>Endüstriyel uygulamalar için hücre ve paket güvenliği</td>
      <td>Enerji depolama sistemlerinde referans standart</td>
    </tr>
    <tr>
      <td>UL 1642 / UL 2054</td>
      <td>Hücre ve paket seviyesinde elektriksel, mekanik ve termal kötüye kullanım</td>
      <td>Kuzey Amerika pazarının yaygın güvenlik testi</td>
    </tr>
    <tr>
      <td>UL 9540A</td>
      <td>Termal kaçışın paket içinde nasıl yayıldığını ölçer</td>
      <td>Ev tipi enerji depolamada yangın yayılımını değerlendirmenin standart yöntemi</td>
    </tr>
    <tr>
      <td>CE</td>
      <td>Avrupa Birliği uygunluk beyanı</td>
      <td>Avrupa pazarına yasal giriş şartı</td>
    </tr>
  </tbody>
</table>

<p>UL 9540A test yönteminin kapsamını <a href="https://www.ul.com/services/ul-9540a-test-method" target="_blank" rel="noopener noreferrer">UL Solutions'ın resmi sayfasından</a> inceleyebilirsiniz. Bir ürünün datasheet'inde bu sertifikalardan hiçbiri geçmiyorsa, bu tek başına yeterli bir uyarı işaretidir.</p>

<h2>Evde Güvenli Kullanım Kuralları</h2>

<p>Doğru ürünü almış olmak riski büyük ölçüde ortadan kaldırır ama sıfırlamaz. Uygulanması kolay ve etkili kurallar:</p>

<ol>
  <li><strong>Kaçış yolunu kapatmayın.</strong> Cihazı kapı önüne, koridora veya merdiven başına koymayın. Olası bir olayda tahliye yolunuz açık kalmalı.</li>
  <li><strong>Havalandırma boşluğu bırakın.</strong> Cihazın çevresinde en az 10–15 cm boşluk olsun. Dolap içine, yatak altına veya kapalı kutuya koymayın; fanın hava alması gerekir.</li>
  <li><strong>Yanıcı malzemeden uzak tutun.</strong> Perde, halı, kâğıt ve tekstil yığınlarının üzerinde veya bitişiğinde şarj etmeyin.</li>
  <li><strong>Doğrudan güneş ve ısı kaynağından uzak tutun.</strong> Radyatör üstü, kapalı araç içi ve yaz güneşi altındaki balkon en riskli yerlerdir.</li>
  <li><strong>Orijinal kablo ve adaptör kullanın.</strong> Bu, özellikle solar bağlantıda önemlidir; uygun olmayan konnektör ve kesitler ısınmaya yol açar.</li>
  <li><strong>Islak ortamdan koruyun.</strong> Taşınabilir modeller IP20 sınıfındadır ve yağmura, neme, su sıçramasına karşı korunmalıdır. Sınıflandırmayı <a href="/blog/ip20-ip54-ip65-ip67-koruma-sinifi-rehberi">IP koruma rehberimizde</a> açıkladık.</li>
  <li><strong>Duman dedektörü bulundurun.</strong> Cihazın bulunduğu alandaki bir duman dedektörü, gece boyunca şarj eden bir sistem için makul bir önlemdir.</li>
  <li><strong>Hasarlı cihazı kullanmayın.</strong> Düşme, ezilme veya su teması sonrası cihazı çalıştırmadan önce yetkili servise gösterin.</li>
  <li><strong>Uzun süre kullanmayacaksanız %50–60'ta saklayın.</strong> Hem güvenlik hem ömür açısından en uygun seviyedir; ayrıntısı <a href="/blog/tasinabilir-guc-kaynagi-bakim-ve-depolama-rehberi">bakım ve depolama rehberimizde</a>.</li>
  <li><strong>Yerde şarj etmeyi tercih edin.</strong> Yüksek bir raftan düşme riski olan bir konum yerine, sağlam ve yanıcı olmayan bir zemin daha güvenlidir.</li>
</ol>

<h2>Uyarı İşaretleri: Ne Zaman Durmalı?</h2>

<p>Bir batarya sorun çıkarmadan önce genellikle sinyal verir. Şu durumlarda cihazı kullanmayı bırakın, güvenli bir yere alın ve <a href="/iletisim">servisle iletişime geçin</a>:</p>

<ul>
  <li>Kasada şişme, deformasyon veya panel aralıklarında açılma</li>
  <li>Metalik, keskin veya kimyasal bir koku</li>
  <li>Cihazın normalden belirgin biçimde fazla ısınması</li>
  <li>Şarj süresinin ani ve açıklanamayan biçimde kısalması veya uzaması</li>
  <li>Ekranda sürekli hata kodu veya beklenmedik kapanmalar</li>
  <li>Şarj sırasında çıtırtı, tıslama benzeri sesler</li>
</ul>

<h2>Yangın Çıkarsa Ne Yapılmalı?</h2>

<p>Bu bölümün önce çıkması gereken cümlesi şu: <strong>öncelik söndürmek değil, tahliye etmek ve 112'yi aramaktır.</strong> Lityum batarya yangınları zehirli gaz açığa çıkarır ve dumandan etkilenmek alevden daha hızlı sonuç doğurur.</p>

<p>Buna rağmen bilinmesi gereken teknik gerçekler var:</p>

<ul>
  <li><strong>Su, lityum batarya yangınında kullanılabilir ve etkilidir.</strong> Yaygın inanışın aksine yasak değildir. Su alevi söndürmekten çok komşu hücreleri soğutarak zincirleme reaksiyonu keser — asıl ihtiyaç duyulan şey de budur. Bol miktarda su gerekir.</li>
  <li><strong>ABC kuru kimyevi söndürücü alevi bastırır ama soğutmaz.</strong> Yani reaksiyon devam eder ve yangın tekrar başlayabilir.</li>
  <li><strong>CO2 söndürücü tek başına yetersizdir.</strong> Aynı nedenle: soğutma sağlamaz.</li>
  <li><strong>Yangın söndükten sonra bile cihaz saatlerce yeniden tutuşabilir.</strong> Müdahale edilen bir batarya paketi asla eve geri alınmamalı; açık ve yanıcı olmayan bir alanda gözlem altında tutulmalıdır.</li>
</ul>

<p>Genel afet ve acil durum hazırlığı için <a href="https://www.afad.gov.tr/" target="_blank" rel="noopener noreferrer">AFAD'ın hazırlık kaynakları</a> faydalıdır. Enerji tarafındaki hazırlığı ise <a href="/blog/deprem-cantasi-icin-guc-kaynagi-afete-hazirlik">deprem çantası ve afete hazırlık</a> yazımızda ele aldık.</p>

<h2>Sıkça Sorulan Sorular</h2>

<h3>Cihazı gece boyunca şarjda bırakabilir miyim?</h3>
<p>Sertifikalı ve BMS korumalı bir cihazda bu güvenlidir; batarya dolduğunda BMS şarjı keser. Yine de cihazın havalandırmalı, yanıcı malzemeden uzak ve duman dedektörü kapsamındaki bir konumda olması iyi bir alışkanlıktır.</p>

<h3>Yatak odasında tutmak sakıncalı mı?</h3>
<p>Teknik olarak sakınca yok; birçok kullanıcı CPAP cihazını beslemek için tam da bunu yapıyor. Havalandırma boşluğu bırakın ve fanın sesinin uykunuzu bölmemesi için düşük yük tarafında çalıştırın. <a href="/blog/cpap-cihazi-icin-tasinabilir-guc-kaynagi-rehberi">CPAP kullanıcıları için rehberimiz</a> bu senaryoyu ayrıntılandırıyor.</p>

<h3>LiFePO4 hiç yanmaz mı?</h3>
<p>Hayır, böyle bir iddia doğru olmaz. Yeterince yüksek sıcaklık, ciddi mekanik hasar veya üretim hatası her lityum kimyasında olay yaratabilir. LiFePO4'ün avantajı, bu eşiğin çok daha yüksek olması, oksijen salmaması ve olay gerçekleştiğinde çok daha az şiddetli seyretmesidir. Risk sıfır değil, kıyaslanamayacak kadar düşüktür.</p>

<h3>Cihazın içindeki bataryayı kendim değiştirebilir miyim?</h3>
<p>Değiştirmeyin. Batarya paketi yüksek gerilim taşır, BMS ile kalibre çalışır ve yanlış montaj hem cihazı hem sizi riske atar. Değişim yetkili servis tarafından yapılmalıdır; süreç için <a href="/blog/guc-kaynagi-garanti-servis-rehberi">garanti ve servis rehberimize</a> bakabilirsiniz.</p>

<h3>Eski bir güç istasyonunu nasıl imha etmeliyim?</h3>
<p>Ev çöpüne atmayın. Lityum bataryalar atık elektrikli ve elektronik eşya kapsamındadır; belediyelerin atık toplama noktalarına veya yetkili geri dönüşüm merkezlerine teslim edilmelidir. Cihazı bize de getirebilirsiniz, doğru kanala yönlendiriyoruz.</p>

<h2>Riski Doğru Ölçeklendirmek</h2>

<p>Sertifikalı bir LiFePO4 güç istasyonu, evinizde bulunan çoğu elektrikli cihazdan daha fazla koruma katmanına sahiptir. Haberlerde gördüğünüz olayların ortak paydası kimya değil, kalite kontrolsüz üretim ve yanlış kullanım kombinasyonu.</p>

<p>Alırken bakılacaklar net: LiFePO4 hücre, çok katmanlı BMS, UN 38.3 ve CE dahil sertifikalar, Türkiye'de geçerli garanti. Kullanırken uygulanacaklar da net: havalandırma, yanıcı malzemeden uzaklık ve hasarlı cihazı kullanmamak.</p>

<p>Ürünlerimizin güvenlik özelliklerini ve sertifikalarını <a href="/kategori/tasinabilir-guc-kaynaklari">taşınabilir güç kaynakları</a> sayfamızdaki model detaylarında bulabilir, kullanım ortamınıza uygun modeli seçmek için <a href="/guc-hesaplayici">güç hesaplayıcıyı</a> kullanabilir veya doğrudan <a href="/iletisim">bize danışabilirsiniz</a>.</p>`,
  },
];

async function main() {
  console.log("🚀 Blog Seed 09 başlıyor...\n");

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

  console.log("\n🎉 Blog Seed 09 tamamlandı.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Hata:", e);
  prisma.$disconnect();
  process.exit(1);
});
