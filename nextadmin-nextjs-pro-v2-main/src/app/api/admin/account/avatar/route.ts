/**
 * Admin Avatar Upload API
 * POST /api/admin/account/avatar - Upload avatar
 * DELETE /api/admin/account/avatar - Delete avatar
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { writeFile, mkdir, unlink, readdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// Storage path - admin public folder
const STORAGE_BASE_PATH = path.join(process.cwd(), "public", "storage", "avatars");

// POST - Upload avatar
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Sadece JPEG, PNG ve WebP formatları desteklenir" },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Dosya boyutu 5MB'dan büyük olamaz" },
        { status: 400 }
      );
    }

    // Create user directory
    const userDir = path.join(STORAGE_BASE_PATH, session.user.id);
    if (!existsSync(userDir)) {
      await mkdir(userDir, { recursive: true });
    }

    // Delete old avatar files
    try {
      const files = await readdir(userDir);
      for (const oldFile of files) {
        await unlink(path.join(userDir, oldFile));
      }
    } catch {
      // Directory might be empty
    }

    // Generate unique filename
    const ext = file.type.split("/")[1] || "jpg";
    const timestamp = Date.now();
    const filename = `avatar-${timestamp}.${ext}`;
    const filePath = path.join(userDir, filename);

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Generate public URL
    const publicUrl = `/storage/avatars/${session.user.id}/${filename}`;

    // Update user in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: publicUrl },
    });

    console.log(`✅ Avatar uploaded: ${session.user.email} -> ${publicUrl}`);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      message: "Profil fotoğrafı güncellendi",
    });
  } catch (error) {
    console.error("❌ [AVATAR API] Upload error:", error);
    return NextResponse.json(
      { error: "Profil fotoğrafı yüklenemedi" },
      { status: 500 }
    );
  }
}

// DELETE - Remove avatar
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
    }

    // Delete avatar files
    const userDir = path.join(STORAGE_BASE_PATH, session.user.id);
    try {
      const files = await readdir(userDir);
      for (const file of files) {
        await unlink(path.join(userDir, file));
      }
    } catch {
      // Directory might not exist
    }

    // Update user in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null },
    });

    console.log(`✅ Avatar deleted: ${session.user.email}`);

    return NextResponse.json({
      success: true,
      message: "Profil fotoğrafı silindi",
    });
  } catch (error) {
    console.error("❌ [AVATAR API] Delete error:", error);
    return NextResponse.json(
      { error: "Profil fotoğrafı silinemedi" },
      { status: 500 }
    );
  }
}
