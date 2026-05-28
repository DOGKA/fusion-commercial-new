import { prisma } from "@/lib/prisma";
import FaqPageClient from "@/components/faq/FaqPageClient";

export const revalidate = 60;

type FaqPageProps = {
  searchParams: Promise<{ cat?: string }>;
};

async function getFaqData() {
  try {
    const [categories, faqs] = await Promise.all([
      prisma.faqCategory.findMany({
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
      }),
      prisma.faq.findMany({
        where: {
          isActive: true,
          category: { isActive: true },
        },
        orderBy: [{ category: { order: "asc" } }, { order: "asc" }],
        select: {
          id: true,
          question: true,
          answer: true,
          viewCount: true,
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
      }),
    ]);
    return { categories, faqs };
  } catch (error) {
    console.error("FAQ page fetch error:", error);
    return { categories: [], faqs: [] };
  }
}

export default async function SikcaSorulanSorularPage({ searchParams }: FaqPageProps) {
  const { categories, faqs } = await getFaqData();

  const sp = await searchParams;
  const rawCat = typeof sp.cat === "string" ? sp.cat : null;
  const decodedCat = rawCat ? decodeURIComponent(rawCat) : null;
  const initialCategory =
    decodedCat && categories.some((c) => c.slug === decodedCat) ? decodedCat : null;

  return (
    <FaqPageClient
      categories={categories}
      faqs={faqs}
      initialCategory={initialCategory}
    />
  );
}
