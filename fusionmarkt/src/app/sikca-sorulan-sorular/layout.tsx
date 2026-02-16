/**
 * SSS Layout - SEO Metadata + FAQ Schema (Server-Side)
 * FAQ verisi server-side çekilerek Google'ın görebileceği şekilde JSON-LD eklenir
 */

import { staticPageMetadata, generateBreadcrumbSchema, generateFAQSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600; // 1 saat ISR
export const metadata = staticPageMetadata.faq;

async function getFaqsForSchema() {
  try {
    const faqs = await prisma.faq.findMany({
      where: {
        isActive: true,
        category: { isActive: true },
      },
      orderBy: [
        { category: { order: "asc" } },
        { order: "asc" },
      ],
      select: {
        question: true,
        answer: true,
      },
    });
    return faqs;
  } catch (error) {
    console.error("FAQ Schema fetch error:", error);
    return [];
  }
}

export default async function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const faqs = await getFaqsForSchema();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Ana Sayfa", url: "/" },
    { name: "Sıkça Sorulan Sorular", url: "/sikca-sorulan-sorular" },
  ]);

  const schemas: Record<string, unknown>[] = [breadcrumbSchema];

  if (faqs.length > 0) {
    const faqSchema = generateFAQSchema(
      faqs.map((faq) => ({
        question: faq.question,
        answer: faq.answer.replace(/<[^>]+>/g, "").trim(),
      }))
    );
    schemas.push(faqSchema);
  }

  return (
    <>
      <JsonLd data={schemas} />
      {children}
    </>
  );
}

