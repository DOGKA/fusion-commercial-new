/**
 * FusionMarkt Blog Spec Fix Script
 * Datasheet'lere göre TÜM teknik değerleri düzeltir.
 * Veritabanındaki mevcut blog yazılarını günceller.
 *
 * Doğru değerler (datasheet kaynaklı):
 * P800:       512Wh,  DC input 12-60V, max 10A, max 300W solar, 6.55kg
 * P1800:      1024Wh, DC input 10-52V, max 11A, max 500W solar, 12.7kg
 * P2400:      2048Wh, DC input 12-60V, max 10A, max 500W solar, 23.4kg
 * P3200:      2048Wh, DC input 12-80V, max 16A, max 1000W solar, 24.35kg
 * Singo2000:  1440Wh, DC input 10-50V, max 11A, max 500W solar
 * Singo2000P: 1920Wh, DC input 10-50V, max 11A, max 500W solar
 * SH4000:     5120Wh, HV: 70-450V/16A/3000W, LV: 12-50V/16A/600W
 * Tüm modeller: 10ms EPS geçiş
 * Sıcaklık: P800-P3200/Singo: Deşarj -15~+40°C, Şarj 0~40°C
 *           SH4000: Deşarj -20~+40°C, Şarj 0~40°C
 *
 * Kullanım: npx tsx scripts/fix-blog-specs.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const replacements: { old: string; new: string }[] = [
  // ══════════════════════════════════════════════════════════════════════
  // P800 Solar Giriş Düzeltmeleri (28V/8A/200W → 60V/10A/300W)
  // ÖNEMLİ: Özel cümleler ÖNCE, genel değişimler SONRA yapılmalı!
  // ══════════════════════════════════════════════════════════════════════
  { old: "P800</td><td>28V</td><td>8A</td><td>200W</td>", new: "P800</td><td>60V</td><td>10A</td><td>300W</td>" },
  { old: "<tr><td>IEETek P800</td><td>28V</td></tr>", new: "<tr><td>IEETek P800</td><td>60V</td></tr>" },
  // Özel cümle düzeltmeleri (sıralama hatası düzeltmesi - zaten 28V→60V olmuş olabilir)
  { old: "P800'ün 60V limitine çok yakındır; aşırı soğuklarda dikkat edilmelidir.", new: "P800'ün 60V limitinin çok altındadır, güvenlidir." },
  { old: "P800'ün 28V limitine çok yakındır; aşırı soğuklarda dikkat edilmelidir.", new: "P800'ün 60V limitinin çok altındadır, güvenlidir." },
  // Genel metin değişimleri
  { old: "P800'ün 28V limitine", new: "P800'ün 60V limitine" },
  { old: "P800'ün 28V limiti", new: "P800'ün 60V limiti" },

  // ══════════════════════════════════════════════════════════════════════
  // P1800 Solar Giriş Düzeltmeleri (55V/12A/400W → 52V/11A/500W)
  // ══════════════════════════════════════════════════════════════════════
  { old: "P1800</td><td>55V</td><td>12A</td><td>400W</td>", new: "P1800</td><td>52V</td><td>11A</td><td>500W</td>" },
  { old: "<tr><td>IEETek P1800</td><td>55V</td></tr>", new: "<tr><td>IEETek P1800</td><td>52V</td></tr>" },
  { old: "P1800 limiti 55V", new: "P1800 limiti 52V" },
  { old: "P1800'ün 55V limitinin", new: "P1800'ün 52V limitinin" },
  { old: "P1800'ün 55V limiti", new: "P1800'ün 52V limiti" },

  // ══════════════════════════════════════════════════════════════════════
  // P2400 Solar Giriş Düzeltmeleri (55V/15A/500W → 60V/10A/500W)
  // Datasheet: DC Input Voltage Range 12~60V, Max DC/PV Input Current 10A
  // ══════════════════════════════════════════════════════════════════════
  { old: "P2400</td><td>55V</td><td>15A</td><td>500W</td>", new: "P2400</td><td>60V</td><td>10A</td><td>500W</td>" },
  { old: "<tr><td>IEETek P2400</td><td>55V</td></tr>", new: "<tr><td>IEETek P2400</td><td>60V</td></tr>" },

  // ══════════════════════════════════════════════════════════════════════
  // P3200 Solar Giriş Düzeltmeleri (60V/15A/500W → 80V/16A/1000W)
  // ══════════════════════════════════════════════════════════════════════
  { old: "P3200</td><td>60V</td><td>15A</td><td>500W</td>", new: "P3200</td><td>80V</td><td>16A</td><td>1000W</td>" },
  { old: "<tr><td>IEETek P3200</td><td>60V</td></tr>", new: "<tr><td>IEETek P3200</td><td>80V</td></tr>" },
  { old: "P3200 limiti 60V", new: "P3200 limiti 80V" },
  { old: "P3200'ün 60V limiti", new: "P3200'ün 80V limiti" },

  // VOC blog P800 özel cümle düzeltmesi yukarıda P800 bölümüne taşındı

  // ══════════════════════════════════════════════════════════════════════
  // Seri/Paralel blog: P1800+2xSP200 seri hesaplama düzeltme
  // Eski: 57.6V > 55V → RİSKLİ
  // Yeni: 57.6V > 52V → RİSKLİ (hala doğru ama limit farklı)
  // ══════════════════════════════════════════════════════════════════════
  { old: "57.6V → P1800 limiti 55V → <strong>RİSKLİ! Seri bağlamayın.</strong>", new: "57.6V → P1800 limiti 52V → <strong>RİSKLİ! Seri bağlamayın.</strong>" },
  { old: "28.8V → P1800 limiti 55V → <strong>GÜVENLİ</strong>", new: "28.8V → P1800 limiti 52V → <strong>GÜVENLİ</strong>" },
  { old: "P1800 limiti 12A → <strong>AŞIYOR!", new: "P1800 limiti 11A → <strong>AŞIYOR!" },

  // P3200 seri hesaplama: 57.6V vs 60V → artık 80V
  { old: "57.6V → P3200 limiti 60V → <strong>GÜVENLİ (ama sınırda, dikkatli olun)</strong>", new: "57.6V → P3200 limiti 80V → <strong>GÜVENLİ (büyük marjla)</strong>" },

  // ══════════════════════════════════════════════════════════════════════
  // Singo2000 Düzeltmeleri
  // ══════════════════════════════════════════════════════════════════════
  // DC5525: 8A → 10A (datasheet: 13.2V, 10A)
  { old: "Singo2000 PRO</strong></td><td>DC5525 çıkışları mevcut</td><td>13.2V / max 8A</td>", new: "Singo2000 PRO</strong></td><td>2× DC5525</td><td>13.2V / max 10A</td>" },
  // Singo2000 kapasite: 2000Wh → 1440Wh (Singo2000), 1920Wh (Pro)
  { old: "Singo2000</td><td>2000Wh</td><td>~60 saat</td><td><strong>~7 gece</strong>", new: "Singo2000 PRO</td><td>1920Wh</td><td>~58 saat</td><td><strong>~7 gece</strong>" },
  { old: "IEETek Singo2000</td><td>2000Wh</td><td>2000Wh</td>", new: "IEETek Singo2000</td><td>1440Wh</td><td>1440Wh</td>" },

  // ══════════════════════════════════════════════════════════════════════
  // UPS Geçiş Süresi Düzeltmeleri (tüm modeller <10ms)
  // ══════════════════════════════════════════════════════════════════════
  { old: "P800</td><td>Var</td><td>~20ms</td><td>Temel UPS</td>", new: "P800</td><td>Var</td><td>&lt;10ms</td><td>UPS</td>" },
  { old: "P1800</td><td>Var</td><td>~20ms</td><td>Temel UPS</td>", new: "P1800</td><td>Var</td><td>&lt;10ms</td><td>UPS</td>" },
  { old: "P2400</td><td>Var</td><td>~20ms</td><td>Temel UPS</td>", new: "P2400</td><td>Var</td><td>&lt;10ms</td><td>UPS</td>" },
  { old: "P3200</td><td>Var</td><td>~20ms</td><td>Temel UPS</td>", new: "P3200</td><td>Var</td><td>&lt;10ms</td><td>UPS</td>" },
  { old: "<strong>SH4000</strong></td><td><strong>Var</strong></td><td><strong>&lt;10ms</strong></td><td><strong>Profesyonel UPS</strong></td>", new: "SH4000</td><td>Var</td><td>&lt;10ms</td><td>Profesyonel UPS</td>" },
  { old: "10-20ms (SH4000: &lt;10ms)", new: "&lt;10ms (tüm modeller)" },
  { old: "<strong>SH4000</strong>, 10ms altı geçiş süresiyle bilgisayar, NAS, güvenlik kamerası ve CPAP gibi hassas cihazlar için tam anlamıyla kesintisiz güç kaynağı görevi görür.", new: "IEETek güç istasyonlarının tümü <strong>10ms altı geçiş süresiyle</strong> bilgisayar, modem, NAS, güvenlik kamerası ve CPAP gibi hassas cihazlar için tam anlamıyla kesintisiz güç kaynağı görevi görür." },

  // ══════════════════════════════════════════════════════════════════════
  // P3200 Kapasite Düzeltmeleri (3200Wh → 2048Wh)
  // Model adı 3200W AC gücünden gelir, batarya kapasitesi 2048Wh.
  // ══════════════════════════════════════════════════════════════════════
  { old: "IEETek P3200</td><td>3200Wh</td><td>3200Wh</td>", new: "IEETek P3200</td><td>2048Wh</td><td>2048Wh</td>" },
  { old: "P3200</td><td>3200Wh</td><td>~96 saat</td><td><strong>~12 gece</strong>", new: "P3200</td><td>2048Wh</td><td>~65 saat</td><td><strong>~8 gece</strong>" },
  { old: "P3200 (3200Wh)</td>", new: "P3200 (2048Wh)</td>" },
  // Metin içi P3200 kapasite referansları
  { old: "P3200 (3200Wh) + SP200 güneş paneli", new: "P3200 (2048Wh, 3200W) + SP200 güneş paneli" },
  { old: "P3200 (3200Wh, 3200W çıkış)", new: "P3200 (2048Wh, 3200W çıkış)" },
  { old: "P2400-P3200 (2048-3200Wh)", new: "P2400-P3200 (2048Wh)" },
  { old: "P3200 + 2x SP200 güneş paneli:</strong> 3200Wh kapasite", new: "P3200 + 2x SP200 güneş paneli:</strong> 2048Wh kapasite" },

  // ══════════════════════════════════════════════════════════════════════
  // P3200 Seri/Paralel blog: Solar güç limiti metni (500W → 1000W)
  // ══════════════════════════════════════════════════════════════════════
  { old: "P3200 limiti 500W → <strong>GÜVENLİ</strong>", new: "P3200 limiti 1000W → <strong>GÜVENLİ</strong>" },

  // ══════════════════════════════════════════════════════════════════════
  // Sıcaklık Tablosu Düzeltmeleri (Kış Kampı Blogu)
  // Datasheet: P800-P3200/Singo deşarj -15~+40°C, şarj 0~40°C
  //            SH4000 deşarj -20~+40°C, şarj 0~40°C
  // ══════════════════════════════════════════════════════════════════════
  // Taşınabilir modeller deşarj: -20°C → -15°C, +45°C → +40°C
  { old: "P800 (512Wh)</td><td>-20°C ~ +45°C</td><td>0°C ~ +45°C</td>", new: "P800 (512Wh)</td><td>-15°C ~ +40°C</td><td>0°C ~ +40°C</td>" },
  { old: "P1800 (1024Wh)</td><td>-20°C ~ +45°C</td><td>0°C ~ +45°C</td>", new: "P1800 (1024Wh)</td><td>-15°C ~ +40°C</td><td>0°C ~ +40°C</td>" },
  { old: "P2400 (2048Wh)</td><td>-20°C ~ +45°C</td><td>0°C ~ +45°C</td>", new: "P2400 (2048Wh)</td><td>-15°C ~ +40°C</td><td>0°C ~ +40°C</td>" },
  { old: "P3200 (3200Wh)</td><td>-20°C ~ +45°C</td><td>0°C ~ +45°C</td>", new: "P3200 (2048Wh)</td><td>-15°C ~ +40°C</td><td>0°C ~ +40°C</td>" },
  // SH4000: +55°C → +40°C, şarj -10°C → 0°C
  { old: "SH4000 (5120Wh)</td><td>-20°C ~ +55°C</td><td>-10°C ~ +55°C</td>", new: "SH4000 (5120Wh)</td><td>-20°C ~ +40°C</td><td>0°C ~ +40°C</td>" },
  // Genel deşarj metni: -20°C → -15°C
  { old: "LiFePO4 bataryalar <strong>-20°C'ye kadar güvenle deşarj edilebilir</strong> (kullanılabilir).", new: "LiFePO4 bataryalar <strong>-15°C'ye kadar güvenle deşarj edilebilir</strong> (kullanılabilir). SH4000 modeli ise -20°C'ye kadar destekler." },
  { old: "Deşarj (Kullanım): -20°C'ye Kadar Güvenli", new: "Deşarj (Kullanım): -15°C'ye Kadar Güvenli (SH4000: -20°C)" },
  { old: "-20°C'de bile cihazlarınızı besleyebilecek güçtedirler.", new: "-15°C'de bile cihazlarınızı besleyebilecek güçtedirler (SH4000 ile -20°C)." },

  // ══════════════════════════════════════════════════════════════════════
  // P1800 Ağırlık Düzeltmesi (12.5 → 12.7 kg)
  // ══════════════════════════════════════════════════════════════════════
  { old: "(IEETek P1800: 12.5 kg)", new: "(IEETek P1800: 12.7 kg)" },

  // ══════════════════════════════════════════════════════════════════════
  // USB PD Blog: USB-C Port Sayıları Düzeltmeleri (datasheet doğrulaması)
  // P800:  3 USB-C (1×100W + 2×30W) + 2 USB-A QC
  // P1800: 3 USB-C (1×100W + 2×30W) + 3 USB-A QC
  // P2400: 4 USB-C (2×100W + 2×30W) + 4 USB-A QC
  // P3200: 4 USB-C (2×100W + 2×30W) + 4 USB-A QC
  // Singo2000 PRO: 2 USB-C (2×100W) + 1 USB-A + 2 QC3.0
  // SH4000: 2 USB-C (2×100W)
  // ══════════════════════════════════════════════════════════════════════
  // Tablo tamamen yeniden yazılıyor
  { old: "<tr><th>Model</th><th>USB-C PD Çıkış</th><th>Maks. PD Gücü</th><th>PD Versiyonu</th></tr>\n<tr><td>IEETek P800</td><td>1× USB-C</td><td>100W</td><td>PD 3.0</td></tr>\n<tr><td>IEETek P1800</td><td>2× USB-C</td><td>100W</td><td>PD 3.0</td></tr>\n<tr><td>IEETek P2400</td><td>2× USB-C</td><td>100W</td><td>PD 3.0</td></tr>\n<tr><td>IEETek P3200</td><td>2× USB-C</td><td>100W</td><td>PD 3.0</td></tr>\n<tr><td>Singo2000 PRO</td><td>USB-C PD çıkışlar mevcut</td><td>100W</td><td>PD 3.0</td></tr>", new: "<tr><th>Model</th><th>USB-C PD Çıkış</th><th>Maks. PD Gücü</th><th>USB-A Çıkış</th></tr>\n<tr><td>IEETek P800</td><td>1× 100W + 2× 30W (3 port)</td><td>100W</td><td>2× QC 30W</td></tr>\n<tr><td>IEETek P1800</td><td>1× 100W + 2× 30W (3 port)</td><td>100W</td><td>3× QC 30W</td></tr>\n<tr><td>IEETek P2400</td><td>2× 100W + 2× 30W (4 port)</td><td>100W</td><td>4× QC 30W</td></tr>\n<tr><td>IEETek P3200</td><td>2× 100W + 2× 30W (4 port)</td><td>100W</td><td>4× QC 30W</td></tr>\n<tr><td>Singo2000 PRO</td><td>2× 100W (2 port)</td><td>100W</td><td>1× USB-A 12W + 2× QC3.0 18W</td></tr>\n<tr><td>IEETek SH4000</td><td>2× 100W (2 port)</td><td>100W</td><td>—</td></tr>" },
  // 30W açıklama notu ekleniyor (tablo sonrası)
  // Eş zamanlı şarj metni düzeltmesi
  { old: "İki USB-C PD portu olan güç istasyonlarında (P1800, P2400, P3200) laptop ve telefon eş zamanlı şarj edilebilir", new: "Tüm IEETek güç istasyonlarında birden fazla USB-C PD portu bulunur — 100W porttan laptop, 30W porttan telefon eş zamanlı şarj edilebilir" },
];

async function fixBlogs() {
  console.log("🔧 Blog spec düzeltme başlıyor (datasheet değerleri)...\n");

  const allPosts = await prisma.blogPost.findMany({
    select: { id: true, slug: true, content: true },
  });

  let totalFixed = 0;

  for (const post of allPosts) {
    let content = post.content;
    let changed = false;
    const fixes: string[] = [];

    for (const r of replacements) {
      if (content.includes(r.old)) {
        content = content.replaceAll(r.old, r.new);
        changed = true;
        fixes.push(r.old.substring(0, 50) + "...");
      }
    }

    if (changed) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { content },
      });
      console.log(`✅ ${post.slug}`);
      fixes.forEach(f => console.log(`   🔄 ${f}`));
      totalFixed++;
    }
  }

  if (totalFixed === 0) {
    console.log("ℹ️  Düzeltme gerektiren blog bulunamadı (zaten güncel).");
  } else {
    console.log(`\n🎉 ${totalFixed} blog yazısı güncellendi.`);
  }
}

fixBlogs()
  .catch((e) => { console.error("❌", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
