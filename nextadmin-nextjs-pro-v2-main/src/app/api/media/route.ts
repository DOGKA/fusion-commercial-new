import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { PrismaClient } from "@prisma/client";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

// S3 Client - Frankfurt (eu-central-1)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-central-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "fusionmarkt";
const CDN_URL = process.env.AWS_CLOUDFRONT_URL || `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "eu-central-1"}.amazonaws.com`;

// KVKK gereği yerel sunucuda saklanacak klasörler
const LOCAL_STORAGE_FOLDERS = ["USERS"];

// Yerel depolama yolu - Production'da sunucu disk yolu kullanılır
// Development'ta public/uploads kullanılır
const getLocalStoragePath = () => {
  // Production'da ayrı bir klasör kullan (sunucuda kalıcı)
  if (process.env.LOCAL_UPLOAD_PATH) {
    return process.env.LOCAL_UPLOAD_PATH; // örn: /var/www/fusionmarkt-uploads
  }
  // Development'ta public/uploads kullan
  return path.join(process.cwd(), "public", "uploads");
};

// Yerel dosya URL'i - Production'da ayrı domain/path olabilir
const getLocalFileUrl = (key: string) => {
  if (process.env.LOCAL_UPLOAD_URL) {
    return `${process.env.LOCAL_UPLOAD_URL}/${key}`; // örn: https://files.fusionmarkt.com/users/...
  }
  return `/uploads/${key}`;
};

// Yerel dosya kaydetme fonksiyonu
async function saveFileLocally(
  buffer: Buffer,
  filename: string,
  folder: string
): Promise<{ key: string; url: string }> {
  const basePath = getLocalStoragePath();
  const uploadDir = path.join(basePath, folder.toLowerCase());
  await mkdir(uploadDir, { recursive: true });
  
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  const ext = filename.split(".").pop();
  const cleanName = filename.replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase();
  const key = `${folder.toLowerCase()}/${timestamp}-${randomId}-${cleanName}`;
  
  const filepath = path.join(basePath, key);
  await writeFile(filepath, buffer);
  
  return {
    key,
    url: getLocalFileUrl(key),
  };
}

// Yerel dosya silme fonksiyonu
async function deleteLocalFile(key: string): Promise<void> {
  const basePath = getLocalStoragePath();
  const filepath = path.join(basePath, key);
  try {
    await unlink(filepath);
  } catch (error) {
    console.error("Local file delete error:", error);
  }
}

// GET - Tüm medya dosyalarını listele
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {};
    if (folder && folder !== "all") {
      where.folder = folder;
    }

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.media.count({ where }),
    ]);

    return NextResponse.json({
      media,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Medya dosyaları getirilemedi" },
      { status: 500 }
    );
  }
}

// POST - Yeni dosya yükle (USERS yerel, diğerleri S3'e)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const folder = (formData.get("folder") as string) || "GENERAL";

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    const uploadedMedia: any[] = [];
    const isLocalStorage = LOCAL_STORAGE_FOLDERS.includes(folder);

    for (const file of files) {
      if (!file || typeof file === "string") continue;

      // Dosya validasyonu
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
      if (!allowedTypes.includes(file.type)) {
        continue; // Geçersiz dosya tipini atla
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        continue; // Çok büyük dosyayı atla
      }

      // Dosyayı buffer'a çevir
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      let key: string;
      let url: string;

      if (isLocalStorage) {
        // KVKK gereği yerel sunucuda sakla (kullanıcı profil resimleri)
        const result = await saveFileLocally(buffer, file.name, folder);
        key = result.key;
        url = result.url;
      } else {
        // S3'e yükle (ürünler, sliderlar, bannerlar vs.)
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase();
        
        // Klasör yapısı: products/, sliders/, banners/, general/
        const folderPath = folder.toLowerCase();
        key = `${folderPath}/${timestamp}-${randomId}-${cleanName}`;

        const command = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: file.type,
          // ACL kaldırıldı - bucket policy ile public access sağlanıyor
          Metadata: {
            originalName: file.name,
            uploadedBy: session.user.id || "unknown",
          },
        });

        await s3Client.send(command);
        url = `${CDN_URL}/${key}`;
      }

      // Veritabanına kaydet
      const media = await prisma.media.create({
        data: {
          filename: file.name,
          key,
          url,
          mimeType: file.type,
          size: file.size,
          folder: folder as any,
          uploadedBy: session.user.id,
        },
      });

      uploadedMedia.push(media);
    }

    if (uploadedMedia.length === 0) {
      return NextResponse.json(
        { error: "Hiçbir dosya yüklenemedi" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      media: uploadedMedia,
      urls: uploadedMedia.map((m) => m.url),
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Dosya yüklenirken hata oluştu", details: error?.message },
      { status: 500 }
    );
  }
}

// DELETE - Dosya sil (yerel veya S3'ten + veritabanından)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
    }

    // Veritabanından bul
    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 });
    }

    // Yerel mi S3 mi kontrol et
    const isLocalStorage = LOCAL_STORAGE_FOLDERS.includes(media.folder);

    if (isLocalStorage) {
      // Yerel dosyayı sil
      await deleteLocalFile(media.key);
    } else {
      // S3'ten sil
      try {
        const command = new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: media.key,
        });
        await s3Client.send(command);
      } catch (s3Error) {
        console.error("S3 delete error:", s3Error);
        // S3'ten silme başarısız olsa bile veritabanından sil
      }
    }

    // Veritabanından sil
    await prisma.media.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Dosya silinirken hata oluştu", details: error?.message },
      { status: 500 }
    );
  }
}
