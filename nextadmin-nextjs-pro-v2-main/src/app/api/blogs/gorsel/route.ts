import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { assertImage, storeContentImage } from "@/lib/blog/server";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });

  try {
    const file = (await request.formData()).get("file");
    if (!(file instanceof File)) throw new Error("Görsel seçilmedi.");
    assertImage(file);
    const url = await storeContentImage(Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Blog görseli yüklenemedi:", error);
    const message = error instanceof Error ? error.message : "Görsel yüklenemedi.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
