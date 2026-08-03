/**
 * Sipariş yüzeyindeki aksiyon butonlarının ortak sınıf reçeteleri.
 *
 * Tek dosyada durmalarının sebebi plan 07 §M-12 ve §M-16: iki kural da "her
 * butonda ayrı ayrı" uygulandığında kaçırılıyordu. Butonların bir kısmı
 * masaüstünde kart genişliğini kaplıyor, bir kısmı pasifken `opacity` ile
 * soluklaşıp okunmaz hâle geliyordu.
 *
 * Renkler `--acc-*` token'larına bağlı; sabit Tailwind tonu (`purple-500`,
 * `red-400`) light temada 4.5:1 kontrast eşiğinin altında kalıyordu.
 */

import { DISABLED_TONE } from "@/app/hesabim/_lib/action-classes";

/**
 * M-12: masaüstünde buton genişliği içeriği kadar, tam genişliğe yalnız
 * mobilde çıkıyor. Sheet'lerin birincil aksiyonu istisna — orada iki buton
 * paneli paylaşıyor ve dokunma hedefi genişliğinden fayda görüyor.
 */
export const ACTION_WIDTH = "w-full sm:w-auto";

/**
 * Pasif buton paleti (M-16). Tanım hesabım kabuğunun ortak dosyasına taşındı —
 * aynı kural sipariş dışındaki yüzeylerde de gerekiyordu. Buradan yeniden dışa
 * veriliyor ki mevcut `siparisler/_lib` import'ları kırılmasın.
 */
export { DISABLED_TONE };

/** Kart içi aksiyon butonu tabanı. Ton sınıfı (`acc-chip-*`) ayrıca ekleniyor. */
export const ACTION_PILL =
  "account-btn inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-full border px-3.5 text-[12px] font-medium transition-colors";

/** Sheet ayak kısmının ikincil ("Vazgeç") butonu. */
export const SHEET_SECONDARY =
  "flex-1 inline-flex min-h-[44px] items-center justify-center rounded-full border border-border bg-glass-bg px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-glass-bg-hover";

/**
 * Sheet ayak kısmının birincil butonu (M-16).
 *
 * Pasif hâl `opacity` ile YAPILMIYOR: opaklığı düşürmek metni de zemini de
 * aynı oranda soldurup kontrastı WCAG eşiğinin altına indiriyordu. Yerine ayrı
 * bir pasif paleti var (`--foreground-tertiary` üzerine `--glass-bg`), iki
 * temada da ~7:1. Hover `enabled:` ile kapılanıyor; bazı tarayıcılar pasif
 * butonda da `:hover` eşleştiriyor ve zemin pasif renginin üstüne biniyordu.
 */
const SHEET_PRIMARY_BASE = `flex-1 inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border px-4 text-[13px] font-semibold transition-colors ${DISABLED_TONE}`;

const SHEET_PRIMARY_TONE = {
  progress: "acc-chip-progress enabled:hover:bg-[color:var(--acc-progress-bg-hover)]",
  danger: "acc-chip-danger enabled:hover:bg-[color:var(--acc-danger-bg-hover)]",
} as const;

export const sheetPrimary = (tone: keyof typeof SHEET_PRIMARY_TONE) =>
  `${SHEET_PRIMARY_BASE} ${SHEET_PRIMARY_TONE[tone]}`;
