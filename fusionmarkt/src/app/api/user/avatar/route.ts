/**
 * User Avatar Upload API - LOCAL Storage
 * POST /api/user/avatar - Upload avatar
 * DELETE /api/user/avatar - Remove avatar
 * 
 * Rate Limited: 10 uploads per minute per user
 */

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink, readdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@repo/db";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// Storage path for user avatars
const AVATAR_STORAGE_PATH = "./public/storage/users";
const AVATAR_PUBLIC_PATH = "/storage/users";

// Allowed magic bytes for image validation
const IMAGE_MAGIC_BYTES: Record<string, number[]> = {
  "image/jpeg": [0xFF, 0xD8, 0xFF],
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
    // Check authentication
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const userId = session.user.id;

    // Rate limiting per user
    const rateLimit = checkRateLimit(`avatar:${userId}`, { limit: 10, windowSeconds: 60 });
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Çok fazla yükleme denemesi. Lütfen bekleyin." },
        { status: 429 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Sadece JPEG, PNG ve WebP formatları desteklenir" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Dosya boyutu 5MB'dan küçük olmalıdır" },
        { status: 400 }
      );
    }

    // Create user directory if not exists
    const userDir = path.join(AVATAR_STORAGE_PATH, userId);
    if (!existsSync(userDir)) {
      await mkdir(userDir, { recursive: true });
    }

    // Delete ALL old avatar files (any extension) to prevent cache issues
    try {
      const files = await readdir(userDir);
      for (const oldFile of files) {
        if (oldFile.startsWith("avatar")) {
          await unlink(path.join(userDir, oldFile));
        }
      }
    } catch {
      // Directory might not exist yet, ignore
    }

    // Convert to buffer and validate
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate magic bytes (prevent fake image uploads)
    if (!validateImageMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        { error: "Geçersiz dosya formatı" },
        { status: 400 }
      );
    }

    // Save with timestamp to bust cache
    const ext = file.type === "image/webp" ? "webp" : file.type.split("/")[1];
    const timestamp = Date.now();
    const filename = `avatar-${timestamp}.${ext}`;
    const filePath = path.join(userDir, filename);
    
    await writeFile(filePath, buffer);

    // Update user in database with cache-busting URL
    const avatarUrl = `${AVATAR_PUBLIC_PATH}/${userId}/${filename}`;
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        image: avatarUrl,
        avatarPath: filePath,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profil resmi güncellendi",
      avatarUrl,
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Profil resmi yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Check authentication
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarPath: true },
    });

    // Delete file if exists
    if (user?.avatarPath && existsSync(user.avatarPath)) {
      await unlink(user.avatarPath);
    }

    // Update user in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        image: null,
        avatarPath: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profil resmi kaldırıldı",
    });
  } catch (error) {
    console.error("Avatar delete error:", error);
    return NextResponse.json(
      { error: "Profil resmi kaldırılırken bir hata oluştu" },
      { status: 500 }
    );
  }
}
