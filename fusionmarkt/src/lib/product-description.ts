/**
 * Ürün/paket açıklamasındaki zengin metin (WordPress + Quill kaynaklı) HTML'ini
 * güvenli ve responsive hale getirir.
 *
 * `SingleProductView` ve `BundleProductView` bu modülü paylaşır.
 */

const SIZED_BLOCK_TAGS = 'table|td|th|tr|col|colgroup';
const DESCRIPTION_IMAGE_WIDTH = 1200;
const DESCRIPTION_IMAGE_QUALITY = 75;

function optimizeDescriptionImageSrc(src: string | undefined): string | undefined {
  if (!src || process.env.NODE_ENV !== 'production') return src;

  try {
    const url = new URL(src);
    const isOptimizableHost =
      url.hostname === 'cdn.fusionmarkt.com' ||
      url.hostname === 'fusionmarkt.com' ||
      url.hostname === 'www.fusionmarkt.com';

    if (!isOptimizableHost || url.pathname === '/_next/image') return src;

    return `/_next/image?url=${encodeURIComponent(url.toString())}&w=${DESCRIPTION_IMAGE_WIDTH}&q=${DESCRIPTION_IMAGE_QUALITY}`;
  } catch {
    return src;
  }
}

/**
 * `<img>` etiketini tek biçime getirir: lazy yükleme, responsive genişlik ve
 * -boyut biliniyorsa- yer ayıran `aspect-ratio`.
 *
 * Boyut olmadan lazy yüklenen görseller yüklenene kadar 0px yer kapladığı için
 * sayfa scroll sırasında sıçrıyordu; `aspect-ratio` bu boşluğu önceden ayırır.
 */
function normalizeImageTag(rawAttrs: string): string {
  const attrs = rawAttrs.replace(/\/\s*$/, '');

  const readAttr = (name: string): string | undefined =>
    attrs.match(new RegExp(`\\s${name}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1];

  const readSize = (name: 'width' | 'height'): number | undefined => {
    const value = Number.parseInt(readAttr(name) ?? '', 10);
    return Number.isFinite(value) && value > 0 ? value : undefined;
  };

  const width = readSize('width');
  const height = readSize('height');
  const src = optimizeDescriptionImageSrc(readAttr('src'));
  const inlineStyle = (readAttr('style') ?? '')
    .replace(/(^|;)\s*(width|height|aspect-ratio)\s*:[^;]*/gi, '')
    .replace(/^;+|;+$/g, '')
    .trim();

  const passthroughAttrs = attrs
    .replace(/\s(src|width|height|style|loading|decoding|fetchpriority)\s*=\s*["'][^"']*["']/gi, '')
    .trim();

  const styleParts = ['width:100%', 'height:auto'];
  if (width && height) styleParts.push(`aspect-ratio:${width}/${height}`);
  if (inlineStyle) styleParts.push(inlineStyle);

  const sizeAttrs = width && height ? ` width="${width}" height="${height}"` : '';
  const srcAttr = src ? ` src="${src.replace(/"/g, '&quot;')}"` : '';
  const prefix = passthroughAttrs ? ` ${passthroughAttrs}` : '';
  // Boyutu bilinmeyen lazy görseller Safari'de yüklenene kadar 0px yer kaplar.
  // Bu durumda eager/sync kullanmak, küçük scroll hareketlerinde lazy-load ve
  // scroll anchoring döngüsünü engeller.
  const loadingAttrs = width && height
    ? ' loading="lazy" decoding="async"'
    : ' loading="eager" decoding="sync"';

  return `<img${loadingAttrs}${srcAttr}${prefix}${sizeAttrs} style="${styleParts.join(';')}">`;
}

// HTML içeriğini temizleme ve güvenlik sanitizer fonksiyonu
export function cleanHtmlContent(html: string): string {
  if (!html) return '';

  return html
    // ═══════════════════════════════════════════════════════════════════════════
    // SECURITY: XSS Prevention
    // ═══════════════════════════════════════════════════════════════════════════
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove style tags and their content
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove event handlers (onclick, onerror, onload, etc.)
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove data: protocol (can be used for XSS)
    .replace(/data:/gi, '')
    // Remove iframe tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Remove object tags
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    // Remove embed tags
    .replace(/<embed[^>]*>/gi, '')
    // Remove form tags
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    // Remove input/button tags
    .replace(/<(input|button|textarea|select)[^>]*>/gi, '')
    // ═══════════════════════════════════════════════════════════════════════════
    // Content Cleanup
    // ═══════════════════════════════════════════════════════════════════════════
    // 1. &nbsp; karakterlerini normal boşluğa çevir (önce yapılmalı)
    .replace(/&nbsp;/gi, ' ')
    // 2. Unicode non-breaking space karakterlerini temizle
    .replace(/\u00A0/g, ' ')
    // 3. Soft hyphen karakterlerini kaldır (görünmez tire - kelime kesme noktası)
    // WordPress/Word'den kopyalanan metinlerde sıkça bulunur
    .replace(/\u00AD/g, '')
    .replace(/&shy;/gi, '')
    // 4. Zero-width karakterleri kaldır (görünmez boşluklar)
    .replace(/\u200B/g, '') // Zero-width space
    .replace(/\u200C/g, '') // Zero-width non-joiner
    .replace(/\u200D/g, '') // Zero-width joiner
    .replace(/\u2060/g, '') // Word joiner
    .replace(/\uFEFF/g, '') // BOM (Byte Order Mark)
    // 5. Kelime ortasındaki <br> taglarını kaldır (WordPress editörden gelen yanlış satır sonları)
    // Örnek: "taş<br>ınabilir" → "taşınabilir", "şa<br>rj" → "şarj"
    .replace(/([a-zçğıöşüA-ZÇĞİÖŞÜ0-9])[\s\n\r]*<br\s*\/?>\s*\n?\r?\s*([a-zçğıöşüA-ZÇĞİÖŞÜ])/gi, '$1$2')
    // 6. Escaped newline karakterlerini kaldır
    .replace(/\\n/g, '')
    // 7. Literal \n karakterlerini kaldır
    .replace(/\n/g, '')
    // 8. Kelime ortasındaki tek satır sonlarını temizle (noktalama olmadan)
    // Örnek: "yükse\nk" → "yüksek"
    .replace(/([a-zçğıöşüA-ZÇĞİÖŞÜ])\s*\r?\n\s*([a-zçğıöşüA-ZÇĞİÖŞÜ])/gi, '$1$2')
    // 9. Quill editör UI span'larını kaldır
    .replace(/<span class="ql-ui"[^>]*>.*?<\/span>/gi, '')
    // 10. Boş paragrafları temizle
    .replace(/<p>\s*<\/p>/gi, '')
    // 11. Ardışık boşlukları tek boşluğa indir
    .replace(/\s{2,}/g, ' ')
    // 12. Tablo benzeri bloklarda sabit ölçüleri kaldır (responsive olsunlar)
    .replace(
      new RegExp(`<(${SIZED_BLOCK_TAGS})\\b([^>]*)>`, 'gi'),
      (_match, tag: string, tagAttrs: string) =>
        `<${tag}${tagAttrs.replace(/\s(width|height)\s*=\s*["'][^"']*["']/gi, '')}>`
    )
    // 13. Görselleri normalize et (lazy + responsive + yer ayıran aspect-ratio)
    .replace(/<img\b([^>]*)>/gi, (_match, imgAttrs: string) => normalizeImageTag(imgAttrs));
}
