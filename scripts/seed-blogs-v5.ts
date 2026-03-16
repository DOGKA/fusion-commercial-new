/**
 * FusionMarkt Blog Seed V5
 * Blog 16: Güç İstasyonu ile Uçağa Binme (TSA/IATA)
 * Blog 17: Kışın Güç İstasyonu - Soğuk Hava Performansı
 *
 * Kullanım: npx tsx scripts/seed-blogs-v5.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const blogs = [
  {
    slug: "guc-istasyonu-ile-ucaga-binmek-tsa-iata-kurallari",
    title: "Güç İstasyonu ile Uçağa Binebilir misiniz? TSA ve IATA Kuralları",
    excerpt: "Taşınabilir güç kaynağı veya power bank ile uçağa binmek için Wh limitleri, kabin bagaj kuralları, havayolu politikaları ve IATA düzenlemelerinin tamamı.",
    category: "Enerji",
    tags: ["uçak güç kaynağı", "power bank uçak", "IATA", "TSA", "Wh limit", "kabin bagaj"],
    metaTitle: "Güç İstasyonu ile Uçağa Binmek: TSA ve IATA Kuralları 2026",
    metaDescription: "Power bank ve taşınabilir güç kaynağı ile uçağa binme kuralları. IATA Wh limitleri, kabin vs yük bagajı, havayolu politikaları ve IEETek model uyumluluk tablosu.",
    metaKeywords: ["güç kaynağı uçak", "power bank uçak limiti", "IATA lityum batarya", "uçakta power bank", "Wh sınırı uçak"],
    publishedAt: new Date("2026-02-18"),
    content: `<h2>Taşınabilir Güç Kaynağı ile Uçağa Binilir mi?</h2>
<p>Bu soru, kamp gezisi veya iş seyahati için taşınabilir güç kaynağı satın alan herkesin aklına geliyor. Yanıt basit gibi görünse de kurallar batarya kapasitesine, havayolu şirketine ve uçuş güzergahına göre değişir. Yanlış bilgi ciddi cezalara ve güvenlik sorunlarına yol açabilir.</p>

<p>Bu rehberde <strong>IATA (Uluslararası Hava Taşımacılığı Birliği)</strong> ve <strong>TSA (ABD Ulaştırma Güvenliği İdaresi)</strong> kurallarını, Türk havayolu şirketlerinin politikalarını ve IEETek modellerinin uçak uyumluluğunu detaylıca açıklıyoruz.</p>

<h2>IATA Kuralları: Uluslararası Standart</h2>
<p>IATA, tüm dünya havayollarının uyması gereken <strong>Tehlikeli Maddeler Yönetmeliği (DGR)</strong> kapsamında lityum bataryalar için şu kuralları belirler:</p>

<h3>Kabin Bagajı (El Bagajı)</h3>
<table>
<tr><th>Batarya Kapasitesi (Wh)</th><th>İzin Durumu</th><th>Koşullar</th></tr>
<tr><td><strong>0 – 100 Wh</strong></td><td>Serbest</td><td>Onay gerekmez. Kişi başı makul adet (genellikle 2-4 adet).</td></tr>
<tr><td><strong>100 – 160 Wh</strong></td><td>Havayolu onayıyla</td><td>Kişi başı maksimum 2 adet. Havayolundan önceden izin alınmalıdır.</td></tr>
<tr><td><strong>160 Wh üzeri</strong></td><td><strong>YASAK</strong></td><td>Yolcu uçağında taşınamaz. Kargo uçağında özel düzenlemeyle taşınabilir.</td></tr>
</table>

<h3>Yük Bagajı (Check-in Bagaj)</h3>
<p><strong>Lityum bataryalı taşınabilir güç kaynakları yük bagajında YASAKLANMIŞTIR.</strong> Bu kural istisnasızdır. Nedeni: yük bölmesinde çıkabilecek bir batarya yangınını tespit etmek ve müdahale etmek çok zordur.</p>

<h3>Wh Değeri Nasıl Hesaplanır?</h3>
<p>Power bank veya güç istasyonunuzun Wh değeri genellikle ürün üzerinde yazar. Yazmıyorsa şu formülle hesaplanır:</p>
<p><strong>Wh = mAh × V ÷ 1000</strong></p>
<p>Örnek: 20.000mAh / 3.7V power bank → 20.000 × 3.7 ÷ 1000 = <strong>74Wh</strong> (uçak kabinine serbest)</p>

<h2>IEETek Güç İstasyonları: Uçak Uyumluluğu</h2>
<table>
<tr><th>Model</th><th>Kapasite</th><th>Wh</th><th>Uçak Kabini</th></tr>
<tr><td>IEETek Singo600</td><td>600Wh</td><td>600Wh</td><td><strong>YASAK</strong> (160Wh üzeri)</td></tr>
<tr><td>IEETek P800</td><td>512Wh</td><td>512Wh</td><td><strong>YASAK</strong></td></tr>
<tr><td>IEETek Singo1000</td><td>1000Wh</td><td>1000Wh</td><td><strong>YASAK</strong></td></tr>
<tr><td>IEETek P1800</td><td>1024Wh</td><td>1024Wh</td><td><strong>YASAK</strong></td></tr>
<tr><td>IEETek Singo2000</td><td>1440Wh</td><td>1440Wh</td><td><strong>YASAK</strong></td></tr>
<tr><td>IEETek P2400</td><td>2048Wh</td><td>2048Wh</td><td><strong>YASAK</strong></td></tr>
<tr><td>IEETek P3200</td><td>2048Wh</td><td>2048Wh</td><td><strong>YASAK</strong></td></tr>
<tr><td>IEETek SH4000</td><td>5120Wh</td><td>5120Wh</td><td><strong>YASAK</strong></td></tr>
</table>

<p><strong>Sonuç:</strong> IEETek taşınabilir güç istasyonlarının tümü 160Wh'in çok üzerinde olduğundan yolcu uçağında taşınamaz. Bunlar kamp, karavan ve ev kullanımı için tasarlanmıştır.</p>

<h3>Uçakta Ne Kullanabilirsiniz?</h3>
<p>Uçuş sırasında kullanılabilecek enerji kaynakları:</p>
<ul>
<li><strong>Power bank (100Wh altı):</strong> 27.000mAh / 3.7V = ~99.9Wh → Serbest</li>
<li><strong>Laptop bataryası:</strong> Çoğu laptop bataryası 50-99Wh arasındadır → Serbest</li>
<li><strong>Telefon yedek bataryası:</strong> 5.000-10.000mAh → 18-37Wh → Serbest</li>
</ul>

<h2>Türk Havayolları ve Diğer Türk Havayolu Şirketleri</h2>
<p>Türk Havayolları (THY), Pegasus ve AnadoluJet IATA kurallarına uymaktadır:</p>
<ul>
<li><strong>100Wh altı:</strong> Kabin bagajında serbest (yük bagajında yasak)</li>
<li><strong>100-160Wh:</strong> THY müşteri hizmetlerinden önceden onay gerekir, kabin bagajında kişi başı 2 adet</li>
<li><strong>160Wh üzeri:</strong> Kesinlikle yasak</li>
<li><strong>Hasarlı veya şişmiş batarya:</strong> Hiçbir koşulda kabul edilmez</li>
</ul>

<h2>Güç İstasyonunuzu Seyahate Nasıl Götürürsünüz?</h2>
<p>Uçakla taşıyamadığınız güç istasyonunuzu seyahat yerinize ulaştırmanın alternatifleri:</p>
<ol>
<li><strong>Kara yolu ile kendi aracınızla:</strong> Hiçbir kısıtlama yok. Bagajda güvenle taşıyabilirsiniz.</li>
<li><strong>Kargo ile gönderim:</strong> Lityum bataryalı ürünler kara kargo ile gönderilebilir. Hava kargoda özel düzenleme gerekir (IATA DGR Bölüm II).</li>
<li><strong>Varış noktasında kiralama/satın alma:</strong> Uzun süreli seyahatler için varış noktasında temin etmeyi düşünebilirsiniz.</li>
<li><strong>Otobüs/tren ile:</strong> Kara taşımacılığında lityum batarya için uçak gibi katı kurallar yoktur, ancak kargo firmasının politikasını kontrol edin.</li>
</ol>

<h2>Güvenli Taşıma İpuçları</h2>
<ul>
<li>Güç istasyonunuzu taşımadan önce <strong>%30-50 şarj seviyesine</strong> getirin (tam dolu taşımak önerilmez)</li>
<li>Terminalleri <strong>bant veya kapak</strong> ile kısa devreden koruyun</li>
<li>Orijinal kutusunda veya darbeye dayanıklı çanta içinde taşıyın</li>
<li>Aşırı sıcak veya soğuktan koruyun (araç bagajında yazın 60°C'yi aşabilir)</li>
<li>Yanıcı maddelerden uzak tutun</li>
</ul>

<h2>Sonuç</h2>
<p>Taşınabilir güç istasyonları (256Wh+) yolcu uçağında taşınamaz, ancak kara yolu ile güvenle seyahat edebilirsiniz. Uçak seyahatleri için 100Wh altı power bank'ler kullanın. Güç istasyonunuzla kamp, karavan veya araç seyahatlerinin keyfini <a href="/kategori/tasinabilir-guc-kaynaklari">FusionMarkt güç istasyonları</a> ile çıkarın.</p>`,
  },

  {
    slug: "kisin-guc-istasyonu-kullanimi-soguk-hava-performans-rehberi",
    title: "Kışın Güç İstasyonu Kullanımı: Soğuk Hava Performans Rehberi",
    excerpt: "Soğuk havada LiFePO4 batarya performansı nasıl değişir? Kapasite kaybı, şarj limitleri, donma koruması ve kış kampı için enerji planlaması ipuçları.",
    category: "Enerji",
    tags: ["kış kampı", "soğuk hava", "LiFePO4 soğuk performans", "batarya sıcaklık", "kış enerji"],
    metaTitle: "Kışın Güç İstasyonu Kullanımı: Soğuk Hava Performans Rehberi",
    metaDescription: "Soğuk havada taşınabilir güç kaynağı performansı: LiFePO4 kapasite kaybı, şarj sıcaklık limitleri, kış kampı enerji planlaması ve batarya koruma ipuçları.",
    metaKeywords: ["kışın güç kaynağı", "soğuk hava batarya", "LiFePO4 soğuk performans", "kış kampı enerji", "batarya sıcaklık"],
    publishedAt: new Date("2026-02-18"),
    content: `<h2>Soğuk Hava Batarya Performansını Nasıl Etkiler?</h2>
<p>Tüm bataryalar soğukta performans kaybeder — bu fizik ve kimyanın kaçınılmaz bir gerçeğidir. Düşük sıcaklıklarda batarya içindeki lityum iyonlarının hareketi yavaşlar, iç direnç artar ve kullanılabilir kapasite düşer. Ancak <strong>LiFePO4 bataryalar soğuğa karşı en dayanıklı lityum kimyasıdır</strong>.</p>

<h2>Sıcaklığa Göre Kapasite Tablosu</h2>
<table>
<tr><th>Sıcaklık</th><th>LiFePO4 Kullanılabilir Kapasite</th><th>NMC Li-ion Kapasite</th><th>Kurşun-Asit Kapasite</th></tr>
<tr><td>+25°C (ideal)</td><td><strong>%100</strong></td><td>%100</td><td>%100</td></tr>
<tr><td>+10°C</td><td><strong>%95-98</strong></td><td>%90-95</td><td>%85-90</td></tr>
<tr><td>0°C</td><td><strong>%85-92</strong></td><td>%75-85</td><td>%65-75</td></tr>
<tr><td>-10°C</td><td><strong>%70-80</strong></td><td>%55-65</td><td>%45-55</td></tr>
<tr><td>-20°C</td><td><strong>%55-65</strong></td><td>%30-45</td><td>%25-35</td></tr>
</table>
<p>Gördüğünüz gibi LiFePO4, -20°C'de bile kullanılabilir kapasitenin yarısından fazlasını korurken, kurşun-asit aküler neredeyse işe yaramaz hale gelir.</p>

<h2>Soğukta Deşarj vs Şarj: Kritik Fark</h2>

<h3>Deşarj (Kullanım): -15°C'ye Kadar Güvenli (SH4000: -20°C)</h3>
<p>LiFePO4 bataryalar <strong>-15°C'ye kadar güvenle deşarj edilebilir</strong> (kullanılabilir). SH4000 modeli ise -20°C'ye kadar destekler. Kapasite düşer ama cihazlarınızı besleyebilir. IEETek güç istasyonlarının BMS (Battery Management System) sistemi, sıcaklık sensörleriyle bataryayı sürekli izler.</p>

<h3>Şarj: 0°C Altında DİKKAT!</h3>
<p><strong>Bu en kritik bilgidir:</strong> LiFePO4 bataryalar 0°C altında şarj edilmemelidir. Soğukta şarj, lityum metalinin anotta birikmesine (lityum kaplama/plating) neden olur ve bu batarya hücrelerine kalıcı hasar verir, hatta kısa devreye yol açabilir.</p>

<p>IEETek güç istasyonlarının BMS'i düşük sıcaklık korumasına sahiptir: batarya sıcaklığı 0°C altına düştüğünde şarj girişini otomatik keser ve ekranda uyarı gösterir. Bu, bataryanızı hasardan korur.</p>

<h3>Soğukta Şarj Çözümleri</h3>
<ul>
<li><strong>Ön ısıtma (Pre-heat):</strong> Bazı gelişmiş modellerde (SH4000 gibi) yerleşik ısıtma sistemi bataryayı 0°C'nin üzerine ısıtır, ardından şarj başlar.</li>
<li><strong>İç mekana alın:</strong> Güç istasyonunu çadır veya araç içine alarak ortam sıcaklığında şarj edin.</li>
<li><strong>Yalıtım:</strong> Güç istasyonunu battaniye veya neopren kılıfla sararak ısı kaybını yavaşlatın.</li>
<li><strong>Gün içinde şarj edin:</strong> Güneşli kış günlerinde öğle saatlerinde sıcaklık 0°C üzerine çıktığında solar şarjı başlatın.</li>
</ul>

<h2>IEETek Model Bazlı Soğuk Hava Özellikleri</h2>
<table>
<tr><th>Model</th><th>Çalışma Sıcaklığı (Deşarj)</th><th>Şarj Sıcaklığı</th><th>Düşük Sıcaklık Koruması</th></tr>
<tr><td>P800 (512Wh)</td><td>-15°C ~ +40°C</td><td>0°C ~ +40°C</td><td>BMS otomatik kesme</td></tr>
<tr><td>P1800 (1024Wh)</td><td>-15°C ~ +40°C</td><td>0°C ~ +40°C</td><td>BMS otomatik kesme</td></tr>
<tr><td>P2400 (2048Wh)</td><td>-15°C ~ +40°C</td><td>0°C ~ +40°C</td><td>BMS otomatik kesme</td></tr>
<tr><td>P3200 (2048Wh)</td><td>-15°C ~ +40°C</td><td>0°C ~ +40°C</td><td>BMS otomatik kesme</td></tr>
<tr><td>SH4000 (5120Wh)</td><td>-20°C ~ +40°C</td><td>0°C ~ +40°C</td><td>BMS + yerleşik ısıtma</td></tr>
</table>

<h2>Kış Kampı Enerji Planlaması</h2>
<p>Soğukta kapasite kaybını hesaba katarak planlama yapmalısınız. -10°C'de <strong>%25-30 fazla kapasite</strong> planlamanız gerekir.</p>

<h3>Örnek: -10°C Kış Kampı (1 gece)</h3>
<table>
<tr><th>Cihaz</th><th>Güç</th><th>Süre</th><th>Normal (Wh)</th><th>Soğukta Gerçek İhtiyaç (Wh)</th></tr>
<tr><td>Elektrikli battaniye</td><td>60W</td><td>8 saat</td><td>480</td><td>624</td></tr>
<tr><td>LED aydınlatma</td><td>15W</td><td>5 saat</td><td>75</td><td>98</td></tr>
<tr><td>Telefon şarjı</td><td>20W</td><td>2 saat</td><td>40</td><td>52</td></tr>
<tr><td>Kamp lambası</td><td>5W</td><td>10 saat</td><td>50</td><td>65</td></tr>
<tr><td><strong>Toplam</strong></td><td></td><td></td><td><strong>645Wh</strong></td><td><strong>839Wh</strong></td></tr>
</table>

<p><strong>Öneri: IEETek P1800 (1024Wh)</strong> → Soğukta ~770Wh kullanılabilir kapasite → Yeterli + yedek.</p>

<h2>10 Soğuk Hava Kullanım İpucu</h2>
<ol>
<li><strong>Güç istasyonunu çadır içinde tutun:</strong> Vücut ısınız bile ortam sıcaklığını +5-10°C artırır</li>
<li><strong>Gece yalıtın:</strong> Battaniye, uyku tulumu veya neopren kılıfla sarın</li>
<li><strong>Yerden yükseltin:</strong> Soğuk zemin ısıyı emer; tahta, köpük veya kamp matı üzerine koyun</li>
<li><strong>Şarjı gündüz yapın:</strong> Sıcaklık 0°C üzerindeyken solar veya AC şarjı tamamlayın</li>
<li><strong>Tam dolu başlayın:</strong> Geceye %100 şarjla girin</li>
<li><strong>AC inverteri kapatın:</strong> Kullanmıyorsanız kapalı tutun (boşta enerji harcar)</li>
<li><strong>DC çıkışları tercih edin:</strong> 12V LED, DC5525 cihazlar daha verimli</li>
<li><strong>Araçta bırakmayın:</strong> -30°C'ye kadar düşebilen araç bagajında uzun süre bırakmayın</li>
<li><strong>Depolama:</strong> Kışın uzun süre kullanmayacaksanız %40-60 şarjda, oda sıcaklığında saklayın</li>
<li><strong>Ani sıcaklık değişiminden kaçının:</strong> -20°C'den doğrudan sıcak odaya almak yoğunlaşma (buğulanma) yaratabilir — 5-10dk ılık ortamda bekletin</li>
</ol>

<h2>Sonuç</h2>
<p>LiFePO4 güç istasyonları kışın da güvenle kullanılabilir, yeter ki soğukta şarj kuralına dikkat edin ve kapasite kaybını planlayın. -15°C'de bile cihazlarınızı besleyebilecek güçtedirler (SH4000 ile -20°C). <a href="/kategori/tasinabilir-guc-kaynaklari">FusionMarkt güç istasyonları</a> ile dört mevsim enerji bağımsızlığının keyfini çıkarın.</p>`,
  },
];

async function seed() {
  console.log("🚀 Blog V5 seed (Uçak kuralları + Kış performans)...\n");
  for (const b of blogs) {
    const exists = await prisma.blogPost.findUnique({ where: { slug: b.slug } });
    if (exists) { console.log(`⚠️  Atlandı: ${b.slug}`); continue; }
    await prisma.blogPost.create({ data: { ...b, authorName: "FusionMarkt", status: "PUBLISHED" } });
    console.log(`✅ ${b.title}`);
  }
  console.log(`\n🎉 ${blogs.length} blog eklendi.`);
}
seed().catch(e => { console.error("❌", e); process.exit(1); }).finally(() => prisma.$disconnect());
