import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Public endpoint - Aktif FAQ'ları getir (auth gerektirmez)
export async function GET() {
  try {
    // Kategorileri getir
    const categories = await prisma.faqCategory.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        color: true,
      },
    });

    // FAQ'ları getir
    const faqs = await prisma.faq.findMany({
      where: { 
        isActive: true,
        category: { isActive: true }
      },
      orderBy: [
        { category: { order: "asc" } },
        { order: "asc" },
      ],
      select: {
        id: true,
        question: true,
        answer: true,
        category: {
          select: {
            id: true,
            slug: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json({
      categories,
      faqs,
    });
  } catch (error) {
    console.error("Public FAQ GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch FAQs" },
      { status: 500 }
    );
  }
}

