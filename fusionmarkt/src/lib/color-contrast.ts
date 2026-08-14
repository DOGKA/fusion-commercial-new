/**
 * Renk Kontrast Yardımcıları
 *
 * Admin panelinden girilen renkler (kategori themeColor, rozet renkleri) doğrudan
 * metin rengi olarak kullanıldığında okunamayacak kadar düşük kontrast üretebiliyor.
 * Örnek: neon yeşil (#CFFF66) açık zeminde (#F5F5F7) 1.06:1 — pratikte görünmez.
 *
 * Buradaki fonksiyonlar WCAG 2.1 hesabına göre kontrastı ölçer ve gerekiyorsa
 * rengi okunur olana kadar koyulaştırır/açar. Panelden hangi renk girilirse
 * girilsin metin okunur kalır.
 */

/** WCAG AA: normal boyutlu metin için gereken minimum kontrast oranı. */
export const CONTRAST_AA_TEXT = 4.5;

/** WCAG AA: büyük metin (>=24px veya >=18.66px bold) ve grafik öğeler için. */
export const CONTRAST_AA_LARGE = 3;

/** Sayfa zemin renkleri — src/styles/variables.css içindeki --background değerleri. */
export const PAGE_BACKGROUND = {
  light: "#F5F5F7",
  dark: "#0A0A0A",
} as const;

type Rgb = { r: number; g: number; b: number };

function parseHex(color: string): Rgb | null {
  const value = color.trim().replace(/^#/, "");

  if (value.length === 3) {
    const [r, g, b] = value.split("");
    return parseHex(`${r}${r}${g}${g}${b}${b}`);
  }

  if (!/^[0-9a-f]{6}$/i.test(value)) {
    return null;
  }

  const num = parseInt(value, 16);
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  };
}

function toHex({ r, g, b }: Rgb): string {
  const channel = (value: number) =>
    Math.round(Math.min(255, Math.max(0, value)))
      .toString(16)
      .padStart(2, "0");
  return `#${channel(r)}${channel(g)}${channel(b)}`.toUpperCase();
}

function relativeLuminance({ r, g, b }: Rgb): number {
  const [lr, lg, lb] = [r, g, b].map((raw) => {
    const channel = raw / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function ratio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function mix(from: Rgb, to: Rgb, amount: number): Rgb {
  return {
    r: from.r + (to.r - from.r) * amount,
    g: from.g + (to.g - from.g) * amount,
    b: from.b + (to.b - from.b) * amount,
  };
}

/**
 * İki renk arasındaki WCAG kontrast oranı (1 ile 21 arası).
 * Hex olarak çözümlenemeyen değerlerde 1 döner (kontrast yok varsayımı).
 */
export function contrastRatio(colorA: string, colorB: string): number {
  const a = parseHex(colorA);
  const b = parseHex(colorB);
  if (!a || !b) return 1;
  return ratio(a, b);
}

/**
 * Verilen zemin üzerinde okunacak metin için beyaz mı koyu mu kullanılacağını seçer.
 */
export function readableTextColor(
  background: string,
  light: string = "#FFFFFF",
  dark: string = "#111111"
): string {
  const bg = parseHex(background);
  if (!bg) return light;
  return contrastRatio(background, light) >= contrastRatio(background, dark)
    ? light
    : dark;
}

/**
 * `color`'ı `against` zeminine karşı en az `minRatio` kontrast verene kadar
 * siyaha (açık zeminde) veya beyaza (koyu zeminde) doğru kaydırır.
 *
 * Kontrast tek yönlü arttığı için ikili arama yapıyoruz: eşiği geçen en küçük
 * kaydırma bulunur, böylece rengin özgün tonundan mümkün olduğunca az sapılır.
 * Zaten yeterli kontrast varsa renk olduğu gibi döner.
 */
export function ensureContrast(
  color: string,
  against: string,
  minRatio: number = CONTRAST_AA_TEXT
): string {
  const source = parseHex(color);
  const backdrop = parseHex(against);
  if (!source || !backdrop) return color;
  if (ratio(source, backdrop) >= minRatio) return color;

  const target: Rgb =
    relativeLuminance(backdrop) > 0.18
      ? { r: 0, g: 0, b: 0 }
      : { r: 255, g: 255, b: 255 };

  let low = 0;
  let high = 1;
  // Aday her adımda 8 bit'e yuvarlanmış haliyle ölçülüyor; aksi halde float'ta eşiği
  // geçen bir renk hex'e çevrilirken 4.5'in bir miktar altına düşebiliyor.
  let result = toHex(target);

  for (let step = 0; step < 14; step++) {
    const amount = (low + high) / 2;
    const candidateHex = toHex(mix(source, target, amount));
    const candidate = parseHex(candidateHex);
    if (candidate && ratio(candidate, backdrop) >= minRatio) {
      result = candidateHex;
      high = amount;
    } else {
      low = amount;
    }
  }

  return result;
}

/**
 * Tema/vurgu rengini sayfa zemini üzerinde metin olarak kullanmak için okunur hale getirir.
 */
export function readableAccentColor(
  color: string,
  isDark: boolean,
  minRatio: number = CONTRAST_AA_TEXT
): string {
  return ensureContrast(
    color,
    isDark ? PAGE_BACKGROUND.dark : PAGE_BACKGROUND.light,
    minRatio
  );
}

/**
 * Rozet gibi renkli zeminli öğelerde metin rengini sabit tutup zemini koyulaştırır/açar.
 * Panelden gelen zemin rengi ile metin rengi arasındaki kontrast yetersizse zemin ayarlanır.
 */
export function readableBadgeBackground(
  background: string,
  textColor: string,
  minRatio: number = CONTRAST_AA_TEXT
): string {
  return ensureContrast(background, textColor, minRatio);
}
