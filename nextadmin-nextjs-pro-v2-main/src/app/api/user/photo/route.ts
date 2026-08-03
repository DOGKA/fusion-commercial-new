import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { prisma } from "@repo/db";
import sharp from "sharp";
import { writeFile, mkdir, readFile, access } from "fs/promises";
import path from "path";
import { UPLOAD_CONFIG, STORAGE_CONFIG, getUserPhotoMaxBytes, isAllowedImageType } from "@/lib/config";

/**
 * POST /api/user/photo
 * Upload user profile photo
 * - Accepts multipart/form-data
 * - Resizes to 512x512 WebP
 * - Saves to ./storage/users/<userId>/avatar.webp
 * - Updates user.avatarPath in DB
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("photo") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No photo provided" }, { status: 400 });
    }

    // Validate file type
    if (!isAllowedImageType(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > getUserPhotoMaxBytes()) {
      return NextResponse.json(
        { error: `File too large. Max: ${UPLOAD_CONFIG.USER_PHOTO_MAX_MB}MB` },
        { status: 400 }
      );
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Process with sharp: resize to 512x512, convert to webp
    const processedBuffer = await sharp(buffer)
      .resize(UPLOAD_CONFIG.AVATAR_SIZE, UPLOAD_CONFIG.AVATAR_SIZE, {
        fit: "cover",
        position: "center",
      })
      .webp({ quality: UPLOAD_CONFIG.AVATAR_QUALITY })
      .toBuffer();

    // Create user directory
    const userDir = path.join(
      process.cwd(),
      STORAGE_CONFIG.BASE_PATH,
      STORAGE_CONFIG.USERS_PATH,
      userId
    );
    await mkdir(userDir, { recursive: true });

    // Save file
    const avatarPath = path.join(userDir, STORAGE_CONFIG.AVATAR_FILENAME);
    await writeFile(avatarPath, processedBuffer);

    // Relative path for DB (from storage root)
    const relativeAvatarPath = `${STORAGE_CONFIG.USERS_PATH}/${userId}/${STORAGE_CONFIG.AVATAR_FILENAME}`;

    // Update user in DB
    await prisma.user.update({
      where: { id: userId },
      data: { avatarPath: relativeAvatarPath },
    });

    console.log(`✅ User photo uploaded: ${userId}`);

    return NextResponse.json({
      success: true,
      avatarPath: relativeAvatarPath,
      url: `/api/user/photo?t=${Date.now()}`, // Cache bust
    });
  } catch (error) {
    console.error("❌ [USER PHOTO] Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/photo
 * Serve user profile photo
 * - Auth check (only own photo)
 * - Cache-Control: private
 * - Fallback to default avatar
 */
export async function GET(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user from DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarPath: true },
    });

    // Check if user has avatar
    if (user?.avatarPath) {
      const avatarFullPath = path.join(
        process.cwd(),
        STORAGE_CONFIG.BASE_PATH,
        user.avatarPath
      );

      try {
        await access(avatarFullPath);
        const fileBuffer = await readFile(avatarFullPath);

        return new NextResponse(new Uint8Array(fileBuffer), {
          headers: {
            "Content-Type": "image/webp",
            "Cache-Control": "private, max-age=3600", // 1 hour, private
            "ETag": `"${userId}-${Date.now()}"`,
          },
        });
      } catch {
        // File doesn't exist, fall through to default
      }
    }

    // Avatar yok. Eskiden `/images/user/default-avatar.png` adresine
    // yönlendiriliyordu ama o dosya `public/` altında hiç bulunmuyor (yalnızca
    // user-01..user-30 var), yani yönlendirmenin sonu her zaman 404'tü. Üstelik
    // hedef `request.url` üzerinden kurulduğu için ters vekilin arkasında
    // yanlış origin'e (localhost:3001) çıkıyordu. Doğrudan 404 dönüyoruz;
    // istemci kendi yer tutucusunu gösterir.
    return NextResponse.json({ error: "Avatar bulunamadı" }, { status: 404 });
  } catch (error) {
    console.error("❌ [USER PHOTO] Get error:", error);
    return NextResponse.json(
      { error: "Failed to get photo" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/photo
 * Delete user profile photo
 */
export async function DELETE(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user from DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarPath: true },
    });

    if (user?.avatarPath) {
      const avatarFullPath = path.join(
        process.cwd(),
        STORAGE_CONFIG.BASE_PATH,
        user.avatarPath
      );

      try {
        const { unlink } = await import("fs/promises");
        await unlink(avatarFullPath);
      } catch {
        // File might not exist, continue anyway
      }
    }

    // Update user in DB
    await prisma.user.update({
      where: { id: userId },
      data: { avatarPath: null },
    });

    console.log(`✅ User photo deleted: ${userId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ [USER PHOTO] Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
