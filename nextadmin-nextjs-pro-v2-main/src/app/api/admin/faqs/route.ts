import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { prisma } from "@repo/db";

// GET: Tüm FAQ'ları ve kategorileri getir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    // Kategorileri getir
    const categories = await prisma.faqCategory.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { order: "asc" },
    });

    // FAQ'ları getir
    const faqs = await prisma.faq.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        category: true,
      },
      orderBy: [
        { category: { order: "asc" } },
        { order: "asc" },
      ],
    });

    // İstatistikler
    const stats = {
      totalFaqs: await prisma.faq.count(),
      activeFaqs: await prisma.faq.count({ where: { isActive: true } }),
      totalCategories: await prisma.faqCategory.count(),
    };

    return NextResponse.json({
      faqs,
      categories,
      stats,
    });
  } catch (error) {
    console.error("FAQ GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch FAQs" },
      { status: 500 }
    );
  }
}

// POST: Yeni FAQ ekle
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { question, answer, categoryId, order, isActive } = body;

    if (!question || !answer || !categoryId) {
      return NextResponse.json(
        { error: "Question, answer and categoryId are required" },
        { status: 400 }
      );
    }

    // Kategori kontrolü
    const category = await prisma.faqCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Yeni FAQ oluştur
    const faq = await prisma.faq.create({
      data: {
        question,
        answer,
        categoryId,
        order: order ?? 0,
        isActive: isActive ?? true,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(faq, { status: 201 });
  } catch (error) {
    console.error("FAQ POST error:", error);
    return NextResponse.json(
      { error: "Failed to create FAQ" },
      { status: 500 }
    );
  }
}

// PUT: FAQ güncelle
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, question, answer, categoryId, order, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: "FAQ id is required" },
        { status: 400 }
      );
    }

    // FAQ'ın var olup olmadığını kontrol et
    const existingFaq = await prisma.faq.findUnique({
      where: { id },
    });

    if (!existingFaq) {
      return NextResponse.json(
        { error: "FAQ not found" },
        { status: 404 }
      );
    }

    // Güncelle
    const faq = await prisma.faq.update({
      where: { id },
      data: {
        ...(question !== undefined && { question }),
        ...(answer !== undefined && { answer }),
        ...(categoryId !== undefined && { categoryId }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(faq);
  } catch (error) {
    console.error("FAQ PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update FAQ" },
      { status: 500 }
    );
  }
}

// DELETE: FAQ sil
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "FAQ id is required" },
        { status: 400 }
      );
    }

    // FAQ'ın var olup olmadığını kontrol et
    const existingFaq = await prisma.faq.findUnique({
      where: { id },
    });

    if (!existingFaq) {
      return NextResponse.json(
        { error: "FAQ not found" },
        { status: 404 }
      );
    }

    // Sil
    await prisma.faq.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("FAQ DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete FAQ" },
      { status: 500 }
    );
  }
}

