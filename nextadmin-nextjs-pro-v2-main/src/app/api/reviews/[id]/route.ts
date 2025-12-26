import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prismaDb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

// GET - Tek yorum getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        product: { select: { id: true, name: true, thumbnail: true } },
      },
    });

    if (!review) {
      return NextResponse.json({ error: "Yorum bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json({ error: "Yorum yüklenirken hata oluştu" }, { status: 500 });
  }
}

// PUT - Yorum güncelle (onay/red)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const review = await prisma.review.update({
      where: { id },
      data: {
        isApproved: data.isApproved,
        ...(data.title && { title: data.title }),
        ...(data.comment && { comment: data.comment }),
      },
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true } },
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json({ error: "Yorum güncellenirken hata oluştu" }, { status: 500 });
  }
}

// DELETE - Yorum sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.review.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ error: "Yorum silinirken hata oluştu" }, { status: 500 });
  }
}
