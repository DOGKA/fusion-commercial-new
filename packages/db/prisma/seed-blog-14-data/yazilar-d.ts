import type { BlogInput } from "./tip";

export const yazilar: BlogInput[] = [
  // ══════════════════════════════════════════════════════════════════
  // 16 — PLANLI ELEKTRİK KESİNTİSİ SORGULAMA VE HAZIRLIK
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "planli-elektrik-kesintisi-sorgulama-ve-hazirlik",
    title: "Planlı Elektrik Kesintisi Sorgulama ve Hazırlık Rehberi 2026",
    excerpt:
      "Planlı elektrik kesintisini nereden öğrenirsiniz, kesintiden 24 saat önce neler yapmalısınız? Modem, güvenlik kamerası, alarm ve buzdolabı için kaç Wh gerektiğini adım adım hesaplıyoruz.",
    category: "Rehber",
    tags: [
      "planlı elektrik kesintisi",
      "elektrik kesintisi sorgulama",
      "kesinti hazırlığı",
      "elektrik dağıtım şirketi",
      "modem yedek güç",
      "güvenlik kamerası",
      "taşınabilir güç kaynağı",
    ],
    metaTitle: "Planlı Elektrik Kesintisi Sorgulama ve Hazırlık 2026",
    metaDescription:
      "Planlı elektrik kesintisi nasıl sorgulanır? Dağıtım şirketi, SMS bildirimi ve 186 hattı; kesintiden önce yapılacaklar ve modem, kamera, buzdolabı için Wh.",
    metaKeywords: [
      "planlı elektrik kesintisi sorgulama",
      "elektrik kesintisi ne zaman gelecek",
      "elektrik kesintisi sms bildirimi",
      "186 elektrik arıza hattı",
      "elektrik kesintisine hazırlık",
      "kesintide modem nasıl çalışır",
    ],
    content: `<p>Telefonunuza “yarın 09.00–15.00 arası bakım çalışması nedeniyle elektrik kesintisi yapılacaktır” mesajı geldiğinde iki seçeneğiniz vardır: altı saati şansa bırakmak ya da bir akşam önceden hazırlanmak. Planlı kesintinin en büyük avantajı, adından da anlaşılacağı gibi, önceden bilinmesidir.</p>

<p>Bu rehberde planlı kesintileri nereden takip edebileceğinizi, arıza kaynaklı kesintiden farkını, kesintiden 24 saat önce yapılacakları ve 4–8 saatlik bir kesinti için hangi cihaza ne kadar enerji ayırmanız gerektiğini anlatıyoruz.</p>

<blockquote><p><strong>Kısa cevap:</strong> Planlı elektrik kesintilerini bölgenizdeki elektrik dağıtım şirketinin web sitesi, mobil uygulaması ve SMS bildirim aboneliği üzerinden takip edebilirsiniz; plansız arızalar için 186 elektrik arıza hattı kullanılır. Modem, güvenlik kamerası ve alarm paneli gibi yaklaşık 55W'lık bir yük, 512Wh'lik bir güç kaynağıyla yaklaşık 7,9 saat çalışır. Buzdolabını da eklerseniz 4 saat için en az 1024Wh, 8 saat için 1920–2048Wh sınıfı bir model gerekir.</p></blockquote>

<h2>Planlı Elektrik Kesintisi Nedir, Arıza Kesintisinden Farkı Ne?</h2>

<p>Planlı elektrik kesintisi, dağıtım şirketinin bakım, onarım, hat yenileme veya yeni bağlantı gibi çalışmalar için şebekeyi önceden belirlenmiş bir zaman aralığında kontrollü olarak kapatmasıdır. Kesintinin bölgesi, başlangıç ve tahmini bitiş saati genellikle önceden duyurulur.</p>

<p>Plansız kesinti (arıza kesintisi) ise fırtına, kar yükü, kablo hasarı, trafo arızası veya aşırı yüklenme gibi beklenmedik nedenlerle oluşur. Ne zaman başlayacağı da ne zaman biteceği de belli değildir. Bu yüzden hazırlık mantığı farklıdır: planlı kesintide süreyi bilerek hesap yaparsınız, plansız kesintide ise belirsizliğe karşı pay bırakırsınız.</p>

<table>
<thead>
<tr><th>Özellik</th><th>Planlı kesinti</th><th>Plansız (arıza) kesinti</th></tr>
</thead>
<tbody>
<tr><td>Nedeni</td><td>Bakım, hat yenileme, şebeke çalışması</td><td>Fırtına, kablo hasarı, trafo arızası</td></tr>
<tr><td>Önceden bilinir mi?</td><td>Genellikle evet, duyurulur</td><td>Hayır</td></tr>
<tr><td>Süre</td><td>Tahmini saat aralığı verilir</td><td>Belirsiz</td></tr>
<tr><td>Nereden öğrenilir?</td><td>Dağıtım şirketi sitesi, uygulaması, SMS</td><td>186 arıza hattı, dağıtım şirketi kanalları</td></tr>
<tr><td>Hazırlık şekli</td><td>Süreye göre net Wh hesabı</td><td>Kapasiteye güvenlik payı eklemek</td></tr>
</tbody>
</table>

<h2>Planlı Elektrik Kesintisi Nasıl Sorgulanır?</h2>

<p>Türkiye'de elektriğin evinize kadar ulaştırılmasından bölgesel elektrik dağıtım şirketleri sorumludur. Faturanızı aldığınız tedarik şirketi ile dağıtım şirketi farklı olabilir; kesinti bilgisi için muhatabınız dağıtım şirketidir. Hangi şirketin bölgenizde hizmet verdiğini faturanızdan veya <a href="https://www.epdk.gov.tr/" target="_blank" rel="noopener noreferrer">EPDK</a> üzerinden öğrenebilirsiniz.</p>

<h3>1. Dağıtım şirketinin web sitesi</h3>

<p>Dağıtım şirketlerinin büyük kısmı web sitelerinde “planlı kesintiler” veya “kesinti sorgulama” başlıklı bir sayfa yayımlar. Burada il, ilçe ve mahalle seçerek bölgenizdeki planlanmış çalışmaları, başlangıç ve tahmini bitiş saatleriyle görebilirsiniz.</p>

<h3>2. Mobil uygulama</h3>

<p>Birçok dağıtım şirketinin mobil uygulaması vardır. Uygulamada adresinizi veya tesisat numaranızı kaydettiğinizde kesinti duyurularını tek ekrandan izleyebilir, bazı uygulamalarda arıza bildirimi de yapabilirsiniz.</p>

<h3>3. SMS ve bildirim aboneliği</h3>

<p>En pratik yöntem, dağıtım şirketinizin SMS veya anlık bildirim hizmetine kaydolmaktır. Tesisat numaranızla kayıt olduğunuzda, bölgenizi etkileyen planlı çalışmalar telefonunuza mesaj olarak gelir. Kayıt yöntemi şirketten şirkete değiştiği için güncel adımları şirketinizin sitesinden kontrol edin.</p>

<h3>4. 186 elektrik arıza hattı</h3>

<p>186, elektrik arızalarını bildirmek ve bölgenizdeki kesinti hakkında bilgi almak için kullanılan arıza hattıdır. Duyurusu olmayan bir kesinti yaşıyorsanız ya da planlı kesintinin süresi uzadıysa bu hattı arayabilirsiniz. Planlı çalışma takibi için ise yukarıdaki kanallar daha hızlı sonuç verir.</p>

<h2>Kesintiden 24 Saat Önce Ne Yapmalı?</h2>

<p>Duyuruyu gördüğünüz an, hazırlık için genellikle yeterli zamanınız vardır. Aşağıdaki listeyi kesintiden bir gün önce uygulamanız, kesinti sırasında aklınızın evde kalmamasını sağlar.</p>

<ol>
<li><strong>Kesinti saatlerini not edin:</strong> Başlangıç ve tahmini bitiş saatini takviminize ekleyin; sürenin uzayabileceğini hesaba katarak 1–2 saat pay bırakın.</li>
<li><strong>Güç kaynağını %100 şarj edin:</strong> Taşınabilir güç kaynağınızı akşamdan prize takın. 1024Wh'lik bir model 1200W AC şarjla yaklaşık 1,2 saatte dolar.</li>
<li><strong>Kritik cihaz listesini çıkarın:</strong> Modem/ONT, güvenlik kamerası kaydedicisi (NVR), alarm paneli, buzdolabı, aydınlatma ve telefon gibi gerçekten açık kalması gerekenleri belirleyin.</li>
<li><strong>Watt değerlerini kontrol edin:</strong> Cihaz etiketlerine bakın veya bir priz tipi wattmetreyle ölçün. Tahmin yerine ölçülmüş değer, hesabı çok daha güvenilir yapar.</li>
<li><strong>Telefon, powerbank ve laptopları doldurun:</strong> Bu cihazları önceden şarj etmek, güç kaynağınızın kapasitesini kesinti sırasında asıl yüklere bırakır.</li>
<li><strong>Buzdolabını hazırlayın:</strong> Kapağı gereksiz açmamak için ihtiyacınızı önceden planlayın; dondurucudaki buz aküleri iç sıcaklığı korumaya yardım eder.</li>
<li><strong>Bağlantıyı deneyin:</strong> Modemi ve kamerayı güç kaynağına bağlayıp birkaç dakika çalıştırın. Kablo uzunluğu ve priz sayısının yettiğinden emin olun.</li>
<li><strong>Hassas cihazları koruyun:</strong> Elektrik geri geldiğinde oluşabilecek dalgalanmaya karşı masaüstü bilgisayar gibi hassas cihazları kesinti başladığında kapatabilirsiniz.</li>
</ol>

<h2>Planlı Kesintide Hangi Cihazlar Açık Kalmalı?</h2>

<p>Her şeyi çalıştırmaya çalışmak yerine öncelik sırası belirlemek, hem daha küçük bir güç kaynağıyla idare etmenizi hem de kesinti uzarsa sürprizle karşılaşmamanızı sağlar.</p>

<ul>
<li><strong>Modem ve ONT (fiber terminal):</strong> Evden çalışıyorsanız ya da güvenlik kameranız buluta kayıt yapıyorsa ilk önceliktir. İkisi birlikte tipik olarak 10–20W çeker.</li>
<li><strong>Güvenlik kamerası ve NVR:</strong> Kesinti saatleri, evin boş kaldığı ve kameraların en çok işe yaradığı anlar olabilir. NVR ve birkaç IP kamera birlikte genellikle 20–40W aralığındadır.</li>
<li><strong>Alarm paneli:</strong> Çoğu alarm panelinin kendi yedek aküsü vardır ancak bu akü genellikle sınırlı süre dayanır. Panel tipik olarak 5–15W çeker.</li>
<li><strong>Buzdolabı:</strong> Kompresör açılıp kapandığı için ortalama tüketim çoğu modelde 40–80W civarındadır; ilk kalkışta anlık olarak çok daha yüksek güç çekebilir.</li>
<li><strong>Aydınlatma:</strong> Akşama sarkan kesintilerde birkaç LED lamba yeterlidir; her biri 5–10W.</li>
<li><strong>Telefon şarjı:</strong> Bir akıllı telefonun tam şarjı yaklaşık 10–20Wh enerji gerektirir.</li>
</ul>

<p>Buzdolabının kesintiye ne kadar dayanabileceğini ayrıntılı merak ediyorsanız <a href="/blog/elektrik-kesintisinde-buzdolabi-gida-guvenligi-kac-saat">buzdolabındaki yiyecekler kaç saat bozulmaz</a> yazımıza göz atabilirsiniz.</p>

<h2>4–8 Saatlik Planlı Kesinti İçin Kaç Wh Gerekir?</h2>

<p>Planlı kesintinin güzel yanı, hesabın netleşmesidir. Her cihazın ortalama gücünü süreyle çarpar, toplamı bulursunuz. Aşağıdaki tablo tipik değerlerle hazırlanmıştır; kendi cihazlarınızın etiket değerlerini kullanmanız daha doğru sonuç verir.</p>

<table>
<thead>
<tr><th>Cihaz</th><th>Ortalama güç (tipik)</th><th>4 saatlik kesinti</th><th>8 saatlik kesinti</th></tr>
</thead>
<tbody>
<tr><td>Modem + ONT</td><td>15W</td><td>60Wh</td><td>120Wh</td></tr>
<tr><td>NVR + IP kameralar</td><td>30W</td><td>120Wh</td><td>240Wh</td></tr>
<tr><td>Alarm paneli</td><td>10W</td><td>40Wh</td><td>80Wh</td></tr>
<tr><td>Buzdolabı (ortalama)</td><td>60W</td><td>240Wh</td><td>480Wh</td></tr>
<tr><td>LED aydınlatma (2 lamba)</td><td>20W</td><td>80Wh</td><td>160Wh</td></tr>
<tr><td>Telefon şarjı (2 telefon)</td><td>—</td><td>20Wh</td><td>40Wh</td></tr>
<tr><td><strong>Toplam</strong></td><td><strong>—</strong></td><td><strong>560Wh</strong></td><td><strong>1120Wh</strong></td></tr>
</tbody>
</table>

<p>Güç kaynağının invertör ve dönüşüm kayıpları için kapasitenin yaklaşık %85'ini kullanılabilir kabul ediyoruz. Bu durumda 4 saatlik senaryo için 560 ÷ 0,85 ≈ 659Wh, 8 saatlik senaryo için 1120 ÷ 0,85 ≈ 1318Wh nominal kapasite gerekir.</p>

<h3>Örnek hesap: Sadece modem, kamera ve alarm</h3>

<p>Buzdolabını kesintiye dayanması için kapalı tutup sadece iletişim ve güvenlik cihazlarını çalıştırırsanız toplam yük yaklaşık 15 + 30 + 10 = 55W olur. 512Wh'lik bir modelde süre 512 × 0,85 ÷ 55 ≈ 7,9 saattir. Yani tipik bir gündüz bakım kesintisini tek başına karşılar.</p>

<p>Kendi cihaz listenizle hızlıca hesap yapmak için <a href="/guc-hesaplayici">güç hesaplayıcımızı</a> kullanabilirsiniz. Cihaz bazında daha fazla örnek için <a href="/blog/elektrik-kesintisinde-kac-wh-gerekir">elektrik kesintisinde hangi cihaz için kaç Wh gerekir</a> yazımız da yol gösterir.</p>

<h2>Planlı Kesinti İçin Hangi Güç Kaynağı Uygun?</h2>

<p>Tüm IEETek güç kaynakları saf sinüs AC çıkış verir ve UPS/EPS fonksiyonuna sahiptir. Cihazlarınızı güç kaynağı prize takılıyken ona bağlarsanız, elektrik kesildiğinde yaklaşık 10 ms içinde bataryaya geçilir. Modemin yeniden başlamaması ve kameranın kayda devam etmesi için bu özellik pratikte çok işe yarar.</p>

<ul>
<li><strong>Modem + kamera + alarm, 4–8 saat:</strong> <a href="/urun/512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800">P800</a> (512Wh, 800W sürekli) yeterlidir; 6,55 kg ağırlığıyla kolayca taşınır, dahili LED feneri aydınlatmada da işe yarar.</li>
<li><strong>Buzdolabı dahil, yaklaşık 4–6 saat:</strong> <a href="/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800">P1800</a> (1024Wh, 1800W sürekli) 560Wh'lik 4 saatlik senaryoyu rahatça taşır ve uygulama üzerinden kalan kapasiteyi izlemenizi sağlar.</li>
<li><strong>Buzdolabı dahil, 8 saat ve üzeri:</strong> <a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200</a> (2048Wh) veya Singo2000PRO (1920Wh) 1318Wh'lik ihtiyacı payla karşılar.</li>
</ul>

<p>Tüm modelleri yan yana görmek için <a href="/kategori/tasinabilir-guc-kaynaklari">taşınabilir güç kaynakları kategorisine</a> bakabilirsiniz. Genel ev senaryoları için <a href="/blog/elektrik-kesintisinde-ev-icin-guc-kaynagi">ev için taşınabilir güç kaynağı rehberimiz</a> de faydalı olacaktır.</p>

<h2>Bir Sonraki Duyuruya Hazır Olmak</h2>

<p>Planlı kesintiler, hazırlıklı olanlar için küçük bir rutine dönüşür: bildirim gelir, güç kaynağı akşamdan şarja takılır, modem ve kamera zaten ona bağlıdır. Bir kez cihaz listenizi ve Wh hesabınızı yaptığınızda, sonraki kesintilerde sadece süreye bakmanız yeterli olur.</p>

<p>Güç kaynağını kesinti dışında da prize bağlı tutarak UPS gibi kullanmak, duyurusu kaçan ya da plansız gelen kesintilerde de evinizi korur. Kesintiden sonra cihazı yeniden tam şarja almayı ve uzun süre kullanmayacaksanız kapasitenin bir kısmını dolu tutmayı unutmayın.</p>

<h2>Sık Sorulan Sorular</h2>

<h3>Planlı elektrik kesintisini nereden öğrenebilirim?</h3>
<p>Bölgenizdeki elektrik dağıtım şirketinin web sitesindeki kesinti sorgulama sayfasından, mobil uygulamasından veya SMS bildirim aboneliğinden öğrenebilirsiniz. Hangi şirketin bölgenize baktığını faturanızdan görebilirsiniz.</p>

<h3>186 hattı ne için aranır?</h3>
<p>186 elektrik arıza hattıdır. Duyurusu olmayan bir kesinti yaşadığınızda arıza bildirmek veya bölgenizdeki kesinti hakkında bilgi almak için arayabilirsiniz.</p>

<h3>Planlı kesinti duyurulan saatten uzun sürebilir mi?</h3>
<p>Evet, verilen bitiş saati tahminidir ve saha çalışmasının gidişatına göre uzayabilir. Bu yüzden Wh hesabınıza 1–2 saatlik pay eklemeniz önerilir.</p>

<h3>Modem kesintide kaç saat çalışır?</h3>
<p>Modem ve ONT birlikte yaklaşık 15W çekiyorsa 512Wh'lik bir güç kaynağıyla 512 × 0,85 ÷ 15 ≈ 29 saat çalışabilir. Kendi modeminizin etiket değeriyle hesabı tekrarlayın.</p>

<h3>Güvenlik kamerası kesinti sırasında kayıt yapmaya devam eder mi?</h3>
<p>NVR ve kameralar bir güç kaynağının UPS/EPS çıkışına bağlıysa kesintide yaklaşık 10 ms içinde bataryaya geçilir ve kayıt genellikle kesintisiz sürer. Buluta kayıt için modemin de beslenmesi gerekir.</p>

<h3>Buzdolabını planlı kesintide güç kaynağına bağlamalı mıyım?</h3>
<p>Kesinti 4 saati aşacaksa veya hava sıcaksa bağlamak mantıklıdır. Kısa kesintilerde kapağı açmadan bekletmek de çoğu zaman yeterlidir; kararı süreye ve kapasitenize göre verin.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // 17 — OKSİJEN KONSANTRATÖRÜ
  // ══════════════════════════════════════════════════════════════════
  {
    slug: "oksijen-konsantratoru-power-station-ile-calisir-mi",
    title: "Oksijen Konsantratörü Power Station ile Çalışır mı? Güç ve Süre Rehberi",
    excerpt:
      "Ev tipi oksijen konsantratörü kaç watt çeker, taşınabilir güç kaynağıyla kaç saat çalışır? Model bazında süre tablosu, UPS/EPS geçişi ve mutlaka bilinmesi gereken medikal uyarılar.",
    category: "Rehber",
    tags: [
      "oksijen konsantratörü",
      "oksijen cihazı güç kaynağı",
      "medikal cihaz yedek güç",
      "elektrik kesintisi",
      "saf sinüs",
      "ups eps",
    ],
    metaTitle: "Oksijen Konsantratörü Power Station ile Çalışır mı?",
    metaDescription:
      "Oksijen konsantratörü kaç watt çeker, power station ile kaç saat çalışır? Model bazında süre tablosu, saf sinüs ve UPS geçişi, medikal güvenlik uyarıları.",
    metaKeywords: [
      "oksijen konsantratörü güç kaynağı",
      "oksijen konsantratörü kaç watt",
      "oksijen cihazı elektrik kesintisi",
      "oksijen konsantratörü power station",
      "taşınabilir oksijen konsantratörü şarj",
      "oksijen makinesi için ups",
    ],
    content: `<p>Evde oksijen konsantratörü kullanan biri için elektrik kesintisi sıradan bir aksaklık değildir. Cihaz durduğunda ne yapılacağı, hasta ve yakınları için önceden düşünülmesi gereken bir konudur. Bu nedenle “bir power station oksijen konsantratörünü çalıştırır mı, kaç saat dayanır?” sorusu sıkça soruluyor.</p>

<p>Bu yazıda teknik tarafı netleştiriyoruz: cihazların tipik güç tüketimi, model bazında yaklaşık çalışma süreleri ve dikkat edilmesi gereken noktalar. Ancak baştan belirtelim: bu bir medikal rehber değildir ve hiçbir bölümü hekiminizin veya cihaz üreticisinin talimatlarının yerine geçmez.</p>

<blockquote><p><strong>Kısa cevap:</strong> Çoğu ev tipi oksijen konsantratörünün etiketinde yaklaşık 300–600W güç değeri yer alır; saf sinüs çıkışlı bir power station bu cihazları teknik olarak çalıştırabilir. 350W çeken bir cihaz 1024Wh'lik bir modelle yaklaşık 2,5 saat, 2048Wh'lik bir modelle yaklaşık 5 saat çalışır. Power station medikal sınıf bir UPS değildir; hekiminizin önerdiği yedek oksijen tüpü her zaman hazır tutulmalıdır.</p></blockquote>

<h2>Önemli Medikal Uyarı</h2>

<p>Taşınabilir güç kaynakları, medikal cihaz yedek güç sistemi olarak sertifikalandırılmış ürünler değildir. Oksijen tedavisine bağımlı bir hasta için kesintisiz enerji planı mutlaka hekim ve cihaz üreticisinin yönlendirmesiyle hazırlanmalıdır.</p>

<ul>
<li><strong>Hekiminize danışın:</strong> Kesinti planınızı, yedek oksijen ihtiyacınızı ve cihazın hangi koşullarda çalıştırılabileceğini hekiminizle konuşun.</li>
<li><strong>Cihaz üreticisinin talimatlarına uyun:</strong> Konsantratörün kullanım kılavuzunda harici güç kaynağı, invertör veya uzatma kablosuyla ilgili uyarılar varsa bunlar her zaman önceliklidir.</li>
<li><strong>Yedek oksijen tüpünü hazır tutun:</strong> Hekiminizin önerdiği yedek oksijen tüpü veya kaynağı, güç kaynağından bağımsız olarak her zaman erişilebilir olmalıdır.</li>
<li><strong>Güvenmeden önce test edin:</strong> Gerçek bir kesintiye kalmadan, cihazınızı güç kaynağıyla kontrollü olarak deneyin.</li>
<li><strong>Güç kaynağını dolu tutun:</strong> Şarjı yarım kalmış bir güç kaynağı, kesinti anında beklediğiniz süreyi vermez.</li>
</ul>

<p>Medikal cihazların güvenli kullanımı ve düzenlenmesi hakkında genel bilgi için ABD Gıda ve İlaç Dairesi'nin <a href="https://www.fda.gov/medical-devices" target="_blank" rel="noopener noreferrer">FDA tıbbi cihazlar sayfasına</a> göz atabilirsiniz.</p>

<h2>Oksijen Konsantratörü Kaç Watt Çeker?</h2>

<p>Oksijen konsantratörü, ortam havasındaki azotu ayırarak yoğunlaştırılmış oksijen sağlayan, elektrikle çalışan bir cihazdır. İçindeki kompresör sürekli çalıştığı için, buzdolabı gibi açılıp kapanan cihazlardan farklı olarak oldukça sabit bir güç çeker.</p>

<h3>Ev tipi (sabit) konsantratörler</h3>

<p>Çoğu ev tipi cihazın etiketinde yaklaşık 300–600W değer görürsünüz. Gerçek tüketim akış ayarına ve modele göre değişir; düşük akış ayarlarında etiket değerinin altında kalabilir. Hesap yaparken etiketteki değeri veya bir wattmetreyle ölçtüğünüz gerçek değeri kullanmak en güvenli yoldur.</p>

<p>Kompresörlü cihazlar ilk çalıştırma anında kısa süreli olarak daha yüksek akım çekebilir. Bu yüzden güç kaynağının sürekli çıkışının yanında tepe (anlık) çıkış değeri de önemlidir.</p>

<h3>Taşınabilir konsantratörler (POC)</h3>

<p>Taşınabilir oksijen konsantratörleri (POC) kendi dahili bataryalarıyla çalışır ve şarj adaptörüyle beslenir. Bunlar ev tipi cihazlara göre çok daha az güç çeker; şarj sırasındaki tüketim modele göre değişir ve adaptör etiketinde yazar. Bazı modeller araç çakmaklığından şarjı da destekler; bu durumda güç kaynağının araç çıkışı da bir seçenek olabilir, ancak bunu cihaz kılavuzunuzdan doğrulayın.</p>

<table>
<thead>
<tr><th>Cihaz tipi</th><th>Tipik etiket gücü</th><th>Çalışma şekli</th><th>Dikkat edilecek nokta</th></tr>
</thead>
<tbody>
<tr><td>Ev tipi konsantratör</td><td>Yaklaşık 300–600W</td><td>Sürekli kompresör</td><td>Saf sinüs, yeterli tepe gücü</td></tr>
<tr><td>Taşınabilir konsantratör (POC)</td><td>Adaptör etiketine bakın</td><td>Dahili batarya + şarj</td><td>Şarj adaptörünün gücü</td></tr>
</tbody>
</table>

<h2>Power Station ile Oksijen Konsantratörü Kaç Saat Çalışır?</h2>

<p>Çalışma süresini şu formülle tahmin ediyoruz: Kapasite (Wh) × 0,85 ÷ Cihaz gücü (W). Buradaki 0,85 katsayısı, invertör ve dönüşüm kayıplarını hesaba katar. Aşağıdaki tabloda 350W ve 500W çeken iki örnek cihaz için yaklaşık süreler yer alıyor.</p>

<table>
<thead>
<tr><th>Model</th><th>Kapasite</th><th>Sürekli / tepe AC</th><th>350W cihaz</th><th>500W cihaz</th></tr>
</thead>
<tbody>
<tr><td>P800</td><td>512Wh</td><td>800W / 1600W</td><td>≈ 1,2 saat</td><td>≈ 0,9 saat</td></tr>
<tr><td>P1800</td><td>1024Wh</td><td>1800W / 3600W</td><td>≈ 2,5 saat</td><td>≈ 1,7 saat</td></tr>
<tr><td>Singo2000PRO</td><td>1920Wh</td><td>2000W / 4000W</td><td>≈ 4,7 saat</td><td>≈ 3,3 saat</td></tr>
<tr><td>P3200</td><td>2048Wh</td><td>3200W / 6400W</td><td>≈ 5,0 saat</td><td>≈ 3,5 saat</td></tr>
<tr><td>SH4000</td><td>5120Wh</td><td>4000W / 8000W</td><td>≈ 12,4 saat</td><td>≈ 8,7 saat</td></tr>
</tbody>
</table>

<p>Örnek: 350W çeken bir cihaz P3200 ile 2048 × 0,85 ÷ 350 ≈ 5,0 saat çalışır. Aynı cihaz 512Wh'lik P800 ile yalnızca 512 × 0,85 ÷ 350 ≈ 1,2 saat çalışır. Bu nedenle ev tipi bir konsantratör için küçük kapasiteli modeller ancak kısa bir köprü görevi görür.</p>

<p>Bu süreler tahmindir. Ortam sıcaklığı, bataryanın yaşı, cihazın akış ayarı ve aynı anda bağlı diğer yükler süreyi değiştirir. Kendi cihazınızın değeriyle hesap yapmak için <a href="/guc-hesaplayici">güç hesaplayıcımızı</a> kullanabilirsiniz.</p>

<h2>Saf Sinüs ve UPS/EPS Geçişi Neden Önemli?</h2>

<p>Kompresör motorlu cihazlar, şebekedeki gibi düzgün bir dalga formuyla en sağlıklı şekilde çalışır. Modifiye sinüs veren invertörler motorun ısınmasına, gürültüye veya cihazın hata vermesine yol açabilir. Tüm IEETek güç kaynakları THD değeri %1,5'in altında olan saf sinüs AC çıkış verir.</p>

<p>UPS/EPS fonksiyonu ise güç kaynağı prize takılıyken cihazınızı beslemesi ve şebeke kesildiğinde yaklaşık 10 ms içinde bataryaya geçmesi anlamına gelir. Birçok cihaz bu kısa geçişi fark etmeden çalışmaya devam eder; ancak bazı medikal cihazlar geçişte alarm verebilir veya yeniden başlayabilir. Bu nedenle cihazınızın bu geçişe nasıl tepki verdiğini, şebeke fişini çekerek kontrollü bir testle önceden görmelisiniz.</p>

<p>Benzer bir senaryoyu uyku apnesi cihazları için ele aldığımız <a href="/blog/cpap-cihazi-icin-tasinabilir-guc-kaynagi-rehberi">CPAP cihazı için taşınabilir güç kaynağı rehberi</a> de bu konuda fikir verebilir.</p>

<h2>Güvenmeden Önce Nasıl Test Edilir?</h2>

<p>Bir yedek güç planı, ancak denenmişse güvenilirdir. Aşağıdaki adımları hekiminizin onayıyla ve hasta yedek oksijen kaynağına erişebilir durumdayken uygulayın.</p>

<ol>
<li>Güç kaynağını %100 şarj edin ve konsantratörün kılavuzunda harici güç kaynağına dair bir kısıtlama olmadığını kontrol edin.</li>
<li>Konsantratörü doğrudan güç kaynağının AC prizine takın; arada ucuz uzatma veya çoklu priz kullanmayın.</li>
<li>Cihazı açın ve güç kaynağının ekranında görünen çıkış watt değerini not edin. Bu, hesabınızda kullanacağınız gerçek değerdir.</li>
<li>Güç kaynağını şebekeye bağlayıp UPS/EPS modunda test edin: şebeke fişini çekin ve konsantratörün alarm verip vermediğini gözlemleyin.</li>
<li>Bir süre çalıştırarak batarya yüzdesindeki düşüşü izleyin; tahmini süreyi tablodaki değerlerle karşılaştırın.</li>
<li>Test bitince güç kaynağını yeniden tam şarja alın ve bunu düzenli bir alışkanlık hâline getirin.</li>
</ol>

<h2>Kesinti Sırasında Süreyi Uzatmak İçin Neler Yapılabilir?</h2>

<p>Kapasite sabit olduğu için süreyi uzatmanın yolu, güç kaynağına bağlı gereksiz yükleri azaltmaktır. Konsantratörle aynı güç kaynağına televizyon, ısıtıcı veya su ısıtıcısı gibi cihazlar bağlamak, oksijen cihazına ayrılan süreyi doğrudan kısaltır.</p>

<ul>
<li><strong>Güç kaynağını yalnızca konsantratöre ayırın:</strong> Telefon şarjı gibi küçük ihtiyaçlar için ayrı bir powerbank kullanmak daha doğrudur.</li>
<li><strong>Akış ayarını kendiniz değiştirmeyin:</strong> Düşük akışta tüketim azalabilir, ancak akış ayarı yalnızca hekiminizin belirlediği değerde kalmalıdır.</li>
<li><strong>Cihazı serin ve havadar bir yerde tutun:</strong> Hem konsantratörün hem güç kaynağının hava girişlerini kapatmayın; ikisini de düz ve kuru bir zemine yerleştirin.</li>
<li><strong>Uzun kesintilerde şarj imkânı planlayın:</strong> Güneş paneli veya araç şarjı ile güç kaynağını kısmen doldurmak mümkündür; ancak bu ek enerji, yedek oksijen planının yerine geçmez.</li>
</ul>

<h2>Hangi Model Hangi Durumda Mantıklı?</h2>

<ul>
<li><strong>Taşınabilir konsantratör (POC) şarjı veya kısa köprü:</strong> <a href="/urun/512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800">P800</a> (512Wh) hafif ve taşınabilirdir; ev tipi cihazda ise yaklaşık bir saatlik köprü sağlar.</li>
<li><strong>Ev tipi cihaz, birkaç saatlik kesinti:</strong> <a href="/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200">P3200</a> (2048Wh) 350W'lık bir cihazı yaklaşık 5 saat besler; tekerlekli gövdesi oda değiştirmeyi kolaylaştırır.</li>
<li><strong>Uzun süreli ev yedeklemesi:</strong> <a href="/urun/5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000">SH4000</a> (5120Wh) aynı cihazı 12 saatin üzerinde çalıştırabilir ve ek bataryayla genişletilebilir. Ev tesisatına entegrasyon gerekiyorsa bu iş mutlaka yetkili elektrikçiyle yapılmalıdır.</li>
</ul>

<p>Tüm seçenekleri <a href="/kategori/tasinabilir-guc-kaynaklari">taşınabilir güç kaynakları kategorisinde</a> karşılaştırabilirsiniz.</p>

<h2>Oksijen Tedavisinde Yedek Güç Planı Nasıl Kurgulanmalı?</h2>

<p>Doğru yaklaşım, power station'ı tek çözüm olarak değil, katmanlı bir planın bir parçası olarak görmektir. İlk katman hekiminizin önerdiği yedek oksijen tüpüdür. Güç kaynağı ise kesinti sırasında konsantratörün çalışmaya devam etmesini sağlayarak tüpün daha geç devreye girmesine yardım eder.</p>

<p>Planınızı yazılı hâle getirin: güç kaynağının şarj durumu kim tarafından ve ne sıklıkla kontrol edilecek, kesinti uzarsa hangi adımlar atılacak, kime haber verilecek. Bu planı hekiminizle ve ev halkıyla paylaşmak, kriz anında soğukkanlı kalmanızı kolaylaştırır.</p>

<h2>Sık Sorulan Sorular</h2>

<h3>Oksijen konsantratörü power station ile çalışır mı?</h3>
<p>Teknik olarak saf sinüs çıkışlı ve cihazın gücünü karşılayan bir power station ev tipi konsantratörü çalıştırabilir. Yine de kullanmadan önce cihaz üreticisinin talimatlarını kontrol edin ve hekiminize danışın.</p>

<h3>Ev tipi oksijen konsantratörü kaç watt çeker?</h3>
<p>Çoğu ev tipi cihazın etiketinde yaklaşık 300–600W yazar. Gerçek değer modele ve akış ayarına göre değişir; cihazınızın etiketine bakın veya wattmetreyle ölçün.</p>

<h3>1024Wh'lik güç kaynağı oksijen cihazını kaç saat çalıştırır?</h3>
<p>350W çeken bir cihaz için yaklaşık 1024 × 0,85 ÷ 350 ≈ 2,5 saat, 500W çeken bir cihaz için yaklaşık 1,7 saat çalışır.</p>

<h3>Power station medikal UPS yerine geçer mi?</h3>
<p>Hayır. Taşınabilir güç kaynakları medikal sınıf UPS olarak sertifikalı değildir. Hekiminizin önerdiği yedek oksijen tüpü ve cihaz üreticisinin yönergeleri her zaman önceliklidir.</p>

<h3>UPS geçişinde konsantratör kapanır mı?</h3>
<p>IEETek güç kaynakları yaklaşık 10 ms içinde bataryaya geçer ve çoğu cihaz bunu fark etmez. Ancak bazı medikal cihazlar alarm verebilir veya yeniden başlayabilir; mutlaka önceden test edin.</p>

<h3>Taşınabilir oksijen konsantratörü power station ile şarj edilir mi?</h3>
<p>Genellikle evet; şarj adaptörü AC prize takılarak şarj edilebilir. Adaptörün güç değerini ve cihaz kılavuzundaki harici güç kaynağı uyarılarını kontrol edin.</p>`,
  },
];
