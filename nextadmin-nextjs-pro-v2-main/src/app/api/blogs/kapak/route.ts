import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { assertImage, coverProduct, generateCover, plainText, storeCover } from "@/lib/blog/server";

export const maxDuration = 300;

/**
 * JSON gövde: başlık, içerik ve kategoriden Nano Banana Pro ile kapak üretir.
 * İçerikte güç kaynağımızın adı, bağlantısı veya görseli geçiyorsa (ya da konu
 * ürün kullanımıysa) ürünün beyaz fonlu ön görseli referans olarak gönderilir.
 * Kaydedilmemiş içerik de kullanılır; panel gövdeyi editörden gönderiyor.
 * Form gövdesi: seçilen dosyayı kapak olarak kaydeder.
 * Her iki durumda da yazıya bağlanmaz; panel "Kullan" deyince alana yazar.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });

  try {
    if ((request.headers.get("content-type") ?? "").includes("multipart/form-data")) {
      const file = (await request.formData()).get("file");
      if (!(file instanceof File)) throw new Error("Görsel seçilmedi.");
      assertImage(file);
      const src = await storeCover(Buffer.from(await file.arrayBuffer()));
      return NextResponse.json({ src });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content : "";
    if (!title) throw new Error("Kapak üretmek için önce başlığı yazın.");
    if (plainText(content).length < 40) throw new Error("Kapak üretmek için içeriğe biraz metin yazın.");

    const cover = {
      title,
      content,
      category: typeof body.category === "string" && body.category ? body.category : null,
      attempt: Number.isInteger(body.attempt) ? (body.attempt as number) : 0,
    };
    const product = await coverProduct(cover);
    const src = await storeCover(await generateCover(cover, product));
    return NextResponse.json({ src, product: product?.name ?? null });
  } catch (error) {
    console.error("Blog kapağı oluşturulamadı:", error);
    const message = error instanceof Error ? error.message : "Kapak oluşturulamadı.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
