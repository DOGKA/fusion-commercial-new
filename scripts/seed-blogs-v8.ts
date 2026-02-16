/**
 * FusionMarkt Blog Seed V8
 * Blog 22: Balıkçılık ve Teknede Güç Kaynağı
 * Blog 23: Fotoğrafçılar ve İçerik Üreticileri İçin Saha Enerjisi
 *
 * Kullanım: npx tsx scripts/seed-blogs-v8.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const blogs = [
  {
    slug: "balikcilik-ve-teknede-tasinabilir-guc-kaynagi",
    title: "Balıkçılık ve Teknede Taşınabilir Güç Kaynağı Kullanım Rehberi",
    excerpt: "Balıkçılık ve tekne gezilerinde fish finder, can suyu pompası, aydınlatma ve iletişim cihazları için taşınabilir güç kaynağı çözümleri. Tuzlu su koruması ve enerji planlaması.",
    category: "Enerji",
    tags: ["tekne güç kaynağı", "balıkçılık enerji", "deniz güç istasyonu", "12V tekne", "marine power"],
    metaTitle: "Balıkçılık ve Tekne İçin Güç Kaynağı Rehberi - FusionMarkt",
    metaDescription: "Tekne ve balıkçılıkta taşınabilir güç kaynağı nasıl kullanılır? Fish finder, can suyu, aydınlatma beslemesi, tuzlu su koruması ve IEETek model önerileri.",
    metaKeywords: ["tekne güç kaynağı", "balıkçılık enerji", "deniz power station", "12V tekne cihaz", "marine güç kaynağı"],
    publishedAt: new Date("2026-02-21"),
    content: `<h2>Teknede Neden Taşınabilir Güç İstasyonu?</h2>
<p>Geleneksel tekne enerji sistemi motor aküleri + inverter kombinasyonuna dayanır. Ancak bu sistem ağır, bakım gerektirir ve motor çalışmadan akü hızla biter. Taşınabilir güç istasyonları, özellikle küçük tekneler, lastik botlar ve kayıklar için mükemmel bir alternatiftir:</p>
<ul>
<li><strong>Bağımsız:</strong> Tekne motoruna veya akü sistemine bağlı değildir</li>
<li><strong>Taşınabilir:</strong> İskeleden tekneye, tekneden karaya kolayca alınıp götürülebilir</li>
<li><strong>Sessiz:</strong> Balıkçılıkta ses kritiktir — motor jeneratörü balıkları ürkütür</li>
<li><strong>Güvenli:</strong> LiFePO4 batarya tuzlu su ortamında bile güvenli çalışır (kasa su geçirmez değildir, ancak batarya kimyası kararlıdır)</li>
</ul>

<h2>Teknede Kullanılan Cihazlar ve Güç Tüketimleri</h2>
<table>
<tr><th>Cihaz</th><th>Güç (W)</th><th>Günlük Kullanım</th><th>Günlük Enerji (Wh)</th></tr>
<tr><td>Fish finder / Sonar</td><td>15-30W</td><td>6 saat</td><td>90-180</td></tr>
<tr><td>GPS navigasyon</td><td>5-15W</td><td>8 saat</td><td>40-120</td></tr>
<tr><td>VHF telsiz (dinleme)</td><td>2-5W</td><td>8 saat</td><td>16-40</td></tr>
<tr><td>Can suyu pompası (sintine)</td><td>30-60W</td><td>0.5 saat</td><td>15-30</td></tr>
<tr><td>12V LED aydınlatma</td><td>10-20W</td><td>4 saat</td><td>40-80</td></tr>
<tr><td>Canlı yem havalandırıcı</td><td>5-10W</td><td>8 saat</td><td>40-80</td></tr>
<tr><td>Elektrikli olta makinesi</td><td>50-150W</td><td>1 saat</td><td>50-150</td></tr>
<tr><td>Mini buzdolabı (yem/içecek)</td><td>40-60W</td><td>12 saat (%30)</td><td>145-215</td></tr>
<tr><td>Telefon + tablet şarjı</td><td>20W</td><td>2 saat</td><td>40</td></tr>
<tr><td><strong>Toplam</strong></td><td></td><td></td><td><strong>~476-935Wh</strong></td></tr>
</table>

<h2>Model Önerileri</h2>
<h3>Günübirlik Balıkçılık</h3>
<p><strong>IEETek P800 (512Wh):</strong> Fish finder + GPS + telefon + aydınlatma için yeterli. ~7kg ile kolayca taşınır. DC5525 ve 12V araç çıkışı ile tüm 12V deniz cihazlarını besler.</p>

<h3>Hafta Sonu Tekne Gezisi</h3>
<p><strong>IEETek P1800 (1024Wh):</strong> Tüm cihazlar + mini buzdolabı. SP100 güneş paneli güverteye açılarak gün boyu şarj sağlar.</p>

<h3>Yelkenli / Uzun Seyahat</h3>
<p><strong>IEETek P2400+ (2048Wh+):</strong> Çok günlük seyahatler. SP200 panel ile sınırsız enerji döngüsü.</p>

<h2>Deniz Ortamında Koruma İpuçları</h2>
<ol>
<li><strong>Tuzlu su sıçramasından koruyun:</strong> Güç istasyonunu kabin içinde veya su geçirmez çanta/kasada saklayın</li>
<li><strong>Portları kapatın:</strong> Kullanılmayan DC/USB portlarının toz kapaklarını mutlaka kapalı tutun</li>
<li><strong>Nemden uzak tutun:</strong> Silika jel paketleri saklama çantasına koyun</li>
<li><strong>Kayma önlemi:</strong> Tekne sallanırken güç istasyonunun kaymaması için kaymaz mat veya bağlama kayışı kullanın</li>
<li><strong>Doğrudan güneşten koruyun:</strong> Güvertede güneş altında bırakmayın (aşırı ısınma)</li>
<li><strong>Her kullanım sonrası:</strong> Dış yüzeyi nemli bezle silin ve kurulayın</li>
</ol>

<h2>DC5525 ile 12V Deniz Cihazları</h2>
<p>Çoğu deniz elektroniği (fish finder, GPS, VHF, LED lamba) 12V DC ile çalışır. IEETek güç istasyonlarındaki DC5525 çıkışı (13.2V/8A) bu cihazları <strong>doğrudan ve verimli</strong> şekilde besler. AC invertere gerek kalmaz, %15-20 enerji tasarrufu sağlanır. DC5525→araç çakmak adaptörü ile tüm 12V deniz aksesuarları bağlanabilir.</p>

<h2>Sonuç</h2>
<p>Taşınabilir güç istasyonu, balıkçılık ve tekne tutkunları için sessiz, güvenli ve taşınabilir bir enerji çözümüdür. Doğru model seçimi ve deniz ortamı korumasıyla yıllarca sorunsuz kullanım sağlar. <a href="/kategori/tasinabilir-guc-kaynaklari">FusionMarkt güç istasyonlarını</a> inceleyin.</p>`,
  },

  {
    slug: "fotografcilar-icerik-ureticileri-saha-enerji-cozumleri",
    title: "Fotoğrafçılar ve İçerik Üreticileri İçin Saha Enerji Çözümleri",
    excerpt: "Outdoor fotoğraf, video prodüksiyon, drone çekimi ve canlı yayın için taşınabilir güç kaynağı kullanımı. Ekipman güç tüketimi, batarya süresi ve set kurulumu rehberi.",
    category: "Enerji",
    tags: ["fotoğrafçı güç kaynağı", "video prodüksiyon", "drone şarj", "outdoor çekim", "içerik üretici"],
    metaTitle: "Fotoğrafçılar ve İçerik Üreticileri İçin Güç Kaynağı Rehberi",
    metaDescription: "Outdoor fotoğraf, video prodüksiyon ve drone çekimi için taşınabilir güç kaynağı. Ekipman güç tüketimi tablosu, batarya süresi hesaplama ve IEETek model önerileri.",
    metaKeywords: ["fotoğrafçı güç kaynağı", "video prodüksiyon enerji", "drone şarj güç istasyonu", "outdoor çekim enerji", "canlı yayın güç"],
    publishedAt: new Date("2026-02-21"),
    content: `<h2>Sahada Enerji Sorunu</h2>
<p>Fotoğrafçılar, videograflar, drone pilotları ve içerik üreticileri için en büyük saha problemi <strong>enerji</strong>dir. Kamera bataryaları birkaç saatte biter, drone'lar 3-4 uçuş sonrası şarj ister, video ışıkları sürekli güç çeker ve laptop'ta düzenleme yapmak enerji gerektirir. Elektrik prizine erişiminiz olmayan lokasyonlarda tüm bunları çalıştırmanın tek yolu taşınabilir güç istasyonudur.</p>

<h2>Fotoğraf ve Video Ekipmanı Güç Tüketimi</h2>
<table>
<tr><th>Ekipman</th><th>Güç (W)</th><th>Kullanım Süresi</th><th>Enerji (Wh)</th></tr>
<tr><td>DSLR/Mirrorless kamera (şarj)</td><td>10-15W</td><td>3 batarya × 2 saat</td><td>60-90</td></tr>
<tr><td>Video kamera (Sony FX3, Canon C70)</td><td>15-25W (V-mount üzerinden)</td><td>6 saat</td><td>90-150</td></tr>
<tr><td>LED video ışığı (Aputure, Godox)</td><td>50-150W</td><td>4 saat</td><td>200-600</td></tr>
<tr><td>LED panel (küçük, RGB)</td><td>15-30W</td><td>4 saat</td><td>60-120</td></tr>
<tr><td>Drone batarya şarjı (DJI Mavic 3)</td><td>60-80W</td><td>4 batarya × 1.5 saat</td><td>360-480</td></tr>
<tr><td>Drone batarya şarjı (DJI Air 3)</td><td>38W</td><td>3 batarya × 1 saat</td><td>114</td></tr>
<tr><td>Dizüstü bilgisayar (video editing)</td><td>45-100W</td><td>4 saat</td><td>180-400</td></tr>
<tr><td>Taşınabilir monitör (5"/7")</td><td>8-15W</td><td>6 saat</td><td>48-90</td></tr>
<tr><td>Ses kayıt cihazı (Zoom, Tascam)</td><td>3-8W</td><td>6 saat</td><td>18-48</td></tr>
<tr><td>Gimbal (DJI RS4, Zhiyun)</td><td>15-25W</td><td>USB-C şarj × 2 kez</td><td>30-50</td></tr>
<tr><td>Canlı yayın encoder/hotspot</td><td>10-20W</td><td>4 saat</td><td>40-80</td></tr>
<tr><td>Telefon (backstage content)</td><td>20W</td><td>3 şarj</td><td>60</td></tr>
</table>

<h2>Çekim Senaryolarına Göre Enerji Planı</h2>

<h3>Senaryo 1: Outdoor Fotoğraf Çekimi (1 gün)</h3>
<p>Kamera şarjı + telefon + LED panel + laptop review = ~400Wh</p>
<p><strong>Öneri: IEETek P800 (512Wh)</strong> — Hafif (~7kg), sırt çantasında taşınabilir.</p>

<h3>Senaryo 2: Drone Çekimi + Fotoğraf (1 gün)</h3>
<p>4× drone batarya + kamera + telefon + laptop = ~700-900Wh</p>
<p><strong>Öneri: IEETek P1800 (1024Wh)</strong> — 4 DJI Mavic 3 bataryası + ekstra ekipman.</p>

<h3>Senaryo 3: Video Prodüksiyon Seti (1 gün)</h3>
<p>2× LED ışık + video kamera + gimbal + ses + monitör + laptop = ~1200-1800Wh</p>
<p><strong>Öneri: IEETek P2400 (2048Wh)</strong> — Profesyonel set için yeterli kapasite. 1800W AC çıkış ile büyük LED'ler bile sorunsuz.</p>

<h3>Senaryo 4: Çok Günlük Doğa Belgeseli</h3>
<p>Tüm ekipman × 3+ gün</p>
<p><strong>Öneri: IEETek P3200 (3200Wh) + SP200 güneş paneli</strong> — Gündüz solar şarj, gece kullanım döngüsü ile sınırsız çekim.</p>

<h2>USB-C PD: Fotoğrafçının En İyi Dostu</h2>
<p>Modern fotoğraf ve video ekipmanlarının çoğu USB-C PD ile şarj edilebilir:</p>
<ul>
<li><strong>Laptop (MacBook, Dell XPS):</strong> USB-C PD 65-100W</li>
<li><strong>Kamera bataryası (Sony NP-FZ100 vb.):</strong> USB-C şarj cihazı ile</li>
<li><strong>DJI RC kontrolcü:</strong> USB-C PD 30W</li>
<li><strong>Gimbal:</strong> USB-C PD 18-25W</li>
<li><strong>Ses kayıt cihazı:</strong> USB-C 5-10W</li>
</ul>
<p>IEETek güç istasyonlarının 100W USB-C PD çıkışıyla tüm bu cihazları doğrudan ve verimli şekilde şarj edebilirsiniz. AC çıkışa kıyasla %15-20 enerji tasarrufu.</p>

<h2>Saha Kurulum İpuçları</h2>
<ol>
<li><strong>Güç istasyonunu gölgede tutun:</strong> Set alanında doğrudan güneş altında bırakmayın</li>
<li><strong>Şarj önceliği belirleyin:</strong> Önce drone bataryaları (en çok süre alan), ardından kamera, en son laptop</li>
<li><strong>DC çıkışları tercih edin:</strong> 12V LED ışıklar için DC5525, küçük cihazlar için USB — AC'den kaçının</li>
<li><strong>Uzatma kablosu taşıyın:</strong> Güç istasyonunu set merkezinden uzakta güvenli yere koyun</li>
<li><strong>Yedek plan:</strong> Kritik çekimlerde bir araç şarj kablosu bulundurun — acil durumda araçtan şarj</li>
<li><strong>Solar panel:</strong> Uzun günlerde güneş panelini sabahtan kurup arka planda şarj edin</li>
</ol>

<h2>Canlı Yayın (Live Streaming) İçin Güç Planı</h2>
<p>Outdoor canlı yayın: kamera + encoder + 4G hotspot + monitör + aydınlatma = ~100-200W sürekli</p>
<p>4 saatlik yayın = 400-800Wh. <strong>P1800 (1024Wh) ile 4+ saatlik kesintisiz yayın mümkün.</strong></p>

<h2>Sonuç</h2>
<p>Taşınabilir güç istasyonu, profesyonel fotoğrafçılar ve içerik üreticileri için sahada bağımsızlık demektir. Doğru model seçimiyle drone'dan LED ışığa, laptop'tan gimbal'a kadar tüm ekipmanınızı besleyebilirsiniz. <a href="/kategori/tasinabilir-guc-kaynaklari">FusionMarkt güç istasyonları</a> ile çekimlerinizi enerjisiz bırakmayın.</p>`,
  },
];

async function seed() {
  console.log("🚀 Blog V8 seed (Balıkçılık/Tekne + Fotoğrafçı/İçerik Üretici)...\n");
  for (const b of blogs) {
    const exists = await prisma.blogPost.findUnique({ where: { slug: b.slug } });
    if (exists) { console.log(`⚠️  Atlandı: ${b.slug}`); continue; }
    await prisma.blogPost.create({ data: { ...b, authorName: "FusionMarkt", status: "PUBLISHED" } });
    console.log(`✅ ${b.title}`);
  }
  console.log(`\n🎉 ${blogs.length} blog eklendi.`);
}
seed().catch(e => { console.error("❌", e); process.exit(1); }).finally(() => prisma.$disconnect());
