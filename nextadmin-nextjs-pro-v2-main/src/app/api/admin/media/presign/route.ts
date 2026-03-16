import { NextRequest, NextResponse } from "next/server";
import { PresignUploadSchema } from "@/server/validation/media.validation";
import { generateS3Key, getPublicUrl, generatePresignedPutUrl, isS3Configured } from "@/lib/s3";

/**
 * POST /api/admin/media/presign
 * Generate presigned PUT URL for direct S3 upload from browser
 * 
 * Flow:
 * 1. Validate request (filename, mimeType, size, usage)
 * 2. Generate unique S3 key
 * 3. Create presigned PUT URL (5min expiry)
 * 4. Return uploadUrl + key + publicUrl
 */
export async function POST(request: NextRequest) {
  try {
    // Check S3 config
    if (!isS3Configured()) {
      return NextResponse.json(
        { error: "S3 is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();

    // Validate with zod
    const validated = PresignUploadSchema.parse(body);

    // Generate S3 key
    const key = generateS3Key(validated.filename, validated.usage);

    // Generate presigned PUT URL
    const uploadUrl = await generatePresignedPutUrl(key, validated.mimeType);

    // Generate public URL
    const publicUrl = getPublicUrl(key);

    console.log(`✅ Generated presigned URL for: ${key}`);

    return NextResponse.json({
      uploadUrl,
      key,
      publicUrl,
      expiresIn: 300, // 5 minutes
    });
  } catch (error: any) {
    console.error("❌ [PRESIGN] Error:", error);

    // Zod validation error
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate presigned URL" },
      { status: 500 }
    );
  }
}
