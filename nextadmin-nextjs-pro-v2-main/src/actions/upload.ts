"use server";

import { isAuthorized } from "@/libs/isAuthorized";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const acceptedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const maxSize = 5000000; // 5mb

// Local upload için - S3/R2 yerine public klasörüne kaydet
export async function uploadFile(formData: FormData) {
  const user = await isAuthorized();

  if (!user) {
    return { failure: "Giriş yapmanız gerekiyor" };
  }

  const file = formData.get("file") as File;
  
  if (!file) {
    return { failure: "Dosya bulunamadı" };
  }

  if (!acceptedTypes.includes(file.type)) {
    return { failure: "Geçersiz dosya türü. PNG, JPG veya WEBP yükleyin." };
  }

  if (file.size > maxSize) {
    return { failure: "Dosya çok büyük. Maksimum 5MB." };
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Dosya adı oluştur
    const ext = file.name.split('.').pop();
    const timestamp = Date.now();
    const filename = `${user.id}-${timestamp}.${ext}`;
    
    // Upload klasörünü oluştur
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    
    // Dosyayı kaydet
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    return { 
      success: { 
        url: `/uploads/${filename}`,
        key: filename 
      } 
    };
  } catch (error) {
    console.error("Upload error:", error);
    return { failure: "Dosya yüklenirken hata oluştu" };
  }
}

// Eski getSignedURL fonksiyonunu kaldır/bypass yap
export async function getSignedURL(type: string, size: number) {
  const user = await isAuthorized();

  if (!user) {
    return { failure: "Giriş yapmanız gerekiyor" };
  }

  if (!acceptedTypes.includes(type)) {
    return { failure: "Geçersiz dosya türü" };
  }

  if (size > maxSize) {
    return { failure: "Dosya çok büyük" };
  }

  // Local upload için basit bir URL döndür
  const key = `profile-${user.id}-${Date.now()}`;
  
  return { 
    success: { 
      url: `/api/upload?key=${key}`,
      key 
    } 
  };
}
