import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const type = formData.get("type") as string || "product";
    
    // Tek dosya veya çoklu dosya desteği
    const singleFile = formData.get("file") as File | null;
    const multipleFiles = formData.getAll("files") as File[];
    
    const files = singleFile ? [singleFile] : multipleFiles;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload klasörünü oluştur
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (!file || typeof file === "string") continue;
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Dosya adı oluştur
      const ext = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const filename = `${type}-${timestamp}-${randomId}.${ext}`;
      
      // Dosyayı kaydet
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      
      uploadedUrls.push(`/uploads/${filename}`);
    }

    // Tek dosya için eski format, çoklu için urls array
    if (uploadedUrls.length === 1) {
      return NextResponse.json({ 
        success: true,
        url: uploadedUrls[0],
        urls: uploadedUrls,
        key: uploadedUrls[0].replace('/uploads/', '')
      });
    }

    return NextResponse.json({ 
      success: true,
      urls: uploadedUrls
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "No key provided" }, { status: 400 });
    }

    const contentType = request.headers.get("content-type") || "application/octet-stream";
    const ext = contentType.split("/")[1] || "jpg";
    const filename = `${key}.${ext}`;

    const bytes = await request.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload klasörünü oluştur
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    
    // Dosyayı kaydet
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
