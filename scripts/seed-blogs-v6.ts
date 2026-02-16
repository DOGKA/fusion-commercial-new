/**
 * FusionMarkt Blog Seed V6
 * Blog 18: Saf Sinüs vs Modifiye Sinüs Dalga
 * Blog 19: CPAP Kullananlar İçin Güç Kaynağı
 *
 * Kullanım: npx tsx scripts/seed-blogs-v6.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const blogs = [
  {
    slug: "saf-sinus-dalga-vs-modifiye-sinus-fark-nedir",
    title: "Saf Sinüs Dalga vs Modifiye Sinüs: Neden Önemli? Hangi Cihazlar Hangisini Gerektirir?",
    excerpt: "Güç istasyonlarında ve inverterlerde saf sinüs dalga ile modifiye sinüs dalga arasındaki fark nedir? Hassas elektronik cihazlar için neden saf sinüs şart? Teknik karşılaştırma.",
    category: "Enerji",
    tags: ["saf sinüs dalga", "modifiye sinüs", "inverter", "pure sine wave", "güç kalitesi"],
    metaTitle: "Saf Sinüs vs Modifiye Sinüs Dalga: Fark Nedir? - FusionMarkt",
    metaDescription: "Saf sinüs dalga ve modifiye sinüs dalga inverter arasındaki fark. Hangi cihazlar saf sinüs gerektirir? Kompresör, CPAP, hassas elektronik uyumluluk rehberi.",
    metaKeywords: ["saf sinüs dalga", "modifiye sinüs dalga", "pure sine wave", "inverter farkı", "güç istasyonu inverter"],
    publishedAt: new Date("2026-02-19"),
    content: `<h2>Sinüs Dalga Nedir?</h2>
<p>Evinizdeki duvar prizinden gelen 220V AC elektrik, <strong>saf sinüs dalga</strong> formundadır. Bu, voltajın zaman içinde düzgün ve sürekli bir eğri çizmesi demektir. Tüm ev aletleri, elektronik cihazlar ve endüstriyel ekipmanlar bu dalga formuna göre tasarlanmıştır.</p>

<p>Bir güç istasyonu veya inverter, bataryadaki DC (doğru akım) enerjiyi AC (alternatif akım) enerjiye çevirirken bu dalga formunu <strong>simüle eder</strong>. Ne kadar başarılı simüle ederse, çıkış o kadar şebeke elektriğine yakın olur.</p>

<h2>İki Dalga Formu Arasındaki Fark</h2>

<h3>Saf Sinüs Dalga (Pure Sine Wave)</h3>
<p>Şebeke elektriğiyle neredeyse aynı temiz, düzgün sinüzoidal dalga formu üretir. <strong>THD (Total Harmonic Distortion)</strong> değeri %3'ün altındadır. IEETek güç istasyonlarının tümü saf sinüs dalga inverter kullanır.</p>

<h3>Modifiye Sinüs Dalga (Modified Sine Wave)</h3>
<p>Kademeli kare dalga formudur — sinüs eğrisini kabaca taklit eder ama gerçek bir sinüs değildir. THD değeri %25-40 arasıdır. Ucuz inverterlerde ve eski güç kaynaklarında bulunur.</p>

<h2>Neden Saf Sinüs Önemli?</h2>

<h3>1. Kompresörlü Cihazlar</h3>
<p><strong>Buzdolabı, klima, dondurucu:</strong> Kompresör motoru başlangıçta çok yüksek anlık akım çeker (inrush current). Modifiye sinüs bu akımı düzgün sağlayamaz ve kompresör çalışmayabilir, vızıldayabilir veya aşırı ısınabilir. Saf sinüs ile kompresör sorunsuz başlar ve verimli çalışır.</p>

<h3>2. Medikal Cihazlar</h3>
<p><strong>CPAP, oksijen konsantratörü, nebülizör:</strong> Bu cihazlar hassas motor ve kontrol devreleri içerir. Modifiye sinüs bozuk dalga formu, motorda ses ve titreşim yaratır, sensörleri bozabilir. <strong>FDA ve medikal cihaz üreticileri saf sinüs dalga zorunluluğu belirtir.</strong></p>

<h3>3. Hassas Elektronikler</h3>
<p><strong>Dizüstü bilgisayar, masaüstü PC, NAS, monitör:</strong> Güç kaynağı (PSU) içindeki aktif PFC devresi modifiye sinüs ile uyumsuz çalışabilir. Sonuç: bilgisayar kapanabilir, veri kaybı yaşanabilir. Saf sinüs ile sorunsuz çalışır.</p>

<h3>4. Ses ve Görüntü Ekipmanları</h3>
<p><strong>Amplifikatör, mikser, profesyonel kamera:</strong> Modifiye sinüs elektromanyetik gürültü üretir. Bu gürültü hoparlörlerde "uğultu", kamerada görüntü bozulması olarak ortaya çıkar. Saf sinüs ile stüdyo kalitesinde temiz güç sağlanır.</p>

<h3>5. Şarj Cihazları</h3>
<p><strong>Drone, e-bisiklet, elektrikli alet şarj cihazları:</strong> Bazı akıllı şarj cihazları modifiye sinüs algıladığında çalışmayı reddeder (güvenlik mekanizması). Saf sinüs ile tüm şarj cihazları sorunsuz çalışır.</p>

<h2>Karşılaştırma Tablosu</h2>
<table>
<tr><th>Kriter</th><th>Saf Sinüs Dalga</th><th>Modifiye Sinüs Dalga</th></tr>
<tr><td>Dalga formu</td><td>Düzgün sinüzoidal eğri</td><td>Kademeli kare dalga</td></tr>
<tr><td>THD</td><td>&lt;3%</td><td>%25-40</td></tr>
<tr><td>Kompresörlü cihazlar</td><td><strong>Sorunsuz</strong></td><td>Çalışmayabilir / aşırı ısınma</td></tr>
<tr><td>Medikal cihazlar</td><td><strong>Güvenli</strong></td><td>Riskli / önerilmez</td></tr>
<tr><td>Hassas elektronik</td><td><strong>Uyumlu</strong></td><td>Veri kaybı riski</td></tr>
<tr><td>Ses ekipmanları</td><td><strong>Sessiz / temiz</strong></td><td>Uğultu / gürültü</td></tr>
<tr><td>Motor verimliliği</td><td><strong>%100</strong></td><td>%70-80 (ısı kaybı)</td></tr>
<tr><td>Enerji verimliliği</td><td><strong>%90-95</strong></td><td>%75-85</td></tr>
<tr><td>Fiyat</td><td>Daha yüksek</td><td>Daha uygun</td></tr>
</table>

<h3>Hangi Cihazlar Modifiye Sinüs ile Çalışır?</h3>
<p>Basit rezistif yükler modifiye sinüs ile sorunsuz çalışır:</p>
<ul>
<li>Akkor ampuller (LED değil!)</li>
<li>Basit ısıtıcılar (motor içermeyen)</li>
<li>Basit şarj aletleri (akıllı olmayan)</li>
<li>Havya</li>
</ul>

<h2>IEETek Güç İstasyonlarında Saf Sinüs</h2>
<p>IEETek'in tüm güç istasyonları — P800, P1800, P2400, P3200, Singo serisi ve SH4000 — <strong>saf sinüs dalga inverter</strong> kullanır. Bu, her cihazınızı güvenle çalıştırabileceğiniz anlamına gelir.</p>

<h2>Sonuç</h2>
<p>Güç istasyonu veya inverter alırken <strong>mutlaka saf sinüs dalga (pure sine wave) olduğundan emin olun</strong>. Modifiye sinüs ucuz olabilir ama cihazlarınıza zarar verebilir ve medikal ekipmanlarla kullanımı tehlikelidir. <a href="/kategori/tasinabilir-guc-kaynaklari">FusionMarkt'taki tüm IEETek güç istasyonları</a> saf sinüs dalga teknolojisi ile donatılmıştır.</p>`,
  },

  {
    slug: "cpap-cihazi-icin-tasinabilir-guc-kaynagi-rehberi",
    title: "CPAP Cihazı Kullananlar İçin Taşınabilir Güç Kaynağı Seçim Rehberi",
    excerpt: "Uyku apnesi tedavisinde CPAP cihazınızı kamp, seyahat veya elektrik kesintisinde çalıştırın. CPAP güç tüketimi, batarya süresi hesaplama ve model önerileri.",
    category: "Enerji",
    tags: ["CPAP", "uyku apnesi", "CPAP güç kaynağı", "medikal güç", "seyahat CPAP"],
    metaTitle: "CPAP İçin Güç Kaynağı: Uyku Apnesi Seyahat ve Kamp Rehberi",
    metaDescription: "CPAP cihazı ile kamp veya seyahatte nasıl uyursunuz? Güç tüketimi hesaplama, kaç gece dayanır, DC vs AC şarj, saf sinüs zorunluluğu ve IEETek model önerileri.",
    metaKeywords: ["CPAP güç kaynağı", "uyku apnesi kamp", "CPAP taşınabilir batarya", "CPAP power station", "CPAP seyahat"],
    publishedAt: new Date("2026-02-19"),
    content: `<h2>CPAP ve Taşınabilir Güç Kaynağı: Hayati Bir Kombinasyon</h2>
<p><strong>CPAP (Continuous Positive Airway Pressure)</strong> cihazı, uyku apnesi tedavisinde kullanılan ve uykuda sürekli pozitif hava basıncı sağlayan medikal cihazdır. CPAP kullanıcıları için bu cihaz hayati önem taşır — bir gece bile kullanmamak oksijen düşüşü, kalp ritim bozukluğu ve ciddi sağlık riskleri yaratabilir.</p>

<p>Kamp, seyahat veya elektrik kesintisinde CPAP kullanıcılarının en büyük endişesi "cihazımı nasıl çalıştıracağım?" sorusudur. Taşınabilir güç istasyonları bu sorunun en güvenilir çözümüdür.</p>

<h2>CPAP Cihazlarının Güç Tüketimi</h2>
<table>
<tr><th>CPAP Modu</th><th>Ortalama Güç Tüketimi</th><th>8 Saatlik Enerji İhtiyacı</th></tr>
<tr><td>Nemlendirici KAPALI, düşük basınç</td><td>15-25W</td><td>120-200Wh</td></tr>
<tr><td>Nemlendirici KAPALI, orta basınç</td><td>25-40W</td><td>200-320Wh</td></tr>
<tr><td>Nemlendirici KAPALI, yüksek basınç</td><td>35-50W</td><td>280-400Wh</td></tr>
<tr><td>Nemlendirici AÇIK, düşük ısı</td><td>40-55W</td><td>320-440Wh</td></tr>
<tr><td>Nemlendirici AÇIK, yüksek ısı</td><td>50-75W</td><td>400-600Wh</td></tr>
<tr><td>Isıtmalı hortum + nemlendirici</td><td>60-90W</td><td>480-720Wh</td></tr>
</table>
<p><strong>Not:</strong> Gerçek tüketim cihaz markası (ResMed, Philips, Fisher & Paykel), basınç ayarı ve nemlendirici kullanımına göre değişir.</p>

<h2>Kaç Gece Dayanır? Model Bazlı Hesaplama</h2>
<p>CPAP nemlendirici KAPALI, orta basınçta ~30W ortalama tüketimle hesaplama:</p>
<table>
<tr><th>IEETek Model</th><th>Kapasite</th><th>CPAP Çalışma Süresi (DC)</th><th>Kaç Gece?</th></tr>
<tr><td>P800</td><td>512Wh</td><td>~15 saat</td><td><strong>~1.5-2 gece</strong></td></tr>
<tr><td>P1800</td><td>1024Wh</td><td>~31 saat</td><td><strong>~3-4 gece</strong></td></tr>
<tr><td>Singo2000 PRO</td><td>1920Wh</td><td>~58 saat</td><td><strong>~7 gece</strong></td></tr>
<tr><td>P2400</td><td>2048Wh</td><td>~62 saat</td><td><strong>~7-8 gece</strong></td></tr>
<tr><td>P3200</td><td>2048Wh</td><td>~65 saat</td><td><strong>~8 gece</strong></td></tr>
</table>
<p><em>DC5525 veya USB-C PD ile bağlantıda hesaplanmıştır. AC ile bağlantıda %15-20 daha kısa sürer.</em></p>

<h2>CPAP Güç Kaynağı Seçerken 5 Zorunlu Kriter</h2>

<h3>1. Saf Sinüs Dalga İnverter (ZORUNLU)</h3>
<p>CPAP cihazları hassas motor ve sensörler içerir. <strong>Modifiye sinüs dalga inverterle ASLA kullanılmamalıdır</strong> — motor gürültüsü, sensör hatası ve cihaz arızası riski vardır. IEETek güç istasyonlarının tümü saf sinüs dalga inverter kullanır. (Detay: <a href="/blog/saf-sinus-dalga-vs-modifiye-sinus-fark-nedir">Saf Sinüs vs Modifiye Sinüs rehberimiz</a>)</p>

<h3>2. DC Çıkış Kullanın (Verimlilik)</h3>
<p>CPAP'ınızı AC priz yerine <strong>DC5525 veya USB-C PD çıkıştan</strong> beslediğinizde %15-20 enerji tasarrufu sağlarsınız. Çoğu CPAP markasının resmi DC adaptör kablosu mevcuttur:</p>
<ul>
<li><strong>ResMed AirSense 10/11:</strong> 24V DC adaptör kablosu</li>
<li><strong>Philips DreamStation:</strong> 12V DC kablosu (DC5525 uyumlu!)</li>
<li><strong>Fisher & Paykel SleepStyle:</strong> 12V DC kablosu</li>
</ul>
<p>(Detay: <a href="/blog/dc5525-cikis-nedir-hangi-cihazlar-kullanilir">DC5525 çıkış rehberimiz</a>)</p>

<h3>3. Sessiz Çalışma</h3>
<p>CPAP cihazı gece boyunca çalışır — güç kaynağınız da sessiz olmalıdır. IEETek güç istasyonları DC çıkışta tamamen sessizdir (inverter fanı çalışmaz). AC modda bile fan sesi minimumdur.</p>

<h3>4. Yeterli Kapasite</h3>
<p>En az 2 gece yedek planlayın. Hafta sonu kampı için <strong>P1800 (1024Wh)</strong>, haftalık seyahat için <strong>P2400 veya üzeri</strong> önerilir. Güneş paneli ile birlikte kullanırsanız sınırsız süre uzatılabilir.</p>

<h3>5. UPS / Kesintisiz Geçiş</h3>
<p>Evde CPAP kullananlar için elektrik kesintisi kritiktir. UPS özellikli güç istasyonu (SH4000 gibi) 10ms içinde bataryaya geçer — CPAP hiç durmaz, siz uyurken bile fark etmezsiniz.</p>

<h2>CPAP + Güç Kaynağı Kullanım İpuçları</h2>
<ol>
<li><strong>Nemlendiriciyi kapatın veya düşük ayarda kullanın:</strong> Nemlendirici ve ısıtmalı hortum enerji tüketimini 2-3 kat artırır</li>
<li><strong>DC adaptör kablosu satın alın:</strong> CPAP markanıza uygun resmi DC kablosu ile %15-20 tasarruf</li>
<li><strong>EPR/AutoRamp özelliğini kullanın:</strong> Bu modlar basıncı dinamik ayarlayarak enerji tasarrufu sağlar</li>
<li><strong>Seyahattan önce test edin:</strong> Evde bir gece güç kaynağıyla CPAP kullanarak gerçek tüketimi ölçün</li>
<li><strong>Yedek pil planı yapın:</strong> Kritik seyahatlerde %20 yedek bırakın veya ikinci bir şarj kaynağı (solar panel, araç şarjı) bulundurun</li>
<li><strong>Cihaz ayarlarını not edin:</strong> Basınç değeri, nemlendirici seviyesi ve hortum ısısı not alın — güç hesaplamasında gerekir</li>
</ol>

<h2>Sonuç</h2>
<p>CPAP kullanıcıları için taşınabilir güç kaynağı lüks değil, sağlık güvencesidir. Doğru model seçimiyle kamp, seyahat ve elektrik kesintilerinde güvenle uyuyabilirsiniz. <a href="/kategori/tasinabilir-guc-kaynaklari">FusionMarkt güç istasyonları</a> — tümü saf sinüs dalga, DC5525 çıkış ve LiFePO4 batarya ile donatılmıştır.</p>`,
  },
];

async function seed() {
  console.log("🚀 Blog V6 seed (Saf Sinüs + CPAP)...\n");
  for (const b of blogs) {
    const exists = await prisma.blogPost.findUnique({ where: { slug: b.slug } });
    if (exists) { console.log(`⚠️  Atlandı: ${b.slug}`); continue; }
    await prisma.blogPost.create({ data: { ...b, authorName: "FusionMarkt", status: "PUBLISHED" } });
    console.log(`✅ ${b.title}`);
  }
  console.log(`\n🎉 ${blogs.length} blog eklendi.`);
}
seed().catch(e => { console.error("❌", e); process.exit(1); }).finally(() => prisma.$disconnect());
