import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// İsim maskeleme fonksiyonu: "DOĞUKAN ARIK" -> "D*** A***"
function maskName(fullName: string): string {
  if (!fullName || fullName.trim() === "") return "Anonim";

  const parts = fullName.trim().split(/\s+/);
  return parts.map(part => {
    if (part.length <= 1) return part;
    return part[0].toUpperCase() + "***";
  }).join(" ");
}

// POST - Create a new review
// Sadece üye olan VE ürünü satın almış (teslim edilmiş siparişi olan) kullanıcılar yorum yapabilir
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Üyelik zorunlu
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Yorum yapabilmek için giriş yapmalısınız" },
        { status: 401 }
      );
    }

    // Validate required fields - either productId or bundleId must be provided
    const hasProductId = !!data.productId;
    const hasBundleId = !!data.bundleId;

    if (!hasProductId && !hasBundleId) {
      return NextResponse.json(
        { error: "Ürün ID veya Paket ID zorunludur" },
        { status: 400 }
      );
    }

    if (!data.rating || !data.comment) {
      return NextResponse.json(
        { error: "Puan ve yorum zorunludur" },
        { status: 400 }
      );
    }

    // Validate rating (1-5 integer)
    const rating = parseInt(data.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Geçersiz puan. 1 ile 5 arasında bir değer giriniz." },
        { status: 400 }
      );
    }

    // Check if product or bundle exists
    if (hasProductId) {
      const product = await prisma.product.findUnique({
        where: { id: data.productId },
        select: { id: true, name: true },
      });
      if (!product) {
        return NextResponse.json(
          { error: "Ürün bulunamadı" },
          { status: 404 }
        );
      }
    }

    if (hasBundleId) {
      const bundle = await prisma.bundle.findUnique({
        where: { id: data.bundleId },
        select: { id: true, name: true },
      });
      if (!bundle) {
        return NextResponse.json(
          { error: "Paket bulunamadı" },
          { status: 404 }
        );
      }
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Satın alma kontrolü: kullanıcının bu ürünü/paketi içeren teslim edilmiş bir siparişi olmalı
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        ...(hasProductId ? { productId: data.productId } : { bundleId: data.bundleId }),
        order: {
          userId: user.id,
          status: "DELIVERED",
        },
      },
    });

    if (!hasPurchased) {
      return NextResponse.json(
        { error: "Sadece doğrulanmış alışveriş yapan kullanıcılar yorum yapabilir" },
        { status: 403 }
      );
    }

    // Name display preference from frontend
    const namePreference = data.nameDisplayPreference || "masked";
    const displayName = namePreference === "full"
      ? (user.name || "Kullanıcı")
      : maskName(user.name || "Kullanıcı");

    // Check if user already reviewed this product/bundle
    const existingReviewWhere = hasProductId
      ? { productId: data.productId, userId: user.id }
      : { bundleId: data.bundleId, userId: user.id };

    const existingReview = await prisma.review.findFirst({
      where: existingReviewWhere,
    });

    /**
     * Yazma `upsert` ile yapılıyor: "önce ara, yoksa oluştur" deseni iki
     * eşzamanlı gönderim arasında aynı ürüne iki yorum bırakabiliyordu. Artık
     * hem veritabanında tekillik kısıtı var (`reviews_userId_productId_key`)
     * hem de tek cümlede yazılıyor, yani yarışacak aralık kalmadı.
     *
     * Yukarıdaki okuma yalnızca **yanıt metnini** seçmek için duruyor (yeni
     * yorum mu, güncelleme mi). O aralıkta araya giren eşzamanlı bir istek
     * olursa kayıt yine doğru yazılır, sadece mesaj "gönderildi" der.
     */
    const uniqueWhere = hasProductId
      ? { userId_productId: { userId: user.id, productId: data.productId as string } }
      : { userId_bundleId: { userId: user.id, bundleId: data.bundleId as string } };

    const review = await prisma.review.upsert({
      where: uniqueWhere,
      create: {
        productId: hasProductId ? data.productId : null,
        bundleId: hasBundleId ? data.bundleId : null,
        userId: user.id,
        rating: rating, // 1-5 integer
        title: data.title || null,
        comment: data.comment,
        images: data.images || [],
        displayName: displayName, // Kullanıcının tercih ettiği görünen isim
        isVerified: true, // Satın alma zorunlu olduğu için her yorum doğrulanmış
        isApproved: false, // Requires admin approval
      },
      update: {
        rating: rating,
        title: data.title || null,
        comment: data.comment,
        // Yeni görsel gelmediyse eskiler korunuyor.
        ...(data.images ? { images: data.images } : {}),
        displayName: displayName, // İsim tercihini güncelle
        isVerified: true,
        isApproved: false, // Tekrar onay bekliyor
        adminReply: null, // Admin yanıtı sıfırla
        adminReplyAt: null,
      },
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true } },
        bundle: { select: { name: true } },
      },
    });

    if (existingReview) {
      return NextResponse.json({
        success: true,
        message: "Yorum güncelleme talebiniz alındı ve onay bekliyor",
        isUpdate: true,
        displayName,
        isVerified: true,
        review,
      }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      message: "Yorumunuz başarıyla gönderildi",
      displayName,
      isVerified: true,
      review,
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Yorum gönderilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
