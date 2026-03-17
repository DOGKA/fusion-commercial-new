# FusionMarkt AI SEO Bot

AI destekli SEO otomasyon sistemi. Ürün veritabanı ve datasheet PDF'lerinden okuyarak içerik üretir.

## Gereksinimler

```bash
# .env dosyasına ekleyin:
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
```

## Scriptler

| # | Script | Açıklama | Mod |
|---|--------|----------|-----|
| 1 | `1-seo-audit.ts` | Teknik SEO denetimi (CSV + DB) | Sadece rapor |
| 2 | `2-product-seo.ts` | Ürün meta + zengin açıklama üretimi | `--dry-run` / `--apply` |
| 3 | `3-category-content.ts` | Kategori hub içeriği üretimi | `--dry-run` / `--apply` |
| 4 | `4-landing-pages.ts` | Use-case landing page üretimi | `--dry-run` / `--apply` |
| 5 | `5-blog-generator.ts` | Karşılaştırma blog yazıları | `--dry-run` / `--apply` |
| 6 | `6-internal-links.ts` | İç link fırsatları analizi | Sadece rapor |
| 7 | `7-technical-cleanup.ts` | Placeholder, noindex, redirect | `--dry-run` / `--apply` |

## Kullanım

```bash
# 1. Önce audit çalıştırın
npx tsx scripts/seo-bot/1-seo-audit.ts

# 2. Teknik temizlik (önce dry-run)
npx tsx scripts/seo-bot/7-technical-cleanup.ts --dry-run
npx tsx scripts/seo-bot/7-technical-cleanup.ts --apply

# 3. Ürün SEO (tek ürün test)
npx tsx scripts/seo-bot/2-product-seo.ts --slug p800 --dry-run
npx tsx scripts/seo-bot/2-product-seo.ts --apply

# 4. Kategori içerikleri
npx tsx scripts/seo-bot/3-category-content.ts --dry-run
npx tsx scripts/seo-bot/3-category-content.ts --apply

# 5. Landing page'ler
npx tsx scripts/seo-bot/4-landing-pages.ts --dry-run
npx tsx scripts/seo-bot/4-landing-pages.ts --apply

# 6. Blog yazıları
npx tsx scripts/seo-bot/5-blog-generator.ts --dry-run
npx tsx scripts/seo-bot/5-blog-generator.ts --apply

# 7. İç link analizi
npx tsx scripts/seo-bot/6-internal-links.ts
```

## Çalışma Sırası (Önerilen)

```
1-seo-audit.ts → Mevcut durumu anla
7-technical-cleanup.ts → Acil sorunları düzelt
2-product-seo.ts → Ürün meta verilerini optimize et
3-category-content.ts → Kategori hub'larını güçlendir
4-landing-pages.ts → Use-case sayfaları oluştur
5-blog-generator.ts → Karşılaştırma içerikleri üret
6-internal-links.ts → İç link ağını optimize et
```

## Raporlar

Tüm çıktılar `scripts/seo-bot/reports/` altında:
- `seo-audit-{tarih}.json`
- `product-seo-{tarih}.json`
- `category-content-{tarih}.json`
- `landing-pages-{tarih}.json`
- `blog-generator-{tarih}.json`
- `internal-links-{tarih}.json`
- `technical-cleanup-{tarih}.json`
- `backup-*-{tarih}.json` (değişiklik öncesi yedekler)

## Güvenlik

- Her script varsayılan olarak `--dry-run` modunda çalışır
- `--apply` bayrağı olmadan DB/dosya değişikliği yapılmaz
- Değişiklik öncesi mevcut veriler backup'lanır
- Blog yazıları `DRAFT` olarak oluşturulur (yayınlamadan önce kontrol)
