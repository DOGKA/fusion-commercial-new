/**
 * FusionMarkt Blog Seed V10
 * Blog 26: Festival ve Açık Hava Etkinlikleri İçin Enerji
 * Blog 27: İnşaat ve Şantiye Sahası İçin Güç Kaynağı
 *
 * Kullanım: npx tsx scripts/seed-blogs-v10.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const blogs = [
  {
    slug: "festival-acik-hava-etkinlikleri-enerji-planlamasi",
    title: "Festival ve Açık Hava Etkinlikleri İçin Taşınabilir Enerji Planlaması",
    excerpt: "Müzik festivali, fuar, outdoor düğün ve açık hava etkinlikleri için taşınabilir güç kaynağı kullanımı. Stand beslemesi, ses sistemi, aydınlatma ve şarj istasyonu kurulumu.",
    category: "Enerji",
    tags: ["festival güç kaynağı", "açık hava etkinlik", "fuar enerji", "şarj istasyonu", "outdoor etkinlik"],
    metaTitle: "Festival ve Açık Hava Etkinlikleri İçin Güç Kaynağı Rehberi",
    metaDescription: "Müzik festivali, fuar ve outdoor etkinlikler için taşınabilir güç kaynağı. Stand beslemesi, ses sistemi, aydınlatma ve ziyaretçi şarj istasyonu kurulumu rehberi.",
    metaKeywords: ["festival güç kaynağı", "açık hava etkinlik enerji", "fuar stand elektrik", "outdoor düğün enerji", "şarj istasyonu kurulumu"],
    publishedAt: new Date("2026-02-23"),
    content: `<h2>Açık Hava Etkinliklerinde Enerji İhtiyacı</h2>
<p>Müzik festivalleri, fuar standları, outdoor düğünler, spor etkinlikleri ve kurumsal açık hava organizasyonları enerji-yoğun etkinliklerdir. Geleneksel çözüm olan dizel jeneratörler gürültülü, kokulu ve çevre kirliliği yaratır. Taşınabilir güç istasyonları, küçük-orta ölçekli etkinliklerde <strong>sessiz, temiz ve pratik</strong> bir alternatif sunar.</p>

<h2>Etkinlik Türüne Göre Güç İhtiyacı</h2>

<h3>Küçük Stand / Pazar Tezgahı</h3>
<table>
<tr><th>Cihaz</th><th>Güç</th><th>Süre</th><th>Enerji</th></tr>
<tr><td>Yazarkasa / POS cihazı</td><td>15W</td><td>8 saat</td><td>120Wh</td></tr>
<tr><td>LED aydınlatma</td><td>20W</td><td>6 saat</td><td>120Wh</td></tr>
<tr><td>Telefon + tablet</td><td>20W</td><td>4 saat</td><td>80Wh</td></tr>
<tr><td>Küçük buzdolabı (numune)</td><td>50W ort.</td><td>8 saat</td><td>400Wh</td></tr>
<tr><td><strong>Toplam</strong></td><td></td><td></td><td><strong>~720Wh</strong></td></tr>
</table>
<p><strong>Öneri: IEETek P800 veya P1800</strong></p>

<h3>Orta Ölçekli Etkinlik (Outdoor Düğün, Küçük Festival)</h3>
<table>
<tr><th>Cihaz</th><th>Güç</th><th>Süre</th><th>Enerji</th></tr>
<tr><td>Bluetooth hoparlör sistemi</td><td>50-100W</td><td>6 saat</td><td>300-600Wh</td></tr>
<tr><td>LED dekoratif aydınlatma</td><td>100W</td><td>5 saat</td><td>500Wh</td></tr>
<tr><td>Projeksiyon / ekran</td><td>150-300W</td><td>3 saat</td><td>450-900Wh</td></tr>
<tr><td>Kahve makinesi (espresso)</td><td>1000-1500W</td><td>0.5 saat</td><td>500-750Wh</td></tr>
<tr><td>Telefon şarj noktaları</td><td>60W (6 port)</td><td>6 saat</td><td>360Wh</td></tr>
<tr><td><strong>Toplam</strong></td><td></td><td></td><td><strong>~2100-3110Wh</strong></td></tr>
</table>
<p><strong>Öneri: IEETek P3200 veya 2× P1800</strong></p>

<h2>Ziyaretçi Şarj İstasyonu Kurulumu</h2>
<p>Festival ve fuarlarda en çok talep edilen hizmetlerden biri <strong>telefon şarj noktası</strong>dır. Güç istasyonuyla kolayca kurulabilir:</p>
<ul>
<li><strong>USB-A portları (4-6 adet):</strong> Kablolu şarj noktası. Her biri ~10W, toplam ~60W</li>
<li><strong>USB-C PD portları (2 adet):</strong> Hızlı şarj isteyenler için, ~100W</li>
<li><strong>Kablosuz şarj padleri:</strong> Masaya gömülü Qi şarj, ~15W/adet</li>
</ul>
<p>IEETek P1800 ile 6 USB portu + 2 USB-C PD çıkışı ile aynı anda <strong>8 cihaz</strong> şarj edilebilir. 1024Wh kapasiteyle 150+ telefon şarjı mümkündür.</p>

<h2>Ses Sistemi Beslemesi</h2>
<p>Küçük-orta boy ses sistemleri (200-500W RMS) güç istasyonuyla rahatlıkla beslenebilir. Kritik noktalar:</p>
<ul>
<li><strong>Saf sinüs dalga şart:</strong> Modifiye sinüs dalga amplifikatörlerde uğultu ve distorsiyon yaratır. IEETek güç istasyonlarının tümü saf sinüs dalga çıkışı sunar.</li>
<li><strong>Başlangıç akımına dikkat:</strong> Amplifikatörler açılırken kısa süreli pik güç çeker. P1800'ün 3600W pik gücü bu tür yükleri kaldırır.</li>
<li><strong>Topraklama:</strong> Uğultu sorunlarını önlemek için güç istasyonunun topraklama noktasını kullanın.</li>
</ul>

<h2>Solar Panel ile Gün Boyu Enerji Döngüsü</h2>
<p>Açık hava etkinliklerinde güneş panelini sabahtan kurup gün boyu şarj döngüsü oluşturabilirsiniz:</p>
<ul>
<li>09:00-11:00: Solar şarj başlar, düşük yük</li>
<li>11:00-15:00: Maksimum solar üretim, etkinlik yükü karşılanır</li>
<li>15:00-18:00: Solar azalır, bataryadan desteklenir</li>
<li>18:00-22:00: Tamamen bataryadan — gece aydınlatma ve ses</li>
</ul>
<p>SP200 güneş paneli + P2400 kombinasyonuyla 8-10 saatlik bir outdoor etkinlik kesintisiz yürütülebilir.</p>

<h2>Pratik İpuçları</h2>
<ol>
<li><strong>Uzatma kablosu ve çoklu priz taşıyın:</strong> Güç istasyonunu güvenli, gölgeli bir yere koyup uzatma ile dağıtın</li>
<li><strong>Çalınmaya karşı koruyun:</strong> Kilitlenebilir çelik kasa veya bağlama kayışı kullanın</li>
<li><strong>Toz ve su koruması:</strong> Outdoor ortamda toz kapakları kapalı tutun</li>
<li><strong>Gece için tam şarjla başlayın:</strong> Gece aydınlatma en çok enerji tüketen bileşendir</li>
<li><strong>Yedek plan:</strong> Kritik etkinliklerde ikinci bir güç istasyonu veya araç şarj kablosu bulundurun</li>
<li><strong>Marka görünürlüğü:</strong> Güç istasyonunuzun yanına "Enerji Sponsoru: FusionMarkt" tabelası koyarak etkinlik sponsorluğu yapabilirsiniz</li>
</ol>

<h2>Sonuç</h2>
<p>Taşınabilir güç istasyonları, açık hava etkinliklerinde jeneratörün sessiz ve temiz alternatifidir. Doğru kapasite planlamasıyla küçük bir pazar tezgahından orta ölçekli bir outdoor düğüne kadar her etkinliğe enerji sağlayabilirsiniz. <a href="/kategori/tasinabilir-guc-kaynaklari">FusionMarkt güç istasyonları</a> ile etkinliklerinizi güçlendirin.</p>`,
  },

  {
    slug: "insaat-santiye-sahasi-tasinabilir-enerji-cozumleri",
    title: "İnşaat ve Şantiye Sahası İçin Taşınabilir Enerji Çözümleri",
    excerpt: "Şantiye, inşaat sahası ve dış mekan projelerde taşınabilir güç kaynağı ile elektrikli alet besleme. Matkap, hilti, kompresör uyumu, saha aydınlatma ve güvenlik kamerası.",
    category: "Enerji",
    tags: ["şantiye güç kaynağı", "inşaat enerji", "elektrikli alet", "saha aydınlatma", "portatif elektrik"],
    metaTitle: "İnşaat ve Şantiye İçin Taşınabilir Güç Kaynağı Rehberi",
    metaDescription: "Şantiye ve inşaat sahasında taşınabilir güç istasyonu ile elektrikli alet, aydınlatma, güvenlik kamerası ve iletişim cihazı beslemesi. Pratik enerji çözümleri.",
    metaKeywords: ["şantiye güç kaynağı", "inşaat portatif elektrik", "elektrikli alet güç kaynağı", "saha aydınlatma", "şantiye enerji çözümü"],
    publishedAt: new Date("2026-02-23"),
    content: `<h2>Şantiyede Taşınabilir Güç İhtiyacı</h2>
<p>İnşaat şantiyelerinde, özellikle projenin erken aşamalarında veya uzak lokasyonlarda şebeke elektriği bulunmayabilir. Geleneksel çözüm olan dizel jeneratörler gürültülü, bakım gerektiren ve yakıt maliyeti yüksek cihazlardır. Taşınabilir güç istasyonları, orta güçlü elektrikli aletler ve saha ekipmanları için sessiz, emisyonsuz ve bakımsız bir alternatif sunar.</p>

<h2>Şantiye Ekipmanı Güç Tüketimi</h2>

<h3>Elektrikli El Aletleri</h3>
<table>
<tr><th>Alet</th><th>Güç (W)</th><th>Tipik Kullanım</th><th>Enerji/Saat (Wh)</th></tr>
<tr><td>Akülü matkap (şarj)</td><td>60-100W</td><td>Batarya şarjı</td><td>60-100</td></tr>
<tr><td>Kablolu darbeli matkap</td><td>600-1000W</td><td>Aralıklı kullanım</td><td>200-400</td></tr>
<tr><td>Avuç taşlama (115mm)</td><td>700-900W</td><td>Aralıklı</td><td>250-350</td></tr>
<tr><td>Daire testere</td><td>1200-1800W</td><td>Kısa süreli</td><td>300-500</td></tr>
<tr><td>Hilti (SDS kırıcı-delici)</td><td>800-1500W</td><td>Aralıklı</td><td>300-600</td></tr>
<tr><td>Elektrikli vidalama (şarj)</td><td>40-60W</td><td>Batarya şarjı</td><td>40-60</td></tr>
<tr><td>Kompresör (küçük)</td><td>1000-1500W</td><td>Aralıklı</td><td>400-600</td></tr>
</table>

<h3>Saha Desteği</h3>
<table>
<tr><th>Ekipman</th><th>Güç (W)</th><th>Süre</th><th>Günlük Enerji (Wh)</th></tr>
<tr><td>LED saha aydınlatma (2 adet)</td><td>100W</td><td>4 saat</td><td>400</td></tr>
<tr><td>Güvenlik kamerası + NVR</td><td>30-50W</td><td>24 saat</td><td>720-1200</td></tr>
<tr><td>WiFi modem (saha ofis)</td><td>10W</td><td>10 saat</td><td>100</td></tr>
<tr><td>Laptop (proje yönetimi)</td><td>65W</td><td>4 saat</td><td>260</td></tr>
<tr><td>Su ısıtıcı (çay/kahve)</td><td>1000-2000W</td><td>0.3 saat</td><td>300-600</td></tr>
<tr><td>Telefon şarjı (ekip)</td><td>60W</td><td>3 saat</td><td>180</td></tr>
</table>

<h2>Senaryo Bazlı Çözümler</h2>

<h3>Senaryo 1: Akülü Alet Şarj İstasyonu</h3>
<p>Şantiyede en yaygın kullanım: akülü matkap, vidalama ve avuç taşlama bataryalarının şarjı.</p>
<p><strong>IEETek P800 (512Wh):</strong> 5-8 akülü alet bataryasını tam şarj eder. Portatif, tek kişi taşır.</p>

<h3>Senaryo 2: Kablolu Alet Beslemesi</h3>
<p>Darbeli matkap (1000W) + avuç taşlama (800W) aralıklı kullanım.</p>
<p><strong>IEETek P1800 (1024Wh, 1800W çıkış):</strong> 1800W sürekli çıkış ile çoğu kablolu aleti besler. 3600W pik güç ile başlangıç akımlarını kaldırır. 2-3 saatlik aktif çalışmaya yeterli.</p>

<h3>Senaryo 3: Saha Ofis + Aydınlatma + Güvenlik</h3>
<p>Laptop + LED aydınlatma + kamera + WiFi + telefon şarjı = ~1500-2000Wh/gün</p>
<p><strong>IEETek P2400 (2048Wh) + SP200 güneş paneli:</strong> Gündüz solar şarj, gece bataryadan aydınlatma ve kamera. Sınırsız döngü.</p>

<h3>Senaryo 4: Ağır İnşaat (Hilti + Kompresör + Testere)</h3>
<p>2000W+ sürekli yük gerektiren ağır aletler.</p>
<p><strong>IEETek P3200 (3200Wh, 3200W çıkış):</strong> Hilti, daire testere ve küçük kompresörü çalıştırabilir. Yarım günlük yoğun saha çalışması için yeterli. Solar panel ile öğle arası şarj.</p>

<h2>Saf Sinüs Dalga ve Elektrikli Aletler</h2>
<p>Endüktif yük içeren elektrikli aletler (motor tahrikli) saf sinüs dalga gerektirir. Modifiye sinüs dalga ile çalışan motorlar:</p>
<ul>
<li>Aşırı ısınır</li>
<li>Tork kaybeder (%20-30 düşük performans)</li>
<li>Ömrü kısalır</li>
<li>Gürültülü çalışır</li>
</ul>
<p>IEETek güç istasyonlarının tümü saf sinüs dalga çıkışı sağlar — tüm elektrikli aletlerle tam uyumludur.</p>

<h2>Şantiye Güç Kaynağı Avantajları (vs Jeneratör)</h2>
<table>
<tr><th>Kriter</th><th>Güç İstasyonu</th><th>Dizel Jeneratör</th></tr>
<tr><td>Gürültü</td><td><strong>Sessiz (0 dB)</strong></td><td>70-90 dB</td></tr>
<tr><td>Egzoz</td><td><strong>Sıfır</strong></td><td>CO, NOx, partikül</td></tr>
<tr><td>İç mekan kullanımı</td><td><strong>Güvenli</strong></td><td>Yasak (CO riski)</td></tr>
<tr><td>Bakım</td><td><strong>Sıfır</strong></td><td>Yağ, filtre, buji</td></tr>
<tr><td>Yakıt maliyeti</td><td><strong>Sıfır</strong> (solar ile bedava)</td><td>Yüksek (günlük 50-200₺)</td></tr>
<tr><td>Taşınabilirlik</td><td><strong>Kolay</strong> (7-25 kg)</td><td>Zor (30-100+ kg)</td></tr>
<tr><td>Belediye izni</td><td><strong>Gerekmez</strong></td><td>Gürültü izni gerekebilir</td></tr>
<tr><td>Gece çalışma</td><td><strong>Sessiz — sorunsuz</strong></td><td>Gürültü şikayeti riski</td></tr>
</table>

<h2>Şantiyede Güç Kaynağı Kullanım İpuçları</h2>
<ol>
<li><strong>Toza karşı koruyun:</strong> Port kapaklarını kapalı tutun, kullanım dışında örtü ile kapatın</li>
<li><strong>Düz ve stabil zemine koyun:</strong> Devrilme riski olan yerlere koymayın</li>
<li><strong>Güneş altında bırakmayın:</strong> Doğrudan güneş altında uzun süre bırakmak aşırı ısınmaya neden olur</li>
<li><strong>Ağır aletleri sırayla kullanın:</strong> Hilti + avuç taşlama aynı anda çalıştırmak yerine sırayla kullanmak verimi artırır</li>
<li><strong>Akülü aletleri tercih edin:</strong> Mümkün olduğunca akülü matkap/vidalama kullanın — batarya şarjı çok daha az enerji çeker</li>
<li><strong>Öğle arası solar şarj:</strong> SP200 paneli güneşe açarak öğle molasında 2-3 saatte ~400Wh şarj edebilirsiniz</li>
<li><strong>Haftalık tam şarj:</strong> Her hafta sonu güç istasyonunu %100'e şarj ederek hafta boyunca kullanın</li>
</ol>

<h2>Yalıtkan Merdiven + Güç Kaynağı Kombo</h2>
<p>Elektrik sektöründe çalışan ekipler için <a href="/kategori/yalitkan-merdiven">FusionMarkt yalıtkan merdivenler</a> ve taşınabilir güç istasyonları mükemmel bir iş güvenliği kombinasyonu oluşturur. Yüksek gerilim hatları yakınında yalıtkan merdivenle güvenli çalışırken, güç istasyonuyla aletlerinizi besleyin.</p>

<h2>Sonuç</h2>
<p>Şantiye ve inşaat sahalarında taşınabilir güç istasyonları, jeneratörün sessiz, bakımsız ve çevre dostu alternatifidir. Özellikle şehir içi inşaatlarda gürültü yasağı olan saatlerde, iç mekan renovasyonlarında ve uzak saha projelerinde vazgeçilmez bir ekipmandır. <a href="/kategori/tasinabilir-guc-kaynaklari">FusionMarkt güç istasyonları</a> ile şantiyenizi güçlendirin.</p>`,
  },
];

async function seed() {
  console.log("🚀 Blog V10 seed (Festival + İnşaat/Şantiye)...\n");
  for (const b of blogs) {
    const exists = await prisma.blogPost.findUnique({ where: { slug: b.slug } });
    if (exists) { console.log(`⚠️  Atlandı: ${b.slug}`); continue; }
    await prisma.blogPost.create({ data: { ...b, authorName: "FusionMarkt", status: "PUBLISHED" } });
    console.log(`✅ ${b.title}`);
  }
  console.log(`\n🎉 ${blogs.length} blog eklendi.`);
}
seed().catch(e => { console.error("❌", e); process.exit(1); }).finally(() => prisma.$disconnect());
