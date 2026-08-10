/**
 * iyzico yapılandırma teşhisi.
 *
 * Kart ile ödemede /api/payment/initialize 400 dönerse, hata neredeyse her zaman
 * iyzico'nun reddettiği bir istektir; route iyzico'nun `errorCode`/`errorMessage`
 * değerini aynen 400 gövdesine koyar. Bu script aynı hatayı, kart bilgisi
 * girmeden ve sipariş oluşturmadan görünür kılar.
 *
 * Env'i uygulamanın kendisiyle AYNI şekilde yükler (`@next/env`), yani
 * `.env.local` > `.env.production` > `.env` önceliği birebir aynıdır. Sunucuda
 * birden fazla env dosyası varsa, uygulamanın gerçekte hangisini gördüğünü
 * gösterir.
 *
 * Kullanım (fusionmarkt dizininde):
 *   node scripts/iyzico-teshis.mjs
 *
 * Anahtar değerleri BİLEREK yazdırılmaz; yalnızca var/yok, uzunluk ve baş/son
 * birkaç karakter gösterilir.
 */

// Her ikisi de CommonJS; ESM'den yalnızca default export üzerinden alınabiliyor.
import nextEnv from "@next/env";
import Iyzipay from "iyzipay";

const { loadEnvConfig } = nextEnv;

const PRODUCTION_URI = "https://api.iyzipay.com";
const SANDBOX_URI = "https://sandbox-api.iyzipay.com";

const { loadedEnvFiles } = loadEnvConfig(process.cwd(), false);

console.log("═══ Yüklenen env dosyaları (öncelik sırasıyla) ═══");
if (!loadedEnvFiles?.length) {
  console.log("  (hiç env dosyası bulunamadı — değerler yalnızca sistem env'inden gelir)");
} else {
  for (const f of loadedEnvFiles) console.log("  " + f.path);
}

function describe(name) {
  const v = process.env[name];
  if (!v) return { name, durum: "YOK" };
  return {
    name,
    durum: "var",
    uzunluk: v.length,
    onizleme: v.length > 8 ? `${v.slice(0, 4)}…${v.slice(-2)}` : "(kısa)",
  };
}

console.log("\n═══ iyzico değişkenleri ═══");
for (const n of ["IYZICO_API_KEY", "IYZICO_SECRET_KEY"]) {
  const d = describe(n);
  console.log(
    `  ${d.name.padEnd(20)} ${d.durum}` +
      (d.uzunluk ? `  uzunluk=${d.uzunluk}  ${d.onizleme}` : "")
  );
}

const baseUrl = process.env.IYZICO_BASE_URL;
console.log(`  IYZICO_BASE_URL      ${baseUrl || "YOK"}`);
console.log(`  NEXT_PUBLIC_SITE_URL ${process.env.NEXT_PUBLIC_SITE_URL || "YOK"}`);

const uyarilar = [];
if (!process.env.IYZICO_API_KEY || !process.env.IYZICO_SECRET_KEY) {
  // Route bu durumda 400 değil 503 döner, yani 400 görüyorsan sebep bu değildir.
  uyarilar.push("Anahtarlar eksik → /api/payment/initialize 503 döner.");
}
if (!baseUrl) {
  uyarilar.push(
    `IYZICO_BASE_URL tanımsız. Kod bu durumda SANDBOX'a düşüyor (${SANDBOX_URI}); ` +
      `canlı anahtarlar sandbox'ta geçersizdir ve iyzico isteği reddeder.`
  );
} else if (baseUrl.includes("sandbox")) {
  uyarilar.push(
    "IYZICO_BASE_URL sandbox'ı gösteriyor; canlı anahtarlarla kullanılamaz."
  );
}
if (process.env.NEXT_PUBLIC_SITE_URL && !/^https:\/\//.test(process.env.NEXT_PUBLIC_SITE_URL)) {
  // callbackUrl bundan türüyor; iyzico http callback'i reddedebilir.
  uyarilar.push("NEXT_PUBLIC_SITE_URL https değil — 3DS callback reddedilebilir.");
}

if (uyarilar.length) {
  console.log("\n═══ Uyarılar ═══");
  for (const u of uyarilar) console.log("  ⚠  " + u);
}

if (!process.env.IYZICO_API_KEY || !process.env.IYZICO_SECRET_KEY) {
  process.exit(1);
}

// Gerçek bir iyzico çağrısı: taksit sorgusu. Kart bilgisi istemez, para hareketi
// yaratmaz, ama kimlik doğrulama + IP kısıtı + endpoint doğruluğunu aynı anda
// sınar. Kimlik ya da IP hatalıysa burada da aynı errorCode döner.
const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY,
  secretKey: process.env.IYZICO_SECRET_KEY,
  uri: baseUrl || SANDBOX_URI,
});

console.log(`\n═══ Canlı API testi (${baseUrl || SANDBOX_URI}) ═══`);

const sonuc = await new Promise((resolve) => {
  iyzipay.installmentInfo.retrieve(
    {
      locale: Iyzipay.LOCALE.TR,
      conversationId: `TESHIS_${Date.now()}`,
      binNumber: "554960",
      price: "100.0",
    },
    (err, result) => resolve(err ? { agHatasi: err } : result)
  );
});

if (sonuc.agHatasi) {
  console.log("  ✗ Ağ/bağlantı hatası:", sonuc.agHatasi.message);
  console.log("    Sunucudan iyzico'ya çıkış engelleniyor olabilir (firewall/DNS).");
  process.exit(1);
}

console.log("  status      :", sonuc.status);
if (sonuc.errorCode) console.log("  errorCode   :", sonuc.errorCode);
if (sonuc.errorMessage) console.log("  errorMessage:", sonuc.errorMessage);

if (sonuc.status === "success") {
  const banka = sonuc.installmentDetails?.[0];
  console.log("  ✓ Kimlik doğrulama başarılı.", banka ? `Banka: ${banka.bankName}` : "");
  console.log(
    "\n  Anahtarlar ve endpoint doğru. Ödeme yine 400 dönüyorsa sebep isteğe özgüdür;\n" +
      "  sunucu loglarında '❌ iyzico 3DS Initialize Failed' satırındaki errorCode'a bak."
  );
} else {
  console.log(
    "\n  ✗ iyzico isteği reddetti. En sık sebepler:\n" +
      "    • Anahtarlar sandbox/canlı karışmış ya da hatalı kopyalanmış\n" +
      "    • Sunucunun çıkış IP'si iyzico panelinde 'IP/Back URL Yönetimi'nde tanımlı değil\n" +
      "    • Üye işyeri hesabı henüz canlı işlem almaya açılmamış"
  );
  process.exit(1);
}
