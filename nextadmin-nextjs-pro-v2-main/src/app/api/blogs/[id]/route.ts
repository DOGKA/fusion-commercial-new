import { NextResponse } from "next/server";
import { prisma } from "@/libs/prismaDb";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const blog = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!blog) {
      return NextResponse.json(
        { error: "Blog bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({ blog });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { error: "Blog yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, slug, content, excerpt, category, status } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Başlık, slug ve içerik zorunludur" },
        { status: 400 }
      );
    }

    // Check if slug exists for another blog
    const existingBlog = await prisma.blogPost.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    });

    if (existingBlog) {
      return NextResponse.json(
        { error: "Bu slug başka bir blog tarafından kullanılıyor" },
        { status: 400 }
      );
    }

    // Status değerini enum'a çevir
    const statusEnum = status === "published" ? "PUBLISHED" : status === "draft" ? "DRAFT" : status;
    
    // Eğer yayınlanıyorsa ve publishedAt yoksa, şimdi ayarla
    const currentBlog = await prisma.blogPost.findUnique({ where: { id } });
    const publishedAt = statusEnum === "PUBLISHED" && !currentBlog?.publishedAt 
      ? new Date() 
      : currentBlog?.publishedAt;
    
    const blog = await prisma.blogPost.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        excerpt,
        category,
        status: statusEnum,
        publishedAt,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ blog });
  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { error: "Blog güncellenirken hata oluştu" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.blogPost.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { error: "Blog silinirken hata oluştu" },
      { status: 500 }
    );
  }
}

