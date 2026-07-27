/**
 * Kategori aksan renkleri
 *
 * Blog yazılarında görsel kullanılmadığı için tarama sırasında göze çapa
 * olacak tek sinyal renk. Her kategori adı sabit bir tona eşlenir; böylece
 * aynı kategori her sayfada aynı rengi alır ve DB'ye renk alanı eklemek
 * gerekmez.
 */

/** Marka kırmızısıyla çakışmayan, birbirinden ayırt edilebilir tonlar. */
const ACCENT_HUES = [211, 168, 266, 32, 292, 190, 134, 14] as const;

export function categoryHue(category?: string | null): number {
  if (!category) return 220;
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  }
  return ACCENT_HUES[hash % ACCENT_HUES.length];
}

/** `--cat-hue` okuyan CSS kurallarına bağlanan inline stil. */
export function categoryAccentStyle(
  category?: string | null
): React.CSSProperties & Record<"--cat-hue", string> {
  return { "--cat-hue": String(categoryHue(category)) };
}
