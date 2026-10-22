import type { BlogInput } from "./tip";

export const yazilar: BlogInput[] = [
  // ══════════════════════════════════════════════════════════════════
  // A4 — P3200 MÜ SH4000 MÜ
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "p3200-mu-sh4000-mu-ev-yedek-guc-karsilastirma",
    title: "P3200 mü SH4000 mü? Ev Yedek Gücü İçin Hangisi Doğru Seçim?",
    excerpt:
      "2048Wh'lik taşınabilir P3200 ile 5120Wh'lik hibrit enerji depolama ünitesi SH4000'i kapasite, güç, şarj, solar giriş ve kullanım senaryolarıyla karşılaştırıyoruz. Örnek çalışma süresi hesapları ve karar listesi yazıda.",
    category: "Karşılaştırma",
    tags: [
      "p3200",
      "sh4000",
      "ev yedek güç",
      "elektrik kesintisi",
      "taşınabilir güç kaynağı",
      "ev tipi enerji depolama",
      "hibrit invertör",
    ],
    metaTitle: "P3200 mü SH4000 mü? Ev Yedek Güç Karşılaştırması 2026",
    metaDescription:
      "P3200 mü SH4000 mü? Kapasite, sürekli güç, AC ve solar şarj, ağırlık, IP sınıfı ve hibrit invertör farkları; daire, villa ve yazlık için çalışma süresi.",
    metaKeywords: [
      "p3200 mü sh4000 mü",
      "p3200 sh4000 karşılaştırma",
      "ev için yedek güç kaynağı",
      "elektrik kesintisi için hangi güç kaynağı",
      "ev tipi enerji depolama mı power station mı",
      "sh4000 özellikleri",
      "p3200 kaç saat gider",
    ],
    content: `<p>Evinizi elektrik kesintisine karşı hazırlamak istediğinizde, katalogda iki model sık sık karşınıza çıkar: taşınabilir güç kaynağı P3200 ve hibrit enerji depolama ünitesi SH4000. İkisi de LiFePO4 bataryalı, saf sinüs çıkışlı ve UPS/EPS fonksiyonlu. Peki aralarındaki fark yalnızca kapasite mi?</p>

<p>Değil. P3200 her yere götürebileceğiniz güçlü bir power station; SH4000 ise evin bir köşesine yerleşip yıllarca orada çalışmak üzere tasarlanmış, genişletilebilir bir ev bataryası. Bu yazıda ikisini teknik değerler, gerçek kullanım senaryoları ve örnek hesaplarla yan yana koyuyoruz.</p>

<blockquote><p><strong>Kısa cevap:</strong> Kesintiler birkaç saati geçmiyorsa, dairede yaşıyorsanız veya güç kaynağını kampa ve yazlığa da taşımak istiyorsanız P3200 (2048Wh, 3200W, 24,35 kg) yeterlidir. Kesintiler bir günü aşıyorsa, kombi ve buzdolabı gibi kritik yükleri uzun süre taşımak, evin elektrik altyapısıyla entegrasyon veya ileride 20 kWh'a büyümek istiyorsanız SH4000 (5120Wh, 4000W, hibrit invertörlü) doğru seçimdir. Ortalama 300W'lık bir ev yükünü P3200 yaklaşık 5,8 saat, SH4000 yaklaşık 14,5 saat taşır.</p></blockquote>

<h2>P3200 ve SH4000 teknik olarak nasıl farklı?</h2>

<p>P3200, 2048Wh kapasiteli, tekerlekli ve teleskopik kollu bir taşınabilir güç kaynağıdır. SH4000 ise 5120Wh LiFePO4 batarya ile entegre hibrit invertörü tek gövdede birleştiren, B5120 modülleriyle büyütülebilen bir enerji depolama ünitesidir (ESS). Aşağıdaki tablo iki modelin datasheet değerlerini yan yana gösterir.</p>

<table>
<thead>
<tr><th>Özellik</th><th>P3200</th><th>SH4000</th></tr>
</thead>
<tbody>
<tr><td>Batarya kapasitesi</td><td>2048Wh</td><td>5120Wh; B5120 modülleriyle yaklaşık 20 kWh'a kadar</td></tr>
<tr><td>Sürekli / tepe AC çıkış</td><td>3200W / 6400W</td><td>4000W / 8000W</td></tr>
<tr><td>AC (şebeke) şarj gücü</td><td>1800W (yaklaşık 1,5 saat)</td><td>3600W</td></tr>
<tr><td>Solar giriş</td><td>1000W, 12–80V, 16A</td><td>HV 3000W, 70–450V, 16A (MC4) + LV 600W, 12–50V (XT60)</td></tr>
<tr><td>Ağırlık</td><td>24,35 kg</td><td>65 kg</td></tr>
<tr><td>Koruma sınıfı</td><td>IP20</td><td>IP54</td></tr>
<tr><td>Ses</td><td>65 dB altı; egzoz ve motor sesi yok</td><td>40 dB altı</td></tr>
<tr><td>Hibrit invertör / ATS uyumu</td><td>Yok</td><td>Var (şebeke bağlı ve off-grid çalışma)</td></tr>
<tr><td>Taşıma</td><td>Tekerlekli, teleskopik kollu</td><td>Tekerlekli</td></tr>
<tr><td>Ek özellikler</td><td>4 AC, 4 USB-C, 4 USB-A; dahili powerbank, jump starter ve fener; uygulama</td><td>Wi-Fi / Bluetooth uygulama, üst üste (stack) modül montajı</td></tr>
</tbody>
</table>

<p>Ortak noktaları da önemlidir: her iki model de LiFePO4 kimyası, 4000+ döngü ömrü, THD değeri %1,5'in altında saf sinüs AC çıkış, MPPT solar şarj, BMS koruması ve yaklaşık 10 ms geçiş süreli UPS/EPS fonksiyonu sunar.</p>

<h2>Taşınabilirlik mi, yarı sabit kullanım mı?</h2>

<p>İki modeli ayıran asıl soru, cihazın hayatının nerede geçeceğidir. 24,35 kg'lık P3200, tekerlekleri ve teleskopik koluyla bir valiz gibi çekilir; araç bagajına konur, yazlığa, kampa, bahçeye ya da şantiyeye götürülür. Dahili powerbank ve jump starter, onu yolda da işe yarar kılar.</p>

<p>SH4000 de tekerleklidir, ancak 65 kg'lık ağırlığı onu günlük taşınacak bir cihaz olmaktan çıkarır. Evde bir kez yerine konur ve orada kalır. IP54 koruma sınıfı toz ve su sıçramasına karşı daha dayanıklı olmasını sağlar; P3200'ün IP20 sınıfı ise kuru iç mekân kullanımı içindir. Koruma sınıflarının farkını <a href="/blog/ip20-ip54-ip65-ip67-koruma-sinifi-rehberi">IP koruma sınıfı rehberimizde</a> ayrıntılı anlattık.</p>

<h2>Hangi cihazları çalıştırabilirler? Güç sınırları</h2>

<p>Sürekli çıkış gücü, aynı anda çalışabilecek cihazların toplam wattını belirler. P3200'ün 3200W'ı; buzdolabı, kombi, televizyon, laptop ve aydınlatmayı aynı anda çalıştırmaya fazlasıyla yeter. Tipik olarak 1800–2200W aralığında çeken bir su ısıtıcısı veya elektrikli ısıtıcı da bu sınırın içindedir.</p>

<p>SH4000'in 4000W sürekli ve 8000W tepe gücü ise birden fazla yüksek güçlü cihazın üst üste geldiği durumlarda pay bırakır. Örneğin bir ısıtıcı çalışırken buzdolabı kompresörünün devreye girmesi gibi. Yine de her iki modelde de asıl kısıt güç değil, enerjidir: 2000W çeken bir ısıtıcı P3200'ü 2048 × 0,85 ÷ 2000 ≈ 0,9 saatte, SH4000'i 5120 × 0,85 ÷ 2000 ≈ 2,2 saatte boşaltır.</p>

<h2>Senaryolara göre P3200 mü SH4000 mü?</h2>

<p>Aşağıdaki hesaplarda standart formülü kullanıyoruz: <strong>Çalışma süresi ≈ Kapasite (Wh) × 0,85 ÷ Ortalama güç (W)</strong>. 0,85 katsayısı invertör ve dönüşüm kayıplarını temsil eder. P3200 için kullanılabilir enerji yaklaşık 1.741Wh, SH4000 için yaklaşık 4.352Wh'tir. Cihaz değerleri tipik aralıklardan seçilmiştir; kendi cihazlarınızın etiketine bakın.</p>

<h3>Apartman dairesinde birkaç saatlik kesinti</h3>
<p>Buzdolabı (ortalama 60W), modem (15W), LED aydınlatma (30W) ve laptop (60W) toplam yaklaşık 165W eder. P3200 ile 1.741 ÷ 165 ≈ 10,6 saat, SH4000 ile 4.352 ÷ 165 ≈ 26,4 saat çalışma süresi elde edilir. Dairede kesintiler genellikle birkaç saatle sınırlı kalıyorsa P3200 bu ihtiyacı rahatça karşılar; üstelik dairede fazla yer kaplamaz ve gerektiğinde odadan odaya taşınır.</p>

<h3>Villa veya müstakil evde uzun kesinti</h3>
<p>Buzdolabı (60W), modem (15W), kombi (ortalama 120W), aydınlatma (50W) ve televizyon (ortalama 55W) birlikte yaklaşık 300W'lık ortalama yük oluşturur. P3200 bunu 1.741 ÷ 300 ≈ 5,8 saat, SH4000 ise 4.352 ÷ 300 ≈ 14,5 saat taşır. SH4000'e bir B5120 eklendiğinde 10.240 × 0,85 ÷ 300 ≈ 29 saate çıkar. Kesintinin geceyi aştığı, kışın kombinin durmaması gereken evlerde bu fark belirleyicidir. Kritik yük tablolarını <a href="/blog/ev-tipi-enerji-depolama-sistemi-10-kwh-ev-bataryasi">ev tipi enerji depolama sistemi rehberimizde</a> ayrıntılı hesapladık.</p>

<h3>Yazlık veya bağ evi</h3>
<p>Yalnızca hafta sonları gidilen bir yazlıkta P3200'ün taşınabilirliği öne çıkar: cihazı şehirdeki evden yazlığa götürür, dönüşte geri getirirsiniz. 1000W'lık solar girişine bir SP400 bağlandığında günde yaklaşık 400 × 4,5 × 0,75 = 1.350Wh üretilir. Yıl boyunca kullanılan ve şebekenin zayıf olduğu bir bağ evinde ise SH4000 ile 800W'lık seri panel dizisi günde yaklaşık 2.700Wh üretir; bu da daha kalıcı bir sistem anlamına gelir.</p>

<h3>Mobil kullanım: kamp, saha, karavan</h3>
<p>Burada tercih nettir: P3200. SH4000 araçla taşınabilir olsa da her kurulumda 65 kg'lık bir üniteyi indirip kaldırmak pratik değildir. P3200'ün dahili feneri ve jump starter özelliği de sahada ek bir avantaj sağlar.</p>

<h2>Şarj ve güneş tarafında fark ne kadar?</h2>

<p>P3200, 1800W AC şarjla yaklaşık 1,5 saatte dolar. SH4000'in 3600W'lık AC şarj gücü, iki kat büyük bataryayı kesintiler arasındaki kısa şebeke dönemlerinde hızlı doldurmak için önemlidir.</p>

<p>Güneş tarafında P3200'ün tek girişi 12–80V aralığında çalışır; SP400 tek başına veya iki SP200 seri bağlanarak kullanılabilir. SP400 ile tam dolum 2048 ÷ (400 × 0,75) ≈ 6,8 güneşli saat sürer. SH4000'de ise iki ayrı giriş vardır: yüksek voltaj (HV) girişine paneller seri dizi halinde bağlanır, örneğin iki SP400 seri (Vmp 88V) ile 800W; düşük voltaj (LV) girişine SP100 veya SP200 takılabilir. 800W'lık dizi ile tam dolum 5120 ÷ (800 × 0,75) ≈ 8,5 güneşli saattir. Bölgenizin güneşlenme değerini <a href="https://re.jrc.ec.europa.eu/pvg_tools/en/" target="_blank" rel="noopener noreferrer">PVGIS</a> ile kontrol edebilirsiniz.</p>

<h2>Ev panosuna bağlanabilir mi? Hibrit invertör farkı</h2>

<p>En büyük yapısal fark buradadır. SH4000'in entegre hibrit invertörü şebeke bağlı ve off-grid çalışabilir, ATS (otomatik transfer şalteri) ile uyumludur. Bu, sistemin evin elektrik altyapısıyla entegre edilecek şekilde tasarlandığı anlamına gelir. P3200'de hibrit invertör yoktur; cihazlarınızı doğrudan prizlerine takarak kullanırsınız.</p>

<p>Pano bağlantısı, ATS kurulumu ve şebeke bağlı çalışma mutlaka yetkili bir elektrikçi tarafından yapılmalıdır. Konuyu <a href="/blog/hibrit-invertor-ats-nedir-ev-panosu-baglanti">hibrit invertör ve ATS rehberimizde</a> anlattık; SH4000'in tüm özelliklerini ise <a href="/sh4000">SH4000 tanıtım sayfasında</a> bulabilirsiniz.</p>

<h2>Karar listesi: hangisini seçmelisiniz?</h2>

<ol>
<li><strong>Kesinti süresini belirleyin.</strong> Bölgenizde kesintiler genellikle birkaç saat sürüyorsa P3200, sıklıkla bir günü aşıyorsa SH4000 yönünde ilerleyin.</li>
<li><strong>Günlük kritik yükünüzü hesaplayın.</strong> Cihazlarınızın watt ve saat değerlerini <a href="/guc-hesaplayici">güç hesaplayıcı</a> ile toplayın. Günlük ihtiyaç 1.700Wh'in altındaysa P3200 tek şarjla yeter.</li>
<li><strong>Taşıma ihtiyacını sorgulayın.</strong> Cihazı kampa, yazlığa veya araca götürecekseniz P3200'ün 24,35 kg'ı ve teleskopik kolu belirleyicidir.</li>
<li><strong>Entegrasyon isteyip istemediğinize karar verin.</strong> Evin panosuna bağlantı veya ATS ile otomatik geçiş düşünüyorsanız tek seçenek SH4000'dir.</li>
<li><strong>Büyüme payını düşünün.</strong> İleride kapasiteyi artırmak istiyorsanız SH4000, B5120 modülleriyle yaklaşık 20 kWh'a kadar genişler.</li>
<li><strong>Kurulum yerini kontrol edin.</strong> SH4000 için kuru, düz, havalandırması olan ve 65 kg'ı taşıyacak kalıcı bir alan ayırabilmelisiniz.</li>
</ol>

<h2>Hangi model kime uygun?</h2>

<ul>
<li><strong>Dairede yaşayan, kesintileri kısa süren, cihazını taşımak isteyenler:</strong> <a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200</a>. Güneşle kullanmak isterseniz <a href="/urun/solar-veteran-paketi-p3200-sp400">Solar Veteran Paketi</a> (P3200 + SP400) dengeli bir başlangıçtır.</li>
<li><strong>Müstakil ev, villa veya uzun kesinti yaşanan bölgeler:</strong> <a href="/urun/5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000">SH4000</a>; panel istenirse Solar Titan Paket, daha fazla kapasite için B5120 eklemesi.</li>
<li><strong>Her ikisini de isteyenler:</strong> Evde SH4000'i sabit yedek olarak, P3200'ü taşınabilir ikinci kaynak olarak kullanmak da mümkündür.</li>
</ul>

<p>Diğer modelleri <a href="/kategori/tasinabilir-guc-kaynaklari">taşınabilir güç kaynakları kategorisinde</a> karşılaştırabilirsiniz.</p>

<h2>Kesinti süreniz ve yaşam alanınız kararı verir</h2>

<p>P3200 ile SH4000 arasındaki seçim, “hangisi daha güçlü” sorusundan çok “enerjiye nerede ve ne kadar süre ihtiyacım var” sorusuyla ilgilidir. Kısa kesintiler ve hareketli bir yaşam için P3200 esnek bir çözüm sunar. Uzun kesintiler, kalıcı kurulum ve büyüme planı için SH4000 bir ev bataryası gibi çalışır. Kritik yük listenizi çıkardığınızda, hangi modelin sizin için doğru olduğu genellikle kendiliğinden belli olur.</p>

<h2>Sık Sorulan Sorular</h2>

<h3>P3200 ile SH4000 arasındaki en önemli fark nedir?</h3>
<p>P3200 taşınabilir bir güç kaynağıdır; SH4000 ise entegre hibrit invertörlü, ATS uyumlu ve B5120 ile genişletilebilen bir ev enerji depolama ünitesidir. Kapasite 2048Wh'e karşı 5120Wh'tir.</p>

<h3>P3200 buzdolabını kaç saat çalıştırır?</h3>
<p>Ortalama 60W çeken bir buzdolabı için 2048 × 0,85 ÷ 60 ≈ 29 saat. Gerçek süre buzdolabının modeline, ortam sıcaklığına ve kapı açma sıklığına göre değişir.</p>

<h3>P3200'e ek batarya takılabilir mi?</h3>
<p>Ürün verilerimizde P3200 için bir genişletme bataryası bulunmuyor. Kapasite büyütme ihtiyacınız varsa, B5120 modülleriyle yaklaşık 20 kWh'a çıkabilen SH4000'i değerlendirin.</p>

<h3>SH4000 taşınabilir mi?</h3>
<p>Tekerleklidir ve ev içinde yer değiştirebilir, ancak 65 kg ağırlığıyla düzenli taşımaya uygun değildir. Yarı sabit, kalıcı bir konumda kullanılmak üzere tasarlanmıştır.</p>

<h3>İki model de evde kapalı alanda kullanılabilir mi?</h3>
<p>Evet. Her ikisi de yakıt yakmaz ve egzoz üretmez. Kuru, düz ve havalandırması olan bir zeminde tutulmalıdır; P3200'ün IP20 sınıfı nedeniyle neme karşı daha dikkatli olun.</p>

<h3>Kesinti anında cihazlarım kapanır mı?</h3>
<p>Her iki model de yaklaşık 10 ms geçiş süreli UPS/EPS fonksiyonu sunar; cihazlar şebekeye bağlı güç kaynağı üzerinden çalışıyorsa kesintide batarya beslemesine geçilir. Çok hassas ekipmanlarda üreticinin önerilerini kontrol edin.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // A5 — TAŞINABİLİR SOLAR SİSTEM GERİ ÖDEME SÜRESİ
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "tasinabilir-solar-sistem-geri-odeme-suresi-hesaplama",
    title: "Güneş Paneli Kendini Kaç Yılda Amorti Eder? Taşınabilir Solar Sistemde Dürüst Hesap",
    excerpt:
      "Taşınabilir güneş panelinin geri ödeme süresini yatırım ÷ yıllık tasarruf formülüyle adım adım hesaplıyoruz. SP100, SP200, SP400 ve Solar Titan Paket için yıllık üretim, örnek tasarruf ve amortisman tablosu yazıda.",
    category: "Enerji",
    tags: [
      "güneş paneli amorti süresi",
      "geri ödeme süresi",
      "taşınabilir güneş paneli",
      "güneş enerjisi tasarruf",
      "solar paket",
      "elektrik faturası",
    ],
    metaTitle: "Güneş Paneli Kaç Yılda Amorti Eder? 2026 Dürüst Hesap",
    metaDescription:
      "Taşınabilir güneş paneli kendini kaç yılda amorti eder? Yıllık üretim formülü, örnek kWh fiyatıyla tasarruf ve SP100, SP200, SP400 için geri ödeme tablosu.",
    metaKeywords: [
      "güneş paneli kendini kaç yılda amorti eder",
      "güneş paneli geri ödeme süresi",
      "taşınabilir güneş paneli tasarruf",
      "güneş paneli yıllık üretim hesaplama",
      "solar sistem amortisman hesabı",
      "güneş paneli faturayı düşürür mü",
    ],
    content: `<p>Güneş paneli almayı düşünen herkesin aklına bir noktada aynı soru gelir: “Bu panel kendini kaç yılda öder?” Çatı tipi sistemler için bu soru genellikle yatırımın merkezindedir. Taşınabilir solar sistemlerde ise hesabın sonucu çoğu kişiyi şaşırtır.</p>

<p>Bu yazıda taşınabilir güneş panellerinin ve solar paketlerin geri ödeme süresini hiçbir rakamı süslemeden, adım adım hesaplıyoruz. Tüm varsayımları açıkça yazıyoruz; böylece kendi şehrinizin güneşlenme değeri ve kendi faturanızdaki birim fiyatla aynı hesabı yeniden yapabilirsiniz.</p>

<blockquote><p><strong>Kısa cevap:</strong> Yıllık ortalama günlük 4,5 tepe güneş saati ve örnek olarak kWh başına 3 TL varsayımıyla, üretilen enerjinin tamamı kullanılırsa SP400 panel kendini yaklaşık 19,6 yılda, SP100 ise yaklaşık 28,4 yılda amorti eder. Bataryalı paketlerde bu süre çok daha uzundur. Küçük taşınabilir sistemlerin asıl değeri fatura tasarrufu değil, kesintide ve şebekesiz yerlerde enerji sağlamasıdır.</p></blockquote>

<h2>Geri ödeme süresi nasıl hesaplanır?</h2>

<p>Basit geri ödeme süresi, bir yatırımın kendi maliyetini ürettiği tasarrufla kaç yılda karşıladığını gösteren göstergedir. Formülü sadedir:</p>

<p><strong>Geri ödeme süresi (yıl) = Yatırım tutarı (TL) ÷ Yıllık tasarruf (TL)</strong></p>

<p>Yıllık tasarruf ise panelin yılda ürettiği ve gerçekten kullandığınız enerji ile elektrik birim fiyatının çarpımıdır. Bu nedenle hesabın iki bilinmeyeni vardır: panel yılda ne kadar üretir ve bu enerjinin ne kadarı şebekeden almanız gereken elektriğin yerine geçer?</p>

<h2>Taşınabilir güneş paneli yılda kaç kWh üretir?</h2>

<p>Yıllık üretimi şu formülle tahmin ediyoruz:</p>

<p><strong>Yıllık üretim (Wh) ≈ Panel gücü (W) × Tepe güneş saati × 365 × 0,75</strong></p>

<p>Tepe güneş saati, panelin tam gücünde ürettiği eşdeğer saat sayısıdır; takvimdeki güneşli saatle aynı şey değildir. 0,75 katsayısı panel açısı, sıcaklık, kablo ve MPPT dönüşüm kayıplarını temsil eder. Aşağıdaki hesaplar <strong>yıllık ortalama günlük 4,5 tepe güneş saati varsayımıyla</strong> yapılmıştır. Bu değer bölgeye ve mevsime göre belirgin şekilde değişir; kendi konumunuz için Avrupa Komisyonu'nun <a href="https://re.jrc.ec.europa.eu/pvg_tools/en/" target="_blank" rel="noopener noreferrer">PVGIS aracını</a> veya <a href="https://gepa.enerji.gov.tr/MyCalculator/" target="_blank" rel="noopener noreferrer">Güneş Enerjisi Potansiyel Atlası (GEPA)</a> sayfasını kullanın. İllere göre özet değerler için <a href="/blog/turkiye-il-il-gunes-paneli-verimli-gunes-saati">il il verimli güneş saati yazımıza</a> da bakabilirsiniz.</p>

<p>Örnek: SP400 için 400 × 4,5 × 365 × 0,75 ≈ 492.750Wh, yani yaklaşık 493 kWh/yıl. SP100 için aynı hesap yaklaşık 123 kWh/yıl verir.</p>

<h2>Elektrik birim fiyatı hesabı nasıl etkiler?</h2>

<p>Tasarrufun parasal değeri, faturanızdaki kWh birim fiyatına bağlıdır. Bu fiyat tarife türüne, abone grubuna ve döneme göre değişir; bu yazıda güncel tarifeyi vermiyoruz. Hesabı göstermek için <strong>örnek olarak kWh başına 3 TL varsayalım; kendi faturanızdaki birim fiyatı kullanın.</strong> Güncel tarife bilgisi için <a href="https://www.epdk.gov.tr/" target="_blank" rel="noopener noreferrer">EPDK</a> ve faturanız esas alınmalıdır.</p>

<p>Birim fiyat ile geri ödeme süresi ters orantılıdır: fiyat iki katına çıkarsa süre yarıya iner. Bu yüzden tablodaki yıllar mutlak bir sonuç değil, örnek bir başlangıç noktasıdır.</p>

<h2>SP100, SP200, SP400 ve Solar Titan Paket kaç yılda amorti eder?</h2>

<p>Aşağıdaki tablo, üretilen enerjinin <strong>tamamının kullanıldığı</strong> iyimser senaryoyu gösterir. Fiyatlar Ekim 2026 itibarıyla mağaza fiyatıdır ve yaklaşıktır; güncel fiyat için ürün sayfasına bakın.</p>

<table>
<thead>
<tr><th>Ürün</th><th>Panel gücü</th><th>Yıllık üretim</th><th>Yıllık tasarruf (3 TL/kWh örneğiyle)</th><th>Ekim 2026 fiyatı (yaklaşık)</th><th>Basit geri ödeme</th></tr>
</thead>
<tbody>
<tr><td>SP100</td><td>100W</td><td>≈ 123 kWh</td><td>≈ 370 TL</td><td>10.499 TL</td><td>≈ 28,4 yıl</td></tr>
<tr><td>SP200</td><td>200W</td><td>≈ 246 kWh</td><td>≈ 739 TL</td><td>19.499 TL</td><td>≈ 26,4 yıl</td></tr>
<tr><td>SP400</td><td>400W</td><td>≈ 493 kWh</td><td>≈ 1.478 TL</td><td>28.999 TL</td><td>≈ 19,6 yıl</td></tr>
<tr><td>Solar Titan Paket (SH4000 + 2×SP400)</td><td>800W</td><td>≈ 986 kWh</td><td>≈ 2.957 TL</td><td>194.999 TL</td><td>≈ 66 yıl</td></tr>
</tbody>
</table>

<p>Hesap örneği: SP400 için yıllık tasarruf 492,75 kWh × 3 TL ≈ 1.478 TL, geri ödeme süresi 28.999 ÷ 1.478 ≈ 19,6 yıl. Solar Titan Paket için 985,5 kWh × 3 TL ≈ 2.957 TL ve 194.999 ÷ 2.957 ≈ 66 yıl bulunur.</p>

<h3>Titan Paketin süresi neden bu kadar uzun?</h3>
<p>Çünkü paket fiyatının büyük kısmı panel değil, 5120Wh'lik batarya ve hibrit invertördür. Batarya enerji üretmez, yalnızca depolar; geri ödeme hesabına katkısı yoktur. Yalnızca iki SP400'ün maliyetini (2 × 28.999 = 57.998 TL) hesaba katarsanız süre yine yaklaşık 19,6 yıla iner. Yani adil bir karşılaştırma için panel ve batarya maliyetini ayrı düşünmek gerekir.</p>

<h3>Daha yüksek bir birim fiyatla ne değişir?</h3>
<p>Faturanızdaki birim fiyat örneğin 5 TL olsaydı SP400'ün yıllık tasarrufu 492,75 × 5 ≈ 2.464 TL, geri ödeme süresi 28.999 ÷ 2.464 ≈ 11,8 yıl olurdu. Bu da hesabın birim fiyata ne kadar duyarlı olduğunu gösterir; kendi rakamınızla mutlaka yeniden hesaplayın.</p>

<h2>Üretilen her kWh gerçekten tasarruf mu?</h2>

<p>Tablodaki en iyimser varsayım budur ve çoğu zaman gerçekleşmez. Taşınabilir bir panel enerjiyi doğrudan şebekeye vermez; güç kaynağını şarj eder. Güç kaynağı dolduysa panelin ürettiği enerji kullanılamaz ve boşa gider. Tasarruf ancak bataryadaki enerjiyi, aksi halde şebekeden çekeceğiniz bir cihazda harcadığınızda oluşur.</p>

<p>Bunun pratik anlamı şudur: Panel her gün bataryayı dolduruyor, ama siz akşam bu enerjinin yalnızca yarısını kullanıyorsanız gerçek tasarruf da yarıya, geri ödeme süresi ise iki katına çıkar. SP400 örneğinde bu, yaklaşık 19,6 yıldan 39 yıla yakın bir süre demektir.</p>

<p>İkinci kayıp bataryanın kendisindedir. Bataryaya giren enerji, invertör üzerinden AC'ye çevrilirken bir kısmı kaybolur. Bu yazıda kullandığımız 0,85 katsayısıyla, SP400'ün yıllık 493 kWh'lik üretiminin prizden kullanılabilen kısmı yaklaşık 493 × 0,85 ≈ 419 kWh'tir. Bu durumda yıllık tasarruf ≈ 1.257 TL'ye, geri ödeme süresi 28.999 ÷ 1.257 ≈ 23 yıla çıkar.</p>

<h2>Bataryanın kendisi tasarruf ettirir mi?</h2>

<p>Bataryanın da bir “kWh başına maliyeti” vardır. Örneğin P3200'ün Ekim 2026 itibarıyla mağaza fiyatı yaklaşık 63.499 TL'dir. Kullanılabilir enerjisi 2048 × 0,85 ≈ 1.741Wh, kâğıt üzerindeki ömrü 4000+ döngüdür. Her döngüde tam kapasite kullanılsa bile toplam yaklaşık 1,741 kWh × 4000 ≈ 6.963 kWh enerji geçer; bu da kWh başına yaklaşık 63.499 ÷ 6.963 ≈ 9,1 TL'lik depolama maliyeti demektir.</p>

<p>Bu rakam, örnek aldığımız 3 TL'lik birim fiyatın üzerindedir. Yani bir güç kaynağını yalnızca fatura düşürmek için almak, saf finansal açıdan genellikle anlamlı değildir. Gece ucuz saatlerde şarj edip puant saatte kullanma stratejisinde bile fiyat farkı bu depolama maliyetini karşılamalıdır; bu hesabı <a href="/blog/uc-zamanli-tarife-power-station-elektrik-tasarrufu">üç zamanlı tarife ve power station yazımızda</a> ayrıntılı ele aldık.</p>

<h2>Taşınabilir solar sistemin asıl değeri nerede?</h2>

<p>Rakamlar açık: Küçük taşınabilir kitler, çatı tipi büyük sistemler gibi bir “fatura yatırımı” değildir. Değerleri şu durumlarda ortaya çıkar:</p>

<ul>
<li><strong>Elektrik kesintisi:</strong> Buzdolabı, modem ve aydınlatmanın kesintide çalışmaya devam etmesi, bozulmayan gıda ve kesintisiz iş demektir.</li>
<li><strong>Şebekesiz yerler:</strong> Kamp, yazlık, bağ evi, tekne veya saha işlerinde alternatif genellikle yakıtlı jeneratördür; yakıt, gürültü ve bakım maliyetini ortadan kaldırır.</li>
<li><strong>Afet hazırlığı:</strong> Deprem gibi uzun süreli kesintilerde güneşle kendini yenileyen bir enerji kaynağı, parayla ölçülmesi zor bir güvencedir.</li>
<li><strong>Taşınabilirlik:</strong> Panel ve güç kaynağı evden çıkar, ihtiyaç olan yere gider; sabit bir sistemin sunamadığı esnekliktir.</li>
</ul>

<h2>Kendi geri ödeme hesabınızı 5 adımda yapın</h2>

<ol>
<li><strong>Konumunuzun tepe güneş saatini bulun.</strong> PVGIS veya GEPA'dan yıllık ortalama günlük değeri alın.</li>
<li><strong>Yıllık üretimi hesaplayın.</strong> Panel W × tepe güneş saati × 365 × 0,75.</li>
<li><strong>Gerçekten kullanacağınız oranı tahmin edin.</strong> Bataryadaki enerjiyi her gün tüketecek misiniz? Örneğin %50 kullanıyorsanız üretimi 0,5 ile çarpın; batarya üzerinden kullanıyorsanız bir de 0,85 ile çarpın.</li>
<li><strong>Faturanızdaki birim fiyatla çarpın.</strong> Bu, yıllık tasarrufunuzdur.</li>
<li><strong>Yatırımı yıllık tasarrufa bölün.</strong> Paket alıyorsanız panel ve güç kaynağı maliyetini ayrı ayrı değerlendirin.</li>
</ol>

<p>Günlük ihtiyacınızı ve hangi kapasitenin size uygun olduğunu görmek için <a href="/guc-hesaplayici">güç hesaplayıcımızı</a> kullanabilirsiniz.</p>

<h2>Hangi panel en kısa sürede kendini öder?</h2>

<p>Tablodaki örnekte watt başına en düşük fiyat SP400'tedir; bu yüzden geri ödeme süresi de en kısadır. Ancak <a href="/urun/tasinabilir-gunes-paneli-400w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp400">SP400</a> her güç kaynağıyla uyumlu değildir: P3200 ve SH4000'in HV girişiyle kullanılabilir, P1800 ve Singo2000PRO'da voltaj sınırını aşar. P800, P1800 veya Singo2000PRO sahipleri için <a href="/urun/tasinabilir-gunes-paneli-200w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp200">SP200</a> daha uygun bir seçenektir. Tüm modelleri <a href="/kategori/gunes-panelleri">güneş panelleri kategorisinde</a> inceleyebilirsiniz.</p>

<h2>Amortisman yerine kullanım değeriyle karar verin</h2>

<p>Taşınabilir bir güneş panelinin kendini fatura tasarrufuyla amorti etmesi, örnek varsayımlarla yaklaşık 20 ila 30 yıl sürer ve bu yalnızca üretilen her kWh kullanılırsa geçerlidir. Bu yüzden doğru soru “kaç yılda öder?” değil, “kesintide, kampta veya yazlıkta bu enerjiye ne sıklıkla ihtiyacım var?” sorusudur. Bu soruya verdiğiniz cevap, hangi panel ve kapasitenin size uygun olduğunu tablodan çok daha net gösterir.</p>

<h2>Sık Sorulan Sorular</h2>

<h3>Taşınabilir güneş paneli elektrik faturasını düşürür mü?</h3>
<p>Ürettiği enerjiyi şebeke yerine kullandığınız ölçüde düşürür, ancak etkisi sınırlıdır. Örnek varsayımlarla SP400 yılda yaklaşık 493 kWh üretir; bu, tipik bir hanenin yıllık tüketiminin küçük bir kısmıdır.</p>

<h3>Güneş paneli kendini kaç yılda amorti eder?</h3>
<p>Yıllık ortalama günlük 4,5 tepe güneş saati ve örnek 3 TL/kWh fiyatla, üretimin tamamı kullanılırsa SP400 yaklaşık 19,6 yılda, SP100 yaklaşık 28,4 yılda kendini öder. Kendi birim fiyatınız ve kullanım oranınızla sonuç değişir.</p>

<h3>Batarya dolunca panelin ürettiği enerji ne olur?</h3>
<p>Taşınabilir sistemlerde batarya dolduğunda şarj durur ve panelin o anki üretimi kullanılamaz. Tasarruf için bataryadaki enerjiyi düzenli olarak tüketmeniz gerekir.</p>

<h3>Hesapta neden 0,75 katsayısı kullanılıyor?</h3>
<p>Panel açısı, sıcaklık, kablo ve dönüşüm kayıpları nedeniyle panel etiket gücünün tamamını vermez. 0,75, bu kayıplar için kullandığımız muhafazakâr bir varsayımdır.</p>

<h3>Taşınabilir panel şebekeye elektrik satabilir mi?</h3>
<p>Taşınabilir paneller güç kaynağını şarj etmek için tasarlanmıştır, şebekeye enerji vermez. Şebeke bağlantısı ve mahsuplaşma konularında dağıtım şirketinize ve güncel mevzuat için EPDK'ya danışın.</p>

<h3>Paket alırken geri ödemeyi nasıl değerlendirmeliyim?</h3>
<p>Panel ve güç kaynağını ayrı düşünün. Panel enerji üretir; güç kaynağı enerjiyi depolar ve kesintide kullanmanızı sağlar. Güç kaynağının değeri tasarrufta değil, hazırlıkta ve taşınabilirliktedir.</p>`,
  },
];
