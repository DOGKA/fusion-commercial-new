/**
 * FusionMarkt Blog Seed V7
 * Blog 20: Deprem Çantası İçin Güç Kaynağı
 * Blog 21: Güneş Paneli Verimi: Mevsimler, Hava ve Coğrafya
 *
 * Kullanım: npx tsx scripts/seed-blogs-v7.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const blogs = [
  {
    slug: "deprem-cantasi-icin-guc-kaynagi-afete-hazirlik",
    title: "Deprem Çantası İçin Güç Kaynağı: Afete Hazırlık Rehberi",
    excerpt: "Deprem, sel veya uzun süreli elektrik kesintisinde iletişim, aydınlatma ve medikal cihazlar için taşınabilir güç kaynağı hazırlığı. AFAD önerileri ve pratik ekipman listesi.",
    category: "Enerji",
    tags: ["deprem çantası", "afet hazırlık", "acil durum", "güç kaynağı", "AFAD"],
    metaTitle: "Deprem Çantası İçin Güç Kaynağı - Afete Hazırlık Rehberi 2026",
    metaDescription: "Deprem çantanıza hangi güç kaynağını koymalısınız? Afet senaryolarında iletişim, aydınlatma ve medikal cihaz beslemesi için enerji planlaması ve ekipman önerileri.",
    metaKeywords: ["deprem çantası güç kaynağı", "afet hazırlık enerji", "acil durum güç", "deprem power bank", "AFAD güç kaynağı"],
    publishedAt: new Date("2026-02-20"),
    content: `<h2>Neden Deprem Çantasında Güç Kaynağı Olmalı?</h2>
<p>Türkiye, dünyanın en aktif deprem kuşaklarından birinde yer almaktadır. 2023 Kahramanmaraş depremleri, büyük afetlerde elektrik altyapısının günlerce hatta haftalarca devre dışı kalabildiğini acı şekilde gösterdi. Elektriksiz kalan bölgelerde:</p>
<ul>
<li><strong>İletişim kesilir:</strong> Telefon şarjı bittiğinde ailenize ulaşamazsınız, acil yardım çağıramazsınız</li>
<li><strong>Karanlıkta kalırsınız:</strong> Kış aylarında gece 16 saati bulur, aydınlatma hayati önem taşır</li>
<li><strong>Medikal cihazlar durur:</strong> CPAP, oksijen konsantratörü, insülin pompası kullananlar risk altına girer</li>
<li><strong>Bilgiye erişim kapanır:</strong> Radyo, internet ve haberler için enerji gerekir</li>
</ul>

<h2>AFAD Deprem Çantası ve Enerji Önerileri</h2>
<p>AFAD (Afet ve Acil Durum Yönetimi Başkanlığı) deprem çantasında el feneri ve yedek pil bulundurulmasını önerir. Ancak modern afet hazırlığında bunlar yeterli değildir. <strong>72 saat (3 gün) bağımsız yaşam</strong> hedeflenmelidir.</p>

<h2>Afet Senaryosu: 72 Saatlik Enerji Planı</h2>
<table>
<tr><th>İhtiyaç</th><th>Cihaz</th><th>Güç</th><th>Günlük Kullanım</th><th>3 Günlük Enerji (Wh)</th></tr>
<tr><td>İletişim</td><td>2× telefon şarjı</td><td>20W</td><td>3 saat/gün</td><td>180</td></tr>
<tr><td>Aydınlatma</td><td>LED lamba</td><td>10W</td><td>8 saat/gün</td><td>240</td></tr>
<tr><td>Bilgi</td><td>Taşınabilir radyo/modem</td><td>5W</td><td>6 saat/gün</td><td>90</td></tr>
<tr><td>Isınma (yardımcı)</td><td>Elektrikli battaniye</td><td>60W</td><td>6 saat/gece</td><td>1080</td></tr>
<tr><td>Medikal (varsa)</td><td>CPAP</td><td>30W</td><td>8 saat/gece</td><td>720</td></tr>
<tr><td><strong>Toplam (medikal hariç)</strong></td><td></td><td></td><td></td><td><strong>~1590Wh</strong></td></tr>
<tr><td><strong>Toplam (medikal dahil)</strong></td><td></td><td></td><td></td><td><strong>~2310Wh</strong></td></tr>
</table>

<h2>Model Önerileri</h2>
<h3>Temel Seviye: IEETek P800 (512Wh)</h3>
<p>İletişim + aydınlatma odaklı. 2 telefon + LED lamba için 3 gün yeterli. Kompakt ve hafif (~7kg), kolayca taşınabilir. Deprem çantası yanına koyulacak boyutta.</p>

<h3>Orta Seviye: IEETek P1800 (1024Wh)</h3>
<p>İletişim + aydınlatma + radyo/modem. SP100 güneş paneli ile birlikte kullanılırsa 72 saatin ötesine geçilebilir. Aile için önerilen minimum seviye.</p>

<h3>Kapsamlı: IEETek P2400-P3200 (2048-3200Wh)</h3>
<p>Medikal cihaz dahil tüm ihtiyaçlar. SP200 güneş paneli ile birlikte haftalarca bağımsız enerji. Çok kişilik aile veya kronik hasta bulunan haneler için.</p>

<h2>Güneş Paneli: Sınırsız Enerji Uzatma</h2>
<p>72 saatlik batarya yedeklemesi önemlidir, ancak afetlerde elektrik ne zaman geleceği belirsizdir. <strong>Güneş paneli + güç istasyonu kombinasyonu</strong> sınırsız enerji bağımsızlığı sağlar:</p>
<ul>
<li>SP100 (100W) → Güneşli günde ~400-500Wh üretim</li>
<li>SP200 (200W) → Güneşli günde ~800-1000Wh üretim</li>
</ul>
<p>Bu sayede gündüz güneş enerjisiyle şarj, gece bataryadan kullanım döngüsü kurulur.</p>

<h2>Deprem Çantası Enerji Ekipman Listesi</h2>
<ol>
<li><strong>Taşınabilir güç istasyonu</strong> (minimum P800, ideal P1800)</li>
<li><strong>Katlanır güneş paneli</strong> (SP100 veya SP200)</li>
<li><strong>USB-C şarj kabloları</strong> (telefon, tablet için)</li>
<li><strong>12V LED kamp lambası</strong> (DC5525 uyumlu, verimli)</li>
<li><strong>El tipi AM/FM radyo</strong> (USB şarjlı, dinamo + solar destekli)</li>
<li><strong>Araç şarj kablosu</strong> (12V çakmak → güç istasyonu)</li>
<li><strong>Medikal cihaz DC adaptörü</strong> (CPAP vb. kullanıyorsanız)</li>
<li><strong>Su geçirmez çanta/kılıf</strong> (güç istasyonu koruma)</li>
</ol>

<h2>Hazırlık ve Bakım İpuçları</h2>
<ul>
<li>Güç istasyonunu <strong>%60-80 şarjda</strong> depolayın (tam dolu beklemeyin)</li>
<li><strong>3 ayda bir</strong> şarj seviyesini kontrol edin ve gerekirse doldurun</li>
<li>Güneş panelini test edin — açın, bağlayın, çalıştığından emin olun</li>
<li>Tüm kabloları güç istasyonuyla birlikte saklayın</li>
<li>Aile bireylerini güç istasyonu kullanımı konusunda bilgilendirin</li>
<li>Deprem çantanızın yanında, kolay erişilebilir yerde tutun</li>
</ul>

<h2>Sonuç</h2>
<p>Deprem hazırlığında enerji planlaması su ve gıda kadar kritiktir. Taşınabilir güç istasyonu + güneş paneli kombinasyonu, afet sonrası hayatta kalma ve iletişim için en güvenilir çözümdür. <a href="/kategori/bundle-paket-urunler">FusionMarkt güç istasyonu + solar panel paket setleri</a> ile ailenizi güvence altına alın.</p>`,
  },

  {
    slug: "gunes-paneli-verimi-mevsimler-hava-durumu-cografya",
    title: "Güneş Paneli Verimi: Mevsimler, Hava Durumu ve Coğrafya Etkisi",
    excerpt: "Güneş paneli verimi yıl boyunca nasıl değişir? Kış vs yaz, bulutlu hava, Türkiye'nin güneş haritası, panel açısı ve şehir bazlı üretim tahminleri.",
    category: "Enerji",
    tags: ["güneş paneli verim", "solar panel mevsim", "güneş haritası", "panel açısı", "güneş enerjisi Türkiye"],
    metaTitle: "Güneş Paneli Verimi: Mevsim, Hava ve Konum Etkisi - FusionMarkt",
    metaDescription: "Güneş paneli verimi yıl boyunca nasıl değişir? Mevsimsel farklar, bulutlu gün etkisi, Türkiye güneş haritası, en verimli panel açısı ve şehir bazlı üretim tahminleri.",
    metaKeywords: ["güneş paneli verim", "solar panel mevsim", "güneş paneli kış verimi", "Türkiye güneş haritası", "panel açısı optimizasyon"],
    publishedAt: new Date("2026-02-20"),
    content: `<h2>Güneş Paneli Verimi Nedir?</h2>
<p>Güneş paneli verimi, panelin güneş ışığını elektrik enerjisine çevirme oranıdır. Modern monokristal panellerin verimi %20-23, polikristal panellerin %15-17 civarındadır. IEETek SP serisi güneş panelleri monokristal hücre teknolojisi ile %22-23 verimlilik sunar.</p>

<p>Ancak etiket üzerindeki verim değeri <strong>ideal laboratuvar koşullarında</strong> (STC: 25°C hücre sıcaklığı, 1000W/m² ışınım, AM 1.5 spektrum) ölçülür. Gerçek dünyada verim birçok faktöre bağlı olarak değişir.</p>

<h2>1. Mevsimsel Etki</h2>

<h3>Yaz (Haziran-Ağustos)</h3>
<ul>
<li><strong>Güneş saati:</strong> 10-14 saat/gün</li>
<li><strong>Işınım:</strong> 800-1000 W/m² (ideal)</li>
<li><strong>Panel sıcaklığı:</strong> 50-70°C (verim düşürücü!)</li>
<li><strong>Net üretim:</strong> Etiket değerinin %85-95'i</li>
</ul>
<p><strong>Paradoks:</strong> Yaz en uzun güneş süresine sahip olsa da panel sıcaklığı verimliliği %10-15 düşürür. Her 1°C sıcaklık artışı (25°C referans üzeri) verimi ~%0.35-0.45 düşürür.</p>

<h3>Kış (Aralık-Şubat)</h3>
<ul>
<li><strong>Güneş saati:</strong> 4-7 saat/gün</li>
<li><strong>Işınım:</strong> 300-600 W/m²</li>
<li><strong>Panel sıcaklığı:</strong> -5 ile +15°C (verim artırıcı!)</li>
<li><strong>Net üretim:</strong> Etiket değerinin %30-50'si (kısa gün + düşük açı)</li>
</ul>
<p>Kışın panel hücreleri soğuk olduğundan elektriksel verimlilik yüksektir, ancak kısa gün süresi ve düşük güneş açısı toplam üretimi düşürür.</p>

<h3>İlkbahar ve Sonbahar</h3>
<p>Genellikle en verimli dönemler: yeterli güneş süresi (8-10 saat) + ılıman hücre sıcaklığı (25-40°C). Etiket değerinin %70-90'ı elde edilebilir.</p>

<h3>Mevsimsel Üretim Oranları (200W Panel Örneği)</h3>
<table>
<tr><th>Mevsim</th><th>Günlük Güneş Saati</th><th>Tahmini Günlük Üretim</th><th>Etiket Oranı</th></tr>
<tr><td>Kış</td><td>4-5 saat</td><td>400-600Wh</td><td>%30-45</td></tr>
<tr><td>İlkbahar</td><td>7-9 saat</td><td>850-1100Wh</td><td>%65-80</td></tr>
<tr><td>Yaz</td><td>10-12 saat</td><td>1000-1400Wh</td><td>%75-90</td></tr>
<tr><td>Sonbahar</td><td>6-8 saat</td><td>700-950Wh</td><td>%55-70</td></tr>
</table>

<h2>2. Hava Durumu Etkisi</h2>
<table>
<tr><th>Hava Koşulu</th><th>Verimi Etkileme Oranı</th></tr>
<tr><td>Güneşli, bulutsuz</td><td><strong>%100</strong> (referans)</td></tr>
<tr><td>Parçalı bulutlu</td><td>%60-80</td></tr>
<tr><td>Tam bulutlu (kapalı)</td><td>%15-30</td></tr>
<tr><td>Yağmurlu</td><td>%10-20</td></tr>
<tr><td>Karlı (panel üzeri temiz)</td><td>%80-100 (yansıma etkisi!)</td></tr>
<tr><td>Karlı (panel üzeri kaplı)</td><td>%0-5 (temizlenmeli)</td></tr>
<tr><td>Sisli/Puslu</td><td>%25-40</td></tr>
</table>

<p><strong>İlginç bilgi:</strong> Zemindeki kar, güneş ışığını panele yansıtarak (albedo etkisi) verimlilik artışı sağlayabilir — panel üzeri temiz olmak kaydıyla!</p>

<h2>3. Türkiye Güneş Haritası ve Şehir Bazlı Üretim</h2>
<p>Türkiye, Avrupa'nın en yüksek güneşlenme potansiyeline sahip ülkelerinden biridir. Yıllık ortalama güneşlenme süresi 2.640 saattir (Almanya: ~1.600 saat).</p>

<h3>Bölgelere Göre Yıllık Güneş Enerjisi Potansiyeli</h3>
<table>
<tr><th>Bölge</th><th>Yıllık Güneşlenme (saat)</th><th>Günlük Ort. Işınım (kWh/m²)</th><th>Örnek Şehirler</th></tr>
<tr><td><strong>Güneydoğu Anadolu</strong></td><td>~2.990</td><td><strong>5.5-6.0</strong></td><td>Şanlıurfa, Diyarbakır, Mardin</td></tr>
<tr><td><strong>Akdeniz</strong></td><td>~2.950</td><td><strong>5.2-5.8</strong></td><td>Antalya, Mersin, Adana</td></tr>
<tr><td><strong>İç Anadolu</strong></td><td>~2.700</td><td>4.5-5.0</td><td>Ankara, Konya, Kayseri</td></tr>
<tr><td><strong>Ege</strong></td><td>~2.750</td><td>4.8-5.3</td><td>İzmir, Muğla, Denizli</td></tr>
<tr><td><strong>Marmara</strong></td><td>~2.400</td><td>3.8-4.5</td><td>İstanbul, Bursa, Kocaeli</td></tr>
<tr><td><strong>Karadeniz</strong></td><td>~1.900</td><td>3.0-3.8</td><td>Trabzon, Rize, Samsun</td></tr>
</table>

<h2>4. Panel Açısı Optimizasyonu</h2>
<p>Güneş panelinin güneşe dik açıda tutulması verimi maksimize eder. Optimum açı enlem derecesine ve mevsime göre değişir:</p>
<ul>
<li><strong>Yaz:</strong> Enlem - 15° (Ankara için: 40° - 15° = <strong>25°</strong>)</li>
<li><strong>Kış:</strong> Enlem + 15° (Ankara için: 40° + 15° = <strong>55°</strong>)</li>
<li><strong>Yıl boyu sabit:</strong> Enlem açısına eşit (Ankara: <strong>~40°</strong>)</li>
</ul>
<p>Taşınabilir panellerde açıyı gün içinde 2-3 kez güneşe doğru ayarlamak, sabit açıya göre <strong>%15-25 daha fazla enerji</strong> üretir.</p>

<h2>5. Verimi Etkileyen Diğer Faktörler</h2>
<ul>
<li><strong>Toz ve kir:</strong> %5-15 verim kaybı. Düzenli temizlik önemli.</li>
<li><strong>Gölgelenme:</strong> Tek hücrenin gölgelenmesi bile tüm panel verimini %50+ düşürebilir (seri bağlı panellerde). <a href="/blog/solar-panel-seri-paralel-baglanti-rehberi">Seri vs Paralel bağlantı rehberimize</a> bakın.</li>
<li><strong>Kablo uzunluğu:</strong> Uzun kablolarda voltaj düşüşü. 2m altı kablo önerilir.</li>
<li><strong>Panel yaşlanması:</strong> Yıllık %0.3-0.5 doğal degradasyon (25 yıl sonra hala %85+ verim).</li>
<li><strong>MPPT kontrolcü:</strong> IEETek güç istasyonlarındaki yerleşik MPPT, %99.9 dönüşüm verimliliği sunar.</li>
</ul>

<h2>Pratik Hesaplama Aracı</h2>
<p>Basit tahmin formülü:</p>
<p><strong>Günlük üretim (Wh) = Panel gücü (W) × Güneş saati × 0.80 (kayıp faktörü)</strong></p>
<p>Örnek: IEETek SP200 (200W), Ankara'da yaz → 200 × 10 × 0.80 = <strong>1600Wh/gün</strong></p>
<p>Aynı panel, İstanbul'da kış → 200 × 4 × 0.80 = <strong>640Wh/gün</strong></p>

<h2>Sonuç</h2>
<p>Güneş paneli verimi sabit değildir — mevsim, hava durumu, coğrafi konum ve panel açısına göre büyük farklılıklar gösterir. Türkiye'nin yüksek güneş potansiyeli, taşınabilir güneş panelleri için ideal koşullar sunar. <a href="/kategori/solar-panel">FusionMarkt güneş panelleri</a> ve <a href="/guc-hesaplayici">Güç Hesaplayıcı</a> aracımız ile enerji üretiminizi planlayın.</p>`,
  },
];

async function seed() {
  console.log("🚀 Blog V7 seed (Deprem hazırlık + Güneş paneli verim)...\n");
  for (const b of blogs) {
    const exists = await prisma.blogPost.findUnique({ where: { slug: b.slug } });
    if (exists) { console.log(`⚠️  Atlandı: ${b.slug}`); continue; }
    await prisma.blogPost.create({ data: { ...b, authorName: "FusionMarkt", status: "PUBLISHED" } });
    console.log(`✅ ${b.title}`);
  }
  console.log(`\n🎉 ${blogs.length} blog eklendi.`);
}
seed().catch(e => { console.error("❌", e); process.exit(1); }).finally(() => prisma.$disconnect());
