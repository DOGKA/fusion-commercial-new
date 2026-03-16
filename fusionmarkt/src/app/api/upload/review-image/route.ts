/**
 * Review Image Upload API
 * POST /api/upload/review-image
 * 
 * Sadece giriş yapmış kullanıcılar görsel yükleyebilir
 * Görseller S3 product-comments/ klasörüne yüklenir
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { uploadToS3, generateReviewImageKey, isS3Configured } from "@/lib/s3";

// Max dosya boyutu: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// İzin verilen dosya tipleri
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Allowed magic bytes for image validation
const IMAGE_MAGIC_BYTES: Record<string, number[]> = {
  "image/jpeg": [0xFF, 0xD8, 0xFF],
  "image/jpg": [0xFF, 0xD8, 0xFF],
  "image/png": [0x89, 0x50, 0x4E, 0x47],
  "image/webp": [0x52, 0x49, 0x46, 0x46], // RIFF header
};

function validateImageMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const expectedBytes = IMAGE_MAGIC_BYTES[mimeType];
  if (!expectedBytes) return false;
  
  for (let i = 0; i < expectedBytes.length; i++) {
    if (buffer[i] !== expectedBytes[i]) return false;
  }
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Auth kontrolü - sadece giriş yapmış kullanıcılar
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Görsel yüklemek için giriş yapmanız gerekmektedir" },
        { status: 401 }
      );
    }

    // S3 konfigürasyon kontrolü
    if (!isS3Configured()) {
      console.error("S3 credentials not configured");
      return NextResponse.json(
        { error: "Görsel yükleme servisi şu anda kullanılamıyor" },
        { status: 503 }
      );
    }

    // Form data parse
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Dosya bulunamadı" },
        { status: 400 }
      );
    }

    // Dosya tipi kontrolü
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Sadece JPEG, PNG ve WebP formatları desteklenir" },
        { status: 400 }
      );
    }

    // Dosya boyutu kontrolü
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Dosya boyutu 5MB'dan küçük olmalıdır" },
        { status: 400 }
      );
    }

    // Buffer'a çevir
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Magic bytes kontrolü (sahte dosya yükleme önleme)
    if (!validateImageMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        { error: "Geçersiz dosya formatı" },
        { status: 400 }
      );
    }

    // S3 key oluştur
    const key = generateReviewImageKey(session.user.id, file.name);

    // S3'e yükle
    const url = await uploadToS3(key, buffer, file.type);

    return NextResponse.json({
      success: true,
      url,
      key,
    });
  } catch (error) {
    console.error("Review image upload error:", error);
    return NextResponse.json(
      { error: "Görsel yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

