import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";

const SITE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.FRONTEND_URL || "https://fusionmarkt.com";

function escapeCsvField(value: string | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsvRow(fields: (string | null | undefined)[]): string {
  return fields.map(escapeCsvField).join(",");
}

function getAvailability(stock: number, isActive: boolean): string {
  if (!isActive) return "out of stock";
  if (stock > 0) return "in stock";
  return "out of stock";
}

function getCondition(): string {
  return "new";
}

function getProductLink(slug: string): string {
  return `${SITE_URL}/urun/${slug}`;
}

function getImageLink(thumbnail: string | null): string {
  if (!thumbnail) return "";
  if (thumbnail.startsWith("http")) return thumbnail;
  return `${SITE_URL}${thumbnail}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "merchant";

    const products = await (prisma.product as any).findMany({
      where: { isActive: true },
      include: {
        category: {
          include: { parent: true },
        },
        brandRef: true,
        variants: {
          where: { isActive: true },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let csvContent: string;

    if (format === "ads") {
      csvContent = buildGoogleAdsCsv(products);
    } else {
      csvContent = buildGoogleMerchantCsv(products);
    }

    const filename = format === "ads"
      ? `google-ads-products-${new Date().toISOString().split("T")[0]}.csv`
      : `google-merchant-products-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("CSV export error:", error);
    return NextResponse.json({ error: "Dışa aktarma başarısız" }, { status: 500 });
  }
}

function buildGoogleMerchantCsv(products: any[]): string {
  const headers = [
    "id",
    "title",
    "description",
    "link",
    "image_link",
    "additional_image_link",
    "availability",
    "price",
    "sale_price",
    "brand",
    "gtin",
    "mpn",
    "condition",
    "product_type",
    "google_product_category",
    "item_group_id",
    "shipping_weight",
    "custom_label_0",
    "custom_label_1",
    "custom_label_2",
  ];

  const rows = products.map((p: any) => {
    const categoryPath = p.category?.parent
      ? `${p.category.parent.name} > ${p.category.name}`
      : p.category?.name || "";

    const additionalImages = (p.images || [])
      .filter((img: string) => img !== p.thumbnail)
      .slice(0, 10)
      .map((img: string) => getImageLink(img))
      .join(",");

    const price = `${Number(p.price).toFixed(2)} TRY`;
    const salePrice = p.comparePrice && Number(p.comparePrice) > Number(p.price)
      ? `${Number(p.price).toFixed(2)} TRY`
      : "";
    const displayPrice = p.comparePrice && Number(p.comparePrice) > Number(p.price)
      ? `${Number(p.comparePrice).toFixed(2)} TRY`
      : price;

    return buildCsvRow([
      p.sku || p.id,
      p.name,
      (p.shortDescription || p.description || "").replace(/<[^>]*>/g, "").substring(0, 5000),
      getProductLink(p.slug),
      getImageLink(p.thumbnail),
      additionalImages,
      getAvailability(p.stock, p.isActive),
      displayPrice,
      salePrice,
      p.brandRef?.name || p.brand || "",
      p.barcode || "",
      p.sku || "",
      getCondition(),
      categoryPath,
      "",
      p.variants?.length > 0 ? (p.sku || p.id) : "",
      p.weight ? `${Number(p.weight)} kg` : "",
      p.isFeatured ? "featured" : "",
      p.isNew ? "new" : "",
      p.freeShipping ? "free_shipping" : "",
    ]);
  });

  return [headers.join(","), ...rows].join("\n");
}

function buildGoogleAdsCsv(products: any[]): string {
  const headers = [
    "ID",
    "Item title",
    "Final URL",
    "Image URL",
    "Item description",
    "Item category",
    "Price",
    "Sale price",
    "Item address",
    "Tracking template",
    "Custom parameter",
    "Item subtitle",
  ];

  const rows = products.map((p: any) => {
    const categoryPath = p.category?.parent
      ? `${p.category.parent.name} > ${p.category.name}`
      : p.category?.name || "";

    const price = `${Number(p.price).toFixed(2)} TRY`;
    const salePrice = p.comparePrice && Number(p.comparePrice) > Number(p.price)
      ? `${Number(p.price).toFixed(2)} TRY`
      : "";
    const displayPrice = p.comparePrice && Number(p.comparePrice) > Number(p.price)
      ? `${Number(p.comparePrice).toFixed(2)} TRY`
      : price;

    return buildCsvRow([
      p.sku || p.id,
      p.name,
      getProductLink(p.slug),
      getImageLink(p.thumbnail),
      (p.shortDescription || p.description || "").replace(/<[^>]*>/g, "").substring(0, 300),
      categoryPath,
      displayPrice,
      salePrice,
      "",
      "",
      "",
      p.brand || p.brandRef?.name || "",
    ]);
  });

  return [headers.join(","), ...rows].join("\n");
}
