/**
 * Admin-side Invoice PDF Stream
 *
 * GET /api/invoices/<filename>?t=<token>
 *
 * Aynı dosya admin uygulamasının `public/storage/invoices/` klasöründen okunur.
 * Token bazlı doğrulama, fusionmarkt route'u ile aynı semantiğe sahiptir.
 */

import { NextRequest } from "next/server";
import { prisma } from "@repo/db";
import path from "path";
import { stat, readFile } from "fs/promises";

export const dynamic = "force-dynamic";

function notFound() {
  return new Response("Not found", { status: 404 });
}

function safeFileName(input: unknown): string | null {
  if (typeof input !== "string") return null;
  if (!input.endsWith(".pdf")) return null;
  if (input.includes("/") || input.includes("\\") || input.includes("..")) return null;
  if (!/^[A-Za-z0-9._-]+$/.test(input)) return null;
  return input;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ file: string }> },
) {
  try {
    const { file } = await context.params;
    const fileName = safeFileName(file);
    if (!fileName) return notFound();

    const token = new URL(request.url).searchParams.get("t");
    if (!token || token.length < 16) return notFound();

    const order = await prisma.order.findFirst({
      where: {
        invoiceToken: token,
        invoiceUrl: { contains: fileName },
      },
      select: { id: true },
    });
    if (!order) return notFound();

    const filePath = path.join(process.cwd(), "public", "storage", "invoices", fileName);
    try {
      await stat(filePath);
    } catch {
      console.warn(`[invoices] File missing on disk: ${filePath}`);
      return notFound();
    }

    const buffer = await readFile(filePath);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[invoices] stream error:", error);
    return notFound();
  }
}
