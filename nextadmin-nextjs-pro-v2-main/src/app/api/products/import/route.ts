import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";

interface CsvRow {
  [key: string]: string;
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: CsvRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || "";
    });
    rows.push(row);
  }

  return rows;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveField(row: CsvRow, ...keys: string[]): string {
  for (const key of keys) {
    const val = row[key];
    if (val && val.trim()) return val.trim();
  }
  return "";
}

function parsePrice(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[^\d.,]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const mode = (formData.get("mode") as string) || "create";

    if (!file) {
      return NextResponse.json({ error: "CSV dosyası gerekli" }, { status: 400 });
    }

    const text = await file.text();
    const rows = parseCsv(text);

    if (rows.length === 0) {
      return NextResponse.json({ error: "CSV dosyasında veri bulunamadı" }, { status: 400 });
    }

    const categories = await (prisma.category as any).findMany({
      select: { id: true, name: true, slug: true },
    });
    const categoryMap = new Map<string, string>();
    categories.forEach((c: any) => {
      categoryMap.set(c.name.toLowerCase(), c.id);
      categoryMap.set(c.slug.toLowerCase(), c.id);
    });

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as { row: number; name: string; error: string }[],
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      try {
        const name = resolveField(row, "title", "Item title", "name", "Ürün Adı", "urun_adi");
        if (!name) {
          results.skipped++;
          continue;
        }

        const sku = resolveField(row, "mpn", "ID", "sku", "SKU", "id");
        const description = resolveField(row, "description", "Item description", "Açıklama", "aciklama");
        const priceStr = resolveField(row, "price", "Price", "Fiyat", "fiyat");
        const salePriceStr = resolveField(row, "sale_price", "Sale price", "İndirimli Fiyat", "indirimli_fiyat");
        const imageUrl = resolveField(row, "image_link", "Image URL", "Görsel", "gorsel", "thumbnail");
        const additionalImages = resolveField(row, "additional_image_link", "Ek Görseller", "images");
        const brand = resolveField(row, "brand", "Item subtitle", "Marka", "marka");
        const barcode = resolveField(row, "gtin", "Barkod", "barcode");
        const categoryName = resolveField(row, "product_type", "Item category", "Kategori", "kategori", "google_product_category");
        const stockStr = resolveField(row, "stock", "Stok", "stok");
        const availabilityStr = resolveField(row, "availability", "Durumu", "durum");
        const weightStr = resolveField(row, "shipping_weight", "Ağırlık", "agirlik", "weight");
        const shortDesc = resolveField(row, "short_description", "Kısa Açıklama", "kisa_aciklama");
        const isFeaturedStr = resolveField(row, "custom_label_0", "Öne Çıkan", "one_cikan", "is_featured");
        const isNewStr = resolveField(row, "custom_label_1", "Yeni", "yeni", "is_new");
        const freeShippingStr = resolveField(row, "custom_label_2", "Ücretsiz Kargo", "ucretsiz_kargo", "free_shipping");

        const price = parsePrice(priceStr);
        const salePrice = parsePrice(salePriceStr);

        let categoryId = "";
        if (categoryName) {
          const parts = categoryName.split(">").map((s: string) => s.trim());
          const lastPart = parts[parts.length - 1];
          categoryId = categoryMap.get(lastPart.toLowerCase()) || "";
          if (!categoryId) {
            for (const part of parts) {
              const found = categoryMap.get(part.toLowerCase().trim());
              if (found) { categoryId = found; break; }
            }
          }
        }

        if (!categoryId) {
          const firstCategory = categories[0];
          if (firstCategory) {
            categoryId = firstCategory.id;
          } else {
            results.errors.push({ row: rowNum, name, error: "Kategori bulunamadı ve varsayılan kategori yok" });
            results.skipped++;
            continue;
          }
        }

        let stock = stockStr ? parseInt(stockStr) || 0 : 0;
        if (!stockStr && availabilityStr) {
          stock = availabilityStr.toLowerCase().includes("in stock") ? 10 : 0;
        }

        const comparePrice = salePrice > 0 && salePrice < price ? price : (salePrice > price ? salePrice : null);
        const finalPrice = salePrice > 0 && salePrice < price ? salePrice : price;

        const weight = weightStr ? parseFloat(weightStr.replace(/[^\d.]/g, "")) || null : null;

        const images: string[] = [];
        if (imageUrl) images.push(imageUrl);
        if (additionalImages) {
          additionalImages.split(",").forEach((img: string) => {
            const trimmed = img.trim();
            if (trimmed && !images.includes(trimmed)) images.push(trimmed);
          });
        }

        const isFeatured = ["true", "1", "yes", "evet", "featured"].includes(isFeaturedStr.toLowerCase());
        const isNew = ["true", "1", "yes", "evet", "new"].includes(isNewStr.toLowerCase());
        const freeShipping = ["true", "1", "yes", "evet", "free_shipping"].includes(freeShippingStr.toLowerCase());

        const slug = slugify(name);

        const productData = {
          name,
          description: description || null,
          shortDescription: shortDesc || null,
          price: finalPrice,
          comparePrice: comparePrice,
          sku: sku || null,
          barcode: barcode || null,
          stock,
          brand: brand || null,
          weight,
          thumbnail: imageUrl || null,
          images,
          isActive: true,
          isFeatured,
          isNew,
          freeShipping,
          categoryId,
        };

        if (mode === "update" && sku) {
          const existing = await (prisma.product as any).findFirst({
            where: { OR: [{ sku }, { slug }] },
          });

          if (existing) {
            await (prisma.product as any).update({
              where: { id: existing.id },
              data: productData,
            });
            results.updated++;
            continue;
          }
        }

        const existingSlug = await (prisma.product as any).findUnique({ where: { slug } });
        const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

        if (sku) {
          const existingSku = await (prisma.product as any).findFirst({ where: { sku } });
          if (existingSku) {
            if (mode === "update") {
              await (prisma.product as any).update({
                where: { id: existingSku.id },
                data: productData,
              });
              results.updated++;
              continue;
            }
            productData.sku = `${sku}-${Date.now()}`;
          }
        }

        await (prisma.product as any).create({
          data: { ...productData, slug: finalSlug },
        });
        results.created++;
      } catch (err: any) {
        const name = resolveField(rows[i], "title", "Item title", "name", "Ürün Adı") || `Satır ${rowNum}`;
        results.errors.push({ row: rowNum, name, error: err.message || "Bilinmeyen hata" });
      }
    }

    return NextResponse.json({
      success: true,
      totalRows: rows.length,
      ...results,
    });
  } catch (error: any) {
    console.error("CSV import error:", error);
    return NextResponse.json(
      { error: "İçe aktarma başarısız", message: error?.message },
      { status: 500 }
    );
  }
}
