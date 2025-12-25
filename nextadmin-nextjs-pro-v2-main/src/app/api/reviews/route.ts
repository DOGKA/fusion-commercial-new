import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prismaDb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

// GET - Tüm yorumları getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const productId = searchParams.get("productId");

    const where: any = {};

    if (status === "pending") {
      where.isApproved = false;
    } else if (status === "approved") {
      where.isApproved = true;
    }

    if (productId) {
      where.productId = productId;
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            thumbnail: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Yorumlar yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

// POST - Yeni yorum oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    // Kullanıcının bu ürünü satın alıp almadığını kontrol et
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId: data.productId,
        order: {
          userId: user.id,
          status: "DELIVERED",
        },
      },
    });

    if (!hasPurchased) {
      return NextResponse.json(
        { error: "Bu ürüne yorum yapabilmek için önce satın almanız gerekmektedir" },
        { status: 403 }
      );
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        productId: data.productId,
        userId: user.id,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "Bu ürüne zaten yorum yapmışsınız" },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        productId: data.productId,
        userId: user.id,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        images: data.images || [],
        isVerified: true,
        isApproved: false,
      },
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true } },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Yorum oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}
