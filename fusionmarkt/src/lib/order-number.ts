/**
 * Sipariş numarası üretimi — tek kaynak.
 *
 * ESKİ BİÇİM VE SORUNU: `FM-<yıl>-<5 haneli rastgele>` iki ayrı dosyada aynı
 * şekilde üretiliyordu. Havuz 100.000 numaralı ve `Order.orderNumber` tekil
 * olduğu için doğum günü paradoksu gereği **aynı yıl içinde yaklaşık 370.
 * siparişte çakışma olasılığı %50'ye** çıkıyordu. Çakıştığında sipariş
 * oluşturma `P2002` ile düşüyor, yeniden deneme de olmadığı için müşteri
 * ödemeyi yaptıktan sonra siparişsiz kalabiliyordu.
 *
 * YENİ BİÇİM: `FM-<yıl><ay><gün>-<6 karakter>`. Karakter kümesi bilinçli olarak
 * dar: karışan harf ve rakamlar (`0/O`, `1/I`, `5/S`, `8/B`) çıkarıldı, çünkü bu
 * numara telefonda okunuyor ve destek yazışmasında elle giriliyor. Geriye 29
 * karakter kalıyor, yani günlük havuz 29^6 ≈ 595 milyon. Günde 1.000 siparişte
 * çakışma olasılığı binde bir mertebesinde — eski biçimde bu, yılda birkaç kez
 * yaşanacak bir kesinlikti.
 *
 * Tekillik yine de **varsayılmıyor**: `reserveOrderNumber` numarayı kullanmadan
 * önce veritabanında arıyor, çakışırsa yenisini üretiyor. Rastgelelik `crypto`
 * ile üretiliyor, `Math.random()` ile değil — sipariş numarası müşteriye
 * gönderilen bağlantıların bir parçası, tahmin edilebilir olmamalı.
 */

import { randomInt } from "crypto";
import { prisma } from "@repo/db";

const ALPHABET = "ACDEFGHJKLMNPQRTUVWXYZ2346789";

export function generateOrderNumber(): string {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  let suffix = "";
  for (let i = 0; i < 6; i += 1) {
    suffix += ALPHABET[randomInt(ALPHABET.length)];
  }

  return `FM-${datePart}-${suffix}`;
}

/**
 * Kullanılmamış bir sipariş numarası döndürür.
 *
 * Kayıttan **önce** kontrol ediliyor, çünkü numara siparişe yazılmadan da
 * kullanılıyor: mesafeli satış sözleşmesinin HTML'i ve ödeme taslağı numarayla
 * üretiliyor. Kayıt sırasında çakışma yakalansaydı bu belgelerin yeniden
 * üretilmesi gerekirdi.
 *
 * Kontrol ile kayıt arasında teorik bir yarış penceresi var; günlük 32^6'lık
 * havuzda pratikte gerçekleşmiyor ve son güvence olarak `Order.orderNumber`
 * üzerindeki tekillik kısıtı duruyor.
 */
export async function reserveOrderNumber(attempts = 5): Promise<string> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const candidate = generateOrderNumber();
    const existing = await prisma.order.findUnique({
      where: { orderNumber: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
    console.warn(`Sipariş numarası çakıştı, yeniden üretiliyor (${attempt + 1}/${attempts})`);
  }

  throw new Error("Sipariş numarası üretilemedi");
}
