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

// POST - Create a new review (allows guest users too)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Check for session first to determine if guest name is required
    const session = await getServerSession(authOptions);
    const isGuest = !session?.user?.email;

    // Validate required fields
    if (!data.productId || !data.rating || !data.comment) {
      return NextResponse.json(
        { error: "Ürün ID, puan ve yorum zorunludur" },
        { status: 400 }
      );
    }

    // Guest users must provide a name
    if (isGuest && (!data.guestName || data.guestName.trim() === "")) {
      return NextResponse.json(
        { error: "Lütfen adınızı ve soyadınızı giriniz" },
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

    // Check if product exists
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

    let userId: string | null = null;
    let isVerified = false;
    let displayName: string = "Anonim";

    // Name display preference from frontend (for logged-in users)
    const namePreference = data.nameDisplayPreference || "masked";

    if (session?.user?.email) {
      // Logged in user
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, name: true },
      });

      if (user) {
        userId = user.id;
        
        // Set display name based on user preference
        if (namePreference === "full") {
          displayName = user.name || "Kullanıcı";
        } else {
          displayName = maskName(user.name || "Kullanıcı");
        }

        // Check if user has purchased this product (for verification badge)
        const hasPurchased = await prisma.orderItem.findFirst({
          where: {
            productId: data.productId,
            order: {
              userId: user.id,
              status: "DELIVERED",
            },
          },
        });

        isVerified = !!hasPurchased;

        // Check if user already reviewed this product
        const existingReview = await prisma.review.findFirst({
          where: {
            productId: data.productId,
            userId: user.id,
          },
        });

        if (existingReview) {
          // Güncelleme talebi - mevcut yorumu güncelle ve tekrar onaya gönder
          const updatedReview = await prisma.review.update({
            where: { id: existingReview.id },
            data: {
              rating: rating,
              title: data.title || null,
              comment: data.comment,
              images: data.images || existingReview.images || [],
              isApproved: false, // Tekrar onay bekliyor
              adminReply: null, // Admin yanıtı sıfırla
              adminReplyAt: null,
            },
            include: {
              user: { select: { name: true, email: true } },
              product: { select: { name: true } },
            },
          });

          return NextResponse.json({
            success: true,
            message: "Yorum güncelleme talebiniz alındı ve onay bekliyor",
            isUpdate: true,
            displayName,
            isVerified,
            review: updatedReview,
          }, { status: 200 });
        }
      }
    }

    // For guest users, create a unique guest user with masked name
    if (!userId) {
      const guestName = data.guestName.trim();
      const maskedName = maskName(guestName);
      displayName = maskedName;
      
      // Create a unique guest user for this review (using timestamp to make unique)
      const uniqueEmail = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}@fusionmarkt.com`;
      
      const guestUser = await prisma.user.create({
        data: {
          email: uniqueEmail,
          name: maskedName, // Store masked name directly
          emailVerified: null,
        },
      });

      userId = guestUser.id;
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        productId: data.productId,
        userId: userId,
        rating: rating, // 1-5 integer
        title: data.title || null,
        comment: data.comment,
        images: data.images || [],
        isVerified: isVerified,
        isApproved: false, // Requires admin approval
      },
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Yorumunuz başarıyla gönderildi",
      displayName,
      isVerified,
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

