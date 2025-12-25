import { NextResponse } from "next/server";
import { prisma } from "@/libs/prismaDb";

export async function GET() {
  try {
    const blogs = await prisma.blogPost.findMany({
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        category: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ blogs });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Bloglar yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, content, excerpt, category, status } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Başlık, slug ve içerik zorunludur" },
        { status: 400 }
      );
    }

    // Check if slug exists
    const existingBlog = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (existingBlog) {
      return NextResponse.json(
        { error: "Bu slug zaten kullanılıyor" },
        { status: 400 }
      );
    }

    // Status değerini enum'a çevir
    const statusEnum = status === "published" ? "PUBLISHED" : "DRAFT";
    
    const blog = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        category,
        status: statusEnum,
        publishedAt: statusEnum === "PUBLISHED" ? new Date() : null,
      },
    });

    return NextResponse.json({ blog }, { status: 201 });
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json(
      { error: "Blog oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}

